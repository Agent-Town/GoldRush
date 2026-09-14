# Last Claim — align the playable map with its concept

Status: proposed; layout choice pending. This does not supersede ratified lore or specifications by itself.

The dedicated contract plate depicts a circular Ark deck, and both shipped factory bodies were built for that circle. The gameplay contract still describes a linear ten-era route twice the deck's diameter. Its spawn and preservation objects are outside the artwork. In addition, the generic painted terrain remains visible through the Ark and supplies unrelated actor heights. Evidence: artifacts/map-art-repairs-20260908/last-claim-layout-01/checkpoint.json and ark-texture-01/source-02/.

## Recommended: follow the circular concept

Retain the verified Ark Plaza and its ten era dressing groups. Place the entry at the near/south portal, traverse the era displays in their authored order around the deck, and stage the final preservation encounter at the far/north rim. Keep the existing three preservation identities and finale/Charter Press owner; do not substitute a generic warm-vent survival win for the full authored finale.

A concrete initial placement to evaluate is entry at(0,17), preservation objects at(-10,-14), (0,-17), (10,-14), and four harvest sites around(+-10,+-9). These are proposals, not accepted collision coordinates: the existing portal, furniture, fountain, dressing and objective interaction footprints must be checked before committing them. Era station positions should come from the built medallion/dressing anchors; do not invent a second independent ordering table. A radial map traversal would supersede the older linear coordinate bands and must retain the ten-era journey's progression and the three-preserves fight.

## Alternative: retain the linear contract

Build a separate Last Claim ship deck covering the existing stern-to-bow route and gameplay locations. Preserve the circular Ark Plaza for its capstone/town usage and mount it as an explicitly authored part of the ship only if the route/art layout supports that. Commission matching map art or a documented concept supersession; stretching the circular plaza or adding anonymous floor slabs is not adequate correspondence. This option requires more art and factory work.

## Repair common to either layout

Use the successful Ark asset mount as the point where the map replaces generic terrain/props and installs the corresponding visual height. Retain fallback when loading fails and restore previous state on disposal/late loads. Keep these changes scoped to the actual Last Claim scene; a town Charter Press overlay and debug stage must not accidentally hide unrelated scenes. Terrain's render mode does not mean absence of all ground, so changing the global meaning of terrainMesh off would affect other contracts.

Verify every authored spawn, harvest, build area, objective and required path against visible walkable deck coverage; include edge behavior and unreachable-object checks. Keep simulation movement/collision and visual heights consistent. Scene lighting/background should follow the dark engraved-space concept, with readable brass/teal landmarks and no desert debris.

## Acceptance evidence

- Source/runtime agreement for all gameplay locations, era sequence and deck boundaries.
- Desktop and phone normal board entry, complete route/objective sequence, survival/finale, bank or Charter Press handoff as appropriate, reload and persistence.
- Source/compressed views at entry, all era stations and each preservation site; no ground intersections, holes, hovering actors, clipping or hidden required information.
- Asset failure/disposal/reset controls; unchanged behavior for non-Ark map and ordinary town control cases.
- Full relevant simulation/renderer regression and independent visual/code review. Existing factory source/texture verification remains intact.

No protected spec, lore, backlog or queue file is edited by this proposal. Readiness remains open until the chosen layout is implemented and these checks pass.
