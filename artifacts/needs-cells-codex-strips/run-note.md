# Needs-cells Codex strips — run note

Date: 2026-09-18 ICT  
Task: `art--20260918-205411-art-needs-cells-codex-strips.md`  
Generator: native Codex `image_gen` (built-in); the tool did not report a model name or request IDs. The `exec-*` artifact names below are the only returned generation identifiers.  
QA tool: Node.js + `sharp` from `/Users/robin/Claude/Projects/Gold Rush/node_modules`; the Wrecker lamp uses `artifacts/needs-cells-art-batch/eye-check.mjs`'s exact saturated-orange predicate and largest 4-connected component. Visual review used the original-resolution PNGs. OCR cross-check used Tesseract `--psm 11` and was manually adjudicated because hatching produced false-positive punctuation/letters.

## Outcome

**Seven of seven sheets are PARKED. Nothing is knowingly handed forward as landed.** All selected files are 1024×1024 RGB PNGs and preserve the best generated take under a `-parked` filename.

The native tool returned its square renders at 1254×1254 even when the prompt said exactly 1024×1024. Each selected square was therefore normalized once as a whole sheet to 1024×1024 with `sharp.resize(1024, 1024, { fit: 'fill', kernel: 'lanczos3' }).removeAlpha().png()`. No cells were extracted, repositioned, independently scaled, measured against the runtime, wired, or registered.

The model also rendered a visually flat magenta field rather than exact `#ff00ff`: after normalization only 1–17 pixels per cell are exact `#ff00ff`, while roughly 210k–238k pixels per cell are near-magenta but not exact. This independently fails the purity bar on every sheet. It was not repaired because palette snapping/despill would be processing outside this generation-only slice.

## Reference-path correction

The task named the landed Steam Wrecker southwest references as `char-steamwrecker-sw4-v1-r0c0.png … r0c3.png`. Only `r0c0` and `r0c1` exist. The actual four 2×2 cells are:

- `char-steamwrecker-sw4-v1-r0c0.png`
- `char-steamwrecker-sw4-v1-r0c1.png`
- `char-steamwrecker-sw4-v1-r1c0.png`
- `char-steamwrecker-sw4-v1-r1c1.png`

Those four, plus `char-steamwrecker-sheet-walk4-a-r0c0.png` through `r0c3.png`, were all attached through one temporary eight-cell reference montage written to the authorized Wrecker destination and overwritten by the generated result.

The built-in tool accepts at most five reference paths. For every Jumper call, all eight required source cells were therefore attached through reference montages: north `char-jumper-sheet-walk4-b-r0c0.png` through `r0c3.png`, and west `r2c0.png` through `r2c3.png`. Retake 2 additionally attached the preceding current take as the explicit scale reference. The montages occupied only already-authorized destination paths and were overwritten/removed; no extra artifact remains.

## Exact prompt encoding

Each generated prompt is exactly the listed quoted components joined in the stated order with one ASCII space. This avoids duplicating the same long verbatim clauses 21 times while still reproducing every exact prompt.

### Verbatim shared components

`OUTPUT`

> OUTPUT CONTRACT: Render one opaque RGB square image exactly 1024 by 1024 pixels. Transparency is forbidden. The required background is visibly rendered pure solid #ff00ff, not transparent, black, white, or checkerboard.

`sheet4`

> THE PICTURE: one single flat pure magenta #ff00ff field fills the whole image from edge to edge. Standing on that magenta field are EXACTLY FOUR separate full-length drawings of the same character, all exactly the same size: EXACTLY TWO spread evenly across the upper half of the image and EXACTLY TWO spread evenly across the lower half, four in total, never three and never five. Taken left to right along the top and then left to right along the bottom they are walk-cycle phases 1 to 4 of one continuous loop.

`RENDER`

> THIS IS A CONTINUATION OF AN EXISTING SPRITE SHEET. The new cells must be INDISTINGUISHABLE from the attached reference cells in technique, palette, value range and level of detail — as if painted by the same hand in the same sitting. Technique: soft painterly ink-and-wash over a light graphite underdrawing, fine cross-hatching for shadow, thin and varied line weight, contours that melt into the shading, muted low-saturation dusty pigment, warm sepia key light. STRICTLY FORBIDDEN: thick uniform black outlines of any kind, dark keylines around the silhouette, flat cel-shaded blocks of colour, saturated comic-book colour, poster or vector-icon rendering, sticker edges, cartoon proportions.

