# ADR-004 — HD-2D art direction: painted cast over dimensional buildings
Status: RULED 2026-07-12 (owner verbatim: "Ok, compromise - lets do it like this for now." — revisitable, standing until revisited).

## Decision
Characters remain 2D painted sprites (the turnaround → Seedance → walk8 pipeline). Buildings graduate to authored 3D (Blender GLBs baked FROM the paintings), starting with the tavern pilot (sol/town-blender-v3, merged). Levels stay 3D geometry + terrain treatments; props/buildables may graduate per the TOWN-3D ladder.

## Evidence
- Hero-3D proof (assets/pilots/hero-3d/, reviews/sol-3d-b-findings.md): high-res refs restored the face but side-view projection smear + weightless gait are medium-inherent — paintings are view-specific; curved deforming bodies break them.
- Tavern full-wrap (reviews/sol-3d-a-findings.md): NEW B passes neutral review, tonal match +5% vs painted facades, p95 −1%; the locked-camera townsfolk crop shows 2D cast reading correctly over 3D buildings.

## Consequences
TOWN-3D program spec follows (recipe at Ultra once per class, ladder at high; LITE tier keeps painted facades forever). Character 3D retired with honors; open owner-facing question deferred: 2D actor grounding/shadows against 3D buildings (the "bartender grounding" finding).
