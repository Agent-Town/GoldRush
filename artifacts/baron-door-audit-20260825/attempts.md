# Current-door existence attempts — first bench seed

Contract `e1-baron`, seed `e1-baron-01`, checked-out cured engine. No private state mutation, balance mutation, or non-public verb was used.

## Dead ends inherited from Heat 5

`artifacts/gauntlet-heat5-20260824/e1-baron/attempts-summary.md` already exhausted home forts, damage/tank upgrade priorities, early turret tiers, early walls, rig/blast switching, four remote turrets, two-home/two-remote batteries, south-bank walls, and a concentrated near-ford wall grid. This audit did not repeat them unmodified.

## H10 — center the battery on the crossing

Hypothesis: exploit the Baron's crossing route by centering four turrets, six beacons, and a late double wall line around the ford instead of repeating Heat 5's home/remote forts.

Command:

```text
node artifacts/baron-door-audit-20260825/h10-centered-killbox-player.mjs --tape artifacts/baron-door-audit-20260825/h10-centered-killbox-tape.json
```

Result: the live manifest rejected all four turret and all six beacon placements as `FAILED (out_of_zone)`. With no lawful works the rider died at wave 5 (`secured:false`, 87 kills, 200 gold). The replay assayer independently returned:

```json
{"eventLogHash":"fnv1a32:467c0f72","outcome":{"secured":false,"waves":5,"gold":200,"timeAlive":155.467},"ticks":4664,"engine":"headless-contract-sim"}
```

Decision: geometry veto; do not repeat. Tape: `h10-centered-killbox-tape.json`.

## H11 — move the rig forward only for the boss burn

Hypothesis: retain Heat 5 attempt 4's best lawful fort and economy, but move every `HOLD` from the claim `(0,12)` to `(0,-4)` after tick 15,000 so the rig spends the Baron window forward instead of on the home stake.

The minimal transform is preserved in `make-h11-tape.mjs`; output is `h11-forward-rig-tape.json`. Current-engine assay:

```text
node scripts/assay-replay-agent.mjs artifacts/baron-door-audit-20260825/h11-forward-rig-tape.json
{"eventLogHash":"fnv1a32:00d2c4f7","outcome":{"secured":false,"waves":20,"gold":200,"timeAlive":538.467},"ticks":16154,"engine":"headless-contract-sim"}
```

Control, same engine and same source fort without the movement mutation:

```text
{"eventLogHash":"fnv1a32:79cbfb15","outcome":{"secured":false,"waves":20,"gold":200,"timeAlive":538.467},"ticks":16154,"engine":"headless-contract-sim"}
```

The changed hash proves the order stream changed; the identical terminal outcome proves no survival gain. No secure fell, so there are no standings submissions or verification polls.

