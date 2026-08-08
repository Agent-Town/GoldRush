# c3-report — e1-dry-gulch

## Approach

The objective was to secure the e1-dry-gulch contract on bench seed e1-dry-gulch-01 at trail difficulty. The contract requires surviving through wave 20. Buildable defenses are limited to `sentry_beacon` (max 6, 25g+) and `turret` (max 4, 50g+). Gold seams yield 40% more. Enemies spawn from all four edges.

**Strategy:**

1. **Harvest gold** from the nearest active seam (seam-2, then seam-1 after depletion) — 7g/wave from the 1.4x yield.
2. **Build sentry beacons first** — at 25g (cheapest defense), each deals 10+0.75/wave damage at 1.2 shots/sec, which supplements the hero's spark rig (12 dmg, 2 shots/sec).
3. **Place all BUILD orders before HARVEST** in the standing order array — critical because orders are evaluated top-down per tick. BUILD fires on the first tick(s) while the prospector is still near the claim; HARVEST follows.
4. **Build range is from the PROSPECTOR position** (not the hero), so all build positions must be within the beacon/turret `placeRadius` (6 units) of the prospector's starting area near the claim at (0,12).
5. **Submit ALL unbuilt structures** every wave with gold conditions — the tick loop chains builds on consecutive ticks so multiple structures can go up in one wave before the prospector walks to a seam (going out of build range).

## Runs

| Run | Waves | Secured | Gold | Kills | Notes |
|-----|-------|---------|------|-------|-------|
| 1 (v1) | 4 | false | 35 | 41 | Order array: HARVEST before BUILD; build positions too far |
| 2 (v2) | 4 | false | 35 | 41 | Same structural issues |
| 3 (debug) | 4 | false | 30 | 41 | Probing build ordering and prospector movement |
| 4 (v4) | 20 | **TRUE** | 122 | 213 | First secured — 1 beacon built with proper positions |
| 5 (v5) | 20 | **TRUE** | 89 | 230 | 3 beacons built (chained builds), 230 kills |

First SECURED outcome achieved on run 4.

## Decision Count

The agent submitted a JSON order array at every wave boundary (including the initial view at wave 0 and the wave-view at wave 1 after the first advance). 20 waves × 2 submissions per wave = 40 total `submitOrders` calls (calls: 40 in the outcome).

No `--overtime` was used.

## Key Mechanic Discoveries

- **BUILD range is from the prospector, not the hero.** The BuildSystem receives `this.prospector.position` (a THREE.Vector3) as its `heroPosition` parameter. If the prospector is walking to a far seam when gold crosses a build threshold, the build fails with `out_of_zone`.
- **Submit all builds every wave** — the array-order tick evaluation fires builds in sequence until a condition fails or gold runs out, then falls through to HARVEST.
- **Gold rate:** 7g/wave from a single seam (5 base × 1.4 yield). Turret (50g) requires 7+ waves of harvest from a cold start; the cheap beacon (25g at wave 4-5) is essential for survival.
- **Beacons deal damage** (not just slow): 10 + 0.75/wave at 1.2 shots/sec. They are effective supplementary weapons.