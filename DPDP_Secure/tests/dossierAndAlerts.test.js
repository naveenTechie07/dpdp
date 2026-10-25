/**
 * DPDP_Secure - Pillar 4: Dossier & Citizen Alert Generator Unit Tests
 * Verifies Form DPBI-IR1 statutory dossier creation, SHA-256 fingerprinting,
 * and vulnerability concealment in multilingual customer alerts under DPDP Rules, 2025 (Rule 7).
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const {
  generateDpbiDossier,
  generateCitizenAlerts,
  computeDossierFingerprint,
  DEFAULT_FIDUCIARY
} = require('../src/services/dossierGenerator');

test('Pillar 4: Form DPBI-IR1 Dossier & Citizen Alert Engine', async (t) => {
  await t.test('DEFAULT_FIDUCIARY has complete entity details', () => {
    assert.equal(DEFAULT_FIDUCIARY.name, 'Aarogya Diagnostic Center');
    assert.equal(DEFAULT_FIDUCIARY.gstin, '29AAAAA0000A1Z5');
    assert.ok(DEFAULT_FIDUCIARY.address.includes('Bengaluru'));
    assert.equal(DEFAULT_FIDUCIARY.dpoName, 'Ramesh Kumar');
    assert.equal(DEFAULT_FIDUCIARY.dpoEmail, 'privacy@aarogyaclinic.in');
  });

  await t.test('generateCitizenAlerts generates EN, KN, and HI alerts with vulnerability concealment', () => {
    const alerts = generateCitizenAlerts({
      patientCount: 250,
      incidentType: 'LOST_PHONE',
      remedialAction: 'Remote phone wipe executed'
    });

    assert.ok(alerts.EN, 'English alert must be present');
    assert.ok(alerts.KN, 'Kannada alert must be present');
    assert.ok(alerts.HI, 'Hindi alert must be present');

    // Check English alert content
    assert.ok(alerts.EN.body.includes('Dear Aarogya Clinic Patient'));
    assert.ok(alerts.EN.body.includes('privacy@aarogyaclinic.in'));
    assert.ok(alerts.EN.body.includes('ignore any suspicious payment messages'));

    // Check Kannada alert content
    assert.ok(alerts.KN.body.includes('ಆರೋಗ್ಯ ಕ್ಲಿನಿಕ್'));
    assert.ok(alerts.KN.body.includes('ಕಳೆದುಹೋಗಿದ್ದು'));

    // Check Hindi alert content
    assert.ok(alerts.HI.body.includes('आरोग्य क्लिनिक'));
    assert.ok(alerts.HI.body.includes('खो गया था'));

    // Cybersecurity Guardrail: Vulnerability concealment
    // Alerts MUST NOT reveal unpatched versions, internal IPs, CVEs, or internal database architectures
    ['EN', 'KN', 'HI'].forEach((lang) => {
      const text = alerts[lang].body.toLowerCase();
      assert.ok(!text.includes('cve-'), `${lang} alert must not disclose CVEs`);
      assert.ok(!text.includes('unpatched'), `${lang} alert must not disclose unpatched software`);
      assert.ok(!text.includes('password'), `${lang} alert must not disclose password details`);
      assert.ok(!text.includes('192.168.'), `${lang} alert must not disclose internal IP ranges`);
    });
  });

  await t.test('computeDossierFingerprint computes deterministic SHA-256 hash', () => {
    const mockRecord = {
      formIdentifier: 'FORM DPBI-IR1',
      incidentId: 'INC-TEST-001',
      discoveredAt: '2026-10-25T08:00:00.000Z',
      estimatedAffected: 250,
      statutoryRiskScore: 82
    };

    const hash1 = computeDossierFingerprint(mockRecord);
    const hash2 = computeDossierFingerprint(mockRecord);

    assert.equal(typeof hash1, 'string');
    assert.equal(hash1.length, 64, 'SHA-256 fingerprint must be 64 hex characters');
    assert.equal(hash1, hash2, 'Hash must be strictly deterministic');
  });

  await t.test('generateDpbiDossier builds compliant Form DPBI-IR1 record', async () => {
    const mockIncident = {
      id: 'INC-2026-001',
      title: 'Lost Receptionist Smartphone',
      threatType: 'LOST_DEVICE',
      occurredAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      discoveredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      affectedPrincipals: 250,
      riskScore: 78,
      riskTier: 'HIGH',
      dataCategories: ['Identity (Aadhaar/PAN)', 'Contact (Mobile)', 'Clinical Health Data (Biopsy/Blood panels)'],
      containmentActions: [
        { id: 'wipe', title: 'Remote device wipe triggered', done: true },
        { id: 'tokens', title: 'WhatsApp multi-device tokens revoked', done: true },
        { id: 'creds', title: 'Lab network credentials rotated', done: true },
        { id: 'contact', title: 'Affected patients contacted', done: true }
      ]
    };

    const dossier = await generateDpbiDossier(mockIncident);

    assert.equal(dossier.formIdentifier, 'FORM DPBI-IR1 (Section 8(6) & Rule 7)');
    assert.equal(dossier.incidentId, 'INC-2026-001');
    assert.equal(dossier.fiduciary.gstin, '29AAAAA0000A1Z5');
    assert.equal(dossier.estimatedAffected, 250);
    assert.equal(dossier.statutoryRiskScore, 78);
    assert.equal(dossier.statutoryRiskTier, 'HIGH');
    assert.ok(dossier.isWithin72Hours, 'Report generated within 2 hours must be marked within 72 hours');
    assert.equal(typeof dossier.dossierSha256, 'string');
    assert.equal(dossier.dossierSha256.length, 64);
    assert.ok(dossier.citizenAlerts.EN);
    assert.ok(dossier.citizenAlerts.KN);
    assert.ok(dossier.citizenAlerts.HI);
    assert.ok(dossier.remedialActionsTaken.length >= 4);
  });
});
