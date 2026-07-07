# Epoch 9 "The Red Fields" — design-locked bundle · banked 2026-07-07

**Era thesis.** A dead red world, and the town's oldest craft aimed at the largest possible claim: water. You mine ice, dig canals, and what you shape STAYS — the tile is a save file, green spreads run over run, and one day water moves under a sky that never held a river. Epoch 1, rebuilt by hand, generations later. This is the saga's heart-era.

**PALETTE NOTE:** *rust-red engraved dunes over parchment; the green that spreads is E1's exact riverbank green (sample it — literally the same swatch: the point IS the callback); domes warm-lit from within; dust devils are drawn columns of hatch-spirals.*

## §A — ART (design-locked)
**Buildings (6):** dome commons (tavern lineage: the biggest interior yet — the town increasingly lives indoors together) · canal works (THE building: sluice lineage's apotheosis — gates, locks, a water-wheel waiting dry for the day it turns) · ice quarry rig · weather spire (E4/E5 weather tech's endgame: you begin to CONTROL fronts) · seed vault (green economy) · the Ark yards (megaproject site, visible growing for the whole era).
**Transforms (4):** Orbital Canteen → Dome Commons annex · lens turret → storm-lance (weather-charged) · Mission Archive → the Areology Hall · comms mast → world-band tower.
**Enemies (3+boss):** dust devils (nature: wandering hazard columns that PICK UP small objects — including loot, including toasters if any survived) · feral terraformers (E6 Combine lineage: house-sized, old, still working, wrong planet — tragic-comic machines that "fix" your canals into their century-old blueprint) · claim-jump prospect drones (rival companies never die) · **BOSS: THE OLD DIGGER** — an ancient terraformer too big to kill honestly: the fight is REPROGRAMMING it (E7's playbook verb as the weapon — board it, replace its blueprint tape mid-battle while it fights you). Beating it = it joins the town's fleet, re-digging canals RIGHT. The saga's thesis in one boss: we don't destroy the old machines; we teach them.
**Townsfolk (5+aging):** canal reeve (water law returns! the E1 claim office's oldest job reborn) · ice quarry chief · greenkeeper (the dome gardener's apprentice, now planting OUTSIDE) · weather warden · the moon-born child grown — the era's protagonist-adjacent townsfolk, first to swim in the new canal (the tavern tale that pays off E8's ache).
**Terrain/props:** red-fields atlas (dune rust / regolith crust / CANAL-WET earth / the green — same swatch law) · canal segments (dry/wet/flowing ×3 states — the tile's progress bar as art) · ice blocks, survey cairns, the Ark scaffold stages ×3.
**Icons (12):** terraform cannon, storm fence, canal gate, ice pick, water (the resource — after nine eras, water), seed, green-spread, blueprint tape, Devil crest, Digger crest, Flow crest, Ark silhouette.

## §B — THE DOME BASIN (signature tile — the persistent one)
```
   N: ICE QUARRY (h=4 scarp)          THE RULE THAT MAKES THE ERA:
  ┌──────────────────────────────┐    this tile SAVES. Canals dug stay dug.
  │ QUARRY▓  feeder canal route  │    Water reached stays reached. Green
  │   ╲ stage-gates C1→C2→C3     │    spreads +N% per successful run and
  │ RIM domes ▒▒  BASIN h=-2     │    NEVER resets. The player returns not
  │  weather spire · seed rows   │    to replay a level but to CONTINUE A
  │ ARK YARDS▓ (grows all era)   │    PLACE. (Engine: persistent tile state,
  └──────────────────────────────┘    the save-scale milestone.)
```
- **Terraform staging**: C1..C3 canal stages flood the basin in steps (each a multi-run megabuild with defense phases — the E2 megaproject mechanic, serialized); each stage permanently changes spawns/routes/economy (water blocks devils; green feeds the seed economy; the basin slowly becomes... a river valley. The shape should feel familiar. It IS the E1 claim's topology, rotated — say nothing in-game; let someone's kid notice.)
- **Objectives**: quarry runs, canal defense (stage-gates under attack), re-dig (fix Digger damage), weather-shepherding (spire minigame: steer a front to water the far rows), boss as above.
- **Probes**: persistence integrity (state survives restarts/suspends — the hard gate), stage-flood determinism, green-spread rate bounds, Digger reprogram sequence, devil pickup/drop physics-lite.

## §C — engine prereqs
Persistent tile mutation + save-scale (THE era-defining system — spec it with the care GT-01 got: an identity-preserving substrate slice first) · staged-flood fluid fill · reprogram-boss interaction (playbook injection) · moving-column hazards · weather-control minigame. Reuse ledger: megaproject mechanic (E2), playbooks (E7), weather (E4/E5), green swatch (E1 — art constant, checked by hex).
