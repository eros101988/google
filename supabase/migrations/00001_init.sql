-- supabase/migrations/00001_init.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: merchants
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    notes TEXT,
    google_place_id VARCHAR(255),
    google_business_url TEXT,
    google_review_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: nfc_cards
CREATE TABLE nfc_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    short_code VARCHAR(20) UNIQUE NOT NULL,
    short_url TEXT NOT NULL,
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    destination_url TEXT NOT NULL,
    destination_type VARCHAR(50) DEFAULT 'google_review' CHECK (destination_type IN ('google_review', 'google_maps', 'custom')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'testing', 'lost', 'replaced')),
    label VARCHAR(255),
    notes TEXT,
    scan_count INTEGER DEFAULT 0,
    last_scan_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: scan_events
CREATE TABLE scan_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nfc_card_id UUID REFERENCES nfc_cards(id) ON DELETE SET NULL,
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    referrer TEXT,
    country VARCHAR(100),
    region VARCHAR(100),
    is_test BOOLEAN DEFAULT FALSE
);

-- Table: link_health_checks
CREATE TABLE link_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nfc_card_id UUID REFERENCES nfc_cards(id) ON DELETE CASCADE,
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    http_status INTEGER,
    is_reachable BOOLEAN,
    final_url TEXT,
    response_time_ms INTEGER,
    error_message TEXT
);

-- Table: admin_audit_logs
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID, -- References auth.users(id) in Supabase if linked
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_nfc_cards_short_code ON nfc_cards(short_code);
CREATE INDEX idx_nfc_cards_merchant_id ON nfc_cards(merchant_id);
CREATE INDEX idx_scan_events_nfc_card_id ON scan_events(nfc_card_id);
CREATE INDEX idx_scan_events_timestamp ON scan_events(timestamp);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_nfc_cards_updated_at
    BEFORE UPDATE ON nfc_cards
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Function to increment scan count safely
CREATE OR REPLACE FUNCTION increment_scan_count(card_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE nfc_cards
  SET scan_count = scan_count + 1,
      last_scan_at = NOW()
  WHERE id = card_id;
END;
$$ LANGUAGE plpgsql;
