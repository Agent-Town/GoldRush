# SOL 3D-C — 3D pilot findings

Branches: `sol/town-plate` (Wave 1), `sol/town-cozy-pack` (Wave 2), `sol/tavern-full-wrap` (Wave 3), `sol/railcar-3d` (Wave 4), `sol/town-e2-variants` (Wave 7), `sol/town-e3-pilot` (Wave 8 pilot)

Bases: Wave 1 `bacb5717`; Wave 2 `e21dc4aa`; Wave 3 `1281a8f1`; Wave 4 `99d06e91`; Wave 7a `12f6306e`; Wave 7b `91ee55b5`; Wave 8 pilot `e582f3cc`

Tip: exact Wave 8 pilot SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — the three-building E3 Voltage pilot passes the ACROSS-THE-PLAZA TEST, all-angle construction review, exact-envelope/material/budget contracts, and byte-identical official re-export. The wide E3 family remains deliberately unstarted pending this verdict.**

## Wave 8 pilot — E3 Voltage building faces

The pilot uses the three Town transforms explicitly named by `e3-voltage-bundle.md` §A2: Tavern / Electric Lounge, Schoolhouse / Academy, and the electrified Stamp Mill. It edits the accepted identities forward, preserves the inherited footprint and maximum envelope, removes inherited steam anchors, and supplies three sequential `arc_anchor_*` nodes per variant for factory-owned flicker effects.

### Per-building findings

| Building | E3 identity edit | Locked-camera / all-angle verdict | Final contract |
| --- | --- | --- | --- |
| Tavern / Electric Lounge | thicker porch festoon and warm bulbs, brass terminal arms, mounted teal lightning-circle pictogram, and framed warm side panes | blind reviewer chose E3 correctly at 70% confidence; cue is modest but visible. Four angles pass with mounted sign, attached conductors, and finished sides | 14,828 tris; 3 anchors; SHA `a7cca217d3506389214ee245d29ea14c626f22c53838a7a5cb0a1b87f9c1657f` |
| Schoolhouse / Academy | supported faceted observatory dome, lightning rod, teal corona toroid, camera-facing ceramic feed stacks, and a mounted brass orrery in the upper window | blind reviewer chose E3 correctly at 98% confidence. Four angles pass after the dome was reduced and seated on a roof saddle with brackets | 8,752 tris; 3 anchors; SHA `8a977ea418b138990e1f7adb6e51eff76f569119b5104c2a20b39073d40bcd10` |
| Stamp Mill | steam header replaced by a roof-braced iron crossarm, copper bus, three tall ceramic stacks and teal toroid; motor housing, mounted winding face, and conduit make the cleaner-power conversion functional | blind reviewer chose E3 correctly at 88% confidence after the first thin bus failed the semantic test. Four angles pass with visibly supported ends and complete sides | 2,916 tris; 3 anchors; SHA `499fc7ecf4ab991ca276a362c1c79aaa270a9736b1f06e75dc95df8081658d0d` |

All three variants are one mesh, one primitive, one material, and one embedded 1024 x 1024 image; contain zero cameras, lights, animations, or emissive textures; and preserve the exact inherited envelope. Tavern and Schoolhouse grow from their accepted E2 identities. Stamp Mill intentionally grows from E1 because §A2 requires the E2 steam header and stack-plume treatment to be replaced, not retained under electrical dressing.

### Gate evidence

| Check | Result |
| --- | --- |
| Geometry budgets | 14,828 / 8,752 / 2,916; all pass under 15,000 tris |
| Materials and hygiene | 3/3 have one baked 1024 atlas material; 0 cameras, lights, animations, or emissive textures |
| Interfaces | exact inherited envelopes; `arc_anchor_1`, `arc_anchor_2`, `arc_anchor_3` present and no inherited `steam_anchor_*` nodes |
| Determinism | official `scripts/reexport-pilot.sh` reproduces all three GLBs byte-identically; independent saved-BLEND verifier agrees |
| Tonal law | worst full-frame luminance delta is Stamp Mill `0.09712 / 149.99532 = 0.0647%`, far below 5% |
| Across-the-plaza QA | fresh neutral reviewer selected Tavern B, Schoolhouse A, and Stamp Mill B, matching the hidden key; confidence 70% / 98% / 88% |
| All-angle QA | corrected final Tavern, Schoolhouse, and Stamp Mill boards all pass; no floating, collision, unfinished-side, scale, or material blocker |
| App build | `npm run build` passes on the final asset bytes |

