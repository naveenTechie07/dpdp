/**
 * DPDP_Secure - 1-Click Hackathon Demo Reset Controller
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Endpoint: POST /api/demo/reset
 * Wipes test artifacts and resets Aarogya Diagnostic Center demo state in under 500ms.
 */

const { seedDemoData } = require('../models/demoSeeder');

/**
 * Resets the demo environment to the baseline Aarogya Diagnostic Center walkthrough state
 * POST /api/demo/reset
 */
async function resetDemoEnvironment(req, res) {
  try {
    const result = await seedDemoData();

    return res.status(200).json({
      success: true,
      message: 'Demo environment reset to Aarogya Clinic',
      details: {
        tenant: 'Aarogya Diagnostic Center (Indiranagar, Bengaluru)',
        silosConfigured: result.silosCount,
        piiItemsFound: result.totalPiiItems,
        liveDsrTicket: result.dsrTicket,
        activeIncident: result.incidentId,
        auditChainStatus: result.auditChainVerified ? 'CRYPTOGRAPHICALLY_VERIFIED' : 'UNVERIFIED'
      }
    });
  } catch (error) {
    console.error('[DEMO_RESET_ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset demo environment.',
      details: error.message
    });
  }
}

module.exports = {
  resetDemoEnvironment
};
