# Cloudflare 設定指南

為實現極速且低成本的 NFC 轉址，本專案將 Redirect 邏輯部署於 Cloudflare Workers 並搭配 Cloudflare KV。

## 1. 建立 Cloudflare 帳號
前往 [Cloudflare](https://dash.cloudflare.com/sign-up) 註冊一組免費帳號。

## 2. 建立 KV Namespace
1. 在 Cloudflare 控制台中，點選左側選單的 **Workers & Pages** -> **KV**。
2. 點擊 **Create a namespace**。
3. 命名為 `nfc-redirect-production`（或任何您喜歡的名稱）。
4. 點擊 **Add**。
5. 建立完成後，在列表中找到該 Namespace，複製其 **ID**（這將是 `CLOUDFLARE_KV_NAMESPACE_ID`）。

## 3. 取得 Account ID
1. 在 Cloudflare 控制台的首頁或任何網域的 Overview 頁面，右下角會顯示 **Account ID**。
2. 複製該字串（這將是 `CLOUDFLARE_ACCOUNT_ID`）。

## 4. 建立最低權限 API Token
為了讓 Vercel/Next.js 可以安全地更新 KV，我們需要一組 API Token。
1. 點選右上角頭像 -> **My Profile** -> 左側選單 **API Tokens**。
2. 點擊 **Create Token** -> 捲到最下方點擊 **Create Custom Token**。
3. 設定名稱：`NFC KV Updater`
4. Permissions（權限）設定：
   - 選擇 **Account**
   - 選擇 **Workers KV Storage**
   - 選擇 **Edit**
5. Account Resources 設定：
   - 選擇 **Include** -> 您的帳號名稱
6. 點擊 **Continue to summary**，然後 **Create Token**。
7. 複製產生的 Token（這將是 `CLOUDFLARE_API_TOKEN`）。**請注意，此 Token 只會顯示一次**。

## 5. 部署 Cloudflare Worker
1. 在本機開啟終端機，進入 `workers/redirect-worker` 資料夾。
2. 開啟 `wrangler.toml`，取消註解 `[env.production]` 區塊，並將 `<YOUR_PROD_KV_ID>` 替換為步驟 2 取得的 KV Namespace ID。
3. 執行安裝：`npm install`
4. 執行部署：`npx wrangler deploy`
5. CLI 會引導您登入 Cloudflare，授權後即會自動部署。
6. 部署完成後，您會得到一個類似 `nfc-redirect-worker.<您的名稱>.workers.dev` 的測試網址。

## 6. 將自訂網域綁定至 Worker
1. 在 Cloudflare 中新增您的網域（例如 `example.com`）。
   - *注意：將網域加入 Cloudflare DNS 不代表您必須轉移註冊商，只需將原註冊商的 Nameserver 改為 Cloudflare 提供的即可。*
2. 確保 `admin.example.com` 的 DNS 紀錄（指向 Vercel）在 Cloudflare DNS 中設定正確。
3. 進入 **Workers & Pages**，點選剛部署的 `nfc-redirect-worker`。
4. 進入 **Triggers** 標籤頁。
5. 在 **Custom Domains** 區塊，點擊 **Add Custom Domain**。
6. 輸入 `go.example.com`，Cloudflare 會自動為您設定 DNS 與憑證。

## 7. 更新 Vercel 環境變數
回到 Vercel Dashboard，在專案的 Environment Variables 加入：
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_KV_NAMESPACE_ID`
- `CLOUDFLARE_API_TOKEN`
重新部署 Next.js 專案即可生效。

## 8. 測試
建立一張測試用的 NFC 卡，並訪問 `https://go.example.com/r/您的短代碼`，確認是否能秒速跳轉至目的地！
