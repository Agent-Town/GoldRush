# m0/03-hero-camera

**Contract:** the Homesteader moves like a survivor-like hero and the camera frames decisions. Camera language locked here for the project.

**Seam:** `src/entities/Hero.ts` (replaces scaffold `Player`/`Pickup` demo) — placeholder with charm: capsule body + brass hat cone + teal chest-lamp glow (slot `char.hero`); `stats: StatSheet` stub; `update(dt, intents, terrain)`; movement filtered through `Terrain.sample()` (speedMul) and clamped to bounds; facing = move direction. Numbers → `game/Balance.ts`: speed 6.0 m/s, accel 20, decel 28 m/s². `src/systems/CameraRig.ts`: perspective FOV 42, offset (0, 22, 10) ≈ 57° pitch top-down slight-oblique, position lerp lag 0.12 s, look-ahead 1.5 m along velocity, no rotation follow; hero sits ~55% down-screen so northern threats are visible. `core/InputController.ts` extended to intents `{ move: Vec2, confirm, build, restart, pause }` (touch stick stays, hidden on desktop). Rewrite scaffold e2e assertions to Gold Rush semantics (same harness pattern: W held 450 ms → `heroPos.z` decreases).

**Playable checkpoint:** drive the hero across the whole claim; deep water slows you visibly; ford is the smart crossing; camera never loses the hero.

**Verification:** GATE-STD; interaction e2e: scripted WASD moves `heroPos` in diagnostics; river speed ratio ≈ 0.55 asserted via diagnostics; screenshot-critique on framing; compare-screenshots vs 02 baseline (only hero + camera may change); 60 fps.

**Deps:** 01; consumes `TerrainSample` from 02 (flat stub until 02 merges — integration assert at merge). Parallel with 02/04.

**Firewalls:** no combat, no HP, no XP. Doesn't modify Terrain internals. Don't rewrite `core/InputController.ts` wholesale — extend it.
