# 3D-C-BETA — Dust Flats landmark pack handoff

**Branch:** `sol/lm-beta-dust-flats`
**Fresh reference:** `27587b7c6efbb804743f9f6aad192fd8df52bfd2` (`origin/main` at branch cut)
**State:** `READY-FOR-GATES`

## F-LM-BETA-DUST-01 — Sculpt and boards read before proposal

Dust Flats is a dry 160 x 160 m motor plain whose dominant authored landform is the wheel-cut orbit road, not a settlement. The sculpt contract also reserves four build fields, four road corridors, a diagonal dry wash, twelve harvest anchors, tar seams, the loss stake, and all four spawn edges. Runtime ownership of the orbit, spawns, roads, weather, wash, harvest, tar, and loss state remains unchanged.

The body set therefore reads as a sparse county service chain around the motor circuit: watch the storm, recover a disabled vehicle, refuel, chart the grade, and lift salvage from the wash. It does not add a town centre or compete with the orbit ring.

## F-LM-BETA-DUST-02 — Published stable ID list

The following IDs were published before body construction and are the complete handoff to 3D-D:

1. `north-railhead-storm-tower`
2. `west-road-wrecker-shed`
3. `east-horizon-fuel-reserve`
4. `south-grade-charting-post`
5. `dry-wash-recovery-gantry`

The pack contract preserves that order in `proposedIds`. Canonical `mounts` and the terrain contract's `landmarkMounts` both remain empty; `mountInterlock` is `pending-3d-d`.

## F-LM-BETA-DUST-03 — Production bodies

| Stable ID | Ladder tier | Triangles | Source basis |
| --- | --- | ---: | --- |
| `north-railhead-storm-tower` | derive | 628 | E4 watchtower art + road-marker vocabulary |
| `west-road-wrecker-shed` | reuse | 2,044 | E4 filling shed + water trough; open salvage hoist, no wagon or firearm silhouette |
| `east-horizon-fuel-reserve` | reuse | 2,380 | E4 fuel rack + water trough |
| `south-grade-charting-post` | derive | 348 | E4 grader-post art + motor-roadway vocabulary |
| `dry-wash-recovery-gantry` | reuse | 2,084 | E4 road marker + motor roadway + water trough |

All five are separate, base-centred render-only GLBs; each has one mesh, one primitive, one material, one embedded shared 1024 px atlas, no camera/light/animation, and a 3,000-triangle cap. Blender re-export is byte-identical and semantic-identical for every body.

## F-LM-BETA-DUST-04 — Conservative preview clearance

Preview transforms exist only to prove that a viable mounted composition exists. The durable report hashes the current mask truth, preview transforms, and current GLB bounds so stale clearance evidence cannot pass verification.

| Stable ID | Tightest authored constraint | Margin |
| --- | --- | ---: |
| `north-railhead-storm-tower` | north build field | 1.103 m |
| `west-road-wrecker-shed` | boss-road shoulder | 1.832 m |
| `east-horizon-fuel-reserve` | map edge | 3.950 m |
| `south-grade-charting-post` | map edge | 5.146 m |
| `dry-wash-recovery-gantry` | dry wash | 2.342 m |

The proof checks nine constraint families: build fields, road shoulders, orbit reserve, dry wash, harvest anchors, tar seams, loss stake, the boot-time hero-centred spawn ring, and map edge. Later waves remain centred on the moving hero, so no static scenery layout can prove separation from every future spawn point; those bodies are render-only and own no collision. The minimum accepted static margin is greater than 0.20 m. Exact values and rotated AABBs are in `artifacts/map-rebuild-spike/dust-flats-landmarks/clearance-metrics.json`.

## F-LM-BETA-DUST-05 — Visual evidence and correction loop

The fixed run-camera comparison reports `parityDistance 0.00240`, edge-energy ratio `0.99858`, luminance delta `-0.19472`, grayscale MAE `0.22554`, and pixelmatch ratio `0.00354`. These are telemetry, not an acceptance threshold.

The first unprimed visual review returned REVISE: the storm tower sat too close to the playable edge, the first wrecker silhouette resembled a gun carriage, shadows hid body connections, and clearance evidence was hard to audit. Corrections moved the tower inward, rebuilt the wrecker as an open A-frame salvage shed, added front/rear fills, labelled the bare/proposed comparison, and added a square nine-colour clearance board with five exact-margin zooms. A later clearance-semantics pass exposed clipping in the turntable, so the lineup camera was widened and the final fresh unprimed reviewer returned **SHIP (high confidence)** with no blocker/high/medium issues. All four angles fully frame the tower and gantry; the five silhouettes remain distinct; the wrecker reads as salvage; and the clearance legend separates orbit and initial-spawn evidence.

## F-LM-BETA-DUST-06 — Scope and gate evidence

- Canonical terrain contract: unchanged; `landmarkMounts: []`; no `landmarkPack` entry.
- Pack contract: `mounts: []`; `mountInterlock: pending-3d-d`; five ordered `proposedIds`.
- Source ladder: 3 reuse / 2 derive / 0 build-new.
- Scoped Blender verifier: 1 pack / 5 assets; hashes, board sizes, source records, triangle caps, and deterministic re-export green.
- TypeScript: `npx tsc --noEmit` green.
- Production bundle: `npm run build` green (existing Vite chunk-size advisory only).
- Repository hygiene: `git diff --check` green; generated bytecode excluded from the handoff.
- Split audit: no E6-E10 map-specific path, ID, contract, or asset changed.
- Simulation: unchanged.

**Integration note:** after this owner-directed BETA E2-E5 goal was underway, base commit `27587b7c` assigned Dust Flats to ALPHA and a separate `sol/lm-alpha-dust-flats` worktree began an overlapping implementation. The direct owner instruction for this task explicitly retains E2-E5 under BETA and defines ALPHA's protected maps as E6-E10, so this branch follows that higher-priority scope. It does not read from, write to, reset, or reconcile the ALPHA worktree. The orchestrator must choose one Dust Flats implementation at drain time; the branches are not mechanically stackable.

Independent Codex review found four code-level P2s across its passes: stale positive clearance evidence, a map-edge proxy incorrectly labelled as runtime spawn clearance, an unbounded collinear segment predicate, and an input hash that could not detect algorithm-only changes. The verifier now recomputes the pure clearance calculation and compares the entire report; the proof measures the actual boot-time radius-26 hero-centred spawn ring and explicitly scopes out later moving-hero spawns; and segment intersection handles collinear endpoints only when they lie within both segment bounds, with separated/overlapping collinear self-checks. The reviewer also raised the external ALPHA assignment conflict documented above; that is resolved only by the owner's explicit scope precedence and orchestrator choice, not by mutating another worker's branch.

The final scoped read-only Codex review of the corrected publish candidate returned **No code findings**.

## Bodies to the bar — 3D-D handoff

3D-D owns the final mount records and terrain grounding. Use the five IDs above and assets from `assets/pilots/map-rebuild-spike/landmarks/dust-flats/`; do not copy the preview transforms blindly. Preserve the wheel-cut orbit as the dominant landform and re-run the nine-constraint static clearance check after composing canonical mounts. Dynamic hero-centred spawn overlap is visual-only and cannot be certified by a fixed map transform.
