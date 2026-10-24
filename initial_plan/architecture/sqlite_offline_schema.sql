CREATE TABLE IF NOT EXISTS data_fiduciaries (id TEXT PRIMARY KEY, entity_name TEXT NOT NULL, cin_or_gstin TEXT, dpo_name TEXT, dpo_email TEXT, dpo_phone TEXT, is_sdf BOOLEAN DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS consent_notices (id TEXT PRIMARY KEY, fiduciary_id TEXT REFERENCES data_fiduciaries(id), title TEXT NOT NULL, version TEXT NOT NULL, language_code TEXT DEFAULT 'en', purposes_json TEXT NOT NULL, data_items_json TEXT NOT NULL, retention_period_days INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS data_principals (id TEXT PRIMARY KEY, identifier_hash TEXT NOT NULL UNIQUE, phone_masked TEXT, email_masked TEXT, is_minor BOOLEAN DEFAULT 0, guardian_identifier_hash TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS consent_records (id TEXT PRIMARY KEY, principal_id TEXT REFERENCES data_principals(id), notice_id TEXT REFERENCES consent_notices(id), status TEXT CHECK(status IN ('ACTIVE', 'REVOKED', 'EXPIRED')), granted_purposes TEXT NOT NULL, granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, revoked_at TIMESTAMP, receipt_hash TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS audit_trail (sequence_num INTEGER PRIMARY KEY AUTOINCREMENT, event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, actor_id TEXT NOT NULL, action_type TEXT NOT NULL, target_entity TEXT NOT NULL, entity_id TEXT NOT NULL, payload_hash TEXT NOT NULL, prev_block_hash TEXT NOT NULL, block_hash TEXT NOT NULL);
