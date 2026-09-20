# Review — THE FAR GROUND (repaint the horizon where it actually lives, four E1 maps)

**Slice/branch/tip:** `beauty2/far-ground`, base `b16e39b3` (origin/main at pre-flight) · worktree `gr-task-beauty2-far-ground` · solo-writer Opus-5 beauty shift, 2026-08-04
**Brief:** `TASK.md` · `docs/beauty/README.md` (program laws) · the four maps' briefs · the two measurements that funded it (`reviews/beauty-atmos.md` §2–3, `reviews/beauty-night-shift-r2.md` F-7)
**Verdict:** ✅ **THE RING FOOT IS MEASURED UNREACHABLE AND THEREFORE NOT PAINTED — 0 bytes spent, with the positive control neither prior measurement had** · ✅ **THE FAR TERRAIN EDGE SHIPPED ON THE TWO MAPS THAT HAD NOTHING** (`the-claim`, `e1-twin-banks`) · ✅ **THE INSTRUMENT IS IN THE TREE FOR THE FIRST TIME**
Rendering only, zero sim bytes. +0 draw calls, +0 triangles, all four maps, both viewports. Every panorama atlas byte-identical.

---

## 0. THE ONE SENTENCE

The brief asked for the panorama's *foot* on the theory that the foot is the part the camera reaches — and the foot is **61 to 65 metres above the top edge of the frame at its own radius**, so the honest answer to scope item 2 is a measurement and an unspent art batch, and the funded work is entirely item 3.

---

## 1. THE MEASUREMENT, AND THE CONTROL THAT MAKES IT WORTH ANYTHING

`scripts/beauty-far-ground.mjs` + `?farGroundProbe` (`src/world/HorizonApron.ts`). The panorama flattens to magenta, the sculpt continuation to cyan, the terrain tile to green, all `toneMapped: false`, and a screenshot becomes a census.

### 1a. The instrument two reviews cited did not exist

`reviews/beauty-atmos.md` §3 and `src/world/HorizonApron.ts:10` both attribute their central number to **`?horizonProbe`**. That flag is not in the repo and never was: `git log -S horizonProbe -- src/` returns exactly one commit, `c714b8e0`, and the only thing it added is the docstring quoting it. The probe lived in the atmospherics shift's working tree and died with it. **The load-bearing measurement of two reviews and three shipped decisions was unreproducible until this commit.** (F-FG-1.)

### 1b. Where the frame top actually is — measured in metres, at the ring's own radius

The prior instrument (`scripts/beauty-sky-visibility.mjs`) raised a probe 50 m ahead and converted to an angle using an **assumed** eye height of 26.2 m, measuring the distance from the **hero** while the eye stands 18.3 m further back. This one rides the probe at the ring's real foot radius — read out of the GLB header and the panorama contract, not a constant — so the comparison needs no trigonometry at all: *the frame top passes through y = H at r = R; the ring's foot is at y = F.* The elevation angle is then recovered from two probes on one ray, which needs no assumed eye height either.

| Map | frame top at the ring's foot radius (161.5 m) | ring foot | **foot stands ABOVE the frame top by** | frame-top elevation | implied eye height |
|---|---|---|---|---|---|
| `the-claim` | −71.4 m | −10 m | **61.4 m** | **−28.44°** | 25.96 m |
| `e1-dry-gulch` | −70.9 m | −10 m | **60.9 m** | **−28.45°** | 26.38 m |
| `e1-twin-banks` | −74.9 m | −10 m | **64.9 m** | **−29.47°** | 26.75 m |
| `e1-baron` | −71.4 m | −10 m | **61.4 m** | **−28.48°** | 25.96 m |

Mobile 390×844 agrees to ±0.11 m on every row. The implied eye height lands at 25.96–26.75 m against `Balance.camera.offset.y` of 26.2 — **the method validates itself**, and the spread is the hero standing on different ground, which is also why twin-banks is the outlier in both columns.

**The published −27.9° is short.** It is −28.4° to −29.5° once the eye is measured rather than assumed and the distance is taken from the eye rather than the hero. Nothing downstream changes — the conclusion was right — but the number in `beauty-night-shift-r2.md` F-7 should not be re-quoted.

### 1c. The census: 0.00% panorama, at 56 of 56 samples

Seven hero poses × two viewports × four maps, HUD hidden, `tier=full`:

| pose | z | the-claim | dry-gulch | twin-banks | baron |
|---|---|---|---|---|---|
| boot | — | 0.00 / **0.00** / 97.96 | 0.00 / **0.00** / 95.90 | 0.00 / **0.00** / 88.21 | 0.00 / **0.00** / 86.53 |
| home | +20 | 0.00 / **0.00** / 93.62 | 0.00 / **0.00** / 94.51 | 0.00 / **0.00** / 91.22 | 0.00 / **0.00** / 96.79 |
| fresh-eye | +8.65 | 0.00 / **0.00** / 88.28 | 0.00 / **0.00** / 89.30 | 0.00 / **0.00** / 84.29 | 0.00 / **0.00** / 85.15 |
| centre | 0 | 0.00 / **0.00** / 97.95 | 0.00 / **0.00** / 95.84 | 0.00 / **0.00** / 88.13 | 0.00 / **0.00** / 86.48 |
| push | −10 | 0.00 / **8.63** / 88.92 | 0.00 / **6.45** / 88.32 | 0.00 / **8.71** / 81.67 | 0.00 / **8.25** / 76.96 |
| far half | −22 | 0.00 / **33.38** / 66.23 | 0.00 / **30.37** / 67.28 | 0.00 / **32.56** / 62.03 | 0.00 / **35.11** / 62.27 |
| far edge | −30 | 0.00 / **55.90** / 44.00 | 0.00 / **55.49** / 44.35 | 0.00 / **55.11** / 44.55 | 0.00 / **55.44** / 44.45 |

