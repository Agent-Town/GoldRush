# Review — run-gait-stride (gait stride-lock)

- **Slice:** run-gait-stride (E2 arsenal lane / lane-c)
- **Branch/tip:** `lane/e2-arsenal` @ `7ff847a1` (runner output, single commit)
- **Base:** `7c716ecf` (s457 run-cast-scale-up bookkeeping) — verified an ancestor of clean main `666eb4d5`.
- **Merged:** `a9ef820f` (`--no-ff` onto clean main `666eb4d5`; s459 lock `f0ae72d8` beneath).
- **Verdict:** ✅ SHIP. tsc + build green; own spec 2/2 desktop+mobile; every adjacent red fingerprint-proven PRE-EXISTING on clean main; gait is a net improvement (turns 2 previously-red tests green).

## What it does
Stride-locks the walk cadence to distance travelled instead of raw speed, so the ×1.5 run-scaled cast (run-cast-scale-up) no longer foot-churns. Adds `Balance.anim.strideUnits = 2.05`: a full gait cycle covers `2.05 × visualScale` world units. Locomotion floor lifted to 3.8 fps (`9.5 × 0.4`, was 3.5); zero displacement now selects `idle` rather than freezing a walk frame. `SpriteAnimator.update` gains a `groundSpeed` param so frame cadence (gait-locked) and displacement diagnostics (true ground speed) are decoupled. Hero computes `gaitSpeed` only when run-scaled (`visualScale !== 1`) — the unscaled town Hero keeps its prior cadence. Enemy pool routes `grab`/`flee`/`walk` through `regularAnimation()` (stopped enemies → idle); Baron keeps its prior clip rate (excluded from the stride formula, matching the "except the boss" cast exclusion).

## Merge classification
Clean disjoint merge. `git diff 7c716ecf 666eb4d5` over gait's 5 touched files (`SpriteAnimator.ts`, `Hero.ts`, `pools.ts`, `Balance.ts`, `run-gait-stride.spec.ts`) = **empty** → main never moved these since gait's base, so no 3-way graft needed. Sol-streams (`666eb4d5`) touched only docs/BACKLOG — fully disjoint. All 5 src/spec files LANE-TOUCHED-only; the 11 `artifacts/run-gait-stride/*` files are new runner evidence.

## Evidence
| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | green (merged tree) |
| `npm run build` | green — index bundle 1,177.63 kB, Game 527.51 kB, built 558ms |
| `run-gait-stride.spec.ts` | **2/2** desktop + mobile (:5240 merged tree), zero console/page errors |
| Frames/world-unit (report) | Hero 6-speed vs 3-speed = 2.647 vs 2.577 fr/u desktop+mobile; 3.075-unit stride; Baron unchanged 3.167 |
| `cast-motion-wiring` | 2/2 (runner report) |
| Adjacent anim battery | see fingerprint below |

## F-1 (non-blocking) — pre-existing adjacent red cluster, fingerprint-proven
Ran the adjacent animation battery against **both** the merged gait tree (:5240) and a **byte-identical pre-gait baseline** (`lane/m3` @ `6f765aa5`, confirmed `git diff 666eb4d5 6f765aa5` empty over all gait src + these spec files, served :5241). Desktop-chrome:

- **Merged tree:** 10 failed — `066-walk8-engine:194,:208`; `run-scene-animation-refresh:5`; `task-031-anim-roundness:175,:230`; `task-042-anim-smoothness:54`; `vp-02b-rotation-resolver:112,:149,:174,:229`.
- **Clean pre-gait baseline:** 12 failed — the same 10 **plus** `066-walk8-engine:161` (hover8) and `vp-02b-rotation-resolver:128` (hysteresis).

Every merged-tree red ⊆ baseline reds ⇒ gait introduces **zero** new failures. gait FIXES 2 (`066-walk8:161`, `vp-02b:128`). The runner's own report independently confirmed the `run-scene-animation-refresh` Hero-canary red is pre-existing on a detached clean-main A/B at `a0f04241`.

These 10 reds are an owed corrective (anim-suite drift from the walk8/run-cast churn, not gait) — folded into the s458-carried pre-existing-red backlog. NOT a gait blocker.

## Firewall
Touch-only respected: `src/assets/SpriteAnimator.ts`, `src/entities/Hero.ts`, `src/entities/pools.ts`, `src/game/Balance.ts` (additive `strideUnits`; `walkMinFps` retune), new `e2e/run-gait-stride.spec.ts`, `artifacts/run-gait-stride/*`. No new `GeneratedSpriteBatch` instantiated in `pools.ts` → the `lazy:true`/vp-02:382 renderer-texture law is not triggered. No terrain / town-ground files → clear of the 2026-07-13 SOL territory freeze.
