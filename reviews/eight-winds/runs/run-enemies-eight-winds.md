# Art run — THE EIGHT WINDS, batch 3: the enemy rosters
**Date:** 2026-07-28 · **Arm:** Codex `image_gen` (gpt-image-2) via `codex exec -m gpt-5.6-sol` · **Session:** attended Opus 5, branch `anim/opus5-pass` · **Slot:** new sibling sheets only

32 generations (28 first takes + 4 retakes). Method, geometry and the wind→screen-side table are in `run-town-eight-winds.md`.

| character | base sheet | sibling | frames |
|---|---|---|---|
| bandit (base) † | `char-bandit-base-sheet-walk8` | `char-bandit-base-sheet-walkdiag8` | 8 |
| bandit (thief) | `char-bandit-thief-sheet-walk8` | `char-bandit-thief-sheet-walkdiag8` | 8 |
| Claim-Jumper Baron | `char-baron-sheet-walk8` | `char-baron-sheet-walkdiag8` | 8 |
| claim jumper | `char-jumper-sheet-walk8` | `char-jumper-sheet-walkdiag8` | 8 |
| rail tough (E2) | `char-railtough-sheet-walk4-a` | `char-railtough-sheet-walkdiag4-a` | 4 |
| steam wrecker (E2) | `char-steamwrecker-sheet-walk4-a` | `char-steamwrecker-sheet-walkdiag4-a` | 4 |
| coal thief (E2) | `char-coalthief-sheet-walk4-a` | `char-coalthief-sheet-walkdiag4-a` | 4 |

† `char-bandit-base-sheet-walk8` is the declared `fallback.file` for **ten** contract slots (`char.bandit_base`, both E6 pairs plus `lawn_shepherd`, both E7, both E8, both E9). Its diagonal sibling reaches further than any other sheet in this pass.

## F-EW-5 — the prop-side data was wrong for one character, and it manufactured two false defects

This is the most useful failure of the pass and it is mine, not the generator's.

