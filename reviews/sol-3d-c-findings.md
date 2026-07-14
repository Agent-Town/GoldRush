# SOL 3D-C — 3D pilot findings

Branches: `sol/town-plate` (Wave 1), `sol/town-cozy-pack` (Wave 2), `sol/tavern-full-wrap` (Wave 3), `sol/railcar-3d` (Wave 4), `sol/town-e2-variants` (Wave 7)

Bases: Wave 1 `bacb5717`; Wave 2 `e21dc4aa`; Wave 3 `1281a8f1`; Wave 4 `99d06e91`; Wave 7 `12f6306e`

Tip: exact Wave 7 SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — two E2 Town building variants are ready for the owner verdict; both preserve their E1 identity, envelope, and base asset.**

## Wave 7 — E2 epoch style variants

### Pilot selection and visual target

- **Tavern:** the E2 bundle's explicit §A2 transform. The accepted roofline, footprint, facade, and covered porch remain the identity; E2 grows on them as Saloon swing doors and hanging oil lamps, including one restrained teal lamp.
- **Claim Office:** the canon heritage step toward Town Hall. It remains visibly the accepted Claim Office, gaining a compact public pressure readout and an attached rear-side steam service rather than a new civic shell.
- **Shared target:** warm painted frontier craft with localized soot-dark iron, brass/ochre, and agent-teal accents. No E5 rope trim or tide boards, no text signage, no emissive material, and no generic steampunk redesign.

### Per-building findings

| Building | E1 identity retained | E2 edit | All-angle finding and correction | Final contract |
| --- | --- | --- | --- | --- |
| Tavern / Saloon | exact `town-v3-tavern` shell, roofline, footprint, facade, and covered porch | two half-height swing leaves; two front oil lamps, one teal; one ordinary rear service lamp so the edit reads from the Town camera | the first pass placed the front lamps into the canopy; they were lowered beneath it and rechecked at four angles. Final neutral review found no remaining defect | 12,712 triangles; 1 mesh/primitive/material; embedded 1024 x 1024 atlas; exact E1 envelope `4.229571 x 3.960802 x 3.349`; byte-identical re-export SHA-256 `6664458082b86f632c202d3532cdac68210e14998c37de64d20aa451c803678e` |
| Claim Office / civic steam pilot | exact Claim Office shell, roofline, flag, frontage, footprint, and silhouette | paired facade pressure gauges; four iron porch caps; chimney-fed rear-side service pipe, flanges, and teal shutoff wheel | neutral review caught a side riser crossing a window, an off-axis wheel, and ambiguous endpoints. The riser moved to the clear rear corner, the wheel was centered, and both ends received joined fittings. Post-fix review accepted the pilot | 4,168 triangles; 1 mesh/primitive/material; embedded 1024 x 1024 atlas; exact E1 envelope `4.26 x 5.02 x 3.12`; byte-identical re-export SHA-256 `eccfe75c24fe5520536c4fea244486c034b3cc9890e3c4d68817a14a00d0881a` |

### Gate evidence

| Check | Tavern | Claim Office | Result |
| --- | --- | --- | --- |
| E1 base integrity | BLEND `b81ef19a…`; GLB `edec4934…` | BLEND `46a2f73f…`; GLB `b2a23b06…` | both original files untouched |
| Geometry budget | 12,712 triangles | 4,168 triangles | both pass under 15,000 |
| Baked surface | 1 material, 1 embedded 1024 x 1024 image | 1 material, 1 embedded 1024 x 1024 image | pass |
| Export hygiene | 0 cameras, 0 lights, 0 animations | 0 cameras, 0 lights, 0 animations | pass |
| Envelope | exact E1 bounds | exact E1 bounds | footprint and silhouette interface preserved |
| Determinism | exact SHA above | exact SHA above | official recipe export and verifier pass |
| Locked-camera tone | average luminance `+0.0067` (`+0.0046%`) | average luminance `-0.1054` (`-0.0756%`) | localized changes; far inside the 5% tonal ceiling |
| App build | exact final asset bytes | exact final asset bytes | `npm run build` pass |
| Visual QA | Town A/B plus four-angle E1/E2 sheet | Town A/B plus four-angle E1/E2 sheet | neutral post-fix verdict: accept both pilots |

