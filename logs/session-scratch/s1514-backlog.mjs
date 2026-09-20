import fs from 'node:fs';
const P = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');

// --- 1. the dispatch row (📮 F-1510-3 → lane-a) records its drain outcome ---
const dispatchIdx = lines.findIndex((l) => l.startsWith('📮 **F-1510-3 — MASTER AUTHORED s1513 → lane-a'));
if (dispatchIdx === -1) throw new Error('dispatch row not found');
lines[dispatchIdx] = lines[dispatchIdx].replace(
  '📮 **F-1510-3 — MASTER AUTHORED s1513 → lane-a',
  '📮 **F-1510-3 — MASTER AUTHORED s1513 → lane-a, DRAINED s1514 (`8134ec30`) AS A NEGATIVE RESULT — THE LICENSED ONE FIRED, AND THE ROW STAYS OPEN',
) +
  ' 🔻 **DRAIN OUTCOME s1514: the negative result this master licensed is the one that happened, and it is CORRECT — re-verified at the drain from the generator\'s CODE rather than from the runner\'s report.** ' +
  'The runner returned `docs/bench/f1510-3-inventory-snapshot-commit-negative-result.md` (86 lines, docs-only, zero code) and refused to manufacture guard arms for output it had proved false — **the right refusal, and worth saying out loud: hardening a defect behind a green test is strictly worse than shipping nothing.** ' +
  '🔑 **THE EVIDENCE IS STRONGER THAN THE REPORT CLAIMED.** The report argued from the tracked snapshot\'s data (`config.rootDir = …/worktrees/lane-d/e2e`, `stats.startTime = 2026-07-28T02:26:03.534Z`, both re-measured on main this fire). But the decisive evidence is in `scripts/suite-red-inventory.mjs` itself: `:12–:17` derive `runRoot`/`runTreePresent` **from `report.config.rootDir`**, falling back to the generator\'s own `ROOT` only when the report names none, and `:121` resolves test bodies out of that other tree. ' +
  '➡️ **The generator is BY DESIGN a reducer of a report produced in a different checkout.** So `git rev-parse HEAD` at generation time names the *reducing* tree as a structural property of the tool, not as an accident of one stale snapshot — a fire re-running this on a fresh report would hit the identical wall. Gates: `tsc` rc=0 · `test:node-guards` rc=0, **346 tests / 343 pass / 0 fail / 3 skipped** at Node 26.4.0; build + browser not owed (docs-only). Leaf `f1510-3-inventory-names-its-commit` → `merged`. **The FINDING is not cured — see the revised gate on the F-1510-3 row and [F-1514-1].**';

// --- 2. the F-1510-3 row: its GATE is now measurably wrong; revise it ---
const rowIdx = lines.findIndex((l) => l.startsWith('🟢 **F-1510-3 (s1510'));
if (rowIdx === -1) throw new Error('F-1510-3 row not found');
lines[rowIdx] +=
  ' 🔻 **GATE REVISED s1514 — THE OLD GATE SENTENCE PRESCRIBED A CURE THAT IS MEASURABLY WRONG, AND A FIRE SATISFYING IT LITERALLY WOULD HAVE SHIPPED A FALSE LINE.** ' +
  'The previous wording — *"closes when a regeneration of `logs/suite-red-inventory.md` writes `HEAD` into its provenance block"* — names `HEAD` of the tree doing the **regenerating**, and `8134ec30` proves that is never the tree that was **tested**: the generator reduces a raw JSON produced elsewhere (`scripts/suite-red-inventory.mjs:12–:17` take `runRoot` from `report.config.rootDir`). ' +
  '⚠️ **This is the more useful half of the negative result: the gate was not merely unmet, it was unmeetable-as-written, and it had already survived two fires of careful reading** (s1510 filed it, s1513 re-measured the row and tightened it to "one line" without noticing the line would be wrong). A gate is a predicate, and a predicate can be false about the world. ' +
  '**GATE (revised, and now honest about its cost): closes when `logs/suite-red-inventory.md` names the commit THE SUITE RAN AT — which requires the revision to be captured BY the Playwright run and threaded alongside the raw report, then copied verbatim by the reducer. Deriving a revision while reducing is disqualified by construction.** ' +
  'ⓘ Scope note for whoever authors that: this is no longer the trivial one-line change this row was filed as, because it reaches the run harness, not just the reducer — price it before queueing it. See [F-1514-1] for the class.';

// --- 3. file F-1514-1 at the top of the ledger ---
const NEW =
  '🟡 **F-1514-1 (s1514 — A GATE SENTENCE IS A PREDICATE ABOUT THE WORLD, AND THIS LEDGER HAS NO STEP THAT EVER TESTS ONE. F-1510-3\'s GATE SURVIVED TWO CAREFUL RE-READINGS WHILE BEING UNSATISFIABLE.** Non-blocking; no corrective queued — recorded as a class, because the cheap mechanical fix would be the wrong one.) ' +
  'F-1510-3 shipped with **GATE: closes when the inventory names the commit it was taken at**, later tightened to *"…when a regeneration writes `HEAD` into its provenance block"*. Both were read closely by s1510 (filed it), s1513 (re-measured the row, corrected its REC about a non-existent provenance block, and reduced its scope to "one line"), and by the master s1513 authored — which was rigorous enough to **license a negative result naming this exact hazard**. The runner then hit it on the first probe. ' +
  '🔍 **WHAT NOBODY DID, ACROSS ALL THREE PASSES, WAS EVALUATE THE GATE\'S OWN PREDICATE AGAINST THE CODE.** Every pass asked *is this gate met?* (answer: no) and *is the described cure cheap?* (answer: yes, one line). **None asked *would performing the cure make the gate TRUE?*** — and the answer was no, because `scripts/suite-red-inventory.mjs:12–:17` show the generator reduces a report produced in another checkout, so the `HEAD` it would write is the wrong revision by construction. ' +
  '💡 **The distinguishing feature of this class: the gate stays UNMET, so no guard reds and no drain is blocked — it simply keeps recruiting fires to build the wrong thing, and each one re-reads the row and confirms it is still open.** That is the reverse of the usual ledger hazard ([a gate that closes on a failed attempt retires a live defect]); here a *live* gate quietly manufactures wasted lanes. Cost so far: one authored master and one lane run, recovered only because the author had the instinct to license a negative result. ' +
  '⚖️ **DELIBERATELY NOT PROPOSING A MECHANISM.** The tempting cure — a guard that parses GATE sentences — is the [run-the-predicate-on-the-live-corpus-first] shape: gate prose is free-form across 400+ rows and no parser can evaluate *"names the commit it was taken at"* against a code tree. **REC (process, not code): when an author converts a GATE into scope, spend one probe asking whether performing that scope would make the sentence true, and record the probe in the master. s1513\'s master already did the adjacent version of this** — it verified the *provenance block* did not exist and corrected the REC — **and that same instinct, aimed one step further out at the revision\'s identity, would have caught this before the lane ran.** Related: [F-1510-3], [F-1506-2].';

lines.splice(0, 0, NEW, '');
fs.writeFileSync(P, lines.join('\n'), 'utf8');
console.log('backlog updated: dispatch row, F-1510-3 gate revised, F-1514-1 filed');