*(cells are `panorama % / apron % / terrain %` of the frame, desktop 1280×800; the mobile table is in `artifacts/beauty-far-ground/far-ground-probe.json` and tracks it to within 0.5 points except at boot, where the viewports frame differently.)*

**The panorama column is 0.00 at every one of 56 samples, on both viewports.** Two pixels in the whole set classify magenta — one per frame in two twin-banks shots, RGB (158,65,132) and (155,63,127), at mid-frame rows where no sky ring can physically be. They are sprite shading, not ring, and they are reported rather than tuned away.

### 1d. The positive control — the half neither predecessor ran

A 0.00% reading is the same reading whether the ring is off camera **or the tint silently failed to reach it**, and both prior measurements of this fact rest on a bare zero. Two independent controls:

1. **The probe's receipt.** `paintFarGroundProbe` returns how many distinct materials it repainted, and the pilot publishes it: `data-terrain3d-pilot-far-ground-probe = "on:panorama=1,apron=1,terrain=1"` on all 8 boots. The ring was provably flat magenta while the census read zero.
2. **`?farGroundProbe=solo`** additionally hides the terrain and the apron, so **nothing whatsoever can occlude the ring**. Result: `terrain 0.00%` (the hide worked) and **panorama still 0.00% at 56/56**, receipt still `panorama=1`.

A zero from `solo`, with the receipt nonzero, is the only form of this claim that cannot be a broken instrument. **The ring is outside the frustum. It is not occluded, not dim, not behind fog — it is not in the picture.**

`solo` also bounds the classifier's own false-positive floor without any argument: with the apron mesh *hidden*, "apron" still reads 0.01% on four mobile boot frames. **≤0.01% of frame is this instrument's noise, measured rather than assumed** — which is why every real reading in this review is two to four orders of magnitude above it.

---

## 2. SCOPE ITEM 2 — THE RING FOOT: **REVERT (never painted), and the download law is satisfied at zero**

The brief funded a repaint of "the panorama's visible foot band". **There is no visible foot band.** Painting it would have spent an art batch and a download budget on pixels that provably cannot exist, which is the exact failure the owner's U4 revert of 2026-08-04 was ruling against (*"less download for the users is better"*).

So no builder ran and no artefact moved. The download law is reported anyway, because the brief asks for the sizes:

| Map | panorama atlas | vs before | GLB | sha256 (first 16) |
|---|---|---|---|---|
| `the-claim` | 367,684 B | **0.00%** | 517,820 B | `f65db0b1cd585184` |
| `dry-gulch` | 370,364 B | **0.00%** | 520,500 B | `bd4243d2a958f09c` |
| `twin-banks` | 319,625 B | **0.00%** | 469,768 B | `f163c1041426796c` |
| `baron` | 377,631 B | **0.00%** | 527,688 B | `1a3eb50e320015ce` |

Every atlas is byte-identical to `b16e39b3`, every contract's declared `files.atlas.bytes` matches the file on disk, and the pinned builder's guard was run to prove the tree still reproduces rather than merely to prove I did not touch it:

```
Blender --background --python assets/pilots/map-rebuild-spike/verify_e1_panoramas.py -- \
    the-claim dry-gulch twin-banks baron
→ all 8 E1 panorama artefacts reproduce byte for byte      (rc=0)
```

**Recommendation to the owner, one line:** strike the panorama clause from every remaining beauty brief rather than re-measuring it per map — unreachability is a property of `Balance.camera`, not of a map, and it is now guarded by a test (§5) that will go red the day that stops being true.

---

## 3. SCOPE ITEM 3 — THE FAR TERRAIN EDGE: **KEEP, on all four maps**

The surface the run camera's top edge actually contains is `Terrain3dSculptContinuation` — the apron running from the 64x64 tile's far edge out to the ring's foot. The atmospherics shift shipped profiles for `e1-baron` and `e1-dry-gulch`. **`the-claim` and `e1-twin-banks` had nothing**, and both are maps whose briefs asked for a horizon.

Each new profile is written from its own brief's style anchor and DON'T list rather than from a template:

- **`the-claim`** — *"the first page of the ledger: sunlit parchment banks where the river writes the only dark line."* Its U4 asked for "downstream river valley ridges… density falling to quiet parchment"; its DON'T list forbids scarring the tutorial map. So: long soft valley shoulders (wavelength 22, the widest of the four), a warm parchment haze, a grey-warm ceiling that goes quiet rather than bruised — and **no company smoke at all**, because smoke is incident and this map's identity is calm.
- **`e1-twin-banks`** — *"one river that chose two paths around a gravel plait… a single family holds both banks."* Its U5 asked for "a desaturated cottonwood line, two distant smoke columns echoing the two-homestead motif (asymmetric placement — the Echo law)". So: a desaturated green-grey ceiling (E1 canon keeps greens dusty) and **exactly two** asymmetric columns at `smokeStrength 0.22` — hearths, at a little over half the Baron's 0.4, because these are a family's fires and not his works.

