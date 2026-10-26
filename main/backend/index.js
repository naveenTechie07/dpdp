// Entry point for Vercel Serverless Function & standard CommonJS loaders
const app = require('./dist/index.js').default || require('./dist/index.js');
module.exports = app;
