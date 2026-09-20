# f1424-4 — lane-shell worker arms (F-1424-4 measurement)

**Slice:** `f1424-4-lane-shell-worker-arms` · **branch:** `lane/m3` · **tip:** `30921094` · **base:** `f82c7156`
**Merged to main:** `c48861116e2afb6fd59ddffdf50ed61a133afbfb (archive: pruned by the A3 rewrite)` (s1426 fire)

## Verdict

**MERGED AS A STOP REPORT — no rate verdict exists, and none of the four pre-declared outcomes may be claimed.**

The task was a measurement. It did not produce its measurement. It stopped, wrote down why, and
changed nothing — which is precisely what its own firewall ordered:

> *"the instrument itself (if it is wrong, STOP and report rather than edit mid-measurement)"*

The runner held that line byte-for-byte: `e2e/town-t5-townsfolk.spec.ts`, `playwright.config.ts` and
`scripts/concurrency-class-rate.mjs` are untouched. **A STOP that obeys its firewall and leaves a
durable report is a result, not a no-op** (the master says so in its own words), and it is merged on
that basis.

## What it does

Adds two evidence files and no behaviour:

| Path | Change |
|---|---|
| `logs/suite-red-inventory.md` | +28 lines — the durable STOP report at §F-1424-4 |
| `logs/session-scratch/s1425-town-t5-worker-arms/raw/run-01-w1.json` | new, 14,695 bytes — retained raw Playwright JSON from the aborted first run |

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green**, built in 2.32s |
| `src` + `e2e` diff | **EMPTY** (verified `git status --porcelain -- src e2e`) |
| `node scripts/concurrency-class-rate.mjs --self-test` | **passed** (instrument still sane) |
| Playwright | **not run, and not required** — zero runtime surface |
| Merge classification | both paths **LANE-TOUCHED-only**; main unmoved on both since base |

The two-dot diff `main lane/m3` also lists four `D` entries (`tasks/lane-era-true-lights.md`,
`tasks/lane-gazette-controls.md`, and their two queue copies) plus `M STATUS.md` / `M tasks/BACKLOG.md`.
**These are stale-base phantoms, not deletions** — main moved after base `f82c7156` via `433c59c7`
(GG-04) and the s1426 lock commit. `git show --name-only 30921094` proves the lane touched exactly
two files.

## Findings

### F-1426-1 — the master's chosen subject cannot vary the variable it was chosen to vary (blocking the retry)

The runner reported `Running 10 tests using 2 workers` → **M=2** as a bare observation. It is more
than an observation, and the reason kills the master's central design decision.

`playwright.config.ts` contains **no `fullyParallel` key** (grep count: `0`), so Playwright's default
`fullyParallel: false` applies, and **parallelism is per-FILE, not per-test**. One spec file × two
projects = **2 schedulable jobs**, therefore **M=2 necessarily — in every shell, at every CPU count**.

The master picked the whole spec file *specifically* to avoid this trap, in its own words:

> *"the subject is the WHOLE spec file, not a `file:line`, because the spec holds 5 tests × 2 projects
> = 10 executions and a single-test subject would cap real concurrency at 2 regardless of the flag,
> silently measuring nothing"*

**The whole file caps at 2 for the same reason a `file:line` does.** The premise "10 executions ⇒ up
to 10-way concurrency" silently assumes `fullyParallel: true`, which this repo does not set. A `1,2,6`
arm sweep against this subject would have obtained 1, 2, 2 — and the two upper arms would have been
*identical runs wearing different labels*, producing a confident, meaningless "no difference" NULL.

⚠️ **The most dangerous version of this task is the one that "works":** had the harness accepted the
bare subject, the run would have completed, produced a clean table, and reported a NULL that looked
exactly like a real negative result. **The instrument bug (F-1426-2) is the only reason this defect
was caught rather than published.** That is luck, and it should be recorded as luck.

**The successor master must therefore use a MULTI-FILE subject** (≥6 spec files to reach the 6-worker
arm §3.1 measured), or pass `--fully-parallel`. It must also **report the reporter's `Running N tests
using M workers` header per arm and abort if M does not track the requested arm** — the existing
scope-2 stop only fires on `M=1`, so it would not have caught this.

### F-1426-2 — the harness accepts a subject shape at the door that it can never satisfy at the assert (blocking the retry)

Confirmed by reading, not by trusting the report:

- `normalizeSubject` (`scripts/concurrency-class-rate.mjs:121-126`) tests
  `/^[^/]+\.spec\.ts(?::\d+)?$/` — the `(?::\d+)?` makes the line number **optional**, so a bare file
  is **accepted**.
- `collectExecutions` (`:162`) builds every observed key as `` `${normalizeSubject(...)}:${spec.line}` `` —
  **unconditionally line-qualified**.
- `assertComplete` (`:183-186`) compares those keys against the **raw** subject strings.

So a bare-file subject produces `missing = [both bare keys]`, `extras = [all 10 line-qualified rows]`,
`executions=10/2` — deterministically, on the first run, forever. The accept-path and the assert-path
disagree about what a subject is.

⭐ **The instructive part: the harness's own `--self-test` passes.** It still passed for me on the
merged tree. Its fixture (`:304`) uses `'e2e/a.spec.ts:4'` — a `file:line` subject — so **the
self-test's coverage is narrower than the contract its callers are invited to use.** A green
self-test certified an instrument that could not perform the job it was pointed at. This is the
"passing oracle stubs the wrong failure" shape, and it is why the master's *"the harness self-tests,
therefore reuse it"* reasoning — correct in spirit, and correct about not writing a second harness —
did not protect this run.

### F-1426-3 — repeated worker arms are silently de-duplicated (non-blocking, but it shapes the retry)

`:155` returns `workers: [...new Set(workers)]`, so the master's requested `1,2,2` collapsed to `1,2`
and the announced plan became `run 1/16` rather than the intended 24. Any successor that wants a
repeated arm (e.g. the default arm run twice to estimate within-arm noise) **cannot express it through
`--workers`** and must use `--runs` instead. Not a defect — an undocumented contract, now documented.

## What is NOT concluded

- **F-1424-4 remains entirely open.** The lane-shell-vs-fire-shell question has *no* new evidence.
  The one thing gained is that the lane shell's default for a single-file subject is 2, which is a
  fact about Playwright's scheduler, not about the lane shell.
- **The scope-2 VOID (`M=1`) stop did not fire** and this was not it. M was 2.
- **No `town-t5` flakiness claim is supported or refuted** by this run.

## Standing prohibitions carried forward

🚫 Do not re-queue this master unchanged — its subject is unmeasurable by construction (F-1426-1).
🚫 Do not "fix" F-1426-2 by making the master pass a `file:line` subject — that caps concurrency at 2
and re-opens F-1426-1 from the other side.
🚫 Do not edit `e2e/town-t5-townsfolk.spec.ts` or pin `workers` in `playwright.config.ts` (the first
destroys the measurement; the second taxes every lane and reds `scripts/fire-shell-serialisation.test.mjs`).
