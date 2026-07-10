# Sim Fixed-Step Unification — spec-let for F-SOL-SIM-001
Status: DRAFT 2026-07-10 (attended). Implementer: **Sol, on `sol/fixed-step-unification`** (owner 2026-07-10: "Should I let Sol fix these issues" → yes, this slice is Sol's). Gate + drain: the orchestrator.

## The ruling this implements
One simulation cadence everywhere. Today solo runs on the variable rAF delta (violating `specs/m0-skeleton` §fixed-step) while multiplayer runs 30 Hz lockstep — two games in one body (evidence: `reviews/sol-findings-simulation-lifecycle.md` F-SOL-SIM-001).

## Design decisions (decided — do not relitigate; escalate with evidence if one proves wrong)
1. **Unify at 30 Hz fixed sim ticks, solo and multiplayer identical** — the MP cadence is the proven one (500-tick byte-identical runs). Solo becomes "multiplayer with one rider."
2. **Render interpolates between the last two sim states** (alpha = accumulator remainder): visuals stay 60+fps smooth; `visualY`/render-only layers keep reading continuous positions.
3. **Accumulator with clamp**: max 5 ticks per frame (worst-case catch-up), beyond that drop time deliberately and note it in diagnostics (never spiral).
4. **Cooldown debt is honest**: the CombatSystem negative-timer reset (`CombatSystem.ts:351-373`, discards overdue volleys) is replaced by per-tick accounting — a cooldown crossing zero inside a tick fires on that tick, remainder carries.
5. **Balance semantics preserved, not re-tuned**: all per-second rates stay per-second (dt = 1/30 fixed). Any observed feel delta is a bug in the port, not a tuning opportunity — NO Balance.ts value changes in this slice.

## Gates (the definition of done)
- Determinism across render schedules: the NEW e2e runs the same seed at simulated 30/60/144 fps render cadences → identical Economy hash + tick timeline (this is the test SIM-001 says we lack).
- `perf-04` determinism harness green, unchanged hashes definition-wise (widening the hash is PERSIST-002's slice, not this one).
- mp-02 lockstep 3/3 green (solo unification must not disturb the MP path it joins).
- FEEL A/B for the owner: two 30-second captures (current main vs branch), same seed, side by side — hero movement, projectile smoothness, dash feel. The owner's eye is the final gate on feel.
- Full regression battery on the branch; frame p95 within 5% of main at wave-20 stress.

## Firewall
Touch: `src/core/Loop.ts`, the `Game.update` tick seam, CombatSystem cooldown accounting, render interpolation plumbing, the new e2e. **NO Balance values, NO input semantics changes, NO MP protocol, NO save schema.** One branch, one concern, READY-FOR-GATES tail commit.

## RULING 2026-07-10 — the parked blocker (orchestrator, evidence-verified)
Sol's option 3 GRANTED, sharpened: **branch #1's gate is AMENDED — the isolated MP resync case is a KNOWN-RED with a verified pre-existing fingerprint** (main's own 067 artifact contains UNEQUAL post-restore hashes: tick 90 88f71e9f vs a35ea391, tick 120 d90e03ca vs cb359b78 — independently re-read by the orchestrator from artifacts/mp-02/desync-resync.json; the 067 test asserted counters, never convergence — the green was false). Fixed scheduling EXPOSED it; branch #1 did not cause it. Option 1 REJECTED (one branch, one concern — the hash-arrival ordering fix + pending-remote-hash buffer belong to brief #2, which already owns true convergence incl. the REAL-divergence test asserting post-restore hash equality). Option 2 as sequencing stands: brief #2 cuts from MAIN after branch #1 drains.
DRAIN PLAN: (a) the OWNER's feel verdict on artifacts/sol/fixed-step-feel/side-by-side-30s.webm (the spec's final feel gate — Sol's blind ACCEPT is input, not the gate); (b) orchestrator battery on the branch (tsc/build, fixed-step 6/6, determinism 18k-hash, fixtures, night-shift, m1-01+town smoke, resync-red fingerprint re-confirmed); (c) path-scoped merge + review file; (d) Sol begins sol/mp-snapshot-completeness from fresh main.

**FEEL GATE PASSED 2026-07-10 (owner verbatim): 'yes, looks the same - a tiny bit different but good' — ACCEPT.** Drain battery running in the isolated gate worktree (tsc✓ build✓; sim-fixed-step suite + perf-04 determinism + m1-01 + town board). On green: merge → review → deploy → Sol's monitor unblocks brief #2.
