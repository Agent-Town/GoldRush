# lane-a-verifiers-gate-and-stderr — make the verifiers package GATEABLE, then fix the fault it hides
**FIRE-AUTHORED s1299 (attended review welcome)** · slot: **lane-a** · workdir: `worktrees/lane-a` (branch `lane/m3`)
CODEX: model=gpt-5.6-sol effort=medium

## ROLE
You are the lane-a runner. You work ONLY inside `env/goldrush-verifiers/` plus one new bootstrap script.
Everything else in this repo is out of bounds for this task.

## READ-FIRST (paths, in this order)
1. `env/goldrush-verifiers/goldrush/__init__.py` — the whole file, but especially `_read_sim_reply`
   (currently at `:190`; **find it by name, never by that line number — the coordinate will drift and the
   name will not**).
2. `env/goldrush-verifiers/tests/test_goldrush.py` — the existing suite and its `ScriptedDummyClient`
   pattern. Your new test joins this file.
3. `env/goldrush-verifiers/README.md` — what it currently promises about running the suite.
4. `reviews/citation-titles-rung-masters.md` is NOT relevant; do not read it. The evidence for THIS task is
   `tasks/BACKLOG.md` findings **F-1298-2** and **F-1298-3** (grep those IDs) and the s1298 handoff
   archived in `STATUS.md`.

