CODEX: model=gpt-5.6-sol effort=xhigh

# lane-f1464-1-halo-reextraction — re-extract the 1,075 haloed sprites against the cured extractor (cures F-1464-1)

**FIRE-AUTHORED s1469 (attended review welcome).** This is the batch F-1464-2 was measured to unblock. The recipe is already ruled; **you are not choosing a recipe, you are executing one and proving it landed.** Read `reviews/f1467-alpha-recipe-ab.md` before you start — it is the ruling, and its §"Recommendation for F-1464-1" is your specification.

ROLE: implementer on lane-b. WORKDIR: `worktrees/lane-b` (branch `lane/b`). Commit prefix `halo:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 (2026-08-05) exists because a master offered the refresh as a conditional and put a currency probe beside it; the runner ran the probe first against a stale lane and truthfully reported "stale lane" about a lane that was one command from correct — 27,551 tokens, zero edits. The probe below CANNOT distinguish "the lane is stale" from "I asked too early". So the refresh is not a conditional. Do step 1, then step 2.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-b fetch origin main
git -C worktrees/lane-b checkout -B lane/b origin/main
```

**STEP 2 — CURRENCY PROBE (only after step 1):**
```
grep -c "1,073 of 1,075 halo suspects are grid cells" tasks/BACKLOG.md
```
Expect **1**. If **0**, step 1 did not take — STOP and report "refresh did not land", do NOT report a stale lane.
*(This key was measured to return exactly 1 on main at authoring time, per F-1425-2. It is deliberately apostrophe-free and sits on a single line: `grep` is line-oriented and prose wraps, so a key spanning a line break matches nowhere — including in the file it was copied from.)*

**STEP 3 — SAFE-DUPE:**
```
node artifacts/f1450-4/halo-class-sweep.mjs
```
Expect the summary to report **1075 suspects of 1314 scanned**. If it reports **0 suspects**, the batch has already run — STOP and report; do not re-extract. If the script is missing, step 1 did not take.
⚠️ This writes `artifacts/f1450-4/halo-class-sweep.json`, which is **tracked**. That is expected and is your baseline; it re-runs byte-identical (verified s1469), so a clean `git status` after this probe is the correct outcome.

**STEP 4 — LANE SAFETY:** `git branch --show-current` = `lane/b`. Any dirty *tracked* blob not reachable in git → STOP.
⚠️ **FACTORY-CHURN EXCEPTION (F-1407-1 / F-1266-1):** modifications under `logs/**` and `artifacts/**` are the factory's own background churn and are **NOT** lane dirt. Ignore them in step 4; they must never STOP this run.

## WHY

`tasks/BACKLOG.md` F-1464-1, verbatim (the row is 🔺 and open):

> **F-1464-1 — THE F-1449-1 HALO IS NOT CURED ACROSS THE SHIPPED ROSTER: 1075 OF 1314 PROCESSED SPRITES STILL CARRY IT, AND THE LEDGER RECORDS THE CLASS AS CLOSED.** … `artifacts/f1450-4/halo-class-sweep.mjs` reads every PNG under `assets/processed/` and finds **1075 of 1314** carrying **>5%** key-magenta under transparency. ⚠️ **The runtime loads that tree DIRECTLY — there is no `public/`** … **THE MECHANISM, WHICH IS THE REUSABLE HALF: `d2e69801` fixed the EXTRACTOR, so it cures FUTURE extractions only — every sprite already on disk was never re-extracted, and nothing re-ran them.** … **GATE: closes when the loaded roster is re-extracted against the cured extractor, or an attended eye rules the residual halo acceptable per sprite class.**

This is a **live visual defect on the shipped roster**, including the Baron portrait drawn in the HUD (55.63% key-magenta) and `ui-title-emblem.png` (99.17%). It was gated on F-1464-2, which **closed by measurement** at `c42d653a`. You are the first disjunct of that gate: re-extract, do not ask an owner.

