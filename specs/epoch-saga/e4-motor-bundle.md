# Epoch 4 "The Motor Frontier" — art & level implementation bundle
### Template-law shape · banked 2026-07-07 · execution QA lines finalize at E4 S-time from E3's batch learnings

**Era thesis.** Oil under the dust flats, engines eating miles: the frontier gets FAST. Distance becomes both resource and threat — the map outgrows your legs, roads are things you build, and the enemies circle like weather. Wacky-Races energy, Mad-Max warmth, zero grimness.

**STYLE ANCHOR: E2's verbatim, plus the E4 palette note:** *dust-warm ochres pushed lighter and hazier; machines are riveted steel with brass carryovers and teal agent-glow instruments; exhaust reads as light dust puffs, never black smoke; speed is drawn with engraved motion lines, never blur.*

---

## §A — ART MANIFEST

### A1. New buildings (5 generations)
1. **`bld-derrick.png`** — {ANCHOR} A timber oil derrick with a NODDING pump-jack at its base — deliver 2 cells (#ff00ff): pump head UP / pump head DOWN (the two-phase nod is the era's sluice-wheel — the working heartbeat of every screenshot). Teal pressure gauge, rope-and-plank bracing. QA: both cells identical except the pump head arc; the derrick tower silhouette must read at far zoom (this is the era's most-placed object).
2. **`bld-refinery.png`** — the megaproject residue → economy building: two squat cracking towers, a coil of pipework between them, twin outflow spigots (gold-amber FUEL and near-black TAR — the era's two products visible as art), a small flare stack with a tiny warm flame. Portrait convention, reference-conditioned on bld-dynamo-hall for scale band. QA: the two spigot colors are the resource-color grammar — match icons exactly.
3. **`bld-garage.png`** — the vehicle bay: wide plank doors thrown open, a Flivver mid-service on a timber lift, tool wall, a teal diagnostic lamp on a cord (the agent-tech creeps into everything). QA: door aperture wide enough that vehicle sprites visually "fit" through.
4. **`bld-grader-post.png`** — the road-building station: a drag-scraper rig, survey flags, a plank table with a route map (pictograms). Small footprint. QA: reads as INFRASTRUCTURE not defense (players must intuit "this makes roads").
5. **`bld-watchtower.png`** — a tall guyed lookout with a brass spotting scope and a signal lamp (storm-lantern gold): the dust-storm counter (extends visibility radius in weather). Two cells: lamp lit/unlit. QA: taller than the derrick band — the tallest silhouette of the era.

### A2. Era transforms (5 image-EDITs, `<name>-e4.png`)
1. **stockpile/strongbox → tank farm**: the iron crib becomes two riveted tanks with a walkway; keep footprint; ledger plaque carries over.
2. **tavern/lounge → Motor Inn**: add a porte-cochère (drive-through porch!), a line of parked-vehicle silhouettes painted subtly at the side, festoon lights carry over from E3. Footprint law holds.
3. **iron wall/coil fence → guardrail tier**: sleeker steel W-beam rail atop the timber base; insulator caps retire; the wear-strip third stays clean.
4. **arc turret → piston battery**: the toroid becomes a rotary piston head (visual: radial engine); tripod silhouette EXACT (LOS law).
5. **academy → polytechnic**: add a drafting-hall wing with wide windows and a wind gauge on the roof.

### A3. Vehicles (NEW ART CLASS — rotation sheets, character conventions apply)
1. **`veh-flivver-sheet-a/b.png`** — the scout car: a spindly, cheerful tin runabout, spare tire on the rear, teal dash instrument. TWO sheets, 4 cols (roll phases: wheels at 0°/45°/90°/135° — wheel rotation is the "gait") × 4 rows (dirs s,se,e,ne / n,nw,w,sw). #ff00ff, no mirrors (spare tire stays rear-left). QA: cab EMPTY (driver sprites composite on top — the hero/agent visibly drives).
2. **`veh-hauler-sheet-a/b.png`** — the flatbed workhorse (mobile base piece — it CARRIES a turret or crate, composited): heavier frame, stake bed EMPTY in art, same two-sheet roll convention. QA: bed anchor zone marked in a QA note (pixel bounds where cargo composites).
3. **`veh-sidecar-attach.png`** — the Prospector's sidecar: a small teal-trimmed sidecar pod that composites onto the Flivver's right side, 8 direction cells matching the Flivver rows. QA: attachment alignment per direction stated in cell notes (this is the co-op seed image — the buddy rides along).

### A4. Enemies (3 sheets + boss)
1. **`enm-motorgang-sheet-a/b.png`** — gang rider on a scrap-built motorbike (rider + bike as ONE unit): goggles, dust scarf, pipe-frame bike, NO firearms — carries a grapple-chain (steals by hooking crates). Roll-phase two-sheet convention like vehicles. QA: scarf color rust-orange (new faction color — not bandit red, not company slate).
2. **`enm-tarsprite-sheet.png`** — the gusher hazard's spawn: a knee-high glob of animate tar with a comical pilot-light hat, sticky trail. ONE sheet 4×4 (bubble-walk phases × 4 dirs). QA: cute-menacing, never gross — it's a Le Chatelier cartoon, not slime horror.
3. **`enm-pipeline-rustler-sheet-a/b.png`** — the siphon crew: figure with a hand-pump backpack and hose, taps your pipelines/tanks (steals crude). Walk4 convention + sheet-B row 5 "siphoning" pose ×4. QA: backpack ALWAYS left; hose coils right.
4. **`boss-land-yacht.png` + `-damage.png`** — the Land-Yacht: a rolling fortress on six wheels — a barge-like hull, a smokestack amidships, a rotating cargo-crane arm (its "weapon": grabs your buildings' cargo), a captain's wheelhouse. Component zones: WHEELS (×2 art zones) / CRANE / WHEELHOUSE. Damage variant aligned. QA: wheels large enough to read as the obvious first target (the fight teaches component-targeting by silhouette alone).

### A5. Townsfolk (5 new + aging pass + one promotion)
1. `tf-wildcatter.png` — the oil finder: divining rods swapped for a soil auger, crude-splashed boots, irrepressible.
2. `tf-mechanic.png` — coveralls, wrench bandolier, a Flivver piston cradled like a baby.
3. `tf-road-boss.png` — the grader crew chief: theodolite (the surveyor's, inherited — reference-condition on tf-rail-surveyor's kit), flag in hand.
4. `tf-diner-cook.png` — the Motor Inn's counter cook: apron, pie, a teal radio murmuring on the shelf behind (E7 seed #2).
5. `tf-radio-tinkerer.png` — a kid with a crystal set and wire-wrapped headphones (E7 seed #3 — the Signal Era is being born in the background of this one).
**Aging pass**: E3 recipe re-applied (+~12 years, one E4 element: driving goggles, a fuel-punch card). **Promotion**: `tf-depot-clerk-e4.png` — the E2 graduate, E3 tram conductor, now runs the bus line (same face, third era — the aging pipeline's showcase run).

### A6. Terrain & props (the Dust Flats set)
1. **`ter-dustflats-atlas.png`** — 2×2: cracked pan earth / soft dust drift / GRADED ROAD (packed, edge-berms) / oil-stained ground. Tileable, prior resolution/value law.
2. **`ter-pipeline-elements.png`** — cells: pipe straight, pipe elbow, valve wheel, tap point, leak puddle.
3. **`prop-gusher.png`** — 3 cells: capped wellhead / gushing plume (amber crude arc, drawn) / burnt-out crater. QA: the plume is CRUDE (amber-black) not fire.
4. **`prop-tumbleweed.png`** — 4 roll cells. Because of course.
5. Dust storms are ENGINE weather (visibility + tint) — no art beyond a QA note that all E4 art must survive a +20% haze overlay legibly.

### A7. Icon sheet
**`icons-e4.png`** — 12 cells: piston slinger, tar sprayer, guardrail, piston battery, crude (resource), fuel, tar, road segment, convoy crest, Speed card crest, Claim card crest, storm warning. 32px-readable.

### Batching plan
batch-016 = A1 + A6 (tile + derrick heartbeat first) → batch-017 = A3 vehicles + A4 enemies/boss (the era's soul; vehicles get extra QA rounds — wheels are hard) → batch-018 = A2 transforms + A5 townsfolk/aging + A7. ~75–90 generations incl. retries (vehicles inflate it); drip starts ~3 weeks pre-S (longest lead yet).

---

## §B — THE DUST FLATS (signature tile, GT-ready)

**Identity**: era-stamped E4 tile; **160×160** (deliberately too big to walk — the tile TEACHES driving); flats with one wound: the dry wash. Fantasy: claim the field derrick by derrick, grade your roads, keep the convoys alive, and watch the horizon for circling dust.

```
                N (railhead — E2 continuity: the spur you built)
  ┌────────────────────────────────────────┐
  │   RAILHEAD▓ (convoy destination)       │   flats h=0.5 everywhere except:
  │  road(gradeable)···· derrick field NW  │   dry wash h=-1.5 (SE, flash-flood
  │      ····            ᴅ ᴅ ᴅ             │     event in storms; bridges buildable)
  │  MOTOR CAMP ▒▒▒▒  ·······road····      │   ᴅ = derrick claim spots (×12,
  │  (garage, refinery, ▒ build field)     │       quadrant-spread — territory
  │      ····room to grow····              │       pressure teaches expansion)
  │  derrick field SW   dry─wash───╲       │   ···· = gradeable road corridors
  │   ᴅ ᴅ ᴅ          bridge╲  wash  ╲ SE   │   (grading = micro-terraform:
  │        W-road(boss)     ╲───────╲      │    slope-cost → 0 = vehicle speed)
  └────────────────────────────────────────┘
   Enemies do NOT use gates: motor gangs spawn on ORBIT ARCS —
   circling the camp at radius, peeling inward. The horizon is the gate.
```
- **Elevation (GT)**: flats 0.5, wash −1.5 with sloped banks (crossable slowly; bridges make it free), NO cliffs — this tile's "terrain" is DISTANCE and the roads you cut through it.
- **Vehicles rule the tile**: on foot the quadrants are minutes apart; the Flivver makes them seconds. The Hauler relocates turrets/crates (mobile defense — the era's strategic novelty). Fuel is the leash: vehicles drink refinery output; a stranded Flivver in a storm is a story.
- **The ORBIT spawn pattern (new)**: gangs circle at radius sweeping for targets (derricks > convoys > camp), peeling in on arcs — defense becomes DIRECTIONAL PREDICTION, and watchtowers (visibility) become the counter-intel building. Storms shrink your sight, not theirs (they navigate by engine sound — the fiction for the mechanic).
- **Objectives/modes**: defend (camp), claim (activate N derricks — expansion pressure), convoy (fuel to the railhead — the E2 rail pays off as YOUR infrastructure now), race (checkpoint circuit contract — optional, fast, the predicted kids' favorite), boss wave: the Land-Yacht enters on the W road, crane-grabbing derrick heads as it comes; wheels first or lose the field.
- **Hazards/events**: gusher blowouts (random capped wells erupt: tar sprites + a crude windfall for whoever caps it — risk/reward), storm fronts (visibility ladder: clear→haze→brownout), flash flood (storm event: the wash runs — anything in it swims or drowns... machines drown warmly: they cough and stall).
- **Economy**: crude (derricks) → refinery → FUEL + TAR; gold persists via the railhead market (sell crude upstream — the auto-conversion law's face).
- **Contract example (the foreshadow rejection, verbatim in-game):** *"make my hauler amphibious"* → REJECTED: "The works eye the horizon; the sea asks for a different science." (E5's door, knocked on early.)
- **Validation probes**: orbit-spawn radius/peel determinism (seed "dustflats-1"), grade-road speed delta (≥2.5× on-road), convoy path continuity, derrick claim→income tick, boss crane targets nearest active derrick, flood kills wash-standers, storm visibility radius steps.
- **Camera/mobile**: farther default zoom than any prior tile (speed needs sight); mobile caps dust particles + orbit-visible count, never the tile size.
- **Perf**: vehicle dust-trails pooled/instanced; derrick nod = 2-frame texture swap (cheap heartbeat); 200-call law holds at 12 derricks + full camp + storm.

## §C — engine prerequisites recap (saga ladder, E4 rows)
Vehicle movement (accel/turn/fuel; hero-driving state + composited driver sprites) · Hauler cargo compositing (turret/crate on bed) · convoy AI (follow + formation) · ORBIT spawn pattern (arc scheduler) · weather system v1 (visibility ladder + tint + storm events) · road-grading micro-terraform (persistent per-run, slope-cost edit) · component-boss v2 (MOVING boss on a path with targetable zones) · gusher timed hazards. The tile probes above are their acceptance tests. Co-op seed: the sidecar (agent rides along) — flag for the co-op milestone's on-ramp.
