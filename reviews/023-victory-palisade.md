# Review — runner task 023: victory-event + palisade-rotation bugs (MAIN slot)

**Verdict: PASS — integrated.** Both bugs from Robin's 36-wave run fixed, evidenced in-VM (s44 fire, 2026-07-05T14:35Z). Runner-side m2-01 canary was already green on the Mac (13:58Z `.last-run.json` passed).

## Scope (matches task firewall)

`EventBus.ts`, `Balance.ts` (run.secureWave=20), `RunManager.ts` (+112), `WaveSystem.ts`, `Game.ts` (+59), `DebugParams.ts`, `BuildSystem.ts`, `TargetingSystem.ts`, `Enemy.ts`, `vite-env.d.ts`, new `e2e/task-023-victory-palisade.spec.ts`. No out-of-scope files.

## Bug 1 — wave-20 victory never fired in live runs

Root cause confirmed as the task's hypothesis: the ceremony trigger was harness-only. Fix wires a new `wave_started` EventBus event from the **live** WaveSystem pulse path (`spawnDuePulses`) into `RunManager.maybeSecureRun`, which pauses and renders the Claim Secured overlay at `Balance.run.secureWave`. `run_ended` now carries `reason: 'death' | 'secured' | 'rush'`; `endRun` is idempotent (`endedRunId` guard). While the choice is pending, `Game.update` short-circuits to presentation-only: intents latched (`rememberIntents`), pause/XP/build/UI intents blocked, charm-pause suppressed. `?nopause` harness runs auto-stay (rush) without the overlay — existing suites unaffected. Legacy `gr.meta.v1` profile covered by a dedicated test.

## Bug 2 — rotated palisade hitbox stayed axis-aligned

`BuildingTarget` gains `halfX/halfZ`, set per instance using `palisades.rotationStepsAt(index)`; wrecker reach (`Enemy.distanceSqToBuilding`) and `TargetingSystem.nearestBuilding` now use clamped **box** distance instead of center-distance + radius. Blocking verified by the spec's mirrored-geometry rAF probe (rotated wall line blocks identically to unrotated; `crossedThrough=false`, `reached=true` around the end).

## Evidence

| Gate | Result |
|---|---|
| tsc / vite build | clean (exit 0) |
| task-023 spec (new) | 7/7 |
| m3-01 run-scaffold | 4/4 |
| m2-05 base-damage-repair | 7/7 |
| m2-05b overwhelm-valves | 5/5 |
| m2-01 build-menu | 6/6 (+ Mac runner pass 13:58Z) |
| m1-03 grace/banner/spawn-accounting | 3/3 |
| Screenshots | `reviews/shots-023/` boot-desktop, boot-390px, claim-secured-desktop |

32/32 in-VM, zero console/page errors asserted inside the spec. Ceremony visual is on-brief: parchment panel, teal actions, ledger rows, "The assay is sealed. Bank the claim or ride deeper into the rush." No canon issues.

## Sim-semantics deltas (why full regression on Mac matters)

1. A tick that starts a new wave now defers trickle processing by one tick (early return in `WaveSystem.update`).
2. Wrecker engage distance is box-edge, not center-radius — engagement range changes slightly on non-square footprints.

Both are intended; neither broke any canary here, but the **full Mac regression (Robin owes 1b) now also covers these**.

## Minor findings (non-blocking, fold into next correction task)

- `Game`'s `onWaveStarted` callback returns `!secureClaimChoicePending()` but `WaveSystem` ignores the return value — dead expression; either use it or drop the return type.
- Overlay reuses `death-overlay` CSS classes wholesale; fine now, but a dedicated class would decouple future death-screen restyling.
- HUD hint "P - back to the claim" remains visible while P is deliberately blocked during the ceremony — cosmetic.
