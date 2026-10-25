const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { db, run, get, all, runTransaction } = require('./db');
const models = require('./index');

async function seedDatabase() {
  console.log('[SEED] Starting DPDP_Secure SQLite Database Seeder...');

  const tenantId = 'TENANT-AAROGYA-01';

  // 1. Seed Tenant
  await run(`
    INSERT OR REPLACE INTO tenants (id, businessName, businessType, gstNumber, address, dpoName, dpoEmail, complianceScore)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    tenantId,
    'Aarogya Diagnostic Center',
    'Diagnostic Laboratory & Healthcare SME',
    '29AAAAA0000A1Z5',
    '12th Main, Indiranagar, Bengaluru, Karnataka 560038',
    'Ramesh Kumar',
    'privacy@aarogyaclinic.in',
    84
  ]);
  console.log('  [+] Seeded Tenant: Aarogya Diagnostic Center');

  // 2. Seed Informal Data Silos
  const silos = [
    {
      id: 'SILO-WHATSAPP-01',
      tenantId,
      siloName: 'clinic_reception_chat.txt',
      siloType: 'WHATSAPP_CHAT',
      filePath: 'data/sample_data/clinic_reception_chat.txt',
      itemCount: 840,
      riskLevel: 'HIGH',
      lastScannedAt: new Date().toISOString()
    },
    {
      id: 'SILO-LEADS-02',
      tenantId,
      siloName: 'customer_leads.csv',
      siloType: 'SPREADSHEET',
      filePath: 'data/sample_data/customer_leads.csv',
      itemCount: 350,
      riskLevel: 'MEDIUM',
      lastScannedAt: new Date().toISOString()
    },
    {
      id: 'SILO-BILLING-03',
      tenantId,
      siloName: 'invoices_billing.csv',
      siloType: 'BILLING_EXPORT',
      filePath: 'data/sample_data/invoices_billing.csv',
      itemCount: 230,
      riskLevel: 'STATUTORY_TAX_LOCK',
      lastScannedAt: new Date().toISOString()
    }
  ];

  for (const s of silos) {
    await run(`
      INSERT OR REPLACE INTO data_silos (id, tenantId, siloName, siloType, filePath, itemCount, riskLevel, lastScannedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [s.id, s.tenantId, s.siloName, s.siloType, s.filePath, s.itemCount, s.riskLevel, s.lastScannedAt]);
  }
  console.log('  [+] Seeded 3 Informal Data Silos (WhatsApp, Leads, Invoices)');

  // 3. Seed Discovered Indian PII Findings
  const findings = [
    {
      id: 'PII-01',
      siloId: 'SILO-WHATSAPP-01',
      entityName: 'Deepa Nair',
      piiType: 'AADHAAR',
      maskedValue: 'XXXXXXXX7182',
      rawSample: 'Aadhaar: 4921-8374-7182',
      lineNumber: 14,
      confidenceScore: 0.99
    },
    {
      id: 'PII-02',
      siloId: 'SILO-WHATSAPP-01',
      entityName: 'Deepa Nair',
      piiType: 'HEALTH_DIAGNOSTIC',
      maskedValue: 'Fasting Blood Sugar: 142 mg/dL, HbA1c: 7.2%',
      rawSample: 'FBS: 142 mg/dL, HbA1c: 7.2% Diabetic evaluation',
      lineNumber: 15,
      confidenceScore: 0.95
    },
    {
      id: 'PII-03',
      siloId: 'SILO-WHATSAPP-01',
      entityName: 'Deepa Nair',
      piiType: 'MOBILE',
      maskedValue: '+91 9988776655',
      rawSample: 'WhatsApp Message from +91 9988776655',
      lineNumber: 12,
      confidenceScore: 1.0
    },
    {
      id: 'PII-04',
      siloId: 'SILO-LEADS-02',
      entityName: 'Vikram Mehta',
      piiType: 'MOBILE',
      maskedValue: '+91 9845012345',
      rawSample: 'Vikram Mehta, +91 9845012345, Comprehensive Health Checkup',
      lineNumber: 4,
      confidenceScore: 1.0
    },
    {
      id: 'PII-05',
      siloId: 'SILO-BILLING-03',
      entityName: 'Deepa Nair',
      piiType: 'PAN',
      maskedValue: 'ABCDE1234F',
      rawSample: 'INV-2024-309, Deepa Nair, PAN: ABCDE1234F, Rs. 12000',
      lineNumber: 5,
      confidenceScore: 1.0
    }
  ];

  for (const f of findings) {
    await run(`
      INSERT OR REPLACE INTO pii_findings (id, siloId, entityName, piiType, maskedValue, rawSample, lineNumber, confidenceScore)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [f.id, f.siloId, f.entityName, f.piiType, f.maskedValue, f.rawSample, f.lineNumber, f.confidenceScore]);
  }
  console.log('  [+] Seeded Discovered Indian PII Findings (Verhoeff Aadhaar, PAN, Health)');

  // 4. Seed RoPA Records (Section 8(4))
  const ropa = [
    {
      id: 'ROPA-01',
      tenantId,
      activityName: 'Patient Diagnostic Dispatch',
      dataCategories: 'Identity (Aadhaar), Contact (Mobile), Health (Lipid/Glucose test reports)',
      purpose: 'Fulfilling diagnostic testing and delivering digital medical reports to patients',
      legalBasis: 'Explicit Consent (DPDP Section 6)',
      retentionPeriod: '3 years medical record retention (NMC Guidelines)',
      storageLocation: 'Local WhatsApp Business backup & Local laboratory server',
      securitySafeguards: 'Verhoeff tokenization, AES-256 local encryption, 100% offline'
    },
    {
      id: 'ROPA-02',
      tenantId,
      activityName: 'Health Checkup Inquiry Management',
      dataCategories: 'Full Name, Mobile Number, City, Preferred Package',
      purpose: 'Responding to customer inquiries and appointment scheduling',
      legalBasis: 'Consent (DPDP Section 5 & 6)',
      retentionPeriod: '1 year or until consent withdrawal',
      storageLocation: 'Local Spreadsheet (customer_leads.csv)',
      securitySafeguards: 'Role-based access control, revocable consent ledger'
    },
    {
      id: 'ROPA-03',
      tenantId,
      activityName: 'Statutory Invoicing & Tax Compliance',
      dataCategories: 'Patient Full Name, GSTIN, PAN, Billing Address, Payment Instrument',
      purpose: 'Statutory commercial tax recording and GST filing compliance',
      legalBasis: 'Legal Obligation (CGST Act 2017 Section 36 & DPDP Section 8)',
      retentionPeriod: '6 years from due date of annual return (Mandatory CGST Tax Lock)',
      storageLocation: 'Local Billing Server (invoices_billing.csv)',
      securitySafeguards: 'Dual-track collision lock, tamper-evident SHA-256 certificates'
    }
  ];

  for (const r of ropa) {
    await run(`
      INSERT OR REPLACE INTO ropa_records (id, tenantId, activityName, dataCategories, purpose, legalBasis, retentionPeriod, storageLocation, securitySafeguards)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [r.id, r.tenantId, r.activityName, r.dataCategories, r.purpose, r.legalBasis, r.retentionPeriod, r.storageLocation, r.securitySafeguards]);
  }
  console.log('  [+] Seeded RoPA (Record of Processing Activities under Section 8)');

  // 5. Seed Multilingual Section 5 Notices
  const notices = [
    {
      id: 'NOTICE-EN-01',
      tenantId,
      title: 'Diagnostic Report Dispatch & Lab Notifications',
      purposeCode: 'DIAGNOSTIC_REPORTS',
      language: 'English',
      noticeText: 'Aarogya Diagnostic Center collects your mobile number and lab test results to dispatch diagnostic reports via WhatsApp. You have the right to access and withdraw consent under the DPDP Act, 2023.',
      version: '1.0'
    },
    {
      id: 'NOTICE-KN-02',
      tenantId,
      title: 'ಪ್ರಯೋಗಾಲಯ ವರದಿ ಮತ್ತು ಆರೋಗ್ಯ ತಪಾಸಣೆ ಅಧಿಸೂಚನೆ',
      purposeCode: 'DIAGNOSTIC_REPORTS',
      language: 'Kannada',
      noticeText: 'ಆರೋಗ್ಯ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಸೆಂಟರ್ ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷಾ ವರದಿಗಳನ್ನು ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಕಳುಹಿಸಲು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸುತ್ತದೆ. ಡಿಪಿಡಿಪಿ ಕಾಯ್ದೆ 2023 ರ ಅಡಿಯಲ್ಲಿ ನಿಮ್ಮ ಒಪ್ಪಿಗೆಯನ್ನು ಹಿಂಪಡೆಯುವ ಹಕ್ಕು ನಿಮಗಿದೆ.',
      version: '1.0'
    },
    {
      id: 'NOTICE-HI-03',
      tenantId,
      title: 'प्रयोगशाला परीक्षण रिपोर्ट एवं स्वास्थ्य परामर्श सूचना',
      purposeCode: 'DIAGNOSTIC_REPORTS',
      language: 'Hindi',
      noticeText: 'आरोग्य डायग्नोस्टिक सेंटर व्हाट्सएप के माध्यम से आपकी परीक्षण रिपोर्ट भेजने के लिए आपके मोबाइल नंबर का उपयोग करता है। डीपी ShoDP अधिनियम 2023 के तहत आपको सहमति वापस लेने का पूरा अधिकार है।',
      version: '1.0'
    }
  ];

  for (const n of notices) {
    await run(`
      INSERT OR REPLACE INTO consent_notices (id, tenantId, title, purposeCode, language, noticeText, version, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [n.id, n.tenantId, n.title, n.purposeCode, n.language, n.noticeText, n.version]);
  }
  console.log('  [+] Seeded 3 Multilingual Section 5 Notices (English, Kannada, Hindi)');

  // 6. Seed Sample Consent Event
  await models.recordConsentEvent({
    tenantId,
    dataPrincipalPhone: '+91 9988776655',
    purposeCode: 'DIAGNOSTIC_REPORTS',
    status: 'GRANTED',
    channel: 'WHATSAPP'
  });
  console.log('  [+] Seeded Initial Cryptographic Consent Ledger Record');

  // 7. Seed Pending DSR Erasure Request with CGST Tax Lock
  await run(`
    INSERT OR REPLACE INTO privacy_requests (id, tenantId, ticketNumber, principalName, principalPhone, principalEmail, requestType, status, statutoryLockReason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'DSR-REQ-001',
    tenantId,
    'DSR-2026-8819',
    'Deepa Nair',
    '+91 9988776655',
    'deepa.nair@email.com',
    'ERASURE_SEC_12',
    'PENDING_TAX_LOCK_REVIEW',
    'CGST Act 2017 Section 36 - Invoice INV-2024-309 must be preserved for 6 statutory financial years until 2030-12-31'
  ]);
  console.log('  [+] Seeded Pending DSR Ticket: DSR-2026-8819 (Deepa Nair with CGST Tax Lock)');

  // 8. Seed Security Incident (Lost Receptionist Phone)
  await run(`
    INSERT OR REPLACE INTO incidents (id, tenantId, incidentTitle, scenarioType, severity, affectedCount, dataCategories, containmentActions, reportedToDpbi, citizenAlertSent, discoveredAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'INC-2026-4412',
    tenantId,
    'Lost Receptionist Smartphone (Android WhatsApp Business)',
    'DEVICE_THEFT',
    'CRITICAL',
    250,
    'Aadhaar numbers, patient mobile numbers, clinical lab test summaries',
    'Remote locked device via MDM; revoked active WhatsApp Web sessions; generated statutory Form DPBI-IR1; armed 72-hour DPBI notification workflow',
    0,
    0,
    new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  ]);
  console.log('  [+] Seeded Security Incident: INC-2026-4412 (Lost Receptionist Smartphone)');

  // 9. Seed Audit Trail with Cryptographic Hash Chaining
  const auditEvents = [
    { actor: 'System Scanner', action: 'DISCOVERY_SCAN', resource: 'clinic_reception_chat.txt', details: '840 Indian PII items discovered (Aadhaar, clinical health data)' },
    { actor: 'Ramesh Sharma', action: 'CONSENT_CAPTURED', resource: 'WhatsApp Business', details: 'Opted into lab report delivery via Section 5 multilingual notice' },
    { actor: 'Deepa Nair', action: 'DSR_INTAKE', resource: 'Public Portal (/dsr)', details: 'Ticket DSR-2026-8819 created for Section 12 erasure' },
    { actor: 'Ramesh Kumar (SME Owner)', action: 'TAX_LOCK_APPLIED', resource: 'invoices_billing.csv', details: 'CGST Section 36 statutory 6-year retention lock active on INV-2024-309' },
    { actor: 'Compliance Engine', action: 'ROPA_SYNTHESIS', resource: 'Section 8(4) Register', details: 'Synthesized 3 lawful processing activities across diagnostic workflows' }
  ];

  for (const event of auditEvents) {
    await models.logAuditEvent(tenantId, event.actor, event.action, event.resource, event.details);
  }
  console.log('  [+] Seeded 5 SHA-256 Chained Immutable Audit Log Entries');

  console.log('[SEED] DPDP_Secure database seeded successfully!\n');
}

// Direct Execution Support
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('[SEED] Exiting cleanly.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SEED] Fatal error seeding database:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
