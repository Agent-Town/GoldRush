# Task lane-c-eight-winds-e2-row-order-survey: EIGHT WINDS — establish the TRUE row→heading mapping for the three E2 diagonal sheets, and change nothing else (LANE-C, commit prefix "docs:")

**FIRE-AUTHORED s1188 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST:
- `AGENTS.md`
- `reviews/eight-winds-wiring-e2-enemies.md` — **the review of the STOP that produced this task. Read F-1188-1 and F-1188-2 in full; they are your entire brief.**
- `tasks/runs/20260729-003051-lane-c-eight-winds-wiring-e2-enemies.md` — the stopped run's own report, including its row-by-row visual readings. **Treat it as a hypothesis to test, not a result to extend.**
- `reviews/eight-winds-wiring-spec.md` — **§2.2 (the sibling table and the do-not-resize rule) and the anti-mirror law.** The authorizing spec.
- `tasks/lane-c-eight-winds-wiring-e2-enemies.md` — the blocked wiring slice this survey unblocks. **You are NOT executing it.**

CODEX: gpt-5.6-sol effort=high

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(Measured by the authoring fire at 2026-07-29T01:0xZ: `lane/e2-arsenal` was **1 ahead at `fe3ae8cb`** but `git diff --name-only --diff-filter=A main..lane/e2-arsenal` was **EMPTY** — its content landed on main as `fba9a446`, i.e. a FALSE-AHEAD SAFE DUPE. Re-derive it anyway; the board moves.)*

## Why (F-1188-1 + F-1188-2, `reviews/eight-winds-wiring-e2-enemies.md`, drained `fba9a446` 2026-07-29)

Slice 3 (`lane-c-eight-winds-wiring-e2-enemies`) **stopped lawfully** because it could not tell two Coal Thief rows apart, and it was right to stop: **a wrong row→heading mapping renders the character walking backwards and NO test catches it.** The drain confirmed the blocking claim at the pixels — but it also found that **the STOP's own recommendation is unsafe**, and that is why this survey exists instead of an art fix.

**What is settled (do not re-litigate, but do re-derive if cheap):**

1. **Coal Thief rows 0 and 1 are ONE heading, not an sw/se pair.** Silhouette IoU over the keyed raw, bounding-box aligned, direct-vs-mirrored: `0v1` = **direct 0.863 / mirrored 0.671** against that subject's own mirror-symmetry floor of **0.588**. The direct score is higher than either row's *own within-row frame-to-frame similarity* — two frames from **different** rows match better than two from the **same** row. Corroborated by direct visual read and by the stopped run's independent image-only review.
2. **Coal Thief rows 2 and 3 ARE a lawful mirror pair** (`mirrored 0.767 / direct 0.579`). The stopped run hedged row 3's front/back read; **the pixels refute the hedge.** The Coal Thief defect is confined to the **southern** pair.

**What is NOT settled, and is the whole point of this task:**

3. **Rail Tough's mapping contradicts the label set the stopped run assigned it.** All four *cross* pairs (0v2, 0v3, 1v2, 1v3) are **mirror**-dominant, while **0v1 (+0.119) and 2v3 (+0.254) are direct**-dominant — the exact opposite of what `[sw, se, nw, ne]` predicts for those two pairs. High-zoom inspection confirms rows 0,1 are **front**-facing and rows 2,3 **back**-facing (that half of the run's reading is right), and *suggests* row 1 flips heading between frames 1 and 3–4. ⚠️ **The authoring fire could NOT confirm this and explicitly did not act on it:** the tell it used was costume asymmetry (which shoulder carries the brass pauldron), and **that tell is void if the character wears armour on both shoulders** — which some frames appear to show. **Resolving exactly this is scope 2.**
4. **Steam Wrecker returned NO measurable signal.** Every row-pair margin sits inside the noise band (|direct − mirrored| ≤ 0.095 against a 0.522 floor). That is **indeterminate, not clean** — and it is the sheet the stopped run was *most* confident about (the amber porthole eye).

➡️ **Therefore: art-correcting Coal Thief and re-queueing the wiring slice "unchanged" — the stopped run's recommendation — would build on two unverified mappings.** Establish the truth for **all three sheets** first. This task produces **evidence only**; it fixes nothing and binds nothing.

## ⚠️ THE TRAP THIS TASK EXISTS TO AVOID — AND THE ONE IT COULD REPEAT

The stopped run produced confident per-row labels with plausible-sounding evidence ("amber eye visible", "coat back dominates"), and **two of its three sheets did not survive re-measurement.** A discriminator that *sounds* anatomical is still a hypothesis.

**So the binding rule of this task: VALIDATE YOUR DISCRIMINATOR BEFORE YOU USE IT.** For each sheet, you must first establish that the feature you intend to read heading from is actually left/right asymmetric **on that character** — and prove it — before any row gets a label. A discriminator you cannot validate produces an **UNCERTAIN** row, and UNCERTAIN is a legitimate, expected, **successful** outcome here. Guessing is the failure mode; admitting you cannot tell is not.

## Scope

1. **Extract the three sheets to a SCRATCH location — not into the shipped tree.**
   `char-{railtough,steamwrecker,coalthief}-sheet-walkdiag4-a.png`, grid **4×4**, cell **313**, key `ff00ff`. Sheets are **1252×1252** against 1254² bases; spec §2.2 rules that correct and **forbids resizing, padding or normalising** them.
   The predecessor extracted into `assets/processed/` and then had to delete 51 unbound cells to avoid dead bundle weight. **Do better: write the cells somewhere that is not a shipped asset path** (an `artifacts/` scratch dir). If `scripts/extract-alpha.mjs` has no output-directory flag, extract as the predecessor did and **remove the cells before you commit**, then prove `git status` is clean of `assets/`. **Do not add an output flag to the script** — that is a code change and it is firewalled.

