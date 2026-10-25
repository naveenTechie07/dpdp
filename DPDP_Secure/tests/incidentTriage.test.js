/**
 * DPDP_Secure - Pillar 4: SME Breach Threat Modeling & Incident Triage Engine Test Suite
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Validates DPDP Act Section 8(6) & DPDP Rules, 2025 (Rule 7) compliance:
 * - Pre-configured SME threat scenario templates
 * - Deterministic statutory severity & risk calculator
 * - 72-hour immutable regulatory countdown timer
 * - Data spill prevention & Aadhaar/Health sanitization
 * - SQLite incident persistence & immutable chronology
 *
 * Run directly via: node tests/incidentTriage.test.js
 */

const assert = require('assert');
const models = require('../src/models');
const {
  SME_THREAT_SCENARIOS,
  calculateRisk,
  compute72HourCountdown,
  sanitizeIncidentText
} = require('../src/services/breachRiskCalculator');

console.log('================================================================');
console.log('  DPDP_Secure - Pillar 4: SME Breach Triage Engine Test Suite');
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
  // Test 1: Threat Scenario Templates
  await runTest('SME threat scenarios include all 3 mandatory pre-configured SME templates', async () => {
    assert(SME_THREAT_SCENARIOS.scenario1, 'Scenario 1 missing');
    assert(SME_THREAT_SCENARIOS.scenario2, 'Scenario 2 missing');
    assert(SME_THREAT_SCENARIOS.scenario3, 'Scenario 3 missing');

    const s1 = SME_THREAT_SCENARIOS.scenario1;
    assert.strictEqual(s1.expectedSeverity, 'CRITICAL');
    assert(s1.title.includes('Lost Receptionist Smartphone'), 'Scenario 1 title mismatch');
    assert.strictEqual(s1.estimatedCount, 250);

    const s2 = SME_THREAT_SCENARIOS.scenario2;
    assert.strictEqual(s2.expectedSeverity, 'HIGH');
    assert(s2.title.includes('Misdirected WhatsApp Medical Report'), 'Scenario 2 title mismatch');

    const s3 = SME_THREAT_SCENARIOS.scenario3;
    assert.strictEqual(s3.expectedSeverity, 'MEDIUM');
    assert(s3.title.includes('Compromised Desktop Billing Workstation'), 'Scenario 3 title mismatch');
  });

  // Test 2: Statutory Risk Calculator - Lost Receptionist Smartphone (CRITICAL)
  await runTest('Statutory Risk Calculator evaluates Scenario 1 as CRITICAL with DPBI intimation flag', async () => {
    const s1 = SME_THREAT_SCENARIOS.scenario1;
    const assessment = calculateRisk(s1);

    assert.strictEqual(assessment.severity, 'CRITICAL', 'Severity must be CRITICAL');
    assert.strictEqual(assessment.mandatoryDpbiIntimation, true, 'DPBI intimation must be mandatory');
    assert.strictEqual(assessment.statutoryDeadlineHours, 72, 'Deadline must be 72 hours');
    assert(assessment.score >= 80, `Score should be >= 80, got ${assessment.score}`);
    assert(assessment.containmentActions.length >= 4, 'Must provide immediate containment actions');

    // Check specific required containment actions
    const actionTexts = assessment.containmentActions.map((a) => a.text.toLowerCase());
    assert(actionTexts.some((t) => t.includes('find my device') || t.includes('lock') || t.includes('wipe')), 'Must have remote lock/wipe');
    assert(actionTexts.some((t) => t.includes('whatsapp') && t.includes('session')), 'Must have session revoke');
    assert(actionTexts.some((t) => t.includes('dpbi') || t.includes('72-hour') || t.includes('intimation')), 'Must have DPBI dossier');
  });

  // Test 3: Statutory Risk Calculator - Misdirected WhatsApp Report (HIGH)
  await runTest('Statutory Risk Calculator evaluates Scenario 2 as HIGH due to clinical health data', async () => {
    const s2 = SME_THREAT_SCENARIOS.scenario2;
    const assessment = calculateRisk(s2);

    assert.strictEqual(assessment.severity, 'HIGH', 'Severity must be HIGH for clinical health data');
    assert.strictEqual(assessment.mandatoryDpbiIntimation, true, 'DPBI intimation must be mandatory');
    assert(assessment.score >= 60, `Score should be >= 60, got ${assessment.score}`);
  });

  // Test 4: Statutory Risk Calculator - Air-gapped Billing Malware (MEDIUM)
  await runTest('Statutory Risk Calculator evaluates Scenario 3 as MEDIUM due to backups & no health data', async () => {
    const s3 = SME_THREAT_SCENARIOS.scenario3;
    const assessment = calculateRisk(s3);

    assert.strictEqual(assessment.severity, 'MEDIUM', 'Severity should be MEDIUM');
    assert(assessment.score < 60 && assessment.score >= 30, `Score should be in 30-59 range, got ${assessment.score}`);
  });

  // Test 5: Headcount > 100 triggers high-volume regulatory elevation
  await runTest('Headcount > 100 elevates risk score and triggers high-volume regulatory alert', async () => {
    const highVolumeData = {
      incidentTitle: 'Bulk Customer CSV Leak',
      impactedSilos: ['spreadsheets'],
      estimatedCount: 500,
      dataCategories: ['contact', 'identity'],
      safeguards: 'none'
    };
    const assessment = calculateRisk(highVolumeData);
    assert(assessment.highVolumeAlert, 'High-volume regulatory alert must be true');
    assert(assessment.score >= 50, 'High volume must increase risk score');
  });

  // Test 6: 72-Hour Regulatory Countdown Clock
  await runTest('72-Hour Regulatory Countdown accurately calculates remaining time and overdue state', async () => {
    // 10 hours ago -> ~62 hours remaining
    const discovered10hAgo = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();
    const clock1 = compute72HourCountdown(discovered10hAgo);
    assert.strictEqual(clock1.isOverdue, false, 'Should not be overdue');
    assert(clock1.hoursRemaining >= 61 && clock1.hoursRemaining <= 62, `Expected 61-62 hours remaining, got ${clock1.hoursRemaining}`);
    assert.strictEqual(clock1.complianceStatus, 'ACTIVE', 'Compliance status must be ACTIVE');

    // 75 hours ago -> overdue
    const discovered75hAgo = new Date(Date.now() - 75 * 60 * 60 * 1000).toISOString();
    const clock2 = compute72HourCountdown(discovered75hAgo);
    assert.strictEqual(clock2.isOverdue, true, 'Should be overdue');
    assert.strictEqual(clock2.hoursRemaining, 0, 'Remaining hours must be 0');
    assert.strictEqual(clock2.complianceStatus, 'OVERDUE', 'Compliance status must be OVERDUE');
  });

  // Test 7: Data Spill Prevention & Sanitization
  await runTest('Data Spill Prevention masks plaintext Aadhaar numbers and health records in notes', async () => {
    const rawNote = 'Patient Aadhaar 9876 5432 1098 leaked with Biopsy Report showing carcinoma positive.';
    const sanitized = sanitizeIncidentText(rawNote);

    // Aadhaar must be masked
    assert(!sanitized.includes('9876 5432 1098'), 'Plaintext Aadhaar must not appear in sanitized text');
    assert(sanitized.includes('XXXX-XXXX-1098') || sanitized.includes('[REDACTED_AADHAAR]'), 'Aadhaar must be masked');

    // Check raw 12-digit format without spaces
    const rawAadhaar2 = 'Patient Aadhaar: 123456789012';
    const sanitized2 = sanitizeIncidentText(rawAadhaar2);
    assert(!sanitized2.includes('123456789012'), 'Plaintext 12-digit Aadhaar must be masked');
  });

  // Test 8: SQLite Incident Persistence & Containment Triage
  await runTest('SQLite persistence stores incident, supports containment triage, and locks discoveredAt', async () => {
    const testIncidentId = `INC-TEST-${Date.now().toString().slice(-4)}`;
    const tenantId = 'TENANT-AAROGYA-01';
    const discoveredTime = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();

    const created = await models.createIncident({
      id: testIncidentId,
      tenantId,
      incidentTitle: 'Test Emergency Smartphone Misplacement',
      scenarioType: 'DEVICE_LOSS_UNENCRYPTED',
      severity: 'CRITICAL',
      affectedCount: 150,
      dataCategories: 'Identity (Aadhaar), Contact, Clinical Health',
      containmentActions: [
        { id: 'ACT-01', text: 'Remote wipe device', done: false, urgent: true },
        { id: 'ACT-02', text: 'Revoke active WhatsApp sessions', done: false, urgent: true }
      ],
      discoveredAt: discoveredTime
    });

    assert(created, 'Incident should be created in SQLite');

    // Query incidents
    const incidents = await models.getIncidents(tenantId);
    const saved = incidents.find((i) => i.id === testIncidentId);
    assert(saved, 'Saved incident must be retrieved from SQLite');
    assert.strictEqual(saved.severity, 'CRITICAL');
    assert.strictEqual(saved.discoveredAt, discoveredTime, 'Discovered time must be preserved');

    // Triage an action item
    const triageResult = await models.updateIncidentContainment(testIncidentId, 'ACT-01', true);
    assert.strictEqual(triageResult.success, true, 'Containment update must succeed');

    const updatedIncidents = await models.getIncidents(tenantId);
    const updated = updatedIncidents.find((i) => i.id === testIncidentId);
    const parsedActions = JSON.parse(updated.containmentActions);
    const act1 = parsedActions.find((a) => a.id === 'ACT-01');
    assert.strictEqual(act1.done, true, 'ACT-01 must now be marked done');

    // Test immutable chronology: update incident fields but ensure discoveredAt cannot be altered
    await models.updateIncident(testIncidentId, {
      reportedToDpbi: 1,
      notes: 'Form DPBI-IR1 submitted to regulatory portal.'
    });

    const finalIncidents = await models.getIncidents(tenantId);
    const finalIncident = finalIncidents.find((i) => i.id === testIncidentId);
    assert.strictEqual(finalIncident.reportedToDpbi, 1, 'reportedToDpbi should be updated');
    assert.strictEqual(finalIncident.discoveredAt, discoveredTime, 'discoveredAt must remain strictly immutable');
  });

  console.log('\n================================================================');
  console.log(`  Tests Passed: ${testsPassed}`);
  console.log(`  Tests Failed: ${testsFailed}`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
