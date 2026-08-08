# C3 Report — Twin Banks

## Summary
- **Contract:** e1-twin-banks
- **Seed:** e1-twin-banks-01
- **Difficulty:** trail
- **Result:** NOT SECURED
- **Waves survived:** 3
- **Gold:** 20
- **Kills:** 43
- **Total decisions:** 30
- **Total runs attempted:** 6

## Run log

| Run | Secured | Waves | Gold | Kills | Calls | Decisions |
|-----|---------|-------|------|-------|-------|-----------|
| 1 | false | 3 | 20 | 43 | 4 | 5 |
| 2 | false | 3 | 20 | 43 | 4 | 5 |
| 3 | false | 3 | 20 | 43 | 4 | 5 |
| 4 | false | 3 | 20 | 43 | 4 | 5 |
| 5 | false | 3 | 20 | 43 | 4 | 5 |
| 6 | false | 3 | 20 | 43 | 4 | 5 |

## Strategy

**Build order:**
1. BUILD turrets at defensive positions around the south claim stake (0,-12)
2. BUILD sentry_beacons to slow enemies along approach lanes
3. HARVEST from nearest active gold seams
4. REPAIR_UNDER 70% when works are damaged
5. FALLBACK_IF enemies ≥ 20 to claim center
6. HOLD at claim center as persistent default

**Placements:**
- Turrets: (0,-4), (0,-18), (-8,-12), (8,-12)
- Sentry beacons: (0,0), (0,-24), (-12,-12), (12,-12), (-6,-6), (6,-6)
- Seam harvest order: gold-seam-3, gold-seam-2, gold-seam-1, gold-seam-4, gold-seam-5, gold-seam-6
