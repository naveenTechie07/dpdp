const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const appConfig = require('./src/config/appConfig');
const errorHandler = require('./src/middlewares/errorHandler');

// Route modules
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const discoveryRoutes = require('./src/routes/discoveryRoutes');
const consentRoutes = require('./src/routes/consentRoutes');
const privacyRoutes = require('./src/routes/privacyRoutes');
const incidentRoutes = require('./src/routes/incidentRoutes');
const governanceRoutes = require('./src/routes/governanceRoutes');
const integrationRoutes = require('./src/routes/integrationRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const authRoutes = require('./src/routes/authRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

const app = express();
const PORT = appConfig.port;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// Cross-Origin Resource Sharing
app.use(cors());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie & Session Middlewares
app.use(cookieParser());
app.use(
  session({
    secret: appConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: appConfig.env === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Global API Rate Limiter (100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api/', apiLimiter);

// Global Context Middleware (prevents undefined template variable crashes)
app.use((req, res, next) => {
  res.locals.appName = appConfig.appName;
  res.locals.title = 'DPDP_Secure - Enterprise Privacy Management';
  res.locals.description = 'DPDP Act, 2023 Compliance Platform for Small Indian Businesses';
  res.locals.path = req.path;
  res.locals.breadcrumbs = ['Workspace'];
  res.locals.complianceScore = 84;
  res.locals.tenant = appConfig.tenantDefaults;
  res.locals.currentUser = req.session?.user || {
    id: 'USR-DEV-001',
    name: 'Ramesh Kumar',
    email: 'ramesh@aarogyaclinic.in',
    role: 'SME_OWNER',
    tenantName: 'Aarogya Diagnostic Center'
  };
  // Comprehensive fallbacks for optional template variables
  res.locals.activeTab = 'providers';
  res.locals.tab = 'designer';
  res.locals.scanId = '1';
  res.locals.silosCount = 3;
  res.locals.piiCount = 1420;
  res.locals.activeNoticesCount = 3;
  res.locals.pendingDsrCount = 1;
  res.locals.taxLockedCount = 1;
  res.locals.activeIncidentsCount = 0;
  res.locals.recentActivity = [];
  res.locals.silos = [];
  res.locals.findings = [];
  res.locals.stats = {};
  res.locals.ropaRecords = [];
  res.locals.events = [];
  next();
});

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Mount Modular Routers
app.use('/', dashboardRoutes);
app.use('/', discoveryRoutes);
app.use('/', consentRoutes);
app.use('/', privacyRoutes);
app.use('/', incidentRoutes);
app.use('/', governanceRoutes);
app.use('/', integrationRoutes);
app.use('/', settingsRoutes);
app.use('/', authRoutes);
app.use('/', aiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found | DPDP_Secure',
    description: 'The requested resource could not be located on this server.',
    path: req.originalUrl,
    breadcrumbs: ['Workspace', '404 Not Found']
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Server startup
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[DPDP_Secure] Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
