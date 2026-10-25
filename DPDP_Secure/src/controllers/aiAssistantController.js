/**
 * DPDP_Secure - AI Assistant Controller
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Enforces Zero Cloud Egress, Pre-Call Redaction, and DPDP Statutory Compliance
 */

const aiService = require('../services/aiService');

/**
 * Handles interactive chat queries from the dashboard floating assistant.
 * Enforces pre-call PII redaction and prompt injection defense.
 *
 * POST /api/ai/chat
 */
async function chat(req, res) {
  try {
    const { query, context } = req.body || {};

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required and must be non-empty.'
      });
    }

    const result = await aiService.chatPrivacyAssistant(query.trim(), context);

    return res.json({
      success: true,
      query: result.query,
      answer: result.answer,
      provider: result.provider,
      piiRedacted: result.piiRedacted,
      sanitizedQuery: result.sanitizedQuery,
      redactedCount: result.redactedCount,
      redactedTypes: result.redactedTypes
    });
  } catch (error) {
    console.error('Error in aiAssistantController.chat:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing the privacy assistant query.',
      details: error.message
    });
  }
}

/**
 * Handles statutory multilingual notice translation under Section 5.
 * Preserves legally binding terms in Kannada and Hindi.
 *
 * POST /api/ai/translate-notice
 */
function translateNotice(req, res) {
  try {
    const { noticeText, targetLanguage } = req.body || {};

    if (!noticeText || typeof noticeText !== 'string' || !noticeText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'noticeText parameter is required.'
      });
    }

    const result = aiService.translateNotice(noticeText.trim(), targetLanguage);

    return res.json({
      success: true,
      targetLanguage: result.targetLanguage,
      languageCode: result.languageCode,
      translatedText: result.translatedText,
      statutoryTermsPreserved: result.statutoryTermsPreserved,
      provider: result.provider
    });
  } catch (error) {
    console.error('Error in aiAssistantController.translateNotice:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to translate statutory notice.',
      details: error.message
    });
  }
}

/**
 * Evaluates incident description and computes breach risk tier under Rule 7.
 * Determines 72-hour DPBI mandatory intimation status.
 *
 * POST /api/ai/assess-breach
 */
function assessBreach(req, res) {
  try {
    const { incidentText } = req.body || {};

    if (!incidentText || typeof incidentText !== 'string' || !incidentText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'incidentText parameter is required.'
      });
    }

    const assessment = aiService.assessBreachSeverity(incidentText.trim());

    return res.json({
      success: true,
      severity: assessment.severity,
      mandatoryDpbiIntimation: assessment.mandatoryDpbiIntimation,
      statutoryDeadlineHours: assessment.statutoryDeadlineHours,
      governingRules: assessment.governingRules,
      formRequired: assessment.formRequired,
      rationale: assessment.rationale,
      immediateRemediationSteps: assessment.immediateRemediationSteps,
      provider: assessment.provider
    });
  } catch (error) {
    console.error('Error in aiAssistantController.assessBreach:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to assess breach severity.',
      details: error.message
    });
  }
}

/**
 * Returns current AI service operational health and provider configuration.
 *
 * GET /api/ai/status
 */
function getStatus(req, res) {
  return res.json({
    success: true,
    provider: aiService.AI_PROVIDER,
    model: aiService.OLLAMA_MODEL,
    offlineFirst: true,
    zeroEgressGuaranteed: true,
    supportedLanguages: ['EN', 'KN', 'HI']
  });
}

module.exports = {
  chat,
  translateNotice,
  assessBreach,
  getStatus
};
