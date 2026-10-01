# Database 設定指南

本專案使用 PostgreSQL，並建議搭配 Supabase 進行快速開發與部署。

## 1. 建立 Supabase 專案
1. 前往 [Supabase 官網](https://supabase.com) 註冊/登入。
2. 點擊 **New Project**，選擇合適的組織與地區。
3. 記下資料庫密碼（Database Password）。

## 2. 執行 SQL Migration
有兩種方式可以建立資料庫 Schema：

### 方式 A：透過 Supabase Dashboard (最簡單)
1. 進入 Supabase Dashboard。
2. 點擊左側選單的 **SQL Editor**。
3. 點擊 **New Query**。
4. 複製專案中 `supabase/migrations/00001_init.sql` 的所有內容並貼上。
5. 點擊 **RUN** 執行，這會建立所有需要的資料表（merchants, nfc_cards, scan_events 等）。

### 方式 B：透過 Supabase CLI
1. 安裝 Supabase CLI (`npm i -g supabase`)。
2. 登入 CLI (`supabase login`)。
3. 連結專案 (`supabase link --project-ref 您的_project_ref`)。
4. 執行推送 (`supabase db push`)。

## 3. 設定 Auth (建立第一個 Admin)
系統使用 Supabase Authentication 來管理 Admin。
1. 在 Supabase Dashboard 左側點選 **Authentication**。
2. 點選 **Providers**，確保 Email 登入已啟用（可以關閉 Confirm email 以便快速測試）。
3. 點選 **Users** -> **Add user** -> **Create new user**。
4. 輸入您要作為管理員的 Email 與 Password。
5. 點選 **Create user**。
6. 這個帳號就是您的第一組 Admin 登入帳號。

## 4. 取得連線金鑰
1. 點擊左下角 **Project Settings** -> **API**。
2. 複製 **Project URL**。
3. 複製 **anon** `public` key。
4. (如果需要後端操作) 複製 **service_role** `secret` key。
5. 這些資訊將填入 `.env.local` 與 Vercel 的 Environment Variables。
