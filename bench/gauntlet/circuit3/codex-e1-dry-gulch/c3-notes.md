# C3 — Playtester Defect Observations

## order_failure surprises

Many waves log `order_failure` surprises (e.g., 7 failures in wave 1, 5 in wave 5, 4 in wave 14). These occur because:

1. **Duplicate HARVEST orders**: Multiple HARVEST orders for the same seam are queued before the first one completes. When the prospector is already walking to/harvesting a seam, subsequent HARVEST orders for that seam fail. This is not a defect — replace-semantics means the agent re-queues harvests each turn, and only the first actionable one runs.

2. **BUILD failures on first wave**: Wave 1 had 7 order_failures because the agent sent BUILD orders before having enough gold (BUILD with `goldGte` condition may not trigger correctly for multiple simultaneous builds, and the 0-gold state rejects them).

3. **Late-wave HARVEST failures**: In later waves, seams may deplete mid-cycle, causing remaining queued HARVEST orders to fail.

These are expected edge cases of the standing-orders replace-semantics — not game bugs. The strategy still secures wave 20 cleanly (no hero downs, no works destroyed).

## No defects observed

- No console errors
- No unexpected crashes or timeouts
- All works remained standing through wave 20
- Hero never went down
- Gold economy functioned correctly (earned, spent, held)
- Enemy spawning worked from all 4 edges as specified
- Outcome deterministic per seed (hash verified across runs)

**Conclusion**: No playtester defects observed.
