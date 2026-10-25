const appConfig = require('../config/appConfig');

/**
 * Dashboard & Navigation Controller
 */
const dashboardController = {
  /**
   * Render the Executive Compliance Dashboard
   */
  renderDashboard: (req, res) => {
    // Default / Seeded SME compliance stats
    const metrics = {
      silosCount: 3,
      piiCount: 1420,
      activeNoticesCount: 3,
      pendingDsrCount: 1,
      taxLockedCount: 1,
      activeIncidentsCount: 0,
      complianceScore: 84,
      recentActivity: [
        {
          timestamp: 'Just now',
          actor: 'System Scanner',
          action: 'DISCOVERY_SCAN',
          resource: 'clinic_reception_chat.txt',
          details: '840 Indian PII items discovered (Aadhaar, clinical health data)'
        },
        {
          timestamp: '15 mins ago',
          actor: 'Ramesh Sharma',
          action: 'CONSENT_CAPTURED',
          resource: 'WhatsApp Business',
          details: 'Opted into lab report delivery via Section 5 notice'
        },
        {
          timestamp: '2 hours ago',
          actor: 'Deepa Nair',
          action: 'DSR_INTAKE',
          resource: 'Public Portal (/dsr)',
          details: 'Ticket DSR-2026-8819 created for Section 12 erasure'
        },
        {
          timestamp: 'Yesterday',
          actor: 'Ramesh Kumar (SME Owner)',
          action: 'TAX_LOCK_APPLIED',
          resource: 'invoices_billing.csv',
          details: 'CGST Section 36 statutory 6-year retention lock active on INV-2024-309'
        },
        {
          timestamp: '2 days ago',
          actor: 'Compliance Engine',
          action: 'ROPA_SYNTHESIS',
          resource: 'Section 8(4) Register',
          details: 'Synthesized 3 lawful processing activities across diagnostic workflows'
        }
      ]
    };

    res.render('index', {
      title: 'Executive Compliance Dashboard - DPDP_Secure',
      description: 'Aarogya Diagnostic Center • Real-Time DPDP Act, 2023 Compliance Posture',
      path: '/',
      breadcrumbs: ['Workspace', 'Dashboard'],
      silosCount: metrics.silosCount,
      piiCount: metrics.piiCount,
      activeNoticesCount: metrics.activeNoticesCount,
      pendingDsrCount: metrics.pendingDsrCount,
      taxLockedCount: metrics.taxLockedCount,
      activeIncidentsCount: metrics.activeIncidentsCount,
      complianceScore: metrics.complianceScore,
      recentActivity: metrics.recentActivity
    });
  },

  /**
   * Return dynamic metrics as JSON for frontend polling
   */
  getMetricsJson: (req, res) => {
    res.json({
      success: true,
      metrics: {
        silosCount: 3,
        piiCount: 1420,
        activeNoticesCount: 3,
        pendingDsrCount: 1,
        taxLockedCount: 1,
        activeIncidentsCount: 0,
        complianceScore: 84
      }
    });
  },

  /**
   * Render User Profile
   */
  renderProfile: (req, res) => {
    res.render('profile', {
      title: 'User Profile - DPDP_Secure',
      description: 'Manage your SME administrator account information.',
      path: '/profile',
      breadcrumbs: ['Workspace', 'Profile']
    });
  },

  /**
   * Render About Platform
   */
  renderAbout: (req, res) => {
    res.render('about', {
      title: 'About DPDP_Secure | SME Privacy Platform',
      description: 'Zero-cloud egress data protection solution for small Indian businesses handling personal data in informal systems.',
      path: '/about',
      breadcrumbs: ['Workspace', 'About']
    });
  }
};

module.exports = dashboardController;
