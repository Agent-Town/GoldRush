import fs from 'node:fs';
for (const f of ['playwright.release.config.ts', 'playwright.release-base.config.ts', 'playwright.accounts.config.ts']) {
  console.log('=== ' + f + ' ===');
  fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
    if (/testMatch|testDir/.test(l)) console.log('  ' + (i + 1) + ': ' + l.trim());
  });
}
console.log('=== npm scripts mentioning these configs ===');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
for (const [k, v] of Object.entries(p.scripts)) {
  if (/playwright\.(release|release-base|accounts)\.config/.test(v)) console.log('  ' + k + ' => ' + v);
}
