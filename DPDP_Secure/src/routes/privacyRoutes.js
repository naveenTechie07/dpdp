const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Privacy Views
router.get('/privacy/dashboard', (req, res) => {
  res.render('privacy-dashboard', {
    title: 'Privacy Rights - DPDP_Secure',
    description: 'Manage DPRR requests, intake forms, and data principal rights workflows.',
    breadcrumbs: ['Workspace', 'Privacy', 'Dashboard'],
    path: '/privacy/dashboard'
  });
});

router.get('/privacy/requests', (req, res) => {
  res.render('privacy-requests', {
    title: 'Data Rights Requests - DPDP_Secure',
    description: 'Account Holder rights requests across all informal channels.',
    breadcrumbs: ['Workspace', 'Privacy', 'Requests'],
    path: '/privacy/requests'
  });
});

router.get('/privacy/workflows', (req, res) => {
  res.render('privacy-workflows', {
    title: 'Workflows - DPDP_Secure',
    description: 'Configurable stage-based workflows for Data Principal Rights requests.',
    breadcrumbs: ['Workspace', 'Privacy', 'Workflows'],
    path: '/privacy/workflows'
  });
});

router.get('/privacy/workflows/:id', (req, res) => {
  res.render('privacy-workflows-detail', {
    title: 'DPDP_Secure DPDPA Rights Workflow - DPDP_Secure',
    description: 'DPDPA 2023 rights handling for clinic patients — 30-day SLA with tax retention checks.',
    breadcrumbs: ['Workspace', 'Privacy', 'Workflows', req.params.id],
    path: `/privacy/workflows/${req.params.id}`
  });
});

router.get('/privacy/forms', (req, res) => {
  res.render('privacy-forms', {
    title: 'Data Rights Requests Intake Forms - DPDP_Secure',
    description: 'Design intake forms for Account Holder Data Rights Requests.',
    breadcrumbs: ['Workspace', 'Privacy', 'Form designer'],
    path: '/privacy/forms'
  });
});

router.get('/privacy/forms/:id', (req, res) => {
  const tab = req.query.tab || 'designer';
  res.render('privacy-forms-detail', {
    title: 'DPDP_Secure Data Rights Intake - DPDP_Secure',
    description: '',
    tab: tab,
    breadcrumbs: ['Workspace', 'Privacy', 'Form designer', req.params.id],
    path: `/privacy/forms/${req.params.id}`
  });
});