### The paired board — one window, `?horizonApron=off` as the A/B, top quarter of the frame

| Map | viewport | pose | top-25 luma | Δ | stdev | colour buckets | draw calls | p95 ms |
|---|---|---|---|---|---|---|---|---|
| `the-claim` **NEW** | desktop | boot | 55.9 → **55.9** | -0.0 | 19.4 → 19.4 | 35 → 34 | 85 → 86 | 10.4 → 10.2 |
| `the-claim`  | desktop | fresh-eye | 65.1 → **65.1** | +0.0 | 19.2 → 19.2 | 33 → 34 | 85 → 86 | 10.1 → 10.1 |
| `the-claim`  | desktop | centre | 78.7 → **78.7** | +0.0 | 11.2 → 11.2 | 23 → 23 | 82 → 82 | 10.1 → 10.1 |
| `the-claim`  | desktop | push | 68.1 → **72.3** | +4.2 | 16.8 → 17.4 | 13 → 12 | 72 → 71 | 10.1 → 10.2 |
| `the-claim`  | desktop | far-half | 73.3 → **105.0** | +31.7 | 16.7 → 7.8 | 10 → 8 | 64 → 64 | 10.0 → 10.4 |
| `the-claim`  | desktop | far-edge | 69.5 → **113.4** | +43.9 | 14.2 → 5.1 | 10 → 3 | 63 → 62 | 10.2 → 10.4 |
| `the-claim`  | 390 px | boot | 55.5 → **55.5** | +0.0 | 18.9 → 18.9 | 17 → 16 | 60 → 61 | 9.9 → 10.2 |
| `the-claim`  | 390 px | fresh-eye | 65.0 → **65.0** | +0.0 | 18.4 → 18.4 | 16 → 15 | 58 → 58 | 10.2 → 10.3 |
| `the-claim`  | 390 px | centre | 78.4 → **78.4** | +0.0 | 11.8 → 11.8 | 12 → 12 | 58 → 58 | 10.2 → 10.0 |
| `the-claim`  | 390 px | push | 67.0 → **67.7** | +0.7 | 18.2 → 18.4 | 13 → 13 | 54 → 55 | 10.2 → 9.4 |
| `the-claim`  | 390 px | far-half | 72.7 → **100.1** | +27.4 | 17.7 → 10.4 | 12 → 10 | 51 → 51 | 10.2 → 9.0 |
| `the-claim`  | 390 px | far-edge | 70.0 → **111.8** | +41.8 | 15.4 → 6.9 | 11 → 6 | 50 → 50 | 10.3 → 10.3 |
| `twin-banks` **NEW** | desktop | boot | 62.9 → **69.4** | +6.6 | 15.9 → 19.4 | 13 → 13 | 79 → 79 | 10.1 → 10.3 |
| `twin-banks`  | desktop | fresh-eye | 61.8 → **61.8** | +0.0 | 18.0 → 18.0 | 35 → 35 | 96 → 96 | 9.8 → 10.3 |
| `twin-banks`  | desktop | centre | 71.6 → **71.6** | +0.0 | 13.6 → 13.6 | 30 → 29 | 91 → 91 | 9.6 → 10.4 |
| `twin-banks`  | desktop | push | 63.1 → **67.4** | +4.3 | 16.1 → 17.7 | 15 → 14 | 80 → 80 | 10.0 → 10.0 |
| `twin-banks`  | desktop | far-half | 69.5 → **104.2** | +34.6 | 14.5 → 11.2 | 8 → 8 | 72 → 72 | 10.1 → 10.0 |
| `twin-banks`  | desktop | far-edge | 66.8 → **115.0** | +48.2 | 12.3 → 8.1 | 8 → 7 | 69 → 69 | 10.4 → 10.2 |
| `twin-banks`  | 390 px | boot | 60.6 → **62.3** | +1.6 | 17.4 → 18.1 | 12 → 12 | 57 → 57 | 9.9 → 10.2 |
| `twin-banks`  | 390 px | fresh-eye | 63.0 → **63.0** | +0.0 | 15.7 → 15.7 | 21 → 21 | 65 → 65 | 9.9 → 10.0 |
| `twin-banks`  | 390 px | centre | 72.0 → **72.0** | +0.0 | 13.4 → 13.4 | 16 → 15 | 62 → 62 | 9.9 → 9.8 |
| `twin-banks`  | 390 px | push | 60.8 → **61.4** | +0.6 | 17.6 → 17.7 | 12 → 12 | 58 → 58 | 10.2 → 10.2 |
| `twin-banks`  | 390 px | far-half | 68.5 → **97.7** | +29.2 | 15.4 → 13.8 | 9 → 11 | 55 → 55 | 10.2 → 9.7 |
| `twin-banks`  | 390 px | far-edge | 66.8 → **114.7** | +47.8 | 13.5 → 7.5 | 9 → 9 | 54 → 54 | 10.1 → 10.0 |
| `dry-gulch` shipped | desktop | boot | 65.7 → **65.7** | +0.0 | 23.0 → 23.0 | 43 → 42 | 89 → 89 | 10.0 → 9.2 |
| `dry-gulch`  | desktop | fresh-eye | 69.3 → **69.3** | +0.0 | 23.6 → 23.6 | 44 → 44 | 89 → 89 | 10.2 → 10.2 |
| `dry-gulch`  | desktop | centre | 77.8 → **77.8** | +0.0 | 24.0 → 24.1 | 39 → 38 | 87 → 88 | 10.3 → 10.0 |
| `dry-gulch`  | desktop | push | 60.8 → **65.1** | +4.3 | 25.7 → 26.2 | 15 → 17 | 77 → 77 | 10.2 → 9.8 |
| `dry-gulch`  | desktop | far-half | 69.7 → **113.4** | +43.7 | 24.8 → 18.3 | 12 → 17 | 68 → 68 | 10.1 → 9.9 |
| `dry-gulch`  | desktop | far-edge | 66.0 → **136.7** | +70.7 | 22.4 → 6.5 | 10 → 5 | 66 → 66 | 10.0 → 9.8 |
| `dry-gulch`  | 390 px | boot | 54.7 → **54.7** | +0.0 | 23.4 → 23.4 | 31 → 31 | 63 → 63 | 10.2 → 9.4 |
| `dry-gulch`  | 390 px | fresh-eye | 61.5 → **61.5** | +0.0 | 24.6 → 24.6 | 30 → 30 | 63 → 63 | 10.5 → 9.7 |
| `dry-gulch`  | 390 px | centre | 72.9 → **73.0** | +0.2 | 28.6 → 28.8 | 33 → 34 | 62 → 62 | 10.1 → 9.4 |
| `dry-gulch`  | 390 px | push | 58.8 → **59.1** | +0.3 | 27.2 → 27.3 | 10 → 10 | 59 → 58 | 10.5 → 10.1 |
| `dry-gulch`  | 390 px | far-half | 68.4 → **103.0** | +34.5 | 26.5 → 21.6 | 13 → 18 | 55 → 55 | 10.3 → 9.9 |
| `dry-gulch`  | 390 px | far-edge | 64.9 → **135.0** | +70.1 | 24.6 → 8.8 | 13 → 8 | 53 → 53 | 10.3 → 10.3 |
| `baron` shipped | desktop | boot | 24.5 → **24.5** | +0.0 | 14.4 → 14.4 | 20 → 20 | 82 → 82 | 10.6 → 10.4 |
| `baron`  | desktop | fresh-eye | 25.5 → **25.5** | -0.0 | 14.3 → 14.3 | 22 → 22 | 82 → 82 | 10.2 → 10.3 |
| `baron`  | desktop | centre | 25.6 → **25.6** | +0.0 | 8.5 → 8.5 | 18 → 18 | 79 → 79 | 10.2 → 10.2 |
| `baron`  | desktop | push | 24.6 → **29.2** | +4.6 | 4.6 → 10.0 | 5 → 10 | 69 → 70 | 10.1 → 10.4 |
| `baron`  | desktop | far-half | 24.5 → **66.9** | +42.4 | 4.5 → 11.7 | 3 → 6 | 62 → 62 | 10.4 → 10.2 |
| `baron`  | desktop | far-edge | 24.8 → **72.2** | +47.5 | 4.5 → 14.1 | 3 → 8 | 61 → 62 | 10.2 → 9.9 |
| `baron`  | 390 px | boot | 23.0 → **23.0** | -0.0 | 12.9 → 12.9 | 21 → 21 | 58 → 57 | 10.4 → 10.0 |
| `baron`  | 390 px | fresh-eye | 23.0 → **23.0** | -0.0 | 12.4 → 12.4 | 20 → 20 | 57 → 57 | 9.8 → 10.0 |
| `baron`  | 390 px | centre | 26.1 → **26.1** | +0.0 | 8.2 → 8.2 | 20 → 20 | 58 → 57 | 10.3 → 9.9 |
| `baron`  | 390 px | push | 23.2 → **23.9** | +0.8 | 4.3 → 4.2 | 5 → 5 | 53 → 54 | 10.1 → 9.9 |
| `baron`  | 390 px | far-half | 23.4 → **60.4** | +37.1 | 3.9 → 15.0 | 3 → 8 | 50 → 50 | 10.2 → 10.1 |
| `baron`  | 390 px | far-edge | 23.6 → **74.2** | +50.6 | 3.7 → 9.2 | 3 → 6 | 49 → 49 | 10.3 → 10.0 |

