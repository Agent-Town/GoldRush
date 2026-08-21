> ⛔ SHIPPED — DO NOT QUEUE (attended-agent build record; merged in the 2026-08-20 attended drain window — proof: goal leaf `a6-far-side-crossing` + the drain commit on main)

# ⛔ EXECUTED — ATTENDED-AGENT BUILD RECORD, DO NOT QUEUE (ledger record, not a runnable master)

# Task a6-far-side-crossing: the crossing and the probe — e8-far-side door-ready (door-completion sheet item A6)

Executed 2026-08-20 by an attended-dispatched Opus agent (branch `worktree-agent-a6-far-side` @ `38ac358cf`), authorized by `specs/agent-play/door-completion-sheet.md` (RATIFIED — A6) — drained to main by the attended session.

## What shipped
- `src/systems/ProbeRecovery.ts` (A4 socket shape: private ctor, create() off the contract, one-way latch, refusal counters; armed only when trigger AND ≥1 crater are declared — F-1471-1 guard, all four combinations pinned). Verb `CONTEXT_ACTION action:'recover'` (targetless, like `fund`).
- A4's signal-suppression consumer generalized with ZERO new lines in `SignalSuppression.ts` — far-side's declared block gates drones+playbooks off, relayChains correctly not suppressed.
- The cross-era payoff: probe recovery plays the E7 jack-board's banked wrong-number fragment via a shared `E7_WRONG_NUMBER_FRAGMENT` export (single source, no drift). One-time `probe_recovered` replay event (snake_case, log schema conformant; the contract's kebab trigger kept separate as `PROBE_RECOVERED_TRIGGER`).
- Latch: `autoSecureWaveForRun` on both engines — surviving with the probe buried leaves the run unsecurable (canyon-connect pattern).
- **Attended rider (veto window open):** heroStart stake `far-side-landing-stake` (0,−36) — the contract's own briefing ("Cross from the landing yard…") made literal; without it the empty stakeMarkers fallback stranded the hero 26.0wu from buildable ground vs turret range 16 (proven by control: gold beside the hero still died wave 3). Reverse with one word.
- 4 harvestAnchors; seeds; secures ×2: seed 01 w20 `fnv1a32:a3d5b816` (915 kills), seed 02 `fnv1a32:141e11f6` (918); idle floors w2 unsecured `3fe83eca`/`94eac90f` — an idle run can never recover, so it can never secure.
- Firewall-adjacent touches, compelled and flagged: `StandingOrders.ts` (verb grammar), `LockstepClient.ts` (tape act — replayed runs must fire the recover action or they'd fail their own objective).

## Findings carried
F-E8FS-1 dependency row still `missing` in ContractFamilies.ts (outside firewall — truth-pass debt, same as A4's) · F-E8FS-2 far-side's unlock chain whole and reachable (good news, recorded) · F-E8FS-3 the engine DOES report `out_of_zone` in the order log (the prover just wasn't reading `now.orders`) — no engine bug exists; recorded so nobody files one.
