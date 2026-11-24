# 2026-11-24 升級頁修正：Touch 兩階段與 YouTube 影片教學

## 本次修改依據

2026-11-24 使用者提供 NAVLYNX 官網 `https://www.navlynx.com.tw/Android16/index.html#self-touch` 的 Touch 畫面截圖。此畫面明確顯示 ApplePie Touch 的**第一階段指定韌體與第二階段最新韌體**，與先前 GitHub 預覽版設定的「Touch 一次升級完成」不同。

本次以最新截圖和要求取代舊規格。保留已核准的「指定升級韌體」命名，不恢復早期的「過渡版本」用語。

## ApplePie Touch

- 機型：ApplePie Touch
- 第一階段檔案：`APM1288TOUCH.zip`
- 指定韌體日期：`2026-05-27`
- 第一階段下載：原本 Touch 專屬 Google Drive 資料夾不變
- 第二階段：恢復「更新 Android 16 最新韌體」卡片，並顯示「前往最新韌體下載」按鈕，依使用者提供的官網 Touch 畫面連到 `https://www.navlynx.com.tw/download.asp`
- 第二階段不再顯示 GitHub 版先前額外加入的「官方公告日期／檔名」文字列，讓 Touch 畫面接近當前官方截圖
- 「查看完整升級步驟」恢復兩階段說明；常見問題中的 Touch 升級方式同步改為兩階段
- ONE、mini Ultra II、Melling／Melling-G 原本兩階段升級方式保持不變，第二階段仍連到各自機型韌體頁

## 四款自行升級機型的影片

於共同機型升級說明 `#model-guide` 內新增一個影片區塊，選擇 ONE、Touch、mini Ultra II、Melling／Melling-G 任一機型後都會顯示：

- 完整影片：https://youtu.be/bxnIG22PdPw?si=-Cn2XySG2o04wmVK
- 隱私加強嵌入：`https://www.youtube-nocookie.com/embed/bxnIG22PdPw`
- 16:9 自適應 iframe、延遲載入、明確影片標題、YouTube 外部觀看備援連結
- 提醒使用者應依所選機型下載對應韌體，不能因共用影片而混用檔案
- 不會在未選擇機型、寄回升級頁或公告後台顯示這部影片

**正式後台版的 CSP**：公開網站開放 `frame-src https://www.youtube-nocookie.com`；管理後台仍為 `frame-src 'none'`，避免影響後台安全性。

## 版本範圍

以下版本均需一致：
- `demo/frontend/`，同事展示版前台
- `frontend-only/website/`，純前台版
- `fullstack/web/`，正式前台（包含 CSP 相容）
- `../navlynx-android16-preview/preview-v6.html`，獨立 v6 預覽

## 仍保持不變

MG 相容性公告、取消下載前車款確認、六題官網 FAQ、飛鼠教學提醒、BMW 特定機型提示、寄回方案與費用、相容性公告後台。此次僅修改 GitHub 預覽原始碼，**沒有修改正式 `navlynx.com.tw` 站台，也沒有部署真實後台**。

## 實際瀏覽器測試（2026-11-24）

使用 Firefox／Playwright 在隔離環境載入 GitHub 來源，逐一測試：同事展示前台、純前台、正式後台版本的前台，以及獨立 v6。四套版本均通過以下檢查：

- ApplePie ONE、Touch、mini Ultra II、Melling／Melling-G 四個機型入口皆能切換，並顯示兩階段
- Touch 檔名 `APM1288TOUCH.zip`、日期 `2026-05-27`、兩個並排的下載卡、第二階段官網總覽網址均正確
- Touch 不顯示額外「Android 16 韌體檔名／官方公告日期」文字列
- 各機型均顯示嵌入的 `youtube-nocookie.com/embed/bxnIG22PdPw`，影片寬高比為 16:9，具標題及外部 YouTube 連結
- 未選機型及切到寄回升級時，影片不會顯示
- 390px 手機版兩張下載卡上下排列、影片容器寬度不超出畫面，沒有橫向捲動
- 六題 FAQ 保留且可見，測試過程 JavaScript page errors：0

**驗證限制：** 測試以替代網頁回應模擬 YouTube 播放器載入，確認嵌入網址、結構及排版；尚未實際播放影片檢驗 YouTube 端是否允許嵌入。正式 Python 伺服器上的實際 CSP 回應、管理員登入與部署仍須正式環境驗收。

## 上線檢查重點

- 桌機與手機點選 Touch 後，都看得到第一及第二階段
- Touch 的第一階段檔名與日期正確
- Touch 第二階段按鈕導向官網下載頁，其他機型維持各自下載路徑
- 四款自行升級頁皆有 YouTube 嵌入及備援連結
- 影片容器維持 16:9，手機不會出現橫向捲動
- 從 Touch 切到其他機型與寄回方案，沒有錯誤殘留或重複區塊
- 公開網站 CSP 允許 YouTube 隱私嵌入；管理後台仍阻止 iframe
