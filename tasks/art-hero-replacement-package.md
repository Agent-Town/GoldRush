# Task art-hero-replacement-package: EVERYTHING female-hero, staged for the flip (ART slot)
CODEX: model=gpt-5.6-sol effort=high
FROM `reviews/sol-findings-character-orientation.md` + `docs/CHARACTER-MAP.md` (READ FIRST — the full inventory of male-hero-depicting runtime assets and the v3 provenance trail). OWNER GATE: the walk-flip itself waits for the owner's pan verdict on `assets/motion-pilot/production-hero-v3/contact-sheets/` — THIS TASK PREPARES EVERYTHING ELSE so the flip is one data change.
## Scope
1. **Restore the true v3 sheet**: the raw `char-hero-sheet-walk8.png` currently holds a rejected mixed-identity rebuild — `mv` it to `char-hero-sheet-walk8-rejected-mixed.png` and restore the correct v3 output from the production-hero-v3 evidence (CHARACTER-MAP names the surviving source). LEDGER the provenance.
2. **Inventory + regenerate every OTHER male-hero runtime asset** (per the map: idle/action/portrait/death frames, hero-homesteader.png uses, key-art-derived sprites): generate female replacements via gpt-image-2, conditioned on `turn-hero-e1-outfit.png` + `turn-hero-base.png` (identity law: young woman, braid, teal charm; satchel-left + pan-hand pinned per the v3 run note). Same grids/cells/dimensions as the assets they replace — drop-in geometry. NEW files (`*-f.png` suffix), originals untouched.
3. **Process to sheets/cells** (extract-alpha, same bands) so the entire female set sits ready in processed form.
4. **The FLIP STAYS DARK**: no registry/src changes — deliver a one-paragraph FLIP PLAN in the run note (exact registry keys to swap, in one commit, when the owner passes the pan verdict).
QA: identity every frame (female, braid, charm) · pinned sides · geometry matches the replaced asset exactly · minors-clothed N/A · no letters. LEDGER rows + note. ≤2 retakes each.
Firewall: assets/raw/ new *-f files + the rejected-sheet rename + processed cells + LEDGER + note. **NO src/, NO registry edits, NO deletion of any male asset (supersede-by-suffix only).**
End: READY-FOR-GATES + the inventory table (asset → replacement → ready?) + the flip plan.
