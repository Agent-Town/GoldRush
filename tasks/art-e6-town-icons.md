# Task art-e6-town-icons: THE E6 TOWNSFOLK — the first cast batched from the pinned portrait convention (ART SLOT)
FIRE-AUTHORED s1153 (attended review welcome)
You are Codex with image_gen, running in the ART slot.
CODEX: model=gpt-5.6-sol effort=high

## Why — this rung was blocked for 380+ BACKLOG lines and the OWNER retired the blocker on 2026-07-27
`tasks/BACKLOG.md:767` still reads **"NEXT batch: art-e6-town-icons (batch 3/5) — PIPELINE-DRY, NOT fire-authorable"**, and that line is the proof this batch is UNSHIPPED (F-1044-4 art gate: cite the BACKLOG line). Its blocker had three clauses. **Two are now measurably FALSE and the third is a scoping call this task resolves by splitting:**
1. ~~"ZERO `tf-*.png` portraits exist project-wide → the convention is unestablished"~~ — **FALSE as of `1d85c6e6`** (verified s1153: `git ls-files | grep tf-.*\.png` returns **7**, and `1d85c6e6` is an ancestor of main). The convention batch shipped under an explicit **OWNER RULING 2026-07-27, quoted verbatim in `tasks/art-batch-portrait-convention.md:3`: portraits "match the plates" — engraved-sepia illustrated busts, one reference sheet, "unblocks town-icons E6-E10"**. That ruling IS the answer to OWNER'S DESK item ② at `BACKLOG:955` ("the townsfolk-portrait convention — recommend: one reference portrait, then the fires batch from it"). **You are the "then".**
2. ~~"the `<existing-tf-id>-e6.png` edit-set item is UNDEFINED (there are no existing tf ids to edit)"~~ — **FALSE**: six tf ids now exist to edit (`assay-clerk`, `elder-rowan`, `mei`, `preacher`, `schoolteacher`, `storekeeper`).
3. "the batch mixes a keyed `icons-e6.png` research sheet (processed-tier, 15 cells) with reference-tier portraits" — **RESOLVED BY SPLITTING: `icons-e6.png` is OUT OF SCOPE here** (see NO list). Portraits are full-bleed reference-tier; the icon sheet is `#ff00ff`-keyed processed-tier. One batch, one tier.

READ FIRST (paths, all on main):
- `assets/LEDGER.md` **row 60** — THE CONVENTION, written there expressly "for E6–E10 batches to cite". Obey it literally.
- `assets/raw/tf-{assay-clerk,elder-rowan,mei,preacher,schoolteacher,storekeeper}.png` — the six shipped E1 portraits = your style ground truth and the edit source.
- `assets/contact-sheets/tf-e1-portrait-convention-sheet.png` — the six-up sheet whose shape yours mirrors.
- `specs/epoch-saga/e6-atomic-bundle.md` **§A4** — the identities (verbatim below).
- `reviews/era-art-audit.md` **§E6 item 3** — the plan rung this fulfils.
- `docs/GOLD_RUSH_BRIEF.md` §9 + `docs/decisions/ADR-001` — canon.

