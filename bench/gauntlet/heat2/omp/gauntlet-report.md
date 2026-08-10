# The Claim — Gauntlet Report

## Approach
Wave 0: harvest 15x at nearest active seam. Waves 1+:
1. MOVE_TO nearest turret position (within 6 units of prospector)
2. BUILD turret (costs 50, 70, 95, 125 — scaling per instance)
3. Repeat for remaining turrets
4. MOVE_TO active seam, HARVEST 10x
5. HOLD at seam

Turret positions: (-8,12), (8,12), (0,6), (0,18) — covering the ford from all directions.
Turret damage: 52 (one-shot kills on trail difficulty, enemy HP=25.2).
No sentry beacons needed — turrets alone provide sufficient kill rate.

## Best Run
- Secured: true
- Waves: 10
- Gold: 65
- Calls: 24
- Time: 300.0s
- Kills: 296
- Event log hash: fnv1a32:bd5d1db3

## Runs executed: 1
