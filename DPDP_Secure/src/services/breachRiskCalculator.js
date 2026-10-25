/**
 * DPDP_Secure - Breach Threat Modeling & Statutory Risk Calculator
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Pillar 4: Security Incident & Breach Notification Engine
 * Evaluates incidents under DPDP Act, 2023 Section 8(6) and DPDP Rules, 2025 (Rule 7).
 * Implements deterministic severity scoring, mandatory DPBI intimation rules,
 * 72-hour regulatory countdown calculation, and containment action generation.
 */

// Pre-configured SME threat scenario templates
const scenario1 = {
  id: 'SCENARIO-SMARTPHONE-LOST',
  title: 'Lost Receptionist Smartphone (Indiranagar Metro Station)',
  incidentTitle: 'Lost Receptionist Smartphone (Indiranagar Metro Station)',
  scenarioType: 'DEVICE_LOSS_UNENCRYPTED',
  description: 'Unencrypted Android phone lost at Indiranagar Metro Station containing 250+ unencrypted WhatsApp patient chats, Aadhaar card photos, and diagnostic test requisitions.',
  impactedSilos: ['clinic_reception_chat.txt', 'whatsapp_media_store', 'mobile_local_sqlite'],
  estimatedCount: 250,
  dataCategories: ['Identity (Aadhaar, PAN)', 'Contact (Mobile, Address)', 'Clinical Health Data (Prescriptions, Lipid Panel, Blood Tests)'],
  hasAadhaar: true,
  hasClinicalHealth: true,
  hasFinancial: false,
  safeguardsInPlace: 'NONE_UNENCRYPTED',
  safeguards: 'NONE_UNENCRYPTED',
  expectedSeverity: 'CRITICAL',
  defaultSeverity: 'CRITICAL',
  defaultScore: 88,
  mandatoryDpbiIntimation: true,
  containmentActions: [
    { id: 'ACT-01', text: 'Trigger Google Find My Device remote lock & wipe', done: false, urgent: true },
    { id: 'ACT-02', text: 'Revoke active WhatsApp Business linked web sessions from all endpoints', done: false, urgent: true },
    { id: 'ACT-03', text: 'Generate statutory Form DPBI-IR1 72-Hour Intimation Dossier', done: false, urgent: true },
    { id: 'ACT-04', text: 'Dispatch reassuring plain-language citizen alerts without technical vulnerability details', done: false, urgent: false },
    { id: 'ACT-05', text: 'Rotate clinic reception WhatsApp OTP & SIM card via telecom provider', done: false, urgent: false }
  ]
};

const scenario2 = {
  id: 'SCENARIO-MISDIRECTED-REPORT',
  title: 'Misdirected WhatsApp Medical Report (Biopsy & Blood Panel)',
  incidentTitle: 'Misdirected WhatsApp Medical Report (Biopsy & Blood Panel)',
  scenarioType: 'UNAUTHORIZED_DISCLOSURE',
  description: 'Reception staff accidentally dispatched a patient\'s confidential biopsy report and blood panel PDF to an incorrect mobile number via WhatsApp.',
  impactedSilos: ['clinic_reception_chat.txt'],
  estimatedCount: 1,
  dataCategories: ['Clinical Health Data (Biopsy, Blood Panels)', 'Contact (Mobile Phone)'],
  hasAadhaar: false,
  hasClinicalHealth: true,
  hasFinancial: false,
  safeguardsInPlace: 'STANDARD_MESSAGING',
  safeguards: 'STANDARD_MESSAGING',
  expectedSeverity: 'HIGH',
  defaultSeverity: 'HIGH',
  defaultScore: 72,
  mandatoryDpbiIntimation: true,
  containmentActions: [
    { id: 'ACT-01', text: 'Request erroneous recipient to immediately delete and purge the received report', done: false, urgent: true },
    { id: 'ACT-02', text: 'Dispatch WhatsApp "Delete for Everyone" API revocation if within messaging window', done: false, urgent: true },
    { id: 'ACT-03', text: 'Directly inform affected patient with transparent apology and clinical guidance', done: false, urgent: true },
    { id: 'ACT-04', text: 'Log confidential breach in internal incident register under Section 8(6)', done: false, urgent: false }
  ]
};

