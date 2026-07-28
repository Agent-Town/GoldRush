# Art run — THE EIGHT WINDS, batch 1: the town's six 8-frame walkers
**Date:** 2026-07-28 · **Arm:** Codex `image_gen` (gpt-image-2) via `codex exec -m gpt-5.6-sol`, owner-granted for this pass · **Session:** attended Opus 5, branch `anim/opus5-pass` · **Slot:** new sibling sheets, no existing sheet modified

## Why
Owner directive 2026-07-28, verbatim: *"can we extend the walking animations from four directions to 8 to also cover the diagonal directions? I think that will add to the quality of the game."*

The gap is exact and it is in two places:
- `assets/layer-contracts/characters.v2.json` — every `walk8` block carries `"aliases": { "se": "e", "ne": "e", "sw": "w", "nw": "w" }`. A character walking north-east is drawn walking due east.
- `src/town/TownScene.ts:2511 directionRow()` — `w|sw|nw → 1`, `e|se|ne → 2`. The plaza has four rows of art and eight directions of motion, so five of the eight are a lie.

## What was generated
24 generations, one per character per wind, each a **4 columns × 2 rows grid of 8 frames** conditioned on the character's own base sheet. 4×2 was chosen over one 8×4 grid per character on quality grounds: at the arm's ~1600×1000 output an 8×4 grid gives 200×250 px cells, and a 200 px figure would have to be **upscaled** into the 294 px band. 4×2 gives ~400 px figures that are **downscaled** into it.

| character | base sheet | winds | takes |
|---|---|---|---|
| tavernkeeper | `char-tavernkeeper-sheet-walk8` | sw se nw ne | 5 (SE retaken — F-EW-1) |
| storekeeper | `char-storekeeper-sheet-walk8` | sw se nw ne | 4 |
| elder | `char-elder-sheet-walk8` | sw se nw ne | 4 |
| youngster A (m) | `char-youngster-m-sheet-walk8` | sw se nw ne | 4 |
| youngster B (f) | `char-youngster-f-sheet-walk8` | sw se nw ne | 4 |
| newsie (Chen Mei) | `char-newsie-mei-sheet-walk8` | sw se nw ne | 4 |

Prompts are built, not written: `scripts/anim-pass-prompt.mjs` renders every prompt from `reviews/eight-winds/cast.json`, so 24 prompts differ only in the character and the wind and each carries the house style anchor verbatim. Every issued prompt is on disk in `reviews/eight-winds/prompts/`.

## The geometry, derived once
Camera south of the plaza looking north, so screen down = south and screen right = east. For a facing vector `f` in screen coords the character's left-shoulder offset is `(f.y, -f.x)` — screen-x `f.y`, depth `-f.x`. That gives the table every prompt and every QA verdict in this batch is checked against:

| wind | travels | view | character's LEFT side appears | character's RIGHT side appears |
|---|---|---|---|---|
| sw | down-left | three-quarter FRONT | screen RIGHT, **nearer** | screen LEFT, farther |
| se | down-right | three-quarter FRONT | screen RIGHT, farther | screen LEFT, **nearer** |
| nw | up-left | three-quarter BACK | screen LEFT, **nearer** | screen RIGHT, farther |
| ne | up-right | three-quarter BACK | screen LEFT, farther | screen RIGHT, **nearer** |

The character's left is on the **screen right** for both south winds and on the **screen left** for both north winds. That is the whole anti-mirror test, and it is why a down-left walker is not a flipped down-right walker.

## F-EW-1 — the mirror the first prompt invited, and the fix
The first tavernkeeper SE take came back with **the towel on the wrong shoulder**. The clause read *"this view shows the character's RIGHT side, so those details appear accordingly"*, which a generator reasonably hears as **"put the props on the side facing the viewer."** The towel is on the tavernkeeper's LEFT shoulder in all four cardinal rows of the base sheet (front: viewer's right; back: viewer's left; east: draped over the far shoulder) — so in SE it belongs on the screen RIGHT, farther, partly behind the head. It came back draped over the near shoulder on the screen left.

