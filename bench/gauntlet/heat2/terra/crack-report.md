# Night Shift crack report

**SECURED** on `e1-night-shift-01` at Trail with the required `gr-sim` door. No standing was submitted.

```json
{"secured":true,"waves":25,"timeMs":750033,"gold":295,"kills":1238,"calls":273,"eventLogHash":"fnv1a32:9f0f0570"}
```

## Winning policy

The rider harvested each currently active seam to fund construction, then placed two turrets. At the next affordable boundary it spent 60 gold on a north-bank palisade line (`x=-5,-3,-1,1,3,5`, `z=14`; five remained standing), rather than immediately buying another beacon. It then completed the four-turret ladder, filled the six sentry-beacon cap at legal bank cells, and repeatedly used `REPAIR_UNDER 100` when damage or wrecked lanterns triggered a rider view.

The palisades diverted and delayed the building-targeting wreckers long enough for the automatic combat and progression loop to outscale the late pulses. This was the material difference: turret/beacon-only variants died at waves 18–19; the buffer run reached the secure boundary with the hero at **175/175 HP**.

## Terminal evidence

- Command: `node scripts/gr-sim.mjs --contract e1-night-shift --seed e1-night-shift-01`
- Final field state: 17 standing works; 4 turrets, 6 sentry beacons, 5 palisades, and 885/1113 works HP.
- Pressure at secure: 1,259 spawned, 1,238 defeated, 21 still alive, including one wrecker.
- Exploratory terminal failures before the secure run: 6; best prior result was wave 19. Stopped immediately after the first secure result, below the 12-run cap.
- No tracked game files changed and no network request was made.
