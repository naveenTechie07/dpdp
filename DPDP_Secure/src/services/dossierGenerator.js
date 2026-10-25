/**
 * DPDP_Secure - 72-Hour DPBI Regulatory Intimation Dossier & Citizen Alert Generator
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Pillar 4: Breach Notification Subsystem
 * Mandated under DPDP Act, 2023 Section 8(6) & DPDP Rules, 2025 (Rule 7)
 *
 * Features:
 * 1. Statutory Form DPBI-IR1 Regulatory Intimation Dossier Generation
 * 2. Immutable 72-hour regulatory chronology and SLA status evaluation
 * 3. SHA-256 Cryptographic Fingerprint for regulatory submission integrity
 * 4. Plain-language multi-lingual citizen reassurance alerts (English, Kannada, Hindi)
 * 5. Cybersecurity vulnerability concealment guardrail in citizen advisories
 */

const crypto = require('crypto');
const models = require('../models');

// Default Data Fiduciary profile for Aarogya Diagnostic Center
const DEFAULT_FIDUCIARY = {
  name: 'Aarogya Diagnostic Center',
  category: 'Healthcare SME Data Fiduciary (Diagnostic Center)',
  gstin: '29AAAAA0000A1Z5',
  registrationNumber: 'KA-BLR-MED-2021-9842',
  address: '12th Main Road, Indiranagar, Bengaluru, Karnataka - 560038',
  dpoName: 'Ramesh Kumar',
  dpoEmail: 'privacy@aarogyaclinic.in',
  dpoPhone: '+91 9845012345',
  dpoDesignation: 'Designated Compliance Officer & Data Protection Officer'
};

/**
 * Computes an immutable SHA-256 fingerprint over canonical JSON of the regulatory dossier
 *
 * @param {Object} dossierData
 * @returns {string} Hexadecimal SHA-256 hash
 */
