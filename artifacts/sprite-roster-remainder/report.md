# sprite-roster-remainder — implementer's report

**Task:** `tasks/sprite-roster-remainder.md` · **Branch:** `feat/sprite-roster-remainder`, cut from main `b70ef3b31` in the scratch worktree `wt-roster` · **Implementer:** Claude Opus 5 on the owner's Anthropic subscription · **Date:** 2026-09-17.
**Owner, verbatim (2026-09-15/17):** "I care mostly about the quality of the animations and I had the impression that Astra really understood and nailed that." · "I think what Astra started is worth it" · "Lets do them all." · "All on the Anthropic subscription".
Main was never written. `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json` were never touched. Nothing was pushed, nothing merged, no image was generated. The sibling worktree `wt-boss-models` was never read or written.

---

## VERDICT: F-SPR-06 CURED for all nine E6–E9 slots; F-SPR-07 cured in five of its six named places, one held with a measurement and one recorded as needs-cells

| | |
|---|---|
| headings registered | **72 new explicit headings** (9 slots × 8) + 3 replaced and 1 added on four already-8-way slots |
| cells wired | **612 cells, 60 families, 37,290,065 B** on disk, every one taken from `sol/code-review-20260908` with the prescribed `git checkout` and referenced by `assets/layer-contracts/characters.v2.json` in the same commit |
| first-town payload | **48,968,840 B** against the 52,000,000 B limit — **3,031,160 B of headroom**, and **+0 B** against main |
| engine hash | `16d2c9bb4a8aa619494186f6e51d5b94640b925532476c80d47529ea261c9e4e` |
| held | 2 families (`char-baron-walk4-diagonal-v2`, `char-thief-se-f0..f7`), each with its reason and its number |
| needs cells | 4 items, none mirror-faked, re-scaled or generated |

---

## 1. The measurement, before and after — every slot on the animator board

`artifacts/sprite-roster-remainder/board.mjs` builds one `SpriteAnimator` per heading against the live dev server, drives `walk` 128 frames in each of the eight headings, records every source frame key the heading reaches, and renders the eight headings side by side. Boards: `before/<slot>.png` and `after/<slot>.png`; machine-readable rows: `before/rows.json`, `after/rows.json`. **Zero console or page errors in either run.**

"Distinct facings" counts how many DIFFERENT cell sets the eight headings resolve to. 1 / 8 is F-SPR-06's defect stated as a number: eight headings, one facing.

| slot | before | after | what changed |
|---|---|---|---|
| `char.e6.feral_toaster` | **1 / 8** | **8 / 8** | F-SPR-06 registered |
| `char.e6.lawn_shepherd` | **1 / 8** | **8 / 8** | F-SPR-06 registered |
| `char.e6.glowjack` | **1 / 8** | **8 / 8** | F-SPR-06 registered |
| `char.e7.rogue_automaton` | **1 / 8** | **8 / 8** | F-SPR-06 registered |
| `char.e7.data_rustler` | **1 / 8** | **8 / 8** | F-SPR-06 registered |
| `char.e8.scrap_corsair` | **1 / 8** | **8 / 8** | F-SPR-06 registered |
| `char.e8.sun_glare_shambler` | **1 / 8** | **8 / 8** | F-SPR-06 registered |
| `char.e9.feral_terraformer` | **1 / 8** | **8 / 8** | F-SPR-06 registered |
| `char.e9.claim_jump_prospect_drone` | **1 / 8** | **8 / 8** | F-SPR-06 registered |
| `char.baron` | 8 / 8 | 8 / 8 | F-SPR-07: `ne` and `w` swapped to the clean plates |
| `char.bandit_thief` | 8 / 8 | 8 / 8 | F-SPR-07: `se` swapped to a real south-east walk |
| `char.e2.rail_tough` | 8 / 8 | 8 / 8 | F-SPR-07: `n` swapped to a true back view |
| `char.e2.coal_thief` | 4 / 8 | 4 / 8 | F-SPR-07: `n` swapped to a true back view; diagonals are declared aliases |
| `char.e2.steam_wrecker` | 4 / 8 | 4 / 8 | F-SPR-07: `n` swapped to the rear boiler; diagonals are declared aliases |
| `char.claim_jumper` | 4 / 8 | 4 / 8 | unchanged — see the HELD entry |
| `char.prospector_agent` | 4 / 8 | 4 / 8 | unchanged — already reconciled, see §4 |
| `char.hero` | 8 / 8 | 8 / 8 | unchanged — already reconciled, see §4 |
| `char.bandit_base` | 8 / 8 | 8 / 8 | not in scope, measured as a control |

