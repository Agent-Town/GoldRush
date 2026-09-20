# town-cast-walk8-hard-alpha-recut — stage 2 of owner ruling A19, implementer report

**Master**: `tasks/town-cast-walk8-hard-alpha-recut.md` · **Branch**: `feat/town-cast-walk8-hard-alpha-recut`, cut from main `f130ddd84` · **Source of the despilled RGB**: `sol/code-review-20260908` (`92f6cc115`), taken by `git checkout … -- <path>` only, never merged, nothing under `artifacts/` taken (F-SPRDR-9).
**Ruling**: owner 2026-09-13, verbatim **"A19 - that is ok"** → option (b) of `reviews/drain-review-sprites-roster.md` §5 F-SPRDR-2: re-cut the heavy town-cast sheets with a harder alpha edge rather than raise the 35,000,000 B budget the owner set on 2026-09-07 ("raise the budget, this is a good size in my opinion, we don't have to go too crazy").
**Implementer**: Claude Opus 5, native, 2026-09-14, Node 26.4.0 (`/opt/homebrew/bin`), in a scratch worktree. Every number below was measured on this tree by a command named beside it; nothing is inherited from the review.

## Headline

**Nine of the ten named families landed, one is held.** The first town's **GATED TOTAL falls 33,947,377 → 28,670,172 B against the 35,000,000 B budget — 6,329,829 B of headroom, up from 1,052,623** — and not one landed family needed the +5 % the master allowed: every one came in *below* main. Over those nine families, main → landed:

| | main | landed |
| --- | ---: | ---: |
| visible violet-key px (alpha ≥ 16, R−G ≥ 40, B−G ≥ 40) | **88,438** | **0** |
| key-coloured px under fully transparent px | **10,158,666** | **0** |
| partial-alpha px | **161,618** | **0** |
| dist bytes | **16,031,224** | **10,996,656 (−31.4 %)** |

`char-schoolteacher-sheet-walk8-a` is **HELD** on art grounds, not byte grounds (F-RECUT-2 below). `char-hero-elder-sheet-walk4-{a,b}` and `char-hero-silver-sheet-walk4-a` were never candidates (item 5, F-SPRDR-10). `assets/first-town-payload.json`, `demandPaged`, `BUDGET_LIMIT`, `scripts/deploy.sh`, `scripts/first-town-payload.mjs` and `src/**` are untouched.

## 1. Why the bytes actually grew, and what the re-cut does about it

The 2026-09-12 review named the cause as doubled partial-alpha counts. **Measured here, that is not the dominant term.** On `char-storekeeper-sheet-walk8` the branch's partial-alpha count *falls* (19,907 → 8,225) while its bytes rise 143 %, so a cell-level decomposition was run (`_probe2.mjs`, `_probe5.mjs`):

| `char-youngster-m-sheet-walk8-r0c0.png` | shipped | zopflipng | sharp lossless |
| --- | ---: | ---: | ---: |
| main | 56,088 | 54,751 | 70,482 |
| branch | 143,926 | 77,466 | 98,848 |
| branch's alpha, field flattened | — | — | **70,298** |
| hard alpha + a fresh full bleed | — | — | **94,881** |
| hard alpha + flat field | — | — | 68,430 |
| **hard alpha + flat field (what landed)** | **47,252** | **47,252** | — |

