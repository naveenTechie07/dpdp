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
`;

// Initialize Tables Synchronously on Module Load
db.serialize(() => {
  db.exec(SCHEMA_DDL, (err) => {
    if (err) {
      console.error('[DATABASE] Schema initialization error:', err);
    } else {
      console.log('[DATABASE] All 9 tables and performance indices initialized successfully.');
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