**F-SPR-06's count re-measured today:** Astra wrote "nine E6–E9 slots" on 2026-09-08 and the number is still exactly nine on main at `b70ef3b31`. None of the nine had a single direction registration; all nine now have eight.

---

## 2. F-SPR-06 — the nine E6–E9 slots

### 2.1 What was actually on main (a correction to the master)

`tasks/sprite-roster-remainder.md`'s READ-FIRST line says the E9 `feral_terraformer` / `claim_jump_prospect_drone` and E8 `sun_glare_shambler` "per-direction walk8 sheets `-{n,ne,e,se,s,sw,w,nw}` landed at stage 1 and are the model of a fully registered slot". **They did not land.** Verified by listing both trees: main carries exactly ONE eight-cell sheet per E6–E9 slot (`char-e9-feral_terraformer-sheet-walk8-r{0,1}c{0..3}.png`, the flat loop) and not one per-direction cell. What landed at stage 1 was the nine FLAT sheets — `reviews/drain-review-sprites-roster.md` §1 lists them as "the E6–E9 enemy walk8 sheets (9)". The model of a fully registered slot on main is a town actor (`char.town.tavernkeeper`), not an E9 enemy.

The per-direction art is real and finished — 576 cells, authored by Astra between 2026-09-08 and 2026-09-12 and written up slot by slot in `reviews/sol-findings-sprite-roster-fixes-20260908.md` ("Glowjack — eight directional loops integrated … 64 distinct frames across eight headings"; "Rogue Automaton — directional glitch poses integrated"; the Corsair S/N/NE/NW/W/E/SW/SE staging notes; "Data Rustler eight-direction integration"). It sits on `sol/code-review-20260908` referenced by nothing, which is the F-SPRDR-4b class this master exists to close.

**The judgement made here:** take it, with the prescribed `git checkout sol/code-review-20260908 -- assets/processed/<family>*`, and register it. Reporting nine slots as "needs cells / needs an art batch" while 576 finished cells sit in git would have been the false answer, and scope item 2 asks for a registration wherever the per-direction cells exist. It is isolated in **its own commit** (`f726a1391`) so a drainer can take or drop it independently of the F-SPR-07 half.

### 2.2 The cells wired

| slot | families | cells | bytes | heading → source |
|---|---:|---:|---:|---|
| `char.e6.feral_toaster` | 2 | 64 | 1,472,343 | `-walk8-a` rows 0/1/3/2 → s/sw/n/se, `-walk8-b` rows 0/1/2/3 → w/nw/ne/e |
| `char.e6.lawn_shepherd` | 2 | 64 | 4,377,556 | same row map as the Toaster |
| `char.e7.rogue_automaton` | 2 | 64 | 3,159,822 | `-walk8-a` rows 0–3 → s/sw/w/nw, `-walk8-b` rows 0–3 → n/ne/e/se |
| `char.e6.glowjack` | 8 | 64 | 4,752,317 | one `-<dir>` sheet per heading |
| `char.e7.data_rustler` | 8 | 64 | 2,748,621 | one `-<dir>` sheet per heading |
| `char.e8.scrap_corsair` | 8 | 64 | 3,665,991 | one `-<dir>` sheet per heading |
| `char.e8.sun_glare_shambler` | 8 | 64 | 2,348,688 | one `-<dir>` sheet per heading |
| `char.e9.feral_terraformer` | 8 | 64 | 5,446,404 | one `-<dir>` sheet per heading |
| `char.e9.claim_jump_prospect_drone` | 8 | 64 | 2,976,617 | one `-<dir>` sheet per heading |
| **total** | **54** | **576** | **30,948,359** | |

Every file list is taken from the branch's own `characters.v2.json`, so the heading→cell mapping is Astra's, not re-derived. Each slot keeps its original flat loop as its `frames`/`clips` fallback, exactly as the landed walk8 slots keep theirs.

