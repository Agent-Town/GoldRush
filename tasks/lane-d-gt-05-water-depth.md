# Task gt-05: water learns depth — fords, shallows, and the drowned line (LANE-D, branch lane/perf, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; specs/gameplay-terrain/README.md (GT-05); task-025 (bandits-don't-swim — THE law this generalizes: today river=binary barrier + ford=crossing); the TileHeight stack + tile water params (identity-pass descriptors); 049's unreachable-target fallback (water-aware goal logic — this rung feeds it depth). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after gt-04 (this lane's queue).

## Why
The Hill Mine has flooded galleries; Twin Banks has braided shallows; E5 is an ocean. Water needs DEPTH as data: walkable shallows, slowing wades, impassable deeps — one system replacing the binary river.

## Scope (GT/water-declaring tiles only; the classic claim's river keeps its exact current behavior via equivalent depth data — byte-identity asserted)
1. **Depth as tile data**: water zones gain depth values; thresholds (Balance additive): `wadeDepth` (walkable, speed factor like slopes), `deepDepth` (impassable to ALL — bandits per 025, hero too UNLESS the tile declares hero-wade per the First-Claim asymmetry which stays canonical on the classic claim).
2. **Movement integration**: the gt-02b resolver treats deep water as cliff-class (slide, never enter); wade zones apply the speed factor; enemies inherit via GT-03's shared consumption.
3. **The classic claim mapping**: its river = deep, its ford = wade — expressed IN DATA, producing byte-identical behavior (task-025 green unmodified = the proof; the hero's existing river-wade allowance preserved exactly).
4. **Render hooks**: depth feeds the existing water shader's depth tint (w1-02 machinery — visual only, no new water rendering).
5. Determinism + flat/simple-tile fast path preserved.

## Firewall
Touch ONLY: water depth data + thresholds, resolver/movement water terms, the classic-claim data mapping, gt e2e, artifacts. NO task-025 assertion changes (it must pass UNMODIFIED — that's the whole point), NO water shader rewrites (hook only), NO routing graph changes, NO sim-timestep.

## Self-check
tsc/build; new `e2e/gt-05-water-depth.spec.ts`: wade slows measurably · deep blocks hero+enemy (resolver slide asserted) · classic-claim byte-identity (seeded hash + task-025 UNMODIFIED green both projects) · determinism two-run identical; gt-01..04 + 049 + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (a wade crossing on the basin) into artifacts/gt-05/. Commit on lane/perf. End: READY-FOR-GATES + the depth threshold values + results.
