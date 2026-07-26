# F-E1-10 — the ladder becomes a ladder

Branch: `lane/e2-arsenal`

Verdict: **READY-FOR-GATES.** The repaired depth driver now survives past wave 10 on Night Shift and the Baron without changing the Claim, Dry Gulch, enemy counts, XP, cadence, or late-wave damage.

## Tune

`Balance.waves.entryDamageScale` reduces contact damage only during each named contract's opening:

- Night Shift: `0.2` through wave 6, `0.5` through wave 10, then `1`.
- Baron: `0.2` through wave 6, `0.5` through wave 10, then `1`.

`WaveSystem` applies the table only while spawning scheduled wave/trickle enemies. Debug and stress packs bypass it; untabled contracts and waves keep their existing damage; Baron boss damage at wave 20 is unchanged.

## Before / after

Both columns use Trail, timescale 2, the repaired `rehearsal/segments/e1-depth-play.mjs` policy, historical seeds (`nightshift`, `baron2`), fresh profiles, zero console/page errors, and the pending river-camp datum (`heroCanWadeDeep: false`) layered onto base `312fbd0a`. The river datum is measurement context only and is not part of this branch.

| Map | Before | After | Wave-10 HP |
|---|---:|---:|---:|
| `e1-night-shift` | died wave **9** | died wave **11** | **29 / 125** |
| `e1-baron` | died wave **3** | died wave **16** | **75 / 125** |

Raw reports: `reviews/evidence-e1-ladder-tune/`.

## Combined-main check

After the concurrent river-camp and Double Tap cap slices reached `main`, the same historical seeds were rerun on `68009f22` plus this tune:

| Map | Combined outcome | Wave-10 HP |
|---|---:|---:|
| `e1-night-shift` | died wave **11** | **62 / 150** |
| `e1-baron` | died wave **12** | **125 / 175** |

Both still clear the wave-10 target with zero console/page errors. Their reports are the `ladder-integrated-after-*` files in the evidence directory.

## Excluded exploratory runs

Running on base without the pending river fix reproduced F-E1-5 instead of measuring combat: Night Shift secured at wave 25 after HP froze at 6 with 60 enemies alive; Baron reached wave 20 after HP froze at 36, then died to the boss. Those reports and screenshots remain under `reviews/shots-e1-depth/ladder-before-*`. A fixed-seed Night Shift probe that again entered the river was stopped at wave 11; its screenshots remain under `ladder-fixed-before-nightshift-*`.

## Gates

- Pre-flight `npm run build`: PASS.
- Final `npm run build`: PASS.
- Baron debug-contact regression (`054-baron-epic`, desktop): PASS.
- Focused Night Shift + Baron suites: 32/40 PASS. All 8 failures are the same four Night Shift lighting/suspend failures on desktop and mobile; the four desktop failures reproduce unchanged on clean base `312fbd0a` (same luminance values and suspend timeout), so no threshold was weakened.
