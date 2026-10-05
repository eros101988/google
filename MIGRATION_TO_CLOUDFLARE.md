# 遷移至 Cloudflare KV 指南

如果您的系統已經在 Supabase 累積了多筆 NFC 卡片資料，在切換到 Cloudflare Worker 架構時，您需要將這些資料同步至 Cloudflare KV。

## 遷移步驟

### 1. 確保 Cloudflare 環境已設定
請先完成 `CLOUDFLARE_SETUP.md` 中的所有步驟，確保 Worker 已部署、KV 已建立，且 Vercel 上的環境變數已正確設定。

### 2. 登入 Admin 後台
前往您的管理後台 `https://admin.example.com`。

### 3. 進入商家管理
1. 在左側選單點選 **商家管理**。
2. 進入每一個擁有 NFC 卡片的商家詳細頁面。

### 4. 執行批量同步
1. 在商家詳細頁面的「旗下 NFC 卡」區塊，您會看到一個 **「同步所有 NFC 卡」** 的按鈕。
2. 點擊該按鈕。
3. 系統會自動讀取 Supabase 中的所有卡片，並將它們的 `short_code` 與 `destination_url` 寫入 Cloudflare KV。
4. 觀察按鈕旁的狀態提示，確認是否全部成功（例如：`同步成功 (10)`）。
5. 若有失敗，點擊特定卡片的「重新同步」按鈕單獨重試。

### 5. 測試轉址
選擇其中一張已同步的卡片，點擊其「測試 Redirect」按鈕，確認是否能正確透過 Cloudflare Worker 轉址。

## 注意事項
- 批量同步 API 會循序呼叫 Cloudflare REST API，如果單一商家有超過數百張卡片，可能需要等待幾秒鐘。
- 此遷移不具破壞性。即使 Cloudflare KV 同步失敗，原始資料仍安全保留在 Supabase 中。
