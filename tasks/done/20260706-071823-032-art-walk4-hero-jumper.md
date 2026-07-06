# Task 032: 4-frame walk-cycle sheets — hero + claim jumper (ART slot, gpt-image-2)

You are Codex on Robin's Mac with the image_gen skill (gpt-image-2). Art pipeline v2 per CLAUDE.md §7 + assets/LEDGER.md header. Style anchor + canon: docs/GOLD_RUSH_BRIEF.md §4/§9 (Frontier Ledger, illustrated engraving, NEVER gory).

GOAL: replace 2-frame walk pairs with 4-frame gait cycles (contact→down→passing→up) so walks read ROUND (Robin directive 2026-07-06). Task 031 (already queued) makes the animator play N frames from the contract — your output needs NO code.

## Generations (4 total — sheet-per-hemisphere, in-image consistency law, NO mirrors: belt items must not swap hands; explicit cells only, Robin's standing directive)
For EACH character (hero, claim jumper), TWO sheets, grid 4 cols (gait phases L→R: contact, down, passing, up) x 4 rows (directions):
- sheet A rows top→bottom: s, se, e, ne
- sheet B rows top→bottom: n, nw, w, sw
Filenames (EXACT, direct to ABSOLUTE path /Users/robin/Claude/Projects/Gold Rush/assets/raw/):
- char-hero-sheet-walk4-a.png / char-hero-sheet-walk4-b.png
- char-jumper-sheet-walk4-a.png / char-jumper-sheet-walk4-b.png
Reference-condition every generation on the character's EXISTING processed cells (assets/processed/char-hero-sheet-rotation2-*.png / char-jumper-sheet-rotation-*.png) for identity lock: same outfit, same belt-side items, same palette. Flat #ff00ff background, no text/letters/watermarks, uniform cell sizes, figure heights consistent ACROSS the two sheets (s37 seam law) and matching the existing rotation-sheet band (state measured heights in your QA notes).

## Generator self-QA (per sheet, MEASURED, before writing the run file)
(1) 16 distinct cells, correct grid alignment; (2) row directions match the map above (spot-describe one cell per row); (3) gait phases distinct within each row (no duplicated poses); (4) belt/tool side consistent with reference cells per direction; (5) magenta pure enough for --key ff00ff extraction (no gradient halos). Reject + retry a sheet at most twice; if still failing, write the failure honestly.

## Deliverables
Raws at the exact paths above + run file assets/requests/codex-art-run-004.md (prompts used, retries, QA measurements per sheet, heights). Update assets/LEDGER.md: new queue entry (walk4, outranks decoration; behind nothing — Robin directive), slot rows PENDING-PROCESSING. DO NOT extract/process (fire-side: extract-alpha --key ff00ff --grid 4x4, scale-match, contract walk4 rows + activation) and DO NOT touch src/ or contracts. No commits.
