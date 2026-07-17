# SOL 3D-C — 3D pilot findings

## E9 Basin Rim plate

Branch: `sol/basin-rim-e9-plate`

Base: `c272d3a8ba9c36ee2550c7bb55c3fb05edab087e`

Tip: exact Basin Rim SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — E9 now has a fresh red-world site with canonical town paths, ten production-flat pads, relief confined to unused ground, an ice-quarry scarp, a cut canal, and the first short E1-green return.**

The working reference board was freshly rendered from tracked files on `c272d3a8…`. It shows the merged E4 southern boulevard and motor caravan, E5 submerged square, E6/E7 Mesa states, and E8 Dome Commons. No old artifact render was used as a source.

| Surface | E9 verdict | Result |
| --- | --- | --- |
| Seven `townLayout.ts` slots + Dynamo Hall | CARRY COORDINATES, REBUILD SITE | exact centers and footprints; realized maximum pad displacement `0.00000048` |
| Ring road, radial paths, open plaza | CARRY COORDINATES | realized maximum `0.007001`, below the `0.05` ceiling |
| E8 Dome shell and orbital floor | GONE | Basin Rim is a fresh site with no inherited dome geometry |
| Ice Quarry head | PROPOSED NEW | flat 5.6 x 3.8 pad at `(-7.4, -16.6)` |
| Ark scaffold yard | PROPOSED NEW | flat 6.2-unit circular pad at `(7.0, -16.7)` |
| Pan Monument | PERSIST | separately mounted heritage GLB, dry at center until runtime canal-water progression arrives |
| E1 green | PERSIST PALETTE | first short canal seam uses the ratified `#50674c`; later spread remains tile-persistence-owned |

### Production gate

- One node / mesh / primitive; 12,656 / 20,000 triangles; one double-sided, opaque, depth-writing, non-emissive material with one embedded 2048 x 2048 atlas.
- GLB SHA-256 `89f23f703d96c5f519c820a7efca16c00ff5cb985923e9113cb1b480de81212e`; saved-BLEND re-export is byte-identical and every parsed semantic key matches.
- Zero cameras, lights, or animations; base-centered at the town origin.
- All canonical and new pads ray-cast to within `0.00000048` of flat; routes/plaza peak at `0.007001`.
- The embedded atlas contains 6,679 literal `#50674c` pixels in the mapped canal core; the verifier extracts the shipped PNG and enforces the callback.
- Independent review caught that the first feathered candidate only approached the swatch; the exact mapped core and extraction gate close that evidence defect.
- Relief is reserved for the outer lowered basin, quarry scarp, canal cut, and eroded rim. The production GLB contains no buildings, people, props, Pan geometry, or evidence rig.
## Land-Yacht production boss model

Branch: `sol/land-yacht-3d`

Base: `de21f043a8c3b4c69950afbca0c7a612c6826e88`

Tip: exact Land-Yacht SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — the E4 boss now has a real six-wheel iron landship body whose dominant grab crane, teal-glazed wheelhouse, low armored prow, and beached wreck state match the current plates and the live three-zone system.**

| Live component ID | Production mesh | Damage morph | Read |
| --- | --- | --- | --- |
| `wheels` | `wheels` | `Damage_BeachedWheels` | all six physical wheels are one live zone; fore/rear wheels buckle outward, the prow drops, armor tears, and bands shed |
| `crane` | `crane` | `Damage_SlackCrane` | boom folds toward the foredeck, cables and grab sag, pulley fragments fall |
| `wheelhouse` | `wheelhouse` | `Damage_CrackedWheelhouse` | glazed drum and crown rack sideways, breach and glass fragments open the command face |

### Production gate

- 10,632 / 12,000 triangles; exactly three nodes/meshes/primitives with identity transforms and one morph target each.
- One shared, double-sided, non-emissive material with one embedded 1024 x 1024 PNG; zero cameras, lights, or animations.
- Base-center origin; 9.4 long x 4.732414 wide x 6.76943 high. GLB SHA-256 `902191310b8cf604a1196902696ff14de78811f81bb30dd4bb5a3011f5ce7a01`.
- Saved-BLEND re-export is byte-identical and every parsed semantic key matches.
- Same-camera full wreck changes 8.4477% of pixels above 16/255 while retaining the Land-Yacht silhouette.
- Current intact/damage plates and `LandYachtBossSystem.ts` are hash-recorded at base `de21f043…`; the reference boards are fresh direct renders and contain no older render input.
- Gameplay evidence now uses the exact production 42-degree camera, `(0, 26.2, 18.3)` offset, and `-3.35` down-screen target shift.
- Independent review found and closed two defects before commit: all three damage rotations now derive pivots from normalized production geometry, and the prior presentation-only diagonal camera was replaced with the production rig.
- Dust, terrain, lights, camera, and context belong only to evidence. No source, live boss system, balance, contract, or map file is changed.
## Homemaker-9000 production model

Branch: `sol/homemaker-9000-3d`

Base: `f50cc240618ddc23b88efee1f27d4cf2035a04ab`

Tip: exact Homemaker-9000 SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — the E6 boss is a warm, funny, house-sized appliance whose exact `VAC / RACK / CORE` components carry independent damage states and whose combined Act-3 state builds one debris chair, sits, and powers down.**

Fresh town references were rendered directly from tracked GLBs at the full base SHA above. The board shows the current E4 southern boulevard and motor caravan, the E5 submerged square, the complete E6/E7 Mesa towns, and the accepted empty E8 Dome Commons; no prior PNG is a working input. The boss's intact/final gameplay board uses the current playable 128 x 128 Glow Mesa terrain, the canonical Isotope Kitchen stake probe `(0, -32, h=1)`, and the exact Three.js production camera mapped into Blender Z-up coordinates.

| Runtime component | Morph | Read at gameplay distance |
| --- | --- | --- |
| `vac` | `Damage_DroppedVac` | hose slumps, floor head drops, and casing shards settle |
| `rack` | `Damage_SpentRack` | seven-toast roof rack detaches and lands spent beside the machine |
| `core` | `Damage_ChairPose` | body sits back, feet extend, debris chair opens from its hidden basis bundle, and a dark shutter closes the amber core |

- Plate source: `assets/raw/plate-e6-boss-homemaker-9000.png`, SHA-256 `7d308cb43e4d0c6a869363b89e28f4e63c1db5df4205b8b2b8c682d36c88b7ec`.
- GLB: 7,644 / 12,000 triangles; three exact nodes, meshes, and primitives; one non-emissive material and one embedded 1024 x 1024 PNG; zero cameras, lights, animations, or helper nodes.
- Bounds: 7.2 long x 2.991214 deep x 6.514197 high; ground `Y = 0`; base center `X/Z = 0`.
- GLB SHA-256: `3dc03cfafaab0645dc44350843ade2ede19e5ddf4f1a55519afbabeebc649ba9`.
- Chair geometry expands from a 0.023816-unit hidden basis span to 3.969292 units. Every final morph remains above the floor; the combined Act-3 image changes 10.2731% of pixels above 16/255.
- Saved-BLEND re-export is byte-identical and every parsed semantic key matches. `npm run build` passes.
- Independent Codex review found three evidence defects and all are closed: the Three.js camera is now mapped to Blender Z-up, the playable Glow Mesa terrain replaces the town-plate stand-in, and intact/final chair states are shown at identical gameplay distance.
## E8 Dome Commons population

Branch: `sol/dome-commons-e8-population`

Base: `a9be388a3fe95a3228c638ed4afaf8a6ec6a7f5a`

Tip: exact E8 Dome population SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — five grounded, full-wrap production buildings now make the accepted Dome Commons a functioning settlement: food, suits, launch, assay, and freight each have an unmistakable working silhouette in the E8 silver/teal/suit-brass vocabulary.**

The first geometry pass inherited the Dredge-Queen helper's storm-dark boss palette and failed the E8 value law. It was rejected before evidence. The final pack uses a purpose-built oxidized-silver, teal-glass, warm-brass atlas treatment derived from `plate-e8-bld-set.png`; no black boss iron survives. A canonical footprint audit also caught and corrected three small overhangs before final export.

| Building | All-angle / function finding | Final E8 answer | Contract |
| --- | --- | --- | --- |
| Orbital Canteen | a plain pressure box would not communicate the bundle's intimate Earth view | large teal Earth-window bubble and brass seal, actual window seat, public canopy/counter, four front panes, pressure posts, finished engraved rear | 1,024 tris; 4.90 x 3.2784 inside Tavern 5.20 x 3.40; SHA `2a0b89e3d80d…` |
| Suit Fitter | threshold and external pods first exceeded the General Store parcel depth | axis-normalized rotunda with helmet roof/seal, two suit pods and helmets, service hoses, radial ribs, grounded threshold | 1,492 tris; 3.77593 x 3.222 inside 4.80 x 3.30; SHA `3e52b4b2f97b…` |
| Launch Works | the rocket alone read as a toy instead of civic infrastructure | circular pressure seal, rocket with fins/window, four-storey gantry, cross-bracing, umbilical, control cupola | 1,548 tris; 5.44 diameter inside 6.20 orbital circle; SHA `5682cf65044f…` |
| He-3 Assay | the sample tower initially pushed beyond the inherited Assay Office width | glass-roofed lab, three public sample windows, tower/vial, assay counter, paired He-3 pans; width normalized without silhouette loss | 1,468 tris; 4.503 x 3.065 inside 4.60 x 3.40; SHA `bd9bf0d3fe9f…` |
| Mass-Driver Dispatch | a long tube needed an inhabited dispatch identity | coil-wrapped driver and dark bore, rail/tie bed, cargo sled, complete dispatch house/cupola, working signal mast | 1,624 tris; 5.45 x 3.28 inside 5.60 x 3.80 orbital rectangle; SHA `43ce73f10ad7…` |

### Site-break and cadence verdicts

| Fixture | Verdict | Reason |
| --- | --- | --- |
| Five E8 civic identities | NEW | the orbital canteen, suit fitter, launch works, He-3 assay, and mass-driver dispatch are native to sealed life under glass |
| Dome Commons plate | PERSIST, UNCHANGED | the accepted air wall, reclaimed-water ring, pads, and flat cast routes are mounted as context only; its bytes are untouched |
| Pan Monument | PERSIST, UNCHANGED | independent heritage GLB remains at canonical center and is not duplicated into any building |
| Mesa, harbor, and pre-flood town fixtures | GONE, NAMED SITE BREAK | E8 is a fresh orbital site; no E1-E7 ground or building geometry silently migrates under the dome |
| Earth | SKY-RIG OWNED | Earth is evidence-only in these boards and is absent from every production GLB |

- Every asset is one node / mesh / primitive with one double-sided non-emissive material and one embedded 1024 x 1024 atlas; zero cameras, lights, animations, helpers, or emitter anchors. The E8 bundle defines no building emitter-anchor family, so none was invented.
- All five production roots are base-centered and grounded at GLB `Y = 0`. Every assigned parcel has positive X/Z clearance.
- Every saved-BLEND re-export is byte-identical and every parsed semantic key matches.
- The full 20-view audit proves finished backs/sides and no floating, detached, or open geometry. The four-angle ensemble mounts the five assets on the accepted plate without changing the open Pan stage.
- Fresh E1-E7 references were rerendered from current GLBs at the full base SHA above; the E4 board contains the motor boulevard/caravan and the E5 board contains the submerged square. No prior PNG was used as model guidance.
- `npm run build` and independent Codex review are recorded at the final boundary. No `src/`, runtime, simulation, queue, spec, status, layout, plate, Pan, or prior-era asset changes ride this wave.

## Dredge-Queen production model v2

Branch: `sol/dredge-queen-3d-v2`

Base: `5b3cd16f2dbe170fabb70a65362e6d4938e68153`

Tip: exact Dredge-Queen v2 SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — the Dredge-Queen now reads as the landed plate's armored corsair boss at the run camera: the crane-claw, twin paddlewheels, command house, loot hold, and oxblood sail own the silhouette while the four runtime damage components remain exact and independently targetable.**

The prior deterministic component/morph machinery was salvaged from `sol/dredge-queen-3d@39240067`, then rebuilt on current main from the landed intact and damage plates. The first candidate was mechanically correct but read as a small work barge beside the source. V2 keeps the 11,832-triangle topology and strengthens the plate hierarchy through proportion, placement, paint, and value—not extra helper meshes.

| Finding | V2 correction | Evidence |
| --- | --- | --- |
| The crane and grab did not dominate the bow | taller, wider tower; larger pulley, gearbox, boom, and claw fingers | reference A/B + four-angle turntable |
| Paddlewheels read as ordinary propulsion rather than targetable boss armor | pushed farther outboard; larger rims, blades, hubs, and armor | port/starboard damage panels |
| Central mass was too low and toy-like | taller armored hull, larger command house/dome, heavier aft hold | run-camera and reference A/B |
| Sail and paint were too quiet at gameplay distance | larger oxblood main/secondary sails, taller rig, brighter plate-derived albedo | intact and Act-3 A/Bs |

### Contract and damage bindings

| Component mesh | Required morph | Default | Damage read |
| --- | --- | --- | --- |
| `claw` | `Damage_SlackClaw` | `0` | boom sags and grab drops |
| `paddle_port` | `Damage_BrokenPortPaddle` | `0` | port wheel bends and sheds paddles |
| `paddle_starboard` | `Damage_BrokenStarboardPaddle` | `0` | starboard wheel bends and sheds paddles |
| `hold` | `Damage_CrackedLootHold` | `0` | hold armor collapses, cargo spills, sail is struck |

- GLB: 11,832 / 12,000 triangles; four nodes, four meshes, four primitives; one non-emissive material and one embedded 1024 x 1024 PNG; zero cameras, lights, or animations.
- Bounds: 8.000000 long x 4.983127 wide x 5.333330 high; base `Y = 0`; center `X/Z = 0`.
- GLB SHA-256: `0121d7e9891c52c8a329f5a3f4a2004c3f368a101bc1daa4cc98ba9ffa0c53a9`.
- Saved-BLEND re-export is byte-identical and all semantic keys match.
- All-four Act-3 state changes 9.4405% of pixels above 16/255; intact and damaged average luminance differ by 1.1026.
- Independent Codex review found no builder, shape-key, verifier, or evidence-generation defect. Its one P2 finding was stale README dimensions/telemetry; those values are corrected in this wave.
- `npm run build` passes. No runtime, simulation, source, map, or boss-behavior file is changed; the factory retains ownership of the presentation mount.
## E8 Dome Commons plate

Branch: `sol/dome-commons-e8-plate-v2`

