CODEX: model=gpt-5.6-sol effort=high
# lane-d-f1522-1-dispatch-lane-safety — make lane safety a property of the LANE, not a clause in each master (F-1522-1)
FIRE-AUTHORED s1522 (attended review welcome)
ROLE: lane implementer. WORKDIR: this lane worktree (`worktrees/lane-d`, branch `lane/d`). Commit prefix `f1522-1:`. One task, firewalled. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## WHY (F-1522-1, measured by the s1522 drain on its own board — not inherited)

A lane's safe-dupe protection lives in **each master's PRE-FLIGHT prose**, so a lane is only ever as safe as whichever master happens to be dispatched into it next. s1522 measured the gap end-to-end, in 101 seconds:

| When | Event |
|---|---|
| 12:39:32 | runner auto-commits `ee61f25ee` to `lane/a` — 28 files, 39,847 insertions, the complete f1424-4 measurement |
| 12:39:43 | runner **re-dispatches the same master**; its safe-dupe pre-flight **works perfectly** and STOPs, naming that exact commit as undrained |
| 12:41:13 | runner dispatches a **different** master (`lane-fd1-front-desk-card`, authored 2026-08-05) into the same lane; Codex prints `## lane/a...origin/main [ahead 1, behind 20]` and then runs `git checkout -B lane/a origin/main`, orphaning the commit onto the reflog alone |

The work survived only because s1522 rescued it (`archive/f1424-4-worker-arm-rates-s1522`, drained `28d03c9e7`). This is `CLAUDE.md` **Mistake #2 (the Reset Massacre)** in its exact original shape.

**Read from the logs, so the cure is aimed correctly:** the runner does **not** reset lanes at dispatch — the only `git reset --hard main` in `scripts/lane-runner-v3.sh` is at `:154`, inside the janitor `refresh-lane)` branch, and no janitor request was involved. The reset was performed by **Codex executing the fd1 master's own pre-flight**, which guards *uncommitted dirt* and says nothing about *committed-but-undrained* commits. Codex obeyed correctly. **It had `ahead 1` on screen and was never asked about it.** (F-1422-2 independently verified this same mechanism: *"dispatch does not refresh a lane — only the janitor does."*)

So this is neither a Codex bug nor a runner-script bug. It is a **gap between two masters**, and ~190+ lane masters each carry their own copy of that wording. **The only defense that does not depend on which master runs next must live outside the masters** — in the one place every dispatch passes through.

## ⚠️ THE OBVIOUS IMPLEMENTATION IS A KNOWN, NAMED DISASTER — READ THIS BEFORE WRITING A LINE

**Do NOT gate on `git log main..HEAD` being non-empty.** That is **F-1027-1**, recorded in the STATUS archive as a **permanent brick**:

> *"On this board that is a permanent brick: lanes land by SQUASH merge, so a lane branch reads ahead FOREVER once its work merges."*

A master carrying exactly that wording once bricked a lane for a full run (35,105 tokens, zero files changed). The current lane pre-flight template exists *because* of it and says the opposite: *"the lane branch being ahead is NORMAL — the runner auto-commits … if its content is already merged to main, it is a SAFE DUPE → PROCEED."*

**The guard must therefore distinguish `HOLDS` (content main has never absorbed) from `AHEAD-BUT-ABSORBED` (safe), and refuse ONLY the former.** `scripts/lane-usable.mjs` already computes exactly that distinction — verified at `:302-306`:

```
if (busy) verdict = 'BUSY'
else if (d.tracked.length > 0) verdict = 'DIRTY'
else if (c.ahead === 0) verdict = 'USABLE'
else if (c.held.length === 0) verdict = 'AHEAD-BUT-ABSORBED'
else verdict = 'HOLDS'
```

and `:310` maps `{ USABLE: 0, 'AHEAD-BUT-ABSORBED': 1, HOLDS: 2, DIRTY: 2, BUSY: 2 }`.

