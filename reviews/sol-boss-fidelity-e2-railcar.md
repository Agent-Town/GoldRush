# Epoch 2 Armored Railcar — fidelity and rail presentation

Branch: `sol/boss-art-fidelity-review`, base `d41ab98ce (archive: pruned by the A3 rewrite)`. Work dated 2026-09-08. No commit or deployment.

**Verdict: READY-FOR-GATES for the E2 pass.** The longer locomotive, exposed running gear, reservoirs, lanterns and armored cabin are visibly closer to the plate. Final desktop/mobile rendering, all three damage states, rail/proxy alignment, export reproducibility and lifecycle checks pass. This is a verified fidelity improvement, with the gameplay-scale limits below.

[Comparison gallery](../artifacts/boss-fidelity/e2-railcar/index.html) · [form reference](../assets/raw/plate-e2-boss-component.png)

## Changes and rationale

The old model compressed a long siege locomotive into a squat chassis. The revised body is longer while keeping the rail gauge. Wheels, gauges, lamps and vertical pressure fittings keep their round profiles as their attachment positions move along the chassis. Smaller hubs, five spaced axles, separate front/rear rods and outboard reservoirs restore the running-gear hierarchy. Narrow louvered windows, corrected sloping roof plates, a low roof guard, three cage lanterns, side cylinders and a rear platform recover identifying features from the painting.

A native-generated atlas replaces procedural striping with mottled iron, etched brass and restrained teal. The original plate remains the form reference. One shared material and one embedded 1024px atlas are retained; small rivets trade a few sides for the newly visible major fittings within the existing triangle ceiling.

The existing bent-wheel, venting-boiler and cracked-cabin morphs remain separate. Damage now reveals a jagged metal-edged cabin breach rather than broad black diagonal strips across its windows. Smooth overlapping steam puffs replace coarse teal polyhedra. The small plume remains a stylized solid mesh, with no new particle system.

The original runtime turned the whole train through 180 degrees when it reversed. Its simulation component offsets did not turn, leaving the visible cabin outside its own damage target on the return route. The render-only correction uses the rail tangent and original inward spawn direction: the train backs along the rail while retaining the physical arrangement of its components. Routes, HP, hit radii, targeting and degradation are unchanged.

## Verified asset evidence

| Property | Final export |
|---|---|
| Geometry | 11,936 triangles; ceiling 12,000; original 10,948 |
| Bounds, length × height × width | 3.30 × 1.242 × 1.248279; centered grounded base |
| Rail gauge | 0.78, unchanged |
| Component contract | Three original mesh names, one original damage morph each |
| Surface contract | One material, one embedded 1024×1024 PNG |
| GLB bytes | 2,922,104 |
| SHA-256 | `206a539a40c57791fc249c31912d98b00709d47ff808d6409cc1c89c0e99da21` |
| Saved Blender re-export | Byte-identical; no cameras, lights or animation clips |

See [export contract](../assets/pilots/railcar-3d/renders/wave4-asset-contract.json), [builder log](../artifacts/boss-fidelity/e2-railcar/build.log), [verification log](../artifacts/boss-fidelity/e2-railcar/verify.log) and [native provenance](../assets/layer-contracts/railcar.v1.json).

## Review findings and disposition

