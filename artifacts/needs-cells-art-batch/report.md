# needs-cells-art-batch — the cells the sprite roster still lacked, generated on the owner's Higgsfield credits

**Task:** `tasks/needs-cells-art-batch.md` · **Branch:** `art/needs-cells-art-batch`, cut from main `133f80804` · **Implementer:** Claude Opus 5 on the Anthropic subscription, scratch worktree, 2026-09-18.
**Owner, verbatim (2026-09-18):** "yes! lets go for the cells" — offered the needs-cells list against the expiring credits. Prior word, 2026-09-15: "I care mostly about the quality of the animations and I had the impression that Astra really understood and nailed that."

## VERDICT: eleven of the twelve rows landed. 44 new cells wired, one row parked with its evidence. 70.15 of 600 credits spent.

---

## 0. The two things that did not go to plan, up front

**F-NCB-1 — the master's model is REFUSED on this account, and it is a plan wall, not a credit wall.**
`higgsfield generate create gpt_image_2 …` returns `{"error_type":"job_minimum_basic_plan_required"}` on this account (`4robinlehmann@gmail.com — free plan, 851.99 credits` at start). Measured three times, at `--resolution 2k` and at `1k`, **charging 0 credits each time**; `gpt_image_2_5` gives the same refusal at 3 credits' quoted cost; `--resolution 4k` on any model answers `"Pro" or "Ultimate" plan required`. A 0.15-credit `z_image` probe DID run, so the gate is per-model, not a dead account. The credits are real and spendable — they just cannot buy the OpenAI-family models while the plan is `free`.
**What I did instead:** `nano_banana_pro` at `--resolution 2k`, which the `higgsfield-generate` skill's own routing names as the default for *"character, cartoon, stylized, and reference-driven image work … step up to Nano Banana Pro on hard cases"*. It runs on this plan, costs **2 credits a call against GPT Image 2's 6.5**, and produced the 44 cells below. Every prompt still carries the STYLE ANCHOR verbatim and every sheet still obeys the sheet law.
**Owner's desk:** if GPT Image 2 is wanted for the next art batch, the account needs a Basic plan (and Pro/Ultimate for 4k). That is money, so it is not mine to buy.

