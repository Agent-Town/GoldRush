# Task lane-panorama-band-framing: panorama band framing (LANE-B, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · reviews/playtest-2026-07-18-night.md (the owner's finding this task exists for — his words are the acceptance test) · src/world/Terrain3dClaimPilot.ts (panorama ring/plate mount + skirt/edge fade) · the run + town cameras (Game camera, TownScene camera) · the PANORAMA LAW (SOL-3D-D-QUEUE: backdrop beyond the playfield edge, render-only)

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (OWNER PLAYTEST, 2026-07-18 night, the 3D Claim)
P1 — TWO reads of one bug class: [201/205] 'on load I had directly this phaenomenon… there is something in the upper part of the screen' (a giant dark band slicing the upper screen on run boot AND town return) and [204] 'the map should continue similar to the playing field. This looks really bad' (the sculpt ends in a flat pale wedge against the world). The panorama/plate backdrop and the terrain edge treatment fail at real camera angles.

## Scope
1. THE BAND: find why the backdrop/panorama (or terrain skirt) crosses the camera frustum as a dark stripe on boot/town/run cameras; fix mount height/scale/fog so the horizon reads as HORIZON at every shipped camera (boot included — probe the exact boot frame).
2. THE EDGE [204]: the sculpted tile's rim must continue the world — extend a ground apron/skirt in the terrain palette blending into the panorama base (parchment-fade law respected, no hard wedge), on the-claim + two county maps as proof.
3. Spec e2e/panorama-framing.spec.ts: boot-frame screenshot assertions (no band: sample upper-screen pixel rows for the stripe signature), town return clean, zero console. Screenshots before/after into reviews/shots-panorama/.
## Firewall: TOUCH-ONLY the panorama/skirt mounting + camera-facing framing params + your spec. NO camera gameplay changes, NO terrain mesh edits. THE SIM STAYS PLANAR (CLAUDE.md §4.6): all gameplay positions/collision/picking live on the flat plane; the 3D mesh is render-only; visual height flows one way (visualY).
## Self-check: tsc+build · your spec + the named adjacents green both projects · zero console · screenshots where visual.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table.
