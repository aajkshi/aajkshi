# Case OS × Chatwoot 開源架構可行性與深度技術評估報告（重製版）

## 1. 執行摘要

本報告針對 **Case OS（案件管理系統）** 的核心需求，重新評估以 **Chatwoot** 作為底層通訊與對話中樞的可行性，並聚焦於：

- LINE 官方帳號事件接入與可靠儲存
- Gemini 結構化輸出整合
- 案件狀態機（Case-centric）與客服對話（Conversation-centric）落差
- 隱私法遵、AI 風險治理與企業級維運能力

**結論摘要：**

1. Chatwoot 可覆蓋約 70% 的基礎能力（Webhook 接入、訊息儲存、附件保存、客服 UI、非同步工作流）。
2. Case OS 不應硬改 Chatwoot 核心狀態機，而應將複雜商業邏輯外掛到中介層（Kasee AI Service）。
3. 透過 Custom Attributes + AgentBot + System Webhooks，可達成「對話層穩定、案件層可擴充」的解耦架構。
4. 若導入 Gemini，需強制 JSON Schema、資料遮罩、人工接手與高風險動作審批，才能落地於企業環境。

---

## 2. 架構契合度評估

### 2.1 Chatwoot 能直接提供的能力

- **LINE 官方帳號整合**：接收訊息、處理事件、回覆與推播。
- **事件儲存**：以 PostgreSQL 持久化對話、訊息、聯絡人、標籤。
- **非同步處理**：Rails + Redis + Sidekiq，避免同步鏈路阻塞。
- **多媒體附件**：透過 ActiveStorage 對接 S3/GCS/R2 等物件儲存。
- **營運介面**：客服收件匣、指派、標記、篩選、自動化規則。

### 2.2 與 Case OS 的關鍵差距

- Chatwoot 為「**對話中心**」；Case OS 需要「**案件中心**」。
- Chatwoot 內建狀態有限（open/pending/snoozed/resolved），不足以承載工程場景的細緻流轉。
- AI 不是單純聊天回覆，還需做：
  - 案件建立
  - 結構化欄位抽取
  - 風險分級
  - SOP/知識缺口沉澱

### 2.3 建議定位

將 Chatwoot 定位為：

> **Headless Conversation Engine（無頭式對話引擎）**

將 Case OS 核心邏輯定位為：

> **External Case Brain（外部案件大腦）**

---

## 3. LINE Messaging API 約束與解法

### 3.1 replyToken 壽命短、同步回覆風險高

**風險：** replyToken 一次性且時效短，AI 推理若超時會導致回覆失敗。  
**解法：**

1. Chatwoot 先快速 ACK（200），事件丟入 Sidekiq。
2. Kasee AI Service 只做非同步處理，不阻塞主鏈路。
3. 即時模式：快速回覆；延遲模式：先安撫、後補完整結果。
4. 底層回覆策略由 Chatwoot channel driver 接管（reply / push 切換）。

### 3.2 LINE 媒體可能失效，需立刻落地

**風險：** 圖片/影片等內容在 LINE 端非永久保存。  
**解法：**

- 收到事件後立即下載媒體，透過 ActiveStorage 上傳至 S3 相容儲存。
- 顯示端使用短期簽名 URL，兼顧安全與效能。
- 案件證據鏈與稽核資料可長期保留。

### 3.3 重送（Redelivery）與冪等性

**風險：** 事件可能重複或亂序到達。  
**解法：**

- 以 webhookEventId/messageId 建立去重鍵。
- Chatwoot 內部去重 + Kasee AI 應用層冪等鎖雙保險。
- 任何「建立案件/更新狀態/寫入 CRM」操作均需 idempotency key。

### 3.4 單一 Webhook URL 限制

**風險：** LINE OA 只能指向一個端點。  
**解法：**

- 讓 Chatwoot 成為主入口。
- 再由 Chatwoot System Webhooks 分發到 AI、CRM、監控服務。
- 達到「單入口、多下游」事件匯流排效果。

### 3.5 撤回（Unsend）事件治理

**要求：** 使用者撤回後，資料不應再用於 AI 訓練。  
**解法：**

- 接收刪除事件後同步標記/硬刪除訓練集內容。
- 訓練前做資料濾除與遮罩檢查。

