/**
 * DPDP_Secure - Services Module Index
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 */

const verhoeffAlgorithm = require('./verhoeffAlgorithm');
const indianPiiEngine = require('./indianPiiEngine');
const fileParsers = require('./fileParsers');
const ropaService = require('./ropaService');
const aiService = require('./aiService');

module.exports = {
  ...verhoeffAlgorithm,
  ...indianPiiEngine,
  ...fileParsers,
  ...ropaService,
  ...aiService,
  verhoeffAlgorithm,
  indianPiiEngine,
  fileParsers,
  ropaService,
  aiService
};

