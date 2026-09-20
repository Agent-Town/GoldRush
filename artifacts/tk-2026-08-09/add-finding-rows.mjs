// s1618: give F-1618-1 and F-1618-2 their own declaring BACKLOG rows.
// The desk-declaration guard is right: both were only MENTIONED inside the f1617-1 row,
// which is the F-1328-3 shape — a finding on no board the owner reads.
// Each row's FIRST key inside the first 90 characters is its own F-ID.
import fs from 'node:fs';

const P = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');

const ANCHOR = 3582; // 1-indexed: the f1617-1 row. Insert directly after it.
const anchorLine = lines[ANCHOR - 1];
if (!anchorLine.includes('[f1617-1] MERGED s1618')) {
  console.error('REFUSING: anchor moved. Found: ' + anchorLine.slice(0, 100));
  process.exit(2);
}

const rows = [
  '  - 🔬 **[F-1618-1] THE ADJACENT SUITE IS RED ON BOTH ARMS, AND THE SLICE MAKES IT LESS RED — read red SETS, not absolutes.** Filed s1618 while draining `f1617-1` (`f5dbb5448`). The ten `e2e/town-*-blender.spec.ts` read **14 failed / 70 passed** on the merged tree against the runner\'s `84/84` in the lane shell, which looks like a regression and is not one. **Control run, main WITHOUT the slice, same shell, same hour, `--workers=1`: `33 failed / 49 passed`.** The control-only 19 are a *different class* — fast (2–4 s) **request-laziness** assertions (`expect([]).toEqual(["…/chapel-3d/chapel.glb"])` in "LITE tier always keeps the Chapel facade and never fetches the GLB"), i.e. precisely the pre-existing defect f1615-1\'s re-scope cures. **All 14 remaining are the p95 frame-time timing class; not one is an assertion about behaviour** (chapel: `p95Ratio 1.9647`, `16.7 ms` against a `9.775 ms` budget). ⚠️ **I reached a wrong reading TWICE and both are recorded rather than tidied away, because each came from a probe still carrying load it did not look like it was carrying.** First "load ceiling, proven" off ONE test (tavern desktop **8.2 s alone** vs 17.6 s in batch). Then "reproducible slice-attributable p95 regression on stamp-mill mobile" — **wrong**: that probe ran the *whole spec*, both projects, including the new test that fetches two bulk GLBs. Run genuinely alone it is **3/3 GREEN (7.5/8.2/8.3 s)** against the control\'s 7.3 s. 💡 **Reusable: "in isolation" is a property of the MEASUREMENT, not of the command** — a single-spec invocation is still loaded when the spec holds six tests and one downloads two bulk halls. Narrow to the single TEST before concluding anything about a timing gate. **GATE: none owed to the owner** — this is a measurement, and it is discharged by being written down. Review `reviews/f1617-1-savedata-town-trim.md`.',
  '  - 🔬 **[F-1618-2] THE FIRE SHELL CANNOT ADJUDICATE A p95 GATE AT ALL — non-blocking, filed s1618.** An instrument that reds **33 of 82** on an *untouched control* cannot settle a two-test difference between arms; its reds are the shell\'s, not the slice\'s. This is F-1270-1\'s lesson with a wider denominator: there the cure was `--workers=1`, but serialisation does not lift the fire shell\'s per-job CPU ceiling (F-1269-1: 7.53× lane vs 3.47× fire at eight children), it only stops the shell fighting itself. ➡️ **Therefore, for any drain touching frame-time-gated suites: gate on the ASSERTION classes (mount, request, distinct-count, console-error), and compare red SETS across a control arm — never chase an absolute green the fire shell cannot produce, and never re-pin a p95 budget to make a fire-shell red go away** (the standing prohibition at the `gr-sim` pin site, F-1441-3). A frame-time number is only trustworthy measured in a LANE shell. **GATE: none owed to the owner** — this is a caution to fires, not a question. Companion to [F-1618-1].',
];

lines.splice(ANCHOR, 0, ...rows);
fs.writeFileSync(P, lines.join('\n'));
console.log('inserted 2 declaring rows after line ' + ANCHOR);
for (const r of rows) {
  const id = r.match(/\[(F-1618-\d)\]/)[1];
  console.log('  ' + id + ' first-90: ' + (r.slice(0, 90).includes(id) ? 'OK' : 'TOO LATE'));
}