---

## 4. Case-centric 狀態機設計

### 4.1 不改核心 enum，改用 Custom Attributes

建議新增 Conversation-level 屬性：

- `case_internal_status`（內部狀態）
- `case_customer_visible_status`（對客顯示狀態）
- `severity`（S0~S3）
- `facts`、`hypotheses`、`next_actions`

由外部狀態機服務透過 API 更新上述欄位，達成高彈性擴充。

### 4.2 結案品質保證

啟用「Resolved 前必填欄位」策略（例如產品型號、韌體版本、根因分類、最終處置）。

效益：

- 防止低品質結案
- 建立可再利用的訓練資產
- 強化主管審核與知識管理

### 4.3 對客透明化流程

當內部狀態變更（如 Pending Engineering）時，自動推播客戶可理解訊息：

- 減少客戶焦慮與重複追問
- 提升客服信任感
- 統一客服話術品質

---

## 5. Gemini 整合與 AgentBot 協作

### 5.1 標準資料流

1. LINE 訊息進 Chatwoot。
2. Chatwoot 完成儲存與附件下載。
3. AgentBot 把上下文 payload 送到 Kasee AI Service。
4. Kasee 做遮罩後呼叫 Gemini。
5. Gemini 回傳 JSON（Schema 驗證通過）。
6. Kasee 將結構化結果寫回 Chatwoot Custom Attributes。

### 5.2 Structured Output（強制 JSON Schema）

要求模型輸出固定欄位：

- `customer_intent`
- `severity`
- `facts[]`
- `hypotheses[]`
- `next_actions.ask_customer[]`
- `next_actions.internal[]`

禁止自由散文作為系統對接主資料格式，避免下游解析失敗。

### 5.3 人工接手機制（Human Handoff）

觸發條件示例：

- 高風險（S0/S1）
- 涉及退款、法律、資安事件
- AI 連續多輪無法收斂

實作方式：將對話由 `pending` 切回 `open`，交由人工接管。

### 5.4 訓練迴圈

結案後非同步任務可產出：

- SOP 草案
- 快速回覆模板
- 知識缺口工單

並進入「AI 生成 → 人審 → 發布」治理流程，避免知識庫污染。

---

## 6. 安全、隱私與法遵

### 6.1 台灣個資法（PDPA）

- 在首次互動時提供精簡告知（目的、範圍、權利、刪除管道）。
- 不阻斷對話流程，但要可追溯與可證明。

### 6.2 資料最小化與 ZDR

- 對 LLM 僅送必要資訊。
- 敏感資訊（電話、身分證、地址、卡號）先遮罩再送模型。
- 採付費方案並確認 Zero Data Retention（或等效條款）。

### 6.3 Prompt Injection 防禦

- 系統提示與工具權限分層。
- 高風險動作永不自動執行。
- 涉及承諾型決策（退款、法律）必須人工覆核。

---

## 7. 三階段落地路線圖

### Phase 1（2–3 週）：基礎建置

- 部署 Chatwoot（Rails/Sidekiq/Redis/Postgres）
- 完成 LINE OA 串接
- 啟用 ActiveStorage + S3 相容儲存
- 建立核心自訂欄位

### Phase 2（4–6 週）：AI 中介層

- 建置 Kasee AI Service（Node.js 或 Python）
- 串接 AgentBot outgoing_url
- 實作遮罩、Schema 驗證、狀態更新 API

### Phase 3（4–8 週）：營運整合

- 建立 Webhook-driven 狀態通知
- 導入 Dashboard App 與 CRM 側欄
- 建置結案訓練資產流水線

---

## 8. 最終結論

Chatwoot 作為 Case OS 的底層平台是 **高可行且高 CP 值** 的方案：

- 能大幅縮短 MVP 交付時間
- 降低通訊協定與附件保存的實作風險
- 透過外部中介層保留商業邏輯彈性與可升級性

成功關鍵不在「魔改 Chatwoot」，而在「清楚解耦」：

- Chatwoot 負責通訊、儲存、客服操作面
- Kasee AI Service 負責狀態機、AI 推理、資料治理

此架構可在不犧牲合規與安全前提下，打造可持續迭代的 AI 案件管理系統。
