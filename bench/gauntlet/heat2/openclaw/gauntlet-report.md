# Gauntlet Report — OpenClaw · Heat 2

## Objective
Secure contract `the-claim` on bench seed `e1-the-claim-02` at trail difficulty.

## Result
**SECURED on attempt 1** — 10 sim decisions, 0 failures.

| Field      | Value         |
|------------|---------------|
| secured    | true          |
| waves      | 10            |
| timeMs     | 300,000       |
| gold       | 50            |
| kills      | 296           |
| calls      | 10            |
| eventLogHash | fnv1a32:29f1ecc8 |

## Approach

### Strategy (proven by pi in heat 1, adapted here)
- **Harvest active gold seams** for income (~10g/wave from two seams).
- **Build one turret** at (0, 11), the only confirmed-valid turret position on this map, as soon as gold >= 50 (wave 5).
- **Hold the hero** at the claim position (0, 12) to defend.
- **No palisades** — they cause overlap failures with turrets, triggering `needsRider` deadlocks (per heat 1 finding F-GNT-1).
- The hero auto-fights and auto-levels; one turret + hero provides sufficient defense to survive through wave 10.

### Why it works
The claim has 6 gold seam anchors, 2 active at start. Each seam yields 5g/tick with 30 capacity and 20s respawn. The prospector auto-pans. By wave 5, enough gold accumulates for the first turret (50g). From then on, the turret's 16wu line-of-sight range covers the claim center, and the hero + turret kill waves before they reach the claim.

### Build order (approximate)
- Waves 0-4: Harvest seams, accumulate gold to 50.
- Wave 5: Turret built at (0, 11). Continue harvesting.
- Waves 5-10: Turret + hero defend all four edges. Hero levels up through kills.

### Decision count
10 order submissions across the securing run (one per wave boundary).

## Files
- `gauntlet-outcome.json` — the sim's final outcome line verbatim
- `bench/gauntlet/heat2/openclaw/gauntlet-player.mjs` — the player script