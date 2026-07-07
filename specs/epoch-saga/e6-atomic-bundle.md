# Epoch 6 "The Atomic Homestead" — art & level bundle · banked 2026-07-07 (template-law shape)
**TONE GATE: this whole bundle executes only per the owner's saga §6 Q1 answer (warm 50s-futurism check). Everything below is written to the warm reading: the peaceful atom, chrome optimism, zero sickness imagery — hazards glow and tick, they never wound.**

**Era thesis.** The Deep Reactor comes ashore and nobody quite knows what it is — but the Combine does, and floods the frontier with "helpful" atomic appliances that promptly go feral. Everything in this era TICKS: buffs decay, hazards decay, enemies decay. Time itself becomes a resource you read on teal dials.

**STYLE ANCHOR: E2's verbatim + E6 palette note:** *chrome and pastel enamel over the parchment warmth; atomic starburst motifs on signage (pictograms only); starstone glows soft teal, Combine tech glows amber; decay is drawn as glow FADING through engraved hatch-steps, never as corrosion or sickness.*

## §A — ART MANIFEST
### A1. New buildings (5): **`bld-reactor-dome.png`** (the raised Deep Reactor re-housed: a rivet-seamed dome with a teal observation ring and NO visible door — a tavern-tale in itself; 2 cells: humming/dormant) · **`bld-isotope-kitchen.png`** (the era's refinery: a gleaming lab-diner hybrid — lead-glass hoods, tong arms, pie case REPURPOSED for glowing samples; the era's humor in one image) · **`bld-appliance-pen.png`** (the wrangler's corral: a fenced yard of pacified Combine appliances, one tethered mower grazing) · **`bld-decay-clock.png`** (the town's half-life clock tower: teal dial counts EVERY timer in the era; buildable utility that slows nearby decay 10%) · **`bld-catalog-warehouse.png`** (the Combine's abandoned mail-order depot — enemy spawn lore-building, crates with starburst logos).
### A2. Transforms (4): tavern → **Atomic Diner** (chrome counter band, jukebox glow, the art department's finest hour — reference EVERYTHING; the saga's poster image) · turret battery → **sunline mount** (parabolic mirror head, same silhouette) · guardrail → **glow-fence** (embedded starstone pips) · navigation school → **isotope institute** (dome + dial).
### A3. Enemies (3 + boss), all Combine-feral comedy: **`enm-feral-toaster-sheet.png`** (knee-high, hops, ejects scorching toast in an arc — the era's rusher swarm; 4×4 hop-phases) · **`enm-lawn-shepherd-sheet-a/b.png`** (a feral mower that HERDS other appliances toward your base — kill it and the herd scatters: the era's tactical enemy; walk4 convention) · **`enm-glowjack-sheet-a/b.png`** (human rustler in a lead-lined duster stealing isotopes with tongs — amber goggles, faction color: enamel-mint) · **`boss-homemaker-9000.png` + `-damage.png`** (a house-sized domestic automaton "here to help": vacuum-arm (pulls buildings' HP), toast-rack battery, polished-chrome core; components VAC/RACK/CORE; it TIDIES your base to death — warm horror, pure comedy in the damage states: it ends up slumped in a chair it built).
### A4. Townsfolk (5 + aging): reactor steward (the tide-teller's apprentice, promoted — face-chain) · kitchen chemist · appliance wrangler (lasso of copper wire) · diner carhop (roller skates, tray of glowing sundaes) · **the Combine defector** (mint-enamel suit, loosened tie, carries the catalog he wrote — E7's Exchange hires him). Aging pass (+~12y, one chrome element). Clerk lineage: `tf-depot-clerk-e6.png` runs the parcel-tube office.
### A5. Terrain/props: **`ter-glowmesa-atlas.png`** 2×2 (mesa caprock / scree / enamel-road / starstone vein-rock with teal flecks) · **`prop-decay-puddles.png`** (3 glow-stages of the same puddle — the decay ladder made visible) · **`prop-crates.png`** (Combine starburst crates, intact/opened) · night carries E3 tech (starstone veins glow after dark — mining at night is brighter AND more dangerous).
### A6. Icons (12): sunline, caltrops, glow-fence, sunline mount, starstone, half-life dial, decay-slow, Isotope crest, Tick crest, Herd crest, toast (yes), defector's catalog.
### Batching: 022 buildings+terrain → 023 enemies+boss → 024 transforms+townsfolk+icons. ~70–85 gens. NOTE: the Atomic Diner transform gets DOUBLE retry budget — it's the poster.

## §B — THE GLOW MESA (signature tile)
```
        N (the Combine's catalog warehouse — enemy origin)
  ┌──────────────────────────────┐  mesa top h=5 (Reactor Dome site, premium
  │  WAREHOUSE▓  scree slopes    │    pads, starstone vein ring ×6)
  │   ╲herd paths╲   S╲          │  slopes: herd-paths (legal grade — the
  │ MESA TOP ▒dome▒ vein ring    │    lawn-shepherds DRIVE appliance herds up)
  │   S╱        cliffs██         │  base flat h=1 (main pads, Isotope Kitchen,
  │ BASE FLAT ▒▒ decay fields ∴∴ │    Diner); ∴ = decay-puddle fields that
  │  DECAY CLOCK site   G-S      │    tick down on visible timers — walkable
  └──────────────────────────────┘    windows open/close: the tile BREATHES
```
- **Everything ticks**: puddles decay to safe on dials; your sunline buffs decay; feral appliances WIND DOWN if kited long enough (the pacifist option: exhaust, then wrangle — captured appliances join the pen as economy bonuses. The era's secret: you can win waves by patience).
- **Objectives**: defend (kitchen), harvest (night vein runs through decay windows), wrangle (capture N appliances alive — the contract that teaches the wind-down), boss: the Homemaker-9000 walks in from the warehouse "to help"; every component you break makes it help less.
- **The MEGAPROJECT — the Calculating House**: built on the mesa top beside the dome (LORE KEYSTONE, pending owner Q3): telegraph parts + starstone + every era's craft converge; its completion cutscene is one warm image — a teal dial blinking in a pattern the Prospector recognizes. Where agents began.
- **Probes**: decay-timer determinism (seed "mesa-1"), puddle window pathing, wind-down capture, herd-driving vectors, boss tidy-targeting (highest-HP building first), clock-tower slow-aura radii.

## §C — engine prereqs (E6 rows)
Decay-timer framework (unified tick system: buffs/hazards/enemies on one scheduler — E7's replay determinism depends on its cleanliness) · glow-shader pass (teal/amber grammar) · capture/pacify interaction (wrangle verb) · herd AI (drive-toward vectors) · tidy-boss building-priority targeting. Reuse: night tech (E3), component boss (E4), competing-boss timers (E5's Dredge-Queen → the Homemaker "helps" on a timer).
