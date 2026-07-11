# Sol findings — lockstep actions implementation

Status: **PARKED WITH EVIDENCE** on `sol/lockstep-actions` (cut from the merged snapshot tip `4ef6bea`, because snapshot had not reached `origin/main`). Do not tail `READY-FOR-GATES` until the two owner/orchestrator rulings and the listener-backed gates below are resolved.

## F-SOL-ACTION-001 — the late-join seal conflicts with the ratified reconnect grace

- Severity: P1 / ruling required
- Evidence: `specs/multiplayer/README.md:28` ratifies a 60-second hold-and-rejoin grace. `functions/api/_multiplayer.ts:235-246` now seals the room after tick 0 because admitting an ordinary fresh client at tick 0 after the relay has advanced is nondeterministic.
- Why this is not a safe local choice: a real reconnect needs stable player identity, an unguessable resume credential, a held roster slot, and replay/bootstrap from an authority snapshot plus every authoritative bundle after that snapshot. Simply restoring the old “accept a new p3” behavior gives the reconnecting client `nextSimTick = 0`; its first input is rejected against the relay's advanced tick, so that was not a working grace implementation either.
- Ruling requested: authorize the reconnect-token + 60-second held-slot/replay slice here, or explicitly defer reconnect and accept the honest `ride_started` rejection for v2. I did not silently supersede the ratified law.

## F-SOL-ACTION-002 — shared setup ownership and profile persistence are underspecified

- Severity: P1 / ruling required
- Evidence: `src/mp/RideTogether.ts:120-149` compares the guest's local meta/research/difficulty/seed byte-for-byte with the host setup. Normal family members with different progression therefore cannot join. Separately, `src/game/Game.ts:1866-1871` spreads the staged ride config and then replaces its setup with the current local setup, so even an inspected host setup is not applied to construction-time RNG, Balance, defenses, or research.
- Constraint: applying the host's meta/research by writing it into guest storage would violate profile ownership. Applying it ephemerally also needs an explicit end-of-run payout rule so neither host nor guest progression is overwritten or silently discarded.
- Ruling requested: choose either (A) same-progression-only rooms, explicitly productized, or (B) host-owned ephemeral run setup with per-player payout reconciliation. The family/friends spec strongly suggests B, but that is a profile-ownership decision, not an implementation guess.

## F-SOL-ACTION-003 — weapon choice is still shared, not per rider

- Severity: P1 product gap; outside the smallest action-stream slice
- Evidence: `src/game/Game.ts` has one `activeWeapon` and one shared pair of rig/blast shooter enable predicates. The existing MP-03 gate intentionally expects Bob's Q to change the shared arsenal on both clients. Two riders toggling in one tick therefore cancel each other in stable roster order.
- Impact: movement, building placement, upgrades, economy, and the claim are independently controllable/shared as briefed, but weapon loadout is not independently owned per hero. A per-actor arsenal requires shooter state and suspend/hash schema changes and should be separately ruled/sliced.

## F-SOL-ACTION-004 — listener-backed gates cannot run in this managed sandbox

- Severity: gate blocker, not a product finding
- Evidence: `npm run test:mp` exits before the test body with `listen EPERM: operation not permitted 127.0.0.1`. The same sandbox prohibition prevents the relay + two-browser Playwright run.
- Required orchestrator gates:
  1. `npm run test:mp`
  2. isolated `e2e/mp-02-lockstep.spec.ts` (desktop, serial), including the consecutive-pulse FIFO proof and both-riders build/upgrade proof
  3. the sim-semantics regression battery named by the fixed-step brief
  4. a solo flag-off comparison/gate

## Implemented evidence on the parked branch

- Consecutive one-sample pulses are queued without a second edge detector; the new test proves two `weapon_toggle` pulses survive a full input-delay window exactly once at ticks 0 and 4.
- Semantic, quantized `place_build` commands carry buildable ID, position, and rotation. Every rider's action FIFO executes in stable roster order; local build-menu/ghost presentation is no longer replayed into other riders' UI.
- HUD, upgrades, death/research, secured-run, ceremony, context, pause, agent-consent, and debug simulation actions route through the tick stream. Duplicate research terminal actions are idempotent; run transitions defer until after the tick hash and discard later same-tick actions.
- The ledger remains local presentation in multiplayer and no longer pauses only one simulation.
- Tick bundles carry their authoritative roster; fresh joins are sealed after tick 0; room inspection no longer transiently joins the roster; setup is validated before roster mutation; foreign-contract snapshots are rejected.
- `npm run build`: PASS (`tsc && vite build`, 561 modules)
- `npm exec -- tsc --noEmit`: PASS
- `git diff --check`: PASS
- `node --check scripts/test-multiplayer.mjs`: PASS
- `npm exec -- playwright test e2e/mp-02-lockstep.spec.ts --list`: PASS, 16 tests discovered
- `npm run test:mp`: BLOCKED before test body by sandbox `listen EPERM`

## Non-blocking documentation debt

`docs/api-multiplayer.md` still describes protocol v1. Before v2 is released, it must document setup on create/join, the non-member inspect endpoint, authoritative roster on tick bundles, `effectiveTick`, action arrays, and the late-join/reconnect ruling. Updating it before the two rulings would encode an unstable contract.
