# Task lane-e5-arsenal: E5 arsenal per the storybook grid (LANE-A, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · lore/STORYBOOK.md §"THE ARSENAL" for E5 (THE ARSENAL, the four lines, E5 growth) (the era's named additions — the design IS the book; quote it in your report) · §"THE ARSENAL AND ITS MODIFICATION LINES" (E1 roots + THE CURE-ARMS LAW, ruled 2026-07-13: weapons FREE the Fevered and power down fevered machines — only the Baron's un-fevered machines take honest damage; nothing is ever killed) · the shipped E2 arsenal precedent (git log --grep="e2-arsenal" + its Balance block, entity files, and e2e spec — copy its architecture, never invent a parallel one) · src/game/Balance.ts · the weapon/turret entity families in src/entities/.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green before starting.

## Why (owner 2026-07-18: goal-tree review — the era arsenals are the largest ratified-but-unarmed content block; the storybook grid is canon law)
E5's additions per the book: FIRE pressure-sealed slot (the rig fires underwater), WATCH: HARPOON BALLISTA (deck-mount pivot turret transform) + depth-charge RACK, POWDER: DEPTH CHARGE LOBBER — with the canon joke made mechanical: the rack and the lobber share ONE munition across two schools.

## Scope — each item TESTABLE; era-gate by epoch activation (the era's items resolve/appear only at epoch-5-deepwater+); ALL tunables in Balance.e5Arsenal; transform law: turret transforms keep the SAME silhouette height as every turret before them
1. THE HARPOON BALLISTA — a Watch-line turret transform (pivot mount; same silhouette height law).
2. THE DEPTH-CHARGE RACK (watch deployable) + THE DEPTH CHARGE LOBBER (powder hand-weapon) sharing ONE munition item/stock in Balance (one-munition-two-schools, assert it in the spec).
3. FIRE line pressure-sealed mod slot: the Spark Rig keeps firing in E5 water tiles (where the map marks water/diving zones).
4
4. Spec e2e/e5-arsenal.spec.ts (GATE-AUTHORSHIP, both projects): each new item exists and is era-gated (absent before epoch-5-deepwater, present at it) · THE CURE-ARMS ASSERTION (human-class enemies hit by the new weapons emit freed/turned-back events, never death; fevered machines power down) · zero console/page errors · the E2 arsenal + adjacent boss suites unmodified-green.
## Firewall: TOUCH-ONLY Balance.ts (e5Arsenal block), the weapon/turret/deployable entities you add, arsenal/loadout wiring points the E2 precedent already touched, your spec. NO CombatSystem law changes (it stays sole damage resolver — route everything through it), NO Economy writes, NO sim-timestep changes, NO touching other eras' arsenals.
## Self-check: tsc+build green · your spec both projects · adjacent suites green · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table (item → file → spec line).
