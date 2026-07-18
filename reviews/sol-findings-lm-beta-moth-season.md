# 3D-C-BETA — Moth Season landmark pack

- Branch: `sol/lm-beta-moth-season`
- Fresh reference: `c965f00003ba57a978e88705351307ce3c2cf741`
- Verdict: **READY-FOR-GATES**
- Scope: Moth Season only. No E6–E10 pack functions, assets, contracts, or map-specific ledger entries may change.
- Interlock: production bodies are mount-agnostic; canonical `landmarkMounts` remain empty and owned by 3D-D.

## F-MS-01 — Sculpt and board read

The run camera, overview, mask-agreement board, low-sunset board, shipped Decoy Shed capture, terrain contract, and authoritative E3 mask table define Moth Season as two exhausted lamp yards flanking a black north/south migration corridor. There is no river, no authored spawn gate, and no permanent map fixture to invent. The body pack therefore reads as **watch → pass quietly → shelter → tithe → count**, not as a Canyon Works recolour or a replacement for the gameplay Decoy Shed.

The west and east yards are player build zones. The central corridor is also a build zone whose gameplay meaning comes from selective darkness. Evidence-only body placements must keep all three rectangles clear and must not imply that a preview lamp, gate, or cage writes light coverage, moth targeting, spawn direction, or pathing state.

## F-MS-02 — Published ID list

1. `north-migration-watch-gate`
2. `south-quiet-road-gate`
3. `west-lamplighter-refuge`
4. `east-tithe-bell-house`
5. `mothglass-counting-cage`

The north and south gates frame the quiet road without lighting it. The refuge and bell house give the two yards different social roles without occupying their build masks. The counting cage turns the annual migration into a frontier ritual and remains distinct from the cheap, rebuildable Decoy Shed. Source intent is `reuse` for the refuge and paired gates, `derive` for the bell house and counting cage, with one shared E3 ink-blue, worn-copper, moth-parchment, and restrained voltage-teal atlas.

## F-MS-03 — Production body contract

The published IDs resolve to five separate atlas-backed GLBs plus one source `.blend`:

| ID | Ladder | Triangles | Defining body family |
|---|---:|---:|---|
| `north-migration-watch-gate` | reuse | 1,576 | tall watch portal with a solid raised count cabin |
| `south-quiet-road-gate` | reuse | 1,480 | low, broad fabric hush barrier |
| `west-lamplighter-refuge` | reuse | 1,088 | roof-heavy shelter with a connected awning and keeper medallion |
| `east-tithe-bell-house` | derive | 1,076 | seven-metre open belfry over a compact tithe house |
| `mothglass-counting-cage` | derive | 2,096 | round brass counting cage with a grounded four-post frame |

Every body is below the 3,000-triangle cap. The scoped Blender verifier reports one pack, five assets, and the intended `reuse: 3 / derive: 2 / build-new: 0` source ladder. Re-export verification is byte-stable for every GLB. The contract publishes `mounts: []`, `mountInterlock: pending-3d-d`, and simulation `none`; it does not write terrain, collision, movement, placement, water, spawn, fog, lighting, moth targeting, or Decoy Shed state.

## F-MS-04 — Clearance proof

The evidence-only transform proposal is checked with rotated GLB AABBs against the authoritative 80 m mask table, not by eyeballing the white rectangles. All five footprints remain inside the map and outside all three authored build zones:

| ID | Tightest authored-zone clearance | Map-edge margin |
|---|---:|---:|
| north watch | 1.472 m from `dark-corridor` | 1.072 m |
| south quiet road | 0.824 m from `dark-corridor` | 0.424 m |
| west refuge | 0.598 m from `west-lit-yard` | 0.198 m |
| east bell | 1.214 m from `east-tithe-yard` | 0.814 m |
| counting cage | 3.684 m from `west-lit-yard` | 5.684 m |

The clearance board renders teal west/east yards, the gold quiet-road rectangle, red north/south spawn edges, and white body footprints from those same bounds. Moth Season remains dry: no river or water stand-in is added. The transforms, scales, rotations, and evidence lights are proposal evidence only and are not copied into the terrain contract.

## F-MS-05 — Adversarial visual loop changed the bodies

The first fresh unprimed critique rejected the pack because the two gates collapsed to one portal silhouette, the refuge and bell house collapsed to one shed silhouette, small accents appeared unsupported, night evidence hid identity, and the cage touched the turntable edge. A second fresh critique still rejected a merely taller North gate because South remained a shortened copy.

The accepted correction changed production geometry rather than masking the problem with exposure:

- North gained a solid elevated watch cabin and count window; unsupported gold vanes and hangers were removed.
- South lost the tall portal wire and became a low roofed hush barrier with broad cloth wings.
- The refuge received a connected medallion mount, awning, and roof-lead support.
- The bell house became a tall open belfry with braces, a visible bell tether, and a ground-running pull.
- The lineup camera pulled back until every body remained fully inside all four inspection panels.
- Evidence-only cool North and warm South face lights make the two thresholds legible without lighting the broad central route.

The final fresh reviewer returned **READY WITH NON-BLOCKING NOTES**: five distinct body families, connected/grounded primary parts, full unclipped outlines, five countable overview placements, and a dark prop-free central route. Non-blocking debt is limited to softer cage internals and the east bell reading more compactly in the foreshortened run view; the neutral lineup and turntable preserve their defining faces.

## F-MS-06 — Exact-frame telemetry

The final fixed-camera bare/proposed pair is 1280×720 with parity distance `0.03903`. Grayscale MAE is `1.83921`, RMSE `8.09933`, pixelmatch ratio `0.01822`, and the ≥32 difference ratio is `0.01303`. Candidate edge energy is `1.12944×` the bare frame while average luminance changes only `-1.16436`; the body evidence therefore adds local structure rather than lifting the whole night sculpt. The side-by-side, absolute diff, pixelmatch, grayscale, and edge artifacts are stored under `artifacts/map-rebuild-spike/moth-season-landmarks/comparison/`, with tight body and run crops beside them.

## F-MS-07 — Gates and split audit

- Blender 5.1.2 scoped verifier: PASS — 1 pack / 5 assets / `3 reuse, 2 derive, 0 build-new`.
- Python AST parse for pack builder, verdict-board builder, and verifier: PASS.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; existing Vite chunk-size advisory only.
- `git diff --check`: PASS.
- Independent `codex review --uncommitted`: PASS — no actionable correctness issues; the reviewer independently reran the scoped Blender verifier, TypeScript/Vite production build, and diff checks.
- Split audit: no E6–E10 map-specific function, contract, asset, artifact, or ledger entry is added or modified. Split-safe ledger recovery retains already-ledgered ALPHA records without newly importing absent ALPHA packs.

## F-MS-08 — 3D-D handoff

3D-D should mount only the five stable IDs in F-MS-02 after re-reading current gameplay clearances. The white-footprint proposal is a tested starting point, not canonical authority. Preserve all three build rectangles, the north/south spawn-edge semantics, the unlit central journey, and the cheap rebuildable Decoy Shed as the only gameplay light sacrifice. Do not infer illumination coverage, moth attraction, spawn gates, collision, pathing, or targeting from these render-only bodies or their evidence lights.
