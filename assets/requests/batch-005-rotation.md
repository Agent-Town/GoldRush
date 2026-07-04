# GPT Image batch-005R — walk ROTATION sheets (Robin directive: full-direction sheets, GO 2026-07-04)

**Why:** two gap sources in current animation: (1) 4-orientation snap on 8-direction movement; (2) cross-sheet drift between separately-generated front/side/back. Fix: per-ACTION rotation sheets — all directions of one action in ONE image (in-image consistency), locomotion first. Actions (pan/build/aim/grab/flee) STAY on their existing coarse-orientation cells.

**Code half (queued as next lane rider, do not skip):** orientation resolver 4-way → 8-way from velocity angle with ~10° hysteresis at boundaries (boundary flicker reads as "gaps" as much as missing art); mirror table W/SW/NW ← E/SE/NE; rotation-sheet idles retire the s15 idle-seam deviation.

## PILOT: char-hero-sheet-rotation.png — 4 cols × 3 rows, 12 cells (BINDING cell map)

Directions in game terms: S = toward viewer/down-screen · N = away/up-screen · E = screen-right · SE/NE = diagonals. Mirrors at runtime: W←E, SW←SE, NW←NE.

| Cell | Content |
|---|---|
| r0c0 / r0c1 | S walk stride-A / stride-B (toward viewer) |
| r0c2 / r0c3 | SE walk stride-A / stride-B (toward viewer, angled right) |
| r1c0 / r1c1 | E walk stride-A / stride-B (pure side profile, facing right) |
| r1c2 / r1c3 | NE walk stride-A / stride-B (away, angled right) |
| r2c0 / r2c1 | N walk stride-A / stride-B (away from viewer) |
| r2c2 / r2c3 | idle standing S / idle standing N |

Extraction: `--key ff00ff --grid 4x3`. CRITICAL check before contract wiring: identical character SCALE across all 12 cells (one shared scale per sheet is already extractor law; verify bbox heights within ~8%).

Rollout after pilot passes at gameplay zoom: jumper walk-rotation (same map), then idle/hit rotations if still needed. Fallback if resolution lands soft (cells < ~300px): two half-rotation sheets, seam parked at E/NE.

## Status log
- Pilot prompt sent 2026-07-04 (s9e, same ChatGPT conversation).
- **GENERATED + DOWNLOADED 2026-07-04 (s9e). Title: "Adventurer sprite sheet in sepia tones" (rotation sheet, newest download). QA: PASS for pilot** — 12 cells present, uniform scale across cells (visual), magenta uniform, no text/borders, character consistent with all prior sheets. **ONE deviation: the middle-row side profiles face LEFT, not right → contract labels them W (walk + both strides) and the mirror table produces E/SE→? NO — only the pure-side pair flips: mirror E←W; SE/NE rows face as specced.** Minor interior magenta glints near lantern in 2-3 cells — s15's `--interior-key` clear handles these; verify in extraction contact sheet.
- Robin mover (single file): `mv "$(ls -t ~/Downloads/ChatGPT\ Image*.png | head -1)" "/Users/robin/Claude/Projects/Gold Rush/assets/raw/char-hero-sheet-rotation.png"`
- Next (processing session): extract `--key ff00ff --grid 4x3`, verify bbox-height spread ≤8%, wire 8-dir contract with corrected mirror table (E←W for the side pair), THEN the code rider: 8-way resolver + ~10° hysteresis (queue as tasks/006 rider or standalone after 005 integrates). Jumper rotation sheet generates only after this pilot passes at gameplay zoom.
