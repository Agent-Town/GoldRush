# TASK: THE EIGHT WINDS — every walker gains the four diagonals
OWNER DIRECTIVE (2026-07-28, verbatim): "can we extend the walking animations from four directions to 8 to also cover the diagonal directions? I think that will add to the quality of the game. Can you task Opus 5 to work with GPT Image 2.0 and the existing animation sheets to extend them? It is fine to extend the number. We have tokens."

You are a dedicated Opus 5 session (effort max) in /Users/robin/Claude/Projects/gr-task-anim-pass, branch anim/opus5-pass. SOLO-WRITER LAW. PUSH AT EVERY MILESTONE. Honest partials are valid deliveries.

READ FIRST: reviews/anim-pass-2026-07-25.md (incl. the M3 tail section your predecessor just wrote) · scripts/anim-pass-*.mjs (proven graft/QA tooling) · assets/layer-contracts/characters.v2.json (current binding geometry — READ-ONLY) · scripts/extract-alpha.mjs · scripts/cast-sheets.sh · assets/LEDGER.md conventions.

THE CONVENTION (new, sibling-first — existing sheets are NEVER modified):
- Per character, a NEW sibling sheet `char-<name>-sheet-walkdiag<F>-<suffix>.png`: 4 rows = down-left / down-right / up-left / up-right (row order EXACTLY that), F frames per row MATCHING the character's base sheet frame count. #ff00ff key, same cell geometry as the base sheet, NO mirrored-row cheats (a left-down walker is not a flipped right-down walker: lighting and asymmetric props must track).
- Source truth: the character's EXISTING rows are the style/identity anchor — same figure, same palette, same stride cadence, seen from the diagonal. Use gpt-image-2 via `codex exec -m gpt-5.6-sol` (headless image arm, owner-granted): one grid per generation, exact filename, style-anchor sentence, measured self-QA per sheet (heights vs the base sheet's bands, key purity, no letters, frame distinctness).
- WHERE THE BASE SHEET IS 4-FRAME: generate the diagonal rows at 8 frames if craft allows ("fine to extend the number") and note it; never fewer than the base.
ORDER: 1) the LIVE-BOUND town cast + the hero four ages + the Partner (E1-visible quality first) · 2) enemies with walk sheets · 3) later-era rosters E2→E10.
PER MILESTONE: extract-alpha where the pipeline demands · cast-sheets regen (--all) · LEDGER row + run file per batch · append THE EIGHT WINDS section to the review (sheet → status → evidence).
TERRITORY: assets/raw/char-*.png + assets/processed cells + the review + LEDGER + cast-sheets regen. NO src/, NO layer-contract edits — instead DELIVER `reviews/eight-winds-wiring-spec.md`: the precise per-character wiring notes (sheet name, rows, frames, anything a code slice needs to bind 8-way facing without re-deriving). The code slice is a separate lane task; your spec is its READ-FIRST.
