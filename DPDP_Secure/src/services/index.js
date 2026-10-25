/**
 * DPDP_Secure - Services Module Index
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 */

const verhoeffAlgorithm = require('./verhoeffAlgorithm');
const indianPiiEngine = require('./indianPiiEngine');

module.exports = {
  ...verhoeffAlgorithm,
  ...indianPiiEngine,
  verhoeffAlgorithm,
  indianPiiEngine
};
