# Sol findings — simulation and lifecycle

- **Branch:** `sol/repository-audit-findings`
- **Base:** `7802ed6`
- **State:** UNTRIAGED — no implementation authorized.
- **Scope:** main loop, combat cadence, overlays, death boundary, and pause ownership.

## Summary

| Finding | Severity | Backlog overlap | Suggested future branch if accepted |
|---|---|---|---|
| `F-SOL-SIM-001` Fixed-step law is false | P0 | Determinism law exists; no corrective found | `sol/fixed-step-simulation` |
| `F-SOL-SIM-002` First frame can produce negative sim time | P2 | No corrective found | `sol/nonnegative-first-frame` |
| `F-SOL-SIM-003` Briefing/build UI leaves combat running | P1 | POLISH-04 covers hints, not modal time ownership | `sol/modal-sim-ownership` |
| `F-SOL-SIM-004` Death is not a tick transaction boundary | P1 | No corrective found | `sol/death-tick-boundary` |
| `F-SOL-SIM-005` Closing Ledger can cancel an existing pause | P2 | Encyclopedia shipped; no matching corrective found | `sol/ledger-pause-ownership` |

## F-SOL-SIM-001 — [P0] Solo simulation violates the fixed-step law

**Evidence**

- `specs/m0-skeleton/README.md:52-54` requires a fixed 60 Hz accumulator with a delta clamp.
- `src/core/Loop.ts:11-29` records `performance.now()`, receives a requestAnimationFrame timestamp, clamps only the maximum delta, and forwards that variable delta directly to `Game.update`.
- `src/game/Game.ts:1282-1298` only substitutes a fixed delta when a multiplayer bundle exists.
- `src/game/Game.ts:1359-1420` feeds the variable solo delta through actors, waves, buildings, enemies, harvest, combat, pickups, and progression.
- `src/mp/LockstepClient.ts:80-88` separately establishes 30 Hz multiplayer ticks, so solo and multiplayer do not share one cadence.
- `src/systems/CombatSystem.ts:351-373` emits at most one volley per rendered update and discards overdue cooldown debt by resetting a negative timer to a full cooldown.
- `src/diagnostics/DeterminismHarness.ts:38-69` and `e2e/perf-04-determinism.spec.ts:68-81` compare two deliberately fixed 30 Hz harness runs; they do not test equivalent outcomes across render schedules.

**Impact**

Movement integration, collisions, targeting cadence, and damage-per-second can vary with frame schedule. Multiplayer determinism may remain internally fixed while producing different semantics from solo balance.

**Recommendation for triage**

Accept as one architectural concern: create one typed fixed-step simulation entry point used by solo, multiplayer, and tests; put the accumulator at the loop boundary; test one seed/input trace under multiple render-frame schedules. Decide 30 versus 60 Hz explicitly rather than preserving both accidentally.

## F-SOL-SIM-002 — [P2] The first requestAnimationFrame can make the HUD time negative

**Evidence**

- `src/core/Loop.ts:14-25` initializes with `performance.now()` but subtracts it from the browser-provided frame timestamp and only upper-clamps the result.
- `src/ui/Hud.ts:370-373` floors negative seconds and the negative remainder independently.
- A fresh production-preview run displayed `-1:-1` before settling to a nonnegative clock.

**Impact**

Visible startup glitch and proof that a negative delta can enter the entire simulation path.

**Recommendation for triage**

Clamp frame delta to `[0, maxDelta]` and add a startup invariant asserting `timeAlive >= 0` from frame zero.

## F-SOL-SIM-003 — [P1] Contract briefing and build UI do not own simulation time

**Evidence**

- `src/game/Game.ts:1137-1150` transitions to `playing`, installs the run manager, installs multiplayer, spawns stress enemies, and only then shows the contract briefing.
- `src/game/Game.ts:1320-1359` toggles the build menu but continues into the normal `simActive` update path.
- In a 390×844 production-preview run, opening Build at zero gold covered most of the battlefield while enemies continued attacking. The player died at wave 1, `00:49`, with the menu still open.
- `tasks/lane-c-polish-04-first-run-hints.md` addresses instructional hints; it does not define pause/slow-time ownership for the briefing or touch build surface.

**Impact**

The first-time and mobile player is punished for reading the UI. The build surface blocks the information/action needed to survive while simulation remains fully live.

**Recommendation for triage**

Treat time ownership and teaching as separate concerns. This finding is only the former: first-run briefing should freeze or explicitly delay combat; touch build mode should pause, slow time, or become compact enough to preserve threat visibility. Do not fold the full onboarding design into this branch.

## F-SOL-SIM-004 — [P1] Death is recorded before the current tick stops mutating state

**Evidence**

- `src/systems/CombatSystem.ts:247-265` can synchronously damage the hero and emit the damage/death path during enemy update.
- `src/game/Game.ts:1386-1419` continues after enemy contact through ledger discovery, harvest, combat, Prospector actions, gold pickups, progression, and VFX.
- `src/game/Game.ts:3731-3747` transitions to `dead` and emits the final run summary immediately, but the caller does not re-check state before the remaining same-frame systems run.

**Impact**

Postmortem gold, XP, kills, or pickups may occur after the run summary and telemetry were captured, leaving visible state and recorded results inconsistent.

**Recommendation for triage**

Create a single tick-end outcome boundary: queue death during resolution, stop further gameplay mutations, then finalize summary/telemetry once at the end of the tick.

## F-SOL-SIM-005 — [P2] Claim Ledger forgets whether the run was already paused

**Evidence**

- `src/game/Game.ts:1185-1199` stores only `state.current === 'playing'`, forces pause, clears `playerPauseActive`, and unpauses on close whenever the prior state name was `playing`.
- A player-paused run is still in the `playing` state, so closing the Ledger unpauses it.
- The encyclopedia gate exercises open/close behavior but does not assert restoration of a pre-existing pause owner.

**Impact**

Reading from the pause menu can unexpectedly resume combat.

**Recommendation for triage**

Capture and restore the prior pause state/owner, and add a regression that opens and closes the Ledger from both live and player-paused states.
