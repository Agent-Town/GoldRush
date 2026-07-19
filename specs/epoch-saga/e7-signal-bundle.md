# Epoch 7 "The Signal Era" — design-locked bundle · banked 2026-07-07 (QA lines finalize at S-time)

**Era thesis.** The Calculating House taught the frontier that helpers can be MADE — now signal is the resource, ridgelines carry the network, and the era's toy is the saga's crown jewel: **playbooks**. Do a job once, name it, hand it to an agent. Programming by demonstration — and the direct little sibling of the Charter Press.

**PALETTE NOTE:** *vacuum-tube warmth: walnut consoles, glass tubes glowing honey-gold, punch-tape ribbons, teal agent-glow now EVERYWHERE (this is their era); signal drawn as engraved concentric arcs.*

## §A — ART (design-locked entries; prompts finalize at S-time)
**Buildings (5):** Relay Tower (lattice mast, dish, 2 cells linked/searching — the era's pylon) · the Exchange (tavern annex grown into a switchboard hall; the defector runs it) · Playbook Library (schoolhouse transform: card-catalog of punch-tapes — lessons become literal programs) · Drone Coop (a dovecote for hover-drones; the m4-06 companion multiplied) · Signal Refinery (spectrum → usable SIGNAL resource).
**Transforms (4):** diner → Net Café (booths get terminals, jukebox stays) · sunline mount → beam-relay turret (can RELAY damage between towers — the E3 chain idea at LOS scale) · institute → the Signal Works · parcel office → tape-post (the clerk lineage rides again).
**Enemies (3+boss):** rogue automata — **your own corrupted playbooks embodied** (art: agent-frame silhouettes glitching between poses — cells deliberately mis-sequenced as the ART of the bug) · data-rustlers (tap your relays, siphon signal; crystal-set backpacks) · static-hares (nature: fast interference critters that ground your drones) · **BOSS: THE ECHO** — a shimmering copy of YOUR base's own defense pattern (engine renders it from your actual layout — art delivers the "echo material" shader treatment + a mask sheet). It fights like you play, because it learned from you. Beating it = out-thinking yourself. (The determinism/event-log investment pays for this boss; it is only possible because of laws written in month one.)
**Townsfolk (5+aging):** switchboard chief (E3 operator promoted — face-chain) · playbook librarian · drone keeper · tape courier kid (4th-generation newcomer line) · the first MADE townsfolk: a civic agent with a name, a desk, and a portrait (canon moment — pending the Q3 lore answer).
**Terrain/props:** relay-valley atlas (ridge shale / valley loam / antenna meadow / cable trench) · punch-tape ribbons, dish clusters, dead-zone fog markers.
**Icons (12):** jammer, drone, relay turret, playbook (tape), signal, spectrum, record-dot, Echo crest, Static crest, Library crest, dead-zone, delegate-hand.

## §B — THE RELAY VALLEY (signature tile)
```
   Ridge W (relay chain) ── LOS ── Ridge E (relay chain)
  ┌──────────────────────────────┐  ridges h=5 (tower pads, thin, exposed)
  │ R1───R2───╳dead gap╳───R3─R4 │  valley floor h=0 (town field, thick)
  │   ╲LOS╲    fog pocket   ╱    │  dead-zones: LOS-shadowed pockets where
  │    VALLEY TOWN ▒▒▒ Exchange  │    drones drop + rustlers ambush —
  │  fog pocket   G-S   fog      │    placing towers IS the level puzzle
  └──────────────────────────────┘
```
- **Signal = LOS**: relays need line-of-sight (GT-04's occlusion, repurposed as INFRASTRUCTURE) — the grid idea of E3 evolved from wires to geometry. Dead zones are where the map bites.
- **Playbooks on this tile**: the teaching contract — record a patrol once, hand it to a drone, then DEFEND the drone doing your job (emotional design: watching your own habits walk around). Corrupted-playbook waves replay YOUR recordings glitched — debugging by watching the replay is literally the counter-mechanic.
- **THE STARSHIP megaproject**: built in the valley across many runs — and every prior era owes a component CONTRACT: E2 boiler valves, E3 coil banks, E4 engine blocks, E5 hull plate, E6 core, E7 guidance playbooks. A deliberate all-history victory lap; each component contract is played ON that era's tile (the replay law becomes the endgame's structure).
- **Probes**: LOS-link determinism, dead-zone spawn placement, playbook record→replay hash-identity, Echo layout-mirroring, component-contract cross-tile routing.

## §C — engine prereqs (the era IS its engine work)
Action recording → playbook format (event-log slices, named, validated) · playbook execution through the typed tool surface (agents replay them — no new authority) · corrupted-replay wave generator (mutate recorded sequences within bounds) · THE ECHO (instantiate enemy base from player layout snapshot) · LOS-network (GT-04 reuse) · drone flock AI. **This epoch is where every architectural law since M4 pays out at once; schedule it generously and audit determinism first.**

## §C.1 — THE NUMBERED SLICES (authored s-triage 2026-07-19, closing the gap four honest codex no-ops named; sources: §B above + STORYBOOK E7 (the jack-board canon ~:404, "one lit jack per answering voice"; the silences; the recall) + shipped substrate: PB-01/02, playbook surface, THE ECHO, GT-04 occlusion, the dispatch milestone grammar)
1. **S1 — THE LOS RELAY NETWORK.** Relay towers buildable on e7 contracts; a relay LINKS iff line-of-sight per GT-04's occlusion truth (ridges carry, fog pockets and the dead gap DENY); linked coverage grants the signal bonus (threat visibility per §B), unlinked zones are where drones drop. Deterministic: identical placements → identical link graph (id-sorted resolution, hashable). GATE: e2e asserts link-graph hash stability across two identical runs · the dead gap stays unbridged until a correct tower bridges it · zero console.
2. **S2 — THE JACK-BOARD.** The rescue board (town seam beside the Exchange): one jack LIGHTS per era progress beat (reuse the dispatch engine's milestone events — first-relay-linked, contract wins, era firsts; dupe-guarded, era-scoped, profile-persisted); each new light fires its ceremony-postscript fragment (postscript law). GATE: seeded milestone ladder lights jacks 1..N exactly once each · persists across reload · LEXICON-clean copy.
3. **S3 — THE SILENCES.** Past the era's midpoint beat, lit jacks go DARK on scripted progress beats (deterministic per profile — never random, never on a timer); each darkening emits its E7 dispatch fragment (the warm law under maximum load); the LAST light's darkening is the era's exit beat (co-arms the E8 transition beside the megaproject law). GATE: darkening order deterministic · the last-jack beat fires exactly once · no jack darkens before the midpoint beat · zero console.
