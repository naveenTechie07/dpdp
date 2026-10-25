const appConfig = require('../config/appConfig');

/**
 * Centralized sanitized error handling middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const isDev = appConfig.env === 'development';

  // Log error details on server side
  console.error(`[ERROR] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err.message);
  if (isDev && err.stack) {
    console.error(err.stack);
  }

  // Handle API vs HTML requests
  if (req.originalUrl.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(statusCode).json({
      success: false,
      error: isDev ? err.message : 'An internal server error occurred. Please contact the administrator.',
      code: err.code || 'INTERNAL_ERROR',
      statusCode
    });
  }

  // Render 500 template or safe fallback
  res.status(statusCode);
  try {
    return res.render('500', {
      title: '500 - Server Error | DPDP_Secure',
      description: 'An internal error occurred while processing your request.',
      path: req.originalUrl,
      breadcrumbs: ['Workspace', 'Error'],
      error: isDev ? err.message : null,
      stack: isDev ? err.stack : null
    });
  } catch (renderError) {
    // If 500 view template does not exist, send sanitized HTML
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error - DPDP_Secure</title>
        <style>
          body { background: #0b0f19; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 40px; max-width: 500px; text-align: center; }
          h1 { color: #ef4444; margin-top: 0; }
          p { color: #9ca3af; font-size: 14px; line-height: 1.6; }
          a { display: inline-block; margin-top: 20px; background: #3b82f6; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>System Notice</h1>
          <p>${isDev ? err.message : 'An internal error occurred. Please return to the dashboard.'}</p>
          <a href="/">Return to Dashboard</a>
        </div>
      </body>
      </html>
    `);
  }
}

module.exports = errorHandler;