const scenario3 = {
  id: 'SCENARIO-COMPROMISED-BILLING',
  title: 'Compromised Desktop Billing Workstation (Tally Malware Quarantined)',
  incidentTitle: 'Compromised Desktop Billing Workstation (Tally Malware Quarantined)',
  scenarioType: 'MALWARE_INFESTATION',
  description: 'Ransomware / suspicious unauthorized payload detected on front-desk computer running Tally accounting software. Daily local backup accessible; no confirmed cloud exfiltration.',
  impactedSilos: ['invoices_billing.csv', 'tally_data_dir'],
  estimatedCount: 80,
  dataCategories: ['Financial (Invoices, Tax Line Items, GSTIN)', 'Identity (Customer Name, Phone)'],
  hasAadhaar: false,
  hasClinicalHealth: false,
  hasFinancial: true,
  safeguardsInPlace: 'AIR_GAPPED_BACKUP',
  safeguards: 'AIR_GAPPED_BACKUP',
  expectedSeverity: 'MEDIUM',
  defaultSeverity: 'MEDIUM',
  defaultScore: 45,
  mandatoryDpbiIntimation: false,
  containmentActions: [
    { id: 'ACT-01', text: 'Disconnect desktop computer from local Wi-Fi and Ethernet network immediately', done: false, urgent: true },
    { id: 'ACT-02', text: 'Mount and verify integrity of offline air-gapped daily Tally backup', done: false, urgent: true },
    { id: 'ACT-03', text: 'Run offline anti-malware quarantine scan across front-desk drive', done: false, urgent: true },
    { id: 'ACT-04', text: 'Inspect firewall logs for external data exfiltration before notifying DPBI', done: false, urgent: false }
  ]
};

const SME_THREAT_SCENARIOS = {
  scenario1,
  scenario2,
  scenario3,
  LOST_SMARTPHONE: scenario1,
  MISDIRECTED_REPORT: scenario2,
  COMPROMISED_BILLING_DESKTOP: scenario3
};

/**
 * Data Spill Defense:
 * Masks any potential plaintext 12-digit Aadhaar numbers or raw diagnostic lab data
 * from incident descriptions, titles, and public notes.
 */
function sanitizeIncidentText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Mask 12-digit Aadhaar numbers (with or without spaces/hyphens): retain only last 4 digits
    .replace(/\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b/g, 'XXXX-XXXX-$3')
    // Mask continuous 12-digit numbers
    .replace(/\b(\d{8})(\d{4})\b/g, 'XXXX-XXXX-$2')
    // Mask PAN numbers
    .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, 'XXXXX1234X')
    // Redact sensitive diagnostic health records to prevent accidental breach note spills
    .replace(/\b(carcinoma|biopsy report|biopsy|malignant|hiv positive)\b/gi, '[CONFIDENTIAL_CLINICAL_RECORD]')
    // Strip HTML tags
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

/**
 * Calculates statutory breach severity score and DPBI mandate under DPDP Rules, 2025 (Rule 7)
 *
 * Scoring Formula:
 * - Data Category Weight (Max 50 points):
 *   - Clinical Health Data: 40 pts
 *   - Identity Data (Aadhaar / PAN): 30 pts
 *   - Financial Data: 20 pts
 *   - Basic Contact / Demographic: 10 pts
 * - Headcount Factor (Max 25 points):
 *   - > 100 individuals: +25 pts (triggers high-volume regulatory alert)
 *   - 20 - 100 individuals: +15 pts
 *   - 1 - 19 individuals: +10 pts
 * - Safeguards Factor (Max 25 points):
 *   - Unencrypted / Device lost / No MFA: +20 pts
 *   - Partial protection: +10 pts
 *   - Strong encryption: -20 pts
 *
 * Mandatory DPBI Intimation Trigger:
 * - Presence of Aadhaar OR Clinical Health Data immediately elevates severity to HIGH or CRITICAL.
 * - Score >= 80 -> CRITICAL
 * - Score >= 60 -> HIGH
 * - Score >= 35 -> MEDIUM
 * - Score < 35  -> LOW
 *
 * @param {Object} incidentData
 * @returns {Object} Assessment outcome
 */
