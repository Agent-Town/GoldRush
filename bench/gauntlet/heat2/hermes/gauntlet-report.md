# Gauntlet Report — The Claim (e1-the-claim-02, trail)

**Status**: SECURED
**Attempts**: 1
**Outcome**: {"secured":true,"waves":10,"timeMs":300000,"gold":20,"kills":296,"calls":20,"eventLogHash":"fnv1a32:9e8e0fd6"}

## Approach

Player script controls the Gold Rush sim via NDJSON door protocol.

Standing orders control the PROSPECTOR (not the hero). The hero stays at the claim and fights automatically. The prospector harvests gold from seams and the build system places defenses.

1. **BUILD priority**: BUILD orders come first in the array so they fire before HARVEST. BUILD uses goldGte conditions to wait until enough gold is available.
2. **Passive harvest**: HARVEST fires when BUILD conditions are not met, earning ~5 gold per wave. No MOVE_TO is used (it blocks BUILD).
3. **Sentry beacons (max 6)**: Placed near the claim center at (0,12). Cost escalates 25/35/45/55/75/95. Slow enemies in 8wu radius.
4. **Turrets (max 4)**: Placed at (4,14)/-(4,14)/(4,10)/-(4,10). Cost 50/70/95/125. 16wu range line-of-sight damage.
5. **Repair**: WORKS repaired when below 60% HP.
6. **HOLD**: Always ends with a HOLD to keep the prospector stationary at the claim.

Views processed: 21