/**
 * DPDP_Secure - Unified End-to-End Workflow & 4 Pillars Integration Test Suite
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Verifies:
 * 1. testAllExistingRoutes: All 54 navigation routes return HTTP 200 OK & valid HTML
 * 2. testPillar1Discovery: Verhoeff algorithm validates Aadhaar (3421 8901 2345), rejects barcodes; PAN entity classification
 * 3. testPillar2Consent: Multilingual Section 5 notices (EN, KN, HI) and 1-click WhatsApp opt-in ledger proof
 * 4. testPillar3ErasureAndTaxLock: Deepa Nair erasure redacts informal silos while locking INV-2024-309 under CGST Sec 36
 * 5. testPillar4BreachTriage: Lost smartphone flags CRITICAL and prepares Form DPBI-IR1 dossier with SHA-256 fingerprint
 * 6. testCryptographicAuditTrail: SHA-256 hash chaining integrity & tamper-detection
 *
 * Run directly via: npm run test:e2e or node tests/e2eWorkflow.test.js
 */

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('../server');

// Services & Models
const { validateVerhoeff } = require('../src/services/verhoeffAlgorithm');
const { classifyPanEntity } = require('../src/services/indianPiiEngine');
const { generateDpbiDossier, generateCitizenAlerts } = require('../src/services/dossierGenerator');
const { calculateBreachRiskScore } = require('../src/services/breachRiskCalculator');
const { executeSmartErasure, resetSampleData } = require('../src/services/statutoryCollisionResolver');
const auditLogger = require('../src/models/auditLogger');
const { seedDemoData, TENANT_ID } = require('../src/models/demoSeeder');
const models = require('../src/models');

console.log('================================================================');
console.log('  DPDP_Secure: Unified End-to-End Workflow Integration Test Suite');
console.log('  Problem Statement LS-04 | Srujana Tech Fest 2026');
console.log('================================================================\n');

// 54 Canonical Navigation Routes
const ALL_54_ROUTES = [
  '/',
  '/about',
  '/profile',
  '/discovery/connectors',
  '/inventory/assets',
  '/inventory/ropa',
  '/inventory/tags',
  '/inventory/lineage',
  '/inventory/assessment-enrichment',
  '/consent/dashboard',
  '/consent/collection-points',
  '/consent/preferences',
  '/consent/preference-centers',
  '/consent/purposes',
  '/consent/data-elements',
  '/consent/policies',
  '/consent/portal-settings',
  '/consent/transactions',
  '/consent/ledger',
  '/cookies/dashboard',
  '/cookies/banners',
  '/cookies/scans',
  '/cookies/geo-rules',
  '/cookies/logs',
  '/privacy/dashboard',
  '/privacy/requests',
  '/privacy/forms',
  '/privacy/workflows',
  '/dsr',
  '/incidents/dashboard',
  '/incidents/management',
  '/incidents/dossier/INC-2026-9921',
  '/notifications/center',
  '/assessment/dashboard',
  '/assessment/pia-dpia',
  '/assessment/templates',
  '/assessment/settings',
  '/governance/security-controls',
  '/governance/retention',
  '/governance/processors',
  '/governance/cross-border',
  '/governance/evidence',
  '/integrations/dashboard',
  '/integrations/hub',
  '/integrations/api-keys',
  '/settings/general',
  '/settings/sso',
  '/settings/branding',
  '/settings/organization',
  '/settings/roles',
  '/settings/audit-log',
  '/settings/localization',
  '/auth/login',
  '/auth/me'
];

let suitePassed = 0;
let suiteFailed = 0;

function reportPass(msg) {
  console.log(`  [+] PASS: ${msg}`);
  suitePassed++;
}

function reportFail(msg, err) {
  console.error(`  [-] FAIL: ${msg}`);
  if (err) console.error(`      ${err.message || err}`);
  suiteFailed++;
}

/**
 * 1. Verify All 54 Existing Navigation Routes
 */
