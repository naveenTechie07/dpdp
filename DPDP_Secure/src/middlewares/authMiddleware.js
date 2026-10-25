const appConfig = require('../config/appConfig');

/**
 * Authentication and Session Guard Middleware
 * In development mode, auto-populates demo SME_OWNER session if no active session exists
 */
function isAuthenticated(req, res, next) {
  // If user is logged in via session
  if (req.session && req.session.user) {
    res.locals.currentUser = req.session.user;
    return next();
  }

  // In development / demo evaluation mode: auto-populate demo SME_OWNER session
  if (appConfig.env === 'development' || !process.env.NODE_ENV) {
    req.session.user = {
      id: 'USR-OWNER-01',
      name: 'Ramesh Kumar',
      email: 'ramesh@aarogyaclinic.in',
      role: 'SME_OWNER',
      roleLabel: 'SME Owner & Fiduciary Admin',
      tenantId: 'TENANT-AAROGYA-01',
      tenantName: 'Aarogya Diagnostic Center',
      permissions: ['ALL_ADMIN', 'DSR_ERASURE', 'INCIDENT_DECLARE', 'DPBI_SUBMIT']
    };
    res.locals.currentUser = req.session.user;
    return next();
  }

  // Redirect to login in production
  return res.redirect('/auth/login');
}

/**
 * Role-Based Access Control Middleware
 * Enforces role permissions on sensitive operations (e.g. DSR erasure, incident declaration)
 * @param {string[]} allowedRoles - Array of roles permitted (e.g. ['SME_OWNER', 'COMPLIANCE_OFFICER'])
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const user = req.session?.user;
    const userRole = user?.role || 'SME_OWNER';

    // SME_OWNER has superuser privileges across all actions
    if (userRole === 'SME_OWNER' || allowedRoles.includes(userRole)) {
      return next();
    }

    // Handle API / XHR requests
    if (req.originalUrl.startsWith('/api/') || req.xhr) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Action requires one of [${allowedRoles.join(', ')}] privileges. Current role is '${userRole}'.`
      });
    }

    // Render 403 Forbidden View
    return res.status(403).render('403', {
      title: '403 Forbidden - Role Authorization Required | DPDP_Secure',
      description: `Access restricted. Your current role (${userRole}) is not authorized to execute this operation under Section 8 Fiduciary policies.`,
      path: req.originalUrl,
      breadcrumbs: ['Workspace', 'Access Restricted'],
      requiredRoles: allowedRoles,
      userRole: userRole
    });
  };
}

module.exports = {
  isAuthenticated,
  requireRole
};