(the encoders are kept in separate columns because they differ by up to 25 % on this content and mixing them would misattribute the cause; the field's cost is read off the two **sharp lossless** rows that differ only in the field — 94,881 − 68,430 = **26,451 B per cell**). The reason is one line of census: **main's transparent field holds 2 distinct colours; the branch's holds 6,363.** The branch's `bleedEdges` field — the colour of the art propagated outward under the transparent region, `scripts/extract-alpha.mjs:330`, filled *to exhaustion* — is high-entropy over 92 % of every cell and does not compress. Measured cost, same encoder both sides: **+26,451 B per cell, ≈ +7.19 MB over the 272 cells of this payload group**, which on its own would put the GATED TOTAL at ~35.8 MB, i.e. over the budget the ruling refused to raise. The feathering is real but cheap (≈ 0.6 kB/cell).

**The recipe** (`recut.mjs`):
1. start from the branch's despilled cell;
2. **alpha binarised at 128** — a hard edge, zero partial-alpha pixels, so "at most a one-pixel partial-alpha ring" and "≤ 1.15 × main's count" hold by construction. Main's own `char-youngster-m-sheet-walk8-r0c0` is *already* fully binary (partial = 0), so this restores main's convention rather than inventing one;
3. **the branch's despilled RGB kept byte-for-byte wherever alpha is 255** — the halo cure is the point, and nothing inside the figure moves;
4. **one flat colour under every alpha=0 pixel**;
5. encoded pngjs → `zopflipng` (best of auto-filters and `--filters=0me`), round-trip verified.

Two measurements decided step 4, and it is this report's one deliberate compromise:

* **What main actually ships in the 1-px ring immediately outside the figure is `#ff00ff`, pure, every pixel**: 1,207 px on `char-youngster-m-…-r0c0`, 1,381 on `char-storekeeper-…-r0c0`, 704 on `char-hero-…-r0c0` (`_probe6.mjs`). That is the halo, and it is why the cure matters at all.
* A binary alpha lets `zopflipng` write **colour-type 2 + `tRNS`** instead of RGBA — measured 46,939 vs 56,096 B on that cell — and the encoder then picks the `tRNS` key itself (`#000000`). So the shipped field is black, not a bleed: **better than main's magenta, worse than the branch's bleed.** The round-trip check was written to match: every alpha byte identical, every RGB byte identical wherever alpha > 0, the RGB under alpha = 0 free to become the key.

**That compromise was simulated before it was accepted** (`halo-simulation.mjs`): each cell box-filtered to 48 px the way three.js samples it (RGB averaged over *all* texels including transparent ones, alpha averaged separately — the non-premultiplied path `bleedEdges` exists for), composited over the town's sand, and the mean colour of the rim band (resampled alpha 0.1–0.9) read off:

| cell | main rim RGB | branch rim RGB | re-cut rim RGB |
| --- | --- | --- | --- |
| `char-youngster-m-…-r0c0` | **174, 34, 140** (magenta) | 113, 76, 52 | 53, 37, 22 |
| `char-storekeeper-…-r0c0` | **171, 30, 140** (magenta) | 95, 59, 37 | 95, 61, 35 |
| `char-elder-…-r0c0` | 113, 85, 52 | 112, 80, 58 | 50, 37, 24 |

`halo-sim-char-youngster-m-sheet-walk8-r0c0.png` is the eyes-on: main draws a bright pink outline round the whole figure; branch and re-cut are clean and, at the size a town actor is actually drawn, indistinguishable from each other.

**The alternative that was priced and rejected**: a 1-px bleed ring forces colour-type 6 back and costs ≈ +10 kB/cell (57,492 vs 47,252 on the sample) — affordable globally (≈ +2.7 MB, GATED ~31.4 MB) but it breaches the master's **per-family** ≤ main + 5 % bound, `char-storekeeper-sheet-walk8-r0c0` landing at +6.0 %. The bound is the master's; the bleed is a preference.

## 2. Per-family table (item 7)

Bytes are dist bytes (these families are copied verbatim into `dist/`; confirmed against `first-town-payload.log`). "partial" is partial-alpha pixels per sheet, "violet" visible violet-key pixels, "KUT" key-coloured pixels under fully transparent pixels; height is the shortest/tallest figure at alpha ≥ 128.

| family | cells | bytes main → branch → **re-cut** | vs main | partial main → cut (branch) | violet main → cut | KUT main → cut | height band main → cut (max cell Δ) | verdict |
| --- | ---: | --- | ---: | --- | --- | --- | --- | --- |
| `char-youngster-m-sheet-walk8` | 32 | 1,674,779 → 4,418,482 → **1,408,964** | **−15.87 %** | 21,962 → 0 (36,874) | 20,126 → 0 | 2,407,578 → 0 | 294-324 → 292-320 (10) | **LANDED** |
| `char-youngster-f-sheet-walk8` | 32 | 1,697,838 → 4,381,720 → **1,364,531** | **−19.63 %** | 20,793 → 0 (38,022) | 19,606 → 0 | 2,390,734 → 0 | 288-322 → 286-322 (11) | **LANDED** |
| `char-storekeeper-sheet-walk8` | 32 | 1,799,846 → 4,374,551 → **1,534,605** | **−14.74 %** | 19,907 → 0 (8,225) | 18,261 → 0 | 2,320,423 → 0 | 298-324 → 304-314 (14) | **LANDED**, F-RECUT-3 |
| `char-tavernkeeper-sheet-walk8` | 32 | 2,346,127 → 4,778,815 → **1,731,569** | **−26.19 %** | 18,817 → 0 (35,010) | 0 → 0 | 0 → 0 | 290-324 → 290-318 (8) | **LANDED** |
| `char-newsie-mei-sheet-walk8` | 32 | 1,518,573 → 3,765,969 → **1,265,510** | **−16.66 %** | 17,873 → 0 (20,075) | 16,416 → 0 | 2,452,759 → 0 | 292-292 → 291-294 (2) | **LANDED** |
| `char-assay-clerk-sheet-walk8-a` | 16 | 1,273,681 → 2,027,962 → **847,090** | **−33.49 %** | 12,394 → 0 (10,225) | 0 → 0 | 0 → 0 | 314-320 → 318-320 (6) | **LANDED** |
| `char-schoolteacher-sheet-walk8-a` | 16 | 1,265,989 → 1,994,668 → *(772,136)* | *(−39.01 %)* | 12,133 → *(0)* (11,306) | 2 → *(1)* | 0 → 0 | 301-336 → *(308-314)* (28) | **HELD** — F-RECUT-2 |
| `char-preacher-sheet-walk8-a` | 16 | 1,089,959 → 1,807,904 → **716,302** | **−34.28 %** | 13,249 → 0 (13,750) | 0 → 0 | 0 → 0 | 282-304 → 282-304 (9) | **LANDED** |
| `char-elder-sheet-walk8` | 32 | 4,083,354 → 4,391,203 → **1,728,499** | **−57.67 %** | 18,258 → 0 (16,480) | 0 → 0 | 0 → 0 | 296-328 → 298-326 (4) | **LANDED** |
| `char-hero-sheet-walk8` | 32 | 547,067 → 1,259,338 → **399,586** | **−26.96 %** | 18,365 → 0 (21,115) | 14,029 → 0 | 587,172 → 0 | 158-164 → 158-164 (2) | **LANDED** |
| **landed total (9)** | **256** | **16,031,224 → 31,205,944 → 10,996,656** | **−31.4 %** | **161,618 → 0** | **88,438 → 0** | **10,158,666 → 0** | | |

Key pixels counted as "key": `#ff00ff` and `#8a8a8a`. Contact sheets per family — row 1 main · row 2 branch · row 3 re-cut · row 4 |main − re-cut| at 6× — are `contact-<stem>.png` here; `zoom-youngster-m-r0c0-head.png` and `zoom-schoolteacher-r2c0.png` are 3× crops; `strip-walkcycle-suspects.png` and `strip-schoolteacher-rows.png` are whole-row walk strips (main row above re-cut row); `in-game-town-cast-{desktop,mobile390}.png` and `in-game-elder-desktop.png` are the town as the player sees it with these cells in.

**The Elder fell furthest (−57.7 %) without the re-cut doing most of the work.** Its *branch* cells are only 7.5 % larger than main's; main's own encoding of that sheet was simply far from optimal — `char-elder-sheet-walk8-r0c0.png` is 138,764 B on main and the identical pixels re-encode to 82,344. Most of that family's saving is encoder, not cutout.

## 3. Item 3 — the lossless re-encode

Stage 1 HELD all 93 of the review's "free bytes on the table" families, so main still carries **main's** encoding of them: there is no branch bloat left to undo and the only bytes on offer are what a stronger lossless encoder finds. The pass (`lossless-reencode.mjs`) ran over the set the master's parenthetical defines — every `townsfolk-*` plate, all seven `boss-railcar-*` plates, `char-prospector-portrait.png`, **102 files** — and **each output was verified pixel-identical to its input on all four channels before it was kept**.

| | |
| --- | ---: |
| files | 102 |
| shrank | **101** |
| already optimal | 1 (`townsfolk-youngster-b.png`, byte-identical, untouched) |
| before | 35,017,019 B |
| after | **32,750,172 B** |
| **recovered, for zero changed pixels** | **2,266,847 B** |

Largest: `townsfolk-charter-keeper-e10` −82,445 · `townsfolk-he3-assayer-e8` −82,392 · `townsfolk-shipwright-e5` −80,007 · `boss-railcar-intact` −78,513 · `townsfolk-quack-e10` −77,289. Of that, **242,638 B lands in the gated `plates` group** (4,815,078 → 4,572,440); the rest is off-payload weight the deploy still ships.

The same pass over the HELD `char-schoolteacher-sheet-walk8-a` cells **recovered 0 B** — main's encoding of that family is already zopfli-optimal — so those 16 files are untouched and byte-identical to main.

## 4. Item 4 — the guards

### `scripts/halo-reextraction-check.mjs`
All nine landed stems are declared in `REGENERATED_SHEETS` with a dated cause naming the ruling, the recipe, the measured deltas and the reason the schoolteacher is absent. Main's invariant text is **unchanged and still strict**; Astra's relaxed "opaque-RGB change within 3 px of alpha" clause was not taken here either. Re-pinned by measurement (`_partition.mjs` prints the partition):

| | before | after | cause |
| --- | ---: | ---: | --- |
| `expectedResidual` | 160 | **0** | the five stems it stood for (`char-hero`, `char-newsie-mei`, `char-storekeeper`, `char-youngster-f`, `char-youngster-m` walk8) are all declared now. **Nothing is held back from the invariant any more**, so the `deepEqual` asserts the sweep finds *zero* halo suspects in `assets/processed` — the strongest form this guard has taken |
| `regenerated` | 456 | **680** | +160 released from `expectedResidual`, +64 the never-HELD stems re-cut here (32 tavernkeeper + 16 assay-clerk + 16 preacher) |
| `cured` | 459 | **395** | −64, those three stems leaving. The 16 `char-schoolteacher-sheet-walk8-a` cells **stay in `cured`** — held family, main's cells, byte-for-byte invariant still running over them |
| `scanned` | 1401 | **1401** | re-measured, unmoved: this land adds and removes no PNG |

`node scripts/halo-reextraction-check.mjs` → **PASS: 395 cured, 0 held, 680 regenerated-and-cured, 1401 scanned; alpha and opaque RGB unchanged.**

### `e2e/elder-walk8-woman.spec.ts` — height pin re-measured
`src/town/TownScene.ts:3386` anchors three actors' billboards (tavernkeeper, storekeeper, Elder) on their `.frames.json` sidecar's `bbox[3]-bbox[1]+1`. **Measured on main, the sidecar tracks the shipped cell's own figure height to within 1 px** (mean |Δ| 0.47 / 0.53 / 0.28), so the sidecars are not decorative and had to travel with the cells, as stage 1's two did. Leaving them behind would have drifted the footline by a mean of 3.22 / 7.09 / 1.53 px, max 13 (`footline-check.mjs`). The re-base (`sidecar-rebase.mjs`) **translates each box by the measured per-cell delta between main's cell and the re-cut's**, so the sheet-space origin is preserved and no coordinate is invented; `char-hero-sheet-walk8` ships 256 px cells against a 512 px sidecar `cell`, so its deltas are scaled by that ratio. After the re-base the sidecar tracks the shipped cell to 0.28–0.53 mean, max 1 — main's own fidelity, restored.

Elder pin, re-measured and re-pinned with the cause: **min 296 → 298, max 328 → 326**, excursions outside the nominal 298-321 band **still exactly 5** (now r0c2 323, r0c4 326, r0c5 323, r0c6 324, r0c7 326 — largest excursion 5 px, down from 7). The hard tolerance assertions (288–331) did not move. F-SPRDR-12 predicted this pin would move and read 297 on Astra's own branch; on the hard-alpha re-cut it reads 298. The spec's first assertion — every Elder cell differs from the bearded sheet at BASE — still holds at 32/32.

## 5. Findings

### F-RECUT-1 — the flat transparent field is a deliberate, priced compromise (non-blocking, owner's eye)
Stated in full in §1. Main ships a magenta 1-px ring; the branch ships a full `bleedEdges` field that costs ≈ 7.1 MB over this payload group and breaks the budget the ruling refused to raise; the land ships a flat field (colour-type 2 + `tRNS`, key `#000000`). Simulated and eyes-on it reads clean at the size a town actor is drawn. Reversible: the 1-px-bleed variant is priced at ≈ +2.7 MB and would breach the per-family +5 % bound on the storekeeper alone.

### F-RECUT-2 — `char-schoolteacher-sheet-walk8-a` row 2 is a different generation of the character (HELD)
`strip-schoolteacher-rows.png` and `zoom-schoolteacher-r2c0.png`: main's whole sheet — and the branch's own rows 0, 1 and 3 — wear a **tiered, ruffled skirt**; the branch's **row 2 wears a plain one**, with a different hand prop and a different bag carry. Landing it would make the schoolteacher change outfit when she walks that direction. Row-signature screen (`row-signature.mjs`): r2 mean figure height **336.0 → 311.0 (−25.0 px)** while r0 does not move at all (313.0 → 313.0, mean RGB distance 0.8). That is F-SPRDR-10's class — an unratified art change to a shipped town actor — and the family carries only **2** visible violet-key pixels on main, so the cure buys nothing visible. **HELD, with main's cells, which is the safe state.** Its re-cut would have been −39.0 % (772,136 B) and is reproducible from `recut.mjs` in one command if the owner wants that row re-taken. Main's own row 2 carries a stray detached fragment under the boots (visible in the same strip) — a pre-existing defect this land neither fixes nor worsens.

### F-RECUT-3 — the storekeeper's rows 2 and 3 change scale by ~4 % (LANDED, owner's eye)
Row-signature: r0 −5.6 px, **r2 −11.8 px, r3 +9.1 px**, mean RGB distance 10.8 on r2. Eyes-on (`contact-char-storekeeper-sheet-walk8.png`, and row strips reproducible with `_strip.mjs`) shows the **same man, same apron, same pose family** — the branch's re-extraction framed those rows slightly differently, which reads as the actor being ~4 % taller or shorter depending which way he faces. A scale/framing shift, not a recolour or a replacement; and the family carries 18,261 visible violet-key pixels whose cure is the point of the ruling, so it landed and is reported rather than held. Smaller versions of the same jitter: youngster-f r3 −2.9, preacher r3 +6.8, assay-clerk r2/r3 +3.5/+3.8, tavernkeeper ≤ 1.6, newsie ≤ 0.5, Elder ≤ 1.4, hero ≤ 0.9. Reverse any of them with one word.

### F-RECUT-4 — the frame phase moves within a row (non-blocking, measured)
`frame-correspondence.mjs` matches each main cell against every branch cell of the same row by mask IoU. Self-IoU is 0.85–0.95 for most cells, but a handful read much lower against themselves and much higher against a neighbour (`char-newsie-mei-…-r2c1` self 0.416 / best 0.954 at c5; `char-youngster-f-…-r1c0` self 0.450 / best 0.909 at c5; `char-storekeeper-…-r1c0` self 0.612 / best 0.958 at c1): the branch's re-extraction landed a slightly different stride phase in some cells. **The direction rows are preserved** (verified on the contact sheets: main and re-cut show the same facing in the same column groups) and **the cycles still read as coherent 8-frame walks** (`strip-walkcycle-suspects.png`, newsie r2 and storekeeper r1). Nothing in the game indexes an absolute phase, so this is cosmetic — but the review did not predict it and it is recorded here.

### F-RECUT-5 — `assets/master-divergent.json` records nine mends on `char-hero-sheet-walk8` that this land supersedes (outside the firewall)
It names 9 `char-hero-sheet-walk8` cells (r0c4, r0c6, r1c1, r1c3, r2c0, r2c3, r3c1, r3c4, r3c5) with `"reason": "Cutout-pocket alpha mend was applied to the 256px shipped cell after master extraction."`, `"commit": "ad64b175"`. Those shipped cells are replaced here, so the rows now describe a tree that no longer exists. The file is **outside this master's firewall** and was not touched; whoever next edits that manifest should retire or re-point those nine rows. The halo guard's `expectedResidual`, the other mechanism that protected those mends, is retired deliberately and with its cause written in.

### F-RECUT-6 — `assets/processed-full` masters were not re-cut
`char-hero-sheet-walk8` is the only one of the ten with `assets/processed-full` cells (32). Nothing in `src/` or `vite.config.ts` reads that tree, it is outside the payload, and stage 1 took no masters for its own re-cuts either. Left as main's, so the shipped cell and its master now diverge for that family in the way nine of them already did (F-RECUT-5).

## 6. Every gate, with its exact result

| gate | command | result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit` | **rc=0**, 0 lines |
| plain build | `npm run build` | **rc=0** |
| release build | `GR_RELEASE=e1 npm run build` | **rc=0** (`scripts/deploy.sh:103` builds with `GR_RELEASE="${GR_RELEASE:-e1}"`; a plain build cannot measure the payload — it lacks the release-only ceremony chunk) |
| **first-town payload** | `node scripts/first-town-payload.mjs` on the release build | **rc=0 — GATED TOTAL 28,670,172 B vs 35,000,000 B, headroom 6,329,829 B** (baseline on this tree's main `f130ddd84`: 33,947,377 B, headroom 1,052,623). Demand-paged 0 B, as before. Full output: `first-town-payload.log` |
| halo invariant | `node scripts/halo-reextraction-check.mjs` | **PASS** — 395 cured, 0 held, 680 regenerated-and-cured, 1401 scanned |
| the four named node guards | `node --test scripts/{deploy-budget,first-town-request-families,character-direction-assets,hero-clip-groups}.test.mjs` | **40 pass / 0 fail**, 11.4 s |
| e2e, both projects, one worker | `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5350 npx playwright test e2e/elder-walk8-woman.spec.ts e2e/town-cast-wiring.spec.ts e2e/m1-01-claim-jumpers-death.spec.ts e2e/m2-01-build-menu.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line --trace=off` | **32 passed / 0 failed, 2.2 min** |
| plain boot, no `?debug` | `node artifacts/town-cast-walk8-hard-alpha-recut/plain-boot-probe.mjs` | **0 console errors, 0 page errors, 0 failed requests** on desktop 1280×800 and mobile 390×844; `plain-boot-{desktop,mobile390}.png` |
| encoder losslessness | inside `recut.mjs` and `lossless-reencode.mjs` | every one of the 256 re-cut cells: alpha byte-identical to the constructed image, RGB byte-identical wherever alpha > 0. Every one of the 102 re-encoded files: **all four channels byte-identical** to its input |

`e2e/town-cast*.spec.ts` as it exists on main is `e2e/town-cast-wiring.spec.ts` (one file); both of its tests pass, including *"plain town boot shows the tavernkeeper and storekeeper walking on anchored feet"* — the footline assertion the sidecar re-base of §4 exists to keep true.

Tracked evidence the e2e run rewrote — `artifacts/056/*.png` (3), `reviews/shots-elder-walk8-regeneration/*.png` (2), `reviews/shots-town-cast/*.png` (2) — was **copied into this directory and then restored with `git checkout --`**; nothing outside the firewall is staged.

## 7. What was touched

`assets/processed/**` only: 256 re-cut cells across nine families, 9 `.frames.json` sidecars, 101 losslessly re-encoded portrait/plate files. Plus `scripts/halo-reextraction-check.mjs` (declarations and re-pins only), `e2e/elder-walk8-woman.spec.ts` (the two height pins and their cause only), `assets/LEDGER.md` (one batch row), `artifacts/town-cast-walk8-hard-alpha-recut/**`. **No** `src/**`, no `assets/first-town-payload.json`, no `scripts/deploy.sh`, no `scripts/first-town-payload.mjs`, no other e2e assertion, no `assets/layer-contracts/**`, no `assets/engine-era.json` — and `computeEngineHash()` cannot have moved, since nothing here is in `ENGINE_SOURCE_INPUTS`.

## 8. Open questions for the drainer and the owner

1. **F-RECUT-1, the flat field.** The land trades the branch's `bleedEdges` field for a flat one because the bleed costs ≈ 7.1 MB and the owner refused to raise the budget. It is measured, simulated and eyes-on clean, but it is a departure from `scripts/extract-alpha.mjs`'s own stated law ("fills to exhaustion … mip level N averages 2^N texels"). One owner word buys the 1-px bleed back for ≈ +2.7 MB, at the cost of the per-family +5 % bound on the storekeeper.
2. **F-RECUT-2, the schoolteacher.** Held because the branch's row 2 wears a different skirt. If the owner wants that family cured, row 2 needs re-taking from the plate rather than accepting the branch's; the other three rows are fine and the family is worth 493,853 B.
3. **F-RECUT-3, the storekeeper's ~4 % row scale.** Landed, reported, reversible with one word.
4. **F-RECUT-5, `assets/master-divergent.json`.** Nine `char-hero-sheet-walk8` mend rows now describe superseded cells; the file is outside this firewall.
5. **The 2,266,847 B of §3 are a floor, not a ceiling.** The same pass over the rest of `assets/processed` would very likely recover several MB more for zero visual change — `char-elder-sheet-walk8` alone was 40 % over-encoded before this land — but the firewall confines item 3 to the families the review named. Worth a corrective that runs it repo-wide.
6. **Nothing in the node battery notices a bad payload declaration** (F-SPRDR-7, still open): the four guards above pass 40/0 whatever `scripts/first-town-payload.mjs` says. Unrelated to this land, still owed.

## 9. The instruments in this directory

`recut.mjs` (the re-cut itself) · `lossless-reencode.mjs` (item 3) · `census.mjs` + `census-main-vs-branch.json` (main vs branch) · `contact.mjs` (contact sheets) · `frame-correspondence.mjs` (F-RECUT-4) · `row-signature.mjs` (F-RECUT-2/-3 screen) · `footline-check.mjs` + `sidecar-rebase.mjs` (§4) · `halo-simulation.mjs` (F-RECUT-1) · `plain-boot-probe.mjs` · `_partition.mjs` (the halo re-pins) · `_probe1…9.mjs`, `_heights.mjs`, `_strip.mjs`, `_zoom.mjs`, `_artcheck.mjs` (the one-off measurements quoted above, kept rather than deleted per the retention law) · `final-table.json` (§2 as data).
