# Task 017: Codex art pipeline PILOT (MAIN folder, new account, image_gen/gpt-image-2)
You are Codex with the image_gen skill. This run PROVES the direct art pipeline. NO code changes, NO git commits, NO edits outside assets/.
PROCESS per sheet (repeat for each):
1. Read the prompt + cell map from the batch file. 2. Call image_gen with that prompt; ATTACH REFERENCE IMAGES if the skill supports image input (consistency is the whole game): for the hero use assets/raw/char-hero-sheet-rotation.png + char-hero-sheet-front.png; for the bandit use assets/raw/char-jumper-sheet-rotation... (not yet existing) → use char-jumper-sheet-front.png + char-jumper-sheet-back.png. If references unsupported, proceed text-only and note it. 3. Save output DIRECTLY to the target path at the largest available square size. 4. OPEN AND INSPECT your own output (you are multimodal): verify grid dims, cell count, every cell matches its heading/stride in the map, same character/scale, uniform magenta, no text/borders. If a sheet fails QA: ONE regeneration attempt with corrective prompt notes, then move on and log it.
SHEETS (in order; stop gracefully if image_gen rate-limits, log what completed):
A. assets/requests/batch-005R2.md → assets/raw/char-hero-sheet-rotation2.png (4x2 hero completion)
B. assets/requests/batch-005R3-bandit-rotation.md → assets/raw/char-jumper-sheet-rotation.png (4x3 bandit full rotation)
C. (bonus if limits allow) assets/requests/batch-005B.md → the four bld-*.png portraits, gray-bg batch-001 style rules.
LOG: write assets/requests/codex-art-run-001.md — per sheet: model reported, references used yes/no, QA verdict per cell (map order), regenerations, limit events. End: ART-RUN-COMPLETE + file list.
