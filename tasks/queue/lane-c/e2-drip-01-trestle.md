# e2-drip-01-trestle — THE TRESTLE: E2's second contract (lane-c #2; commit prefix "feat:")
ROLE: content + tile. WORKDIR: lane-c (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner: "how do I get to play the other levels of E2? ... I would love to keep pushing forward." E2 currently ships ONE contract (e2-hill-mine).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: specs/epoch-saga/BUILD-PLAN.md E2 row: "THEN drip: the Trestle, the Pressure Garden, the Incline." The Trestle is drip #1. HARD LAW (Vocabulary Stretch guard): this contract uses ONLY SHIPPED mechanics — rail + ore-cart escort + pressure/boiler + E2 enemy trio + railcar boss. NO new mechanics, NO new art dependencies (placeholder-first law covers gaps; the ter-rail-elements trestle-segment cell EXISTS, processed).

## READ-FIRST: specs/epoch-saga/e2-steamworks-bundle.md §B (the Hill Mine spec — THE template; note the trestle ford in its diagram: the Trestle contract PROMOTES that geography idea to the centerpiece) · assets/contracts/epoch-2-steamworks/contracts.json + manifest.json (data shapes; unlock/caps patterns from epoch-1 files) · the E1 contract variety for mode patterns (escort/defend) · how e2-hill-mine's tileParams wire rails + water · reviews of the escort + pressure slices.

## SCOPE:
1. Contract data: `e2-trestle` joins epoch-2-steamworks/contracts.json — identity: a rail crossing over a gorge/river; the fantasy: hold the trestle line while ore carts cross. Mode: escort-heavy (carts on the shipped rail follower) + defend anchors; pressure available (boiler sites near the approaches). Unlock: after an e2-hill-mine win (mirror how E1 gated later contracts; if no unlock channel exists in the E2 manifest shape, gate board-side the way E1 does).
2. Tile: tileParams with the trestle as centerpiece — rail spans the map crossing water/gorge; sluice-legal river bank EXISTS near the base (learn from F-e2-sluice: the owner must be able to sluice; probe `Terrain.isWaterSourceAdjacent` at authored bank spots and record the coordinates in the report).
3. Board: the contract appears on the town board with plate fallback (no dedicated plate yet — use the family/placeholder pattern; art rides a later batch).
4. e2e `e2e/e2-trestle.spec.ts`: contract boots from the board (post-hill-mine-win seed), rails + carts present, a sluice places at the probed bank spot, wave flow reaches the boss window, zero console/page errors, both projects. Hill-mine spec unmodified-green.

## Firewall
Touch ONLY: assets/contracts/epoch-2-steamworks/*.json, the tileParams for the new contract, board unlock wiring (minimal, E1-pattern), the new spec, artifacts/e2-trestle/. NO engine/mechanic changes, NO Balance globals, NO new art files, NO E1/E3 data.

## Self-check
tsc + build green · new spec green both projects · e2-hill-mine + escort suites unmodified-green · zero console/page errors · a board screenshot + in-run trestle screenshot. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the sluice-bank probe coordinates + unlock rule used.
