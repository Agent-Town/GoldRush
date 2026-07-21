# Task lane-friendly-walls: YOUR OWN WALLS KNOW YOU (LANE-D, commit prefix "fix:")

You are Codex, implementer for Gold Rush (worktrees/lane-d).
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: src/game/Game.ts:2394+2503 (the hero/actor blocker composition — palisadeBlockers were swept into the HERO's set by the never-trap re-land; they historically served ENEMY pathing) · src/systems/BuildSystem.ts palisadeBlockers · the never-trap spec (e2e/never-trap.spec.ts — must stay green) · owner evidence 2026-07-21, verbatim: "I cannot walk through the palisades anymore - is that on purpose? It feels odd as that worked yesterday."

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green.

## Why (THE FRIENDLY-WALLS LAW, owner-derived: player-built structures never block their OWN side — walls are for the Fever, not the family. Yesterday's pass-through was the intended feel; the solidity wave over-swept.)
## Scope
1. HERO + the Prospector agent + FREED walkers exclude `palisadeBlockers` (and any player-buildable footprints) from their movement-blocker set — landmarks, town buildings, and tile blockers STAY solid (never-trap depenetration untouched for those).
2. ENEMIES unchanged: palisades still block/route them (their whole purpose); verify the Claw/wrecker pathing suites see no diff.
3. Audit the two composition sites (:2394/:2503) into ONE named helper (heroBlockers() vs enemyBlockers()) so the sets can never silently diverge again.
4. Spec e2e/friendly-walls.spec.ts (both projects): hero walks THROUGH an own palisade line (the owner's exact feel restored) · an enemy pack is still blocked/routed by the same line · never-trap suite green (landmarks still solid + depenetration works) · mp determinism unaffected (state-hash run) · zero console.
## Firewall: the blocker composition + helper + spec. NO palisade HP/enemy pathing changes, NO collision-channel changes for landmarks/town.
END: READY-FOR-GATES + the two-set definition as shipped.
