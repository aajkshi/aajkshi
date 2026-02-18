# JE 靜態可瀏覽版（免安裝）

你可以直接啟動一個本機靜態伺服器，立即瀏覽：

```bash
python3 -m http.server 4173 --directory site
```

打開：
- 前台：`http://localhost:4173/index.html`
- 後台：`http://localhost:4173/admin.html`

## 後台示範帳密
- 帳號：`admin`
- 密碼：`1234`

## 說明
- 這是「可直接瀏覽」版本，使用 localStorage 存資料（購物車、訂單、後台狀態）。
- 可先快速驗收 UI/流程，再銜接原本 Next.js + Prisma 版本進入正式上線。 
