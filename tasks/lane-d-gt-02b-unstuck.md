# Task gt-02b: never wedged — the hero always has a way out (LANE-D, branch lane/perf, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; the GT-02 slope-movement implementation (merged 6e0bd8f — hero slope clamp + cliff impassability on the gt-test-basin dev tile); specs/gameplay-terrain/README.md (GT ladder). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after e1c-twin-banks (this lane's queue).

## Owner finding (2026-07-07 ~19:40, testing ?debug&tile=gt-test-basin)
"I got stuck in a hill." The cliff-band/slope constraint can wedge the hero into a pocket it cannot leave — a movement trap.

## Scope
1. **Slide, never stop dead**: blocked movement against a cliff/steep face resolves to the tangential component (wall-slide standard) — walking diagonally into a cliff moves you along it.
2. **The never-wedged invariant**: from ANY reachable position, at least one input direction must produce movement. Implement a corner-resolution pass (two-face pinch → slide along the more permissive face); if a degenerate pocket exists in the descriptor itself, the fix is the resolver, not hand-editing the tile (the resolver must generalize to GT-07 and epoch tiles).
3. **Regression net**: an e2e sweep driving the hero into the basin's cliff band at dense angle samples (every 15°), asserting position always escapes within N ticks of steering away; plus a fuzz pass (seeded random walks against the cliff, M steps, never immobile-while-input-held).
4. Determinism: resolver is pure function of (position, input, heightfield) — seeded fuzz reproducible.

## Firewall
Touch ONLY: the GT movement constraint/resolver, the gt-02 e2e (extend), artifacts. NO changes to: flat-claim movement (planar path byte-identical — regression-asserted via m1-01/vp-02), enemy movement (GT-03's job), heightfield data, camera.

## Self-check
tsc/build; extended gt-02 spec + the new sweep/fuzz green both projects; m1-01 + vp-02 + m2-01 + task-025 unmodified green both projects (flat movement untouched); zero console errors; a short capture of sliding along the cliff into artifacts/gt-02b/. Commit on lane/perf. End: READY-FOR-GATES + the resolver approach + results.
