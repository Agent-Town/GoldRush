# Epoch 2 "The Steamworks" — art & level implementation bundle
### Prompt-ready, implementation-ready · THE TEMPLATE every epoch bundle follows · DRAFT v1, 2026-07-07

**Scope honesty (owner asked for "all epochs, perfect in detail"):** detail this deep is written ONE EPOCH AHEAD of the builders, by law. Prompts written today for epoch 7 would be stale before use — style learnings compound batch over batch (F-008-1 taught us cross-sheet QA; each batch teaches the next). So: this file is E2 at implementation depth AND the binding TEMPLATE (§C) — every later epoch gets a bundle exactly this shape, authored at its S-time from the saga master plan. E3's bundle gets drafted while E2 is being played.

**STYLE ANCHOR — include verbatim in every image prompt below where {ANCHOR} appears:**
*"Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image."*
Sheet law (all character/enemy sheets): flat #ff00ff background, uniform explicit cells, NO mirrored cells (belt/tool items must not swap sides), figure heights consistent within the established character band (measure vs assets/processed/char-hero-sheet-rotation2 cells; state measured heights in QA notes).

---

## §A — ART MANIFEST (each entry: filename · prompt · grid/QA)

### A1. New buildings (4 generations, full prompts)
1. **`bld-boiler-house.png`** — {ANCHOR} A squat frontier boiler house: riveted iron boiler drum on a timber frame, brass pressure gauges with teal-glowing needles, a tall thin smokestack with a soft white steam plume, coal scuttle by the door, stone footing. Three-quarter view matching the existing town-building portraits (reference-condition on assets/processed/bld-general-store.png for angle, scale band and framing). Full-bleed parchment backdrop per the townsfolk-portrait convention. QA: gauge glow reads at 25% zoom; plume is white steam, never dark smoke (warm law); no letters on signage — use a pressure-dial pictogram.
2. **`bld-stamp-mill.png`** — {ANCHOR} A two-story timber stamp mill built into a hillside: row of five vertical iron stamps mid-crush, ore chute entering high, gold-flecked gravel tray below, water wheel feed on one side, brass fittings, teal accent lamp at the gable. Same portrait convention + reference conditioning. QA: the five stamps must read as distinct verticals at gameplay scale; motion implied by one raised stamp.
3. **`bld-rail-depot.png`** — {ANCHOR} A small frontier rail depot: plank platform, bracketed awning, brass bell, a hand-cart with a strongbox, semaphore arm with teal signal lens, rail track stub entering frame low. Portrait convention + reference conditioning. QA: semaphore lens teal; platform height matches character band so figures can stand on it visually.
4. **`bld-machine-shop.png`** — {ANCHOR} An open-fronted machine shop: belt-driven lathes and a flywheel inside warm shadow, gears and pipe stock racked on the wall, workbench with brass parts, sliding barn door half open. Portrait convention + reference conditioning. QA: interior readable but dim (ink-hatch shadow, no black voids — the F-0707-1 black-buildings lesson applies to ART too).

### A2. Era transforms (5 image-EDITs on existing processed assets — consistency law: edit, don't regenerate)
For each: load the existing processed art as the edit base; instruction below; preserve silhouette, palette family, and scale EXACTLY; deliver as `<original-name>-e2.png`.
1. **sluice → steam sluice** (base: current sluice art): replace the water wheel with a compact brass piston assembly + short steam puff; add an iron band around the trough; keep every plank line otherwise.
2. **palisade → iron-banded wall**: add two horizontal riveted iron straps + iron post caps; wood tone unchanged; damage-state variants inherit (note for wear-decal alignment: straps must not fight the wear strip zone — keep the middle third clean).
3. **turret tripod → boiler-fed battery**: add a small boiler pony-tank at the base with a brass feed pipe up the leg; teal pilot light; silhouette height unchanged (targeting/LOS art-read law).
4. **tavern → saloon (E2 face)**: add a covered porch, hanging oil lamps (one teal), swing doors; the building's footprint and roofline unchanged (transform law: same slot, same space).
5. **stockpile → iron strongbox crib**: clad the crib in riveted plate, add a wax-sealed ledger plaque (pictogram, no letters).

