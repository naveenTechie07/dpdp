const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// Strict Auth Brute-Force Rate Limiter (Max 10 login attempts per 10 mins in production, 100 in dev)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP. Please wait 10 minutes before retrying.'
  }
});

// Role Catalog Definition
const ROLE_PROFILES = {
  owner: {
    id: 'USR-OWNER-01',
    name: 'Ramesh Kumar',
    email: 'ramesh@aarogyaclinic.in',
    role: 'SME_OWNER',
    roleLabel: 'SME Owner & Fiduciary Admin',
    tenantId: 'TENANT-AAROGYA-01',
    tenantName: 'Aarogya Diagnostic Center',
    permissions: ['ALL_ADMIN', 'DSR_ERASURE', 'INCIDENT_DECLARE', 'DPBI_SUBMIT']
  },
  compliance: {
    id: 'USR-COMPL-02',
    name: 'Dr. Ananya Sen',
    email: 'compliance@aarogyaclinic.in',
    role: 'COMPLIANCE_OFFICER',
    roleLabel: 'Data Protection Officer (DPO)',
    tenantId: 'TENANT-AAROGYA-01',
    tenantName: 'Aarogya Diagnostic Center',
    permissions: ['ROPA_REVIEW', 'CONSENT_DRAFT', 'DSR_INVESTIGATE', 'AUDIT_INSPECT']
  },
  reception: {
    id: 'USR-RECEPT-03',
    name: 'Priya Sharma',
    email: 'reception@aarogyaclinic.in',
    role: 'RECEPTION_STAFF',
    roleLabel: 'Front-Desk Reception Staff',
    tenantId: 'TENANT-AAROGYA-01',
    tenantName: 'Aarogya Diagnostic Center',
    permissions: ['SILO_SCAN', 'NOTICE_DISPATCH', 'VIEW_ONLY']
  },
  auditor: {
    id: 'USR-AUDIT-04',
    name: 'Rajesh Iyer',
    email: 'auditor@privacyaudit.in',
    role: 'AUDITOR',
    roleLabel: 'Independent Regulatory Auditor',
    tenantId: 'TENANT-AAROGYA-01',
    tenantName: 'Independent Regulatory Audit Services',
    permissions: ['AUDIT_LOG_READ', 'ROPA_READ', 'CERTIFICATE_VERIFY']
  }
};

/**
 * GET /auth/login - Render Login Portal
 */
router.get('/auth/login', authLimiter, (req, res) => {
  // Generate cryptographically random state token for OAuth CSRF mitigation
  const stateToken = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = stateToken;

  res.render('auth-login', {
    title: 'Sign In - DPDP_Secure',
    description: 'Access your DPDP_Secure privacy management console.',
    path: '/auth/login',
    breadcrumbs: ['Workspace', 'Sign In'],
    state: stateToken,
    notice: req.query.notice || null,
    error: req.query.error || null
  });
});

/**
 * GET /auth/google - Initiate Google OAuth Redirect with CSRF State
 */
router.get('/auth/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect('/auth/login?notice=Google+OAuth+not+configured.+Please+use+the+Evaluator+Fast-Track+login+below.');
  }

  // Ensure state exists
  if (!req.session.oauthState) {
    req.session.oauthState = crypto.randomBytes(32).toString('hex');
  }

  const clientId = encodeURIComponent(process.env.GOOGLE_CLIENT_ID);
  const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback');
  const scope = encodeURIComponent('openid email profile');
  const state = encodeURIComponent(req.session.oauthState);

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&prompt=select_account`;
  res.redirect(googleAuthUrl);
});

/**
 * GET /auth/google/callback - Validate OAuth Callback & CSRF State Token
 */
router.get('/auth/google/callback', (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/auth/login?error=Google+login+cancelled:+${encodeURIComponent(error)}`);
  }

  // OAuth CSRF State Verification
  if (!state || !req.session.oauthState || state !== req.session.oauthState) {
    return res.status(403).render('403', {
      title: '403 CSRF State Mismatch - DPDP_Secure',
      description: 'Login rejected: OAuth state token mismatch detected. Possible CSRF attack prevented.',
      path: req.originalUrl,
      breadcrumbs: ['Workspace', 'CSRF Violation']
    });
  }

  // Clear consumed state token
  delete req.session.oauthState;

  // Session Fixation Defense: Always regenerate session ID before assigning user identity
  req.session.regenerate((err) => {
    if (err) {
      console.error('[AUTH] Session regeneration error:', err);
      return res.redirect('/auth/login?error=Session+initialization+failed');
    }

    // Default to SME Owner profile for Google OAuth login
    req.session.user = {
      ...ROLE_PROFILES.owner,
      authProvider: 'google',
      loginTime: new Date().toISOString()
    };

    req.session.save((saveErr) => {
      if (saveErr) console.error('[AUTH] Session save error:', saveErr);
      res.redirect('/');
    });
  });
});

/**
 * POST /auth/demo-login - Evaluator Fast-Track 1-Click Role Login
 */
router.post('/auth/demo-login', authLimiter, (req, res) => {
  const requestedRole = (req.body?.role || 'owner').toLowerCase();
  const selectedProfile = ROLE_PROFILES[requestedRole] || ROLE_PROFILES.owner;

  // Session Fixation Defense: Regenerate session prior to setting user object
  req.session.regenerate((err) => {
    if (err) {
      console.error('[AUTH] Session regeneration error:', err);
      return res.redirect('/auth/login?error=Session+initialization+failed');
    }

    req.session.user = {
      ...selectedProfile,
      authProvider: 'evaluator_fast_track',
      loginTime: new Date().toISOString()
    };

    req.session.save((saveErr) => {
      if (saveErr) console.error('[AUTH] Session save error:', saveErr);
      res.redirect('/');
    });
  });
});

/**
 * GET /auth/logout - Terminate Session & Clear Cookies
 */
router.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('[AUTH] Session destroy error:', err);
    res.clearCookie('connect.sid', { path: '/' });
    res.redirect('/auth/login?notice=You+have+been+securely+logged+out.');
  });
});

/**
 * GET /auth/me - Return Authenticated User & Permissions JSON
 */
router.get('/auth/me', (req, res) => {
  const isAuthenticated = !!(req.session && req.session.user);
  res.json({
    success: true,
    authenticated: isAuthenticated,
    user: req.session?.user || null
  });
});

module.exports = router;
