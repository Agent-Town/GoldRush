# Task lane-c-power-budget-instrument-control: stop `test:power-budget` from blaming PowerGraph for the box — give it an in-process reference loop so a descheduled process reports DEGRADED instead of a false regression (lane-c, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1170, 2026-07-28. Authored from **F-1160-2** (`tasks/BACKLOG.md:193`), its s1161 re-derivation on the same line, and **a third independent measurement taken by s1170 this fire** (numbers below, instrument `logs/session-scratch/s1170-power-budget-rate.mjs` + `s1170-degraded-arm.mjs`, both committed). No new scope invented; the remedy is the one s1161 already argued for, with the gate re-based because **s1160's stated gate is not runnable** (see "Why", point 3).

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `scripts/check-power-graph-budget.mjs` — **all 45 lines**. This is the entire subject; it is short, read every line.
- `src/systems/PowerGraph.ts:160-170` (`POWER_GRAPH_LIMITS`, incl. `solveBudgetMs: 0.5` at `:165` — **the number you may never touch**), `:340-355` (where `lastStepMs` is set), `:915` (`nowMs()` = `performance.now()` — the clock your reference loop must share)
- `scripts/run-guards.mjs:1-60` — **read the header comment.** It exists because a guard talked its way to a green. Your change must not make that possible again.
- `tasks/BACKLOG.md:193` — F-1160-2 in full, including the s1161 re-derivation that **refuted one third of its own diagnosis**. Read what failed, not just what was recommended.
- `logs/session-scratch/s1170-power-budget-rate.mjs` and `logs/session-scratch/s1170-degraded-arm.mjs` — the two instruments whose numbers this task is built on. You will re-run both.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**The dupe is PRE-PROVEN for you — do not spend budget re-deriving it.** s1170 verified at 2026-07-28T14:3xZ: `lane/e2-arsenal` is 1 ahead at `e9a1eecf` (`runner(lane-c): lane-c-asset-diet-skip-duty-split.md`), and that content **is on main** — s1169 landed it by path-scoped graft as `7c28335c`. `git diff --stat main lane/e2-arsenal` lists **only deletions of files main gained later** (the E9 art raws, both s1169 reviews, the lane-a master) plus older copies of `STATUS.md`/`logs/*` — i.e. **main is strictly ahead and the lane holds nothing unmerged**. Textbook SAFE DUPE → reset and proceed. Re-run that one `git diff --stat` to confirm nothing changed since, then move on.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated and measured)

`test:power-budget` is **guard 2 of 8** in `scripts/run-guards.mjs` — the battery every fire cites as *"guards 8/8"*. The guard runs the PowerGraph fixed-step solve 224 times, keeps the last 160 `lastStepMs` samples, and asserts their **p95 ≤ `solveBudgetMs` (0.5 ms)** from **one** run (`check-power-graph-budget.mjs:38-43`). It is a pure wall-clock CPU measurement with no I/O.

**1. It cannot tell "the code got slower" from "this process was descheduled", and it blames the code.** Its failure message is `power graph fixed-step p95 2.438ms exceeded 0.500ms` — a sentence *about the game* that is false whenever the box was the problem. s1160 named this; s1161 confirmed the kind while refuting the specific mechanism (E-core placement is **not** the slow mode — the real shape is a *mixture*, some fraction of the 160 samples served slow, which is why p95 needs ≥9 degraded samples to move at all).

**2. The rate is a property of the BOX, not of the guard — three measurements, three answers.** Quote it with its load or not at all:

| Fire | Arm | n | over cap | body (ms) | median | loadavg |
|---|---|---:|---:|---|---:|---|
| s1160 | default QoS | 20 | **4 (20%)** | 0.368–0.496 | 0.416 | ~6.9–7.6 |
| s1161 | default QoS | 12 | **1 (8%)** | 0.338–0.371 (+1 outlier 0.529) | 0.346 | 6.91 |
| **s1170 (this fire)** | default QoS | **20** | **0 (0%)** | **0.352–0.405, no outlier** | **0.374** | **7.69** |
| s1161 | `taskpolicy -b` | 12 | **12 (100%)** | 1.628–1.846 | — | 6.91 |
| **s1170 (this fire)** | **`taskpolicy -b`** | **6** | **6 (100%)** | **1.707–3.036** | **2.438** | **7.69** |