### Evidence index

Every comparison is **E1 on the left, E2 on the right**.

- Locked Town camera: [`tavern-town-ab.png`](../artifacts/town-e2-variants/tavern-town-ab.png), [`claim_office-town-ab.png`](../artifacts/town-e2-variants/claim_office-town-ab.png)
- Four-angle comparison: [`tavern-turntable-ab.png`](../artifacts/town-e2-variants/tavern-turntable-ab.png), [`claim_office-turntable-ab.png`](../artifacts/town-e2-variants/claim_office-turntable-ab.png)
- Machine evidence: [`asset-contract.json`](../artifacts/town-e2-variants/asset-contract.json), [`comparison-metrics.json`](../artifacts/town-e2-variants/comparison-metrics.json)

### F-3DC-13 — The first E2 pilots preserve identity by adding attached craft

**Severity:** resolved design gate

**Evidence:** neither variant changes its production base file, footprint, bounding envelope, roofline, or core facade. The Tavern follows the bundle's explicit Saloon transform while the Claim Office uses the canon Town Hall lineage to test a second, more restrained civic vocabulary. From all four angles the additions read as things fitted to the existing building, not a replacement building sharing its slot.

**Decision:** use these two pilots for the owner verdict before producing further siblings. If accepted, repeat the same attached-edit rule building by building; do not infer that every E2 structure needs identical pipes or gauges.

### Wave 7 integration boundary

- New sibling assets only: `tavern.e2.glb` and `claim-office.e2.glb`, each with its deterministic `.blend` and builder.
- The E1 production GLBs remain byte-for-byte untouched and at their current paths.
- No runtime source changed. Era switching remains factory-owned and is intentionally not part of this asset verdict branch.
- Branch base: `12f6306e`; main observed during final audit: `af3b7bc6`. Main advanced through unrelated terrain/panorama and handoff commits with no overlap in the Wave 7 asset, evidence, or findings paths.
- Path-scoped integration should add the sibling assets, evidence, scripts, and this Wave 7 findings section.

## Wave 4 — Armored Railcar model

### Delivered

- One deterministic, production-ready armored boss locomotive built from the owner-approved E2 component plate, with low siege-engine massing rather than a friendly toy-train profile.
- Exactly three named mesh nodes—`Railcar_Wheels`, `Railcar_Boiler`, and `Railcar_Cabin`—sharing one material and one atlas.
- One morphable damage state per component: bent lead axle/suspension/drive rod; opened boiler vents/relief valves/band; cracked and caved cabin frame.
- Four-angle turntable, a component-damage strip, and an on-rail composition using the production 42-degree FOV and camera pitch.
- No runtime source edits. The presentation seam and game-side mount remain factory-owned.

### Scale decision

`src/world/RailPath.ts` defines a 0.78-unit rail gauge and 0.90-unit sleeper spacing. The pilot is 2.40 units long: 3.0769 gauge widths and 2.6667 sleeper intervals. This holds the queue's approximately-three-gauge law. The evidence mount raises the base-origin model by 0.125 units—the exact top of the runtime rail head—so the wheel treads seat on, rather than intersect, the rails.

### Gate evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Geometry budget | parsed production GLB | 10,948 triangles; pass under 12,000 |
| Component interface | parsed GLB nodes and meshes | exactly 3: wheels, boiler, cabin |
| Damage interface | parsed GLB morph targets | exactly 1 named target on each component |
| Baked surface | parsed production GLB | 1 material, 1 embedded 1024 x 1024 PNG |
| Export hygiene | parsed production GLB | 0 cameras, 0 lights, 0 animations |
| Scale and origin | parsed production bounds | `2.40 x 1.202 x 1.248279`; grounded and base-centered |
| Determinism | checked versus recipe re-export | byte-identical SHA-256 `2abe1fceb5bf7f8e9ea3ba4c2dc4a42e28aa7d9e04b2327d9842862ae48d99b9` |
| Run-camera composition | `railcar-on-rail-run-camera.png` | 42-degree production FOV/pitch; seated on 0.78-gauge rails |
| All-angle evidence | `railcar-turntable.png` | reference-gated SHIP: low bunker cabin, long boiler, unequal drive wheels, armored ram, roof, rear, both sides |
| Damage evidence | `railcar-damage-states.png` | bent wheels / venting boiler / cracked cabin, left to right |

