# C3 — Dry Gulch Report

## Approach

Used the benchmark-tested standing-orders strategy from the Gold Rush test suite:
- Build all 6 sentry beacons and all 4 turrets at escalating costs around the claim (0,12)
- Harvest all 6 gold seams (4× each to keep the prospector busy)
- Repair under 80% when works HP drops below 60%
- HOLD at claim position as the persistent fallback order

Contract: `e1-dry-gulch`, seed: `e1-dry-gulch-01`, trail difficulty.

Key adaptation for Dry Gulch:
- No river barrier → enemies from all 4 edges → wider turret/beacon spread
- 40% seam yield multiplier → more gold per harvest cycle
- Secure at wave 20 (vs wave 10 on The Claim)

## Runs

| Run | Result | Notes |
|-----|--------|-------|
| 1 | SECURED (wave 20) | gold: 200, kills: 359, calls: 59 |

1 run, SECURED on first attempt. No failed runs.

## Decision Count

Approximately 60 decision points (one per view/wave boundary + intermediate views).