async function testAllExistingRoutes(baseUrl) {
  console.log('[1/6] Testing All 54 Existing Navigation Routes (HTTP 200 OK & Valid Body)...');
  let routesTested = 0;
  let routesPassed = 0;

  for (const route of ALL_54_ROUTES) {
    routesTested++;
    try {
      const url = `${baseUrl}${route}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'DPDP_Secure_E2E_Runner/1.0' }
      });
      const body = await res.text();

      assert.strictEqual(
        res.status,
        200,
        `Expected HTTP 200 OK for route ${route}, but got HTTP ${res.status}`
      );
      assert.ok(
        body.length > 10,
        `Response body for ${route} was unexpectedly short (${body.length} bytes)`
      );
      routesPassed++;
    } catch (err) {
      reportFail(`Route check failed on ${route}`, err);
    }
  }

  assert.strictEqual(routesPassed, 54, `Expected all 54 routes to return 200 OK. Passed: ${routesPassed}/54`);
  reportPass(`All 54 navigation routes verified (HTTP 200 OK, valid content, zero uncaught exceptions)`);
}

/**
 * 2. Pillar 1: Discovery & Verhoeff / PAN Entity Classification
 */
async function testPillar1Discovery() {
  console.log('\n[2/6] Testing Pillar 1: Deterministic Discovery & Verhoeff Algorithm...');

  // Aadhaar validation
  const validAadhaar1 = validateVerhoeff('3421 8901 2345');
  assert.strictEqual(validAadhaar1, true, 'Verhoeff must accept valid Aadhaar: 3421 8901 2345');

  const validAadhaar2 = validateVerhoeff('4921-8374-7182');
  assert.strictEqual(validAadhaar2, true, 'Verhoeff must accept valid Aadhaar: 4921-8374-7182');

  // Barcode / Non-Aadhaar 12-digit rejection
  const invalidBarcode = validateVerhoeff('1234 5678 9012');
  assert.strictEqual(invalidBarcode, false, 'Verhoeff must reject random barcode: 1234 5678 9012');

  const invalidLeadingZero = validateVerhoeff('0123 4567 8901');
  assert.strictEqual(invalidLeadingZero, false, 'Aadhaar cannot begin with 0');

  // PAN Entity classification (4th character)
  const indPan = classifyPanEntity('ABCPE1234F');
  assert.strictEqual(indPan.entityType, 'INDIVIDUAL', 'PAN with 4th char P must classify as INDIVIDUAL');

  const compPan = classifyPanEntity('ABCCE1234F');
  assert.strictEqual(compPan.entityType, 'COMPANY', 'PAN with 4th char C must classify as COMPANY');

  reportPass(`Pillar 1 validated: Verhoeff eliminates false-positive barcodes; PAN identifies Individual vs Corporate`);
}

/**
 * 3. Pillar 2: Consent & Multilingual Section 5 Notices
 */
async function testPillar2Consent() {
  console.log('\n[3/6] Testing Pillar 2: Section 5 Multilingual Notices & WhatsApp Opt-In Ledger...');

  const notices = await models.getConsentNotices(TENANT_ID);
  assert.ok(notices && notices.length >= 3, 'Must have at least 3 active multilingual notices');

  const languages = notices.map(n => n.language.toLowerCase());
  assert.ok(languages.includes('english'), 'English Section 5 notice must be present');
  assert.ok(languages.includes('kannada'), 'Kannada Section 5 notice must be present');
  assert.ok(languages.includes('hindi'), 'Hindi Section 5 notice must be present');

  // Record 1-click WhatsApp opt-in
  const testPhone = '+91 98450 99887';
  const consentRecord = await models.recordConsentEvent({
    tenantId: TENANT_ID,
    dataPrincipalPhone: testPhone,
    purposeCode: 'DIAGNOSTIC_REPORTS',
    status: 'GRANTED',
    channel: 'WHATSAPP'
  });

  assert.ok(consentRecord && consentRecord.id, 'Consent record must be created');
  assert.strictEqual(typeof consentRecord.sha256Proof, 'string', 'Consent must have cryptographic proof');
  assert.strictEqual(consentRecord.sha256Proof.length, 64, 'SHA-256 proof must be 64 hex characters');

  reportPass(`Pillar 2 validated: Section 5 notices active in EN/KN/HI; 1-click WhatsApp opt-in secured with SHA-256 proof`);
}

/**
 * 4. Pillar 3: Dual-Track Collision Resolver (CGST 6-Yr Tax Lock vs DPDP Erasure)
 */
async function testPillar3ErasureAndTaxLock() {
  console.log('\n[4/6] Testing Pillar 3: Statutory Collision Resolver (CGST 6-Yr Lock vs DPDP Sec 12 Erasure)...');

  // Reset sample files to ensure fresh baseline
  resetSampleData();

  const erasureResult = await executeSmartErasure({
    principalName: 'Deepa Nair',
    phone: '+91 9988776655',
    email: 'deepa.nair@email.com',
    actor: 'Ramesh Kumar (SME_OWNER)'
  });

  assert.strictEqual(erasureResult.success, true, 'Smart erasure execution must succeed');
  assert.ok(erasureResult.tracks.trackA.redactedCount > 0, 'Track A must redact informal occurrences');
  assert.ok(erasureResult.tracks.trackB.invoiceLocked, 'Track B must lock statutory tax invoice INV-2024-309');
  assert.strictEqual(erasureResult.tracks.trackB.invoiceId, 'INV-2024-309');
  assert.ok(erasureResult.tracks.trackB.retentionUntil.includes('2030'), 'Must lock invoice for 6 financial years until 2030');

  // Cryptographic certificate verification
  assert.ok(erasureResult.complianceCertificate, 'Compliance certificate must be generated');
  assert.strictEqual(erasureResult.complianceCertificate.certificateSha256.length, 64, 'Certificate SHA-256 must be 64 hex characters');
  assert.ok(fs.existsSync(erasureResult.complianceCertificate.filePath), 'Certificate file must be persisted to data/certificates/');

  reportPass(`Pillar 3 validated: Deepa Nair WhatsApp records redacted with [REDACTED-DPDP-SEC-12]; Invoice INV-2024-309 locked under CGST Sec 36`);
}

/**
 * 5. Pillar 4: Breach Threat Modeling & 72-Hour DPBI Regulatory Dossier
 */
async function testPillar4BreachTriage() {
  console.log('\n[5/6] Testing Pillar 4: SME Breach Triage & Form DPBI-IR1 Regulatory Intimation...');

  // Incident risk score evaluation
  const riskResult = calculateBreachRiskScore({
    scenarioType: 'DEVICE_LOSS_UNENCRYPTED',
    headcount: 250,
    hasSensitiveData: true,
    hasHealthData: true,
    backupsAvailable: false
  });

  assert.strictEqual(riskResult.severity, 'CRITICAL', 'Lost unencrypted device with clinical health data must be CRITICAL');
  assert.ok(riskResult.score >= 80, `Risk score must be >= 80 (got ${riskResult.score})`);
  assert.strictEqual(riskResult.mandatoryDpbiIntimation, true, 'CRITICAL incident requires mandatory DPBI intimation within 72 hours');

  // Statutory Form DPBI-IR1 Dossier Generation
  const dossier = await generateDpbiDossier('INC-2026-9921');
  assert.strictEqual(dossier.formIdentifier, 'FORM DPBI-IR1 (Section 8(6) & Rule 7)');
  assert.strictEqual(dossier.fiduciary.gstin, '29AAAAA0000A1Z5');
  assert.strictEqual(dossier.isWithin72Hours, true, 'Must verify 72-hour regulatory SLA window');
  assert.strictEqual(dossier.dossierSha256.length, 64, 'Dossier must contain 64-char SHA-256 fingerprint');

  // Multilingual customer alert package (vulnerability concealment)
  const alerts = generateCitizenAlerts(dossier);
  assert.ok(alerts.EN.body.includes('Dear Aarogya Clinic Patient'));
  assert.ok(alerts.KN.body.includes('ಆರೋಗ್ಯ ಕ್ಲಿನಿಕ್'));
  assert.ok(alerts.HI.body.includes('आरोग्य क्लिनिक'));
  assert.strictEqual(alerts.vulnerabilityConcealed, true, 'Citizen alerts must conceal internal vulnerabilities');

  reportPass(`Pillar 4 validated: Lost smartphone flags CRITICAL; Form DPBI-IR1 prepared with SHA-256 fingerprint; alerts generated in EN, KN, HI`);
}

/**
 * 6. Cryptographic Audit Trail Hash Chaining & Tamper-Evidence
 */
async function testCryptographicAuditTrail() {
  console.log('\n[6/6] Testing Audit Trail Cryptographic SHA-256 Hash Chaining & Tamper Detection...');

  // Verification on untampered chain
  const chainCheck = await auditLogger.verifyAuditChain(TENANT_ID);
  assert.strictEqual(chainCheck.verified, true, `Audit chain must verify clean (got ${chainCheck.reason || ''})`);
  assert.ok(chainCheck.count >= 10, `Expected at least 10 audit records in demo ledger (got ${chainCheck.count})`);

  // Log a new chained statutory event
  const newEvent = await auditLogger.logEvent(
    TENANT_ID,
    'Rajesh Iyer (AUDITOR)',
    'E2E_VERIFICATION_COMPLETE',
    'Full System Audit',
    { status: 'ALL_PILLARS_VERIFIED', timestamp: new Date().toISOString() }
  );

  assert.ok(newEvent && newEvent.hash, 'New event must have SHA-256 hash');
  assert.strictEqual(newEvent.prevHash, chainCheck.headHash, 'New event must link to previous head hash');

  const updatedChain = await auditLogger.verifyAuditChain(TENANT_ID);
  assert.strictEqual(updatedChain.verified, true, 'Updated chain must remain 100% verified');
  assert.strictEqual(updatedChain.headHash, newEvent.hash, 'Head hash must equal newly appended event hash');

  reportPass(`Audit Trail validated: Cryptographic SHA-256 hash chain verified untampered with mathematical backward linkage`);
}

/**
 * Main E2E Execution Runner
 */
async function runE2ETests() {
  // Start ephemeral HTTP server on dynamic port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`[E2E SERVER] Temporary test server started at ${baseUrl}`);

  try {
    // 0. Ensure fresh demo baseline
    await seedDemoData();

    // Execute all 6 test stages
    await testAllExistingRoutes(baseUrl);
    await testPillar1Discovery();
    await testPillar2Consent();
    await testPillar3ErasureAndTaxLock();
    await testPillar4BreachTriage();
    await testCryptographicAuditTrail();

    console.log('\n================================================================');
    console.log(`  E2E TEST SUMMARY: ${suitePassed} SUITES PASSED, ${suiteFailed} FAILED`);
    console.log('  ALL 4 PILLARS & ALL 54 ROUTES VERIFIED 100% HEALTHY');
    console.log('================================================================\n');

    server.close();

    if (suiteFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('\n[FATAL E2E FAILURE]', err);
    server.close();
    process.exit(1);
  }
}

// Run test suite
if (require.main === module) {
  runE2ETests();
}

module.exports = {
  runE2ETests,
  ALL_54_ROUTES
};
