const assert = require('assert');

async function runTests() {
  console.log('=== STARTING END-TO-END VERIFICATION: TAG & ASSET CRUD ===\n');
  const baseUrl = 'http://localhost:3000';

  // Helper fetch with JSON
  async function fetchJson(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, headers: res.headers, data };
  }

  // Helper fetch text/html
  async function fetchHtml(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      redirect: 'manual',
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        ...(options.headers || {})
      }
    });
    const text = await res.text();
    return { status: res.status, headers: res.headers, text };
  }

  let tagId = null;
  let assetId = null;

  // 1. Tag UI Screen Tests
  console.log('[TEST 1] GET /inventory/tags');
  const tagsPage = await fetchHtml('/inventory/tags');
  assert.strictEqual(tagsPage.status, 200, 'Expected 200 on /inventory/tags');
  assert.ok(tagsPage.text.includes('Classification Tags'), 'Should display Classification Tags title');
  assert.ok(tagsPage.text.includes('+ New Tag'), 'Should display + New Tag button');
  assert.ok(tagsPage.text.includes('id="newTagModal"'), 'Should contain #newTagModal');
  assert.ok(tagsPage.text.includes('id="deleteTagModal"'), 'Should contain #deleteTagModal');
  console.log('✓ PASS: /inventory/tags rendered with modals and + New Tag button\n');

  console.log('[TEST 2] GET /inventory/tags/create');
  const tagCreatePage = await fetchHtml('/inventory/tags/create');
  assert.strictEqual(tagCreatePage.status, 200, 'Expected 200 on /inventory/tags/create');
  assert.ok(tagCreatePage.text.includes('Create Classification Tag'), 'Should display Create Classification Tag');
  assert.ok(tagCreatePage.text.includes('action="/api/tags/create"'), 'Should post to /api/tags/create');
  console.log('✓ PASS: /inventory/tags/create rendered dedicated tag form page\n');

  // 2. Create Tag via JSON API
  console.log('[TEST 3] POST /api/tags/create (JSON)');
  const newTagPayload = {
    tagName: 'E2E Automated Voiceprint Tag ' + Date.now(),
    category: 'BIOMETRIC',
    subCategory: 'Voice Biometrics',
    sensitivityWeight: 92,
    colorTag: '#ef4444',
    description: 'Acoustic voice pattern recordings for clinic telehealth'
  };
  const createTagRes = await fetchJson('/api/tags/create', {
    method: 'POST',
    body: JSON.stringify(newTagPayload)
  });
  assert.strictEqual(createTagRes.status, 201, 'Expected 201 on tag creation');
  assert.ok(createTagRes.data && createTagRes.data.success, 'Tag creation should return success: true');
  assert.ok(createTagRes.data.id, 'Tag creation should return generated ID');
  tagId = createTagRes.data.id;
  console.log(`✓ PASS: Created Tag ID: ${tagId}\n`);

  // 3. Verify Tag appears in list and UI
  console.log('[TEST 4] Verify Tag in /api/tags and /inventory/tags');
  const tagsList = await fetchJson('/api/tags');
  const foundTag = tagsList.data.data.find(t => t.id === tagId);
  assert.ok(foundTag, 'Newly created tag must exist in /api/tags');
  assert.strictEqual(foundTag.tagName, newTagPayload.tagName);

  const tagsPageWithNew = await fetchHtml('/inventory/tags');
  assert.ok(tagsPageWithNew.text.includes(newTagPayload.tagName), 'Tag name must be rendered in HTML');
  console.log('✓ PASS: Tag listed in both API and HTML\n');

  // 4. Delete Tag via POST /api/tags/:id/delete & DELETE /api/tags/:id
  console.log('[TEST 5] DELETE /api/tags/:id');
  const deleteTagRes = await fetchJson(`/api/tags/${tagId}`, { method: 'DELETE' });
  assert.strictEqual(deleteTagRes.status, 200, 'Expected 200 on tag deletion');
  assert.ok(deleteTagRes.data.success, 'Tag deletion should return success: true');

  const tagsListAfterDelete = await fetchJson('/api/tags');
  const deletedTagCheck = tagsListAfterDelete.data.data.find(t => t.id === tagId);
  assert.strictEqual(deletedTagCheck, undefined, 'Deleted tag must not exist in /api/tags');
  console.log('✓ PASS: Tag successfully deleted via DELETE endpoint\n');

  // 5. Test Tag Form-Encoded HTML fallback
  console.log('[TEST 6] POST /inventory/tags/create (Form urlencoded fallback)');
  const formTagPayload = new URLSearchParams({
    tagName: 'E2E Form Tag ' + Date.now(),
    category: 'HEALTH',
    subCategory: 'Test',
    sensitivityWeight: '80',
    colorTag: '#3b82f6',
    description: 'Form submission fallback'
  });
  const formTagRes = await fetch(`${baseUrl}/inventory/tags/create`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html'
    },
    body: formTagPayload.toString()
  });
  assert.ok([302, 303].includes(formTagRes.status), 'Expected redirect 302/303 on HTML form submission');
  const tagRedirectLocation = formTagRes.headers.get('location');
  assert.ok(tagRedirectLocation.includes('/inventory/tags'), 'Should redirect to /inventory/tags');
  console.log('✓ PASS: Form fallback tag creation properly redirects to /inventory/tags\n');

  // 6. Assets Screen Tests
  console.log('[TEST 7] GET /inventory/assets');
  const assetsPage = await fetchHtml('/inventory/assets');
  assert.strictEqual(assetsPage.status, 200, 'Expected 200 on /inventory/assets');
  assert.ok(assetsPage.text.includes('Data Assets'), 'Should display Data Assets title');
  assert.ok(assetsPage.text.includes('+ New Asset'), 'Should display + New Asset button');
  assert.ok(assetsPage.text.includes('id="newAssetModal"'), 'Should contain #newAssetModal');
  assert.ok(assetsPage.text.includes('id="deleteAssetModal"'), 'Should contain #deleteAssetModal');
  assert.ok(assetsPage.text.includes('id="viewRegister" style="display: block;"'), 'Data Assets catalog table must be visible by default');
  console.log('✓ PASS: /inventory/assets rendered with modals and + New Asset button\n');

  console.log('[TEST 8] GET /inventory/assets/create');
  const assetCreatePage = await fetchHtml('/inventory/assets/create');
  assert.strictEqual(assetCreatePage.status, 200, 'Expected 200 on /inventory/assets/create');
  assert.ok(assetCreatePage.text.includes('Create New Data Asset'), 'Should display Create New Data Asset');
  assert.ok(assetCreatePage.text.includes('action="/api/assets/create"'), 'Should post to /api/assets/create');
  console.log('✓ PASS: /inventory/assets/create rendered dedicated asset form page\n');

  // 7. Create Asset via JSON API
  console.log('[TEST 9] POST /api/assets/create (JSON)');
  const newAssetPayload = {
    assetName: 'E2E Automated WhatsApp Diagnostic Device ' + Date.now(),
    assetType: 'MOBILE_DEVICE',
    sourceSystem: 'Reception Counter 1',
    sensitivity: 'HIGH_RISK',
    elements: 'WhatsApp Chat Transcripts, Phone Numbers, Doctor Notes',
    status: 'active',
    description: 'Frontdesk staff smartphone running WhatsApp for patient reports'
  };
  const createAssetRes = await fetchJson('/api/assets/create', {
    method: 'POST',
    body: JSON.stringify(newAssetPayload)
  });
  assert.strictEqual(createAssetRes.status, 201, 'Expected 201 on asset creation');
  assert.ok(createAssetRes.data && createAssetRes.data.success, 'Asset creation should return success: true');
  assert.ok(createAssetRes.data.id, 'Asset creation should return generated ID');
  assetId = createAssetRes.data.id;
  console.log(`✓ PASS: Created Asset ID: ${assetId}\n`);

  // 8. Verify Asset appears in list and UI
  console.log('[TEST 10] Verify Asset in /api/assets and /inventory/assets');
  const assetsList = await fetchJson('/api/assets');
  const foundAsset = assetsList.data.data.find(a => a.id === assetId);
  assert.ok(foundAsset, 'Newly created asset must exist in /api/assets');
  assert.strictEqual(foundAsset.assetName, newAssetPayload.assetName);

  const assetsPageWithNew = await fetchHtml('/inventory/assets');
  assert.ok(assetsPageWithNew.text.includes(newAssetPayload.assetName), 'Asset name must be rendered in HTML');
  console.log('✓ PASS: Asset listed in both API and HTML\n');

  // 9. Delete Asset via POST /api/assets/:id/delete & DELETE /api/assets/:id
  console.log('[TEST 11] POST /api/assets/:id/delete (Fallback delete route)');
  const deleteAssetRes = await fetchJson(`/api/assets/${assetId}/delete`, { method: 'POST' });
  assert.strictEqual(deleteAssetRes.status, 200, 'Expected 200 on asset deletion');
  assert.ok(deleteAssetRes.data.success, 'Asset deletion should return success: true');

  const assetsListAfterDelete = await fetchJson('/api/assets');
  const deletedAssetCheck = assetsListAfterDelete.data.data.find(a => a.id === assetId);
  assert.strictEqual(deletedAssetCheck, undefined, 'Deleted asset must not exist in /api/assets');
  console.log('✓ PASS: Asset successfully deleted via POST /api/assets/:id/delete\n');

  // 10. Test Asset Form-Encoded HTML fallback
  console.log('[TEST 12] POST /inventory/assets/create (Form urlencoded fallback)');
  const formAssetPayload = new URLSearchParams({
    assetName: 'E2E Form Asset ' + Date.now(),
    assetType: 'database',
    sourceSystem: 'Local',
    sensitivity: 'CONFIDENTIAL',
    elements: '100',
    status: 'active',
    description: 'Form submission fallback'
  });
  const formAssetRes = await fetch(`${baseUrl}/inventory/assets/create`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html'
    },
    body: formAssetPayload.toString()
  });
  assert.ok([302, 303].includes(formAssetRes.status), 'Expected redirect 302/303 on HTML form submission');
  const assetRedirectLocation = formAssetRes.headers.get('location');
  assert.ok(assetRedirectLocation.includes('/inventory/assets'), 'Should redirect to /inventory/assets');
  console.log('✓ PASS: Form fallback asset creation properly redirects to /inventory/assets\n');

  console.log('================================================================');
  console.log('ALL 12/12 END-TO-END TESTS PASSED SUCCESSFULLY! EVERYTHING WORKS!');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILURE:', err);
  process.exit(1);
});
