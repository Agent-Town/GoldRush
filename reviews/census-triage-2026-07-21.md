# Census triage — 2026-07-21 first table

Source: `artifacts/map-census/table.md` at `2026-07-20T08:11:57.651Z`. It contains 119 raw FAIL cells across 27 maps. Grouped cell ranges below are exhaustive: a range such as `Render–Brightness` covers each individual FAIL cell in that range.

| Map | FAIL cell(s) | Verdict | Evidence / owner |
|---|---|---|---|
| e2-pressure-garden | Mobile spot (`brightness`) | REAL | Brightness census class (no MQ ID yet); `tasks/corrective-census-landmark-brightness.md`. |
| e3-blackout-ridge | MQ-2 band | PROBE-BUG | A single quiet-sky row is not a legacy-band detector; use the renderer's framing/fog/continuation truth. |
| e3-moth-season | MQ-2 band | PROBE-BUG | Same quiet-sky false positive. |
| e3-moth-season | Landmark brightness | REAL | Brightness census class; `tasks/corrective-census-landmark-brightness.md`. |
| e3-canyon-works | MQ-2 band | PROBE-BUG | Same quiet-sky false positive. |
| e3-canyon-works | Landmark brightness | PROBE-BUG | MQ-3 probe left manual simulation enabled, so the later camera crop sampled the wrong pixels. |
| e4-long-road | MQ-1 preview | PROBE-BUG | The fixed `-50..50` search ignores this 400-wide map; use contract build zones and reproject until the pointer/ghost identity settles. |
| e5-deepwater-claim | Landmark brightness; Mobile spot (`brightness`) | N/A-BY-DESIGN | `terrainMesh: off` water contract has no applicable mounted-landmark target. |
| e5-regatta | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors` marks the contract unavailable; the fallback door and its five `not run` cells are one expected cascade. |
| e5-stillwater | Landmark brightness | N/A-BY-DESIGN | `terrainMesh: off` water contract has no applicable mounted-landmark target. |
| e5-flotilla | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e6-glow-mesa | Render | REAL | MQ-2: post-load 3D install falls back to painted; `tasks/corrective-census-glow-mesa-3d.md`. |
| e6-glow-mesa | Landmark brightness | REAL | Downstream of the same MQ-2 load failure: no landmark mounts become available. |
| e6-glow-mesa | `<=10s` | REAL | MQ-4; same load/performance cluster and corrective task. |
| e6-half-life-hollow | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e6-picnic | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e7-relay-valley | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e7-echo-canyon | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e7-dead-band | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e7-relay-rush | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e8-mare-claim | MQ-2 band | PROBE-BUG | Same quiet-sky false positive. |
| e8-far-side | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e8-low-orbit | Boot; Render–Brightness; Mobile spot (`boot, render, mq1, mq2, mq3, brightness`) | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; both desktop and mobile cascades are exempt. |
| e8-eclipse | MQ-2 band | PROBE-BUG | Same quiet-sky false positive. |
| e9-seed-run | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e9-devils-alley | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e9-old-canal | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e10-ember-shore | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e10-archive-world | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e10-last-claim | Boot; Render–Brightness | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; expected unavailable-door cascade. |
| e10-river | Boot; Render–Brightness; Mobile spot (`boot, render, mq1, mq2, mq3, brightness`) | N/A-BY-DESIGN | Explicit empty `harvestAnchors`; both desktop and mobile cascades are exempt. |

The corrected probe encodes unavailable contracts and non-applicable brightness/mobile cells as `PASS-exempt`, restores manual simulation after MQ-3, takes MQ-1 candidates from contract build zones, and replaces the invalid one-row MQ-2 heuristic with the renderer's published world-framing contract. Remaining real cells name one of the two unqueued corrective tasks instead of emitting a raw FAIL.
