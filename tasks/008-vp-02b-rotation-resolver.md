# Task 008 — VP-02b 8-way rotation resolver (chained: run AFTER tasks/007)

**Spec (BINDING, read together):** `assets/requests/batch-005-rotation.md` ("Code half" + cell map) + the `rotations` block under `char.hero` in `assets/layer-contracts/characters.v2.json` (its `notes` field is part of the spec, mirror table is BINDING) + this file. Read `AGENTS.md` first.
**Skills:** `threejs-gameplay-systems`.
**Chain context:** your tree contains tasks/006+007 output. GIVEN — sibling rule everywhere.

## Goal

Hero locomotion orientation goes 4-way → 8-way, consuming the DORMANT contract `rotations` block (s21). Velocity-angle resolver with **~10° hysteresis** at sector boundaries (boundary flicker reads as "gaps" as much as missing art). Mirror table from the contract: stored `s/se/w/ne/n`, derived `e←w`, `sw←se`, `nw←ne` via flipX. Idle cells exist for `s`/`n` ONLY — idle snaps by hemisphere: `{s,se,sw,e,w}` → `s` idle, `{n,ne,nw}` → `n` idle (this RETIRES the s15 idle-seam deviation: locomotion idle leaves the old side-sheet cell). **Locomotion clips (walk/idle) ONLY** — action clips (pan/build/aim/hit/…) keep today's coarse front/back/side path verbatim (batch-005R law: actions stay on coarse cells); map 8-way → coarse for actions by the existing dominant-axis rule. Enemies untouched — jumper stays 4-way (its rotation sheet is intentionally ungenerated until this pilot passes).

## Design decisions (BINDING)

- Resolver lives in `src/assets/` (own small module or inside SpriteAnimator) with per-instance hysteresis state; direction changes only when the velocity angle exits the current 45° sector by >10°; idle preserves the last direction (then hemisphere-snaps for the idle cell).
- SpriteAnimator: parse `rotations` (directions/mirrors) into runtime orientations ALONGSIDE coarse `orientations`; a slot without a `rotations` block behaves byte-identically to today (jumper, all non-hero slots — the s15 runtime idle-fallback and unknown-clip walk→idle fallback must survive).
- Mirroring: derived directions render flipX (sprite.scale.x sign — the existing mechanism); diagnostics grow additive `direction` + `mirrored` fields on the animation snapshot.
- No contract/JSON edits (s21 landed it), no asset edits, no new textures beyond the cells the contract names.

## Files in scope

- `src/assets/SpriteAnimator.ts` (rotations parsing, 8-way runtime orientations, diagnostics fields; fallback chains preserved)
- `src/assets/OrientationResolver.ts` (NEW, optional — implementer's call whether standalone)
- `src/entities/Hero.ts` (feed velocity angle to the resolver; 4-way branch replaced for locomotion; coarse mapping kept for action clips; NO movement-physics changes — 007 did not touch this file, 006 must not have either)
- `e2e/vp-02b-rotation-resolver.spec.ts` (NEW)

**Do not touch:** `src/entities/Enemy.ts`, `src/systems/*`, `src/game/*`, `src/core/*`, `src/ui/*`, `assets/*` (incl. the contract JSON), existing `e2e/*`, `STATUS.md`, `reviews/*`, specs.

## Acceptance

1. tsc/build green; zero console/page errors desktop + 390px.
2. New e2e: **(a)** each of the 8 movement directions resolves to the expected `frameKey` cell per the contract (mirrored directions report `mirrored: true` + the source cell, e.g. E → `char-hero-sheet-rotation-r1c0/1` mirrored); **(b)** hysteresis: velocity oscillating ±5° across a sector boundary → direction does NOT flap (diagnostics stable over a sampled window); **(c)** idle after walking E → `s` idle cell (`…-r2c2.png`); after walking NE → `n` idle cell (`…-r2c3.png`); **(d)** action clip still coarse (existing vp-02 pan/aim cells unchanged when those clips run); **(e)** jumper diagnostics byte-identical to pre-008 (no rotations block → old path).
3. Canaries green UNMODIFIED: vp-02, **visual-polish-assets** (asset-loading resilience is MANDATORY when this surface moves — s11 law), m1-01, m1-02, m1-04, feedback-fx. Full regression rides the combined chain gate (006/007 already mandate it).
4. **Scale-pulsing evidence (BINDING gate input, s21 finding):** `reviews/shots-008-rotation/` — per-stride frame pairs for the **W walk (bbox 378→340)** and **NE walk (354→398)** at GAMEPLAY zoom (freeze each stride via the test-clip override or low fps), plus one 390px frame and one 8-direction contact strip. The supervisor rules pulsing-vs-gait at the gate; if it reads as scale PULSING the sheet regenerates and this lane's art half rolls back — keep the resolver cleanly separable from the cell wiring.
5. Perf: resolver allocation-free per frame; no added draw calls (atlas count may grow by the rotation sheet's one atlas — that is expected and exempt).

## Environment notes (Robin's Mac — you run there)

Run e2e via base `playwright.config.ts` (own webServer). Reply READY-FOR-GATES when done — supervisor runs gates. Do not `git commit`.
