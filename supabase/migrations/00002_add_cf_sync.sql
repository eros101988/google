-- supabase/migrations/00002_add_cf_sync.sql

ALTER TABLE nfc_cards 
ADD COLUMN redirect_sync_status VARCHAR(50) DEFAULT 'pending' CHECK (redirect_sync_status IN ('synced', 'pending', 'error')),
ADD COLUMN redirect_last_synced_at TIMESTAMPTZ,
ADD COLUMN redirect_sync_error TEXT;
