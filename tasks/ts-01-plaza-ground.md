# Task ts-01-plaza-ground: the town becomes a PLAZA — circular layout, painted sand, baked trails (lane-c; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=medium
FROM `specs/town-v2-style/README.md` TS-01 (RATIFIED 2026-07-10 incl. the ARRIVAL CANON; reference `assets/reference/agenttown-town-style.jpeg`).
You are Codex in worktrees/lane-c. Pre-flight per LANE-SAFETY. READ FIRST: the spec (all of it — the reference description, the slices, the era law), `src/town/TownScene.ts` (current grid layout, building positions, walk targets, townsfolk anchors, the 072 stamp-mill surface just merged), the tile/ground rendering the town uses today.

## Scope (TS-01 ONLY — ground + layout; facades/props are TS-02/03)
1. **Circular plaza layout**: buildings move to ring positions around a center point (the Pan Monument's future spot — leave a small clear circle); ring positions data-driven (a layout descriptor, editable later). Walk targets, approach barks, interaction hotspots, and the 072 mill surface all re-anchor correctly.
2. **Painted ground**: replace the grid mat with a sand-toned painted base + BAKED wagon-rut trails radiating from the center to each building and to the town gate (texture-layer treatment consistent with the game's art DNA; reuse/extend the terrain texture machinery, no new tech).
3. **Growth staging preserved**: buildings still arrive per town growth; EMPTY ring slots render as staked-out plots (survey pegs + string — simple geometry, placeholder-first).
4. Desktop + 390px both compose well (the ring fits the mobile viewport when the camera frames the plaza).

## Firewall
Touch ONLY: town scene layout/ground rendering + the layout descriptor + its e2e + artifacts. **NO sim, NO run gameplay, NO building interiors/surfaces' behavior (only their positions), NO facade art (TS-02), NO props (TS-03), NO camera changes (ratified: unchanged).**

## Self-check
tsc/build · town battery (t1-t6) green + 072 spec green (mill surface re-anchored) · walk-to-every-surface e2e · zero console · before/after wide screenshots desktop + 390px → `artifacts/ts-01/`.
End: **READY-FOR-GATES** + the before/after shots + the ring-layout descriptor summary.
