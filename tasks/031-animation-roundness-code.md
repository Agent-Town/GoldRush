# Task 031: animation roundness — code pass (hero + bandits), MAIN slot

You are Codex, implementer for Gold Rush. Claude orchestrates and gates. READ FIRST: AGENTS.md; STATUS.md line-1.

ROBIN (owner, 2026-07-06): "the animations of the bandits and the hero have to be fixed - they are not round."
Diagnosis: walk clips are 2 frames @ 4fps (probe: frameCount 2, fps 4) — a two-page flipbook can never read smooth. Real fix is 4-frame gait art (task 032, in flight). THIS task extracts every drop of roundness available in code NOW, and prepares the animator so 4-frame sheets slot in with ZERO further code when processed.

## Scope
1. `SpriteAnimator`: (a) short crossfade between FRAME swaps within a clip (~70-90ms alpha blend, knob `Balance.anim.frameBlendMs`, 0 disables); (b) frames-per-clip read from the layer contract rows (no hardcoded 2) — when the contract later gains 4-frame walk rows they play unmodified; (c) walk fps knob `Balance.anim.walkFps` (default: pick best feel 5-6, judged at timescale 1); diagnostics keep reporting the DOMINANT frameKey (existing e2e semantics must not change).
2. Gait-synced procedural motion (transform-only, sim-invisible): subtle vertical bob + ~2-3° lean synced to the walk frame phase for hero AND enemies (billboard group transform, never collider/position state). Knobs `Balance.anim.bobAmp`, `Balance.anim.leanDeg`; 0 disables both. Tasteful defaults — Frontier Ledger is illustrated, not bouncy-castle.
3. Orientation-swap crossfade (VP-02c's ~100ms) — verify it actually runs for ENEMIES too (it may be hero-only); extend if not.
4. New e2e `e2e/task-031-anim-roundness.spec.ts`: blend/bob active in diagnostics at defaults; setting knobs to 0 restores byte-stable frameKey behavior; existing suites' frameKey asserts still pass.

## Firewall
Touch ONLY: src/assets/SpriteAnimator.ts, src/game/Balance.ts (anim block, ADDITIVE), the billboard transform application site in entities (Hero/Enemy render path — transform only, NO velocity/position/sim writes), new spec. Sim invariance is the law: m1-01, m2-04, lane-c spec, vp-02/02b all UNMODIFIED-GREEN. No Economy/Combat/WaveSystem. No STATUS/specs edits; no commits outside scope prefix "anim:".

Self-check: tsc/build clean; new spec green desktop+mobile; unmodified suites green; note chosen defaults + why. End: READY-FOR-GATES + files + results.
