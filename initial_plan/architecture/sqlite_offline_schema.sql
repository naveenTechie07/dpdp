CREATE TABLE IF NOT EXISTS data_fiduciaries (id TEXT PRIMARY KEY, entity_name TEXT NOT NULL, cin_or_gstin TEXT, dpo_name TEXT, dpo_email TEXT, dpo_phone TEXT, is_sdf BOOLEAN DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS consent_notices (id TEXT PRIMARY KEY, fiduciary_id TEXT REFERENCES data_fiduciaries(id), title TEXT NOT NULL, version TEXT NOT NULL, language_code TEXT DEFAULT 'en', purposes_json TEXT NOT NULL, data_items_json TEXT NOT NULL, retention_period_days INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
