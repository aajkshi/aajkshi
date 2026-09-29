// 公告設定。純前台版由網頁公司維護；前後台版 seed 僅作錯誤時備援。
window.NLX_NOTICE_CONFIG = {
  "mode": "api",
  "apiUrl": "/api/notice",
  "seed": {
    "enabled": true,
    "severity": "warning",
    "title": "車款相容性提醒｜部分車款請暫緩升級",
    "intro": "目前部分車款與 Android 16 仍有相容性狀況。為了讓您維持穩定的使用體驗，以下品牌車款請先暫緩升級：",
    "brands": [
      "MG",
      "Peugeot",
      "Citroen"
    ],
    "closing": "待完成相容性確認並開放支援後，我們會立即於官網發布公告。感謝您的理解與耐心等候。",
    "revision": 1,
    "publishedAt": null
  }
};