Base: `2736e176d69226d40603889ee3e1aa07db623784`

Tip: exact Dome Commons plate SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — the E8 town now has a fresh under-glass site: a readable brass/silver air wall, sealed orbital floor, canonical flat pads and cast routes, and the Pan Monument's first walkable reclaimed-water ring.**

The stale initialized E8 artifact board from `5e97e170` was parked and never reused. The working board was rerendered from tracked files after fetching the fully merged Mesa arc; it contains the current E4 motor boulevard, E5 submerged square, complete E6 Atomic Mesa, and complete E7 Signal Mesa at base `2736e176…`.

| Plate question | Final E8 answer | Evidence |
| --- | --- | --- |
| How does “air is the wall” read at gameplay distance? | depth-safe screen-door panels carried by twelve brass meridians, two latitude seals, a heavy equator gasket, twelve silver/teal pressure posts, and a reinforced airlock throat | source A/B + four-angle turntable |
| How does the Moon stay warm rather than sterile? | warm-grey stippled regolith, brass structure, teal pressure accents, the Pan's thin bright water ring, and the gardener's single flush square of green | Town-camera render |
| What survives the site break? | canonical pad/route coordinates and the separately mounted Pan Monument; no Mesa cliff, E7 relay hardware, or drowned-town geometry | layout contract + E7/E8 A/B |
| Who owns Earth? | the sky rig; Earth is evidence-only and is not baked into the plate GLB | visual evidence contract |

### Production and flat-walk gate

- One node / mesh / primitive, one double-sided non-emissive depth-writing `MASK` material, one embedded 2048 x 2048 atlas, zero cameras/lights/animations. The pane centers remain open through a macro screen-door pattern; Three's loader reports `transparent=false`, `depthWrite=true`, `alphaTest=0.5`.
- 13,108 / 20,000 triangles; GLB SHA-256 `053bf554ed369ef35a532c1b5847d14469d4f661e27867678a3dc56f88fbe081`.
- Bounds: 49.680908 x 49.599998 ground span, 14.0 overall height; object transform and ground-plane origin remain canonical.
- Realized cast-route maximum `0.0343864`; plaza maximum `0.0322139`; ceiling `0.05`.
- Canonical pad maximum `0.0071542`; orbital-pad maximum `0.0265086`; every pad remains clear.
- Saved-BLEND re-export is byte-identical and every parsed semantic key matches.
- `npm run build` passes. No source, runtime, sim, queue, spec, town-layout, building, Pan, or sky asset is changed.
- Independent Codex review found and closed two P2s before commit: shared `BLEND` depth sorting was replaced by the one-material depth-writing screen door, and all production/reference inputs are now hash-pinned to the reviewed base.

Branches: `sol/town-plate` (Wave 1), `sol/town-cozy-pack` (Wave 2), `sol/tavern-full-wrap` (Wave 3), `sol/railcar-3d` (Wave 4), `sol/town-e2-variants` (Wave 7), `sol/town-e3-pilot` (Wave 8 pilot), `sol/town-e3-wide` (Wave 8 wide), `sol/town-e4-pilot` (Wave 9 pilot), `sol/town-e4-wide` (Wave 9 wide), `sol/town-e3-wagon-lights` (scoped E3 follow-up), `sol/town-e5-harbor-rebuild` (Wave 10), `sol/mesa-town-plate` (Mesa Town plate)

Bases: Wave 1 `bacb5717`; Wave 2 `e21dc4aa`; Wave 3 `1281a8f1`; Wave 4 `99d06e91`; Wave 7a `12f6306e`; Wave 7b `91ee55b5`; Wave 8 pilot `e582f3cc`; Wave 8 wide `9f6fe2de`; Wave 9 pilot `56b1efc3`; Wave 9 wide `7e01c14f`; E3 wagon lights `9812edb2`; Wave 10 `54067137`; Mesa Town plate `8d974f11`

Tip: exact Mesa Town plate SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — the Mesa Town plate is a deterministic fresh E6-E7 site with canonical flat cast routes, eight inherited ground-zero pads, an irregular mesa/cliff/scree landform, and two explicitly proposed upper sites reached by legal-grade switchbacks.**

## Mesa Town plate — E6-E7 fresh site

Fresh references were rendered from base `8d974f11911187136469fbd017c9598e5b2faf28` before modeling. The board shows the current E4 southern boulevard and motor caravan and the E5 submerged square; no plaza-wheel-era artifact board was used. The Mesa is a dry-site rebuild sourced from `ter-mesa-seamless.png` and the E6 bundle: ochre caprock, a rear shelf, dry wash, restrained teal starstone seams, broken cliff edge, and scree apron. It contains no drowned-square mesh, water surface, pre-flood street hardware, buildings, props, or people.

### Layout and cadence

| Surface | Verdict | Result |
| --- | --- | --- |
| Seven `townLayout.ts` slots + Dynamo Hall site | CARRY COORDINATES, REBUILD SITE | exact positions/footprints remain at ground zero; realized maximum pad displacement is `0.017547` |
| Ring road, all radial cast paths, open plaza | CARRY COORDINATES | 1,061 realized route samples and 749 plaza samples stay within `0.012002`, against the `0.05` ceiling |
| Drowned-square terrain and E2-E5 street hardware | GONE | fresh Mesa geometry and paint; no water, harbor dressing, road boulevard mesh, buildings, props, or old era anchors in the GLB |
| Pan Monument | PERSIST | heritage asset remains separately mounted at canonical center; its bytes are not duplicated or changed |
| Reactor Dome upper pad | PROPOSED NEW | 6.2-unit circular pad at `(7.0, -16.7)`, target `1.18`; realized deviation `0.011357` |
| Catalog Warehouse upper pad | PROPOSED NEW | 5.6 x 3.8 pad at `(-7.4, -16.6)`, target `1.18`; realized deviation `0.012769` |
| Mesa herd ramps | PROPOSED NEW | switchback grades peak at `0.170295` and `0.149167`, both below the `0.20` contract ceiling |

The two premium pads are surfaced for the attended plate verdict before E6 building production. They are written as candidates in the layout contract and are not claimed as a runtime mount. E1 buildings in evidence are scale/footprint proxies only.
Branches: `sol/town-plate` (Wave 1), `sol/town-cozy-pack` (Wave 2), `sol/tavern-full-wrap` (Wave 3), `sol/railcar-3d` (Wave 4), `sol/town-e2-variants` (Wave 7), `sol/town-e3-pilot` (Wave 8 pilot), `sol/town-e3-wide` (Wave 8 wide), `sol/town-e4-pilot` (Wave 9 pilot), `sol/town-e4-wide` (Wave 9 wide), `sol/town-e3-wagon-lights` (scoped E3 follow-up), `sol/town-e5-harbor-rebuild` (Wave 10), `sol/mesa-town-e6-pilot` (Wave 11 E6 pilot)

Bases: Wave 1 `bacb5717`; Wave 2 `e21dc4aa`; Wave 3 `1281a8f1`; Wave 4 `99d06e91`; Wave 7a `12f6306e`; Wave 7b `91ee55b5`; Wave 8 pilot `e582f3cc`; Wave 8 wide `9f6fe2de`; Wave 9 pilot `56b1efc3`; Wave 9 wide `7e01c14f`; E3 wagon lights `9812edb2`; Wave 10 `54067137`; Wave 11 E6 pilot `8d974f11`

Tip: exact Wave 11 E6 pilot SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — the first three E6 Mesa buildings pass production and across-the-plaza gates: the Atomic Diner is an unmistakable Tavern identity transform, the Reactor Dome owns the premium circular site, and the Isotope Kitchen is complete on all four sides.**

## Wave 11 pilot — E6 Atomic Mesa buildings

This verdict pilot is the first building batch on the ratified E6–E7 Mesa site. It does not accrete drowned E5 harbor geometry. The Atomic Diner edits the Tavern's social identity forward from the clean two-storey false-front shell; Reactor Dome and Isotope Kitchen are new §A1 identities. The Pan Monument remains an independently mounted heritage survivor and is only shown as context.

Fresh reference boards were rerendered from tracked files on `origin/main@8d974f11911187136469fbd017c9598e5b2faf28`. They show the current E4 southern boulevard and motor caravan and the current E5 submerged square; no prior PNG was used as an input. The gameplay evidence uses the exact accepted Mesa plate GLB from `sol/mesa-town-plate@60242186e7bd7e72050146d06533d56922e2fc4e` (SHA `067c8c652134…`) without duplicating those bytes into this branch.

### Per-building findings

| Building | What the first pass got wrong | Final correction and identity read | Final contract |
| --- | --- | --- | --- |
| Tavern → Atomic Diner | inherited shell was initially too dark; hanging sign only read from the public face; rolled fascia exceeded the pad by 0.137 units | brighter chrome/pastel repaint; double-sided letter-free starburst sign; two-storey false-front and social porch retained; rounded chrome counter band, teal pips, roof vent, and rear condenser added; fascia pulled inside the canonical `5.2 x 3.4` pad | 13,904 / 15,000 tris; 1 embedded 1024 atlas; SHA `68ec4ed82ec2…` |
| Reactor Dome | observation panes were rotated radially and read as detached fins | panes turned tangential into one continuous teal ring; alternating enamel pressure panels, twelve load ribs, grounded terrace, four pressure ports, radial service plant, and antenna crown read from every angle; no visible door, per §A1 | 11,420 / 15,000 tris; `6.0 x 6.0` inside the `6.2` premium circle; SHA `64c81b9b6e62…` |
| Isotope Kitchen | open front and unframed colored panes looked like an unfinished shelter; rear service face was too plain; display trim exceeded the provisional General Store pad | grounded counter/glazing frame, integrated sample case, framed side panes, front/rear vault ribs and medallions, hanging warm hoods, paired tong arms, framed rear sample windows, and service header; exact `4.75 x 3.30` footprint | 10,258 / 15,000 tris; 1 embedded 1024 atlas; SHA `9664b671eb91…` |

All three use one mesh, one primitive, one non-emissive material, one embedded 1024 x 1024 atlas, zero anchors/cameras/lights/animations, and a base-center origin grounded at GLB `Y = 0`. No E6 emitter-anchor family is invented because the E6 bundle defines none. The Atomic Diner preserves the untouched E1 Tavern source hashes (`b81ef19a2466…` BLEND / `edec4934d6d…` GLB).

### E6 cadence and inheritance verdict

| Fixture | Verdict | Reason |
| --- | --- | --- |
| Tavern identity | REBUILD / PERSIST | the public-house role, two-storey mass, false-front crest, porch rhythm, and projecting sign persist; flood-era rope/tide/drydock geometry does not travel to the fresh dry site |
| Atomic technology | NEW | chrome counter wrap, enamel pips, starburst pictograms, vent/condenser, and teal/amber accents announce the Atomic Homestead across the plaza |
| Reactor Dome | NEW | new E6 civic-machine identity on its ratified premium circular site; no false prior-era inheritance |
| Isotope Kitchen | NEW | new E6 refinery identity; lab-diner humor is expressed through hoods, tong arms, sample case, and warm/teal glass |
| Pan Monument | PERSIST | unchanged independent heritage asset at the open center; not duplicated into a building GLB |
| Undelivered E6 identities | CARRIED AS MASSING ONLY | Appliance Pen, Decay Clock, Catalog Warehouse, and remaining A2 transforms wait for attended pilot verdict before the wide batch |
Branches: `sol/town-plate` (Wave 1), `sol/town-cozy-pack` (Wave 2), `sol/tavern-full-wrap` (Wave 3), `sol/railcar-3d` (Wave 4), `sol/town-e2-variants` (Wave 7), `sol/town-e3-pilot` (Wave 8 pilot), `sol/town-e3-wide` (Wave 8 wide), `sol/town-e4-pilot` (Wave 9 pilot), `sol/town-e4-wide` (Wave 9 wide), `sol/town-e3-wagon-lights` (scoped E3 follow-up), `sol/town-e5-harbor-rebuild` (Wave 10), `sol/mesa-town-e6-wide` (Wave 12 wide)

Bases: Wave 1 `bacb5717`; Wave 2 `e21dc4aa`; Wave 3 `1281a8f1`; Wave 4 `99d06e91`; Wave 7a `12f6306e`; Wave 7b `91ee55b5`; Wave 8 pilot `e582f3cc`; Wave 8 wide `9f6fe2de`; Wave 9 pilot `56b1efc3`; Wave 9 wide `7e01c14f`; E3 wagon lights `9812edb2`; Wave 10 `54067137`; Wave 12 wide `1a58335f`

Tip: exact Wave 12 SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — the E6 wide complement completes the Atomic Homestead's civic silhouette on the Glow Mesa; all six production GLBs are deterministic, grounded, budget-clean, and reviewed from every side against fresh references rendered from current main.**

## Wave 12 wide — complete E6 Mesa civic set

This wave completes the unbuilt half of E6 §A1 and §A2: Appliance Pen, Decay Clock, Catalog Warehouse, Sunline Mount, Glow Fence, and Isotope Institute. The accepted Atomic Diner / Reactor Dome / Isotope Kitchen pilot and the Mesa plate are evidence-only dependencies; their bytes are not duplicated here. Every working reference was rerendered from tracked files at full base `1a58335f65645b8491e50763e10a32d12d8696f1`. The pre-merge plaza-wheel screenshot is historical evidence only and was not used as an input.

### Per-asset findings

| Asset | All-angle finding | Final E6 correction / identity | Final contract |
| --- | --- | --- | --- |
| Appliance Pen | first massing did not communicate a functional civic yard | open enamel corral, pictogram gate, tether tower, copper lead, feeding trough, and two visibly pacified appliances | 4,766 tris; 4.50 x 3.30 footprint; SHA `be11b90d1cf9…` |
| Decay Clock | front-only storytelling would disappear from side approaches | four-sided civic tower with large teal dial faces, amber decay wedges, chrome crown, side supports, and a grounded stair | 6,000 tris; 3.32 x 2.72 footprint; SHA `2b87660a3c7…` |
| Catalog Warehouse | initial rear was too blank, and the first evidence orientation put it toward the plaza | complete rear loading doors, frame, starburst seal, braces, roof vents, and a rotated premium placement that presents the working loading face | 5,670 tris; 5.587 x 3.743 footprint; SHA `f72109125d3c…` |
| Sunline Mount | a recolored inherited globe did not satisfy the A2 transform | the upper globe is replaced by a genuine concave parabolic dish with struts and teal focus bead, inside the exact inherited envelope | 1,346 tris; exact 1.35 x 1.35 inherited footprint; SHA `44d17919c60e…` |
| Glow Fence | first starstone pips read on only one approach face | retained timber rails gain inset teal pips on both faces, preserving the exact inherited silhouette and footprint | 1,012 tris; exact 0.46 x 3.00 inherited footprint; SHA `686e72c52051…` |
| Isotope Institute | the dome/dial read, but the dial first appeared to float off the tower | Navigation School shell and public face persist; supported chrome dome, half-life dial, brackets, teal observation band, and atomic finial create the E6 skyline | 7,392 tris; exact 3.96 x 3.375 inherited footprint; SHA `f3de54fb0737…` |

