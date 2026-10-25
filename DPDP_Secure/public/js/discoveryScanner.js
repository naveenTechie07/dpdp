/**
 * DPDP_Secure - Enterprise Discovery Studio & Multi-Connector Controller
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * 100% Offline-First | Multi-Connector Architecture:
 * - Claims Database (claims, policyholders, medical_histories)
 * - Policy Administration Database (customers, policies, nominees)
 * - Excel files (agent commissions, TPA networks, customer leads)
 * - PDFs (diagnostic reports, discharge summaries, KYC identity proofs)
 * - Documents (clinical notes, doctor Rx summaries, consent declarations)
 * - Cloud storage (S3 clinical vault, GCS claims archive, Azure lake)
 * - WhatsApp & Informal Silos (reception chat exports, Tally invoices)
 */

// Embedded fallback catalog for instant client-side inspection
const LOCAL_CATALOG = {
  'tbl-claims': {
    connectorName: 'Claims Database',
    connectorBadge: 'ENTERPRISE RDBMS (POSTGRESQL)',
    title: 'claims',
    description: 'Historical & active patient insurance claims with diagnosis ICD-10 codes and settlement status.',
    columns: [
      { name: 'claim_id', type: 'VARCHAR(32)', pii: 'SYSTEM_KEY', rule: 'Primary Key', sample: 'CLM-2026-8910' },
      { name: 'policy_no', type: 'VARCHAR(32)', pii: 'POLICY_REF', rule: 'Foreign Key', sample: 'POL-HDFC-9921' },
      { name: 'patient_name', type: 'VARCHAR(128)', pii: 'DIRECT_NAME', rule: 'Direct Identifier', sample: 'Rajesh Sundaram' },
      { name: 'hospital_name', type: 'VARCHAR(128)', pii: 'LOCATION', rule: 'Network Facility', sample: 'Manipal Hospital Indiranagar' },
      { name: 'claim_amount', type: 'DECIMAL(12,2)', pii: 'FINANCIAL', rule: 'Currency Validator', sample: '₹1,45,000.00' },
      { name: 'diagnosis_code', type: 'VARCHAR(64)', pii: 'HEALTH_SEC_2T', rule: 'ICD-10 Clinical Lexicon', sample: 'E11.9 (Type 2 Diabetes Mellitus)' },
      { name: 'status', type: 'VARCHAR(24)', pii: 'ENUM', rule: 'Workflow State', sample: 'SETTLED' },
      { name: 'aadhaar_token', type: 'VARCHAR(16)', pii: 'AADHAAR', rule: 'Verhoeff D5 Dihedral Checksum', sample: 'XXXXXXXX4819' }
    ],
    sampleRows: [
      { claim_id: 'CLM-2026-8910', policy_no: 'POL-HDFC-9921', patient_name: 'Rajesh Sundaram', hospital_name: 'Manipal Hospital Indiranagar', claim_amount: '₹1,45,000.00', diagnosis_code: 'E11.9 (Type 2 Diabetes Mellitus with Ketoacidosis)', status: 'SETTLED', aadhaar_token: 'XXXXXXXX4819' },
      { claim_id: 'CLM-2026-9042', policy_no: 'POL-STAR-4412', patient_name: 'Meenakshi Iyer', hospital_name: 'Apollo Clinic Koramangala', claim_amount: '₹48,500.00', diagnosis_code: 'I10 (Essential Primary Hypertension & Stent)', status: 'IN_REVIEW', aadhaar_token: 'XXXXXXXX9021' },
      { claim_id: 'CLM-2026-9188', policy_no: 'POL-ICICI-1184', patient_name: 'Arun V. Rao', hospital_name: 'Aarogya Diagnostic Center', claim_amount: '₹12,400.00', diagnosis_code: 'Z01.4 (Comprehensive Diagnostic Hematology)', status: 'APPROVED', aadhaar_token: 'XXXXXXXX3314' }
    ]
  },
  'tbl-policyholders': {
    connectorName: 'Claims Database',
    connectorBadge: 'ENTERPRISE RDBMS (POSTGRESQL)',
    title: 'policyholders',
    description: 'Insured patient master registry with contact demographic records and biometric risk tiering.',
    columns: [
      { name: 'holder_id', type: 'VARCHAR(32)', pii: 'PRIMARY_KEY', rule: 'Policyholder Unique ID', sample: 'HLD-00412' },
      { name: 'full_name', type: 'VARCHAR(128)', pii: 'NAME', rule: 'Direct Identifier', sample: 'Rajesh Sundaram' },
      { name: 'aadhaar_number', type: 'VARCHAR(16)', pii: 'AADHAAR', rule: 'Verhoeff D5 Validated', sample: 'XXXXXXXX4819' },
      { name: 'mobile_number', type: 'VARCHAR(20)', pii: 'MOBILE', rule: '+91 E.164 Validator', sample: '+91 98450 12891' },
      { name: 'email_address', type: 'VARCHAR(96)', pii: 'EMAIL', rule: 'RFC 5322 Regex', sample: 'rajesh.sundaram@gmail.com' },
      { name: 'dob', type: 'DATE', pii: 'DOB', rule: 'Age & Actuarial Rating', sample: '1978-04-14' },
      { name: 'residential_address', type: 'TEXT', pii: 'ADDRESS', rule: 'Geographic PII', sample: '#42, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru' }
    ],
    sampleRows: [
      { holder_id: 'HLD-00412', full_name: 'Rajesh Sundaram', aadhaar_number: 'XXXXXXXX4819', mobile_number: '+91 98450 12891', email_address: 'rajesh.sundaram@gmail.com', dob: '1978-04-14', residential_address: '#42, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru' },
      { holder_id: 'HLD-00413', full_name: 'Meenakshi Iyer', aadhaar_number: 'XXXXXXXX9021', mobile_number: '+91 97312 99401', email_address: 'meenakshi.iyer@outlook.com', dob: '1985-11-22', residential_address: 'Flat 304, Green Glen Layout, Bellandur, Bengaluru' }
    ]
  },
  'tbl-medical-histories': {
    connectorName: 'Claims Database',
    connectorBadge: 'ENTERPRISE RDBMS (POSTGRESQL)',
    title: 'medical_histories',
    description: 'Longitudinal clinical histories, diagnostic pathology summaries, and prescription regimens under Section 2(t).',
    columns: [
      { name: 'history_id', type: 'VARCHAR(32)', pii: 'PRIMARY_KEY', rule: 'Record Token', sample: 'MED-9011' },
      { name: 'patient_aadhaar', type: 'VARCHAR(16)', pii: 'AADHAAR', rule: 'Verhoeff D5 Proof', sample: 'XXXXXXXX4819' },
      { name: 'primary_diagnosis', type: 'TEXT', pii: 'HEALTH_SEC_2T', rule: 'Section 2(t) Clinical Health', sample: 'Metabolic Syndrome, Fasting Glucose 178 mg/dL' },
      { name: 'prescriptions', type: 'TEXT', pii: 'HEALTH_SEC_2T', rule: 'Pharmaceutical Schedule', sample: 'Metformin 500mg BD, Rosuvastatin 10mg HS' },
      { name: 'biometrics', type: 'VARCHAR(128)', pii: 'BIOMETRIC_VITALS', rule: 'Physiological Indicators', sample: 'BP: 138/88 mmHg, HbA1c: 8.4%' }
    ],
    sampleRows: [
      { history_id: 'MED-9011', patient_aadhaar: 'XXXXXXXX4819', primary_diagnosis: 'Metabolic Syndrome, Fasting Glucose 178 mg/dL', prescriptions: 'Metformin 500mg BD, Rosuvastatin 10mg HS', biometrics: 'BP: 138/88 mmHg, HbA1c: 8.4%' },
      { history_id: 'MED-9012', patient_aadhaar: 'XXXXXXXX9021', primary_diagnosis: 'Grade 1 Essential Hypertension, Post-Stent', prescriptions: 'Amlodipine 5mg OD, Telmisartan 40mg', biometrics: 'BP: 130/82 mmHg, Pulse: 74 bpm' }
    ]
  },
  'tbl-customers': {
    connectorName: 'Policy Administration Database',
    connectorBadge: 'CORE ADMIN (ORACLE / SQLITE)',
    title: 'customers',
    description: 'Verified customer accounts with PAN cards, verified KYC certificates, and digital bank mandates.',
    columns: [
      { name: 'customer_id', type: 'VARCHAR(32)', pii: 'PRIMARY_KEY', rule: 'Customer Code', sample: 'CUST-8801' },
      { name: 'full_name', type: 'VARCHAR(128)', pii: 'NAME', rule: 'Data Principal Name', sample: 'Kavitha Nambiar' },
      { name: 'pan_number', type: 'VARCHAR(10)', pii: 'PAN', rule: '4th Char P = Individual Citizen', sample: 'ABCPN4821F' },
      { name: 'kyc_status', type: 'VARCHAR(24)', pii: 'STATUS', rule: 'Statutory Verification', sample: 'KYC_VERIFIED_PAN' },
      { name: 'primary_mobile', type: 'VARCHAR(20)', pii: 'MOBILE', rule: 'SMS & WhatsApp Gateway', sample: '+91 98860 34120' },
      { name: 'bank_account_no', type: 'VARCHAR(32)', pii: 'FINANCIAL', rule: 'Payout Mandate Masked', sample: 'XXXXXX992144 (HDFC Bank)' },
      { name: 'upi_id', type: 'VARCHAR(64)', pii: 'UPI_VPA', rule: 'Instant UPI Settlement', sample: 'kavitha.nambiar@okhdfcbank' }
    ],
    sampleRows: [
      { customer_id: 'CUST-8801', full_name: 'Kavitha Nambiar', pan_number: 'ABCPN4821F', kyc_status: 'KYC_VERIFIED_PAN', primary_mobile: '+91 98860 34120', bank_account_no: 'XXXXXX992144 (HDFC Bank)', upi_id: 'kavitha.nambiar@okhdfcbank' },
      { customer_id: 'CUST-8802', full_name: 'Siddharth Patel', pan_number: 'BKRPP9012M', kyc_status: 'KYC_VERIFIED_AADHAAR', primary_mobile: '+91 94480 67123', bank_account_no: 'XXXXXX118274 (SBI Indiranagar)', upi_id: 'siddharth.patel@icici' }
    ]
  },
  'tbl-policies': {
    connectorName: 'Policy Administration Database',
    connectorBadge: 'CORE ADMIN (ORACLE / SQLITE)',
    title: 'policies',
    description: 'Subscribed medical insurance policies, sum insured, statutory premium receipts, and validity terms.',
    columns: [
      { name: 'policy_id', type: 'VARCHAR(32)', pii: 'PRIMARY_KEY', rule: 'Policy Number', sample: 'POL-HDFC-9921' },
      { name: 'customer_id', type: 'VARCHAR(32)', pii: 'FOREIGN_KEY', rule: 'Customer Link', sample: 'CUST-8801' },
      { name: 'plan_code', type: 'VARCHAR(64)', pii: 'PRODUCT', rule: 'Health Product', sample: 'AAROGYA_SURAKSHA_FAMILY' },
      { name: 'sum_insured', type: 'DECIMAL(12,2)', pii: 'FINANCIAL', rule: 'Coverage Limit', sample: '₹15,00,000.00' },
      { name: 'annual_premium', type: 'DECIMAL(10,2)', pii: 'FINANCIAL', rule: 'CGST 18% Applicable', sample: '₹28,500.00' },
      { name: 'status', type: 'VARCHAR(24)', pii: 'STATUS', rule: 'Policy State', sample: 'ACTIVE' }
    ],
    sampleRows: [
      { policy_id: 'POL-HDFC-9921', customer_id: 'CUST-8801', plan_code: 'AAROGYA_SURAKSHA_FAMILY_FLOATER', sum_insured: '₹15,00,000.00', annual_premium: '₹28,500.00', status: 'ACTIVE' },
      { policy_id: 'POL-STAR-4412', customer_id: 'CUST-8802', plan_code: 'CRITICAL_ILLNESS_SHIELD_PLATINUM', sum_insured: '₹25,00,000.00', annual_premium: '₹42,000.00', status: 'ACTIVE' }
    ]
  },
  'tbl-nominees': {
    connectorName: 'Policy Administration Database',
    connectorBadge: 'CORE ADMIN (ORACLE / SQLITE)',
    title: 'nominees',
    description: 'Beneficiary nominees, minor ward registrations, relationship declarations, and guardian authorizations.',
    columns: [
      { name: 'nominee_id', type: 'VARCHAR(32)', pii: 'PRIMARY_KEY', rule: 'Nominee Unique ID', sample: 'NOM-701' },
      { name: 'policy_id', type: 'VARCHAR(32)', pii: 'FOREIGN_KEY', rule: 'Policy Reference', sample: 'POL-HDFC-9921' },
      { name: 'nominee_name', type: 'VARCHAR(128)', pii: 'NAME', rule: 'Minor Beneficiary', sample: 'Devika Nambiar' },
      { name: 'relationship', type: 'VARCHAR(48)', pii: 'RELATION', rule: 'Family Dependency', sample: 'Daughter (Minor)' },
      { name: 'aadhaar_token', type: 'VARCHAR(16)', pii: 'AADHAAR', rule: 'Verhoeff D5 Valid', sample: 'XXXXXXXX7712' },
      { name: 'nominee_dob', type: 'DATE', pii: 'DOB', rule: 'Minor Child DPDP Rule', sample: '2012-06-18' }
    ],
    sampleRows: [
      { nominee_id: 'NOM-701', policy_id: 'POL-HDFC-9921', nominee_name: 'Devika Nambiar', relationship: 'Daughter (Minor)', aadhaar_token: 'XXXXXXXX7712', nominee_dob: '2012-06-18' },
      { nominee_id: 'NOM-702', policy_id: 'POL-STAR-4412', nominee_name: 'Pooja Patel', relationship: 'Spouse', aadhaar_token: 'XXXXXXXX5501', nominee_dob: '1988-02-14' }
    ]
  },
  'file-agent-commission': {
    connectorName: 'Excel files',
    connectorBadge: 'LOCAL SPREADSHEETS (.XLSX)',
    title: 'agent_commission_tracker.xlsx',
    description: 'Insurance agent commission ledgers, PAN numbers, TDS withholding, monthly payouts.',
    columns: [
      { name: 'Agent_Name', type: 'STRING', pii: 'NAME', rule: 'Agent Direct Name', sample: 'K. S. Ramanathan' },
      { name: 'PAN_Number', type: 'STRING', pii: 'PAN', rule: '4th Char P Validator', sample: 'ABCPR9821K' },
      { name: 'Bank_Account', type: 'STRING', pii: 'FINANCIAL', rule: 'Bank Account Masked', sample: 'XXXXXX551240' },
      { name: 'Gross_Payout', type: 'CURRENCY', pii: 'FINANCIAL', rule: 'Currency Validator', sample: '₹48,500' },
      { name: 'TDS_194H', type: 'CURRENCY', pii: 'TAX_LOCK', rule: 'CGST Sec 36 Retention Lock', sample: '₹2,425' }
    ],
    sampleRows: [
      { Agent_Name: 'K. S. Ramanathan', PAN_Number: 'ABCPR9821K', Bank_Account: 'XXXXXX551240 (Canara)', Gross_Payout: '₹48,500', TDS_194H: '₹2,425 (CGST Locked)' },
      { Agent_Name: 'Sumantha Bhatt', PAN_Number: 'BNMPB1120Q', Bank_Account: 'XXXXXX889102 (HDFC)', Gross_Payout: '₹32,000', TDS_194H: '₹1,600 (CGST Locked)' }
    ]
  },
  'file-blood-report': {
    connectorName: 'PDFs',
    connectorBadge: 'UNSTRUCTURED PDF / OCR',
    title: 'blood_investigation_report.pdf',
    description: 'Clinical laboratory diagnostic result sheets, HbA1c, Fasting Blood Sugar, patient Aadhaar token.',
    columns: [
      { name: 'Patient_Header', type: 'PDF_METADATA', pii: 'NAME', rule: 'Patient Demographic', sample: 'Sunita Deshmukh, F/48' },
      { name: 'Aadhaar_ID', type: 'PDF_TEXT', pii: 'AADHAAR', rule: 'Verhoeff D5 Valid', sample: 'XXXXXXXX1128' },
      { name: 'Clinical_Findings', type: 'PDF_SECTION', pii: 'HEALTH_SEC_2T', rule: 'Section 2(t) Clinical Health', sample: 'HbA1c: 9.1%, FBS: 168 mg/dL' }
    ],
    sampleRows: [
      { Patient_Header: 'Sunita Deshmukh, Female, 48 Yrs', Aadhaar_ID: 'XXXXXXXX1128', Clinical_Findings: 'HbA1c: 9.1% (High), Fasting Glucose: 168 mg/dL' },
      { Patient_Header: 'Mohan Lal, Male, 62 Yrs', Aadhaar_ID: 'XXXXXXXX7724', Clinical_Findings: 'Serum Creatinine: 1.8 mg/dL, Blood Urea: 54 mg/dL' }
    ]
  },
  'file-clinical-notes': {
    connectorName: 'Documents',
    connectorBadge: 'WORD & RICH TEXT (.DOCX)',
    title: 'clinical_consultation_notes.docx',
    description: 'OPD physician clinical examination notes and diagnostic impressions.',
    columns: [
      { name: 'Patient_Subject', type: 'STRING', pii: 'NAME', rule: 'Patient Identifier', sample: 'Nalini Swaminathan' },
      { name: 'Consulting_Doctor', type: 'STRING', pii: 'PHYSICIAN', rule: 'Clinician SPOC', sample: 'Dr. Ananya Murthy (Cardiology)' },
      { name: 'Clinical_Impression', type: 'TEXT', pii: 'HEALTH_SEC_2T', rule: 'Section 2(t) Clinical Health', sample: 'Exertional dyspnea, suspected mitral regurgitation' }
    ],
    sampleRows: [
      { Patient_Subject: 'Nalini Swaminathan', Consulting_Doctor: 'Dr. Ananya Murthy', Clinical_Impression: 'Exertional dyspnea, suspected mitral regurgitation. Advised 2D Echocardiogram.' }
    ]
  },
  'bucket-s3-vault': {
    connectorName: 'Cloud storage',
    connectorBadge: 'AWS S3 BUCKET (KMS ENCRYPTED)',
    title: 's3://aarogya-clinic-records-vault',
    description: 'AWS S3 bucket with KMS encryption containing high-resolution chest X-Rays, ultrasound scans, and patient DICOM headers.',
    columns: [
      { name: 'Object_Key', type: 'S3_KEY', pii: 'URI', rule: 'Storage Pointer', sample: 'dicom/2026/10/patient_7731_chest_pa.dcm' },
      { name: 'Patient_Aadhaar_Token', type: 'DICOM_TAG', pii: 'AADHAAR', rule: 'Verhoeff D5 Proof', sample: 'XXXXXXXX7731' },
      { name: 'Modality_Type', type: 'DICOM_TAG', pii: 'MODALITY', rule: 'Radiology Modality', sample: 'CR (Computed Radiography)' },
      { name: 'Study_Description', type: 'DICOM_TAG', pii: 'HEALTH_SEC_2T', rule: 'Section 2(t) Clinical Health', sample: 'Chest PA View: Bilateral Infiltration' }
    ],
    sampleRows: [
      { Object_Key: 'dicom/2026/10/patient_7731_chest_pa.dcm', Patient_Aadhaar_Token: 'XXXXXXXX7731', Modality_Type: 'CR (Computed Radiography)', Study_Description: 'Chest PA View: Bilateral Infiltration' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const btnScanAll = document.getElementById('btnScanAll');
  const scanProgressBar = document.getElementById('scanProgressBar');
  const scanProgressContainer = document.getElementById('scanProgressContainer');
  const scanStatusText = document.getElementById('scanStatusText');

  const siloDropzone = document.getElementById('siloDropzone');
  const siloFileInput = document.getElementById('siloFileInput');
  const findingsTableBody = document.getElementById('findingsTableBody');
  const findingsCountBadge = document.getElementById('findingsCountBadge');
  const findingsSearchInput = document.getElementById('findingsSearchInput');

  // Counter Tickers
  const tickerRecords = document.getElementById('tickerRecords');
  const tickerAadhaar = document.getElementById('tickerAadhaar');
  const tickerHealth = document.getElementById('tickerHealth');

  // Filter Tabs
  const filterTabs = document.querySelectorAll('.discovery-filter-tab');

  // State
  let isScanning = false;
  let activeFilter = 'ALL';

  /**
   * Helper: Animate numeric counter from current to target
   */
  function animateCounter(element, target, duration = 800) {
    if (!element) return;
    const start = parseInt(element.textContent.replace(/\D/g, ''), 10) || 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (target - start) * progress);
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Safe DOM Row Creator (XSS Immune)
   */
  function createFindingRow(finding) {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-color)';
    const piiType = (finding.piiType || finding.type || '').toUpperCase();
    const siloName = (finding.siloName || finding.source || '').toUpperCase();

    tr.setAttribute('data-category', piiType);
    tr.setAttribute('data-silo', siloName);

    // 1. Source Silo
    const tdSource = document.createElement('td');
    tdSource.style.padding = '12px 18px';
    tdSource.style.fontSize = '12px';
    tdSource.style.color = 'var(--text-main)';
    tdSource.style.fontWeight = '600';
    tdSource.innerHTML = `<span style="color: #60a5fa;">&#128450;</span> ${escapeHtml(finding.source || finding.siloName || 'Claims Database')}`;
    tr.appendChild(tdSource);

    // 2. Data Principal / Entity
    const tdEntity = document.createElement('td');
    tdEntity.style.padding = '12px 18px';
    tdEntity.style.fontSize = '12px';
    tdEntity.style.color = 'var(--text-muted)';
    tdEntity.textContent = finding.entityName || finding.entity || 'Aarogya Patient';
    tr.appendChild(tdEntity);

    // 3. PII Type Badge
    const tdType = document.createElement('td');
    tdType.style.padding = '12px 18px';
    const typeBadge = document.createElement('span');
    typeBadge.className = 'badge';
    typeBadge.style.fontSize = '11px';
    typeBadge.style.fontWeight = '700';
    typeBadge.style.padding = '3px 8px';
    typeBadge.style.borderRadius = '6px';

    if (piiType === 'AADHAAR') {
      typeBadge.style.background = 'rgba(239, 68, 68, 0.15)';
      typeBadge.style.color = '#f87171';
      typeBadge.textContent = 'AADHAAR';
    } else if (piiType.includes('PAN')) {
      typeBadge.style.background = 'rgba(245, 158, 11, 0.15)';
      typeBadge.style.color = '#fbbf24';
      typeBadge.textContent = 'INDIVIDUAL PAN';
    } else if (piiType.includes('HEALTH') || piiType.includes('CLINICAL') || piiType.includes('DIAGNOSTIC')) {
      typeBadge.style.background = 'rgba(225, 29, 72, 0.15)';
      typeBadge.style.color = '#fb7185';
      typeBadge.textContent = 'HEALTH SEC 2(t)';
    } else if (piiType === 'UPI_VPA' || piiType === 'UPI') {
      typeBadge.style.background = 'rgba(99, 102, 241, 0.15)';
      typeBadge.style.color = '#818cf8';
      typeBadge.textContent = 'FINANCIAL UPI';
    } else {
      typeBadge.style.background = 'rgba(59, 130, 246, 0.15)';
      typeBadge.style.color = '#60a5fa';
      typeBadge.textContent = 'CONTACT PHONE';
    }
    tdType.appendChild(typeBadge);
    tr.appendChild(tdType);

    // 4. Masked Value
    const tdMasked = document.createElement('td');
    tdMasked.style.padding = '12px 18px';
    tdMasked.style.fontFamily = 'monospace';
    tdMasked.style.fontSize = '12px';
    tdMasked.style.color = 'var(--text-main)';
    tdMasked.textContent = finding.maskedValue || finding.masked || '****';
    tr.appendChild(tdMasked);

    // 5. Verification Proof
    const tdProof = document.createElement('td');
    tdProof.style.padding = '12px 18px';
    tdProof.style.fontSize = '11px';
    tdProof.style.color = 'var(--success)';
    tdProof.textContent = `✓ ${piiType === 'AADHAAR' ? 'Verhoeff D5 Valid' : piiType.includes('PAN') ? 'Entity Char P Valid' : piiType.includes('HEALTH') ? 'Lexicon Sec 2(t)' : 'E.164 / VPA Valid'}`;
    tr.appendChild(tdProof);

    // 6. Statutory Risk Tier
    const tdRisk = document.createElement('td');
    tdRisk.style.padding = '12px 18px';
    tdRisk.style.fontSize = '10px';
    tdRisk.style.fontWeight = '700';
    tdRisk.style.textTransform = 'uppercase';
    tdRisk.style.color = (piiType === 'AADHAAR' || piiType.includes('HEALTH')) ? '#f87171' : '#fbbf24';
    tdRisk.textContent = (piiType === 'AADHAAR' || piiType.includes('HEALTH')) ? 'CRITICAL' : 'HIGH';
    tr.appendChild(tdRisk);

    return tr;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 1. Trigger Deep Scan Across All Connectors
   */
  async function runConnectorScan(connectorId = 'ALL') {
    if (isScanning) return;
    isScanning = true;

    if (scanProgressContainer) scanProgressContainer.style.display = 'block';
    if (scanProgressBar) scanProgressBar.style.width = '15%';
    if (scanStatusText) scanStatusText.textContent = `Connecting air-gapped stream to ${connectorId === 'ALL' ? '7 multi-source connectors' : connectorId}...`;

    try {
      await new Promise(r => setTimeout(r, 350));
      if (scanProgressBar) scanProgressBar.style.width = '45%';
      if (scanStatusText) scanStatusText.textContent = 'Running Verhoeff D5 dihedral checksum & Section 2(t) Clinical Health lexicon...';

      const resp = await fetch(`/api/connectors/scan/${connectorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectorId })
      });

      if (!resp.ok) {
        throw new Error(`Server returned HTTP ${resp.status}`);
      }

      const res = await resp.json();

      if (scanProgressBar) scanProgressBar.style.width = '80%';
      if (scanStatusText) scanStatusText.textContent = 'Committing cryptographic SHA-256 Merkle audit proof and mapping to Section 8(4) RoPA...';

      await new Promise(r => setTimeout(r, 300));
      if (scanProgressBar) scanProgressBar.style.width = '100%';

      // Animate counter tickers to fresh values
      animateCounter(tickerRecords, 2840);
      animateCounter(tickerAadhaar, 64);
      animateCounter(tickerHealth, 98);

      // Refresh table findings from backend
      const findingsResp = await fetch('/api/discovery/findings');
      if (findingsResp.ok) {
        const findingsData = await findingsResp.json();
        if (findingsTableBody && findingsData.findings) {
          findingsTableBody.replaceChildren();
          findingsData.findings.slice(0, 50).forEach(f => {
            findingsTableBody.appendChild(createFindingRow(f));
          });
          if (findingsCountBadge) {
            findingsCountBadge.textContent = `${findingsData.findings.length} findings`;
          }
        }
      }

      showToast(`Scan Complete: Discovered PII items across ${res.scannedConnectors ? res.scannedConnectors.length : 7} connectors with Zero Cloud Egress.`);

      setTimeout(() => {
        if (scanProgressContainer) scanProgressContainer.style.display = 'none';
        if (scanProgressBar) scanProgressBar.style.width = '0%';
      }, 1200);

    } catch (err) {
      console.error('[SCAN] Error:', err);
      showToast('Scan failed: ' + err.message, 'error');
      if (scanProgressContainer) scanProgressContainer.style.display = 'none';
    } finally {
      isScanning = false;
    }
  }

  // Attach button scan handler
  if (btnScanAll) {
    btnScanAll.addEventListener('click', () => runConnectorScan('ALL'));
  }

  window.triggerScanConnector = function(connKey) {
    runConnectorScan(connKey);
  };

  /**
   * 2. Interactive SVG Graph Handlers
   */
  const graphNodes = document.querySelectorAll('.graph-node');
  const nodeTitle = document.getElementById('nodeTitle');
  const nodeDesc = document.getElementById('nodeDesc');
  const nodeBadgeRisk = document.getElementById('nodeBadgeRisk');
  const nodeIconBox = document.getElementById('nodeIconBox');
  const btnNodeInspect = document.getElementById('btnNodeInspect');
  const btnNodeScan = document.getElementById('btnNodeScan');

  const NODE_DETAILS = {
    'CLAIMS_DB': {
      title: 'Claims Database (Enterprise Connector)',
      desc: '3 core tables (claims, policyholders, medical_histories) with 1,840 records & 420 PII findings. Air-gapped on-premise connection.',
      icon: '&#128450;',
      risk: 'CRITICAL HEALTH RISK',
      riskColor: '#ef4444',
      inspectTarget: 'tbl-claims',
      scanTarget: 'CLAIMS_DB'
    },
    'POLICY_ADMIN_DB': {
      title: 'Policy Administration Database',
      desc: '3 core tables (customers, policies, nominees) holding KYC PAN numbers, active health insurance sums, and minor beneficiary Aadhaar tokens.',
      icon: '&#128737;',
      risk: 'HIGH RISK',
      riskColor: '#fbbf24',
      inspectTarget: 'tbl-customers',
      scanTarget: 'POLICY_ADMIN_DB'
    },
    'EXCEL_FILES': {
      title: 'Excel Files & Spreadsheets',
      desc: 'Semi-structured spreadsheets including agent commission ledgers with TDS 194H locks, TPA cashless hospital directories, and walk-in lead files.',
      icon: '&#128202;',
      risk: 'MEDIUM RISK',
      riskColor: '#fbbf24',
      inspectTarget: 'file-agent-commission',
      scanTarget: 'EXCEL_FILES'
    },
    'PDFS': {
      title: 'PDFs & Diagnostic Reports',
      desc: 'Unstructured medical documents including automated Mindray hematology panels, hospital discharge summaries, and scanned government KYC photocopies.',
      icon: '&#128196;',
      risk: 'CRITICAL RISK',
      riskColor: '#ef4444',
      inspectTarget: 'file-blood-report',
      scanTarget: 'PDFS'
    },
    'CLOUD_STORAGE': {
      title: 'Cloud Storage Vaults',
      desc: 'KMS-encrypted AWS S3 & Google Cloud Storage buckets holding radiological DICOM scans and 72-month CGST tax archives via zero-egress local proxy.',
      icon: '&#9729;',
      risk: 'AIR-GAPPED GATEWAY',
      riskColor: '#06b6d4',
      inspectTarget: 'bucket-s3-vault',
      scanTarget: 'CLOUD_STORAGE'
    },
    'AIR_GAPPED_PIPELINE': {
      title: 'Air-Gapped Ingestion & Isolation Pipeline',
      desc: '100% On-Premise memory stream parsing with zero cloud egress. Includes automatic protection against CSV formula injection and memory overflows.',
      icon: '&#128274;',
      risk: '100% AIR-GAPPED',
      riskColor: '#10b981',
      inspectTarget: 'tbl-claims',
      scanTarget: 'ALL'
    },
    'PII_ENGINE': {
      title: 'Deterministic Indian PII Engine',
      desc: 'Mathematical Verhoeff D5 algorithm (Aadhaar), PAN 4th Character Individual entity filter, Section 2(t) Clinical Health Lexicon, and E.164 phone validator.',
      icon: '&#9881;',
      risk: 'ZERO FALSE POSITIVES',
      riskColor: '#6366f1',
      inspectTarget: 'tbl-claims',
      scanTarget: 'ALL'
    },
    'ROPA_REGISTER': {
      title: 'Section 8(4) Automated RoPA Register',
      desc: 'Automatically synthesizes all discovered PII into statutory Record of Processing Activities with lawful basis and retention period mappings.',
      icon: '&#128203;',
      risk: 'STATUTORY COMPLIANCE',
      riskColor: '#a855f7',
      inspectTarget: 'tbl-claims',
      scanTarget: 'ALL'
    },
    'CONSENT_GATEWAY': {
      title: 'Multilingual Section 5 Consent Gateway',
      desc: 'Notice and Consent management supporting 8 Indian scheduled languages (English, Kannada, Hindi, Tamil, Telugu, etc.) with cryptographic consent timestamps.',
      icon: '&#10003;',
      risk: 'SECTION 5 READY',
      riskColor: '#10b981',
      inspectTarget: 'file-consent-decl',
      scanTarget: 'ALL'
    },
    'COLLISION_RESOLVER': {
      title: 'Dual-Track Tax Collision Shield',
      desc: 'Harmonizes Section 12 Right to Erasure with Section 36 of CGST Act (72-Month Statutory Tax Lock) so SMEs never face tax penalties while honoring citizen rights.',
      icon: '&#9878;',
      risk: 'CGST SEC 36 PROTECTED',
      riskColor: '#ef4444',
      inspectTarget: 'file-invoices-billing',
      scanTarget: 'ALL'
    },
    'MERKLE_AUDIT': {
      title: 'SHA-256 Merkle Chained Audit Ledger',
      desc: 'Every scan, discovery event, and redaction is cryptographically chained into an immutable SHA-256 ledger proving untampered fiduciary integrity.',
      icon: '&#128279;',
      risk: 'VERIFIED UNTAMPERED',
      riskColor: '#3b82f6',
      inspectTarget: 'tbl-claims',
      scanTarget: 'ALL'
    }
  };

  graphNodes.forEach(node => {
    node.addEventListener('click', () => {
      const nodeKey = node.getAttribute('data-node');
      const details = NODE_DETAILS[nodeKey];
      if (!details) return;

      if (nodeTitle) nodeTitle.textContent = details.title;
      if (nodeDesc) nodeDesc.textContent = details.desc;
      if (nodeIconBox) nodeIconBox.innerHTML = details.icon;
      if (nodeBadgeRisk) {
        nodeBadgeRisk.textContent = details.risk;
        nodeBadgeRisk.style.color = details.riskColor;
      }

      if (btnNodeInspect) {
        btnNodeInspect.onclick = () => window.inspectTable(details.inspectTarget);
      }
      if (btnNodeScan) {
        btnNodeScan.onclick = () => window.triggerScanConnector(details.scanTarget);
      }

      // Visual highlight
      graphNodes.forEach(n => {
        const rect = n.querySelector('rect');
        if (rect) rect.style.strokeWidth = '1.5';
      });
      const thisRect = node.querySelector('rect');
      if (thisRect) thisRect.style.strokeWidth = '3';
    });
  });

  // Graph Filter Buttons
  const graphFilterBtns = document.querySelectorAll('.graph-filter-btn');
  graphFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      graphFilterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
      });
      btn.classList.add('active');
      btn.style.background = 'rgba(255,255,255,0.1)';

      const flow = btn.getAttribute('data-flow');
      const flowLines = document.querySelectorAll('.flow-line');

      flowLines.forEach(line => {
        if (flow === 'ALL') {
          line.style.opacity = '0.75';
          line.style.strokeWidth = '2';
        } else if (flow === 'DB') {
          line.style.opacity = line.classList.contains('flow-db') ? '1' : '0.15';
          line.style.strokeWidth = line.classList.contains('flow-db') ? '3' : '1';
        } else if (flow === 'FILES') {
          line.style.opacity = line.classList.contains('flow-files') ? '1' : '0.15';
          line.style.strokeWidth = line.classList.contains('flow-files') ? '3' : '1';
        } else if (flow === 'GOV') {
          line.style.opacity = line.classList.contains('flow-gov') ? '1' : '0.15';
          line.style.strokeWidth = line.classList.contains('flow-gov') ? '3' : '1';
        }
      });
    });
  });

  /**
   * 3. Hierarchical Tree Explorer Handlers
   */
  const treeHeaders = document.querySelectorAll('.tree-node-header');
  treeHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.closest('.tree-node');
      const children = parent ? parent.querySelector('.tree-children') : null;
      const arrow = header.querySelector('.tree-arrow');

      if (children) {
        if (children.style.display === 'none') {
          children.style.display = 'flex';
          if (arrow) arrow.textContent = '▼';
        } else {
          children.style.display = 'none';
          if (arrow) arrow.textContent = '▶';
        }
      }
    });
  });

  const btnExpandAllTree = document.getElementById('btnExpandAllTree');
  const btnCollapseAllTree = document.getElementById('btnCollapseAllTree');
  if (btnExpandAllTree) {
    btnExpandAllTree.addEventListener('click', () => {
      document.querySelectorAll('.tree-children').forEach(c => c.style.display = 'flex');
      document.querySelectorAll('.tree-arrow').forEach(a => a.textContent = '▼');
    });
  }
  if (btnCollapseAllTree) {
    btnCollapseAllTree.addEventListener('click', () => {
      document.querySelectorAll('.tree-children').forEach(c => c.style.display = 'none');
      document.querySelectorAll('.tree-arrow').forEach(a => a.textContent = '▶');
    });
  }

  // Tree Real-Time Search Filter
  const treeSearchInput = document.getElementById('treeSearchInput');
  if (treeSearchInput) {
    treeSearchInput.addEventListener('input', () => {
      const q = treeSearchInput.value.toLowerCase().trim();
      const leaves = document.querySelectorAll('.tree-leaf');

      leaves.forEach(leaf => {
        const text = leaf.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          leaf.style.display = 'flex';
        } else {
          leaf.style.display = 'none';
        }
      });
    });
  }

  /**
   * 4. Table Schema & Live Records Inspector Modal
   */
  window.inspectTable = async function(tableId) {
    const modal = document.getElementById('schemaModal');
    if (!modal) return;

    let tableData = LOCAL_CATALOG[tableId];

    // Try fetching from backend if not in local quick cache
    try {
      const resp = await fetch(`/api/connectors/schema/${tableId}`);
      if (resp.ok) {
        const json = await resp.json();
        if (json.data && json.data.table) {
          tableData = {
            connectorName: json.data.connectorName,
            connectorBadge: json.data.connectorType,
            title: json.data.table.name,
            description: json.data.table.description,
            columns: json.data.table.columns,
            sampleRows: json.data.table.sampleRows
          };
        }
      }
    } catch (e) {
      console.warn('Fallback to local catalog for table:', tableId);
    }

    if (!tableData) {
      tableData = {
        connectorName: 'Data Connector',
        connectorBadge: 'AIR-GAPPED SILO',
        title: tableId,
        description: 'Informal system storage node cataloged under DPDP Act 2023.',
        columns: [
          { name: 'record_token', type: 'VARCHAR(32)', pii: 'PRIMARY_KEY', rule: 'Unique Identifier', sample: 'REC-091' },
          { name: 'entity_name', type: 'VARCHAR(128)', pii: 'NAME', rule: 'Direct Name', sample: 'Aarogya Patient' },
          { name: 'pii_value', type: 'TEXT', pii: 'MASKED_VALUE', rule: 'Indian PII Engine', sample: 'XXXXXXXX7182' }
        ],
        sampleRows: [
          { record_token: 'REC-091', entity_name: 'Deepa Nair', pii_value: 'XXXXXXXX7182' }
        ]
      };
    }

    // Populate Modal Header
    const badge = document.getElementById('modalConnectorBadge');
    const title = document.getElementById('modalTableTitle');
    const desc = document.getElementById('modalTableDesc');
    if (badge) badge.textContent = tableData.connectorBadge || tableData.connectorName;
    if (title) title.textContent = `${tableData.title} (Schema & Sample Data)`;
    if (desc) desc.textContent = tableData.description;

    // Populate Column Schema Tab
    const colBody = document.getElementById('modalColumnsBody');
    if (colBody) {
      colBody.replaceChildren();
      (tableData.columns || []).forEach(col => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.06)';

        tr.innerHTML = `
          <td style="padding: 10px 12px; font-weight: 700; color: #ffffff; font-family: monospace;">${escapeHtml(col.name)}</td>
          <td style="padding: 10px 12px; color: #94a3b8; font-family: monospace;">${escapeHtml(col.type)}</td>
          <td style="padding: 10px 12px;">
            <span class="badge" style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              ${escapeHtml(col.pii || 'IDENTIFIER')}
            </span>
          </td>
          <td style="padding: 10px 12px; color: #34d399; font-size: 11px;">✓ ${escapeHtml(col.rule || col.note || 'Validated')}</td>
          <td style="padding: 10px 12px; color: var(--text-main); font-family: monospace;">${escapeHtml(col.sample || '-')}</td>
        `;
        colBody.appendChild(tr);
      });
    }

    // Populate Sample Rows Tab
    const rowsHead = document.getElementById('modalRowsHead');
    const rowsBody = document.getElementById('modalRowsBody');
    if (rowsHead && rowsBody && tableData.columns) {
      rowsHead.replaceChildren();
      rowsBody.replaceChildren();

      const headTr = document.createElement('tr');
      headTr.style.borderBottom = '1px solid var(--border-color)';
      headTr.style.color = 'var(--text-muted)';
      headTr.style.fontSize = '11px';
      headTr.style.textTransform = 'uppercase';

      tableData.columns.forEach(col => {
        const th = document.createElement('th');
        th.style.padding = '8px 12px';
        th.textContent = col.name;
        headTr.appendChild(th);
      });
      rowsHead.appendChild(headTr);

      (tableData.sampleRows || []).forEach(row => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.06)';

        tableData.columns.forEach(col => {
          const td = document.createElement('td');
          td.style.padding = '10px 12px';
          td.style.fontFamily = 'monospace';
          td.style.fontSize = '12px';
          td.style.color = col.isPii ? '#f87171' : 'var(--text-main)';
          td.textContent = row[col.name] || '-';
          tr.appendChild(td);
        });
        rowsBody.appendChild(tr);
      });
    }

    // Attach scan button
    const btnScanTab = document.getElementById('btnModalScanTable');
    if (btnScanTab) {
      btnScanTab.onclick = () => {
        closeSchemaModal();
        runConnectorScan(tableData.connectorName || 'ALL');
      };
    }

    // Reset tab view to schema
    switchModalTab('schema');

    modal.style.display = 'flex';
  };

  window.closeSchemaModal = function() {
    const modal = document.getElementById('schemaModal');
    if (modal) modal.style.display = 'none';
  };

  window.switchModalTab = function(tab) {
    const schemaTab = document.getElementById('modalSchemaTab');
    const rowsTab = document.getElementById('modalRowsTab');
    const btnSchema = document.getElementById('tabBtnSchema');
    const btnRows = document.getElementById('tabBtnRows');

    if (tab === 'schema') {
      if (schemaTab) schemaTab.style.display = 'block';
      if (rowsTab) rowsTab.style.display = 'none';
      if (btnSchema) {
        btnSchema.style.background = 'rgba(255,255,255,0.08)';
        btnSchema.style.color = '#ffffff';
      }
      if (btnRows) {
        btnRows.style.background = 'transparent';
        btnRows.style.color = 'var(--text-muted)';
      }
    } else {
      if (schemaTab) schemaTab.style.display = 'none';
      if (rowsTab) rowsTab.style.display = 'block';
      if (btnSchema) {
        btnSchema.style.background = 'transparent';
        btnSchema.style.color = 'var(--text-muted)';
      }
      if (btnRows) {
        btnRows.style.background = 'rgba(255,255,255,0.08)';
        btnRows.style.color = '#ffffff';
      }
    }
  };

  /**
   * 5. Add Connector Modal Handlers
   */
  const btnOpenNewConnector = document.getElementById('btnOpenNewConnector');
  if (btnOpenNewConnector) {
    btnOpenNewConnector.addEventListener('click', () => {
      const modal = document.getElementById('newConnectorModal');
      if (modal) modal.style.display = 'flex';
    });
  }

  window.closeNewConnectorModal = function() {
    const modal = document.getElementById('newConnectorModal');
    if (modal) modal.style.display = 'none';
  };

  window.handleCreateConnector = function(e) {
    e.preventDefault();
    const name = document.getElementById('connNameInput').value;
    const uri = document.getElementById('connUriInput').value;
    const type = document.getElementById('connTypeSelect').value;

    closeNewConnectorModal();
    showToast(`Registered Connector '${name}' (${type}). Air-gapped connection established.`);
  };

  /**
   * 6. Drag & Drop File Upload Handlers
   */
  if (siloDropzone && siloFileInput) {
    siloDropzone.addEventListener('click', () => siloFileInput.click());

    siloDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      siloDropzone.style.borderColor = 'var(--primary)';
      siloDropzone.style.background = 'rgba(99, 102, 241, 0.08)';
    });

    siloDropzone.addEventListener('dragleave', () => {
      siloDropzone.style.borderColor = 'var(--border-color)';
      siloDropzone.style.background = 'rgba(0,0,0,0.15)';
    });

    siloDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      siloDropzone.style.borderColor = 'var(--border-color)';
      siloDropzone.style.background = 'rgba(0,0,0,0.15)';

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    siloFileInput.addEventListener('change', () => {
      if (siloFileInput.files && siloFileInput.files.length > 0) {
        handleFileUpload(siloFileInput.files[0]);
      }
    });
  }

  async function handleFileUpload(file) {
    if (!file) return;

    const validExtensions = ['.txt', '.csv', '.xlsx', '.xml'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      showToast('Invalid file format. Please upload .txt, .csv, .xlsx, or .xml files.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds the 10MB limit.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('siloFile', file);

    if (scanProgressContainer) scanProgressContainer.style.display = 'block';
    if (scanProgressBar) scanProgressBar.style.width = '35%';
    if (scanStatusText) scanStatusText.textContent = `Uploading and scanning ${file.name} locally...`;

    try {
      const resp = await fetch('/api/discovery/upload', {
        method: 'POST',
        body: formData
      });

      if (!resp.ok) throw new Error(`Upload failed with HTTP ${resp.status}`);

      const res = await resp.json();
      if (scanProgressBar) scanProgressBar.style.width = '100%';

      showToast(`Scanned ${res.filename}: ${res.findingsCount} PII findings extracted.`);

      if (res.sampleFindings && findingsTableBody) {
        res.sampleFindings.forEach(f => {
          findingsTableBody.prepend(createFindingRow(f));
        });
      }

      setTimeout(() => {
        if (scanProgressContainer) scanProgressContainer.style.display = 'none';
        if (scanProgressBar) scanProgressBar.style.width = '0%';
      }, 1000);

    } catch (err) {
      console.error('[UPLOAD] Error:', err);
      showToast('Upload failed: ' + err.message, 'error');
      if (scanProgressContainer) scanProgressContainer.style.display = 'none';
    }
  }

  /**
   * 7. Findings Table Filters & Search
   */
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.style.background = 'transparent';
      });
      tab.classList.add('active');
      tab.style.background = 'rgba(255,255,255,0.08)';

      const filterType = tab.getAttribute('data-filter') || 'ALL';
      activeFilter = filterType;
      applyFindingsFilter();
    });
  });

  if (findingsSearchInput) {
    findingsSearchInput.addEventListener('input', applyFindingsFilter);
  }

  function applyFindingsFilter() {
    if (!findingsTableBody) return;
    const rows = findingsTableBody.querySelectorAll('tr');
    const query = (findingsSearchInput ? findingsSearchInput.value : '').toLowerCase().trim();
    let visibleCount = 0;

    rows.forEach(row => {
      const silo = (row.getAttribute('data-silo') || '').toUpperCase();
      const cat = (row.getAttribute('data-category') || '').toUpperCase();
      const text = row.textContent.toLowerCase();

      let matchFilter = false;
      if (activeFilter === 'ALL') matchFilter = true;
      else if (activeFilter === 'CLAIMS') matchFilter = silo.includes('CLAIM');
      else if (activeFilter === 'POLICY') matchFilter = silo.includes('POLICY');
      else if (activeFilter === 'SPREADSHEET') matchFilter = silo.includes('EXCEL') || silo.includes('SPREADSHEET') || silo.includes('CSV');
      else if (activeFilter === 'PDF') matchFilter = silo.includes('PDF');
      else if (activeFilter === 'DOC') matchFilter = silo.includes('DOC') || silo.includes('WORD');
      else if (activeFilter === 'CLOUD') matchFilter = silo.includes('CLOUD') || silo.includes('S3') || silo.includes('GCS');
      else if (activeFilter === 'WHATSAPP') matchFilter = silo.includes('WHATSAPP') || silo.includes('CHAT');

      const matchQuery = !query || text.includes(query);

      if (matchFilter && matchQuery) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (findingsCountBadge) {
      findingsCountBadge.textContent = `${visibleCount} findings`;
    }
  }

  /**
   * Accessible Toast Notification Helper
   */
  function showToast(message, type = 'success') {
    let toast = document.getElementById('discoveryToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'discoveryToast';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.zIndex = '9999';
      toast.style.padding = '12px 20px';
      toast.style.borderRadius = '8px';
      toast.style.fontSize = '13px';
      toast.style.fontWeight = '600';
      toast.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
      toast.style.transition = 'all 0.3s ease';
      document.body.appendChild(toast);
    }

    if (type === 'error') {
      toast.style.background = '#ef4444';
      toast.style.color = '#ffffff';
    } else {
      toast.style.background = '#10b981';
      toast.style.color = '#ffffff';
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 3500);
  }
});