## READ-FIRST

1. `reviews/f1467-alpha-recipe-ab.md` §"Recommendation for F-1464-1" — **your specification, verbatim.** The invariant is **key-before-final-resample**. Grid sheets keep `--grid`: key the native sheet, let `sliceGrid` resample. **"Do not insert a standalone 1024 resize into grid mode; that would move cell cuts and normalization."** Also: **do not split the recipe by `alphaTest` tier.**
2. `tasks/BACKLOG.md` — the F-1464-1 row and the **F-1464-1 RECIPE ANNOTATION** directly below it.
3. `scripts/anim-pass-reextract.mjs` — **your tool for 1,073 of the 1,075.** Read its whole docstring: it explains why running `extract-alpha.mjs` alone or global `optimize-assets.mjs` is unsafe. `convention()` `:92` recovers each sheet's own `grid`/`declCell`/`scale`/`displayCell`/master-presence from its `frames.json`; `:163` invokes the extractor with **exactly the preserved `--grid` recipe the ruling demands**; `:170-175` refreshes the master then downscales, or writes direct where the sheet ships full cells.
4. `scripts/extract-alpha.mjs:425-438` (grid) vs `:439-453` (standalone) — **read both branches.** Grid keys at `:429` and resamples at `:434`: the ruling is **already implemented**, which is why this slice changes no extractor code.
5. `artifacts/f1450-4/halo-class-sweep.mjs` — the acceptance instrument. Predicate at `:52-56`: a sprite is a suspect when a key colour occupies **>5%** of its transparent field.
6. `artifacts/f1450-4/halo-loaded-check.mjs` — the negative-control instrument. Its four `CURED_CONTROLS` must stay at **0.00%**; if a control moves, your run is wrong and the sweep means nothing.
7. `assets/master-divergent.json` — **26 hand-mended cells. Read this before you run anything.** See the FORK below.

## FIVE THINGS I MEASURED SO YOU DO NOT HAVE TO RE-DERIVE THEM

Verified s1469 by running the code on main. **Verify them yourself before relying on them** — but this is where the slice's real risk is, and you should not spend budget rediscovering it.

1. ✅ **THE PREMISE HOLDS, END-TO-END — I RAN IT.** Nobody had ever pushed a *haloed* sheet back through the cured extractor; the finding's four negative controls were sprites extracted *after* the cure, which is a weaker claim. I re-extracted `char-baron-sheet-walk4-a` (4x4, cell 512, scale 1) into a scratch dir and applied the sweep predicate to three arms: **shipped 256px = 16/16 cells haloed (55.63–59.85%) · fresh 512px = 0/16 · fresh downscaled to 256 the way `anim-pass-reextract.mjs:172` does = 0/16.** Arm three is the one that ships. Probe retained at `logs/session-scratch/s1469-prove-reextraction-cures-halo.mjs`.
2. ✅ **THE SILHOUETTE DOES NOT MOVE, AND NEITHER DOES THE INTERIOR.** Same subject, shipped-vs-re-extracted at 256px: **alpha differs on 0 pixels of 1,048,576 (max delta 0)**, and of the 10,741 visible pixels whose RGB changes, **0 are fully opaque** (`a=255`). Every changed pixel is in the antialiased edge band: 60.85% at `a>=90`, 37.12% at `a 11-89`, 2.03% at `a 1-10`. **So a correct diff changes edge colour only.** This is the invariant your acceptance test asserts (scope item 4) — it is what makes 1,075 files checkable instead of eyeballable.
3. ⚠️ **THE KEY IS NOT UNIFORM, AND THE ODD ONE OUT IS A STANDALONE.** Of the 1,075 suspects, **1,074 are `ff00ff` and exactly one is `8a8a8a`** — `townsfolk-youngster-b.png`, whose raw I border-sampled as modal `8a8a8aff`. **All 1,073 grid cells are `ff00ff`**, so `anim-pass-reextract.mjs`'s hardcoded `--key ff00ff` (`:54`) is **safe for the whole grid batch** — but it would silently mis-key the grey standalone. I also checked the two non-character sheets that look risky (`icons-e2`, `ter-rail-elements`): both border-sample `ff00ffff`. **Fine.**
4. 📐 **THE BATCH IS FULLY EXECUTABLE — I CHECKED EVERY INPUT.** The 1,073 grid cells resolve to **58 distinct source sheets**. **0 are missing a raw** in `assets/raw/`, and **0 are missing a `frames.json`** in `assets/processed/`. Nothing needs regenerating.
5. 📏 **STANDALONE SHAPES, MEASURED** (there are exactly two): `ui-title-emblem` — raw 1254², `processed-full` 512², shipped 256², key `ff00ff`. `townsfolk-youngster-b` — raw 768², `processed-full` 768², shipped 384², key **`8a8a8a`**. Note its raw and master are the same size, so keying it at native 768 involves **no pre-resize at all** — strictly better than the two-step, and still key-before-final-resample.

