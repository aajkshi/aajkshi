# NAVLYNX Android 16 公告系統

同事预覽與網頁公司交接。既有 `navlynx-android16-preview/` 保留，不覆蓋。

## 同事預覽

- [前台展示](https://rawcdn.githack.com/aajkshi/aajkshi/android16-preview/navlynx-android16-notice/demo/frontend/index.html)：MG 車款相容性公告；韌體下載不再跳出下載前確認選單。
- [公告後台互動展示](https://rawcdn.githack.com/aajkshi/aajkshi/android16-preview/navlynx-android16-notice/demo/admin/index.html)：免登入，可編輯、儲存草稿、模擬發布與還原。
- 展示資料只保留於目前瀏覽器。從同一個網域、同一個瀏覽器開啟前後台才能共用本機展示資料；不同同事或裝置不會同步。
- 展示頁不收集密碼、驗證碼，也不連接正式寫入 API。請勿輸入機密或個人資料。
- 這兩個是靜態展示網址，不是已部署的正式後台。原始碼已核對上傳；交付環境無法連線驗證 githack 網址，故未宣稱公開預覽已實機驗收。

對應原始碼入口：`demo/frontend/index.html`、`demo/admin/index.html`。網頁公司也可將整個 `demo/` 放入同一網站空間預覽。

## 2026-11-20 韌體資料更新

保留各機型「首次升級」的指定檔案與第二階段（Touch 不需要第二階段）的官網下載入口；依要求已移除額外的「已是 Android 16 · 後續更新」展示區塊。ONE／Melling 以 2026-11-06、Touch 以 2026-11-04、mini Ultra II 以 2026-08-17 的官方最新公告核對，並連結至各機型專屬韌體頁。

2026-11-20 再次透過實際執行官網 JavaScript 的方式，取得升級專區現行 6 題 FAQ，撤回先前自行增補的非官方升級頁 FAQ，並對齊寄回流程與中文密碼說明。核對範圍請見 [FAQ 核對紀錄](FAQ_CHECK_20261120.md)。

詳細檔名、初次升級日期與官網來源請參見 [韌體對照與維護說明](FIRMWARE_REFERENCE_20261120.md)。前台日期屬人工核對資料，**並非自動同步官網**，日後發布新版本仍需更新前台。公告後台的公告編輯功能不會修改韌體對照表。

## 常見問題已直接比對現行官網（2026-11-20）

先前把其他官網 FAQ 的內容自行增補進升級頁，造成與官方 Android 16 頁面題目、順序與答案不一致。這次透過能執行 JavaScript 的瀏覽器，實際讀取 [官網 Android 16 升級頁](https://www.navlynx.com.tw/Android16/index.html) 顯示的 **6 題主要 FAQ**，改回原題目順序與原答覆，不再混入自行補寫的「機型辨識／記憶卡問題」等額外題目。保固卡遺失的答覆已恢復官網所述「主機外觀與設定頁 IMEI」的具體要求。

依照已確認要求，保留「過渡版本 → 指定升級韌體」改名，以及 Touch 可直接升級的機型例外。寄回升級的費用、包裝及工作天數 3 題恢復在「寄送回總公司處理」面板。BMW／更新後無畫面的機型提示留在機型操作區，不額外列作官網 FAQ。

6 題 FAQ 直接寫在 HTML，JavaScript 只處理模型選取時的答案與點擊效果；即使 FAQ JavaScript 無法載入，題目與內容也不會消失。四套前台均同步，詳見 [FAQ 來源比對紀錄](FAQ_CHECK_20261120.md)。

## 正式原始碼

`fullstack/` 是 Python/FastAPI 公告前後台，包含 Docker、部署說明、帳號管理 CLI、測試、前台與管理介面。`frontend-only/website/` 是純前台版本，由網頁公司更新 `assets/notice-config.js`。

指定管理帳號為 `navlynx.applepie@gmail.com`，這是網站帳號，不是 Google OAuth，也不應使用 Gmail 密碼。

**沒有預設密碼；尚未建立正式帳號。** 正式主機部署後，由本人設定 16 至 128 字獨立密碼並綁定驗證器 App。建立指令與手機驗證請看 [ACCOUNT_SETUP.md](fullstack/ACCOUNT_SETUP.md)。

TOTP 驗證器提供六位數動態碼，不是簡訊。未完成驗證器確認，建立帳號程序不會完成。

## 安全邊界

本目錄只含程式及非機密示範內容。不包含 `.env`、資料庫、真實密碼、TOTP 密鑰或工作階段。請勿將這些檔案提交 Git。

GitHub 靜態預覽不是 Python 伺服器。正式 `/admin` 須部署後才能使用；正式主機、HTTPS、依賴掃描與手機綁定尚未完成，不能把展示版當正式後台。

## 本次確認

- 修正建立帳號、登入及 CLI 帳號處理，接受指定 Email。
- 後端 29 項測試通過，測試憑證與資料庫為臨時生成。
- 前次 1366 與 390 像素離線 DOM 測試記錄僅適用當時版本；本次完成原始碼一致性與語法檢查，公開主機視覺驗收仍須另外執行。
- 正式前台原流程、Touch 單次更新、BMW 僅 ONE/Melling、LINE 先申請及最新 FAQ 保留。
- 未執行第三方滲透測試，不保證永不被入侵。