⚠️ **`HOLDS`, `DIRTY` and `BUSY` all share rc 2 deliberately.** You must branch on the **verdict WORD**, never on the exit code alone. Refusing on `DIRTY` or `BUSY` would block dispatches the factory depends on.

## READ-FIRST (open each; do not work from this summary)
- `scripts/lane-runner-v3.sh` — the whole file. Specifically the slot busy-check (`:37-47`, which `continue`s on a live pid, so by the dispatch site the slot is FREE and no `<slot>.pid` exists), the main-slot lock gate (`:63-66`), the **dispatch site `:67-77`** where your guard goes, the auto-commit block (`:93-123`, note its `[ "$slot" != "main" ]` / `[ "$wd" = "$ROOT" ]` conditions — reuse that exact slot/worktree test), and the janitor reset at `:154` (**not** your concern; do not touch it).
- `scripts/lane-usable.mjs` — `inspect()` (`:295-308`), the `RC` map (`:310`), and how the verdict word is printed.
- `scripts/main-lock-gate-guard.test.sh` and `scripts/janitor-request-rejection.test.sh` — **your test's models.** Both are shell fixture tests for this same script, both already rooted in `test:ledger-guards`.
- `reviews/f1424-4-worker-arm-rates.md` — the incident, in full.

CITE BY CONTENT, NOT BY LINE (F-1310-1). Verify each returns **1** before starting:
- `grep -c "A LANE'S SAFE-DUPE PRE-FLIGHT PROTECTS ONLY ITS OWN DISPATCH" tasks/BACKLOG.md` → 1
- `grep -c "the single .git reset --hard main. is at" tasks/BACKLOG.md` → 1
- `grep -c "else verdict = 'HOLDS'" scripts/lane-usable.mjs` → 1
**If any returns 0, STOP and report — the lane drifted after dispatch. Do not "fix" it by editing the citation.**

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `git -C . status --short` → clean modulo the two churn classes above. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## SCOPE (each item separately checkable, in this order)

1. **ADD THE PRE-DISPATCH LANE-SAFETY GUARD** to `scripts/lane-runner-v3.sh`, at the dispatch site — after the worktree-dir check (`:72`) and **before** the `mv "$f" "$run"` that claims the queue file (`:75`). It must:
   - Apply to **lanes only**: skip when `[ "$slot" = "main" ]` or `[ "$wd" = "$ROOT" ]` (the art slot resolves to ROOT when `worktrees/art` is absent — reuse the exact conditions from `:93-94`).
   - Resolve the verdict via `node scripts/lane-usable.mjs "$slot"` and refuse **only when the verdict word is exactly `HOLDS`**.
   - On refusal: **leave the queue file in place** (do not `mv` it), log the slot, the master name, and the held paths, and `continue`. The next cycle re-logs it — that repetition IS the "drain me" signal and is intended.
   - **FAIL OPEN, AND THIS IS THE LOAD-BEARING SAFETY PROPERTY:** if the probe errors, times out, is unparseable, or `node`/the script is missing, **dispatch proceeds exactly as it does today.** A broken probe must NEVER stall the factory. Refuse only on a *positive* `HOLDS`. Bound the probe with a timeout so a hung `git` cannot wedge the dispatch loop.
   - Carry a comment block naming F-1522-1, the incident, and — explicitly — **why it is not a bare `main..HEAD` check (F-1027-1)**, so nobody "simplifies" it back into a brick.

