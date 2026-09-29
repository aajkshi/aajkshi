# NAVLYNX Android 16 公告系統

同事預覽與網頁公司交接。既有 `navlynx-android16-preview/` 保留，不覆蓋。

## 同事預覽

- 前台：`demo/frontend/index.html`。包含 MG、Peugeot、Citroen 車款公告及下載前確認。
- 後台互動展示：`demo/admin/index.html`。免登入，可編輯、儲存草稿、模擬發布與還原。
- 展示資料只保留於各自瀏覽器。從同一個版本網址開啟前台和後台，才會讀到同一份本機資料。換電腦、換版本網址、或其他同事不會同步。
- 展示頁不收集密碼、驗證碼，也不連接任何正式寫入 API。請勿輸入機密或個人資料。

## 正式原始碼

`fullstack/` 是 Python/FastAPI 公告前後台，包含 Docker、部署說明、帳號管理 CLI、測試、前台與管理介面。`frontend-only/website/` 是純前台版本，由網頁公司更新 `assets/notice-config.js`。

指定管理帳號為 `navlynx.applepie@gmail.com`，這是網站帳號，不是 Google OAuth，也不應使用 Gmail 密碼。

**沒有預設密碼；未在 GitHub 展示页建立正式帳號。** 正式主機部署後，由本人設定 16 至 128 字獨立密碼並綁定驗證器 App。建立指令與手機驗證請看 `fullstack/ACCOUNT_SETUP.md`。

TOTP 驗證器每次提供六位數碼，不是簡訊。未完成驗證器確認，建立帳號程序不會完成。

## 安全邊界

此 repository 只含程式及非機密示範內容。不包含 `.env`、資料庫、真實密碼、TOTP 密鑰或工作階段。請勿將這些檔案提交 Git。

GitHub 靜態預覽不是 Python 伺服器。正式 `/admin` 須部署後才能使用；正式主機、HTTPS、依賴掃描與手機綁定尚未完成，不能把展示版當正式後台。

## 本次確認

- 修正建立帳號、登入及 CLI 帳號處理，接受指定 Email。
- 後端 29 項測試通過，測試憑證與資料庫為臨時生成。
- 1366 與 390 像素離線 DOM 測試通過（模擬 Storage）；尚不等同公開主機或跨裝置驗證。
- 正式前台原流程、Touch 單次更新、BMW 僅 ONE/Melling、LINE 先申請及最新 FAQ 保留。
- 未執行第三方滲透測試，不保證永不被入侵。
