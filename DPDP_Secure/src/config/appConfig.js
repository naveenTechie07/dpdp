const path = require('path');
require('dotenv').config();

const appConfig = {
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',
  appName: 'DPDP_Secure',
  sessionSecret: process.env.SESSION_SECRET || 'dpdp-secure-session-key-dev-2026-sme-compliance',
  aiProvider: process.env.AI_PROVIDER || 'mock',
  aiApiKey: process.env.AI_API_KEY || '',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
  },
  tenantDefaults: {
    id: 'TENANT-AAROGYA-01',
    businessName: 'Aarogya Diagnostic Center',
    businessType: 'Diagnostic Pathology & Lab Services',
    gstNumber: '29AAAAA0000A1Z5',
    address: 'Indiranagar, Bengaluru, Karnataka - 560038',
    dpoName: 'Ramesh Kumar',
    dpoEmail: 'privacy@aarogyaclinic.in',
    complianceScore: 84
  },
  paths: {
    root: path.join(__dirname, '../../'),
    data: path.join(__dirname, '../../data'),
    sampleData: path.join(__dirname, '../../data/sample_data'),
    certificates: path.join(__dirname, '../../data/certificates'),
    db: process.env.VERCEL
      ? path.join('/tmp', 'dpdp_secure.db')
      : path.join(__dirname, '../../data/dpdp_secure.db')
  }
};

module.exports = appConfig;