- **F-E2-01 — squat chassis and missing fittings, fixed.** The longer body, running gear, reservoirs, lamps and rear platform visibly improve the plate match. Fresh visual review confirmed the previous timber-like streaks and oversized hubs were resolved.
- **F-E2-02 — cabin and steam damage unclear, improved.** Smooth overlapping puffs and a jagged outlined breach replace coarse polyhedra and window-crossing dark strips. Steam remains stylized solid geometry; wheel damage is less obvious than boiler venting in a small still image.
- **F-E2-03 — return-route cabin target mismatch, fixed.** The train retains physical orientation when backing. The planar-velocity solution also avoids an intermediate sideways swing from folding interpolated yaw.
- **F-E2-04 — whole-component damage glow erased metal, fixed.** Runtime reuses the existing atlas as its emission map. White fill retains dark iron, brass and teal texture; damage adds only a restrained component tint. No texture object, map image, light or draw call is added. Matched .14/.55/.90 comparisons favored .90 for more margin in the dark scene; the independent visual reader preferred .55 as the lowest readable setting. Root chose .90 intact /1.0 damaged after inspecting the same frames.
- **F-E2-05 — nondeterministic fresh steam builds, fixed.** Independent source review reproduced varying UV mappings from Blender's UV-sphere operator and automatic unwrap. Explicit ring topology and UVs preserve the same smooth puff shape. Three fresh full source builds now produce identical GLB hashes, independently of the saved-scene re-export check. See [source check](../artifacts/boss-fidelity/e2-railcar/check-source-determinism.py) and [receipt](../artifacts/boss-fidelity/e2-railcar/source-determinism.json).
- **F-E2-06 — gameplay pixel limit, retained.** The roughly 90×45px desktop footprint supports the locomotive silhouette and broad mechanical detail. Lanterns appear as tiny highlights; distinct cyan illumination and fine etched reference detail remain limited at that scale. This pass does not change the gameplay camera.

## Runtime verification

| Check | Result | Evidence |
|---|---|---|
| All E2 routes and viewports | 6/6 passed; route reversal and intermediate render fractions, target fit, bar clearance, unchanged simulation snapshots | [standalone check](../scripts/check-railcar-presentation.mjs), [final result](../artifacts/boss-fidelity/e2-railcar/focused-check-final.jsonl) |
| Component material isolation | One atlas reused across three independent materials; morph and damage fill stay component-local | [independent runtime review](../artifacts/boss-fidelity/e2-railcar/material-runtime-review.log) |
| Existing encounter and lifecycle checks | 14/14 passed on desktop/mobile: arrival, component damage, persistent wreckage, final disposal, delayed-load death, lite mode and invalid-asset fallback | [unchanged suite log](../artifacts/boss-fidelity/e2-railcar/final-existing-tests.log) |
| Renderer-count expectations | Only mounted triangles change: desktop 124212→125200; mobile 120992→121980. Both +988 exactly match asset growth. Every other expectation and tolerance band stays unchanged. | [measured receipt](../artifacts/boss-fidelity/e2-railcar/count-receipts/expectation-update.json) |
| Actual final game rendering | Four states × two viewports; final GLB hash matches; zero console/page errors; exact crops from saved full PNGs | [desktop telemetry](../artifacts/boss-fidelity/e2-railcar/after/desktop.json), [mobile telemetry](../artifacts/boss-fidelity/e2-railcar/after/mobile.json) |
| Production build | `npm run build` passed on final asset and runtime source | [build log](../artifacts/boss-fidelity/e2-railcar/build-game-final.log) |
| Fresh source rebuilds | Three identical GLB hashes; separate saved-BLEND re-export also identical | [source receipt](../artifacts/boss-fidelity/e2-railcar/source-determinism.json), [asset verifier](../artifacts/boss-fidelity/e2-railcar/verify.log) |

Original assets, obstructed baseline frames and intermediate candidates remain in explicitly labeled folders. Final gallery frames use the `after/` batch and current binary. The [independent source follow-up](../artifacts/boss-fidelity/e2-railcar/asset-review-followup.log) confirmed the determinism fix, outward closed topology, nondegenerate atlas UVs and intact/morphed export correspondence, with no remaining finding.

## Reproduce

The [asset README](../assets/pilots/railcar-3d/README.md) lists build, verify and render commands. With a scratch Vite server on port 5246, run `node scripts/check-railcar-presentation.mjs http://127.0.0.1:5246` for route, interpolation, target-fit and snapshot checks. The evidence capture helper uses diagnostic spawns and records exact PNG crop equality, asset hashes and console/page errors; this is not a natural campaign playthrough.

Integration scope: E2 builder/GLB/BLEND, native atlas and registry, measured asset and renderer-count receipts, railcar-only render orientation/material/height/triangle admission, one standalone check and evidence. Existing e2e source, simulation contracts, STATUS, backlog, ratified specs and history are unchanged. No merge or deployment was performed.