### F-3DC-11 — The real GLB closes the flat billboard read

**Severity:** resolved high

**Evidence:** the former component presentation used side-elevation planes, so the train collapsed from the game's top-down three-quarter view. The Wave 4 render shows a long volumetric boiler, low faceted bunker cabin, eight seated wheels with heavier leading pairs, drive rods, suspension, armored smokebox face, and deep reinforced ram at the production camera pitch. Three blind reference comparisons drove a massing correction; the final fresh review found no high-confidence boss-read blocker. The four-angle sheet shows no missing rear, side, or roof treatment.

**Decision:** integrate the GLB at its existing factory-owned presentation seam. Keep the old painted component crops as fallback/reference material; do not delete them in this art-only branch.

### F-3DC-12 — Damage swaps should drive morph weights, not duplicate meshes

**Severity:** integration note

**Evidence:** each component mesh exports one explicit morph target and the damage strip verifies the deformations independently. This preserves the queue's three named component zones without adding hidden fourth-through-sixth damage meshes or another material.

**Decision:** the runtime mount should drive the target weight while the component is still alive, beginning at the existing `<=50% HP` damaged threshold (or proportionally across the remaining live HP), so the deformation is visible before defeat. Tint and steam/spark particles remain renderer-owned. Node names and morph names are documented in the pilot README and contract JSON.

## Wave 4 merge classification

- Branch base: `99d06e91`.
- Main observed during final gates: `2776ca52`; it advanced after this branch was cut.
- LANE-TOUCHED: new files under `assets/pilots/railcar-3d/` plus this findings file.
- MAIN-MOVED-ONLY: unrelated attended-session changes; no Wave 4 pilot path existed at branch cut.
- Expected integration: path-scoped add of the pilot and findings update; no runtime source or conflict resolution is part of this branch.

## Wave 3 — Tavern full-wrap repair

### Delivered

- Replaced the production `town-v3-tavern.glb` in place with the owner-approved full-wrap Tavern shell; no loader or gameplay source changed.
- Preserved the former asset's exact base-centered bounds (`4.229571w x 3.960802h x 3.349d`) so the existing slot, frontage direction, footprint, interaction, and approach remain unchanged.
- Added a deterministic repair builder, a GLB contract verifier, and a render script for locked-camera and four-angle evidence.
- Added the authoritative actual-game TS-04 A/B, a focused parcel A/B, and front-left/front-right/back-left/back-right turntable evidence.
- Closed the false-front crest's rear through-gap with a recessed atlas-backed arch band and connected the projecting sign to its bracket with two short dark-wood straps; all other facade/rear asymmetry remains intentional.

### Gate evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Geometry budget | production Tavern GLB | 10,988 triangles; pass under 15,000 |
| Baked surface | production Tavern GLB | 1 mesh, 1 primitive, 1 material, 1 embedded 1024 x 1024 PNG |
| Export hygiene | production Tavern GLB | 0 cameras, 0 lights, 0 animations |
| Footprint and silhouette envelope | parsed production bounds | exact former size `4.229571 x 3.960802 x 3.349`; grounded and base-centered |
| Determinism | checked versus recipe re-export | byte-identical SHA-256 `edec4934d6d956170078b521fe526ccadcde015567094aec59001e2d4b71b90d` |
| App build | exact final GLB on latest observed main `fd38b44f` | `npm run build` pass |
| Tavern seam | unmodified spec, desktop and mobile | 6/6 pass; exact bounds, prompt, Board, LITE/load-failure fallbacks, and disposal preserved |
| Frame-time ceiling | desktop/mobile Tavern spec on exact final GLB | p95 `-2.11%` / `0%`; pass under 15% |
| Locked-camera localization | actual-game TS-04 A/B | `0.515%` of pixels differ above 32 grayscale; luminance `+0.015`; edge energy `+0.853%` |
| Visual QA | authoritative game A/B, all-angle before/after, and final four-angle sheet | fresh post-fix review: SHIP; no confident blocker remains |

