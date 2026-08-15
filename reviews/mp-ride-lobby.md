# mp-ride-lobby — Ride Together lobby

**Slice:** `mp-ride-lobby` · **Branch:** `lane/lane-c` · **Tip:** `e719d813d93651b91b357e581ed647923a2ea899` · **Base:** `52d12e21a1db76e6e9d3d2004fe65c98b5baa783`
**Merged to main:** `aaf434fba0ca84a0513a4f849dea7da96e95ba0e` · **Drained:** s1786, 2026-08-15
**Gated in:** detached worktree `/tmp/gr-s1786-gate.msc8nh`; merged to main as one act

## VERDICT: MERGE — the host can see the room before starting, and the solo notice no longer sticks over play.

## What it does

The Ride Together card now shows the staged contract, difficulty, seed, and a live rider roster. The host polls the existing room inspector every 2.5 seconds; a newly seated headless rider appears without adding a server endpoint or changing the multiplayer protocol. Invalid or failed inspections leave the last valid roster in place.

The `Riding solo` notice is clickable and dismisses itself after six seconds. Other multiplayer cards keep their prior held-card behavior because only the solo call passes a timeout.

## Evidence

| Gate | Result |
|---|---|
| Policy | `drain-block-check --strict` **CLEAR**, rechecked immediately before merge |
| `npx tsc --noEmit` | clean, rc=0 |
| `npm run build` | green, Vite `✓ built in 2.57s`; asset-diet checks green |
| `npm run test:mp` | **466 checks passed** |
| Own `mp-ride-lobby.spec.ts` | **4/4 passed**, desktop + 390px mobile, `--workers=1` |
| Adjacent `task-025` + `m1-01` + `m2-01` | **32/32 passed**, both projects, `--workers=1` |
| Combined browser battery | **36/36 passed in 5.2m** on isolated port 5234 |
| Plain boot / runtime errors | both own tests enter from plain `/`; console and page errors asserted empty on desktop and mobile |
| Screenshots | `artifacts/mp-ride-lobby/{desktop,mobile}-chrome-two-rider-lobby.png` |
| Node guard battery | not triggered: no `src/sim/`, `src/systems/`, or `src/entities/` path changed |

The teardown assertion is load-bearing across the six-second solo-card window: after Start Ride, the inspect-call count remains fixed until the card has auto-dismissed. Source review also verifies teardown on claim replacement, room start, Town disposal, and contract launch. An in-flight response cannot repaint a disposed or replaced room because it rechecks both `disposed` and the room code before writing.

The contract display reads `ride.setup`, the same `RideTogetherConfig.setup` staged for launch. The server response is validated at the client boundary before any rider text is rendered, and every rendered value passes through `escapeHtml`.

## Merge classification

Main moved none of the six touched paths after base `52d12e21a`; the detached merge and final main merge were clean `ort` merges with no conflict or graft.

| Path | Classification |
|---|---|
| `src/town/TownScene.ts` | LANE-TOUCHED / MAIN-UNTOUCHED — lobby rendering and poll lifecycle |
| `src/mp/RideTogether.ts` | LANE-TOUCHED / MAIN-UNTOUCHED — validated inspect helper |
| `src/game/Game.ts` | LANE-TOUCHED / MAIN-UNTOUCHED — solo-card dismissal only |
| `e2e/mp-ride-lobby.spec.ts` | new, lane-only browser proof |
| `artifacts/mp-ride-lobby/*.png` | new, lane-only visual evidence |

## Findings

No blocking or corrective finding. The firewall is exact: no server, lockstep, balance, standing, simulator, existing-spec, or public-skill file changed.

