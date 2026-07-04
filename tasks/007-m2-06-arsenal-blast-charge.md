# Task 007 — M2-06 arsenal-blast-charge (chained: run AFTER tasks/006)

**Spec (BINDING, read fully):** `specs/m2-base-waves/slices/06-arsenal-blast-charge.md`.
**Brief constraints:** `docs/GOLD_RUSH_BRIEF.md` §9.2 (frontier-tech mortar silhouette, teal telegraph, dust-ring — never gory), §9.4 naming. Read `AGENTS.md` first.
**Skills:** `threejs-gameplay-systems` (pooling, projectile arcs), `threejs-aaa-graphics-builder` (telegraph/ring vfx restraint).
**Chain context:** your tree already contains tasks/006's output (gold-stealing). It is GIVEN — do not refactor or "fix" it; sibling-changes rule on every shared file.

## Goal

Blast Charge: hero weapon family #2 — `lob` ShooterHandle (id `hero_blast`) through the single CombatSystem path; pooled parabolic charge to fire-time target position, teal arc telegraph, detonation resolves in CombatSystem (every alive enemy in radius damaged EXACTLY once, kills via the one `killEnemy`, enemies only — no hero/structure damage). `KeyQ` + one touch button toggles rig↔blast (`enabled` closures; default rig). Turret: 5th registry def, pooled placeholder entity (SentryBeacon pattern), `bolt` handle id `turrets`, damage 26 flat / range 12 / fireRate 0.8, `canTarget` LOS predicate built by BuildSystem (segment vs palisade OBBs — not `avoidancePad`); `TargetingSystem.findNearest` gains an optional eligibility predicate (nearest ELIGIBLE, not nearest-then-reject). Menu grows to 5 (`Digit5`/`Numpad5`), cost via existing spend path. The spec wins over this file.

## What already exists (do NOT redo)

- `ShooterHandle` registration/unregister closures (CombatSystem + BuildSystem `registerBeaconShooter` pattern); `killsByOwner` attribution; `getDamage` hook.
- Registry-driven menu (BuildSystem `menuSnapshot`/`buildableDefs.map`) — adding a def is data + ghost + pool + place/count branches; icons lazy-glob with parchment fallback (NO slots.ts / layer-contract / icon art edits).
- `Vfx.floatText`, CombatVfx pooled dustPuff/hit; `spawnPack(n, radius, { speedScale })` option arg (006's rider).
- Rotate-button touch pattern in InputController (build the weapon-toggle button the same way).

## Files in scope

- `src/systems/CombatSystem.ts` (additive ShooterHandle fields `kind`/`enabled`/`canTarget`/`aoe`; lob volley path + detonation resolution; existing bolt path byte-identical)
- `src/entities/BlastCharge.ts` (NEW pooled charge + arc telegraph, XpMote/Projectile pool pattern)
- `src/entities/Turret.ts` (NEW pooled placeholder turret, SentryBeacon pattern)
- `src/game/buildables.ts` (`turret` def + `BuildableId` union), `src/systems/BuildSystem.ts` (ghost/place/count/LOS closure/shooter registration)
- `src/systems/TargetingSystem.ts` (optional predicate param ONLY — default behavior byte-identical; 006 touched this file, sibling rule)
- `src/systems/CombatVfx.ts` (pooled detonation dust-ring, teal `#83ded7` family)
- `src/core/InputController.ts` (`weaponToggle` intent `KeyQ` edge-triggered + touch toggle button + `Digit5`/`Numpad5` slot; KeyQ is unbound today — keep it collision-free, remember the KeyR double-map lesson)
- `src/game/Balance.ts` (**NEW `blast` + `turret` sections ONLY**), `src/game/Game.ts` (blast handle, toggle state, `state.arsenal` diagnostics, `__GR_TEST__.toggleWeapon()`; sibling rule), `src/systems/DebugTools.ts` (lil-gui `blast`/`turret` sections)
- `src/ui/Hud.ts` + `src/styles.css` (display-only weapon chip + toggle-button styles — minimal), `src/systems/UiBridge.ts` ONLY if the menu snapshot type needs the new def (additive)
- `e2e/m2-06-arsenal-blast-charge.spec.ts` (NEW — tests (a)–(g) per spec §Acceptance)

**Do not touch:** `src/entities/Hero.ts`, `src/entities/Enemy.ts`, `src/systems/WaveSystem.ts`, `src/game/Economy.ts`, `src/systems/HarvestSystem.ts`, `src/entities/Sluice.ts`/`Stockpile.ts`/`GoldPickup.ts`, `src/world/Terrain.ts`, `src/assets/*`, `assets/*`, `scripts/*`, existing `e2e/*` specs, `STATUS.md`, `reviews/*`, specs other than M2-06 progress notes.

## Acceptance (spec §Acceptance, verbatim gates)

1. tsc/build green; zero console/page errors desktop + 390px.
2. New e2e (a)–(g): toggle default-off neutrality, AOE single-attribution (kill delta == cluster size), friendly-fire zero (hero+structures), turret LOS blocked/clear (in-page rAF trackers for movement), menu slot 5 + replay == HUD, `state.arsenal` neutrality under real waves, `?stress` pool cap.
3. Canaries green UNMODIFIED: m1-01, m1-02, m1-05, m2-01, m2-02, feedback-fx.
4. **FULL regression** (combat semantics changed) — all spec files.
5. Screenshots → `reviews/shots-m2-06/` (arc telegraph, detonation ring, turret at a wall gap, chip both states, 390px).
6. Perf: draw calls Δ ≤ +3 vs m2-02 baseline; no per-frame allocations in lob/detonation (scratch vectors); `reset()` recycles charges/telegraphs/rings.

## Environment notes (Robin's Mac — you run there)

Run e2e via base `playwright.config.ts` (own webServer). Reply READY-FOR-GATES when done — supervisor runs gates. Do not `git commit`.
