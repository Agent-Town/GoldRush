# fix-e2-sluice-water — sluices return to the Steamworks (lane-a; commit prefix "fix:")
ROLE: gameplay. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner first E2 playtest, 2026-07-13 (~07:00-07:10 screenshots), verbatim: "I was not able to place sluices anymore. Not sure why."

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. If the stop-reason is an undrained sibling of this same playtest wave, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: sluice placement requires water adjacency (src/systems/BuildSystem.ts:1198 `Terrain.isWaterSourceAdjacent(x, z, Balance.sluice.riverPad)`), and on the owner's E2 contract it apparently never passed — locking him out of the core gold economy (his prior E1 run sluiced 1414g) with ZERO feedback about why placement fails.

## READ-FIRST: src/systems/BuildSystem.ts:1190-1210 (the waterSourceAdjacent gate + whatever invalid-placement feedback exists) · src/world/Terrain.ts isWaterSourceAdjacent (how water is encoded per tile) · the E2 contract tile definitions (tileParams for the pressure/steamworks contracts — where is water on those maps?) · e2e/mu-03/pressure specs for the E2 boot pattern.

## SCOPE:
1. PROBE FIRST: boot each E2 contract (`?debug&contract=<id>`), sample `Terrain.isWaterSourceAdjacent` along the visible river/water and at typical base spots; artifacts/fix-e2-sluice-water/probe.json with the map of placeable positions. Convict the root: (a) the E2 tile genuinely has no/unreachable water near the base → fix the TILE water layout (tileParams; keep the tile's character), or (b) the adjacency helper fails on the E2 tile's water encoding → fix the helper for that encoding. Do NOT loosen the river law globally — sluices belong at water (owner-established fiction).
2. FEEDBACK EITHER WAY: an invalid sluice placement must SAY why in-world (the existing invalid-placement affordance + a short line, e.g. "needs the river bank"), so "not sure why" can't happen again.
3. e2e `e2e/fix-e2-sluice-water.spec.ts`: an E2 contract boot places a sluice at a probed-valid bank spot via the debug seam + build path; the invalid case shows the feedback line; E1 claim placement untouched (task-025-adjacent probe); zero console/page errors, both projects.

## Firewall
Touch ONLY: the convicted root (tileParams water for E2 contracts OR Terrain.isWaterSourceAdjacent), the invalid-placement feedback line, the new spec, artifacts/. NO Balance.sluice numbers, NO other buildables, NO economy rates, NO E1 tiles.

## Self-check
tsc + build green · new spec green both projects · task-025 + one e1 suite unmodified-green · zero console/page errors · probe.json + before/after screenshots. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the convicted root + the probe map.
