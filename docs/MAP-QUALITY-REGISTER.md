# THE MAP QUALITY REGISTER — cross-map defect/optimization classes
Owner-ordered 2026-07-19 ("we should be tracking these bugs/improvements... these topics will come up for all the maps. If we can do it for one, then we probably can also do it for the others."). LAW: every playtest finding lands here as a CLASS (not a map instance); every class is fixed ONCE at the mechanism; a class is only CLOSED when the census harness proves it on EVERY map. Intake sessions append; drains update status; the census harness is the referee.

| ID | Class (symptom, any map) | Mechanism owner | Fix | Status | Census check |
|---|---|---|---|---|---|
| MQ-1 | World-anchored visuals under 3D: previews ✅, floats/pickups ✅, WRECK-state slabs slope-swallowed (Baron replay) | Planar-picking law + previews ride visualY (BuildSystem) | run3d-interaction ✅ 0ac21af2 | FIXED — census sweep owed | preview visible + click-coord identity per map |
| MQ-2 | Map edge breaks: legacy surround, painted patches bleeding through, boot-camera band/stripe, edge wedge | Full legacy-layer suppression under 3D + continuation-to-horizon + panorama framing (Terrain3dClaimPilot) | panorama-band-framing (queued b) | IN FLIGHT — REPRODUCED: backplate enters frustum at aspect >1.8:1 (cam-claim-wide.png); aspect matrix added to spec | no-legacy-pixels probe + band-row scan + edge screenshot per map |
| MQ-3 | Solidity: footprints ✅ + THE NEVER-TRAP LAW (owner got stuck inside a building — depenetration owed) | Data footprints via the one collision channel + legacy-primitive suppression guards | landmark-collision (requeued a) | IN FLIGHT | hero-blocked probe per mounted map + one-pan assertion |
| MQ-4 | Frame collapse on heavy maps; weak machines worse | Measured culprit fix + RUNTIME AUTO-TIERING (rolling p95 watchdog, stepwise degrade) | night3d-perf ✅ (auto-tiering live) | FIXED — census owed | p95-within-15%-of-2D per map, worst-case matrix incl. night-shift |
| MQ-5 | Era content invisible on era maps (weapons/systems locked to profile frontier) | &era=N debug door (shipped) + board era-chapters (frontier truth) | era-seed ✅ · board-era-chapters (laddered) | PARTIAL | era-item-present probe per eN map with &era=N |
| MQ-6 | Wrong/duplicate card art | Three-tier card resolution + engraved plate batches | board-cards (main, running) + art 027-031 | IN FLIGHT | unique-image-per-card assertion (board spec) |
| MQ-7 | Player-facing promises vs engine truth: contract cards AND research nodes (meta-speak leak: "future Frontier update") | Per-map consumers (e9-canal precedent) — audit all 41 cards vs engine truth | e9 ✅ · AUDIT OWED for the other 40 | OPEN | card-claims audit table (manual+cited) |
| MQ-8 | Same enemies on every map | Era rosters E6-E10 (design ✅ merged → art → wiring) | roster pipeline | IN FLIGHT | era-roster-present probe per eN map |

| MQ-9 | Scene-swap camera distortion (zoomed/stretched until refresh) + stale ?contract in URL hijacking the refresh | Camera-truth re-sync law at swap seams + URL hygiene on return | scene-swap-camera ✅ | FIXED — census owed | cameraAspect==cssAspect dataset assertion per swap, in census |

| MQ-10 | Night mode under 3D: light pools dark on mesh, night pressure collapsed (no wall assault, snipeable), enemy light-cone silhouettes read as unintended anatomy | One light-truth source on the mesh + assault-gating root cause + recomposed night read | lane-night-mode-truth (queued d, after night3d-perf) | IN FLIGHT | light-pool-on-mesh probe + walls-receive-assault assertion, night maps |
| MQ-11 | Safari return-to-town parity: stale run HUD and strict WebGL 3D-texture upload errors | Exception-safe scene teardown + reused-context unpack-state reset | safari-swap ✅ | FIXED — census owed | WebKit swap ladder: run HUD absent + town blockers solid + zero console/page errors |

## THE CENSUS HARNESS (the referee)
`e2e/map-census.spec.ts` (task: lane-map-census) boots ALL 41 doors headlessly and asserts the CLOSED classes' checks per map, emitting one artifact table (map × class → PASS/FAIL). A class flips CLOSED only when its column is green across the census. New classes append here first, then get a census column.

Safari parity is the permanent WebKit spot column: the `webkit` project in `playwright.scratch.config.ts` runs `safari-swap.spec.ts` (swap + plain boot) and the town case from `never-trap.spec.ts` with no silent skips.
