# Task lane-collision-depenetration: THE NEVER-TRAP LAW (LANE-B, P0, commit prefix "fix:")
You are Codex (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=high
READ FIRST: src/world/LandmarkCollision.ts (yesterday's MQ-3 footprints — blockers in run+town) · hero/actor movement resolve (where blockers stop movement) · the footprint data for e1-baron + the town (sizes vs visuals) · owner evidence 2026-07-20 ×2: "I got stuck in a building somehow and could not move." + (the repro, same day: ) "stuck again after repairing a wall" — REPAIR swaps wreck→solid blocker AT the standing hero: the repair path MUST depenetrate the repairer (and any actor inside) as part of the swap.
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Why (P0: the new solidity can TRAP an agent who ends up inside a footprint — spawn, knockback, doorway edge, or an over-wide footprint — and there is no escape but reload)
## Scope
1. DEPENETRATION: any agent whose position is INSIDE a blocker gets ejected — slide toward the nearest free edge over a few ticks (deterministic, no teleport pops); movement input from inside always finds freedom.
2. AUDIT the footprint data vs visuals on e1-baron + the town (the conservative-smaller-than-visual rule — name any violators; doorways must stay generous).
3. THE INVARIANT SPEC e2e/never-trap.spec.ts (both projects): REPAIR a wall while standing on its line (the owner repro — must free instantly) + teleport the hero INTO three blocker centers (run landmark, town building, the pan monument) → movement input frees within N ticks, zero console; enemies likewise never wedge (spawn a pack onto a footprint, assert none stuck after M ticks).
## Firewall: the collision resolve + footprint data corrections + your spec. NO collision removal, NO speed/movement feel changes.
END: READY-FOR-GATES + the audit table + the ejection mechanism in one sentence.
