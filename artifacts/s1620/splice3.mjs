import fs from 'node:fs';

const rows = fs.readFileSync('artifacts/s1620/backlog-rows-3.md', 'utf8').trimEnd();
const p = 'tasks/BACKLOG.md';
const L = fs.readFileSync(p, 'utf8').split('\n');
L.splice(1, 0, rows + '\n');

const idx = L.findIndex((l) => l.includes('[f1619-2] QUEUED'));
if (idx >= 0) {
  const shipped =
    '✅ **[f1619-2] SHIPPED s1620 `' + '79782c6b4' + '`** — ' +
    '**the measurement reproduces to within 1.6%** (mobile normal 22,110,931 runner vs 22,469,519 drain; delta 2,910,139 vs 2,943,858) and the per-URL deliverable does its job: **the two bulk halls are 2,584,796 of the 2,910,139 mobile delta, 88.8%.** ' +
    '⚠️ **BUT IT DOES NOT CLOSE f1615-1, AND WHY IS THE BETTER OUTCOME — see F-1620-7: the 25 MB town ceiling is asserted by TWO tests in the same file whose totals differ by 9.5 MB**, and f1615-1’s figures sit between their scales, so the unverified ~1.9 MB “growth” may be partly instrument mismatch. ' +
    '✓ The runner stated its arm’s limit rather than overselling it, exactly as the master demanded (the saveData arm is a lower bound; it also narrows prefetch to `priority === 1`). ' +
    'GATE MET: tsc clean · `test:asset-diet` 6/6 both projects (1.6 m) · zero console/page errors · **additions only proved** (numstat deletions `0`) · gate topology unchanged · `test:node-guards` correctly out per F-1460-1. Review `reviews/f1619-2-asset-diet-town-budget-ab.md`. Original master intent follows. — originally';
  L[idx] = L[idx].replace('🔬 **[f1619-2] QUEUED s1619 → lane-a**', shipped);
  console.log('ladder row marked SHIPPED at line', idx + 1);
} else {
  console.log('WARN: f1619-2 ladder row not found');
}
fs.writeFileSync(p, L.join('\n'));