**Read the zeros first.** At `boot`, `fresh-eye` and `centre` the delta is 0.0 on every map and both viewports — because the apron is 0.00% of those frames, which the probe said before a line of paint was written. **This upgrade exists from the moment the player pushes into the far half and not one second before.** That is the same honest shape the atmospherics shift published for its two maps, now measured for four.

**Read the stdev column second, because it is the one that is not good news.** On the three warm maps the haze *flattens* the band it brightens: `the-claim`'s far edge goes 14.2 → 5.1 stdev and 10 → 3 colour buckets. `e1-baron` is the exception and the reason why — it starts near-black (24.8 luma), so haze *adds* structure there (4.5 → 14.1, 3 → 8). The far ground now recedes correctly and carries less texture doing it. F-FG-4.

**Perf.** Worst after/before frame p95 across all 48 paired shots is **+8.3%** (`e1-twin-banks` desktop `centre`, 9.6 → 10.4 ms), inside the +15% law with room; every other row is within ±5%, and the whole set sits in a 8.9–10.6 ms band that is this box's idle cadence rather than a signal. **Draw calls and triangles are the trustworthy numbers, and they are equal — asserted, not eyeballed** (§5).

### A/B'd and REJECTED, by measurement — the ridged haze

The far band is flat (above). The mechanism that should fix it: modulate the **haze mix** by the ridge phase, so crests stand out of the air and troughs fill with it, rather than multiplying `diffuseColor` *before* a 0.72 wash toward a flat colour — which mixes seven tenths of the ridge straight back out.