Rejected take kept as the evidence: `reviews/eight-winds/gen/tavernkeeper-se-4x2-take1-REJECTED-mirrored.png`.

The fix is in `scripts/anim-pass-prompt.mjs`: `cast.json` now records each prop's **body side** (`L`/`R`) as data, and the builder converts it to the **screen side for that wind** and says so outright. A second clause was added for characters with no sided prop: the key light is always from the upper left, so a flipped frame is lit from the wrong side. The retake was correct on the first try.

## F-EW-2 — a bug in my own fan-out, and why nothing was lost
Five arms run at once and all of them write into `~/.codex/generated_images`. `anim-pass-gen.mjs` originally claimed its output by **mtime window**, so each run adopted its neighbours' images as well as its own — 55 mis-claimed copies and 3 wrong primaries across the first two batches.

Nothing was lost, because the CLI banner in every `<out>.codex.log` records a unique `session id` and the arm writes only under that session's directory. `scripts/anim-pass-reclaim.mjs` re-derives every claim from the logs, rewrites the primaries and moves the mis-claimed copies to `gen/_misclaimed/` rather than deleting them (§4.10). `anim-pass-gen.mjs` now claims by session id and falls back to mtime only when no banner is found.

**3 primaries corrected · 16 already correct · 55 copies moved · 0 unresolved.** Every accepted generation in this batch was re-derived from its own session id.

## Composition — cell geometry taken from the base, never from the generator
`scripts/anim-pass-diag.mjs` builds the sibling at the base sheet's own `floor(w/cols) × floor(h/rows)` cell, fills it with the base's own key, and seats each figure by:
- **scale** so the composed median FIGURE height equals the base's median figure height;
- **ground line** on the base's median foot line — measured as the lowest scanline carrying a run of ≥12% of the figure's width, so a prop hanging below the boots cannot lever the body out of the cell (the rail-tough wrench lesson, `anim-pass-graft.mjs`);
- **centre** on the base's median cell-local centre.

Sheets are therefore byte-for-byte the same geometry as their base: `2240×1360`, cell `280×340`, grid `8×4`. No contract number moves when a wiring slice binds them.

## Measured self-QA — mine, not the generator's
Every sibling extracted with `extract-alpha --key ff00ff --grid 8x4 --scale <the base's pinned scale>` into a scratch directory (`.scratch-ew/`, gitignored) — measured, then thrown away, because nothing binds these cells yet and shipping 192 unused cells into the bundle would be dead weight.

<!-- generated by scripts/anim-pass-windtable.mjs — do not hand-edit -->

| sibling sheet | base | dims / grid decl·art | cells @scale | base height band | composed heights | drift | components / crossing a cut | key bg% / halo% | dup flagged→real |
|---|---|---|---|---|---|---|---|---|---|
| `char-tavernkeeper-sheet-walkdiag8` | `char-tavernkeeper-sheet-walk8` | 2240x1360 / 8x4·8x4 | 32/32 @1 | 289-322 (med 293) | 286-301 (med 294) | **+0.3%** | 34 / **0** | 73.25 / 0.424 | 1→0 |
| `char-storekeeper-sheet-walkdiag8` | `char-storekeeper-sheet-walk8` | 2240x1360 / 8x4·9x4 | 32/32 @1 | 297-322 (med 311) | 304-317 (med 310) | **-0.3%** | 47 / **0** | 73.81 / 0.922 | 2→0 |
| `char-elder-sheet-walkdiag8` | `char-elder-sheet-walk8` | 2240x1360 / 8x4·8x4 | 32/32 @1 | 298-321 (med 305) | 291-332 (med 304) | **-0.3%** | 69 / **0** | 73.01 / 0.733 | 1→0 |
| `char-youngster-m-sheet-walkdiag8` | `char-youngster-m-sheet-walk8` | 2240x1360 / 8x4·8x4 | 32/32 @1 | 292-322 (med 309) | 292-315 (med 308) | **-0.3%** | 47 / **0** | 77.29 / 0.666 | 0→0 |
| `char-youngster-f-sheet-walkdiag8` | `char-youngster-f-sheet-walk8` | 2240x1360 / 8x4·8x4 | 32/32 @1 | 287-321 (med 313) | 305-318 (med 312) | **-0.3%** | 33 / **0** | 76.90 / 0.518 | 0→0 |
| `char-newsie-mei-sheet-walkdiag8` | `char-newsie-mei-sheet-walk8` | 2240x1360 / 8x4·8x4 | 32/32 @1 | 291-291 (med 291) | 280-299 (med 289) | **-0.7%** | 48 / **0** | 78.79 / 0.837 | 0→0 |

