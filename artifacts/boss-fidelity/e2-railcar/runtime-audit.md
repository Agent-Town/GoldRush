# Armored Railcar runtime constraints

Read-only audit on 2026-09-08 before E2 runtime changes. E1 changes already present in the shared checkout.

## Asset admission and placement

- `src/entities/pools.ts:1542` lazily loads the GLB only for the full tier. A load serial rejects stale callbacks; invalid geometry or failed loads retain the painted fallback. LITE does not request the GLB.
- `src/entities/pools.ts:1581` requires exactly three meshes, one shared source material, and exactly 10,948 triangles. Each named mesh must expose exactly one morph and resolve the required name to index zero: `Railcar_Wheels/Damage_BentWheels`, `Railcar_Boiler/Damage_VentingBoiler`, `Railcar_Cabin/Damage_CrackedCabin`. Each component receives an independent material clone after admission.
- `src/entities/pools.ts:43` hard-codes 1.202 height for the mounted boss bar; `:1424` adds .35 clearance. The rendered object stays at unit scale, regardless of each simulation component's contract visual scale.
- `src/entities/pools.ts:1604` initializes the rendered center as the average of active component positions, stores their world offsets, then derives later centers from the first live component minus its saved offset. Root Y is visual terrain at the center plus .125; yaw is `PI / 2 - renderRotationOf(anchor)`.
- `src/entities/pools.ts:1684` suppresses off-field arrival until a component enters the field bounds plus a six-unit rim; once entered, visibility remains on during the return patrol.
- The current loaded model is 2.4 units long and 1.202 high. There is no runtime bounds, rail-gauge, wheel-contact, per-mesh triangle, material-type, or finite-morph-coordinate guard beyond the checks above.

## Damage and simulation boundaries

- All three E2 railcar contracts (`e2-hill-mine`, `e2-trestle`, `e2-incline`) share the same component HP/scales/offsets and speed settings. Hill Mine runs west/east on a shallow curve; Trestle runs south/north at X=0; Incline runs south/north at X=-12. Each uses route zero and speed 1.9.
- `src/systems/WaveSystem.ts:885` projects component contract offsets along the first-to-last route vector, then gives each component an independently offset copy of the route. Offsets are wheels (0,-.55), boiler (1.15,0), cabin (2.3,.55), relative to the route start. They are not derived from model mesh bounds or pivots.
- In the intact baseline, simulation hit radii are 1.728 (wheels), 2.0736 (boiler), and 1.8432 (cabin), much larger than individual visible parts. Combat remains based on these proxies, not triangles.
- `src/entities/pools.ts:1622` latches a component's morph to one at HP <=50%. Returning its HP above the threshold does not clear the latch during the same mount; restoring a suspend snapshot clears/reloads presentation. Morph changes are binary.
- `src/entities/pools.ts:1641` sets whole-component emissive color/intensity every frame: wheels orange/2.4, boiler teal/.9, cabin ochre/.9; intact is black/0. The existing material has no emissive map, so damage glows across the whole mesh. New authored emissive intensity/color would be overwritten by this code.
- `src/systems/CombatSystem.ts:954` remains the death owner. A kill invokes `degradeBossGroup` (`pools.ts:864`) and multiplies all surviving component speeds by .82 (`Enemy.ts:784`). Merely crossing 50% HP does not slow movement. Destroyed mesh wreckage remains while another group member survives (`pools.ts:1648`); the final death disposes the model, geometry, and textures.
- `src/entities/Enemy.ts:1237` reverses each route point list on reaching its end. Fixed component world offsets do not reverse. The rendered model rotates with the first live component.

## Fidelity concerns to resolve deliberately

The model's cowcatcher points toward local -X, while outbound +X travel currently yields approximately zero model yaw. Consequently the cab leads and the cowcatcher trails. The return turn rotates the entire asset, keeping the cab leading. A yaw-only reversal would also move the visual cabin to the opposite side of the still-fixed simulation proxies. This is a presentation/target-fit issue to decide explicitly, not a reason to change route or damage semantics in an art pass.

`probe-facing.mjs` independently measured the live nose/velocity dot product at -1.000 on both outbound and return. Cabin mesh-center distance from its damage proxy rises from .595 units outbound to 2.067 units on return, beyond its 1.8432 hit radius. A small render-only option is to fold tangent yaw by PI to retain the stock's original orientation along the inward spawn-edge axis (`Enemy.ownEdge`, west for Hill Mine and south for the other two E2 contracts). It would reverse along the rail without turning the chassis around, keeping the cab on the same side as its fixed damage proxy. The initial outbound leg would still run cab-first; the return would be cowcatcher-first. A constant extra PI instead merely transfers the mismatch to the outbound leg. This option is proposed only; not implemented in this read-only audit.

The original test's 22-second position put the small railcar under boiler-house/chimney occlusion. The retained `before-occluded` evidence demonstrates that problem. Final baseline uses the same route at 15 seconds, clear of the boiler house, with existing manual-simulation hooks and natural UI expiry.

## Existing verification hooks