### Evidence index

The production comparisons are **E2 on the left, E3 on the right**. Blind pair boards retain their randomized A/B order.

- Whole Town: [`town-three-pilot-verdict-e2-e3-ab.png`](../artifacts/town-e3-pilot/town-three-pilot-verdict-e2-e3-ab.png)
- Locked-camera building A/Bs: [`tavern`](../artifacts/town-e3-pilot/tavern-town-verdict-e2-e3-ab.png), [`schoolhouse`](../artifacts/town-e3-pilot/schoolhouse-town-verdict-e2-e3-ab.png), [`stamp-mill`](../artifacts/town-e3-pilot/stamp-mill-town-verdict-e2-e3-ab.png)
- Four-angle A/Bs: [`tavern`](../artifacts/town-e3-pilot/tavern-turntable-final-e2-e3-ab.png), [`schoolhouse`](../artifacts/town-e3-pilot/schoolhouse-turntable-final-e2-e3-ab.png), [`stamp-mill`](../artifacts/town-e3-pilot/stamp-mill-turntable-final-e2-e3-ab.png)
- Blind gameplay crops: [`tavern`](../artifacts/town-e3-pilot/blind-crops-verdict/tavern-pair.png), [`schoolhouse`](../artifacts/town-e3-pilot/blind-crops-verdict/schoolhouse-pair.png), [`stamp-mill`](../artifacts/town-e3-pilot/blind-crops-verdict/stamp-mill-pair.png)
- Machine evidence: [`asset-contract.json`](../artifacts/town-e3-pilot/asset-contract.json), [`comparison-metrics.json`](../artifacts/town-e3-pilot/comparison-metrics.json), [`blind-key.json`](../artifacts/town-e3-pilot/blind-key.json)

### F-3DC-18 — E3 must beat inherited steam hardware in a semantic blind test

**Severity:** resolved visual gate

**Evidence:** the first Stamp Mill roof bus was contract-correct but thinner and paler than the inherited green E2 pressure header; a blind reviewer selected E2 as the more advanced face. The final mill uses a double-profile crossarm and bus, three enlarged ceramic stacks, roof braces, and a teal voltage toroid. A fresh blind reviewer then selected the real E3 face at 88% confidence. The Schoolhouse received the same semantic check: a teal corona and camera-facing feed stacks prevent its required dome from reading as merely another bell.

**Decision:** wide E3 work must be evaluated against the preceding E2 face, not against E1 alone. A voltage edit fails when an E2 pipe or boiler still reads as the more advanced silhouette.

### F-3DC-19 — Arc anchors belong in the same narrow exporter seam as steam anchors

**Severity:** resolved interface gate

**Evidence:** the official selected-object exporter previously preserved only `steam_anchor_*` empties. It now selects named empties from either `steam_anchor_*` or `arc_anchor_*`; the shared verifier uses the same narrow rule. All three pilot GLBs contain exactly three sequential arc nodes and no stale steam nodes, while Wave 7 steam assets keep their existing behavior.

**Decision:** preserve only the two ratified particle-mount families. Runtime arc color, timing, intensity, and emitter geometry remain factory-owned.

### F-3DC-20 — Town evidence frames need isolated Blender render state

**Severity:** resolved evidence reliability

**Evidence:** sequential Eevee Town renders intermittently produced black shadow-atlas tiles even though GLB positions, normals, UVs, and all-angle renders were valid. Rendering each locked-camera Town frame in a fresh Blender subprocess eliminated the artifact reproducibly. Final randomized crops are generated by the evidence script and composed into single-file A/B boards so the blind verdict sees the exact saved pixels.

**Decision:** keep per-frame process isolation for this Town evidence harness. This is a render-evidence fix, not model geometry or runtime source.

### Wave 8 pilot integration boundary

- Add only the three `.e3.blend` / `.e3.glb` sibling pairs, their deterministic builder/verifier, and the evidence bundle. E1 and E2 production assets remain untouched.
- Generalize the existing official exporter and verifier only enough to retain `arc_anchor_*` alongside `steam_anchor_*`; no runtime source changes.
- Do not start the remaining five real building faces, wagon/trough variants, or `era-props.e3.json` until the attended pilot verdict. The established eight-building inventory finding still applies; no ninth identity is fabricated.
- The transferred Crawler grant remains closed and untouched.
- Branch base: `e582f3cc`; main observed during final review: `e3bb874c`. Main advanced through unrelated runner/research work with no overlap in the pilot asset, evidence, exporter, or findings paths.