The full E6 evidence composition also includes the accepted pilot trio by exact remote hashes: Atomic Diner `68ec4ed82ec2…`, Reactor Dome `64c81b9b6e62…`, and Isotope Kitchen `9664b671eb91…`. The Mesa evidence plate is fixed to SHA `067c8c652134…`. No gray massing proxy survives in the candidate frame.

### E6 cadence and inheritance

| Fixture | Verdict | Reason / inherited signature |
| --- | --- | --- |
| Appliance Pen | NEW, E6 ephemeron | atomic appliances require a cheerful civic wrangling yard unique to this era |
| Decay Clock | NEW | the visible four-face timer makes E6's decay mechanic legible as town infrastructure |
| Catalog Warehouse | NEW | the abandoned mail-order depot explains where the feral appliances enter the era |
| Sunline Mount | REPLACE + PERSIST | active signal globe becomes the named parabolic mirror; the exact turret footprint, lower rings, and tower body persist |
| Glow Fence | UPGRADE + PERSIST | starstone pips plausibly touch the guardrail; timber, rail rhythm, footprint, and silhouette carry unchanged |
| Isotope Institute | REPLACE + PERSIST | sextant-era tower cap becomes the supported dome/dial; Navigation School shell, footprint, and civic public face persist |
| Pan Monument | PERSIST | unchanged independent heritage asset; it is neither rebuilt into an E6 fixture nor included in these GLBs |
| Pre-flood / harbor-only fixtures | GONE, named site break | E6 starts a fresh dry chain on the Mesa, so the old square and drowned-harbor-only objects do not silently migrate to this site |

E6 defines no live emitter-anchor family, so no speculative anchor nodes were invented. These assets use one mesh, one primitive, one non-emissive baked material, and one embedded atlas each; they contain zero lights, cameras, animations, or helpers.

### Placement proposal and ownership boundary

| Mesa role | Evidence placement |
| --- | --- |
| Atomic Diner | Tavern-sized base site |
| Isotope Kitchen | General Store-sized base site |
| Isotope Institute | Schoolhouse-sized base site |
| Decay Clock | Claim Office-sized base site |
| Appliance Pen | Assay Office-sized base site |
| Reactor Dome | premium mesa-top site |
| Catalog Warehouse | opposing premium northern site, loading face inward |

Sunline Mount and Glow Fence are shown as compact context transforms; the factory owns their final runtime mounts. No `src/`, layout, spec, status, backlog, or test file changes ride this asset wave.
Branches: `sol/town-plate` (Wave 1), `sol/town-cozy-pack` (Wave 2), `sol/tavern-full-wrap` (Wave 3), `sol/railcar-3d` (Wave 4), `sol/town-e2-variants` (Wave 7), `sol/town-e3-pilot` (Wave 8 pilot), `sol/town-e3-wide` (Wave 8 wide), `sol/town-e4-pilot` (Wave 9 pilot), `sol/town-e4-wide` (Wave 9 wide), `sol/town-e3-wagon-lights` (scoped E3 follow-up), `sol/town-e5-harbor-rebuild` (Wave 10), `sol/mesa-town-e7-pilot` (Wave 13 pilot)

Bases: Wave 1 `bacb5717`; Wave 2 `e21dc4aa`; Wave 3 `1281a8f1`; Wave 4 `99d06e91`; Wave 7a `12f6306e`; Wave 7b `91ee55b5`; Wave 8 pilot `e582f3cc`; Wave 8 wide `9f6fe2de`; Wave 9 pilot `56b1efc3`; Wave 9 wide `7e01c14f`; E3 wagon lights `9812edb2`; Wave 10 `54067137`; Wave 13 pilot `88ea5d9b`

Tip: exact Wave 13 pilot SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — the E7 Signal Mesa pilot is a gameplay-distance transformation: the Relay Tower and Exchange establish the new broadcast skyline, while the Net Cafe preserves every E6 Atomic Diner polygon and grows a clearly legible signal crown inside its exact inherited footprint.**
Branches: `sol/town-plate` (Wave 1), `sol/town-cozy-pack` (Wave 2), `sol/tavern-full-wrap` (Wave 3), `sol/railcar-3d` (Wave 4), `sol/town-e2-variants` (Wave 7), `sol/town-e3-pilot` (Wave 8 pilot), `sol/town-e3-wide` (Wave 8 wide), `sol/town-e4-pilot` (Wave 9 pilot), `sol/town-e4-wide` (Wave 9 wide), `sol/town-e3-wagon-lights` (scoped E3 follow-up), `sol/town-e5-harbor-rebuild` (Wave 10), `sol/mesa-town-e7-pilot` (Wave 13 pilot), `sol/mesa-town-e7-wide` (Wave 14 wide)

Bases: Wave 1 `bacb5717`; Wave 2 `e21dc4aa`; Wave 3 `1281a8f1`; Wave 4 `99d06e91`; Wave 7a `12f6306e`; Wave 7b `91ee55b5`; Wave 8 pilot `e582f3cc`; Wave 8 wide `9f6fe2de`; Wave 9 pilot `56b1efc3`; Wave 9 wide `7e01c14f`; E3 wagon lights `9812edb2`; Wave 10 `54067137`; Wave 13 pilot `88ea5d9b`; Wave 14 wide `3fe1e493`

Tip: exact Wave 14 wide SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — the complete E7 Mesa is an unmistakable working signal town: the three pilot assets and six wide assets form a coherent broadcast skyline, every named E6 transform preserves all source geometry and its exact footprint, and the honest carried-unchanged fixtures remain legible beneath the new layer.**

## Wave 14 wide — complete E7 Signal Mesa

The wide wave completes §A with three new civic identities and three strict E6 transforms. The Playbook Library, Drone Coop, and Signal Refinery make the era socially and mechanically specific; the Sunline Mount, Isotope Institute, and Catalog Warehouse accrete into the Beam Relay, Signal Works, and Tape Post without losing a single inherited polygon. Together with the accepted Relay Tower, Exchange, and Net Cafe pilot, the Mesa now announces the Signal age across the full gameplay camera.

### Per-asset findings and corrections

| Asset | First all-angle / gate finding | Final correction | Final contract |
| --- | --- | --- | --- |
| Playbook Library | the first walnut shell sat too dark against its pastel E6 neighbors | warmed only the walnut, roof, and service-dark atlas regions; kept the drawer-wall facade, paired punched reels, reader clock, tube flanks, signal crown, and finished rear archive | 7,190 tris; 1024 atlas; 6.10 x 4.97 footprint; SHA `9d615139cf7e…` |
| Drone Coop | the direct GLB looked plausible, but canonical saved-BLEND export revealed five perch arms as separate, unexported meshes—leaving the drones visually unsupported | joined every perch arm into the single production mesh, rerendered all angles, and retained twelve nesting cells, five parked companion drones, keeper hut, dome, rear batteries, and flock-signal crown | 6,986 tris; 1024 atlas; 4.4119 x 4.48 footprint; SHA `3d0faa78725d…` |
| Signal Refinery | first whole-town evidence clipped the southern building and its dark shell pushed the ensemble beyond the 5% tonal ceiling | recentered the locked expanded-site camera without moving models, warmed the atlas, and retained three caged spectrum columns, five public dials, tuning rings, outgoing bands, side ports, and finished condenser rear | 5,882 tris; 1024 atlas; 6.18 x 5.0218 footprint; SHA `695811ee9793…` |
| Sunline Mount -> Beam Relay | the first broadcast arcs expanded the accepted 1.35 x 1.35 footprint to 1.7811 units | shortened only the outgoing arcs; the complete E6 mount stays intact while paired cells, nested routing rings, teal eye, and relay arcs grow vertically inside the exact envelope | 1,998 tris; inherited 512 atlas; exact 1.35 x 1.35 footprint; SHA `be598eba8489…` |
| Isotope Institute -> Signal Works | transform read from the plaza and passed all four sides on the first geometry audit | retained the whole institute, then added an attached tube bank, relay dish, and research-broadcast crown inside the exact footprint | 8,244 tris; 1024 atlas; exact 3.96 x 3.375 footprint; SHA `c7d5446cd7a3…` |
| Catalog Warehouse -> Tape Post | transform read immediately; rear still showed the complete inherited depot rather than a replacement shell | retained the full parcel depot and added a reader bridge, paired tape reels and loop, courier tube, and dispatch signal without growing the footprint | 6,390 tris; 1024 atlas; exact 5.58677 x 3.7425 footprint; SHA `d7b38acbd153…` |

### Accretion and cadence verdicts

| Fixture | Verdict | Reason |
| --- | --- | --- |
| Playbook Library | NEW E7 | public punch-tape storage and demonstration programs are the era's civic crown jewel |
| Drone Coop | NEW E7 | the E6 companion plausibly multiplies into a cheerful dovecote-like civic flock |
| Signal Refinery | NEW E7 | spectrum becomes a usable town resource; its columns and tuning crown carry the era mechanically |
| Atomic Diner / jukebox | PERSIST | accepted pilot retains the complete E6 diner and jukebox |
| Atomic Diner service layer | UPGRADE | accepted pilot's booth terminals, tape readers, and relay crown make the Net Cafe |
| Sunline Mount | PERSIST + UPGRADE | all 685 E6 source polygons remain; signal cells and routing rings give the mount a new LOS relay job |
| Isotope Institute | PERSIST + UPGRADE | all 3,994 E6 source polygons remain; its calculations now feed the Signal Works |
| Catalog Warehouse / parcel office | PERSIST + UPGRADE | all 3,080 E6 source polygons remain; the clerk lineage advances into the Tape Post |
| Reactor Dome | CARRIED UNCHANGED | signal technology does not plausibly rebuild containment |
| Isotope Kitchen | CARRIED UNCHANGED | the kitchen remains useful beside the new Signal Refinery |
| Decay Clock | CARRIED UNCHANGED | public atomic timing still matters and receives no named E7 replacement |
| Appliance Pen | CARRIED UNCHANGED | captured appliances remain a warm civic utility |
| Glow Fence | CARRIED UNCHANGED | the E7 bundle names no fence transform; honest unchanged infrastructure is correct |
| Relay Tower / Exchange | NEW E7 | accepted pilot sites remain the long-range and public-switching landmarks |
| Pan Monument | PERSIST | unchanged heritage asset; no era key, replacement, or disappearance |

No fixture is silently retired, and no E7 emitter-anchor family is defined in the bundle or queue, so none is invented. Every production GLB contains exactly one mesh node, one primitive, one non-emissive material, one embedded atlas at or below 1024², and zero helpers, lights, cameras, or animations.
Branches: `sol/town-plate` (Wave 1), `sol/town-cozy-pack` (Wave 2), `sol/tavern-full-wrap` (Wave 3), `sol/railcar-3d` (Wave 4), `sol/town-e2-variants` (Wave 7), `sol/town-e3-pilot` (Wave 8 pilot), `sol/town-e3-wide` (Wave 8 wide), `sol/town-e4-pilot` (Wave 9 pilot), `sol/town-e4-wide` (Wave 9 wide), `sol/town-e3-wagon-lights` (scoped E3 follow-up), `sol/town-e5-harbor-rebuild` (Wave 10), `sol/town-road-wear-v2` (F-3DC-04)

Bases: Wave 1 `bacb5717`; Wave 2 `e21dc4aa`; Wave 3 `1281a8f1`; Wave 4 `99d06e91`; Wave 7a `12f6306e`; Wave 7b `91ee55b5`; Wave 8 pilot `e582f3cc`; Wave 8 wide `9f6fe2de`; Wave 9 pilot `56b1efc3`; Wave 9 wide `7e01c14f`; E3 wagon lights `9812edb2`; Wave 10 `54067137`; F-3DC-04 `dc46019a`

Tip: exact F-3DC-04 SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — F-3DC-04 replaces the regular inherited road drawing with varied, selectively faded wear while preserving every canonical centerline, mesh byte payload, flat-walk value, E4 boulevard, and motor caravan.**

## F-3DC-04 — current-state road-wear pass

The pass was restarted from current `origin/main` after rejecting the old Wave-2 PNG as a design reference. Fresh references were rendered from base `dc46019af763ff13d5e9ea8fc99d91cbe689e332` directly from the tracked E1, E4, and E5 GLBs and manifests. The E4 frame includes the shipped southern twin-lane boulevard and motor caravans; the E5 frame is the submerged square on the seabed. No prior PNG is an input to the reference generator.

Only the Town plate's embedded 2048-square atlas changes. The inherited ring gains modest width variation; secondary approaches receive distinct strengths and surface breakup; selected spokes fade; and three traffic points receive localized wagon scuffing. The E4 boulevard GLB (`301c1f65f53c…`) and E4 motor-caravan GLB (`10a1383c3b57…`) are byte-untouched.

### Gate evidence

| Check | Result |
| --- | --- |
| Fresh reference base | E1, E4 boulevard + motor caravan, E5 submerged square, and combined board rerendered after fetch from `origin/main@3fe1e493fb11b6685f1ffc76b65dd81ebff8dd6b`; only `STATUS.md` differed from the prior model base |
| Geometry / materials | 7,190 / 6,986 / 5,882 / 1,998 / 8,244 / 6,390 tris against 15,000 each; one mesh, primitive, material, and embedded atlas per asset |
| Grounding / footprint | all six minimum Y values are 0; new sites fit proposed maxima; all three transforms match their E6 XZ footprint exactly |
| Accretion proof | Beam Relay 685/685, Signal Works 3,994/3,994, Tape Post 3,080/3,080 source polygon signatures retained; 0 missing across all three |
| Export determinism | canonical saved-BLEND re-export reproduces all six production GLBs byte-identically |
| Across-the-plaza ensemble | `diffRatio16 = 12.9018%`; edge-energy ratio `1.1134`; average luminance delta `-4.8534%`, inside the 5% tonal law |
| All-angle audit | six four-angle boards plus three exact E6/E7 identity A/Bs show complete sides, backs, roof attachments, grounded bases, and drone support arms |
| App build | `npm run build` passes on the final production bytes |
| Evidence independence | no delegated visual agent was used because this session's explicit no-delegation rule binds; machine telemetry plus direct all-angle inspection are recorded instead |

