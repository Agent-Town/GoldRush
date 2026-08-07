# f1424-4-worker-arm-rates — the lane-shell worker-arm RATE for town-t5 approach-barks

- **Slice:** `tasks/lane-a-f1424-4-worker-arm-rates.md` (FIRE-AUTHORED s1519, F-1519-2)
- **Branch:** `lane/a` → orphaned, rescued as `save/f1424-4-worker-arm-rates-s1522`
- **Tip gated:** `ee61f25ee4dd0a4f7bb1bb4fb741ef4a1756988a` (runner auto-commit, 2026-08-07T12:39:32+07)
- **Drained:** s1522, 2026-08-07
- **Measurement tree (runner's own):** `3c06cc21353735813c053b01dce8926b3fa582a4`

## VERDICT: MERGE — and it is only merge-able because the commit was rescued from deletion first.

## ⚠️ CUSTODY INCIDENT — THIS SLICE WAS ORPHANED BEFORE IT WAS EVER GATED (F-1522-1)

This is the headline, not a footnote. The evidence below is sound; it very nearly did not exist.

Sequence, reconstructed from run logs and `git`:

| When | Event |
|---|---|
| 11:17:03 | runner dispatches `lane-a-f1424-4-worker-arm-rates` on lane-a |
| 12:39:32 | run completes; runner auto-commits `ee61f25ee` to `lane/a` (28 files, 39,847 insertions) |
| 12:39:43 | runner **re-dispatches the same master**; its pre-flight correctly **STOPS** — "lane/a contains undrained commit ee61f25ee, not present on main" |
| 12:41:13 | runner dispatches a **different** master (`lane-fd1-front-desk-card`) into the same lane; that pre-flight **resets lane/a to main**, orphaning `ee61f25ee` |
| 12:46 | s1522 finds `lane/a` reading `ahead=0 behind=0`, and `ee61f25ee` on **no branch and not on main** |

**The safe-dupe pre-flight worked perfectly — and then was bypassed by the very next dispatch.** The protection is per-task, so the task that STOPPED protected the work, and the *next* task, which had never heard of it, reset the lane out from under it. Mistake #2 (the Reset Massacre) in its exact original shape, one dispatch later.

The commit survived only as a reflog-reachable object. It was rescued to `save/f1424-4-worker-arm-rates-s1522` as this fire's first act, before the lock was even taken. Had a `git gc` run in that window, **24 Playwright runs / 387,484 Codex tokens / 82 minutes of measurement** would have been unrecoverable, and the board would have shown a "done-move" for work that no longer existed anywhere.

See F-1522-1 below for the corrective.

## What it does

Replaces a one-observation-per-arm **anecdote** about lane-shell test flakiness with a matched-arm **rate**, and adds the assertion that makes such rates trustworthy at all.

1. **`scripts/concurrency-class-rate.mjs` (+12 lines)** — asserts per run that the reporter's *obtained* worker count `M` equals the *requested* arm, throwing with run number, requested and obtained on mismatch. Previously the script recorded `configuredWorkers`/`actualWorkers` and checked neither, so an arm could silently collapse to the scheduling ceiling and still be published as a "6-worker" result. This is the gate the ledger demanded verbatim: *"a multi-file subject of ≥3 spec files, plus a per-arm assertion that the reporter's obtained `M` tracks the requested arm."*
2. **`logs/session-scratch/s1519-f1424-4-worker-arms/` (27 files)** — the complete 24-run evidence set: `rates.md`, `rates.json`, `runs.jsonl`, and 24 raw per-run reports.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** (re-run by s1522 on the merged tree) |
| `npm run build` | **green, 1.13s** (s1522, merged tree) |
| `node scripts/concurrency-class-rate.mjs --self-test` | **8 arms pass** — the 7 pre-existing plus the new `obtained-workers mismatch rejection arm passed (run 8: requested 6, obtained 2)` |
| `node --test goal-tracker + gate-caller-audit + fire-shell-serialisation` | **23 tests / 23 pass / 0 fail** |
| `grep -c fullyParallel playwright.config.ts` | **0** — confirms per-FILE scheduling, so the ceiling arithmetic (3 files × 2 projects = 6) holds |
| Firewall diff vs main — `playwright.config.ts`, `e2e/`, `src/` | **EMPTY** (measured, not claimed) |
| Citation greps (3) | **1 / 1 / 1** |
| Total changed paths | **28** = 27 evidence files + `scripts/concurrency-class-rate.mjs` |

**Boot probe — deliberately not run, with the reason stated rather than the gate quietly thinned.** The firewall diff proves `src/` and `e2e/` are **byte-identical to main**, so this merge cannot change any runtime behaviour; a boot probe would be measuring main, not this slice. Build green is the meaningful sanity check and it passed.

### The measurement itself (runner's, on `3c06cc213`)

**Scope 1 — the sweep was priced before it was run**, as the master required: direct timing probes of **204 s / 157 s / 142 s** for arms w=1/2/6, projecting `8 × (204+157+142)` = **4,024 s ≈ 67 min**, below the ~3 h pre-licensed STOP. So scope 3 ran rather than stopping.

**Scope 3/4 — `e2e/town-t5-townsfolk.spec.ts:203` (approach-barks), combined across projects:**

| Arm | Failures / executions | Rate |
|---|---:|---:|
| w=1 | **6/16** | 37.5% |
| w=2 | **6/16** | 37.5% |
| w=6 | **12/16** | 75.0% |

Per project: desktop 3/8, 1/8, 5/8 · mobile 3/8, 5/8, 7/8.

**Verdict (a): full lane-shell parallelism increases the failure rate — but contention is not the only cause.** The w=1 arm fails **37.5% of the time with a single worker**, which no amount of serialisation can explain. This is the genuinely useful half of the result and it settles the original F-1424-4 discrepancy (lane 9/10 nondeterministic vs fire 5/5 green at `--workers=1`): the test carries a **baseline flake that contention amplifies**, so neither the "it's just concurrency" nor the "it's just a flaky test" reading was correct alone. The runner notes the desktop arm is noisy (3/8 → 1/8 → 5/8), so this is a high-contention effect rather than a smooth dose-response — stated honestly rather than smoothed.

**Every other subject row is 0/8 at every arm**, except three isolated 1/8–2/8 singletons at w=6 (`town-t3-board:156` desktop, `town-t5:170` desktop, `town-t6-surfaces:102` mobile, `town-t6-surfaces:155` desktop). The failure is specific, not ambient.

**The new assertion held on all 24 runs** — every run obtained exactly the M it requested. It therefore never fired in production, which is why the manufactured-defect self-test arm matters: the s1299/s1300 standard, met. The runner pasted both states — `ReferenceError: assertActualWorkers is not defined` before, the passing rejection arm after.

**`actualWorkers` survived `f1510-3`'s metadata change** — the hazard the master flagged. Printed object: `{"revision":"3c06cc213…","dirty":true,"actualWorkers":6}`. All three keys coexist; no fallback to `configuredWorkers` was needed or taken.

**Inventory neighbours genuinely ran** rather than being silently skipped: `town-t3-board` 12 explicit `ok:true` records, `town-t6-surfaces` 10.

## Merge classification

- **Base:** `9808f294` (the F-1519-2 dispatch commit). Main moved **20 commits** during the run.
- **Method:** cherry-pick onto current main in detached worktree `gate-s1522` (§3.0b custody — undecided content never entered main's working tree). **Zero conflicts.**
- **Per-file:** all 28 paths **LANE-TOUCHED only**; 27 are new files under a session-scratch directory main has never had, and `scripts/concurrency-class-rate.mjs` was **MAIN-UNMOVED** since the base (verified: the cherry-pick applied clean).
- **Gated on the MERGED tree**, not the lane tip.

## Findings

**F-1522-1 — A LANE'S SAFE-DUPE PRE-FLIGHT PROTECTS ONLY ITS OWN DISPATCH; THE NEXT TASK INTO THAT LANE RESETS IT ANYWAY. [BLOCKING-CLASS, corrective owed]**
Measured above. The pre-flight that STOPPED at 12:39:43 and the pre-flight that reset the lane at 12:41:13 were reading the same branch 90 seconds apart and reached opposite conclusions, because **the protection is a clause in each master, not a property of the lane.** Any master whose pre-flight text is older, weaker, or simply differently worded re-opens Mistake #2 in full. `lane-fd1-front-desk-card` was authored 2026-08-05 (`44b1a7cf1`), before several of the current pre-flight hardenings.
**This is not curable by editing one master** — that is the instance, not the class. The cure belongs in `scripts/lane-runner-v3.sh`, which is the one place every dispatch passes through: refuse to dispatch into a lane whose branch holds commits absent from main, regardless of what the task file says. `scripts/lane-usable.mjs` already computes exactly this verdict (`HOLDS`, rc 2) and is already trusted by fires; the runner does not consult it.
**Recommended:** a runner-side pre-dispatch call to `lane-usable.mjs`, refusing on rc 2. Owner-visible because it touches the runner Robin runs in his own Terminal.

**F-1522-2 — `rates.md` renders its schedule as `[object Object]`. [NON-BLOCKING, cosmetic]**
The generated report's Schedule line stringifies an array of objects: `[object Object],[object Object],…` ×24. The failure-rate table below it is complete and correct, and `rates.json` carries the structured truth. The runner **correctly reported this rather than fixing it** — it was outside the task's firewall. Cheap one-line fix in `writeSummary` whenever that script is next opened; not worth a task of its own.

**F-1522-3 — `town-t5-townsfolk.spec.ts:203` is a 37.5%-baseline flake and should be treated as one. [NON-BLOCKING, informational]**
Now that the rate exists, the honest reading is that this test fails more than a third of the time **even fully serialised**. The runner notes the failing assertion is the helper poll at `:104`, not the declaration coordinate at `:203` — which is where a fix would have to look. Recording it here so the next fire that sees this spec red does not re-derive the rate; it is measured, in `logs/session-scratch/s1519-f1424-4-worker-arms/`.

## Ledger

- Goal leaf `f1424-4-worker-arm-rates`: `building` → `merged`, with mergeHash.
- `tasks/BACKLOG.md`: F-1424-4 row closed with the rate.
- No gazette item — factory-internal harness measurement, no player-visible change (GZ-01 filter law).
