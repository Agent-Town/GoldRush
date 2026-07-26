> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, verified s1074 2026-07-26).** Promoted to `lane-deepwater-wave-counter` (s1025 refill) and landed as `3598b88c` *"fix: the Deepwater HUD counts the waves you are actually fighting"*, verified `git merge-base --is-ancestor 3598b88c main` = true. Retained per the RETENTION LAW as the authoring record.

# DRAFT (UNQUEUED) — DEEPWATER HUD: show corsair-wave progression

> Evidence: `reviews/saga-rehearsal-2026-07-25.md`, F-REH-05 follow-up. P2 clarity; no gameplay blocker.

## Problem

On `e5-deepwater-claim`, a moving, damageable hero reached 2,405 simulated seconds with 100 Deepwater `corsairWaves`, 500 XP, and 129 kills while the generic HUD remained `wave 0`. Progression works, but the visible counter makes a healthy run read as stalled.

## Proposed slice

- On Deepwater contracts, label/count the tile-owned corsair waves instead of the generic `WaveSystem` counter.
- Keep all non-Deepwater HUD behavior unchanged.
- Add one assertion that the visible counter advances with `deepwaterClaim.corsairWaves`.
- Verify ordinary XP, level-up pauses, Queen defeat, and “stay for the Rush” still use their existing owners.

## Acceptance

A 40-sim-minute Deepwater probe never displays a permanent `wave 0` while corsair waves are advancing, and console/page errors remain zero.
