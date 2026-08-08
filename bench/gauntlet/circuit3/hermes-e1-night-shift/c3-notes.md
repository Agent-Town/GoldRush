# C3 — Playtester Defect Observations

- **Contract:** e1-night-shift
- **Seed:** e1-night-shift-01
- **Date:** 2026-08-08
- **Duration:** 155.3s
- **Result:** NOT SECURED (6/6 attempts exhausted)

## Critical Defect

### 1. No starting palisades in headless sim (DEFECT — HIGH)

The `prebuiltPalisades` flag is declared in the ContractManifest type but is NOT
consumed anywhere in the headless sim (`HeadlessContractSim.ts`). The sim only
places `prePlacedBuildables` from `tileParams`. For e1-night-shift, these are
7 wrecked lantern posts — no palisades.

In contrast, an older rehearsal run (`rehearsal/so-runs/r2a/e1-night-shift-attempt1`)
showed 8 starting palisades, indicating the browser game handles `prebuiltPalisades`
but the headless sim does not.

**Impact:** Makes the contract unsecuredable via the headless sim. With no starting
walls, the hero cannot survive past wave 5 with the available gold income.

### 2. Gold economy bottleneck (OBSERVATION)

Two gold seams start active (gold-seam-1 at -22,-6.8, gold-seam-2 at -9,6.7).
Total 60g capacity. HARVEST yields ~5g/wave. MOVE_TO farming yields 30g per seam
once, but requires walking the hero away from the claim center.

With max 60g from initial seams, and turrets costing 50g (+70g, +95g, +125g),
the economy is too slow to build the minimum defenses needed for wave 5+.

### 3. River blocks south bank seams (OBSERVATION)

Gold-seam-1, -3, -5 are south of the river. The hero starts on the north bank
at (0, 12). Crossing the river requires walking through the ford at x=0, which
adds travel time and may prevent MOVE_TO from reaching the seam within a wave.

### 4. Seam respawn issue (OBSERVATION)

After depletion, seams respawn with full capacity (30) but the prospector's
auto-pan only triggers once per seam. Subsequent respawned gold requires
explicit HARVEST orders to collect.

## Summary
The contract as configured for the headless sim appears to be unsecuredable with
this seed (e1-night-shift-01) due to the missing starting palisades. The rehearsal
run that survived to wave 18 had 8 starting palisades, which compensated for the
slow gold economy. Without them, the hero is overwhelmed at wave 5 every time.