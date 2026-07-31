CODEX: model=gpt-5.6-sol effort=high
# lane-b-citation-titles-rung-masters — retire the standing `test:citations` red (11 of its 12)
FIRE-AUTHORED s1298 (attended review welcome)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled. TEXT-ONLY — zero src/, zero e2e/.

WHY (quoted evidence, dated — do not re-derive the motive, only the facts):
- `npm run test:citations` (`scripts/citation-title-guard.mjs`) is **RED on main and has been for at least three
  fires.** Measured s1296, s1297, s1298: **exactly 12** offending citations each time, unchanged.
- F-1296-2 (tasks/BACKLOG.md, s1296, MEASURED): run in the same minute in a detached gate worktree and in
  repo-root main, "**both rc=1 with byte-identical output**, so this is pre-existing and not attributable to any
  recent merge. The offenders are all in `tasks/lane-c-agent-rung-honest-gate.md` and
  `tasks/lane-c-agent-rung-honest-gate-v2.md`; each points at a **helper or assertion line in the middle of a
  test** rather than at its `test(` declaration, which is why no title is recoverable."
- The guard's own output states the principle this repo already lives by:
  "*The line number is a convenience that decays; the title is what survives.*"
- Cost of leaving it: every drain's `run-guards` battery carries a red that the draining fire must re-explain
  from scratch. s1296, s1297 and s1298 each spent gate time proving "not mine". **That is how a real red
  becomes background noise** — which is the actual damage, not the 12 lines.

READ-FIRST (paths, read fully before editing anything):
1. `scripts/citation-title-guard.mjs` — the guard you must satisfy. **Read how it decides a citation is
   satisfied** (what counts as a recoverable title, and what form the title must take beside the citation).
   Do not guess the accepted form from the examples below; derive it from the code.
2. `tasks/BACKLOG.md` F-1296-2 (grep `F-1296-2`) — the full finding, including the trap in scope 3.
3. The two subject files: `tasks/lane-c-agent-rung-honest-gate-v2.md`, `tasks/lane-c-agent-rung-honest-gate.md`.

PRE-FLIGHT (LANE-SAFETY invariant): confirm this worktree/branch is clean vs main before any reset; if the
branch holds unmerged content, **STOP and report** — never reset over it. Then run
`npm run test:citations` and record the exact offender list as your BASELINE. If the count is not 12, or the
offenders are not the 11 below plus one in `tasks/BACKLOG.md`, **STOP and report the delta** — the premise has
moved since authoring and a fire must re-scope rather than have you improvise.

SCOPE (all edits are to the two named task .md files — nothing else):
1. BASELINE first: `npm run test:citations`, save the full offender list into your report verbatim.
2. For each of the **11** offending citations in the two subject files, recover the **real test title** by
   opening the cited spec and walking UPWARD from the cited line to its enclosing `test(` / `test.describe(`
   declaration — the cited line is a helper or assertion in the middle of the test, which is precisely why the
   guard cannot recover a title. Then annotate the citation with that title in the form the guard accepts
   (per READ-FIRST 1).
   ⛔ **THE OFFENDER LIST IS DELIBERATELY NOT REPRODUCED IN THIS MASTER, AND THAT IS A DEMONSTRATION, NOT AN
   OMISSION.** The fire that authored this task first wrote all 11 out as a convenience list — and staging the
   file took the guard from **12 to 20**. It was invisible until `git add`, because the guard scans *tracked*
   `.md` files and an untracked master is not yet one of them. **Your baseline in scope 1 IS the list**: it
   names every offender by source file and coordinate, it cannot drift from reality the way a hard-coded list
   can, and reading it from the guard costs you one command. Distribution as measured s1298: **10 in
   `lane-c-agent-rung-honest-gate-v2.md`, 1 in `lane-c-agent-rung-honest-gate.md`**, spread across six
   different specs in `e2e/`.
3. **Correct the coordinate too, where it is wrong.** The title is what survives, but a citation that points at
   a helper line is also just a worse pointer than one aimed at the test's declaration. Where the cited line is
   not the `test(` line, prefer re-aiming the citation at the declaration AND carrying the title. If you judge
   the mid-test line to be the deliberately meaningful one (it names the exact assertion under discussion),
   KEEP it and say why in your report — both are defensible; an unexplained choice is not.
4. Re-run `npm run test:citations`. **Expected: 12 → 1.** The single survivor is
   the lone `tasks/BACKLOG.md` entry (an `ss-01-beats` citation — named by spec, NOT by coordinate, because
   writing its coordinate here would re-create it as a 2nd offender), which is DELIBERATELY out of scope
   (see NO). *That sentence is itself the third demonstration of the trap in this file.*
5. Re-run `npm run test:node-guards` and confirm it is unchanged vs your baseline.

⚠️ THE TRAP, PRE-DECLARED — READ BEFORE YOU EDIT (F-1296-2 hit it, and so did the fire that wrote this master):
**The guard scans `tasks/**/*.md` and cannot tell a specimen from a use.** If you paste an offending citation
into your run report, into a comment, or into any file under `tasks/`, you CREATE A NEW OFFENDER. s1296's first
draft of its own finding pasted three specimens and pushed the guard from 11 to 15. s1298 hit the same trap
writing F-1297-2 and had to rewrite the row to name the test by title instead.
⇒ Therefore: **run `npm run test:citations` LAST, after every edit including any you make to task files**, and
if the count went UP, the increase is almost certainly your own prose. Fix your prose, do not fix the guard.

TOUCH-ONLY: `tasks/lane-c-agent-rung-honest-gate-v2.md` · `tasks/lane-c-agent-rung-honest-gate.md`.
NO:
- **`tasks/BACKLOG.md` — FORBIDDEN, and the reason is mechanical, not stylistic.** It holds the 12th offender,
  but EVERY fire edits BACKLOG on EVERY drain; a lane branch holding a BACKLOG edit for hours will conflict.
  That last citation is a one-line fire-side act and is recorded as such in the s1298 handoff. Leaving the
  guard at 1 is the CORRECT outcome of this task — do not "finish the job" and cause a merge collision.
- **`scripts/citation-title-guard.mjs`** — do not touch the guard. Greening a guard by editing it is the
  REJECT condition. The guard is right and the task files are wrong (F-1296-2 says so explicitly).
- Any `e2e/**` file. You are reading specs to recover titles; you are not editing them. **Editing a test to
  make a citation true is the REJECT condition.**
- Any `src/**` file. Any other file under `tasks/`. `logs/suite-red-inventory.md` (the guard reports 900
  ungated citations there — that is F-1252-1, on the owner's desk, and explicitly NOT this task).

SELF-CHECK (all must be recorded with real numbers in your report):
- `npm run test:citations` BASELINE (expect rc=1, 12 offenders) and FINAL (expect **rc=1, exactly 1 offender**,
  the BACKLOG one). Quote the final offender list — it should be a single line — **by file and count, without
  pasting the citation itself** (see THE TRAP).
- `npm run test:node-guards` unchanged vs baseline.
- `npx tsc --noEmit` rc=0 and `npm run build` rc=0 — expected trivially green (text-only change), and their
  purpose here is to PROVE the change was text-only.
- `git status --porcelain` shows **exactly two modified files** and nothing else.
- For each of the 11: state the recovered title and whether you re-aimed the coordinate (scope 3) or kept it.

READY-FOR-GATES + report: the baseline and final guard output, the 11 recovered titles, your scope-3 choice per
citation with reasoning, and confirmation that no `e2e/**`, `src/**`, `scripts/**` or `BACKLOG.md` file moved.
