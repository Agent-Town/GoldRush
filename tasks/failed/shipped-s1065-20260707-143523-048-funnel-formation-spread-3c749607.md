# Task 048: funneled waves must read as a MOB, not a parade (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; task 046's output (lane-aligned ring gaps + early-spawn gap bias — `WAVE_SPAWN_EDGES`/ring constants in Balance, WaveSystem gap-bias); the routing/movement path (enemies steer to gaps). Pre-flight: zero staged/modified TRACKED files (untracked `??` expected — list briefly, proceed). SEQUENCING: run after 047 late-game-valves merges (same tuning surfaces; verify by branch/log probe, full-history not a short window).

## Owner evidence (2026-07-07 14:28 screenshot, level-40 idle run)
Deep waves funneling through ring gaps and around palisade corners form PERFECT SINGLE-FILE CONGA LINES — dozens of enemies nose-to-tail in straight files, overlapping sprites, reading as broken/comical instead of threatening. 046's funneling is working as designed; the presentation at high counts is not.

## Ruling
Funnel tactically, swarm visually: enemies sharing a path must SPREAD — a mob pouring through a gap, not a queue at a ticket window.

## Scope
1. **Deterministic lateral offset**: each enemy gets a per-id seeded lateral offset (± up to ~1.2 tiles) from its path spine, applied as a steering bias — offsets derived from the enemy's spawn id/seed (NO Math.random in sim — determinism law; hash the id). Files through a gap become a staggered stream.
2. **Local separation (cheap)**: enemies within overlap distance of a same-direction neighbor get a small perpendicular nudge (capped, deterministic tie-break by id) — kills nose-to-tail stacking without real flocking cost. Budget: O(n) with the existing spatial queries, no new per-frame allocations, 200-enemy stress stays in frame envelope.
3. **Gap width respect**: spread clamps so enemies still fit THROUGH gaps (never pushed into palisade collision or the river).
4. **Determinism proof**: seeded run hash identical across two runs WITH the feature on (extend/reuse the perf-02/seed probe pattern); the m6-era determinism seed must still produce self-consistent results.
5. Visual acceptance: screenshot a deep-wave gap assault — staggered stream, no single-file line longer than ~4, no sprite full-overlap clusters.

## Firewall
Touch ONLY: enemy steering offset logic (movement layer), Balance additive knobs (spreadWidth, separationRadius), the probe/e2e, artifacts. NO changes to: pathfinding graph/routing targets, spawn counts/compositions, CombatSystem, 046's gap placement, sim timestep.

## Self-check
tsc/build; determinism probe two-run identical; perf bench in envelopes (draw calls + frame p95 — separation must not spike); task-046 + task-025 + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (gap assault before/after) into artifacts/048/. End: READY-FOR-GATES + the separation cost measured + results.
