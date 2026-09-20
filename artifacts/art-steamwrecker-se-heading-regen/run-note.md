# Steam Wrecker south-east heading regeneration — run note

Date: 2026-09-19 ICT  
Task: `art--20260919-214700-art-steamwrecker-se-heading-regen.md`  
Generator: native Codex `image_gen` (built-in); no model name or request IDs were returned.  
Outcome: **PARKED** — all three takes read south-east by the lamp-offset instrument, but none clears the complete scale + lamp + canvas contract.

## References

All eight required cardinal-neighbour cells were used:

- SOUTH: `/Users/robin/Claude/Projects/Gold Rush/assets/processed/char-steamwrecker-sheet-walk4-a-r0c0.png` through `r0c3.png`
- EAST: `/Users/robin/Claude/Projects/Gold Rush/assets/processed/char-steamwrecker-sheet-walk4-a-r2c0.png` through `r2c3.png`

The native tool accepts at most five paths. The eight cells were therefore attached through one temporary 4x2 montage, SOUTH on the upper row and EAST on the lower row, written only at an authorized destination and overwritten or removed after each call. The final retake also attached the preceding 1024-square take as its scale reference. No south-west row was attached.

## Exact prompt components

Each formula below means the quoted components were joined in the listed order with one ASCII space.

`OUTPUT`

> OUTPUT CONTRACT: Render one opaque RGB square image exactly 1024 by 1024 pixels. Transparency is forbidden. The required background is visibly rendered pure solid #ff00ff, not transparent, black, white, or checkerboard.

`SCALE_1`

> SCALE CONTRACT: In each 512-pixel cell, the full machine including steam from the tallest chimney to the bottom of the lowest bell foot occupies exactly 240 pixels, 47 percent of the cell height. All four machines must stay within 12 pixels of one another in height.

`SCALE_2`

> FINAL SCALE RETAKE: The attached current take is too large. Redraw all four machines exactly 25 percent smaller than that current take, without changing the camera heading. In each 512-pixel cell, the full machine including steam from the tallest chimney to the bottom of the lowest bell foot must be 228 to 252 pixels tall, all four within 12 pixels of one another.

`sheet4`

> THE PICTURE: one single flat pure magenta #ff00ff field fills the whole image from edge to edge. Standing on that magenta field are EXACTLY FOUR separate full-length drawings of the same character, all exactly the same size: EXACTLY TWO spread evenly across the upper half of the image and EXACTLY TWO spread evenly across the lower half, four in total, never three and never five. Taken left to right along the top and then left to right along the bottom they are walk-cycle phases 1 to 4 of one continuous loop.

`RENDER`

> THIS IS A CONTINUATION OF AN EXISTING SPRITE SHEET. The new cells must be INDISTINGUISHABLE from the attached reference cells in technique, palette, value range and level of detail — as if painted by the same hand in the same sitting. Technique: soft painterly ink-and-wash over a light graphite underdrawing, fine cross-hatching for shadow, thin and varied line weight, contours that melt into the shading, muted low-saturation dusty pigment, warm sepia key light. STRICTLY FORBIDDEN: thick uniform black outlines of any kind, dark keylines around the silhouette, flat cel-shaded blocks of colour, saturated comic-book colour, poster or vector-icon rendering, sticker edges, cartoon proportions.

`WRECKER`

> The subject is the SAME machine as in the reference image, the Steam Wrecker: a squat brass spider-boiler on four short jointed brass legs with bell-shaped feet, a riveted spherical boiler body, two slim chimneys venting soft white steam, one round amber-glowing porthole eye on its FRONT face only, one small teal-glass gauge panel on its body-LEFT flank, and two curled open-jawed wrench arms reaching forward. Keep its build, palette, brass tone, line weight and ink-hatched shading exactly as the reference.

`HEADING`