**This also corrects the instrument that retired the idea the first time.** `reviews/beauty-atmos.md` §9 concluded the ridges were "shader instructions doing almost nothing" from a **mean-luma** measurement, and *the mean of a sine is zero by construction* — that instrument could not have seen banding at any amplitude. Judged on stdev and colour count instead:

| Cut | `the-claim` far edge, desktop | `e1-baron` far edge, desktop | Verdict |
|---|---|---|---|
| shipped (flat haze) | luma 113.4 · **sd 5.1** · 3 buckets | luma 72.2 · sd 14.1 · 8 buckets | the baseline |
| haze modulated at **0.5x** depth | luma 114.2 · sd 6.31 · 4 buckets | luma 72.6 · sd 15.3 · 8 buckets | **rejected — a near-no-op.** +1.2 stdev, +1 bucket, for a shader branch |
| haze modulated at **1.6x** depth | luma 115.9 · **sd 9.87** · 7 buckets | luma 72.7 · **sd 19.6** · 10 buckets | **rejected — it works, and it breaks the Baron** |

At 1.6× the numbers are exactly what was wanted: **structure nearly doubles while the mean moves 2.5 luma**, i.e. recession preserved, texture restored. And the picture kills it: on `the-claim` the far band reads as haze pooling in the distance (`reviews/shots-beauty-far-ground/ridged16/the-claim-desktop-chrome-far-edge.png`), but on `e1-baron` the same coefficient draws **two hard diagonal amber smears across the top of the frame** (`…/ridged16/baron-desktop-chrome-far-half.png`) — because baron carries a deeper ridge (0.30 vs 0.22) against a near-black ceiling, so the same relative swing lands as a stripe.

**Reverted, not shipped.** The correct form is a per-profile coefficient, which means a new field, four retunings and a fresh 48-shot board — more than this shift can do honestly at the end of it. Both rejected arms are kept whole (`reviews/shots-beauty-far-ground/ridged*`, `metrics-ridged*.json`), so the next shift starts from the answer rather than the question. F-FG-5.

### A hypothesis TESTED AND REFUTED, recorded because I believed it twice

Looking at the boards I twice concluded the apron meets the terrain in a hard horizontal seam — once on `dry-gulch`, once on `baron`, and on baron I was ready to file it. Measured as a row-to-row luminance profile down the middle of the frame (dry-gulch on the atmospherics shift's own pair, `artifacts/beauty-atmos/dry-gulch/{before,after}-far.png`, columns 400–900; baron on this shift's pair, `reviews/shots-beauty-far-ground/{before,after}/baron-desktop-chrome-far-half.png`, middle 40%):

| frame | max row-to-row luma jump, picture area | verdict |
|---|---|---|
| `dry-gulch` far, apron off | **4.3** | no seam |
| `dry-gulch` far, apron on | **4.0** | no seam — and rows 360-420 are identical between arms |
| `baron` far-half, apron off | **1.6** | no seam |
| `baron` far-half, apron on | **2.1** | no seam |

The apron's ramp fades out before it reaches the tile edge, so the 45-luma drop happens over 20+ rows. **What the eye reads as an edge is a content change (hazy vs textured), not a luminance step.** Two eyeball readings, both wrong, both caught by one profile.

---

## 4. THE BOARD

Contact sheets, before over after, six poses per row: `reviews/shots-beauty-far-ground/board/<map>-<viewport>.png` — eight sheets, four maps x two viewports.

| Sheet | What it shows |
|---|---|
| `the-claim-desktop-chrome.png` | **The deciding sheet for this shift.** Columns 1-3 are identical by construction; columns 4-6 are the upgrade. |
| `twin-banks-desktop-chrome.png` | The second new map, with the two hearth columns. |
| `dry-gulch-desktop-chrome.png` · `baron-desktop-chrome.png` | The two shipped profiles, re-measured and boarded for the first time at six poses. |
| `*-mobile-chrome.png` | 390 px portrait, same six poses. |

Full frames: `reviews/shots-beauty-far-ground/{before,after}/`. Probe census frames: `artifacts/beauty-far-ground/probe-*.png`. Rejected arms: `…/ridged/`, `…/ridged16/`.

**Day only, and that is a fact rather than an omission.** The brief asks for "day + (where the map has phases) dusk/dark". None of these four maps has a night rig — `nightShift.enabled` reads `false` on all eight boots (published in `metrics-{before,after}.json` under `gates`), because the phase system is `Balance.contracts.nightShift` and belongs to `e1-night-shift` alone. There is no dusk or dark frame to shoot.

---

## 5. Evidence