## Wave 7 — E2 epoch style variants

### 7b — whole-Town steamworks pass

Wave 7b edits every verified production building identity forward rather than replacing it. The accepted E1 shell, footprint, maximum envelope, atlas, and material stay intact; large attached steam functions carry the era read. The integrated Town adds era-keyed wagons and troughs plus a small shared-atlas infrastructure vocabulary around the outer plaza while the Pan Monument remains unchanged.

#### Production-building inventory decision

The standing queue says “all nine buildings,” but the audited production inventory contains **eight** building GLBs: the six `TownBuildingId` entries in `src/town/townLayout.ts`, plus the separately mounted Stamp Mill and Dynamo Hall. `TownTavernPilot.ts`, the Wave 6 audit, and the on-disk pilot paths agree on those same eight. There is no ninth E1 building GLB or ninth canonical building slot to edit forward. This wave variants all eight real bases and deliberately does not fabricate a ninth shell.

#### Per-building findings

| Building | E2 identity edit | Locked-camera verdict | Final contract |
| --- | --- | --- | --- |
| Tavern / Saloon | required covered porch, hanging oil lamps including one teal, swing doors, service boiler, header, and tall vent | immediate; accepted in 7a | 13,864 tris; 2 anchors; SHA `e72aa936…` |
| Claim Office | civic boiler, banded relief stack, paired facade gauges, rear dial, and porch ironwork | immediate; accepted in 7a | 5,452 tris; 2 anchors; SHA `715b721d…` |
| General Store | loading boiler, overhead header, public dial, shutoff, and tall relief stack on the service corner | correctly identified; borderline because the parcel is small at TS-04 | 3,812 tris; 2 anchors; SHA `64e69511…` |
| Schoolhouse | lesson boiler, public dial, main stack, and paired whistles fed by a visible shared header | immediate after the header removed the first-pass floating-whistle read | 7,176 tris; 3 anchors; SHA `70391129…` |
| Assay Office | retort boiler, condenser rack, pressure dial, and relief stack | immediate | 5,112 tris; 1 anchor; SHA `9ca6acdc…` |
| Chapel | meeting-house heating tank, radiator bank, dial, and tall copper flue | correctly identified; borderline at the right frame edge | 5,108 tris; 1 anchor; SHA `ce63f235…` |
| Stamp Mill | horizontal receiver, piston feed, second relief stack, and a supported full-width teal roof header gantry | correctly identified; borderline because the locked camera crops the mill. Fresh all-angle review confirms risers penetrate the roof and the handwheel has a physical stem | 3,532 tris; 2 anchors; SHA `085fd755…` |
| Dynamo Hall | side accumulator, load dial and shutoff, header, and twin exhausts | correctly identified; borderline because most of the hall is below the frame, but the twin teal caps remain visible | 4,380 tris; 2 anchors; SHA `9db911e4…` |

All eight variants are one mesh, one primitive, one material, and one embedded 1024 x 1024 image; contain zero cameras, lights, or animations; retain exact E1 bounds; and re-export byte-identically from their sibling `.blend`. The largest TS-04 average-luminance shift is `0.09235 / 150.36212 = 0.0614%`, far below the 5% tonal ceiling.

#### Accessory pack

| Asset | Era edit / role | Contract |
| --- | --- | --- |
| Covered wagon E2 | boiler fitting, iron strapping, relief vent | 1,632 tris; exact E1 envelope; 1 anchor; SHA `f212d6a2…` |
| Water trough E2 | piped feed and valve | 688 tris; exact E1 envelope; SHA `65622eea…` |
| Coal bin | open timber bunker with visible coal | 340 tris; SHA `89c33164…` |
| Pipe run | low flanged distribution pipe | 844 tris; 1 anchor; SHA `b5fb5df7…` |
| Gauge post | public pressure dial | 628 tris; SHA `0e66a6f4…` |
| Iron lamp post | twin unlit oil lamps; game rig owns light | 796 tris; SHA `74d9b6e6…` |
| Pressure manifold | three-valve public header | 976 tris; 1 anchor; SHA `cc1c3a47…` |