> The machine is walking DIAGONALLY toward the viewer AND toward the RIGHT edge of the picture — exactly halfway between the attached SOUTH view (facing the camera) and the attached EAST view (walking to the right). Its amber porthole eye sits to the RIGHT of the boiler's centre line, about a quarter of the way toward the right edge of the machine, lit in all four cells; the near (right-hand) wrench arm reaches toward the LOWER RIGHT corner; the far wrench arm is partly hidden behind the boiler on the LEFT. The teal gauge panel is on the machine's LEFT flank and is therefore mostly hidden in this view. Nothing about this machine is mirrored from any reference.

`SAME_ANGLE`

> The attached reference shows this same subject from ONE camera angle in four walk phases; copy its drawing, its costume and its technique exactly and change only what the heading above requires.

`phases4`

> The four drawings are four clearly DIFFERENT moments of one stride and no two of them repeat: (1) CONTACT - the legs at their widest, the leading heel just landed and the trailing toe still down; (2) DOWN - the legs close together under the body, the body at its lowest, the back foot lifting; (3) PASSING - the back leg swings through with the knee bent and lifted, the feet almost together; (4) UP - the body at its highest, pushing off the back toe, the leading leg reaching forward. The stride is wide in 1 and narrow in 3, and the head rises and falls with it. Arms swing in counter-time to the legs. EVERY figure is seen from EXACTLY the same camera angle and the same distance; nothing about the viewing angle, the body, the costume, the colour, the size or the drawing style changes between them — only the walking pose. This is NOT a turnaround and NOT a character sheet of different views.

`ANCHOR`

> Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image.

`SHEET_LAW`

> The magenta field is completely empty apart from those figures: nothing is drawn on it, over it or around it, and it is the same flat pure magenta everywhere, right into the corners. Each figure is drawn independently — never a mirrored, flipped or copied version of another — and every one of them is the same character at the same size with the same costume and colours. Each figure stands well inside the picture with a generous band of empty magenta above the head, below the feet and on both sides, and the feet of every figure sit at the same height as each other. No text, letters, numerals, signature or watermark anywhere. No firearms. No blood.

## Takes and measurements

Foreground bboxes exclude the near-magenta field with `r >= 200 && g <= 90 && b >= 190 && r + b >= 430`. Lamp blobs use the existing largest 4-connected saturated-orange predicate. Lamp offset is `(lamp centroid X - silhouette bbox centre X) / silhouette width * 100`; positive is right of centre and therefore south-east. Flip MAE is over the foreground union after horizontally flipping one cell. OCR was manually adjudicated against the rendered image because hatching and rivets produce fragments.

### Take 1 — invalid canvas

- Identifier: `exec-849da8cb-1583-4283-94de-8d3121dac9de`
- Prompt: `[sheet4, RENDER, WRECKER, HEADING, SAME_ANGLE, phases4, ANCHOR, SHEET_LAW]`
- Native result: 1774x887 RGBA with a transparent field, not the required opaque 1024 square.
- Measurement basis: virtual 1024x1024 whole-image normalization in memory only; no processed file was written.
- Heights: 350 (68.36%), 327 (63.87%), 331 (64.65%), 342 px (66.80%).
- Lamp blobs: 67, 56, 40, 65 px.
- Lamp offsets: **+23.04%, +20.78%, +24.30%, +19.65%**.
- Purity, exact / near-not-pure per virtual cell: 4/0, 3/0, 7/0, 5/0; the apparent zero is because the forbidden field was transparent rather than magenta.
- Closest flip comparison: cells 1-2, MAE 84.16; not identical and not mirrors.
- Text check: Tesseract emitted punctuation/digit-like fragments; eyes-on found no actual letters, numerals, signature, or watermark. No firearm or gore.
- Verdict: **FAIL** — south-east heading passes, but canvas, scale, and lamp size fail.

### Retake 1 — heading passes, oversized

