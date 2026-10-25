const appConfig = require('../config/appConfig');

/**
 * Authentication and Session Guard Middleware
 */
function isAuthenticated(req, res, next) {
  // If user is logged in via session
  if (req.session && req.session.user) {
    return next();
  }

  // In development / demo evaluation mode: auto-populate demo SME_OWNER session
  if (appConfig.env === 'development' || !process.env.NODE_ENV) {
    req.session.user = {
      id: 'USR-DEV-001',
      name: 'Ramesh Kumar',
      email: 'ramesh@aarogyaclinic.in',
      role: 'SME_OWNER',
      tenantId: 'TENANT-AAROGYA-01',
      tenantName: 'Aarogya Diagnostic Center'
    };
    return next();
  }

  // Redirect to login in production
  return res.redirect('/auth/login');
}

/**
 * Role-Based Access Control Middleware
 * @param {string[]} allowedRoles
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.session?.user?.role || 'SME_OWNER';

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    if (req.originalUrl.startsWith('/api/') || req.xhr) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Requires one of [${allowedRoles.join(', ')}] role. Current role is ${userRole}.`
      });
    }

    return res.status(403).render('404', {
      title: '403 Forbidden | DPDP_Secure',
      description: 'You do not have permission to access this resource under current role policies.',
      path: req.originalUrl,
      breadcrumbs: ['Workspace', 'Access Denied']
    });
  };
}

module.exports = {
  isAuthenticated,
  requireRole
};
