# Task 065-shots-follow-terrain: weapon fire follows terrain height like enemies do (lane-c, RENDER-ONLY; commit prefix "fix:")
**OWNER BUG REPORT 2026-07-09 (verbatim): "What works well now is the enemies walking accross terrain, what does not yet work well is weapon shots and terrain - can you check that? I think there are some bugs there."**
VERIFIED SHAPE (attended grep, same day): `visualY` terrain-following exists on Enemy/Turret/BlastCharge/GoldPickup/Sluice/XpMote — but NOT in the shot rendering (CombatSystem tracers/projectiles/muzzle vfx have zero visualY references). Shots render at flat plane height on relief terrain: wrong muzzle origin, tracers clipping through rises / floating over dips, impacts flashing at phantom ground level.
You are Codex in worktrees/lane-c. Pre-flight per LANE-SAFETY. READ FIRST: CombatSystem's shot/tracer/impact rendering path (incl. the muzzle-pulse `onFire` hook from combat-readability), how Enemy.ts computes/applies `visualY`, Turret.ts's visualY, the rendering-only law (sim hits stay planar/deterministic — this task touches ONLY where shot visuals draw).

## Scope — visuals ONLY; the sim's targeting/damage is UNTOUCHED
1. **Muzzle origin**: shot visuals originate at the turret's terrain-adjusted muzzle (its visualY + muzzle offset) — same for hero weapon fire if it renders tracers.
2. **Tracer path**: interpolate visual height along the shot from muzzle visualY to target visualY (enemy chest height at ITS terrain offset) — no more flat-plane lines through hills.
3. **Impact/hit vfx**: impact flashes, hit-flashes, and ground decals land at the TARGET's visualY / terrain height at that point.
4. Works with terrainMesh flag ON and OFF (flat tiles = zero visual change — assert byte-similar screenshots on The Claim); Hill Mine + gt-test-basin are the proving tiles.
5. Perf: no per-frame terrain sampling explosion — reuse the same height lookup enemies use; frame p95 regression ≤5% at wave-20 stress.

## Firewall
Touch ONLY: shot/tracer/impact RENDERING (CombatSystem draw path + vfx), its e2e, artifacts. **NO targeting, NO damage resolution, NO Balance, NO enemy/turret sim, NO terrain data.**

## Self-check
tsc/build · e2e on Hill Mine (`render.terrainMesh: required` tile): turret on a terrace fires at enemy below/above — screenshot shows tracer + impact aligned to both actors (compare vs current broken state, before/after into `artifacts/065/`) · The Claim flat regression: shots pixel-consistent with today · determinism e2e: Economy hash identical (render-only proof) · combat-readability + m1-01/m2-01 + e2-hill-mine adjacents green · zero console · desktop + 390px.
End: **READY-FOR-GATES** + before/after screenshots + the p95 delta.
