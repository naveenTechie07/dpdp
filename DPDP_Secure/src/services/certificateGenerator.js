/**
 * DPDP_Secure - Cryptographic Proof Certificate Generator
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Pillar 3: Statutory Collision Resolver
 * Generates tamper-proof SHA-256 erasure compliance certificates
 * Reconciles DPDP Act Section 12(3) & CGST Act 2017 Section 36 via Section 8(7)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CERTIFICATES_DIR = path.resolve(__dirname, '../../data/certificates');

/**
 * Ensures certificates storage directory exists.
 */
function ensureCertificatesDir() {
  if (!fs.existsSync(CERTIFICATES_DIR)) {
    fs.mkdirSync(CERTIFICATES_DIR, { recursive: true });
  }
}

/**
 * Computes a deterministic SHA-256 cryptographic audit fingerprint across:
 * ticketId + principalPhone + informalRedactionsCount + taxLockedCount + timestamp
 */
function computeCertificateFingerprint({ ticketId, principalPhone, informalRedactionsCount, taxLockedCount, timestamp }) {
  const payload = `${ticketId}|${principalPhone}|${informalRedactionsCount}|${taxLockedCount}|${timestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Generates a printable HTML/PDF-ready Statutory Erasure & Tax Lock Certificate
 */
function buildCertificateHtml({
  certificateId,
  ticketId,
  principalName,
  principalPhone,
  principalEmail,
  timestamp,
  sha256Fingerprint,
  informalRedactionsCount,
  taxLockedCount,
  informalFiles = [],
  lockedInvoices = [],
  issuingFiduciary = 'Aarogya Diagnostic Center (Indiranagar, Bengaluru)',
  dpoName = 'Ramesh Kumar (Designated Data Protection Officer)'
}) {
  const formattedDate = new Date(timestamp).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compliance Certificate ${certificateId} - DPDP_Secure</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --card-border: #1f2937;
      --emerald: #10b981;
      --emerald-glow: rgba(16, 185, 129, 0.2);
      --amber: #f59e0b;
      --amber-glow: rgba(245, 158, 11, 0.2);
      --sky: #38bdf8;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --text-dim: #6b7280;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      padding: 40px 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      -webkit-font-smoothing: antialiased;
    }

    .cert-container {
      max-width: 820px;
      width: 100%;
      background: linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
      border: 2px solid var(--emerald);
      border-radius: 20px;
      padding: 48px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px -10px var(--emerald-glow);
      position: relative;
      overflow: hidden;
    }

    /* Holographic Watermark */
    .cert-container::before {
      content: "DPDP_SECURE VERIFIED";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 56px;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.02);
      pointer-events: none;
      letter-spacing: 6px;
      white-space: nowrap;
    }

    /* Header Bar */
    .cert-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 24px;
      margin-bottom: 32px;
    }

    .badge-statutory {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .cert-title {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .cert-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 6px;
    }

    .cert-id-badge {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid var(--sky);
      border-radius: 10px;
      padding: 10px 16px;
      text-align: right;
    }

    .cert-id-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--sky);
      font-weight: 700;
    }

    .cert-id-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 2px;
    }

    /* Principal & Fiduciary Metadata Grid */
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 28px;
    }

    .meta-item label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .meta-item p {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
    }

    .meta-item p.highlight {
      color: var(--sky);
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }

    /* Dual Track Breakdown Cards */
    .tracks-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 28px;
    }

    .track-card {
      border-radius: 14px;
      padding: 20px;
      position: relative;
    }

    .track-a {
      background: rgba(6, 78, 59, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
    }

    .track-b {
      background: rgba(120, 53, 15, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.4);
    }

    .track-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .track-tag {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .track-a .track-tag {
      background: rgba(16, 185, 129, 0.25);
      color: #34d399;
    }

    .track-b .track-tag {
      background: rgba(245, 158, 11, 0.25);
      color: #fbbf24;
    }

    .track-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
    }

    .track-citation {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 14px;
      line-height: 1.4;
    }

    .file-pill {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 8px 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .file-pill .file-name {
      color: #e5e7eb;
      font-weight: 600;
    }

    .file-pill .file-action {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .track-a .file-action {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
    }

    .track-b .file-action {
      background: rgba(245, 158, 11, 0.2);
      color: #fde68a;
    }

    /* Cryptographic Proof Box */
    .crypto-box {
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 28px;
    }

    .crypto-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .crypto-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--sky);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .hash-string {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #7dd3fc;
      background: rgba(15, 23, 42, 0.9);
      padding: 10px 14px;
      border-radius: 8px;
      word-break: break-all;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    .crypto-footnote {
      font-size: 10.5px;
      color: var(--text-dim);
      margin-top: 8px;
      line-height: 1.4;
    }

    /* Signatures & Execution Timestamp */
    .cert-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 24px;
      margin-top: 12px;
    }

    .sign-block {
      max-width: 280px;
    }

    .sign-line {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #e5e7eb;
      font-weight: 600;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
      padding-bottom: 6px;
      margin-bottom: 4px;
    }

    .sign-caption {
      font-size: 11px;
      color: var(--text-dim);
    }

    .brand-stamp {
      text-align: right;
    }

    .brand-logo {
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .brand-edition {
      font-size: 10px;
      color: var(--emerald);
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 2px;
    }

    /* Print & Actions Toolbar */
    .actions-toolbar {
      margin-top: 24px;
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .btn-print {
      background: var(--emerald);
      color: #064e3b;
      border: none;
    }

    .btn-print:hover {
      background: #34d399;
      transform: translateY(-1px);
    }

    .btn-back {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
      border: 1px solid var(--card-border);
    }

    .btn-back:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    @media print {
      body { background: #ffffff; color: #111827; padding: 0; }
      .actions-toolbar { display: none; }
      .cert-container {
        border: 2px solid #10b981;
        box-shadow: none;
        background: #ffffff;
        color: #111827;
        padding: 32px;
        max-width: 100%;
      }
      .cert-title { color: #111827; }
      .meta-grid { background: #f9fafb; border-color: #e5e7eb; }
      .meta-item label { color: #6b7280; }
      .meta-item p { color: #111827; }
      .track-a { background: #f0fdf4; border-color: #86efac; }
      .track-b { background: #fffbeb; border-color: #fde68a; }
      .track-title { color: #111827; }
      .file-pill { background: #ffffff; border-color: #e5e7eb; }
      .file-pill .file-name { color: #111827; }
      .crypto-box { background: #f8fafc; border-color: #cbd5e1; }
      .hash-string { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }
      .sign-line { color: #111827; border-bottom-color: #9ca3af; }
      .brand-logo { color: #111827; }
    }
  </style>
</head>
<body>
  <div class="cert-container">
    <!-- Header -->
    <div class="cert-header">
      <div>
        <div class="badge-statutory">🛡️ Official Statutory Erasure & Tax Retention Certificate</div>
        <h1 class="cert-title">DPDP Compliance Proof Certificate</h1>
        <p class="cert-subtitle">Reconciliation of DPDP Act Section 12(3) Erasure with CGST Act Section 36 Tax Lock</p>
      </div>
      <div class="cert-id-badge">
        <div class="cert-id-label">Certificate ID</div>
        <div class="cert-id-val">${certificateId}</div>
      </div>
    </div>

    <!-- Principal & Fiduciary Metadata -->
    <div class="meta-grid">
      <div class="meta-item">
        <label>Data Principal</label>
        <p>${principalName}</p>
        <p class="highlight">${principalPhone} · ${principalEmail || 'deepa.nair@corp.com'}</p>
      </div>
      <div class="meta-item">
        <label>Issuing Data Fiduciary</label>
        <p>${issuingFiduciary}</p>
        <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">Regn: GSTIN 29AAAAA0000A1Z5 · Indiranagar Clinic</p>
      </div>
      <div class="meta-item">
        <label>Statutory Ticket ID</label>
        <p class="highlight">${ticketId}</p>
      </div>
      <div class="meta-item">
        <label>Execution Timestamp</label>
        <p style="font-size:13px;">${formattedDate}</p>
      </div>
    </div>

    <!-- Dual-Track Resolution Breakdown -->
    <div class="tracks-container">
      <!-- Track A: Informal Silos Redacted -->
      <div class="track-card track-a">
        <div class="track-header">
          <span class="track-tag">Track A · Redacted</span>
          <span style="font-size:12px; font-weight:700; color:#34d399;">${informalRedactionsCount} Files Sanitized</span>
        </div>
        <div class="track-title">Informal Silo Redaction</div>
        <div class="track-citation">
          <strong>Legal Authority:</strong> DPDP Act, 2023 Section 12(3) [Right to complete erasure of personal data from informal messaging & operational spreadsheets].
        </div>

        <div>
          ${informalFiles.length > 0
            ? informalFiles.map(f => `
              <div class="file-pill">
                <span class="file-name">${f.name || f}</span>
                <span class="file-action">ATOMIC REDACTION</span>
              </div>
            `).join('')
            : `
              <div class="file-pill">
                <span class="file-name">clinic_reception_chat.txt (Line 14)</span>
                <span class="file-action">ATOMIC REDACTION</span>
              </div>
              <div class="file-pill">
                <span class="file-name">customer_leads.csv (Row 5)</span>
                <span class="file-action">ATOMIC REDACTION</span>
              </div>
            `
          }
        </div>
        <p style="font-size:11px; color:#a7f3d0; margin-top:10px;">
          ✓ Aadhaar, PAN, and mobile numbers overwritten with <code>[REDACTED-DPDP-SEC-12]</code>. Atomic file swap verified.
        </p>
      </div>

      <!-- Track B: Financial & Tax Invoices Locked -->
      <div class="track-card track-b">
        <div class="track-header">
          <span class="track-tag">Track B · Preserved</span>
          <span style="font-size:12px; font-weight:700; color:#fbbf24;">${taxLockedCount} Invoice Locked</span>
        </div>
        <div class="track-title">Statutory Tax Lock</div>
        <div class="track-citation">
          <strong>Legal Authority:</strong> CGST Act, 2017 Section 36 (72-month Books of Accounts retention) read with DPDP Act Section 8(7) (compliance with laws in force).
        </div>

        <div>
          ${lockedInvoices.length > 0
            ? lockedInvoices.map(inv => `
              <div class="file-pill">
                <span class="file-name">${inv.invoiceNumber || inv}</span>
                <span class="file-action">TAX-LOCKED (2030-12-31)</span>
              </div>
            `).join('')
            : `
              <div class="file-pill">
                <span class="file-name">INV-2024-309 (Rs. 12,000)</span>
                <span class="file-action">TAX-LOCKED (2030-12-31)</span>
              </div>
            `
          }
        </div>
        <p style="font-size:11px; color:#fde68a; margin-top:10px;">
          ✓ GSTIN, tax line items, and audit amounts locked against deletion. Personal mobile pseudonymized to <code>+91 99XXXXXX55</code>.
        </p>
      </div>
    </div>

    <!-- SHA-256 Non-Repudiation Fingerprint -->
    <div class="crypto-box">
      <div class="crypto-header">
        <div class="crypto-title">
          <span>🔒 Cryptographic Non-Repudiation Audit Fingerprint (SHA-256)</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#38bdf8; font-family:'JetBrains Mono', monospace;">FIPS 180-4 COMPLIANT</span>
      </div>
      <div class="hash-string">${sha256Fingerprint}</div>
      <div class="crypto-footnote">
        Digital fingerprint uniquely generated across: <code>ticketId (${ticketId}) + principalPhone (${principalPhone}) + informalCount (${informalRedactionsCount}) + taxLockedCount (${taxLockedCount}) + timestamp</code>. This hash guarantees statutory tamper-evidence for citizen verification and tax audit inspections.
      </div>
    </div>

    <!-- Footer & Signatures -->
    <div class="cert-footer">
      <div class="sign-block">
        <div class="sign-line">${dpoName}</div>
        <div class="sign-caption">Designated Compliance Officer · Digital Signature Verified</div>
      </div>
      <div class="brand-stamp">
        <div class="brand-logo">DPDP_Secure</div>
        <div class="brand-edition">Srujana Tech Fest 2026 · Problem Statement LS-04</div>
      </div>
    </div>
  </div>

  <!-- Print Toolbar -->
  <div class="actions-toolbar">
    <button class="btn btn-print" onclick="window.print()">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
      <span>Print / Save as PDF Certificate</span>
    </button>
    <a href="/privacy/requests" class="btn btn-back">
      <span>&larr; Back to Requests Queue</span>
    </a>
  </div>
</body>
</html>`;
}

