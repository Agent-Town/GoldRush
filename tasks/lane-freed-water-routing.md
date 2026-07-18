# Task lane-freed-water-routing: freed water routing (LANE-C, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · reviews/playtest-2026-07-18-night.md (the owner's finding this task exists for — his words are the acceptance test) · the freed-legibility slice (yesterday: edge-routing) · src/world/Terrain.ts water queries · src/entities/Enemy.ts freed pathing

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (OWNER PLAYTEST, 2026-07-18 night, the 3D Claim)
P1 — '[freed walkers] are running into the river somehow after being freed at certain places.' The freed edge-routing picks the nearest map edge even when the straight line crosses water — freed walkers wade the river. Canon and comedy both fail.

## Scope
1. Freed edge-target selection avoids water: pick the nearest edge whose path stays on LAND (waypoint along the bank when needed — reuse existing pathing grammar; freed still never path through the player).
2. Spec e2e/freed-water-routing.spec.ts: free a walker on the far bank cluster of the-claim → its path never enters a water cell; freed-legibility suite stays green.
## Firewall: TOUCH-ONLY the freed routing target logic + your spec. NO active-enemy pathing changes. THE SIM STAYS PLANAR (CLAUDE.md §4.6): all gameplay positions/collision/picking live on the flat plane; the 3D mesh is render-only; visual height flows one way (visualY).
## Self-check: tsc+build · your spec + the named adjacents green both projects · zero console · screenshots where visual.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table.