- Identifier: `exec-06dbf876-4636-48e0-a462-fcb9c660f3d3`
- Prompt: `[OUTPUT, SCALE_1, sheet4, RENDER, WRECKER, HEADING, SAME_ANGLE, phases4, ANCHOR, SHEET_LAW]`
- Changed premise: explicit opaque square plus 240 px / 47% target scale.
- Native result: 1254x1254 RGB; normalized once as a whole sheet to 1024x1024 with Lanczos3. No cell extraction or per-cell transform.
- Heights: 324 (63.28%), 320 (62.50%), 327 (63.87%), 327 px (63.87%).
- Lamp blobs: **129, 140, 153, 102 px** — all pass 90.
- Lamp offsets: **+20.27%, +20.93%, +18.90%, +20.54%** — all read south-east.
- Purity, exact / near-not-pure per cell: 3/211766, 3/215111, 2/214836, 2/213402.
- Closest flip comparison: cells 1-2, MAE 91.61; not identical and not mirrors.
- Text check: Tesseract emitted `fe. Se`-like fragments; eyes-on found no actual letters, numerals, signature, or watermark. No firearm or gore.
- Verdict: **FAIL** — heading and lamp pass; every height exceeds the 228-252 px band.

### Retake 2 — selected parked candidate

- Identifier: `exec-f6fc8054-6688-4a4f-84ee-cd516a796236`
- Prompt: `[OUTPUT, SCALE_2, sheet4, RENDER, WRECKER, HEADING, SAME_ANGLE, phases4, ANCHOR, SHEET_LAW]`
- Changed premise: attach retake 1 as the scale reference and shrink it exactly 25% while preserving its heading.
- Native result: 1254x1254 RGB; normalized once as a whole sheet to 1024x1024 with Lanczos3. No cell extraction or per-cell transform.
- Heights: **273 (53.32%), 268 (52.34%), 278 (54.30%), 277 px (54.10%)**.
- Lamp blobs: **66, 88, 83, 77 px** — all below 90.
- Lamp offsets: **+20.64%, +18.25%, +17.74%, +20.37%** — all read south-east.
- Purity, exact / near-not-pure per cell: 1/225491, 0/227652, 3/227219, 2/226424.
- Closest flip comparison: cells 3-4, MAE 91.66; not identical and not mirrors.
- Text check: Tesseract emitted `By &`-like fragments; eyes-on found no actual letters, numerals, signature, or watermark. No firearm or gore.
- SHA-256: `4cc7696c74afedbfe025bba5a5254ccb09e6c7bf5bbeae1ff555989dd2e65a7a`.
- Verdict: **PARKED** — this is the closest scale result and its heading is unambiguously south-east, but all heights remain 16-26 px above band and all lamps miss the 90 px threshold.

## Selected file

`/Users/robin/Claude/Projects/Gold Rush/worktrees/art/assets/raw/char-steamwrecker-se4-codex-v2-parked.png`

The unqualified `char-steamwrecker-se4-codex-v2.png` path is intentionally absent. No failing row is handed forward as landed.

## DRAFT LEDGER row

| date | batch | generator | output | cells | takes | QA / verdict |
|---|---|---|---|---:|---:|---|
| 2026-09-19 | `art-steamwrecker-se-heading-regen` | native Codex `image_gen`; model and request IDs not reported | `assets/raw/char-steamwrecker-se4-codex-v2-parked.png` | 4 generated cells, parked only | 3 | **PARKED.** Selected offsets +20.64/+18.25/+17.74/+20.37% all prove south-east; heights 273/268/278/277 exceed 228-252; lamp blobs 66/88/83/77 miss >=90; no mirror, actual text, firearm, or gore; near-not-pure field 225491/227652/227219/226424. |

## Gate handoff

READY-FOR-GATES

- Lamp offsets: **+20.64%, +18.25%, +17.74%, +20.37%**.
- Heights: **273, 268, 278, 277 px** (**53.32%, 52.34%, 54.30%, 54.10%** of a 512 px cell).
- **PARKED**.
