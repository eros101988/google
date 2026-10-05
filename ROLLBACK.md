# 降級與 Rollback 指南

本專案在升級至 Cloudflare Worker 轉址架構時，**刻意保留了原有的 Vercel/Next.js 轉址 API** 作為備援機制。如果在 Cloudflare 端發生不可預期的嚴重錯誤，您可以快速 Rollback 至原本的架構。

## 如何 Rollback

如果您發現 `go.example.com` (Cloudflare Worker) 無法正常運作：

### 1. 修改 DNS 紀錄
1. 登入您的 DNS 供應商（或 Cloudflare DNS）。
2. 將 `go.example.com` 的設定改回指向 Vercel。
   - 刪除 Cloudflare Worker 的 Custom Domain 綁定。
   - 新增/修改 CNAME 紀錄：
     - **Name**: `go`
     - **Value**: `cname.vercel-dns.com`

### 2. 原有架構接手
當 DNS 生效後，所有的 `https://go.example.com/r/XXXXX` 請求都會回到 Vercel。
Vercel 內的 `src/app/r/[code]/route.ts` 依然存在且功能完整，它會：
1. 查詢 Supabase。
2. 寫入 Analytics (如果有開啟)。
3. 執行 302 Redirect。

這確保了您的 NFC 實體卡片在任何情況下都不會失效。

## 何時該使用 Rollback？
- Cloudflare 發生全球性大規模當機（極少見）。
- 您不慎刪除了 Cloudflare KV Namespace 且無法立即恢復。
- Cloudflare API Token 失效，導致後台無法更新 KV，且您急需讓新建立的 NFC 卡片立即生效。

一旦問題排除，您只需將 `go.example.com` 的 Custom Domain 重新綁定回 Cloudflare Worker 即可恢復低成本高效能架構。
