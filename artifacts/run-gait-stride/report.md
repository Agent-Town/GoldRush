# Run gait stride

`STRIDE_UNITS = 2.05`. A full gait cycle now covers `2.05 × rendered visual scale` world units. The 8-frame Hero at run scale 1.5 therefore covers 3.075 world units per cycle, about 1.1× its 2.775-unit rendered height. The locomotion floor is 3.8 fps (40% of the 9.5 fps base), and zero displacement selects idle instead of freezing a walk frame.

## Frames per world unit

| Cast | Before | After formula | After at base speed |
| --- | ---: | ---: | ---: |
| Hero, 8 frames, 1.5 scale | 3.167 | 2.602 | 2.602 |
| Regular enemy, 8 frames, 1.5 scale | 3.167 | 2.602 | 2.602 |
| E2 Rail Tough, 4 frames, 1.74 scale | 1.583 | 1.121 | 1.257 (3.8 fps floor) |
| E2 Steam Wrecker, 4 frames, 1.92 scale | 1.583 | 1.016 | 1.902 (3.8 fps floor) |
| E2 Coal Thief, 4 frames, 1.32 scale | 1.583 | 1.478 | 1.478 |
| Baron, 8 frames | 3.167 | 3.167 | 3.167 |

Browser telemetry was stable across projects: Hero 6-speed vs 3-speed measured 2.647 vs 2.577 frames/unit on desktop and mobile, with a reported 3.075-world-unit stride; enemy rendered at 1.5 scale measured 2.602 frames/unit and a 3.075-unit stride versus 3.902 frames/unit and a 2.05-unit stride at hypothetical 1.0 scale; Baron remained 3.167.

## Gates

- `npx tsc --noEmit`: green.
- `npm run build`: green.
- `run-gait-stride`: 2/2, desktop + mobile, zero console/page errors.
- `cast-motion-wiring`: 2/2, desktop + mobile, zero console/page errors.
- Thief flee regression: 2/2, desktop + mobile; a focused cadence probe changed from 9.483 fps at 3.645 wu/s to the 7.6 fps floor at 1.35 wu/s. A stationary grab continues cycling at the same 7.6 fps floor instead of freezing.
- `run-scene-animation-refresh` E1 outlaw sibling: 2/2, desktop + mobile.
- `run-scene-animation-refresh` Hero canary: pre-existing red. The unchanged canary times out waiting for Hero walk8 on both this lane and a detached clean-main A/B at `eaa3a160`; no gait-specific assertion is reached. Existing spec left untouched.

Visual target: the scaled Hero should travel with readable leg phases, remain grounded, and avoid rapid foot churn. The clean 0–3 second desktop/mobile series shows stable grounding and distinct gait poses without the earlier Baron/dialog contamination; accepted for owner review.

Independent review found and the final implementation resolves the remaining gaps: `grab`/`flee` now consume gait cadence, the unscaled town Hero keeps its prior cadence, Baron grab remains on its prior clip rate, stopped regular enemies select idle, and stride diagnostics use actual ground speed. The focused gates above were rerun after those corrections.