Pooled default-QoS across the three fires: **5/52 ≈ 9.6%**. **s1170's 0/20 does NOT mean the defect is gone** — against a true ~8% rate, P(0 in 20) ≈ 0.19, an entirely ordinary draw. Do not read it as an all-clear, and do not write one.

**3. THIS IS WHY THE TASK EXISTS IN THIS SHAPE: s1160's stated gate cannot be run.** BACKLOG:193 says *"re-run the old script n≥20 BEFORE editing …, then n≥20 after … the fix is proven by the over-cap count going 4/20 → 0/20"*. **The before-arm already reads 0/20** (s1170, above). You cannot prove a fix by driving 0/20 to 0/20, and waiting for an ~8% flake is not a gate. **So this task gates on the DETERMINISTIC arm instead: `taskpolicy -b` reproduced 12/12 (s1161) and 6/6 (s1170) — a 100% reproduction of the exact failure mode.** That substitution is the one design decision s1170 made and it is the reason the remedy is now provable.

**4. Why fix rather than tolerate.** `test:power-budget` sits inside the battery s1146 proved had been *red for a day while nobody ran it* and s1159 fought back to 8/8. **A guard that reds at random is how a battery gets trained out**, and every handoff writing "guards 8/8" is reporting a *sample*, not a state.

## Scope

### 1. MEASURE FIRST — and this scope may CANCEL the whole task (STOP gate)

The entire remedy rests on one **untested assumption**: that a fixed known-cost reference loop, run in the same process, **degrades proportionally** with the PowerGraph solve when the process is descheduled. If it does not, the discriminator is invalid and no amount of implementation saves it.

(a) Write a scratch probe (in `logs/session-scratch/`, **not** in `scripts/`) that, in ONE process, measures both: the existing PowerGraph p95, and a fixed-cost reference loop timed with the same `performance.now()` clock. **The reference must be immune to being optimised away** — accumulate into a value you then consume (print or assert on it); a pure arithmetic loop whose result is discarded can be eliminated by the JIT and would silently measure nothing (`a-probe-that-executes-nothing-reports-zero`). Size it so a healthy run lands in the same order of magnitude as the ~0.37 ms solve, not 1000× off.

