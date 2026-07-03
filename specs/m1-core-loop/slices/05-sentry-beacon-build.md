# m1/05-sentry-beacon-build

**Contract:** gold converts into standing defense; the tower-defense seed and the build-UX pattern for M2 exist.

**Seam:** `src/systems/BuildSystem.ts` — `B` (or HUD button) toggles build mode (`GameState` stays `playing`; sim keeps running — building under pressure is the point); ghost mesh at cursor ray→ground, grid-snap 1 m; valid iff `Terrain.isBuildable` + within 6 m of hero + no overlap (r 1.2) + `Economy` can afford; **teal ghost = valid, rust = invalid** (§4.1 semantics); confirm → `economy.apply({type:'gold_spent', sink:'build_sentry_beacon', amount: cost})` → place. Cost 25 ×1.3 per built (25/35/45/60), max 6. `src/entities/SentryBeacon.ts` — brass tripod + pulsing teal lantern (slot `bld.sentry_beacon`), registers a `ShooterHandle` with **existing** CombatSystem (dmg 8, 1.2/s, range 8, bolt speed 14) — no second combat path, no second targeting impl; if the API is insufficient, extend CombatSystem here rather than forking. Indestructible in M1 (HP/aggro = M2). `ui/BuildButton.ts`: cost display, greyed when poor.

**Playable checkpoint:** pan ~25 gold, drop a beacon at the ford, watch it hold a lane while you pan the far seam.

**Verification:** GATE-STD; e2e: grant gold via debug economy event → `B` → place via keyboard path → gold decremented, `beacons === 1`, beacon registers a kill with zero input; river placement rejected (rust ghost + no state change); restart clears beacons; screenshot-critique (ghost validity colors readable; beacon silhouette is a lantern-rig, not a firearm).

**Deps:** 02 (CombatSystem) + 04 (Economy). ∥ with 06.

**Firewalls:** no beacon HP/damage-taken/repair (M2); no new projectile/targeting logic; no build menu beyond one ghost + one button; placement validity only from `Terrain` + `Economy`.