function calculateRisk(incidentData = {}) {
  const {
    scenarioType = '',
    impactedSilos = [],
    estimatedCount = 0,
    dataCategories = [],
    discoveredAt = new Date()
  } = incidentData;

  const safeguardsInPlace = incidentData.safeguardsInPlace || incidentData.safeguards || 'NONE';
  const title = incidentData.incidentTitle || incidentData.title || '';

  // Check known scenario presets
  if (scenarioType === 'DEVICE_LOSS_UNENCRYPTED' || title.toLowerCase().includes('lost receptionist smartphone')) {
    const preset = SME_THREAT_SCENARIOS.LOST_SMARTPHONE;
    return buildRiskResult(88, 'CRITICAL', true, preset.containmentActions, discoveredAt, preset, true);
  }

  if (scenarioType === 'UNAUTHORIZED_DISCLOSURE' || title.toLowerCase().includes('misdirected whatsapp')) {
    const preset = SME_THREAT_SCENARIOS.MISDIRECTED_REPORT;
    return buildRiskResult(72, 'HIGH', true, preset.containmentActions, discoveredAt, preset, false);
  }

  if (scenarioType === 'MALWARE_INFESTATION' || title.toLowerCase().includes('compromised desktop')) {
    const preset = SME_THREAT_SCENARIOS.COMPROMISED_BILLING_DESKTOP;
    return buildRiskResult(45, 'MEDIUM', false, preset.containmentActions, discoveredAt, preset, false);
  }

  // Dynamic Calculation
  let score = 0;
  const categoriesStr = (Array.isArray(dataCategories) ? dataCategories.join(' ') : String(dataCategories)).toLowerCase();

  const hasClinicalHealth = categoriesStr.includes('health') || categoriesStr.includes('biopsy') || categoriesStr.includes('blood') || categoriesStr.includes('prescriptions') || categoriesStr.includes('clinical');
  const hasAadhaar = categoriesStr.includes('aadhaar') || categoriesStr.includes('identity') || categoriesStr.includes('pan');
  const hasFinancial = categoriesStr.includes('financial') || categoriesStr.includes('invoice') || categoriesStr.includes('gstin');

  if (hasClinicalHealth) score += 40;
  if (hasAadhaar) score += 30;
  if (hasFinancial) score += 20;
  if (!hasClinicalHealth && !hasAadhaar && !hasFinancial) score += 15;

  const count = parseInt(estimatedCount, 10) || 0;
  const highVolumeAlert = count > 100;
  if (count > 100) score += 25;
  else if (count >= 20) score += 15;
  else if (count > 0) score += 10;

  const safeguards = String(safeguardsInPlace).toUpperCase();
  if (safeguards.includes('NONE') || safeguards.includes('UNENCRYPTED')) {
    score += 20;
  } else if (safeguards.includes('ENCRYPTED') || safeguards.includes('STRONG')) {
    score -= 20;
  }

  // Cap score between 10 and 100
  score = Math.max(10, Math.min(100, score));

  // Determine severity tier
  let severity = 'LOW';
  let mandatoryDpbiIntimation = false;

  // Statutory elevation rule: Aadhaar + Clinical Health automatically elevates to CRITICAL
  // Aadhaar or Clinical Health automatically elevates to at least HIGH
  if (score >= 80 || (hasAadhaar && hasClinicalHealth)) {
    severity = 'CRITICAL';
    mandatoryDpbiIntimation = true;
  } else if (score >= 60 || hasAadhaar || hasClinicalHealth) {
    severity = 'HIGH';
    mandatoryDpbiIntimation = true;
  } else if (score >= 35) {
    severity = 'MEDIUM';
    mandatoryDpbiIntimation = count > 50;
  } else {
    severity = 'LOW';
    mandatoryDpbiIntimation = false;
  }

  // Generate dynamic containment recommendations
  const containmentActions = [
    { id: 'ACT-01', text: 'Isolate affected hardware device or disconnect network interfaces', done: false, urgent: true },
    { id: 'ACT-02', text: 'Revoke active sessions and rotate administrative access credentials', done: false, urgent: true },
    { id: 'ACT-03', text: 'Generate DPBI Form DPBI-IR1 72-Hour Regulatory Intimation Dossier', done: false, urgent: mandatoryDpbiIntimation },
    { id: 'ACT-04', text: 'Issue plain-language citizen reassurance alerts without technical vulnerability details', done: false, urgent: false }
  ];

  return buildRiskResult(score, severity, mandatoryDpbiIntimation, containmentActions, discoveredAt, null, highVolumeAlert);
}

