# Art run — tavernkeeper EAST row (animation pass mend F-A2)
**Date:** 2026-07-26 · **Slot:** `char.town.tavernkeeper` row 2 · **Arm:** Codex `image_gen` (gpt-image-2) via `codex exec -m gpt-5.6-sol`, owner-granted for this pass · **Session:** attended Opus 5, branch `anim/opus5-pass`

## Why
`src/town/TownScene.ts:2405 directionRow()` maps `e|se|ne → row 2`. The sheet's row 2 was drawn facing **west**, identical in facing to row 1, so the tavernkeeper faced backwards whenever she walked east. Screened by `scripts/anim-pass-facing.mjs` (rows 1/2 matched **directly** at Hamming 3 and **mirrored** at 41 — the signature of a same-facing pair) and confirmed at head magnification in `../crops/lr-town.png` tiles 0–1.

## Prompt (as issued)
One image, **4 columns × 2 rows** of equal cells, 8 frames of a complete walk cycle of the tavernkeeper walking **EAST** — nose, hat brim, boot toes and body pointing to the viewer's right. Frame order left→right, top row then bottom: contact(left fwd), down, passing, up, contact(right fwd), down, passing, up.

Character, to match the reference sheet exactly: heavyset, friendly, full dark beard, wide-brimmed weathered hat, cream shirt with rolled sleeves, long brown work apron over a vest, pale towel draped over one shoulder, sturdy work boots.

Format (binding): flat solid uniform bright magenta `#ff00ff` background everywhere, no magenta spill on the figure; no borders, grid lines, labels, text, letters, numbers, watermarks or signatures; SAME character in every cell with identical outfit, colours, proportions, scale and lighting; constant eye-line and figure height; each figure fully inside its own cell, not touching a cell edge; soft light from upper left; no duplicated or mirrored frames; no firearms or gun-like silhouettes; not gory.

Style anchor, verbatim (house anchor, `assets/requests/codex-art-run-014.md:20`):
> Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image.

Conditioned on: `assets/raw/char-tavernkeeper-sheet-walk8.png`.

## Output
- generated: `~/.codex/generated_images/019f9af8-3607-7911-b570-85bab6e1da80/call_5X4Pjvcpqht70DxAKP6uPIZ3.png`
- kept: `reviews/anim-pass-2026-07-25/gen/tavernkeeper-east-4x2.png` — **1609 × 977**, detected key `#f404f5` (within the extractor's tol 26 of `#ff00ff`)
- one generation, no retakes.

## Measured self-QA (mine, not the generator's)
The generator reported "all 8 face right, no two identical". That is a claim; these are the measurements.

| check | result |
|---|---|
| figure heights across the 8 frames | 401, 402, 402, 401, 404, 403, 404, 402 px — spread **3 px (0.7%)**, so no breathing |
| stride pattern | widths 209/130/227/175/247/155/257/162 — wide/narrow alternation, the same contact↔passing regime as the sheet's own row 1 (128/95/141/161/146/113/144/96) |
| every figure inside its own cell | yes — no source bbox touches a cell edge |
| facing | all 8 face east — **verified by eye** at head magnification, `../crops/lr-tavernkeeper-mended.png` |
| duplicates | 5 pairs hash-flagged, **0** survive full-resolution comparison (`anim-pass-dupecheck.mjs`) |

## Graft (cell geometry EXACT)
`node scripts/anim-pass-graft.mjs --sheet char-tavernkeeper-sheet-walk8 --grid 8x4 --row 2 --src …/tavernkeeper-east-4x2.png --src-grid 4x2 --match-row 1`

The row was wiped to pure key, then each figure scaled by **0.7295** (source median height 403 → row-1 reference median 294) and seated with its feet on row 1's median ground line at row 1's median centre. Grafted heights **293–295 px**. The sheet keeps its filename, its 2240×1360 dimensions and its 8×4 grid; **no cell boundary moved**.

## Gates
`node scripts/extract-alpha.mjs --key ff00ff --grid 8x4` → 32/32 cells @512, keyed 74.5%, spill-cleared 3527 px, despilled 6243 px.
Re-measured: bleed across cuts **0**, clipped cells **0**, baseline spread **1 px**, halo **0.092%**, height spread 5.1%.
Facing screen: **LR-SAME-FACING (d3/m41) → LR-PAIR-OK (m6/d44)**.
Pre-mend raw blob: `e2a64184fd19d26094208a26467ff0820719a2d6`.

## Not done here
The identical defect in `char-coalthief-sheet-walk4-a` row 1 and `char-railtough-sheet-walk4-a` row 1 (both need 4 **west**-facing frames) is unmended — same graft path, one generation each.
