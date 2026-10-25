const fs = require('fs');
const path = require('path');
const app = require('../server');
const http = require('http');

async function testAllViewsRender() {
  console.log('================================================================');
  console.log('  Testing Direct Template Rendering for all 59 EJS Views');
  console.log('================================================================\n');

  const viewsDir = path.join(__dirname, '../views');
  const viewFiles = fs.readdirSync(viewsDir)
    .filter(f => f.endsWith('.ejs'))
    .map(f => f.replace('.ejs', ''));

  let passed = 0;
  let failed = 0;
  const errors = [];

  for (const viewName of viewFiles) {
    // Attempt rendering via express res.render in a dummy request
    await new Promise((resolve) => {
      // Mock req, res
      const req = {
        session: {
          user: {
            id: 'USR-DEV-001',
            name: 'Ramesh Kumar',
            email: 'ramesh@aarogyaclinic.in',
            role: 'SME_OWNER',
            tenantName: 'Aarogya Diagnostic Center'
          }
        },
        path: `/${viewName}`,
        originalUrl: `/${viewName}`
      };

      const res = {
        locals: {
          appName: 'DPDP_Secure',
          title: `${viewName} - DPDP_Secure`,
          description: 'Testing render',
          path: `/${viewName}`,
          breadcrumbs: ['Workspace', viewName],
          complianceScore: 84,
          tenant: { name: 'Aarogya Diagnostic Center' },
          currentUser: req.session.user
        }
      };

      app.render(viewName, res.locals, (err, html) => {
        if (err) {
          console.error(`  [-] FAILED: ${viewName}.ejs -> ${err.message}`);
          failed++;
          errors.push({ view: viewName, error: err.message, stack: err.stack });
        } else {
          console.log(`  [+] PASSED: ${viewName}.ejs (${html.length} bytes rendered)`);
          passed++;
        }
        resolve();
      });
    });
  }

  console.log('\n================================================================');
  console.log(`  Total Views Tested: ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log('================================================================\n');

  if (errors.length > 0) {
    console.error('Render Errors Details:');
    errors.forEach(e => console.error(e));
    process.exit(1);
  } else {
    console.log('[+] ALL 59 EJS VIEWS RENDER WITHOUT REFERENCE ERRORS!');
    process.exit(0);
  }
}

testAllViewsRender().catch(err => {
  console.error('Fatal error in view render test:', err);
  process.exit(1);
});
