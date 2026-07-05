# Task 023 — Art run: batch-007 jumper rotation-sheet REGEN (image_gen)

Goal: regenerate the claim-jumper full-rotation sheet with figures drawn to fill their cells, fixing the scale debt that keeps the jumper `rotations` contract block dormant (LEDGER slot row "char.claim_jumper SHEET full-ROTATION 4x3").

Mode: Codex built-in `image_gen` (gpt-image-2), one sheet, 2–3 candidates. This is an ART task — do NOT touch src/, e2e/, contracts, or processed assets.

## Steps

1. Read `assets/requests/batch-007-jumper-rotation-regen.md` fully — prompt, cell map, and QA gate live there and are binding.
2. Reference-condition on the existing processed jumper art for character consistency: `assets/processed/` cells for char.claim_jumper (side 2x2, front/back 3x2) — match outfit, palette, engraving style, and the SIDE sheet's figure-to-cell proportion.
3. Generate candidates; run the QA gate from the request file against each (pixel-verify side-profile facing per cell — the 005R3 first pass shipped reversed side pairs; measure figure bbox height ≥78% of cell height in every cell).
4. Save the winning candidate EXACTLY as `assets/raw/char-jumper-sheet-rotation2.png`. Do not overwrite `char-jumper-sheet-rotation.png` (history).
5. Write the run log as `assets/requests/codex-art-run-003.md` in the run-002 format: reference conditioning used, per-candidate QA verdicts incl. measured bbox-height percentages per cell, regeneration count, limit events if any.

## Acceptance

- `assets/raw/char-jumper-sheet-rotation2.png` exists and passes ALL five QA-gate checks in the request file.
- `assets/requests/codex-art-run-003.md` written with measured evidence (numbers, not adjectives).
- Nothing else in the repo modified.

Do not touch: src/, e2e/, specs/, assets/processed/, assets/layer-contracts/, STATUS.md, LEDGER (the orchestrator updates LEDGER at processing time).
