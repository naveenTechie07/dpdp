const assert = require('assert');

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Testing RoPA Lineage & Retention Integration ---');

  // Test 1: GET /inventory/ropa
  console.log('1. Testing GET /inventory/ropa ...');
  const pageRes = await fetch(`${baseUrl}/inventory/ropa`);
  assert.strictEqual(pageRes.status, 200, 'Expected HTTP 200 for /inventory/ropa');
  const pageHtml = await pageRes.text();
  assert(pageHtml.includes('Lineage & Flow Architecture'), 'Page must contain "Lineage & Flow Architecture"');
  assert(pageHtml.includes('Data Source'), 'Page must contain legend "Data Source"');
  assert(pageHtml.includes('Discovered PII Element'), 'Page must contain legend "Discovered PII Element"');
  assert(pageHtml.includes('Processing Activity'), 'Page must contain legend "Processing Activity"');
  assert(pageHtml.includes('Storage Flow'), 'Page must contain legend "Storage Flow"');
  assert(pageHtml.includes('3rd Party Recipient'), 'Page must contain legend "3rd Party Recipient"');
  assert(pageHtml.includes('lineageSvgLines'), 'Page must contain SVG lineage lines layer');
  console.log('   ✓ Page rendered with full Lineage & Flow Architecture view!');

  // Test 2: GET /api/ropa/graph
  console.log('2. Testing GET /api/ropa/graph ...');
  const graphRes = await fetch(`${baseUrl}/api/ropa/graph`);
  assert.strictEqual(graphRes.status, 200, 'Expected HTTP 200 for /api/ropa/graph');
  const graphData = await graphRes.json();
  assert.strictEqual(graphData.success, true, 'Expected success: true');
  assert(Array.isArray(graphData.nodes) && graphData.nodes.length > 0, 'Nodes must be a non-empty array');
  assert(Array.isArray(graphData.edges) && graphData.edges.length > 0, 'Edges must be a non-empty array');
  assert(graphData.stats.totalSources > 0, 'Must have at least 1 data source node');
  assert(graphData.stats.totalElements > 0, 'Must have at least 1 PII element node');
  assert(graphData.stats.totalActivities > 0, 'Must have at least 1 processing activity node');
  assert(graphData.stats.totalFlows > 0, 'Must have at least 1 storage flow node');
  console.log(`   ✓ Graph data verified: ${graphData.nodes.length} nodes, ${graphData.edges.length} edges across 4 columns!`);

  // Test 3: GET /api/ropa/retention-recommendation (Health Diagnostics rule)
  console.log('3. Testing GET /api/ropa/retention-recommendation (Health diagnostics) ...');
  const recRes = await fetch(`${baseUrl}/api/ropa/retention-recommendation?businessFunction=Diagnostic%20Lab%20Testing&purpose=Patient%20Blood%20Reports`);
  assert.strictEqual(recRes.status, 200, 'Expected HTTP 200 for retention recommendation');
  const recData = await recRes.json();
  assert.strictEqual(recData.success, true);
  assert.strictEqual(recData.data.matchedRule, 'HEALTH_DIAGNOSTICS');
  assert.strictEqual(recData.data.retentionPeriodMonths, 36);
  assert(recData.data.statutoryReference.includes('National Medical Commission'), 'Citation must mention NMC');
  console.log('   ✓ Health diagnostics rule verified: 36 Months retention (NMC Regulations)');

  // Test 4: Financial / Tax rule
  console.log('4. Testing GET /api/ropa/retention-recommendation (Financial/Tax rule) ...');
  const taxRes = await fetch(`${baseUrl}/api/ropa/retention-recommendation?businessFunction=Billing%20Accounts&purpose=Invoicing%20and%20GST`);
  const taxData = await taxRes.json();
  assert.strictEqual(taxData.data.matchedRule, 'FINANCIAL_TAX');
  assert.strictEqual(taxData.data.retentionPeriodMonths, 84);
  console.log('   ✓ Financial & Tax rule verified: 84 Months (7 Years) retention');

  // Test 5: KYC / AML rule
  console.log('5. Testing GET /api/ropa/retention-recommendation (KYC / AML rule) ...');
  const kycRes = await fetch(`${baseUrl}/api/ropa/retention-recommendation?piiCategories=Aadhaar,Passport,Voter_ID&businessFunction=Customer%20Onboarding`);
  const kycData = await kycRes.json();
  assert.strictEqual(kycData.data.matchedRule, 'KYC_AML');
  assert.strictEqual(kycData.data.retentionPeriodMonths, 60);
  console.log('   ✓ KYC / AML rule verified: 60 Months (5 Years) retention (PMLA Sec 12)');

  // Test 6: Marketing / Promotions rule
  console.log('6. Testing GET /api/ropa/retention-recommendation (Marketing rule) ...');
  const mktRes = await fetch(`${baseUrl}/api/ropa/retention-recommendation?businessFunction=Marketing%20Campaigns&purpose=Newsletter%20Outreach`);
  const mktData = await mktRes.json();
  assert.strictEqual(mktData.data.matchedRule, 'MARKETING_PROMOTIONS');
  assert.strictEqual(mktData.data.retentionPeriodMonths, 12);
  console.log('   ✓ Marketing rule verified: 12 Months retention (Sec 8(7) Purpose Limitation)');

  // Test 7: GET /api/ropa/export-csv
  console.log('7. Testing GET /api/ropa/export-csv ...');
  const csvRes = await fetch(`${baseUrl}/api/ropa/export-csv`);
  assert.strictEqual(csvRes.status, 200);
  const csvText = await csvRes.text();
  assert(csvText.includes('Activity Name'), 'CSV must include headers');
  console.log('   ✓ RoPA CSV export verified!');

  console.log('\n========================================');
  console.log('ALL ROPA & LINEAGE TESTS PASSED (7/7)!');
  console.log('========================================');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