**Two keys deliberately NOT taken.** Astra's blocks carry `groundContactY` and `frameBlendMs: 0`. Main's contract carries neither, anywhere (grep count 0 for both). `SpriteAnimator.anchorSprite` reads `groundContactY` to choose between `center.y = 0.5` at `unanchoredSpriteY` and `center.y = 1 - contact` at `groundY`, so a value on ONE heading of a slot whose siblings have none would jump that figure vertically on every turn into it; `frameBlendMs` likewise overrides `Balance.anim.frameBlendMs` (80 ms) for that one heading only. Both belong to Astra's separate ghosting/grounding campaigns, which have not landed. Consistency within a slot wins.

### 2.3 Eyes on

`after/char_e6_glowjack.png` against `before/char_e6_glowjack.png` is the clearest single proof: before, eight identical left-facing figures; after, eight genuine facings with the lantern changing hands and the hat brim and goggles reading correctly front and back. `after/char_e6_feral_toaster.png` shows the same for a machine whose rotation reads subtly (the green front panel rotates away and the leg arrangement changes) — the numbers back the eye there: eight distinct cell sets.

---

## 3. F-SPR-07 — the reconciliations, one by one

F-SPR-07, verbatim: *"Baron NW/NE boards contain dark triangular ground remnants, and its east row differs visibly in style. Claim Jumper cardinal walk art varies in size/style. Rail Tough north and Prospector west need raw-to-runtime direction reconciliation."*

| # | the finding's clause | verdict | evidence |
|---|---|---|---|
| a | Baron **NE** ground remnants | **CURED** | `after/baron-ne-w.png` rows 1–2 |
| b | Baron **NW** ground remnants | **NOT PRESENT on this tree** | measured, below |
| c | Baron **east row** style mismatch | **NEEDS CELLS** — measured, no plate staged | `before/baron-all-rows.png` row 3 |
| c' | Baron **west row** style mismatch (same defect, on the row Astra cut a plate for) | **CURED** | `after/baron-ne-w.png` rows 3–4 |
| d | Claim Jumper cardinal size/style variance | **HELD — generation difference, not a framing artefact** | `before/jumper-cardinals.png` |
| e | Rail Tough north | **CURED** | `after/e2-north.png` rows 1–2 |
| e' | Coal Thief north, Steam Wrecker north (same class) | **CURED** | `after/e2-north.png` rows 3–6 |
| f | Prospector west | **ALREADY CURED on main** | §4 |
| g | the thief's SE (the master's own extra) | **CURED** | `after/thief-se.png` |

### 3.1 Baron NE — the dark triangular ground remnant

`assets/processed/char-baron-sheet-walkdiag8` row 3 carries a dark wedge under the boots in seven of its eight cells. Measured as dark (max channel < 55) opaque pixels in the bottom tenth of the figure, per cell, normalised to a 256 cell:

| row | heading | dark px/cell |
|---|---|---:|
| walkdiag8 r0 | sw | 523 |
| walkdiag8 r1 | se | 429 |
| walkdiag8 r2 | **nw** | **373** |
| walkdiag8 r3 | **ne (before)** | **739** |
| `char-baron-ne-clean-v2` | **ne (after)** | **380** |

The NE row is the outlier at 739 and the replacement lands at 380, next to NW's 373 — **−48.6 %**, and the wedge is gone by eye in all eight cells. **NW is clean on this tree**: at 373 it is the cleanest of the four diagonals, so F-SPR-07's "NW/NE" is NE's alone today and NW keeps main's art. Identity held: figure 76.37 % → 75.15 % of its cell, mean opaque RGB 74.3/37.2/29.1 → 76.1/38.0/26.2.

### 3.2 Baron W — the style-mismatched side row

`char-baron-sheet-walk8` row 1 (the `w` heading) is the brighter, rounder, more cartoon drawing of the Baron with a pale drop shadow; every other heading is the darker painterly one. `char-baron-w-clean-v2` puts west back in the house style and drops the shadow: figure 76.95 % → 75.98 % of its cell, RGB 77.6/44.1/32.6 → 80.9/46.1/31.7, boot-band dark pixels 601 → 478. See `after/baron-ne-w.png` rows 3–4.

### 3.3 Baron E — the remaining half, and why it is not faked

The east row is the one F-SPR-07 names and the one with no staged plate. Measured across all eight of the Baron's headings on main:

