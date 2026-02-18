# JE心怡美顏館 MVP（前台 + 後台）

此專案為可上線的 MVP，採用 **Next.js + Prisma + SQLite**，手機優先、SEO 友善、可持續擴充。

## 功能摘要
- 前台：首頁（品牌亮點/門市/FAQ）、服務列表/詳情、案例列表/詳情、商城列表/詳情、購物車、結帳(匯款)、訂單成立、教學課程頁。
- 後台：登入、Dashboard、訂單管理（搜尋/篩選/CSV匯出/狀態更新）、商品管理、案例管理、服務頁管理。
- LINE OA：新訂單自動推播（Messaging API Push）。

## 快速開始
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## 初始化管理員帳號
- Email: `admin@je-beauty.local`
- Password: `Admin@1234`
- 登入頁：`/admin/login`

## 環境變數
- `DATABASE_URL`：SQLite 連線字串
- `ADMIN_SESSION_SECRET`：後台 session 簽章金鑰
- `LINE_OA_CHANNEL_ACCESS_TOKEN`：LINE OA Bot access token
- `LINE_OA_TO_USER_ID`：接收推播的 userId/groupId
- SMTP 欄位：保留未來訂單 Email 通知擴充

## 資料模型（MVP + 可擴充）
- `products`, `categories`, `product_images`, `inventory`
- `orders`, `order_items`, `customers`
- `cases`, `case_images`, `tags`
- `services`, `faqs`
- `users`, `roles`, `permissions`
- `settings`（line_oa_token、site_seo_defaults、stores_overview）

## API（重點）
- `POST /api/checkout`：建立訂單 + LINE OA 通知
- `GET /api/orders/export`：後台 CSV 匯出
- `GET/POST /api/products`
- `GET/POST /api/cases`
- `GET/POST /api/services`
- `GET /api/orders`, `PUT /api/orders/:id`

## 後續建議（進階）
- 金流：藍新/綠界
- 會員：註冊、點數、歷史訂單
- 折扣碼：驗證與使用次數控管
- 物流：超商/黑貓託運與狀態回拋
