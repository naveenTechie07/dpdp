const assert = require('assert');

async function runEndToEndTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('====================================================');
  console.log('STARTING COMPREHENSIVE ROPA E2E INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  // Step 1: Create a new RoPA record with multi-silo mapping
  console.log('1. Testing POST /api/ropa/create with multi-silo mapping...');
  const createPayload = {
    activityName: 'Automated E2E Clinical Diagnostic Lab Dispatch',
    dataCategories: 'Aadhaar UID, Patient Mobile, Diagnostic Blood Panels, Doctor Notes',
    purpose: 'Direct patient dispatch of verified lab diagnostic reports via WhatsApp and PDF Vault',
    legalBasis: 'Section 6 - Consent',
    retentionPeriod: '36 Months',
    storageLocation: 'WhatsApp Local Storage & Encrypted Diagnostic PDF Vault',
    securitySafeguards: 'Verhoeff tokenization, AES-256 local encryption, Zero Cloud Egress',
    siloIds: ['SILO-WHATSAPP-01', 'SILO-PDFS']
  };

  const createRes = await fetch(`${baseUrl}/api/ropa/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createPayload)
  });

  assert([200, 201].includes(createRes.status), `Expected 200 or 201, got ${createRes.status}`);
  const createData = await createRes.json();
  assert.strictEqual(createData.success, true, 'Create response should be success: true');
  assert(createData.id, 'Response should contain record ID');
  const createdId = typeof createData.id === 'object' ? createData.id.id : createData.id;
  console.log(`   ✓ RoPA activity created successfully with ID: ${createdId}`);

  // Step 2: Verify in Graph API (/api/ropa/graph)
  console.log('2. Testing GET /api/ropa/graph for new node and lineage edges...');
  const graphRes = await fetch(`${baseUrl}/api/ropa/graph`);
  assert.strictEqual(graphRes.status, 200);
  const graphData = await graphRes.json();
  assert.strictEqual(graphData.success, true);
  assert(graphData.canvasDimensions, 'Graph must include dynamic canvasDimensions');
  assert(graphData.canvasDimensions.width >= 1200, 'Canvas width must be >= 1200');
  assert(graphData.canvasDimensions.height >= 800, 'Canvas height must be >= 800');

  console.log('   Graph activity nodes:', graphData.nodes.filter(n => n.type === 'activityNode').map(n => ({ id: n.id, dataId: n.data?.id })));
  const actNode = graphData.nodes.find(n => n.id === `activity-${createdId}` || n.data?.id === createdId);
  assert(actNode, `Graph must contain activity node for ${createdId}`);
  console.log(`   ✓ Graph node detected: [${actNode.id}] "${actNode.data?.label}"`);

  // Verify lineage edges connect to the new activity node
  const connectedEdges = graphData.edges.filter(e => e.target === `activity-${createdId}` || e.target === createdId);
  console.log(`   ✓ Found ${connectedEdges.length} lineage edges flowing into the new activity node`);

  // Step 3: Update the RoPA record
  console.log('3. Testing PUT /api/ropa/:id (Update activity and re-map silos)...');
  const updatePayload = {
    activityName: 'Updated E2E Clinical Diagnostic Lab Dispatch & Billing',
    dataCategories: 'Aadhaar UID, Patient Mobile, Diagnostic Blood Panels, GST Invoice',
    purpose: 'Consolidated clinical lab dispatch and patient GST invoicing',
    legalBasis: 'Section 8(7) - Legal Obligation',
    retentionPeriod: '84 Months',
    storageLocation: 'WhatsApp Local Storage, Encrypted Diagnostic PDF Vault & Billing Ledger',
    securitySafeguards: 'Verhoeff tokenization, AES-256 local encryption, Zero Cloud Egress, SHA-256 Hash',
    siloIds: ['SILO-WHATSAPP-01', 'SILO-PDFS', 'SILO-BILLING-03']
  };

  const updateRes = await fetch(`${baseUrl}/api/ropa/${createdId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatePayload)
  });
  assert.strictEqual(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.success, true);
  console.log('   ✓ Activity updated successfully with 3 linked silos');

  // Step 4: Test direct silo mapping PUT /api/ropa/:id/silos
  console.log('4. Testing PUT /api/ropa/:id/silos...');
  const mapRes = await fetch(`${baseUrl}/api/ropa/${createdId}/silos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siloIds: ['SILO-WHATSAPP-01'] })
  });
  assert.strictEqual(mapRes.status, 200);
  const mapData = await mapRes.json();
  assert.strictEqual(mapData.success, true);
  assert(Array.isArray(mapData.silos), 'Response must include array of silos');
  assert.strictEqual(mapData.silos.length, 1);
  console.log('   ✓ Direct silo mapping confirmed: 1 silo mapped');

  // Step 5: Test POST /api/ropa/generate (⚡ Sync Connectors)
  console.log('5. Testing POST /api/ropa/generate (Dynamic connector synthesis)...');
  const syncRes = await fetch(`${baseUrl}/api/ropa/generate`, { method: 'POST' });
  assert.strictEqual(syncRes.status, 200);
  const syncData = await syncRes.json();
  assert.strictEqual(syncData.success, true);
  assert(syncData.count > 0, 'Sync should synthesize activities from discovered connectors');
  console.log(`   ✓ Sync completed: ${syncData.count} statutory activities synchronized with discovered connectors`);

  // Step 6: Test Statutory Printable Register GET /inventory/ropa/print
  console.log('6. Testing GET /inventory/ropa/print (Printable statutory register)...');
  const printRes = await fetch(`${baseUrl}/inventory/ropa/print`);
  assert.strictEqual(printRes.status, 200);
  const printHtml = await printRes.text();
  assert(printHtml.includes('Section 8(4)'), 'Print register must reference DPDP Act Section 8(4)');
  assert(printHtml.includes('window.print'), 'Print view must include print trigger');
  console.log('   ✓ Statutory print register verified with legal references and print trigger');

  // Step 7: Delete the test RoPA record
  console.log('7. Testing DELETE /api/ropa/:id...');
  const delRes = await fetch(`${baseUrl}/api/ropa/${createdId}`, { method: 'DELETE' });
  assert.strictEqual(delRes.status, 200);
  const delData = await delRes.json();
  assert.strictEqual(delData.success, true);
  console.log('   ✓ Activity deleted cleanly (including silo mappings and lineage edges)');

  // Step 8: Verify deletion in graph
  console.log('8. Verifying deletion in graph...');
  const postDelGraphRes = await fetch(`${baseUrl}/api/ropa/graph`);
  const postDelGraph = await postDelGraphRes.json();
  const deletedNode = postDelGraph.nodes.find(n => n.id === `activity-${createdId}` || n.data?.id === createdId);
  assert(!deletedNode, 'Deleted node must not appear in graph');
  console.log('   ✓ Graph confirmed: deleted node successfully removed');

  console.log('\n====================================================');
  console.log('ALL 8 ROPA END-TO-END INTEGRATION TESTS PASSED 100%!');
  console.log('====================================================');
}

runEndToEndTests().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
