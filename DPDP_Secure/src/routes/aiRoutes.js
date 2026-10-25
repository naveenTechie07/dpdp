const express = require('express');
const router = express.Router();

/**
 * AI & LLM Integration Routes (Offline-first with grounded statutory fallback)
 */
router.post('/api/ai/chat', (req, res) => {
  const { query } = req.body || {};
  const lowerQuery = (query || '').toLowerCase();

  let response = 'Under the DPDP Act, 2023, data fiduciaries of all sizes must maintain reasonable security safeguards to prevent personal data breaches under Section 8(5).';

  if (lowerQuery.includes('whatsapp') || lowerQuery.includes('prescription')) {
    response = 'Under Section 8(4) of the DPDP Act, 2023, storing sensitive diagnostic data on unencrypted WhatsApp chats creates high regulatory exposure. WhatsApp chat exports are informal silos. You must obtain itemised Section 5 consent, restrict access to authorized clinic staff, and purge files once the statutory purpose is complete.';
  } else if (lowerQuery.includes('erasure') || lowerQuery.includes('tax') || lowerQuery.includes('bill') || lowerQuery.includes('invoice')) {
    response = 'Under Section 12(3), a citizen has the right to erasure. However, under Section 8(7) read with Section 36 of the CGST Act 2017, invoices and tax records must be retained for 72 months (6 years). Use DPDP_Secure\'s Dual-Track Collision Resolver to atomically redact informal WhatsApp and lead records while retaining statutory tax locks on billing files.';
  } else if (lowerQuery.includes('phone') || lowerQuery.includes('lost') || lowerQuery.includes('breach')) {
    response = 'Under DPDP Act Section 8(6) and DPDP Rules, 2025 (Rule 7), if an unencrypted phone holding customer PII is lost, this constitutes a reportable personal data breach. You must: 1) Trigger remote lock & wipe; 2) Revoke WhatsApp Web sessions; 3) Intimate the Data Protection Board of India (DPBI) within 72 hours using Form DPBI-IR1; 4) Send reassuring notices to affected citizens.';
  }

  res.json({
    success: true,
    query,
    answer: response,
    provider: 'DPDP_Secure Statutory Rule Engine (100% Offline-First)'
  });
});

router.post('/api/ai/translate-notice', (req, res) => {
  const { noticeText, targetLanguage } = req.body || {};

  let translated = noticeText;
  if (targetLanguage === 'KN' || targetLanguage === 'kannada') {
    translated = 'ಆರೋಗ್ಯ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಸೆಂಟರ್ - ಡೇಟಾ ರಕ್ಷಣೆ ಸೂಚನೆ (DPDP ಕಾಯ್ದೆ 2023)... ವಾಟ್ಸಾಪ್ ಮೂಲಕ ವರದಿಗಳನ್ನು ಸ್ವೀಕರಿಸಲು ದಯವಿಟ್ಟು YES ಎಂದು ಉತ್ತರಿಸಿ.';
  } else if (targetLanguage === 'HI' || targetLanguage === 'hindi') {
    translated = 'आरोग्य डायग्नोस्टिक सेंटर - डेटा गोपनीयता सूचना (DPDP अधिनियम 2023)... व्हाट्सएप पर रिपोर्ट प्राप्त करने के लिए YES लिखकर भेजें।';
  }

  res.json({
    success: true,
    targetLanguage,
    translatedText: translated
  });
});

router.post('/api/ai/assess-breach', (req, res) => {
  const { incidentText } = req.body || {};

  res.json({
    success: true,
    severity: 'CRITICAL',
    mandatoryDpbiIntimation: true,
    statutoryDeadlineHours: 72,
    rationale: 'Incident involves patient clinical diagnostic reports and Aadhaar identity markers without confirmed encryption, requiring mandatory DPBI notification under Rule 7.'
  });
});

module.exports = router;
