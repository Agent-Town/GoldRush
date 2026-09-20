#!/usr/bin/env node
// s1393: is e676addf a faithful re-land of c876f675 over the six paths?
// Compare the PATCH each commit introduces, path by path.
import { execFileSync } from 'node:child_process';
const R = '/Users/robin/Claude/Projects/Gold Rush';
const git = (...a) => execFileSync('git', ['-C', R, ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const PATHS = [
  'assets/contracts/epoch-1-frontier/contracts.json',
  'e2e/agent-view.spec.ts',
  'e2e/fixtures/e1-mechanics-manifests.json',
  'e2e/tile-identity-pass.spec.ts',
  'src/meta/ContractFamilies.ts',
  'src/world/Terrain.ts',
];

// strip diff noise (index lines, hunk headers) so we compare CONTENT of the change
const norm = (d) => d.split('\n')
  .filter(l => (l.startsWith('+') || l.startsWith('-')) && !l.startsWith('+++') && !l.startsWith('---'))
  .join('\n');

for (const p of PATHS) {
  const orig = norm(git('show', 'c876f675', '--', p));
  const land = norm(git('show', 'e676addf', '--', p));
  const same = orig === land;
  console.log(`\n=== ${p} — ${same ? 'IDENTICAL CHANGE ✅' : 'DIFFERS ⚠️'}`);
  console.log(`    original +/- lines: ${orig ? orig.split('\n').length : 0}   re-land: ${land ? land.split('\n').length : 0}`);
  if (!same) {
    const o = new Set(orig.split('\n').filter(Boolean));
    const l = new Set(land.split('\n').filter(Boolean));
    const onlyOrig = [...o].filter(x => !l.has(x));
    const onlyLand = [...l].filter(x => !o.has(x));
    if (onlyOrig.length) console.log('    IN ORIGINAL ONLY (dropped by the re-land):\n' + onlyOrig.map(x => '      ' + x).join('\n'));
    if (onlyLand.length) console.log('    IN RE-LAND ONLY (new / rebased):\n' + onlyLand.map(x => '      ' + x).join('\n'));
  }
}
