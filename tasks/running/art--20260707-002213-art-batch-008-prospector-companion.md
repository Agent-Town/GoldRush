# Task art-batch-008: the Prospector's body — companion sprite sheets + portrait (ART slot, gpt-image-2)

You are Codex on Robin's Mac with the image_gen skill (gpt-image-2). Art pipeline v2 per CLAUDE.md §7 + assets/LEDGER.md header. Style anchor + canon: docs/GOLD_RUSH_BRIEF.md §4/§9 (Frontier Ledger, illustrated engraving, NEVER gory) + docs/decisions/ADR-001 (frontier-tech: brass/steam craft with agent-tech TEAL glow for active systems; NO firearms ever).

GOAL: the player's AI agent — canon name "the Prospector" (§9.4) — is getting a visible companion body (lane-b m4-re-land ships a procedural placeholder + DORMANT contract slot). This batch generates its real illustrated form. Character design (owner-approved direction: "Robot buddy"): a SMALL HOVERING AUTOMATON assistant — round brass-and-copper lantern-like body, warm teal agent-glow core seam, tiny articulated arms (one holding a small prospector's pan), a hint of a miner's-cap silhouette; charming and warm, engraved-illustration shading, NOT photoreal, NOT gory, no weapons. It hovers (no legs, no walk cycle — hover-bob phases instead). Height ~70% of the hero's figure band (measure against assets/processed/char-hero-sheet-rotation2-*.png cells and state the measured band in QA notes).

## Generations (3 total — sheet-per-hemisphere, in-image consistency law, NO mirrors: the pan arm must not swap sides; explicit cells only, Robin's standing directive)
TWO hover sheets, grid 4 cols (hover-bob phases L→R: low, mid-rise, high, mid-fall) x 4 rows (directions):
- sheet A rows top→bottom: s, se, e, ne
- sheet B rows top→bottom: n, nw, w, sw
ONE portrait (single image, bust/three-quarter, same character, parchment-tone background per the townsfolk-portrait style of assets/raw/townsfolk-*.png) for the HUD permission chip + bench/UI use.
Filenames (EXACT, direct to ABSOLUTE path /Users/robin/Claude/Projects/Gold Rush/assets/raw/):
- char-prospector-sheet-hover4-a.png / char-prospector-sheet-hover4-b.png
- char-prospector-portrait.png
Sheets: flat #ff00ff background, no text/letters/watermarks, uniform cell sizes, figure heights consistent ACROSS both sheets (s37 seam law). Portrait: follow the existing townsfolk portrait framing. Reference-condition sheet B and the portrait on your own accepted sheet A cells for identity lock (same body, same pan side, same glow tone).

## Generator self-QA (per sheet, MEASURED, before writing the run file)
(1) 16 distinct cells, correct grid alignment; (2) row directions match the map (spot-describe one cell per row); (3) hover phases distinct within each row (vertical offset + glow pulse read as a cycle); (4) pan-arm side consistent per direction across sheets; (5) magenta pure enough for --key ff00ff extraction (no gradient halos); (6) teal glow reads at gameplay scale (describe cell at 25% zoom). Reject + retry a sheet at most twice; if still failing, write the failure honestly.

## Deliverables
Raws at the exact paths above + run file assets/requests/codex-art-run-005.md (prompts used, retries, QA measurements, height band). Update assets/LEDGER.md: batch-008 queue entry (Prospector body — outranks decoration, pairs with lane-b m4-re-land), slot rows PENDING-PROCESSING (contract slot name: char-prospector-agent, characters.v2.json — row exists DORMANT after m4-re-land merges). DO NOT extract/process (fire-side: extract-alpha --key ff00ff --grid 4x4, scale-match, contract rows + activation) and DO NOT touch src/ or contracts. No commits.
