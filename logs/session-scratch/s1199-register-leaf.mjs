// s1199: register the run-tree-invariance leaf (Goal Registration Law — same commit as the master).
// Kept per the RETENTION LAW; it is the instrument that wrote the leaf.
import fs from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));

let arr = null;
let idx = -1;
(function walk(nodes) {
  for (const n of nodes ?? []) {
    for (const key of ['subgoals', 'tasks']) {
      if (!Array.isArray(n[key])) continue;
      const i = n[key].findIndex((x) => x.taskFile === 'lane-d-suite-red-inventory-harness-provenance.md');
      if (i >= 0) { arr = n[key]; idx = i; }
      walk(n[key]);
    }
  }
})(g.goals);

if (!arr) { console.error('PARENT NOT FOUND — aborting, nothing written'); process.exit(1); }
if (arr.some((x) => x.taskFile === 'lane-d-suite-red-inventory-run-tree-invariance.md')) {
  console.error('ALREADY REGISTERED — aborting, nothing written'); process.exit(1);
}

const DEFAULT = '?' + '?';

const leaf = {
  id: 'factory-suite-red-inventory-run-tree-invariance',
  title: 'F-1198-2: the suite-red inventory is still not reproducible across checkouts — and the damage is a category worse than the finding states. Beyond the 409 path rows, the whole 135-row "Masking candidates" section changes content AND order, because testBody() reads spec sources from the REDUCER’s root; from main’s root all 135 rows fail to resolve, tie at the ' + DEFAULT + ' 100 default, and the section renders an alphabetical list under a "Ranked by risk" header. Resolve every path and every body statistic against the tree the RAW names (config.rootDir), refuse to substitute a local tree, and say what could not be measured.',
  taskFile: 'lane-d-suite-red-inventory-run-tree-invariance.md',
  status: 'queued',
  lane: 'lane-d',
  authoredBy: 's1199 fire (FIRE-AUTHORED, attended review welcome)',
  spec: 'tasks/BACKLOG.md:86 (F-1198-2, raised s1198); subject scripts/suite-red-inventory.mjs relative() :57-63, testBody() :111, masking build+sort :208-218, header block :229-247; guard scripts/suite-red-inventory.test.mjs (EXTENDED, not a new file — package.json’s 14-file list unchanged); input logs/suite-red-inventory-compact.json (tracked, merged 7a457025); artifact logs/suite-red-inventory.md (DO NOT REGENERATE — see authorNotes 6)',
  authorNotes: [
    'EVERY NUMBER MEASURED BY THE AUTHORING FIRE ON THIS DISK TODAY, AND THE PROTOTYPE WAS BUILT AND RUN BEFORE THE CURE WAS PRESCRIBED — a recommendation is an untested second hypothesis.',
    '(1) F-1198-2 REPRODUCES EXACTLY: same input, same script, only the reducer’s own repo root varied (worktrees/lane-d/scripts/... invoked from the SAME cwd, so cwd — settled by s1197 — is not a confound): main root 128,904 B vs lane-d root 117,408 B, 409 differing lines, delta 11,496 B. The raw carries 1,623 absolute .spec.ts strings, every one under .../worktrees/lane-d/.',
    '(2) THE FINDING UNDERSTATES THE DAMAGE BY A CATEGORY, which is why this is worth shipping: path rendering is only 506 prefix occurrences x 17 chars = 8,602 B of that delta. The residual 2,894 B across 135 lines is the ENTIRE Masking candidates section changing content and order. Measured — main root: 135 rows, 0 with a real percentage, order PURE ALPHABETICAL; lane-d root: 135 rows, 95 with a real percentage, not alphabetical. From the wrong tree every row falls to the ' + DEFAULT + ' 100 default at :216, they all tie, and localeCompare masquerades as a risk ranking under a header reading "Ranked by the earliest failing line within the test body." That default is a could-not-measure value wearing the costume of a measured-lowest-risk value.',
    '(3) THE FINDING’S DILEMMA IS FALSE AND I PROVED THE THIRD OPTION BY BUILDING IT. F-1198-2 says the cure is a judgement between normalise (comparable but lossy) and preserve (faithful but incomparable). It is neither: the raw records its own tree at config.rootDir = /Users/robin/Claude/Projects/Gold Rush/worktrees/lane-d/e2e. A patched copy placed at two unrelated roots (/tmp/s1199-proto/A and /tmp/s1199-proto/A/B) produced 117,408 B from BOTH, byte-identical, and byte-identical to the run tree’s own reference output, with 188 real-percentage cells restored and zero absolute prefixes. Provenance is stated once instead of 506 times; nothing is lost.',
    '(4) THE PROTOTYPE FOUND THE TRAP: patching only the isAbsolute branch produced output that was byte-identical across roots AND WRONG — 0 bodies resolved — because relative()’s :60-62 branches decide the e2e/ prefix with fs.existsSync against the reducer’s ROOT, so from a root with no e2e/ the file degrades to a bare filename and every later path.join misses. All four sites move together or the change is a decorative no-op.',
    '(5) THE RUN-TREE-ABSENT ARM WAS ALSO VALIDATED: with rootDir pointed at a vanished path, output was byte-identical across both roots (120,190 B) with all 270 body cells honestly "body unavailable" and zero fabricated percentages — but spec paths regressed to bare filenames, because the naming branches still asked the DISK. Hence the binding scope-2c constraint: no fs.existsSync may decide a rendered path; the e2e/ prefix is knowable from config.rootDir’s basename alone. That residual was found by RUNNING the cure, not by reading it.',
    '(6) THE COMMITTED ARTIFACT IS ALREADY UNREPRODUCIBLE, which is why scope 6 FORBIDS regenerating it: logs/suite-red-inventory.md (119,852 B, blob dc4c4cbe) has 0 "body unavailable" and 38 "callsite outside body", while EVERY regeneration possible on this disk today yields 48. It was produced against a tree state that no longer exists, so regenerating would destroy the record rather than refresh it.',
    '(7) CORRECTED IN PASSING (F-1199-1): drain commit e23a40ae’s message reads "128781->128904 B", which are REGENERATED-report sizes; the tracked artifact it actually committed moved 119,337 -> 119,852 B (+8 appended prose lines). Two different documents wearing one number — the master says which is which.',
    'Pre-change guard baseline MEASURED at tests 68 / pass 68 / fail 0, 14 files, by running it rather than inheriting it. LANE-SAFETY verified by TWO-DOT diff, not commit count: main..lane/perf is 1 ahead at 57fc65ed carrying s1198’s already-merged work (e23a40ae); git diff --stat main lane/perf is 5 files / 4 insertions / 158 deletions with NO scripts/ path, so the reset is loss-free.',
  ].join(' '),
};

arr.splice(idx + 1, 0, leaf);
fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('leaf inserted after index', idx, '| siblings now', arr.length);
