# Task 071-skyrocket-capture-gate: the Sky-Rocket science is CAPTURED from the Baron, not researched past him (MAIN slot; commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=medium
FROM **F-SOL-PRODUCT-001 [P1]** (`reviews/sol-findings-product-content-accessibility.md` — read FIRST): `ResearchTree.ts:151-157` names the node "Captured Baron science" but gates it on `powder_math` only; the capture story beat (`story/beats.ts:149-154`) listens for `science-complete` + a capture flag that nothing sets — while the Baron defeat (`Game.ts:2858-2877`) emits `boss-defeat`. CANON (lore/characters.md, ratified): beating the Baron captures the sky-rocket science into E2 — "pride's tuition." The code contradicts the story.
Pre-flight: main-slot tracked-clean (artifacts/logs/docs/tasks exempt).

## Scope
1. The Sky-Rocket Battery node requires the BARON CAPTURE in addition to `powder_math`: defeat sets a persisted capture flag (additive profile key or the existing medal), the research tree's availability check reads it, the node's locked text says what the player must do IN-WORLD ("the Baron still holds this science").
2. The capture beat fires on the REAL signal (`boss-defeat` → capture flag → beat), once, and the 060 unlock-reveal card frames it as captured science.
3. Save-compat: existing profiles that ALREADY banked the node keep it (no regression for veterans); existing profiles with a Baron medal get the flag derived on load.
4. e2e: fresh profile — node locked pre-Baron with the in-world line; defeat → flag → node available → beat fires once; veteran-profile migration asserted; determinism hash untouched (meta-side only).

## Firewall
Touch ONLY: the research node requirement + its locked text, the capture flag write/read, the beat wiring, migration shim, its e2e. **NO other research nodes, NO Balance values, NO Baron fight changes, NO sim.**
End: **READY-FOR-GATES** + the fresh-profile flow screenshots.