### A3. Enemies (3 sheets + 1 boss composite)
1. **`enm-railtough-sheet-a/b.png`** — the Baron's rail toughs (RUSHER, bolt-resistant): burly figure in a buttoned company coat and bowler, brass knuckle-guards, NO firearms — carries a crowbar-spanner; light armor plates on shoulders (visual read: "bolts bounce"). TWO sheets, grid 4 cols (walk4 gait: contact/down/passing/up) × 4 rows (dirs s,se,e,ne / n,nw,w,sw) matching the jumper sheet convention exactly; reference-condition on assets/processed/char-jumper-sheet cells for scale band. {ANCHOR}. QA per house sheet law + coat color must NOT be the bandit red (faction legibility — use company slate-blue).
2. **`enm-steamwrecker-sheet-a/b.png`** — steam wrecker (SIEGER, attacks buildings): a waist-high crab-like contraption of boiler plate and wrench-arms, steam hissing from joints, single teal eye-lens gone amber (feral machine read). Same two-sheet walk4 convention, slightly wider cell if needed (state dimensions). QA: reads MACHINE not creature; amber eye distinguishes hostile-machine from friendly-agent teal.
3. **`enm-coalthief-sheet-a/b.png`** — coal thief (THIEF, steals pressure/coal): wiry figure with an oversized coal sack, sooty kerchief mask, quick low posture. Walk4 convention; carry-pose variant column note: the sack is ALWAYS on the left shoulder (no-mirror law makes this free). QA: silhouette distinct from E1 gold-thief at 25% zoom (sack shape vs pouch).
4. **`boss-baron-railcar.png` + `boss-baron-railcar-damage.png`** — the Baron's armored railcar (component-target boss): side elevation, riveted iron car with a cow-catcher prow, smokestack, three visible COMPONENT zones (wheels/boiler/cabin) cleanly separable for damage states; second image = same car with all three components in damaged state (bent wheels, venting boiler, cracked cabin — mechanical damage only, no occupants visible harmed). {ANCHOR}, flat #ff00ff bg. QA: component zones align between the two images (the engine cross-fades per-component).

### A4. Townsfolk (6 portraits + the aging recipe)
Portrait convention: bust/three-quarter, parchment backdrop, matches assets/raw/townsfolk-*.png framing; {ANCHOR}; reference-condition each on 2 existing townsfolk portraits for palette/framing consistency.
1. `tf-depot-clerk.png` — a young clerk with a signal flag and timetable ledger — CANON BEAT: this is the schoolhouse's first graduate, grown one era (reference-condition the FACE on `townsfolk-youngster-a.png`, aged ~15 years: same eyes, same brow — the aging pipeline's proof case).
2. `tf-boilerwright.png` — broad, cheerful, soot-smudged, brass wrench over shoulder, teal-lens goggles pushed up.
3. `tf-rail-surveyor.png` — weathered, theodolite tripod, rolled maps, wide hat.
4. `tf-union-singer.png` — the saloon act: concertina, patched waistcoat, mid-song warmth.
5. `tf-millwright.png` — precise, apron of small tools, spectacles, gauge in hand.
6. `tf-newcomer-kid.png` — the next generation arrives: a child with a toy boat (E5 foreshadow — the boat, a decade early, in a puddle).
**Aging recipe (image-EDIT, applies to all 8 existing E1 townsfolk):** edit base = existing portrait; instruction: "age this person ~15 years: silver at temples, deeper smile lines, same identity, same clothing UPDATED with one era-2 element (a brass pin, an iron button, a gauge-chain); identical framing, palette, backdrop." Deliver as `<name>-e2.png`. QA: identity unmistakable side-by-side.

