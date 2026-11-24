# 純前台版｜由網頁公司維護

網站入口：`website/index.html`，需與整個 `website/assets/` 一起上傳。

此版沒有後台、帳號、密碼、登入 API 或資料庫。適合直接放入一般網站空間，或由網頁公司移植至目前 ASP 官網。沒有假登入頁，也沒有把管理密碼藏在前端。

公告集中設定於 `website/assets/notice-config.js` 的 `seed`：

- `enabled`：是否顯示。
- `severity`：`warning` 相容性提醒，或 `info` 一般公告。
- `title`：標題。
- `intro`：說明。
- `brands`：暫緩升級的品牌陣列。
- `closing`：結尾說明。
- `revision`：每次變更請遞增。
- `publishedAt`：可填正式發布時間的 ISO 8601 字串，未填則不顯示時間。

`mode` 請保留 `static`。原公告內容使用純文字，不要寫 HTML。

變更後須重新上傳 `notice-config.js`，並更新資源版本參數或清除 CDN／瀏覽器快取，才能讓訪客看到新內容。與前後台版不同，此版不會透過 API 自動即時更新；已經開啟的頁面須重新載入。

建議網頁公司對本頁 HTML 及公告設定檔設 `Cache-Control: no-cache, must-revalidate`，每次部署同步遞增載入版本。尚未配置 CDN/HTTP 快取標頭前，不要宣稱公告能即時刷新。

本版頁面上方保留 MG 車款相容性公告，但不再跳出下載前車款確認視窗，韌體連結可直接開啟。中文密碼及飛鼠教學保留在同一個「升級前請先確認」區塊。所有四款機型均為兩階段升級，並嵌入官方 Android 16 YouTube 教學。最新規格請以 `../WEB_COMPANY_HANDOFF_20261124.txt` 為準。

測試方式：於 website 執行 `python -m http.server 8000`，再開啟 `http://localhost:8000`。不需 npm、不需編譯。可由網頁公司依實際系統改名為 Android16.asp，但要保留 UTF-8 及所有 assets 相對路徑。

不另外修改原產品圖片、FAQ、Touch 單次更新、其他機型兩階段更新及 LINE 優先的寄回流程。外部韌體、YouTube 和 LINE 仍需網路。ONE、Touch、Ultra II 圖片沿用原官網來源，Melling 圖片為原交付資源；請勿以生成產品圖替代。
