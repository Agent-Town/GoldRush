# Task ts-04-living-pass: the town breathes — trails walked, monument visited (lane-c; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=medium
FROM specs/town-v2-style/README.md TS-04 (RATIFIED; TS-01/02b/03 SHIPPED — the plaza, facades, and prop ring incl. the Pan Monument exist). READ: the spec + TownScene townsfolk pathing/anchors + the youngster loop (town-T5) + the newsie anchor (gz-h1).
## Scope (scene-only, zero sim)
1. Townsfolk paths FOLLOW the baked trails (waypoint routes along the TS-01 trail descriptor, not straight lines); the youngsters' loop rides the ring road.
2. The hover-Prospector idles near the Pan Monument between errands; Mei works her patch by the tavern porch.
3. Golden-hour ambient dust motes (instanced, ≤2 draw calls, tier-gated OFF on LITE).
4. e2e: actors observed ON trail segments (position sampling vs the descriptor), zero sim writes (determinism hash unchanged), town battery green.
Firewall: TownScene actor pathing/ambient + e2e + artifacts. NO sim, NO layout/props (TS-03 owns), NO new art.
End: READY-FOR-GATES + a 30s scene capture + trail-adherence samples.
