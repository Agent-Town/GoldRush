# Review — VP-02b 8-way rotation resolver (tasks/008, relay lane chained after 007, gated s23 2026-07-04)

**Verdict: PASS — integrated. The BINDING scale-pulsing gate rules GAIT, not pulsing: the batch-005R art half STANDS.**

## Scale-pulsing verdict (s21 binding trigger)

Ruled on the mandated evidence in `reviews/shots-008-rotation/` (Mac-rendered by the lane, regenerated green in-sandbox by the suite):

- **W walk pair (bbox 378→340)**: frame r1c0 is a full scissor stride (legs extended wide), r1c1 the passing pose (knee raised, gait dip). Head size, hat brim, and torso width are constant across the pair — the bbox delta is leg geometry, not uniform figure inflation.
- **NE walk pair (354→398)**: same signature mirrored — r1c2 gathered passing pose, r1c3 extended stride; proportions constant.
- **8-direction contact strip**: uniform figure mass across all 8 directions; mirrored directions symmetric; no direction systematically larger.

Scale pulsing would scale the whole figure uniformly (head/torso included). It does not. The 14.6% bbox spread is the inherent contact-vs-passing contrast of a 2-frame walk cycle. **No sheet regeneration. Consequence: the jumper rotation sheet is UNBLOCKED for a future art batch.**

## Gates

- tsc/build clean; zero console/page errors desktop + 390px.
- New e2e `vp-02b-rotation-resolver.spec.ts`: **5/5** — (a) all 8 directions resolve to contract cells with correct `mirrored` reporting (E ← w cells mirrored, etc.); (b) hysteresis holds across ±5° boundary oscillation (no flap over sampled window); (c) idle hemisphere snap (E-walk → s idle r2c2, NE-walk → n idle r2c3 — retires the s15 idle-seam deviation); (d) action clips stay on coarse cells (vp-02 pan/aim cells unchanged); (e) jumper diagnostics byte-identical (no rotations block → old path).
- Canaries: vp-02 4/4 (one canary amended, see finding 1), visual-polish-assets 2/2 (MANDATORY per s11 law — green after the 006 counter fix, see m2-04 review), m1-01, m1-02, m1-04 4/4, feedback-fx. Full sweep rides the chain gate.
- Perf: resolver is allocation-free per frame (module-level tables, primitive state); no added draw calls beyond the expected rotation-sheet atlas.

## Code review notes

- `OrientationResolver`: hold window = sector half-width (22.5°) + 10° hysteresis; idle preserves last direction then hemisphere-snaps. Hero feed is locomotion-only (13-line Hero diff, movement physics untouched, resolver reset on respawn).
- **Two mirror paths verified distinct and correct**: rotation cells mirror via the contract `mirrors` table (`e←w, sw←se, nw←ne` → flipX + source cell in diagnostics); `isMirroredRotationDirection` (w/sw/nw) serves ONLY the coarse action-clip path, matching the old right-facing side sheet's `velocity.x < 0` flip. Initially read as a contradiction — it is not; adjudicated by e2e (a) and (d).
- s15 fallback laws survive: orientation-without-clips fallback and unknown-clip walk→idle intact; slots without `rotations` behave byte-identically (jumper e2e (e)).

## Findings

1. **vp-02 fallback canary amended at gate** (documented in-file): it blocked only the OLD side sheets and asserted billboard fallback — under 008 the hero slot legitimately serves rotation cells first, so the billboard was never reached. Amended to also block rotation cells, preserving and strengthening the test's intent (last-fallback-layer coverage). The billboard chain works: test green in 10.2s. This is the s11 rule in action — the resilience suite must evolve whenever asset loading changes.
2. **Shots-capture test needed `test.setTimeout(60_000)`** (s17 retro-gate pattern): 12 canvas screenshots + 8 frameKey waits legitimately exceed 30s on slow sandbox VMs; passes in seconds on real hardware.
