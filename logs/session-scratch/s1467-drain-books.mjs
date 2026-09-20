import fs from 'node:fs';

const MERGE = '9af152ab4c25802a649c1147fd013ed540f306cb';
const SHORT = MERGE.slice(0, 8);

// ---- 1. goal leaf ----------------------------------------------------------
const gp = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(gp, 'utf8'));
let leaf = null;
(function walk(n) {
  if (Array.isArray(n)) return n.forEach(walk);
  if (n && typeof n === 'object') {
    if (n.id === 'e3-voltage-socket') leaf = n;
    for (const k of ['goals', 'subgoals', 'tasks']) if (n[k]) walk(n[k]);
  }
})(g.goals);
if (!leaf) throw new Error('leaf e3-voltage-socket not found');
leaf.status = 'merged';
leaf.mergeHash = MERGE;
leaf.review = 'reviews/e3-voltage-socket.md';
leaf.drainedBy = 's1467';
fs.writeFileSync(gp, JSON.stringify(g, null, 2) + '\n');
console.log('leaf ->', leaf.status, leaf.mergeHash.length + '-char hash');

// ---- 2. BACKLOG row --------------------------------------------------------
const bp = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(bp, 'utf8').split('\n');
const idx = lines.findIndex((l) => l.includes('GOAL LEAF `e3-voltage-socket`'));
if (idx < 0) throw new Error('lane receipt row not found');
console.log('OLD ROW:', lines[idx].slice(0, 160));

lines[idx] =
  '- ✅ **SHIPPED s1467 — `e3-voltage-socket` MERGED `' + MERGE + '` (review `reviews/e3-voltage-socket.md`).**' +
  ' **ERA-SOCKET CLASS #2, and the E3 census moves AGENT-READY 0 of 4 → 1 of 4.** `HeadlessContractSim` now runs the production `PowerGraphSystem` and samples the locked `DayNightCycle` for `e3-blackout-ridge`;' +
  ' the manifest derives its vocabulary from those consumers — existing `BUILD capacitor_bank` grammar, `REPAIR_UNDER` for authored trunk frames, deterministic allocation across intact wires/online nodes, two 0.05 Wh stores, the locked cycle\'s 0.645–0.86 darkness band.' +
  ' ⭐ **ZERO new operations invented** — the master\'s honesty clause ("the vocabulary is honest" beats "the vocabulary is long") was taken, not worked around. **F-ER01-E3-1 CURED, original text retained verbatim under a banner (RETENTION LAW), unprompted.**' +
  ' 🧪 **Gated on the MERGED tree in a detached worktree (§3.0b custody), scratch port 5231 because lane-b was live on `strictPort` 5188:** tsc clean · build green · `test:node-guards` **rc=0** (mandatory — touches `src/sim/`, F-1460-1 — and the **gr-sim Baron pin HELD**, so no cross-cutting sim number moved) · own spec **8 passed / 53.2s** desktop+390px · adjacent `er01-e2/e4/e5/e6` **32 passed / 1.7m, E2 unmoved** · zero console/page errors · all playwright `--workers=1` (§3.1).' +
  ' 🔭 **F-1467-3 (non-blocking, in the review):** E3-2/-3/-4 are **sequenced, not blocked** — all three need the same four files this slice just rewrote, measured live via `lane-usable` while lane-a still held them. **They are authorable as of this merge**; E3-2 is cheapest (`src/systems/MothSwarm.ts` present, and its `dayNightCycle` half is now socketed). E3-4 still needs its crowd objective authored on its own surface first.';

fs.writeFileSync(bp, lines.join('\n'));
console.log('NEW ROW written at line', idx + 1);

// ---- 3. done-move prefix ---------------------------------------------------
const src = 'tasks/done/20260806-003706-lane-e3-voltage-socket.md';
const dst = 'tasks/done/drained-' + SHORT + '-20260806-003706-lane-e3-voltage-socket.md';
if (fs.existsSync(src)) {
  fs.renameSync(src, dst);
  console.log('done-move ->', dst);
} else {
  console.log('done-move already prefixed or missing');
}
