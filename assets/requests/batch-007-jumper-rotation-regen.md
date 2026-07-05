# batch-007 — bandit FULL rotation sheet REGEN (scale-debt fix; supersedes batch-005R3's accepted sheet)

Why a regen: the accepted 005R3 sheet drew figures small in their cells — after shared-scale extraction the rotation figures land 296–331 px vs the live side-sheet walk cells at 409–439 px. The extractor NEVER upscales (cap 1.0, by design), and a ~1.36x runtime scale-up would read soft at gameplay zoom and add a permanent special case to SpriteAnimator. Fix at the source: same sheet, figures drawn to fill the cell. Pipeline law (STATUS s37): cross-sheet figure heights must match at direction seams.

Primary path: Codex built-in `image_gen` (pipeline v2) via `tasks/023-art-batch-007-jumper-rotation-regen.md`, reference-conditioned on the existing processed jumper art. Fallback: paste the prompt below into the Gold Rush sprite conversation on chatgpt.com.

Target: `assets/raw/char-jumper-sheet-rotation2.png` (NEW file — keep the 005R3 raw for history, mirroring the hero rotation→rotation2 precedent) → `--key ff00ff --grid 4x3` → replaces the 12 dormant rotation cells; contract layout unchanged (spec order, both side profiles explicit, no mirrors).

## Prompt (2–3 candidates; pick per QA gate below)

"Now the FULL walking rotation sheet for the BANDIT — the claim-jumper from the earlier bandit sheets in this conversation, all directions in ONE image for perfect consistency. 4 columns x 3 rows, twelve equal cells, NO borders, NO labels, NO text. Identical character, outfit, colors, proportions and IDENTICAL SCALE in every cell — same ledger engraving style; rust-red poncho, dusty hat pulled low, bandana over the face, grasping gloved hands, NO weapons. IMPORTANT: draw each figure LARGE — the figure fills 82 to 90 percent of its cell's height, feet near the cell bottom, hat near the cell top, in every single cell; no wide empty margins. High oblique three-quarter top-down angle. Cells, top row left to right, then middle row, then bottom row: (1) sneak-walking toward the viewer, left foot forward; (2) toward viewer, right foot forward; (3) toward viewer angled 45 degrees RIGHT (south-east), left foot forward; (4) south-east, right foot forward; (5) pure side profile facing RIGHT, left foot forward; (6) facing right, right foot forward; (7) pure side profile facing LEFT, left foot forward; (8) facing left, right foot forward; (9) walking away angled 45 degrees RIGHT (north-east), left foot forward; (10) north-east, right foot forward; (11) walking straight away from viewer, left foot forward; (12) sneaking crouch idle facing viewer. Background: perfectly flat solid uniform bright magenta hex #ff00ff, no gradients, no spill, no shadows on the background. Soft light from upper left."

## QA gate (reject a candidate on any failure; regenerate at most twice, then log and stop)

1. 12 cells, spec order exactly as numbered above; cells 5/6 face RIGHT, 7/8 face LEFT (both side profiles explicit — verify by pixels, not by prompt echo; the 005R3 first pass failed exactly here).
2. Figure bbox height ≥ 78% of cell height in EVERY cell (this is the reason for the regen — measure, don't eyeball).
3. Scale uniform across cells (bbox-height spread ≤ ~10%, gait bounce excepted per the s23 GAIT ruling).
4. Flat #ff00ff background, no spill/gradients/shadows on background; no text/borders/labels/watermarks.
5. Character match vs reference cells (processed `char-jumper-*` side/front/back cells): poncho, hat, bandana, gloves; NO weapons (brief §9.2 — grasping thief, never armed).
