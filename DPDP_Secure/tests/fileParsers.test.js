/**
 * DPDP_Secure - Unit & Integration Tests for Informal Silo File Parsers & Discovery Controller
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Run directly via: node tests/fileParsers.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const {
  sanitizeCsvCell,
  sanitizeFilename,
  parseWhatsAppChat,
  parseCsvOrExcel,
  scanPreloadedSamples
} = require('../src/services/fileParsers');
const models = require('../src/models');
const { resetSampleData } = require('../src/services/statutoryCollisionResolver');

console.log('================================================================');
console.log('  DPDP_Secure - Pillar 1: File Parsers & Discovery Test Suite');
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
  resetSampleData();
  // 1. Cybersecurity: Formula Injection Neutralization
  await runTest('Formula Injection Defense: Neutralize Dangerous Spreadsheet Cells', () => {
    assert.strictEqual(sanitizeCsvCell('=cmd|\' /C calc\'!A0'), '\'=cmd|\' /C calc\'!A0');
    assert.strictEqual(sanitizeCsvCell('+12345'), '\'+12345');
    assert.strictEqual(sanitizeCsvCell('-SUM(A1:A10)'), '\'-SUM(A1:A10)');
    assert.strictEqual(sanitizeCsvCell('@SUM(B1:B5)'), '\'@SUM(B1:B5)');
    assert.strictEqual(sanitizeCsvCell('Normal Text Ramesh'), 'Normal Text Ramesh');
    assert.strictEqual(sanitizeCsvCell(''), '');
  });

  // 2. Cybersecurity: Path Traversal Sanitization
  await runTest('Path Traversal Defense: Sanitize Filenames', () => {
    assert.strictEqual(sanitizeFilename('../../etc/passwd'), 'passwd');
    assert.strictEqual(sanitizeFilename('..\\..\\windows\\system32\\cmd.exe'), 'cmd.exe');
    assert.strictEqual(sanitizeFilename('clinic chat 2026!@#.txt'), 'clinic_chat_2026___.txt');
  });

  // 3. WhatsApp Chat Parser (Android and iOS format)
  await runTest('WhatsApp Parser: Extract Messages, Verhoeff Aadhaar, PAN, UPI & Health', () => {
    const sampleChatPath = path.join(__dirname, '../data/sample_data/clinic_reception_chat.txt');
    const content = fs.readFileSync(sampleChatPath, 'utf8');

    const result = parseWhatsAppChat(content, 'clinic_reception_chat.txt');
    assert.strictEqual(result.type, 'WHATSAPP_CHAT');
    assert.ok(result.messages.length >= 10, `Expected >= 10 messages, got ${result.messages.length}`);

    // Verify Ramesh Sharma's Aadhaar
    const aadhaarFinding = result.findings.find((f) => f.type === 'AADHAAR');
    assert.ok(aadhaarFinding, 'Must extract Aadhaar finding');
    assert.strictEqual(aadhaarFinding.rawValue, '3421 8901 2345');
    assert.strictEqual(aadhaarFinding.maskedValue, 'XXXX-XXXX-2345');
    assert.strictEqual(aadhaarFinding.confidenceScore, 1.0);

    // Verify Priya Patel's PAN
    const panFinding = result.findings.find((f) => f.type && f.type.includes('PAN'));
    assert.ok(panFinding, 'Must extract PAN finding');
    assert.strictEqual(panFinding.rawValue, 'ABCDE1234F');
    assert.strictEqual(panFinding.type, 'INDIVIDUAL_PAN');
    assert.strictEqual(panFinding.maskedValue, 'XXXXX1234F');

    // Verify UPI handle
    const upiFinding = result.findings.find((f) => f.type === 'UPI');
    assert.ok(upiFinding, 'Must extract UPI finding');
    assert.ok(upiFinding.maskedValue.includes('***@'), 'UPI must be masked');

    // Verify Health findings
    const healthFindings = result.findings.filter((f) => f.type === 'HEALTH');
    assert.ok(healthFindings.length >= 2, 'Must extract clinical health findings');
  });

  // 4. Multiline WhatsApp Messages
  await runTest('WhatsApp Parser: Handle Multiline Chat Messages Safely', () => {
    const multilineChat = `
[10/10/24, 10:15:22 AM] Ramesh Sharma: Here is my report
and additional clinical notes
Fasting Blood Sugar was high.
[10/10/24, 10:16:00 AM] Aarogya Clinic: Noted sir.
    `;
    const res = parseWhatsAppChat(multilineChat);
    assert.strictEqual(res.messages.length, 2);
    assert.ok(res.messages[0].message.includes('additional clinical notes'));
    assert.ok(res.messages[0].message.includes('Fasting Blood Sugar'));
  });

  // 5. CSV Spreadsheet Parser
  await runTest('CSV Parser: Extract Rows, Neutralize Formulas, and Detect Leads PII', () => {
    const leadsPath = path.join(__dirname, '../data/sample_data/customer_leads.csv');
    const content = fs.readFileSync(leadsPath, 'utf8');

    const result = parseCsvOrExcel(content, 'customer_leads.csv');
    assert.strictEqual(result.type, 'SPREADSHEET_CSV');
    assert.ok(result.rows.length >= 5, `Expected >= 5 rows, got ${result.rows.length}`);
    assert.ok(result.findings.length >= 5, `Expected >= 5 PII findings, got ${result.findings.length}`);

    // Verify Deepa Nair lead row
    const deepaRow = result.rows.find((r) => r.Customer_Name === 'Deepa Nair');
    assert.ok(deepaRow, 'Deepa Nair lead record must be present');
    assert.strictEqual(deepaRow.Phone_Number, '9988776655');
  });

  // 6. Preloaded Sample Data Scanner & SQLite Persistence
  await runTest('Sample Preloader: Scan 3 Pre-Staged Silos and Persist to SQLite', async () => {
    const tenantId = 'TENANT-AAROGYA-01';
    const scanResult = await scanPreloadedSamples(tenantId);

    assert.strictEqual(scanResult.success, true);
    assert.strictEqual(scanResult.totalFilesScanned, 3);
    assert.strictEqual(scanResult.totalPiiCount, 1420);
    assert.strictEqual(scanResult.silos.length, 3);

    // Verify database reflection
    const silosInDb = await models.getSilos(tenantId);
    assert(silosInDb.length >= 3, `Expected at least 3 silos, got ${silosInDb.length}`);

    const findingsInDb = await models.getAllFindings(tenantId);
    assert.ok(findingsInDb.length >= 5, `Expected findings in DB, got ${findingsInDb.length}`);

    // Verify dashboard metrics aggregation
    const metrics = await models.getDashboardMetrics(tenantId);
    assert(metrics.silosCount >= 3, `Expected at least 3 silos, got ${metrics.silosCount}`);
    assert(metrics.piiCount >= 1420, `Expected at least 1420 PII count, got ${metrics.piiCount}`);
  });

  // Summary
  console.log('\n================================================================');
  console.log(`  Tests Passed: ${testsPassed}`);
  console.log(`  Tests Failed: ${testsFailed}`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    console.error('[-] TEST SUITE FAILED: Some assertions did not pass.\n');
    process.exit(1);
  } else {
    console.log('[+] ALL PROMPT 06 TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  }
}

main();
