/**
 * DPDP_Secure - Enterprise Connector Catalog & Schema Registry
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * 100% Offline-First | Multi-Connector Architecture
 * Connectors:
 * ├── Claims Database (claims, policyholders, medical_histories)
 * ├── Policy Administration Database (customers, policies, nominees)
 * ├── Excel files (agent commissions, TPA networks, customer leads)
 * ├── PDFs (diagnostic lab reports, discharge summaries, KYC proofs)
 * ├── Documents (clinical notes, Rx summaries, consent declarations)
 * └── Cloud storage (S3 clinical vault, GCS claims archive, Azure lake)
 */

const { v4: uuidv4 } = require('uuid');

const CONNECTOR_CATALOG = {
  tenantId: 'TENANT-AAROGYA-01',
  tenantName: 'Aarogya Diagnostic Center, Indiranagar',
  gstin: '29AAAAA0000A1Z5',
  complianceScore: 84,
  connectors: [
    {
      id: 'conn-claims-db',
      key: 'CLAIMS_DB',
      name: 'Claims Database',
      type: 'ENTERPRISE_RDBMS',
      icon: 'database',
      category: 'DATABASE',
      status: 'ACTIVE_CONNECTED',
      statusColor: '#10b981',
      riskLevel: 'CRITICAL',
      riskColor: '#ef4444',
      badge: 'SQL RDBMS',
      connectionString: 'postgresql://claims-replica.internal:5432/aarogya_claims',
      storageEngine: 'Air-Gapped Encrypted PostgreSQL / SQLite',
      totalRecords: 1840,
      piiFindingsCount: 420,
      lastScannedAt: new Date(Date.now() - 1800000).toISOString(),
      description: 'Central claims repository handling health insurance adjudications, insured medical profiles, and diagnostic billing claims.',
      tables: [
        {
          id: 'tbl-claims',
          name: 'claims',
          fullName: 'Claims Database › claims',
          type: 'TABLE',
          recordCount: 680,
          piiCount: 180,
          sensitivity: 'CRITICAL_HEALTH',
          description: 'Historical and active insurance claims filed by patients for diagnostic pathology, radiology, and hospitalization.',
          columns: [
            { name: 'claim_id', type: 'VARCHAR(32)', isPii: false, piiType: 'SYSTEM_KEY', sample: 'CLM-2026-8910', note: 'Primary Key' },
            { name: 'policy_no', type: 'VARCHAR(32)', isPii: false, piiType: 'POLICY_REF', sample: 'POL-HDFC-9921', note: 'Foreign Key' },
            { name: 'patient_name', type: 'VARCHAR(128)', isPii: true, piiType: 'NAME', sample: 'Rajesh Sundaram', note: 'Direct Identifier' },
            { name: 'hospital_name', type: 'VARCHAR(128)', isPii: false, piiType: 'FACILITY', sample: 'Manipal Hospital Indiranagar', note: 'Service Location' },
            { name: 'claim_amount', type: 'DECIMAL(12,2)', isPii: true, piiType: 'FINANCIAL', sample: '₹1,45,000.00', note: 'Financial PII' },
            { name: 'diagnosis_code', type: 'VARCHAR(64)', isPii: true, piiType: 'HEALTH_SEC_2T', sample: 'E11.9 (Type 2 Diabetes Mellitus)', note: 'Section 2(t) Clinical Health' },
            { name: 'status', type: 'VARCHAR(24)', isPii: false, piiType: 'ENUM', sample: 'SETTLED', note: 'Claim Workflow' },
            { name: 'aadhaar_token', type: 'VARCHAR(16)', isPii: true, piiType: 'AADHAAR', sample: 'XXXXXXXX4819', note: 'Verhoeff D5 Checksum Valid' }
          ],
          sampleRows: [
            { claim_id: 'CLM-2026-8910', policy_no: 'POL-HDFC-9921', patient_name: 'Rajesh Sundaram', hospital_name: 'Manipal Hospital Indiranagar', claim_amount: '₹1,45,000.00', diagnosis_code: 'E11.9 (Type 2 Diabetes with Ketoacidosis)', status: 'SETTLED', aadhaar_token: 'XXXXXXXX4819' },
            { claim_id: 'CLM-2026-9042', policy_no: 'POL-STAR-4412', patient_name: 'Meenakshi Iyer', hospital_name: 'Apollo Clinic Koramangala', claim_amount: '₹48,500.00', diagnosis_code: 'I10 (Essential Primary Hypertension)', status: 'IN_REVIEW', aadhaar_token: 'XXXXXXXX9021' },
            { claim_id: 'CLM-2026-9188', policy_no: 'POL-ICICI-1184', patient_name: 'Arun V. Rao', hospital_name: 'Aarogya Diagnostic Center', claim_amount: '₹12,400.00', diagnosis_code: 'Z01.4 (Comprehensive Diagnostic Hematology)', status: 'APPROVED', aadhaar_token: 'XXXXXXXX3314' },
            { claim_id: 'CLM-2026-9250', policy_no: 'POL-MAX-6631', patient_name: 'Sunita Deshmukh', hospital_name: 'Columbia Asia Whitefield', claim_amount: '₹86,200.00', diagnosis_code: 'K80.20 (Calculus of Gallbladder with Cholecystitis)', status: 'PAID', aadhaar_token: 'XXXXXXXX1128' }
          ]
        },
        {
          id: 'tbl-policyholders',
          name: 'policyholders',
          fullName: 'Claims Database › policyholders',
          type: 'TABLE',
          recordCount: 740,
          piiCount: 150,
          sensitivity: 'CRITICAL',
          description: 'Insured patient master registry with contact demographic records and biometric risk tiering.',
          columns: [
            { name: 'holder_id', type: 'VARCHAR(32)', isPii: false, piiType: 'PRIMARY_KEY', sample: 'HLD-00412', note: 'Policyholder Unique ID' },
            { name: 'full_name', type: 'VARCHAR(128)', isPii: true, piiType: 'NAME', sample: 'Rajesh Sundaram', note: 'Direct Identifier' },
            { name: 'aadhaar_number', type: 'VARCHAR(16)', isPii: true, piiType: 'AADHAAR', sample: 'XXXXXXXX4819', note: 'Verhoeff D5 Validated' },
            { name: 'mobile_number', type: 'VARCHAR(20)', isPii: true, piiType: 'MOBILE', sample: '+91 98450 12891', note: 'Primary Contact' },
            { name: 'email_address', type: 'VARCHAR(96)', isPii: true, piiType: 'EMAIL', sample: 'rajesh.sundaram@gmail.com', note: 'Electronic Contact' },
            { name: 'dob', type: 'DATE', isPii: true, piiType: 'DOB', sample: '1978-04-14', note: 'Age & Actuarial Rating' },
            { name: 'residential_address', type: 'TEXT', isPii: true, piiType: 'ADDRESS', sample: '#42, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru', note: 'Geographic PII' },
            { name: 'risk_tier', type: 'VARCHAR(24)', isPii: false, piiType: 'RISK_TIER', sample: 'TIER_2_MODERATE', note: 'Clinical Underwriting' }
          ],
          sampleRows: [
            { holder_id: 'HLD-00412', full_name: 'Rajesh Sundaram', aadhaar_number: 'XXXXXXXX4819', mobile_number: '+91 98450 12891', email_address: 'rajesh.sundaram@gmail.com', dob: '1978-04-14', residential_address: '#42, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru', risk_tier: 'TIER_2_MODERATE' },
            { holder_id: 'HLD-00413', full_name: 'Meenakshi Iyer', aadhaar_number: 'XXXXXXXX9021', mobile_number: '+91 97312 99401', email_address: 'meenakshi.iyer@outlook.com', dob: '1985-11-22', residential_address: 'Flat 304, Green Glen Layout, Bellandur, Bengaluru', risk_tier: 'TIER_1_LOW' },
            { holder_id: 'HLD-00414', full_name: 'Arun V. Rao', aadhaar_number: 'XXXXXXXX3314', mobile_number: '+91 99001 54721', email_address: 'arun.rao@aarogya.in', dob: '1965-08-09', residential_address: '#18, 5th Cross, Malleshwaram, Bengaluru', risk_tier: 'TIER_3_HIGH' }
          ]
        },
        {
          id: 'tbl-medical-histories',
          name: 'medical_histories',
          fullName: 'Claims Database › medical_histories',
          type: 'TABLE',
          recordCount: 420,
          piiCount: 90,
          sensitivity: 'CRITICAL_HEALTH',
          description: 'Longitudinal clinical histories, diagnostic pathology summaries, and prescription regimens under Section 2(t).',
          columns: [
            { name: 'history_id', type: 'VARCHAR(32)', isPii: false, piiType: 'PRIMARY_KEY', sample: 'MED-9011', note: 'Record Token' },
            { name: 'patient_aadhaar', type: 'VARCHAR(16)', isPii: true, piiType: 'AADHAAR', sample: 'XXXXXXXX4819', note: 'Verhoeff D5 Proof' },
            { name: 'primary_diagnosis', type: 'TEXT', isPii: true, piiType: 'HEALTH_SEC_2T', sample: 'Metabolic Syndrome, Chronic Glycemic Fluctuations', note: 'Clinical Health Data' },
            { name: 'prescriptions', type: 'TEXT', isPii: true, piiType: 'HEALTH_SEC_2T', sample: 'Metformin 500mg BD, Rosuvastatin 10mg HS', note: 'Active Medications' },
            { name: 'biometrics', type: 'VARCHAR(128)', isPii: true, piiType: 'BIOMETRIC_VITALS', sample: 'BP: 138/88 mmHg, BMI: 27.4, HbA1c: 8.4%', note: 'Physiological Indicators' },
            { name: 'attending_physician', type: 'VARCHAR(128)', isPii: false, piiType: 'PHYSICIAN', sample: 'Dr. S. K. Hegde (MD Diabetology)', note: 'Clinical Consultant' },
            { name: 'last_consultation', type: 'DATE', isPii: false, piiType: 'TIMESTAMP', sample: '2026-09-10', note: 'Visit Date' }
          ],
          sampleRows: [
            { history_id: 'MED-9011', patient_aadhaar: 'XXXXXXXX4819', primary_diagnosis: 'Metabolic Syndrome, Fasting Glucose 178 mg/dL', prescriptions: 'Metformin 500mg BD, Rosuvastatin 10mg HS', biometrics: 'BP: 138/88 mmHg, HbA1c: 8.4%', attending_physician: 'Dr. S. K. Hegde (MD Diabetology)', last_consultation: '2026-09-10' },
            { history_id: 'MED-9012', patient_aadhaar: 'XXXXXXXX9021', primary_diagnosis: 'Grade 1 Essential Hypertension, Post-Stent', prescriptions: 'Amlodipine 5mg OD, Telmisartan 40mg', biometrics: 'BP: 130/82 mmHg, Pulse: 74 bpm', attending_physician: 'Dr. Ananya Murthy (Cardiology)', last_consultation: '2026-09-28' },
            { history_id: 'MED-9013', patient_aadhaar: 'XXXXXXXX3314', primary_diagnosis: 'Benign Prostatic Hyperplasia, Thyroid Nodule', prescriptions: 'Silodosin 8mg HS, Thyroxine 50mcg', biometrics: 'TSH: 4.8 mIU/L, PSA: 1.8 ng/mL', attending_physician: 'Dr. Vikram Shenoy (Endocrinology)', last_consultation: '2026-10-15' }
          ]
        }
      ]
    },

    {
      id: 'conn-policy-admin-db',
      key: 'POLICY_ADMIN_DB',
      name: 'Policy Administration Database',
      type: 'ENTERPRISE_CORE',
      icon: 'shield',
      category: 'DATABASE',
      status: 'ACTIVE_CONNECTED',
      statusColor: '#10b981',
      riskLevel: 'HIGH',
      riskColor: '#f59e0b',
      badge: 'Core Admin RDBMS',
      connectionString: 'oracle://policy-admin.internal:1521/aarogya_core',
      storageEngine: 'Air-Gapped Oracle / SQLite Enterprise Vault',
      totalRecords: 2650,
      piiFindingsCount: 310,
      lastScannedAt: new Date(Date.now() - 3600000).toISOString(),
      description: 'Core underwriting policy lifecycle database recording registered customers, subscribed health plans, and familial nominees.',
      tables: [
        {
          id: 'tbl-customers',
          name: 'customers',
          fullName: 'Policy Administration Database › customers',
          type: 'TABLE',
          recordCount: 1120,
          piiCount: 160,
          sensitivity: 'HIGH',
          description: 'Verified customer accounts with PAN cards, verified KYC certificates, and digital bank mandates.',
          columns: [
            { name: 'customer_id', type: 'VARCHAR(32)', isPii: false, piiType: 'PRIMARY_KEY', sample: 'CUST-8801', note: 'Customer Code' },
            { name: 'full_name', type: 'VARCHAR(128)', isPii: true, piiType: 'NAME', sample: 'Kavitha Nambiar', note: 'Data Principal Name' },
            { name: 'pan_number', type: 'VARCHAR(10)', isPii: true, piiType: 'PAN', sample: 'ABCPN4821F', note: '4th Char P = Individual Citizen' },
            { name: 'kyc_status', type: 'VARCHAR(24)', isPii: false, piiType: 'STATUS', sample: 'KYC_VERIFIED_PAN', note: 'Statutory Verification' },
            { name: 'primary_mobile', type: 'VARCHAR(20)', isPii: true, piiType: 'MOBILE', sample: '+91 98860 34120', note: 'SMS & WhatsApp Gateway' },
            { name: 'bank_account_no', type: 'VARCHAR(32)', isPii: true, piiType: 'FINANCIAL', sample: 'XXXXXX992144 (HDFC)', note: 'Payout Mandate' },
            { name: 'upi_id', type: 'VARCHAR(64)', isPii: true, piiType: 'UPI_VPA', sample: 'kavitha.nambiar@okhdfcbank', note: 'Instant UPI Settlement' }
          ],
          sampleRows: [
            { customer_id: 'CUST-8801', full_name: 'Kavitha Nambiar', pan_number: 'ABCPN4821F', kyc_status: 'KYC_VERIFIED_PAN', primary_mobile: '+91 98860 34120', bank_account_no: 'XXXXXX992144 (HDFC Bank)', upi_id: 'kavitha.nambiar@okhdfcbank' },
            { customer_id: 'CUST-8802', full_name: 'Siddharth Patel', pan_number: 'BKRPP9012M', kyc_status: 'KYC_VERIFIED_AADHAAR', primary_mobile: '+91 94480 67123', bank_account_no: 'XXXXXX118274 (SBI)', upi_id: 'siddharth.patel@icici' },
            { customer_id: 'CUST-8803', full_name: 'Anil Kumar Reddy', pan_number: 'CCRPK3391K', kyc_status: 'KYC_PENDING_RENEWAL', primary_mobile: '+91 99160 88234', bank_account_no: 'XXXXXX554109 (Axis Bank)', upi_id: 'anil.reddy@axisbank' }
          ]
        },
        {
          id: 'tbl-policies',
          name: 'policies',
          fullName: 'Policy Administration Database › policies',
          type: 'TABLE',
          recordCount: 980,
          piiCount: 50,
          sensitivity: 'MEDIUM',
          description: 'Subscribed medical insurance policies, sum insured, statutory premium receipts, and validity terms.',
          columns: [
            { name: 'policy_id', type: 'VARCHAR(32)', isPii: false, piiType: 'PRIMARY_KEY', sample: 'POL-HDFC-9921', note: 'Policy Number' },
            { name: 'customer_id', type: 'VARCHAR(32)', isPii: false, piiType: 'FOREIGN_KEY', sample: 'CUST-8801', note: 'Customer Link' },
            { name: 'plan_code', type: 'VARCHAR(64)', isPii: false, piiType: 'PRODUCT', sample: 'AAROGYA_SURAKSHA_FAMILY', note: 'Health Product' },
            { name: 'sum_insured', type: 'DECIMAL(12,2)', isPii: false, piiType: 'FINANCIAL', sample: '₹15,00,000.00', note: 'Coverage Limit' },
            { name: 'annual_premium', type: 'DECIMAL(10,2)', isPii: true, piiType: 'FINANCIAL', sample: '₹28,500.00', note: 'CGST 18% Applicable' },
            { name: 'issue_date', type: 'DATE', isPii: false, piiType: 'TIMESTAMP', sample: '2024-03-15', note: 'Inception Date' },
            { name: 'status', type: 'VARCHAR(24)', isPii: false, piiType: 'STATUS', sample: 'ACTIVE', note: 'Policy State' }
          ],
          sampleRows: [
            { policy_id: 'POL-HDFC-9921', customer_id: 'CUST-8801', plan_code: 'AAROGYA_SURAKSHA_FAMILY_FLOATER', sum_insured: '₹15,00,000.00', annual_premium: '₹28,500.00', issue_date: '2024-03-15', status: 'ACTIVE' },
            { policy_id: 'POL-STAR-4412', customer_id: 'CUST-8802', plan_code: 'CRITICAL_ILLNESS_SHIELD_PLATINUM', sum_insured: '₹25,00,000.00', annual_premium: '₹42,000.00', issue_date: '2023-08-10', status: 'ACTIVE' },
            { policy_id: 'POL-ICICI-1184', customer_id: 'CUST-8803', plan_code: 'SENIOR_CITIZEN_HEALTH_PLUS', sum_insured: '₹10,00,000.00', annual_premium: '₹34,200.00', issue_date: '2025-01-20', status: 'ACTIVE' }
          ]
        },
        {
          id: 'tbl-nominees',
          name: 'nominees',
          fullName: 'Policy Administration Database › nominees',
          type: 'TABLE',
          recordCount: 550,
          piiCount: 100,
          sensitivity: 'CRITICAL',
          description: 'Beneficiary nominees, minor ward registrations, relationship declarations, and guardian authorizations.',
          columns: [
            { name: 'nominee_id', type: 'VARCHAR(32)', isPii: false, piiType: 'PRIMARY_KEY', sample: 'NOM-701', note: 'Nominee Unique ID' },
            { name: 'policy_id', type: 'VARCHAR(32)', isPii: false, piiType: 'FOREIGN_KEY', sample: 'POL-HDFC-9921', note: 'Policy Reference' },
            { name: 'nominee_name', type: 'VARCHAR(128)', isPii: true, piiType: 'NAME', sample: 'Devika Nambiar', note: 'Minor Beneficiary' },
            { name: 'relationship', type: 'VARCHAR(48)', isPii: false, piiType: 'RELATION', sample: 'Daughter (Minor)', note: 'Family Dependency' },
            { name: 'aadhaar_token', type: 'VARCHAR(16)', isPii: true, piiType: 'AADHAAR', sample: 'XXXXXXXX7712', note: 'Verhoeff D5 Valid' },
            { name: 'nominee_dob', type: 'DATE', isPii: true, piiType: 'DOB', sample: '2012-06-18', note: 'Age 14 (Child PII Rule)' },
            { name: 'share_percent', type: 'INTEGER', isPii: false, piiType: 'PERCENTAGE', sample: '100%', note: 'Claim Entitlement' }
          ],
          sampleRows: [
            { nominee_id: 'NOM-701', policy_id: 'POL-HDFC-9921', nominee_name: 'Devika Nambiar', relationship: 'Daughter (Minor)', aadhaar_token: 'XXXXXXXX7712', nominee_dob: '2012-06-18', share_percent: '100%' },
            { nominee_id: 'NOM-702', policy_id: 'POL-STAR-4412', nominee_name: 'Pooja Patel', relationship: 'Spouse', aadhaar_token: 'XXXXXXXX5501', nominee_dob: '1988-02-14', share_percent: '100%' },
            { nominee_id: 'NOM-703', policy_id: 'POL-ICICI-1184', nominee_name: 'Suresh Reddy', relationship: 'Son', aadhaar_token: 'XXXXXXXX9943', nominee_dob: '1994-09-03', share_percent: '100%' }
          ]
        }
      ]
    },

    {
      id: 'conn-excel-files',
      key: 'EXCEL_FILES',
      name: 'Excel files',
      type: 'SPREADSHEET',
      icon: 'table',
      category: 'FILES',
      status: 'SYNCHRONIZED',
      statusColor: '#3b82f6',
      riskLevel: 'MEDIUM',
      riskColor: '#fbbf24',
      badge: 'Local Spreadsheets',
      connectionString: 'smb://nas-storage.clinic/accounts_spreadsheets/',
      storageEngine: 'Local SMB / Memory CSV Protected Parser',
      totalRecords: 780,
      piiFindingsCount: 240,
      lastScannedAt: new Date(Date.now() - 7200000).toISOString(),
      description: 'Semi-structured operational spreadsheets containing agent commission distributions, TPA cashless networks, and clinic walk-in inquiries.',
      tables: [
        {
          id: 'file-agent-commission',
          name: 'agent_commission_tracker.xlsx',
          fullName: 'Excel files › agent_commission_tracker.xlsx',
          type: 'FILE_SPREADSHEET',
          recordCount: 210,
          piiCount: 95,
          sensitivity: 'RESTRICTED_TAX',
          description: 'Insurance agent commission registers, PAN disclosures, bank NEFT details, and statutory TDS deductions under IT Act 1961.',
          columns: [
            { name: 'Agent_Name', type: 'STRING', isPii: true, piiType: 'NAME', sample: 'K. S. Ramanathan' },
            { name: 'PAN_Number', type: 'STRING', isPii: true, piiType: 'PAN', sample: 'ABCPR9821K' },
            { name: 'Bank_Account', type: 'STRING', isPii: true, piiType: 'FINANCIAL', sample: 'XXXXXX551240' },
            { name: 'Gross_Payout', type: 'CURRENCY', isPii: false, piiType: 'FINANCIAL', sample: '₹48,500' },
            { name: 'TDS_194H', type: 'CURRENCY', isPii: false, piiType: 'TAX_LOCK', sample: '₹2,425 (CGST Locked)' }
          ],
          sampleRows: [
            { Agent_Name: 'K. S. Ramanathan', PAN_Number: 'ABCPR9821K', Bank_Account: 'XXXXXX551240 (Canara)', Gross_Payout: '₹48,500', TDS_194H: '₹2,425 (CGST Locked)' },
            { Agent_Name: 'Sumantha Bhatt', PAN_Number: 'BNMPB1120Q', Bank_Account: 'XXXXXX889102 (HDFC)', Gross_Payout: '₹32,000', TDS_194H: '₹1,600 (CGST Locked)' }
          ]
        },
        {
          id: 'file-tpa-network',
          name: 'tpa_network_hospitals.xlsx',
          fullName: 'Excel files › tpa_network_hospitals.xlsx',
          type: 'FILE_SPREADSHEET',
          recordCount: 150,
          piiCount: 45,
          sensitivity: 'CONFIDENTIAL',
          description: 'Third-party administrative cashless network hospital lists, doctor nodal officers, and direct contact desk numbers.',
          columns: [
            { name: 'TPA_Provider', type: 'STRING', isPii: false, piiType: 'ENTITY', sample: 'MediAssist TPA Pvt Ltd' },
            { name: 'Hospital_Branch', type: 'STRING', isPii: false, piiType: 'LOCATION', sample: 'Manipal Hospital Indiranagar' },
            { name: 'Medical_Superintendent', type: 'STRING', isPii: true, piiType: 'NAME', sample: 'Dr. Ramesh B. Rao' },
            { name: 'Desk_Direct_Phone', type: 'STRING', isPii: true, piiType: 'PHONE', sample: '+91 80 2502 4410' }
          ],
          sampleRows: [
            { TPA_Provider: 'MediAssist TPA Pvt Ltd', Hospital_Branch: 'Manipal Hospital Indiranagar', Medical_Superintendent: 'Dr. Ramesh B. Rao', Desk_Direct_Phone: '+91 80 2502 4410' },
            { TPA_Provider: 'Vidal Health Insurance TPA', Hospital_Branch: 'Chinmaya Mission Hospital', Medical_Superintendent: 'Dr. Sneha Patil', Desk_Direct_Phone: '+91 80 4115 8820' }
          ]
        },
        {
          id: 'file-customer-leads',
          name: 'customer_leads_tracker.csv',
          fullName: 'Excel files › customer_leads_tracker.csv',
          type: 'FILE_SPREADSHEET',
          recordCount: 420,
          piiCount: 100,
          sensitivity: 'HIGH',
          description: 'Prospective diagnostic health package inquiries, walk-in leads from Indiranagar branch, and mobile numbers.',
          columns: [
            { name: 'Lead_Name', type: 'STRING', isPii: true, piiType: 'NAME', sample: 'Vikram Mehta' },
            { name: 'Mobile_Contact', type: 'STRING', isPii: true, piiType: 'MOBILE', sample: '+91 98450 12345' },
            { name: 'Interested_Package', type: 'STRING', isPii: false, piiType: 'SERVICE', sample: 'Comprehensive Senior Citizen Profile' },
            { name: 'Followup_Status', type: 'STRING', isPii: false, piiType: 'STATUS', sample: 'APPOINTMENT_CONFIRMED' }
          ],
          sampleRows: [
            { Lead_Name: 'Vikram Mehta', Mobile_Contact: '+91 98450 12345', Interested_Package: 'Comprehensive Health Checkup', Followup_Status: 'APPOINTMENT_CONFIRMED' },
            { Lead_Name: 'Deepa Nair', Mobile_Contact: '+91 99887 76655', Interested_Package: 'Diabetic & Cardiac Panel', Followup_Status: 'REPORT_DISPATCHED' }
          ]
        }
      ]
    },

    {
      id: 'conn-pdfs',
      key: 'PDFS',
      name: 'PDFs',
      type: 'PDF_DOCUMENTS',
      icon: 'file-text',
      category: 'DOCUMENTS',
      status: 'AIR_GAPPED_SAFE',
      statusColor: '#6366f1',
      riskLevel: 'CRITICAL',
      riskColor: '#ef4444',
      badge: 'Unstructured PDF / OCR',
      connectionString: 'file:///data/pdf_vault/lab_reports/',
      storageEngine: 'On-Premise Isolated PDF File Archive',
      totalRecords: 520,
      piiFindingsCount: 180,
      lastScannedAt: new Date(Date.now() - 5400000).toISOString(),
      description: 'Clinical laboratory diagnostic result sheets, hospital discharge summaries, and verified Aadhaar/PAN KYC PDF photocopies.',
      tables: [
        {
          id: 'file-blood-report',
          name: 'blood_investigation_report.pdf',
          fullName: 'PDFs › blood_investigation_report.pdf',
          type: 'FILE_PDF',
          recordCount: 180,
          piiCount: 75,
          sensitivity: 'CRITICAL_HEALTH',
          description: 'Automated 5-part hematology and biochemistry panel results from Mindray BC-5150 diagnostic analyzer.',
          columns: [
            { name: 'Patient_Header', type: 'PDF_METADATA', isPii: true, piiType: 'NAME', sample: 'Sunita Deshmukh, Female, 48 Yrs' },
            { name: 'Aadhaar_ID', type: 'PDF_TEXT', isPii: true, piiType: 'AADHAAR', sample: 'XXXXXXXX1128 (Verhoeff Valid)' },
            { name: 'Clinical_Findings', type: 'PDF_SECTION', isPii: true, piiType: 'HEALTH_SEC_2T', sample: 'HbA1c: 9.1% (High), Fasting Glucose: 168 mg/dL' },
            { name: 'Consulting_Pathologist', type: 'PDF_SIGNATURE', isPii: false, piiType: 'PHYSICIAN', sample: 'Dr. Anand Joshi (MD Pathology)' }
          ],
          sampleRows: [
            { Patient_Header: 'Sunita Deshmukh, F/48', Aadhaar_ID: 'XXXXXXXX1128', Clinical_Findings: 'HbA1c: 9.1%, Fasting Blood Sugar: 168 mg/dL', Consulting_Pathologist: 'Dr. Anand Joshi' },
            { Patient_Header: 'Mohan Lal, M/62', Aadhaar_ID: 'XXXXXXXX7724', Clinical_Findings: 'Serum Creatinine: 1.8 mg/dL, Blood Urea: 54 mg/dL', Consulting_Pathologist: 'Dr. Anand Joshi' }
          ]
        },
        {
          id: 'file-discharge-summary',
          name: 'claim_discharge_summary.pdf',
          fullName: 'PDFs › claim_discharge_summary.pdf',
          type: 'FILE_PDF',
          recordCount: 160,
          piiCount: 60,
          sensitivity: 'CRITICAL_HEALTH',
          description: 'Inpatient discharge certificate, operational surgery report, and post-operative pharmaceutical orders.',
          columns: [
            { name: 'Admitted_Patient', type: 'PDF_METADATA', isPii: true, piiType: 'NAME', sample: 'Suresh K. Nair' },
            { name: 'Surgical_Intervention', type: 'PDF_SECTION', isPii: true, piiType: 'HEALTH_SEC_2T', sample: 'Laparoscopic Cholecystectomy under GA' },
            { name: 'ICD_10_Code', type: 'PDF_FIELD', isPii: true, piiType: 'HEALTH_SEC_2T', sample: 'K80.20 (Calculus of Gallbladder)' },
            { name: 'Discharge_Condition', type: 'PDF_TEXT', isPii: false, piiType: 'CLINICAL', sample: 'Stable, ambulant, vitals within normal limits' }
          ],
          sampleRows: [
            { Admitted_Patient: 'Suresh K. Nair', Surgical_Intervention: 'Laparoscopic Cholecystectomy', ICD_10_Code: 'K80.20', Discharge_Condition: 'Stable, wound healing satisfactory' }
          ]
        },
        {
          id: 'file-kyc-proofs',
          name: 'kyc_identity_proofs.pdf',
          fullName: 'PDFs › kyc_identity_proofs.pdf',
          type: 'FILE_PDF',
          recordCount: 180,
          piiCount: 45,
          sensitivity: 'CRITICAL_IDENTITY',
          description: 'Scanned government photo identity documents for patient registration, insurance onboarding, and Ayushman Bharat ABHA mapping.',
          columns: [
            { name: 'Document_Type', type: 'PDF_FIELD', isPii: false, piiType: 'DOC_TYPE', sample: 'Aadhaar Card Front & Back' },
            { name: 'Identity_Token', type: 'PDF_TEXT', isPii: true, piiType: 'AADHAAR', sample: 'XXXXXXXX6210 (Verhoeff Verified)' },
            { name: 'Holder_Name', type: 'PDF_TEXT', isPii: true, piiType: 'NAME', sample: 'Ramesh Kumar' },
            { name: 'Permanent_Address', type: 'PDF_TEXT', isPii: true, piiType: 'ADDRESS', sample: '100ft Road, Indiranagar, Bengaluru 560038' }
          ],
          sampleRows: [
            { Document_Type: 'Aadhaar Card', Identity_Token: 'XXXXXXXX6210', Holder_Name: 'Ramesh Kumar', Permanent_Address: '100ft Road, Indiranagar, Bengaluru' }
          ]
        }
      ]
    },

    {
      id: 'conn-documents',
      key: 'DOCUMENTS',
      name: 'Documents',
      type: 'OFFICE_DOCUMENTS',
      icon: 'file',
      category: 'DOCUMENTS',
      status: 'ON_PREMISE',
      statusColor: '#8b5cf6',
      riskLevel: 'HIGH',
      riskColor: '#f59e0b',
      badge: 'Word & Rich Text',
      connectionString: 'file:///data/clinical_docs/',
      storageEngine: 'Local Reception Document Repository',
      totalRecords: 340,
      piiFindingsCount: 95,
      lastScannedAt: new Date(Date.now() - 9000000).toISOString(),
      description: 'Clinical OPD consultation notes, attending physician prescription drafts, and executed Section 5 patient consent agreements.',
      tables: [
        {
          id: 'file-clinical-notes',
          name: 'clinical_consultation_notes.docx',
          fullName: 'Documents › clinical_consultation_notes.docx',
          type: 'FILE_DOCX',
          recordCount: 120,
          piiCount: 40,
          sensitivity: 'CRITICAL_HEALTH',
          description: 'Subjective patient symptoms, physician physical examination observations, and diagnostic impressions.',
          columns: [
            { name: 'Patient_Subject', type: 'STRING', isPii: true, piiType: 'NAME', sample: 'Nalini Swaminathan' },
            { name: 'Consulting_Doctor', type: 'STRING', isPii: false, piiType: 'PHYSICIAN', sample: 'Dr. Ananya Murthy (Cardiology)' },
            { name: 'Clinical_Impression', type: 'TEXT', isPii: true, piiType: 'HEALTH_SEC_2T', sample: 'Exertional dyspnea, suspected mitral regurgitation' }
          ],
          sampleRows: [
            { Patient_Subject: 'Nalini Swaminathan', Consulting_Doctor: 'Dr. Ananya Murthy', Clinical_Impression: 'Exertional dyspnea, suspected mitral regurgitation. Advised 2D Echocardiogram.' }
          ]
        },
        {
          id: 'file-rx-summary',
          name: 'doctor_prescription_summary.docx',
          fullName: 'Documents › doctor_prescription_summary.docx',
          type: 'FILE_DOCX',
          recordCount: 110,
          piiCount: 30,
          sensitivity: 'HIGH',
          description: 'Prescription advice sheets containing drug formulations, dosages, lifestyle instructions, and next appointment dates.',
          columns: [
            { name: 'Patient_Name', type: 'STRING', isPii: true, piiType: 'NAME', sample: 'Amit Trivedi' },
            { name: 'Active_Medications', type: 'TEXT', isPii: true, piiType: 'HEALTH_SEC_2T', sample: 'Atorvastatin 20mg OD, Metoprolol Succinate 25mg' },
            { name: 'Next_Review', type: 'DATE', isPii: false, piiType: 'SCHEDULE', sample: '2026-11-15' }
          ],
          sampleRows: [
            { Patient_Name: 'Amit Trivedi', Active_Medications: 'Atorvastatin 20mg OD, Metoprolol Succinate 25mg', Next_Review: '2026-11-15' }
          ]
        },
        {
          id: 'file-consent-decl',
          name: 'patient_consent_declaration.docx',
          fullName: 'Documents › patient_consent_declaration.docx',
          type: 'FILE_DOCX',
          recordCount: 110,
          piiCount: 25,
          sensitivity: 'STATUTORY_CONSENT',
          description: 'Formal digital and signed consent declarations executed under Section 5 & 6 of DPDP Act 2023 for diagnostic processing.',
          columns: [
            { name: 'Data_Principal', type: 'STRING', isPii: true, piiType: 'NAME', sample: 'Priya Sharma' },
            { name: 'Phone_Token', type: 'STRING', isPii: true, piiType: 'MOBILE', sample: '+91 98867 55441' },
            { name: 'Consent_Notice_ID', type: 'STRING', isPii: false, piiType: 'NOTICE_REF', sample: 'NOTICE-S5-EN-01' },
            { name: 'Consent_Timestamp', type: 'TIMESTAMP', isPii: false, piiType: 'TIMESTAMP', sample: '2026-10-24 10:15:00 IST' },
            { name: 'Cryptographic_Proof', type: 'HASH', isPii: false, piiType: 'SHA256', sample: '7f9a8b1c...e3d2 (Untampered)' }
          ],
          sampleRows: [
            { Data_Principal: 'Priya Sharma', Phone_Token: '+91 98867 55441', Consent_Notice_ID: 'NOTICE-S5-EN-01', Consent_Timestamp: '2026-10-24 10:15:00 IST', Cryptographic_Proof: '7f9a8b1c...e3d2' }
          ]
        }
      ]
    },

    {
      id: 'conn-cloud-storage',
      key: 'CLOUD_STORAGE',
      name: 'Cloud storage',
      type: 'CLOUD_OBJECT_STORE',
      icon: 'cloud',
      category: 'CLOUD',
      status: 'AIR_GAPPED_GATEWAY',
      statusColor: '#06b6d4',
      riskLevel: 'RESTRICTED',
      riskColor: '#818cf8',
      badge: 'S3 / GCS / Azure Vault',
      connectionString: 's3://aarogya-clinic-records-vault/indiranagar-central/',
      storageEngine: 'Zero-Egress Local Read-Only Cloud Proxy',
      totalRecords: 1120,
      piiFindingsCount: 195,
      lastScannedAt: new Date(Date.now() - 14400000).toISOString(),
      description: 'Encrypted object storage buckets for DICOM radiological scans, historical insurance claims archives, and statutory tax bundles.',
      tables: [
        {
          id: 'bucket-s3-vault',
          name: 's3://aarogya-clinic-records-vault',
          fullName: 'Cloud storage › s3://aarogya-clinic-records-vault',
          type: 'BUCKET_S3',
          recordCount: 520,
          piiCount: 95,
          sensitivity: 'CRITICAL_HEALTH',
          description: 'AWS S3 bucket with KMS encryption containing high-resolution chest X-Rays, ultrasound scans, and patient DICOM headers.',
          columns: [
            { name: 'Object_Key', type: 'S3_KEY', isPii: false, piiType: 'URI', sample: 'dicom/2026/10/patient_7731_chest_pa.dcm' },
            { name: 'Patient_Aadhaar_Token', type: 'DICOM_TAG', isPii: true, piiType: 'AADHAAR', sample: 'XXXXXXXX7731 (Verhoeff Verified)' },
            { name: 'Modality_Type', type: 'DICOM_TAG', isPii: false, piiType: 'MODALITY', sample: 'CR (Computed Radiography)' },
            { name: 'Study_Description', type: 'DICOM_TAG', isPii: true, piiType: 'HEALTH_SEC_2T', sample: 'Chest PA View: Bilateral Infiltration' }
          ],
          sampleRows: [
            { Object_Key: 'dicom/2026/10/patient_7731_chest_pa.dcm', Patient_Aadhaar_Token: 'XXXXXXXX7731', Modality_Type: 'CR (Computed Radiography)', Study_Description: 'Chest PA View: Bilateral Infiltration' }
          ]
        },
        {
          id: 'bucket-gcs-claims',
          name: 'gcs://claims-archive-indiranagar',
          fullName: 'Cloud storage › gcs://claims-archive-indiranagar',
          type: 'BUCKET_GCS',
          recordCount: 380,
          piiCount: 65,
          sensitivity: 'RESTRICTED_TAX',
          description: 'Google Cloud Storage bucket archiving settled claims dossiers and Tally tax invoices subject to CGST Section 36 retention.',
          columns: [
            { name: 'Archive_File', type: 'GCS_KEY', isPii: false, piiType: 'URI', sample: 'claims_fy25_26/settlement_bundle_0942.tar.gz' },
            { name: 'Tax_Invoice_No', type: 'INVOICE_REF', isPii: false, piiType: 'TAX_INVOICE', sample: 'INV-2024-309 (72-Mo Lock)' },
            { name: 'Entity_PAN', type: 'PAN_REF', isPii: true, piiType: 'PAN', sample: 'AABCA4412P' },
            { name: 'Statutory_Compliance', type: 'STATUS', isPii: false, piiType: 'LEGAL', sample: 'CGST Sec 36 Retention Active' }
          ],
          sampleRows: [
            { Archive_File: 'claims_fy25_26/settlement_bundle_0942.tar.gz', Tax_Invoice_No: 'INV-2024-309', Entity_PAN: 'AABCA4412P', Statutory_Compliance: 'CGST Sec 36 Retention Active' }
          ]
        },
        {
          id: 'bucket-azure-scans',
          name: 'azure://diagnostic-scans-lake',
          fullName: 'Cloud storage › azure://diagnostic-scans-lake',
          type: 'CONTAINER_AZURE',
          recordCount: 220,
          piiCount: 35,
          sensitivity: 'CRITICAL_HEALTH',
          description: 'Azure Data Lake Gen2 holding cross-departmental CT & MRI multi-slice studies with patient age and clinical flags.',
          columns: [
            { name: 'Blob_Path', type: 'BLOB_URL', isPii: false, piiType: 'URI', sample: 'scans/mri_brain_2026/pat_9901.nii' },
            { name: 'Patient_Gender_Age', type: 'METADATA', isPii: true, piiType: 'DEMOGRAPHIC', sample: 'Male / 54 Years' },
            { name: 'Diagnostic_Finding', type: 'RADIOLOGY', isPii: true, piiType: 'HEALTH_SEC_2T', sample: 'Normal ventricular system, no focal lesion' }
          ],
          sampleRows: [
            { Blob_Path: 'scans/mri_brain_2026/pat_9901.nii', Patient_Gender_Age: 'Male / 54 Years', Diagnostic_Finding: 'Normal ventricular system, no focal lesion' }
          ]
        }
      ]
    },

    {
      id: 'conn-whatsapp-informal',
      key: 'WHATSAPP_INFORMAL',
      name: 'WhatsApp & Informal Silos',
      type: 'INFORMAL_MESSAGING',
      icon: 'message-square',
      category: 'INFORMAL',
      status: 'MONITORED_LOCAL',
      statusColor: '#10b981',
      riskLevel: 'CRITICAL',
      riskColor: '#ef4444',
      badge: 'Frontdesk Chat & Invoices',
      connectionString: 'file:///data/sample_data/clinic_reception_chat.txt',
      storageEngine: 'Reception Android Phone Export / Air-Gapped Vault',
      totalRecords: 1070,
      piiFindingsCount: 390,
      lastScannedAt: new Date(Date.now() - 1200000).toISOString(),
      description: 'Frontdesk reception WhatsApp mobile exports and unencrypted Tally Prime accounting CSV exports.',
      tables: [
        {
          id: 'file-whatsapp-chat',
          name: 'clinic_reception_chat.txt',
          fullName: 'WhatsApp & Informal Silos › clinic_reception_chat.txt',
          type: 'FILE_TXT',
          recordCount: 840,
          piiCount: 230,
          sensitivity: 'CRITICAL_LEAK_RISK',
          description: 'Exported WhatsApp conversations between clinic staff and patients sharing Aadhaar photos and test prescriptions.',
          columns: [
            { name: 'Message_Timestamp', type: 'STRING', isPii: false, piiType: 'TIMESTAMP', sample: '24/10/2026, 10:14 AM' },
            { name: 'Sender_Sender', type: 'STRING', isPii: true, piiType: 'PHONE', sample: '+91 99887 76655' },
            { name: 'Message_Text', type: 'TEXT', isPii: true, piiType: 'MIXED_PII', sample: 'Aadhaar: 4921-8374-7182, please send blood report' },
            { name: 'Extracted_Aadhaar', type: 'PARSED', isPii: true, piiType: 'AADHAAR', sample: 'XXXXXXXX7182 (Verhoeff D5 Valid)' }
          ],
          sampleRows: [
            { Message_Timestamp: '24/10/2026, 10:14 AM', Sender_Sender: '+91 99887 76655', Message_Text: 'Aadhaar: 4921-8374-7182, please send blood report', Extracted_Aadhaar: 'XXXXXXXX7182' },
            { Message_Timestamp: '24/10/2026, 11:22 AM', Sender_Sender: '+91 98450 12345', Message_Text: 'Fasting Blood Sugar: 142 mg/dL, HbA1c: 7.2%', Extracted_Aadhaar: 'Clinical Health Sec 2(t)' }
          ]
        },
        {
          id: 'file-invoices-billing',
          name: 'invoices_billing.csv',
          fullName: 'WhatsApp & Informal Silos › invoices_billing.csv',
          type: 'FILE_CSV',
          recordCount: 230,
          piiCount: 160,
          sensitivity: 'STATUTORY_TAX_LOCK',
          description: 'GST invoice billing register under CGST Act Section 36 retention lock (72-Month Statutory Retention).',
          columns: [
            { name: 'Invoice_Number', type: 'STRING', isPii: false, piiType: 'INVOICE_KEY', sample: 'INV-2024-309' },
            { name: 'Patient_Name', type: 'STRING', isPii: true, piiType: 'NAME', sample: 'Deepa Nair' },
            { name: 'Patient_PAN', type: 'STRING', isPii: true, piiType: 'PAN', sample: 'ABCDE1234F' },
            { name: 'Amount_INR', type: 'CURRENCY', isPii: false, piiType: 'FINANCIAL', sample: '₹12,000.00' },
            { name: 'CGST_Tax_Lock', type: 'STATUS', isPii: false, piiType: 'STATUTORY', sample: 'Sec 36 Mandate Active (No Erasure)' }
          ],
          sampleRows: [
            { Invoice_Number: 'INV-2024-309', Patient_Name: 'Deepa Nair', Patient_PAN: 'ABCDE1234F', Amount_INR: '₹12,000.00', CGST_Tax_Lock: 'Sec 36 Mandate Active (No Erasure)' }
          ]
        }
      ]
    }
  ]
};

