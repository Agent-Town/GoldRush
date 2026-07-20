# Review — e8-physics-reland (E8 low-g movement/lob physics)

**Slice:** e8-physics-reland (FIRE-AUTHORED s755, runner reproduction of the gate-green work on lane/m4 `1bafa1b4`)
**Branch/tip:** lane/e2-arsenal `cf01e725` (single runner commit), base `18535923` (a true ancestor of main)
**Merged as:** `6e2ddafb` (real `git merge --no-ff`, drained s757)
**Verdict:** ✅ SHIPPED — clean 3-way, all gates green both projects.

## What it does
Gives E8's orbital/vacuum contracts their signature low-gravity feel. A new
`E8PhysicsSystem` supplies per-contract gravity/drift profiles (Eclipse low-g,
Low Orbit free-fall) that filter movement intents, scale lob air-time and arc
distance, and scale knockback — all deterministic fixed-timestep math. The
combat/blast shooters are ADAPTED (not re-resolved: CombatSystem stays the sole
damage resolver). Early (non-orbital) epochs are untouched — profiles select off
contract gravity flags, so normal play feels unchanged.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ 1.31s |
| `e2e/e8-physics.spec.ts` | 6/6 (3 tests × desktop-chrome + mobile-chrome) |
| `e2e/e8-arsenal.spec.ts` (combat/blast adjacent) | 4/4 both projects |
| `e2e/_s99-combat-readability-boot-probe.spec.ts` | 2/2, zero console/page errors, flashes=0 bars=0 pulses=0 both projects |

## Merge classification (base `18535923` = ancestor of main)
- `src/systems/E8PhysicsSystem.ts` (new, 156 lines) — LANE-ADDED, clean.
- `e2e/e8-physics.spec.ts` (new, 160 lines) — LANE-ADDED, clean.
- `src/vite-env.d.ts` — main did not move it since base → auto-merged clean.
- `src/game/Balance.ts` — `e8Physics` tunable block; main's wreck-visibility block sits elsewhere in the file → git auto-merged clean.
- `src/game/Game.ts` — **3-WAY, one conflict** at `updateActors()`: main (collision-depenetration) had rebuilt `terrain` with a never-trap `depenetrate` closure; the lane forked before that and shipped the older simple `terrain` plus a new `this.syncE8LobPhysics();` call. **Resolved as a superset:** kept main's `terrain.depenetrate` (newer, strictly a superset) and added the lane's `syncE8LobPhysics()` line above it. All 18 e8 hook sites in Game.ts (e8PhysicsIntents / syncE8LobPhysics / e8PhysicsSystem field / test probes) verified present post-merge; tsc confirms `depenetrateFromBlockers` import intact.

## Findings
None blocking. `save/e8-v1` (`1bafa1b4`) is the now-superseded v1 salvage — archive/delete it (the drained content is on main).
