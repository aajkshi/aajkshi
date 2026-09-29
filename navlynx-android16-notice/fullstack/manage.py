#!/usr/bin/env python3
"""Offline administration. Run only from a trusted server terminal."""
import argparse, base64, getpass, json, os, re, secrets, sqlite3
from pathlib import Path
from urllib.parse import quote, urlsplit
from cryptography.fernet import Fernet
from server import Settings, init_db, db, audit, provision, password_ok, match_totp, utc, canonical_username

def bind_mfa(name):
    secret=base64.b32encode(secrets.token_bytes(20)).decode().rstrip('=')
    uri='otpauth://totp/'+quote('NAVLYNX:'+name,safe='')+'?secret='+secret+'&issuer=NAVLYNX&algorithm=SHA1&digits=6&period=30'
    print('\n在驗證器 App 新增帳戶，請使用下列密鑰（只顯示這一次，請勿截圖或轉寄）：\n'+secret)
    print('\n可匯入的 URI（同樣屬於敏感資訊）：\n'+uri)
    for _ in range(3):
        code=getpass.getpass('輸入驗證器的 6 位數碼以確認綁定：').strip()
        step=match_totp(secret,code,-1)
        if step is not None:return secret,step
        print('無法驗證，請確認時間同步後再試。')
    raise SystemExit('未完成驗證器確認，沒有建立或修改帳戶。')

def new_password():
    p=getpass.getpass('新密碼（16 至 128 字）：')
    if not password_ok(p):raise SystemExit('請使用 16 至 128 字，避免重複單一字元的密碼。')
    if p!=getpass.getpass('再次輸入密碼：'):raise SystemExit('兩次密碼不同。')
    return p

def main():
    parser=argparse.ArgumentParser()
    sub=parser.add_subparsers(dest='command',required=True)
    g=sub.add_parser('generate-env');g.add_argument('--origin',required=True);g.add_argument('--development',action='store_true')
    sub.add_parser('init-db')
    c=sub.add_parser('create-admin');c.add_argument('username')
    c=sub.add_parser('revoke-sessions');c.add_argument('username')
    c=sub.add_parser('disable-admin');c.add_argument('username')
    c=sub.add_parser('reset-mfa');c.add_argument('username')
    c=sub.add_parser('reset-password');c.add_argument('username')
    c=sub.add_parser('backup');c.add_argument('destination')
    sub.add_parser('prune-audit')
    args=parser.parse_args()
    if args.command=='generate-env':
        if not re.fullmatch(r'https?://[A-Za-z0-9][A-Za-z0-9.-]*(?::[0-9]{1,5})?/?',args.origin):raise SystemExit('Invalid origin')
        data='APP_ENV='+('development' if args.development else 'production')+'\nPUBLIC_ORIGIN='+args.origin.rstrip('/')+'\nSITE_ADDRESS='+urlsplit(args.origin).netloc+'\nSECRET_KEY='+secrets.token_hex(48)+'\nMFA_KEY='+Fernet.generate_key().decode()+'\n'
        fd=os.open('.env',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        with os.fdopen(fd,'w') as f:f.write(data)
        print('已建立 .env；權限 0600。請妥善備份，不要上傳 Git 或隨交付包傳送。');return
    if hasattr(args, 'username'):
        try: args.username = canonical_username(args.username)
        except ValueError: raise SystemExit('請輸入有效的管理員帳號或 Email。')
    s=Settings.env();init_db(s)
    if args.command=='init-db':print('資料庫已初始化。');return
    if args.command=='create-admin':
        with db(s) as conn:
            if conn.execute('SELECT 1 FROM users WHERE name=?',(args.username,)).fetchone():raise SystemExit('帳號已存在。')
        password=new_password();secret,step=bind_mfa(args.username);provision(s,args.username,password,secret,step)
        print('管理員已建立。請等待驗證器產生下一組碼再登入。');return
    if args.command=='backup':
        dest=Path(args.destination).resolve()
        if dest.is_relative_to(Path(__file__).parent/'web') or dest.is_relative_to(Path(__file__).parent/'admin') or dest.exists():raise SystemExit('目的地必須是非公開且不存在的檔案。')
        dest.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
        fd=os.open(dest,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);os.close(fd)
        with sqlite3.connect(s.db) as a,sqlite3.connect(dest) as b:a.backup(b)
        print('備份已完成。此備份含帳號及稽核資料，請另行加密保存，並分開保管 .env。');return
    if args.command=='prune-audit':
        from datetime import datetime,timedelta,timezone
        cutoff=(datetime.now(timezone.utc)-timedelta(days=90)).isoformat(timespec='seconds').replace('+00:00','Z')
        with db(s) as c:c.execute('DELETE FROM audit WHERE at<?',(cutoff,));audit(c,'CLI','audit-pruned','90-day retention')
        print('已清理超過 90 天的操作紀錄。');return
    name=args.username
    with db(s) as c:
        if not c.execute('SELECT 1 FROM users WHERE name=?',(name,)).fetchone():raise SystemExit('帳號不存在。')
    if args.command=='reset-mfa':
        print('僅限已經由組織流程驗證本人身分後執行。')
        secret,step=bind_mfa(name)
        with db(s) as c:
            c.execute('UPDATE users SET mfa=?,last_step=? WHERE name=?',(Fernet(s.mfa_key.encode()).encrypt(secret.encode()).decode(),step,name))
            c.execute('DELETE FROM sessions WHERE user=?',(name,));audit(c,name,'mfa-reset','Offline CLI')
    elif args.command=='reset-password':
        from server import PH
        p=new_password()
        with db(s) as c:
            c.execute('UPDATE users SET password=? WHERE name=?',(PH.hash(p),name));c.execute('DELETE FROM sessions WHERE user=?',(name,));audit(c,name,'password-changed','Offline CLI')
    else:
        with db(s) as c:
            c.execute('DELETE FROM sessions WHERE user=?',(name,))
            if args.command=='disable-admin':c.execute('UPDATE users SET enabled=0 WHERE name=?',(name,))
            audit(c,name,'account-disabled' if args.command=='disable-admin' else 'sessions-revoked','Offline CLI')
    print('操作完成。既有登入已全部失效。')
if __name__=='__main__': main()