`WRECKER`

> The subject is the SAME machine as in the reference image, the Steam Wrecker: a squat brass spider-boiler on four short jointed brass legs with bell-shaped feet, a riveted spherical boiler body, two slim chimneys venting soft white steam, one round amber-glowing porthole eye on its FRONT face only, one small teal-glass gauge panel on its body-LEFT flank, and two curled open-jawed wrench arms reaching forward. Keep its build, palette, brass tone, line weight and ink-hatched shading exactly as the reference.

`JUMPER`

> The character is the SAME figure as in the reference image, the Claim Jumper: a wiry crouching frontier outlaw in a flat-brimmed straw hat, a ragged rust-red woollen poncho or kerchief over the shoulders, a tan canvas shirt and dusty ochre canvas trousers with a small satchel at the hip, worn boots and wrapped forearms, hunched low in a prowling walk. Keep his costume, palette, proportions, line weight and ink-hatched shading exactly as the reference.

`SAME_ANGLE`

> The attached reference shows this same subject from ONE camera angle in four walk phases; copy its drawing, its costume and its technique exactly and change only what the heading above requires.

`HALFWAY`

> The attached reference sheet shows this same subject from the TWO camera angles either side of the one you must draw. Copy the costume, the palette and the drawing technique from the references — but NOT their camera angle: the new drawings are EXACTLY HALFWAY between the two reference angles, a true 45-degree three-quarter turn, the same 45 degrees in all four of them. Prove the turn in the drawing: the silhouette is visibly ASYMMETRIC about its vertical centre line, one side of the body is clearly nearer the camera and drawn larger than the other, and the near side overlaps the far side.

`phases4`

> The four drawings are four clearly DIFFERENT moments of one stride and no two of them repeat: (1) CONTACT - the legs at their widest, the leading heel just landed and the trailing toe still down; (2) DOWN - the legs close together under the body, the body at its lowest, the back foot lifting; (3) PASSING - the back leg swings through with the knee bent and lifted, the feet almost together; (4) UP - the body at its highest, pushing off the back toe, the leading leg reaching forward. The stride is wide in 1 and narrow in 3, and the head rises and falls with it. Arms swing in counter-time to the legs. EVERY figure is seen from EXACTLY the same camera angle and the same distance; nothing about the viewing angle, the body, the costume, the colour, the size or the drawing style changes between them — only the walking pose. This is NOT a turnaround and NOT a character sheet of different views.

`ANCHOR`

> Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image.

`SHEET_LAW`

> The magenta field is completely empty apart from those figures: nothing is drawn on it, over it or around it, and it is the same flat pure magenta everywhere, right into the corners. Each figure is drawn independently — never a mirrored, flipped or copied version of another — and every one of them is the same character at the same size with the same costume and colours. Each figure stands well inside the picture with a generous band of empty magenta above the head, below the feet and on both sides, and the feet of every figure sit at the same height as each other. No text, letters, numerals, signature or watermark anywhere. No firearms. No blood.

`SCALE_W`

> SCALE RETAKE: Make the machine substantially smaller than the prior take. In each 512-pixel cell, the full machine including steam from the tallest chimney to the bottom of the lowest bell foot occupies exactly 240 pixels, 47 percent of the cell height. All four machines must stay within 12 pixels of one another in height, and their lowest bell feet must lie on one common horizontal line.

`SCALE_J`

> SCALE RETAKE: In each 512-pixel cell, the full figure from the top of the hat to the bottom of the lowest boot occupies exactly 328 pixels, 64 percent of the cell height. All four figures must stay within 12 pixels of one another in height, and their lowest boot soles must lie on one common horizontal line.

### Exact facing components

`WRECKER_SE`

> The reference already shows the exact camera angle you must draw: the machine walking SOUTH-EAST, toward the viewer and toward the RIGHT edge of the picture. Keep that angle exactly in all four drawings. The amber porthole eye is LIT AND CLEARLY VISIBLE in every one of the four, the teal gauge panel sits on the left of the boiler, and one wrench arm reaches toward the lower right.

`JUMPER_S`