2. **VALIDATE ONE DISCRIMINATOR PER SHEET, and report the validation before any labels.**
   For each character, identify a candidate left/right tell (a tool, an eye/porthole, a sack, a pauldron, a stride) and **prove it is asymmetric on that character** — e.g. by finding a near-front-on frame where both sides are visible, or by showing the feature appears on exactly one side across all frames of a single row.
   **The Rail Tough shoulder-armour question is named explicitly and must be answered:** does it carry a brass pauldron on **one** shoulder or **both**? Quote the frames you read. If the answer is "both", say so and pick a different tell — that single fact is what blocked the authoring fire.
   A sheet whose discriminator cannot be validated ⇒ all four of its rows are **UNCERTAIN**. Report and move on; do not substitute intuition.

3. **Produce the mapping table — per sheet, per row, with a confidence word.**
   For each of the 12 rows: `sw | se | nw | ne | UNCERTAIN`, plus the evidence sentence and which frames you read it from. Front/back (south vs north) and left/right (west vs east) are **separate** judgements — report them separately, because the stopped run got front/back right and left/right wrong. Apply the spec's anti-mirror law: SW/SE are front-three-quarter, NW/NE back-three-quarter.

4. **CROSS-CHECK against the mirror instrument, and report every disagreement.**
   Re-derive, per sheet, the direct-vs-mirrored IoU table over the extracted cells (bounding-box aligned, best-over-frame-pairs), **calibrated against that subject's own mirror-symmetry floor `IoU(row, flip(row))`** — the floor is not optional: a walking human silhouette is near-symmetric, and an uncalibrated mirror score carries no heading information. Expected agreement: two rows you label as an opposite-heading pair should be **mirror**-dominant; two rows you label with the same heading should be **direct**-dominant.
   **Any row where your visual label and the instrument disagree is UNCERTAIN**, regardless of how confident the visual read felt. Report the disagreement rather than resolving it in favour of either side. Reproduce the authoring fire's Coal Thief numbers (0v1 direct 0.863 / mirrored 0.671, floor 0.588) as a control on your own implementation — **if you cannot reproduce those, your instrument differs from mine and the whole table is suspect: say so.**

5. **Name the defects, and size the repair.**
   Conclude, per sheet: is it (a) lawfully mapped with four distinct headings, (b) defective and needing N rows regenerated, or (c) indeterminate? For (b), state **exactly which rows** and **which headings are missing**. This is the number that decides whether the follow-up is a one-row art edit or a three-sheet regeneration — **it is the deliverable the owner and the next fire will act on**, so do not round it or hedge it into uselessness.

6. **Evidence a human can check without running anything.**
   Labelled contact sheets per sheet at readable zoom → `artifacts/eight-winds-e2/rowsurvey-<slot>.png`, each row annotated with your label. Plus the full IoU tables in the report. A reader must be able to disagree with you from the artifacts alone.

## TOUCH-ONLY

- `tasks/runs/<your run report>.md`
- `artifacts/eight-winds-e2/**` (new evidence only)

## NO — do not touch, for any reason

- **`assets/layer-contracts/characters.v2.json`** — this task binds NOTHING. The wiring slice stays blocked until its mapping is known.
- **`assets/processed/**` and `assets/raw/**`** — no extraction output committed, no pixel edited, no sheet resized/padded/normalised, **no art regenerated** (that is a separate ART-slot batch, and it depends on YOUR answer).
- **All of `src/**`** — including `scripts/extract-alpha.mjs` and `SpriteAnimator.ts`. If you believe a script needs a flag, **report it, do not add it.**
- **Every existing `e2e/**` assertion** and every spec file. This task adds no test.
- `char.hero`, `char.claim_jumper` (owner-gated design fork **F-1166-1**, `tasks/025` DO-NOT-QUEUE), `char.prospector_agent`, the four hero ages, and the other diagonal sheets.
- `STATUS.md`, `reviews/**`, `tasks/BACKLOG.md`, `tasks/goals.json` — fire-owned surfaces.

## Self-check before you report

- `npx tsc --noEmit` exit 0 and `npm run build` exit 0 — **you changed no code, so these must be unchanged; if either is red you have touched something you should not have.**
- `npm run test:node-guards` → **61/61, exit 0.**
- `git status` shows **only** your run report and `artifacts/eight-winds-e2/` additions — **no `assets/`, no `src/`, no `e2e/`.** Paste the output.
- Your report states, for each of the 12 rows: the label, the confidence, the evidence, and the instrument's verdict — **and flags every disagreement between the last two.**
- Your report answers the Rail Tough shoulder-armour question explicitly.

**A survey that concludes "two sheets are UNCERTAIN and here is precisely why" is a SUCCESS.** The failure mode is a confident table that a later fire has to refute — which is exactly what happened to the run before you.

READY-FOR-GATES + report: the 12-row mapping table with confidences, the discriminator validation per sheet (incl. the Rail Tough armour answer), the calibrated IoU tables with the Coal Thief control, the per-sheet defect verdict with row counts, and the `git status` proof of a clean tree.
