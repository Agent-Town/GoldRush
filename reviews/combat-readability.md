# Review — combat-readability (damage must be VISIBLE)

**Slice:** lane-c combat-readability (branch lane/polish `a05805b` → drained to main s99)
**Verdict:** PASS — drained.
**Reviewer:** s99 fire (headless).

## What landed
Owner playtest finding (2026-07-06 evening): *"things have hit points and there is damage — that should be visualized."* 35 waves played, never saw a building HP bar. This slice makes damage read on screen without touching damage math.

1. **Enemy hit-flash** — one pooled `InstancedMesh` (`EnemyPool.hitFlashes`, additive warm-white `#fff8e8`), driven by `Enemy.takeDamage` setting `flashRemaining` (alloc-free: a float + counter, no allocation per hit). Scale-pulse fades over `Balance.combatReadability.enemyFlashSeconds` (0.18s). No per-enemy health bars (swarm-noise, genre standard = flash + death). +1 draw call total, not per-enemy.
2. **Building HP bars, made real** — root cause of invisibility: old bar sat at y≈1.46, 0.92×0.08 thin, single slot colored `#a0522d` (reads as terrain). Fix: raised to visualY 1.72, parchment backing + separate colored fill slot (ink `#3b2a1a` / amber `#c4883a` under 66% / danger `#a0522d` under 33%), camera-facing yaw, wider 1.46×0.18, terrain-Y-safe. Damaged-only law preserved (`hp<maxHp && !wrecked`). Capacity ×2→×3 per building in the SAME `buildingVisuals` InstancedMesh (no new draw call).
3. **Palisade wear** — below 50% HP, `PalisadePool.setWear` darkens the segment via the existing `instanceColor`/vertexColors path (worn timber/rail/brace colors); bridges pristine→rubble. Initialized for every instance in the constructor.
4. **Turret muzzle pulse** — `CombatSystem` gains an additive optional `onFire?(at)` hook fired after `recordShot` (NO change to damage math or resolution order); `BuildSystem` wires it to `TurretPool.pulse`, which lifts emissiveIntensity + per-instance scale for `turretPulseSeconds` (0.18s). Silent turrets now visibly work.

## Firewall check ✓ VERIFIED
Diff `6eb8ad6..a05805b` touches only entity/visual layers (Enemy sprite-tint hook, BuildSystem visual sync, TurretPool/PalisadePool visuals), pools, `Balance` (additive `combatReadability` knobs), `vite-env.d.ts` + `Game.ts` (additive diagnostics), and the new e2e. `CombatSystem.ts` = 3 additive lines (optional callback + two call sites). No damage-math, no CombatSystem resolution order, no Economy, no wave logic, no sim timing. Zero per-frame allocations in the hit path (scratch objects `syncObject`/`hiddenMatrix` reused).

## Evidence
- `npx tsc --noEmit` — clean.
- `npm run build` — green (pre-existing >900kB chunk warning only).
- `e2e/combat-readability.spec.ts` — **6/6** both viewports: building bars visible desktop+390px; enemy hit-flash + turret-pulse diagnostics advance; **120-enemy flash stress holds draw-call ≤200 + frame p95 within budget**.
- Adjacent unmodified suites: `m1-01` (incl. stress=120 pool/draw budget), `m2-01` (incl. "draw calls stay under 200 with palisades and beacons"), `task-025` — **30/30** both viewports. The +1 flash draw-call does NOT bust the ≤200 budget.
- Boot probe (`_s99-combat-readability-boot-probe`) — **2/2** both viewports, zero console/page errors, `readability` diagnostics block live. Screenshots: `reviews/shots-combat-readability/{desktop,mobile}-chrome-boot.png`.
- Lane artifacts (before/after): `artifacts/combat-readability/{building-bar-390px,building-bar-desktop-worn-palisade,enemy-flash-mid-swarm,turret-pulse}.png`.

## Findings
- **F-CR-1 (minor, non-blocking):** `EnemyPool.warmHitFlashes` (a test-only Promise/RAF affordance for e2e) lives in production pool code and draws a 0.001-scale invisible flash to make diagnostics register when no enemy is present. Harmless (only invoked via the `warmVfx` test hook), but a test seam in shipping code — candidate for a future cleanup pass, not worth a corrective now.
- **F-CR-2 (cosmetic):** turret emissive pulse is on the shared material, so all turrets glow when any one fires (per-instance scale is correct). Acceptable given shared-material instancing; noted for the record.

Neither finding blocks the drain.
