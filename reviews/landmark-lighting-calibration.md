# Review: landmark-lighting-calibration — landmarks lit by the sun, not by themselves (lane-c, Claude Opus 5 implementer, attended drain 2026-09-05)

**Slice/branch/tip:** `landmark-lighting-calibration` · `lane/c` · commit `35da2e06d` over base `dc74e3075` · merge `a05abdf1d` (no-ff; `Terrain3dClaimPilot.ts` auto-merged beside the sampler's hunks; BACKLOG union).
**Verdict:** MERGED — a LOOK change with the owner's veto open (REVERT-LIGHTING; live A/B via `?lighting=legacy`, no rebuild). F-ASTRA-9 cured; F-ASTRA-1's paint findings stay with the atlases.

## What it does
- `keepLandmarkPaintReadable` no longer drives bodies off a whole-surface emissive of 3: the authored per-contract lifts become a RELATIVE grade (`authored / 3`) re-hung on a measured default of **0.45**, clamped `[0.12, 0.6]` (Claim 0.2175, Hill Mine 0.2175 + roof 0.30, Mare 0.45; Night Shift untouched — never painted). 0.45 is measured, not chosen: the sun's share of a body's rendered light rises from 18% → 46% on the Mare (worst) and 37% → 52% on The Claim, and every daylight body drops back under the unlit hero sprite. 0.30 was tried first and dropped four dark-painted maps under `map-census`'s 0.06 readability floor; their paint is the defect (F-ASTRA-1), so `LANDMARK_EMISSIVE_READABILITY_EXEMPT` holds e3-moth-season, e6-glow-mesa, picnic and pressure-garden at their authored lift (a moth-season A/B differs by 37 px of 1,024,000).
- Backface culling only where proven closed: runtime census over 11 contracts / 63 meshes — 50 closed → `FrontSide`, 13 open → `DoubleSide`; an offline audit of all 196 landmark primitives agrees mesh for mesh (177 closed / 19 open; 196/196 double-sided in the GLBs, confirming Astra). Culling moves 0.02–2.6% of the frame and none of it on a landmark body.
- Harness: `?lighting=legacy` (re-publishes 3/1.45/2 and 0 culled), `?lmemissive=`, `?lmcull=off`, `?exposure=/?sun=/?fill=`, absent by default (the `nochannelwater` precedent).

## Evidence
| Scene | landmark luminance (desktop) | L/terrain desktop | L/terrain 390px |
|---|---|---|---|
| The Claim | 0.186 → 0.084 | 0.59 → 0.27 | 0.65 → 0.29 |
| Hill Mine | 0.104 → 0.076 | 0.44 → 0.32 | 0.41 → 0.31 |
| Mare Claim | 0.589 → 0.228 | 5.34 → 2.07 | 6.28 → 2.71 |
| Night Shift (control) | 0.116 → 0.116 | 0.932 → 0.932 | 1.052 → 1.052 |
Terrain and hero luminance move by < 0.001. p95 (paired arms): desktop Claim 10.4 → 10.5, Hill 10.2 → 10.4, Mare 9.7 → 10.1 (+4.1% worst), Night 9.9 → 10.1; 390px within ±4%. Screenshots: `artifacts/landmark-lighting-calibration/{before,after}-{the-claim,e2-hill-mine,e8-mare-claim,e1-night-shift}-{desktop,mobile}-chrome.png` (sent to the owner).
| Gate | Result |
|---|---|
| Runner (lane tree, own port 5303) | tsc 0; build 0; landmark-brightness 4/4, perf-01 1/1, lantern-true-world 9/9 (reel p95 ratio 0.99/1.01), map-census 47/47 verdict-identical cell for cell to the pre-change tree; both projects; zero console/page errors |
| Changed assertions in `landmark-brightness.spec.ts` | none (two new tests appended, skipped unless `GR_LIGHTING_CALIBRATION=1`) |
| Attended on the merged tree `a05abdf1d` | see the drain commit message (tsc, build, the four suites, map-census, era pin, battery) |

## Findings
- **F-LLC-1 (fire-authorable):** `e3-moth-season`'s census brightness probe sits ON the 0.06 floor (0.048–0.060 across seven runs) because it aims through a gate opening against a 0.93 salt-flat ground; the render is identical to the pre-change tree — a marginal probe, not a look regression, but it will flicker.
- **Coupling recorded:** the reference rig carries terrain + landmark + hero but no town building — no map contract mounts one; town bodies live under `src/town/**` (NO). A town-material calibration is its own slice against `TownTavernPilot.ts`.
- **Owner veto:** REVERT-LIGHTING reverses the drain; `?lighting=legacy` compares live.
