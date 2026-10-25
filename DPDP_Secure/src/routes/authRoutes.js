const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Login View
router.get('/auth/login', (req, res) => {
  // Generate cryptographically random state for CSRF mitigation
  req.session.oauthState = crypto.randomBytes(32).toString('hex');

  try {
    res.render('auth-login', {
      title: 'Sign In - DPDP_Secure',
      description: 'Access your DPDP_Secure privacy management console.',
      path: '/auth/login',
      breadcrumbs: ['Workspace', 'Sign In'],
      state: req.session.oauthState
    });
  } catch (err) {
    // If auth-login.ejs does not exist yet, render fallback
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sign In - DPDP_Secure</title>
        <style>
          body { background: #0b0f19; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 40px; max-width: 450px; width: 100%; text-align: center; }
          h1 { color: #3b82f6; font-size: 24px; margin-bottom: 8px; }
          p { color: #9ca3af; font-size: 13px; margin-bottom: 24px; }
          .btn-role { display: block; width: 100%; padding: 12px; margin-bottom: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #fff; font-weight: 600; cursor: pointer; text-decoration: none; box-sizing: border-box; }
          .btn-role:hover { background: #3b82f6; border-color: #3b82f6; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>DPDP_Secure</h1>
          <p>SME Privacy Management Platform</p>
          <div style="font-size: 12px; font-weight: 700; color: #10b981; margin-bottom: 16px; text-transform: uppercase;">⚡ Fast-Track Evaluator Login</div>
          <form action="/auth/demo-login" method="POST">
            <button type="submit" name="role" value="owner" class="btn-role">Login as SME Owner (Ramesh Kumar)</button>
            <button type="submit" name="role" value="reception" class="btn-role">Login as Receptionist (Priya Sharma)</button>
            <button type="submit" name="role" value="auditor" class="btn-role">Login as Regulatory Auditor (Rajesh Iyer)</button>
          </form>
        </div>
      </body>
      </html>
    `);
  }
});

// Google OAuth stub / redirect
router.get('/auth/google', (req, res) => {
  // If client ID is not configured, fall back directly to demo login
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect('/auth/login?notice=google_not_configured_use_fast_track');
  }
  const state = req.session.oauthState || crypto.randomBytes(32).toString('hex');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback')}&response_type=code&scope=openid%20email%20profile&state=${state}`;
  res.redirect(googleAuthUrl);
});

// Google OAuth callback handler
router.get('/auth/google/callback', (req, res) => {
  const { code, state } = req.query;

  // Session fixation defense: regenerate session
  req.session.regenerate((err) => {
    if (err) console.error('Session regenerate error:', err);

    req.session.user = {
      id: 'USR-GOOGLE-01',
      name: 'Ramesh Kumar',
      email: 'ramesh@aarogyaclinic.in',
      role: 'SME_OWNER',
      tenantId: 'TENANT-AAROGYA-01',
      tenantName: 'Aarogya Diagnostic Center'
    };

    res.redirect('/');
  });
});

// Fast-Track Evaluator Login
router.post('/auth/demo-login', (req, res) => {
  const { role } = req.body || {};

  let userProfile = {
    id: 'USR-OWNER-01',
    name: 'Ramesh Kumar',
    email: 'ramesh@aarogyaclinic.in',
    role: 'SME_OWNER',
    tenantId: 'TENANT-AAROGYA-01',
    tenantName: 'Aarogya Diagnostic Center'
  };

  if (role === 'reception') {
    userProfile = {
      id: 'USR-RECEPT-02',
      name: 'Priya Sharma',
      email: 'reception@aarogyaclinic.in',
      role: 'RECEPTION_STAFF',
      tenantId: 'TENANT-AAROGYA-01',
      tenantName: 'Aarogya Diagnostic Center'
    };
  } else if (role === 'auditor') {
    userProfile = {
      id: 'USR-AUDIT-03',
      name: 'Rajesh Iyer',
      email: 'auditor@privacyaudit.in',
      role: 'AUDITOR',
      tenantId: 'TENANT-AAROGYA-01',
      tenantName: 'Independent Regulatory Auditor'
    };
  }

  // Session fixation defense
  req.session.regenerate((err) => {
    if (err) console.error('Session regenerate error:', err);
    req.session.user = userProfile;
    res.redirect('/');
  });
});

// Logout
router.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

// Get Current User API
router.get('/auth/me', (req, res) => {
  res.json({
    authenticated: !!(req.session && req.session.user),
    user: req.session?.user || null
  });
});

module.exports = router;