/**
 * Builds standard structured assessment response
 */
function buildRiskResult(score, severity, mandatoryDpbiIntimation, containmentActions, discoveredAtInput, preset = null, highVolumeAlert = false) {
  const discoveredDate = new Date(discoveredAtInput || Date.now());
  const statutoryHours = 72;
  const deadlineDate = new Date(discoveredDate.getTime() + statutoryHours * 60 * 60 * 1000);

  // Normalize actions to structured objects
  const normalizedActions = (containmentActions || []).map((a, idx) => {
    if (typeof a === 'string') {
      return { id: `ACT-0${idx + 1}`, text: a, done: false, urgent: true };
    }
    return {
      id: a.id || `ACT-0${idx + 1}`,
      text: a.text || String(a),
      done: Boolean(a.done),
      urgent: a.urgent !== undefined ? Boolean(a.urgent) : true
    };
  });

  return {
    score,
    severity,
    mandatoryDpbiIntimation,
    highVolumeAlert,
    statutoryDeadline: `${statutoryHours} Hours from discovery`,
    statutoryDeadlineHours: statutoryHours,
    discoveredAt: discoveredDate.toISOString(),
    deadlineTimestamp: deadlineDate.toISOString(),
    statutoryCitation: 'DPDP Act, 2023 Section 8(6) read with DPDP Rules, 2025 Rule 7',
    containmentActions: normalizedActions,
    actionItems: normalizedActions.map(a => a.text),
    structuredActions: normalizedActions,
    presetId: preset?.id || null
  };
}

/**
 * Calculates remaining hours and minutes for 72-hour DPBI regulatory countdown
 *
 * @param {string|Date} discoveredAt
 * @param {Date} [referenceTime]
 * @returns {Object} { isOverdue, hoursRemaining, minutesRemaining, formattedCountdown, complianceStatus }
 */
function compute72HourCountdown(discoveredAt, referenceTime = new Date()) {
  const start = new Date(discoveredAt || Date.now()).getTime();
  const deadline = start + (72 * 60 * 60 * 1000);
  const now = referenceTime.getTime();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    const overdueMs = Math.abs(diffMs);
    const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
    const overdueMins = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      isOverdue: true,
      hoursRemaining: 0,
      minutesRemaining: 0,
      overdueHours,
      overdueMins,
      formattedCountdown: `OVERDUE by ${overdueHours}h ${overdueMins}m`,
      complianceStatus: 'OVERDUE'
    };
  }

  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return {
    isOverdue: false,
    hoursRemaining,
    minutesRemaining,
    formattedCountdown: `${hoursRemaining}h ${minutesRemaining}m Remaining`,
    complianceStatus: 'ACTIVE'
  };
}

module.exports = {
  SME_THREAT_SCENARIOS,
  calculateRisk,
  compute72HourCountdown,
  sanitizeIncidentText
};
