# Review — s12 art processing: batch-002 icons, batch-003 terrains + sheets (2026-07-04)

Orchestrator-direct lane (asset pipeline + slot integration per scheduled-task case C; code fixes within review-fix authority).

## Delivered

1. **Extractor extension** (`scripts/extract-alpha.mjs`): `--key HEX` (saturated keys get hue-targeted despill — edge band 3px dilation, excess-over-recessive margin 16), `--grid CxR` sheet mode (whole-sheet key → per-cell alpha-bbox → center in cell, ONE shared scale per sheet at 86% coverage, never upscale → `<base>-r<row>c<col>.png` + `<base>.frames.json` stub), `--cell N` (default 512), `--pocket-mean N` (default 12).
2. **batch-002 icons ×6** processed (gray-key, 512²) and **integrated**: `UpgradeOverlay` now resolves `ui.upgrade.icon.<family>` → `assets/processed/icon-<family>.png` via lazy glob (same rule as Terrain, s11 finding), appends `.upgrade-card__icon` (56px, right side, text max-width guard). Missing family (tranche 2) → clean parchment card, failed load → no-op. `icon-firerate` needed `--pocket-mean 24`: enclosed gray pocket between the coils has a painted gradient (mean dist > 12) and survived the default pocket pass.
3. **batch-003 terrain-b/c** processed (full-bleed 1024²) and **integrated** through the variant atlas — after two Terrain fixes (below).
4. **batch-003 character sheets** processed: 2×2 magenta-keyed → 8 cells + 2 frames stubs, despill ~14.5k px/sheet. Cell reads (for VP-02 clip mapping): hero r0c0 stand/idle, r0c1+r1c0 stride pair, r1c1 two-hand pan brace; jumper r0c0 crouch-lurk, r0c1 reach, r1c0 stride, r1c1 nugget-carry run (flee/M2-04). **Integration waits on VP-02 code — tasks/004 written.**

## Findings (terrain — both fixed this session)

1. **CRITICAL (pre-existing, masked): atlas install path never uploaded.** Lane 003's install mutated the live map's backing canvas dimensions + `needsUpdate`; three.js allocates immutable texture storage at first upload, so the grown canvas failed in `texSubImage2D` — `GL_INVALID_VALUE: glTexSubImage2DRobustANGLE: Offset overflows texture dimensions` — and the GPU silently kept the pre-atlas procedural content. **The bank has been rendering procedural parchment, not batch-001 art, since lane 003 landed.** vp-03's e2e passed because rotation/mirror/macro-tint happen in-shader regardless of map content. Fix: fresh `THREE.CanvasTexture(atlas.canvas)` + `configureBankAtlas` + swap + dispose previous (Terrain.ts, 9 lines). Evidence: probe `single2-west` vs pre-fix `single-west` = 61/80 windows changed (art finally visible); GL error count 0 after fix.
2. **Row mapping vs flipY (the vp-03 watch item — REAL).** With `flipY=true` the canvas rows land bottom-up in texture space; old shader indexed `(tileUv.y + variant)/rows` → with 3 variants + pow2 padding, tile A was never sampled and c doubled. Fix: `atlasRow = rows - 1 - variant` (comment in shader; rows=1 unchanged → zero delta for the pre-variant state). Evidence: `bugdemo2` (old math, fixed install) vs `single2` = tile A absent across the whole bank region; `fixed3` vs `single2` = variant-0 cells pixel-identical + b/c cells changed (west 19/54, east 41/25 same/changed windows); `bugdemo2` vs `fixed3` = 51 windows differ. Shots: `reviews/shots-s12-art/` (triptych, per-config, window grids in this doc's git log).

## Gates

- tsc + `vite build` clean (349ms). Sheet-cell/icon chunks are lazy, not boot-time deps (s11 rule held).
- **Full regression 65/65 desktop-chrome, all 14 files** (chunked ≤45s per call — see STATUS verification lesson update): vp-03 2/2, visual-polish-assets 2/2, visual 5/5, m1-01 4/4, m1-02 3/3, m1-03 5/5, m1-04 4/4, m1-05 6/6, m1-06 8/8, m1-07 7/7, m1-08 6/6, feedback-fx 3/3, m2-01 6/6, m2-03 4/4.
- Zero console/page errors in all probes; GL upload errors eliminated.
- Screenshots: `review-contact.png` (processed-asset contact sheet), `upgrade-icons-desktop.png` + `upgrade-icons-390px.png` (2/3 cards iconned, tranche-2 card clean-fallback ✓, no badge/text collision), terrain triptych + per-config probes.

## Carried / notes

- Icon size 56px is a taste call — Robin may want them bigger; trivial CSS.
- Sheet magenta fringe: despill leaves nothing visible at billboard scale; re-inspect at VP-02 in-game integration.
- The two terrain fixes make the committed batch-001 bank art actually visible for the first time since lane 003 — expect Robin to notice the ground looking "more textured" than his last playtest.
