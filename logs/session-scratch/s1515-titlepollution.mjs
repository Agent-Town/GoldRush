// TITLE_DECL = /^\s*(?:test|it)(?:\.\w+)*\s*\(\s*(['"`])([\s\S]*?)\1/gm
// The `(?:\.\w+)*` is for test.skip / test.only / test.describe — but it also matches
// ARBITRARY helper methods (test.setBalance, test.step, test.use...), harvesting their
// first string argument as if it were a test title.
// Measure the pollution across the specs the guard actually reads.
import fs from 'node:fs';
import path from 'node:path';

const DECL = /^\s*(?:test|it)((?:\.\w+)*)\s*\(\s*(['"`])([\s\S]*?)\2/gm;
// Real Playwright/node-test declaration modifiers that DO introduce a test/suite title.
const REAL = new Set(['', '.skip', '.only', '.fixme', '.slow', '.describe', '.describe.skip',
  '.describe.only', '.describe.serial', '.describe.parallel', '.describe.configure', '.fail']);

const specs = fs.readdirSync('e2e').filter((f) => f.endsWith('.spec.ts'));
let realCount = 0;
const polluted = new Map();
for (const f of specs) {
  const text = fs.readFileSync(path.join('e2e', f), 'utf8');
  DECL.lastIndex = 0;
  let m;
  while ((m = DECL.exec(text))) {
    const suffix = m[1];
    if (REAL.has(suffix)) { realCount++; continue; }
    if (!polluted.has(suffix)) polluted.set(suffix, []);
    polluted.get(suffix).push(`${f} :: ${m[3].slice(0, 50)}`);
  }
}

console.log('specs scanned              :', specs.length);
console.log('genuine test/suite titles  :', realCount);
let total = 0;
for (const v of polluted.values()) total += v.length;
console.log('NON-TITLE strings harvested:', total, 'via', polluted.size, 'distinct helper suffixes\n');
for (const [suffix, hits] of [...polluted].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  test${suffix}(...)  -> ${hits.length}`);
  for (const h of hits.slice(0, 2)) console.log('       ', h);
}