## ⚠️ THE FORK YOU MUST SETTLE BEFORE TOUCHING TWO OF THE 58 SHEETS

`assets/master-divergent.json` records **26 cells** — 17 on `char-baron-sheet-walk8`, 9 on `char-hero-sheet-walk8` — each with `"reason": "Cutout-pocket alpha mend was applied to the 256px shipped cell after master extraction."` They are the shipped output of `tasks/fix-walk-cutout-pockets.md`.

**I measured that all 26 are inside the suspect set**, and `anim-pass-reextract.mjs:172` overwrites `assets/processed/` cells unconditionally. **So a naive batch run silently reverts every one of those mends while reporting green.** That is the "cure applied to a generator never reaches its past output" class inverted — a cure applied to the *output* being erased by re-running the generator.

Settle it by **measurement, in this order**:

1. Re-extract those two sheets **into a scratch dir only** (not `assets/`). Ask whether the current extractor cures the cutout pockets **natively** — the mend's own criterion, which `tasks/fix-walk-cutout-pockets.md` states. The extractor has gained `interiorKeyClear` / `--pocket-mean` since the mend was authored, so this is a real possibility, not a hope.
2. **If cured natively:** proceed, and **retire those 26 entries from `assets/master-divergent.json` with the measurement as the stated reason** (retire, do not silently drop — the file is a ledger). Say so loudly in your report.
3. **If NOT cured natively:** do **not** overwrite them. Re-extract the other 56 sheets, **hold these two back**, and file the residue as a finding with the measured pocket evidence. I priced this fallback for you: those two sheets carry **64 of the 1,073** suspect cells, so holding them back still cures **1,009 grid cells + 2 standalones = 1,011 of 1,075**. A partial batch with a named, measured residue is a good outcome; a green run that reverted a shipped fix is not.

**Do not resolve this fork by reasoning. Run the extraction and look at the pockets.**

## SCOPE

1. **Re-extract the 58 grid sheets** via `scripts/anim-pass-reextract.mjs`, one sheet at a time, each reproducing its own recorded convention. Derive the sheet list from the sweep's own output (`artifacts/f1450-4/halo-class-sweep.json`), not from a hand-typed roster — the instrument owns the denominator.
   ⓘ `anim-pass-reextract.mjs:151-155` warns that `frames.json` rounds `scale` to 4dp and that re-extracting at the rounded value resamples every cell a hair differently. **Here that is acceptable and expected** — you are deliberately changing these pixels — but note it in your report if any sheet's `scale` is non-integral, because it widens the diff beyond the edge band described in measured note 2.
