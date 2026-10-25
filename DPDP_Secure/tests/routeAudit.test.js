const http = require('http');
const path = require('path');
const fs = require('fs');

// Ensure database is initialized before testing routes
const app = require('../server');

async function runRouteAudit() {
  console.log('================================================================');
  console.log('  DPDP_Secure - Comprehensive Route & Template Audit Suite');
  console.log('================================================================\n');

  // Start temporary server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[TEST SERVER] Running on ${baseUrl}\n`);

  // 1. Collect all registered Express routes
  const registeredRoutes = [];
  const routerStack = (app.router && app.router.stack) || (app._router && app._router.stack) || [];

  function extractRoutes(layer, basePath = '') {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      registeredRoutes.push({
        path: basePath + layer.route.path,
        methods
      });
    } else if (layer.handle && layer.handle.stack) {
      layer.handle.stack.forEach(subLayer => extractRoutes(subLayer, basePath));
    }
  }

  routerStack.forEach(layer => extractRoutes(layer));

  console.log(`Found ${registeredRoutes.length} registered Express endpoints.\n`);

  let passed = 0;
  let failed = 0;
  const failures = [];

  // 2. Test all GET routes
  const getRoutes = registeredRoutes.filter(r => r.methods.includes('GET'));

  for (const r of getRoutes) {
    let testPath = r.path;
    // Replace param placeholders like :id
    testPath = testPath.replace(':id', '1');

    try {
      const res = await fetch(`${baseUrl}${testPath}`);
      const text = await res.text();

      // Check status
      if (res.status === 200 || res.status === 302) {
        console.log(`  [+] PASS [${res.status}]: GET ${testPath}`);
        passed++;
      } else {
        console.error(`  [-] FAIL [${res.status}]: GET ${testPath}`);
        failed++;
        failures.push({
          path: testPath,
          status: res.status,
          snippet: text.slice(0, 300)
        });
      }
    } catch (err) {
      console.error(`  [-] ERROR: GET ${testPath} -> ${err.message}`);
      failed++;
      failures.push({
        path: testPath,
        error: err.message
      });
    }
  }

  // 3. Test API POST routes
  const postRoutes = registeredRoutes.filter(r => r.methods.includes('POST'));
  for (const r of postRoutes) {
    let testPath = r.path;
    testPath = testPath.replace(':id', '1');

    try {
      const res = await fetch(`${baseUrl}${testPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test', noticeText: 'Sample notice' })
      });
      const text = await res.text();

      if (res.status >= 200 && res.status < 400) {
        console.log(`  [+] PASS [${res.status}]: POST ${testPath}`);
        passed++;
      } else {
        console.error(`  [-] FAIL [${res.status}]: POST ${testPath}`);
        failed++;
        failures.push({
          path: testPath,
          status: res.status,
          snippet: text.slice(0, 300)
        });
      }
    } catch (err) {
      console.error(`  [-] ERROR: POST ${testPath} -> ${err.message}`);
      failed++;
      failures.push({
        path: testPath,
        error: err.message
      });
    }
  }

  // 4. Scan all views for <a href="..."> and fetch calls to check for broken links
  console.log('\n--- Auditing Links & Routes Referenced in EJS Views and JS Files ---');
  const viewsDir = path.join(__dirname, '../views');
  const publicJsDir = path.join(__dirname, '../public/js');

  const filesToScan = [];
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) scanDir(full);
      else if (e.name.endsWith('.ejs') || e.name.endsWith('.js')) {
        filesToScan.push(full);
      }
    }
  }
  scanDir(viewsDir);
  scanDir(publicJsDir);

  const internalLinks = new Set();
  const linkRegex = /href=["'](\/[^"#'?]+)/g;
  const fetchRegex = /fetch\(["'](\/[^"#'?]+)/g;

  for (const f of filesToScan) {
    const content = fs.readFileSync(f, 'utf8');
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const url = match[1];
      if (!url.startsWith('/css') && !url.startsWith('/js') && !url.startsWith('/images') && !url.startsWith('/favicon')) {
        internalLinks.add(url);
      }
    }
    while ((match = fetchRegex.exec(content)) !== null) {
      const url = match[1];
      if (!url.startsWith('/css') && !url.startsWith('/js')) {
        internalLinks.add(url);
      }
    }
  }

  console.log(`Extracted ${internalLinks.size} distinct internal application links from templates & scripts.\n`);

  for (const link of internalLinks) {
    let testPath = link;
    // Replace template tags like <%= scan.id %> or :id
    testPath = testPath.replace(/<%.*?%>/g, '1');
    if (testPath.includes('%')) continue; // Skip complex unparseable EJS tags

    try {
      const res = await fetch(`${baseUrl}${testPath}`);
      const text = await res.text();

      // Check if it returned 404
      if (res.status === 404 || text.includes('404 - Page Not Found')) {
        console.error(`  [-] BROKEN VIEW LINK [404]: ${link} (tested as ${testPath})`);
        failed++;
        failures.push({
          type: 'BROKEN_LINK_IN_VIEW',
          link,
          testPath,
          status: 404
        });
      } else if (res.status >= 500) {
        console.error(`  [-] VIEW CRASH [${res.status}]: ${link} (tested as ${testPath})`);
        failed++;
        failures.push({
          type: 'VIEW_SERVER_ERROR',
          link,
          testPath,
          status: res.status,
          snippet: text.slice(0, 300)
        });
      } else {
        console.log(`  [+] VALID LINK [${res.status}]: ${link}`);
        passed++;
      }
    } catch (err) {
      console.error(`  [-] ERROR on link: ${link} -> ${err.message}`);
      failed++;
      failures.push({
        type: 'LINK_FETCH_ERROR',
        link,
        error: err.message
      });
    }
  }

  server.close();

  console.log('\n================================================================');
  console.log(`  Total Checks: ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log('================================================================\n');

  if (failures.length > 0) {
    console.log('Failures Summary:');
    console.log(JSON.stringify(failures, null, 2));
    process.exit(1);
  } else {
    console.log('[+] ALL ROUTES AND VIEW LINKS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  }
}

runRouteAudit().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
