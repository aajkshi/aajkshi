"""No real accounts/keys. Test fixtures use new temporary keys and databases."""
import base64, json, secrets, sqlite3, time
from dataclasses import replace
from pathlib import Path
import pytest
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient
from server import create_app,Settings,provision,totp,match_totp,db

@pytest.fixture
def svc(tmp_path):
    s=Settings('https://testserver',tmp_path/'service.sqlite3',secrets.token_hex(48),Fernet.generate_key().decode())
    app=create_app(s)
    secret=base64.b32encode(secrets.token_bytes(20)).decode().rstrip('=')
    password=secrets.token_urlsafe(30)
    provision(s,'tester',password,secret)
    client=TestClient(app,base_url=s.origin)
    return s,client,password,secret

def bootstrap(c):return c.get('/api/admin/session').json()['csrf']
def post(c,path,data,csrf,origin='https://testserver'):
    return c.post('/api/admin/'+path,json=data,headers={'Origin':origin,'X-CSRF-Token':csrf})
def login(svc):
    s,c,p,key=svc;csrf=bootstrap(c)
    r=post(c,'login',{'username':'tester','password':p,'code':totp(key,int(time.time()//30))},csrf)
    assert r.status_code==200,r.text
    return r.json()['csrf']

def test_public_seed_and_no_secrets(svc):
    s,c,p,k=svc;n=c.get('/api/notice')
    assert n.status_code==200 and n.json()['brands']==['MG','Peugeot','Citroen']
    assert 'no-store' in n.headers['cache-control']
    for x in [p,k,s.secret,s.mfa_key]:assert x not in n.text

def test_login_rotate_cookie_and_csrf(svc):
    s,c,p,k=svc;old=bootstrap(c);oldcookie=c.cookies.get(s.cookie)
    token=login(svc)
    assert token!=old and c.cookies.get(s.cookie)!=oldcookie
    r=c.get('/api/admin/session')
    assert r.json()['authenticated']
    c2=TestClient(c.app,base_url=s.origin);r=c2.get('/api/admin/session')
    cookie=r.headers['set-cookie'];assert all(x in cookie for x in ['__Host-nlx-session','Secure','HttpOnly','SameSite=strict','Path=/'])

def test_auth_csrf_origin_and_json(svc):
    s,c,p,k=svc
    assert c.get('/api/admin/state').status_code==401
    csrf=bootstrap(c)
    assert post(c,'publish',{},'wrong').status_code==403
    assert post(c,'publish',{},csrf,'https://evil.test').status_code==403
    assert c.post('/api/admin/login',data='x',headers={'Origin':s.origin,'X-CSRF-Token':csrf}).status_code==415
    assert post(c,'draft',{},csrf).status_code==401

def test_replay_code_blocked(svc):
    s,c,p,k=svc;csrf=login(svc)
    assert post(c,'logout',{},csrf).status_code==200
    csrf=bootstrap(c)
    assert post(c,'login',{'username':'tester','password':p,'code':totp(k,int(time.time()//30))},csrf).status_code==401

def test_lockout(svc):
    s,c,p,k=svc;csrf=bootstrap(c)
    for i in range(5):assert post(c,'login',{'username':'tester','password':'wrong','code':'000000'},csrf).status_code==401
    r=post(c,'login',{'username':'tester','password':p,'code':totp(k,int(time.time()//30))},csrf)
    assert r.status_code==429 and int(r.headers['retry-after'])>0

def test_draft_publish_conflict_restore(svc):
    s,c,p,k=svc;csrf=login(svc);initial=c.get('/api/admin/state').json();n=initial['draft'];n['title']='公告草稿更新';n['brands']=['MG']
    r=post(c,'draft',{'notice':n,'expectedDraftRevision':1},csrf);assert r.status_code==200
    assert c.get('/api/notice').json()['title']!=n['title']
    assert post(c,'draft',{'notice':n,'expectedDraftRevision':1},csrf).status_code==409
    assert post(c,'publish',{'expectedDraftRevision':1,'expectedRevision':1},csrf).status_code==409
    r=post(c,'publish',{'expectedDraftRevision':2,'expectedRevision':1},csrf);assert r.status_code==200
    assert c.get('/api/notice').json()['brands']==['MG']
    assert post(c,'restore',{'revision':1,'expectedDraftRevision':2},csrf).status_code==200
    assert c.get('/api/notice').json()['brands']==['MG']
    assert c.get('/api/admin/state').json()['draft']['brands']==['MG','Peugeot','Citroen']
    h=c.get('/api/admin/history').json();assert len(h['versions'])==2 and any(a['action']=='published' for a in h['audit'])

def test_hide_notice_only_on_publish(svc):
    s,c,p,k=svc;csrf=login(svc);n=c.get('/api/admin/state').json()['draft'];n['enabled']=False
    r=post(c,'draft',{'notice':n,'expectedDraftRevision':1},csrf);assert r.status_code==200
    assert c.get('/api/notice').json()['enabled']
    assert post(c,'publish',{'expectedDraftRevision':2,'expectedRevision':1},csrf).status_code==200
    assert not c.get('/api/notice').json()['enabled']

@pytest.mark.parametrize('field,value',[('title','<script>alert(1)</script>'),('intro','x'*801),('enabled','true'),('brands',['<img src=x>']),('severity','javascript')])
def test_validation(svc,field,value):
    s,c,p,k=svc;csrf=login(svc);n=c.get('/api/admin/state').json()['draft'];n[field]=value
    assert post(c,'draft',{'notice':n,'expectedDraftRevision':1},csrf).status_code==422

def test_logout_expiry_and_protected_files(svc):
    s,c,p,k=svc;csrf=login(svc)
    with db(s) as d:d.execute('UPDATE sessions SET seen=?',(time.time()-1900,))
    assert c.get('/api/admin/state').status_code==401
    for path in ['/data/notice.sqlite3','/.env','/server.py','/api/admin/users','/docs']:
        assert c.get(path).status_code==404

def test_hardening_headers_hosts_size(svc):
    s,c,p,k=svc;csrf=bootstrap(c);r=c.get('/admin')
    assert "script-src 'self'" in r.headers['content-security-policy'] and "unsafe-inline" not in r.headers['content-security-policy']
    assert r.headers['x-frame-options']=='DENY' and 'max-age' in r.headers['strict-transport-security']
    assert c.get('/',headers={'Host':'evil.test'}).status_code==400
    r=post(c,'login',{'padding':'x'*17000},csrf);assert r.status_code==413

def test_password_change_revokes_and_hashes(svc):
    s,c,p,k=svc;csrf=login(svc);new=secrets.token_urlsafe(30)
    next_code=totp(k,int(time.time()//30)+1)
    r=post(c,'password',{'currentPassword':p,'newPassword':new,'code':next_code},csrf);assert r.status_code==200,r.text
    assert c.get('/api/admin/state').status_code==401
    with db(s) as d:
        user=d.execute('SELECT * FROM users').fetchone()
        assert user['password'].startswith('$argon2id$') and k not in user['mfa'] and new not in user['password']
        assert d.execute('SELECT COUNT(*) FROM sessions WHERE user IS NOT NULL').fetchone()[0]==0

@pytest.mark.parametrize('stamp,want',[(59,'94287082'),(1111111109,'07081804'),(1111111111,'14050471'),(1234567890,'89005924'),(2000000000,'69279037'),(20000000000,'65353130')])
def test_rfc6238_vector(stamp,want):
    key=base64.b32encode(b'12345678901234567890').decode()
    assert totp(key,stamp//30,8)==want


def test_requested_email_login_and_mfa(svc):
    s,c,p,k=svc
    name='navlynx.applepie@gmail.com'
    provision(s,name,p,k)
    csrf=bootstrap(c)
    assert post(c,'login',{'username':name,'password':p,'code':''},csrf).status_code==401
    assert post(c,'login',{'username':name,'password':p,'code':'000000'},csrf).status_code==401
    r=post(c,'login',{'username':'  NAVLYNX.APPLEPIE@gmail.com  ','password':p,'code':totp(k,int(time.time()//30))},csrf)
    assert r.status_code==200,r.text
    assert r.json()['username']==name
    assert post(c,'logout',{},r.json()['csrf']).status_code==200
    csrf=bootstrap(c)
    assert post(c,'login',{'username':name,'password':p,'code':totp(k,int(time.time()//30))},csrf).status_code==401

@pytest.mark.parametrize('value',['@gmail.com','name@','bad space@example.com','a..b@example.com','x@bad..example','x@example.com\nInjected','<script>@example.com'])
def test_invalid_email_identifier(value):
    from server import canonical_username
    with pytest.raises(ValueError):canonical_username(value)
