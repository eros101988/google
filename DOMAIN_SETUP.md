# Domain 設定指南

本系統需要設定兩個主要網域用途：Admin 管理後台與 NFC Redirect 轉址。

## 1. 準備您的網域
假設您擁有的網域為 `example.com`。我們建議使用：
- **Admin 網域**: `admin.example.com`
- **Redirect 短網址網域**: `go.example.com` (盡量簡短以節省 NFC 寫入容量)

## 2. 在 Vercel 中設定網域
1. 進入 Vercel 專案儀表板。
2. 點擊 **Settings** > **Domains**。
3. 在輸入框中輸入 `admin.example.com` 並點擊 **Add**。
4. 再次輸入 `go.example.com` 並點擊 **Add**。

## 3. 在 DNS 供應商中設定 DNS 紀錄
根據 Vercel 提供的提示，在您的網域供應商（如 Cloudflare、GoDaddy 等）新增對應的紀錄。通常是：

### 對於子網域 (如 admin.example.com 和 go.example.com)
- **Type**: CNAME
- **Name**: `admin` (或 `go`)
- **Value**: `cname.vercel-dns.com`

### 對於根網域 (如果您的 Redirect URL 想直接用 example.com)
- **Type**: A Record
- **Name**: `@`
- **Value**: `76.76.21.21`

## 4. 驗證與生效
DNS 紀錄更新可能需要幾分鐘到 24 小時。
當 Vercel 顯示「Valid Configuration」時，代表網域已成功連接。

## 5. 更新環境變數
設定完成後，記得在 Vercel 中將 `REDIRECT_BASE_URL` 環境變數設定為 `https://go.example.com`。
