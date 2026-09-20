import fs from 'node:fs';

const MERGE = 'd640dc31edcd9ec0e9aa699b965855d86caf2fa5'; // full 40 chars — goal-tracker.test.mjs asserts /^[0-9a-f]{40}$/
if (!/^[0-9a-f]{40}$/.test(MERGE)) throw new Error('mergeHash is not 40 hex chars');

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));
const rows = [];
(function walk(n) {
  const k = [...(n.subgoals || []), ...(n.tasks || [])];
  if (!k.length) return rows.push(n);
  k.forEach(walk);
})({ subgoals: g.goals });

const leaf = rows.find((r) => r.taskFile === 'lane-c-f1324-1-charter-fuzz-composition-totality.md');
if (!leaf) throw new Error('leaf not found');

leaf.status = 'merged';
leaf.mergeHash = MERGE;
leaf.review = 'reviews/f1324-1-charter-fuzz-composition-totality.md';
leaf.reason =
  'MERGED s1324 at d640dc31. The charter fuzz rig is now TOTAL over its one/two-mutation space: the blank:briefing.goal arm guards with the file own return-noop idiom against an earlier illegal:missing-briefing, and e2e/charter-press-totality.spec.ts drives all 169 ordered arm pairs on fresh charters plus a bidirectional assertion that the arm still FIRES when a briefing exists. Measured on the merged tree by the drain, not inherited: tsc clean, build green, whole-suite collection Total 2476 tests in 350 files (was 0 tests in 0 files), CP-02 boot+stamp+totality 50 passed both projects zero console errors, node-guards 209/209 fail 0 across 37 files derived from package.json. All three node-guard reds cleared together, confirming the one-root finding. Stream tripwire held: mutants 6/10/12/25 unchanged. Residual F-1324-3 non-blocking: the totality guard addresses arms by hardcoded index 3 and 9 and uses a constant rng, so a menu reorder would silently re-point the bidirectional test and value-space paths are unexplored.';

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
JSON.parse(fs.readFileSync(p, 'utf8'));
console.log('leaf flipped -> merged, mergeHash', MERGE, '(len', MERGE.length + ')');
