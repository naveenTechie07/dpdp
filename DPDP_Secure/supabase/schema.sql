-- ============================================================================
-- DPDP_Secure: Enterprise PostgreSQL Schema for Supabase Cloud Backend
-- Project: HACKATHON (bxiuiopomqpwxmslllhl) | Region: ap-south-1 (Mumbai)
-- Problem Statement: LS-04 (Srujana Tech Fest 2026)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants (SME Organization Profile)
CREATE TABLE IF NOT EXISTS public.tenants (
    id TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    business_type TEXT,
    gst_number TEXT,
    address TEXT,
    dpo_name TEXT,
    dpo_email TEXT,
    compliance_score INTEGER DEFAULT 84,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Data Silos & Connectors (Shadow IT & Informal Silos)
CREATE TABLE IF NOT EXISTS public.data_silos (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    silo_name TEXT NOT NULL,
    silo_type TEXT NOT NULL,
    file_path TEXT,
    item_count INTEGER DEFAULT 0,
    risk_level TEXT DEFAULT 'MEDIUM',
    last_scanned_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_data_silos_tenant ON public.data_silos(tenant_id);

-- 3. PII Findings (Verhoeff & Indian Identifier Scanner Findings)
CREATE TABLE IF NOT EXISTS public.pii_findings (
    id TEXT PRIMARY KEY,
    silo_id TEXT NOT NULL REFERENCES public.data_silos(id) ON DELETE CASCADE,
    entity_name TEXT,
    pii_type TEXT NOT NULL,
    masked_value TEXT NOT NULL,
    raw_sample TEXT,
    line_number INTEGER,
    confidence_score REAL DEFAULT 1.0,
    is_redacted BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_pii_silo ON public.pii_findings(silo_id);

-- 4. Record of Processing Activities (RoPA under Section 8)
CREATE TABLE IF NOT EXISTS public.ropa_records (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    activity_name TEXT NOT NULL,
    data_categories TEXT,
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    retention_period TEXT,
    storage_location TEXT,
    security_safeguards TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ropa_tenant ON public.ropa_records(tenant_id);

-- 4B. RoPA Silo Mappings (Connector Links & Lineage Associations)
CREATE TABLE IF NOT EXISTS public.ropa_silo_mapping (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    ropa_record_id TEXT NOT NULL REFERENCES public.ropa_records(id) ON DELETE CASCADE,
    silo_id TEXT NOT NULL REFERENCES public.data_silos(id) ON DELETE CASCADE,
    mapping_type TEXT DEFAULT 'primary',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ropa_record_id, silo_id)
);
CREATE INDEX IF NOT EXISTS idx_ropa_silo_ropa ON public.ropa_silo_mapping(ropa_record_id);
CREATE INDEX IF NOT EXISTS idx_ropa_silo_silo ON public.ropa_silo_mapping(silo_id);
CREATE INDEX IF NOT EXISTS idx_ropa_silo_tenant ON public.ropa_silo_mapping(tenant_id);

-- 5. Section 5 Multilingual Consent Notices
CREATE TABLE IF NOT EXISTS public.consent_notices (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    purpose_code TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    notice_text TEXT NOT NULL,
    version TEXT DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consent_notices_tenant ON public.consent_notices(tenant_id);

-- 6. Consent Events (Immutable WhatsApp & Web Grants with SHA-256 Non-Repudiation)
CREATE TABLE IF NOT EXISTS public.consent_events (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    data_principal_phone TEXT NOT NULL,
    purpose_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    channel TEXT NOT NULL DEFAULT 'WHATSAPP',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    sha256_proof TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_consent_phone ON public.consent_events(data_principal_phone);
CREATE INDEX IF NOT EXISTS idx_consent_tenant ON public.consent_events(tenant_id);

-- 7. Privacy Requests (DSR Tickets & Statutory Collision Locks)
CREATE TABLE IF NOT EXISTS public.privacy_requests (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    ticket_number TEXT UNIQUE NOT NULL,
    principal_name TEXT NOT NULL,
    principal_phone TEXT NOT NULL,
    principal_email TEXT,
    request_type TEXT NOT NULL,
    status TEXT NOT NULL,
    statutory_lock_reason TEXT,
    cert_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_privacy_ticket ON public.privacy_requests(ticket_number);

-- 8. Incidents (Data Breach Intimation Form DPBI-IR1 under Section 8(6))
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    incident_title TEXT NOT NULL,
    scenario_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    affected_count INTEGER DEFAULT 0,
    data_categories TEXT,
    containment_actions TEXT,
    reported_to_dpbi BOOLEAN DEFAULT FALSE,
    citizen_alert_sent BOOLEAN DEFAULT FALSE,
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant ON public.incidents(tenant_id);

-- 9. Audit Logs (Tamper-Evident SHA-256 Hash Chained Ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details_json TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    prev_hash TEXT,
    hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_time ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON public.audit_logs(tenant_id);

-- 10. Data Assets & Catalog
CREATE TABLE IF NOT EXISTS public.data_assets (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    source_system TEXT,
    sensitivity TEXT DEFAULT 'UNCLASSIFIED',
    elements TEXT DEFAULT '0',
    status TEXT DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_data_assets_tenant ON public.data_assets(tenant_id);

-- 11. Data Lineage Edges (Asset Data Flow Graphs)
CREATE TABLE IF NOT EXISTS public.data_lineage_edges (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    flow_type TEXT DEFAULT 'etl',
    notes TEXT,
    is_stale BOOLEAN DEFAULT FALSE,
    last_confirmed TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lineage_edges_tenant ON public.data_lineage_edges(tenant_id);

-- 12. Consent Collection Points & Published Channels
CREATE TABLE IF NOT EXISTS public.consent_collection_points (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    channel_name TEXT NOT NULL,
    channel_type TEXT NOT NULL,
    purpose_code TEXT NOT NULL,
    supported_languages TEXT NOT NULL,
    statutory_basis TEXT DEFAULT 'Section 6(1) Explicit Consent',
    status TEXT DEFAULT 'ENABLED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_collection_points_tenant ON public.consent_collection_points(tenant_id);

-- 13. Specified Purpose Library
CREATE TABLE IF NOT EXISTS public.consent_purposes (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    purpose_name TEXT NOT NULL,
    purpose_code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_purposes_tenant ON public.consent_purposes(tenant_id);

-- 14. Cookie Governance Tables
CREATE TABLE IF NOT EXISTS public.cookie_scan_results (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    website_url TEXT NOT NULL,
    scan_date TIMESTAMPTZ DEFAULT NOW(),
    cookie_count INTEGER DEFAULT 0,
    necessary_count INTEGER DEFAULT 0,
    non_necessary_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed'
);

CREATE TABLE IF NOT EXISTS public.cookie_consent_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    session_id TEXT,
    action TEXT,
    cookie_categories TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security (RLS) Configuration
-- ============================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_silos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pii_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ropa_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ropa_silo_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lineage_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_collection_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consent_logs ENABLE ROW LEVEL SECURITY;

-- Allow service_role full unrestricted access
CREATE POLICY "Service role full access on tenants" ON public.tenants FOR ALL USING (true);
CREATE POLICY "Service role full access on data_silos" ON public.data_silos FOR ALL USING (true);
CREATE POLICY "Service role full access on pii_findings" ON public.pii_findings FOR ALL USING (true);
CREATE POLICY "Service role full access on ropa_records" ON public.ropa_records FOR ALL USING (true);
CREATE POLICY "Service role full access on ropa_silo_mapping" ON public.ropa_silo_mapping FOR ALL USING (true);
CREATE POLICY "Service role full access on consent_notices" ON public.consent_notices FOR ALL USING (true);
CREATE POLICY "Service role full access on consent_events" ON public.consent_events FOR ALL USING (true);
CREATE POLICY "Service role full access on privacy_requests" ON public.privacy_requests FOR ALL USING (true);
CREATE POLICY "Service role full access on incidents" ON public.incidents FOR ALL USING (true);
CREATE POLICY "Service role full access on audit_logs" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Service role full access on data_assets" ON public.data_assets FOR ALL USING (true);
CREATE POLICY "Service role full access on data_lineage_edges" ON public.data_lineage_edges FOR ALL USING (true);
CREATE POLICY "Service role full access on consent_collection_points" ON public.consent_collection_points FOR ALL USING (true);
CREATE POLICY "Service role full access on consent_purposes" ON public.consent_purposes FOR ALL USING (true);
CREATE POLICY "Service role full access on cookie_scan_results" ON public.cookie_scan_results FOR ALL USING (true);
CREATE POLICY "Service role full access on cookie_consent_logs" ON public.cookie_consent_logs FOR ALL USING (true);

-- Allow anon public read access for notices and active collection points
CREATE POLICY "Public read active notices" ON public.consent_notices FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active collection points" ON public.consent_collection_points FOR SELECT USING (status = 'ENABLED');
CREATE POLICY "Public insert consent events" ON public.consent_events FOR INSERT WITH CHECK (true);
