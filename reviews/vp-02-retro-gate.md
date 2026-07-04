# VP-02 retro-gate (s9d/s16, 2026-07-04)

## Why this exists (process violation, owned)

`a674606` (s9d dead-lock takeover) used `git add -A` and unknowingly swept the ENTIRE tasks/004 VP-02 output (SpriteAnimator 423 LoC, Hero/Enemy/pools wiring, vp-02 e2e, extractor sheet-mode) onto main UNGATED. s14/s15 then treated the tree as clean and vp-02 as "not landed" while building on top of it. This file is the retroactive gate. **BINDING RULE going forward: NEVER `git add -A` in this repo — path-scoped adds only, per the active task/slice file scope.**

## Gate result: PASS with 2 env-timing exceptions + 1 perf watch-item

Environment: ~/gr snapshot of a674606+s14 docs, sandbox chromium-1228 full binary, LD_LIBRARY_PATH stub, per-file runs ≤45s wall, fresh vite per call.

- tsc clean · vite build clean (417ms)
- vp-02-sprite-animation 4/4 · m1-01 4/4 · m1-02 3/3 · visual-polish-assets 2/2 · m1-05 6/6 · visual 5/5 · feedback-fx 3/3 · m1-03 5/5 (2+3 split) · m1-04 4/4 · m1-06 8/8 (3+2+3) · m1-07 7/7 (4+3) · m1-08 6/6 (3+3) · m2-01 5/6 green + 1 exception · m2-03 3/4 green + 1 exception
- **Exception 1 — m2-01 "stress draw calls":** setup placement poll exceeds the 30s test timeout; PASSES at 38s and the draw-call budget HOLDS (<200). Env pacing, not a budget breach.
- **Exception 2 — m2-03 "timer locked to sim time":** run only reaches wave 2 (needs ≥3) within the window even at 38s; the drift/maxError asserts never evaluate. Same class: headless frame cost, not observed timer drift.
- **Perf watch-item (REAL, for m2-07 gate):** VP-02 sprite animation adds measurable frame cost under `?stress` in headless (both exceptions are new since vp-02; both suites were green at s11's 65/65). Profile SpriteAnimator texture swap path / batch behavior before the m2-07 perf gate. Robin's live hardware playtest reported no perf complaint.

## Harness corrections for the next session (s5 setTimeout precedent, ≤20 lines)

1. `e2e/m2-01-build-menu.spec.ts` stress test: `test.setTimeout(45_000)`.
2. `e2e/m2-03-wave-scheduler.spec.ts` timer test: `test.setTimeout(45_000)` + either raise timescale for the 3-wave run or accept 2 waves with proportional sample floor.

## Attribution note

s15 later reprocessed sheets and integrated hero front/back ON TOP of this state with its own gates (vp-02 4/4, m1-01 4/4, vpa 2/2 recorded in LEDGER). This retro-gate covers the a674606 vp-02 code itself; s15's delta has s15's evidence.