### F-3DC-09 — Full-wrap repair closes the Tavern dark-plane finding

**Severity:** resolved high

**Evidence:** the former production GLB exposed unpainted dark side planes in the top-right parcel. The repaired production file uses the previously owner-approved warm frontier-saloon shell, now conformed to the exact former production envelope. The in-game A/B preserves frontage and anchor while replacing every void face with authored siding, windows, trim, roof, porch, and rear treatment. The four-angle turntable shows complete coverage.

**Decision:** close F-3DC-06 at the building-owned interface. Keep the Town plate workyard separate and leave the production GLB path unchanged.

### F-3DC-10 — All-angle polish closes the crest gap and floating sign

**Severity:** resolved medium

**Evidence:** a fresh front-left/front-right/back-left/back-right audit of the accepted full-wrap asset found two small construction inconsistencies: the false-front arch exposed the background as a bright crescent from rear three-quarter views, and the projecting sign stopped below its bracket without a visible hanger. The final all-angle A/B shows an opaque, recessed arch band replacing the bright crescent and two short straps joining sign to bracket. The repair adds 124 triangles, stays inside the exact mounted bounds, and reuses the existing atlas and material.

**Decision:** keep the intentional side/rear variation—mismatched awnings, window rhythms, barrel, steps, and simpler rear walls—as lived-in frontier asymmetry. Do not homogenize those details into facade repetition.

## Wave 2 — detail and decoration

### Delivered

- Eight parcel-specific frontier clusters, authored as 170 parts and joined into the existing `TownPlate` mesh: Tavern workyard; Claim notice yard; Store delivery yard; School garden yard; Assay sample yard; Chapel flower yard; Stamp Mill supply yard; and Dynamo utility yard.
- Functional vocabulary includes hoop-and-stave kegs, crates, cinched sacks, hitching posts and tie rings, rope coils, buckets, unlit lantern posts, one pictogram-only notice board, work planks, and planted boxes.
- All decoration shares the plate's single 2048 x 2048 atlas and exports through the same stable `assets/pilots/town-plate-3d/town-plate.glb` interface.
- The independent Pan Monument was corrected at its existing plaza-prop path; it is deliberately not duplicated into the Town plate.
- Locked-camera Wave 1/Wave 2 A/B, clearance overlay, and focused Tavern, civic, and Pan detail renders.

### Gate evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Geometry budget | exported Town plate GLB | 17,596 triangles; pass under 30,000 |
| Baked surface | exported Town plate GLB | 1 mesh, 1 material, 1 embedded 2048 x 2048 PNG |
| Export hygiene | exported Town plate GLB | 0 cameras, 0 lights, 0 animations |
| Determinism | checked versus re-exported Town plate | byte-identical SHA-256 `6450898a74303282913f75a26583b20e1544f234c4d5831cab3df768af91be29` |
| Route clearance | authored cluster footprints versus canonical route corridors | minimum 3.6844 units |
| Building-pad clearance | authored cluster footprints versus all eight pads | minimum 0.17 units |
| Plaza-stage clearance | authored cluster footprints versus open center ring | minimum 6.7062 units |
| Flat-walk routes | 4,122 realized mesh ray-casts | max absolute height 0.037101; pass under 0.05 |
| Flat plaza | 749 realized mesh ray-casts | max absolute height 0.034182; pass under 0.05 |
| Pan asset | independent checked/re-exported GLB | 864 triangles; one material; byte-identical SHA-256 `fe5ab9f8eb5aa21799e81797adba583cd676c6de952aabd127aaaf2408f6d97d` |
| App build | exact final exported bytes | `npm run build` pass |
| Visual QA | fresh unprimed review of exact final full view, overlay, Tavern, and Pan details | SHIP |

