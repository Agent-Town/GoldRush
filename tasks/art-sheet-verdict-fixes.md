# Task art-sheet-verdict-fixes: three owner sheet verdicts, fixed (ART slot)
CODEX: model=gpt-5.6-sol effort=medium
OWNER VERDICTS 2026-07-11 (verbatim). IMAGE LAW applies (stills native-only; higgsfield = seedance video only).
## 1. TAVERNKEEPER — "two left animation rows, no right animation row"
Compositing bug: the walk8 sheet duplicated the LEFT row into the RIGHT slot. Do NOT regenerate: the selected right-walk take exists in `assets/motion-pilot/production-tavernkeeper/` evidence — re-extract the RIGHT row from it and rebuild the sheet (rows down/left/right/up, verify each row's facing before compositing; add a per-row facing check to the run note).
## 2. YOUNGSTER-M — "lamp position not consistent for left and right walk"
Asymmetry violation: pin the lamp/lantern side ONCE from `turn-youngster-m.png` (state it in the note); inspect the selected takes — if a take shows the lamp on the wrong side, REGENERATE that direction (seedance, best-of-3, the explicit per-direction side clause per the v3 pattern) and rebuild the sheet.
## 3. HERO v4 — THE BELT-PAN (canon updated in lore/characters.md): "one side pan... can be at the belt, not in the hand"
Regenerate her 4 direction stills (NATIVE image_gen, conditioned on turn-hero-e1-outfit + turn-hero-base): the brass pan HANGS AT HER RIGHT BELT/HIP in every view (visible right profile+front+back at the hip; edge-on in left profile), BOTH HANDS FREE. Then seedance walk videos per direction (best-of-3, the belt-pan clause verbatim in every prompt), extract, rebuild `char-hero-sheet-walk8.png` → evidence `production-hero-v4/`. Update the replacement package's female stills to belt-pan in the same pass (the *-f idle/action set: pan at belt).
QA all three: identity · pinned sides · per-row facing · footline · no mirrors. LEDGER + credit log (floor 1200). Firewall: these assets + LEDGER + notes ONLY.
End: READY-FOR-GATES + three contact sheets + the facing/side tables.
