// Entry point for Vercel Express preset
const app = require('./dist/index.js');
module.exports = app.default || app;