2. **PROVE BOTH DIRECTIONS WITH MANUFACTURED FIXTURES (s1299/s1300 standard) — `scripts/lane-dispatch-safety-guard.test.sh`.** A green that never executes the refusal path is not evidence about the refusal. Model it on `scripts/main-lock-gate-guard.test.sh`. Required arms, each with real fixture repos/worktrees created and torn down in a temp dir (touch nothing under the real `worktrees/`):
   - **REFUSES:** a lane holding a commit main has never absorbed (`HOLDS`) → queue file **still in the queue**, not dispatched, held path named in the output.
   - **DISPATCHES (the anti-brick arm, non-negotiable):** a lane that is ahead by a commit whose content **is** already on main (`AHEAD-BUT-ABSORBED`) → **dispatch proceeds.** This is the arm that proves F-1027-1 was not re-introduced; a report without it is a **pre-declared REJECT**.
   - **DISPATCHES:** a clean `ahead=0` lane (`USABLE`).
   - **DISPATCHES (fail-open):** the probe made to fail (e.g. `lane-usable.mjs` unreadable or `node` unavailable) → dispatch proceeds.
   - Show the REFUSES arm **failing against the pre-change script** and passing after. Paste both.

3. **ROOT THE TEST WITHOUT ADDING AN NPM SCRIPT.** Append `&& bash scripts/lane-dispatch-safety-guard.test.sh` to the existing `test:ledger-guards` chain in `package.json`, beside the two shell fixture tests already there (`main-lock-gate-guard.test.sh`, `janitor-request-rejection.test.sh`). **Do NOT create a new npm script** — an un-rooted gate reds `gate-caller-audit`.

4. **REPORT THE INERTNESS HONESTLY — DO NOT TRY TO CURE IT.** The live dispatch loop is **pid 35584, started Sat Jul 11 06:10:18 2026 (27+ days)**, so it is executing the July-11 revision of this script; **7 commits / 77 insertions / 11 deletions have landed since and are all inert** until the runner is restarted. Your change joins that pile and **takes effect only on restart**. State this in your report. **Do NOT restart, kill, or signal any runner process, and do NOT edit the script in place in a way that could corrupt a live read** — write your edit normally and let git handle it; s1033's atomic-rename precedent is noted for the record, not required of you.

## FIREWALL
Touch ONLY: `scripts/lane-runner-v3.sh` (the dispatch site + its comment block), `scripts/lane-dispatch-safety-guard.test.sh` (new), `package.json` (the single `test:ledger-guards` chain append).
NO changes to: `scripts/lane-usable.mjs` (**its verdict words, `RC` map, `CHURN` set and `RUN_SURFACE` are a standing prohibition — F-1212-4, F-1419-1**; you consume it, you do not modify it) · the janitor block at `:133-168` including the `reset --hard` at `:154` · the auto-commit pathspecs at `:104`/`:121` (F-1154-1) · the main-slot lock gate at `:63-66` (F-1402-1) · the retention-law epitaph at `:169-175` (**restoring or deleting it is a law violation, not a hygiene fix** — CLAUDE.md §4.10b) · any `src/**`, `e2e/**`, `playwright.config.ts` · any other npm script.

## SELF-CHECK (name the exact commands and paste real output)
- `npx tsc --noEmit` → 0 errors. `npm run build` → green.
- `bash scripts/lane-dispatch-safety-guard.test.sh` → all arms pass; paste the arm names.
- The scope-2 manufactured evidence: the REFUSES arm **red against pre-change**, green after. Both pastes.
- `npm run test:ledger-guards` → green with your test in the chain.
- `node --test scripts/gate-caller-audit.test.mjs scripts/law-pointer-guard.test.mjs` → green (proves no un-rooted gate and no rotted law pointer — **your insertion shifts every line below it in `lane-runner-v3.sh`, and `CLAUDE.md` §4.10b cites `lane-runner-v3.sh:171` and `:169` by number**; if the guard reds on a shifted coordinate, report it — **do not edit CLAUDE.md**, that is the drain's call).
- `git diff` on `src/`, `e2e/`, `scripts/lane-usable.mjs` → **EMPTY** (paste the empty result).
- The three citation greps above, each → 1.
- Scope 4's inertness statement.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

READY-FOR-GATES + report: the guard's exact placement and conditions; all five test arms with their output; the manufactured red/green pair; whether `law-pointer-guard` survived your line shift (and by how many lines you moved `:169`/`:171`); and your confirmation that the change is inert until the runner is restarted.
