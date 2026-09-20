# F-1591-1 frame-supply cliff measurement

## Verdict

**PARTIALLY CONFIRMED / COULD-NOT-ARM.** Across all seven counted probe runs, no sampled interval exceeded the predicted `0.05` seconds of town elapsed per presented frame. The three unloaded controls ran at about 120 fps and consumed 3.78–3.79 s of wall time. However, the prescribed N=2/4/8/16 CPU loads never reduced frame supply below 20 fps: every load run remained near 120 fps with an 8.34–8.37 ms mean frame interval. The clamp-engaged regime, `81 / fps` tracking, and the <2.7 fps timeout cliff were therefore not measured on this machine and are not confirmed by this evidence.

## Pre-flight

- `lane/b` had no ahead commits and no uncommitted changes; no evidence churn needed discarding.
- Both required `Loop.ts` sentinels, the beauty-town 30 s sentinel, and the predecessor refutation sentinel were present exactly as required.
- `npm install --no-audit --no-fund` returned rc=0 (`up to date in 167ms`).
- The pre-edit `npm run build` returned rc=0: TypeScript passed, Vite 8.0.13 built 2,184 modules in 1.56 s, and asset-diet passed.
- The required post-build cleanliness line was empty.

## Probe

`artifacts/f1591-1-frame-supply-cliff/probe.mjs` copies the subject test's profile seed and Enter Town flow, then records `(wallMs, frame, elapsed)` about every 250 ms until `elapsed > 4` or 30 s. Each JSON file contains the complete poll trace, page errors, and derived summary. Failure to publish `window.__GR_TOWN_DIAGNOSTICS__` aborts with an explicit `PROBE-ABORT` error.

Two simultaneous-browser smoke traces are retained as `discarded-parallel-1.json` and `discarded-parallel-2.json`; they are excluded from every table because Arm 0 requires unloaded sequential runs. The three controls below were rerun sequentially.

## Arm 0 — unloaded clamp-law controls

| Repetition | Mean Δelapsed/Δframe | Max Δelapsed/Δframe | Achieved fps | Wait wall time | Timed out? |
|---:|---:|---:|---:|---:|:---:|
| 1 | 0.008368 | 0.008925 | 119.47 | 3.792 s | No |
| 2 | 0.008351 | 0.008607 | 119.78 | 3.782 s | No |
| 3 | 0.008351 | 0.008645 | 119.95 | 3.793 s | No |

All sampled ratios were below `0.05`; no Arm 0 sample falsified the cap. At these frame rates the loop is above the 20 fps clamp threshold, so the observed ratios correctly follow the real ~8.35 ms frame delta rather than pinning at 0.05.

## Arm A — graded CPU load

An Arm A repetition counts as armed only when its measured mean frame interval exceeds 50 ms (fps <20). None did.

| N | Mean Δelapsed/Δframe | Max Δelapsed/Δframe | fps | Mean frame interval | Measured wait | `81 / fps` prediction | Timed out? | Armed? |
|---:|---:|---:|---:|---:|---:|---:|:---:|:---:|
| 2 | 0.008388 | 0.009167 | 119.97 | 8.335 ms | 3.784 s | 0.675 s | No | **No** |
| 4 | 0.008370 | 0.008936 | 119.54 | 8.366 ms | 3.781 s | 0.678 s | No | **No** |
| 8 | 0.008352 | 0.008621 | 119.77 | 8.349 ms | 3.791 s | 0.676 s | No | **No** |
| 16 | 0.008370 | 0.008900 | 119.63 | 8.359 ms | 3.837 s | 0.677 s | No | **No** |

The `81 / fps` column is shown as requested, but it only predicts wall time when the 0.05 clamp is engaged. These four repetitions were observably unarmed, so their mismatch with that column is not a refutation and is not reported as a null result. No N drove the wait beyond 15 s, and no N armed the clamp. The task's stronger instruction says `COULD-NOT-ARM and stop`; accordingly, the otherwise requested three extra N=16 repetitions were not run.

Each hog was killed by its recorded spawn PID after its repetition. Final check:

```text
ps -p 31607,31608,33936,33937,33941,33942,35094,35095,35096,35097,35098,35099,35100,35101,35667,35668,35669,35670,35671,35672,35673,35674,35675,35676,35677,35678,35679,35680,35681,35682 -o pid=,stat=,command=
<no output>
rc=1
```

All spawned load processes were dead at the end.

## Arm B — batch position

| Arrangement | Repetitions | First-test duration | rc | Result |
|---|---:|---:|---:|---|
| Alone | 2 | — | — | NOT RUN |
| Sixth in multi-arm battery | 2 | — | — | NOT RUN |

Arm B was not run because Arm A reached the task's explicit `COULD-NOT-ARM and stop` condition. No sixth-arm arrangement or result is claimed.

## What the evidence supports

The evidence supports the source-derived upper bound in the tested healthy-frame regime: all observed Δelapsed/Δframe samples stayed below 0.05. It also establishes that up to 16 prescribed synthetic CPU hogs cannot engage the clamp on this machine, bounding the suspected failure to a frame-supply condition heavier or structurally different from this load.

