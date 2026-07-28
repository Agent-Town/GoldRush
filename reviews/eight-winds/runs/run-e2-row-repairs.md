# Art run — THE FOUR CROOKED WINDS: E2 diagonal row repairs

**Date:** 2026-07-29 · **Arm:** native Codex `image_gen` only · **Task:** `art-e2-eight-winds-row-repairs` · **Result:** **PARTIAL PASS — 2 rows landed, 2 rows parked after three changed-premise attempts; READY-FOR-GATES**

## Why this batch was lawful

`tasks/BACKLOG.md:40` is the shipped **measurement-only** Rail Tough row-settle. Its accepted review, `reviews/eight-winds-rail-tough-row-settle.md`, records 39 files / 1110 insertions and zero paths under `assets/`; it did not ship repair pixels. The task was queued separately at `tasks/BACKLOG.md:41`. The pre-flight found `git status --porcelain -- assets/raw/` empty, and the three diagonal sheets matched the LEDGER row 65 originals:

| sheet | pre-flight SHA-256 | dimensions |
|---|---|---:|
| `char-coalthief-sheet-walkdiag4-a.png` | `c6ffee23de715a69756d754e314ca9777a9b7b8e3ddfdd94e5627a9a6ab1b034` | 1252×1252 |
| `char-steamwrecker-sheet-walkdiag4-a.png` | `1ea4dca5944d0df8f5c50477b240087bbb43814ce1444e79a363149d7fc7d224` | 1252×1252 |
| `char-railtough-sheet-walkdiag4-a.png` | `f531b2424d75c0fa03d67ef2404aae4842e791caf17f9b5fcb213c60983153af` | 1252×1252 |

The cardinal controls are 1254×1254. The diagonal siblings remain 1252×1252 because their 313 px cells discard the cardinal sheets' dead 2 px remainder; no cut moved.

## The data fix came first

The shipped cardinal Steam Wrecker sheet independently confirms `side: "L"`:

- cardinal `s`, the front row: the single cyan panel is screen-right → body-left;
- cardinal `n`, the back row: the single cyan panel is screen-left → body-left.

Both hemispheres agree, satisfying F-EW-5. Only `cast["steam-wrecker"].props` changed:

```diff
-      "props": [],
+      "props": [
+        {
+          "what": "the single teal-lit gauge panel on the flank — there is exactly ONE, never two",
+          "side": "L"
+        }
+      ],
```

`git diff --numstat reviews/eight-winds/cast.json` is `6 1`; no other cast entry changed.

All four prompt files were rebuilt by `scripts/anim-pass-prompt.mjs`, never hand-written:

| prompt | rebuilt diff |
|---|---|
| `coal-thief-sw.txt` | byte-unchanged |
| `steam-wrecker-se.txt` | one generated prop bullet added: body-left → screen-right, far side, exactly one |
| `steam-wrecker-nw.txt` | one generated prop bullet added: body-left → screen-left, near side, exactly one |
| `rail-tough-se.txt` | byte-unchanged |

## Generation attempts and verdicts

Every attempt used native `image_gen` and the character's shipped cardinal base sheet. Third attempts changed the premise again by adding the cardinal front-row crop as a second control.

| row | take | changed premise | measured / visual result | verdict |
|---|---:|---|---|---|
| Coal Thief `sw` | 1 | base prompt | sack screen-right; required screen-left behind head/torso | reject |
| Coal Thief `sw` | 2 | builder `--retake-mirrored` | sack still screen-right | reject |
| Coal Thief `sw` | 3 | retake prompt + cardinal front-row control | sack still screen-right | **parked** |
| Steam Wrecker `se` | 1 | base prompt | clusters `1,1,1,1`, all screen-left; required screen-right | reject |
| Steam Wrecker `se` | 2 | builder `--retake-mirrored` | clusters `2,2,2,2` | reject |
| Steam Wrecker `se` | 3 | retake prompt + cardinal front-row control | clusters `1,1,1,1`, all screen-left; required screen-right | **parked** |
| Steam Wrecker `nw` | 1 | base prompt | clusters `1,1,1,1`, all screen-left; back view | **accepted** |
| Rail Tough `se` | 1 | base prompt | wrench in the same screen-left hand in all four frames; stable front row | **accepted** |

All eight native candidates are retained under `reviews/eight-winds/crops/e2-repair-*.png`; rejected filenames state the reason. No failed take was silently replaced.

The two parked source rows were not grafted. Their shipped defects therefore remain explicit:

- Coal Thief row 0 remains the old duplicate `se` instead of `sw`.
- Steam Wrecker row 1 remains `2,2,2,2` cyan clusters.

## Dry graft metrology

All four named rows were dry-run with the task's same-hemisphere `--match-row`; rejected candidates were measured but not applied.

