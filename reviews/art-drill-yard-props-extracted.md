# art-drill-yard-props-extracted — s1449 drain

**Slice:** extract the keyed drill-yard station props and wake the dormant sprite wiring
**Branch:** main (fire-side art extraction — no lane involved)
**Tip:** `e212cc5c7486eb455f5d47dccbb7566517efd025` (art landing), `c29040e7a3cc12dffea0e9c86e1fc624e71104c3` (keyer class-fix)
**Goal leaf:** `e1-drill-yard-stations-keyed` · **Block check:** `✅ CLEAR` (exact-name match; the sibling `e1-drill-yard-stations-art[merged]` did NOT decide it — F-1437-2)
**Gated:** scratch dev server on **5237**, never 5188 — lane-c ran `f1448-1` for the whole fire (Mistake #12)

## VERDICT: **ACCEPTED AND MERGED** — and the drain found a defect that would have shipped

---

## What it does

`src/game/DrillYard.ts` has built its stations from art since `a04ea810`, and that art has been
**dormant the entire time**. `applyStationArt` resolves the filename through an eager
`import.meta.glob` and **returns silently on a miss**, so three absent PNGs cost nothing at build
time, nothing at runtime, and left the player looking at procedural placeholder geometry. That is
F-1437-3 exactly as predicted, one layer deeper.

This drain extracts the three keyed raws banked at `77260391` under the exact filenames the glob
lists, makes the dormant state observable, and gates it in a plain boot.

```
node scripts/extract-alpha.mjs --key ff00ff --size 384 \
  assets/raw/prop-drill-faucet-station.png \
  assets/raw/prop-drill-bell-post.png \
  assets/raw/prop-straw-man-stand.png
```

`--size 384` is not a guess: `prop-baron-banner.png` is the same slot, same generator, same native
1254×1254, and extracts to 384×384 RGBA. One precedent, differing in nothing that matters.

---

## 🔺 F-1449-1 — THE FIRST EXTRACTION WAS CORRECT BY EVERY NUMBER I HAD, AND DREW A MAGENTA HALO IN GAME

**Fixed in `c29040e7`. This is the finding of the fire.**

The numeric probe said the cut-out was perfect: corners `alpha=0`, transparent fraction matching
each raw's own `#ff00ff` fraction to a tenth of a percent, subject bounded, **residual magenta 0**.
Every box ticked. Then I looked at the in-game screenshot and every prop wore a bright magenta
outline around its whole silhouette — worst on thin features (table legs, bell frame posts).

**Why the probe was wrong is the reusable half.** It asked *"is there magenta among the VISIBLE
pixels"* and answered 0 — truthfully. But keying sets `alpha = 0` and **leaves the key colour in
RGB**, and *the GPU does not consult alpha when it filters*. `SpriteMaterial({transparent: true,
alphaTest: 0.04})` with bilinear filtering and mipmaps averages RGB across neighbouring texels, so
pure `#ff00ff` under the transparency bleeds back into every edge texel that survives `alphaTest`.
Thin features suffer most because downscaling averages one real texel against several key texels.

Measured (`artifacts/drill-yard-props/probe-fringe.mjs`):

| file | transparent px | of which key-magenta RGB | **touching a visible px** (these bleed) |
|---|---|---|---|
| faucet-station | 89,167 | **100.0%** | **3,982 / 3,982** |
| bell-post | 110,196 | **100.0%** | **1,540 / 1,540** |
| straw-man-stand | 114,684 | **100.0%** | **1,755 / 1,755** |
| **prop-baron-banner (CONTROL, shipped)** | 85,900 | **100.0%** | **4,128 / 4,128** |

**The control carries the identical property, so the fault is `extract-alpha.mjs`, not this batch —
fix the class, not the instance.** `despillSaturatedKey` could never have caught it: it skips
transparent pixels *by design* (`if (!data[idx + 3]) continue;`), because it corrects spill **on**
the art, not **under** it.

**Cure:** `bleedEdges()` propagates visible colour outward under the transparency to exhaustion —
mip level N averages 2^N texels, so a fixed few-pixel skirt still bleeds at the sizes these sprites
render at. **Alpha is never touched.**

After: key-magenta under transparency **100% → 0%** on all three; border-transparent samples are now
real art browns (`rgb(56,35,15)`, `rgb(45,17,33)`, `rgb(141,65,31)`).

**Proof the shape is unharmed** — identical before and after, all three:

| | transparent | opaque | partial | bbox |
|---|---|---|---|---|
| faucet-station | 89,167 | 58,214 | 75 | 338×345 @ (25,22) |
| bell-post | 110,196 | 37,235 | 25 | 249×245 @ (66,70) |
| straw-man-stand | 114,684 | 32,733 | 39 | 217×344 @ (83,14) |

Before → after by eye: `artifacts/drill-yard-props/zoom-assay-table.png` vs
`zoom-assay-table-fixed.png` (and `zoom-bell.png` vs `zoom-bell-fixed.png`).

> **The lesson, stated plainly: a measurement is only as good as its question.** The probe was
> correct, precise, and asked about the wrong pixels. **Looking is what caught it.**

---

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.16 s** |
| `e2e/drill-yard-station-art.spec.ts` (new) | **2/2** desktop-chrome + mobile-chrome, zero console errors |
| **negative control** — three PNGs moved out | **RED**, `stationArt` reads `Array []` |
| adjacent (`drill-yard`, `drill-yard-manifest`, `cp01-charter-roundtrip`) | **28/28** both projects, 50.2 s |
| `gr-sim` | **9/9** |
| node guards (collection, law-pointer, gate-caller, script-parse, glob-fallback) | **36/36** |

Adjacent suites derived by `grep -rln` over `e2e/`, not from a runner's list.
`release-build.spec.ts` also matched and was **correctly excluded** — it is claimed by
`playwright.release.config.ts` (F-1296-3).

### The negative control is the point

A passing assertion never executes its own violation path, so a green alone says nothing about
whether the guard can fail. With the three PNGs moved out and everything else identical, the spec
goes **RED** with `stationArt` = `Array []` — the exact dormant state. Restored byte-identical
afterwards (verified by re-running the probe).

---

## Player-visible surface (Mistake #10)

`e2e/drill-yard-station-art.spec.ts` — **no `?debug`**, by the player's own route: enter town, walk
to the tavern, open the board, launch the yard. It asserts `stationArt` equals the three filenames.

Two deliberate choices, both forced by evidence rather than taste:

- **Its own file, not `drill-yard.spec.ts`** — lane-a holds one line of that file
  (`const ARTIFACT_DIR = …`, measured via `lane-usable`). A new file collides with nothing.
- **It cannot use `__GR_TEST__.renderCensus()`** — that API is gated behind `?debug` at
  `src/game/Game.ts:1727`, and this is deliberately a plain boot. `stationArt` is filled inside the
  `TextureLoader` callback *immediately after* `group.add(sprite)`, so it already proves the sprite
  exists and the procedural children were hidden.

`DrillYardDiagnostics.stationArt` is new. **That is the substance, not scaffolding:** this defect
class hid for two fires precisely because nothing could see it. Now a plain boot can.

---

## Art QA — by looking (F-1446-1)

`artifacts/drill-yard-props/comparison-board.png` composites all three plus the shipped banner on a
**checkerboard** — chosen because an opaque square is easy to miss on white or black and unmissable
on a checkerboard.

- ✅ **The checkerboard shows through the interior pockets** — between the trestle legs, inside the
  bell frame, through the straw stand's braces. Enclosed background keyed correctly; this is the
  real test and it passed.
- ✅ **Bell post, canon:** symmetric two-post yoke, bell centred beneath the crossbar, clapper
  connected to nothing, rope a tight coil around the right upright that begins, stays and terminates
  against the post. **No cantilever, no rope in open air, no terminal loop** — F-1445-4 stays closed.
- ✅ **Straw target, canon:** no head, face, limbs, clothes or anatomy. Not an effigy.
- ✅ **Faucet station:** reads *"draw practice gold here"* — balance with both pans, hand-cranked
  strongbox, one blank ledger, no writing.
- ✅ In-game desktop + 390px mobile: `artifacts/drill-yard-props/{desktop,mobile}-chrome-drill-yard-stations.png`.

---

## Findings

- 🔺 **F-1449-1** — keyed extractions left the key colour in RGB under alpha 0 and haloed in-game.
  **FIXED `c29040e7`**, class-level, with a before/after measurement and the shape proved unchanged.
- 🟡 **F-1449-2** — **`assets/LEDGER.md` row 70 transposes two of its own measurements.** It records
  the `#ff00ff` counts as `949,360 / 1,222,187 / 1,174,778 px (60.37% / 77.72% / 74.71%)` in the file
  order faucet · bell-post · straw. Re-derived from the raws this fire: faucet **949,360 (60.37%)**,
  bell-post **1,174,778 (74.71%)**, straw **1,222,187 (77.72%)** — **bell-post and straw are
  swapped.** Every number is real; two are attached to the wrong filenames. It matters because the
  LEDGER is the art source of truth, so a future retake QA'd against row 70 would compare a file to
  its sibling's baseline and could accept a bad render or reject a good one. **Corrected in the row
  by this drain.**
- 🟡 **F-1449-3** — **`prop-baron-banner.png` is shipped with the F-1449-1 defect** (4,128
  border-transparent magenta px). The cure exists now; re-extracting is one command. **Not done
  here** — it is a different asset on a different surface and deserves its own before/after in-game
  QA rather than a drive-by. Cheap and self-contained for a next fire.
- 🟢 **F-1449-4** — `applyStationArt` returning silently on a glob miss is the mechanism behind this
  whole dormancy. It is now *observable* via `stationArt`, but still not *loud*: a missing file is
  still not an error. Deliberately left alone — a hard failure would red every headless harness that
  legitimately lacks processed art, and the observable diagnostic plus a gating spec is the
  proportionate fix.

## Retention

Every probe used to reach these numbers is committed under `artifacts/drill-yard-props/`
(`probe-cutout.mjs`, `probe-fringe.mjs`, `crop-zoom.mjs`, `build-board.mjs`, `run-gate.mjs`) — the
instruments, not a summary of them, so every figure above is re-derivable. Superseded pre-bleed
blobs live in history via `e212cc5c`'s parent.

**ART staging audit:** not run and not claimed — this drain added nothing to `worktrees/art/` and
touched no staging. The standing `staging/motion-pilot` hole is unchanged.
