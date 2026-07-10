# Town v2 — Style & Detail Revamp ("a bit more style and details would go a long way")
Status: DRAFT 2026-07-10 (attended design session). Owner directives verbatim: 2026-07-09 "very rudamentary… I have a style image… but it is not in 3D. I just think a bit more style and details would go a long way." + the 3D verdict: image-to-3d = "okish - it is a bit like melted plastic" → **2.5D painted facades at depth = the primary path** (ratified in BACKLOG the same day).

## The reference (the law of the look)
`assets/reference/agenttown-town-style.jpeg` — painted isometric western town: circular plaza with a center feature, rich building facades, a wagon ring, fences, cacti, baked ground trails, dune horizon. Style = OUR art DNA (warm, illustrated, engraved-parchment kin). Canon translation, not copy: OUR buildings keep their names and roles (tavern, claim office, schoolhouse, assay office — no saloon/town-hall renames), and the center feature is **the Pan Monument** — the hero's first brass pan raised on a timber plinth (the same pan E10 enshrines aboard the Ark; the thread planted early). [RATIFY-1]

## Slices (each ends playable; art placeholder-first)
**TS-01 — THE GROUND (scene, lane):** circular plaza layout replacing the grid mat — painted sand base with baked wagon-rut trails radiating to each building and the town gate; subtle elevation dressing (render-only). Buildings move to their plaza ring positions (walk targets update; approach barks re-anchor). Growth staging preserved: buildings still ARRIVE per town growth — empty ring slots read as staked-out plots (survey pegs + string). GATE: town battery green; walk-to-every-surface e2e; before/after wide shots.
**TS-02 — THE FACADE ART (art batch):** per-building rich painted facades in the reference style, conditioned on the reference + each building's existing shell + the era palette: tavern, claim office, schoolhouse, assay office (+ chapel, general store, houses as growth unlocks them). Full-bleed portrait plates → billboards at TRUE DEPTH (2.5D: layered front/side planes, warm AO at the base). {ANCHOR} law; no letters (signs are pictograms per canon). GATE: in-scene look-check screenshots per building, owner eye.
**TS-03 — THE PROP RING (art + scene):** fences, covered wagons, cacti, water trough, lantern posts, the Pan Monument center — instanced, placed by a ring-layout descriptor (data, editable later by the contract editor). Night: lanterns join the night-shift lighting language. GATE: draw-call budget ≤ +12; night look-check.
**TS-04 — THE LIVING PASS (scene):** townsfolk paths follow the trails (not straight lines); the youngsters' loop rides the ring road; hover-Prospector idles near the Pan Monument; ambient dust motes in the golden hour. GATE: scene-only assertions; zero sim.
**TS-05 — THE HORIZON (scene):** dune/vista ring beyond the plaza matching the reference's soft horizon + the era sky treatment; ties into the W1-06 vista machinery. GATE: perf p95 within 5%.

## Era law (Persistence applies to the town too)
The plaza is the E1 layout. Era transforms ADD around the ring (E2 rails skirt the plaza edge; E3 wires string the lantern posts) — the ring itself is never erased. Facade era-variants ride the same {ANCHOR} edit-of-existing law as the kit plates.

## Integration map
Touches: town scene layout/render, art registry, prop instancing, townsfolk pathing data. UNTOUCHED: sim, run gameplay, board/ledger surfaces (059/060 own those), save schema, Balance.

## Ratification questions (owner)
1. The Pan Monument as the center feature — ratify? (Alternatives: town well, flagpole with the town's name-banner.)
2. Wagon ring canon: settlers' wagons parked forever, or do they thin as buildings arrive (growth = wagons → houses)? Recommend: thin-as-they-build (growth made visible).
3. Camera: keep the current framing (recommend — zero risk) or add a gentle orbit/zoom-in-town-only later slice?
