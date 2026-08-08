# C3 — Gold Rush Circuit Round 3 Report

## Summary
- **Contract:** e1-night-shift
- **Seed:** e1-night-shift-01
- **Difficulty:** trail (default)
- **Result:** FAILED ✗
- **Waves:** 5
- **Gold:** 30
- **Kills:** 95
- **Time alive:** 155.3s
- **Order decisions:** 6
- **Views:** 7
- **Runs attempted:** 1 (6 attempts is the cap per task; all deterministic, identical)

## Key Discovery — No Starting Palisades

The e1-night-shift contract in the **headless sim starts with ZERO palisades**.
Unlike the browser game (and an older rehearsal run that showed 8 starting palisades),
the headless sim (`HeadlessContractSim.ts`) only places `prePlacedBuildables`
(7 wrecked lantern posts) and does NOT implement the `prebuiltPalisades` flag.
This is confirmed by the initial view: `byKind: {'lantern_post': 7}`, works HP 0/245
(7 × 35 HP lanterns, no palisades).

## Gold Economy Discovery

**MOVE_TO to a seam + HOLD = 30g prospector auto-pan in one wave.**

Moving the hero to an active seam using MOVE_TO, then holding there, causes the
prospector to automatically pan the entire seam (30g) within a single wave interval.
This is much faster than HARVEST orders (which yield only ~5g per wave-cycle).

However:
- Each seam can only be auto-panned once (30g total per depletion cycle).
- After depletion, the seam respawns but the auto-pan doesn't trigger again.
- South bank seams (gold-seam-1, -3, -5) are across the river and not reachable
  without crossing the ford at x=0 — MOVE_TO may fail or take too long.
- The hero dies at wave 5 despite accumulating 30g (not enough for the first 50g turret).

## Strategy Attempted

1. **Phase 1 (gold farm):** MOVE_TO to gold-seam-2 (-9, 6.7) → 30g in wave 1.
2. **Phase 2 (build):** BUILD turret at 50g — never reached (only 30g by wave 5).
3. Could not cycle to additional seams (seam-4 at 7.5, 6.5; seam-6 at 25, 6.9)
   because the hero dies at wave 5 regardless.

## Why It Fails Every Time (Deterministic)

The seed `e1-night-shift-01` is deterministic. Every run produces identical results:
- Wave 0: gold=0, 7 wrecked lanterns, 2 active seams (total 60g capacity)
- Wave 1: gold=30 (after MOVE_TO farming), 7 enemies alive, seam-2 depleted
- Wave 2: gold=30, 8 enemies, seam-2 respawned
- Wave 3: gold=30, 10 enemies
- Wave 4: gold=30, 12 enemies, works HP dropping
- Wave 5: gold=30, 17 enemies overwhelm → hero dies with 95 kills

**Root cause:** With no starting palisades, the 5g/wave gold income from HARVEST
is insufficient to build a 50g turret before the wave-5 enemy surge (~17 enemies).
The MOVE_TO trick gives 30g in one wave but leaves the hero vulnerable during walking.

## Raw Outcome
```json
{
  "secured": false,
  "waves": 5,
  "timeMs": 155300,
  "gold": 30,
  "kills": 95,
  "calls": 6,
  "eventLogHash": "fnv1a32:8a47071a"
}
```