### Evidence index

- Fresh current-main board: [`town-e1-e4-e5-current.png`](../artifacts/town-e7-wide/current-references/3fe1e493fb11-main/town-e1-e4-e5-current.png)
- Locked ensemble: [`mesa-e7-wide-across-plaza-ab.png`](../artifacts/town-e7-wide/mesa-e7-wide-across-plaza-ab.png), feature crop [`mesa-e7-wide-key-feature-crop.png`](../artifacts/town-e7-wide/mesa-e7-wide-key-feature-crop.png)
- Six four-angle audits: [`playbook-library-e7.png`](../artifacts/town-e7-wide/turntables/playbook-library-e7.png), [`drone-coop-e7.png`](../artifacts/town-e7-wide/turntables/drone-coop-e7.png), [`signal-refinery-e7.png`](../artifacts/town-e7-wide/turntables/signal-refinery-e7.png), [`beam-relay-e7.png`](../artifacts/town-e7-wide/turntables/beam-relay-e7.png), [`signal-works-e7.png`](../artifacts/town-e7-wide/turntables/signal-works-e7.png), [`tape-post-e7.png`](../artifacts/town-e7-wide/turntables/tape-post-e7.png)
- Exact inheritance A/Bs: [`beam-relay-identity-e6-e7-ab.png`](../artifacts/town-e7-wide/identity/beam-relay-identity-e6-e7-ab.png), [`signal-works-identity-e6-e7-ab.png`](../artifacts/town-e7-wide/identity/signal-works-identity-e6-e7-ab.png), [`tape-post-identity-e6-e7-ab.png`](../artifacts/town-e7-wide/identity/tape-post-identity-e6-e7-ab.png)
- Machine contracts: [`asset-contract.json`](../artifacts/town-e7-wide/asset-contract.json), [`visual-evidence-contract.json`](../artifacts/town-e7-wide/visual-evidence-contract.json)

### Wave 14 integration boundary

- Add three new E7 building pairs plus the Sunline Mount, Schoolhouse, and Catalog Warehouse `.e7` siblings; add deterministic build/render/verifier scripts, fresh evidence, the complete cadence table, and this cumulative pilot+wide findings entry.
- Use Wave 12 E6 and Wave 13 pilot bytes only as read-only dependencies. Do not alter those branches' assets, any E1-E5 siblings, runtime source, layout, manifests, specs, status, backlog, or tests.
- New-site evidence proposes Playbook Library `[-14.2, -6.4, 0.12]`, Drone Coop `[14.2, -6.0, -0.10]`, and Signal Refinery `[0.0, 16.2, π]`; accepted pilot sites remain unchanged. Runtime mount ratification stays factory-owned.
- Branch base: `origin/main@3fe1e493fb11b6685f1ffc76b65dd81ebff8dd6b`; dependency tips are Wave 12 `bcc9764b…` and Wave 13 pilot `3947af49…`.

## Wave 13 pilot — E7 Signal Mesa

The E7 pilot deliberately tests three different parts of the Signal-era grammar: a new long-range utility landmark, a new public exchange, and one exact E6 identity edit. All three are modeled from the shipped E7 plates and §A transform notes. The Relay Tower and Exchange propose new E7 sites; the Net Cafe is the accepted Atomic Diner moving forward, not a replacement shell.

### Per-asset findings and corrections

| Asset | First all-angle / gameplay finding | Final correction | Final contract |
| --- | --- | --- | --- |
| Relay Tower | the first rear wall read as an unfinished dark plane, and the dish lacked enough internal structure to read as equipment | added rear cable hatches, dials, jack pips, and drops; rebuilt the concave dish read with a teal rim and eight radial ribs while keeping the grounded radio hall and tapered lattice silhouette | 9,174 tris; 1 material; 1024 atlas; 7.4294 x 4.8700 footprint; SHA `d04851188103…` |
| Exchange | the signal identity read from the plaza, but the service rear was visually quiet | added live jack pips and retained functional switchboard bays on every side; the final silhouette combines seven public jack bays, social booths, jukebox, tube skyline, punch-tape reels, loops, teal dome, and signal mast | 10,466 tris; 1 material; 1024 atlas; 6.0595 x 5.1050 footprint; SHA `122460f1d0a6…` |
| Atomic Diner -> Net Cafe | the first relay crown was too subtle at gameplay distance, and an early terminal placement exceeded the inherited footprint by 0.0875 units | moved all additions inside the exact E6 envelope, then enlarged the roof relay dish, mast, and arcs without adding triangles; three booth terminals and tape readers remain visibly connected to the preserved diner / jukebox identity | 14,704 tris; 1 material; 1024 atlas; exact 5.130185 x 3.3925 E6 footprint; SHA `950253635d46…` |

### Accretion and cadence verdicts

| Fixture | Verdict | Reason |
| --- | --- | --- |
| Relay Tower | NEW E7 | the Signal era needs a long-range public landmark; grounded radio hall, lattice pylon, dish, and signal cells establish that utility at plaza distance |
| Exchange | NEW E7 | public switching, tube traffic, punch tape, and social booths provide the Signal-era civic market rather than repainting an earlier shop |
| Atomic Diner / jukebox | PERSIST | the complete accepted E6 mesh remains in place; polygon-signature comparison finds 0 missing source polygons |
| Atomic Diner service layer | UPGRADE | booth terminals, tape readers, and the roof relay crown convert the existing diner into the required Net Cafe without moving its walls or footprint |
| Other E6 atomic fixtures | CARRIED UNCHANGED IN PILOT | no silent retirement is implied; the E7 wide wave must give every remaining fixture a named PERSIST / REPLACE / RELIC cadence verdict |
| Pan Monument | PERSIST | heritage law remains unchanged; this pilot neither edits nor era-keys it |

The E7 bundle and queue define no emitter-anchor family, so the pilot invents none. Each GLB contains exactly one mesh node and no helpers, lights, cameras, animations, or emission. Proposed compositions for verdict evidence are Exchange at `[-7.55, 9.40]` and Relay Tower at `[7.55, 9.15]`; the Net Cafe inherits the Tavern / Atomic Diner mount. Runtime placement and new-site ratification remain factory-owned.

### Gate evidence

| Check | Result |
| --- | --- |
| Geometry / material | 17,280 / 20,000 tris; one mesh, one primitive, one material, one embedded 2048 x 2048 atlas |
| Export hygiene | zero cameras, lights, animations, external textures, helper meshes, buildings, props, or water surfaces |
| Material law | painted wrap from shipped Mesa art; metallic `0`, roughness `0.92`, no emissive texture or factor |
| Flat-walk law | route and plaza max absolute height `0.012002`; worst inherited pad `0.017547`; all below `0.05` |
| Proposed upper sites | both pad deviations below `0.013`; both ramp grades below `0.18` |
| Determinism | saved-BLEND re-export is byte-identical at SHA-256 `067c8c652134…` |
| Fresh-reference law | every working board records base `8d974f11911187136469fbd017c9598e5b2faf28`; current tracked GLBs/manifests are its only inputs |

### Evidence index

- Fresh current-file E1/E4/E5 board: [`town-e1-e4-e5-current.png`](../artifacts/mesa-town-3d/current-references/8d974f119111-main/town-e1-e4-e5-current.png), with [`reference-contract.json`](../artifacts/mesa-town-3d/current-references/8d974f119111-main/reference-contract.json)
- Current square / Mesa same-camera A/B: [`mesa-town-current-vs-pilot-ab.png`](../assets/pilots/mesa-town-3d/renders/mesa-town-current-vs-pilot-ab.png)
- Four-angle landform review: [`mesa-town-turntable.png`](../assets/pilots/mesa-town-3d/renders/mesa-town-turntable.png)
- Flat routes, inherited pads, proposed upper sites, and ramps: [`mesa-town-flat-walk-overlay.png`](../assets/pilots/mesa-town-3d/renders/mesa-town-flat-walk-overlay.png)
- Machine evidence: [`mesa-town-asset-contract.json`](../artifacts/mesa-town-3d/mesa-town-asset-contract.json), [`mesa-town-layout-contract.json`](../artifacts/mesa-town-3d/mesa-town-layout-contract.json)

### Visual correction record

The first all-angle pass read as a vertical tabletop rim and painted its starstone seams like neon wires. The final plate adds a broken multi-stage cliff foot and scree apron, warms and varies the strata, narrows/darkens the teal geology, and exposes the rear shelf without touching protected routes. The first geometric audit then caught `0.17` edge interpolation on both proposed pads and over-steep direct ramps; widened pad collars and outer switchbacks close those failures under measured gates.

### Integration boundary

- Production candidate: `assets/pilots/mesa-town-3d/mesa-town-plate.glb`.
- The attended factory owns the future Town-site selection/mount and must ratify or revise the two candidate upper sites before their E6 buildings are authored.
- No runtime, sim, current Town plate, E1-E5 models, Pan Monument, manifests, specs, ledgers, status, backlog, or e2e files change in this wave.
| Geometry / materials | 13,904 / 11,420 / 10,258 triangles; one mesh, primitive, material, and embedded 1024 atlas each |
| Footprint | Diner `5.130185 x 3.3925` inside `5.2 x 3.4`; Dome `6.0 x 6.0` inside `6.2`; Kitchen `4.75 x 3.30` inside `4.8 x 3.3` |
| Export hygiene | zero helpers, anchors, cameras, lights, animations, emissive textures, or readable letters |
| Determinism | all three saved-BLEND exports reproduce the production GLBs byte-identically after the repository's canonical `reexport-pilot.sh` |
| Fresh references | E1/E4/E5 boards rerendered from base `8d974f11911187136469fbd017c9598e5b2faf28`; E4 visibly includes the current boulevard/caravan; E5 is the current submerged square |
| Across-the-plaza movement | same-camera massing/E6 comparison: `diffRatio16 = 4.0231%`; edge-energy ratio `1.2072`; visual judgment confirms three distinct silhouettes |
| All-angle QA | Diner's sign reads on both faces; Dome panes form a ring rather than fins; Kitchen front, sides, roof, and rear carry attached authored structure |
| Independent review limitation | local full-frame/crop/turntable review completed; no sub-agent review claimed because this session explicitly forbids delegation |

### Evidence index

- Current-file reference: [`town-e1-e4-e5-current.png`](../artifacts/town-e6-pilot/current-references/8d974f119111-main/town-e1-e4-e5-current.png)
- Gameplay verdict: [`mesa-e6-pilot-across-plaza-ab.png`](../artifacts/town-e6-pilot/mesa-e6-pilot-across-plaza-ab.png) and [`mesa-e6-pilot-key-feature-crop.png`](../artifacts/town-e6-pilot/mesa-e6-pilot-key-feature-crop.png)
- Diner identity: [`atomic-diner-identity-ab.png`](../artifacts/town-e6-pilot/atomic-diner-identity-ab.png)
- Four angles: [`atomic-diner-e6.png`](../artifacts/town-e6-pilot/turntables/atomic-diner-e6.png), [`reactor-dome-e6.png`](../artifacts/town-e6-pilot/turntables/reactor-dome-e6.png), [`isotope-kitchen-e6.png`](../artifacts/town-e6-pilot/turntables/isotope-kitchen-e6.png)
- Machine evidence: [`asset-contract.json`](../artifacts/town-e6-pilot/asset-contract.json), [`visual-evidence-contract.json`](../artifacts/town-e6-pilot/visual-evidence-contract.json)

### Wave 11 pilot integration boundary

- Add `tavern.e6.blend/.glb`, new Reactor Dome and Isotope Kitchen production directories, deterministic builder/verifier/render scripts, evidence, and this findings entry.
- Do not mount the E6 buildings yet unless the attended verdict also ratifies the provisional Kitchen-to-General-Store slot mapping; the Dome site and Diner identity slot already come from accepted coordinates.
- Mesa plate bytes remain owned by `sol/mesa-town-plate`; this wave references that exact GLB for evidence only.
- Runtime source, layouts, specs, queue, status, prior era files, Pan Monument, and landmark files remain untouched.
| Geometry / materials | all six assets under 15,000 tris; one mesh, primitive, material, and embedded atlas each |
| Grounding / footprint | all six terminate at canonical `y = 0`; new buildings fit their proposed sites; all three transforms preserve inherited XZ footprints |
| Transform inheritance | source BLEND/GLB hashes and source bounds asserted for Sunline Mount, Glow Fence, and Isotope Institute |
| Export hygiene | zero cameras, lights, animations, emissive textures, or invented anchors |
| Determinism | canonical `scripts/reexport-pilot.sh` and the dedicated verifier reproduce all six GLBs byte-identically |
| Across-the-plaza | `diffRatio16 = 9.3706%`; candidate edge energy is `1.3513x` baseline; average luminance delta is `-1.1861` |
| All-angle review | six four-angle turntables plus three transform identity A/Bs reviewed; rear/side attachment and wrap corrections applied before final export |
| Fresh-reference law | E1, E4 boulevard + motor caravan, and submerged E5 references rerendered from base `1a58335f6564`; no prior PNG used as guidance |
| App regression | `npm run build` passes on the final production bytes |
| Independent review | not run because this session explicitly forbids sub-agent delegation; local full-frame, crop, identity A/B, and all-angle review completed |

### Evidence index

- Current-file reference board: [`town-e1-e4-e5-current.png`](../artifacts/town-e6-wide/current-references/1a58335f6564-main/town-e1-e4-e5-current.png)
- Locked ensemble A/B: [`mesa-e6-wide-across-plaza-ab.png`](../artifacts/town-e6-wide/mesa-e6-wide-across-plaza-ab.png)
- Feature crop: [`mesa-e6-wide-key-feature-crop.png`](../artifacts/town-e6-wide/mesa-e6-wide-key-feature-crop.png)
- Six four-angle audits: [`turntables/`](../artifacts/town-e6-wide/turntables/)
- Transform identity A/Bs: [`identity/`](../artifacts/town-e6-wide/identity/)
- Machine contracts: [`asset-contract.json`](../artifacts/town-e6-wide/asset-contract.json), [`visual-evidence-contract.json`](../artifacts/town-e6-wide/visual-evidence-contract.json)

### Wave 12 integration boundary

