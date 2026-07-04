# M2-06 — arsenal-blast-charge (expanded s22, 2026-07-04)

**Status: DELEGATED (tasks/007, relay mode — chatgpt.com 403; chained after tasks/006).**

**Goal.** Second hero weapon family (Robin ask) + the beacon-falloff root fix via composition, not stat inflation: **Blast Charge** — slow AOE lob through the single CombatSystem path — and a **Turret** buildable — single-target, higher damage than beacon, needs line-of-sight. Checkpoint: hero alternates rig+charge mid-fight; a turret covers a wall gap. Parallel branch per slice graph (06 after 01, ∥ 04/05).

## Contract

1. **ShooterHandle grows, CombatSystem stays the ONLY damage resolver.** Additive optional fields on `ShooterHandle`: `kind?: 'bolt' | 'lob'` (default `'bolt'`, all existing handles untouched), `enabled?: () => boolean` (default true; disabled rigs skip volleys, timers keep ticking, floor 0), `canTarget?: (target) => boolean` (LOS hook), `aoe?: { radius: number; airTime: number }`. No behavior change for existing handles — byte-identical sims when no new handle is registered.
2. **Blast Charge (hero weapon #2):** a `lob` handle registered in Game (heroShooter pattern, id `hero_blast`). Fires at the nearest target like any rig, but the volley launches a pooled **BlastCharge** projectile on a parabolic arc to the target's position at fire time (ground-targeted, NO homing), landing after `aoe.airTime`. **Teal arc telegraph** (thin curve, `#83ded7` family) from muzzle to impact point while airborne + impact marker. On landing: **detonation resolved IN CombatSystem** — every alive enemy within `aoe.radius` takes the charge's damage EXACTLY once (single-enemy attribution per the bolt-diffusion lesson; kills route through the same `killEnemy`, owner `hero_blast`). **Dust-ring detonation vfx (pooled), frontier-tech mortar silhouette, never gory (§9.2).**
3. **Friendly AOE:** detonations damage enemies ONLY — no hero damage, no structure damage (buildables have no HP until 05; assert no coupling now so 05 doesn't inherit one).
4. **Weapon toggle:** ONE toggle — `KeyQ` + one touch button (rotate-button pattern). Toggling switches which hero family is `enabled`; **default = spark rig** (pre-06 sims byte-identical until someone toggles or builds a turret — the 04 stockpile-gate precedent). Both families keep independent cooldowns; interleaving by active toggling is intended skill expression ("alternates rig+charge"). HUD: one display-only weapon chip (text swap) — that is the whole UI (firewall).
5. **Turret buildable:** new `BuildableDef` `turret` in the registry (menu grows to 5, registry-driven — m2-01 pays off; `Digit5`/`Numpad5` additive). New pooled **Turret** entity (SentryBeacon pattern, placeholder mesh only — mortar-on-post silhouette; art slots ride a later batch, NO slots.ts/contract edits). Registers a `bolt` ShooterHandle (id `turrets`): damage > beacon flat, longer range, slower fire, **`canTarget` = LOS predicate** — segment turret→target must not cross a palisade footprint (2D). BuildSystem builds the closure (it owns palisade data); CombatSystem stays ignorant of buildings. Beacons explicitly DO NOT gain LOS (unchanged — composition is the point).
6. **Targeting:** `TargetingSystem.findNearest` gains an optional predicate param — nearest *eligible* target (nearest-then-reject is wrong: a turret behind a wall must shoot the visible second-nearest). Additive, default byte-identical. (006 touches this file for the holding registry — chain order 006→007 resolves it; sibling rule.)
7. **Economy:** turret cost flows the EXISTING BuildSystem spend path (`gold_spent`); no new event literals, no Economy.ts edits.
8. **Diagnostics/harness:** `state.arsenal = { active: 'rig' | 'blast', blastsAlive, detonations, blastKills, turretKills }`; `__GR_TEST__.toggleWeapon()`. No new kill switch — neutrality is default-off.
9. **Perf:** BlastCharge pool (`Balance.blast.pool` 8) + ring vfx pooled; scratch vectors, no per-frame allocations in lob update/detonation; draw calls Δ ≤ +3 vs m2-02 baseline (turret family instanced like beacons).

## Design calls taken without Robin (flag at m2-07, all reversible knobs)

- Toggle = exclusive-active (not dual-autofire): preserves neutrality-by-default and makes the checkpoint verb ("alternates") a player action. Interleave-by-toggling stays legal.
- Detonation is instant at landing (no lingering field), enemies-only, no hero self-damage: prosperity framing, and friendly-fire is a complexity tax with no M2 payoff.
- Lob targets fire-time position, dodgeable in principle: reads as mortar, keeps CombatSystem's no-homing invariant for non-bolt projectiles.
- Defaults: `Balance.blast` = damage 20, radius 2.2, cooldown 2.5, airTime 0.7, projSpeed n/a (arc from airTime), pool 8; `Balance.turret` = costBase 50, costGrowth 1.35, maxCount 4, damage 26, fireRate 0.8, range 12, boltSpeed 16, volley 1, placeRadius 6, overlapRadius 1.2, gridSnap 1. lil-gui sections for both.

## Acceptance criteria

1. `npx tsc` + `npm run build` green; zero console/page errors desktop + 390px.
2. New `e2e/m2-06-arsenal-blast-charge.spec.ts`: **(a)** toggle: default run → `killsByOwner` has NO `hero_blast`/`turrets`; `toggleWeapon()` → `state.arsenal.active === 'blast'`, blast kills accrue, rig kills stop accruing while toggled; **(b)** AOE attribution: clustered pack → ONE detonation kills the cluster, `detonations` +1, each enemy damaged exactly once (kill delta == cluster size, no double-hits); **(c)** friendly: detonation centered on a palisade+beacon cluster with hero inside radius → hero hp unchanged, beacon keeps firing, palisade keeps blocking; **(d)** LOS: turret behind a palisade line, enemy on the far side → zero `turretKills` over a window; enemy with clear LOS → turret fires (in-page rAF tracker for any movement assert — protocol polling lies); **(e)** menu: turret buildable via slot 5, cost debited once, HUD == Economy log replay; **(f)** neutrality: real waves, no toggle, no turret → `state.arsenal` untouched (`active === 'rig'`, zero detonations) and no new owner ids in `killsByOwner`; **(g)** pools: `?stress` + blast active → `blastsAlive` never exceeds pool cap, no errors.
3. Canaries green UNMODIFIED: m1-01 (kill/attribution), m1-02 (auto-fire), m1-05 (beacons), m2-01 (menu — registry grew), m2-02 (build/economy), feedback-fx.
4. **FULL regression** — combat semantics changed (all spec files, per-file ≤45s batches, fresh vite per call).
5. Screenshots → `reviews/shots-m2-06/`: arc telegraph mid-flight, dust-ring detonation, turret covering a wall gap, weapon chip both states, 390px frame.
6. Perf: draw-call probe Δ ≤ +3 vs m2-02 baseline; no per-frame allocations (lob update uses scratch vectors).

## Firewall (do NOT)

- No weapon-switching UI beyond the toggle key + touch button + display-only chip; no ammo economy; no weapon upgrades (Progression untouched).
- No structure damage, no enemy ranged attacks, no wrecker behavior (all 05).
- CombatSystem remains sole damage resolver — the detonation loop lives there, not in BlastCharge; `killEnemy` is the only kill path.
- No homing on the lob; no beacon stat changes; no Balance edits outside the two NEW sections.
- No Enemy.ts / WaveSystem.ts / Economy.ts / HarvestSystem / Terrain / assets / existing-e2e edits. Hero.ts NOT in scope (weapon handles live in Game — s21's scope guess corrected s22).

## Notes for implementer

- Chain context: your tree contains tasks/006's landed output (thief/steal code). Treat it as given; do not refactor it; sibling rule on shared files (Game.ts, DebugTools.ts, Balance.ts sections, TargetingSystem.ts).
- Arc telegraph: one pooled `THREE.Line`/curve per airborne charge is fine at pool 8; kill it on detonation (no orphaned telegraphs across `reset()` — m2-05's no-orphan law arrives next, don't seed a leak).
- LOS test: 2D segment vs palisade OBB (rotated footprints exist since m2-02's rider) — reuse palisade pool positions/rotations; `avoidancePad` is steering-only, do not reuse it as the LOS pad.
- `reset()`/death-restart: recycle all charges + telegraphs + rings; `state.arsenal.active` resets to `'rig'`.
- e2e cluster setup: `spawnPack(n, radius, { speedScale: 0 })` — the explicit option arg lands in 006's rider; do not re-special-case (5,3).
