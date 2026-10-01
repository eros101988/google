# 部署與上線指南

## 1. 環境變數 (Environment Variables)
在部署到 Vercel 前，請確保準備好以下環境變數：
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 專案 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key (用於繞過 RLS 或後端操作)
- `NEXT_PUBLIC_APP_URL`: 網站的主網址 (如 `https://admin.example.com`)
- `REDIRECT_BASE_URL`: NFC 短網址的根網域 (如 `https://go.example.com`)
- `GOOGLE_PLACES_API_KEY`: (選填) 如果需要使用 Google 官方 Places API 搜尋，請填入此 Key。

## 2. 資料庫 Migration
請參考 `DATABASE_SETUP.md`，在 Supabase 中執行 `00001_init.sql`，並建立好第一組 Admin 帳號。

## 3. Vercel 部署
1. 將本專案推送到 GitHub。
2. 進入 Vercel Dashboard，點擊 **Add New...** -> **Project**。
3. 匯入此 GitHub Repository。
4. 在 **Environment Variables** 區塊，填入步驟 1 中的所有變數。
5. 點擊 **Deploy**。

## 4. 網域設定
請參考 `DOMAIN_SETUP.md`，在 Vercel 中綁定 `admin.example.com` 與 `go.example.com`，並在 DNS 設定 CNAME。

## 5. 第一次登入與測試
1. 前往 `https://admin.example.com`。
2. 使用在 Supabase 建立的 Admin 帳號密碼登入。
3. 進入 Dashboard 後，點擊 **商家管理** -> **新增商家**。
4. 建立「測試商家」，並填入或搜尋 Google Review URL。
5. 進入該商家，點擊 **新增 NFC 卡**。
6. 系統會生成類似 `https://go.example.com/r/A83KD` 的短網址。
7. 在瀏覽器新分頁中開啟該短網址，確認是否成功 302 Redirect 到 Google Review URL。

## 6. 寫入 NFC Tools
1. 在手機上下載 **NFC Tools** App。
2. 在後台點擊 **寫入 NFC**。
3. 複製生成的短網址 (如 `https://go.example.com/r/A83KD`)。
4. 在 NFC Tools 中選擇 **Write** -> **Add a record** -> **URL / URI**。
5. 貼上網址並點擊 **Write**，將手機靠近 NFC 實體卡片即可完成寫入。

## 7. 實機測試
1. 用手機觸碰剛寫好的 NFC 卡。
2. 確認手機是否能立刻開啟 Google 評論頁。
3. 回到 Admin Dashboard，確認 **掃描統計** 數字是否增加。

## Production Deployment Checklist
- [ ] 確定 `.env` 中沒有外洩的 API Keys
- [ ] Supabase SQL Migration 已成功執行
- [ ] Supabase 第一個 Admin 帳號已建立
- [ ] Vercel 環境變數已全部填妥
- [ ] Admin 與 Redirect 網域皆已通過 DNS 驗證
- [ ] 實機 NFC 測試可正常跳轉
- [ ] Dashboard 掃描統計可正常更新
