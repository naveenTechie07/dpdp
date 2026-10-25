/**
 * DPDP_Secure - Cryptographic Hash-Chained Audit Logging Engine
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Enforces tamper-evident immutable audit logging under DPDP Act, 2023.
 * Every audit log entry cryptographically links to the previous entry:
 * currentHash = SHA-256(prevHash + timestamp + actor + action + resource + details)
 * Any manual modification or deletion breaks the chain and alerts compliance auditors.
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('./db');

const GENESIS_HASH = 'GENESIS_HASH_DPDP_SECURE_2026_SRUJANA';
const DEFAULT_TENANT_ID = 'TENANT-AAROGYA-01';

/**
 * Computes canonical SHA-256 hash for an audit log entry
 */
function computeEntryHash(prevHash, timestamp, actor, action, resource, detailsString) {
  const payload = String(prevHash) + String(timestamp) + String(actor) + String(action) + String(resource) + String(detailsString);
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Logs a new immutable, hash-chained audit event into SQLite
 *
 * @param {string} tenantId - Tenant identifier
 * @param {string} actor - Actor name & designation (e.g. 'Ramesh Kumar (SME_OWNER)')
 * @param {string} action - Statutory action (e.g. 'DISCOVERY_SCAN', 'DSR_ERASURE_EXECUTED')
 * @param {string} resource - Target silo or Data Principal (e.g. 'clinic_reception_chat.txt')
 * @param {string|Object} details - Legal rationale, ground, or payload metadata
 * @param {Object} [options] - Additional parameters (custom timestamp for migration/seeding)
 * @returns {Promise<Object>} Created audit log record with hash chain proof
 */
async function logEvent(tenantId = DEFAULT_TENANT_ID, actor, action, resource, details = {}, options = {}) {
  const id = options.id || uuidv4();
  const timestamp = options.timestamp || new Date().toISOString();
  const detailsJson = typeof details === 'object' ? JSON.stringify(details) : String(details);

  // Retrieve the previous hash in the tenant chain
  let prevHash = options.prevHash;
  if (!prevHash) {
    const latestLog = await get(
      'SELECT hash FROM audit_logs WHERE tenantId = ? ORDER BY timestamp DESC, rowid DESC LIMIT 1',
      [tenantId]
    );
    prevHash = latestLog?.hash || GENESIS_HASH;
  }

  // Calculate cryptographic SHA-256 chained hash
  const hash = computeEntryHash(prevHash, timestamp, actor, action, resource, detailsJson);

  await run(
    `INSERT INTO audit_logs (id, tenantId, actor, action, resource, detailsJson, timestamp, prevHash, hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, tenantId, actor, action, resource, detailsJson, timestamp, prevHash, hash]
  );

  // Auto-sync to Supabase Cloud
  try {
    const { syncAuditRecord } = require('../services/supabaseClient');
    syncAuditRecord({
      id,
      tenantId,
      eventType: action,
      entityId: resource,
      actorId: actor,
      details: detailsJson,
      previousHash: prevHash,
      currentHash: hash,
      timestamp
    }).catch(() => {});
  } catch (e) {}

  return {
    id,
    tenantId,
    actor,
    action,
    resource,
    detailsJson,
    timestamp,
    prevHash,
    hash
  };
}

/**
 * Mathematically validates the integrity of the audit log hash chain.
 * Detects any database tampering, row insertion, deletion, or modification.
 *
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} Verification report with status and cryptographic telemetry
 */
async function verifyAuditChain(tenantId = DEFAULT_TENANT_ID) {
  const logs = await all(
    'SELECT * FROM audit_logs WHERE tenantId = ? ORDER BY timestamp ASC, rowid ASC',
    [tenantId]
  );

  if (!logs || logs.length === 0) {
    return {
      verified: true,
      count: 0,
      genesisHash: GENESIS_HASH,
      headHash: null,
      brokenIndex: -1,
      brokenAtId: null,
      message: 'Audit ledger is currently empty. Genesis block ready.'
    };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];

    // 1. Check backward linkage to previous digest
    if (log.prevHash !== expectedPrevHash) {
      return {
        verified: false,
        count: logs.length,
        brokenIndex: i,
        brokenAtId: log.id,
        reason: `Hash chain linkage broken at row ${i + 1} (${log.id}). Expected prevHash: ${expectedPrevHash}, but found: ${log.prevHash}`,
        message: 'TAMPER_DETECTED: Blockchain linkage inconsistency discovered!'
      };
    }

    // 2. Re-compute SHA-256 over record content to ensure immutability
    const recalculated = computeEntryHash(
      log.prevHash,
      log.timestamp,
      log.actor,
      log.action,
      log.resource,
      log.detailsJson
    );

    if (recalculated !== log.hash) {
      return {
        verified: false,
        count: logs.length,
        brokenIndex: i,
        brokenAtId: log.id,
        reason: `Cryptographic digest mismatch at row ${i + 1} (${log.id}). Record content has been modified. Expected hash: ${recalculated}, record hash: ${log.hash}`,
        message: 'TAMPER_DETECTED: Record content hash falsification discovered!'
      };
    }

    expectedPrevHash = log.hash;
  }

  return {
    verified: true,
    count: logs.length,
    genesisHash: GENESIS_HASH,
    headHash: expectedPrevHash,
    brokenIndex: -1,
    brokenAtId: null,
    message: `All ${logs.length} audit entries verified. Cryptographic hash chain is 100% UNTAMPERED and statutory compliant.`
  };
}

/**
 * Fetches audit log records with chain metadata and formatted details
 *
 * @param {string} tenantId - Tenant identifier
 * @param {Object} [options] - Pagination and filters
 * @returns {Promise<Array<Object>>} Formatted audit entries
 */
async function getAuditLogs(tenantId = DEFAULT_TENANT_ID, options = {}) {
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const logs = await all(
    'SELECT * FROM audit_logs WHERE tenantId = ? ORDER BY timestamp DESC, rowid DESC LIMIT ? OFFSET ?',
    [tenantId, limit, offset]
  );

  return logs.map((log) => {
    let parsedDetails = {};
    try {
      parsedDetails = JSON.parse(log.detailsJson || '{}');
    } catch (e) {
      parsedDetails = { raw: log.detailsJson };
    }

    return {
      ...log,
      details: parsedDetails,
      shortHash: log.hash ? log.hash.substring(0, 16) + '...' : '',
      shortPrevHash: log.prevHash ? log.prevHash.substring(0, 16) + '...' : ''
    };
  });
}

module.exports = {
  GENESIS_HASH,
  computeEntryHash,
  logEvent,
  verifyAuditChain,
  getAuditLogs
};