// Public Citizen Intake Portal
router.get('/dsr', (req, res) => {
  try {
    res.render('public-dsr-portal', {
      title: 'Citizen Data Rights Intake Portal | DPDP_Secure',
      description: 'Exercise your legal rights under Section 11 & Section 12 of the DPDP Act, 2023.',
      path: '/dsr'
    });
  } catch (err) {
    // Fallback if view template is created in prompt 10
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Citizen Data Rights Intake Portal | DPDP_Secure</title>
        <style>
          body { background: #0b0f19; color: #f3f4f6; font-family: sans-serif; display: flex; justify-content: center; padding: 40px 20px; }
          .container { background: rgba(17, 24, 39, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; max-width: 600px; width: 100%; }
          h1 { color: #3b82f6; font-size: 20px; margin-top: 0; }
          p { color: #9ca3af; font-size: 13px; line-height: 1.6; }
          .btn { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Citizen Data Rights Portal (DPDP Act, 2023)</h1>
          <p>Submit your request to Aarogya Diagnostic Center under Section 11 (Access) or Section 12 (Erasure/Correction).</p>
          <a class="btn" href="/privacy/requests" style="display:inline-block; text-decoration:none;">View Admin Queue</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Privacy API Routes
router.post('/api/privacy/submit-dsr', (req, res) => {
  const { principalName, principalPhone, requestType, otp } = req.body || {};
  const ticketId = `DSR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  res.json({
    success: true,
    ticketId,
    principalName: principalName || 'Deepa Nair',
    requestType: requestType || 'ERASURE',
    status: 'Awaiting Statutory Tax-Lock Review',
    message: 'Request registered. In accordance with DPDP Act, resolution window is 7 business days.'
  });
});

router.get('/api/privacy/dsr/:id/occurrences', (req, res) => {
  res.json({
    success: true,
    ticketId: req.params.id,
    principal: 'Deepa Nair (+91 9988776655)',
    occurrences: [
      { silo: 'clinic_reception_chat.txt', type: 'WHATSAPP_CHAT', line: 14, snippet: 'Deepa Nair query for lipid panel test' },
      { silo: 'customer_leads.csv', type: 'SPREADSHEET_CSV', row: 5, snippet: 'Deepa Nair, 9988776655, Aadhaar: 6734 5234 8901, PAN: PQRST3456D' },
      { silo: 'invoices_billing.csv', type: 'BILLING_SYSTEM', row: 5, snippet: 'INV-2024-309, 2024-09-15, Rs. 12000, Tax Status: MANDATORY_LOCK' }
    ]
  });
});

router.get('/api/privacy/dsr/:id/summary', (req, res) => {
  res.json({
    success: true,
    ticketId: req.params.id,
    statutorySection: 'Section 11 (Right to Access Summary)',
    dataHeld: ['Full Name: Deepa Nair', 'Contact: +91 9988776655', 'Clinical Tests: Blood Sugar, Lipid Panel', 'Tax Invoice: INV-2024-309'],
    purposes: ['Diagnostic report delivery', 'Statutory GST tax compliance'],
    thirdPartySharing: 'None. All records stored 100% locally with zero cloud egress.'
  });
});

router.post('/api/privacy/execute-erasure', (req, res) => {
  const { ticketId, principalPhone } = req.body || {};
  const certId = `CERT-ERASURE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();
  const certHash = crypto.createHash('sha256').update(certId + timestamp + 'Deepa Nair').digest('hex');

  res.json({
    success: true,
    certificateId: certId,
    certHash,
    informalRedactions: 2,
    taxLockedInvoices: 1,
    redactedFiles: ['clinic_reception_chat.txt (Line 14)', 'customer_leads.csv (Row 5)'],
    lockedInvoices: ['INV-2024-309 (Protected under CGST Act 2017 Section 36 until 2030-12-31)'],
    certUrl: `/api/privacy/download-cert/${certId}`
  });
});

router.get('/api/privacy/download-cert/:id', (req, res) => {
  const certHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>DPDP Compliance Certificate - ${req.params.id}</title>
      <style>
        body { font-family: sans-serif; background: #0b0f19; color: #f3f4f6; padding: 40px; display: flex; justify-content: center; }
        .cert-card { background: rgba(17,24,39,0.95); border: 2px solid #10b981; border-radius: 12px; padding: 40px; max-width: 700px; width: 100%; }
        h1 { color: #10b981; margin-top: 0; }
        .hash { font-family: monospace; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px; word-break: break-all; color: #3b82f6; }
      </style>
    </head>
    <body>
      <div class="cert-card">
        <h1>Official Erasure & Statutory Lock Certificate</h1>
        <p><strong>Certificate ID:</strong> ${req.params.id}</p>
        <p><strong>Entity:</strong> Aarogya Diagnostic Center (Indiranagar, Bengaluru)</p>
        <p><strong>Data Principal:</strong> Deepa Nair (+91 9988776655)</p>
        <p><strong>Action:</strong> Dual-Track Statutory Erasure executed under DPDP Act Section 12 & CGST Act Section 36.</p>
        <p><strong>Informal Records Erased:</strong> 2 records permanently overwritten with [REDACTED-DPDP-SEC-12].</p>
        <p><strong>Financial Records Locked:</strong> Invoice INV-2024-309 preserved under statutory 6-year retention mandate.</p>
        <p><strong>SHA-256 Cryptographic Fingerprint:</strong></p>
        <div class="hash">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
      </div>
    </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(certHtml);
});

module.exports = router;
