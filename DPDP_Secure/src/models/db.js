const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const appConfig = require('../config/appConfig');

// 1. Dynamic Serverless-Compatible Path Resolution
const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'dpdp_secure.db')
  : path.join(__dirname, '../../data/dpdp_secure.db');

// Ensure directory exists to prevent EROFS or ENOENT
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Copy pre-seeded SQLite database to /tmp if running under Vercel serverless environment
if (process.env.VERCEL) {
  const localDb = path.join(__dirname, '../../data/dpdp_secure.db');
  if (fs.existsSync(localDb) && !fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(localDb, dbPath);
      console.log('[DATABASE] Copied bundled database to /tmp/dpdp_secure.db for serverless execution.');
    } catch (e) {
      console.warn('[DATABASE] Could not copy bundled DB to /tmp, will initialize fresh:', e.message);
    }
  }
}

// Initialize SQLite Database Client
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[DATABASE] Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`[DATABASE] 100% Offline SQLite database connected at: ${dbPath}`);
  }
});

// Enable WAL mode & Foreign Keys for performance and integrity
db.run('PRAGMA foreign_keys = ON;');
db.run('PRAGMA journal_mode = WAL;');

/**
 * Promisified Database Helpers (Guarantees Parameterized Safety)
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * Atomic Transaction Runner with Automatic Rollback
 */
async function runTransaction(transactionFn) {
  await run('BEGIN TRANSACTION');
  try {
    const result = await transactionFn({ run, get, all });
    await run('COMMIT');
    return result;
  } catch (err) {
    await run('ROLLBACK');
    throw err;
  }
}

/**
 * Sensitive Token Encryption at Rest (AES-256-GCM)
 */
