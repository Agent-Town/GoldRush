# Epoch 5 "The Deepwater Claim" — art & level bundle · banked 2026-07-07 (template-law shape)

**Era thesis.** The Boat launches and the frontier turns blue: the claim floats, storms ARE the wave scheduler, and the sea floor is a museum of everything you've ever built — every prior era has a wreck down there. Extraction goes down (pearls, salvage) while the sky decides your schedule.

**STYLE ANCHOR: E2's verbatim + E5 palette note:** *sea in layered engraved swells (ink-line crests, never foam spray realism); underwater scenes shift to blue-green parchment with light shafts; brass diving gear + teal instruments; storms are charcoal wall-clouds with warm lantern points, never dread-black.*

## §A — ART MANIFEST
### A1. New buildings/vessels (6)
1. **`veh-claimboat-sheet-a/b.png`** — THE BOAT (mobile base): a broad-beamed working barge — wheelhouse aft, crane amidships, pan-dredge bow, teal running lights. Vehicle roll-convention adapted to WAKE phases (4 wake cells × 8 dirs, two sheets). Deck EMPTY (buildings composite on deck anchor zones — the base is buildable ON it; anchor bounds in QA notes). QA: silhouette reads at far zoom; deck-anchor grid documented.
2. **`bld-lighthouse.png`** — the era's beacon lineage: stone base, brass lamp house, teal-and-gold fresnel. 2 cells lit/unlit + a QA note for the rotating beam (engine-drawn cone). QA: tallest silhouette of the era.
3. **`bld-drydock.png`** — timber cradle + winch house (vessel repair/refit = the era's garage).
4. **`bld-divebell.png`** — brass bell on a chain hoist with a small air-pump cart (the dive entry point). 2 cells: surfaced/submerging.
5. **`bld-cannery.png`** — the tavern's harbor annex workplace: kettle line, label table (pictogram labels), gull perched (one gull, always).
6. **`bld-net-frames.png`** — drying nets on frames (the era's fence-adjacent decoration + slow-field defense art).
### A2. Era transforms (4): tavern → Harbor House (lantern gable, rope trim, tide chart board) · stockpile/tanks → bonded warehouse (customs seals) · turret battery → deck-mount harpoon pivot (SAME silhouette height; deck + shore variants) · polytechnic → navigation school (sextant finial).
### A3. Enemies (3 + boss)
1. **`enm-corsair-skiff-sheet-a/b.png`** — corsair skiff (vehicle-class enemy): patched lateen sail, boarding gaffs, crew of two painted-in (the skiff is the unit). Wake-phase convention. Faction color: tar-black sail with a rust-orange patch (motor-gang lineage gone to sea).
2. **`enm-leviathan-sheet.png`** — machine-leviathan (Combine prototype lost at sea — E6 foreshadow): a segmented brass sea-serpent, barnacled plates, one amber eye-lens (feral-machine grammar), THREE segment cells + head + tail for engine composition (long-body spline rendering). QA: barnacles prove AGE — this thing has been down there since before the game began.
3. **`enm-reef-snapper-sheet.png`** — nature: an oversized snapping shellfish that grabs divers/hulls. 4×2 sheet (snap phases × closed/open states).
4. **`boss-dredge-queen.png` + `-damage.png`** — the Dredge-Queen: corsair flag-barge with a great salvage claw, twin paddlewheels, a loot-hold. Components: CLAW / PADDLES / HOLD. She steals your WRECK-DIVE loot if you let her work (a boss that competes rather than only attacks). QA: aligned damage zones; claw readable as first target.
### A4. Townsfolk (5 + aging + promotion): harbormaster (ledger + spyglass) · pearl-diver (bell-helm under arm) · shipwright (adze + hull rib) · tide-teller (the era's odd sage: kelp charts, warm eccentric) · cannery-hand (the newcomer-kid from E2, grown — reference-chain their face). Aging pass per recipe (+~12y, one sea element). Promotion: the clerk lineage runs the ferry line (`tf-depot-clerk-e5.png`).
### A5. Terrain/props: **`ter-shelf-atlas.png`** 2×2 (reef shallows / sandbar / kelp bed / deck planking) · **`prop-wrecks.png`** — FIVE wreck sprites, one per prior era: a sunken E1 supply barge, an E2 locomotive (how? the tavern argues about it forever — a tale hook), an E3 pylon barge, an E4 land-yacht sister ship, plus a mystery hull (E6 seed: too smooth, faintly glowing). Each 1–2 cells + a debris field cell. · **`prop-buoys.png`** (channel markers, lit/unlit) · underwater light-shaft overlay note (engine shader).
### A6. Icons (12): harpoon, depth charge, net field, deck mount, pearl, salvage, air (dive meter), storm glass, Tide crest, Salvage crest, Deep crest, lighthouse.
### Batching: batch-019 boat+lighthouse+atlas → 020 enemies+boss+wrecks → 021 transforms+townsfolk+icons. ~80–95 generations (the boat's deck-anchor QA inflates); drip 3 weeks pre-S.

## §B — THE SHELF REEFS (signature tile)
**Identity**: 128×128 water tile; the Claim-Boat IS the base (anchor points, not build pads on land). Depth is the map.
```
        N (open water — storm tracks cross W→E)
  ┌──────────────────────────────┐   depths: surface 0 / shallows −1
  │  storm track ~~~~ storm track│   reef ring −2 / dive sites −4
  │   ⚓ open anchorage (deep)    │   trench edge −8 (S border, uncrossable
  │  REEF RING ○○○○○ gap ○○○○    │     — the Deep Reactor site glows below)
  │ ○ lagoon: LIGHTHOUSE isle ○  │   ○ = reef (skiffs must use gaps;
  │ ○  ⚓CLAIM-BOAT anchorage  ○  │       leviathan ignores reefs — depth law)
  │  ○○ dive sites: W1 W2 W3 ○○  │   W1..W5 = era wrecks (see props)
  │     W4   W5    kelp beds     │   ⚓ = anchor points (boat repositions
  │  ════ trench edge (glow) ════│       between waves — mobile-base rhythm)
  └──────────────────────────────┘
```
- **Storms are the scheduler**: fronts cross on tracks; each front CARRIES its wave (skiffs ride the weather-edge; the leviathan surfaces in the calm AFTER — rhythm: brace → fight → dive in the lull). The lighthouse's beam pushes the ambush radius back at night (E3 light law at sea).
- **Diving**: bell drops at dive sites; underwater = slow, air-metered (meter art in A6), treasure vs snappers; the DEPTH LADDER (−1 shallows anyone / −2 reef with gear / −4 wrecks with the bell / −8 never — yet). Wreck loot feeds era-crossover crafting (E4 parts from the land-yacht sister!).
- **Objectives/modes**: defend (the boat at anchor), salvage (dive contracts per wreck), lighthouse defense (shore holdfast variant), cannery supply (fish-run escort), boss: the Dredge-Queen works W5 unless stopped — she LOOTS on a timer, the fight is a race.
- **Probes**: storm-track determinism (seed "shelf-1"), reef-gap pathing for skiffs, leviathan depth-ignore, air-meter drain/refill, boat re-anchor integrity (deck buildings persist), boss loot-timer vs player interrupt.
- **Perf**: swell vertex animation budgeted (the W1-02 water shader, grown up); wreck interiors are NOT walkable this era (windows only — procgen interiors arrive E8's lava tubes).

## §C — engine prereqs (saga ladder E5 rows)
Water volumes + boat physics (GT-05) · deck-anchor building system (base-on-vehicle!) · dive state + air meter · storm scheduler v2 (fronts carry waves) · long-body spline enemy (leviathan) · competing-boss loot timer. Reuse ledger: E3 light-radius → lighthouse beam; E4 vehicle tech → skiffs/boat; W1-02 water shader → the whole stage.