`cast.json` recorded the claim jumper's satchel on the character's **LEFT** hip. Read from a 360 px montage. It is on the **RIGHT** — the base sheet's front row puts it on the viewer's left (front ⇒ character's right) and the back row puts it on the viewer's right (back ⇒ character's right), consistently, at 560 px: `../crops/ew-jumper-base.png`.

The cost of one wrong letter in a data file:

| jumper wind | first take | verdict under the WRONG side (`L`) | verdict under the TRUE side (`R`) |
|---|---|---|---|
| sw | satchel screen right | ✅ "correct" | ❌ **actually wrong** |
| se | satchel screen left | ❌ "mirrored" → retaken | ✅ **was always correct** |
| nw | satchel screen left | ✅ "correct" | ❌ **actually wrong** |
| ne | satchel screen right | ❌ "mirrored" → retaken | ✅ **was always correct** |

**Every one of the four verdicts was inverted, and two good rows were sent back for retakes that were never needed.** (Both retakes came back matching the base anyway — the generator followed the reference image's real prop side over my text, which is its own small piece of evidence that the reference conditioning is doing work.)

So the check was widened rather than patched. Every remaining prop side was re-read from the base sheet's **front row and back row at 520 px**, and each one either confirmed or corrected:

| character | prop | claimed | verified | result |
|---|---|---|---|---|
| bandit base | chest strap over the shoulder | R | front: viewer-left; back: viewer-right | ✅ confirmed |
| bandit thief | chest strap / belt satchel | R / L | consistent front and back | ✅ confirmed |
| Baron | playing card in the hatband | L | front: viewer-right; back: viewer-left | ✅ confirmed |
| rail tough | wrench in hand / chest badge | R / R | front: both viewer-left | ✅ confirmed |
| coal thief | coal sack over the shoulder | R | front: viewer-left | ✅ confirmed |
| **claim jumper** | **belt satchel** | **L** | **front: viewer-left; back: viewer-right** | ❌ **corrected to R** |
| tavernkeeper | towel over the shoulder | L | front: viewer-right; back: viewer-left | ✅ confirmed |
| youngster A / B | teal lantern in hand | L | front: viewer-right; back: viewer-left | ✅ confirmed (both) |
| **newsie** | **satchel at the hip** | **L** | **front says LEFT hip, back says RIGHT hip** | ⚠ **the BASE contradicts itself** |
| newsie | folded paper in hand | R | sits in the bag mouth in most frames | ❌ **withdrawn, under-evidenced** |

Evidence: `../crops/ew-enemy-props-verify.png`, `../crops/ew-town-props-verify.png`, `../crops/ew-jumper-base.png`.

**The newsie entry is worth its own line.** Her own base sheet does not track her satchel: the front row puts it on her left hip and the back row on her right. No assignment can be fully right. `L` is kept because the front is the view a plaza player sees most, and the diagonal rows follow the front. It is recorded as a base-sheet inconsistency, **not** as a defect in the new art.

**The rule this leaves behind:** a `props[].side` is data that inverts every downstream verdict, so it must be read from the base sheet's front row AND back row at ≥520 px before it is written, and a claim that the two views contradict is a finding, not a coin toss.

## Two rows failed after three attempts and are PARKED, not hidden

| row | attempts | what came back every time | state |
|---|---|---|---|
| `char-jumper-sheet-walkdiag8` **nw** | 2 (both with the corrected `R` side, the second with an explicit anti-mirror clause naming the screen side) | satchel drawn on the screen **left**; should be screen right | ❌ **shipped as-is, flagged** |
| `char-coalthief-sheet-walkdiag4-a` **ne** | 3 (the third with a facing-focused clause: *"you must see the BACK of his hat… his face and bandana must NOT be visible"*) | a **front-facing** view with the bandana visible and the sack on the screen left; should be a back three-quarter with the sack on the screen right | ❌ **shipped as-is, flagged** |

Third attempts used a changed premise, per §7.5 — the jumper's retakes carried a corrected prop side and a named screen side, the coal thief's carried a facing instruction rather than a prop instruction. A fourth identical retry is forbidden and would not be honest anyway.

Both failures are plausible for their subject: the coal thief is a hunched figure whose enormous sack occupies exactly the part of the silhouette a back three-quarter view needs to show, and the jumper's satchel rides a hip that is nearly edge-on in the up-left view. **Recommendation for the wiring slice:** bind these two sheets normally but alias those two winds (`nw → w` for the jumper, `ne → e` for the coal thief) until they are retaken — that is strictly better than today, where all four diagonals alias.

**72 rows were built across the whole pass. 70 pass. That is the honest count.**

## Measured self-QA

<!-- generated by scripts/anim-pass-windtable.mjs — do not hand-edit -->

| sibling sheet | base | dims / grid decl·art | cells @scale | base height band | composed heights | drift | components / crossing a cut | key bg% / halo% | dup flagged→real |
|---|---|---|---|---|---|---|---|---|---|
| `char-bandit-base-sheet-walkdiag8` | `char-bandit-base-sheet-walk8` | 2240x1360 / 8x4·8x4 | 32/32 @1 | 291-291 (med 291) | 283-300 (med 292) | **+0.3%** | 70 / **0** | 74.40 / 0.866 | 0→0 |
| `char-bandit-thief-sheet-walkdiag8` | `char-bandit-thief-sheet-walk8` | 2240x1360 / 8x4·8x4 | 32/32 @1 | 278-278 (med 278) | 270-288 (med 279) | **+0.4%** | 33 / **0** | 80.61 / 0.438 | 0→0 |
| `char-baron-sheet-walkdiag8` | `char-baron-sheet-walk8` | 3400x1700 / 8x4·8x4 | 32/32 @1 | 373-416 (med 385) | 376-400 (med 391) | **+1.6%** | 36 / **0** | 68.68 / 0.488 | 0→0 |
| `char-jumper-sheet-walkdiag8` | `char-jumper-sheet-walk8` | 2240x1360 / 8x4·8x4 | 32/32 @1 | 227-327 (med 291) | 278-296 (med 290) | **-0.3%** | 50 / **0** | 70.99 / 0.727 | 0→0 |
| `char-railtough-sheet-walkdiag4-a` | `char-railtough-sheet-walk4-a` | 1252x1252 / 4x4·4x4 | 16/16 @1 | 271-292 (med 276) | 248-288 (med 278) | **+0.7%** | 20 / **0** | 72.99 / 0.580 | 0→0 |
| `char-steamwrecker-sheet-walkdiag4-a` | `char-steamwrecker-sheet-walk4-a` | 1252x1252 / 4x4·4x4 | 16/16 @1 | 237-249 (med 242) | 208-253 (med 243) | **+0.4%** | 29 / **0** | 72.74 / 0.661 | 0→0 |
| `char-coalthief-sheet-walkdiag4-a` | `char-coalthief-sheet-walk4-a` | 1252x1252 / 4x4·4x4 | 16/16 @1 | 244-274 (med 258) | 216-265 (med 256) | **-0.8%** | 25 / **0** | 74.34 / 0.364 | 0→0 |

The three E2 siblings are **1252×1252 where their bases are 1254×1254, and that is correct**: `extract-alpha` slices at `floor(1254/4) = 313` and never samples the 2 px remainder. The sibling drops the dead remainder and keeps every cell boundary identical. Do not "fix" it to match — that would move the cuts.

## Facing and props by eye at magnification

| sheet | facing | props | evidence |
|---|---|---|---|
| bandit base | ✅ 4/4 | ✅ 4/4 — chest strap over the RIGHT shoulder, screen-left in both south winds, screen-right in both north | `../crops/ew-enemy-winds-a.png` top |
| Baron | ✅ 4/4 | ✅ 4/4 — the hatband playing card, screen-right in sw/se, screen-left in nw/ne | `../crops/ew-enemy-winds-a.png` bottom |
| bandit thief | ✅ 4/4 | ✅ 4/4 on **both** props — strap RIGHT shoulder and satchel LEFT hip, tracking independently | `../crops/ew-enemy-winds-c.png` top |
| rail tough | ✅ 4/4 (se shallow) | ✅ 4/4 — wrench in the RIGHT hand and the chest badge on the RIGHT | `../crops/ew-enemy-winds-b.png` bottom |
| steam wrecker | ✅ 4/4 | no prop claim (machine) | `../crops/ew-wrecker-winds.png` |
| claim jumper | ✅ 4/4 | 3/4 — **nw parked** | `../crops/ew-enemy-winds-c.png` bottom, `../crops/ew-retakes2.png` |
| coal thief | 3/4 — **ne parked** | 3/4 | `../crops/ew-enemy-winds-b.png` top |

**The steam wrecker got a facing test its subject actually supports.** It is a faceless machine, so "three-quarter front vs three-quarter back" cannot be read from a face. What *can* be read is the glowing amber porthole eye: it is **present in both south winds and absent in both north winds**, which is exactly what a front/back distinction means for this body. That is a measurable signal, not a vibe, and it is the reason the wrecker gets a 4/4 despite carrying no assignable prop.

## Gates
`npx tsc --noEmit` rc=0 · `npm run build` rc=0, asset-diet clean · no `src/` file touched · no existing sheet modified.
