# Task lane-e6-arsenal: E6 arsenal per the storybook grid (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · lore/STORYBOOK.md §"THE ARSENAL" for E6 (THE ARSENAL, the four lines, E6 growth) (the era's named additions — the design IS the book; quote it in your report) · §"THE ARSENAL AND ITS MODIFICATION LINES" (E1 roots + THE CURE-ARMS LAW, ruled 2026-07-13: weapons FREE the Fevered and power down fevered machines — only the Baron's un-fevered machines take honest damage; nothing is ever killed) · the shipped E2 arsenal precedent (git log --grep="e2-arsenal" + its Balance block, entity files, and e2e spec — copy its architecture, never invent a parallel one) · src/game/Balance.ts · the weapon/turret entity families in src/entities/.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green before starting.

## Why (owner 2026-07-18: goal-tree review — the era arsenals are the largest ratified-but-unarmed content block; the storybook grid is canon law)
E6's additions: FIRE: SUNLINE BEAM (focused light; mirror crown on the rig — 'fire is learning to be LIGHT'), WATCH: sunline mount (turret transform, mirror head tracks) + HALF-LIFE CALTROPS (denial that DECAYS on a visible dial — the first defense with an honest expiration), POWDER: the tongs-thrown variant (atomic satire: kitchen-tool delivery, genuinely good numbers).

## Scope — each item TESTABLE; era-gate by epoch activation (the era's items resolve/appear only at epoch-6-atomic+); ALL tunables in Balance.e6Arsenal; transform law: turret transforms keep the SAME silhouette height as every turret before them
1. THE SUNLINE BEAM — Fire-line beam weapon (light, not flame; no smoke ever).
2. THE SUNLINE MOUNT — Watch turret transform (same silhouette; tracking mirror head).
3. HALF-LIFE CALTROPS — field-arm deployable with a VISIBLE decay dial (DecaySystem is the scheduler precedent) — slows/denies, expires honestly.
4. THE TONGS-THROWN VARIANT — powder weapon, underhand arc, strong numbers (comedy in presentation, not in Balance).
5
5. Spec e2e/e6-arsenal.spec.ts (GATE-AUTHORSHIP, both projects): each new item exists and is era-gated (absent before epoch-6-atomic, present at it) · THE CURE-ARMS ASSERTION (human-class enemies hit by the new weapons emit freed/turned-back events, never death; fevered machines power down) · zero console/page errors · the E2 arsenal + adjacent boss suites unmodified-green.
## Firewall: TOUCH-ONLY Balance.ts (e6Arsenal block), the weapon/turret/deployable entities you add, arsenal/loadout wiring points the E2 precedent already touched, your spec. NO CombatSystem law changes (it stays sole damage resolver — route everything through it), NO Economy writes, NO sim-timestep changes, NO touching other eras' arsenals.
## Self-check: tsc+build green · your spec both projects · adjacent suites green · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table (item → file → spec line).
