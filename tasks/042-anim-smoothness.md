# Task 042: walk animation smoothness — investigate, measure, fix (MAIN slot, commit prefix "anim:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; src/... SpriteAnimator + the 031/038 lineage (anim roundness + walk4 gait wiring, Balance.anim.walkFps); reviews of 031/038 if present. Pre-flight: zero staged/modified TRACKED files (`??` untracked expected — list briefly, proceed).

## Owner finding (2026-07-07, post-walk4): "the animations of the bandits and the main character are still not 100% smooth."
Walk4 shipped 4-phase gaits; something still reads rough. This is an INVESTIGATE-then-fix task — measure before touching.

## Investigation matrix (measure each, report numbers)
1. **Foot-slide**: gait cycle rate vs actual movement speed — does `walkFps` (4?) match distance-per-cycle at hero/jumper move speeds? Mismatch = skating. Compute the correct fps-per-speed relation; consider speed-scaled fps.
2. **Direction snap**: 8-way resolver transitions — instant flips vs hysteresis; diagonal flicker when moving near boundaries.
3. **Phase continuity**: start/stop/turn — does the cycle reset to a fixed frame (visible pop) or continue phase? Idle↔walk transition.
4. **Frame timing**: fixed-interval stepping vs delta-accumulated (uneven frame durations under load); walk4 A/B sheet seam (F-008-1 class) mid-cycle.
5. Hover-companion excluded (separate rig).

## Fix scope (from evidence, within anim domain only)
Balance.anim knobs (speed-scaled gait fps, hysteresis ms), SpriteAnimator phase/accumulator logic, resolver thresholds. NO art regeneration in this task (if a SHEET defect is the root cause, file it as a finding for an art batch instead of fixing code-side).

## Firewall
Touch ONLY: SpriteAnimator, direction resolver, Balance.anim ADDITIVE, diagnostics additive, e2e. NO movement-speed/sim changes (visual timing only), NO contract/art files.

## Self-check
tsc/build; evidence pack in artifacts/042-anim/: BEFORE/AFTER short screen-recordings or frame-series (hero + jumper, straight run / direction change / start-stop) + the measured numbers table; vp-02/vp-02b + task-031 suites green both projects; m2-01 stress p95 unchanged (>15% regression = fail loudly); zero console errors. End: READY-FOR-GATES + root causes found + what was fixed vs filed.
