const { execSync } = require('child_process');
const fs = require('fs');

console.log('[Build] 1. Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {
  // If running locally with Windows locked dll, warn but continue
  console.warn('[Build] Warning: prisma generate encountered an issue, proceeding with existing client...');
}

console.log('[Build] 2. Type checking with TypeScript...');
execSync('npx tsc --noEmit', { stdio: 'inherit' });

console.log('[Build] 3. Bundling standalone application with esbuild...');
execSync(
  'npx esbuild src/index.ts --bundle --platform=node --target=node20 --external:@prisma/client --footer:js="module.exports = index_default; module.exports.default = index_default;" --outfile=app.js',
  { stdio: 'inherit' }
);

console.log('[Build] 4. Creating entrypoint proxies (dist/index.js & index.js)...');
fs.mkdirSync('dist', { recursive: true });
fs.copyFileSync('app.js', 'dist/index.js');
fs.copyFileSync('app.js', 'index.js');

console.log('[Build] Successfully completed backend build!');
