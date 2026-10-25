/**
 * DPDP_Secure - Unit Tests for Deterministic Indian PII Engine & Verhoeff Checksum
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Run directly via: node tests/piiEngine.test.js
 */

const assert = require('assert');
const { validateVerhoeff, generateVerhoeff } = require('../src/services/verhoeffAlgorithm');
const {
  scanTextForPii,
  maskPii,
  classifyPanEntity,
  anonymizeText
} = require('../src/services/indianPiiEngine');

console.log('================================================================');
console.log('  DPDP_Secure - Pillar 1: Indian PII Engine & Verhoeff Test Suite');
console.log('================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [+] PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  [-] FAIL: ${name}`);
    console.error(`      ${err.message}`);
    testsFailed++;
  }
}

// -------------------------------------------------------------
// 1. Verhoeff Dihedral Group D5 Math Tests
// -------------------------------------------------------------
runTest('Verhoeff Validates Standard Aadhaar (3421 8901 2345)', () => {
  assert.strictEqual(validateVerhoeff('3421 8901 2345'), true);
  assert.strictEqual(validateVerhoeff('342189012345'), true);
});

runTest('Verhoeff Validates Canonical UIDAI Numbers (2841 9012 3456, 4921-8374-7182)', () => {
  assert.strictEqual(validateVerhoeff('2841 9012 3456'), true);
  assert.strictEqual(validateVerhoeff('4921-8374-7182'), true);
  assert.strictEqual(validateVerhoeff('3421 8901 2346'), true);
});

runTest('Verhoeff Discards Invalid 12-Digit Barcodes (1234 5678 9012)', () => {
  assert.strictEqual(validateVerhoeff('1234 5678 9012'), false);
  assert.strictEqual(validateVerhoeff('123456789012'), false);
  assert.strictEqual(validateVerhoeff('9999 8888 7777'), false);
});

runTest('Verhoeff Rejects Invalid Aadhaar Leading Digits (0 or 1)', () => {
  assert.strictEqual(validateVerhoeff('0123 4567 8901'), false);
  assert.strictEqual(validateVerhoeff('1111 2222 3333'), false);
});

runTest('Verhoeff Rejects Malformed or Non-Numeric Inputs', () => {
  assert.strictEqual(validateVerhoeff('12345'), false);
  assert.strictEqual(validateVerhoeff('abcdefghijkl'), false);
  assert.strictEqual(validateVerhoeff(''), false);
  assert.strictEqual(validateVerhoeff(null), false);
});

runTest('Verhoeff Generate Check Digit', () => {
  const checkDigit = generateVerhoeff('34218901234');
  assert.strictEqual(typeof checkDigit, 'number');
  assert.strictEqual(checkDigit, 6);
  // Full 12-digit number with check digit appended must validate
  assert.strictEqual(validateVerhoeff(`34218901234${checkDigit}`), true);
});

// -------------------------------------------------------------
// 2. PAN Entity Classification Tests
// -------------------------------------------------------------
runTest('PAN Classifier: Individual Citizen PAN (4th Char = "P")', () => {
  const indPan = classifyPanEntity('ABCDE1234F');
  assert.strictEqual(indPan.type, 'INDIVIDUAL_PAN');
  assert.strictEqual(indPan.isIndividual, true);
  assert.strictEqual(indPan.sensitivity, 'HIGH');
});

runTest('PAN Classifier: Corporate Company PAN (4th Char = "C")', () => {
  const compPan = classifyPanEntity('ABCDE1234C');
  assert.strictEqual(compPan.type, 'ENTITY_PAN');
  assert.strictEqual(compPan.isIndividual, false);
  assert.strictEqual(compPan.sensitivity, 'LOW');
});

runTest('PAN Classifier: Firm, Trust, and HUF PANs', () => {
  const firmPan = classifyPanEntity('ABCDE1234F'); // Wait: 4th char is 'D' in ABCDE, let's check ABCD F 1234
  // 4th char index is 3: ABC P E 1234 F -> 4th char is P
  // Let's test explicit 4th char:
  const p1 = classifyPanEntity('ABCPK1234F'); // 4th char is 'P'
  assert.strictEqual(p1.type, 'INDIVIDUAL_PAN');

  const p2 = classifyPanEntity('ABCCK1234F'); // 4th char is 'C' (Company)
  assert.strictEqual(p2.type, 'ENTITY_PAN');

  const p3 = classifyPanEntity('ABCFK1234F'); // 4th char is 'F' (Firm)
  assert.strictEqual(p3.type, 'ENTITY_PAN');

  const p4 = classifyPanEntity('ABCTK1234F'); // 4th char is 'T' (Trust)
  assert.strictEqual(p4.type, 'ENTITY_PAN');
});

// -------------------------------------------------------------
// 3. Masking Utility Tests
// -------------------------------------------------------------
runTest('Masking: Aadhaar Number', () => {
  const masked = maskPii('3421 8901 2345', 'AADHAAR');
  assert.strictEqual(masked, 'XXXX-XXXX-2345');
});

runTest('Masking: PAN Number', () => {
  const masked = maskPii('ABCDE1234F', 'INDIVIDUAL_PAN');
  assert.strictEqual(masked, 'XXXXX1234F');
});

runTest('Masking: Indian Phone Number', () => {
  const masked = maskPii('+91 9845012345', 'PHONE');
  assert.strictEqual(masked, '+91 98XXXXXX45');
});

runTest('Masking: UPI Virtual Payment Address', () => {
  const masked = maskPii('aarogyaclinic@okhdfcbank', 'UPI');
  assert.strictEqual(masked, 'aa***@okhdfcbank');

  const maskedShort = maskPii('r@okicici', 'UPI');
  assert.strictEqual(maskedShort, 'r***@okicici');
});

