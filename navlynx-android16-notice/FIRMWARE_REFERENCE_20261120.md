# NAVLYNX ApplePie Android 16 韌體對照表（2026-11-20 核對）

用途：提供網站製作公司核對「首次升級第一階段」與「第二階段官網最新 Android 16 韌體」的檔案與路徑。本次已移除額外的「已是 Android 16 · 後續更新」展示卡片。官網後續如有新公告，應再次核對並更新網頁；本頁資料不是即時同步。

## 首次升級 Android 16（保留既定流程）

| 機型 | 第一步的指定檔案及日期 | 第一次升級的流程 |
| --- | --- | --- |
| ONE | `APM1288BM.zip`，2026-04-28 | 先裝指定升級韌體，再依 ONE 官網頁面下載 Android 16 韌體進行第二次更新 |
| Touch | `APM1288TOUCH.zip`，2026-05-27 | 直接升級 Android 16，一次更新完成，不需要指定中繼階段 |
| mini Ultra II | `APM1688S.zip`，2026-05-07 | 先裝指定升級韌體，再依 Ultra II 官網頁面下載 Android 16 韌體進行第二次更新 |
| Melling／Melling-G | `APM1288BM.zip`，2026-04-28 | 先裝指定升級韌體，再依 Melling 官網頁面下載 Android 16 韌體進行第二次更新 |

上表首次升級的指定日期、Google Drive 資料夾與步驟，是原本已確認的 NAVLYNX 升級專區作業流程，**不是**最新發布韌體的日期。保留各機型原先的下載網址，不以最新更新檔取代指定的第一步。

## 第二階段對應的官網 Android 16 韌體參考

| 機型 | 官網最近公告 | Android 16 對應檔名 | 官網韌體頁 |
| --- | --- | --- | --- |
| ONE | 2026-11-06，優化無線 CarPlay 藍牙 | `APM1288_A16.zip` | https://www.navlynx.com.tw/download_in_a12.asp |
| Touch | 2026-11-04，更新內建軟體版本 | `APM1288TOUCH_A16.zip` | https://www.navlynx.com.tw/download_in_a11.asp |
| mini Ultra II | 2026-08-17，更新內建軟體版本 | `APM1688S_A16.zip` | https://www.navlynx.com.tw/download_in_a8.asp |
| Melling／Melling-G | 2026-11-06，優化無線 CarPlay 藍牙 | `APM1288_A16.zip` | https://www.navlynx.com.tw/download_in_a9.asp |

檔名是官網指定的「系統版本」檔案類型，所列日期是官網更新紀錄最近一筆公告。即使 ONE 與 Melling 顯示相同檔名，也必須從各自的專屬官網頁面下載，不應直接假設兩者檔案可互用。

## 網站功能要求

- 選擇機型後顯示原本首次升級檔案和步驟，不要把最新公告日期替換成指定第一階段日期。
- 第二階段（Touch 無此階段）顯示同一機型的官方公告日期、Android 16 檔名及**該機型專用官網頁**；不額外呈現獨立的後續更新區塊。
- 客戶使用正常時，無須強迫更新。不確定目前 Android 系統版本、產品機型或更新檔案，應先請客服確認。
- 更新程式碼的位置：`demo/frontend/assets/base.js`、`frontend-only/website/assets/base.js`、`fullstack/web/assets/base.js`；獨立 v6 在 `../navlynx-android16-preview/preview-v6.html`。
- 公告後台的管理功能與韌體版本來源分開。**後台公告可編輯，不代表韌體版本資料已自動同步。**
- 頁面目前不再有「下載前確認車款」跳出視窗；MG 相容性公告仍保留。

資料核對日：2026-11-20（Asia/Taipei）。若官網發布更新，應同步調整前台最新公告日期與檔名。