(b) Run it **interleaved** across both arms (default QoS and `taskpolicy -b`), **n≥10 per arm** — interleaved, not blocked, because box load drifts and **order is a confound** (this is s1161's own method; copy it).

(c) Report a table: per arm, the reference median, the PowerGraph p95 median, and **the ratio** PowerGraph/reference.

(d) **THE VERDICT SENTENCE, written before any edit to `scripts/`:**
- If the ratio is **stable across arms** (degradation inflates both by comparable factors) → the discriminator works. **PROCEED to scope 2**, and state the observed ratio band you will build the threshold from.
- If the ratio is **not stable** — the reference barely moves while the solve explodes, or vice versa — → **STOP THE TASK.** Write the table, state that the reference-loop approach is refuted by measurement, and report. **A STOP here with a populated table is declared a FULL SUCCESS of this task**, not a failure: it kills a remedy two fires have now recommended on argument alone, and that is worth more than a shipped guess.

### 2. The fix (only if 1(d) says PROCEED)

Edit `scripts/check-power-graph-budget.mjs` so that when the p95 exceeds the cap it **discriminates before it accuses**:

- Measure the reference loop in the same process, in the same run.
- **Retry a bounded number of times** (you choose n from your scope-1 data; justify it) — the degradation is usually transient, and a retry that comes back healthy should simply pass.
- If the p95 is over cap **and** the reference is degraded by a comparable factor across all retries → exit **0** with a single loud, unmissable line naming both numbers, e.g. `power-graph-budget: ENVIRONMENT DEGRADED — p95=2.438ms ref=<x>ms (ref baseline <y>ms); not a PowerGraph verdict`.
- If the p95 is over cap **and** the reference is healthy → **FAIL exactly as today**, with today's message shape. This is a real regression and must still red.
- Healthy pass path: unchanged in shape (`power-graph-budget: PASS p95=…`).

**State the trade-off you are accepting, in your report, in one sentence:** on a permanently-degraded box this guard becomes non-gating. That is deliberate — code cost is only measurable on a fair box — but it must be written down, not discovered later.

### 3. THE MUTATION CONTROL — the scope that keeps this honest (mandatory, not optional)

An "environment degraded" escape hatch is a mechanism for a guard to **never fail again**. Scope 2 is only acceptable if you prove it did not become one.

(a) Inject a **genuine cost regression into the SUBJECT** — `src/systems/PowerGraph.ts`, e.g. real extra work inside the solve — **not** into the guard script and **not** by lowering the cap. (Mutate the subject, not the instrument: a guard mutated to fail proves nothing about the guard.)
(b) Run the patched guard at **normal QoS**. It **MUST FAIL**, with the PowerGraph message, not the DEGRADED one. Record the numbers.
(c) **REVERT the mutation** and prove it: `git status` clean for `src/`, and `git diff main -- src/` empty at report time. **Zero permanent `src/` changes ship from this task.**
(d) If (b) passes instead of failing, the fix has swallowed a real regression → **revert scope 2 entirely and STOP with the finding.**

### 4. Prove the cure on both arms

- Default QoS, **n≥20** via `logs/session-scratch/s1170-power-budget-rate.mjs` (re-run it; it takes ~5 s per run): **0 reds**, and the reported p95 body should be unmoved from 0.352–0.405 — the fix must not change what a healthy box measures.
- `taskpolicy -b`, **n≥6** via `logs/session-scratch/s1170-degraded-arm.mjs`: **0 reds**, every one reporting **DEGRADED** — where today it is 6/6 false PowerGraph accusations.
- `npm run test:guards` end-to-end: **8/8**, read as `run-guards.mjs`'s **exit code**, not its printed counter (that distinction is the entire reason that runner exists — see its header).

### 5. Report the class without fixing it

`grep` the other seven guards for the same shape — a wall-clock/timing assertion with no environment control — and **list what you find without touching it**. One-line verdict each. Do not fix a second guard in this task; the sweep is evidence for the next master, not scope for this one.

**TOUCH-ONLY:** `scripts/check-power-graph-budget.mjs` · your scratch probe in `logs/session-scratch/` · your run report in `tasks/runs/` · a **temporary, reverted** mutation in `src/systems/PowerGraph.ts` (scope 3 only).

**NO (do not touch, do not "improve"):**
- **`POWER_GRAPH_LIMITS.solveBudgetMs` (`src/systems/PowerGraph.ts:165`) — the 0.5 ms cap is FIREWALLED.** *A budget edited to fit its measurement is not a guard* (F-1156-2, F-1047-1). The measured healthy median is 0.374 — ~25% of headroom already. If you believe the cap is wrong, that is a finding to report, never an edit.
- **Any permanent `src/**` change.** The scope-3 mutation is temporary and its reversion is a gated deliverable.
- **`scripts/run-guards.mjs`** — its `GUARDS` list, its rc handling, its header. Not yours.
- **The other seven guards.** Scope 5 reports; it does not repair.
- **`e2e/world-info-notes.spec.ts`** — lane-a holds a LIVE task in that file right now (`lane-a-world-info-build-fixture-realign`). Touching it would collide with a running lane.
- Any `test.skip`, unconditional early `process.exit(0)`, `try/catch` that swallows the assertion, or any path that makes the guard pass **without** either a healthy p95 or a measured-degraded verdict. The DEGRADED exit is a *narrow, evidenced* branch — if it can be reached on a healthy box, it is a bug.
- Widening the sample window, changing 224/64/p95, or altering which statistic is asserted, **except** where scope 2's retry logic requires it — and then say so explicitly and justify it.

## Self-check before you report READY-FOR-GATES
- `npx tsc --noEmit` clean.
- `npm run build` green.
- Scope 1 produced its two-arm interleaved table **and the explicit 1(d) verdict sentence**, before any `scripts/` edit.
- Scope 3 recorded a **real failure** under mutation at normal QoS, and `git diff main -- src/` is **empty** at report time.
- Scope 4 numbers present for **both** arms, plus `npm run test:guards` **exit code** 0 with 8/8.
- Scope 5 list present, nothing outside TOUCH-ONLY modified (`git diff --name-only main` proves it).
- Your report states the accepted trade-off sentence from scope 2 and the retry count you chose with its justification.

**READY-FOR-GATES** — report: the scope-1 table + 1(d) verdict, the retry count and its justification, the scope-3 mutation numbers (fail under mutation, and the proof of reversion), both scope-4 arms, the scope-5 class list, and any finding you had to leave alone.