| Gate | Result |
|---|---|
| `tsc --noEmit` | **clean** (rc=0), before any edit and at every milestone |
| `npm run build` | **green**, asset diet inside its ceilings |
| `verify_e1_panoramas.py` (the byte-pin guard) | **all 8 E1 panorama artefacts reproduce byte for byte** (rc=0) for the four maps in scope |
| `e2e/beauty-far-ground.spec.ts` (new) | **14/14**, desktop + mobile |
| Required suite battery — `night-mode-truth`, `night3d-perf`, `beauty-pools`, `panorama-framing`, `map-beauty-dry-gulch`, `e1-{baron,dry-gulch,twin-banks,night-shift,perf-pass}` | **93 passed / 10 failed** in one 15.7-minute run, `--workers=1`, both projects (`artifacts/beauty-far-ground/gate-battery.txt`) — **all 10 control-proven pre-existing**, below |
| `night-mode-truth` (4) · `beauty-pools` (2) · `panorama-framing` (12) · `map-beauty-dry-gulch` (4) · `e1-dry-gulch` (12) · `e1-perf-pass` (2) | **green, untouched** — including `panorama-framing`, the suite that asserts the upper rows of a run frame carry world detail, which is exactly the band this shift paints |
| `e1-baron` (11 tests x 2 projects) | **green, none failing** — worth saying out loud: `reviews/beauty-atmos.md` §5b left **`e1-baron:343`** (*contract board requires science plus two secured claims and always shows an earned medal*) open and RED on both projects, F-BEAUTY-BARON-1, *"the E1 launch door is still measuring something that no longer passes"*. It ran on both projects in this battery (entries 10/104 and 62/104) and **passed**. Not this shift's doing and observed once, not re-proved — but the door is shut. |
| Panorama atlas bytes | **unchanged, 0.00%**, all four maps (§2) |
| Draw calls / triangles | **equal, apron on vs off**, all four maps x both projects — asserted |
| Frame p95 | worst paired row **+8.3%**, against a +15% law |
| Console / page errors | **zero** across all 96 board frames and all 112 probe frames |
| Sim bytes | **zero** — see §6 |

### The 10 reds are 10 pre-existing — control-proven, not inherited

