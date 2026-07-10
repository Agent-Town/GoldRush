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