**F-NCB-2 — the Steam Wrecker's south-east is parked, for the second time in this repo's history.**
Four takes on three different premises (both neighbouring cardinals as references; a single cardinal; and finally the family's own never-wired `char-steamwrecker-sheet-walkdiag4-a` row 1 as the reference). Every take came back with the amber porthole lamp lit in only two or three of its four cells — a mixed row, which is the one thing a four-frame loop cannot carry. `se` keeps its alias onto `e`. LEDGER row 67 parked this same row in 2026-07 after three attempts; it is the hardest row in this family, twice over, by two different pipelines. All four takes are retained under `attempts/`.

---

## 1. Per-row table

Heights are the alpha bbox height of the extracted cell, in px, at the family's own cell size. "Band" is what the family's OTHER rows measure on this tree. Every measurement below was taken on this tree, not inherited.

| row | subject / heading | takes (charged) | credits | request ids (first 8) | reference inputs | extract scale | heights | % of cell | band | mean opaque RGB | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `baron-e` | Baron, east, 8 frames @512 | 11 (7) | 14 | `08cbf2e2 2b355103 adfdc08a fb8634ae f72e09e4 c0799403 c99bfabf` | `char-baron-w-clean-v2` r0c0/r0c2/r1c0 + `char-baron-sheet-walk8-r0c0` | 0.4964 | 388/390/388/392/386/386/388/388 | 75.39–76.56 | 74.02–77.15 | 80.4/44.8/33.5 (main's east row 67.8/40.1/23.2; w-clean 76.5/43.5/29.7) | **LANDED** |
| `jumper-n` | Claim Jumper, north, 4 @256 | 2 (2) | 4 | `c7471acc 8058bcf1` | all four `char-jumper-sheet-walk4-b-r0c*` | 0.2519 | 170/164/165/160 | 62.50–66.41 | cardinals 60.94–66.41 | 114.7/57.2/34.1 | **LANDED** |
| `jumper-w` | Claim Jumper, west, 4 @256 | 2 (2) | 4 | `a815b403 70058aa2` | all four `char-jumper-sheet-walk4-b-r2c*` | 0.2722 | 172/168/164/158 | 61.72–67.19 | cardinals 60.94–66.41 | 100.8/56.5/33.2 | **LANDED** |
| `wrecker-sw` | Steam Wrecker, south-west, 4 @512 | 2 (2) | 4 | `2730e482 bf91b88a` | `char-steamwrecker-sheet-walk4-a` s row + w row (halfway) | 0.4692 | 258/242/250/224 | 43.75–50.39 | 44.53–48.83 | 102.5/70.4/49.3 | **LANDED**, lamp 176–209 px |
| `wrecker-ne` | Steam Wrecker, north-east, 4 @512 | 3 (3) | 6 | `b0dde6c7 59520475 5f780add` | `char-steamwrecker-sheet-walkdiag4-a-r3c*` (the family's own unwired diagonal) | 0.4814 | 232/226/230/250 | 44.14–48.83 | 44.53–48.83 | 102.5/66.3/44.8 | **LANDED**, lamp 0 px |
| `wrecker-nw` | Steam Wrecker, north-west, 4 @512 | 2 (2) | 4 | `8bda6944 2408976f` | `char-steamwrecker-north4-v2` + w row (halfway) | 0.3149 | 232/222/240/240 | 43.36–46.88 | 44.53–48.83 | 110.2/78.5/55.4 | **LANDED**, lamp 0 px |
| `wrecker-se` | Steam Wrecker, south-east | 4 (4) | 8 | `ae69e075 60e036af ba7af8c9 66ef1bef` | s row; s+e halfway; diag row 1 | — | — | — | — | — | **PARKED** (F-NCB-2), alias kept |
| `thief-se` | Coal Thief, south-east, 4 @512 | 2 (2) | 4 | `9b94d09f eba26f30` | `char-coalthief-sheet-walk4-a` s row + e row (halfway) | 0.4965 | 276/268/250/245 | 47.85–53.91 | 47.27–53.91 | 75.4/53.1/42.3 | **LANDED** |
| `thief-sw` | Coal Thief, south-west, 4 @512 | 3 (3) | 6 | `255881c4 52acbc2c 262cdb7d` | `char-coalthief-sheet-walk4-a` w row (4 cells) | 0.3544 | 258/252/264/268 | 49.22–52.34 | 47.27–53.91 | 87.7/63.6/50.6 | **LANDED** |
| `thief-ne` | Coal Thief, north-east, 4 @512 | 3 (3) | 6 | `ceaeef0b 02e99406 3d2b3194` | `char-coalthief-north4-v2` (4 cells) | 0.4863 | 264/256/258/254 | 49.61–51.56 | 47.27–53.91 | 85.8/60.5/43.6 | **LANDED**, under-turned (§4) |
| `thief-nw` | Coal Thief, north-west, 4 @512 | 2 (2) | 4 | `2a8ed2af 78753d0a` | `char-coalthief-north4-v2` + w row (halfway) | 0.4284 | 260/254/258/262 | 49.61–51.17 | 47.27–53.91 | 87.5/64.4/50.1 | **LANDED** |
| `school-e` | schoolteacher, east row 2, 4 @512 | 2 (2) | 4 | `13380828 963a7cd5` | all four `char-schoolteacher-sheet-walk8-a-r2c*` | 0.4573 | 308/308/308/308 | 60.16 | r0 60.94–61.33, r1 60.16–60.55, r3 58.79–59.57 | 108.8/70.4/37.9 | **LANDED** |

`baron-e`'s eleven takes are honest and are the reason every other row needed only two or three: takes 1–6 were **recipe calibration**, each with a changed premise, and four of them cost nothing (three `gpt_image_2` refusals + one `4k` refusal). Take 7 is what landed, and its recipe is what the other eleven rows used from their first call:

- describe the sheet as one flat magenta **field**, never as a "grid of cells" — the word *grid* made the model draw an actual grid, with white panels and magenta rules (take 3);
- draw references from exactly **ONE** existing camera angle — mixed angles make it produce a turnaround instead of a walk cycle (takes 4–5, and the first take of `jumper-n`, `jumper-w` and all eight diagonals);
- name the asymmetric prop **explicitly**: the Baron's hat card rides his body-RIGHT and must be INVISIBLE from an east camera. Takes 4–5 put it on, which is the mirror signature the sheet law forbids — and main's own east row agrees with me, it has no card;
- spell the four/eight walk phases out as distinct moments (contact / down / passing / up) — the generic wording gave four near-identical poses (`school-e` take 1).

### Prompts
Every prompt is `[sheet] [render] [subject] [facing] [anchoring] [phases] [ANCHOR] [sheet law]`, built by `rows.mjs:buildPrompt()`, committed beside this report; the exact string for any row is
`node -e "import('./rows.mjs').then(m=>console.log(m.buildPrompt(m.ROWS.find(r=>r.id==='<row>'))))"`.
The STYLE ANCHOR from `specs/epoch-saga/e2-steamworks-bundle.md:6-8` appears **verbatim** in all 38 calls. Sheet-law clauses carried in every prompt: one flat pure magenta #ff00ff field edge to edge; exactly N figures in a 2×2 or 4×2 arrangement; every figure drawn independently, never a mirrored, flipped or copied version of another; identical size and costume; generous magenta margin, nothing cropped by the frame; no text, letters, numerals, signature or watermark; no firearms; no gore.

## 2. Gate table — every gate with its exact result

| gate | result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0** |
| `GR_RELEASE=e1 npm run build` | **rc=0** |
| `node scripts/first-town-payload.mjs` | **34,641,290 B of 52,000,000** (base `133f80804`: 34,509,068 B — **+132,222 B**). Verified the new cells really ship: `dist/assets` holds all 8 `char-baron-east8-v1-*-diet-*.png`, and the eight `char-jumper-sheet-walk4-b-r{0,2}c*` cells this batch de-referenced have LEFT the bundle |
| `node scripts/halo-reextraction-check.mjs` | **PASS — 379 cured / 0 held / 696 regenerated-and-cured / 2103 scanned**; alpha and opaque RGB unchanged. Re-pinned from 395/0/680/2059 with a dated cause (§5) |
| `node --test scripts/character-direction-assets.test.mjs` | **2 pass / 0 fail** |
| `node --test scripts/hero-clip-groups.test.mjs` | **7 pass / 0 fail** |
| e2e, both projects, `--workers=1`: `eight-winds-enemies`, `town-cast-wiring`, `elder-walk8-woman`, `e2-enemies`, `e1-baron`, `e2-hill-mine`, `cast-motion-wiring` | **47 passed, 14 failed, 3 skipped (7.8 m)** — all 14 attributed to main, §3 |
| `scripts/review-enemy-sprites.mjs` | **rc=0** (15 cases × 2 widths, 37/37 textures, 0 errors) |
| `scripts/review-sprite-idle.mjs` | **rc=0** |
| `scripts/review-town-walk.mjs` | **rc=1 — PRE-EXISTING harness rot, not this branch.** `ReferenceError: isPlazaPatrolActor is not defined` inside the TownScene source slice the probe evals. `git diff --stat 133f80804..HEAD -- src/` is **EMPTY** — this branch does not touch a line of `src/`, so it cannot have caused a ReferenceError in `src/town/TownScene.ts`'s own code. F-NCB-5 |
| plain boot, zero console/page/request errors, desktop 1280 + mobile 390 | **town 0/0, `?contract=e1-baron` 0/0, `?contract=e2-hill-mine` 0/0** at both widths (`boot-probe.mjs`, shots in `boot/`) |
| eight-heading resolution probe, live `EnemyPool` | **0 console/page errors**, table in §4 (`direction-probe.mjs` / `direction-probe.json`) |
| `npm run build` / `GR_RELEASE=e1` / payload, RE-RUN on the committed tree | **rc=0 / rc=0 / 34,641,290 B** — the same numbers the working tree gave |
| `computeEngineHash()` | base `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068` → **branch `967e83970e4c5088cf7dac8f6d5c85066115aaf1d3ebb08d1cb567109feac727`** (`assets/layer-contracts` is in `ENGINE_SOURCE_INPUTS`, so the contract edits move it; the drain pins) |

## 3. Attribution of the 14 e2e failures — all pre-existing on main

Two independent controls, both run on this box against the same dev server:

1. **Contract control** for `eight-winds-enemies.spec.ts:39` ("diagnostics drive thief northeast and Baron southwest on their correct rows"), the only red that touches a family I changed: I removed `char.baron.walk8.directions.e` from the working tree — i.e. put the Baron's east back on the grid row — and re-ran it. **It fails identically.** It is also row 196 of `logs/suite-red-inventory.md` (desktop-chrome, 60 s timeout).
2. **Base-tree control**: detached the worktree to `133f80804` and re-ran `e2-hill-mine`, `e1-baron` and `e2-enemies` in both projects. **12 of 12 reproduce**, including the three `e2-hill-mine` titles that are NOT yet in the red inventory.

| failing test | project(s) | control |
|---|---|---|
| `eight-winds-enemies:39` | desktop + mobile | contract control reproduces; inventory row 196 (desktop) |
| `e1-baron:411` Baron manifest / taunts | desktop + mobile | base control reproduces; inventory row 130 (mobile) |
| `e2-enemies:113` wave pulses spawn the E2 roster | desktop + mobile | base control reproduces; inventory rows 152–153 (BOTH) |
| `e2-enemies:314` seed determinism | desktop | base control reproduces; inventory rows 150–151 (BOTH) |
| `e2-hill-mine:75 / :184 / :250` | desktop + mobile | base control reproduces; **not in the inventory** — F-NCB-6 |
| `e2-hill-mine:318` seeded route determinism | mobile | base control reproduces; inventory row 157 (mobile) |

**F-NCB-6 (pre-existing on main, fire-authorable):** `e2-hill-mine.spec.ts:75` ("loads the locked Steamworks poster contract and ships the Hill Mine elevation table"), `:184` ("T2 high ground out-ranges the rail cut…") and `:250` ("bandits route switchbacks…") are red on clean `133f80804` in both projects and have no row in `logs/suite-red-inventory.md`. Not sprite-related; they want attributing to whichever land moved the Hill Mine elevation table.

## 4. What each heading resolves to now — the live proof

Driven through the real `EnemyPool` and each family's own `SpriteAnimator`, reading back `animator.currentFrame.key` for all eight headings (`direction-probe.mjs`, 0 console/page errors):

| slot | s | se | e | ne | n | nw | w | sw | distinct plates |
|---|---|---|---|---|---|---|---|---|---|
| `char.baron` | walk8 r0 | walkdiag8 r1 | **`char-baron-east8-v1`** | ne-clean-v2 | walk8 r3 | walkdiag8 r2 | w-clean-v2 | walkdiag8 r0 | 5/8 (before: `e` shared the walk8 grid with s and n) |
| `char.e2.steam_wrecker` | walk4-a r0 | walk4-a r2 *(alias, parked)* | walk4-a r2 | **`ne4-v1`** | north4-v2 | **`nw4-v1`** | walk4-a r1 | **`sw4-v1`** | 5/8 (before 3/8 — all four diagonals aliased onto the side rows) |
| `char.e2.coal_thief` | walk4-a r0 | **`se4-v1`** | walk4-a r2 | **`ne4-v1`** | north4-v2 | **`nw4-v1`** | walk4-a r1 | **`sw4-v1`** | 6/8 (before 3/8 — **all four diagonals are real now**) |

Boards, before and after, one per family, in `after/`: `baron-before-after.png` (w-clean sibling · BEFORE east · AFTER east · ne-clean sibling — the after row sits at its siblings' scale and the drop in darkness is visible), `jumper-before-after.png`, `steamwrecker-before-after.png`, `coalthief-before-after.png`, `schoolteacher-before-after.png`. The state before the batch is in `before/`, including the two never-wired diagonal plates I examined as candidates.

**The Steam Wrecker's facing signal, measured.** LEDGER row 65 chose the amber porthole lamp as this subject's readable signal ("present in both south winds and absent in both north"). A first instrument that simply counted amber-ish pixels **FAILED and would have lied**: the rear plate scored 534–624 against the front plate's 279–332, because lit brass is amber too. The instrument that works measures the **largest connected saturated-orange blob** per cell (`eye-check.mjs`):

| plate | per-cell lamp blob (px) | reads as |
|---|---|---|
| cardinal `s` (control, lamp present) | 162 / 96 / 95 / 101 | south |
| cardinal `n` (control, lamp absent) | 7 / 4 / 6 / 4 | north |
| **new `sw4-v1`** | 209 / 207 / 178 / 176 | south ✓ |
| **new `nw4-v1`** | 0 / 0 / 0 / 0 | north ✓ |
| **new `ne4-v1`** | 0 / 0 / 0 / 0 | north ✓ |
| parked `se` takes | mixed within the row, every take | rejected |

**The Coal Thief's prop rule, re-measured before a single prompt was written.** This repo has been bitten here before (F-EW-5, LEDGER row 65: *"one wrong letter in my own prop data inverted four verdicts"*), so the sack side was read at 400 px from the live cardinals rather than from the contract note. The contract's own older note says "stable left-shoulder sack"; the cardinals say otherwise and they agree with each other — front view puts the sack screen-LEFT, back view screen-RIGHT, west profile screen-RIGHT, east profile screen-LEFT. All four resolve to **the sack riding his body-RIGHT shoulder and always trailing his direction of travel**. The new diagonals were prompted and accepted on that rule, and the correction is written into the contract note in the same commit.

**F-NCB-4 (honest residual): `thief-ne` is under-turned.** It reads closer to a straight north than to a full 45°, and its sack sits where `n` puts it. It landed anyway because the alternative is the alias it replaces, which showed the man's FACE while he walked away from the camera. Three takes; the third is the best of them.

**F-NCB-3 (dormant, not this batch's to fix): `char.claim_jumper` has no live body.** The jumper's north and west cells are registered, ship in the E1 bundle and measure in band — but nothing resolves that slot at runtime today. Measured: a plain `?debug&nolevel` boot lists `char.hero, char.bandit_base, char.bandit_thief, char.e2.rail_tough, char.e2.steam_wrecker, char.e2.coal_thief, char.prospector_agent` in `__THREE_GAME_DIAGNOSTICS__.spriteAnimations` and **not** `char.claim_jumper`; `src/entities/pools.ts:1138` resolves a body's slot to `char.baron` / `char.bandit_thief` / `char.bandit_base` or a variant's own `slotId`, and no variant carries `char.claim_jumper` — the slot is only a `tagPlaceholder`. This is exactly what the slot's own `rotations` note has said since s37 ("RUNTIME-DORMANT until enemy code sends 8-way directions (M2-04)"). The cure is wiring, not art. Also recorded: the jumper's sheet-b **diagonals** nw and sw stay at 139–150 px while all four cardinals now sit at 156–172; they are outside this task's firewall and were not touched.

## 5. What was touched, and the halo guard

`assets/processed/**` — 44 new cells across ten new stems, plus the schoolteacher's four row-2 cells **replaced in place** and her `.frames.json` bboxes re-measured (`TownScene.ts:3428` anchors her billboard's foot on `bbox[3]-bbox[1]+1`, so a stale bbox would float or sink her; 337→308 px, and rows 0/1/3 verified **byte-identical to base, 12 of 12**). `assets/raw/char-{baron,jumper,steamwrecker,coalthief,schoolteacher}-needs-cells-2026-09-18-<dir>.png` — eleven swept plates, 41,401,833 B; one per accepted generation rather than one per family, because one family here holds up to four separate generations and merging them would fake a single sheet that was never generated. `assets/layer-contracts/characters.v2.json` — the registrations and four dated notes. `scripts/halo-reextraction-check.mjs` — declarations and re-pins. `assets/LEDGER.md` — one batch row. `artifacts/needs-cells-art-batch/**` — this report, the boards, the probes, every attempt and the credit ledger.

**Untouched, verified:** `git diff --stat 133f80804..HEAD -- src/` is **empty** — `src/assets/{slots,generated}.ts`, `src/assets/character-runtime-frames.json` and `src/town/town-actor-sheets.json` needed no edit at all, because `src/assets/generated.ts:55` globs `assets/processed/char-*.png` and the schoolteacher's row landed in her sheet's own filenames. Also untouched: the sim, `Balance.ts`, `assets/first-town-payload.json`, `assets/engine-era.json`, `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, and every existing cell of every other row.

**Halo guard, re-pinned by measurement.** Ten new stems declared in `REGENERATED_SHEETS` with their cause; they do not exist at BASE, so the three partition pins do not move for them — only the denominator, **2059 → 2103**, `find assets/processed -name '*.png' | wc -l` on this tree, and all 44 are this batch's. The eleventh declaration, `char-schoolteacher-sheet-walk8-a`, is an EXISTING stem and moves 16 cells out of `cured` (**395 → 379**) into `regenerated` (**680 → 696**): stage 2 of ruling A19 deliberately left that stem out so its cells would keep satisfying the byte-for-byte invariant, and this batch replaces four of them, so it has to move. The declaration is stem-wide; the change is not, and the comment says so with the 12/12 byte-identity measurement beside it. `expectedResidual` stays **0** — the guard still asserts the sweep finds zero halo suspects anywhere in `assets/processed`, with the 44 new cells inside it.

## 6. Credits — the owner's money, reconciled to the account

**Cap 600. Spent 70.15. Account 851.99 → 781.84, measured either side of every call.**

| line | credits |
|---|---|
| 34 charged generations, all `nano_banana_pro` at 2k, 2 credits each (`ledger.jsonl`) | 68.00 |
| one `z_image` probe, to prove the plan wall was per-model and not a dead account | 0.15 |
| **one generation charged but never logged** — below | 2.00 |
| four refused calls (3 × `gpt_image_2`, 1 × `4k`) and one refused `gpt_image_2_5` probe | 0.00 |
| **total** | **70.15** |

**F-NCB-7 — 2.00 credits bought a picture nobody will ever see, and the cause is worth writing down.** While the first full batch was running I killed it (`pkill`) to fix the reference design before it burned credits on eleven rows with the wrong premise. A job had already been submitted; it charged, and the runner died before it could write its ledger row. The ledger's own balance-continuity check found the hole (`balanceBefore` of `jumper-n` attempt 2 is 829.84 where the previous row's `balanceAfter` is 831.84). This is the same class as the skill's *"a request failed (no response received) has ALREADY charged"* rule, arriving from the other direction: **do not kill a batch mid-call; let the in-flight request land and stop the loop after it.** The harness records `balanceBefore`/`balanceAfter` on every row precisely so a gap like this cannot hide.

**F-NCB-8 — the guard's declarations were committed once, lost, and re-committed; the lesson is the restore, not the edit.** The e2e run churns 32 tracked screenshots under `artifacts/**`, and the task's own rule is to restore them with `git checkout --` before every commit. `scripts/halo-reextraction-check.mjs` had been edited BEFORE that sweep, so it was sitting in the same ` M` list and the restore reverted it — and the bookkeeping commit that named the declarations carried none of them. Caught by re-running the gate on the COMMITTED tree instead of trusting the working-tree green, and re-applied in `6c74f3f2e`, which was verified green after the commit, not before it. A churn restore must be filtered to the churn, not to everything modified.

## 7. Files in this directory

`rows.mjs` (the twelve rows, the prompt builder, the STYLE ANCHOR, the sheet law) · `batch.mjs` (one paid request per row per attempt, balance measured either side, 600-credit cap enforced) · `clean-plate.mjs` (detached-speck sweep; the schoolteacher's ground mark is 3,916 px of it) · `extract.mjs` (two-pass extraction: the extractor's own 86 % fit, then re-extract at the scale that lands the row mean on the family's band — the extractor never upscales, so the scale only ever comes down) · `lossless.mjs` (zopflipng, **never** `--lossy_transparent`: the RGB under transparent pixels is extract-alpha's bleed, i.e. the halo cure; every file verified pixel-identical on all four channels before it replaces the original — 9,676,796 → 4,879,950 B over the batch, 4,796,846 B recovered for zero changed pixels) · `land.mjs` · `school-row2.mjs` · `measure.mjs` · `board.mjs` · `eye-check.mjs` · `direction-probe.mjs` · `boot-probe.mjs` · `jumper-liveness.mjs` · `ledger.jsonl` (38 rows) · `landed.jsonl` · `attempts-contact/` (one board per row, every take of it side by side — all 34 charged takes, the eight rejected ones included; the full-size 2048² plates stay DISK-LOCAL at `artifacts/needs-cells-art-batch/attempts/`, 122 MB, under the retention law's 2026-08-26 amendment for bulky factory artifacts) · `refs/` (the reference sheets fed to the model) · `before/`, `after/`, `boot/`, `probes/`.
