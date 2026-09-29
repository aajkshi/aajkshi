"""NAVLYNX announcement service. Run behind HTTPS; see DEPLOYMENT.md.
No public registration, HTML editor, file uploads, or firmware URL editing.
"""
from __future__ import annotations
import base64, hashlib, hmac, json, logging, os, re, secrets, sqlite3, struct, time
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from starlette.staticfiles import StaticFiles
from argon2 import PasswordHasher, Type
from argon2.exceptions import VerificationError, InvalidHashError
from cryptography.fernet import Fernet

ROOT = Path(__file__).resolve().parent
PH = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=1, type=Type.ID)
DUMMY_HASH = PH.hash(secrets.token_urlsafe(32))
log = logging.getLogger('navlynx.security')

def utc() -> str:
    return datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')

def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()

def totp(secret: str, step: int, digits: int = 6) -> str:
    """RFC 6238 / RFC 4226 HMAC-SHA1. Tested against the RFC test vectors."""
    key=base64.b32decode(secret.upper()+'='*((-len(secret))%8))
    raw=hmac.new(key,struct.pack('>Q',step),hashlib.sha1).digest()
    offset=raw[-1]&15
    num=struct.unpack('>I',raw[offset:offset+4])[0]&0x7fffffff
    return str(num%(10**digits)).zfill(digits)

