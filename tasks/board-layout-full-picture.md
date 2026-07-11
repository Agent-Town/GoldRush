# board-layout-full-picture — the contract board shows the whole picture; MP controls fold away
ROLE: UI implementer. WORKDIR: lane-b (worktrees/lane-b).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner playtest 2026-07-11, verbatim): "The layout of the Contract board is unfortunate as it does not allow to see the full picture of the contract board. The multiplayer options can be in a drop down or slide out part or something."
The tavern board's catalog page currently spends vertical space on the Ride Together / multiplayer block, and the contract plate + goals + best-result line don't fit one view (desktop OR 390px). The owner wants: one glance = the full contract picture.

## READ-FIRST
- src/town/TownScene.ts (renderContractCard, board markup, pageIndex/dots/swipe — town-t3 + catalog conventions)
- src/town/town.css (board layout blocks)
- e2e/town-t3-board.spec.ts (the board's contract — keep every assertion green; extend, don't rewrite)
- The catalog laws: plate art per contract, swipe + dots + page memory, locked pages tease-only (mystery law).

## SCOPE
1. Fold multiplayer into a collapsed disclosure on the board ("Ride Together" chip → expands to word entry/host controls; collapsed by default; state remembered per session). No MP functionality changes — pure relocation.
2. Rebalance the contract card so plate + name + tags + goals teaser + best-result line ("Secured — wave N — G gold" / "No result yet") fit ONE view desktop and 390px (the just-shipped per-contract score retention feeds the best line — verify Dry Gulch best shows after a win).
3. Keep swipe/dots/page-memory intact.
4. New/extended e2e: full-picture assertions (card content visible without scroll at both viewports; MP collapsed by default, expands, works) both projects.

## TOUCH-ONLY: src/town/TownScene.ts (board render + handlers), src/town/town.css, e2e/town-t3-board.spec.ts additions or one new spec, artifacts/.
## NO: MP protocol/LockstepClient, contract data/manifests, run scene, StartMenu, Scoreboard.ts.
## SELF-CHECK: tsc; build; town-t3-board full suite green BOTH projects incl. 390px; new assertions green; town-t1/t2/t4/t5/t6 unmodified-green; zero console; screenshots desktop+390px in artifacts/board-full-picture/.
END: READY-FOR-GATES + before/after screenshots + one line on what moved where.