| heading | figure as % of cell | mean opaque RGB |
|---|---:|---|
| s | 75.39 | 76.3/45.8/33.1 |
| w (before) | 76.95 | 77.6/44.1/32.6 |
| **e** | **80.66** | **63.4/39.2/24.8** |
| n | 76.07 | 70.7/34.8/25.9 |
| sw / se / nw / ne | 76.07 – 76.37 | 72–74 / 35–37 / 27–29 |

East is 4–5 percentage points larger than every other heading and visibly the darkest. That is the finding, measured. It is recorded as needs-cells and **not** mirrored from west, not re-scaled, not generated.

### 3.4 Rail Tough / Coal Thief / Steam Wrecker north — a raw-to-runtime mismatch, three times

All three `walk4-a` sheets put a NON-north pose in the row the contract reads as north:

| slot | what row 3 actually shows | replacement | figure height, before → after (512 cell) |
|---|---|---|---|
| `char.e2.rail_tough` | three-quarter LEFT-facing walk | `char-railtough-north4-v2` | 279.0 → 279.0 px (54.49 % → 54.49 %) |
| `char.e2.coal_thief` | three-quarter LEFT-facing walk, sack on the left shoulder | `char-coalthief-north4-v2` | 261.0 → 266.8 px (50.98 % → 52.10 %) |
| `char.e2.steam_wrecker` | the machine FRONT-on, amber eye to camera | `char-steamwrecker-north4-v2` | 241.5 → 229.0 px (47.17 % → 44.73 %) |

`after/e2-north.png` shows all six rows: the before rows walk across the frame, the after rows walk away from the camera. The Steam Wrecker's −12.5 px is the lamp cluster that only the front silhouette carries, not a rescale — its cell size, extraction scale and hue band are unchanged (RGB 101.9/71.6/47.0 → 106.1/76.4/39.2).

### 3.5 The thief's south-east

