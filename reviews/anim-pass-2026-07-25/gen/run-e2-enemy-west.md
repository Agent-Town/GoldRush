# Art run — coal thief + rail tough WEST rows (animation pass mend F-A2)
**Date:** 2026-07-26 · **Slots:** `char.e2.coal_thief`, `char.e2.rail_tough`, row 1 · **Arm:** Codex `image_gen` (gpt-image-2) via `codex exec -m gpt-5.6-sol` · **Session:** attended Opus 5, branch `anim/opus5-pass`

## Why
The contract's `walk4` block for both slots reads row0 `s`, row1 `w`, row2 `e`, row3 `n`. Both sheets drew **rows 1 and 2 as eastward views**, so each enemy faced backwards whenever it travelled west. Screened by `anim-pass-facing.mjs` (rows 1/2 matching directly rather than mirrored) and confirmed by eye in `../crops/ct-r1r2.png` and `../crops/rt-r1r2.png`.

## Prompts (as issued)
Both: ONE image, **2 columns × 2 rows** of equal cells, 4 frames of a walk cycle walking **WEST** — nose, hat brim, boot toes and body pointing to the viewer's left. Order left→right, top row then bottom: contact(near foot fwd), passing, contact(far foot fwd), passing. Same binding format block as the tavernkeeper run (flat `#ff00ff`, no text/borders/watermarks, identical outfit and scale in every cell, constant eye-line, each figure inside its own cell, no duplicated or mirrored frames, no firearms, not gory) and the same house style anchor verbatim.

- **coal thief:** lean wiry frontier coal thief, face covered by a dark bandana below the eyes, wide-brimmed slouch hat, ragged sleeveless jerkin over a grubby shirt with bare forearms, a large bulging black sack of coal hoisted over one shoulder and steadied with one hand, patched trousers, worn boots; hunched, furtive, low silhouette. Conditioned on `assets/raw/char-coalthief-sheet-walk4-a.png`.
- **rail tough:** burly rail-company enforcer, dark beard and heavy moustache, black bowler hat, long slate-blue company greatcoat with brass-riveted shoulder pauldrons and a brass badge, wide leather belt, heavy studded gloves, a long steel pipe wrench in one hand, heavy boots; broad, slow, intimidating. Conditioned on `assets/raw/char-railtough-sheet-walk4-a.png`.

## Output
- `reviews/anim-pass-2026-07-25/gen/coalthief-west-2x2.png` — 1254 × 1254, key `#f804f7`
- `reviews/anim-pass-2026-07-25/gen/railtough-west-2x2.png` — 1254 × 1254, key `#f804f7`
- one generation each, no retakes.

## Measured self-QA
| check | coal thief | rail tough |
|---|---|---|
| source figure heights | 441, 445, 443, 440 — spread **5 px** | 484, 488, 489, 493 — spread **9 px** |
| grafted figure heights vs reference row 2 | 244–251 vs **248** | 271–276 vs **274** |
| facing | 4/4 west — **eye-verified**, `../crops/lr-enemies-mended.png` tiles 0–1 | 4/4 west — tiles 2–3 |
| facing screen | LR-SAME-FACING (d42/m66) → **LR-PAIR-OK** (m34/d74) | (d60/m74) → **LR-PAIR-OK** (m23/d69) |
| duplicates surviving full-res proof | **0** | **0** |
| re-extraction | 16/16 cells, keyed 70.2% | 16/16 cells, keyed 74.7%, bleed 0, clipped 0, baseline spread 3px |

## A bug this run found in the graft tool — worth keeping
The first rail tough graft placed frame 2 at **height 324 against a 274 reference, at cell-local y = −41**: partly above the cell, clipped. Cause: the tool aligned **bbox bottoms**, and that frame's wrench hangs 96 px *below the boots*, so the wrench tip was seated on the ground line and the whole figure levered upward.

Fixed by measuring a **foot line** instead — the lowest scanline carrying a run of at least 12% of the figure's width, which a thin prop tip cannot satisfy. Figure height and placement now both derive from the feet, so props may hang below the ground line without moving the body. Frame 2 re-measured 489 (not 585) and grafted to 274. The sheets were restored from their pre-graft blobs (`git cat-file blob`) and re-grafted from clean.

**Known residual:** rail tough `r1c2` still loses the last **23 scanlines** of the wrench tip to the cell floor — the cell has 32 px below the reference foot line and that frame's wrench wants 54. The shipped cell still reads as a whole wrench (`assets/processed/char-railtough-sheet-walk4-a-r1c2.png`, inspected).

## Style note, honestly
The generated frames carry slightly heavier ink outlines than the softest of the original painted rows. The coal thief's original art is already heavily inked and the match is close; the rail tough's new row is a touch crisper than his old one. Judged acceptable at gameplay zoom — flagged here so the owner can overrule at the gallery rather than discover it.

## Style/canon compliance
No firearms in any frame (ADR-001). No text, letters or watermarks. Enemies are outlaws and company men, not peoples (§4.9). Nothing gory.
