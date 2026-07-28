# Review — `lane-c-power-budget-instrument-control`

- **Slice:** F-1170-1 — give `test:power-budget` an in-process reference loop so a descheduled process reports DEGRADED instead of a false PowerGraph regression.
- **Branch / tip:** `lane/e2-arsenal` @ `18e132f8`
- **Base:** main @ `4d564bf5`
- **Authored + drained:** s1170, 2026-07-28 (authored 14:38, picked up 14:37:26, reported 14:41)
- **§3.0 `drain-block-check`:** **CLEAR** — `[factory-power-budget-instrument-control] status="queued"`, run as the first command.

## Verdict: **ACCEPT — STOP at scope 1(d), which is the master's declared full-success outcome. The remedy is REFUTED and must not be built.**

The task's scope 1 was written as a measure-first gate that could cancel the task, because the whole remedy rested on one assumption nobody had ever measured: that a fixed-cost reference loop degrades **proportionally** with the PowerGraph solve. **It does not.** The runner measured it, wrote the verdict sentence before touching `scripts/`, and stopped.

## The measurement (10+10 interleaved pairs, normal vs `taskpolicy -b`)

| arm | n | reference median | PowerGraph p95 median | PG/ref ratio | per-run ratio band |
|---|---:|---:|---:|---:|---|
| normal QoS | 10 | 0.512 ms | 0.439 ms | **0.857** | 0.729–1.132 |
| `taskpolicy -b` | 10 | 1.599 ms | 2.683 ms | **1.678** | 1.327–3.220 |

**Background QoS inflated the reference by 3.12× but the PowerGraph solve by 6.11×.** The arm-level ratio moves by **1.96×** and **the per-run bands do not overlap** (normal tops out at 1.132; degraded bottoms out at 1.327).

⇒ **A threshold tuned to label the deterministic background arm "degraded" would also swallow a genuine PowerGraph-only cost regression of comparable size.** That is precisely the failure mode scope 3's mutation control existed to catch — and scope 1 caught it one stage earlier, for a tenth of the cost.

## Why the numbers are trustworthy (checked by me, not accepted on report)

- **The reference loop cannot have been JIT-eliminated** — the one artifact that would have manufactured this exact result. It is a data-dependent LCG (`value = (Math.imul(value ^ index, 1_664_525) + 1_013_904_223) | 0`) whose accumulator is **returned and consumed**: warm-up at `:54` and `checksum = (checksum + sample.value + index) | 0` at `:59`. A 0.512 ms normal median confirms it does real work, in the same order of magnitude as the 0.439 ms solve, exactly as the master required.
- **Arms were interleaved, not blocked** — order is a confound on a box whose load drifts, and the master required s1161's method.
- The mechanism is coherent rather than mysterious: the two workloads have different **shapes** (the solve allocates and touches a large wire graph; the reference is pure register arithmetic), and background QoS penalises them differently. **That is the general reason no fixed reference can proxy for the solve** — which makes this a refutation of the approach, not of one implementation of it.

## Evidence

| Gate | Result |
|---|---|
| Merged diff | **zero `src/`, zero `scripts/`** — exactly 2 files, 132 insertions, both evidence |
| `scripts/check-power-graph-budget.mjs` | **unchanged** — verified in the diff; the guard was correctly not edited |
| `POWER_GRAPH_LIMITS.solveBudgetMs` | **untouched at 0.5** — the firewall held |
| Scopes 2–5 | correctly **cancelled**, not faked: no escape hatch was added, so mutation control / cure-rate runs / class sweep are inapplicable |

No gate battery was run against this merge and none is owed: the diff contains **no executable product code** — a scratch probe and a markdown report. There is no runtime surface to drive.

## Findings

### 🔺 F-1170-4 — F-1160-2 IS NOW A HARDER PROBLEM THAN ITS LEDGER ENTRY CLAIMS, AND BOTH PUBLISHED REMEDIES ARE DEAD

BACKLOG:193 offers two cures. **Both are now refuted, each by the fire that tested it:**
1. **min-of-3** — s1161: works on transient steal, **fails 4/4 under systematic deprioritisation**.
2. **in-process reference loop** — this fire: **the ratio is not stable across arms**, so it cannot discriminate without swallowing real regressions.

⇒ **Do not author a third attempt from the same ledger entry without a new mechanism.** What is now known, and should constrain any successor:
- The degradation is a **mixture** (some fraction of the 160 samples served slow), so p95 needs ≥9 degraded samples to move — never a single blip.
- **Any in-process CPU proxy inherits this problem**, because proxy and subject degrade at different rates. A successor needs either an **out-of-band** signal (scheduler/QoS state, `getrusage` involuntary context switches, `loadavg` read at assert time) or a **statistical** approach that does not require a proxy at all.
- ➡️ **Cheapest honest option not yet tried, and the one I would take next: report rather than assert.** Have the guard emit its p95 and let `run-guards.mjs` treat a single over-cap as a **warning with a re-run**, failing only on repeat. That needs no proxy and no environment model. **It is a `run-guards.mjs` change, which this task firewalled off** — so it is a new master, not a revision of this one.

⚠️ **Left explicitly open, and it is the real question:** whether a guard asserting a **wall-clock p95 inside a shared, permanently-loaded box** can be made honest at all, or whether this measurement belongs in a quiet-box context (the `calibrate-suite-workers-v2` blocker names the same underlying condition — ~2.0–2.2 cores of owner-side background load before the factory starts).

### ⓘ Non-blocking
- The normal-arm PowerGraph p95 here (0.373–0.627, median 0.439) is **wider and higher** than my own 14:33 baseline (0.352–0.405, median 0.374, 0/20) — expected, because this probe interleaves `taskpolicy -b` children that load the box. Pair 1 at **0.627 would have red the live guard**, which is a sixth same-day instance of F-1160-2 and further evidence for F-1170-3.
- The task was authored, queued, executed, and drained **inside one fire** (14:38 → 14:41 → drained). The measure-first STOP cost ~135k tokens and killed a remedy that two prior fires had recommended on argument alone.
