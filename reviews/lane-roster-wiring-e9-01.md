# Review — lane-roster-wiring-e9-01 (E9 Red Fields enemy roster scaffold)

**Slice:** lane-roster-wiring-e9-01 — wire the two data-shaped E9 "Red Fields" roster enemies (`feral_terraformer`, `claim_jump_prospect_drone`) as `twist.enemyRoster` rows across the 4 E9 contracts, mirroring the E8-01 scaffold id-for-id. FIRE-AUTHORED s768 (`24ae5175`), attended review welcome.
**Branch / tip:** `lane/perf` @ `220fc182` (`runner(lane-d): lane-roster-wiring-e9-01.md`), base `24ae5175` (the s768 author commit on main).
**Drained by:** s769 fire — `git merge --no-ff lane/perf` onto main @ `97e28e18` (after the R-E8 art drain this fire).
**Verdict:** ✅ MERGE — E9 Red Fields boots clean, roster enemies field with correct siege/thief flags + tints, E6/E7/E8 not regressed, boss/hazard/canal systems left byte-intact.

## What it does
Wires the two Red Fields non-boss roster enemies as data-only spawn-table rows:
- **`feral_terraformer`** — siege archetype via the existing `wrecker` flag (1.8x scale, hp1.7/spd0.6, buildingDamage1.4, tint `#b06a3a` rust-amber).
- **`claim_jump_prospect_drone`** — `thief` flag (0.45x scale, hp0.7/spd1.1, tint `#9a8b57` dull-brass). Its ORBIT motion is a contract `tileParams.orbitSpawn` concern DEFERRED to the E9-map slice (same as E8's corsair orbit-peel).

Roster distribution across the 4 E9 contracts: dome-basin + seed-run field both; devils-alley fields the drone only (spec omits terraformers there); old-canal fields both. Both slots point at the bandit walk8 placeholder in `generated.ts` — real art follows via Batch R-E9 (the scaffold pins the `char-e9-*-sheet-walk8` 2×4 convention).

## How it was done (merge classification)
`--no-ff` merge, lane/perf base `24ae5175` is an ancestor of main → mostly clean 3-way (git ort). Per-file:
- **`src/assets/generated.ts`** — CONFLICT (both moved): main's R-E8 art drain (`97e28e18`) flipped the e8 slots off the bandit placeholder to real art; the lane added e9 placeholder slots directly after. Resolved by KEEPING main's real e8 sprite URLs AND appending the lane's two e9 bandit-placeholder slots. Verified: no stray conflict markers.
- **`src/assets/slots.ts`, `src/entities/pools.ts`, `src/game/Balance.ts`, `src/systems/WaveSystem.ts`, `assets/contracts/epoch-9-redfields/contracts.json`, `assets/layer-contracts/characters.v2.json`** — LANE-TOUCHED, clean auto-merge (main untouched since base).
- **`e2e/e9-roster.spec.ts`** — NEW (lane).
- `artifacts/lane-roster-wiring-e9-01/*.png` — lane test screenshots (consistent with the tracked e6/e7/e8 artifact equivalents).
- **DEFERRED byte-intact (verified `git diff 24ae5175 220fc182` EMPTY):** `src/game/systems/OldDiggerBossSystem.ts` + `src/systems/E9CanalSystem.ts` — the shipped `old_digger` boss + `maintenance_drone` crew were NOT touched.

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✓ clean (merged tree) |
| `npm run build` | ✓ green, 862ms |
| `e2e/e9-roster.spec.ts` (slice spec) | ✓ 6/6 both projects (14.9s) — era-gating, siege/thief-flag preservation + cure-arms exits, plain Red-Fields boot error-free (:167) |
| `e2e/e8-roster.spec.ts` + `e7-roster` + `e6-roster` (regression) | ✓ 18/18 both projects single-worker (1.7m) — E8/E7/E6 NOT regressed |
| Draw-call budget | held — e9-roster placeholder test (2 new lazy sprite batches) green, no +renderer-texture |
| Boot probe zero-errors | `{console: [], page: []}` both projects |
| In-game screenshots | `reviews/shots-lane-roster-wiring-e9-01/` — E9 Red Fields map boots, Prospector + rust-amber feral_terraformer render, E9 research shown ("Storm-Draw \| Storm-Lance \| Storm Fence") |

## Findings
- **F-1 (RESOLVED at design — NO collision, the E8 F-1 pattern checked and cleared):** the shipped `old_digger` boss (enabled only in `e9-dome-basin`) spawns its crew as `maintenance_drone` (hull `old_digger`) — both ids disjoint from the two roster ids, so the boss recycle/`finishFight` sweeps cannot delete roster enemies. Confirmed byte-intact in the drain diff. E9-01 is genuinely cleaner than E8-01 (whose corsair↔boss-crew collision is still an open owner fork).
- **F-2 (non-blocking, downstream, carried like E8-01):** the E9 roster fields via the debug harness / `?contract=…&nowaves` param; the plain Red-Fields boot test asserts error-free boot, not roster visibility in normal waves. No gazette this drain (matches E7-01/E8-01 "not player-visible in a plain boot"). Art + wiring gazette together when the E9 map/wave slice makes them appear.
- **F-3 (informational, DEFERRED work):** `dust_devil` hazard (spec: never `enemyRoster`) → own hazard-scheduler master; `old_digger` blueprint-reprogramming boss SHIPPED; drone ORBIT motion → E9-map `tileParams.orbitSpawn` slice.