**Every sheet lands inside its base's own height band, drift −0.7% to +0.3%.** A sprite cannot size-pop when it turns 45°. **0 components cross a cell cut on any sheet** — the instrument is `anim-pass-cut.mjs`'s component ownership, not the 1-px `bleedPx` probe M3 showed cannot tell pollution from a figure touching its own edge. **0 duplicate pairs survive full-resolution comparison** on any sheet.

The storekeeper's art reads as a **9-column** gutter grid rather than 8. That is a gap inside a figure being read as a gutter, not a mis-slice: 0 components cross a cut and extraction yields 32/32 cells.

## Facing and props, judged by eye at magnification
F-A3 stands — a silhouette metric cannot decide facing, and it *especially* cannot decide a mirror, because sw and se genuinely ARE near-mirror silhouettes. Every verdict below was read at 440–620 px per cell.

| character | facing 4/4 | prop tracking | evidence |
|---|---|---|---|
| tavernkeeper | ✅ | ✅ towel on the character's LEFT shoulder in all four winds (screen right in sw/se, screen left in nw/ne) | `crops/ew-tk-props.png`, `crops/ew-tk-se2.png` |
| youngster A (m) | ✅ | ✅ teal lantern in the LEFT hand, 4/4 | `crops/ew-kids-props.png` top row |
| youngster B (f) | ✅ | ✅ teal lantern in the LEFT hand, 4/4; NE row checked frame-by-frame (8/8 present, occluded in one — which is what a far-side prop should do) | `crops/ew-kids-props.png` bottom, `../anim-pass-2026-07-25/crops/ew-yf-ne-row.png` |
| newsie | ✅ | ✅ satchel on the LEFT hip and papers in the RIGHT hand, tracking correctly across all four | `crops/ew-newsie-store-props.png` top row |
| storekeeper | ✅ | **no prop claim** — see below | `crops/ew-newsie-store-props.png` bottom, `crops/ew-elder-store-base.png` |
| elder | ✅ | **no prop claim** — see below | `crops/ew-elder-store-base.png` top row |

**Two prop claims were withdrawn rather than reported as defects.** `cast.json` first recorded a storekeeper apron pocket on the left hip and an elder poncho fringe on the right shoulder. Opening the *base* sheets at magnification, neither survives: the storekeeper's pocket sits on the **front** of the apron and cannot be assigned to a body side, and the elder's poncho is a fringed shawl with a hem all the way round. Both entries are now empty with a `propNote` saying so. Those two characters are judged on facing and identity only — and the elder's chevron-woven poncho back is an unusually strong identity anchor, reproduced exactly in both north winds.

**One residual, stated:** the tavernkeeper's small apron tool-pocket does not track the body across winds (the towel does). It measures ~20 px in a 512 px cell — roughly 4 px at gameplay zoom — and was not worth a third generation.

## Gates
`npx tsc --noEmit` **rc=0** (9.41s) · `npm run build` **rc=0** (23.88s), asset-diet clean · **no `src/` file touched** · **no existing sheet modified** — every deliverable is a new sibling file.

## Not done here
- No `assets/processed` cells: nothing binds these sheets yet. The wiring slice extracts them, and `reviews/eight-winds-wiring-spec.md` carries the exact command and each sheet's convention.
- No layer-contract edit and no `src/` edit; both are out of this claim's territory by the task's own firewall.