### F-3DC-06 — Tavern workyard fixes the empty parcel edge, not the building shell

**Severity:** high, adjacent building-asset territory

**Evidence:** the flagged top-right parcel now has an intentional workyard with three kegs, a bucket, cinched feed sack, visible rope, and a hitch rail. Fresh visual QA judged these as functional frontier props. The large dark side planes remain the dominant unfinished read in the close-up; those planes are geometry/material in the separately mounted Tavern building model, not in the Town plate.

**Request from the plate:** schedule a Tavern full-wrap repair in the Tavern asset's owning wave. Do not hide the planes with plate clutter: building pads and actor approaches must remain clear, and the Town plate cannot conform safely to defects in a replaceable building shell.

### F-3DC-07 — Full-view decoration density is intentionally parcel-local

**Severity:** low, accepted tradeoff

**Evidence:** at the locked whole-town camera, each cluster is a small punctuation mark rather than a continuous prop field. This is required by the clear-pad, clear-route, clear-shipped-prop, and open-stage laws. Objective telemetry confirms the change is localized: edge energy increased 4.75%, average luminance changed -0.8585, and only 0.633% of pixels differ from Wave 1 by more than 32 grayscale levels.

**Decision:** preserve the safe negative space. Future warmth should come from building-owned porches/facades, independently mounted animated life, and lighting—not by filling the cast's walk corridors.

### F-3DC-08 — Pan Monument remains an independent prop

**Severity:** low, integration invariant

**Evidence:** Town already mounts `pan_monument.glb` separately. The corrected bowl, riffles, nuggets, handle, and civic plinth therefore remain at the existing plaza-prop path. The Town plate GLB contains no Pan geometry.

**Decision:** keep this split to avoid duplicate centerpieces and preserve independent replacement of plaza props. The final plate clearance audit leaves 6.7062 units to the open stage even before the independently mounted Pan is considered.

## Wave 1 — foundation

### Delivered

- Deterministic Blender build for a 44 x 44-unit engraved-earth town plate.
- Flat pads for every canonical `townLayout.ts` building slot plus the existing Dynamo Hall pilot site.
- Canonical ring road, seven building approaches, and north gate radial baked into the atlas and shallow relief.
- Relief reserved for non-walk space, with a raised/eroded north bank and muted river strip.
- Plate-only `.blend` and `.glb`; existing buildings and props are temporary render context only.
- Locked TS-04 painted-ground/plate A/B and a separate walk-loop/pad overlay.

### Gate evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Flat-walk routes | 4,122 realized mesh ray-casts | max absolute height 0.037101; pass under 0.05 |
| Flat plaza | 749 realized mesh ray-casts | max absolute height 0.034182; pass under 0.05 |
| Flat pads | 63 samples at each of 8 pads | worst max absolute height 0.000136 |
| Geometry budget | exported GLB | 8,192 triangles; pass under 20,000 |
| Baked surface | exported GLB | 1 material, 1 embedded 2048 x 2048 PNG |
| Export hygiene | exported GLB | 0 cameras, 0 lights, 0 animations |
| Determinism | checked versus re-exported GLB | byte-identical SHA-256 `04073f38e33f2fe55dafa530450e3d9007b96525f7a301922e44b95ab1082bb0` |
| Visual QA | fresh unprimed review of A/B plus overlay | ACCEPT; no fatal artifact |

### Findings

### F-3DC-01 — Building kits need a shared ground-contact convention

**Severity:** medium, adjacent territory

**Evidence:** the locked-camera render shows generally credible placement, but base treatment varies by kit: some models provide a visible foundation/skirt while others end directly at the ground plane. Contact shadows help, yet they do not fully unify the silhouettes.

**Request from the plate:** future building passes should choose one shared convention—small foundations/skirting authored into the building kits, or renderer-owned contact shadows/AO tuned for every kit. The plate already supplies nearly zero-height pads and a subtle baked contact collar; it should not grow per-building corrective geometry.

### F-3DC-02 — Dynamo Hall is an additive pilot site, not a canonical townLayout slot