`char-bandit-thief-sheet-walkdiag8` row 1 (`se`) shows the same away-from-camera pose as row 0 (`sw`) — two headings, one facing, inside a slot that scores 8/8 on the cell-set metric because the cells differ while the FACING does not. `char-thief-se-finish-v2` is a genuine toward-camera south-east walk. Figure 280.3 → 265.3 px (54.74 % → 51.81 % of a 512 cell), RGB 86.0/60.0/34.3 → 93.4/63.2/36.7, hue held. `after/thief-se.png` rows 1–3 (row 3 is main's SW, shown so the before/SW sameness is visible).

---

## 4. Already cured before this task started — the Prospector's work and attack rows

Scope item 3 asks for `char-hero-sheet-work8-{south-clean-v7,west-recovered-v1,north-clean-v1,east-clean-v1}` and `char-hero-sheet-attack8-r2-east-clean-v1` to be wired for the Prospector's work and attack rows. **All five are already on main and already wired** — `src/assets/character-runtime-frames.json` references every one of them under `heroPoseFrameFiles.pan.{s,w,e,n}` and `heroPoseFrameFiles.attack.e`, landed by `sol/sprite-animator-src-slim` on 2026-09-15, and `assets/first-town-payload.json` already carries all five in its `excluded` list with the dated reason. Verified by grep over `src/` and by reading the runtime-frames file. **Nothing to do; five of the twenty staged families were already closed.**

The companion reading of "Prospector west" — `char.prospector_agent`'s own west — is also reconciled: `scripts/review-prospector-sprites.mjs` passes on this tree for all three skins at both viewports, asserting w/sw/nw resolve to hover8 row 1, e/se/ne to row 2, n to row 3, s to row 0, with 64 walk sources and 8 held idles each.

---

## 5. HELD — with the reason and the number

### 5.1 `char-baron-walk4-diagonal-v2` (16 cells, 3,677,187 B) — held, and its cells were NOT taken
`char.baron`'s `walk8` block has `status: ACTIVE, enabled: true` and every one of its cells resolves, so `selectWalkSheet()` (`src/assets/SpriteAnimator.ts:1241`) returns `walk8` and **never reaches `walk4` for this slot** — confirmed on the before board, where all four of the Baron's diagonals resolve to `char-baron-sheet-walkdiag8`, i.e. through the walk8 block. Wiring these cells into `walk4` would add 3.7 MB of art nothing renders: exactly the F-SPRDR-4b defect this task exists to close. Wiring them into `walk8`'s diagonals instead is worse — they are 4-frame walk4 art and would downgrade the Baron's 8-frame diagonals to four. The cells were staged, measured, then **removed from the worktree** rather than left on disk unreferenced.

### 5.2 `char-thief-se-f0 … char-thief-se-f7` (8 families, 16 cells, 1,340,073 B) — held, cells not taken
These are Astra's per-frame drafts for the thief's south-east. The branch's own contract references **only** `char-thief-se-finish-v2` and never one of the `-f*` families — so `finish-v2` is the accepted plate and these eight are its superseded intermediates. The master names them as an alternative ("`char-thief-se-f0..f7` / `char-thief-se-finish-v2`"); the finished one is the one wired.

### 5.3 The Claim Jumper's cardinal size/style variance — held, and it is a generation difference
Measured on `char-jumper-sheet-walk8`, all four cardinal rows, 256 cells:

| row | heading | figure px | figure as % of cell | mean opaque RGB |
|---|---|---:|---:|---|
| r0 | s | 144.1 | 56.30 | 82.2/47.9/25.8 |
| r1 | w | 162.5 | **63.48** | 84.6/51.4/31.9 |
| r2 | e | 146.8 | 57.32 | 89.0/52.1/29.6 |
| r3 | n | 120.1 | **46.92** | 103.0/59.6/32.5 |

A 16.6-percentage-point spread: the Jumper renders 35 % taller walking west than walking north. The master asks whether this is a re-extraction framing artefact (re-extract) or a generation difference (hold). **It is a generation difference, and the ledger says so.** `assets/LEDGER.md` row 31 records the sheet as a Seedance production in which each direction is a SEPARATE video take ("down t1 … left t2 … right t1 … up t2", with rejected retakes per direction) grafted into one sheet under a **single global sheet scale of 0.3774**. One scale was already applied to all four rows, so the height differences are in the source takes, not in the cut; re-extracting with per-row scales would rescale the artwork itself and break the one-shared-extractor-scale convention. The eye agrees with the numbers: r1 leans far forward with a flowing poncho and r3 is hunched low — different poses, not different crops. **Recorded as needs-cells.**

---

## 6. NEEDS CELLS — for a future art batch, on an owner word

Nothing below was mirrored, re-scaled or generated. No image generation of any kind was run.

| # | slot | directions missing | what is needed |
|---|---|---|---|
| 1 | `char.baron` | `e` | one clean east plate at the 512 grid in the painterly house style, matched to `char-baron-{ne,w}-clean-v2`; today's east row is 80.66 % of its cell against 75–77 % for every other heading and is the darkest of the eight |
| 2 | `char.claim_jumper` | `n` (and ideally `w`) | a re-generated north row at the same subject framing as the south row; the four cardinals were four separate video takes and span 46.9 %–63.5 % of the cell (§5.3). The four diagonals are DECLARED aliases (`aliases: {se:'e', ne:'e', sw:'w', nw:'w'}`), a design choice, not a gap |
| 3 | `char.e2.steam_wrecker` | `sw`, `se`, `nw`, `ne` | four diagonal walk4 rows; today they are declared aliases onto the side rows, so the machine shows a pure side view on every diagonal |
| 4 | `char.e2.coal_thief` | `sw`, `se`, `nw`, `ne` | same as above. (`char.e2.rail_tough` already has its four — `char-railtough-sheet-walkdiag4-a` — which is why it reads 8 / 8 and its two siblings read 4 / 8) |

`char.prospector_agent`'s 4 / 8 is NOT on this list: its hover8 is a four-row sheet whose diagonal mapping `scripts/review-prospector-sprites.mjs` asserts as correct, and the probe passes.

---

## 7. Gates — every one, with its exact result

| gate | command | result |
|---|---|---|
| tsc | `npx tsc --noEmit` | **rc=0, clean** |
| build | `npm run build` | **rc=0** |
| release build | `GR_RELEASE=e1 npm run build` | **rc=0** |
| **first-town payload** | `node scripts/first-town-payload.mjs` | **48,968,840 B** ≤ 52,000,000 B (headroom 3,031,160 B); gated total 88 families / 448 files; Save Data arm 48,785,680 B; 0 demand-paged |
| halo guard | `node scripts/halo-reextraction-check.mjs` | **PASS — 395 cured, 0 held, 680 regenerated-and-cured, 2,059 scanned; alpha and opaque RGB unchanged** |
| `character-direction-assets.test.mjs` | `node scripts/character-direction-assets.test.mjs` | **rc=0** |
| `hero-clip-groups.test.mjs` | `node scripts/hero-clip-groups.test.mjs` | **rc=0** |
| e2e, both projects, one worker | `e6/e7/e8/e9-roster`, `town-cast-wiring`, `elder-walk8-woman`, `m1-01`, `m2-01`, `task-025`, `--project=desktop-chrome --project=mobile-chrome --workers=1` | **60 passed, 6 failed** — all six ATTRIBUTED TO MAIN, see §8 F-SRR-4 |
| animator-board probe (mine) | `node artifacts/sprite-roster-remainder/board.mjs before\|after` | 18 slots × 8 headings, **0 console / 0 page errors** in both runs; nine slots move 1 / 8 → 8 / 8 |
| `scripts/review-enemy-sprites.mjs` | against `http://127.0.0.1:5400/` | **rc=0** — 15 cases × 2 viewports (1280 and 390); every directional family asserts `currentDirection` `e`/`w` per body, independent cursors and materials, immutable UVs, shared atlas source, bounded GPU textures (warm 37 = final 37), zero browser errors |
| `scripts/review-sprite-idle.mjs` | against `http://127.0.0.1:5400/` | **rc=0** — four hero ages × four stop-headings, plus every contract slot × eight headings asserting the idle pose belongs to that heading's own walk family |
| `scripts/review-prospector-sprites.mjs` | against `http://127.0.0.1:5400/` | **rc=0** — 3 skins × 2 viewports, "8 directions, 64 walk sources and 8 held idles passed" each |
| `scripts/review-town-walk.mjs` | against `http://127.0.0.1:5400/` | **rc=0** — 56 stop/resume checks, 576 frame samples across nine town actors, cadence at 20/40/100 Hz |
| plain boot, town + `e6-half-life-hollow` + `e7-relay-rush` + `e8-eclipse` + `e9-dome-basin`, desktop 1280 and mobile 390 | `node artifacts/sprite-roster-remainder/boot.mjs` | **CLEAN: 10 boots, zero console / page / request errors**; screenshots in `boot/` |
| engine hash | `computeEngineHash()` from `scripts/assay-replay-agent.mjs` | `16d2c9bb4a8aa619494186f6e51d5b94640b925532476c80d47529ea261c9e4e` |

A note on the boot probe: the FIRST page load after 612 new files arrive costs a Vite dependency re-optimisation, and that run reported 1,858 aborted `?import&url` requests spread across old and new families alike (the optimiser restart aborting in-flight module requests, with 0 console and 0 page errors). The rerun on a warm optimiser is the clean 10/10 above. Worth knowing before someone reads the first run as a regression.

**e2e specs re-pointed: NONE.** Scope item 4 allows re-points "only what your registrations moved". The registrations moved nothing the six named specs assert — every one of their sprite assertions passes unchanged, and the six reds are an era-arsenal availability flag that has nothing to do with sprite art (§8). No spec file was edited.

### Payload: why it is +0 B and not merely "under the limit"
`scripts/first-town-payload.mjs` sums, per family named in `assets/first-town-payload.json`'s `groups`, the matching files in `dist/`. The groups are `hero`, `cast`, `plates`, `models`, `audio`, `code`, `document` — **not one of them names a family this task touched**, and this task changed no cell of any family they do name. Measured on the release dist:

* 24 new cells reach the e1 bundle (4,470,233 B): `char-baron-ne-clean-v2` (8), `char-baron-w-clean-v2` (8), `char-thief-se-finish-v2` (8). They are bundle weight for enemies the town never spawns, not first-town payload.
* **0** of the 576 E6–E9 cells and **0** of the 12 E2 north cells reach it: `releaseE1CharacterImports()` in `vite.config.ts:218` filters out every slot matching `^char\.e(?:[2-9]|10)\.` before collecting PNG references.
* 16 cells LEFT the e1 bundle because nothing references them any more: `char-baron-sheet-walkdiag8-r3c*` (8) and `char-bandit-thief-sheet-walkdiag8-r1c*` (8) — measured at 0 present in `dist/assets`, against 24 remaining cells for each of those two sheets.
* `assets/first-town-payload.json` was NOT touched, and no family this task lands needs a row in it. The firewall's STOP condition was never reached.

---

## 8. Findings

**F-SRR-1 (scope, for the drainer's eye).** The master's premise that the E6–E9 per-direction sheets "landed at stage 1" is false; they were on `sol/code-review-20260908` only. Without them F-SPR-06 is not curable at all. They were taken by the prescribed command and isolated in commit `f726a1391`. §2.1.

**F-SRR-2 (Baron east, needs cells).** F-SPR-07's "east row differs visibly in style" is measured and real (80.66 % of the cell against 75–77 % for the other seven; the darkest of the eight) and has no staged plate. Astra cut a WEST plate, not an east one. §3.3.

**F-SRR-3 (a guard that was already red on main).** `scripts/halo-reextraction-check.mjs` pins `current.scanned` at 1401. Main at `b70ef3b31` holds **1447** PNGs under `assets/processed` (`git ls-tree -r --name-only HEAD -- assets/processed | grep -c '\.png$'`), so this guard was **RED on clean main before this task touched it** — 46 PNGs landed since the 2026-09-14 re-pin without moving the denominator with them. The re-pin to 2,059 here cures the stale number and its cause comment names both terms (612 mine, 46 not), so the absorption is written down rather than silent. **Somebody should find the 46 and the land that skipped its line.**

**F-SRR-4 (six pre-existing e2e reds, ATTRIBUTED, not inherited).** `e2e/e7-roster.spec.ts:175`, `e8-roster.spec.ts:183`, `e9-roster.spec.ts:184` — "plain <era> boot stays error-free without the debug harness" — fail on `e7Arsenal.enabled` / `e8Arsenal.available` / `e9Arsenal.eraActive` being `false`, on desktop and on mobile. Attributed by two controls on the same harness and the same server:

1. **main's contract, this task's PNGs present** → 3 failed (`logs/e2e-control-contract.log`).
2. **main's contract, all 672 added files moved out of the tree** — i.e. `b70ef3b31` exactly → **3 failed** (`logs/e2e-control-main.log`).

So the reds are main's, not this task's, and not the extra modules in the dev-server glob either. The assertions are era-arsenal availability flags read after `frame > 10` on a plain boot; nothing in them touches sprite art. The tree was fully restored afterwards and verified clean.

**F-SRR-5 (a probe trap worth keeping).** An animator board must NOT call `animator.reset()` before rendering: reset drops the direction, and the re-resolve starts an orientation fade whose OLD half is the slot's fallback cell — which is the slot's SOUTH pose. A board built that way draws eight south-facing figures for every slot no matter what the contract says. Measured on `char.baron`, cured by settling with twenty in-direction updates instead; the reason is written into `board.mjs` so the next reader does not rebuild the same lie.

---

## 9. What was touched

Three commits on `feat/sprite-roster-remainder`:

1. `61e09267c` — **F-SPR-07**: 36 cells + 6 `.frames.json` sidecars (Baron NE/W, the three E2 norths, the thief's SE) and their registrations in `assets/layer-contracts/characters.v2.json`. 43 files.
2. `f726a1391` — **F-SPR-06**: 576 cells + 54 sidecars for the nine E6–E9 slots and their nine `walk8` blocks in the same contract. 631 files.
3. `32d1c1c1e` — **the halo guard**: 60 stems declared in `REGENERATED_SHEETS` with a dated cause, `current.scanned` re-pinned 1401 → 2059 with both terms named.

Plus this report and its instruments under `artifacts/sprite-roster-remainder/` (`board.mjs`, `contact.mjs`, `census.mjs`, `boot.mjs`, `_register-e69.mjs`, the before/after boards, the contact sheets, the boot screenshots, every gate log).

Files NOT touched, per the firewall: `src/**` (no registration is read from `Enemy.ts` or `Hero.ts` — the contract is read entirely inside `SpriteAnimator.ts`, which needed no change), `assets/first-town-payload.json`, `assets/engine-era.json`, `scripts/deploy.sh`, every e2e spec, every boss system, `assets/pilots/**`, `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`.

**READY-FOR-GATES.**