## WHY (quoted evidence, dated)
**F-1298-3 (s1299 restatement of s1298's measurement):** the drain that merged this package could not run
its test suite at all. s1298's report: *"`verifiers` and `datasets` are absent from **every** interpreter on
this machine (system 3.14.2 **and** pyenv 3.11.13, both probed directly) and the runner's venv did not
survive; I declined to install a heavy ML dep tree inside a fire."* The runner had reported *"Fresh Python
3.10.16: 3/3 passed"* — **unreproducible by anyone since.** A mild unexplained tension was recorded without
accusation: the committed bytecode was **cpython-311** while the report named **3.10.16**, so at least one
interpreter went unreported. ⚠️ **The standing consequence is that this package has no re-runnable gate in
the factory, so every future drain of it hits the same wall.**

**F-1298-2 (s1298, and re-read at source by s1299 before authoring):** `_read_sim_reply` double-reads stderr
and leaks its reader task when GR-SIM dies without emitting a view — and the cost is that the operator loses
the real diagnostic. Traced concretely: when the stdout `readline()` completes **empty** (EOF, i.e. the sim
died), the code takes the `else` path, sets `line = ""` because `stderr_task` is not yet done, cancels only
**stdout_task**, and then calls `await process.stderr.read()`. At that moment `stderr_task` is **still
pending on the same stream**, so two readers race: whatever the pending `readline()` consumes never reaches
`detail`, and the `RuntimeError` can surface as `"GR-SIM exited before the next view: no diagnostic"` while
the diagnostic was in fact read — and thrown away — by the leaked task.

## SCOPE (numbered, each item testable)

1. **BOOTSTRAP FIRST, AND MAKE IT NAME ITS INTERPRETER.** Add `scripts/verifiers-venv.sh` (new file) that
   creates/reuses a venv for `env/goldrush-verifiers/` and installs the package with its test deps.
   Hard requirements, because the whole point is reproducibility:
   - It **prints the absolute interpreter path and `python --version`** it actually used, on every run,
     before doing anything else. F-1298-3's literal ask is "a venv bootstrap that prints the interpreter it
     used". A bootstrap that silently picks an interpreter recreates the exact ambiguity this closes.
   - It is **idempotent**: a second run must not reinstall from scratch, and must still print the interpreter.
   - It **fails loudly and specifically** if no interpreter satisfying the declared `requires-python = ">=3.10"`
     floor is available — naming which interpreters it probed. A silent fallback to a wrong interpreter is
     worse than no script.
   - The venv directory must be **git-ignored** (extend `.gitignore` if the path you choose is not already
     covered — check first; `__pycache__/` and `*.py[cod]` are already there from F-1298-1).
2. **PROVE THE GATE RUNS.** Run the existing suite through that venv and record in your report, verbatim:
   the interpreter path, the version, and the pass/fail counts. If the suite has pre-existing failures,
   **report them as a baseline and do not fix them in this task** — they are not in scope and a mixed diff
   would make the regression test below unreadable.
3. **WRITE THE REGRESSION TEST BEFORE THE FIX, AND PROVE IT RED.** Add a test to
   `env/goldrush-verifiers/tests/test_goldrush.py` that drives `_read_sim_reply` (directly or via the turn
   that calls it) against a fake process whose **stdout closes empty** and whose **stderr carries a
   multi-line diagnostic**. Assert the raised `RuntimeError` message **contains the diagnostic text**.
   ⚠️ **Run it against the UNFIXED code first and paste the failure into your report.** A test written after
   the fix proves only that the fix is self-consistent. If the test passes before your fix, **STOP and
   report** — that means the fault is not where this master says it is, and I would rather be corrected than
   obeyed.
4. **THEN FIX `_read_sim_reply`.** Cancel the loser task and **await its cancellation** (e.g.
   `task.cancel()` then `await` it under `contextlib.suppress(asyncio.CancelledError)`) so no reader is left
   alive on a stream you are about to read; include any line the stderr reader already captured in `detail`
   rather than discarding it. Keep it **async throughout** — §AP-07's law, and the easiest thing to get
   wrong. Do not restructure the function beyond what the test demands.
5. **Re-run scope 2 and 3.** New test green, previously-recorded baseline unchanged. Both counts in your report.

## TOUCH-ONLY
- `env/goldrush-verifiers/goldrush/__init__.py`
- `env/goldrush-verifiers/tests/test_goldrush.py`
- `env/goldrush-verifiers/README.md` (only to document how to run the suite via the new script)
- `scripts/verifiers-venv.sh` (new)
- `.gitignore` (only if the venv path needs a rule)

## NO — do not touch, for stated reasons
- **`src/**`, `e2e/**`, `public/**`, `functions/**`** — this package has **zero consumers** in the shipping
  game (s1298 proved it: 818 files searched, 0 hits, with a positive control). Nothing you do here may
  change that, and a diff that touches them means the task went wrong.
- **`tasks/BACKLOG.md`** — every fire edits it on every drain, so a lane holding that edit conflicts by
  construction. Findings go in your REPORT; the draining fire lands them.
- **`tasks/goals.json`, `STATUS.md`, `reviews/**`, `logs/**`** — fire-owned.
- **Any `__pycache__` / `*.pyc`** — F-1298-1 closed exactly this; they are gitignored now and must stay out
  of your commit. Check `git status` before you finish.
- **The eval dataset rows** (`goldrush/data/eval_dataset.jsonl`) — frozen for comparability.
- **The reward shape** — `secured` alone at weight 1.0, waves/gold/timeMs at weight 0. Examiner law 2: no
  shape rewards. If your fix seems to need a reward change, it doesn't; **STOP and report**.

## SELF-CHECK before you report
- [ ] `bash scripts/verifiers-venv.sh` run twice: both runs print the interpreter, second is fast (idempotent).
- [ ] Full python suite via the venv: counts recorded, interpreter recorded, baseline vs final both stated.
- [ ] The new test's **RED output against unfixed code** is pasted verbatim in the report.
- [ ] `git status` shows ONLY files from TOUCH-ONLY — **no `.pyc`, no `__pycache__`**.
- [ ] `npx tsc --noEmit` rc=0 and `npm run build` rc=0 (cheap, and proves you did not stray into `src/`).
- [ ] `node scripts/citation-title-guard.mjs` rc=0. It is **GREEN on main as of s1299 (0 offenders)** — if you
      see any non-zero count it is **yours**, not an inherited red. There is no longer a subtraction to
      perform here (F-1299-1).
- [ ] You did NOT run playwright: nothing here has a runtime surface. Say so rather than skipping silently.

**READY-FOR-GATES.** Report: the interpreter path + version, both suite runs (baseline / final), the new
test's red-before-fix output verbatim, the final diff's file list, and any finding you hit — including
anything in this master that turned out to be wrong.
