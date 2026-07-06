# Task 041: turret overwatch — turrets shoot over palisades (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; src/systems/BuildSystem.ts registerTurretShooter + hasLineOfSight (line ~1195) + segmentIntersectsBlocker; src/systems/CombatSystem.ts projectile kinds ('bolt' | 'lob'). Pre-flight: zero staged/modified TRACKED files (`??` untracked host debris expected — list briefly, proceed).

## Why (owner-confirmed by experiment, live play 2026-07-06 evening)
Robin: "the new signal towers can't shoot over palisades. I put one outside and it shot in the direction of where there was no palisade." Root cause verified: `registerTurretShooter` sets `canTarget: hasLineOfSight(...)`, and `hasLineOfSight` rejects any target whose firing line crosses a `palisadeBlocker`. Turrets — uniquely (beacons have no canTarget) — refuse to ACQUIRE targets behind friendly walls. Design ruling: **your own fortifications never blind your own guns** — turret-behind-wall is the genre's core fortress pattern and must be the BEST placement, not a dead one.

## Scope
1. **Targeting**: turrets acquire targets regardless of intervening friendly palisades. Verify `hasLineOfSight`'s call sites — if the turret handle is its only consumer, REPURPOSE it (rename e.g. `firingLineCrossesPalisade`) instead of deleting; if anything else consumes it, leave that consumer untouched.
2. **Visual honesty — arc over the wall**: when the firing line DOES cross a palisade blocker, spawn that shot as the existing `'lob'` projectile kind (arc) instead of flat `'bolt'`, so the bolt visibly rainbows over the wall it clears. Flat bolts stay for clear lines. Tune the lob so flight time ≈ flat-bolt time at equal range (damage timing feel unchanged; no damage/range/rate changes anywhere).
3. **Beacons unchanged** (they already fire freely; do not add LOS anywhere new).

## Firewall
Touch ONLY: BuildSystem turret shooter handle + the LOS helper, CombatSystem spawn-kind plumbing (additive param if needed), Balance ADDITIVE (lob arc knob). NO changes to: damage math, fire rates, ranges, enemy behavior, palisade collision/routing (walls still block ENEMIES — only the turret's aim changes), existing e2e assertions.

## Self-check (the owner's exact scenario is the spec)
tsc/build green. NEW e2e `e2e/task-041-turret-overwatch.spec.ts`: (a) place palisade line at the ford, turret BEHIND it, spawn enemies on the far side within range 16 → turret acquires + kills (poll killsByOwner.turrets > 0); (b) shot crossing a wall reports kind 'lob' via diagnostics, clear-line shot stays 'bolt'; (c) beacon behavior byte-identical (its m2-01 assertions untouched). Full m2-01 12/12 both projects; task-025 + m1-01 unmodified green; zero console/page errors. End: READY-FOR-GATES + files + results.
