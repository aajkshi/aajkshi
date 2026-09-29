# 前台＋公告後台部署說明

這不是 ASP 後台，也不是把密碼放在 JavaScript 的假登入頁。實際後端為 Python / FastAPI，公告、帳號、伺服器端工作階段及操作紀錄儲存在 SQLite。

建議用獨立網域根目錄，例如 `https://upgrade.example.com/`，由既有 ASP 官網連過來。實際網域由 NAVLYNX 與網頁公司決定；範例網址尚未部署。若要改為既有官網子路徑，網頁公司須調整所有 `/api`、`/admin-assets`、代理及 Cookie 路徑並重新驗收，不能直接將本後端丟到 Classic ASP 空間。

## 1. 安裝與初始化

使用 Python 3.13。以下命令在 A_fullstack 資料夾執行。依賴版本為本次測試版本，正式部署前請做弱點掃描及必要更新。

```sh
python3.13 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.lock
python manage.py generate-env --origin https://upgrade.example.com
```

`.env` 會自動產生獨立的隨機 SECRET_KEY、MFA_KEY 及 SITE_ADDRESS，不輸出在瀏覽器、不送到前台。不要使用 `.env.example` 裡的提示文字當正式密鑰，也不要把 `.env` 放進壓縮交付包、Git 或公開目錄。

設定檔只在初始化時使用。資料庫存在後，請透過後台修改公告；編輯 `seed-notice.json` 不會覆蓋現有公告。

## 2. Docker 正式環境

先將 DNS 指向此伺服器，開放 80/443 供 Caddy 核發 TLS 憑證。請檢查 `PUBLIC_ORIGIN` 為完整 HTTPS origin（不能有結尾斜線／子路徑），`SITE_ADDRESS` 為相同主機名稱。

```sh
docker compose build
docker compose run --rm app python manage.py init-db
docker compose run --rm app python manage.py create-admin navlynx.applepie@gmail.com
docker compose up -d
```

建立帳號時，在可信的終端機輸入 16～128 字的獨立密碼，並依終端提示將 TOTP 密鑰加入驗證器 App，再輸入 6 位數碼確認綁定。建立後等待下一組驗證碼才登入，因已用過的驗證碼不可重用。

後台路徑：`/admin`。帳號、密碼、驗證器密鑰均未預先放入交付包。請由網頁公司在上線環境建立帳號，讓 NAVLYNX 管理人本人綁定驗證器，避免共用帳號。建議管理入口再加 VPN／來源 IP 限制或公司既有身分驗證服務。

Caddy 會處理 HTTP 轉 HTTPS；FastAPI 容器未對外開放 8000。啟動參數採 `--no-proxy-headers`，避免盲目信任外部 X-Forwarded-For。此預設下同一反向代理後的來源會共用 IP 限流桶，帳號限流仍獨立有效。若需按真實來源 IP 限流，請僅信任已知固定代理 IP，切勿設 `--forwarded-allow-ips='*'`；同時在邊界代理加入來源 IP 限流。雙人以上大量登入時請評估此配置，不要直接放寬帳號限制。

資料庫在 named volume `notice_data`，請勿執行 `docker compose down -v`，否則會移除公告與帳號資料。建議在上線時為 Python 與 Caddy 映像鎖定經掃描的 digest；目前 Dockerfile 的映像 tag 不是供應鏈安全保證。

## 3. 本機驗收

```sh
python manage.py generate-env --origin http://127.0.0.1:8000 --development
set -a
. ./.env
set +a
python manage.py create-admin navlynx.applepie@gmail.com
python -m uvicorn server:create_app --factory --host 127.0.0.1 --port 8000 --no-proxy-headers
```

`APP_ENV=development` 只接受 loopback origin；不要用它對外架站。正式環境預設強制 HTTPS origin，Cookie 使用 Secure / HttpOnly / SameSite=Strict / __Host- 前綴。

## 4. 公告操作

登入 → 編輯標題、說明、品牌、結尾 → 儲存草稿 → 確認並發布。右側即時顯示編輯預覽。

- 「顯示公告」關閉後仍要按發布，才會從前台移除。
- 「相容性提醒」且有品牌名單時，韌體下載前會要求使用者確認車款。
- 「一般公告」只顯示資訊，不啟用車款確認。
- 某品牌恢復支援：從名單刪除該品牌，調整文案後發布。
- 全數恢復支援：可改成一般公告，或隱藏公告再發布。
- 版本還原只還原到草稿，確認後仍須另行發布。
- 同時開兩個後台視窗時，以版本編號防止後存覆蓋先存，衝突回應 409，請重新載入再編輯。

API 與後台不快取。前台每 60 秒及回到分頁時重新取得公告；每次點韌體下載也會先重新確認。前台服務取不到公告時不自動放行下載導向，而是請聯繫客服。這是網站導向的提醒機制，不是 Google Drive 檔案權限控管；已知原始下載網址仍能直接存取。

後台只管理「一則目前公告」，不管理韌體實體檔案、下載網址、客服帳號或既有 FAQ，以降低誤改及風險。

## 5. 帳號維護及備份

以下命令只能由有伺服器權限的人員執行：

```sh
python manage.py revoke-sessions navlynx.applepie@gmail.com
python manage.py disable-admin leaving-staff
python manage.py reset-password navlynx.applepie@gmail.com
python manage.py reset-mfa navlynx.applepie@gmail.com
python manage.py backup /secure-backups/navlynx-notice-YYYYMMDD.sqlite3
python manage.py prune-audit
```

請在載入環境變數的可信終端執行，Docker 環境改用 `docker compose exec app ...`。`reset-mfa` 是離線復原，不是公開 API；必須先由公司流程核實本人身分。更改密碼、重設 MFA 或撤銷登入後，舊工作階段失效。

請備份 SQLite 與 `.env`，分開保管並另外加密；資料庫含帳號雜湊、已加密的驗證器秘密、工作階段雜湊及操作紀錄。遺失 MFA_KEY 會無法解密驗證器資料，無法靠前台重設。`prune-audit` 保留最近 90 天記錄，需由維運人員安排排程；交付沒有代為開啟自動排程。

## 6. 正式上線檢查

1. 執行測試：`python -m pip install -r requirements-test.txt`、`python -m pytest -q tests`。
2. 依賴／映像弱點掃描、帳號權限、實際 HTTPS、主機更新、防火牆、備份與復原演練。
3. 瀏覽器確認 Cookie 安全屬性；Origin 不符、CSRF 不符及未登入寫入應失敗。
4. 建立正式帳號並綁定驗證器，刪除驗收帳號；交付包沒有任何正式／示範帳號。
5. 確認 API、公告及後台不被 CDN 快取；確認 cache purge、60 秒更新、下載前重新確認。
6. 核對公司車款名單及文字，不能將本套 UI 的確認按鈕當成車款適配保證。
7. 傳統 ASP 網站的 Cookie、CSS 及 JS 不要混入本管理系統。
8. 本包保留 noindex。公開 SEO 策略由業主確認；`/admin`、API 和內部資料不得索引。

已完成程式及本機測試，但未經獨立第三方滲透測試；資安仍依賴正式主機、TLS、維運、金鑰保管與人員操作，不能保證永不被入侵。
