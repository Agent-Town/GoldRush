# Gauntlet Report

## Objective
Secure contract `the-claim` on bench seed `e1-the-claim-02` at trail difficulty (survive through wave 10).

## Attempts
**Total sim runs:** 10  
**Total decisions (order submissions):** ~537 across all runs  
**Outcome:** Not secured (best: wave 8, gold 33, 176 kills)

## Approach
Wrote a custom Node.js player script (`gauntlet-runner.mjs`) that:
1. Spawns `gr-sim.mjs` as a child process
2. Reads each `goldrush.view.v1` JSON view from stdout
3. Sends standing orders (JSON array) to stdin
4. Repeats until terminal outcome

### Order Execution Model (learned through iteration)
Key mechanics discovered:
- Orders are evaluated **each tick** in array order; the **first actionable** order owns that tick
- **BUILD** fires **once** (status → done), then never blocks again
- **HARVEST** fires **once per seam** (status → done)
- **MOVE_TO** fires **every tick until arrival** (blocks everything after!)
- **HOLD** fires **every tick forever** (blocks everything after!)
- Each **new submission** resets all orders to `pending`
- Gold accumulates through base auto-pan near seam positions

### Build Strategy
Best outcome used:
1. **sentry_beacon** (25g) — auto-attack defense
2. **sluice** (40g) — passive gold income on river bank (z=7)
3. **sentry_beacon** (33g) — more fire support
4. More sluices and turrets

### Key Challenges
- **Deterministic seed**: all runs with the same `--seed` produce identical outcomes
- **Order blocking**: MOVE_TO or HOLD blocks HARVEST/BUILD evaluation
- **Gold constraints**: only ~10g/wave base income; slow accumulation for expensive builds
- **Sluice placement**: needs `river-adjacent` bank (z=5.5–7), not in water
- **BUILD `when` required**: every BUILD must have `goldGte` or `waveGte`

## Conclusion
Contract not secured within 10 attempts. The deterministic seed combined with tight gold budget makes it a challenging optimization problem requiring precise build ordering and timing.
