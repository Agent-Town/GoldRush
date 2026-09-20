import fs from 'node:fs';
const P = 'tasks/goals.json';
const tree = JSON.parse(fs.readFileSync(P, 'utf8'));
let leaf = null;
(function w(n) {
  if (Array.isArray(n)) n.forEach(w);
  else if (n && typeof n === 'object') { if (n.id === 'mcb-posse-board-and-row-watch') leaf = n; Object.values(n).forEach(w); }
})(tree);
if (!leaf) throw new Error('leaf missing');
if (leaf.status === 'merged') throw new Error('already merged — refusing to rewrite');

leaf.status = 'merged';
leaf.lane = 'milk/county-board (drained s1498; branch landed on main)';
leaf.mergeHash = 'd7986be832ec85b7277136131b3d2f3575dbb40a';
leaf.drainedBy = 's1498 fire';
leaf.drainNotes =
  'MERGED s1498 at d7986be8, the SECOND drain of that fire and 6 of 8 off the milk pile. Gated on the merged tree in detached gate-s1498 (§3.0b), --workers=1, both projects: tsc rc=0 · build green 1.23s · own spec e2e/milk-county-board.spec.ts 14/14 (including three PLAIN-BOOT cases: an offline county clerk stays quiet, a failing standings request adds no error of the application own, and posse chips rank within size while a row watches its run — Mistake #10 answered inside the slice) · adjacent tape-01/tape-02/f1297-2-plain-boot-tape-button/run3d-lantern-post/profile-first-boot 32/32 · test:node-guards 341 tests / 338 pass / 0 fail / 3 skipped. MERGE SURFACE RE-MEASURED AT DRAIN TIME PER F-1497-1 AND IT WAS CHEAP: 19 files on the branch, only TWO overlapping main (tasks/BACKLOG.md, tasks/goals.json), both append-surfaces resolved as UNIONS — the county row placed newest-first in BACKLOG, the leaf appended after the er-01 census leaves in goals.json. ⚠️ THE FIRST ATTEMPT WAS ABORTED AND REDONE, AND THE REASON IS WORTH KEEPING: the gate worktree was still detached at the twin-sockets MERGE commit, one behind mains twin-sockets BOOKKEEPING commit, so the goals.json union silently dropped the milk-twin-sockets leaf. Caught because the resolution script asserted the merged JSON still contained named leaves rather than only that it parsed — a parse-only check would have passed. Aborted, re-detached the gate to main HEAD, redone, re-verified all four leaves PRESENT. Same class as refresh-the-lane-AFTER-the-evidence-commit. SECURITY POSTURE READ, NOT ASSUMED (functions/api/standings.ts is a new public endpoint): allowlist key validation via hasOnlyKeys on every nested shape, CORS origin allowlist, per-IP and per-anon rate limiting, 64KB tape cap and 100-row board cap, SHA256/ANON_ID regex validation, KV keys built only from knownContract-validated ids, no secrets client-side. AP-06 species-blindness is enforced structurally, not by convention: boardRow hands the ladder rider NAMES only, and a declared stack is visible exclusively in the field book — the comment at the type declaration says why.';
fs.writeFileSync(P, JSON.stringify(tree, null, 2) + '\n');
console.log('leaf flipped to merged, hash pinned.');
