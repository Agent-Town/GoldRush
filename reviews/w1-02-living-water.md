# Review — W1-02 living water (LANE-C / lane/polish)

**Slice:** W1-02 (river shader, ford legibility, gold glints, mobile knob)
**Gated by:** s63 fire (2026-07-06)
**Lane commit:** `2178b5c w1: add living water shader` on base `6b05cb9` (worktrees/lane-c)
**Done-move:** tasks/done/20260706-122428-lane-c-w1-02-living-water.md
**Verdict:** ✅ **PASS — merged** (path-scoped onto main d4bf1e3+bookkeeping; one test-harness corrective F-w1-02-1 applied)

## What landed
Codex touched (vs base 6b05cb9): `src/world/Water.ts` (new, +254 — LivingWaterShader),
`src/world/Terrain.ts` (render-side shoreline/seam, −68/+42), `src/game/Balance.ts` (+3 additive
knobs: waterQuality/waterMobileQuality/waterFlowSpeed), `src/vite-env.d.ts` (+10 water diagnostics),
`src/game/Game.ts` (+1 diagnostics line), `e2e/w1-02-living-water.spec.ts` (new), `artifacts/w1-02/*`
(before/after wide+ford shots, perf-before/after json).

- **River shader** — animated flow via shader time uniform (no CPU per-frame geom); depth tint
  (dark channel, light shallows), soft bank foam where water meets the W1-01 banks.
- **Ford legibility (LAW)** — ford now renders as pale stepping stones (`fordStones ≥ 7`), a clear
  crossing at gameplay zoom; strictly stronger than the pre-W1-02 flat green rectangle.
- **Gold glints** — sparse sparkle near pan spots (`glints ≥ 6`), Frontier Ledger restraint.
- **Mobile knob** — `Balance.world.waterMobileQuality = 0.55` degrades ripple/foam cost at 390px
  (diagnostics `mobile:true, quality:0.55 < 1`).

## Merge classification (vs merge-base 6b05cb9)
Disjoint from 036 (main d4bf1e3) on every file **except `src/game/Game.ts`**, which both moved:
- **LANE-TOUCHED / MAIN-UNMOVED** (wholesale `git checkout lane/polish`): Water.ts, Terrain.ts,
  Balance.ts, vite-env.d.ts, new spec, artifacts/w1-02/. Confirmed no main commit since 6b05cb9
  touched these.
- **MAIN-MOVED + LANE-TOUCHED (3-way graft)**: `Game.ts`. 036 added confirmAction/office branch
  (region ~L840+); W1-02 adds a single diagnostics line inside the `terrain:{}` block (main L820).
  Non-overlapping regions → grafted the one line (`water: this.terrainView?.diagnostics(),`) onto
  main's current Game.ts. tsc/build confirm `terrainView.diagnostics()` resolves.

## Gate evidence (native, playwright.w1.config.ts — self-booting vite:5231, desktop 1280×800 + mobile 390×844)
- `npx tsc --noEmit` — clean ✓
- `npm run build` — green, 386ms ✓
- `e2e/w1-02-living-water.spec.ts` — **2/2 both projects** ✓ (LivingWaterShader present; riverTime &
  fordTime advance between frames; mobile quality knob = 0.55 < 1; zero console/page errors
  desktop+mobile) — after F-w1-02-1 corrective below.
- `e2e/task-025-bandits-dont-swim.spec.ts` — **10/10 both projects** ✓ — **sim-drift proof: ford
  routing / bandit-no-swim UNMODIFIED-GREEN.** W1-02 is rendering-only.
- `e2e/m2-01-build-menu.spec.ts` — **12/12 both projects** ✓ (draw <200 held)
- `e2e/m1-01-claim-jumpers-death.spec.ts` — **8/8 both projects** ✓
- **Perf (task law: fail if frame time regresses >15%)** — before/after at debug wave-15 +
  spawnPack(5,3.2), 1280×800: avgFrameMs **8.33 → 8.33 (0%)**, p95 **9.1 → 8.6**, maxDrawCalls
  **43 → 45 (+2, holds 200 budget)**, triangles 31504 → 31772. No regression. ✓
- **Visual** (artifacts/w1-02/): after-ford shows legible stepping-stone crossing + depth tint +
  soft bank foam; before-ford was a flat teal plane with a weak green ford rectangle. Frontier
  Ledger restraint held (no photoreal bloom; parchment-warm). Matches brief §4 + spec laws. ✓

## Findings

### F-w1-02-1 (test-harness corrective — APPLIED before merge, test-only, <20 lines)
The spec's `openGame` helper asserted `[data-testid="assay-close"]` visible and clicked it — a
pre-036 assumption that the Assay Bench mounts **open** on plain `?debug`. Task 036 (merged on main
this same fire) made the bench mount **hidden** (opens only for `?profile`/`?queueNow` or Enter near
an office), so the close button no longer exists and the helper timed out (both projects). Fix:
dropped the bench-close step; `openGame` now waits for the canvas + frame>20 directly. This is a
merge-interaction between W1-02 (branched pre-036) and 036 — the living-water **feature** code is
untouched and correct (tsc/build green; feature assertions all pass once the game opens).

## Firewall check ✓
No routing/ford-LOGIC, riverSide/ford sim geometry, Combat/Economy/Wave/Input changes (task-025
10/10 green is the proof). Terrain.ts edits are render-side (shoreline seam). Balance.ts additive.
Game.ts change is a single diagnostics read. m2-01/m1-01 assertions untouched.