### A5. Terrain & props (the Hill Mine set)
1. **`ter-hillmine-atlas.png`** — 2×2 atlas grid of tileable ground squares: (r0c0) grey scree gravel, (r0c1) iron-stained rock, (r1c0) packed mine-road earth with cart ruts, (r1c1) timber-cribbing ground (planks over earth). {ANCHOR as texture: engraved stipple, no objects}, flat cells, tileable edges. QA: matches E1 sand atlas resolution + value range (shader blends across epochs' atlases).
2. **`ter-rail-elements.png`** — sprite sheet, #ff00ff bg, explicit cells: rail straight, rail curve, buffer stop, ore cart (empty/full), trestle segment, semaphore post. QA: rail gauge consistent across cells.
3. **`prop-minehead.png`** — the mine mouth: timber portal frame with a teal lantern, ore-cart track emerging, "closed by planks" variant in cell 2. #ff00ff bg, 2 explicit cells.

### A6. Icon sheet
**`icons-e2.png`** — #ff00ff bg, 8 explicit 1-row cells: boiler lance, pressure mortar, iron wall, boiler battery, pressure gauge (resource), Pressure card crest, Rail card crest, Iron card crest. {ANCHOR at icon scale: bold engraved pictograms}. QA: readable at 32px.

### Batching plan (the drip, per asset strategy)
batch-010 = A1 buildings + A5 terrain (needed by Hill Mine + Town v1 first) → batch-011 = A3 enemies + boss (needed by first E2 waves) → batch-012 = A4 townsfolk + aging + A2 transforms + A6 icons (needed by the transition ceremony). ~55–70 generations incl. retries; nightly art-shift pace = ~4–5 nights, started ~2 weeks before E2's S-date; one batch in flight law holds.

---

## §B — THE HILL MINE (level/tile spec, GT-ready)

**Identity**: era-stamped E2 adventure tile; 96×96 sim units; the first ELEVATION tile (GT-02+ consumer). Fantasy: a terraced hillside mine above a rail cut — hold the high ground, feed the mill, guard the rail.

```
        N (ridge)
  ┌──────────────────────────────┐
  │ G2   T3  ██cliff██   T3      │   T3 = top terrace (h=4.5)  M = minehead
  │   S╲  M▓▓   veinfield  ╲S    │   T2 = mid terrace (h=3.0)
  │ T2  ╲______  T2  ______╱     │   T1 = low terrace (h=1.5)
  │      ╲     ╲╱      ╱   G3   │   S  = switchback ramps (slopeMax legal)
  │ ██cliff██  T1  ██cliff██     │   ██ = impassable cliff bands
  │   BASE▒▒▒ (build zone, h=1.5)│   ▒▒ = primary build pads + Boiler House site
  │ ═══════ RAIL CUT (h=0) ══════│   ═ = rail line, W↔E, boss route
  │  G1(rail-W)   trestle   (rail-E)G1'│  trestle = the "ford": only easy crossing
  │        creek (h=-0.5)        │   creek = wet strip, wet-powder rules apply
  └──────────────────────────────┘
        S (valley)
```
- **Elevation profile (GT params)**: creek −0.5 · rail cut 0 · T1 1.5 · T2 3.0 · T3 4.5 · cliff bands slope > slopeMax (impassable by law); switchbacks at legal slope (uphill 0.7× speed). High ground rule made real: turrets on T2/T3 out-range the cut.
- **Spawn gates**: G1/G1' rail ends (W/E — toughs arrive ALONG the rail), G2 ridge notch (N — wreckers descend), G3 east bench (thieves flank). Waves route downhill via switchbacks → the funnel is the terrain (GT-03 nav).
- **Objectives/contract modes on this tile**: defend (mill), escort (ore cart W→E along the cut, boss-wave: the Railcar enters at G1 riding the rail — component boss on a fixed path), pressurize (keep 2 boilers hot through waves 8–12).
- **Economy placement**: gold veins ×5 on T2/T3 (Geology nodes reveal 2 more), coal seams ×3 near the minehead (coal = pressure fuel), the creek pans (E1 nostalgia + wet-powder risk).
- **Build zones**: BASE pad field on T1 (generous), 4 pads on T2, 2 premium pads on T3 (small — high ground is earned), NO building in the rail cut (contract: the rail must run).
- **Hazards**: over-pressure vents on T1 (boiler mechanic teaching spots), rockfall strip under the ridge during storm waves.
- **Mine INTERIOR (sub-tile hook)**: the minehead M opens (post-launch of E2) into a seeded interior — **the vendored dungeon-forge algorithm is the named reference implementation** (scatter→separate→Delaunay→MST→carve, our TileHeight + validation contracts on top: connectivity guaranteed, no unreachable pockets, budgeted room count). First procgen consumer; also the Charter Press's future "cave adventure" button.
- **Camera**: default frame favors N↑ elevation readability; max zoom-out clamped so T3 and the cut fit together (the tactical picture is the tile's soul).
- **Mobile**: density knobs on scatter; the ASCII layout unchanged (layout is sim, not decoration).
- **Validation probes (tile e2e)**: connectivity G1→mill for a ground unit; switchback traverse time ratio vs flat ≈ 1.4×; no build pad on illegal slope; boss path continuity; determinism fingerprint for seed "hillmine-1".
- **Perf budget**: ≤ +1 terrain draw call vs claim; instanced rail/props; 200-call stress law holds with the full base built on T1.

---

## §C — THE TEMPLATE LAW
Every epoch bundle ships THIS file's shape: §A art manifest with prompt-ready entries in the five categories (new builds / era transforms / enemy sheets + boss / townsfolk + aging / terrain-props-icons) + batching plan · §B one signature tile spec with ASCII layout, elevation table, gates, objectives, economy, hazards, camera, validation probes, perf budget · authored ONE epoch ahead of build, from the saga master plan, folding in every art-QA lesson banked since the previous bundle. E3 "Voltage Age" bundle gets drafted while E2 is in players' hands — never earlier, never later.
