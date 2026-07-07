# Epoch 3 "The Voltage Age" — art & level implementation bundle
### Template-law shape (see e2-steamworks-bundle.md §C) · banked 2026-07-07 · execution QA lines finalize at E3's S-time from E2's batch learnings

**Era thesis.** Two rival power companies race to electrify the frontier and sabotage each other; the town strings its own wires and takes no side. Current is the resource, the grid is the base, and NIGHT stops being downtime — half of every run happens in the dark, and light is territory.

**STYLE ANCHOR: identical to E2's (see that file, verbatim) — plus the E3 palette note:** *nights are deep ink-blue parchment, never black; lit areas are pools of warm lamp-gold; teal agent-glow reads brighter after dark. Arc effects are drawn lightning — jagged engraved strokes, never photoreal glow blooms.*

---

## §A — ART MANIFEST

### A1. New buildings (5 generations)
1. **`bld-dynamo-hall.png`** — {ANCHOR} A proud brick-and-timber dynamo hall (the megaproject, now the town's generator): two great spoked flywheels visible through arched windows, copper bus-bars exiting under the eaves to a first pylon, a marble switchboard glimpsed inside, teal-and-gold status lamps over the door. Portrait convention, reference-conditioned on bld-stamp-mill for scale band. QA: flywheels read as PAIRED (the twin-company satire — one wheel each, working together).
2. **`bld-pylon.png`** — the strung frontier pylon (buildable network piece): a timber H-frame with ceramic insulators, copper wire stubs, a small teal indicator lamp. TWO cells (#ff00ff bg): powered (lamp lit) / unpowered (lamp dark). QA: silhouette must read at far zoom — this is the most-placed object of the era.
3. **`bld-arc-lamp.png`** — a tall street arc lamp: fluted iron column, twin carbon rods in a glass bell, warm gold light halo (painted halo, engine adds the real light). Two cells: lit/unlit. QA: the glass bell must NOT read as teal (lamp-gold vs agent-teal is the era's color grammar).
4. **`bld-tram-station.png`** — a compact tram waiting shed with a folded map board (pictograms only), overhead trolley wire hook, bench. Portrait convention. QA: bench height in the character band (townsfolk will sit here in Town scenes).
5. **`bld-exchange-annex.png`** — the tavern's new neighbor and E7 seed: a tiny telephone/telegraph exchange with a patch-board visible through the window and a spray of wires leaving the gable in six directions. Portrait convention. QA: wire count SIX exactly (a lore glyph — six lines for six lanes; the fires will appreciate it even if nobody else does).

### A2. Era transforms (5 image-EDITs, `<name>-e3.png`)
1. **boiler battery → arc turret** (base: turret-e2): replace the boiler pony-tank with a copper capacitor stack + tesla-style toroid at the tip; keep tripod silhouette EXACTLY (LOS/targeting art-read law). Teal arc filaments only when the engine says powered.
2. **tavern/saloon → Electric Lounge**: string festoon lights along the porch, add ONE discreet neon-tube pictogram (a lightning bolt in a circle — no letters), warm interior glow through windows. Footprint/roofline unchanged.
3. **iron wall → coil fence tier art**: add ceramic insulator caps + a single copper wire run along the top third; the wear-strip middle third stays clean (decal law).
4. **stamp mill → electrified mill**: belt drives replaced by a motor housing + conduit run; stack plume removed (electrification = cleaner air, prosperity framing made visible).
5. **schoolhouse → academy**: add a small dome with a lightning rod, a brass orrery visible in the upper window. (Science's home grows one era ahead of its Polytechnic form.)

### A3. Enemies (3 sheets + 1 boss)
1. **`enm-saboteur-sheet-a/b.png`** — Current-War saboteur (the era's signature: attacks your WIRES, not your walls): lean figure in a rival-company duster (slate-blue with copper piping — NOT bandit red, NOT company slate of E2 toughs: add copper trim to distinguish), carrying long-handled wire-cutters and a coil of stolen line. Walk4 two-sheet convention + ONE extra action row appended to sheet B (row 5: "cutting" pose ×4 phases — kneeling at a pylon). QA: cutters never read as a weapon aimed at PEOPLE (tool, not gun — ADR-001 adjacent).
2. **`enm-wirethief-sheet-a/b.png`** — copper thief: hunched figure festooned with coiled wire loot, magnetic grapple hook on a short rope. Walk4 convention; loot-coils always over the RIGHT shoulder. QA: silhouette distinct from E2 coal thief at 25% (coils vs sack).
3. **`enm-mothswarm-sheet.png`** — the nature enemy: a swarm-blob of parchment moths that mobs lit lamps (mechanics: dims light radius while attached). ONE sheet, 4 cols (swirl phases) × 2 rows (small swarm / large swarm), #ff00ff. QA: individual moths readable at rest, blur implied only by pose (engraved motion lines, no smear).
4. **`boss-dynamo-crawler.png` + `-damage.png`** — the Rival Dynamo Crawler: a rolling power-plant on cart tracks that DRAINS your grid as it advances (teal-to-amber energy visibly flowing INTO it) — three component zones: drain-mast / track assembly / capacitor bank. Two images, aligned zones, mechanical damage only. QA: the drain-mast must visually "point" — the engine draws the drain beam to your nearest pylon.

### A4. Townsfolk (5 new + the E2→E3 aging pass)
1. `tf-lamplighter.png` — evening-shift kid with a striker pole, moth-bitten hat (the moths are personal).
2. `tf-switchboard-operator.png` — sharp-eyed operator with a headset of brass and wire, mid-connection.
3. `tf-lineworker.png` — belt of ceramic insulators, climbing spikes, sunburnt grin.
4. `tf-company-rep-a.png` / 5. `tf-company-rep-b.png` — the TWIN RIVALS: two immaculate representatives, mirrored poses, one copper-accented, one silver-accented, identical smiles (the satire in one diptych; reference-condition B on A for the mirroring). QA: warm mockery, not villainy — they'll defect to the town by era's end (tavern tale).
**Aging pass:** the E2 recipe re-applied to all E2-era portraits (+~12 years; one E3 element each: a festoon bulb pin, a wire ring). The depot clerk (E2's graduate) gets a promoted variant: `tf-depot-clerk-e3.png` — now the tram conductor.

### A5. Terrain & props (the Canyon Works set)
1. **`ter-canyon-atlas.png`** — 2×2: (r0c0) river-polished canyon stone, (r0c1) dark slate scree, (r1c0) dam-site poured footing (formed concrete with timber marks), (r1c1) rim grassland tuft rock. Tileable, matches prior atlas resolution/value range.
2. **`ter-wire-elements.png`** — sprite cells: wire span (catenary segment ×3 lengths), insulator close, fallen/cut wire (sparking end — drawn sparks), tram rail, tram car (side, 2 cells: lit/dark windows).
3. **`prop-damsite.png`** — the half-built dam face with spillway gates (2 cells: gates closed / open — a wave event uses this).
4. **NIGHT VARIANTS — engine, not art**: the day/night cycle tints via the light rig; ONLY assets with self-illumination get true lit variants (pylon, arc lamp, tram, lounge — already specced as cells above). No blanket night regeneration (budget law).

### A6. Icon sheet
**`icons-e3.png`** — 10 cells: arc caster, coil fence, arc lamp, pylon, current (resource), watt-ledger, Grid crest, Night crest, Chain crest, moth ward. Engraved pictogram scale, readable at 32px.

### Batching plan
batch-013 = A1 buildings + A5 terrain (tile + Town needs first) → batch-014 = A3 enemies + boss → batch-015 = A4 townsfolk + aging + A2 transforms + A6. ~65–80 generations incl. retries; nightly drip from ~2 weeks before E3 S-date; one batch in flight.

---

## §B — THE CANYON WORKS (signature tile, GT-ready)

**Identity**: era-stamped E3 adventure tile; 96×112 sim units (tall); the first NIGHT tile and the first NETWORK tile. Fantasy: string the gorge with light and power, hold it through the dark.

```
            N (dam)
  ┌────────────────────────────┐
  │  G-W   DAM▓▓ spillway ▓▓   │  rim h=6.0 (both sides, walkable galleries)
  │ RIM-W ═══wire-span═══ RIM-E│  ═ = wire spans (pylon anchors each end)
  │  ▒gal W h=4.5   gal E▒ G-E │  gal = cliff galleries (build pads, premium)
  │   S╲              ╱S       │  S = switchback descents (slope-legal)
  │    ╲  RIVER h=-1 ╱         │  river = deep water strip, bridge B mid
  │ T-line───B───T-line        │  T = tram line along west bank h=0.5
  │  ▒BASE h=0.5 (main pads)▒  │  BASE = generator yard: Dynamo sub-hall,
  │   G-S (downriver mouth)    │         primary build field, tram depot
  └────────────────────────────┘
            S (downriver)
```
- **Elevation (GT params)**: river −1.0 (deep: no wading mid-channel; bridge B is the ford-analog) · banks/base 0.5 · galleries 4.5 · rims 6.0 · cliff faces impassable. Verticality is the era's drama: wire spans cross the void your enemies must walk around.
- **The GRID mechanic on this tile**: the sub-hall generates; PYLONS you place carry current up the switchbacks to galleries and rims; every powered structure (arc turret, lamp, tram) draws watts. The **brown-out ledger** (era UI: what's lit, what's armed, what goes dark tonight) is the strategy layer. Saboteurs cut SPANS (a cut = everything downstream dark) — defense means DEPTH: ring pylons, loop the graph (the MST+loops idea from the vendored dungeon-forge algorithm, honorably reused for power routing hints).
- **Night waves**: the cycle runs ~3 waves day / 3 night. At night: unlit zones spawn ambushes (moth swarms mob lamps; thieves prefer dark), lit zones are safe-ish; enemy silhouettes get lamp-gold rim-light (legibility law after dark).
- **Spawn gates**: G-W/G-E rim notches (saboteurs walk the rims toward your span anchors), G-S downriver mouth (thief packs), dam spillway EVENT gate (wave 10: gates open, water surge crosses the river strip — timed hazard, warm spectacle).
- **Objectives/modes**: defend (the sub-hall), connect (power N galleries by wave 6 — the era's teaching contract), escort (tram run with a capacitor crate), boss wave 14: the Crawler descends the W switchback draining pylons — kill the drain-mast first or fight in the dark you made.
- **Economy placement**: copper veins in both gallery walls (×4, Geology reveals +2), the river pans (nostalgia + danger), tram hauls double when powered.
- **Build zones**: BASE field generous; galleries 3 pads each (premium — turrets up here own the rims); NO pads on rims (rims are the enemy's road and your wire route — contested by design).
- **Validation probes**: graph-connectivity (every powered probe traces to the sub-hall), cut-span → downstream unpowered within 1 tick, night spawn only in unlit zones, bridge-only river crossing for ground units, boss path continuity, determinism seed "canyon-1".
- **Camera/mobile**: default frame favors the vertical cross-section (rim-to-river in one view at mid zoom); mobile reduces moth particle counts + festoon lights, never the grid logic.
- **Perf budget**: wire catenaries instanced; lamp lights pooled (max N real lights, rest are painted halos — knob); 200-call stress law holds at full grid + night.

## §C — engine prerequisites recap (from the saga ladder, E3 rows)
Power graph (nodes/edges/flow-lite + brown-out ledger UI) · day/night cycle with light-radius gameplay · wire span rendering (instanced catenary) · tram path entity (rail follower v2 from E2's ore cart) · moth swarm behavior (attach + dim) · dam surge event (timed hazard field). All slice-able per GT discipline; the tile's e2e probes above are their acceptance tests.
