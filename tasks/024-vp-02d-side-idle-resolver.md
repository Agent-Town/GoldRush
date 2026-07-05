# Task 024 — VP-02d: side-idle resolver rider (hero e/w idles go live)

Goal: retire the s/n idle hard-snap so the hero can idle facing east/west. The art is DONE and contract-wired since s37 (rotation2 side idle cells for e and w); only `idleDirectionFor` still collapses everything to s/n. This is the rider batch-005R2 promised ("retires W-idle fallback").

Runnable NOW — no art dependency. Run BEFORE tasks/025 (which assumes these semantics).

## Compact contract

- `src/assets/OrientationResolver.ts` — `idleDirectionFor` new mapping, exactly:
  - `s → s`, `se → s`, `sw → s` (front hemisphere unchanged)
  - `n → n`, `ne → n`, `nw → n` (back hemisphere unchanged)
  - `e → e`, `w → w` (NEW: pure side headings idle in profile)
  - Diagonals deliberately stay hemisphere-snapped: a 45° heading reads front/back at gameplay zoom, and se/sw/ne/nw idle cells do not exist. Do not "improve" this to nearest-idle.
- Slots WITHOUT side-idle cells (the jumper: crouch idle is s-only) MUST keep today's behavior via the existing SpriteAnimator fallback chain. Prefer ZERO SpriteAnimator changes; if a guard is truly unavoidable it must be contract-driven (cell-presence check), never slot-name special-casing.
- No Balance, no Game.ts, no contract JSON changes.

## e2e (extend `e2e/vp-02b-rotation-resolver.spec.ts`)

1. Mapping table test pins all 8 entries of `idleDirectionFor` (unit-style through the page or direct import per the suite's existing pattern).
2. Behavior: walk hero pure east, stop → idle clip resolves the E idle cell (assert via frameKey/snapshot hook, mirrored:false); same for west. Walk se, stop → s idle (unchanged).
3. Jumper regression: existing jumper-shape/dormancy tests stay green UNMODIFIED — if one goes red, that is a finding, not a test to edit.

## Acceptance

- tsc/build clean; new + existing vp-02b green both projects; vp-02 suite green; boot probe desktop+390 zero console/page errors.
- Visual: 2 screenshots (hero idling E, idling W) — correct profile art, no size pop vs s/n idle.

Do not touch: Balance.ts, Game.ts, src/entities/*, assets/*, other e2e suites. Constraints: brief §9 canon N/A here; keep the diff small — this is a rider, not a refactor.