The five new accessories embed the same byte-identical 1024 x 1024 atlas (`817f26f4…`). `era-props.e2.json` proposes eight placements: one coal bin, two pipe runs, two gauge posts, two lamp posts, and one manifold. Final minimum clearances are `0.9414` from walk routes, `3.8421` from the protected stage, `0.3101` from building pads, `0.4811` from shipped props, and `0.6195` accessory-to-accessory. The pressure manifold moved from the inner ring to `(2, 7.5)` after neutral review found that its first contract-legal position still looked like stage clutter.

#### Gate evidence

| Check | Result |
| --- | --- |
| Building budgets | 8/8 pass under 15,000 tris |
| Accessory budgets | 5/5 new accessories pass under 1,000 tris; existing prop variants remain inside their inherited budgets |
| Materials | one baked material per GLB; buildings 1024; new pack shares one byte-identical 1024 atlas |
| Export hygiene | 15/15 GLBs have 0 cameras, 0 lights, 0 animations |
| Determinism | official `scripts/reexport-pilot.sh` reproduced all 15 GLBs byte-identically; the independent verifier agrees |
| Interfaces | exact E1 bounds for all eight buildings and both replaced props; sequential `steam_anchor_1..N` nodes at every sensible vent |
| Heritage | Pan Monument base asset is mounted unchanged and has no E2 sibling |
| Placement | all proposed accessories clear routes, pads, existing props, one another, and the open center stage |
| App build | `npm run build` pass on the final asset bytes |
| Across-the-plaza QA | neutral blind review selected E2 correctly for all eight buildings; integrated E2 was immediate. Four were immediate and four remained identifiable but borderline because of parcel size/frame crop |

#### Evidence index

Every committed comparison is **E1 on the left, E2 on the right**.

- Whole Town: [`town-all-wave7b-ab.png`](../artifacts/town-e2-variants/town-all-wave7b-ab.png)
- Clearance overlay: [`wave7b-clearance-overlay.png`](../artifacts/town-e2-variants/wave7b-clearance-overlay.png)
- Props: [`accessory-pack-e2.png`](../artifacts/town-e2-variants/accessory-pack-e2.png), [`prop-variants-e1-e2.png`](../artifacts/town-e2-variants/prop-variants-e1-e2.png)
- Locked-camera building A/Bs: [`general_store`](../artifacts/town-e2-variants/general_store-town-ab.png), [`schoolhouse`](../artifacts/town-e2-variants/schoolhouse-town-ab.png), [`assay_office`](../artifacts/town-e2-variants/assay_office-town-ab.png), [`chapel`](../artifacts/town-e2-variants/chapel-town-ab.png), [`stamp-mill`](../artifacts/town-e2-variants/stamp-mill-town-ab.png), [`dynamo-hall`](../artifacts/town-e2-variants/dynamo-hall-town-ab.png)
- Four-angle A/Bs: [`general_store`](../artifacts/town-e2-variants/general_store-turntable-ab.png), [`schoolhouse`](../artifacts/town-e2-variants/schoolhouse-turntable-ab.png), [`assay_office`](../artifacts/town-e2-variants/assay_office-turntable-ab.png), [`chapel`](../artifacts/town-e2-variants/chapel-turntable-ab.png), [`stamp-mill`](../artifacts/town-e2-variants/stamp-mill-turntable-ab.png), [`dynamo-hall`](../artifacts/town-e2-variants/dynamo-hall-turntable-ab.png)
- Machine evidence: [`wave7b-asset-contract.json`](../artifacts/town-e2-variants/wave7b-asset-contract.json), [`comparison-metrics.json`](../artifacts/town-e2-variants/comparison-metrics.json)

### F-3DC-15 — “Nine buildings” has only eight production identities

**Severity:** resolved integration decision

**Evidence:** canonical Town layout exposes six production building identities. Stamp Mill and Dynamo Hall add two separately mounted production pilots. The Wave 6 all-building audit and `TownTavernPilot.ts` enumerate the same eight paths; no ninth base GLB exists.

**Decision:** Wave 7b is complete against the real production inventory. A future ninth building must first land as an E1 identity and canonical slot; an era pass must not invent a variant-only building.

### F-3DC-16 — Cropped parcels need their era read on the roof

**Severity:** resolved visual gate

**Evidence:** the first Stamp Mill pass put its receiver and pipework below the locked-camera crop, and neutral blind review could not distinguish E2. Short roof domes improved the pixel read but looked detached from two angles. The final design uses roof-penetrating risers, a full-width teal pressure header, end caps, and a stem-supported shutoff wheel. A fresh reviewer selected E2 correctly and confirmed the assembly is connected.