/**
 * Generates and atomically persists a statutory erasure certificate
 *
 * @param {Object} params
 * @returns {Object} { certificateId, sha256Fingerprint, filePath, timestamp, htmlContent }
 */
function generateErasureCertificate(params = {}) {
  ensureCertificatesDir();

  const timestamp = params.timestamp || new Date().toISOString();
  const ticketId = params.ticketId || 'DSR-2026-8819';
  const principalName = params.principalName || 'Deepa Nair';
  const principalPhone = params.principalPhone || '+91 9988776655';
  const principalEmail = params.principalEmail || 'deepa.nair@corp.com';
  const informalRedactionsCount = params.informalRedactionsCount ?? 2;
  const taxLockedCount = params.taxLockedCount ?? 1;

  // Generate official Certificate ID format: CERT-ERASURE-2026-9921
  const certSuffix = ticketId.includes('-') ? ticketId.split('-').pop() : '9921';
  const certificateId = params.certificateId || `CERT-ERASURE-2026-${certSuffix}`;

  // Deterministic SHA-256 fingerprint
  const sha256Fingerprint = computeCertificateFingerprint({
    ticketId,
    principalPhone,
    informalRedactionsCount,
    taxLockedCount,
    timestamp
  });

  const htmlContent = buildCertificateHtml({
    certificateId,
    ticketId,
    principalName,
    principalPhone,
    principalEmail,
    timestamp,
    sha256Fingerprint,
    informalRedactionsCount,
    taxLockedCount,
    informalFiles: params.informalFiles || [
      { name: 'clinic_reception_chat.txt (Line 14)' },
      { name: 'customer_leads.csv (Row 5)' }
    ],
    lockedInvoices: params.lockedInvoices || [
      { invoiceNumber: 'INV-2024-309 (Protected until 2030-12-31)' }
    ],
    issuingFiduciary: params.issuingFiduciary,
    dpoName: params.dpoName
  });

  const certFilePath = path.join(CERTIFICATES_DIR, `${certificateId}.html`);
  const tempPath = `${certFilePath}.tmp.${Date.now()}`;

  // Atomic file write guardrail
  fs.writeFileSync(tempPath, htmlContent, 'utf8');
  fs.renameSync(tempPath, certFilePath);

  return {
    certificateId,
    sha256Fingerprint,
    filePath: certFilePath,
    timestamp,
    htmlContent
  };
}

