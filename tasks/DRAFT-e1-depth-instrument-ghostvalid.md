# DRAFT — CLOSE THE HONEST-PLAY INSTRUMENT'S BUILD DEFECT (`ghostValid` never true)
STATUS: DRAFT (E1-depth review session, 2026-07-25). Not queued. Small, self-contained, unblocks the whole E1 depth review.
WHY: `reviews/e1-gameplay-depth.md` §3. The instrument (`rehearsal/segments/e1-depth-play.mjs`) boots a fresh profile, pans real gold and takes real upgrades — but **0/49 build attempts succeed**, so it cannot yet play a tower-defence map honestly. Four of five E1 maps are unplayed behind this.

## WHAT IS ALREADY KNOWN (✓ VERIFIED this session — do not re-derive)
- Honest build flow is: `KeyB` (→ `ui.buildMode` + `ui.buildMenuOpen` true) → `Digit<n>` where n = 1-based index into `ui.buildables` (confirmed: Digit2 → `palisade`) → pointer move (ghost tracks: `build.ghostPos` updates) → `Space`.
- Panning requires standing still — `src/systems/HarvestSystem.ts:355`: `if (collector.speed > Balance.goldSeam.slowSpeed) return null` (`slowSpeed: 0.35`). Already handled.
- Placement is HERO-LOCAL — `src/systems/BuildSystem.ts:1391-1394`: ghost must be within `placeRadius(def.id)` of the hero. Already handled.
- `__GR_TEST__.screenPoint(x, 0, z)` gives world→screen for precise aiming (perception only).

## THE REMAINING QUESTION
`build.ghostValid` stayed `false` across 10 nudges even with gold ≥ cost and a hero-local aim. `computeValid()` (`BuildSystem.ts:1386-1396`) has exactly five gates — instrument each and log WHICH one rejects:
1. `countFor(def.id) >= maxCountFor(def)`
2. `economy.gold < def.costCurve(countFor(def.id))` ← **note: cost is a CURVE, not the flat `ui.buildables[].cost`. The driver's affordability pre-check used the flat cost and read `canAfford === true` at `gold: 0` — suspect #1.**
3. `!matchesPlacement(def, ghostPos)` — `Terrain.isBuildable` / `walkable` / `waterSourceAdjacent` (suspect #2: river-claim ground under the hero may simply not be buildable; `sluice` additionally needs water adjacency)
4. `placeRadius` distance from hero (suspect #3: `snap()` runs AFTER the raycast — `BuildSystem.ts:1383` — and may push the ghost back out of radius)
5. `overlapsExisting(...)`

## THE FIX
Probe first, then fix — do not guess. A ~15-minute probe: boot `?debug&contract=the-claim`, pan until gold ≥ 25, enter build mode, then sweep the pointer over a grid of hero-local world points and log per point `{ghostPos, ghostValid, gold, costCurve, isBuildable, walkable, distFromHero}`. The rejecting gate will be obvious. Then correct the driver's aim/affordability logic in `e1-depth-play.mjs` only.

## EXPECTED EFFECT
The instrument plays a real defended run: turrets/beacons up, gold spent, waves resolved — which makes difficulty, pacing, dead-minute and dominant-strategy findings *sayable* for all five maps. Today they are not.

## HOW TO VERIFY
`node rehearsal/segments/e1-depth-play.mjs the-claim verify 1 12` →
1. `builds succeeded > 0` and gold visibly falls at each build;
2. `build.turrets + build.beacons > 0` in end-state diagnostics;
3. the run reaches **secured at wave 10** on the Claim (the locked-win the release promises), outcome `secured`;
4. zero console/page errors.
Then re-run for `e1-twin-banks` first (review F-E1-3: the empty-`twist` map, most likely to have no arc), then `e1-dry-gulch`, `e1-night-shift`, `e1-baron`.

## FIREWALL
TOUCH-ONLY: `rehearsal/segments/e1-depth-play.mjs`.
NO: `src/` (this is an instrument defect, not an engine defect — if the probe proves an ENGINE bug, stop and file a finding instead of fixing) · assets · Balance · contracts.