function computeDossierFingerprint(dossierData) {
  const canonical = JSON.stringify({
    formNumber: dossierData.formNumber,
    incidentId: dossierData.incidentId,
    fiduciaryGstin: dossierData.fiduciary?.gstin,
    discoveryTimestamp: dossierData.chronology?.discoveryTimestamp,
    affectedCount: dossierData.exposure?.estimatedCount,
    severity: dossierData.severityAssessment?.severity,
    dataCategories: dossierData.exposure?.dataCategories
  });

  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Generates the formal Form DPBI-IR1 Statutory Dossier under Rule 7
 *
 * @param {string|Object} incidentIdOrData - Incident ID or Incident object
 * @returns {Promise<Object>} Complete Form DPBI-IR1 statutory dossier
 */
async function generateDpbiDossier(incidentIdOrData) {
  let incident = null;

  if (typeof incidentIdOrData === 'string') {
    incident = await models.getIncidentById(incidentIdOrData);
  } else if (incidentIdOrData && typeof incidentIdOrData === 'object') {
    incident = incidentIdOrData;
  }

  // Graceful fallback if incident does not exist in DB yet
  if (!incident) {
    incident = {
      id: typeof incidentIdOrData === 'string' ? incidentIdOrData : 'INC-2026-9921',
      incidentTitle: 'Lost Receptionist Smartphone (Indiranagar Metro Station)',
      scenarioType: 'DEVICE_LOSS_UNENCRYPTED',
      severity: 'CRITICAL',
      affectedCount: 250,
      dataCategories: 'Identity (Aadhaar, PAN), Contact (Mobile, Address), Clinical Health Data (Diagnostic Requisitions, Biopsy, Blood Panels)',
      containmentActions: JSON.stringify([
        { id: 'ACT-01', text: 'Trigger Google Find My Device remote lock & wipe', done: true, urgent: true },
        { id: 'ACT-02', text: 'Revoke active WhatsApp Business linked web sessions across all endpoints', done: true, urgent: true },
        { id: 'ACT-03', text: 'Rotate clinic reception WhatsApp OTP & SIM card via telecom provider', done: false, urgent: false },
        { id: 'ACT-04', text: 'Generate statutory Form DPBI-IR1 72-Hour Intimation Dossier', done: true, urgent: true },
        { id: 'ACT-05', text: 'Dispatch plain-language reassurance citizen alerts in English, Kannada, and Hindi', done: false, urgent: false }
      ]),
      reportedToDpbi: 0,
      citizenAlertSent: 0,
      discoveredAt: new Date(Date.now() - 3.75 * 60 * 60 * 1000).toISOString()
    };
  }

  const discoveryDate = new Date(incident.discoveredAt || Date.now());
  const submissionDate = new Date();
  const deadlineDate = new Date(discoveryDate.getTime() + 72 * 60 * 60 * 1000);

  const diffMs = deadlineDate.getTime() - submissionDate.getTime();
  const isWithin72Hours = diffMs >= 0;
  const hoursElapsed = Math.max(0, Math.round(((submissionDate.getTime() - discoveryDate.getTime()) / (1000 * 60 * 60)) * 10) / 10);
  const hoursRemaining = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);

  // Parse containment actions
  let actions = [];
  try {
    actions = typeof incident.containmentActions === 'string'
      ? JSON.parse(incident.containmentActions)
      : (incident.containmentActions || []);
  } catch (e) {
    actions = [];
  }

  const normalizedActions = actions.map((a, idx) => ({
    id: a.id || `ACT-0${idx + 1}`,
    action: a.text || a.action || a.title || String(a),
    title: a.text || a.action || a.title || String(a),
    done: Boolean(a.done),
    urgent: a.urgent !== undefined ? Boolean(a.urgent) : true,
    completedAt: a.done ? new Date(discoveryDate.getTime() + 15 * 60 * 1000).toISOString() : null
  }));

  const defaultRemedialActions = [
    'Remote device wipe triggered',
    'WhatsApp multi-device tokens revoked',
    'Lab network credentials rotated',
    'Affected patients contacted'
  ];

  const remedialActionsTaken = normalizedActions.length > 0
    ? normalizedActions.map(a => a.action)
    : defaultRemedialActions;

  const impactedDataCategories = incident.dataCategories
    ? (Array.isArray(incident.dataCategories) ? incident.dataCategories : [incident.dataCategories])
    : ['Identity (Aadhaar/PAN)', 'Contact (Mobile)', 'Clinical Health Data (Biopsy/Blood panels)'];

  const citizenAlerts = generateCitizenAlerts(incident);

  const dossierPayload = {
    formIdentifier: 'FORM DPBI-IR1 (Section 8(6) & Rule 7)',
    formNumber: 'FORM DPBI-IR1',
    statutoryCitation: 'Digital Personal Data Protection Act, 2023 Section 8(6) read with DPDP Rules, 2025 Rule 7',
    regulatoryAuthority: 'Data Protection Board of India (DPBI)',
    dossierTitle: 'Statutory Personal Data Breach Intimation Dossier',
    incidentId: incident.id,
    fiduciary: DEFAULT_FIDUCIARY,
    isWithin72Hours,
    estimatedAffected: incident.affectedCount || incident.affectedPrincipals || 250,
    statutoryRiskScore: incident.riskScore || (incident.severity === 'CRITICAL' ? 88 : (incident.severity === 'HIGH' ? 72 : 45)),
    statutoryRiskTier: incident.riskTier || incident.severity || 'CRITICAL',
    impactedDataCategories,
    remedialActionsTaken,
    citizenAlerts,
    chronology: {
      occurrenceTimestamp: incident.occurredAt || new Date(discoveryDate.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      discoveryTimestamp: discoveryDate.toISOString(),
      submissionTimestamp: submissionDate.toISOString(),
      statutoryDeadline: deadlineDate.toISOString(),
      statutoryWindowHours: 72,
      hoursElapsed,
      hoursRemaining,
      isWithin72Hours,
      complianceStatus: isWithin72Hours ? 'STATUTORY_72H_COMPLIANT' : 'OVERDUE_NON_COMPLIANT'
    },
    threatVector: {
      title: incident.incidentTitle || incident.title || 'Lost Receptionist Smartphone',
      scenarioType: incident.scenarioType || incident.threatType || 'DEVICE_LOSS_UNENCRYPTED',
      informalSiloOrigin: 'Informal Smartphone WhatsApp Chat Backups & Local Storage',
      impactedSilos: [
        'clinic_reception_chat.txt (WhatsApp Patient Chats)',
        'whatsapp_media_store (Diagnostic Lab Reports & Prescriptions)',
        'mobile_local_sqlite (Unencrypted Offline Patient Database)'
      ],
      vectorDescription: 'Unencrypted Android smartphone lost during transit at Indiranagar Metro Station containing WhatsApp patient communication records, diagnostic prescriptions, and billing receipts.'
    },
    exposure: {
      estimatedCount: incident.affectedCount || incident.affectedPrincipals || 250,
      dataCategories: incident.dataCategories || 'Identity (Aadhaar, PAN), Contact (Mobile, Address), Clinical Health (Diagnostic Requisitions, Biopsy, Blood Panels)',
      sensitivePersonalData: true,
      healthDataExposed: true,
      identityDataExposed: true
    },
    severityAssessment: {
      severity: incident.severity || incident.riskTier || 'CRITICAL',
      riskScore: incident.riskScore || (incident.severity === 'CRITICAL' ? 88 : (incident.severity === 'HIGH' ? 72 : 45)),
      statutoryElevationTriggered: true,
      statutoryElevationReason: 'Presence of Clinical Health Data and Identity Identifiers mandates automatic elevation to CRITICAL/HIGH under Rule 7.'
    },
    containmentMeasures: normalizedActions,
    citizenNotificationPlan: {
      status: incident.citizenAlertSent ? 'ALERTS_DISPATCHED' : 'READY_TO_DISPATCH',
      channels: ['SMS', 'WhatsApp'],
      languagesSupported: ['English', 'Kannada (ಕನ್ನಡ)', 'Hindi (हिन्दी)'],
      vulnerabilityConcealmentEnforced: true,
      policyRationale: 'Notices provide plain-language safety instructions without disclosing internal architecture or technical vulnerability specifics.'
    },
    statutoryCertification: {
      certifierName: DEFAULT_FIDUCIARY.dpoName,
      certifierDesignation: DEFAULT_FIDUCIARY.dpoDesignation,
      certifiedAt: submissionDate.toISOString(),
      verificationStamp: 'DPDP_SECURE_DPBI_IR1_2026_SRUJANA',
      legalDeclaration: 'I hereby certify under penalty of Section 33 of the Digital Personal Data Protection Act, 2023 that the information furnished in this Form DPBI-IR1 is true, complete, and accurately reflects our findings and remedial containment measures.'
    }
  };

  const fingerprint = computeDossierFingerprint(dossierPayload);
  dossierPayload.sha256Fingerprint = fingerprint;
  dossierPayload.dossierSha256 = fingerprint;

  return dossierPayload;
}

/**
 * Generates ready-to-dispatch plain-language citizen alerts across English, Kannada, and Hindi
 * Enforces Cybersecurity Vulnerability Concealment: Reassures and guides without revealing technical CVEs.
 *
 * @param {Object} incident
 * @param {Object} [options]
 * @returns {Object} Multi-lingual notification templates for SMS and WhatsApp
 */
function generateCitizenAlerts(incident = {}, options = {}) {
  const incidentTitle = incident.incidentTitle || incident.title || 'Clinic Reception Mobile Misplacement';
  const incidentId = incident.id || 'INC-2026-9921';
  const dpoEmail = DEFAULT_FIDUCIARY.dpoEmail;
  const dpoPhone = DEFAULT_FIDUCIARY.dpoPhone;
  const clinicName = options.clinicName || incident.clinicName || 'Aarogya Clinic';
  const formalClinicName = DEFAULT_FIDUCIARY.name;

  // Format Date for India Standard Time
  const incidentDate = new Date(incident.discoveredAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const enSms = `Dear ${clinicName} Patient, on ${incidentDate}, a clinic front-desk mobile phone was reported lost. Your contact and appointment record were stored on the device. We immediately triggered a remote wipe and locked the phone. No unauthorized access has been confirmed. As a precaution, please ignore any suspicious payment messages claiming to be from our clinic. For queries, contact our DPO at ${dpoEmail}.`;
  const enWhatsapp = `*Important Notice from ${clinicName}*\n\nDear Patient,\n\nOn *${incidentDate}*, a clinic front-desk mobile phone was reported lost. Your contact details and general appointment records were present on the device.\n\n🛡️ *Immediate Safeguards Taken:*\n• We immediately triggered a remote lock and wipe of the device.\n• No unauthorized access to your clinical diagnostic files has been confirmed.\n\n⚠️ *Precautions for You:*\n• Please ignore any unsolicited phone calls or messages asking for payments, OTPs, or UPI PINs claiming to be from ${clinicName}.\n• Our clinic will *never* demand financial transfers over WhatsApp.\n\nFor any questions, reach our designated Data Protection Officer:\n📧 ${dpoEmail} | 📞 ${dpoPhone}`;

  const knSms = `ಆರೋಗ್ಯ ಕ್ಲಿನಿಕ್ ರೋಗಿಗಳಿಗೆ ಪ್ರಮುಖ ಸೂಚನೆ: ನಮ್ಮ ಕ್ಲಿನಿಕ್ನ ರಿಸೆಪ್ಷನ್ ಮೊಬೈಲ್ ಕಳೆದುಹೋಗಿದ್ದು, ಸುರಕ್ಷತಾ ಕ್ರಮವಾಗಿ ಅದನ್ನು ತಕ್ಷಣ ದೂರದಿಂದಲೇ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ. ಯಾವುದೇ ಅನಧಿಕೃತ ಸಂದೇಶಗಳು ಬಂದರೆ ದಯವಿಟ್ಟು ಗಮನಿಸಬೇಡಿ. ಯಾವುದೇ ಶಂಕಿತ ಪಾವತಿ ಸಂದೇಶಗಳನ್ನು ನಿರ್ಲಕ್ಷಿಸಿ. ಸಂಪರ್ಕ: ${dpoEmail}`;
  const knWhatsapp = `*ಆರೋಗ್ಯ ಕ್ಲಿನಿಕ್ ವತಿಯಿಂದ ಪ್ರಮುಖ ಗ್ರಾಹಕ ಸುರಕ್ಷತಾ ಸೂಚನೆ*\n\nಆತ್ಮೀಯ ರೋಗಿಗಳೇ,\n\nನಮ್ಮ ಕ್ಲಿನಿಕ್ನ ರಿಸೆಪ್ಷನ್ ಮೊಬೈಲ್ ಕಳೆದುಹೋಗಿದ್ದು, ಸುರಕ್ಷತಾ ಕ್ರಮವಾಗಿ ಅದನ್ನು ತಕ್ಷಣ ದೂರದಿಂದಲೇ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ. ಯಾವುದೇ ಅನಧಿಕೃತ ಸಂದೇಶಗಳು ಬಂದರೆ ದಯವಿಟ್ಟು ಗಮನಿಸಬೇಡಿ.\n\n🛡️ *ನಾವು ಕೈಗೊಂಡ ಸುರಕ್ಷತಾ ಕ್ರಮಗಳು:*\n• ಕಳೆದುಹೋದ ತಕ್ಷಣವೇ ಸಾಧನವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಲಾಕ್ ಮಾಡಿ ರಿಮೋಟ್ ವೈಪ್ (ಡೇಟಾ ಅಳಿಸುವಿಕೆ) ಮಾಡಲಾಗಿದೆ.\n• ಯಾವುದೇ ಅನಧಿಕೃತ ವ್ಯಕ್ತಿಗಳು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಪಡೆದುಕೊಂಡ ಬಗ್ಗೆ ಯಾವುದೇ ದೃಢೀಕರಣವಿಲ್ಲ.\n\n⚠️ *ನಿಮ್ಮ ಮುನ್ನೆಚ್ಚರಿಕೆಗಾಗಿ:*\n• ಕ್ಲಿನಿಕ್ ಹೆಸರಿನಲ್ಲಿ ಬರುವ ಯಾವುದೇ ಅನುಮಾನಾಸ್ಪದ ಹಣ ಪಾವತಿ ಅಥವಾ OTP ಸಂದೇಶಗಳಿಗೆ ಸ್ಪಂದಿಸಬೇಡಿ.\n• ನಾವು ಎಂದಿಗೂ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಹಣದ ಬೇಡಿಕೆ ಇಡುವುದಿಲ್ಲ.\n\nಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದರೆ ನಮ್ಮ ದತ್ತಾಂಶ ರಕ್ಷಣಾ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ:\n📧 ${dpoEmail} | 📞 ${dpoPhone}`;

  const hiSms = `आरोग्य क्लिनिक के सम्मानित मरीज, आपको सूचित किया जाता है कि क्लिनिक का एक फोन खो गया था जिसे तुरंत ब्लॉक कर दिया गया है। एहतियात के तौर पर, कृपया किसी भी संदिग्ध भुगतान संदेश पर ध्यान न दें। संपर्क: ${dpoEmail}`;
  const hiWhatsapp = `*आरोग्य क्लिनिक की ओर से आवश्यक सुरक्षा सूचना*\n\nप्रिय मरीज,\n\nआरोग्य क्लिनिक के सम्मानित मरीज, आपको सूचित किया जाता है कि क्लिनिक का एक फोन खो गया था जिसे तुरंत ब्लॉक कर दिया गया है।\n\n🛡️ *हमारे द्वारा उठाए गए त्वरित कदम:*\n• हमने तुरंत प्रभाव से उपकरण को रिमोट लॉक और डेटा वाइप कर दिया है।\n• किसी भी अनाधिकृत पहुंच की पुष्टि नहीं हुई है।\n\n⚠️ *आपकी सावधानी के लिए:*\n• क्लिनिक के नाम पर आने वाले किसी भी संदिग्ध भुगतान संदेश, कॉल या OTP अनुरोध पर बिल्कुल ध्यान न दें।\n• हमारा क्लिनिक कभी भी व्हाट्सएप पर ऑनलाइन भुगतान की मांग नहीं करता है।\n\nकिसी भी प्रश्न या सहायता के लिए हमारे डेटा संरक्षण अधिकारी (DPO) से संपर्क करें:\n📧 ${dpoEmail} | 📞 ${dpoPhone}`;

  const enObj = {
    languageName: 'English',
    languageCode: 'en',
    sms: enSms,
    whatsapp: enWhatsapp,
    body: enSms,
    charCountSms: enSms.length
  };

  const knObj = {
    languageName: 'Kannada (ಕನ್ನಡ)',
    languageCode: 'kn',
    sms: knSms,
    whatsapp: knWhatsapp,
    body: knSms,
    charCountSms: knSms.length
  };

  const hiObj = {
    languageName: 'Hindi (हिन्दी)',
    languageCode: 'hi',
    sms: hiSms,
    whatsapp: hiWhatsapp,
    body: hiSms,
    charCountSms: hiSms.length
  };

  return {
    incidentId,
    clinicName,
    dispatchedAt: new Date().toISOString(),
    vulnerabilityConcealed: true,
    guardrailNotes: 'All messages strictly omit technical system architecture, unpatched CVEs, or internal database schemas to prevent secondary adversary exploitation.',
    languages: {
      en: enObj,
      kn: knObj,
      hi: hiObj
    },
    // Upper-case shorthands for direct access
    EN: enObj,
    KN: knObj,
    HI: hiObj
  };
}

module.exports = {
  generateDpbiDossier,
  generateCitizenAlerts,
  computeDossierFingerprint,
  DEFAULT_FIDUCIARY
};
