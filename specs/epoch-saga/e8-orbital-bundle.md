# Epoch 8 "The Orbital Frontier" — design-locked bundle · banked 2026-07-07

**Era thesis.** The Starship flies — to the Moon first, because the frontier always takes the nearest hill. Gravity gets weak, air becomes the wall, and the pan works in regolith because of course it does. Earth hangs in the parchment sky: the signature image of the saga's back half.

**PALETTE NOTE:** *silver-and-teal over parchment; the lunar surface is warm grey stippled engraving, never cold photoreal; Earth above is a soft blue-green cameo; suit brass + glass domes; vacuum silence drawn as extra negative space (and heard — the audio system's showcase era: muffled interiors, silent exteriors, heartbeat-and-radio).* 

## §A — ART (design-locked)
**Buildings (6):** dome habitat (the wall is AIR: transparent panel dome over timber-brass ribs — the palisade's strangest child; breach art = spiderweb crack cells ×3 stages) · airlock gate (the ford of the era) · launch pad (the town's umbilical) · solar lens array (E6 sunline's big sister; tracks the long day) · mass-driver rail (E2's rail spur, generations later, throwing cargo to orbit — the lineage made literal) · regolith works (the pan-house: drum-panning moon dust for He-3 flecks).
**Transforms (4):** Net Café → Orbital Canteen (the tavern under glass; Earth visible through the dome behind the bar — THE poster shot) · beam-relay → lens turret (light weapons only outside: no air for concussion — the physics IS the weapon-design law) · Library → Mission Archive · tape-post → comms mast.
**Enemies (3+boss):** scrap corsairs (vacuum-suited salvage gangs with magnet gaffs — the corsair lineage, third generation) · debris rain (nature: orbital junk showers on telegraphed arcs — the era's storm) · sun-glare shamblers (solar-storm-maddened old rovers; amber-eye machine grammar) · **BOSS: THE SALVAGE KING'S CLAW** — an orbital grapple platform that DESCENDS piece by piece (fight phases = its landing stages; components: winch/anchor-feet/crown), trying to repossess your whole base as "salvage."
**Townsfolk (5+aging):** launch master · dome gardener (green things under glass — warmth in vacuum) · suit fitter · the He-3 assayer (assay lineage) · a child born ON the Moon (the first townsfolk who has never seen the river — the tavern tale that aches; E9's motivation seeded).
**Terrain/props:** mare atlas (regolith fine / boulder field / crater glass / landing-scorch) · crater rim set, lander legs, flag-line of the town's journey (every era's crest on one line).
**Icons (12):** grapple, lens, dome panel, airlock, He-3, regolith, air (meter — E5's dive meter, reskinned; the reuse is the POINT), breach, Orbit crest, Debris crest, Glare crest, Earthrise.

## §B — MARE CLAIM (signature tile)
```
   crater rim ring h=6 (premium pads, debris-exposed)
  ┌──────────────────────────────┐   mare flat h=0 · LOW GRAVITY: lob arcs
  │ RIM ○○○ debris arcs ○○○ RIM  │   2.4× longer, movement floaty (0.6g feel)
  │  ╲ LAVA TUBE mouth (procgen!)│   lava tube = interior sub-tile #2 —
  │ MARE: dome cluster ▒▒ pads   │     the vendored dungeon algorithm's
  │  regolith fields · He-3 ∘∘   │     second consumer (first: E2 mine)
  │ LAUNCH PAD▓  mass-driver═══→ │   AIR: outside domes = suit timer
  └──────────────────────────────┘     (E5 dive tech, honestly reused)
```
- **Air is the wall**: domes hold atmosphere; breaches (sieger enemies + debris) drain it on visible dials (E6's tick grammar) — repair culture evolves from walls to SEALS. Outside, the suit timer rules exploration.
- **The lunar day**: 14 waves of light, 14 of dark (E3's night law at astronomical scale); solar lenses feast by day, batteries carry the night — the E3 brown-out ledger returns at epoch scale.
- **Objectives**: defend (dome cluster), pan (regolith He-3 runs on suit timers), catch (mass-driver cargo windows), delve (the lava tube — procgen interior, seeded, contract-validated connectivity), boss: the Claw descends in three acts.
- **Probes**: gravity-param lob/движение deltas, air-drain determinism, breach-crack staging, tube procgen connectivity (seed "mare-1"), day-cycle power ledger.

## §C — engine prereqs
Gravity/atmosphere tile params (GT extension) · breach/seal mechanics on the wall class · suit/air state (dive-state reuse) · debris-arc telegraphed hazards · descending-boss phase framework · procgen interiors v2 (tube biome family). Audio showcase: the muffle/silence/radio layers.