## THE CONVENTION (LEDGER row 60, binding — do not drift)
A townsfolk portrait is a small illustrated **BUST** in the engraved-sepia plate hand: warm etched linework, **parchment ground**, **shoulders-up**, character **reading clearly at ~120px**, **FULL-BLEED with NO `#ff00ff` key** (these are UI portraits, not sprite cells), filename `tf-<role>.png`, **processing: NONE**. Match the six E1 raws' canvas: **1254×1254 RGB, no alpha.**
⚠ Known convention outlier to NOT imitate — **F-1120-1**: `tf-mei` drifted paler (ground warmth R−B **104** vs the other five's tight **130–145** band) and framed slightly wider. **Anchor on the other five; land your six inside the 130–145 band.**

## THE BATCH — 7 files EXACT, in `assets/raw/` (6 portraits + 1 sheet)
Identities are `specs/epoch-saga/e6-atomic-bundle.md` §A4 verbatim; keep the era's humor, keep the hand.
1. `tf-reactor-steward-e6.png` — the tide-teller's apprentice, **promoted**; face-chain.
2. `tf-kitchen-chemist-e6.png` — the Isotope Kitchen's cook-chemist (lead-glass hood pushed up).
3. `tf-appliance-wrangler-e6.png` — lasso of **copper wire**.
4. `tf-diner-carhop-e6.png` — roller skates, tray of glowing sundaes.
5. `tf-combine-defector-e6.png` — **mint-enamel suit, loosened tie, carries the catalog he wrote.**
6. `tf-depot-clerk-e6.png` — **THE CLERK LINEAGE, and this one is an image-EDIT, not a fresh gen** (consistency law: era transforms EDIT existing art). Edit source = `assets/raw/tf-assay-clerk.png`. Apply the spec's **aging pass: +~12 years, ONE chrome element.** Same face, same framing, same hand — he now runs the parcel-tube office. If you cannot hold the identity through the edit, STOP and report rather than generating a stranger.
7. `assets/contact-sheets/tf-e6-town-sheet.png` — six-up contact sheet, **the six above in the order listed**, mirroring the E1 sheet's layout.

Style anchor **verbatim in every prompt**: `"Gold Rush townsfolk portrait, engraved-sepia plate hand: warm etched bust on parchment, shoulders-up, no letters, no gore, reads at 120px."`

## Canon riders (ADR-001 / brief §9) — two live risks in THIS batch
- **NO LETTERS. The defector "carries the catalog he wrote" — render the catalog with a BLANK cover or holes-only/blind-embossed marks. No titles, no words, no legible type.** Same for any diner menu, jar label or depot tag.
- **No firearms, ever** — a "lasso of copper wire" is rope-and-tool, never a weapon form; no barrels/muzzles/bores anywhere. Illustrated and warm, never gory.
- These are **townsfolk**, not enemies; no peoples are ever the enemy.

## Self-QA — MEASURED, per file, in the run file (not eyeballed)
- Canvas **1254×1254 RGB, no alpha** on all 7 (state the measured dims + channel count).
- **Reads at 120px: actually downscale each to 120px and view it** — distinct silhouette / face / headwear per role (the E1 drain did exactly this; do the same, and say so).
- Ground warmth **R−B inside 130–145** per portrait (report the number; this is the F-1120-1 guard).
- Framing consistent across the six (shoulders-up, comparable head size) — **the CONVENTION is the deliverable, not just the faces.**
- Contact sheet is a **faithful downscale in the stated order** — report mean abs per-channel diff per cell (E1's was 0.2).
- `tf-depot-clerk-e6` vs `tf-assay-clerk`: identity held; name the aging cues + the single chrome element.
- Canon: no letters / no firearms / no gore — stated per file.

## FIREWALL
**TOUCH-ONLY:** `assets/raw/tf-*-e6.png` (the 6) · `assets/contact-sheets/tf-e6-town-sheet.png` · `assets/LEDGER.md` (one new row) · your run file under `tasks/runs/`.
**NO:** ❌ `icons-e6.png` or ANY `#ff00ff`-keyed sheet (different tier — its own rung) · ❌ no extraction, no `extract-alpha`, no `assets/processed/` (reference-tier law: **no consumer exists**, so nothing is wired and no player-visible surface changes) · ❌ no `src/**`, no `e2e/**`, no contracts, no `generated.ts` · ❌ do not touch or regenerate the six shipped E1 `tf-*.png` (the depot clerk is a NEW file derived from one, the source stays byte-intact) · ❌ no E7–E10 portraits (later rungs) · ❌ no aging pass on the other five E1 faces this batch.

One batch in flight (verified s1153: art queue empty, nothing running in the ART slot).

END: **READY-FOR-GATES** + the measured QA table (7 rows) + the LEDGER row + a one-line statement of whether the convention held or drifted.
