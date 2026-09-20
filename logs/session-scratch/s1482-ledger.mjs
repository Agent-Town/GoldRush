import fs from 'node:fs';
const P = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');

// ---- F-1398-1 (line 286): CLOSED, with the predicate ruling recorded.
const i398 = lines.findIndex((l) => l.startsWith('🟢 **F-1398-1 MEASURED s1399'));
if (i398 < 0) throw new Error('F-1398-1 row not found by its opening text');
let row = lines[i398];
row = row.replace(
  /\*\*GATE: none — still fire-authorable, denominator re-measured s1479, predicate NOT yet chosen \(choose it first\)\.\*\*$/,
  '**GATE: CLOSED s1482.**'
);
if (row === lines[i398]) throw new Error('F-1398-1 GATE tail did not match — re-read before editing');
lines[i398] =
  '✅ **F-1398-1 CLOSED s1482 — `98690e837` — `scripts/claimed-spec-harness-guard.mjs`, rooted in `test:node-guards` AND `test:ledger-guards`.** ' +
  '**THE PREDICATE WAS THE SLICE, SO HERE IS THE RULING AND ITS PRICE.** Measured over **1,144** tracked masters, **21** naming a claimed spec: ' +
  'arm **(a)** command-form-only = **2** · arm **(b)** command OR gate/adjacent context = **6** (**CHOSEN**) · arm **(c)** any mention with no owning config = **12**. ' +
  '**(a) rejected** because it misses 4 real cases that cause the identical harm — a checklist line ("Adjacent unmodified-green: `e2e/release-build.spec.ts`, both projects") ' +
  'sends the runner to the same unrunnable harness a bare command does; it just is not command-shaped, so a command-shaped regex never sees it. ' +
  '**(c) rejected** because its extra 6 are provably DESCRIPTIVE — verified by READING every one: two say only "adjacent to the F-1296-3 standing order", one names the spec in a firewall NO-list and a `git diff` path, ' +
  'and three (`lane-release-build`, `-fixes-2`, `-town-fix`) are the masters that CREATED or extended the spec. A guard that flags description trains authors to paste boilerplate. ' +
  '⚠️ **THE HALF NOBODY HAD MEASURED — THE TIME DIMENSION, AND IT CHANGES WHO IS GUILTY.** This row has named `lane-b-approach-convergence-class.md` as one of two canonical offenders since s1398 and prescribed it a correction note. ' +
  'It was authored `ec72d12bc` **2026-07-29 — three days BEFORE `c8ed271c4` (2026-07-31T21:34)** made its command invalid. **It was correct when written.** ' +
  'Only **2 of the 6** postdate the config change, and they are **NOT the 2 that arm (a) finds**: `f1397-1-e1-release-door-drill-yard.md` (`a821ff629`, 2026-08-02) and `lane-a-f1305-2-console-watch-single-source.md` (`187d26736`, 2026-08-01T00:23 — **under three hours after** the change, ordering 15 specs green when one of them had just become uncollectable). ' +
  'The other 4 are **GRANDFATHERED IN THE OPEN**, each carrying the commit that proves it predates the rule; pay the debt down by deleting an entry, never by adding one silently. ' +
  '✅ **CURE APPLIED TO THE 2 LIVE ONES BY APPENDING** a correction note naming the owning config (`playwright.release.config.ts` / `npm run test:release`) — never editing the cited lines, which would rot every citation quoting them (F-1397-3). ' +
  '🔬 **PREMISE RE-VERIFIED EMPIRICALLY, NOT INHERITED:** `npx playwright test e2e/release-build.spec.ts --list` -> **"No tests found" / "Total: 0 tests in 0 files"**, rc=1 — it fails LOUDLY, so nothing ever shipped on a false green; the cost was a runner cycle. ' +
  '🧪 **11/11 tests, THREE of them MANUFACTURED defects** (command form, checklist form, gate-region form) plus two negative controls proving arm (c) is not enforced — a green never executes the violation path. ' +
  '⚠️ **AND THE BATTERY CAUGHT A DEFECT IN MY OWN TEST:** the first `test:node-guards` run went **rc=1** on `fixture-teardown.test.mjs` — this test leaked **8** temp directories, entirely invisible to its own 11 greens. Cured before commit. ' +
  '📐 The mapping is DERIVED (`claimedByAnotherConfig` + each config\'s `testMatch` + npm aliases), so a fourth claimed spec is covered with no edit; the derivation THROWS rather than silently measuring nothing if that array is renamed. ' +
  'ⓘ Reconciles the inherited count honestly: s1479\'s "7 name no config" used an *any-config* predicate, which wrongly counts naming the **default** config as compliance — the default config is precisely the one that cannot run these specs. Under *owning*-config the figure is **12**. ' +
  'Evidence `artifacts/s1482-gate.txt`, `logs/session-scratch/s1482-{measure,arms,dates}.mjs`. ' +
  row.slice(row.indexOf(' ') + 1).replace(/^\*\*F-1398-1 MEASURED s1399[^*]*\*\*\s*/, 'HISTORY: ');

// ---- F-1415-1 (line 249): GHOST LINE — its gate was satisfied at cf005d597.
const i1415 = lines.findIndex((l) => l.startsWith('🟡 **F-1415-1 (s1415, MEASURED'));
if (i1415 < 0) throw new Error('F-1415-1 row not found by its opening text');
let g = lines[i1415];
g = g.replace(
  /\*\*GATE: closed when that test lands in `test:node-guards`\.\*\*$/,
  '**GATE: SATISFIED at `cf005d597` — retired s1482.**'
);
if (g === lines[i1415]) throw new Error('F-1415-1 GATE tail did not match — re-read before editing');
lines[i1415] =
  '✅ **F-1415-1 CLOSED — cured `cf005d597`, RETIRED s1482 as a GHOST LINE (Mistake #5).** ' +
  'The cure shipped and this row kept reading 🟡 open for three days. **Verified s1482 by file-probe, not by grepping commit messages (Mistake #16):** ' +
  '`scripts/component-boss-secure.test.mjs` EXISTS, `git merge-base --is-ancestor cf005d597 main` returns 0, and `package.json`\'s `test:node-guards` names it — so the gate\'s own condition ("closed when that test lands in `test:node-guards`") is met. ' +
  'It covers exactly what the REC asked: the component branch both ways (`bossRemaining: 0` -> true, `1` -> false), wrong-group rejection, the E3 `component-boss` suffix variant, and elite-kind mismatch. ' +
  'ⓘ A grep of `scripts/gr-sim.test.mjs` looks empty because the cure landed in its own file, which is how this row stayed invisible. ' +
  g.slice(g.indexOf(' ') + 1).replace(/^\*\*F-1415-1 \(s1415, MEASURED[^)]*\)\*\*\s*/, 'HISTORY: ');

fs.writeFileSync(P, lines.join('\n'));
console.log('F-1398-1 row updated at :' + (i398 + 1));
console.log('F-1415-1 row updated at :' + (i1415 + 1));