> In every cell he is seen FROM DIRECTLY IN FRONT, walking south, straight toward the viewer, out of the depth of the picture: we see his face beneath the straw hat brim, the front of the rust-red poncho, his chest and the fronts of both boots. This is the true opposite view of the north reference; it is NOT a flipped copy — the satchel and poncho fall where the other side of his body really puts them.

`JUMPER_E`

> In every cell he is seen in RIGHT-FACING SIDE PROFILE, walking east — his nose, hat brim, chest, knees and boots all point to the RIGHT edge of the cell, his back to the LEFT edge. This is the true opposite-side view of the west reference; it is NOT a mirrored copy — the satchel and the poncho fall where the other side of his body really puts them.

`JUMPER_SE`

> In every cell he is walking SOUTH-EAST, halfway between the south and east views, toward the viewer and toward the RIGHT edge. His face is visible under the hat brim; his chest, knees and boots point down and right; his body is turned 45 degrees, with the left side nearer the camera and overlapping the far side.

`JUMPER_SW`

> In every cell he is walking SOUTH-WEST, halfway between the south view and the west reference, toward the viewer and toward the LEFT edge. His face is visible under the hat brim; his chest, knees and boots point down and left; his body is turned 45 degrees, with the right side nearer the camera and overlapping the far side.

`JUMPER_NE`

> In every cell he is walking NORTH-EAST, halfway between the north reference and the east view, away from the viewer and toward the RIGHT edge. His face and eyes are NOT VISIBLE; we see his back beneath the straw hat brim; his knees and boots point up and right; his body is turned 45 degrees, with the right side farther into the picture.

`JUMPER_NW`

> In every cell he is walking NORTH-WEST, halfway between the north reference and the west reference, away from the viewer and toward the LEFT edge. His face and eyes are NOT VISIBLE; we see his back beneath the straw hat brim; his knees and boots point up and left; his body is turned 45 degrees, with the left side farther into the picture.

### Take formulas and changed premises

- Wrecker take 1 (`exec-3bb5c8ef-edb5-4b6e-b57e-2963b968cb52`): `[sheet4, RENDER, WRECKER, WRECKER_SE, SAME_ANGLE, phases4, ANCHOR, SHEET_LAW]`. Failed: 1774×887 with transparent field.
- Wrecker retake 1 (`exec-e4c2acae-97ca-4928-8cdb-339c7eea9371`): `[OUTPUT, sheet4, RENDER, WRECKER, WRECKER_SE, SAME_ANGLE, phases4, ANCHOR, SHEET_LAW]`. Changed premise: explicit square opaque RGB canvas. Fixed opacity/aspect but figures measured 292–318 px, far above the 228–252 band.
- Wrecker retake 2 (`exec-77e2ae3a-d200-46a0-ad13-ac6dbe9aebe6`, selected): `[OUTPUT, SCALE_W, sheet4, RENDER, WRECKER, WRECKER_SE, SAME_ANGLE, phases4, ANCHOR, SHEET_LAW]`. Changed premise: explicit 240 px / 47% scale and common foot line. Lamp passed, but heights under-corrected to 215–232 px and foot baselines split by 55 px.
- Every Jumper take 1: `[OUTPUT, sheet4, RENDER, JUMPER, FACING, ANCHORING, phases4, ANCHOR, SHEET_LAW]`.
- Every Jumper retake 1: `[OUTPUT, SCALE_J, sheet4, RENDER, JUMPER, FACING, ANCHORING, phases4, ANCHOR, SHEET_LAW]`. Changed premise: explicit 328 px / 64% height and common foot line. It overscaled all six sheets.
- Every Jumper retake 2: `[OUTPUT, FINAL_SCALE_DIRECTION, sheet4, RENDER, JUMPER, FACING, ANCHORING, phases4, ANCHOR, SHEET_LAW]`, where `ANCHORING` is `SAME_ANGLE` for S/E and `HALFWAY` for diagonals. Changed premise: attached the too-large current take and ordered a direction-specific shrink.

The exact `FINAL_SCALE_DIRECTION` strings were:

