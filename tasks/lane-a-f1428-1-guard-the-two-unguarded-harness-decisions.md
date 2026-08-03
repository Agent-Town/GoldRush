CODEX: model=gpt-5.6-sol effort=high
# lane-a-f1428-1-guard-the-two-unguarded-harness-decisions — two load-bearing decisions in the concurrency harness ship with no test that fails when they are deleted (F-1428-1)
FIRE-AUTHORED s1429 (attended review welcome)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

WHY (F-1428-1, measured s1428 while draining `f1426-2`; every number below came from a probe run on the merged tree, not from reading):

s1428 drained the concurrency-harness contract repair and, rather than trusting its green
`--self-test`, **broke every load-bearing decision in the diff**. Five mutations. Three reddened
as they should: `subjectMatches` → `executions=4/2`, the worker-ceiling check → `Missing expected
exception`, the `extras` detection → red.

**Two did not.** Deleting `exactCountMismatch` or `labelFor` leaves `--self-test` **passing**.

The first question is whether that means they are dead code. It does not — s1428 probed both
directly and both are load-bearing:

1. **`exactCountMismatch`** is the guard keeping `file:line` subjects **exact**. Its defended case
   is two distinct tests sharing one line, with the subject qualified to that line. Constructed in
   the synthetic fixture, that case yields `missing=[] extras=[] executions=4/2` — i.e. **nothing
   else catches it**. It is precisely the anti-regression guard for the exactness that the
   F-1426-2 widening (bare-file subjects matching at file granularity) could loosen.
2. **`labelFor`** renders the rate table's Subject column. Measured both ways over a bare-file
   subject: **with** it, `S1:4` / `S1:9`; **without** it, **three rows of `| undefined |`** — and
   `--self-test` never renders a summary at all, so it cannot see this.

⚠️ **THIS IS F-1426-2'S OWN SHAPE RECURRING ONE SLICE LATER.** That finding was *"a green
self-test certified an instrument that could not do the job it was pointed at"* — coverage
narrower than the contract. The repair fixed the contract; its self-test still does not cover
everything the repair changed. The F-1424-4 successor measurement would then rest on two
decisions no test defends.

READ-FIRST (paths — open each one, do not work from this summary):
- `scripts/concurrency-class-rate.mjs` — the whole file, but specifically `assertComplete()`,
  `writeSummary()` and `selfTest()`. Cite BY CONTENT per F-1310-1: grep
  `  const exactCountMismatch = required.some(({ subject, project }) =>` (expect **1**),
  `  const labelFor = (subject) => {` (expect **1**), and
  `  console.log('self-test file:line exact-match arm passed');` (expect **1**).
- `tasks/BACKLOG.md` finding **F-1428-1** — grep `TWO LOAD-BEARING DECISIONS SHIP UNGUARDED`
  (expect **1**).
- `reviews/f1426-2-concurrency-harness-contract.md` — the slice this ladders from.
ⓘ This lane was refreshed to main by s1429 immediately before dispatch, and every grep above was
verified to return **1 on main and 1 in this lane** before the queue copy. **If any grep returns
0, STOP and report — the lane drifted after dispatch and the premise needs re-checking.**

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

SCOPE (each item separately checkable):

1. **ADD A SELF-TEST ARM THAT FAILS WHEN `exactCountMismatch` IS DELETED.** Construct the case it
   defends: a report whose fixture contains **two distinct tests sharing one line**, with the
   subject qualified to that shared line (in the synthetic `a.spec.ts` fixture, line 9 — a
   self-test fixture string, not a real spec). Assert `assertComplete` **throws**, and
   assert on the `executions=4/2` shape so the arm names *why* it threw rather than merely that it
   did.
   ⚠️ **The existing `file:line` arm does NOT cover this** — it throws on `extras`, a different
   branch. Your new arm must fail with `exactCountMismatch` deleted and pass with it present.

2. **ADD A SELF-TEST ARM THAT FAILS WHEN `labelFor` IS DELETED.** Render a summary over a
   **bare-file** subject and assert that **no `undefined` reaches the rendered table**. Assert the
   positive shape too (`S1:4` / `S1:9`), so the arm pins the label format and not merely the
   absence of a string.
   ⓘ `writeSummary` writes into an output directory. Use a scratch dir under
   `logs/session-scratch/` and clean up after; do NOT write into `artifacts/` or `reviews/`.

3. **ACCEPTANCE IS TWO MANUFACTURED REDS, NOT A GREEN (s1299/s1300 standard — and this task exists
   precisely because a green certified two decisions it never executed).** For **each** of the two
   arms, show in the report:
   a. With the decision **deleted**, `--self-test` **FAILS**, quoting the assertion message.
   b. With the decision **restored**, `--self-test` **PASSES**, quoting the arm's own log line.
   c. The probe **reverted**, tree byte-identical afterwards (`git diff` empty on `scripts/`).
   ⚠️ **A report showing only a passing `--self-test` is a pre-declared REJECT.** A passing guard
   never executes its violation path, so its green is not evidence about the red.

4. **REPORT THE ARM COUNT BEFORE AND AFTER.** `--self-test` currently passes **5 arms**. State the
   new total and confirm every pre-existing arm still passes — a ladder that silently replaced an
   existing arm is a regression wearing a green.

TOUCH-ONLY:
- `scripts/concurrency-class-rate.mjs` — the `selfTest()` function, and **only** if an arm
  genuinely cannot be written without it, a narrowly-scoped testability seam in `writeSummary`.

NO (firewall — report, do not fix):
- **`assertComplete`, `subjectMatches`, `rates`, `parseArgs` and the `exactCountMismatch` /
  `labelFor` decisions themselves.** This task adds COVERAGE, it does not change behaviour. If an
  arm you write reds against correct-looking code, that is a **finding to report**, not a licence
  to edit the decision under test.
- **`playwright.config.ts`** — untouchable (fire.md §3.1; `fire-shell-serialisation.test.mjs`
  asserts both directions, and adding `fullyParallel` is separately forbidden).
- `package.json` — a new npm script would be an un-rooted gate and would red `gate-caller-audit`.
- Any `e2e/**`, `src/**`, or other `scripts/**` file.
- **Do NOT produce a rate verdict.** F-1424-4 stays open; this slice measures nothing.

SELF-CHECK before READY-FOR-GATES (name the real numbers):
- `node scripts/concurrency-class-rate.mjs --self-test` → passes, and state the **arm count**.
- `npx tsc --noEmit` → rc 0.
- `npm run build` → green.
- `npm run test:node-guards` → state the pass count.
- The scope-3 deleted/restored arms for **both** decisions, quoted verbatim.
- `git diff -- playwright.config.ts package.json e2e src` → **EMPTY**.

READY-FOR-GATES + report: the two scope-3 red/green pairs verbatim, the before/after arm counts, the node-guards number, and anything you had to STOP on.
