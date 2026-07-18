# 3D-C-BETA — Fairground landmark pack

- Branch: `sol/lm-beta-fairground`
- Fresh reference: `30576b07f2d4a14a65ac5692068f1c1d94b9d388`
- Verdict: **READY-FOR-GATES**
- Scope: Fairground only. No E6–E10 pack functions, assets, contracts, artifacts, or map-specific ledger entries may change.
- Interlock: production bodies are mount-agnostic; canonical `landmarkMounts` remain empty and owned by 3D-D.

## F-FG-01 — Sculpt and board read

The run camera, overview, mask-agreement board, night-cycle board, terrain contract, authoritative E3 mask table, and runtime `FerrisWheel`/coverage systems define Fairground as an 88 m bruised festival bowl. Three large build rectangles own the south midway and opposed pavilion shelves. The exact wheel fixture sits at the north end of the central aisle, while `fair-gate` marks the southern loss stake and west/east/north edges own spawning.

The runtime wheel is already a power producer and elevated watch light while spinning; it stops after first positive damage. The paired pavilions also remain runtime coverage sources. This pack therefore reads as **arrive → hear → wager → watch → ring out** around that existing core. It does not replace the wheel or pavilions and does not claim power, light, crowd, spawn, loss, placement, or damage authority.

## F-FG-02 — Published ID list

1. `south-midway-admission-arch`
2. `west-current-calliope-wagon`
3. `east-mothglass-prize-cage`
4. `north-crowd-counting-rostrum`
5. `fair-bell-battery-kiosk`

The arch gives the broad south approach a ritual threshold without occupying its build rectangle. The calliope and mothglass cage give the two pavilion flanks different sound and prize silhouettes. The rostrum turns the north lip into a crowd-counting perch, while the compact bell kiosk closes the central aisle south of the canonical wheel. Source intent is `reuse` for the calliope, rostrum, and kiosk and `derive` for the arch and cage, with one E3 ink-blue, worn-copper, parchment, rust, and voltage-teal atlas.

## F-FG-03 — Production body contract

The published IDs resolve to five separate atlas-backed GLBs plus one source `.blend`:

| ID | Ladder | Triangles | Defining body family |
|---|---:|---:|---|
| `south-midway-admission-arch` | derive | 1,324 | broad insulator-and-wire admission dial over two stone feet |
| `west-current-calliope-wagon` | reuse | 2,696 | covered wagon show deck with stepped brass pipes, key rail, and crank |
| `east-mothglass-prize-cage` | derive | 1,048 | round four-post prize cage with roof braces, bell pull, medallion, and supported crank wheel |
| `north-crowd-counting-rostrum` | reuse | 1,196 | wide stepped counting stand beneath a roof-heavy canopy |
| `fair-bell-battery-kiosk` | reuse | 1,268 | compact battery kiosk with roof belfry, punch plate, and grounded pull |

Every body is below the 3,000-triangle cap. The scoped Blender verifier reports one pack, five assets, and the intended `reuse: 3 / derive: 2 / build-new: 0` source ladder. Re-export verification is byte-stable for every GLB. The contract publishes `mounts: []`, `mountInterlock: pending-3d-d`, and simulation `none`; it does not write terrain, collision, movement, placement, water, spawn, fog, lighting, crowd, power, loss, or damage state.

## F-FG-04 — Clearance proof

The evidence-only transform proposal is checked with rotated GLB AABBs against the authoritative 88 m mask table, not by eyeballing the white rectangles. All five footprints remain inside the map and outside all three authored build zones:

| ID | Tightest authored-zone clearance | Spawn-edge clearance | Map-edge margin |
|---|---:|---:|---:|
| south admission arch | 1.907 m from `south-midway` | 39.663 m | 2.307 m |
| west calliope | 0.206 m from `west-pavilion` | 0.206 m from west line | 0.806 m |
| east prize cage | 0.702 m from `east-pavilion` | 0.702 m from east line | 1.302 m |
| north rostrum | 2.073 m from `west-pavilion` | 6.473 m from north line | 7.073 m |
| bell kiosk | 7.210 m from `south-midway` | 40.953 m | 39.210 m |

