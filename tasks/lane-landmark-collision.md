# Task lane-landmark-collision: landmark collision (LANE-A, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · reviews/playtest-2026-07-18-night.md (the owner's finding this task exists for — his words are the acceptance test) · the mount records (terrain contracts: position/rotation/scale per landmark) · src/game collision surfaces (how buildings block movement today — the legal channel) · the craftbook law (render bodies never acquire authority BY IMPLICATION — this task grants it EXPLICITLY, data-driven)

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (OWNER PLAYTEST, 2026-07-18 night, the 3D Claim)
P2 — 'I can walk through the buildings that are there as landmarks.' Landmarks are render-only by law; the owner's play expectation makes solidity a REQUIREMENT. Solidity must come from DATA, not from meshes.

## Scope
1. Pack contracts gain an optional per-asset FOOTPRINT (rect or radius, sim units, authored defaults derived from body bounds at build time — a script pass over the 29 packs generates proposals; conservative: smaller than visual).
2. The sim consumes footprints as static blockers through the EXISTING collision channel (hero + enemies path around; deterministic; planar).
3. Spec e2e/landmark-collision.spec.ts: the hero cannot walk through a mounted landmark on the-claim + one county map; enemies path around; a mount WITHOUT footprint stays walkable (backwards-safe).
4. Report the generated footprint table for owner review (corrections are one-line data edits).
5. THE TOWN TOO (owner 2026-07-19, shots 208/209: "in town all the objects are walk through - I think that should not be the case"): the same data-footprint mechanism applies to TownScene — the modeled buildings + plaza props block the hero (interactions/doors unaffected; footprints conservative so doorways stay generous). Spec case: hero cannot walk through the chapel or the pan monument.
6. THE PAN MONUMENT DOUBLE-RENDER (owner, shot 208: "are there two things overlapping, an old and a new one?"): under default-3D the LEGACY pan primitive still renders beneath Sol's GLB monument (the exact disease TownScene:513's prop-ring guard was built for — the monument path missed the guard). Suppress the legacy primitive when the 3D prop renders; spec asserts ONE pan monument (no overlapping legacy geometry).
## Firewall: TOUCH-ONLY the footprint data pass, the collision-channel consumer, your spec. NO physics engine, NO per-mesh colliders. THE SIM STAYS PLANAR (CLAUDE.md §4.6): all gameplay positions/collision/picking live on the flat plane; the 3D mesh is render-only; visual height flows one way (visualY).
## Self-check: tsc+build · your spec + the named adjacents green both projects · zero console · screenshots where visual.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table.
