# Task 049: no sanctuary — unreachable targets must be approached via the ford (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; e2e/task-025-bandits-dont-swim.spec.ts + its routing implementation (river blocks enemies, ford is their crossing); enemy targeting/movement (where the hero-position goal is set). Pre-flight: zero staged/modified TRACKED files (untracked `??` expected — list briefly, proceed). SEQUENCING: after 048 funnel-spread merges (same movement layer; verify by log/branch probe over full history).

## Owner evidence (2026-07-07 14:38 screenshot, wave-49 idle run)
The hero stands IN the river. Enemies spawned south mass into a solid wall at the south bank — pressing the shoreline toward an unreachable target instead of routing west/north to the ford (the north group crossed fine). Result: the river is an infinite-safety pocket; the idle run reached wave 49 untouched. The asymmetry itself is CANON (bandits don't swim; the hero may wade) — the degenerate crowd behavior is the bug.

## Ruling
The hero may wade; the claim-jumpers may not — but they must always find the best REACHABLE approach. Standing in the river buys time, never immunity.

## Scope
1. **Unreachable-target fallback**: when an enemy's goal position is inside water (or otherwise unreachable by its movement rules), re-target the nearest REACHABLE point toward the goal via valid paths — in practice: route to/through the ford and approach from the closest bank point to the hero. Deterministic (no randomness; ties broken by id).
2. **Re-evaluation cadence**: the fallback goal refreshes when the hero moves ≥1 tile or crosses in/out of water — no per-frame path spam (budget: no measurable p95 regression at 200 enemies).
3. **Melee contact rule**: an enemy adjacent to the water edge closest to an in-water hero within its attack range MAY strike (wading-distance melee — Balance additive knob, default = current behavior if this reads too strong; document the choice).
4. **task-025 sanctity**: bandits still NEVER enter deep water — extend its spec with the new case (hero-in-river → enemies cross the ford and reach the near bank within N seconds, no swimmer ever detected).
5. Determinism: seeded two-run hash identical with the fallback active.

## Firewall
Touch ONLY: enemy goal-selection/fallback logic, Balance additive knob, e2e (task-025 extension + new spec), artifacts. NO changes to: hero movement rules (wading stays as-is), ford geometry, spawn logic, 046 gaps/048 spread (compose, don't modify), CombatSystem damage.

## Self-check
tsc/build; task-025 extended + green; determinism probe two-run identical; perf p95 in envelope at stress; task-046 + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (hero in river, enemies crossing the ford to the near bank) into artifacts/049/. End: READY-FOR-GATES + the chosen melee-edge ruling + results.