2. **Re-extract the two standalones** per measured note 5, honouring key-before-final-resample: extract at a size **larger than shipped** and downsample after keying, preserving each file's existing `processed-full` and `processed` dimensions. **`townsfolk-youngster-b` needs `--key 8a8a8a`.** Do **not** run global `optimize-assets.mjs` — READ-FIRST item 3 explains why it would overwrite your work from a stale master.
3. **Settle the mend fork** exactly as specified above.
4. **Ship an acceptance instrument, not a claim.** Add a script under `scripts/` that asserts, across every re-extracted file:
   (a) the sweep reports **0 suspects with `scanned` still 1314** (the count must not drop — a missing file is a regression, not a pass);
   (b) `halo-loaded-check.mjs`'s four negative controls still read **0.00%**;
   (c) **the invariant from measured note 2**: alpha is byte-identical to the pre-batch cell, and **no fully-opaque (`a=255`) pixel changes RGB**. Any violation names the file and fails.
   (c) is the important one: it converts "per-class visual QA of 1,075 files" into a machine check, so the eyeball pass only has to confirm the change is the *right kind*, not audit every sprite. **If (c) fails on some sheet, that is a FINDING with the file named — not a threshold to relax.**
5. **Visual QA, bounded and by consumer.** Screenshot the surfaces the finding names as provably loaded: the **HUD Baron portrait** and `char-prospector-portrait`, the three **BuildButton** icons, and the **title emblem**. Desktop + 390px. The magenta rim must be gone and nothing else may move. Save to `reviews/shots-f1464-1-halo/`.
6. **Ledger:** retire F-1464-1 as CURED in `tasks/BACKLOG.md` with the measured before/after — **keep the original text and banner it (RETENTION LAW; do not delete)** — and update the goal leaf `f1464-1-halo-reextraction` in `tasks/goals.json` in the same commit.

## TOUCH-ONLY

`assets/processed/**` · `assets/processed-full/**` · `assets/master-divergent.json` (only per the fork, and only to RETIRE with a stated measurement) · the new acceptance script under `scripts/` · `reviews/shots-f1464-1-halo/**` · `tasks/BACKLOG.md` + `tasks/goals.json` (goal-leaf receipt, same commit).

## NO

**`scripts/extract-alpha.mjs` — not one line.** The ruling is already implemented in its grid branch, and editing it would invalidate the f1467 A/B arms that produced the ruling · **`assets/raw/**` — not one byte; you re-extract, you never regenerate, and no image generation happens in this slice** · `src/**` — this is an asset batch and must not become a code change · `playwright.config.ts` / `package.json` gate topology beyond rooting your new script · splitting the recipe by `alphaTest` tier (the ruling forbids it explicitly) · re-keying any sprite the sweep does not list as a suspect · global `optimize-assets.mjs` · the 58 sheets' grids, cells or scales — **you reproduce conventions, you do not redesign them.**

## SELF-CHECK

- `npx tsc --noEmit` clean · `npm run build` green
- `node artifacts/f1450-4/halo-class-sweep.mjs` → **0 suspects, `scanned` 1314** (or the fork's fallback number, explicitly reported and explained)
- `node artifacts/f1450-4/halo-loaded-check.mjs` → four negative controls at **0.00%**
- your new acceptance script green, including the alpha/opaque-interior invariant
- `node scripts/anim-pass-reextract.mjs --verify-downscale` → **0 unexplained, 0 stale exclusions** (this is the control that catches a mend you erased or an exclusion you should have retired)
- a **plain boot probe with zero console/page errors**, desktop + 390px — the runtime imports `assets/processed/` directly, so a malformed PNG is a black screen, not a red test
- **every playwright command passes `--workers=1`** (§3.1)
- screenshots in `reviews/shots-f1464-1-halo/`

READY-FOR-GATES. **Report:** the sweep before/after with `scanned` both times · **the mend fork verdict and the pocket measurement that settled it** · whether measured notes 1–5 held · any sheet whose diff exceeded the edge band of measured note 2, named · the `--verify-downscale` result · and the per-consumer visual verdict with screenshot paths.