- Add six production `.blend` / `.glb` pairs, the deterministic builder/renderer/verifier, fresh reference boards, visual evidence, and this findings entry.
- The accepted E6 pilot trio and Mesa plate remain exact evidence-only dependencies; attended integration may land the branches independently without file collision.
- Existing E1-E5 assets, the Pan Monument, runtime source, layout, specs, status, backlog, and e2e files remain untouched.
- Branch base: full `origin/main` SHA `1a58335f65645b8491e50763e10a32d12d8696f1`.
| Fresh reference base | all boards rerendered from `origin/main@88ea5d9bca59dca64f35766b466cc2755751dcbb`; the supplied old plaza-wheel screenshot was excluded |
| Geometry / materials | 9,174 / 10,466 / 14,704 tris against 15,000 each; one mesh, primitive, non-emissive material, and embedded 1024 atlas per GLB |
| Grounding / footprint | all three assets have minimum Y = 0; new sites fit their proposed maxima; Net Cafe matches the E6 XZ envelope exactly |
| Accretion proof | all 7,391 E6 source polygon signatures survive in the Net Cafe; 0 missing; source and candidate footprint values are identical |
| Export determinism | saved-BLEND re-export reproduces all three production GLBs byte-identically |
| Across-the-plaza read | `diffRatio16 = 7.7278%`; edge-energy ratio `1.1580`; average luminance delta `-3.1896%`, inside the 5% tonal law |
| All-angle audit | dedicated four-angle boards show finished fronts, sides, backs, roof attachments, load paths, and no clipped/cropped structures |
| App build | `npm run build` passes on the final production bytes |
| Evidence independence | no delegated visual agent was used because this session's explicit no-delegation rule binds; machine telemetry plus direct all-angle inspection are recorded instead |

### Evidence index

- Current-main reference board: [`town-e1-e4-e5-current.png`](../artifacts/town-e7-pilot/current-references/88ea5d9bca59-main/town-e1-e4-e5-current.png)
- Locked Mesa A/B: [`mesa-e7-pilot-across-plaza-ab.png`](../artifacts/town-e7-pilot/mesa-e7-pilot-across-plaza-ab.png), key-feature crop [`mesa-e7-pilot-key-feature-crop.png`](../artifacts/town-e7-pilot/mesa-e7-pilot-key-feature-crop.png)
- Four-angle audits: [`relay-tower-e7.png`](../artifacts/town-e7-pilot/turntables/relay-tower-e7.png), [`exchange-e7.png`](../artifacts/town-e7-pilot/turntables/exchange-e7.png), [`net-cafe-e7.png`](../artifacts/town-e7-pilot/turntables/net-cafe-e7.png)
- Exact identity A/B: [`net-cafe-identity-e6-e7-ab.png`](../artifacts/town-e7-pilot/identity/net-cafe-identity-e6-e7-ab.png)
- Machine contracts: [`asset-contract.json`](../artifacts/town-e7-pilot/asset-contract.json), [`visual-evidence-contract.json`](../artifacts/town-e7-pilot/visual-evidence-contract.json)

### Wave 13 pilot integration boundary

- Add production Relay Tower and Exchange BLEND/GLB pairs; add only the Tavern's `.e7` sibling for the Net Cafe transform; add deterministic build/render/verification scripts, fresh evidence, and this findings entry.
- Do not change the inherited E6 production bytes, any E1-E5 siblings, runtime source, layout, manifests, specs, status, backlog, or tests.
- The new Relay Tower and Exchange mount transforms are proposals in evidence, not runtime edits. The factory ratifies and mounts new sites after the pilot verdict.
- Wave 12 E6 assets are read-only evidence dependencies from the published `sol/mesa-town-e6-wide` / `sol/mesa-town-e6-pilot` tips; this branch is based cleanly on `origin/main@88ea5d9bca59dca64f35766b466cc2755751dcbb`.
| Texture-only proof | exported mesh attributes + canonicalized topology are byte-identical to `dc46019a`; only the embedded PNG hash changes |
| Canon routes | `centerlinesIdentical = true`; ring and all eight radial coordinate arrays are exact |
| Flat-walk law | unchanged layout contract: route max `0.037230`, plaza max `0.037210`; saved-mesh raycast recheck: route `0.037101`, plaza `0.034182`, every pad under `0.000136` |
| Asset contract | 17,596 tris; one mesh / primitive / material / embedded 2048 PNG; zero cameras, lights, animations, or anchors |
| Determinism | saved BLEND re-export is byte-identical at SHA-256 `6ff3b7d04adc…` |
| Fresh E4 visual delta | 5.1086% of pixels differ above 2/255 and 1.4767% above 8/255; boulevard/caravan composition is unchanged |
| App regression | `npm run build` passes; `town-era-switch.spec.ts` passes 14/14 across desktop and mobile |

### Evidence index

- Fresh current-state contract and E1/E4/E5 renders: [`dc46019af763-main`](../artifacts/town-plate-3d/current-references/dc46019af763-main/reference-contract.json)
- Fresh E4 before/after and focus A/B: [`road-wear-e4-before-after.png`](../artifacts/town-plate-3d/current-references/dc46019af763-road-wear-after/road-wear-e4-before-after.png), [`road-wear-e4-focus-before-after.png`](../artifacts/town-plate-3d/current-references/dc46019af763-road-wear-after/road-wear-e4-focus-before-after.png)
- Geometry / centerline proof: [`road-wear-contract.json`](../artifacts/town-plate-3d/road-wear-contract.json)

### Integration boundary

- Replaces `town-plate.blend` and `town-plate.glb` at their existing production paths; no mount or runtime path changes.
- Adds the fresh-reference renderer and texture-only verifier; updates only this findings ledger and Town-plate evidence.
- All building variants, era prop GLBs/manifests, Pan Monument bytes, layout source, sim paths, specs, and runtime source remain untouched.

## Wave 10 — E5 Deepwater Harbor Rebuild

The Flood Break is a real reset, not another accretion layer. Each E5 building starts from its clean E1 identity shell, removes all E2–E4 machinery and emitter anchors, then rebuilds the identity in tarred timber, rope trim, tide boards, drydock hardware, and teal harbor signals. The new town is underwater: every heavy building terminates on four compact tarred ballast shoes at canonical `y = 0`, while props use stone feet or weighted cradles. Nothing floats and no model GLB contains a duplicate water surface.

### Per-building findings

| Building | Fresh E5 identity | Seabed / all-angle result | Final contract |
| --- | --- | --- | --- |
| Tavern / Harbor House | lantern gable, rope trim, tide chart, working lantern, hawser coil | four compact ballast shoes; full rear and both sides; no inherited porch/motor/voltage hardware | 11,776 tris; SHA `02a6d71fa97e…` |
| General Store / Bonded Chandlery | customs seal, loading gantry, hoist, tide board, wet hawser | grounded corner shoes; gantry and hoist have visible load paths | 3,452 tris; SHA `c4d0d3f89679…` |
| Claim Office / Harbor Office | storm-signal mast, registry board, tide staff, harbor lantern | grounded corner shoes; mast/braces attach to the retained civic shell | 2,788 tris; SHA `8f192c4efb46…` |
| Assay Office / Salvage Assay | sorting canopy, salvage hoist, sieve, pearl gauge, wet line | grounded corner shoes; canopy/hoist remain clear from the shell at all four angles | 4,344 tris; SHA `140de2941ff5…` |
| Chapel / Mariners Chapel | storm stays, rope rails, rescue ring, tide memorial, storm lantern | grounded corner shoes; stays terminate in explicit tower/roof brackets after first review | 3,956 tris; SHA `0e6bb2fc5c8b…` |
| Schoolhouse / Navigation School | lookout deck, chart board, rope rails, required sextant finial | grounded corner shoes; finial and rails attach cleanly and preserve the school silhouette | 6,040 tris; SHA `941076bc0b4f…` |
| Stamp Mill / Drydock Works | timber gantry, hull cradle, capstan, hoist | grounded corner shoes; working drydock silhouette reads on front and rear quarters | 2,004 tris; SHA `2c33e260a9a0…` |
| Dynamo Hall / Harbor Works | crane, winch, cargo rail, harbor crest | grounded corner shoes; black inherited roof is fully wrapped and the crane is physically braced | 3,344 tris; SHA `e711f0d7b398…` |

Production inventory remains eight real mounted buildings: seven canonical `townLayout.ts` slots plus the accepted Dynamo Hall additive site. No ninth identity is fabricated. Every building has one mesh, one primitive, one non-emissive material, one embedded 1024 x 1024 atlas, zero cameras/lights/animations, the exact E1 footprint and envelope, and 100% of the E1 identity triangle signatures. All pre-flood `steam_anchor_*`, `arc_anchor_*`, and `exhaust_anchor_*` nodes are absent by design.

### Wagon, trough, and E5 accessory pack

| Asset | Flood-Break role | Final contract |
| --- | --- | --- |
| Covered wagon E5 | wagon is gone; a waterlogged arrival dinghy rests in a weighted seabed cradle with folded mast, patched sail, hawser, and buoy | 728 / 1,800 tris; 1 material; SHA `01cf627b01a8…` |
| Water trough E5 | horse trough is gone; a sealed freshwater cistern sits on a broad ground foot with rope bands and teal tap | 504 / 1,200 tris; 1 material; SHA `a1250d16334f…` |
| Harbor lantern | twin unlit lanterns on a tarred post and stone foot | 828 / 1,000 tris; SHA `5b76eba0234a…` |
| Drying-net frame | patched working net, cork floats, and a low seabed ballast foot | 672 / 1,000 tris; SHA `96d5ec95020f…` |
| Tide board | pictogram-only water marks and rescue ring on a stone-footed post | 336 / 1,000 tris; SHA `c3a803a3c696…` |
| Rope-buoy rack | two rope coils and buoys on a broad grounded rack | 816 / 1,000 tris; SHA `7729ea99e47a…` |

The six prop GLBs embed byte-identical copies of the shared 1024 x 1024 E5 atlas. `era-props.e5.json` proposes five generously separated placements and declares `"floodReset": true`; its minimum route, stage, pad, existing-prop, and pairwise clearances are `4.4020`, `7.3020`, `0.8421`, `0.9087`, and `6.9675` units respectively. The open plaza stage remains empty. The unchanged Pan Monument is the sole named heritage survivor; its BLEND/GLB SHA-256 remain `c361cf31…` / `e86e7cda…`. Landmark freeze is honored.

### Flood-break cadence

| Fixture | Verdict | Reason |
| --- | --- | --- |
| Eight buildings | GONE -> REPLACE | public identities return as fresh harbor structures; no pre-flood technology survives in their geometry |
| Covered wagons | GONE -> REPLACE | arrivals now use a weighted, waterlogged dinghy rather than a floating wagon costume |
| Water trough | GONE -> REPLACE | freshwater is protected in a sealed cistern after the catastrophe |
| E2–E4 street hardware | GONE | steam, voltage, and motor accessories are drowned or cannibalized; the E5 manifest hard-resets them |
| Harbor accessories | NEW | lanterns, net frame, tide board, and rope/buoy rack define the working underwater harbor |
| Seabed foundations | NEW -> PERSIST | compact ballast shoes make the weight and ground contact explicit without turning buildings into tabletop tokens |
| Pan Monument | PERSIST | unchanged heritage asset; its E5 high-ground/reclaimed-ring transform remains factory-owned |

### Gate evidence

| Check | Result |
| --- | --- |
| Geometry / materials | 8/8 buildings under 15,000 tris; wagon/trough under 1,800 / 1,200; accessories under 1,000; one mesh, primitive, material, and embedded atlas throughout |
| Flood Break | all eight variants use their E1 identity shell; E2–E4 geometry and all three old anchor families are absent |
| Grounding / envelope | every building and prop reaches canonical `y = 0`; buildings preserve exact E1 bounds and origins |
| Export hygiene | zero cameras, lights, animations, emissive textures, or authored water surfaces |
| Determinism | saved-BLEND re-export reproduces all 14 production GLBs byte-identically |
| Placement / flat walk | five E5 manifest records clear routes, pads, shipped props, one another, and the plaza stage; overlay reviewed |
| Production-light ensemble | E4 and E5 compared under the identical shipped Town light rig; `diffRatio16 = 5.8045%`, average luminance delta `+1.1275` |
| Underwater story read | separate underwater camera and overview read as a submerged town resting on the seabed; fresh unprimed visual QA returns SHIP |
| App regression | `npm run build` passes; `e2e/town-era-switch.spec.ts` passes 12/12 across desktop and mobile |
| Independent review | repository review's evidence-lighting issue corrected; confirmed manifest-accumulation seam recorded as F-3DC-34 |

### Evidence index

- Same-light whole Town: [`town-wide-verdict-e4-e5-ab.png`](../artifacts/town-e5-harbor/town-wide-verdict-e4-e5-ab.png), blind pair [`town-ensemble-blind-pair.png`](../artifacts/town-e5-harbor/town-ensemble-blind-pair.png)
- Underwater intent: [`town-e5-harbor-underwater.png`](../artifacts/town-e5-harbor/e5/town-e5-harbor-underwater.png), expanded seabed view [`town-e5-seabed-overview.png`](../artifacts/town-e5-harbor/town-e5-seabed-overview.png)
- Eight locked-camera A/Bs: `*-town-verdict-e4-e5-ab.png` under [`artifacts/town-e5-harbor`](../artifacts/town-e5-harbor/)
- Eight four-angle A/Bs: `*-turntable-e4-e5-ab.png` plus [`all-buildings-e5-turntable-contact.png`](../artifacts/town-e5-harbor/all-buildings-e5-turntable-contact.png)
- Props / placement: [`accessory-pack-and-pan-survivor-e5.png`](../artifacts/town-e5-harbor/accessory-pack-and-pan-survivor-e5.png), [`e5-accessory-clearance-overlay.png`](../artifacts/town-e5-harbor/e5-accessory-clearance-overlay.png)
- Machine evidence: [`asset-contract.json`](../artifacts/town-e5-harbor/asset-contract.json), [`comparison-metrics.json`](../artifacts/town-e5-harbor/comparison-metrics.json), [`blind-key.json`](../artifacts/town-e5-harbor/blind-key.json)

### F-3DC-34 — E5 must reset the accessory timeline at the runtime mount

**Severity:** high, factory integration gate

**Evidence:** independent code review confirmed `TownTavernPilot.ts:530-533` currently concatenates every manifest from E2 through the active era. At E5 that would mount all 18 pre-flood records plus these five replacements; four E5 placements intentionally reuse E4 coordinates, so the old and new hardware would overlap deterministically. The new manifest declares `floodReset: true` and contains only E5 records, but the current runtime does not yet consume that flag.

