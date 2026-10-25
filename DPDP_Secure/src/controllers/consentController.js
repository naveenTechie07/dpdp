/**
 * DPDP_Secure - Consent & Purpose Management Controller
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Section 5 Multilingual Notices | Section 6(1) Granular Consent | Section 6(4) Revocation | SHA-256 Proofs
 */

const crypto = require('crypto');
const models = require('../models');

// Default fallback tenant ID
const DEFAULT_TENANT_ID = 'TENANT-AAROGYA-01';

/**
 * Standard pre-configured Section 5 notice templates
 */
const DEFAULT_NOTICES = [
  {
    id: 'NOTICE-AAROGYA-EN',
    title: 'Diagnostic Test Booking & Lab Report Dispatch (English)',
    purposeCode: 'PURP-DIAGNOSTIC-REPORTING',
    language: 'English',
    version: '1.0',
    noticeText:
      "Aarogya Diagnostic Center — Data Protection Notice (DPDP Act, 2023 Section 5):\n\n" +
      "1. Itemised Personal Data Collected: Patient Name, Mobile Number, Age, and Diagnostic Test Name (Blood Sugar, Lipid Profile, Thyroid, Biopsy).\n" +
      "2. Specified Lawful Purpose: Delivery of requested medical lab reports and appointment coordination via WhatsApp.\n" +
      "3. Right to Withdraw (Section 6(4)): You may withdraw your consent at any time by replying 'STOP' or contacting our clinic.\n" +
      "4. Grievance Redressal: Clinic Data Protection Officer: Ramesh Kumar (dpo@aarogyaclinic.in, +91 9845012345).\n" +
      "To confirm your consent, please reply 'YES'.",
    isActive: 1
  },
  {
    id: 'NOTICE-AAROGYA-KN',
    title: 'ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ವರದಿ ರವಾನೆ ಸೂಚನೆ (Kannada - ಕನ್ನಡ)',
    purposeCode: 'PURP-DIAGNOSTIC-REPORTING',
    language: 'Kannada',
    version: '1.0',
    noticeText:
      "ಆರೋಗ್ಯ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಸೆಂಟರ್ — ಡೇಟಾ ರಕ್ಷಣೆ ಸೂಚನೆ (DPDP ಕಾಯ್ದೆ 2023 ಸೆಕ್ಷನ್ 5):\n\n" +
      "1. ಸಂಗ್ರಹಿಸಿದ ವೈಯಕ್ತಿಕ ದತ್ತಾಂಶ: ರೋಗಿಯ ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ, ವಯಸ್ಸು ಮತ್ತು ರಕ್ತ ಪರೀಕ್ಷಾ ವಿವರಗಳು.\n" +
      "2. ಉದ್ದೇಶ: ರೋಗಿಯ ಅಧಿಕೃತ ವೈದ್ಯಕೀಯ ಲ್ಯಾಬ್ ಪರೀಕ್ಷಾ ವರದಿಗಳನ್ನು ವಾಟ್ಸಾಪ್ ಮೂಲಕ ತಲುಪಿಸುವುದು.\n" +
      "3. ಹಿಂಪಡೆಯುವ ಹಕ್ಕು (ಸೆಕ್ಷನ್ 6(4)): ನೀವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ 'STOP' ಎಂದು ಉತ್ತರಿಸುವ ಮೂಲಕ ಸಮ್ಮತಿಯನ್ನು ಹಿಂಪಡೆಯಬಹುದು.\n" +
      "4. ಕುಂದುಕೊರತೆ ನಿವಾರಣೆ: ಕ್ಲಿನಿಕ್ ಅಧಿಕಾರಿ: ರಮೇಶ್ ಕುಮಾರ್ (dpo@aarogyaclinic.in, +91 9845012345).\n" +
      "ವಾಟ್ಸಾಪ್ ಮೂಲಕ ವರದಿಗಳನ್ನು ಸ್ವೀಕರಿಸಲು ದಯವಿಟ್ಟು 'YES' ಎಂದು ಉತ್ತರಿಸಿ.",
    isActive: 1
  },
  {
    id: 'NOTICE-AAROGYA-HI',
    title: 'डायग्नोस्टिक लैब रिपोर्ट प्रेषण सूचना (Hindi - हिन्दी)',
    purposeCode: 'PURP-DIAGNOSTIC-REPORTING',
    language: 'Hindi',
    version: '1.0',
    noticeText:
      "आरोग्य डायग्नोस्टिक सेंटर — डेटा गोपनीयता सूचना (DPDP अधिनियम 2023 धारा 5):\n\n" +
      "1. एकत्रित व्यक्तिगत डेटा: रोगी का नाम, मोबाइल नंबर, आयु और रक्त जांच रिपोर्ट विवरण।\n" +
      "2. विशिष्ट उद्देश्य: रोगी द्वारा मांगी गई मेडिकल लैब रिपोर्ट को व्हाट्सएप पर सुरक्षित रूप से भेजना।\n" +
      "3. सहमति वापस लेने का अधिकार (धारा 6(4)): आप किसी भी समय 'STOP' भेजकर अपनी सहमति वापस ले सकते हैं।\n" +
      "4. शिकायत निवारण: क्लिनिक शिकायत अधिकारी: रमेश कुमार (dpo@aarogyaclinic.in, +91 9845012345)।\n" +
      "व्हाट्सएप पर रिपोर्ट प्राप्त करने के लिए 'YES' लिखकर भेजें।",
    isActive: 1
  }
];