The closest body remains 7.410 m from the exact wheel fixture and 9.907 m from the `fair-gate` loss stake. The diagnostic renders cyan build-zone outlines, the gold wheel-fixture rectangle, the rust loss-stake ring and three spawn edges, and white body footprints from the same bounds. Runtime wheel/pavilion helper bodies are hidden only in this diagnostic so the proof lines cannot be mistaken for mounts. Fairground remains dry: no river or water stand-in is added. The transforms, scales, rotations, orthographic composition camera, and evidence lights are proposal evidence only and are not copied into the terrain contract.

## F-FG-05 — Adversarial visual loop changed the evidence and one connection

The first fresh unprimed critique returned **REVISE** because the side bodies collapsed into edge-on colored smears, the north/core grounding was too dark and soft at gameplay scale, the clearance proof mixed canonical pavilion helpers with its zone outlines, and the cage crank wheel looked unsupported.

The accepted correction addressed those visible failures rather than lifting the whole scene:

- Fairground world evidence now renders at 1600×900, with camera-side landmark pools that preserve the night sculpt while exposing bases and body faces.
- The calliope turns toward the camera vector while the prize cage squares to its flank strip; their evidence scales retain daylight on both sides of the narrow legal corridors between pavilion zones and spawn lines.
- A separate orthographic overview holds all five placements at equal scale while the original perspective pair remains the fixed bare/proposed telemetry frame.
- The north rostrum gains a verdict-only face light; the canonical wheel and pavilions remain centered and unobscured.
- The cage production body gains an explicit iron crank axle, removing the only high-confidence floating-detail read.
- The clearance diagnostic hides runtime helpers and mounted bodies, leaving the authoritative zone/fixture/spawn/stake lines and exact white AABBs legible.

The second fresh reviewer returned **SHIP** with no blockers: five bodies countable and silhouette-distinct, connected and visibly grounded primary forms, unclipped outlines, the wheel/pavilions dominant, and five white footprints visibly outside cyan zones and the gold fixture. Independent code review then caught that the first flank proposal crossed the exact west/east spawn lines and that the generic board path rendered a synthetic river on this dry map. The final correction added Fairground to the dry-map renderer, contracted the calliope within the west strip, and squared the cage within the east strip. A fresh unprimed correction reviewer returned **SHIP**: neither flank AABB visibly crosses its spawn line, the map is dry, and all five bodies remain countable. Non-blocking polish is limited to soft/dim side landmarks and wheel at whole-map scan scale, plus white/gold strokes converging slightly in the small verdict composite; the full 1600×900 evidence and tight crops retain the distinction.

## F-FG-06 — Exact-frame telemetry

The final fixed-camera bare/proposed pair is 1600×900 with distance `0.00744`. Grayscale MAE is `0.36541`, RMSE `3.60847`, pixelmatch ratio `0.00410`, and the ≥32 difference ratio is `0.00244`. Candidate edge energy is `1.01918×` the bare frame while average luminance changes only `-0.05930`; the body evidence adds local structure without relighting the canonical night bowl. The side-by-side, absolute diff, pixelmatch, grayscale, and edge artifacts are stored under `artifacts/map-rebuild-spike/fairground-landmarks/comparison/`, with tight body and world crops beside them.

## F-FG-07 — Gates and split audit

- Blender 5.1.2 scoped verifier: PASS — 1 pack / 5 assets / `3 reuse, 2 derive, 0 build-new`.
- Python AST/bytecode parse for pack builder, verdict-board builder, and verifier: PASS.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- Independent `codex review --uncommitted`: PASS after correction — the first pass found spawn-line intersection and synthetic water; the targeted pass verified both substantive P2s resolved, then caught a stale post-rerender verifier manifest. The scoped verifier was rerun and all seven recorded board hashes now match the corrected evidence.
- Split audit: no E6–E10 map-specific function, contract, asset, artifact, or ledger entry is added or modified. Split-safe ledger recovery retains already-ledgered ALPHA records without newly importing absent ALPHA packs.

## F-FG-08 — 3D-D handoff

3D-D should mount only the five stable IDs in F-FG-02 after re-reading current gameplay clearances. The white-footprint proposal is a tested starting point, not canonical authority. Preserve all three build rectangles, the wheel fixture, `fair-gate`, west/east/north spawn-edge semantics, the broad south approach, and the runtime Ferris wheel/pavilions as the only power and coverage owners. Do not infer light, crowd, power, spawn, loss, collision, placement, targeting, pathing, or damage behavior from these render-only bodies or their evidence lights.
