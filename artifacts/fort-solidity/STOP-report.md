# F-BW-19 fort solidity — STOP report

Verdict: **STOP — not READY-FOR-GATES.** The required wall collision creates a measured enemy stall, and the routing cure is outside this task's touch-only firewall.

## E1 landmark census

| Map | Existing solid entries | Missing solids | Intentionally walkable scenery |
|---|---|---|---|
| The Claim | `maintained_claim_house`, `working_camp` | `active_headframe` | `claim_stake` (run authority already owns it), `riparian_dressing_pack` |
| Dry Gulch | `ruined_mining_operation`, `abandoned_farmhouse`, `cactus_thicket`, `bison_skeleton`, `isolated_spring` | none | none |
| Twin Banks | `north_bank_homestead`, `south_bank_homestead`, `north_bank_winch`, `south_bank_winch` | none | `floodplain_dressing_pack` |
| Night Shift | `lampworks_yard` | none | `seven_lantern_terraces` (authored fixtures own the lanterns), `dark_rock_shoulders`, `central_ford`, `night_work_road` |
| Baron | `rocket_cart` | `fortified_far_bank`, `seized_headframe`, `siege_line` | `oxblood_banners` |

## Footprints measured from the mounted bodies

| Landmark | Honest candidate footprint |
|---|---|
| `active_headframe` | rect `3.168 × 2.016` |
| `seized_headframe` | rect `3.168 × 2.016`, then authored mount scale `1.2` |
| `fortified_far_bank` | five palisades `5.8 × 1.0` plus two platforms `3.0 × 2.8` |
| `siege_line` | five palisades `5.6 × 0.9` at the pack's authored rotations |

## Blocking probe

- `npx tsc --noEmit`: clean with the candidate registry/spec changes.
- Five-map census browser probe: passed.
- A single full-body `fortified_far_bank` rectangle (`29.8 × 3.1`) made the enemy settle at approximately `(6.675, -13.080)` against a target at `(0, -5.8)`; its longest stationary run exceeded 1,400 fixed ticks.
- The honest component split still stalled: a direct route ended near `(2.220, -13.080)` after 30 simulated seconds, and a normal high-HP enemy oscillated around `(2.35, -13.01)` rather than clearing the wall.
- The repository has no landed stall-census probe to reuse (`stall-census`, `stall-probe`, and `stall pocket` searches returned no task/spec).

## Root cause and required successor scope

`ClaimJumperEnemy.resolveBlocker()` performs local collision response. `BuildSystem.palisadeRoute()` supplies long-obstacle waypoints only for player-built palisades; static landmark blockers never enter that route graph. Short landmark bodies route acceptably, but a continuous fort wall does not.

A successor must explicitly authorize the enemy/static-blocker routing seam (likely `Enemy.ts` plus the route owner), then reapply the four registry gaps and the four-face/never-trap spec. The alternative is an owner ruling for hero-only fort collision. Shipping the registry entries alone would replace a walk-through wall with a permanent enemy stall.
