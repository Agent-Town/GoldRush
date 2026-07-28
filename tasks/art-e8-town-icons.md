# Task art-e8-town-icons: THE E8 TOWNSFOLK — the orbital era's cast, third batch off the pinned portrait convention (ART SLOT)
FIRE-AUTHORED s1161 (attended review welcome)
You are Codex with image_gen, running in the ART slot.
CODEX: model=gpt-5.6-sol effort=high

## Why — the class blocker is retired, E6 and E7 have both now proved it, and this rung's identities are spec-verbatim
**Unshipped proof (F-1044-4 art gate — cite the BACKLOG line):** `tasks/BACKLOG.md:791` reads verbatim **"E8 town-icons still owner-blocked on the portrait convention"**, and that text is the F-1044-4 record of *why it was blocked*, not a live gate. ✓ **File-probe s1161:** `git ls-files | grep -E "tf-.*-e8|icons-e8"` returns **zero**, and no `tasks/art-e8-*town-icons*.md` master exists. So the work is genuinely unshipped.

**The blocker is retired class-wide by the OWNER, not by me.** `BACKLOG:979` (the OWNER'S DESK block, item ②) verbatim: *"✅ CLOSED — ANSWERED BY THE OWNER 2026-07-27 … **This unblocks the whole town-icons class E6–E10.**"* ✓ line number re-verified s1161 by grep, not inherited from the E7 master, which cited the pre-edit `:977`. Two rungs have since shipped against it and the convention held both times:
- **E6** — `art-e6-town-icons` DRAINED `c7601082`, `assets/LEDGER.md` **row 61**.
- **E7** — `art-e7-town-icons` DRAINED `7873eaee17e1f4f9e9fcf4575e7aec3e33910f83`, **row 62**, review `reviews/art-e7-town-icons.md` (s1161). Its instrument control passed, its five portraits measured 127.5–144.4, and its sheet order was proven 5/5 bijective.

**You are E8, the third rung** of `reviews/era-art-audit.md` **§E8 item 4** (`:147`).

⚠️ **I AUDITED THIS RUNG FOR A SECOND, QUIETER BLOCKER — because s1160 found exactly that on E7 (a spec parenthetical answered ten days earlier in `lore/`). E8 has one too, and it is REAL, so one file is deliberately NOT in this batch.** See the DEFERRED section. **A stale gate falling is not permission to take what was behind it.**

READ FIRST (paths, all on main):
- `assets/LEDGER.md` **row 60** — THE CONVENTION, written expressly "for E6–E10 batches to cite". Obey it literally.
- `assets/LEDGER.md` **rows 61 + 62** — the E6 and E7 batches that proved it, and the findings you must honour.
- `tasks/art-e7-town-icons.md` — your immediate precedent; same shape, same firewall discipline.
- `reviews/art-e7-town-icons.md` — the drain that gated it, including **F-1161-1** and **F-1161-2** (below).
- `assets/raw/tf-{assay-clerk,elder-rowan,mei,preacher,schoolteacher,storekeeper}.png` — the six E1 portraits = style ground truth **and your instrument-validation control**.
- `assets/contact-sheets/tf-e7-town-sheet.png` — the sheet whose construction yours mirrors.
- `specs/epoch-saga/e8-orbital-bundle.md` **line 11** — the identities (quoted verbatim below).
- `lore/STORYBOOK.md:473, :486, :491` — the era's register and the cast's characterisation.
- `reviews/era-art-audit.md` **§E8 item 4 (`:147`) + A4 (`:74`)** — the plan rung this fulfils.
- `docs/GOLD_RUSH_BRIEF.md` §9 + `docs/decisions/ADR-001` — canon.

## THE CONVENTION (LEDGER row 60, binding — do not drift)
A townsfolk portrait is a small illustrated **BUST** in the engraved-sepia plate hand: warm etched linework, **parchment ground**, **shoulders-up**, character **reading clearly at ~120px**, **FULL-BLEED with NO `#ff00ff` key** (UI portraits, not sprite cells), filename `tf-<role>-e8.png`, **processing: NONE**. Canvas **1254×1254 RGB, no alpha**.

**E8 palette rider** (from the shipped E8 building batches, LEDGER rows 49–50): **silver / teal / suit-brass / honey-gold glass over parchment and regolith.** Cool the sepia toward silver and suit-brass — but **the ground stays warm parchment**; see the guard below, which is measured on exactly that ground.

### ⚠️ THE GROUND-WARMTH GUARD — and E8 is the era most likely to break it
> **GROUND WARMTH := mean of (R−B) over the TL 60×60 and TR 60×60 corners.**
> **GATE: flag below 120.** Accepted range across all shipped `tf-*` portraits is **124–145**.
> ⛔ **Never a 4-corner or whole-image mean** — row 60 measured that it false-fails **10 of 11** accepted portraits. ⛔ **Never a SINGLE corner** — `tf-appliance-wrangler` spreads **13.9 points** across its own top edge (TL 131.6 / TR 117.7), so the corner you happened to sample would decide the verdict.

🔴 **THIS IS THE BATCH WHERE THAT GUARD IS MOST AT RISK, AND YOU SHOULD EXPECT TENSION.** E8's palette rider is **silver and teal** — the two coolest colours in the saga — and the statistic is literally *how much redder than bluer the top corners are*. **The resolution is NOT to warm the whole portrait back to E6 sepia, and NOT to let the ground go cool: keep the PARCHMENT GROUND warm and put the silver/teal in the SUBJECT** (suits, glass, fittings, the sky beyond a dome pane). E7 did this with brass and landed 127.5–144.4. **If a portrait measures below 120, do not ship it and do not quietly re-tint the whole plate — regenerate with a warmer ground and report both numbers.**

**VALIDATE THE INSTRUMENT BEFORE YOU TRUST IT — not optional, not ceremony.** Run your measurement code over the six E1 raws FIRST. These are **measured** truths, re-verified by the E7 drain (s1161) with an independent implementation, so they are the expected result, not a hypothesis:

| E1 control | expected TL+TR mean | vs the 120 floor |
|---|---:|---|
| `tf-assay-clerk.png` | ≈137.8 | pass |
| `tf-elder-rowan.png` | ≈134.0 | pass |
| `tf-mei.png` | ≈105.3 | **the ONE fail** (F-1120-1's known drift) |
| `tf-preacher.png` | ≈124.5 | pass — accepted below 130; the case that killed the old 130–145 band |
| `tf-schoolteacher.png` | ≈140.4 | pass |
| `tf-storekeeper.png` | ≈143.9 | pass |

**Your instrument is correct only if it reproduces all six within ~±1 AND flags exactly one (`tf-mei`).** If it flags two, or none, it is wrong — fix it before measuring a single E8 file, and report the full control table in the run file. **This control has already earned its keep once: it blocked E7 attempt 1 (`49d49007`) at pre-flight, before a single `image_gen` call, because the task's band was wrong.**

## THE BATCH — 5 files EXACT (4 portraits + 1 sheet)
Identities are `specs/epoch-saga/e8-orbital-bundle.md:11` verbatim: *"launch master · dome gardener (green things under glass — warmth in vacuum) · suit fitter · the He-3 assayer (assay lineage) · a child born ON the Moon (the first townsfolk who has never seen the river — the tavern tale that aches; E9's motivation seeded)."*

⚠️ **That line names five. You are generating FOUR.** The He-3 assayer is deferred — see DEFERRED, and do not substitute another identity into the empty slot.

In `assets/raw/`:
1. `tf-launch-master-e8.png` — **fresh.** The one who says when the mass-driver throws. `lore/STORYBOOK.md:486` notes the deep rhyme: *"the mass-driver IS E2's rail spur, generations later, throwing cargo to orbit."* So render a **railway dispatcher's authority in a vacuum trade** — a calm, weathered adult with a launch-crew's headset or ear-defenders and a signal paddle or hand-lamp, suit-brass fittings at the collar. Authority without menace.
2. `tf-dome-gardener-e8.png` — **fresh.** Spec: *"green things under glass — warmth in vacuum."* STORYBOOK:486 adds *"her apprentice becomes E9's greenkeeper, who plants OUTSIDE."* **She is the warmest face in the batch and she is the one carrying the era's whole emotional argument** — living green against a black sky. Soil under the nails, a seedling tray or a cutting in hand, honey-gold glass behind her. **Her ground must be the warmest of the four; use her to anchor the batch against the palette risk above.**
3. `tf-suit-fitter-e8.png` — **fresh.** Spec: *"the sewing tradition's fifth act: the town that sewed a machine's cover now sews everyone's air"* (STORYBOOK:486). A tailor's competence turned life-support: measuring tape at the neck (**blank, no numerals — see canon riders**), a suit collar-ring or glove being fitted, needle-and-seal work. **The trade lineage is the point** — this reads as a tailor first and a technician second.
4. `tf-moon-born-child-e8.png` — **fresh.** Spec: *"a child born ON the Moon (the first townsfolk who has never seen the river — the tavern tale that aches)."* A **child**, bright and utterly at home — the one person in the saga for whom none of this is strange. Warm, safe, fully clothed, unafraid; Earth may hang small in a pane behind her. **She must not read as deprived or wistful — she has lost nothing, which is exactly what aches.** Illustrated and warm, never pitiable.

In `assets/contact-sheets/`:
5. `tf-e8-town-sheet.png` — **four-up** contact sheet, **the four above in the order listed**, mirroring the E7 sheet's construction (square canvas, undistorted equal cells, no gutter text).

Style anchor **verbatim in every prompt**: `"Gold Rush townsfolk portrait, engraved-sepia plate hand: warm etched bust on parchment, shoulders-up, no letters, no gore, reads at 120px."`

## DEFERRED — the He-3 assayer, and why a fire must not decide it
❌ **`tf-he3-assayer-e8.png` is NOT in this batch, and neither is any `<existing-tf-id>-e8.png` aging edit.** Both are blocked by **one** unanswered canon question, raised to the owner as **F-1161-3** in the same commit as this master.

The spec calls this identity *"the He-3 assayer **(assay lineage)**"* and STORYBOOK:486 adds *"assay lineage, one era from its Press destiny."* **The lineage already has a shipped FACE**: `tf-assay-clerk.png` (E1), continued as `tf-depot-clerk-e6.png` — which LEDGER row 61 records as an **identity-preserving aging edit of the same man**. So "lineage" has been rendered once already as *one person, aged*.

⚠️ **Whether it stays that way at E8 is a canon fork, not a chore.** The eras are roughly eight years apart — the E7 defector edit is specified and was gated at *"~+8 years"* — so E1→E8 is **~56 years**. The assay clerk who was a working adult at E1 is in his eighties at E8, **on the Moon**, in a physically demanding trade. Meanwhile the saga's other multi-era trade, the clerk line, is explicitly **generational** (`lore/characters.md:36`: *"youngster-a's face runs whatever each era moves"*; STORYBOOK:512: *"the clerk line's **seventh generation**"*). **The word "lineage" is doing one job in one place and the other job in the other, and nothing on record says which it means here.**

Drawing it either way silently answers the question — **Mistake #14: generator proposes, contract disposes.** Guessing "same man" ages a shipped face into implausibility; guessing "successor" quietly ends a character's arc one era before the storybook says he reaches *"its Press destiny."* **Neither is a fire's call.** It is on the OWNER'S DESK; when it is answered, the assayer and the aging edit are one small follow-on batch.

## Canon riders (ADR-001 / brief §9)
- **NO LETTERS.** E8's specific traps: the suit fitter's **measuring tape** (render blank — no numerals, no graduations that read as numerals), launch manifests and waybills, dial faces, suit ID patches, seed-tray labels. **Blank, blind-embossed, or holes-only, always.** No titles, words, numerals or legible type anywhere.
- **No firearms, ever.** E8's risk atom is the **launch master's signal paddle or lamp** — a *signalling* instrument, held or raised, **never aimed**; no barrel, muzzle, bore, mount, stock or aimed form. Nothing in this batch is a weapon. (Precedent: the E8 building batch had to clear `mass-driver-rail` as an open-rail cargo railway and `solar-lens-array` as an optic — LEDGER row 49. Hold that line.)
- **These are townsfolk, not enemies**; no peoples are ever the enemy. Illustrated and warm, never gory — **especially** the moon-born child.
- **Earth may appear, and it is a CAMEO, not a horizon** — the E8 transform batch established this (LEDGER row 50: *"cameo-scale Earth (not horizon)"*). Small, in a pane or beyond a shoulder. Never the subject.
- Keep the era's optimism: these are people who have made a home in vacuum, not survivors enduring it.

## Self-QA — MEASURED, per file, in the run file (not eyeballed)
- **Instrument control FIRST** (see above): report the six E1 numbers and confirm the reproduction + that **exactly one** (`tf-mei`) flags. **Do not proceed if the control fails — stop and report, as E7 attempt 1 correctly did.**
- Canvas **1254×1254 RGB, no alpha** on all 5 (state measured dims + channel count). **0 transparent px, 0 exact- and near-magenta px** (correct full-bleed reference tier).
- **Reads at 120px: actually downscale each to 120px and view it** — distinct silhouette / face / headwear per role. Say that you did it, and save the strip to `reviews/shots-art-e8-town-icons/e8-portraits-120px-strip.png`.
- **Ground warmth per portrait = mean R−B over TL+TR 60×60; it must clear the 120 floor.** Report the number per file, and **report TL and TR separately, not just the mean** — that is **F-1161-2** from the E7 drain: `tf-drone-keeper-e7` measured **132.5 / 122.5**, a 10.0-point spread with one corner under the accepted floor while the mean passed. Two batches have now shown this; if E8 shows it a third time the spread itself will need a bound, so **the drain needs your per-corner numbers to decide that.**
- Framing consistent across the four (shoulders-up, comparable head size) — **the CONVENTION is the deliverable, not just the faces.**
- **Contact sheet order, verified not asserted (F-1154-3).** Pair every cell against every raw (**4×4 matrix**), report the MAE for each true pairing **AND** the range for the **12 wrong pairings** — the wrong pairings are your positive control. State the sheet's true order as measured. A matrix you did not run reports nothing. ⚠️ **If you assemble the sheet programmatically from the resized raws, say so** — the E7 drain found that a true-pairing MAE of exactly `0.00` is near-tautological in that case (same bytes, same resampler), so **the number the drain trusts is the WRONG-pairing spread**, and it must be large and gapless.
- Canon: no letters / no firearms / no gore — stated **per file**, checked at full size AND at 120px.
- **State plainly whether the E8 silver/teal rider fought the warmth guard**, and how you resolved it. That is genuinely useful to E9/E10 and no batch has reported it yet.

## FIREWALL
**TOUCH-ONLY:** `assets/raw/tf-{launch-master,dome-gardener,suit-fitter,moon-born-child}-e8.png` (the 4) · `assets/contact-sheets/tf-e8-town-sheet.png` · `reviews/shots-art-e8-town-icons/` (QA strip only) · `assets/LEDGER.md` (one new row) · your run file under `tasks/runs/`.

**NO:**
- ❌ **`tf-he3-assayer-e8.png` and ANY `<existing-tf-id>-e8.png` aging edit** — DEFERRED above, owner-gated as F-1161-3. **Do not substitute another identity into the slot to make the batch "feel" complete.**
- ❌ **`tf-chalk-*` / any civic-agent or made-citizen portrait** — still owner-gated as **F-1160-1** (her visual species is unspecified; `ADR-003` implication (3) calls it *"the second canon beat"*). Not this batch, not any batch, until the owner answers.
- ❌ **`icons-e8.png` or ANY `#ff00ff`-keyed sheet** — different tier, its own rung, and `reviews/era-art-audit.md:147` additionally gates it on `icons-e5.png` landing first (*"only after that source sheet lands; do not independently redesign it"*). Exactly the E6/E7 split.
- ❌ No extraction, no `extract-alpha`, no `assets/processed/` (**reference-tier law: no consumer exists** — `grep -rn 'tf-' src/` returns only the string `utf-8` in `src/charter/CharterShare.ts:43` — so nothing is wired and no player-visible surface changes).
- ❌ No `src/**`, no `e2e/**`, no contracts, no `generated.ts`.
- ❌ Do not touch or regenerate any existing `tf-*.png` (six E1, six E6, five E7). **They are your control and your style ground truth; they stay byte-intact.** Confirm this by hash in the run file.
- ❌ No E9/E10 portraits (later rungs).
- ❌ **Do not run the playwright suite or start a dev server.** Nothing here is testable that way, and the box has been carrying a full-suite inventory in lane-d plus two wrangler dev servers — a second heavy job corrupts other lanes' measurements (Mistake #12).

One batch in flight (✓ verified s1161: `tasks/queue/art/` empty, `tasks/running/` holds only the lane-d job).

END: **READY-FOR-GATES** + the measured QA table (5 rows, TL and TR reported separately) + the instrument-control numbers + the 4×4 sheet pairing matrix with its 12 wrong-pairing controls + the LEDGER row + a one-line statement of whether the convention held or drifted, and whether the silver/teal rider fought the warmth guard.