**Decision:** retain the final gantry. Runtime steam plumes may strengthen the read, but the static GLB already passes without them.

### F-3DC-17 — Numeric stage clearance is necessary but visual openness still wins

**Severity:** resolved placement gate

**Evidence:** the first pressure-manifold proposal passed the 3.1-unit stage-radius calculation yet sat inside the engraved ring and read as center-stage clutter in neutral review. The final outer-edge position increases stage clearance from `0.4481` to `3.8421` and route clearance from `0.8119` to `0.9414`.

**Decision:** factory ratification should use the final manifest position. Preserve the Pan Monument as the only permanent center-stage object.

### Wave 7b integration boundary

- Add sibling `.e2.blend` and `.e2.glb` files beside every real E1 building; no E1 production asset moves or changes.
- Add the two existing-prop E2 siblings, five accessory pairs, shared atlas, and `era-props.e2.json` under `assets/pilots/plaza-props-3d/`.
- No runtime source changed. Era selection, manifest mounting, and live steam plumes remain factory-owned.
- Branch base: `91ee55b5`; main observed during final gates: `dd308192`. Main advanced only through unrelated factory work during this asset pass.
- Pan Monument remains permanently excluded from era keying.

### 7a correction target

The returned pilot at `42607059` passed asset correctness but failed its purpose: its evidence used a close focus camera and the edits were below silhouette scale at the real TS-04 gameplay camera. This correction starts from the player test instead: with camera, light, plaza, and surrounding buildings held constant, a blind reviewer must identify E2 across the plaza without relying on a turntable, labels, live steam, or texture inspection.

- **Tavern / Saloon:** the bundle's §A2 list is fully present: a more explicit covered porch, two hanging oil lamps with one teal, and half-height swing doors. A large attached kitchen boiler and flanged service vent put the steam-era change on the service side seen by the locked camera. The accepted shell, footprint, roofline, facade, and maximum envelope remain unchanged.
- **Claim Office / Town Hall lineage:** a civic service boiler, tall banded relief stack, rear pressure dial, paired facade gauges, and porch ironwork make the public steamworks read visible while retaining the accepted flag, frontage, roofline, footprint, and maximum envelope.
- **Shared target:** warm painted frontier craft with soot-dark iron, brass/ochre, and restrained agent-teal accents. No E5 rope trim or tide boards, readable signage, emissive material, generic redesign, or dependence on the future particle plume.

### Per-building findings

| Building | Returned-pilot finding | 7a correction | Locked-camera / all-angle verdict | Final contract |
| --- | --- | --- | --- | --- |
| Tavern / Saloon | swing leaves and small lamps were correct but near-invisible from across the plaza; the old render did not exercise the locked camera | expanded the existing awning into a clearly covered red porch with valance/brackets; kept the required lamps and swing doors; added an attached dark boiler, brass header, teal shutoff, and tall flanged vent on the camera-visible service corner | blind neutral reviewer identified the unlabeled E2 image from the side steam assembly, confidently and without squinting. Four angles show the pipework attached; no floating, collision, or missing-side blocker | 13,864 triangles; 1 mesh/primitive/material; embedded 1024 x 1024 atlas; exact E1 envelope `4.229571 x 3.960802 x 3.349`; byte-identical SHA-256 `e72aa936ee8a5a24aa6a6840d7c43f9eb81c4005702585a93050ac3166af09ad`; 2 steam anchors |
| Claim Office / civic steam pilot | facade gauges and a narrow service pipe did not change the building's gameplay-distance read | retained the civic gauge language and added a camera-visible rear boiler, tall iron relief stack with brass/teal bands and roof collar, feed pipe, and large rear dial | blind neutral reviewer identified the unlabeled E2 image from the banded stack, confidently and without texture detail. The busy stack/eave junction reads as an intentional roof penetration, not a float or bad collision | 5,452 triangles; 1 mesh/primitive/material; embedded 1024 x 1024 atlas; exact E1 envelope `4.26 x 5.02 x 3.12`; byte-identical SHA-256 `715b721d8c3896c82bf8468d6d18fc30d8628c2d2c69720f85b6476f7f86d656`; 2 steam anchors |

### Gate evidence

