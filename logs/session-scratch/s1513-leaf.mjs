import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/goals.json';
const g = JSON.parse(readFileSync(P, 'utf8'));

const ID = 'f1508-2-red-inventory-lookup-verdicts';
const HASH = '2c49518192e338753482ec8188cd89bf1390cca9';

function walk(node, fn) {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, fn));
  if (node && typeof node === 'object') {
    fn(node);
    for (const v of Object.values(node)) walk(v, fn);
  }
}

let found = 0;
walk(g, (n) => {
  if (n.id === ID) {
    found += 1;
    console.log('BEFORE status:', n.status, '| mergeHash:', n.mergeHash);
    n.status = 'merged';
    n.mergeHash = HASH;
    n.closureReason =
      'MERGED s1513 at 2c495181. Both false-verdict surfaces cured and verified against a control arm: '
      + 'a bare name now exits 2 with a refusal (control on main: NOT-IN-INVENTORY rc=1), and every verdict '
      + 'line + --json carries a snapshot date derived from stats.startTime (no 2026-07-28 literal; the guard '
      + 'asserts a 2031-12-25 fixture date, so hardcoding would red). --snapshot resolves the run window to '
      + 'main commit b66905c64, sanity-checked as the last commit before stats.startTime. Gates: tsc rc=0, '
      + 'test:node-guards 346 tests / 343 pass / 0 fail / 3 skipped with the new arm confirmed in the raw '
      + 'output, test:ledger-guards 77/77. No build/Playwright owed (no src/ surface). '
      + 'Review: reviews/f1508-2-red-inventory-lookup-verdicts.md. See F-1513-1 (non-blocking report tally).';
    console.log('AFTER  status:', n.status, '| mergeHash:', n.mergeHash);
  }
});

if (found !== 1) throw new Error(`expected exactly 1 leaf, found ${found}`);
writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('hash is 40-hex:', /^[0-9a-f]{40}$/.test(HASH));
