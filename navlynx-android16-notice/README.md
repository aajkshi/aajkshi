# NAVLYNX Android 16 公告系統

同事预覽與網頁公司交接。既有 `navlynx-android16-preview/` 保留，不覆蓋。

## 2026-11-24 最新調整：Touch 兩階段及影片教學

依使用者提供的 [官網 Touch 畫面](https://www.navlynx.com.tw/Android16/index.html#self-touch)，**Touch 已改成兩階段升級**：第一階段 `APM1288TOUCH.zip`（2026-05-27），第二階段導向官網最新韌體下載總覽。先前文件的「Touch 單階段」規格已被此新版要求取代。仍沿用「指定升級韌體」一詞。

ONE、Touch、mini Ultra II、Melling／Melling-G 四個自行升級頁面均新增 [官方 YouTube 升級教學](https://youtu.be/bxnIG22PdPw?si=-Cn2XySG2o04wmVK)，使用 16:9 響應式嵌入與外部連結備援。正式前台 CSP 允許隱私加強的 `youtube-nocookie.com` 播放 iframe，管理後台不開放。

本次修改細節及應驗收項目請看 [CHANGELOG_20261124.md](CHANGELOG_20261124.md)。

## 2026-11-21 現行官網逐頁／逐功能核對

已使用能實際執行 JavaScript 的瀏覽器檢查目前 [正式 Android 16 升級頁](https://www.navlynx.com.tw/Android16/index.html)，逐一切換四款機型、寄回面板與手機版，並對照官網 HTML、CSS 和 FAQ 行為。已將首頁共用提醒區、飛鼠位置、回官網導覽、機型捲動及寄回文案修正為官網現行樣式；保留 MG-only、指定升級韌體用語，以及不使用下載確認彈窗等差異。

GitHub 同事展示版已通過隔離 Firefox 瀏覽器測試：六題 FAQ、四機型、寄回模式、手機 390px、後台模擬草稿／發布／隱藏公告，未發現 JavaScript 執行錯誤。正式後台主機、憑證與真實車機韌體更新仍未實測。

**完整比對差異與測試紀錄：** [OFFICIAL_AUDIT_20261121.md](OFFICIAL_AUDIT_20261121.md)（應優先參考此份；`FAQ_CHECK_20261120.md` 為此前的核對紀錄。）

## 同事預覽

- [前台展示](https://rawcdn.githack.com/aajkshi/aajkshi/android16-preview/navlynx-android16-notice/demo/frontend/index.html)：MG 車款相容性公告；韌體下載不再跳出下載前確認選單。
- [公告後台互動展示](https://rawcdn.githack.com/aajkshi/aajkshi/android16-preview/navlynx-android16-notice/demo/admin/index.html)：免登入，可編輯、儲存草稿、模擬發布與還原。
- 展示資料只保留於目前瀏覽器。從同一個網域、同一個瀏覽器開啟前後台才能共用本機展示資料；不同同事或裝置不會同步。
- 展示頁不收集密碼、驗證碼，也不連接正式寫入 API。請勿輸入機密或個人資料。
- 這兩個是靜態展示網址，不是已部署的正式後台。原始碼已核對上傳；交付環境無法連線驗證 githack 網址，故未宣稱公開預覽已實機驗收。

對應原始碼入口：`demo/frontend/index.html`、`demo/admin/index.html`。網頁公司也可將整個 `demo/` 放入同一網站空間預覽。

## 2026-11-20 韌體資料更新

保留各機型「首次升級」的指定檔案與四款機型第二階段的官網下載入口；依要求已移除額外的「已是 Android 16 · 後續更新」展示區塊。ONE／Melling 以 2026-11-06、Touch 以 2026-11-04、mini Ultra II 以 2026-08-17 的官方最新公告核對，並連結至相關官網韌體頁（Touch 第二階段連至最新韌體下載總覽）。

2026-11-20 再次透過實際執行官網 JavaScript 的方式，取得升級專區現行 6 題 FAQ，撤回先前自行增補的非官方升級頁 FAQ，並對齊寄回流程與中文密碼說明。核對範圍請見 [FAQ 核對紀錄](FAQ_CHECK_20261120.md)。

詳細檔名、初次升級日期與官網來源請參見 [韌體對照與維護說明](FIRMWARE_REFERENCE_20261120.md)。前台日期屬人工核對資料，**並非自動同步官網**，日後發布新版本仍需更新前台。公告後台的公告編輯功能不會修改韌體對照表。

## 常見問題已直接比對現行官網（2026-11-20）

先前把其他官網 FAQ 的內容自行增補進升級頁，造成與官方 Android 16 頁面題目、順序與答案不一致。這次透過能執行 JavaScript 的瀏覽器，實際讀取 [官網 Android 16 升級頁](https://www.navlynx.com.tw/Android16/index.html) 顯示的 **6 題主要 FAQ**，改回原題目順序與原答覆，不再混入自行補寫的「機型辨識／記憶卡問題」等額外題目。保固卡遺失的答覆已恢復官網所述「主機外觀與設定頁 IMEI」的具體要求。

依照已確認要求，保留「過渡版本 → 指定升級韌體」改名，，並依 2026-11-24 官網 Touch 截圖採兩階段升級。寄回升級的費用、包裝及工作天數 3 題恢復在「寄送回總公司處理」面板。BMW／更新後無畫面的機型提示留在機型操作區，不額外列作官網 FAQ。

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
- 正式前台原流程、Touch 兩階段更新、BMW 僅 ONE/Melling、LINE 先申請及最新 FAQ 保留。
- 未執行第三方滲透測試，不保證永不被入侵。
