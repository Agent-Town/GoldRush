# Task c7-standing-order-replay-rescoped: the browser replays a standing-order tape — three seams, measured premise (lane-b, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; **the c2 STOP record — `git show 796e0d15d` and the lane's STOP row + F-2165-1 row in tasks/BACKLOG.md (the measured premise this master is re-scoped FROM; your predecessor removed its partial patch and claimed no hash rather than reporting a false pass — extend that honesty)**; the F-ASSAY-E2E-6 row (s2163) with its verified hand-forward; src/game/Game.ts — `installAgentDoor` (installs the browser StandingOrdersExecutor but NEVER calls `bindStandingUpgradePicker`; the only binding lives in HeadlessContractSim — the stop-measured root cause), the solo upgrade-draft deadline (s2163 re-based it to `:9171`/`:9172`, two-branch read at `:9178`/`:9179` — coordinates drift, cite the code), the `tickStandingOrders` call inside the `simActive` branch; src/sim/HeadlessContractSim.ts — `bindStandingUpgradePicker` + `syncUpgradeOfferClock` (the semantics to mirror).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff — c2's runner commit merged at `796e0d15d` as a ledger-only stop), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — expected, list, proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the c2 stop, verbatim from its merge record)
"The two-seam cure was measured INSUFFICIENT in a real browser proof… Game.installAgentDoor installs the browser StandingOrdersExecutor but never calls bindStandingUpgradePicker — the only binding is in HeadlessContractSim — so StandingOrdersExecutor.execute reaches a null pickUpgrade handler and fails the accepted order as unavailable. Residual cure needs a re-authored scope." This is that scope: THREE seams, the measured missing one first. Until it lands, a human riding with standing orders cannot get a verified standing — a launch-quality gap with a bounty coming.

## Scope
1. **The binding (the measured root cause)**: `installAgentDoor` binds the browser's upgrade picker exactly as HeadlessContractSim binds its own — the accepted PICK_UPGRADE order must reach a live handler. Mirror the sim's semantics; do not invent a browser-only variant.
2. **The deadline seam**: sim-clock the solo upgrade-draft deadline via the EXISTING two-branch read (extend the tick-deadline branch to the replay/standing-order case) — never a naive wall→sim swap, which would freeze ordinary human solo drafts (the s2163 hand-forward's hazard, still binding).
3. **The executor seam**: `tickStandingOrders` runs while a draft is open (the minimal lawful lift — during `levelup` for the replay/standing-order path).
4. **The gating proof**: the browser roundtrip e2e — record a short run WITH standing orders including a PICK_UPGRADE through a draft, replay via the seam, assert the recorded eventLogHash reproduces. This spec is the slice's reason to exist; if it cannot go green, the slice STOPS with the residual divergence named precisely (your predecessor's standard).
5. Floors/pins byte-unmoved (`node scripts/null-floor-anchors.mjs --check` + the gr-sim pin battery) — nothing here may move headless outcomes.

## Firewall
Touch ONLY: src/game/Game.ts (the three seams), the new e2e, BACKLOG row. NO changes to: HeadlessContractSim (it is the reference, not the patient — if mirroring exposes a defect THERE, stop and report), GameState's flag law unless measurement proves it wrong (justify in the report), tape format, scripts/**, existing e2e assertions.

## Self-check (evidence, not vibes)
tsc + `npm run build` green; the new roundtrip e2e green both projects; run-suspend + tape-02-lantern-show + m2-01 + task-025 unmodified-green both projects; floors `--check` clean; zero console/page errors in a plain boot. End: READY-FOR-GATES + report: the roundtrip hash proof, which of the three seams was each measured necessary (revert each singly if cheap — the stop proved two alone insufficient; three-minus-one evidence completes the story), live-solo feel unchanged at 1x.

## No-op / honesty guard
Identical to your predecessor's, which it met: no partial patch may survive a failed roundtrip — reproduce the hash or remove the patch and report the divergence. Never claim a pass the spec did not print.
