import fs from 'node:fs';
const P = 'tasks/goals.json';
const raw = fs.readFileSync(P, 'utf8');
const g = JSON.parse(raw);
const HASH = '8134ec30762cde75a298edcec47629d6f25df19a';
let hit = 0;
function walk(n) {
  if (Array.isArray(n)) return n.forEach(walk);
  if (n && typeof n === 'object') {
    if (n.id === 'f1510-3-inventory-names-its-commit') {
      hit++;
      n.status = 'merged';
      n.mergeHash = HASH;
      n.closureReason =
        'MERGED s1514 as a NEGATIVE RESULT, and F-1510-3 STAYS OPEN — the task shipped its licensed measurement, not its cure. ' +
        'Deliverable: docs/bench/f1510-3-inventory-snapshot-commit-negative-result.md (86 lines, docs-only). ' +
        'FINDING: `git rev-parse HEAD` at generation time cannot name the tested tree. RE-VERIFIED at the drain from the generator\'s own code, not from the report: ' +
        'scripts/suite-red-inventory.mjs:12-17 derives `runRoot` and `runTreePresent` FROM `report.config.rootDir`, using its own ROOT only as a fallback — i.e. the generator is BY DESIGN a reducer of a report produced in another tree, and :121 resolves test bodies out of that other tree. ' +
        'The tracked snapshot names rootDir=worktrees/lane-d/e2e with stats.startTime=2026-07-28T02:26:03.534Z, so the prescribed line would have emitted the REDUCING checkout\'s sha. ' +
        'The runner correctly refused to manufacture guard arms for output it had proved false. ' +
        'Gates on the merged tree: tsc rc=0; test:node-guards rc=0, 346 tests / 343 pass / 0 fail / 3 skipped at Node 26.4.0 (byte-identical to the s1513 supervisor tally); build + browser NOT owed, docs-only diff. ' +
        'SUCCESSOR: see F-1514-1 — the gate sentence itself is wrong and is revised in the same commit; the cure must thread the revision from the Playwright run, not derive it at reduce time.';
    }
    Object.values(n).forEach(walk);
  }
}
walk(g);
if (hit !== 1) throw new Error('expected exactly 1 leaf, got ' + hit);
fs.writeFileSync(P, JSON.stringify(g, null, 2) + '\n', 'utf8');
console.log('leaf updated, hits=', hit);