**Factory requirement:** when the active manifest declares `floodReset`, begin accessory selection at that era rather than E2. Do not move the E5 props to hide the bug: the Flood Break requires removal, not coexistence. Add an E5 era-switch assertion that only the five E5 IDs mount before qualifying this asset wave in-game.

### F-3DC-35 — Geometry verdicts must not borrow unshipped atmosphere

**Severity:** resolved evidence gate; runtime art-direction follow-up

**Evidence:** first whole-Town evidence compared warm production E4 against a cool evidence-only E5 rig, producing a meaningless `97.07%` changed-pixel ratio. Independent review caught that production `TownScene.dressScene` does not yet vary lighting by era. The final primary A/B now holds lighting identical and still changes `5.8045%` of pixels above threshold 16; underwater lighting is isolated in a clearly named story view.

**Decision:** qualify the models under shipped lighting. The factory/3D-D environment seam may later add E5 water, fog, and caustic atmosphere, but model approval cannot depend on that unlanded work.

### F-3DC-36 — The current Town plate is not the final E5 seabed

**Severity:** medium, adjacent terrain ownership

**Evidence:** final unprimed visual QA returned SHIP for every E5 model and separately identified square texture patches, hard rear plate cutouts, and the soft inherited plaza-wheel marking. These are unchanged Wave 1 Town-land issues, not defects in the new building or prop GLBs. The evidence-only continuation plane now sits below the complete plate and no longer cuts holes through its relief.

**Request:** coordinate a proper E5 Town-land/seabed variant with 3D-D under the shared palette family. Preserve the canonical pad and walk-law geometry; replace the visibly finite dry-era plate treatment rather than adding corrective geometry to each building.

### F-3DC-37 — Underwater weight needs contact, not perimeter plinths

**Severity:** resolved visual gate

**Evidence:** the first grounding pass wrapped each house in a full dark perimeter rail, which made the town read as tabletop tokens. The final pass replaces those rails with four compact tarred shoes at `y = 0`; the Chapel additionally gains explicit stay brackets, and the net frame/dinghy gain dedicated ballast feet. Fresh review finds all buildings, accessories, and roof fixtures physically attached and returns SHIP.

**Decision:** show the buildings' weight through sparse load-bearing contact points and shadows. Do not lift, float, or place the heavy settlement on buoyant platforms.

### Wave 10 integration boundary

- Add eight `.e5.blend` / `.e5.glb` building siblings, E5 dinghy/cistern siblings, four accessory GLBs, the shared atlas/manifest, deterministic builders/verifier, evidence, and this findings entry.
- E1–E4 production siblings, all landmark GLBs, the Pan Monument bytes, runtime source, layout, specs, status, backlog, and e2e files remain untouched.
- The existing sibling loader discovers `.e5.glb` files automatically. The attended factory must implement F-3DC-34's narrow `floodReset` mount behavior before live qualification.
- Branch base: `54067137`; origin/main observed at `6b871ba8` after the branch was cut. Main moved in unrelated factory/terrain ledgers; no Wave 10 asset path was changed.

## Scoped E3 follow-up — wagon filament lights

The accepted E3 covered wagon gains a small, era-native festoon on both canopy sides: a shallow copper cord, three suspended warm filament dots per side, short hangers, and clamps at the end and center ribs. The bulbs are unlit painted geometry because the shared RECIPE assigns illumination to the game light rig; no emissive texture, authored light, or animation was introduced.

The old roof terminal remains present with the same voltage-era role and `arc_anchor_1` remains untouched. Its hidden round-section tessellation was simplified to fund the visible festoon inside the unchanged 1,800-triangle prop budget; there is no accretion verdict change. No other E3 building, prop, manifest, runtime source, or prior/later era file changed.

### Gate evidence

| Check | Result |
| --- | --- |
| Geometry / material | 1,796 / 1,800 tris; one mesh, one primitive, one material, one embedded 256 x 256 atlas |
| Interface / inheritance | exact accepted E2 envelope; E3 roof terminal retained; `arc_anchor_1` retained at its accepted transform |
| Export hygiene | zero cameras, lights, animations, or emissive textures |
| Determinism | canonical `scripts/reexport-pilot.sh` reproduces SHA-256 `1e396fe52f746f33ca7dac701b76ccc40ce6e23bba7a534cfcdfa39261103517` byte-identically |
| Era-loader regression | `e2e/town-era-switch.spec.ts` passes 12/12 across desktop and mobile |
| App build | `npm run build` passes on the final production bytes |
| Visual QA | fresh unprimed review returns SHIP; no clipping, detached bulbs, missing geometry, or scale artifact |

### Evidence index

- Four-angle E3 before/after: [`wagon-e3-lights-turntable-ab.png`](../artifacts/town-e3-wagon-lights/wagon-e3-lights-turntable-ab.png)
- Locked E3 Town camera: [`wagon-e3-lights-town-camera.png`](../artifacts/town-e3-wagon-lights/wagon-e3-lights-town-camera.png)

### F-3DC-33 — Tiny era props still need attachment logic

**Severity:** resolved visual gate

**Evidence:** the first light pass used flat dark cards that read as cable clips, with unsupported endpoints and no clear sockets. The final pass replaces them with warm octahedral bulbs, short hangers, a smoothed high cord, and rib clamps on both sides. A second placement pass raises the run clear of the wagon-bed stakes. Fresh final review returns SHIP and finds no clipping or detached bulbs; only minor equipment-side overlap remains at the locked camera.

**Decision:** repeated color dots alone do not communicate a functional fixture. Even at this scale, give the feature a cord, socket/hanger, and visible load path into the inherited shell.

### Scoped E3 integration boundary

- Replace only `covered_wagon.e3.blend` / `covered_wagon.e3.glb` and its deterministic builder; add the two review images and this findings entry.
- All other E1-E4 assets, era manifests, runtime source, tests, specs, status, and the Pan Monument remain untouched.
- E5 Harbor Rebuild is intentionally not started until this ordered wave receives its attended verdict.
- Branch base: `9812edb2`; publication is session-branch-only for attended gates, never `main`.

## Wave 9 wide — complete E4 Motor Town

Wave 9 wide retains the two accepted era-defining pilots byte-for-byte and applies the Motor age to the other fixtures only where the technology plausibly touches them. Industrial and civic-service buildings upgrade; the Chapel stays quiet; the trough becomes a cold relic. E4-native smoke interfaces are named `exhaust_anchor_*` empties for factory-owned **light dust puffs only**. Quiet/relic fixtures carry no E4 exhaust anchor, and no black smoke, emissive geometry, particles, lights, or animation are authored.

### Per-building findings

| Building | First locked-camera finding | Final E4 identity edit | E3 inheritance check | Final contract |
| --- | --- | --- | --- | --- |
| Tavern / Motor Inn | accepted pilot | compact porte-cochère and parked runabout relief, with inherited E3 hardware | 14,900 / 14,900 triangle signatures retained | 14,984 tris; 3 anchors; SHA `c922b0d54146…` |
| Schoolhouse / Polytechnic | accepted pilot | visible drafting wing, wide windows, drive trim, and roof wind gauge | 8,752 / 8,752 retained | 10,524 tris; 2 anchors; SHA `f014a4e3107c…` |
| General Store / Motor Supply | facade read immediately; independent all-angle review found the first garage doors too flat | service canopy, paneled double garage doors with handles, public road-wheel sign, fuel drum, and service exhaust | 5,056 / 5,056 retained | 6,132 tris; 2 anchors; SHA `f8c63f3377e5…` |
| Claim Office / Road Office | facade read immediately; first route boards needed a stronger physical attachment | permit canopy, twin wheel-pictogram route boards with a diagonal brace, registry wheel, brass supports, and dust exhaust | 6,668 / 6,668 retained | 7,688 tris; 2 anchors; SHA `072bbaafe501…` |
| Assay Office / Fuel Laboratory | facade tanks passed the turntable but were hidden at gameplay distance; the first roof tank crowded the chimney | retained test hood and twin tanks plus a shorter plaza-visible riveted roof motor-test tank grounded in two saddles | 6,248 / 6,248 retained | 7,600 tris; 2 anchors; SHA `5b3c81c76100…` |
| Chapel | first draft incorrectly forced a roadside shelter, service motor, and roof route rig onto a fixture motors barely touch | quiet low parking rail and old oil stain only; inherited cross, chapel identity, and prior-era hardware remain dominant | 6,748 / 6,748 retained | 6,876 tris; 0 E4 anchors; SHA `813faa9edc14…` |
| Stamp Mill / Engine Works | facade flywheel and lean-to were below the gameplay camera's parcel edge; first roof tank appeared unsupported | retained lean-to / service motor plus a roof flywheel and a lower banded motor tank seated in two saddles | 2,916 / 2,916 retained | 4,596 tris; 2 anchors; SHA `880a81705140…` |
| Dynamo Hall / Motor Works | first filling pumps sat fully on the cropped outward facade; first roof board blended into the black roof | retained pumps and voltage crown plus a warm ridge route bar, teal crest, and paired roof fins within the existing envelope | 6,248 / 6,248 retained | 7,636 tris; 3 anchors; SHA `b04126109117…` |

The ensemble blind pair makes the Motor side unmistakable through the Motor Inn, Polytechnic, Motor Supply, Engine Works, Road Office, Fuel Laboratory, Motor Works, and the new skyline road/fuel infrastructure; its `diffRatio16` is `2.7419%`. The Chapel is intentionally unchanged at the gameplay camera and reads only in its all-angle audit. Every building has one mesh, one primitive, one material, one embedded 1024 x 1024 atlas, zero cameras/lights/animations/emissive textures, and the exact accepted E3 envelope. The worst absolute localized luminance delta is Dynamo Hall at `1.2226%`, well inside the 5% law.

### Wagon, trough, and Motor accessory pack

| Asset | Motor edit / role | Final contract |
| --- | --- | --- |
| Covered wagon E4 | retains all 1,780 E3 triangle signatures—including the E2 fittings and soot-cold E3 roof terminal—then uses its remaining 20 triangles for a wedge engine bonnet, attached upright dust exhaust, framed warm cab window, and small unlit side headlamp, turning the inherited wagon into a playful compact motor caravan | 1,800 / 1,800 tris; exact E3 envelope; 1 anchor; SHA `10a1383c3b57…` |
| Water trough E4 | retains all 1,096 E3 triangle signatures; the old electric pump is soot-dark, visibly capped/boarded, and carries no active E4 seam | 1,148 / 1,200 tris; exact E3 envelope; 0 E4 anchors; SHA `9899ed7ce1cf…` |
| Fuel rack | three banded drums in a grounded working rack | 432 tris; 1 anchor; SHA `3f3184f0e262…` |
| Road marker | tall camera-facing pictogram direction arms, rubber road wheel, and dust beacon | 280 tris; 1 anchor; SHA `2962e6bcc91a…` |
| Filling shed | camera-facing compact fuel tank, twin pumps, amber canopy, roof wheel sign, tethered wheel crest, and three dust interfaces | 484 tris; 3 anchors; SHA `0abc3137860e…` |
| Motor roadway | two shallow compacted entrance lanes with paired wheel ruts around the inherited horse trough, conforming to the relieved Town plate while remaining 0.7699 clear of the actor route | 48 tris; 0 anchors; SHA `301c1f65f53c…` |

The four accessory types embed the same byte-identical 1024 x 1024 atlas. `era-props.e4.json` proposes five records—one fuel rack, two road markers, one filling shed, and the paired-lane roadway—while retaining all 13 E2/E3 accessory records. The larger road marker and filling shed sit on the rear skyline so their silhouettes remain distinct from building roofs. For freestanding props the tightest route clearance is `3.9000`, building-pad clearance `0.3401`, shipped-prop clearance `0.4067`, inherited-accessory clearance `0.9548`, and E4 pairwise clearance `11.0821`. Every roadway vertex follows the Town plate at `0.018–0.020` above its local surface, remains `0.7699` from the canonical actor route, and stays outside the protected plaza stage at `7.0298` minimum radius.

### Upgrade cadence

| Fixture | Cadence | Accretion verdict | Why E4 touches it this much |
| --- | --- | --- | --- |
| Motor Inn | upgraded | PERSIST E3 festoon; RELIC older steam fittings; REPLACE arc anchors with exhaust anchors | Motor travel directly creates the drive-through inn. |
| Polytechnic | upgraded | PERSIST E3 orrery/grid hardware; RELIC steam fittings; REPLACE arc anchors with exhaust anchors | Vehicle engineering grows its drafting wing and wind gauge. |
| General Store | upgraded | PERSIST shop/electric service; RELIC steam fittings; REPLACE arc anchors | The store becomes the public Motor Supply and service point. |
| Claim Office | upgraded | PERSIST civic shell/grid feed; RELIC steam fittings; REPLACE arc anchors | Motor roads create permits, route boards, and registration. |
| Assay Office | upgraded | PERSIST electrical laboratory gear; RELIC steam apparatus; REPLACE arc anchors | Fuel quality and oil samples give the lab a direct E4 job. |
| Chapel | upgraded | PERSIST chapel/cross/prior wiring; RELIC cold steam hardware; REPLACE active arc seam with none | Motors add only a parking rail and oil stain; worship gets no exhaust fixture. |
| Stamp Mill | upgraded | PERSIST electric drive; RELIC steam plant; REPLACE arc anchors | Industrial motors directly alter its drive and service yard. |
| Dynamo Hall | upgraded | PERSIST E3 grid crown; RELIC steam header; REPLACE arc anchors | The grid now supplies motors and supports the Motor Works. |
| Covered wagon | upgraded | PERSIST shell; RELIC E2 fittings/E3 terminal; REPLACE arc anchor | A warm side engine and upright dust exhaust make the wagon a playful compact motor caravan. |
| Water trough | relic'd | PERSIST trough; RELIC capped E2/E3 feed/pump; REPLACE active arc seam with none | Horse infrastructure fades instead of becoming a motor appliance. |
| Street lamps | carried-unchanged | PERSIST E3 lighting | Motors do not relight a street. |
| Town roads | upgraded | PERSIST canonical flat walk geometry; NEW E4 paired compacted entrance lanes | Motors plausibly harden the wagon approaches that Voltage left as dirt ruts. |
| E3 grid accessories | carried-unchanged | PERSIST wires, insulators, transformer; arc effects cold in E4 | The grid still serves the town without announcing the era. |
| E2 steam accessories | relic'd | RELIC coal bin, pipe, gauge, manifold; steam effects cold | Motor infrastructure supersedes the public steam-era role without erasure. |
| Hitching posts | relic'd | RELIC posts remain | The posts outlive the horse traffic they served. |
| Fences, well, notice board, planters | carried-unchanged | PERSIST unchanged | Motors give no believable reason to rebuild civic furniture. |
| Fuel racks, road markers, filling shed | upgraded | NEW E4 infrastructure | Fuel and marked routes carry the ensemble's Motor announcement. |
| Pan Monument | carried-unchanged | PERSIST by Heritage Law | The Town changes around its permanent through-line. |