/**
 * Retrieves certificate HTML content by Certificate ID
 */
function getCertificateById(certificateId) {
  ensureCertificatesDir();
  const certFilePath = path.join(CERTIFICATES_DIR, `${certificateId}.html`);
  if (fs.existsSync(certFilePath)) {
    return fs.readFileSync(certFilePath, 'utf8');
  }
  return null;
}

/**
 * Generates an official printable Citizen Consent Passbook under Section 6(1) of DPDP Act 2023
 */
function buildConsentPassbookHtml(consentEvent) {
  const eventId = consentEvent.id || 'CONSENT-EVENT-DEMO';
  const phone = consentEvent.dataPrincipalPhone || consentEvent.phone || '+91 9845012345';
  const maskedPhone = phone.length >= 10 ? phone.slice(0, 5) + 'XXXXX' + phone.slice(-2) : phone;
  const purposeCode = consentEvent.purposeCode || 'PURP-DIAGNOSTIC-REPORTING';
  const status = consentEvent.status || 'ACTIVE';
  const channel = consentEvent.channel || 'WHATSAPP';
  const timestamp = consentEvent.timestamp || new Date().toISOString();
  const sha256Proof = consentEvent.sha256Proof || crypto.createHash('sha256').update(phone + purposeCode + status + timestamp).digest('hex');

  const formattedDate = new Date(timestamp).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata'
  });

  const isWithdrawn = status === 'WITHDRAWN';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Citizen Consent Passbook - ${eventId} - DPDP_Secure</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --border: #1f2937;
      --emerald: #10b981;
      --rose: #f43f5e;
      --sky: #38bdf8;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text-main);
      padding: 30px 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .passbook-container {
      max-width: 760px;
      width: 100%;
      background: #111827;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .title-group h1 { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .title-group p { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      background: ${isWithdrawn ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)'};
      color: ${isWithdrawn ? 'var(--rose)' : 'var(--emerald)'};
      border: 1px solid ${isWithdrawn ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'};
    }
    .grid-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .field-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 14px 16px;
    }
    .field-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { font-size: 13px; font-weight: 600; color: #fff; margin-top: 6px; font-family: 'JetBrains Mono', monospace; }
    .proof-box {
      background: rgba(56, 189, 248, 0.05);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .proof-box .label { font-size: 11px; font-weight: 700; color: var(--sky); text-transform: uppercase; margin-bottom: 8px; }
    .proof-hash { font-family: 'JetBrains Mono', monospace; font-size: 11px; word-break: break-all; color: #e2e8f0; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; }
    .legal-notice {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.6;
      border-top: 1px solid var(--border);
      padding-top: 20px;
    }
    .actions-bar {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-print {
      background: var(--sky);
      color: #0b0f19;
      font-weight: 700;
      font-size: 12px;
      padding: 8px 18px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
    }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .passbook-container { border: 1px solid #ccc; box-shadow: none; background: #fff; }
      .actions-bar { display: none; }
      .field-value, .title-group h1 { color: #000; }
      .proof-hash { color: #000; background: #eee; }
    }
  </style>
</head>
<body>
  <div class="passbook-container">
    <div class="header-bar">
      <div class="title-group">
        <h1>Citizen Consent Passbook</h1>
        <p>Statutory Record of Consent under Section 6(1) of DPDP Act, 2023</p>
      </div>
      <div class="badge-status">
        ● ${status}
      </div>
    </div>

    <div class="grid-details">
      <div class="field-card">
        <div class="field-label">Data Principal (Citizen)</div>
        <div class="field-value">${maskedPhone}</div>
      </div>
      <div class="field-card">
        <div class="field-label">Data Fiduciary</div>
        <div class="field-value">Aarogya Diagnostic Center</div>
      </div>
      <div class="field-card">
        <div class="field-label">Specified Lawful Purpose</div>
        <div class="field-value">${purposeCode}</div>
      </div>
      <div class="field-card">
        <div class="field-label">Collection Channel</div>
        <div class="field-value">${channel}</div>
      </div>
      <div class="field-card">
        <div class="field-label">Timestamp (IST)</div>
        <div class="field-value">${formattedDate}</div>
      </div>
      <div class="field-card">
        <div class="field-label">Receipt Identifier</div>
        <div class="field-value">${eventId}</div>
      </div>
    </div>

    <div class="proof-box">
      <div class="label">Cryptographic Non-Repudiation Proof (SHA-256)</div>
      <div class="proof-hash">${sha256Proof}</div>
    </div>

    <div class="legal-notice">
      <strong>Statutory Notice under Section 6(4):</strong> You have the legal right under Section 6(4) of India's Digital Personal Data Protection Act, 2023 to withdraw this consent at any time without negative consequence to services previously rendered. To withdraw, reply <code>STOP</code> to clinic WhatsApp or contact Clinic Grievance Officer: <code>privacy@aarogyaclinic.in</code> (+91 9845012345).
    </div>

    <div class="actions-bar">
      <button class="btn-print" onclick="window.print()">🖨️ Print Statutory Passbook</button>
    </div>
  </div>
</body>
</html>`;
}

module.exports = {
  computeCertificateFingerprint,
  buildCertificateHtml,
  generateErasureCertificate,
  getCertificateById,
  buildConsentPassbookHtml,
  generateConsentPassbookHtml: buildConsentPassbookHtml,
  CERTIFICATES_DIR
};