- S: `FINAL SCALE RETAKE: The attached current take is too large. Redraw all four figures 16 percent smaller than that current take, without changing the camera heading. In each 512-pixel cell, the full figure from the top of the hat to the bottom of the lowest boot must be 312 to 344 pixels tall (61 to 67 percent), all four within 12 pixels of one another, with their lowest boot soles on one common horizontal line.`
- E: same string with `11 percent smaller`.
- SE: same string with `11 percent smaller`.
- SW: same string with `8 percent smaller`.
- NE: same string with `9 percent smaller`.
- NW: same string with `6 percent smaller`.

Jumper take identifiers, in take 1 / retake 1 / retake 2 order:

| sheet | identifiers | selected |
|---|---|---|
| S | `exec-eb1cd64c-8d7b-429e-b8dd-59e0740df624` / `exec-37d2eda7-f8bb-4b56-a86d-b597dd9275ee` / `exec-ca25ce3d-c88f-4525-917f-14d9e78a589f` | retake 2 |
| E | `exec-c68015c5-cef8-4885-b9b5-a8ebe0143305` / `exec-ce02b539-bdc1-49c7-a3a0-d4d4b297b6f7` / `exec-c0cc4535-7c93-48e3-9865-8a85f87e7426` | take 1 |
| SE | `exec-92d57034-8415-4abc-a587-b386d7922b5b` / `exec-867610a9-b142-4201-9576-ed9e5778a1b1` / `exec-cc5a50db-495d-417a-b64f-4ee0e8645e7b` | take 1 |
| SW | `exec-f5179aad-d2d6-4ea1-b153-6406ebb23ad7` / `exec-ac17e2cf-3b63-4fe3-acd3-ceb3d34406b0` / `exec-2e8e5812-b0df-4873-ba4d-458ad1106a36` | take 1 |
| NE | `exec-6390b265-deeb-4ce0-9996-c827d96b97aa` / `exec-8511f078-2a37-44fb-91ff-98e1485ac363` / `exec-e94d6635-ada0-44f1-9fab-6e7109500260` | retake 2 |
| NW | `exec-254d007c-ce27-4767-a766-e7cb84c1bb68` / `exec-ae11f7f3-e743-4a82-ab81-b34491c63256` / `exec-e089cb5c-71f6-4175-ba33-417048e4b099` | retake 2 |

## Selected-result measurements

Foreground bbox excludes the near-magenta field using `r >= 200 && g <= 90 && b >= 190 && r + b >= 430`. Heights and foot Y are cell-local. `near-not-pure` counts pixels with `r >= 200 && g <= 80 && b >= 200` that are not exact `255,0,255`. The mirrored-pair check compares every cell pair after horizontally flipping one member and reports the lowest foreground-union RGB MAE; none is an exact mirror.

| verdict / file | heights px (% of 512), cells 1–4 | foot Y, cells 1–4 (range) | near-not-pure px, cells 1–4 | closest flipped pair / MAE | other visual checks |
|---|---|---|---|---|---|
| **PARKED** `char-steamwrecker-se4-codex-v1-parked.png` | 221 (43.16), 215 (41.99), 224 (43.75), 232 (45.31) | 406/406/351/351 (55) | 237660/237927/237958/236148 | 3–4 / 86.71 | SE/front lamp visible in all four; teal flank panel visible; no text/firearm/gore |
| **PARKED** `char-jumper-s4-codex-v1-parked.png` | 346 (67.58), 338 (66.02), 353 (68.95), 366 (71.48) | 449/448/394/400 (55) | 219888/220848/222359/219694 | 3–4 / 73.30 | front/south read; no text/firearm/gore |
| **PARKED** `char-jumper-e4-codex-v1-parked.png` | 310 (60.55), 307 (59.96), 309 (60.35), 310 (60.55) | 431/430/388/388 (43) | 221949/225760/227268/223773 | 2–3 / 93.85 | right-facing east profile; no text/firearm/gore |
| **PARKED** `char-jumper-se4-codex-v1-parked.png` | 315 (61.52), 303 (59.18), 313 (61.13), 338 (66.02) | 419/421/391/395 (30) | 224600/226836/227674/222758 | 1–2 / 96.29 | face visible, down/right three-quarter read; no text/firearm/gore |
| **PARKED** `char-jumper-sw4-codex-v1-parked.png` | 320 (62.50), 308 (60.16), 323 (63.09), 329 (64.26) | 425/425/402/402 (23) | 223469/225787/226616/223164 | 1–2 / 91.60 | face visible, down/left three-quarter read; no text/firearm/gore |
| **PARKED** `char-jumper-ne4-codex-v1-parked.png` | 323 (63.09), 315 (61.52), 326 (63.67), 326 (63.67) | 440/440/400/400 (40) | 223212/226615/226811/224936 | 3–4 / 86.28 | back visible, up/right three-quarter read; no text/firearm/gore |
| **PARKED** `char-jumper-nw4-codex-v1-parked.png` | 327 (63.87), 316 (61.72), 331 (64.65), 338 (66.02) | 438/438/404/405 (34) | 221274/225292/226785/222591 | 1–2 / 90.62 | back/side visible, up/left three-quarter read; no text/firearm/gore |

