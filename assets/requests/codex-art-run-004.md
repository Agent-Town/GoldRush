# Codex Art Run 004 - walk4 hero + claim jumper

Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260706-071823-032-art-walk4-hero-jumper.md`

Mode: built-in Codex `image_gen` / GPT Image 2, copied from `/Users/robin/.codex/generated_images/019f34ca-5529-7402-a0f3-0ae0851fe824/` into `assets/raw/`.

Scope: raw generation only. No `assets/processed/`, layer contracts, `src/`, specs, reviews, or e2e files touched.

## Inputs read

- `CLAUDE.md` section 7 image pipeline.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` header and current character sheet rows.
- Reference cells: `assets/processed/char-hero-sheet-rotation2-r*c*.png` and `assets/processed/char-jumper-sheet-rotation-r*c*.png`.

Reference bbox bands measured before generation:

| Reference | Cells | Bbox height band |
|---|---:|---:|
| `char-hero-sheet-rotation2-r*c*.png` | 8 | 316-379 px, avg 349.6 |
| `char-jumper-sheet-rotation-r*c*.png` | 12 | useful walking cells 298-332 px; old crouch idle 238 px |

## Burn count

- New image generations: 4
- Retries: 0
- Rejected sheets: 0

## Prompt used

All four prompts used the same shared constraints:

> Frontier Ledger game art: antique frontier expedition ledger map, fine sepia engraved linework and hatching, subtle aged-paper texture inside the character only, muted warm colors, illustrated, not photorealistic, not pixel art, not saturated. One single square image, exact 4x4 grid of 16 equal invisible cells, no visible borders, no labels, no text. Columns left to right are gait phases: contact, down, passing, up. Contact has the longest stride, down has bent knees/lower body, passing has legs crossing under body, up has lifted heel/highest body. Keep figure height consistent in every cell, matching the reference scale band. Center each figure in its cell with feet near the cell bottom and hat near the cell top. Perfectly flat solid uniform bright magenta hex #ff00ff across the entire sheet and between cells; no gradients, no texture, no shadows, no glow, no halos on the background. No text, letters, watermarks, visible cell borders, realistic firearms, gore, extra characters, floor plane, or cast shadows. All 16 cells must be explicit newly drawn views; no mirrored duplicate cells.

Per-sheet prompt variables:

| Target | Character identity | Row map |
|---|---|---|
| `char-hero-sheet-walk4-a.png` | same frontier prospector hero as the reference: wide brim hat, tan duster/coat, boots, muted ochre/sepia outfit, teal chest lantern/agent-tech accent, small round pan/tool pouch fixed on the same physical belt side | s, se, e, ne |
| `char-hero-sheet-walk4-b.png` | same frontier prospector hero, same belt/tool side law | n, nw, w, sw |
| `char-jumper-sheet-walk4-a.png` | same sneaking claim jumper as the reference: rust-red poncho, dusty low hat, bandana over face, gloved grasping hands, crouched thief posture, no weapons | s, se, e, ne |
| `char-jumper-sheet-walk4-b.png` | same sneaking claim jumper, no weapons | n, nw, w, sw |

## Raw prep

The built-in generator returned 1254x1254 PNGs. Final raw copies were resized to 1700x1700 so the 4x4 native cells are exactly 425x425 and the measured figure heights land in the existing rotation-sheet bands. Magenta background pixels were normalized to exact `#ff00ff`; source files under `.codex/generated_images/` were left untouched.

No alpha extraction, sprite slicing, processed-output scale-match, or contract activation was run.

## Outputs and QA

| File | Source | Final size | Cells | Bbox height band | Key QA | Visual QA |
|---|---|---:|---:|---:|---|---|
| `assets/raw/char-hero-sheet-walk4-a.png` | `ig_070c5d11f97591d8016a4af4d17b2c8191a353d6456139cdbe.png` | 1700x1700 | 16/16 | 339-356 px, avg 349.0 | 100.000% exact among near-bg | Rows read s/se/e/ne; row samples: r0c0 faces viewer, r1c0 southeast, r2c0 east profile, r3c0 away-right. Gait phases distinct; belt pan stays on the visible same-side track. |
| `assets/raw/char-hero-sheet-walk4-b.png` | `ig_026c6d2ecdece529016a4af53d392c8191b1f0bdce722dd3da.png` | 1700x1700 | 16/16 | 338-374 px, avg 357.0 | 100.000% exact among near-bg | Rows read n/nw/w/sw; row samples: r0c0 back view, r1c0 away-left, r2c0 west profile, r3c0 toward-left. Gait phases distinct; belt pan side remains consistent. |
| `assets/raw/char-jumper-sheet-walk4-a.png` | `ig_08946e3da4bc5be0016a4af5cecbd881919012a364758b2406.png` | 1700x1700 | 16/16 | 312-351 px, avg 331.0 | 100.000% exact among near-bg | Rows read s/se/e/ne; row samples: r0c0 front crouch, r1c0 southeast/side-leaning sneak, r2c0 east profile, r3c0 away-right. Gait phases distinct; rust poncho/bandana/gloves match; no weapons. |
| `assets/raw/char-jumper-sheet-walk4-b.png` | `ig_08946e3da4bc5be0016a4af601fa5c8191a83922f07b62a436.png` | 1700x1700 | 16/16 | 278-311 px, avg 295.1 | 100.000% exact among near-bg | Rows read n/nw/w/sw; row samples: r0c0 back view, r1c0 away-left, r2c0 west profile, r3c0 toward-left. Gait phases distinct; rust poncho/bandana/gloves match; no weapons. |

Note: `char-jumper-sheet-walk4-a.png` row 1 leans more side-profile than ideal in its first two SE cells, but the hemisphere/direction still reads correctly and the sheet passes the stated QA without a retry.

## Cell measurements

`char-hero-sheet-walk4-a.png`:

```text
r0c0=171x353 r0c1=178x348 r0c2=186x339 r0c3=170x352
r1c0=166x354 r1c1=209x348 r1c2=225x340 r1c3=153x348
r2c0=186x354 r2c1=212x348 r2c2=167x346 r2c3=192x345
r3c0=195x356 r3c1=218x351 r3c2=172x352 r3c3=161x350
```

`char-hero-sheet-walk4-b.png`:

```text
r0c0=181x371 r0c1=173x374 r0c2=171x372 r0c3=179x370
r1c0=194x356 r1c1=184x352 r1c2=182x346 r1c3=178x343
r2c0=220x338 r2c1=204x339 r2c2=181x340 r2c3=221x338
r3c0=191x367 r3c1=191x370 r3c2=185x368 r3c3=192x368
```

`char-jumper-sheet-walk4-a.png`:

```text
r0c0=211x341 r0c1=210x337 r0c2=215x330 r0c3=216x330
r1c0=234x328 r1c1=234x327 r1c2=227x325 r1c3=243x323
r2c0=238x326 r2c1=226x324 r2c2=221x316 r2c3=239x312
r3c0=206x351 r3c1=206x345 r3c2=177x343 r3c3=189x338
```

`char-jumper-sheet-walk4-b.png`:

```text
r0c0=221x311 r0c1=215x292 r0c2=216x293 r0c3=205x295
r1c0=221x300 r1c1=224x294 r1c2=220x278 r1c3=219x289
r2c0=237x311 r2c1=227x307 r2c2=206x297 r2c3=206x294
r3c0=222x294 r3c1=221x289 r3c2=217x290 r3c3=223x288
```