/**
 * Renders the Section 5 Multilingual Notice Builder & Collection Points Studio
 * GET /consent/collection-points
 */
async function renderCollectionPoints(req, res) {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    let notices = await models.getActiveNotices(tenantId);

    if (!notices || notices.length === 0) {
      notices = DEFAULT_NOTICES;
    }

    res.render('consent-collectionpoints', {
      title: 'Collection points - DPDP_Secure',
      description: 'Design and publish Section 5 multilingual notices.',
      breadcrumbs: ['Workspace', 'Consent', 'Collection points'],
      notices,
      path: '/consent/collection-points'
    });
  } catch (error) {
    console.error('Error in consentController.renderCollectionPoints:', error);
    res.status(500).render('error', {
      title: 'Error - DPDP_Secure',
      message: 'Failed to load consent collection points.'
    });
  }
}

/**
 * Renders the Immutable Chronological Consent Event Ledger
 * GET /consent/ledger
 */
async function renderLedger(req, res) {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const events = await models.getConsentLedger(tenantId);

    res.render('consent-ledger', {
      title: 'Consent ledger - DPDP_Secure',
      description: 'Summary records — one row per consent capture event.',
      breadcrumbs: ['Workspace', 'Consent', 'Consent ledger'],
      events: events || [],
      path: '/consent/ledger'
    });
  } catch (error) {
    console.error('Error in consentController.renderLedger:', error);
    res.status(500).render('500', {
      title: 'Ledger Error - DPDP_Secure',
      description: 'Failed to load consent ledger: ' + error.message,
      breadcrumbs: ['Workspace', 'Error']
    });
  }
}

/**
 * Creates or updates a Section 5 notice in SQLite
 * POST /api/consent/notices
 */
async function createNotice(req, res) {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const { title, purposeCode, language, noticeText, version } = req.body || {};

    if (!title || !purposeCode || !noticeText) {
      return res.status(400).json({
        success: false,
        error: 'Title, purposeCode, and noticeText are required.'
      });
    }

    const noticeId = `NOTICE-${Date.now()}`;
    await models.saveNotice({
      id: noticeId,
      tenantId,
      title: title.trim(),
      purposeCode: purposeCode.trim(),
      language: language ? language.trim() : 'English',
      noticeText: noticeText.trim(),
      version: version || '1.0',
      isActive: 1
    });

    // Write to audit logs
    await models.logAuditEvent(
      tenantId,
      req.session?.user?.name || 'Ramesh Kumar (SME Owner)',
      'CREATE_NOTICE_SEC_5',
      `consent_notices/${noticeId}`,
      { title, purposeCode, language }
    );

    return res.status(201).json({
      success: true,
      noticeId,
      title,
      message: 'Multilingual Section 5 notice created successfully.'
    });
  } catch (error) {
    console.error('Error in consentController.createNotice:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save consent notice.',
      details: error.message
    });
  }
}

