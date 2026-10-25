/**
 * DPDP_Secure - Automated Hackathon Demo Seeder
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Resets and loads the complete Aarogya Diagnostic Center walkthrough in one command:
 * 1. Resets informal sample files (WhatsApp chats, customer leads, billing invoices)
 * 2. Seeds Aarogya Diagnostic Center (Indiranagar, Bengaluru) with 3 persona users
 * 3. Maps 3 informal data silos with 1,420 categorized Indian PII items
 * 4. Seeds multilingual Section 5 notices (English, Kannada, Hindi)
 * 5. Seeds live DSR ticket DSR-2026-8819 for Deepa Nair with CGST Section 36 6-yr tax lock
 * 6. Seeds active security incident INC-2026-9921 with ready-to-print 72h Form DPBI-IR1
 * 7. Seeds tamper-evident SHA-256 hash-chained audit ledger
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('./db');
const auditLogger = require('./auditLogger');
const { resetSampleData } = require('../services/statutoryCollisionResolver');

const TENANT_ID = 'TENANT-AAROGYA-01';

async function seedDemoData() {
  console.log('\n================================================================');
  console.log('  ⚡ DPDP_Secure: Automated Hackathon Demo Seeder Initializing');
  console.log('  Aarogya Diagnostic Center, Indiranagar, Bengaluru');
  console.log('================================================================\n');

  // 1. Reset Raw Informal Silo Sample Data Files
  try {
    resetSampleData();
    console.log('  [+] Step 1: Pristine informal silo sample files restored (WhatsApp, Leads, Invoices)');
  } catch (err) {
    console.warn('  [!] Step 1 warning (sample files):', err.message);
  }

  // 2. Clear Existing Data Tables
  await run('DELETE FROM audit_logs WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM privacy_requests WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM incidents WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM consent_events WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM consent_notices WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM ropa_records WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM pii_findings WHERE siloId IN (SELECT id FROM data_silos WHERE tenantId = ?)', [TENANT_ID]);
  await run('DELETE FROM data_silos WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM data_assets WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM data_tags WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM workflows WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM data_processors WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM retention_policies WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM cross_border_transfers WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM compliance_evidence WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM security_controls WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM assessments WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM assessment_templates WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM pia_dpia_assessments WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM assessment_settings WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM integrations WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM integration_hub WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM api_keys WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM tenant_settings WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM sso_settings WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM branding_settings WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM role_permissions WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM localization_settings WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM consent_purposes WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM consent_preferences WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM consent_preference_centers WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM consent_data_elements WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM consent_policies WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM consent_portal_settings WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM cookie_banners WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM cookie_scan_results WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM cookie_consent_logs WHERE tenantId = ?', [TENANT_ID]);
  await run('DELETE FROM cookie_geo_rules WHERE tenantId = ?', [TENANT_ID]);
  console.log('  [+] Step 2: All 27 local SQLite tables cleared for clean isolation');

  // 3. Seed Tenant: Aarogya Diagnostic Center
  await run(
    `INSERT OR REPLACE INTO tenants (id, businessName, businessType, gstNumber, address, dpoName, dpoEmail, complianceScore)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      TENANT_ID,
      'Aarogya Diagnostic Center',
      'Diagnostic Laboratory & Healthcare SME',
      '29AAAAA0000A1Z5',
      '12th Main Road, Indiranagar, Bengaluru, Karnataka - 560038',
      'Ramesh Kumar',
      'privacy@aarogyaclinic.in',
      84
    ]
  );
  console.log('  [+] Step 3: Seeded Tenant Aarogya Diagnostic Center (GSTIN: 29AAAAA0000A1Z5)');

  // 4. Seed Informal Data Silos (Total: 1,420 items)
  const silos = [
    {
      id: 'SILO-WHATSAPP-01',
      tenantId: TENANT_ID,
      siloName: 'clinic_reception_chat.txt',
      siloType: 'WHATSAPP_CHAT',
      filePath: 'data/sample_data/clinic_reception_chat.txt',
      itemCount: 840,
      riskLevel: 'HIGH',
      lastScannedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'SILO-LEADS-02',
      tenantId: TENANT_ID,
      siloName: 'customer_leads.csv',
      siloType: 'SPREADSHEET',
      filePath: 'data/sample_data/customer_leads.csv',
      itemCount: 350,
      riskLevel: 'MEDIUM',
      lastScannedAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'SILO-BILLING-03',
      tenantId: TENANT_ID,
      siloName: 'invoices_billing.csv',
      siloType: 'BILLING_EXPORT',
      filePath: 'data/sample_data/invoices_billing.csv',
      itemCount: 230,
      riskLevel: 'STATUTORY_TAX_LOCK',
      lastScannedAt: new Date(Date.now() - 10800000).toISOString()
    }
  ];

  for (const s of silos) {
    await run(
      `INSERT INTO data_silos (id, tenantId, siloName, siloType, filePath, itemCount, riskLevel, lastScannedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.tenantId, s.siloName, s.siloType, s.filePath, s.itemCount, s.riskLevel, s.lastScannedAt]
    );
  }
  console.log('  [+] Step 4: Seeded 3 informal silos (840 WhatsApp + 350 Leads + 230 Billing = 1,420 items)');

  // 5. Seed Discovered PII Findings
  const findings = [
    {
      id: 'PII-DEMO-01',
      siloId: 'SILO-WHATSAPP-01',
      entityName: 'Deepa Nair',
      piiType: 'AADHAAR',
      maskedValue: 'XXXXXXXX7182',
      rawSample: 'Aadhaar: 4921-8374-7182',
      lineNumber: 14,
      confidenceScore: 0.99
    },
    {
      id: 'PII-DEMO-02',
      siloId: 'SILO-WHATSAPP-01',
      entityName: 'Deepa Nair',
      piiType: 'HEALTH_DIAGNOSTIC',
      maskedValue: 'Fasting Blood Sugar: 142 mg/dL, HbA1c: 7.2%',
      rawSample: 'FBS: 142 mg/dL, HbA1c: 7.2% Diabetic evaluation',
      lineNumber: 15,
      confidenceScore: 0.96
    },
    {
      id: 'PII-DEMO-03',
      siloId: 'SILO-WHATSAPP-01',
      entityName: 'Deepa Nair',
      piiType: 'MOBILE',
      maskedValue: '+91 9988776655',
      rawSample: 'WhatsApp Message from +91 9988776655',
      lineNumber: 12,
      confidenceScore: 1.0
    },
    {
      id: 'PII-DEMO-04',
      siloId: 'SILO-LEADS-02',
      entityName: 'Vikram Mehta',
      piiType: 'MOBILE',
      maskedValue: '+91 9845012345',
      rawSample: 'Vikram Mehta, +91 9845012345, Comprehensive Health Checkup',
      lineNumber: 4,
      confidenceScore: 1.0
    },
    {
      id: 'PII-DEMO-05',
      siloId: 'SILO-BILLING-03',
      entityName: 'Deepa Nair',
      piiType: 'PAN',
      maskedValue: 'ABCDE1234F',
      rawSample: 'INV-2024-309, Deepa Nair, PAN: ABCDE1234F, Rs. 12000',
      lineNumber: 5,
      confidenceScore: 1.0
    },
    {
      id: 'PII-DEMO-06',
      siloId: 'SILO-WHATSAPP-01',
      entityName: 'Rahul Verma',
      piiType: 'UPI_VPA',
      maskedValue: 'rahul.verma@okhdfcbank',
      rawSample: 'UPI Payment received: rahul.verma@okhdfcbank Ref 429188',
      lineNumber: 22,
      confidenceScore: 0.98
    }
  ];

  for (const f of findings) {
    await run(
      `INSERT INTO pii_findings (id, siloId, entityName, piiType, maskedValue, rawSample, lineNumber, confidenceScore)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [f.id, f.siloId, f.entityName, f.piiType, f.maskedValue, f.rawSample, f.lineNumber, f.confidenceScore]
    );
  }
  console.log('  [+] Step 5: Seeded categorized Indian PII findings (Aadhaar, PAN, Health, Phone, UPI)');

  // 6. Seed Multilingual Section 5 Notices (English, Kannada, Hindi)
  const notices = [
    {
      id: 'NOTICE-S5-EN-01',
      tenantId: TENANT_ID,
      title: 'Healthcare Diagnostic & Patient Scheduling Notice',
      purposeCode: 'DIAGNOSTIC_REPORTS',
      language: 'English',
      noticeText: 'Aarogya Diagnostic Center collects your mobile number and lab test results to dispatch diagnostic reports via WhatsApp and schedule appointments. You have the right to access and withdraw consent under the DPDP Act, 2023.',
      version: '1.0'
    },
    {
      id: 'NOTICE-S5-KN-02',
      tenantId: TENANT_ID,
      title: 'ಆರೋಗ್ಯ ರೋಗನಿರ್ಣಯ ಮತ್ತು ನೇಮಕಾತಿ ಸೂಚನೆ',
      purposeCode: 'DIAGNOSTIC_REPORTS',
      language: 'Kannada',
      noticeText: 'ಆರೋಗ್ಯ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಸೆಂಟರ್ ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷಾ ವರದಿಗಳನ್ನು ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಕಳುಹಿಸಲು ಮತ್ತು ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ನಿಗದಿಪಡಿಸಲು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸುತ್ತದೆ. ಡಿಪಿಡಿಪಿ ಕಾಯ್ದೆ 2023 ರ ಅಡಿಯಲ್ಲಿ ನಿಮ್ಮ ಒಪ್ಪಿಗೆಯನ್ನು ಹಿಂಪಡೆಯುವ ಹಕ್ಕು ನಿಮಗಿದೆ.',
      version: '1.0'
    },
    {
      id: 'NOTICE-S5-HI-03',
      tenantId: TENANT_ID,
      title: 'आरोग्य डायग्नोस्टिक एवं रोगी परामर्श सूचना',
      purposeCode: 'DIAGNOSTIC_REPORTS',
      language: 'Hindi',
      noticeText: 'आरोग्य डायग्नोस्टिक सेंटर व्हाट्सएप के माध्यम से आपकी परीक्षण रिपोर्ट भेजने और अपॉइंटमेंट शेड्यूल करने के लिए आपके मोबाइल नंबर का उपयोग करता है। डीपीडीपी अधिनियम 2023 के तहत आपको सहमति वापस लेने का पूरा अधिकार है।',
      version: '1.0'
    }
  ];

  for (const n of notices) {
    await run(
      `INSERT INTO consent_notices (id, tenantId, title, purposeCode, language, noticeText, version, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [n.id, n.tenantId, n.title, n.purposeCode, n.language, n.noticeText, n.version]
    );
  }
  console.log('  [+] Step 6: Seeded 3 Multilingual Section 5 Notices (English, Kannada, Hindi)');

  // 7. Seed Consent Ledger Records
  const consentRecords = [
    {
      phone: '+91 9988776655',
      purpose: 'DIAGNOSTIC_REPORTS',
      status: 'GRANTED',
      channel: 'WHATSAPP'
    },
    {
      phone: '+91 9845012345',
      purpose: 'APPOINTMENT_SCHEDULING',
      status: 'GRANTED',
      channel: 'SMS'
    }
  ];

  for (const c of consentRecords) {
    const proof = crypto.createHash('sha256').update(c.phone + c.purpose + c.status + c.channel).digest('hex');
    await run(
      `INSERT INTO consent_events (id, tenantId, dataPrincipalPhone, purposeCode, status, channel, sha256Proof)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), TENANT_ID, c.phone, c.purpose, c.status, c.channel, proof]
    );
  }
  console.log('  [+] Step 7: Seeded cryptographic consent ledger records');

  // 8. Seed Live DSR Ticket: DSR-2026-8819 for Deepa Nair (Erasure + CGST Tax Lock)
  await run(
    `INSERT INTO privacy_requests (id, tenantId, ticketNumber, principalName, principalPhone, principalEmail, requestType, status, statutoryLockReason, certHash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'DSR-REQ-8819',
      TENANT_ID,
      'DSR-2026-8819',
      'Deepa Nair',
      '+91 9988776655',
      'deepa.nair@email.com',
      'ERASURE_SEC_12',
      'PARTIALLY_FULFILLED_TAX_LOCKED',
      'CGST Act 2017 Section 36 - Mandatory 72-month retention lock on Invoice INV-2024-309 until 2030-12-31. Personal identifiers redacted from WhatsApp chat and leads.',
      'c8932ef9104b2a8d44719283f019283471029384710293847102938471029384'
    ]
  );
  console.log('  [+] Step 8: Seeded Live DSR Ticket DSR-2026-8819 (Deepa Nair with CGST Sec 36 Tax Lock)');

  // 9. Seed Active Security Incident: Lost Receptionist Smartphone
  const containmentActions = [
    { id: 'ACT-01', text: 'Trigger Google Find My Device remote lock & wipe', done: true, urgent: true },
    { id: 'ACT-02', text: 'Revoke active WhatsApp Business linked web sessions across all endpoints', done: true, urgent: true },
    { id: 'ACT-03', text: 'Rotate clinic reception WhatsApp OTP & SIM card via telecom provider', done: false, urgent: false },
    { id: 'ACT-04', text: 'Generate statutory Form DPBI-IR1 72-Hour Intimation Dossier', done: true, urgent: true },
    { id: 'ACT-05', text: 'Dispatch plain-language reassurance citizen alerts in English, Kannada, and Hindi', done: false, urgent: false }
  ];

  await run(
    `INSERT INTO incidents (id, tenantId, incidentTitle, scenarioType, severity, affectedCount, dataCategories, containmentActions, reportedToDpbi, citizenAlertSent, discoveredAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'INC-2026-9921',
      TENANT_ID,
      'Lost Receptionist Smartphone (Indiranagar Metro Station)',
      'DEVICE_LOSS_UNENCRYPTED',
      'CRITICAL',
      250,
      'Identity (Aadhaar, PAN), Contact (Mobile, Address), Clinical Health Data (Diagnostic Requisitions, Biopsy, Blood Panels)',
      JSON.stringify(containmentActions),
      0,
      0,
      new Date(Date.now() - 3.75 * 3600 * 1000).toISOString()
    ]
  );
  console.log('  [+] Step 9: Seeded Active Incident INC-2026-9921 (Lost Smartphone with 72h DPBI Dossier Ready)');

  // 10. Seed RoPA Records (Section 8(4))
  const ropa = [
    {
      id: 'ROPA-01',
      tenantId: TENANT_ID,
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
      tenantId: TENANT_ID,
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
      tenantId: TENANT_ID,
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
    await run(
      `INSERT INTO ropa_records (id, tenantId, activityName, dataCategories, purpose, legalBasis, retentionPeriod, storageLocation, securitySafeguards)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.tenantId, r.activityName, r.dataCategories, r.purpose, r.legalBasis, r.retentionPeriod, r.storageLocation, r.securitySafeguards]
    );
  }
  console.log('  [+] Step 10: Seeded RoPA (Record of Processing Activities under Section 8)');

  // 10B. Seed Enterprise Subsystems (Data Management, Governance, Assessments, Integrations, Settings, Consent, Cookies)

  // 1. Data Assets
  const assets = [
    ['ASSET-01', TENANT_ID, 'Mindray BC-5150 Hematology Analyzer', 'LAB_EQUIPMENT', 'Indiranagar Central Lab', 'RESTRICTED', 'Aadhaar, Blood Panels, CBC, HbA1c', 'active', 'Primary 5-part hematology analyzer in central diagnostic bay'],
    ['ASSET-02', TENANT_ID, 'PACS DICOM Imaging Vault', 'IMAGING_SERVER', 'Radiology Department', 'CONFIDENTIAL', 'X-Ray, Ultrasound, CT Scan DICOMs', 'active', 'Digital imaging storage archive for radiological scans'],
    ['ASSET-03', TENANT_ID, 'Tally Prime ERP Database (GST Compliant)', 'FINANCIAL_SYSTEM', 'Accounts & Billing Office', 'RESTRICTED', 'PAN, GSTIN, Billing Invoices, Payment Instruments', 'active', 'Statutory accounting database under CGST Sec 36 mandate'],
    ['ASSET-04', TENANT_ID, 'Clinic Reception Frontdesk Smartphone', 'MOBILE_DEVICE', 'Reception Counter 1', 'HIGH_RISK', 'WhatsApp Chat Transcripts, Phone Numbers, Doctor Notes', 'active', 'Handheld mobile device for patient communication and report delivery']
  ];
  for (const a of assets) {
    await run(
      `INSERT INTO data_assets (id, tenantId, assetName, assetType, sourceSystem, sensitivity, elements, status, description, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...a, new Date().toISOString()]
    );
  }

  // 2. Data Tags
  const tags = [
    ['TAG-01', TENANT_ID, 'Aadhaar UID', 'IDENTIFIER', 'Government Identity', 95, '#ef4444', '12-digit UIDAI unique identity number subject to Verhoeff check'],
    ['TAG-02', TENANT_ID, 'PAN / GSTIN', 'FINANCIAL', 'Tax Identifier', 80, '#f59e0b', 'Permanent Account Number for statutory GST billing'],
    ['TAG-03', TENANT_ID, 'Clinical Diagnostic Panel', 'HEALTH', 'Special Category Data', 90, '#ec4899', 'Biochemical, pathology, blood sugar, lipid panel results'],
    ['TAG-04', TENANT_ID, 'Patient Phone (WhatsApp)', 'CONTACT', 'Direct Outreach', 60, '#3b82f6', 'Patient WhatsApp-enabled mobile contact number'],
    ['TAG-05', TENANT_ID, 'Referring Doctor Requisition', 'HEALTH', 'Clinical Notes', 85, '#8b5cf6', 'Referring doctor diagnosis, clinical history, test recommendations']
  ];
  for (const t of tags) {
    await run(
      `INSERT INTO data_tags (id, tenantId, tagName, category, subCategory, sensitivityWeight, colorTag, description, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...t, new Date().toISOString()]
    );
  }

  // 3. Workflows
  const workflows = [
    ['WF-01', TENANT_ID, 'Patient Section 12 Erasure Pipeline', 'DSR_ERASURE_RECEIVED', '1. Verify Identity -> 2. Check CGST Sec 36 Tax Lock -> 3. Redact WhatsApp Silos -> 4. Issue SHA-256 Certificate', 1],
    ['WF-02', TENANT_ID, 'Statutory Tax Lock Guard Workflow', 'INVOICE_GENERATED', '1. Tag with CGST Sec 36 -> 2. Apply 72-month retention lock -> 3. Exclude from automated erasure', 1],
    ['WF-03', TENANT_ID, '72-Hour Security Incident Escalation', 'BREACH_DETECTED', '1. Isolate endpoint -> 2. Generate DPBI Form IR1 -> 3. Alert DPO -> 4. Dispatch Trilingual Citizen Alerts', 1]
  ];
  for (const w of workflows) {
    await run(
      `INSERT INTO workflows (id, tenantId, workflowName, triggerEvent, actions, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [...w, new Date().toISOString()]
    );
  }

  // 4. Data Processors
  const processors = [
    ['PROC-01', TENANT_ID, 'Aarogya Diagnostic Lab Cloud', 'Pathology Processing', 'Blood Panels, Biopsy, HbA1c', 'India', 'Adequate', 1, 1, 'LOW'],
    ['PROC-02', TENANT_ID, 'Tele-Radiology Partners Bangalore', 'Diagnostic Imaging', 'X-Ray, Ultrasound, CT Reports', 'India', 'Adequate', 1, 1, 'LOW'],
    ['PROC-03', TENANT_ID, 'Razorpay Financial Solutions Pvt Ltd', 'Payment Gateway', 'UPI ID, Billing Invoices, Phone', 'India', 'Adequate', 1, 1, 'LOW'],
    ['PROC-04', TENANT_ID, 'Exotel Communications Pvt Ltd', 'WhatsApp & SMS Gateway', 'Phone Number, Patient Name, Alert Text', 'India', 'Adequate', 1, 1, 'MEDIUM']
  ];
  for (const p of processors) {
    await run(
      `INSERT INTO data_processors (id, tenantId, processorName, serviceType, dataCategories, jurisdiction, adequacyDecision, contractSigned, dpaSigned, riskLevel, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...p, new Date().toISOString()]
    );
  }

  // 5. Retention Policies
  const policies = [
    ['RET-01', TENANT_ID, 'CGST 6-Year Statutory Tax Lock', 'Financial Invoices & Billing Records', '72 Months (6 Years)', 'CGST Act 2017 Sec 36 read with DPDP Sec 8(7)', 0],
    ['RET-02', TENANT_ID, 'Clinical Biopsy & Histopathology Reports', 'Diagnostic Lab Reports & Pathology', '60 Months (5 Years)', 'National Medical Commission Code', 0],
    ['RET-03', TENANT_ID, 'Informal WhatsApp Reception Chat Purge', 'Unstructured Chat Transcripts', '30 Days', 'DPDP Act 2023 Sec 8(7) Purpose Limitation', 1]
  ];
  for (const pol of policies) {
    await run(
      `INSERT INTO retention_policies (id, tenantId, policyName, dataCategory, retentionPeriod, legalBasis, autoDelete, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [...pol, new Date().toISOString()]
    );
  }

  // 6. Cross-Border Transfers
  const transfers = [
    ['CBT-01', TENANT_ID, 'United Kingdom', 'Kings College Tele-Radiology Group (London)', 'Anonymized CT/MRI Scans, Diagnostic Notes', 'Standard Contractual Clauses (SCC)', 'Adequate with Technical Safeguards', '2026-01-15', 'LOW'],
    ['CBT-02', TENANT_ID, 'Singapore', 'SingHealth Specialist Histopathology Hub', 'Digital Biopsy Micrographs, Patient Age/Gender', 'Binding Corporate Rules & Explicit Consent', 'Adequate', '2026-02-10', 'LOW']
  ];
  for (const tr of transfers) {
    await run(
      `INSERT INTO cross_border_transfers (id, tenantId, destinationCountry, recipientName, dataCategories, transferMechanism, adequacyDecision, lastReviewed, riskLevel, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...tr, new Date().toISOString()]
    );
  }

  // 7. Compliance Evidence
  const evidence = [
    ['EVI-01', TENANT_ID, 'NABL ISO 15189:2022 Accreditation Certificate', 'ACCREDITATION', 'Dr. Aruna V. (Lab Director)', '/evidence/nabl_cert_2025_2027.pdf', 2450000, 1, '2027-03-31'],
    ['EVI-02', TENANT_ID, 'DPDP Act 2023 Statutory Readiness Audit Report', 'AUDIT_REPORT', 'Rajesh Iyer (DPO & Auditor)', '/evidence/dpdp_readiness_audit_q1_2026.pdf', 1820000, 1, '2027-01-01'],
    ['EVI-03', TENANT_ID, 'Form DPBI-IR1 72-Hour Breach Intimation Dossier', 'BREACH_INTIMATION', 'Ramesh Kumar (SME Owner)', '/evidence/dpbi_ir1_lost_phone_incident.pdf', 980000, 1, '2026-12-31'],
    ['EVI-04', TENANT_ID, 'Data Protection Addendum (DPA) - WhatsApp Cloud', 'LEGAL_CONTRACT', 'Legal Cell', '/evidence/dpa_meta_whatsapp_cloud.pdf', 3120000, 1, '2028-06-30']
  ];
  for (const ev of evidence) {
    await run(
      `INSERT INTO compliance_evidence (id, tenantId, documentName, documentType, uploadedBy, filePath, fileSize, verified, expiryDate, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...ev, new Date().toISOString()]
    );
  }

  // 8. Security Controls
  const controls = [
    ['SEC-01', TENANT_ID, 'Full-Disk BitLocker Encryption (XTS-AES 256)', 'Encryption at Rest', 'IMPLEMENTED', 'HIGH'],
    ['SEC-02', TENANT_ID, 'WhatsApp Web Multi-Device Auto-Revocation', 'Access Control', 'TESTED', 'HIGH'],
    ['SEC-03', TENANT_ID, 'Zero Cloud Egress In-Memory PII Redactor', 'Data Minimization', 'IMPLEMENTED', 'CRITICAL']
  ];
  for (const c of controls) {
    await run(
      `INSERT INTO security_controls (id, tenantId, controlName, controlCategory, implementationStatus, effectiveness, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [...c, new Date().toISOString()]
    );
  }

  // 9. Assessments
  const assessments = [
    ['ASS-01', TENANT_ID, 'Annual Diagnostic Center DPDP Compliance Audit', 'DPDP_READINESS', 'completed', 88, 25, 25, '2026-02-01'],
    ['ASS-02', TENANT_ID, 'WhatsApp Reception Chat Informal Silo Risk Audit', 'INFORMAL_SYSTEMS', 'in_progress', 65, 20, 13, '2026-03-10'],
    ['ASS-03', TENANT_ID, 'Cloud Tele-Radiology Security Safeguards Assessment', 'VENDOR_RISK', 'draft', 40, 15, 6, '2026-03-15']
  ];
  for (const ass of assessments) {
    await run(
      `INSERT INTO assessments (id, tenantId, assessmentName, assessmentType, status, score, totalQuestions, answeredQuestions, lastCompleted, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...ass, new Date().toISOString()]
    );
  }

  // 10. Assessment Templates
  const templates = [
    ['TMPL-01', TENANT_ID, 'DPDP Act 2023 Comprehensive SME Diagnostic Checklist', 'DPDP_ACT_2023', 25, 1],
    ['TMPL-02', TENANT_ID, 'Healthcare Informal Silos & Unstructured PII Framework', 'HEALTHCARE_PII', 20, 1],
    ['TMPL-03', TENANT_ID, 'Third-Party Diagnostic Laboratory Vendor Risk Matrix', 'ISO_27701', 15, 1]
  ];
  for (const tm of templates) {
    await run(
      `INSERT INTO assessment_templates (id, tenantId, templateName, framework, questionCount, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [...tm, new Date().toISOString()]
    );
  }

  // 11. PIA / DPIA Assessments
  const pias = [
    ['PIA-01', TENANT_ID, 'WhatsApp Business API Automated Lab Report Delivery DPIA', 'Special Category Health Data (Blood panels, Biopsy)', 'HIGH', 'approved', 'Implemented Verhoeff Aadhaar redaction, 30-day chat auto-purge, and SHA-256 consent logs'],
    ['PIA-02', TENANT_ID, 'Tele-Radiology Overseas Cloud Second Opinion PIA', 'Radiological Imaging DICOM Scans', 'MEDIUM', 'in_review', 'Applying end-to-end TLS 1.3 encryption, pseudonymized patient tokens, and standard contractual clauses']
  ];
  for (const pi of pias) {
    await run(
      `INSERT INTO pia_dpia_assessments (id, tenantId, assessmentName, dataCategory, riskLevel, status, mitigations, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [...pi, new Date().toISOString()]
    );
  }

  // 12. Assessment Settings
  const assSettings = [
    ['auto_trigger_dpias', 'true'],
    ['high_risk_threshold', '75'],
    ['notification_email', 'privacy@aarogyaclinic.in'],
    ['audit_retention_days', '1095']
  ];
  for (const [k, v] of assSettings) {
    await run(
      `INSERT OR REPLACE INTO assessment_settings (id, tenantId, settingKey, settingValue, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), TENANT_ID, k, v, new Date().toISOString()]
    );
  }

  // 13. Integrations
  const integrations = [
    ['INT-01', TENANT_ID, 'WhatsApp Business Cloud API', 'Meta / WhatsApp', 'CONNECTED', 'waba_live_98450'],
    ['INT-02', TENANT_ID, 'Tally Prime Accounting Link', 'Tally ERP XML', 'CONNECTED', 'tally_local_xml'],
    ['INT-03', TENANT_ID, 'NHA Ayushman Bharat Digital Mission (ABDM)', 'Government Gateway', 'CONNECTED', 'abdm_m1_hip']
  ];
  for (const it of integrations) {
    await run(
      `INSERT INTO integrations (id, tenantId, integrationName, provider, status, apiKeyPrefix, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [...it, new Date().toISOString()]
    );
  }

  // 14. Integration Hub Connectors
  const hub = [
    ['HUB-01', TENANT_ID, 'WhatsApp Cloud API Gateway', 'MESSAGING', JSON.stringify({ webhookUrl: 'https://aarogyaclinic.in/webhook/whatsapp', rateLimit: '100/min' }), 1],
    ['HUB-02', TENANT_ID, 'NHA ABDM Health Information Provider (HIP)', 'HEALTHCARE_GATEWAY', JSON.stringify({ hipId: 'HIP-AAROGYA-BLR', sandbox: false }), 1],
    ['HUB-03', TENANT_ID, 'Tally Prime Local XML Synchronizer', 'ACCOUNTING_ERP', JSON.stringify({ host: '192.168.1.105', port: 9000, company: 'Aarogya Diagnostic Center FY25-26' }), 1]
  ];
  for (const h of hub) {
    await run(
      `INSERT INTO integration_hub (id, tenantId, connectorName, connectorType, config, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [...h, new Date().toISOString()]
    );
  }

  // 15. API Keys
  const keys = [
    ['KEY-01', TENANT_ID, 'Aarogya Frontdesk Webhook Token', 'aarogya_live_', crypto.createHash('sha256').update('aarogya_live_key_9921').digest('hex'), 'read:silos,write:findings,read:consent', '2026-03-20', '2027-03-20'],
    ['KEY-02', TENANT_ID, 'ABHA Health Information Provider Sync', 'abha_hip_', crypto.createHash('sha256').update('abha_hip_live_secret_4411').digest('hex'), 'read:patients,write:consent_events', '2026-03-22', '2027-03-22']
  ];
  for (const k of keys) {
    await run(
      `INSERT INTO api_keys (id, tenantId, keyName, keyPrefix, keyHash, scopes, lastUsed, expiresAt, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...k, new Date().toISOString()]
    );
  }

  // 16. Tenant Settings
  const tenantSettings = [
    ['data_protection_officer', 'Ramesh Kumar'],
    ['dpo_email', 'privacy@aarogyaclinic.in'],
    ['dpo_phone', '+91 9845012345'],
    ['default_language', 'English'],
    ['auto_redact_aadhaar', 'enabled'],
    ['enforce_cgst_tax_lock', 'enabled']
  ];
  for (const [k, v] of tenantSettings) {
    await run(
      `INSERT OR REPLACE INTO tenant_settings (id, tenantId, settingKey, settingValue, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), TENANT_ID, k, v, new Date().toISOString()]
    );
  }

  // 17. SSO Settings
  await run(
    `INSERT INTO sso_settings (id, tenantId, provider, clientId, clientSecret, redirectUri, isEnabled, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['SSO-01', TENANT_ID, 'Google Workspace (aarogyaclinic.in)', 'accounts.google.com/aarogya-client-id', 'sec_aarogya_oauth_mock', 'https://aarogyaclinic.in/auth/google/callback', 1, new Date().toISOString()]
  );

  // 18. Branding Settings
  await run(
    `INSERT INTO branding_settings (id, tenantId, logoUrl, primaryColor, secondaryColor, companyName, faviconUrl, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['BRAND-01', TENANT_ID, '/images/aarogya-logo.svg', '#3b82f6', '#10b981', 'Aarogya Diagnostic Center', '/favicon.ico', new Date().toISOString()]
  );

  // 19. Organization Settings
  await run(
    `INSERT OR REPLACE INTO organization_settings (id, tenantId, organizationName, parentOrganization, country, industry, employeeCount, dataProcessingPurpose, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ORG-AAROGYA-01',
      TENANT_ID,
      'Aarogya Diagnostic Center',
      'Aarogya Healthcare Trust',
      'India',
      'Healthcare Diagnostics SME',
      18,
      'Clinical diagnostics, pathology blood panels, radiology reports, and statutory billing',
      new Date().toISOString()
    ]
  );

  // 20. Roles & Permissions
  const roles = [
    ['ROLE-01', TENANT_ID, 'SME Owner & Data Protection Officer', 'all:read,all:write,dsr:approve,taxlock:override,audit:verify', 1],
    ['ROLE-02', TENANT_ID, 'Clinic Receptionist', 'discovery:scan,consent:capture,dsr:intake,alerts:send', 1],
    ['ROLE-03', TENANT_ID, 'External DPDP Compliance Auditor', 'audit:read,audit:verify,reports:export,evidence:verify', 1]
  ];
  for (const ro of roles) {
    await run(
      `INSERT INTO role_permissions (id, tenantId, roleName, permissions, isSystem, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [...ro, new Date().toISOString()]
    );
  }

  // 21. Localization Settings
  const locs = [
    ['LOC-01', TENANT_ID, 'English', 1, JSON.stringify({ welcome: 'Welcome to Aarogya Privacy Portal', consentNotice: 'Healthcare Diagnostic & Patient Scheduling Notice' })],
    ['LOC-02', TENANT_ID, 'Kannada', 0, JSON.stringify({ welcome: 'ಆರೋಗ್ಯ ಗೌಪ್ಯತೆ ಪೋರ್ಟಲ್‌ಗೆ ಸುಸ್ವಾಗತ', consentNotice: 'ಆರೋಗ್ಯ ರೋಗನಿರ್ಣಯ ಮತ್ತು ನೇಮಕಾತಿ ಸೂಚನೆ' })],
    ['LOC-03', TENANT_ID, 'Hindi', 0, JSON.stringify({ welcome: 'आरोग्य गोपनीयता पोर्टल में आपका स्वागत है', consentNotice: 'आरोग्य डायग्नोस्टिक एवं रोगी परामर्श सूचना' })]
  ];
  for (const lc of locs) {
    await run(
      `INSERT INTO localization_settings (id, tenantId, language, isDefault, translations, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [...lc, new Date().toISOString()]
    );
  }

  // 22. Consent Purposes
  const purposes = [
    ['PURP-DIAGNOSTIC-REPORTING', TENANT_ID, 'Diagnostic Test Booking & Lab Report Dispatch', 'PURP-DIAGNOSTIC-REPORTING', 'Delivery of requested medical lab reports and appointment coordination via WhatsApp', 1],
    ['PURP-STATUTORY-BILLING', TENANT_ID, 'Statutory Tax Invoicing & GST Accounting', 'PURP-STATUTORY-BILLING', 'Commercial tax recording and GST filing compliance under CGST Act Section 36', 1],
    ['PURP-APPOINTMENT-REMINDERS', TENANT_ID, 'Appointment Fasting & Follow-up Reminders', 'PURP-APPOINTMENT-REMINDERS', 'Sending pre-test fasting instructions and sample collection alerts', 1]
  ];
  for (const purp of purposes) {
    await run(
      `INSERT INTO consent_purposes (id, tenantId, purposeName, purposeCode, description, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [...purp, new Date().toISOString()]
    );
  }

  // 23. Consent Preferences
  const preferences = [
    ['PREF-01', TENANT_ID, 'WhatsApp Lab Report Delivery', 'opt-in', 1],
    ['PREF-02', TENANT_ID, 'SMS Fasting & Appointment Alerts', 'opt-in', 1],
    ['PREF-03', TENANT_ID, 'Diagnostic Package Newsletter', 'opt-out', 0]
  ];
  for (const pf of preferences) {
    await run(
      `INSERT INTO consent_preferences (id, tenantId, preferenceName, preferenceValue, isGlobal, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [...pf, new Date().toISOString()]
    );
  }

  // 24. Consent Preference Centers
  await run(
    `INSERT INTO consent_preference_centers (id, tenantId, centerName, purposeIds, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['CPC-01', TENANT_ID, 'Aarogya Patient Self-Service Privacy Portal', 'PURP-DIAGNOSTIC-REPORTING,PURP-APPOINTMENT-REMINDERS', 1, new Date().toISOString()]
  );

  // 25. Consent Data Elements
  const dataElements = [
    ['CDE-01', TENANT_ID, 'Patient Aadhaar Number', 'GOVERNMENT_ID', 1],
    ['CDE-02', TENANT_ID, 'Clinical Blood Panel & Diagnostic Report', 'SPECIAL_CATEGORY_HEALTH', 1],
    ['CDE-03', TENANT_ID, 'Mobile Telephone Number', 'COMMUNICATION', 0],
    ['CDE-04', TENANT_ID, 'Referring Physician Prescription Notes', 'HEALTH_REQUISITION', 1]
  ];
  for (const de of dataElements) {
    await run(
      `INSERT INTO consent_data_elements (id, tenantId, elementName, elementType, isSensitive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [...de, new Date().toISOString()]
    );
  }

  // 26. Consent Policies
  await run(
    `INSERT INTO consent_policies (id, tenantId, policyName, policyText, version, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['CPOL-01', TENANT_ID, 'Aarogya Clinic DPDP Patient Privacy Policy v2.1', 'Under Section 5 of the DPDP Act 2023, Aarogya Diagnostic Center processes patient personal data strictly for medical diagnostic delivery and statutory tax compliance.', '2.1', 1, new Date().toISOString()]
  );

  // 27. Consent Portal Settings
  const portalSettings = [
    ['portal_title', 'Aarogya Diagnostic Center - Citizen Rights & Consent Center'],
    ['allow_anonymous_dsr', 'false'],
    ['require_phone_otp', 'true'],
    ['withdrawal_grace_period_days', '7']
  ];
  for (const [k, v] of portalSettings) {
    await run(
      `INSERT OR REPLACE INTO consent_portal_settings (id, tenantId, settingKey, settingValue, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), TENANT_ID, k, v, new Date().toISOString()]
    );
  }

  // 28. Cookie Scan Results
  const cookieScans = [
    ['CSCAN-01', TENANT_ID, 'https://aarogyaclinic.in', new Date(Date.now() - 86400000).toISOString(), 6, 2, 4, 'completed'],
    ['CSCAN-02', TENANT_ID, 'https://reports.aarogyaclinic.in', new Date(Date.now() - 43200000).toISOString(), 4, 2, 2, 'completed']
  ];
  for (const cs of cookieScans) {
    await run(
      `INSERT INTO cookie_scan_results (id, tenantId, websiteUrl, scanDate, cookieCount, necessaryCount, nonNecessaryCount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      cs
    );
  }

  // 29. Cookie Consent Logs
  const cookieLogs = [
    ['CLOG-01', TENANT_ID, 'sess_portal_patient_8819', 'ACCEPT_ESSENTIAL_ONLY', 'necessary,diagnostic_session', new Date(Date.now() - 3600000).toISOString()],
    ['CLOG-02', TENANT_ID, 'sess_web_visitor_4410', 'ACCEPT_ALL', 'necessary,analytics,preferences', new Date(Date.now() - 7200000).toISOString()]
  ];
  for (const cl of cookieLogs) {
    await run(
      `INSERT INTO cookie_consent_logs (id, tenantId, sessionId, action, cookieCategories, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      cl
    );
  }

  // 30. Cookie Banners
  await run(
    `INSERT INTO cookie_banners (id, tenantId, bannerName, bannerText, buttonText, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['CBAN-01', TENANT_ID, 'Aarogya Health Portal DPDP Cookie Notice', 'We use essential session cookies to authenticate your patient portal login and deliver laboratory reports securely under DPDP Act 2023.', 'Acknowledge & Accept', 1, new Date().toISOString()]
  );

  // 31. Cookie Geo Rules
  const geoRules = [
    ['GEO-01', TENANT_ID, 'IN', 'EXPLICIT_OPT_IN', 'Strict DPDP Act 2023 Consent Banner requirement for Indian residents', 1],
    ['GEO-02', TENANT_ID, 'DEFAULT', 'NOTIFICATION_ONLY', 'Informational cookie banner for international visitors', 1]
  ];
  for (const gr of geoRules) {
    await run(
      `INSERT INTO cookie_geo_rules (id, tenantId, countryCode, ruleType, ruleValue, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [...gr, new Date().toISOString()]
    );
  }

  console.log('  [+] Step 10B: Seeded Enterprise Subsystems (All 27 tables populated with Aarogya Healthcare data)');

  // 11. Seed Cryptographically Hash-Chained Audit Ledger
  const auditSequence = [
    {
      actor: 'Ramesh Kumar (SME_OWNER)',
      action: 'TENANT_INITIALIZED',
      resource: 'Aarogya Diagnostic Center',
      details: 'Registered SME Healthcare Fiduciary (GSTIN: 29AAAAA0000A1Z5, Indiranagar Bengaluru)'
    },
    {
      actor: 'Priya Sharma (RECEPTION_STAFF)',
      action: 'DISCOVERY_SCAN',
      resource: 'clinic_reception_chat.txt',
      details: '840 items scanned: Aadhaar, Blood Panels, Mobile numbers, Doctor notes'
    },
    {
      actor: 'Priya Sharma (RECEPTION_STAFF)',
      action: 'DISCOVERY_SCAN',
      resource: 'customer_leads.csv',
      details: '350 items scanned: Patient names, Mobile numbers, Consultation dates'
    },
    {
      actor: 'Priya Sharma (RECEPTION_STAFF)',
      action: 'DISCOVERY_SCAN',
      resource: 'invoices_billing.csv',
      details: '230 items scanned: Patient PAN, Diagnostic invoice amounts, GST records'
    },
    {
      actor: 'Ramesh Kumar (SME_OWNER)',
      action: 'ROPA_SYNTHESIS',
      resource: 'Section 8(4) Register',
      details: 'Synthesized 3 lawful processing activities across diagnostic workflows'
    },
    {
      actor: 'Deepa Nair',
      action: 'CONSENT_CAPTURED',
      resource: 'clinic_reception_chat.txt',
      details: 'Opted into lab report delivery via Section 5 multilingual WhatsApp notice'
    },
    {
      actor: 'Deepa Nair',
      action: 'DSR_INTAKE',
      resource: 'Public Portal (/dsr)',
      details: 'Ticket DSR-2026-8819 created for Section 12 right to erasure'
    },
    {
      actor: 'Ramesh Kumar (SME_OWNER)',
      action: 'TAX_LOCK_APPLIED',
      resource: 'invoices_billing.csv',
      details: 'CGST Act Sec 36 Retention Lock Applied until 2030-12-31 on INV-2024-309'
    },
    {
      actor: 'Ramesh Kumar (SME_OWNER)',
      action: 'DSR_ERASURE_EXECUTED',
      resource: 'Deepa Nair',
      details: 'Atomic redaction completed on WhatsApp chat & leads. Tax invoice locked. SHA-256 cert issued.'
    },
    {
      actor: 'Ramesh Kumar (SME_OWNER)',
      action: 'BREACH_INTIMATED',
      resource: 'INC-2026-9921',
      details: 'Statutory Form DPBI-IR1 72-Hour Regulatory Intimation Dossier generated under Rule 7'
    },
    {
      actor: 'Priya Sharma (RECEPTION_STAFF)',
      action: 'CITIZEN_ALERTS_PREPARED',
      resource: 'INC-2026-9921',
      details: 'Vulnerability-concealed reassurance alerts generated in English, Kannada, and Hindi'
    },
    {
      actor: 'Rajesh Iyer (AUDITOR)',
      action: 'AUDIT_VERIFIED',
      resource: 'audit_logs',
      details: 'Cryptographic SHA-256 hash chain verified 100% UNTAMPERED across all entries'
    }
  ];

  for (const entry of auditSequence) {
    await auditLogger.logEvent(TENANT_ID, entry.actor, entry.action, entry.resource, entry.details);
  }
  console.log(`  [+] Step 11: Seeded ${auditSequence.length} SHA-256 hash-chained audit ledger records`);

  // 12. Verify Audit Chain
  const chainVerification = await auditLogger.verifyAuditChain(TENANT_ID);
  console.log(`  [+] Step 12: Audit chain self-check: ${chainVerification.verified ? 'VERIFIED UNTAMPERED (✓)' : 'FAILED'}`);

  console.log('\n================================================================');
  console.log('  ⚡ DEMO SEEDING COMPLETE: Aarogya Diagnostic Center Ready!');
  console.log('  Live Walkthrough Armed for Srujana Tech Fest 2026');
  console.log('================================================================\n');

  return {
    success: true,
    tenantId: TENANT_ID,
    tenantName: 'Aarogya Diagnostic Center',
    silosCount: silos.length,
    totalPiiItems: 1420,
    dsrTicket: 'DSR-2026-8819',
    incidentId: 'INC-2026-9921',
    auditEntries: auditSequence.length,
    auditChainVerified: chainVerification.verified
  };
}

// Support direct terminal execution: node src/models/demoSeeder.js
if (require.main === module) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[DEMO_SEEDER_ERROR]', err);
      process.exit(1);
    });
}

module.exports = {
  seedDemoData,
  TENANT_ID
};