**Severity:** medium, integration decision

**Evidence:** `townLayout.ts` contains seven canonical slots. Dynamo Hall's `(10, 10)` position and `5.5 x 3.5` footprint come from the Epoch 2 Steamworks manifest, so the builder records that source separately. That area is also close to the Pony Express plot used elsewhere in Town presentation work.

**Request from the plate:** attended integration should confirm long-term ownership of the northeast parcel before promoting this pilot pad to a runtime contract. No canonical coordinate was changed here.

### F-3DC-03 — North water should remain a restrained background read

**Severity:** medium, non-blocking visual follow-up

**Evidence:** fresh visual QA accepted the v1 but noted that the olive river strip can also read as a grassy berm because of the locked camera and hard rear silhouette.

**Request from the plate:** if a later environment pass extends the world beyond this pilot, continue the river surface or hide the rear plate silhouette with environment dressing. Do not raise or cut the nearby civic routes to solve the read.

### F-3DC-04 — Road wear is intentionally legible but overly regular

**Severity:** medium, non-blocking art follow-up

**Evidence:** fresh visual QA found the ring-and-spoke ruts readable but diagrammatic, with limited hierarchy between the ring road and secondary approaches.

**Request from the plate:** a future texture-only pass can vary route width, fade selected spokes, and add localized wagon wear while preserving the exact canonical centerlines and the flat-walk measurements.

### F-3DC-05 — Pale wagon exposure is a render-context issue

**Severity:** low, adjacent territory

**Evidence:** the northern covered wagon reads washed out in the shared evidence lighting while the plate itself remains within its non-emissive material contract.

**Request from the plate:** correct the prop material or Town lighting in its owning wave; do not compensate inside the ground atlas.

### Integration note

The pilot intentionally contains no runtime mount. The permanent painted ground remains untouched as the LITE, flag-off, and load-failure fallback required by the queue.

### Wave 1 merge classification

- Branch base: `bacb5717`.
- Main observed during final review: `f70a97ab3c2c`; it advanced after the branch was cut.
- LANE-TOUCHED: every delivered file is new and confined to `assets/pilots/town-plate-3d/`, `artifacts/town-plate-3d/`, or this findings file.
- MAIN-MOVED-ONLY: unrelated canon/story work after `bacb5717`; none of the builder's four input sources (`townLayout.ts`, `TownScene.ts`, the Dynamo manifest, or `ter-plaza-ground.png`) changed between the branch base and observed main.
- Expected integration: path-scoped add of new files; no textual conflict resolution required. The attended session should still rerun the SHA/source checks if main advances those inputs before landing.

## Wave 2 merge classification

- Branch base: `e21dc4aa`.
- Main observed during final review: `1da7bfb6`; it advanced after the branch was cut.
- LANE-TOUCHED: the existing Town plate asset/artifact paths, the independent Pan Monument build and binary at its existing plaza-prop path, and this findings file.
- MAIN-MOVED-ONLY: unrelated handoff/coordination work; none of `townLayout.ts`, `TownScene.ts`, the Dynamo manifest, the Wave 2 queue, or the Town recipe changed between the branch base and observed main.
- Expected integration: path-scoped merge of the listed asset and evidence files; no runtime source or queue/spec edit is part of this branch.

## Wave 3 merge classification

- Branch base: `1281a8f1`.
- Main observed during final review: `fd38b44f`; it advanced after the branch was cut and records Wave 3 as accepted at tip `6929c16e`.
- LANE-TOUCHED: the production Tavern `.blend`/GLB, new Tavern-local builder/verifier/render evidence, and this findings file.
- MAIN-MOVED-ONLY: `TownScene.ts` changed to suppress duplicate primitive props when the independent props pilot mounts. The Tavern production path, Tavern loader/spec, and Town recipe are unchanged; the queue only records accepted Wave 3. The final 6/6 Tavern gate and build passed with GLB SHA `edec4934…` on `fd38b44f`.
- Expected integration: path-scoped replacement/add under `assets/pilots/tavern-3d/` plus this findings file; no runtime source or conflict resolution is required.