def match_totp(secret: str, code: str, last_step: int, now: float|None=None) -> int|None:
    if not re.fullmatch(r'[0-9]{6}',code): return None
    current=int((time.time() if now is None else now)//30)
    match=None
    for step in (current-1,current,current+1):
        if step>=0 and hmac.compare_digest(totp(secret,step),code) and step>last_step:
            match=step
    return match

@dataclass(frozen=True)
class Settings:
    origin: str
    db: Path
    secret: str
    mfa_key: str
    secure: bool = True
    @classmethod
    def env(cls) -> 'Settings':
        s=cls(os.environ.get('PUBLIC_ORIGIN',''),Path(os.environ.get('DATABASE_PATH',str(ROOT/'data/notice.sqlite3'))).resolve(),os.environ.get('SECRET_KEY',''),os.environ.get('MFA_KEY',''),os.environ.get('APP_ENV','production')!='development')
        u=urlsplit(s.origin)
        if not u.netloc or u.path or u.query or u.fragment or u.username or u.scheme not in ('http','https'):
            raise RuntimeError('PUBLIC_ORIGIN must be an exact origin, for example https://upgrade.example.com')
        if s.secure and u.scheme!='https': raise RuntimeError('Production requires an HTTPS PUBLIC_ORIGIN')
        if not s.secure and u.hostname not in ('localhost','127.0.0.1','::1'):
            raise RuntimeError('Development mode is allowed only on loopback')
        if len(s.secret)<48: raise RuntimeError('Generate SECRET_KEY before starting')
        Fernet(s.mfa_key.encode())  # fail closed on missing/invalid key
        if s.db.is_relative_to(ROOT/'web') or s.db.is_relative_to(ROOT/'admin'):
            raise RuntimeError('Database must not be stored in a served directory')
        return s
    @property
    def cookie(self) -> str:
        return '__Host-nlx-session' if self.secure else 'nlx-session-dev'

SCHEMA='''
CREATE TABLE IF NOT EXISTS users (
 name TEXT PRIMARY KEY, password TEXT NOT NULL, mfa TEXT NOT NULL,
 last_step INTEGER NOT NULL DEFAULT -1, enabled INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS sessions (
 hash TEXT PRIMARY KEY, user TEXT, csrf TEXT NOT NULL,
 created REAL NOT NULL, seen REAL NOT NULL, expires REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS attempts (bucket TEXT NOT NULL, at REAL NOT NULL);
CREATE INDEX IF NOT EXISTS attempts_bucket ON attempts(bucket,at);
CREATE TABLE IF NOT EXISTS state (
 id INTEGER PRIMARY KEY CHECK(id=1), published TEXT NOT NULL, revision INTEGER NOT NULL,
 draft TEXT NOT NULL, draft_revision INTEGER NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS versions (
 revision INTEGER PRIMARY KEY, body TEXT NOT NULL, at TEXT NOT NULL, actor TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit (
 id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, actor TEXT NOT NULL,
 action TEXT NOT NULL, detail TEXT NOT NULL, ip_hash TEXT NOT NULL
);
'''

@contextmanager
def db(s: Settings):
    connection=sqlite3.connect(s.db,timeout=8)
    connection.row_factory=sqlite3.Row
    connection.execute('PRAGMA foreign_keys=ON')
    try:
        with connection: yield connection
    finally: connection.close()

def init_db(s: Settings):
    s.db.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
    with db(s) as c:
        c.execute('PRAGMA journal_mode=WAL')
        c.executescript(SCHEMA)
        c.execute('BEGIN IMMEDIATE')
        if not c.execute('SELECT 1 FROM state WHERE id=1').fetchone():
            seed=validate_notice(json.loads((ROOT/'seed-notice.json').read_text()))
            stamp=utc();body=json.dumps(seed,ensure_ascii=False)
            c.execute('INSERT INTO state VALUES (1,?,1,?,1,?)',(body,body,stamp))
            c.execute('INSERT INTO versions VALUES (1,?,?,?)',(body,stamp,'system-initialization'))
    os.chmod(s.db,0o600)

def audit(c,actor,action,detail='',ip_hash=''):
    c.execute('INSERT INTO audit(at,actor,action,detail,ip_hash) VALUES(?,?,?,?,?)',(utc(),actor,action,detail,ip_hash))
    log.info('action=%s actor=%s detail=%s',action,actor,detail)

def validate_notice(value: Any) -> dict:
    keys={'enabled','severity','title','intro','brands','closing'}
    if not isinstance(value,dict) or set(value)!=keys: raise HTTPException(422,'公告欄位不完整或含不支援的欄位。')
    if type(value['enabled']) is not bool or value['severity'] not in ('warning','info'): raise HTTPException(422,'公告狀態不正確。')
    result={'enabled':value['enabled'],'severity':value['severity']}
    for key,limit in [('title',90),('intro',800),('closing',600)]:
        t=value[key]
        if not isinstance(t,str) or not t.strip() or len(t)>limit or re.search(r'[<>\x00-\x08\x0b\x0c\x0e-\x1f\x7f]',t):
            raise HTTPException(422,f'{key} 請輸入純文字，長度上限 {limit} 字；不可使用 HTML。')
        result[key]=t.strip()
    brands=value['brands']
    if not isinstance(brands,list) or len(brands)>30: raise HTTPException(422,'品牌最多 30 個。')
    result['brands']=[]
    for brand in brands:
        if not isinstance(brand,str) or not brand.strip() or len(brand)>60 or re.search(r'[<>\x00-\x1f\x7f]',brand): raise HTTPException(422,'品牌名稱格式不正確。')
        if brand.strip().casefold() not in [x.casefold() for x in result['brands']]: result['brands'].append(brand.strip())
    return result

def integer(v):
    if type(v) is not int or v<1: raise HTTPException(422,'版本編號無效。')
    return v

def password_ok(value):
    return isinstance(value,str) and 16<=len(value)<=128 and len(set(value))>=6

def canonical_username(value: str) -> str:
    """Local account identifier, not Google sign-in or email ownership verification."""
    if not isinstance(value, str):
        raise ValueError('Invalid account name')
    name = value.strip()
    if re.fullmatch(r'[A-Za-z0-9_.-]{3,64}', name):
        return name
    if (len(name) <= 254 and len(name.split('@')[0]) <= 64
            and re.fullmatch(r'[A-Za-z0-9_+.-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+', name)
            and '..' not in name and not name.startswith('.') and '.@' not in name):
        return name.lower()
    raise ValueError('Invalid account name')

def provision(s: Settings,name:str,password:str,secret:str,last_step:int=-1):
    name = canonical_username(name)
    if not password_ok(password): raise ValueError('Invalid account name or password')
    enc=Fernet(s.mfa_key.encode()).encrypt(secret.encode()).decode()
    with db(s) as c:
        c.execute('INSERT INTO users(name,password,mfa,last_step) VALUES(?,?,?,?)',(name,PH.hash(password),enc,last_step))
        audit(c,name,'account-created','CLI provisioning')

class BodyLimit:
    """Bound streamed bodies, independent of a caller supplied Content-Length."""
    def __init__(self,app,limit=16384): self.app,self.limit=app,limit
    async def __call__(self,scope,receive,send):
        if scope['type']!='http' or scope['method'] not in ('POST','PUT','PATCH','DELETE'):
            return await self.app(scope,receive,send)
        chunks=[];total=0
        while True:
            message=await receive()
            if message['type']=='http.disconnect': return
            total+=len(message.get('body',b''))
            if total>self.limit:
                response=JSONResponse({'detail':'Request too large'},413,headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'})
                return await response(scope,receive,send)
            chunks.append(message.get('body',b''))
            if not message.get('more_body',False): break
        replayed=False
        async def replay():
            nonlocal replayed
            if not replayed:
                replayed=True;return {'type':'http.request','body':b''.join(chunks),'more_body':False}
            return await receive()
        await self.app(scope,replay,send)

def create_app(settings: Settings|None=None) -> FastAPI:
    s=settings or Settings.env();init_db(s)
    cipher=Fernet(s.mfa_key.encode())
    app=FastAPI(docs_url=None,redoc_url=None,openapi_url=None)
    app.state.settings=s

    def ip_hash(request):
        ip=request.client.host if request.client else 'unknown'
        return hmac.new(s.secret.encode(),ip.encode(),hashlib.sha256).hexdigest()

    def session_for(request):
        token=request.cookies.get(s.cookie,'')
        if len(token)!=43: return None
        now=time.time()
        with db(s) as c:
            row=c.execute('SELECT * FROM sessions WHERE hash=?',(digest(token),)).fetchone()
            if not row:return None
            idle=1800 if row['user'] else 600
            if row['expires']<now or row['seen']+idle<now:
                c.execute('DELETE FROM sessions WHERE hash=?',(row['hash'],));return None
            if row['user']:
                user=c.execute('SELECT enabled FROM users WHERE name=?',(row['user'],)).fetchone()
                if not user or not user['enabled']: return None
            c.execute('UPDATE sessions SET seen=? WHERE hash=?',(now,row['hash']))
            return dict(row)

    def require(request):
        row=session_for(request)
        if not row or not row['user']:raise HTTPException(401,'登入已失效，請重新登入。')
        return row

    def set_session(response,user=None,old=None):
        token=secrets.token_urlsafe(32);csrf=secrets.token_urlsafe(32);now=time.time()
        with db(s) as c:
            if old:c.execute('DELETE FROM sessions WHERE hash=?',(old,))
            c.execute('DELETE FROM sessions WHERE expires<? OR seen<?',(now,now-86400))
            c.execute('INSERT INTO sessions VALUES(?,?,?,?,?,?)',(digest(token),user,csrf,now,now,now+(28800 if user else 600)))
        response.set_cookie(s.cookie,token,max_age=28800 if user else 600,secure=s.secure,httponly=True,samesite='strict',path='/')
        return csrf

    def rate_attempt(request,name,kind='login'):
        now=time.time();ih=ip_hash(request)
        buckets=[(kind+':ip:'+ih,15),(kind+':account:'+digest(name.casefold()),5)]
        with db(s) as c:
            c.execute('BEGIN IMMEDIATE')
            c.execute('DELETE FROM attempts WHERE at<?',(now-900,))
            for bucket,limit in buckets:
                row=c.execute('SELECT COUNT(*) AS n, MIN(at) AS oldest FROM attempts WHERE bucket=? AND at>?',(bucket,now-900)).fetchone()
                if row['n']>=limit:
                    raise HTTPException(429,'嘗試次數較多，請稍後再試。',headers={'Retry-After':str(max(1,int(900-(now-row['oldest']))))})
            for bucket,limit in buckets:c.execute('INSERT INTO attempts VALUES(?,?)',(bucket,now))
        return buckets

    def clear_account_attempts(c,name,kind='login'):
        c.execute('DELETE FROM attempts WHERE bucket=?',(kind+':account:'+digest(name.casefold()),))

    @app.middleware('http')
    async def security(request:Request,call_next):
        response=None
        expected_host=urlsplit(s.origin).netloc
        if request.headers.get('host','').casefold()!=expected_host.casefold():
            response=JSONResponse({'detail':'Host not allowed'},400)
        if response is None and request.method in ('POST','PUT','PATCH','DELETE'):
            if request.headers.get('origin')!=s.origin:
                response=JSONResponse({'detail':'來源驗證失敗，請重新整理後再試。'},403)
            elif request.headers.get('content-type','').split(';')[0].strip()!='application/json':
                response=JSONResponse({'detail':'JSON required'},415)
            else:
                sess=session_for(request)
                token=request.headers.get('x-csrf-token','')
                if not sess or not token or not hmac.compare_digest(sess['csrf'],token):
                    response=JSONResponse({'detail':'操作驗證失敗，請重新登入。'},403)
        if response is None:
            try: response=await call_next(request)
            except Exception:
                log.exception('Unhandled server error')
                response=JSONResponse({'detail':'服務暫時無法完成操作，請稍後再試。'},500)
        is_admin=request.url.path.startswith(('/admin','/api/admin'))
        response.headers['X-Content-Type-Options']='nosniff'
        response.headers['X-Frame-Options']='DENY'
        response.headers['Referrer-Policy']='same-origin'
        response.headers['Permissions-Policy']='camera=(), microphone=(), geolocation=()'
        response.headers['X-Robots-Tag']='noindex, nofollow'
        if s.secure:response.headers['Strict-Transport-Security']='max-age=31536000'
        response.headers['Cache-Control']='no-store' if is_admin or request.url.path in ('/','/index.html','/api/notice') else 'public, max-age=300'
        response.headers['Content-Security-Policy']=("default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self'"+("; img-src 'self' data:;" if is_admin else " 'unsafe-inline'; img-src 'self' data: https://www.navlynx.com.tw;")+" connect-src 'self'; font-src 'self';")
        return response

    @app.get('/')
    @app.get('/index.html')
    def homepage():return FileResponse(ROOT/'web/index.html',media_type='text/html')

    @app.get('/admin')
    def admin():return FileResponse(ROOT/'admin/index.html',media_type='text/html')

    @app.get('/api/notice')
    def public_notice():
        with db(s) as c: row=c.execute('SELECT published,revision,updated_at FROM state WHERE id=1').fetchone()
        return {**json.loads(row['published']),'revision':row['revision'],'publishedAt':row['updated_at']}

    @app.get('/api/admin/session')
    def auth_session(request:Request):
        sess=session_for(request)
        if sess:return {'authenticated':bool(sess['user']),'username':sess['user'],'csrf':sess['csrf']}
        # Bound anonymous session creation; valid sessions do not consume this quota.
        with db(s) as c:
            c.execute('BEGIN IMMEDIATE')
            bucket='bootstrap:'+ip_hash(request); now=time.time()
            c.execute('DELETE FROM attempts WHERE at<?',(now-900,))
            if c.execute('SELECT COUNT(*) FROM attempts WHERE bucket=?',(bucket,)).fetchone()[0]>=30:
                raise HTTPException(429,'請稍後再試。',headers={'Retry-After':'900'})
            c.execute('INSERT INTO attempts VALUES(?,?)',(bucket,now))
        response=JSONResponse({})
        token=set_session(response)
        response.body=json.dumps({'authenticated':False,'csrf':token}).encode()
        response.headers['content-length']=str(len(response.body))
        return response

    @app.post('/api/admin/login')
    def login(request:Request,body:dict):
        sess=session_for(request)
        name=body.get('username','');password=body.get('password','');code=body.get('code','')
        try: name = canonical_username(name)
        except ValueError: raise HTTPException(401,'帳號、密碼或驗證碼不正確。')
        if not isinstance(password,str) or len(password)>128 or not isinstance(code,str): raise HTTPException(401,'帳號、密碼或驗證碼不正確。')
        rate_attempt(request,name)
        with db(s) as c: user=c.execute('SELECT * FROM users WHERE name=?',(name,)).fetchone()
        correct=False
        try: correct=PH.verify(user['password'] if user else DUMMY_HASH,password)
        except (VerificationError,InvalidHashError): pass
        step=None
        if user and user['enabled'] and correct:
            step=match_totp(cipher.decrypt(user['mfa'].encode()).decode(),code,user['last_step'])
        if step is None:
            with db(s) as c:audit(c,'unknown' if not user else name,'login-failed','',ip_hash(request))
            raise HTTPException(401,'帳號、密碼或驗證碼不正確。')
        with db(s) as c:
            count=c.execute('UPDATE users SET last_step=? WHERE name=? AND last_step<?',(step,name,step)).rowcount
            if count!=1:raise HTTPException(401,'驗證碼已使用，請等待下一組驗證碼。')
            clear_account_attempts(c,name);audit(c,name,'login-success','',ip_hash(request))
        response=JSONResponse({})
        csrf=set_session(response,name,sess['hash'])
        response.body=json.dumps({'authenticated':True,'username':name,'csrf':csrf}).encode();response.headers['content-length']=str(len(response.body))
        return response

    @app.post('/api/admin/logout')
    def logout(request:Request):
        row=require(request)
        with db(s) as c:
            c.execute('DELETE FROM sessions WHERE hash=?',(row['hash'],));audit(c,row['user'],'logout')
        response=JSONResponse({'ok':True});response.delete_cookie(s.cookie,path='/',secure=s.secure,httponly=True,samesite='strict');return response

    def get_state(c):
        row=c.execute('SELECT * FROM state WHERE id=1').fetchone()
        return {'published':json.loads(row['published']),'revision':row['revision'],'draft':json.loads(row['draft']),'draftRevision':row['draft_revision'],'publishedAt':row['updated_at']}

    @app.get('/api/admin/state')
    def state(request:Request):
        require(request)
        with db(s) as c:return get_state(c)

    @app.post('/api/admin/draft')
    def save_draft(request:Request,body:dict):
        sess=require(request);notice=validate_notice(body.get('notice'));expected=integer(body.get('expectedDraftRevision'))
        with db(s) as c:
            c.execute('BEGIN IMMEDIATE')
            changed=c.execute('UPDATE state SET draft=?,draft_revision=draft_revision+1 WHERE id=1 AND draft_revision=?',(json.dumps(notice,ensure_ascii=False),expected)).rowcount
            if not changed:raise HTTPException(409,'其他工作階段已修改公告，請重新載入再編輯。')
            audit(c,sess['user'],'draft-saved',str(expected+1),ip_hash(request));return get_state(c)

    @app.post('/api/admin/publish')
    def publish(request:Request,body:dict):
        sess=require(request);expected=integer(body.get('expectedDraftRevision'));published=integer(body.get('expectedRevision'))
        with db(s) as c:
            c.execute('BEGIN IMMEDIATE');row=c.execute('SELECT * FROM state WHERE id=1').fetchone()
            if row['draft_revision']!=expected or row['revision']!=published:raise HTTPException(409,'版本已更新，請重新載入確認後發布。')
            validate_notice(json.loads(row['draft']))
            stamp=utc();new=published+1
            c.execute('UPDATE state SET published=draft,revision=?,updated_at=? WHERE id=1',(new,stamp))
            c.execute('INSERT INTO versions VALUES(?,?,?,?)',(new,row['draft'],stamp,sess['user']))
            audit(c,sess['user'],'published',str(new),ip_hash(request));return get_state(c)

    @app.get('/api/admin/history')
    def history(request:Request):
        require(request)
        with db(s) as c:
            return {'versions':[{'revision':r['revision'],'at':r['at'],'actor':r['actor'],'notice':json.loads(r['body'])} for r in c.execute('SELECT * FROM versions ORDER BY revision DESC LIMIT 50')],'audit':[dict(r) for r in c.execute('SELECT at,actor,action,detail FROM audit ORDER BY id DESC LIMIT 100')]}

    @app.post('/api/admin/restore')
    def restore(request:Request,body:dict):
        sess=require(request);version=integer(body.get('revision'));expected=integer(body.get('expectedDraftRevision'))
        with db(s) as c:
            c.execute('BEGIN IMMEDIATE');row=c.execute('SELECT body FROM versions WHERE revision=?',(version,)).fetchone()
            if not row:raise HTTPException(404,'找不到版本。')
            validate_notice(json.loads(row['body']))
            changed=c.execute('UPDATE state SET draft=?,draft_revision=draft_revision+1 WHERE id=1 AND draft_revision=?',(row['body'],expected)).rowcount
            if not changed:raise HTTPException(409,'草稿已變更，請重新載入。')
            audit(c,sess['user'],'restored-to-draft',str(version),ip_hash(request));return get_state(c)

    @app.post('/api/admin/password')
    def change_password(request:Request,body:dict):
        sess=require(request);name=sess['user'];old=body.get('currentPassword');new=body.get('newPassword');code=body.get('code')
        if not isinstance(old,str) or len(old)>128 or not password_ok(new) or not isinstance(code,str) or old==new:raise HTTPException(422,'新密碼請用 16 至 128 字，且不可與舊密碼相同。')
        rate_attempt(request,name,'password')
        with db(s) as c: user=c.execute('SELECT * FROM users WHERE name=?',(name,)).fetchone()
        try: correct=PH.verify(user['password'],old)
        except (VerificationError,InvalidHashError):correct=False
        step=match_totp(cipher.decrypt(user['mfa'].encode()).decode(),code,user['last_step']) if correct else None
        if step is None:raise HTTPException(401,'舊密碼或新的一次性驗證碼不正確。')
        newhash=PH.hash(new)
        with db(s) as c:
            if c.execute('UPDATE users SET password=?,last_step=? WHERE name=? AND last_step<?',(newhash,step,name,step)).rowcount!=1:raise HTTPException(401,'請使用未使用過的驗證碼。')
            c.execute('DELETE FROM sessions WHERE user=?',(name,));clear_account_attempts(c,name,'password');audit(c,name,'password-changed','sessions-revoked',ip_hash(request))
        response=JSONResponse({'ok':True});response.delete_cookie(s.cookie,path='/',secure=s.secure,httponly=True,samesite='strict');return response

    app.mount('/assets',StaticFiles(directory=ROOT/'web/assets'),name='assets')
    app.mount('/admin-assets',StaticFiles(directory=ROOT/'admin/assets'),name='admin-assets')
    app.add_middleware(BodyLimit)
    return app
