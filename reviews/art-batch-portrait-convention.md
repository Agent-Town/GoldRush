# art-batch-portrait-convention — the townsfolk portrait convention (ART slot)

**Slice:** `art-batch-portrait-convention` (ART slot) · **run:** `tasks/runs/20260727-114224-art-art-batch-portrait-convention.md.log` (rc1)
**Landed:** `1d85c6e6` (art salvage) · **drained by:** s1120 fire, 2026-07-27
**Verdict:** ✅ **PASS — SALVAGE DRAIN.** Deliverables complete and on-convention; one non-blocking outlier (F-1120-1). Reference-tier, extraction withheld.

## What it does

Establishes the **townsfolk portrait convention** — the reference set that unblocks E6–E10 town-icon art — and proves it on the six E1 faces the game already knows: Assay Clerk, Elder Rowan, Mei, Storekeeper, Preacher, Schoolteacher.

The convention, stated so future batches can cite it verbatim:

> A townsfolk portrait is a small illustrated **BUST** in the engraved-sepia plate hand: warm etched linework, parchment ground, shoulders-up, character reading clearly at ~120px. **FULL-BLEED** — no `#ff00ff` key, these are UI portraits and not sprite cells. Filename `tf-<role>.png`. Processing: **none** (reference-tier, consumed directly by the dialogue/ledger UI).

## Why this is a salvage drain

The runner **generated every deliverable at 11:58 and then died** — `ERROR: stream disconnected before completion` after 5 failed reconnects, 144,831 tokens — *during* its LEDGER write. So it produced complete art and zero bookkeeping, and never done-moved. The output was left **untracked in main's `assets/`** (not `worktrees/art/`), i.e. **22.58 MB in no object database**: the RETENTION LAW's largest live hole, open for ~20 minutes.

Salvage was therefore the first act of this drain, before QA — bytes that don't exist can't be adjudicated. Committed `1d85c6e6`, pushed, and **verified at origin by `ls-remote` SHA-compare** (match), not by assuming the push succeeded.

## Evidence

| Check | Method | Result |
|---|---|---|
| Deliverable count | `ls` vs the master's named six + sheet | 6 raws + 1 contact sheet ✓ complete |
| Format | `sharp.metadata()` | all six **1254×1254, RGB, no alpha** — correct for the full-bleed/no-key tier ✓ |
| **Reads at 120px** | downscaled all six to 120px and **viewed the montage** | ✓ distinct silhouettes, faces, headwear (spectacles / wide-brim+beard / flat cap / bare mustache / black wide-brim / curly) |
| Sheet fidelity | extracted each 384×384 cell, compared to the raw resized to 384 | **mean abs per-channel diff 0.2** on all 6 — faithful, and in the master's exact order ✓ |
| Convention consistency | mean ground RGB of an 60×60 parchment corner per raw | 5 of 6 in a tight warmth (R−B) band **130–145**; **`tf-mei` = 104** ⇒ F-1120-1 |
| Canon §9 | full-res visual review | no letters, **no firearms**, no gore, illustrated-not-photoreal ✓ |
| Consumer | `grep -rn "tf-" src/` | **none** — the only hit is `utf-8` inside `CharterShare.ts:43` (substring false positive) |

Standard code gates (tsc/build/specs) are **not applicable and would be vacuous**: this drain adds image bytes and markdown only, touches zero `src/`, and changes no player-visible surface.

## Findings

**F-1120-1 — `tf-mei` is a measurable convention outlier (NON-BLOCKING, retake when next exercised).**
Ground warmth R−B **104** against the other five's tight **130–145** band; the ground is paler and less saturated (`rgb(215,178,111)` vs the cluster's `rgb(166–211, 107–149, 36–66)`), and the framing is slightly wider so the head reads smaller in cell. The etched hatching and parchment ground **are** present at full resolution — so this is *drift within the convention*, not a different illustrative hand, and it does not break the reference set's usefulness.

⚠️ **Recorded because the process matters more than the finding:** at contact-sheet scale I judged Mei to be in a visibly *different, smoother, cooler* style — and that was **wrong**. The 0.2-meanAbsDiff sheet-fidelity measurement proved the sheet is a faithful downscale of the raw, so what I "saw" was an artifact of viewing 1254px art at 384px. The real defect is a third the size of the eyeballed one. *An art QA done by eye at the wrong scale invents defects as readily as it misses them.*

**F-1120-2 — the ART staging audit was blind to 566 MB (FIXED THIS FIRE, `677ca028`).** See that commit; summarised in the handoff. It is the third instance of the F-1054-1/F-1055-1 class and it is why this batch's exposure went unreported by the instrument built to report exactly it.

**F-1120-3 — no goal leaf (Goal Registration Law).** `node scripts/drain-block-check.mjs art-batch-portrait-convention` returned **UNKNOWN — no goal leaf matches**, which per fire.md §3.0 is a bookkeeping finding and *not* a clearance. The master was also **untracked** — authored and queued without ever being committed. Leaf registered in the drain commit; the master is now in git at `1d85c6e6`.

## Merge classification

Not a lane merge — no branch, no base. The ART slot wrote directly into main's working tree (the recurring **F-071-1** defect, BACKLOG line 39, "4th+ instance"). All adds are **new paths**: no file on main was moved, overwritten, or deleted. `git add` was path-scoped to the 6 raws + sheet + master; the concurrent `artifacts/` and `logs/` churn in the tree was deliberately left untouched.

## What is owed next

- **Wiring is NOT owed by this slice.** Reference-tier with no consumer ⇒ extraction withheld per the reference-tier law. When a dialogue/ledger UI slice wants portraits, it consumes `assets/raw/tf-<role>.png` directly (full-bleed, no key).
- The convention above is now citable by E6–E10 town-icon batches.
- F-1120-1 retake for `tf-mei` — fold into the next `tf-*` batch rather than spending a batch on one face.
