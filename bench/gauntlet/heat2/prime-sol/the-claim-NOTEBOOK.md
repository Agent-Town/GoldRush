# The Claim — Notebook

## Static reconnaissance (before run 1)

- The target is deterministic: `the-claim`, bench seed `e1-the-claim-02`, Trail, secured when wave 10 starts at 300 seconds.
- Standing-order arrays replace the prior array. The executor scans in order and the first actionable order owns a tick, so persistent `HOLD` must remain last.
- Current source prices are sentry beacons 25/35/45/55/75/95 and turrets 50/70/95/125. The claim anchor is `(0,12)`.
- Harvest orders walk the Prospector and each successful pan consumes 5 seam capacity. A build does not walk, so out-of-reach attempts can be retried on later views after `HOLD` returns the Prospector to the claim.
- The repository's current cross-engine overtime test contains a deterministic policy for this exact contract and seed: six beacons around the claim, four surrounding turrets, four pans per currently active seam, conditional repair below 60%, then `HOLD`. That fixture is asserted secured at wave 10. The standalone player uses that proven adaptive policy without overtime.
- Historical fixed-order seed-01 policies are not used: repository review evidence says that stale fixture dies on seed 02 after harvest-walk semantics changed.

## Run 1 — SECURED (stop condition reached)

- Command launched by `player.mjs`: `node scripts/gr-sim.mjs --contract the-claim --seed e1-the-claim-02 --difficulty trail`.
- Result: **SECURED** at wave 10 / 300,000 ms on the first run. Per the task, no further runs were made.
- Terminal line: `{"secured":true,"waves":10,"timeMs":300000,"gold":13,"kills":296,"calls":28,"eventLogHash":"fnv1a32:86949e16"}`.
- Terminal view: hero 77/125 HP at `(0,12)`; five sentry beacons plus one turret standing, no wrecks, aggregate works HP 266/282; 9 threats remained as wave 10 posted, which is valid because the secure condition is survival to the posting boundary.
- The adaptive retries generated several expected `needsRider` views while the Prospector was away harvesting; regenerating the full replacement array let pending builds succeed after the final `HOLD` brought the Prospector home.
- `outcome.json` was written synchronously by the player when the terminal outcome arrived and records `runsSoFar: 1`.