/**
 * Retrieves details for a specific notice by ID
 * GET /api/consent/notices/:id
 */
async function getNoticeById(req, res) {
  try {
    const notice = await models.getNoticeById(req.params.id);
    if (!notice) {
      // Check default fallback
      const found = DEFAULT_NOTICES.find((n) => n.id === req.params.id);
      if (found) return res.json({ success: true, notice: found });

      return res.status(404).json({ success: false, error: 'Notice not found.' });
    }
    return res.json({ success: true, notice });
  } catch (error) {
    console.error('Error in consentController.getNoticeById:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch notice.' });
  }
}

/**
 * Records an immutable consent event in SQLite with SHA-256 cryptographic non-repudiation
 * POST /api/consent/record-consent
 */
async function recordConsent(req, res) {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const { phone, purposeCode, channel, status } = req.body || {};

    const phoneVal = (phone || '+91 9845012345').trim();
    const purposeVal = (purposeCode || 'PURP-DIAGNOSTIC-REPORTING').trim();
    const statusVal = (status || 'ACTIVE').trim().toUpperCase();
    const channelVal = (channel || 'WHATSAPP').trim();
    const timestamp = new Date().toISOString();

    // Compute cryptographic SHA-256 integrity proof
    const sha256Proof = crypto
      .createHash('sha256')
      .update(phoneVal + purposeVal + statusVal + timestamp + tenantId)
      .digest('hex');

    const result = await models.recordConsentEvent({
      tenantId,
      dataPrincipalPhone: phoneVal,
      purposeCode: purposeVal,
      status: statusVal,
      channel: channelVal,
      timestamp,
      sha256Proof
    });

    // Write to audit trail with SHA-256 hash chaining
    await models.logAuditEvent(
      tenantId,
      `CITIZEN-${phoneVal}`,
      'RECORD_CONSENT_SEC_6',
      `consent_events/${result.id}`,
      { phone: phoneVal, purpose: purposeVal, channel: channelVal, sha256Proof }
    );

    return res.json({
      success: true,
      eventId: result.id,
      phone: phoneVal,
      purpose: purposeVal,
      status: statusVal,
      channel: channelVal,
      timestamp,
      sha256Proof
    });
  } catch (error) {
    console.error('Error in consentController.recordConsent:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to record consent event.',
      details: error.message
    });
  }
}

/**
 * Handles statutory consent revocation under Section 6(4)
 * POST /api/consent/withdraw-consent
 */
async function withdrawConsent(req, res) {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const { phone, purposeCode } = req.body || {};

    const phoneVal = (phone || '+91 9845012345').trim();
    const purposeVal = (purposeCode || 'PURP-DIAGNOSTIC-REPORTING').trim();
    const timestamp = new Date().toISOString();

    const sha256Proof = crypto
      .createHash('sha256')
      .update(phoneVal + purposeVal + 'WITHDRAWN' + timestamp + tenantId)
      .digest('hex');

    const result = await models.withdrawConsent(phoneVal, purposeVal, tenantId);

    // Write revocation to audit trail
    await models.logAuditEvent(
      tenantId,
      `CITIZEN-${phoneVal}`,
      'REVOKE_CONSENT_SEC_6_4',
      `consent_events/${result.id}`,
      { phone: phoneVal, purpose: purposeVal, status: 'WITHDRAWN', sha256Proof }
    );

    return res.json({
      success: true,
      message: 'Consent successfully revoked under Section 6(4).',
      phone: phoneVal,
      purposeCode: purposeVal,
      status: 'WITHDRAWN',
      eventId: result.id,
      sha256Proof
    });
  } catch (error) {
    console.error('Error in consentController.withdrawConsent:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to withdraw consent.',
      details: error.message
    });
  }
}

module.exports = {
  renderCollectionPoints,
  renderLedger,
  createNotice,
  getNoticeById,
  recordConsent,
  withdrawConsent,
  DEFAULT_NOTICES
};