Detached worktree at **`b16e39b3`** (this branch's base), its own vite on scratch port **5352**,
`GR_CAPTURE_EXTERNAL_SERVER=1` so it never shares the branch's server, `--workers=1`, each spec run
**alone** rather than inside a 104-test battery. Full transcripts and every error context:
`artifacts/beauty-far-ground/control-7c833197/`.

| Test | control at `b16e39b3` | this branch | verdict |
|---|---|---|---|
| `e1-night-shift:271` x2 projects | ✘ ✘ | ✘ ✘ | pre-existing |
| `e1-night-shift:372` x2 | ✘ ✘ | ✘ ✘ | pre-existing |
| `e1-night-shift:435` x2 | ✘ ✘ | ✘ ✘ | pre-existing — the flicker-phase coin flip, F-10/F-5b |
| `night3d-perf:67` x2 | ✘ ✘ | ✘ ✘ | pre-existing |
| **`e1-twin-banks:103` x2** | ✘ ✘ | ✘ ✘ | pre-existing — **and it was on no known-red list** |

**10 of 10. No red on this branch survives a control run at the base commit.**

`e1-twin-banks:103` is the one that had to be proved rather than argued: **twin-banks is a map this
shift added a profile to**, so "a fragment shader cannot break a sluice placement" is exactly the
kind of confident reasoning Mistake #4 exists to stop. It fails identically on a tree that has never
seen this branch — same assert, same `Timeout 5000ms exceeded while waiting on the predicate` inside
`placeBuildableAt` — running alone, on both viewports. **It belongs on the known-red list and is not
on it** (F-FG-8). The other eight were already documented as pre-existing in
`reviews/beauty-night-shift-r2.md`; they are re-proved here rather than inherited.

**One battery side effect, not mine and already filed.** The run left 12 tracked evidence PNGs
modified under `artifacts/baron-presence/`, `reviews/shots-night/` and `reviews/shots-panorama/` —
**F-1451-1** verbatim ("an ordinary battery run OVERWRITES retained tracked evidence"). All were
restored to HEAD before committing, so nothing here carries another suite's re-published artefacts.

### What the new spec asserts, and why each line is machine-independent

The F-1440-2 cure is "machine-independent **by code path**, not by luck", so every assert is one of three shapes: pure projection arithmetic, an equality between two arms of the same browser, or a diff between two frames captured seconds apart. Nothing compares against a number recorded on another host; the only cross-run comparison is behind `GR_FAR_GROUND_COMPARE=1`, and with the flag off `artifacts/beauty-far-ground/band-baseline.json` is structurally unopened.

1. **The ring's foot projects above the top of the canvas**, per map, with the radius and height read out of that map's own shipped contract rather than hardcoded. This is the shift's finding as a guard: **it goes red the day someone lifts the camera**, which is exactly the day the shelved sky briefs become fundable again.
2. **The apron is `painted` in a plain boot** on all four contracts (Mistake #10: where does the player see this?), and `?horizonApron=off` returns `plain`.
3. **+0 draw calls, +0 triangles**, apron on vs off.
4. **The far band moves by >1 luma** at z-30 — the assert that would have caught the atmospherics shift's first cut, whose ramp played out entirely beyond the reachable radius.
5. **The probe still reports which surfaces it repainted**, so the instrument cannot rot back into the state §1a found it in.

### Two instrument defects found while proving assert 3 — both mine, both caught by measurement

**F-FG-2 — the renderer's counters are still moving seconds after a teleport.** On `e1-twin-banks` at z-30, in ONE arm, with byte-identical code and no flag change, ten consecutive reads gave draw calls `67,67,67,69,69,69,69,69,69,69` and triangles `126096` x3 then `126100` x7. A paired A/B that samples either side of that step reports a phantom cost for a shader-only change that cannot move geometry. The spec now polls until the pair repeats three times. **The paired board in §3 was captured before this was known, which is why its draw-call column carries ±1 rows that are settle noise and not the apron** — the spec, not the board, is the authority for "+0 draw calls".

**F-FG-3 — the two arms were booting with different RNG seeds.** `seed=far-ground-calls-on` vs `…-calls-off`. Scatter placement is seeded, so the seed *was* the difference: it moved twin-banks by **24 triangles on desktop and 36 the other way on mobile**. A sign flip is never a shader cost. One variable at a time, and I had two.

---

## 6. Merge classification

- **Base:** `b16e39b3`, verified as an ancestor at pre-flight; tracked tree clean before any edit.
- **`src/world/HorizonApron.ts`** — LANE-TOUCHED. Two new `PROFILES` entries (`the-claim`, `e1-twin-banks`); the `?farGroundProbe` instrument and its `solo` control; `horizonApronProfile` returns `undefined` while probing, because the probe measures the surface and a ridged hazed apron is not a flat primary. **The shipped `e1-baron` and `e1-dry-gulch` profiles are byte-unchanged**, and the shader body is byte-unchanged — the ridged-haze experiment was reverted (§3).
- **`src/world/Terrain3dClaimPilot.ts`** — LANE-TOUCHED, one import and one debug-gated block at the end of `installLoaded`, publishing `terrain3dPilotFarGroundProbe`. With no flag it writes the string `off` and does nothing else.
- **`e2e/beauty-far-ground.spec.ts`** — NEW, this slice's own spec only.
- **`scripts/beauty-far-ground{,-board,-sheet}.mjs`** — NEW, all under `scripts/beauty-*`.
- **`docs/beauty/*-brief.md`** — four dated STATUS blocks recording the retarget where the next reader will look.
- **Zero sim bytes.** No contract JSON, no GLB, no atlas, no terrain or panorama artefact, no `Balance`, no camera, no `townLayout`, no heightfield, ford, mount, spawn, lane or RNG. `Game.ts`, `Economy`, `CombatSystem` and every profile are untouched. The only runtime change with no flag set is a fragment-shader block on **one cloned material** on two more contracts.
- Commits, each pushed and verified against `git ls-remote`: `c614c07c` (instrument), `d947a792` (the paint + spec + board), and this review.

---

## 7. Findings

**F-FG-1 🔺 — the instrument two reviews cited was never committed. CURED HERE.** `?horizonProbe` is quoted in `reviews/beauty-atmos.md` §3 and in `src/world/HorizonApron.ts:10` as the measurement that retargeted two briefs and justified shipping two profiles. `git log -S horizonProbe -- src/` returns one commit, and the only thing it added is the docstring quoting it. **Three shipped decisions rested on a number nobody could reproduce.** `?farGroundProbe` is that instrument in the tree, with a positive control and a spec that keeps it alive. The general lesson is bigger than this file: *a measurement that funded a merge belongs in the same commit as the merge.*

**F-FG-2 🔺 — renderer draw-call and triangle counters keep moving for seconds after a teleport. CURED IN THIS SPEC, LIVE EVERYWHERE ELSE.** Numbers in §5. Every board in this program reads `renderer.calls` after a fixed wait — `beauty-night-sky-board.mjs`, `beauty-atmos-board.mjs` and this shift's own board included. Any of their ±1 draw-call rows may be this. **Non-blocking; the corrective is a stability poll, and it is six lines.**

**F-FG-3 🟡 — a paired A/B that varies the seed as well as the flag. MINE, FIXED.** §5. Recorded because the failure was invisible: both arms were "the same map at the same pose", the difference was 24 triangles, and it looked exactly like a real cost.

**F-FG-4 🔺 — the apron trades texture for recession, and nobody had measured it. OPEN, WITH THE NUMBERS.** The haze brightens the far band and flattens it: `the-claim` 14.2 → 5.1 stdev and 10 → 3 colour buckets, `dry-gulch` 22.4 → 6.5 and 10 → 5, `twin-banks` 12.3 → 8.1. `e1-baron` is the exception because it starts near-black. **This is the apron's real cost and it has been shipping on two maps since the atmospherics shift without a number on it.** The fix is known and measured (F-FG-5); it is not landed.

**F-FG-5 🟡 — the ridged haze works and needs a per-profile coefficient. MEASURED, REVERTED, HANDED ON.** §3. At 1.6× depth, `the-claim`'s far-edge stdev goes 5.1 → 9.87 and buckets 3 → 7 while the mean moves 2.5 luma; the same coefficient puts two diagonal smears across `e1-baron`. Both arms kept whole. **A `ridgeHazeCoefficient` per profile, and one 48-shot board, is the whole remaining task.**

**F-FG-6 🟡 — the published frame-top angle is short by 0.5-1.6°. CORRECTED.** `beauty-night-shift-r2.md` F-7's **−27.9°** assumed a 26.2 m eye and measured the distance from the *hero*, while the eye stands 18.3 m further back. Measured from two probes on one ray: **−28.4° to −29.5°**, implied eye 25.96-26.75 m. The conclusion was right; the number should not be re-quoted.

**F-FG-8 🟡 — `e1-twin-banks:103` is a pre-existing red that is on no known-red list. FILED.** It fails on the untouched base commit, both projects, running alone on its own server, with a 5 s predicate timeout inside `placeBuildableAt`. Every other red this battery produced is documented somewhere; this one is not, so the next shift that touches twin-banks will spend the same hour I did proving it is not theirs. **The corrective is a line on the known-red inventory, not a fix** — diagnosing a build-placement timeout is not a beauty shift's to take.

**F-FG-7 🟡 — TASK.md's premise is wrong for two of its four maps. NOTED, AND THE BRIEFS NOW SAY SO.** It funds "the four E1 maps whose **U5** slices were mistargeted at sky". `the-claim`'s sky slice is **U4**, not U5 (its U5 is motes and glints), and **`e1-dry-gulch` has no panorama slice at all** — its U5 is the heat shimmer, and its far ground was already shipped by the atmospherics shift. Two of the four "mistargeted U5 slices" do not exist as described. The work was done on the maps rather than on the labels, and all four briefs now carry a dated block saying which slice was answered and how.

---

## 8. THE HONEST LINE — what still looks wrong

- **Three of the four columns on every sheet are identical, and they are the columns players see most.** At boot, at the fresh-eye camera every E1 brief names, and at the centre of the map, this upgrade is 0.00% of the frame. It is a reward for pushing into the far half. On `the-claim` — a tutorial map with a locked win at wave 10 — a player may reasonably never go there, and then this shift bought them nothing. **The frame that most wants a horizon is still the one no horizon surface reaches**, and that remains a camera-pitch ruling and the owner's (F-1203-2).
- **The far band is flatter than it was.** F-FG-4. I shipped a brighter, emptier distance on three maps and measured it rather than hiding it; the cure is one field away and I did not land it.
- **The two hearth columns on twin-banks are a guess I could not judge.** `smokeStrength 0.22` against baron's 0.4 is reasoned from the brief ("a family holds both banks", not a company) and it is not visible enough in the boards to say it reads as smoke rather than as a soft darkening. The atmospherics shift said the same of its three columns and shipped them anyway. Two shifts have now paid for azimuthal smoke without either being able to show it working.
- **Nothing here was judged by a human playing it.** Every verdict is a measured render at a pinned camera and my own eye on a still. My eye was wrong twice in one afternoon about a seam that a row-profile refuted in seconds — which is the argument for the instruments and against the eye, including mine on the parts nobody measured.
- **The rejected arms are the most useful thing here for whoever comes next.** The ridged haze is not a hypothesis any more: it is a mechanism with two measured coefficients and a known failure mode on one specific map.

---

## 9. FOR THE DRAIN — ledger lines, ready to lift

This shift never touches `tasks/BACKLOG.md`, `STATUS.md` or `tasks/queue/` (brief §Role). The lines
below are written to be lifted verbatim by whoever drains this branch, following the pattern the
atmospherics shift used (`logs/session-scratch/atmos-backlog-lines.md`).

**OWNER'S DESK — one line, one recommendation, no blocking.**
> 🔺 **The panorama clause should be struck from every remaining beauty brief.** Measured on four E1
> maps, both viewports, 56 samples plus a hidden-occluder control: **the ring's foot stands 61–65 m
> above the top edge of the frame at its own radius**, and no panorama pixel reaches any run frame.
> This is a property of `Balance.camera`, not of a map, so re-measuring it per map is waste. ~30 MB
> of authored horizon art across 34 panorama GLBs has no viewer at the shipped camera.
> **Recommendation: stop briefing panoramas; brief the apron.** Reversible in one word if the camera
> question (F-1203-2) is ever answered the other way — `e2e/beauty-far-ground.spec.ts` goes red on
> that day by construction and points here.

**FINDINGS TO CARRY.** F-FG-1 (cured), F-FG-2 🔺 (renderer counters unsettled — every board in this
program reads them after a fixed wait; corrective is six lines), F-FG-4 🔺 (the apron flattens the
band it brightens, unmeasured on two shipped maps until now), F-FG-5 🟡 (the ridged haze works and
wants a per-profile coefficient — both arms banked), F-FG-6 🟡 (the published −27.9° is short),
F-FG-7 🟡 (TASK.md's premise wrong for two of four maps; briefs amended), **F-FG-8 🟡 —
`e1-twin-banks:103` is a pre-existing red on no known-red list; it wants a line on the inventory.**

**GATE for the one upgrade left on the table (F-FG-5):** a `ridgeHazeCoefficient` per profile is
retired when `the-claim`'s far-edge top-quarter stdev is ≥ 9 **and** `e1-baron`'s far-half frame
carries no diagonal banding at the same coefficient — both arms of that comparison are already in
`reviews/shots-beauty-far-ground/ridged16/`.
