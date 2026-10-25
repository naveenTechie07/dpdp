/**
 * DPDP_Secure - Unit & Integration Test Suite for Statutory Collision Resolver & Certificate Generator
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Reconciles DPDP Act Section 12(3) Erasure with CGST Act Section 36 Tax Lock via Section 8(7)
 * Run directly via: node tests/statutoryCollisionResolver.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const {
  executeSmartErasure,
  evaluateInvoiceRetention,
  atomicWriteFile,
  sanitizeCsvCell,
  redactWhatsAppChat,
  redactCustomerLeads,
  processTaxInvoices,
  resetSampleData,
  CHAT_FILE,
  LEADS_FILE,
  INVOICES_FILE
} = require('../src/services/statutoryCollisionResolver');

const {
  computeCertificateFingerprint,
  generateErasureCertificate,
  getCertificateById,
  buildCertificateHtml
} = require('../src/services/certificateGenerator');

const models = require('../src/models');

console.log('================================================================');
console.log('  DPDP_Secure - Pillar 3: Statutory Collision Resolver Test Suite');
console.log('================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  [+] PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  [-] FAIL: ${name}`);
    console.error(`      ${err.message}`);
    testsFailed++;
  }
}

async function main() {
  // Backup files before test execution
  const chatBackup = fs.readFileSync(CHAT_FILE, 'utf8');
  const leadsBackup = fs.readFileSync(LEADS_FILE, 'utf8');
  const invoicesBackup = fs.readFileSync(INVOICES_FILE, 'utf8');

  try {
    resetSampleData();
    // 1. Cybersecurity Guardrail: Formula Injection Defense
    await runTest('Formula Injection Defense: Neutralize CSV command execution characters', () => {
      assert.strictEqual(sanitizeCsvCell('=1+1'), '\'=1+1');
      assert.strictEqual(sanitizeCsvCell('+cmd|/c calc'), '\'+cmd|/c calc');
      assert.strictEqual(sanitizeCsvCell('-SUM(A1:A10)'), '\'-SUM(A1:A10)');
      assert.strictEqual(sanitizeCsvCell('@IMPORTXML(...)'), '\'@IMPORTXML(...)');
      assert.strictEqual(sanitizeCsvCell('[REDACTED-DPDP-SEC-12]'), '[REDACTED-DPDP-SEC-12]');
      assert.strictEqual(sanitizeCsvCell('Deepa Nair'), 'Deepa Nair');
      assert.strictEqual(sanitizeCsvCell(''), '');
    });

    // 2. Cybersecurity Guardrail: Atomic File Writing (.tmp + rename)
    await runTest('Atomic File Writing: Write to temporary file and atomically rename', () => {
      const testFile = path.join(__dirname, '../data/sample_data/atomic_test.txt');
      const testContent = 'DPDP_Secure atomic write verification 2026';
      
      atomicWriteFile(testFile, testContent);
      assert.ok(fs.existsSync(testFile), 'Target file must exist after atomic write');
      assert.strictEqual(fs.readFileSync(testFile, 'utf8'), testContent);

      // Cleanup
      if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    });

    // 3. Statutory Conflict Evaluation: CGST Act Section 36 vs DPDP Act Section 12
    await runTest('Statutory Conflict Evaluation: CGST Act 72-Month Tax Lock Threshold', () => {
      // 2024 invoice -> less than 6 years old
      const recentInvoice = evaluateInvoiceRetention('2024-09-15', new Date('2026-10-25'));
      assert.strictEqual(recentInvoice.status, 'MANDATORY_TAX_RETENTION_ACTIVE');
      assert.strictEqual(recentInvoice.isExpired, false);
      assert.ok(recentInvoice.statutoryCitation.includes('CGST Act, 2017 Section 36'));
      assert.ok(recentInvoice.statutoryCitation.includes('DPDP Act, 2023 Section 8(7)'));

      // 2017 invoice -> more than 6 years old
      const oldInvoice = evaluateInvoiceRetention('2017-04-12', new Date('2026-10-25'));
      assert.strictEqual(oldInvoice.status, 'STATUTORY_RETENTION_EXPIRED');
      assert.strictEqual(oldInvoice.isExpired, true);
      assert.ok(oldInvoice.statutoryCitation.includes('retention period expired'));
    });

    // 4. Track A1: WhatsApp Chat Redaction
    await runTest('Track A1: Atomically redact WhatsApp chat personal occurrences', () => {
      const res = redactWhatsAppChat(CHAT_FILE, '+91 9988776655');
      assert.strictEqual(res.modified, true);

      const updatedChat = fs.readFileSync(CHAT_FILE, 'utf8');
      assert.ok(!updatedChat.includes('Deepa Nair'), 'Deepa Nair must be redacted from chat');
      assert.ok(updatedChat.includes('[REDACTED-DPDP-SEC-12]'), 'Must contain [REDACTED-DPDP-SEC-12]');
    });

    // 5. Track A2: Customer Leads CSV Redaction
    await runTest('Track A2: Atomically redact Customer Leads CSV row 5 cells', () => {
      const res = redactCustomerLeads(LEADS_FILE, '+91 9988776655');
      assert.strictEqual(res.modified, true);

      const updatedLeads = fs.readFileSync(LEADS_FILE, 'utf8');
      const lines = updatedLeads.split(/\r?\n/).filter(Boolean);
      const row5 = lines[4]; // Row 5 (index 4)

      assert.ok(row5.includes('[REDACTED-DPDP-SEC-12]'), 'Row 5 must have redacted marker');
      assert.ok(!row5.includes('6734 5234 8901'), 'Aadhaar must be erased from row 5');
      assert.ok(!row5.includes('PQRST3456D'), 'PAN must be erased from row 5');
    });

    // 6. Track B: Tax Invoices Pseudonymization & Statutory Lock
    await runTest('Track B: Tax Invoice INV-2024-309 is NOT deleted, but locked under CGST Section 36', () => {
      const res = processTaxInvoices(INVOICES_FILE, '+91 9988776655');
      assert.ok(res.lockedInvoices.length >= 1, 'Must have at least 1 tax-locked invoice');
      assert.strictEqual(res.lockedInvoices[0].invoiceNumber, 'INV-2024-309');

      const updatedInvoices = fs.readFileSync(INVOICES_FILE, 'utf8');
      assert.ok(updatedInvoices.includes('INV-2024-309'), 'Invoice INV-2024-309 MUST be preserved');
      assert.ok(updatedInvoices.includes('29DDDDD3333D1Z1'), 'GSTIN must be preserved for tax audit');
      assert.ok(updatedInvoices.includes('12000.00'), 'Invoice amount must be preserved');
      assert.ok(updatedInvoices.includes('99XXXXXX55'), 'Personal mobile must be pseudonymized/masked');
      assert.ok(updatedInvoices.includes('CGST Act Section 36'), 'Must cite statutory retention reason');
    });

    // 7. Cryptographic Certificate Generator: SHA-256 Non-Repudiation Proof
    await runTest('Cryptographic Proof: Compute deterministic SHA-256 audit fingerprint', () => {
      const timestamp = '2026-10-25T08:30:00.000Z';
      const fp = computeCertificateFingerprint({
        ticketId: 'DSR-2026-8819',
        principalPhone: '+91 9988776655',
        informalRedactionsCount: 2,
        taxLockedCount: 1,
        timestamp
      });

      assert.strictEqual(typeof fp, 'string');
      assert.strictEqual(fp.length, 64, 'SHA-256 fingerprint must be 64 hex characters');

      // Recompute manually to verify determinism
      const expectedPayload = `DSR-2026-8819|+91 9988776655|2|1|${timestamp}`;
      const expectedHash = crypto.createHash('sha256').update(expectedPayload).digest('hex');
      assert.strictEqual(fp, expectedHash, 'Fingerprint must be mathematically exact');
    });

    // 8. Certificate Generator: HTML Document Generation & Persistence
    await runTest('Certificate Generator: Persist printable compliance certificate in data/certificates/', () => {
      const cert = generateErasureCertificate({
        ticketId: 'DSR-2026-8819',
        principalName: 'Deepa Nair',
        principalPhone: '+91 9988776655',
        informalRedactionsCount: 2,
        taxLockedCount: 1
      });

      assert.ok(cert.certificateId.startsWith('CERT-ERASURE-2026-'));
      assert.ok(fs.existsSync(cert.filePath), 'Certificate HTML file must exist on disk');
      
      const loadedHtml = getCertificateById(cert.certificateId);
      assert.ok(loadedHtml.includes('DPDP Compliance Proof Certificate'));
      assert.ok(loadedHtml.includes(cert.sha256Fingerprint));
      assert.ok(loadedHtml.includes('Deepa Nair'));
      assert.ok(loadedHtml.includes('CGST Act, 2017 Section 36'));
      assert.ok(loadedHtml.includes('DPDP Act Section 8(7)'));
    });

    // 9. Full End-to-End Engine: executeSmartErasure
    await runTest('Dual-Track Execution Engine: executeSmartErasure comprehensive flow', async () => {
      const result = await executeSmartErasure('DSR-2026-8819', '+91 9988776655', {
        tenantId: 'TENANT-AAROGYA-01',
        actor: 'Ramesh Kumar (DPO)'
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.ticketId, 'DSR-2026-8819');
      assert.ok(result.certificateId.startsWith('CERT-ERASURE-2026-'));
      assert.strictEqual(typeof result.certHash, 'string');
      assert.strictEqual(result.certHash.length, 64);
      assert.strictEqual(result.informalRedactions, 2);
      assert.strictEqual(result.taxLockedInvoices, 1);
      assert.ok(result.certUrl.includes(result.certificateId));

      // Verify SQLite ticket update
      const ticket = await models.getDsrByTicket('DSR-2026-8819');
      assert.strictEqual(ticket.status, 'COMPLETED');
      assert.ok(ticket.statutoryLockReason.includes('CGST Act Section 36'));
      assert.strictEqual(ticket.certHash, result.certHash);

      // Verify immutable audit log
      const latestAudit = await models.getLatestAuditLog('TENANT-AAROGYA-01');
      assert.strictEqual(latestAudit.action, 'EXECUTE_DUAL_TRACK_ERASURE');
      assert.strictEqual(latestAudit.actor, 'Ramesh Kumar (DPO)');
    });

  } finally {
    // Restore backup files so other test suites continue cleanly
    fs.writeFileSync(CHAT_FILE, chatBackup, 'utf8');
    fs.writeFileSync(LEADS_FILE, leadsBackup, 'utf8');
    fs.writeFileSync(INVOICES_FILE, invoicesBackup, 'utf8');
  }

  console.log('\n================================================================');
  console.log(`  Tests Completed: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('================================================================');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
