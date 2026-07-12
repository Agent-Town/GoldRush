# ui-era-dressing — the menus wear the era's art (and switch with it)
ROLE: UI presentation. WORKDIR: lane-a (worktrees/lane-a), after ceremony-epic-backgrounds (same technique family).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner 2026-07-12, verbatim): "the whole menu style is quite empty right now with lots of gradient filled space. That could also be an element that could be filled with epoche specific art. Then this artwork could even switch when different menu items from different epochs are selected e.g. the skill tree... I think these things really round out the game."
## READ-FIRST: the ceremony-epic-backgrounds master + its landed treatment (full-bleed + warm vignette; REUSE the helper) · assets/processed/kit-era-*.png · src/ui/menu/StartMenu.ts · src/town/TownScene.ts renderSchoolhouse (the era row — the chart already knows its selected era) · town board surfaces · 044 + town suites.
## SCOPE
1. StartMenu: the gradient void gains the ACTIVE era's key art (kit-era-N per activeEpochId), warm-dimmed under the wordmark; changes automatically when the player's era advances.
2. Schoolhouse chart: the backdrop follows the SELECTED era tab (Frontier page → E1 art, Steamworks → E2) — the owner's exact "switch when different menu items from different epochs are selected."
3. Board/catalog + Claim Ledger era page: same treatment where a surface is era-scoped.
4. Legibility law: text contrast preserved (the ceremony vignette overlay); LITE tier may skip backdrops (058 knobs); lazy-load, zero boot-weight change beyond the one active image.
5. e2e: menu shows era backdrop ref per active epoch; chart backdrop switches with the era tab; 044 + town suites unmodified-green.
## TOUCH-ONLY: StartMenu, TownScene surface renders, shared backdrop helper, css, one e2e, artifacts/.
## NO: sim, epoch data, ceremony files beyond reusing the helper, art generation.
## SELF-CHECK: tsc; build; 044 + 072 + town suites green BOTH projects; zero console; before/after shots of menu + chart both eras.
END: READY-FOR-GATES + the era-switch capture.
