// s1557 — drain bookkeeping for f1554-1: goal leaf + BACKLOG closure.
import fs from 'node:fs';

const MERGE = '82a4c15c4ed5981a95090f35dcf3da11c381147a';
const LEAF = 'f1554-1-node-guards-contention-stamp';

// ---- goal leaf ----------------------------------------------------------
const gp = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(gp, 'utf8'));
let hit = 0;
function walk(n) {
  if (n.id === LEAF) {
    n.status = 'merged';
    n.mergeHash = MERGE;
    hit++;
  }
  for (const k of ['subgoals', 'tasks', 'children']) (n[k] || []).forEach(walk);
}
g.goals.forEach(walk);
if (hit !== 1) { console.error('leaf hits=' + hit + ' — ABORT'); process.exit(1); }
fs.writeFileSync(gp, JSON.stringify(g, null, 2) + '\n');
console.log('goal leaf -> merged', MERGE.slice(0, 10));

// ---- BACKLOG: close F-1554-1 -------------------------------------------
const bp = 'tasks/BACKLOG.md';
const L = fs.readFileSync(bp, 'utf8').split('\n');
const i = L.findIndex((l) => /^\W*\*\*F-1554-1 \(s1554/.test(l));
if (i < 0) { console.error('F-1554-1 row not found — ABORT'); process.exit(1); }
if (/CURED — DO NOT AUTHOR/.test(L[i])) { console.error('already closed — ABORT'); process.exit(1); }

L[i] =
  '⛔ **CURED — DO NOT AUTHOR FROM THIS ROW (closed s1557 at the drain, merge `82a4c15c4`): the contention stamp is LIVE on main.** ' +
  '`scripts/run-node-guards.mjs` now prints `CONTENDED — <n> concurrent batteries` to stderr, bracketing the battery (once before the child, once after). ' +
  '🔑 **It counts BATTERIES, not pids** — each `sh -c` + `node` pair that `npm run` produces is collapsed into one root — which is the correction s1556 made to ' +
  '**this row\'s own arithmetic** while authoring the cure: one battery presents TWO matching pids, so this row\'s evidence pairs `34453/34454` and `69380/69381` ' +
  'were **two batteries, not four**. The conclusion was never affected; only the count was. ' +
  '✅ **Gated by me on the merged tree, battery run ALONE: rc=0, 393 tests / 390 pass / 0 fail / 3 skipped / 310.3 s** (the 3 are the documented F-1408-2 fire-shell ' +
  'cross-engine skips), tsc clean, build green. Evidence `artifacts/s1557-node-guards-f1554-1.txt`, review `reviews/f1554-1-node-guards-contention-stamp.md`. ' +
  '⭐ **The green is not the evidence — the manufactured red is:** the guard spawns a real detached `/bin/sh -c` sibling (deliberately the same two-process shape ' +
  '`npm run` makes) and asserts the stamp reads exactly `CONTENDED — 2 concurrent batteries`; a pid-counting harness would say 3 and red. It also asserts exit codes ' +
  'are **unchanged** with and without the sibling, so the stamp is ADVISORY and can never fail a battery it merely measures. ' +
  '⓵ **Residual, non-blocking (F-1557-2, in the review):** the stamp is stderr-only and unstructured, so no guard can later ask of an archived run *"was this green ' +
  'taken under contention?"* — a fire inheriting a green still cannot tell unless the log tail was kept. Correctly out of scope here; it is an evidence-FORMAT question. ' +
  '**GATE: none — closed.** ';

fs.writeFileSync(bp, L.join('\n'));
console.log('BACKLOG F-1554-1 closed at L' + (i + 1));