/**
 * Returns overall statistics computed from all registered connectors
 */
function getCatalogStatistics() {
  let totalConnectors = CONNECTOR_CATALOG.connectors.length;
  let totalTables = 0;
  let totalRecords = 0;
  let totalPii = 0;
  let aadhaarTokens = 0;
  let healthTokens = 0;
  let panTokens = 0;

  for (const conn of CONNECTOR_CATALOG.connectors) {
    totalTables += (conn.tables ? conn.tables.length : 0);
    totalRecords += (conn.totalRecords || 0);
    totalPii += (conn.piiFindingsCount || 0);

    // Approximate specialized metrics
    if (conn.key === 'CLAIMS_DB') {
      aadhaarTokens += 28;
      healthTokens += 45;
      panTokens += 15;
    } else if (conn.key === 'POLICY_ADMIN_DB') {
      aadhaarTokens += 22;
      healthTokens += 10;
      panTokens += 32;
    } else if (conn.key === 'PDFS') {
      aadhaarTokens += 14;
      healthTokens += 35;
      panTokens += 8;
    } else if (conn.key === 'CLOUD_STORAGE') {
      aadhaarTokens += 12;
      healthTokens += 24;
      panTokens += 12;
    } else {
      aadhaarTokens += 18;
      healthTokens += 24;
      panTokens += 14;
    }
  }

  return {
    totalConnectors,
    totalTables,
    totalRecords,
    totalPii,
    aadhaarTokens,
    healthTokens,
    panTokens
  };
}

/**
 * Returns a specific connector by ID or key
 */
function getConnectorById(idOrKey) {
  return CONNECTOR_CATALOG.connectors.find(
    c => c.id === idOrKey || c.key === idOrKey || c.name.toLowerCase() === idOrKey.toLowerCase()
  ) || null;
}

/**
 * Returns a specific table/file schema by its table ID
 */
function getTableById(tableId) {
  for (const conn of CONNECTOR_CATALOG.connectors) {
    if (conn.tables) {
      const found = conn.tables.find(t => t.id === tableId || t.name === tableId);
      if (found) {
        return {
          connectorId: conn.id,
          connectorName: conn.name,
          connectorType: conn.type,
          table: found
        };
      }
    }
  }
  return null;
}

module.exports = {
  CONNECTOR_CATALOG,
  getCatalogStatistics,
  getConnectorById,
  getTableById
};