### Gate evidence

| Check | Result |
| --- | --- |
| Geometry / materials | 8/8 buildings under 15,000 tris; wagon/trough under 1,800 / 1,200; accessories under 500; one mesh, primitive, material, and embedded atlas throughout |
| Accretion Law v2 | all 8 buildings plus wagon/trough preserve 100% of E3 triangle signatures; each signature fixture receives PERSIST / REPLACE / RELIC treatment in the cadence table |
| Interfaces / cold anchors | exact E3 envelopes; sequential `exhaust_anchor_1..N` only where E4 machinery is active; Chapel/trough correctly have none; no stale steam or arc anchors |
| Dust style | light-dust-only anchor seam; no authored smoke, particles, lights, animation, or emissive texture |
| Determinism | independent verifier and canonical `scripts/reexport-pilot.sh` reproduce all 14 GLBs byte-identically |
| Placement / flat walk | four freestanding E4 records clear routes, pads, shipped props, the 13 retained E2/E3 records, one another, and the open stage; the roadway conforms 0.018–0.020 above the relieved plate and stays 0.7699 from the unchanged flat actor route |
| Tonal law | localized building-and-neighbor crops pass 8/8; worst absolute delta `1.2226%` |
| Ensemble plaza QA | blind whole-Town pair identifies the Motor side through the loud buildings, skyline road/fuel infrastructure, and paired entrance lanes (`diffRatio16` `2.7419%`); the quiet Chapel is not required to announce the era |
| All-angle QA | eight E3/E4 boards show complete inherited wraps; the Chapel's parking rail/oil stain and trough's capped relic are deliberately quiet and physically attached |
| App build | `npm run build` passes on the final production bytes |
| Era-loader regression | `e2e/town-era-switch.spec.ts` passes 12/12 across desktop and mobile |
| E4 runtime smoke | normal Motor Town boot loads all 18 E2–E4 manifest records, including `e4-motor-roadway`, as 23 instances with zero console/page errors |

### Evidence index

Production comparisons are **E3 on the left, E4 on the right**. Blind boards retain randomized A/B order.

- Whole Town: [`town-wide-verdict-e3-e4-ab.png`](../artifacts/town-e4-wide/town-wide-verdict-e3-e4-ab.png), blind ensemble [`town-ensemble-blind-pair.png`](../artifacts/town-e4-wide/town-ensemble-blind-pair.png)
- All eight locked-camera A/Bs: [`all-buildings-town-contact.png`](../artifacts/town-e4-wide/all-buildings-town-contact.png)
- All eight four-angle A/Bs: [`all-buildings-turntable-contact.png`](../artifacts/town-e4-wide/all-buildings-turntable-contact.png)
- All eight blind gameplay crops: [`all-building-blind-pairs.png`](../artifacts/town-e4-wide/all-building-blind-pairs.png)
- Props and placement: [`accessory-pack-e4.png`](../artifacts/town-e4-wide/accessory-pack-e4.png), [`wagon-accretion-e3-e4-ab.png`](../artifacts/town-e4-wide/wagon-accretion-e3-e4-ab.png), [`e4-accessory-clearance-overlay.png`](../artifacts/town-e4-wide/e4-accessory-clearance-overlay.png)
- Four-angle A/Bs: [`tavern`](../artifacts/town-e4-wide/tavern-turntable-e3-e4-ab.png), [`general store`](../artifacts/town-e4-wide/general_store-turntable-e3-e4-ab.png), [`claim office`](../artifacts/town-e4-wide/claim_office-turntable-e3-e4-ab.png), [`assay office`](../artifacts/town-e4-wide/assay_office-turntable-e3-e4-ab.png), [`chapel`](../artifacts/town-e4-wide/chapel-turntable-e3-e4-ab.png), [`schoolhouse`](../artifacts/town-e4-wide/schoolhouse-turntable-e3-e4-ab.png), [`stamp mill`](../artifacts/town-e4-wide/stamp-mill-turntable-e3-e4-ab.png), [`dynamo hall`](../artifacts/town-e4-wide/dynamo-hall-turntable-e3-e4-ab.png)
- Machine evidence: [`asset-contract.json`](../artifacts/town-e4-wide/asset-contract.json), [`comparison-metrics.json`](../artifacts/town-e4-wide/comparison-metrics.json), [`blind-key.json`](../artifacts/town-e4-wide/blind-key.json)

### F-3DC-27 — Era-defining roofs may carry the read; quiet fixtures must stay quiet

**Severity:** resolved visual gate

**Evidence:** Assay, Stamp Mill, and Dynamo Hall passed their front turntables but initially hid their real Motor functions below the gameplay crop, so their plausible industrial hardware continues onto visible roofs. The first Chapel draft copied that tactic and became a roadside complex with a route-board crown—legible, but false to cadence. The corrected Chapel returns to a low parking rail and oil stain and is allowed to be pixel-quiet at the locked camera because the ensemble already reads Motor unmistakably.

**Decision:** use the roof only when the fixture's real E4 function warrants it. The ensemble camera decides whether the Town announces the era; it does not force every parcel to grow a sign.

### F-3DC-28 — A visible silhouette cue still needs construction logic and identity

**Severity:** resolved visual gate

**Evidence:** an independent all-angle critique correctly rejected several first-final details as technically visible but visually generic or unsupported: flat garage slabs, a floating route sign, oversized roof tanks without saddles, and the filling shed's detached wheel crest. The final industrial/civic pass adds door paneling and handles, sign braces and wheel pictograms, tank saddles, and a physical crest tether. The separate cadence pass then removes the Chapel's unsupported roadside complex entirely.

**Decision:** the across-the-plaza test is necessary but not sufficient. Large-era cues must also explain how they attach and must preserve the building's public identity; do not pass a variant merely because an unlabelled high-contrast primitive changes enough pixels.

### F-3DC-29 — Clearance evidence must look clear, not merely calculate clear

**Severity:** resolved placement gate

**Evidence:** early legal placements still read crowded: the large road marker and filling shed overlapped roof silhouettes, while a central compacted ring read as a wagon wheel. The final manifest moves those two landmarks to the rear skyline and replaces the ring with two shallow approach lanes around the inherited trough. A final independent code review then found that the first lane mesh was globally flat and sank below the relieved plate at 18 gate vertices. The corrected builder derives every lane vertex from the canonical Town plate height: local clearance is `0.018–0.020`, actor-route separation `0.7699`, and minimum stage radius `7.0298`. Freestanding clearances remain route `3.9000`, pad `0.3401`, shipped prop `0.4067`, retained accessory `0.9548`, pairwise `11.0821`. A fresh post-fix visual review confirms the strips are flush and continuous with no burial, floating, clipping, or z-fighting and returns SHIP.

**Decision:** treat the clearance overlay and the composed plate height as gates alongside manifest distances. A legal world-space placement can still look blocked or be buried by relief; prefer generous gaps and conform ground decals to the production plate.

### F-3DC-30 — Accretion uses PERSIST / REPLACE / RELIC, never silent deletion

**Severity:** resolved inheritance gate

**Evidence:** independent review caught that the first budget-fitting E4 wagon silently deleted its inherited E3 voltage terminal while adding Motor hardware. The corrected wagon keeps all 1,780 E3 triangle signatures, treats the E2 fittings and soot-cold E3 terminal as RELICS, spends its remaining 20 triangles on a warm side engine plus upright dust exhaust, and explicitly REPLACES the arc seam with the exhaust seam. The same geometric subset test passes for all eight buildings and both prop descendants. The trough now demonstrates the other cadence outcome: its structure PERSISTS, the electric pump becomes a visibly capped/boarded RELIC, and no E4 exhaust seam is invented.

**Decision:** every inherited signature gets a named PERSIST / REPLACE / RELIC verdict. RELIC is the default for superseded era-tech; anchor replacement is explicit and does not authorize deleting its physical history.

### F-3DC-31 — Upgrade cadence is a believability gate, not a completeness discount

**Severity:** resolved cadence gate

**Evidence:** the first wide draft optimized for eight individually blind-readable Motor faces. That made the Chapel and water trough technically impressive but fictionally overbuilt. The v2 pass removes 836 Chapel triangles, turns the Chapel into a parking rail/oil stain with zero E4 anchors, and leaves the trough's pump boarded/cold. The blind ensemble instead selects the Motor side through the Motor Inn, Polytechnic, service buildings, the playful motor caravan, separated skyline infrastructure, and compacted entrance lanes around the trough relic.

**Decision:** ask whether Motor technology plausibly touches each fixture. Upgraded, carried-unchanged, and relic'd are equally valid outcomes; only the Town ensemble owes the era announcement.

### F-3DC-32 — Era growth should feel playful, not merely archaeological

**Severity:** resolved E4 direction; scoped E3 follow-up

**Evidence:** the first inheritance-correct wagon only carried a spare wheel, which met the letter of E4 but did not tell the lighthearted progression story the owner wants. The final E4 uses the same 20-triangle allowance for a wedge bonnet, attached upright exhaust, framed warm cab window, and small unlit side headlamp, so the wagon reads as an early caravan without becoming a modern vehicle or emitting black smoke. Its earlier voltage terminal remains visibly cold rather than disappearing. A first fresh final reviewer caught the cab window reading as a black void and the road lanes fading into the ground; the correction warms and shrinks the window, tightens the bonnet/exhaust/headlamp cluster, and deepens the two lane values without restoring the rejected plaza-wheel motif. A second fresh blind reviewer identified the Motor side at high confidence and returned SHIP with no production defect.

**Decision:** let each era add a charming, immediately understandable function when technology plausibly touches the fixture. A future scoped E3 wagon correction should add small electric lamps when electricity arrives; this E4 delivery records that target but does not silently rewrite the already accepted E3 asset.

### Wave 9 wide integration boundary

- Add the six new `.e4.blend` / `.e4.glb` building siblings, E4 wagon/trough siblings, E4 accessory GLBs / atlas / manifest, deterministic builders/verifier, and evidence. Accepted Tavern and Schoolhouse E4 bytes remain unchanged.
- E1, E2, and E3 production siblings remain untouched. The Pan Monument remains heritage content and is excluded from era keying.
- No runtime source, layout, spec, backlog, status, e2e, or exporter file changed. The existing era loader owns sibling discovery; the factory owns dust emitters and accessory manifest ratification/mounting.
- Production inventory remains eight real buildings. No ninth identity is fabricated.
- Branch base: `7e01c14f`; publication is session-branch-only for attended gates, never `main`.

## Wave 9 pilot — E4 Motor building faces

The pilot uses the only two Town identities explicitly transformed by `e4-motor-bundle.md` §A2: Tavern / Motor Inn and Schoolhouse / Polytechnic. Both edit the immediately preceding E3 identity forward, retain the inherited electrical and steam-age hardware, preserve the exact E3 envelope, and replace arc nodes with sequential `exhaust_anchor_*` nodes for factory-owned light dust puffs. No black-smoke geometry or emitter is authored.

### Per-building findings

| Building | What was required / first-pass finding | Final E4 identity edit | Locked-camera and all-angle verdict | Final contract |
| --- | --- | --- | --- | --- |
| Tavern / Motor Inn | §A2 requires a drive-through porte-cochère, parked vehicle silhouette, and retained E3 festoon. The first correct model put its motor growth on the turntable-facing side, where the locked Town camera could barely see it; its first camera-facing correction then read as an oversized perimeter gantry, and its first compact correction left square-wheel “teeth” on the rear view | compact camera-facing porte-cochère with dark attached canopy and road fascia, two grounded brass outer posts, brass/rubber runabout relief silhouette, retained E3 festoon and roof conductor | randomized crop A exposes the Motor face; four angles show a complete inherited shell, attached canopy, grounded posts, clean rear quarters, and finished motor pictogram | 14,984 / 15,000 tris; 1 material; 3 anchors; SHA `c922b0d54146…` |
| Schoolhouse / Polytechnic | §A2 requires a drafting-hall wing with wide windows and a roof wind gauge. The first wing faced away from gameplay, and the first gauge mast had an ambiguous roof load path | visible-side drafting wing with wide teal/mullioned window bank, attached service exhaust and rubber/brass drive trim, roof-braced compact wind gauge, retained E3 orrery / conductor infrastructure | randomized crop B reads through both the wide window bank and roof gauge; four angles show the wing wrap, mast braces, service vent, and finished rear | 10,524 / 15,000 tris; 1 material; 2 anchors; SHA `f014a4e3107c…` |

Both variants have one mesh, one primitive, one material, and one embedded 1024 x 1024 atlas; zero cameras, lights, animations, or emissive textures; and exact E3 bounds. The Tavern localized luminance delta is `-0.9027%`; the Polytechnic is `-0.3684%`, both far below the 5% ceiling.

### Gate evidence

| Check | Result |
| --- | --- |
| Geometry budgets | Tavern 14,984 and Schoolhouse 10,524; both pass the 15,000-triangle ceiling |
| Materials and hygiene | 2/2 use one embedded 1024 atlas material; 0 cameras, lights, animations, or emissive textures |
| Interfaces | exact inherited E3 envelopes; Tavern has `exhaust_anchor_1..3`, Polytechnic `exhaust_anchor_1..2`; no stale steam or arc anchors |
| Dust style | anchor-only factory seam; model metadata records “light dust puff; never black smoke”; no smoke geometry, particles, lights, or animation |
| Determinism | independent saved-BLEND verification and the canonical `scripts/reexport-pilot.sh` reproduce both GLBs byte-identically |
| Tonal law | localized changed-building plus 64 px neighbor-context crops pass 2/2; worst absolute delta `0.9027%` |
| Across-the-plaza QA | fresh unprimed reviewers select Tavern A at high confidence and Polytechnic B at 98% confidence without the answer key |
| All-angle QA | final E3/E4 four-angle boards show complete wraps, retained prior-era infrastructure, and physically attached new systems; fresh final verdict is SHIP / SHIP |

### Evidence index

Production comparisons are **E3 on the left, E4 on the right**. Blind boards retain randomized A/B order.

