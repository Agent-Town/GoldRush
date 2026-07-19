# Task art-batch-roster-e10: enemy sprite sheets, E10 — Deep Sky / The Static (ART SLOT)

You are Codex with image_gen, running in the ART slot.
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: specs/enemy-rosters-e6-e10.md §E10 (THE DESIGN — each row's visual brief, height band, and citation are binding) · assets/raw/char-bandit-base-sheet-walk8.png + char-hero-sheet-walk4-a.png (THE SHEET CONVENTIONS: #ff00ff key, grid cells, walk cycles, NO mirrored frames) · assets/LEDGER.md header laws.

## Why (owner 2026-07-20: the era rosters' art — the sheets are designed, the sprites don't exist; era maps still field E1 bandits)
## The batch — per the design sheet's E10 rows (skip any enemy whose id matches a SHIPPED boss system — bosses have models):
For EACH roster enemy: ONE sprite sheet `char-e10-<enemy_id>-sheet-walk8.png` — 8-frame walk cycle grid (2 rows × 4 cols, #ff00ff background, cell size matching the bandit sheet's proportions scaled to the row's HEIGHT BAND), facing right, era palette per the visual brief, NO letters, NO mirrors, warm never gory. Plus one still `plate-e10-enemy-<enemy_id>.png` ONLY where no plate exists yet (check assets/raw/).
Style-anchor sentence verbatim in every prompt: "Gold Rush house sprite: engraved-warm frontier illustration, clean silhouette at gameplay zoom, #ff00ff flat background, no letters, no gore."
Self-QA per sheet (MEASURED): grid regularity · key purity (no anti-alias halos into ff00ff) · height vs the bandit sheet per the band (state the pixel ratio) · silhouette readable at 25% scale · frames distinct (no duplicates/mirrors).
LEDGER entry + run file per house law. NO extraction (fire/attended runs extract-alpha).
END: READY-FOR-GATES + per-sheet QA table.
