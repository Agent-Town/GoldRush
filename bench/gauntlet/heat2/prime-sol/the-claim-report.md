# The Claim — Run Report

## Verdict

**SECURED** on run 1 of the allowed 6. The stop-on-first-secure rule was honored.

| Field | Result |
|---|---:|
| Contract | `the-claim` |
| Seed | `e1-the-claim-02` |
| Difficulty | `trail` |
| Secured | `true` |
| Wave | 10 |
| Time | 300,000 ms |
| Gold | 13 |
| Kills | 296 |
| Simulator calls | 28 |
| Event log hash | `fnv1a32:86949e16` |
| Hero at secure | 77 / 125 HP |
| Standing works | 5 sentry beacons, 1 turret; 0 wrecked |

## Player

`player.mjs` is the deterministic standalone player. Run it from this directory with:

```bash
node player.mjs
```

It launches the canonical simulator as:

```bash
node scripts/gr-sim.mjs --contract the-claim --seed e1-the-claim-02 --difficulty trail
```

For every NDJSON view it deterministically regenerates a complete replacement array: the source-pinned six-beacon/four-turret build ladder, four harvest attempts per active seam, repair below 60% aggregate works HP, and a final claim-center `HOLD`. It caps the array at 32 orders. The player also records `last-run.ndjson` and atomically updates the best terminal line in `outcome.json` with the cumulative run count.

## Run discipline and evidence

- Only one simulator run was executed; it secured, so testing stopped.
- `outcome.json` was written immediately on receipt of the terminal line and contains `runsSoFar: 1`.
- `NOTEBOOK.md` records static lessons before the run and the measured terminal lesson afterward.
- `last-run.ndjson`, `run-1.stdout`, and `run-1.stderr` retain local replay/debug evidence.
- No network submission was made.