- `e2e/wire-railcar-3d.spec.ts`: full GLB mount, all three morphs, preserved wreckage, return patrol, resource disposal, delayed-load death, invalid-GLB fallback, and LITE no-request behavior. Mounted bar must remain below Y=2 and at scale one. No exact 10,948 expectation in existing e2e.
- `e2e/fix-e2-railcar-read.spec.ts`: rail visibility, ground height, velocity alignment, out/return movement, shared boss bar, full defeat, and threshold diagnostic state after real damage.
- `e2e/e2-enemies.spec.ts:135`: three-component arrival, spacing, degradation after part death, and final secured state.
- `e2e/e2-trestle.spec.ts:60` and `e2e/e2-incline.spec.ts:52`: sibling-contract spawn and routing consumers.
- New evidence helper `capture-runtime.mjs` uses existing `__GR_TEST__` hooks, observes the actual running Game module URL before navigation, captures the live Game only inside the test page, and records live mesh bounds/morphs/material values/proxy positions with each pose. No production probe additions.
- Every `-props.png` is extracted directly from its saved full PNG using Sharp; integer crop rectangle, source/crop SHA-256, and decoded raw-pixel equality are recorded in each viewport JSON. Asset SHA-256 must remain unchanged for the entire desktop/mobile capture batch.

No E2 source, contract, asset, existing test, or gameplay semantics changed during this audit.

## Subsequent authorized implementation

The orchestrator authorized the render-only reversal correction after the read-only audit. `pools.ts` now derives chassis tangent from planar velocity and folds it toward the existing inward spawn-edge axis. This preserves the fixed component arrangement: outbound travel is cab-first backing movement, and return travel is cowcatcher-first. Enemy rotation/velocity diagnostics, route state, hit radii, HP, damage, and degradation semantics are unchanged. Using velocity avoids a brief sideways swing that occurred when folding the already-interpolated 180-degree enemy rotation; `interpolation-repro.err` records that reproduced failure.

`scripts/check-railcar-presentation.mjs` checks all three contracts on desktop and mobile, including actual route reversal and interpolation fractions 0/.25/.5/.75/1. It reads the rendered pose before any explicit presentation calls, then checks that repeated presentation calls leave the enemy suspend snapshot byte-identical. This ordering was tightened after independent review showed that a probe can otherwise repair a broken update loop.

The first candidate (11,904 triangles, height 1.297) passed all six focused route/viewport checks and TypeScript. The 12 unchanged presentation/lifecycle tests produced 10 passes and two exact-count failures after behavior checks completed: desktop mounted triangles 124212→125168 and mobile 120992→121948, each +956, matching 11904−10948. The required renderer-count input JSON files indirectly encode the old asset count. All original JSONs, evidence, traces, and exact screenshot crops are banked under `candidate1/`; the 17 tracked screenshot outputs overwritten by tests were restored exactly.

The orchestrator authorized updating only measured count expectations once final geometry is stable, preserving exact tests and tolerance bands. Further tests are paused while the first candidate receives another art pass. The 11,904/1.297 constants currently describe candidate1 and are not a claim that the asset is final.

Independent runtime review subsequently completed on the corrected check and latest velocity-based implementation: no actionable bugs. It reran the six route/viewport cases successfully and demonstrated that the check rejects both the original HEAD yaw behavior and an injected stale-position/update-loop regression. See `runtime-review.log`.

## Final verified runtime receipt

Final served asset SHA-256: `206a539a40c57791fc249c31912d98b00709d47ff808d6409cc1c89c0e99da21`. The runtime pins now admit exactly 11,936 triangles and use height 1.242 for the boss bar. The authored length is 3.30; width remains 1.248279. The same three mesh/morph contracts remain required.

The final material treatment reuses the existing base-color texture as the emission map. Intact fill is white at .90, damaged fill is 1.0 with 20% of the former component tint. The selected treatment preserves painted panel detail instead of replacing the boiler with flat cyan or wheels with flat orange. See `material-choice.md` and the matched legacy/textured/fill-sweep screenshots for the judgment and its native-screen-size limits.

Verification:

- `focused-check-final.jsonl`: six passes across all three E2 contracts and both viewports, zero page/console errors. Checks actual route reversal at five interpolation fractions, unchanged simulation snapshots and route offsets, mesh/proxy fit, boss-bar clearance, and shared-map/component-local material behavior. The final Hill Mine cabin/proxy distance is .513 outbound and .625 returning, compared with 2.067 on the original return. All visible component centers remain within their existing damage radii.
- `final-existing-tests.log`: 14/14 unchanged tests pass: both railcar presentation specs in full plus the E2 component-boss degradation/defeat test on desktop and mobile. This covers all damage morphs, retained wreckage, delayed-load death, disposal, LITE, failed-GLB fallback, real damage, and final secured state.
- `count-receipts/`: records all four measured renderer phases using a byte-identical copy of the existing lifecycle spec and an artifact-only copy of its helper that writes actual counts before every original assertion. Only exact mounted triangles changed: desktop 124212→125200 and mobile 120992→121980. Both increases equal 11936−10948=988. All other expectations, tolerance bands, and geometry/texture deltas passed unchanged. Original JSON inputs are banked; authorized updates include measurement provenance.
- `after/`: eight final full-context PNGs and eight exact crops, all against the final asset SHA. `crop-integrity.json` independently verifies every crop's raw pixels, rectangle, and source/crop hashes; both viewport metadata files have no errors.
- `typecheck-final.log`: TypeScript passed. `runtime-review.log` and `material-runtime-review.log`: independent reviews found no remaining actionable issues; the material review checked texture allocation/disposal ownership and passed all six runtime cases.
- `final-existing-evidence/`: final test output bank. Twenty tracked historical PNG outputs were restored exactly. Only the two intentionally updated renderer-count JSONs remain changed in the original screenshot artifact directories. Existing e2e source files were not edited.

No simulation, combat, route, cadence, or damage changes were made. Scratch Vite on port 5246 remains available for the next epoch's audit.