| Check | Tavern | Claim Office | Result |
| --- | --- | --- | --- |
| E1 base integrity | BLEND `b81ef19a…`; GLB `edec4934…` | BLEND `46a2f73f…`; GLB `b2a23b06…` | both original files untouched |
| Geometry budget | 13,864 triangles | 5,452 triangles | both pass under 15,000 |
| Baked surface | 1 material, 1 embedded 1024 x 1024 image | 1 material, 1 embedded 1024 x 1024 image | pass |
| Export hygiene | 0 cameras, 0 lights, 0 animations | 0 cameras, 0 lights, 0 animations | pass |
| Envelope | exact E1 bounds | exact E1 bounds | slot, footprint, roofline, and maximum-envelope interfaces preserved |
| Determinism | exact SHA above | exact SHA above | official recipe export and verifier pass |
| Steam-plume interface | `steam_anchor_1`, `steam_anchor_2` | `steam_anchor_1`, `steam_anchor_2` | named empty GLTF nodes survive the official deterministic export |
| Locked-camera tone | average luminance `-0.0875` (`-0.0582%`) | average luminance `-0.0512` (`-0.0341%`) | localized additions; far inside the 5% tonal ceiling |
| App build | exact final asset bytes | exact final asset bytes | `npm run build` pass |
| Across-the-plaza QA | unlabeled E2 identified correctly from the service steam silhouette | unlabeled E2 identified correctly from the tall banded stack | neutral blind verdict: PASS both pilots at gameplay distance |

### Evidence index

Every comparison is **E1 on the left, E2 on the right**.

- Locked Town camera: [`town-two-pilot-ab.png`](../artifacts/town-e2-variants/town-two-pilot-ab.png), [`tavern-town-ab.png`](../artifacts/town-e2-variants/tavern-town-ab.png), [`claim_office-town-ab.png`](../artifacts/town-e2-variants/claim_office-town-ab.png)
- Four-angle comparison: [`tavern-turntable-ab.png`](../artifacts/town-e2-variants/tavern-turntable-ab.png), [`claim_office-turntable-ab.png`](../artifacts/town-e2-variants/claim_office-turntable-ab.png)
- Machine evidence: [`asset-contract.json`](../artifacts/town-e2-variants/asset-contract.json), [`comparison-metrics.json`](../artifacts/town-e2-variants/comparison-metrics.json)

### F-3DC-13 — E2 must read from the plaza before its surface detail matters

**Severity:** resolved design gate

**Evidence:** the returned pilots proved that contract-correct pipes and gauges can still be functionally invisible. The corrected render uses the actual full TS-04 Town camera, and a neutral reviewer correctly selected Tavern E2 and Claim Office E2 from unlabeled pairs. The reasons given were silhouette-scale additions—the side steam assembly and tall banded stack—not texture or labels. Four-angle review confirms those additions are attached craft rather than replacement shells.

**Decision:** Wave 7a was accepted. Wave 7b applies the same blind gameplay-camera test building by building, uses identity-specific steam functions, and does not count future live plumes as the static-model read.

### F-3DC-14 — Steam anchors require the official exporter to preserve named empties

**Severity:** resolved interface gate

**Evidence:** Blender's selected-object GLB export does not automatically include empty children when only the mesh is selected. `scripts/reexport-pilot.sh` now adds only empty objects named `steam_anchor_*` to the existing mesh selection. The verifier confirms exactly two sequential anchors in each final GLB and byte-identical `.blend` re-export; blends without era anchors retain the previous mesh-only selection.

**Decision:** use named empty nodes as the factory particle-mount seam. Tavern anchors are at its accepted chimney and new service vent; Claim Office anchors are at its accepted chimney and new relief stack. Particle timing, tint, and plume geometry remain factory-owned.

### Wave 7a integration boundary (historical)

- Corrected sibling assets only: `tavern.e2.glb` and `claim-office.e2.glb`, each with its deterministic `.blend`, builder, and named steam anchors.
- The E1 production GLBs remain byte-for-byte untouched and at their current paths.
- No runtime source changed. Era switching remains factory-owned and is intentionally not part of this asset verdict branch.
- Branch base: `12f6306e`; returned pilot tip: `42607059`; main observed during final audit: `e1de526d`. Main advanced through unrelated factory handoff commits with no overlap in the Wave 7 asset, evidence, or findings paths.
- Path-scoped integration should add the sibling assets, evidence, scripts, and this Wave 7 findings section.
- Wave 7b was pending at this checkpoint and is now superseded by the completed 7b section above. The Pan Monument remains permanently excluded from era-keying.

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