| sheet / row | match row | ref height / foot / centre | source median | scale | projected heights | action |
|---|---:|---|---:|---:|---|---|
| Coal Thief row 0 `sw` | 1 | 255 / 266 / 150.5 | 481 | 0.5301 | 261, 246, 253, 255 | parked |
| Steam Wrecker row 1 `se` | 0 | 244 / 281 / 169 | 477 | 0.5115 | 244, 245, 238, 239 | parked |
| Steam Wrecker row 2 `nw` | 3 | 243 / 281 / 169 | 468 | 0.5192 | 247, 243, 231, 234 | grafted |
| Rail Tough row 1 `se` | 0 | 277 / 282 / 144 | 547 | 0.5064 | 279, 276, 274, 277 | grafted |

The graft arm reported 51 out-of-band source scanlines dropped for Steam Wrecker and 3 for Rail Tough. Post-graft component ownership still reports **0 components crossing a cell cut** on both sheets, so no neighbouring cell was polluted.

## Untouched-row proof

Raw RGBA row bytes were compared against `git show HEAD:<sheet>` at 313 px row cuts. All eight evidence-backed preserve rows are byte-identical. Because both parked repair rows also stayed untouched, **10/12 rows are identical overall**.

| sheet | row 0 | row 1 | row 2 | row 3 |
|---|---|---|---|---|
| Coal Thief | identical, parked (`9646062e836cc143…`) | **identical preserve** (`392205e176242119…`) | **identical preserve** (`c481dcfc3d1a7002…`) | **identical preserve** (`42f26c91dd77c7de…`) |
| Steam Wrecker | **identical preserve** (`543c7c96912f3f25…`) | identical, parked (`f3c13149f18a6cd9…`) | changed as intended (`4c476bc01e52f124…`) | **identical preserve** (`f0a304958756b76d…`) |
| Rail Tough | **identical preserve** (`426c8865e03733ae…`) | changed as intended (`57f1af12ccb668e6…`) | **identical preserve** (`7b1f2dfb1d1cf617…`) | **identical preserve** (`0be7853d8eedc968…`) |

Required preserve result: **8/8 identical**. Overall result: **10/12 identical**.

## Measured self-QA

Extraction used each base sheet's pinned scale `1` into `.scratch-ew/proc`; no processed assets were shipped.

| sibling sheet | base | dims / grid decl·art | cells @scale | base height band | composed heights | drift | components / crossing a cut | key bg% / halo% | dup flagged→real |
|---|---|---|---|---|---|---|---|---|---|
| `char-railtough-sheet-walkdiag4-a` | `char-railtough-sheet-walk4-a` | 1252x1252 / 4x4·4x4 | 16/16 @1 | 271-292 (med 276) | 248-288 (med 278) | **+0.7%** | 27 / **0** | 73.00 / 0.719 | 0→0 |
| `char-steamwrecker-sheet-walkdiag4-a` | `char-steamwrecker-sheet-walk4-a` | 1252x1252 / 4x4·4x4 | 16/16 @1 | 237-249 (med 242) | 227-252 (med 243) | **+0.4%** | 33 / **0** | 72.40 / 0.659 | 0→0 |
| `char-coalthief-sheet-walkdiag4-a` | `char-coalthief-sheet-walk4-a` | 1252x1252 / 4x4·4x4 | 16/16 @1 | 244-274 (med 258) | 216-265 (med 256) | **-0.8%** | 25 / **0** | 74.34 / 0.364 | 0→0 |

Steam Wrecker cyan probe on the composed sheet:

| row | per-frame clusters | cyan side | verdict |
|---|---|---|---|
| row 1 `se` | **2, 2, 2, 2** | split across both sides | parked; original defect retained |
| row 2 `nw` | **1, 1, 1, 1** | 100% screen-left (`116/0`, `112/0`, `117/0`, `99/0` left/right cyan px) | pass |

Rail Tough row 1 keeps the wrench screen-left in the same hand for all four frames, matching row 0. The row has four distinct step poses and reads as a front three-quarter `se`.

## Final files, caps, and gates

| sheet | final SHA-256 | bytes | 600 KB cap |
|---|---|---:|---|
| Coal Thief | `c6ffee23de715a69756d754e314ca9777a9b7b8e3ddfdd94e5627a9a6ab1b034` | 1,204,463 | over; unchanged and not optimized |
| Steam Wrecker | `465d92984c5dc498d756311e81a036941fd6f155420b3aebc71dacc1bcf0782b` | 1,368,285 | over; reported, not optimized |
| Rail Tough | `6215cf2415ca2493aa761654a20d182912ea5c84285e0b774ec086a564307991` | 1,229,531 | over; reported, not optimized |

- `npx tsc --noEmit`: rc 0
- `npm run build`: rc 0, built in 1.55 s; asset-diet green
- no sheet was downscaled, optimized, or dimension-normalized
- no `src/`, `e2e/`, contract, manifest, balance, spec, or cardinal-sheet byte changed

**READY-FOR-GATES:** accept the two landed rows and the complete evidence package; requeue Coal Thief `sw` and Steam Wrecker `se` only when the generation premise changes again. Do not retry either row identically.