function encryptToken(plainText, secret = appConfig.sessionSecret) {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash('sha256').update(secret).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decryptToken(encryptedPayload, secret = appConfig.sessionSecret) {
  const [ivHex, authTagHex, encryptedText] = encryptedPayload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = crypto.createHash('sha256').update(secret).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * 2. Database Schema DDL & Indices Initialization
 */
const SCHEMA_DDL = `
  CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    businessName TEXT NOT NULL,
    businessType TEXT,
    gstNumber TEXT,
    address TEXT,
    dpoName TEXT,
    dpoEmail TEXT,
    complianceScore INTEGER DEFAULT 84,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS data_silos (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    siloName TEXT NOT NULL,
    siloType TEXT NOT NULL,
    filePath TEXT,
    itemCount INTEGER DEFAULT 0,
    riskLevel TEXT,
    lastScannedAt DATETIME,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS pii_findings (
    id TEXT PRIMARY KEY,
    siloId TEXT NOT NULL,
    entityName TEXT,
    piiType TEXT NOT NULL,
    maskedValue TEXT NOT NULL,
    rawSample TEXT,
    lineNumber INTEGER,
    confidenceScore REAL DEFAULT 1.0,
    isRedacted INTEGER DEFAULT 0,
    FOREIGN KEY(siloId) REFERENCES data_silos(id)
  );

  CREATE TABLE IF NOT EXISTS ropa_records (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    activityName TEXT NOT NULL,
    dataCategories TEXT,
    purpose TEXT NOT NULL,
    legalBasis TEXT NOT NULL,
    retentionPeriod TEXT,
    storageLocation TEXT,
    securitySafeguards TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS consent_notices (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    title TEXT NOT NULL,
    purposeCode TEXT NOT NULL,
    language TEXT NOT NULL,
    noticeText TEXT NOT NULL,
    version TEXT DEFAULT '1.0',
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS consent_events (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    dataPrincipalPhone TEXT NOT NULL,
    purposeCode TEXT NOT NULL,
    status TEXT NOT NULL,
    channel TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    sha256Proof TEXT,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS privacy_requests (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    ticketNumber TEXT UNIQUE NOT NULL,
    principalName TEXT NOT NULL,
    principalPhone TEXT NOT NULL,
    principalEmail TEXT,
    requestType TEXT NOT NULL,
    status TEXT NOT NULL,
    statutoryLockReason TEXT,
    certHash TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    incidentTitle TEXT NOT NULL,
    scenarioType TEXT NOT NULL,
    severity TEXT NOT NULL,
    affectedCount INTEGER DEFAULT 0,
    dataCategories TEXT,
    containmentActions TEXT,
    reportedToDpbi INTEGER DEFAULT 0,
    citizenAlertSent INTEGER DEFAULT 0,
    discoveredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    detailsJson TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    prevHash TEXT,
    hash TEXT NOT NULL,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_pii_silo ON pii_findings(siloId);
  CREATE INDEX IF NOT EXISTS idx_consent_phone ON consent_events(dataPrincipalPhone);
  CREATE INDEX IF NOT EXISTS idx_privacy_ticket ON privacy_requests(ticketNumber);
  CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_silos_tenant ON data_silos(tenantId);

  CREATE TABLE IF NOT EXISTS data_assets (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    assetName TEXT NOT NULL,
    assetType TEXT NOT NULL,
    sourceSystem TEXT,
    sensitivity TEXT DEFAULT 'UNCLASSIFIED',
    elements TEXT DEFAULT '0',
    status TEXT DEFAULT 'active',
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_assets_tenant ON data_assets(tenantId);

  CREATE TABLE IF NOT EXISTS data_tags (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    tagName TEXT NOT NULL,
    category TEXT NOT NULL,
    subCategory TEXT,
    sensitivityWeight INTEGER DEFAULT 50,
    colorTag TEXT DEFAULT '#8b5cf6',
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_tags_tenant ON data_tags(tenantId);

  CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    workflowName TEXT NOT NULL,
    description TEXT,
    triggerEvent TEXT,
    actions TEXT,
    stages TEXT DEFAULT '[]',
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS ropa_silo_mapping (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    ropaRecordId TEXT NOT NULL,
    siloId TEXT NOT NULL,
    mappingType TEXT DEFAULT 'primary',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ropaRecordId) REFERENCES ropa_records(id),
    FOREIGN KEY(siloId) REFERENCES data_silos(id),
    UNIQUE(ropaRecordId, siloId)
  );

  CREATE INDEX IF NOT EXISTS idx_ropa_silo_mapping_ropa ON ropa_silo_mapping(ropaRecordId);
  CREATE INDEX IF NOT EXISTS idx_ropa_silo_mapping_silo ON ropa_silo_mapping(siloId);
  CREATE INDEX IF NOT EXISTS idx_ropa_silo_mapping_tenant ON ropa_silo_mapping(tenantId);

  CREATE TABLE IF NOT EXISTS data_processors (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    processorName TEXT NOT NULL,
    serviceType TEXT,
    dataCategories TEXT,
    jurisdiction TEXT,
    adequacyDecision TEXT,
    contractSigned INTEGER DEFAULT 0,
    dpaSigned INTEGER DEFAULT 0,
    lastReviewed DATETIME,
    riskLevel TEXT DEFAULT 'MEDIUM',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_processors_tenant ON data_processors(tenantId);

  CREATE TABLE IF NOT EXISTS retention_policies (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    policyName TEXT NOT NULL,
    dataCategory TEXT,
    retentionPeriod TEXT,
    legalBasis TEXT,
    autoDelete INTEGER DEFAULT 0,
    lastReviewed DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_retention_tenant ON retention_policies(tenantId);

  CREATE TABLE IF NOT EXISTS cross_border_transfers (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    destinationCountry TEXT,
    recipientName TEXT,
    dataCategories TEXT,
    transferMechanism TEXT,
    adequacyDecision TEXT,
    lastReviewed DATETIME,
    riskLevel TEXT DEFAULT 'MEDIUM',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_transfers_tenant ON cross_border_transfers(tenantId);

  CREATE TABLE IF NOT EXISTS compliance_evidence (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    documentName TEXT NOT NULL,
    documentType TEXT,
    uploadedBy TEXT,
    filePath TEXT,
    fileSize INTEGER,
    verified INTEGER DEFAULT 0,
    expiryDate DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_evidence_tenant ON compliance_evidence(tenantId);

  CREATE TABLE IF NOT EXISTS security_controls (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    controlName TEXT NOT NULL,
    controlCategory TEXT,
    implementationStatus TEXT DEFAULT 'planned',
    effectiveness TEXT DEFAULT 'medium',
    lastTested DATETIME,
    nextReview DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_sec_controls_tenant ON security_controls(tenantId);

  CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    assessmentName TEXT NOT NULL,
    assessmentType TEXT,
    status TEXT DEFAULT 'draft',
    score INTEGER DEFAULT 0,
    totalQuestions INTEGER DEFAULT 0,
    answeredQuestions INTEGER DEFAULT 0,
    lastCompleted DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_assessments_tenant ON assessments(tenantId);

  CREATE TABLE IF NOT EXISTS assessment_templates (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    templateName TEXT NOT NULL,
    framework TEXT,
    questionCount INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_ass_templates_tenant ON assessment_templates(tenantId);

  CREATE TABLE IF NOT EXISTS pia_dpia_assessments (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    assessmentName TEXT NOT NULL,
    dataCategory TEXT,
    riskLevel TEXT,
    status TEXT DEFAULT 'draft',
    mitigations TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_pia_dpia_tenant ON pia_dpia_assessments(tenantId);

  CREATE TABLE IF NOT EXISTS assessment_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    settingKey TEXT NOT NULL,
    settingValue TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id),
    UNIQUE(tenantId, settingKey)
  );

  CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    integrationName TEXT NOT NULL,
    provider TEXT,
    status TEXT DEFAULT 'inactive',
    apiKeyPrefix TEXT,
    lastSynced DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_integrations_tenant ON integrations(tenantId);

  CREATE TABLE IF NOT EXISTS integration_hub (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    connectorName TEXT NOT NULL,
    connectorType TEXT,
    config JSON,
    isActive INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    keyName TEXT NOT NULL,
    keyPrefix TEXT,
    keyHash TEXT,
    scopes TEXT,
    lastUsed DATETIME,
    expiresAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_apikeys_tenant ON api_keys(tenantId);

  CREATE TABLE IF NOT EXISTS tenant_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    settingKey TEXT NOT NULL,
    settingValue TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id),
    UNIQUE(tenantId, settingKey)
  );

  CREATE TABLE IF NOT EXISTS sso_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    provider TEXT NOT NULL,
    clientId TEXT,
    clientSecret TEXT,
    redirectUri TEXT,
    isEnabled INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS branding_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    logoUrl TEXT,
    primaryColor TEXT DEFAULT '#3b82f6',
    secondaryColor TEXT DEFAULT '#10b981',
    companyName TEXT,
    faviconUrl TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS organization_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    organizationName TEXT,
    parentOrganization TEXT,
    country TEXT,
    industry TEXT,
    employeeCount INTEGER,
    dataProcessingPurpose TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    roleName TEXT NOT NULL,
    permissions TEXT,
    isSystem INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_roles_tenant ON role_permissions(tenantId);

  CREATE TABLE IF NOT EXISTS localization_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    language TEXT NOT NULL,
    isDefault INTEGER DEFAULT 0,
    translations TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS consent_purposes (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    purposeName TEXT NOT NULL,
    purposeCode TEXT UNIQUE NOT NULL,
    description TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_purposes_tenant ON consent_purposes(tenantId);

  CREATE TABLE IF NOT EXISTS consent_preferences (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    preferenceName TEXT NOT NULL,
    preferenceValue TEXT,
    isGlobal INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS consent_preference_centers (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    centerName TEXT NOT NULL,
    purposeIds TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS consent_data_elements (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    elementName TEXT NOT NULL,
    elementType TEXT,
    isSensitive INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS consent_policies (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    policyName TEXT NOT NULL,
    policyText TEXT,
    version TEXT DEFAULT '1.0',
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS consent_portal_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    settingKey TEXT NOT NULL,
    settingValue TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id),
    UNIQUE(tenantId, settingKey)
  );

  CREATE TABLE IF NOT EXISTS cookie_scan_results (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    websiteUrl TEXT NOT NULL,
    scanDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    cookieCount INTEGER DEFAULT 0,
    necessaryCount INTEGER DEFAULT 0,
    nonNecessaryCount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed',
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS cookie_consent_logs (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    sessionId TEXT,
    action TEXT,
    cookieCategories TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS cookie_banners (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    bannerName TEXT NOT NULL,
    bannerText TEXT,
    buttonText TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS cookie_geo_rules (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    countryCode TEXT NOT NULL,
    ruleType TEXT NOT NULL,
    ruleValue TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_cookie_geo_rules_tenant ON cookie_geo_rules(tenantId);

  CREATE TABLE IF NOT EXISTS cookie_inventory (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    cookieName TEXT NOT NULL,
    domain TEXT NOT NULL,
    provider TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'NECESSARY',
    purpose TEXT,
    legalBasis TEXT DEFAULT 'Section 6 - Consent',
    cookieType TEXT DEFAULT 'FIRST_PARTY',
    isSecure INTEGER DEFAULT 0,
    isHttpOnly INTEGER DEFAULT 0,
    isSameSite INTEGER DEFAULT 0,
    expiresDays INTEGER DEFAULT 0,
    currentStatus TEXT DEFAULT 'active',
    consentRequired INTEGER DEFAULT 1,
    discoveredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastScannedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_cookie_inv_tenant ON cookie_inventory(tenantId);
  CREATE INDEX IF NOT EXISTS idx_cookie_inv_domain ON cookie_inventory(domain);
  CREATE INDEX IF NOT EXISTS idx_cookie_inv_category ON cookie_inventory(category);

  CREATE TABLE IF NOT EXISTS data_lineage_edges (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    flowType TEXT DEFAULT 'etl',
    notes TEXT,
    isStale INTEGER DEFAULT 0,
    lastConfirmed TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_lineage_edges_tenant ON data_lineage_edges(tenantId);

  CREATE TABLE IF NOT EXISTS consent_collection_points (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    channelName TEXT NOT NULL,
    channelType TEXT NOT NULL,
    purposeCode TEXT NOT NULL,
    supportedLanguages TEXT NOT NULL,
    statutoryBasis TEXT DEFAULT 'Section 6(1) Explicit Consent',
    status TEXT DEFAULT 'ENABLED',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_collection_points_tenant ON consent_collection_points(tenantId);

  -- Atomic baseline tenant seed to prevent any FOREIGN KEY constraint failures on cold start
  INSERT OR IGNORE INTO tenants (id, businessName, businessType, gstNumber, address, dpoName, dpoEmail, complianceScore)
  VALUES ('TENANT-AAROGYA-01', 'Aarogya Diagnostic Center', 'Diagnostic Laboratory & Healthcare SME', '29AAAAA0000A1Z5', '12th Main Road, Indiranagar, Bengaluru, Karnataka - 560038', 'Ramesh Kumar', 'privacy@aarogyaclinic.in', 84);

  -- Baseline silos seed
  INSERT OR IGNORE INTO data_silos (id, tenantId, siloName, siloType, itemCount, riskLevel)
  VALUES 
    ('SILO-CLAIMS-DB', 'TENANT-AAROGYA-01', 'Claims Database (claims, policyholders, medical_histories)', 'ENTERPRISE_RDBMS', 1840, 'CRITICAL'),
    ('SILO-POLICY-ADMIN-DB', 'TENANT-AAROGYA-01', 'Policy Administration Database (customers, policies, nominees)', 'ENTERPRISE_CORE', 2650, 'HIGH'),
    ('SILO-EXCEL-FILES', 'TENANT-AAROGYA-01', 'Excel Files (agent_commission, tpa_network, customer_leads)', 'SPREADSHEET', 780, 'MEDIUM'),
    ('SILO-PDFS', 'TENANT-AAROGYA-01', 'PDF Documents (blood_reports, discharge_summaries, kyc_scans)', 'PDF_DOCUMENTS', 520, 'CRITICAL'),
    ('SILO-DOCUMENTS', 'TENANT-AAROGYA-01', 'Office Documents (clinical_notes, doctor_rx, consent_declarations)', 'OFFICE_DOCUMENTS', 340, 'HIGH'),
    ('SILO-CLOUD-STORAGE', 'TENANT-AAROGYA-01', 'Cloud Storage (s3://aarogya-records, gcs://claims-archive)', 'CLOUD_OBJECT_STORE', 1120, 'RESTRICTED'),
    ('SILO-WHATSAPP-01', 'TENANT-AAROGYA-01', 'Clinic Reception WhatsApp (Chat Exports & Patient PII)', 'INFORMAL_CHAT', 1420, 'CRITICAL'),
    ('SILO-LEADS-02', 'TENANT-AAROGYA-01', 'Marketing & Customer Leads (Unsecured CSV Tracker)', 'INFORMAL_SPREADSHEET', 850, 'HIGH'),
    ('SILO-INVOICES-03', 'TENANT-AAROGYA-01', 'Billing & Invoices (Accounts Department CSV)', 'INFORMAL_FINANCIAL', 980, 'MEDIUM'),
    ('SILO-BILLING-03', 'TENANT-AAROGYA-01', 'Tally Invoicing & Billing CSV', 'INFORMAL_FINANCIAL', 980, 'MEDIUM'),
    ('SILO-PATIENT-PORTAL', 'TENANT-AAROGYA-01', 'Primary Reception Console (Patient Intake & Portal)', 'ENTERPRISE_WEB', 650, 'HIGH'),
    ('SILO-DIAGNOSTIC-LIMS', 'TENANT-AAROGYA-01', 'Diagnostic Laboratory Information System (LIMS)', 'ENTERPRISE_LIMS', 1200, 'CRITICAL'),
    ('SILO-BILLING-FINANCE', 'TENANT-AAROGYA-01', 'Enterprise Billing & Commercial Finance System', 'ENTERPRISE_FINANCE', 890, 'MEDIUM');
`;

// Initialize Tables Synchronously on Module Load
db.serialize(() => {
  db.exec(SCHEMA_DDL, (err) => {
    if (err) {
      console.error('[DATABASE] Schema initialization error:', err);
    } else {
      console.log('[DATABASE] All tables, baseline tenants, and performance indices initialized successfully.');
      if (process.env.VERCEL) {
        (async () => {
          try {
            const row = await get('SELECT COUNT(*) as count FROM pii_findings');
            if (!row || row.count === 0) {
              console.log('[DATABASE] Serverless cold start: running demo seeder for Aarogya Clinic...');
              const { seedDemoData } = require('./demoSeeder');
              await seedDemoData();
            }
          } catch (e) {
            console.warn('[DATABASE] Serverless auto-seed notice:', e.message);
          }
        })();
      }
    }
  });
});

module.exports = {
  db,
  dbPath,
  run,
  get,
  all,
  exec,
  runTransaction,
  encryptToken,
  decryptToken
};