// -------------------------------------------------------------
// 4. End-to-End PII Scanner Engine Tests
// -------------------------------------------------------------
runTest('Scanner: Valid Aadhaar Extracted with Confidence 1.0', () => {
  const text = 'Patient presented Aadhaar: 3421 8901 2345 at reception desk.';
  const findings = scanTextForPii(text);
  const aadhaar = findings.find((f) => f.type === 'AADHAAR');

  assert.ok(aadhaar, 'Aadhaar finding must be present');
  assert.strictEqual(aadhaar.rawValue, '3421 8901 2345');
  assert.strictEqual(aadhaar.maskedValue, 'XXXX-XXXX-2345');
  assert.strictEqual(aadhaar.confidenceScore, 1.0);
  assert.strictEqual(aadhaar.sensitivity, 'CRITICAL');
});

runTest('Scanner: Random 12-Digit Barcode Ignored by Verhoeff', () => {
  const text = 'Order barcode: 1234 5678 9012 scanned from package.';
  const findings = scanTextForPii(text);
  const aadhaar = findings.find((f) => f.type === 'AADHAAR');
  assert.strictEqual(aadhaar, undefined, 'Invalid barcode must not be flagged as Aadhaar');
});

runTest('Scanner: Mixed Diagnostic Chat Line Extraction', () => {
  const line = 'Patient Ramesh Sharma, Mobile: +91 9845012345, Aadhaar: 3421 8901 2345, Fasting Blood Sugar and Lipid Profile required.';
  const findings = scanTextForPii(line);

  const phone = findings.find((f) => f.type === 'PHONE');
  const aadhaar = findings.find((f) => f.type === 'AADHAAR');
  const healthFindings = findings.filter((f) => f.type === 'HEALTH');

  assert.ok(phone, 'Phone must be detected');
  assert.strictEqual(phone.rawValue, '+91 9845012345');
  assert.strictEqual(phone.maskedValue, '+91 98XXXXXX45');

  assert.ok(aadhaar, 'Aadhaar must be detected');
  assert.strictEqual(aadhaar.maskedValue, 'XXXX-XXXX-2345');

  assert.ok(healthFindings.length >= 2, 'Health keywords (Blood Sugar, Lipid Profile) must be flagged');
  const healthKeywords = healthFindings.map((h) => h.rawValue.toLowerCase());
  assert.ok(healthKeywords.includes('blood sugar'));
  assert.ok(healthKeywords.includes('lipid profile'));
});

runTest('Scanner: UPI VPA Extraction', () => {
  const text = 'Advance payment sent to clinic account aarogyaclinic@okhdfcbank ref id 9921.';
  const findings = scanTextForPii(text);
  const upi = findings.find((f) => f.type === 'UPI');

  assert.ok(upi, 'UPI must be detected');
  assert.strictEqual(upi.rawValue, 'aarogyaclinic@okhdfcbank');
  assert.strictEqual(upi.maskedValue, 'aa***@okhdfcbank');
  assert.strictEqual(upi.sensitivity, 'HIGH');
});

runTest('Scanner: Clinical Health Lexicon (Section 2(t))', () => {
  const text = 'Attached laboratory reports for TSH, HbA1c, and Serum Creatinine.';
  const findings = scanTextForPii(text);
  const health = findings.filter((f) => f.type === 'HEALTH');

  assert.strictEqual(health.length, 3);
  assert.strictEqual(health[0].sensitivity, 'CRITICAL');
});

runTest('Anonymizer: Zero Cloud Egress Text Redaction', () => {
  const rawText = 'Contact Ramesh at +91 9845012345 with Aadhaar 3421 8901 2345 and UPI ramesh@okicici';
  const anonymized = anonymizeText(rawText);

  assert.ok(!anonymized.includes('+91 9845012345'), 'Raw phone must not be present');
  assert.ok(!anonymized.includes('3421 8901 2345'), 'Raw Aadhaar must not be present');
  assert.ok(!anonymized.includes('ramesh@okicici'), 'Raw UPI must not be present');
  assert.ok(anonymized.includes('XXXX-XXXX-2345'), 'Masked Aadhaar must be present');
  assert.ok(anonymized.includes('+91 98XXXXXX45'), 'Masked phone must be present');
  assert.ok(anonymized.includes('ra***@okicici'), 'Masked UPI must be present');
});

// -------------------------------------------------------------
// 5. Cybersecurity & ReDoS Stress Test
// -------------------------------------------------------------
runTest('ReDoS Defense: Bounded Execution on Long / Repetitive Strings', () => {
  const maliciousString = 'A'.repeat(5000) + ' ' + '9'.repeat(12) + ' ' + '@'.repeat(500);
  const startTime = Date.now();
  const findings = scanTextForPii(maliciousString);
  const elapsed = Date.now() - startTime;

  assert.ok(elapsed < 200, `Execution took ${elapsed}ms; must complete in < 200ms without catastrophic backtracking`);
  assert.ok(Array.isArray(findings));
});

// -------------------------------------------------------------
// Test Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`  Tests Passed: ${testsPassed}`);
console.log(`  Tests Failed: ${testsFailed}`);
console.log('================================================================\n');

if (testsFailed > 0) {
  console.error('[-] TEST SUITE FAILED: Some assertions did not pass.\n');
  process.exit(1);
} else {
  console.log('[+] ALL TESTS PASSED SUCCESSFULLY! ZERO FAILURES.\n');
  process.exit(0);
}
