# fix-e2-railcar-read — the train reads as a train (lane-a #2; commit prefix "fix:")
ROLE: gameplay presentation. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner first E2 playtest, 2026-07-13 (~07:00-07:10 screenshots), verbatim: "The train looks like this: [three bandit sprites floating in a row above a rail] it is not a train?"

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. If the stop-reason is an undrained sibling of this same playtest wave, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: the railcar boss (WaveSystem spawnComponentBossWave — components with variantLabel 'Armored Railcar' riding the rail route) presents as ordinary claim-jumper sprites: (a) they borrow bandit art, (b) in the owner's screenshot they FLOAT above the rail in the off-field fog stretch (spawned at the route start beyond the playfield edge, visualY/ground mismatch out there). A boss the fiction calls an armored railcar must read as rolling stock.

## READ-FIRST: src/systems/WaveSystem.ts:728-780 (component spawn along the rail route) · src/entities/pools.ts (how railcar components render; the E2 walk4 variants landed for railtough/steamwrecker/coalthief — the railcar is NOT one of them) · src/game/Game.ts baronRocketCart group (the procedural brass/wood cart precedent — a mesh group is lane-buildable WITHOUT new art) · the rail route tileParams + where the playfield edge is · reviews/wire-e2-enemy-walk4.md (presentation wiring precedent).

## SCOPE:
1. Railcar presentation: each component renders as an ARMORED RAILCAR body (procedural mesh group per the rocket-cart precedent — iron-plated car, wheels on the rail, teal rivet accents; ADR-001 frontier-tech, no gun silhouettes) instead of a bandit sprite. Component damage states may tint/degrade the mesh (bossDegradeSpeedMult exists).
2. Rail seating: components sit ON the rail line (y from the rail/terrain at their position — never floating), and while OUTSIDE the playfield edge they are hidden or fog-faded until they enter (no ghost-train in the void).
3. e2e `e2e/fix-e2-railcar-read.spec.ts`: boot the escort/railcar contract via debug, assert components' render y sits within epsilon of the rail line at 3 sampled route points, off-field components not visible, mesh (not bandit sprite) presentation active, zero console/page errors, both projects. Existing 057 + escort specs unmodified-green.

## Firewall
Touch ONLY: the railcar component PRESENTATION (pools/Game render path), the new spec, artifacts/fix-e2-railcar-read/. NO WaveSystem spawn logic/HP/damage numbers, NO rail route data, NO other enemy presentations, NO CombatSystem.

## Self-check
tsc + build green · new spec + 057 + escort suites green both projects · zero console/page errors · screenshots: railcar on rail in-field, approach shot. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + before/after shots.
