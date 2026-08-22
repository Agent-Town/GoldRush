# Task c2-browser-standing-order-replay: a human who rides with standing orders gets a verifiable tape (lane-b, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; **the F-ASSAY-E2E-6 row at the top of tasks/BACKLOG.md (s2163 — it carries a VERIFIED hand-forward that SUPERSEDES the review's cure sketch; read it whole)**; reviews/assay-door-cure.md §"What remains for true species-blind verification"; scripts/assay-replay.mjs (the browser replay path); src/game/Game.ts — the solo upgrade-draft deadline (review cited `:9158`; re-verified s2163 at `:9171`/`:9172`, and the existing TWO-BRANCH deadline read at `:9178` (tick-deadline when multiplayer live) / `:9179` (`performance.now()` otherwise) — cite the code, the coordinates drift) + the `tickStandingOrders` call inside the `simActive` branch only (region `:2773`→`:2960`); src/game/GameState.ts (simActive false during `levelup`); src/sim/HeadlessContractSim.syncUpgradeOfferClock (the sim-clocked semantics to mirror).

Pre-flight (LANE-SAFETY): standard safe-dupe template + F-1407-1 churn exception; `npm install`; build green. NOTE lane/b's history: verify `git log lane/b --not main` is empty or safe-dupe before reset (the b4 lineage all merged).

## Why (measured, not asserted)
A browser recording made by a person using standing orders cannot replay: (a) the solo upgrade-draft deadline runs on WALL clock while replay compresses sim time — the control froze at timeAlive 23.87 and played ~8,000 ticks against a stopped clock; (b) `tickStandingOrders` never runs during `levelup` (simActive false), so a recorded PICK_UPGRADE cannot execute. Species-blind verification requires the browser replay to honor order-riding humans.

## Scope
1. Sim-clock the solo upgrade-draft deadline — **via the BACKLOG hand-forward's shape, not a naive swap**: during a `levelup` freeze the sim clock is STOPPED, so a naively sim-clocked deadline would never expire the draft in ordinary HUMAN solo play either. The two-branch mechanism is already in the file (tick-deadline when multiplayer is live at `:9178`, `performance.now()` at `:9179`) — EXTEND the tick branch to cover the replay/standing-order case rather than inventing a mechanism. Verify live human solo feel is unchanged; if it would change perceptibly, gate on the replay seam and SAY SO.
2. Tick the standing-order executor while a draft is open (the minimal lift: run tickStandingOrders in the levelup branch too, or hoist it above the simActive gate for the replay path — read which is true to the engine's own law and document why).
3. The gating proof: a browser agent-tape roundtrip e2e — record a short run in the browser WITH standing orders (including a PICK_UPGRADE through the draft), replay via the seam, assert the recorded eventLogHash reproduces.
4. Floors/pins byte-unmoved (nothing here touches headless outcomes — prove with one idle floor re-run + the gr-sim pin battery).

## Firewall
Touch ONLY: Game.ts (the two seams), GameState.ts if the flag law itself is wrong (justify), the replay seam if needed, one new e2e, BACKLOG row. NO HeadlessContractSim changes, no balance, no tape format.

## Self-check
tsc + build green; the new roundtrip e2e both projects; run-suspend + tape-02-lantern-show + m2-01 unmodified-green; node-guards (contention → solo, say so); floors --check clean. End: READY-FOR-GATES + report: which seam law was wrong and the cure, the roundtrip hash proof, gate counts.

## No-op / honesty guard
If the roundtrip cannot reproduce the hash after both cures, STOP and name the residual divergence precisely — no partial fix that verifies wrong hashes.
