const fs = require('fs');
const path = require('path');
const app = require('../server');

const registeredRoutes = [];
const routerStack = (app.router && app.router.stack) || (app._router && app._router.stack) || [];
function extractRoutes(layer, basePath = '') {
  if (layer.route) {
    registeredRoutes.push(basePath + layer.route.path);
  } else if (layer.handle && layer.handle.stack) {
    layer.handle.stack.forEach(subLayer => extractRoutes(subLayer, basePath));
  }
}
routerStack.forEach(layer => extractRoutes(layer));

const viewsDir = path.join(__dirname, '../views');
const publicDir = path.join(__dirname, '../public/js');
const filesToScan = [];

function findFiles(d) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (f.isDirectory()) findFiles(path.join(d, f.name));
    else if (f.name.endsWith('.ejs') || f.name.endsWith('.js')) {
      filesToScan.push(path.join(d, f.name));
    }
  }
}
findFiles(viewsDir);
findFiles(publicDir);

const brokenLinks = [];
for (const file of filesToScan) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find hrefs
  const hrefMatches = content.matchAll(/href=["'](\/[a-zA-Z0-9_\-\/:]+)/g);
  for (const m of hrefMatches) {
    const url = m[1];
    if (url.startsWith('/css') || url.startsWith('/js') || url.startsWith('/images') || url.startsWith('/favicon')) continue;
    
    const matchesRoute = registeredRoutes.some(r => {
      if (r === url) return true;
      if (url.endsWith('/') && r.startsWith(url)) return true;
      const regex = new RegExp('^' + r.replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$');
      return regex.test(url);
    });
    if (!matchesRoute) {
      brokenLinks.push({ file: path.relative(path.join(__dirname, '..'), file), type: 'href', url });
    }
  }

  // Find form actions
  const actionMatches = content.matchAll(/action=["'](\/[a-zA-Z0-9_\-\/:]+)/g);
  for (const m of actionMatches) {
    const url = m[1];
    const matchesRoute = registeredRoutes.some(r => {
      if (r === url) return true;
      const regex = new RegExp('^' + r.replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$');
      return regex.test(url);
    });
    if (!matchesRoute) {
      brokenLinks.push({ file: path.relative(path.join(__dirname, '..'), file), type: 'form.action', url });
    }
  }

  // Find fetch calls
  const fetchMatches = content.matchAll(/fetch\(["'](\/[a-zA-Z0-9_\-\/:]+)/g);
  for (const m of fetchMatches) {
    const url = m[1];
    if (url.startsWith('/css') || url.startsWith('/js') || url.startsWith('/images') || url.startsWith('/favicon')) continue;
    
    const matchesRoute = registeredRoutes.some(r => {
      if (r === url) return true;
      const regex = new RegExp('^' + r.replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$');
      return regex.test(url);
    });
    if (!matchesRoute) {
      brokenLinks.push({ file: path.relative(path.join(__dirname, '..'), file), type: 'fetch', url });
    }
  }

  // Find window.location.href assignments
  const locMatches = content.matchAll(/location(?:\.href)?\s*=\s*["'](\/[a-zA-Z0-9_\-\/:]+)/g);
  for (const m of locMatches) {
    const url = m[1];
    const matchesRoute = registeredRoutes.some(r => {
      if (r === url) return true;
      const regex = new RegExp('^' + r.replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$');
      return regex.test(url);
    });
    if (!matchesRoute) {
      brokenLinks.push({ file: path.relative(path.join(__dirname, '..'), file), type: 'location.href', url });
    }
  }
}

console.log('Total registered routes:', registeredRoutes.length);
console.log('Unique broken links/fetches:', brokenLinks);
process.exit(brokenLinks.length > 0 ? 1 : 0);
