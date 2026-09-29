# 正式帳號與手機驗證

指定帳號：`navlynx.applepie@gmail.com`。這是網站管理帳號，不是 Google OAuth 登入。請使用不同於 Gmail 的獨立密碼。

**本交付包沒有正式密碼、TOTP 密鑰、`.env` 或資料庫；尚未替任何正式主機建立帳號。**

完成 `DEPLOYMENT.md` 的環境初始化後，由帳號本人於受信任終端執行：

```sh
docker compose run --rm app python manage.py create-admin navlynx.applepie@gmail.com
```

依提示設定 16 至 128 字的密碼，再在手機驗證器 App 手動輸入終端產生的 TOTP 密鑰，輸入六位數碼確認綁定。此流程不是網頁 QR Code 自助註冊；未確認驗證碼，帳號不會建立。請勿在螢幕錄影、共享日誌或公開聊天記錄中操作。

正式登入路徑 `/admin`，每次登入需帳號、密碼與目前六位數驗證碼。TOTP 約每 30 秒更新一次，不使用簡訊，也沒有串接手機門號。帳號初始化使用過的驗證碼不可再用，請等下一組碼登入。

忘記密碼：由有主機權限且完成本人身分核實的管理員執行 `python manage.py reset-password navlynx.applepie@gmail.com`。手機遺失則執行 `python manage.py reset-mfa navlynx.applepie@gmail.com` 並重新綁定。沒有通用後門密碼或公開免驗證復原入口。

同事展示版位於 `demo/`，免登入、不收集密碼與 TOTP，所有修改僅儲存在使用者自己的瀏覽器，不影響正式資料。