The evidence does **not** show that clamped elapsed advances at 0.05 per frame, that an armed wait tracks `81 / fps`, that the wait crosses 30 s below 2.7 fps, or that sixth-in-battery position reaches the cliff. No cure is selected or shipped.

Only the probe, raw traces, and this report changed. No executable product byte changed, so tsc/build/suites are provably unaffected beyond the recorded pre-flight build; no unrun suite is claimed, and `test:node-guards` is not owed.

---

## DRAIN VERDICT — s1592 (2026-08-09)

**MERGED** as `5936ec48ec41568cd5ab79f6beb324f879d0ab9d`. Base: `main` at `435ce0d06`. Branch `lane/b` was `ahead=1 behind=3`, `tracked-dirt=0 untracked=0`; all 11 paths classified **LANE-ONLY** by `scripts/lane-usable.mjs` (nothing to graft, no MAIN-MOVED file, no conflict).

**§3.0** `drain-block-check` → `CLEAR` (leaf `f1591-1-frame-supply-cliff`, was `status="queued"`).

### Evidence

| Gate | Result |
|---|---|
| `git diff --stat main...lane/b` | 11 files, **+1087 / -0**, entirely `artifacts/` + `reviews/` |
| `npx tsc --noEmit` | **clean** (merged tree) |
| `npm run build` | **rc=0**, 2,184 modules, built in 1.96 s, asset-diet passed |
| Product bytes changed | **zero** — no `src/`, no `e2e/`, no `scripts/` |
| `test:node-guards` | **not owed** — §3's path trigger (`src/sim`, `src/systems`, `src/entities`) is untouched |
| Page/console errors in artifacts | `errors: []` in every run |

The runner's central structural claim was **verified, not inherited**: the diff is additive evidence only, so tsc/build cannot be affected by it, and both were run on the merged tree anyway.

Both spot-checked artifacts transcribe **exactly** into the report's tables (`arm-0-1`: mean 0.008368, max 0.008925, fps 119.47, 3.792 s; `arm-a-n16-1`: mean 0.008370, max 0.008900, fps 119.63, 3.837 s). No table row was found overstated.

**The verdict is accepted as written.** `COULD-NOT-ARM` was a legitimate outcome declared in advance by the master, the runner honoured its own arm criterion instead of reporting an unarmed run as a null result, and it correctly declined to run Arm B once the stop condition was reached. It shipped no cure, by design.

### F-1592-1 — THE ARM A LEVER IS STRUCTURALLY INCAPABLE OF ARMING THE CLAMP: THE LOOP IS VSYNC-PINNED AT 120 Hz

The report says the N=2/4/8/16 loads "never reduced frame supply below 20 fps" and leaves it there. The artifacts say something much stronger, and it is the reusable half of this run.

Across **all nine** recorded runs — 3 unloaded controls, 4 graded CPU loads (N=2→16), and 2 discarded runs that had **an entire second chromium** competing:

| | fps range | mean frame interval range |
|---|---|---|
| All 9 runs | **119.42 – 119.97** (spread 0.46%) | **8.335 – 8.374 ms** (spread 0.47%) |

The loaded runs are not merely "not slowed" — they are **statistically indistinguishable from the unloaded controls**, and so is the second-browser case. `8.33 ms = 1/120 s` exactly. **The render loop is pinned to a 120 Hz display refresh, not to CPU availability.**

That reframes the null result. The arm criterion needs a frame interval **> 50 ms**, which is **6× the vsync budget**. `requestAnimationFrame` delivery is display-driven, and the main thread is evidently using a small fraction of its 8.3 ms budget, so *external* CPU hogs contend for cores without ever pushing main-thread frame time past vsync. **Adding more hogs cannot cross a 6× gap** — N=32 or N=64 would return the same table.

⚠️ **This is F-1590-1's lesson one level deeper.** s1591 did the hard part right: it defined arming as an **observable** (mean frame interval > 50 ms) rather than assuming it. That observable is exactly what stopped this run from reporting a false null. But the *lever class* it chose could not move that observable — so the master proved its subject, stated its arm condition honestly, and still could not arm. **Defining the arm proof correctly saved the run; it did not make the lever work.**

➡️ **The lever must inflate MAIN-THREAD frame time directly, not compete for cores.** The candidate is CDP `Emulation.setCPUThrottlingRate` via `page.context().newCDPSession(page)`.

### F-1592-2 — THE ARTIFACTS RECORD NO EVIDENCE THE LOAD WAS LIVE (non-blocking)

`probe.mjs` does not spawn the hogs; the runner spawned them externally, and the artifact JSON has **no `load` field** — no N, no CPU sample, no liveness check during the run. The only evidence the hogs existed is the report's prose plus a `ps` showing them **already dead**.

This does not weaken the merged verdict: the arm criterion is measured *from the artifact*, and an unarmed run yields `COULD-NOT-ARM` whether or not the hogs ran. But it does not support the report's stronger sentence — *"up to 16 prescribed synthetic CPU hogs cannot engage the clamp on this machine"* — which requires the hogs to have actually been running. Given F-1592-1 that sentence is probably true for a different and better reason, but as recorded it is prose-backed, not artifact-backed.

**Cure for the next probe: record the arming lever's own state inside the artifact** (N, spawn PIDs, and a during-run liveness sample), so the lever is evidenced by the same file that evidences the subject. Non-blocking.
