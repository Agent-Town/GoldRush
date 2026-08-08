# C3 Report — The Claim

## Summary
- **Contract:** the-claim
- **Seed:** e1-the-claim-01
- **Difficulty:** trail
- **Result:** NOT SECURED
- **Waves survived:** 3
- **Gold:** 70
- **Kills:** 50
- **Decisions made:** 42
- **Total runs attempted:** 6

## Run log

| Run | Secured | Waves | Gold | Kills | Calls | Decisions |
|-----|---------|-------|------|-------|-------|-----------|
| 1 | false | 3 | 70 | 50 | 6 | 7 |
| 2 | false | 3 | 70 | 50 | 6 | 7 |
| 3 | false | 3 | 70 | 50 | 6 | 7 |
| 4 | false | 3 | 70 | 50 | 6 | 7 |
| 5 | false | 3 | 70 | 50 | 6 | 7 |
| 6 | false | 3 | 70 | 50 | 6 | 7 |

## Strategy

**Build order priority:**
1. HARVEST from nearest active gold seams (walking to them first)
2. BUILD sentry_beacons at defensive perimeters around the claim (0,12)
3. BUILD turrets at strategic positions for damage
4. REPAIR_UNDER 70% when works are damaged
5. FALLBACK_IF enemies ≥ 12 to claim center
6. HOLD at claim center as persistent default

**Placements:**
- Sentry beacons: (0,4), (0,20), (-8,12), (8,12), (-5,6), (5,6)
- Turrets: (0,8), (0,16), (-6,12), (6,12)
