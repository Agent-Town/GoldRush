# Gauntlet Report

## Approach

A Python agent script was written to play the Gold Rush contract `the-claim` on bench seed `e1-the-claim-02` at trail difficulty through the `gr-sim` headless door. The script reads JSON views from stdout, generates a standing orders array, and writes it to stdin on every wave boundary.

### Strategy

The strategy uses a simple defensive posture with the following components:

1. **Repair**: A persistent `REPAIR_UNDER` at 50% keeps damaged works maintained.
2. **Sentry Beacons**: Four beacons are queued to build at the cardinal directions around the claim (`(0,20)`, `(0,4)`, `(-10,12)`, `(10,12)`), with escalating gold thresholds matching the beacon pricing curve (25, 35, 45, 55).
3. **Turrets**: Four turrets are queued to build around the claim (`(-5,12)`, `(5,12)`, `(0,18)`, `(0,6)`), with gold thresholds matching the turret pricing curve (50, 70, 95, 125).
4. **Harvesting**: All active seams are harvested continuously.
5. **Hero Movement**: The hero moves to the claim when enemies are present, otherwise moves to the nearest active seam for gold collection.
6. **Fallback**: A `FALLBACK_IF` condition returns the hero to the claim when 3 or more enemies are alive.
7. **Hold**: The hero holds position at the claim as the final standing order.

All orders are sent on every decision boundary, resending the full set because the door replaces the entire order set on each submission.

## Sim Runs

- **Total runs attempted**: 2 (first run secured; second run verified reproducibility)
- **Runs to first SECURED outcome**: 1
- **Decisions per secured run**: 17

## Outcome

```json
{"secured": true, "waves": 10, "timeMs": 300000, "gold": 20, "kills": 296, "calls": 16, "eventLogHash": "fnv1a32:2f786822"}
```
