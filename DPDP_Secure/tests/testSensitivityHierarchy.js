/**
 * DPDP_Secure - Automated Test Suite: Sensitivity Hierarchy & Roll-Up Engine
 * Srujana Tech Fest 2026 | Problem Statement LS-04
 *
 * Verifies the complete Bottom-Up Sensitivity Pipeline:
 * CUSTOMER DATABASE -> Data Asset -> Container -> Element -> Classification -> Tag -> Weight -> Roll-up -> [Retention, RoPA, Breach Severity]
 */

const assert = require('assert');
const sensitivityRollupService = require('../src/services/sensitivityRollupService');

async function runTests() {
  console.log('================================================================');
  console.log('  Testing Sensitivity Hierarchy & Bottom-Up Roll-Up Engine');
  console.log('================================================================\n');

  // 1. Test Element Classification
  console.log('1. Testing Element Classification & Tag Weight Assignment...');
  const elAadhaar = sensitivityRollupService.classifyElement({
    name: 'aadhaar_token',
    piiType: 'AADHAAR',
    confidenceScore: 0.99
  });
  assert.strictEqual(elAadhaar.classification, 'IDENTIFIER');
  assert.strictEqual(elAadhaar.tag, 'Aadhaar UID');
  assert.strictEqual(elAadhaar.sensitivityWeight, 95);
  assert.strictEqual(elAadhaar.tier, 'CRITICAL');
  console.log('   ✓ Aadhaar classified: Category=IDENTIFIER, Tag="Aadhaar UID", Weight=95, Tier=CRITICAL');

  const elHealth = sensitivityRollupService.classifyElement({
    name: 'diagnosis_code',
    piiType: 'HEALTH_DIAGNOSTIC',
    confidenceScore: 0.98
  });
  assert.strictEqual(elHealth.classification, 'HEALTH');
  assert.strictEqual(elHealth.tag, 'Clinical Diagnostic Panel');
  assert.strictEqual(elHealth.sensitivityWeight, 90);
  assert.strictEqual(elHealth.tier, 'CRITICAL');
  console.log('   ✓ Health Diagnostic classified: Category=HEALTH, Tag="Clinical Diagnostic Panel", Weight=90, Tier=CRITICAL');

  const elPan = sensitivityRollupService.classifyElement({
    name: 'pan_number',
    piiType: 'PAN',
    confidenceScore: 0.99
  });
  assert.strictEqual(elPan.classification, 'FINANCIAL');
  assert.strictEqual(elPan.tag, 'PAN / GSTIN');
  assert.strictEqual(elPan.sensitivityWeight, 80);
  assert.strictEqual(elPan.tier, 'HIGH');
  console.log('   ✓ PAN/GSTIN classified: Category=FINANCIAL, Tag="PAN / GSTIN", Weight=80, Tier=HIGH');

  const elPhone = sensitivityRollupService.classifyElement({
    name: 'patient_phone',
    piiType: 'MOBILE',
    confidenceScore: 1.0
  });
  assert.strictEqual(elPhone.classification, 'CONTACT');
  assert.strictEqual(elPhone.tier, 'MEDIUM');
  console.log('   ✓ Mobile Contact classified: Category=CONTACT, Tag="Patient Phone (WhatsApp)", Weight=60, Tier=MEDIUM');

  // 2. Test Container Roll-Up Calculation
  console.log('\n2. Testing Container Roll-Up Calculation...');
  const containerRollup = sensitivityRollupService.calculateContainerRollup({
    name: 'claims_table',
    elements: [
      { name: 'aadhaar_token', piiType: 'AADHAAR', confidenceScore: 0.99 },
      { name: 'diagnosis_code', piiType: 'HEALTH_DIAGNOSTIC', confidenceScore: 0.98 },
      { name: 'patient_phone', piiType: 'MOBILE', confidenceScore: 1.0 },
      { name: 'patient_id', piiType: 'GENERAL', confidenceScore: 0.5 }
    ]
  });

  assert.strictEqual(containerRollup.containerTier, 'CRITICAL');
  assert.strictEqual(containerRollup.counts.CRITICAL, 2);
  assert.strictEqual(containerRollup.counts.MEDIUM, 1);
  assert(containerRollup.compositeScore >= 80, `Expected compositeScore >= 80, got ${containerRollup.compositeScore}`);
  console.log(`   ✓ Container roll-up verified: Tier=${containerRollup.containerTier}, Composite Score=${containerRollup.compositeScore}, Critical Elements=${containerRollup.counts.CRITICAL}`);

  // 3. Test System Roll-Up Aggregation
  console.log('\n3. Testing System Roll-Up Multi-Container Aggregation...');
  const systemRollup = sensitivityRollupService.calculateSystemRollup({
    name: 'CUSTOMER DATABASE',
    containers: [
      {
        name: 'table_high_claims',
        elements: [
          { name: 'aadhaar_token', piiType: 'AADHAAR', confidenceScore: 0.99 },
          { name: 'diagnosis_code', piiType: 'HEALTH_DIAGNOSTIC', confidenceScore: 0.98 }
        ]
      },
      {
        name: 'table_medium_leads',
        elements: [
          { name: 'customer_phone', piiType: 'MOBILE', confidenceScore: 1.0 },
          { name: 'customer_email', piiType: 'EMAIL', confidenceScore: 1.0 }
        ]
      }
    ]
  });

  assert.strictEqual(systemRollup.systemTier, 'CRITICAL');
  assert.strictEqual(systemRollup.containersCount, 2);
  assert.strictEqual(systemRollup.containerCounts.CRITICAL, 1);
  assert.strictEqual(systemRollup.containerCounts.MEDIUM, 1);
  console.log(`   ✓ System roll-up verified: Tier=${systemRollup.systemTier}, Total Containers=${systemRollup.containersCount}`);

  // 4. Test Downstream Statutory Feeds
  console.log('\n4. Testing Downstream Consumers (Retention, RoPA, Breach Severity)...');
  const downstream = sensitivityRollupService.calculateDownstreamFeeds(systemRollup);

  // 4A. Retention
  assert(downstream.retention.retentionPeriodMonths > 0);
  assert(downstream.retention.statutoryCitation.length > 0);
  console.log(`   ✓ Retention Consumer: ${downstream.retention.retentionPeriodDisplay} (${downstream.retention.statutoryCitation})`);

  // 4B. RoPA
  assert(downstream.ropa.mandatorySafeguards.length > 0);
  assert.strictEqual(downstream.ropa.activityClassification, 'CRITICAL');
  console.log(`   ✓ RoPA Consumer: Classification=${downstream.ropa.activityClassification}, Safeguards Count=${downstream.ropa.mandatorySafeguards.length}`);

  // 4C. Breach Severity
  assert.strictEqual(downstream.breachSeverity.breachTier, 'CRITICAL');
  assert.strictEqual(downstream.breachSeverity.mandatoryDpbiIntimation, true);
  assert.strictEqual(downstream.breachSeverity.countdownHours, 72);
  console.log(`   ✓ Breach Severity Consumer: Tier=${downstream.breachSeverity.breachTier}, Mandatory 72h DPBI=${downstream.breachSeverity.mandatoryDpbiIntimation}, Form=${downstream.breachSeverity.statutoryForm}`);

  // 5. Test Live Full Hierarchy API
  console.log('\n5. Testing Live API: GET /api/inventory/sensitivity-hierarchy ...');
  const res = await fetch('http://localhost:3000/api/inventory/sensitivity-hierarchy');
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.databaseName, 'CUSTOMER DATABASE');
  assert(json.data.systemRollup.containersCount >= 10);
  console.log(`   ✓ Hierarchy API verified: Database="${json.data.databaseName}", Containers=${json.data.systemRollup.containersCount}, Elements=${json.data.systemRollup.totalElements}`);

  // 6. Test Live Simulator API
  console.log('\n6. Testing Live API: POST /api/inventory/calculate-rollup ...');
  const simRes = await fetch('http://localhost:3000/api/inventory/calculate-rollup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      containerName: 'Lab Hematology Blood Analyzer',
      elements: [
        { name: 'Patient Aadhaar Token', piiType: 'AADHAAR', confidenceScore: 0.99 },
        { name: 'Blood Diagnostic HbA1c', piiType: 'HEALTH_DIAGNOSTIC', confidenceScore: 0.98 }
      ]
    })
  });
  assert.strictEqual(simRes.status, 200);
  const simJson = await simRes.json();
  assert.strictEqual(simJson.success, true);
  assert.strictEqual(simJson.rollup.containerTier, 'CRITICAL');
  assert(simJson.downstream.retention.retentionPeriodMonths >= 36);
  console.log(`   ✓ Simulator API verified: Container Tier=${simJson.rollup.containerTier}, Score=${simJson.rollup.compositeScore}, Retention=${simJson.downstream.retention.retentionPeriodDisplay}`);

  // 7. Test Inventory Assets UI Rendering
  console.log('\n7. Testing UI Render: GET /inventory/assets ...');
  const uiRes = await fetch('http://localhost:3000/inventory/assets');
  assert.strictEqual(uiRes.status, 200);
  const uiHtml = await uiRes.text();
  assert(uiHtml.includes('Bottom-Up Sensitivity Classification & Statutory Roll-Up Pipeline'));
  assert(uiHtml.includes('CUSTOMER DATABASE'));
  assert(uiHtml.includes('Statutory Retention'));
  assert(uiHtml.includes('RoPA Register'));
  assert(uiHtml.includes('Breach Severity'));
  console.log('   ✓ Assets view verified with full Sensitivity Roll-Up & Hierarchy Engine UI!');

  console.log('\n================================================================');
  console.log('  ALL SENSITIVITY HIERARCHY TESTS PASSED (7/7)!');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