Wrecker lamp blobs: **137 / 141 / 115 / 129 px** — all four exceed the required 90 px. Wrecker is parked for scale, baseline, and field purity, not for the lamp.

Tesseract returned small false-positive fragments such as `¢`, `BR`, `RP`, and digits from cross-hatching, buckles, and rivets. Original-resolution visual review confirms there are no drawn letters, numerals, signatures, or watermarks in any selected sheet.

## Selected file hashes

| file | bytes | SHA-256 |
|---|---:|---|
| `char-jumper-e4-codex-v1-parked.png` | 1,129,206 | `e62cf8d0999fd6b483edc423066d1501cd6cf566e7b6e3974dcfd22fdfc3f08a` |
| `char-jumper-ne4-codex-v1-parked.png` | 1,121,688 | `7c74f0b3f383b3427bb6016076261bca96602c8b86f4ca2b6f68b0e55ddd4e64` |
| `char-jumper-nw4-codex-v1-parked.png` | 1,134,142 | `e479b566fbcd1aebfa723dd903ef6912ede49e703c44467f501ebf074074e1e4` |
| `char-jumper-s4-codex-v1-parked.png` | 1,166,969 | `f8e04c3a939878de338f07c53619334521cff9b1205f56cedd94139713608fa7` |
| `char-jumper-se4-codex-v1-parked.png` | 1,110,856 | `38324e7984d998fcd92bc34062f10fa79edc55ce0b893e5371107c8e74ce4dce` |
| `char-jumper-sw4-codex-v1-parked.png` | 1,115,807 | `93ef9dc53679191cd8649e40ea1d5826a6bc550ef0cd0cfe468e3939484912cf` |
| `char-steamwrecker-se4-codex-v1-parked.png` | 1,020,743 | `af67af7b3dd3520afc4d51a2c5d29d1faa1c40095c30bf5cb5cd62f16671372b` |

## DRAFT LEDGER row

| date | batch | generator | outputs | cells | takes | QA / verdict |
|---|---|---|---|---:|---:|---|
| 2026-09-18 | `needs-cells-codex-strips` | native Codex `image_gen`; model not reported; no request IDs returned | seven `assets/raw/*codex-v1-parked.png` files listed above | 28 generated cells retained only as parked evidence | 21 successful generations (3 per sheet), plus one rejected pre-call caused by the native tool's five-reference limit | **0 LANDED / 7 PARKED.** Wrecker lamp 137/141/115/129 passes; Wrecker heights 215–232 fail 228–252. Jumper selected heights shown above; NE alone passes height plus ≤12 px height spread, but all sheets fail common cell-local foot baseline (range 23–55 px). Every sheet fails exact-magenta purity (roughly 210k–238k near-not-pure field pixels per cell). No exact mirrored pair, actual text, firearm, or gore. Whole sheets normalized from native 1254² to required 1024²; no extraction or wiring. |

## Final gate handoff

READY-FOR-GATES

- Steam Wrecker SE: **PARKED** — heights 221/215/224/232 px; lamps 137/141/115/129 px.
- Claim Jumper S: **PARKED** — heights 346/338/353/366 px.
- Claim Jumper E: **PARKED** — heights 310/307/309/310 px.
- Claim Jumper SE: **PARKED** — heights 315/303/313/338 px.
- Claim Jumper SW: **PARKED** — heights 320/308/323/329 px.
- Claim Jumper NE: **PARKED** — heights 323/315/326/326 px; height band passes, foot baseline and field purity fail.
- Claim Jumper NW: **PARKED** — heights 327/316/331/338 px.