- Whole Town: [`town-two-pilot-verdict-e3-e4-ab.png`](../artifacts/town-e4-pilot/town-two-pilot-verdict-e3-e4-ab.png)
- Locked-camera A/Bs: [`tavern`](../artifacts/town-e4-pilot/tavern-town-verdict-e3-e4-ab.png), [`schoolhouse`](../artifacts/town-e4-pilot/schoolhouse-town-verdict-e3-e4-ab.png)
- Four-angle A/Bs: [`tavern`](../artifacts/town-e4-pilot/tavern-turntable-e3-e4-ab.png), [`schoolhouse`](../artifacts/town-e4-pilot/schoolhouse-turntable-e3-e4-ab.png)
- Blind gameplay crops: [`tavern`](../artifacts/town-e4-pilot/blind-crops/tavern-pair.png), [`schoolhouse`](../artifacts/town-e4-pilot/blind-crops/schoolhouse-pair.png)
- Machine evidence: [`asset-contract.json`](../artifacts/town-e4-pilot/asset-contract.json), [`comparison-metrics.json`](../artifacts/town-e4-pilot/comparison-metrics.json), [`blind-key.json`](../artifacts/town-e4-pilot/blind-key.json)

### F-3DC-25 — Motor growth must face the locked Town camera

**Severity:** resolved visual gate

**Evidence:** the first Tavern porte-cochère and Schoolhouse drafting wing were strong in front turntables but nearly absent in the gameplay crop because those local sides face away after their canonical slot rotations. The final edit moves the required functions onto each slot's plaza/camera-visible side without changing the canonical transform or inherited envelope. The randomized final crops now expose `5.82%` and `7.15%` changed pixels respectively inside their building-focused bounds.

**Decision:** choose era-growth faces after composing the canonical slot rotation at the locked camera. A correct local-front edit still fails when the player sees only its roof or rear.

### F-3DC-26 — Exhaust anchors belong in the official exporter seam

**Severity:** resolved interface gate

**Evidence:** the official exporter initially selected only `steam_anchor_*` and `arc_anchor_*`; its first Wave 9 run stripped the new contracted empties and changed both GLB hashes. The selector now recognizes `exhaust_anchor_*` through the same narrow path. Final official runs report all five nodes and reproduce `c922b0d5…` / `f014a4e3…` byte-identically.

**Decision:** preserve the three ratified particle-mount families and nothing broader. The factory still owns plume geometry, color, intensity, timing, and the light-dust-only runtime behavior.

### Wave 9 pilot integration boundary

- Add only Tavern and Schoolhouse `.e4.blend` / `.e4.glb` siblings, their deterministic builder/verifier, evidence, and the narrow exporter-prefix extension.
- E1, E2, and E3 production siblings remain untouched. Every E4 pilot opens the accepted E3 `.blend` and asserts both accepted source hashes before authoring.
- Do not start the other six real buildings, wagon/trough variants, filling shed, fuel racks, road markers, or `era-props.e4.json` until the attended pilot verdict.
- No runtime source, layout, spec, backlog, status, or e2e file changed. The existing era loader owns building discovery; the factory owns dust emitters and later accessory ratification/mounting.
- Production inventory remains eight real buildings. No ninth identity is fabricated.
- Branch base: `56b1efc3`; no push or main merge performed.

## Wave 8 wide — complete E3 Voltage Town

Wave 8 wide completes the five production identities that were not part of the accepted three-building pilot, redelivers the Tavern at the stronger silhouette bar, adds E3 siblings for the covered wagon and water trough, and proposes the ratifiable wire-run / insulator-post / transformer-shed accessory pack. The production inventory remains eight real building GLBs; there is still no ninth E1 shell or canonical ninth Town slot to transform.

### Per-building findings

| Building | E3 identity edit | Locked-camera / all-angle verdict | Final contract |
| --- | --- | --- | --- |
| Tavern / Electric Lounge | accepted E3 face plus two supported lamp arms, heavy roofline conductor, and wire drops tied into the existing electrical hardware | blind reviewer selected E3 B at 98%; now immediate at gameplay distance. Four angles show attached conductors and preserve the inherited shell | 14,900 tris; 3 anchors; SHA `1d3d60500c2f…` |
| General Store | three-insulator public feed moved onto the visible facade roofline, teal conductor, attached service drops, twin loading lamps, and delivery coil | first feed hid behind the false front; corrected reviewer selected E3 A at 97% and passed it at gameplay distance with no support/material defect | 5,056 tris; 3 anchors; SHA `1a13c3f766d3…` |
| Claim Office | civic crossarm, copper hall drop, twin public lamps, and voltage dial | reviewer selected E3 B at 97%; readable at gameplay distance with only minor intentional roofline crowding | 6,668 tris; 3 anchors; SHA `ce1f6953d4b3…` |
| Assay Office | electrode rack, copper laboratory drop, work lamp, induction coil, and spark gap | reviewer selected E3 A at 98%; immediate at gameplay distance and physically supported from all four angles | 6,248 tris; 3 anchors; SHA `b9562ddbdabf…` |
| Chapel | twin lightning masts, teal voltage crowns, inward arc horns, porch lamps, and covenant ring; the cross remains untouched | the first full-width frame read as scaffolding. Final saddles and copper/teal boots visibly ground the flanking masts; correction review passes and confirms the belfry/cross remains clear | 6,748 tris; 3 anchors; SHA `ed2e11c0eecc…` |
| Schoolhouse / Academy | accepted pilot orrery dome, feed stacks, corona, rod, and upper-window machine | accepted pilot remains byte-for-byte unchanged; prior blind verdict 98% and wide reviewer again selected E3 correctly | 8,752 tris; 3 anchors; SHA `8a977ea418b1…` |
| Stamp Mill | accepted pilot roof-braced crossarm, bus, ceramic stacks, winding face, motor housing, and conduit | accepted pilot remains byte-for-byte unchanged; its prior attended plaza verdict governs the wide family | 2,916 tris; 3 anchors; SHA `499fc7ecf4ab…` |
| Dynamo Hall | four-insulator crown bus, high-contrast teal conductor, exiting busbars, roof induction toroid / arc crown, and status lamps | the inherited parcel is heavily cropped at the locked camera; reviewer still selected E3 A at 99% from the visible teal roofline. Four angles confirm all hardware is supported and finished | 6,248 tris; 3 anchors; SHA `027857bebc8d…` |

Every building has one mesh, one primitive, one material, one embedded 1024 x 1024 image, exactly three sequential `arc_anchor_*` nodes, no inherited `steam_anchor_*` nodes, and no cameras, lights, animations, or emissive textures. Each preserves the exact E2 maximum envelope. The tonal gate now measures a localized target-building-and-neighbor crop rather than diluting the result across the full ground plate. The worst result is the Stamp Mill at `1.2915%`, far below the 5% ceiling.

### Prop variants and accessory pack

| Asset | E3 role | Final contract |
| --- | --- | --- |
| Covered wagon E3 | retained E2 tank, straps, feed, and vent plus a roof conductor / ceramic terminal | 1,780 tris; exact E2 envelope; 1 anchor; SHA `e7e7b0cd6d85…` |
| Water trough E3 | retained E2 pipework plus insulated electrical pump/feed treatment | 1,096 tris; exact E2 envelope; 2 anchors; SHA `866920e7f82b…` |
| Wire run | low supported distribution span | 408 tris; 2 anchors; SHA `6ed2bb9983c0…` |
| Insulator post | paired public ceramic terminals | 368 tris; 2 anchors; SHA `94231ed03b5a…` |
| Transformer shed | compact iron-and-timber neighborhood transformer | 588 tris; 3 anchors; SHA `9eb2ddc1aa5d…` |

The three E3-only accessories embed the same byte-identical 1024 x 1024 atlas (`817f26f475b1…`). `era-props.e3.json` proposes five placements: two wire runs, two insulator posts, and one transformer shed. E3 is cumulative: all eight E2 accessory placements remain present. Minimum E3 clearances are `1.1158` from walk routes, `4.0158` from the protected stage, `0.4426` from building pads, `0.7040` from shipped props, `0.6198` from retained E2 accessories, and `1.1926` E3-to-E3. The Pan Monument remains unchanged and excluded from era keying.

### Gate evidence

| Check | Result |
| --- | --- |
| Geometry budgets | all eight buildings pass under 15,000 tris; wagon/trough remain inside inherited 1,800 / 1,200 budgets; all accessories are under 600 tris |
| Materials and hygiene | 13/13 GLBs have one baked material and embedded image: buildings / new accessories use 1024, inherited wagon/trough use their 256 atlas; 0 cameras, lights, animations, or emissive textures |
| Interfaces | exact inherited envelopes for all eight buildings and both prop variants; sequential `arc_anchor_1..N` nodes throughout; no stale steam anchors |
| Determinism | official `scripts/reexport-pilot.sh` reproduces all 13 GLBs byte-identically; independent saved-BLEND verifier agrees |
| Placement | all five E3 records clear routes, pads, shipped props, all eight retained E2 accessories, one another, and the open plaza stage |
| Tonal law | localized changed-building plus 64 px neighbor-context crops pass 8/8; worst delta is `1.2915%`, far below 5% |
| Live loading | direct probes mount each newly authored / revised building sibling as era 3 from a real `model/gltf-binary` response with zero console/page errors. Prop variants and accessory manifest remain the factory's ratification/mount boundary |
| App build | `npm run build` passes on the final asset bytes |
| Across-the-plaza QA | fresh blind review selected the correct E3 side for every newly authored / revised face; corrected General Store and Chapel rereviews pass. Accepted Schoolhouse / Stamp Mill pilot verdicts remain authoritative |

The legacy `e2e/town-era-switch.spec.ts` full-mode fixture was also attempted. Its broad `/tavern.e2.glb/` route intercepts Vite's `tavern.e2.glb?import&url` JavaScript module request and serves binary GLB bytes, so the dynamic Town module remains in `loading`; LITE passes. This is a pre-existing harness collision outside the asset-wave firewall. A direct equivalent E1 probe loads normally, and the stronger combined E3 probe above validates every delivered GLB through the real runtime seam without route substitution.

### Evidence index

Production comparisons are **E2 on the left, E3 on the right**. Blind boards retain randomized A/B order.

- Whole Town: [`town-wide-verdict-e2-e3-ab.png`](../artifacts/town-e3-wide/town-wide-verdict-e2-e3-ab.png)
- All eight locked-camera A/Bs: [`all-buildings-town-contact.png`](../artifacts/town-e3-wide/all-buildings-town-contact.png)
- All eight four-angle A/Bs: [`all-buildings-turntable-contact.png`](../artifacts/town-e3-wide/all-buildings-turntable-contact.png)
- Blind gameplay crops: [`all-pairs-contact.png`](../artifacts/town-e3-wide/blind-crops/all-pairs-contact.png)
- Props and placement: [`accessory-pack-e3.png`](../artifacts/town-e3-wide/accessory-pack-e3.png), [`e3-accessory-clearance-overlay.png`](../artifacts/town-e3-wide/e3-accessory-clearance-overlay.png)
- Machine evidence: [`asset-contract.json`](../artifacts/town-e3-wide/asset-contract.json), [`comparison-metrics.json`](../artifacts/town-e3-wide/comparison-metrics.json), [`blind-key.json`](../artifacts/town-e3-wide/blind-key.json)

### F-3DC-21 — Voltage hardware must occupy the visible roofline

**Severity:** resolved visual gate

**Evidence:** first-pass General Store and Dynamo Hall hardware was contract-correct but sat behind the false front or disappeared against the black roof at the locked camera. Tavern also began this wave above chance but below the owner's 7a bar. The final faces put a teal public feed on the General Store's visible roofline, a high-contrast crown conductor on Dynamo Hall, and a heavy roofline conductor plus supported drops on the Tavern. Neutral reviewers selected the corrected variants at 97%, 99%, and 98% respectively.

**Decision:** for cropped / false-front parcels, a valid electrical system is not enough. At least one attached conductor, crossarm, or coil must occupy pixels the locked gameplay camera can actually see.

### F-3DC-22 — Electrical silhouette still needs readable load paths

**Severity:** resolved construction gate

**Evidence:** the Chapel's first full-width meeting-line frame passed bounds and budget but read as a gallows/scaffold around the belfry. It was replaced with two narrower lightning masts that flank the heritage cross. A second review then found their roof penetrations under-explained, so the final model adds dark saddles, copper boots, and teal boot bands. Correction review passes: the masts are grounded and the belfry/cross silhouette remains clear.

**Decision:** crossarms and wires may be thin, but their poles need visible feet, saddles, collars, or brackets. The voltage era cannot borrow visual ambiguity from unfinished construction.

### F-3DC-23 — The accessory manifest is a placement and factory-handoff interface

**Severity:** resolved integration gate

**Evidence:** five proposed placements clear every protected route, pad, existing prop, peer accessory, and the plaza stage. Vite discovers the two prop siblings and three accessory URL modules in the production build, while the current plaza-prop runtime still mounts its fixed base set; the manifest is therefore a factory handoff, not a claim that these accessories already appear in live play.

**Decision:** factory ratification should use the committed manifest positions and asset paths as written, then add the era-keyed prop/accessory mount separately. The pack owns geometry and mount records; live arc timing, tint, intensity, and manifest consumption remain factory-owned.

### F-3DC-24 — Epoch infrastructure accumulates

**Severity:** resolved persistence gate

**Evidence:** independent review caught that the first E3 manifest reused E2 pipe / gauge / manifold coordinates and that wagon/trough initially branched from their E1 files. The final manifest moves every E3-only accessory to a distinct cleared position and verifies clearance against all eight retained E2 records. The final wagon and trough open the accepted `.e2.blend` siblings, preserve their steam hardware and exact E2 envelopes, then add voltage-era treatment. `build_era_props_e2.py` is unchanged.

**Decision:** an era sibling edits the immediately preceding identity forward. New era infrastructure supplements retained infrastructure unless the bundle explicitly retires it; it never silently erases or occupies the same space.

### Wave 8 wide integration boundary

- Add E3 siblings only. E1 and E2 building/prop production files remain untouched; the accepted Schoolhouse and Stamp Mill E3 pilot files remain byte-for-byte unchanged.
- Add one shared E3 accessory atlas, three accessory GLBs / BLENDs, and `era-props.e3.json` under `assets/pilots/plaza-props-3d/`.
- No runtime source or e2e file changed. The existing building loader discovers building siblings; the factory still owns prop-variant and manifest mounting.
- Production inventory is eight real buildings. No ninth shell is fabricated.
- The transferred Crawler grant remains closed and untouched.
- Branch base: `9f6fe2de`; no push or main merge performed.

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
