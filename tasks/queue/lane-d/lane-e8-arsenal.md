# Task lane-e8-arsenal: E8 arsenal per the storybook grid (LANE-D, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · lore/STORYBOOK.md §"THE ARSENAL" for E8 (THE ARSENAL, the four lines, E8 growth — vacuum edits everyone) (the era's named additions — the design IS the book; quote it in your report) · §"THE ARSENAL AND ITS MODIFICATION LINES" (E1 roots + THE CURE-ARMS LAW, ruled 2026-07-13: weapons FREE the Fevered and power down fevered machines — only the Baron's un-fevered machines take honest damage; nothing is ever killed) · the shipped E2 arsenal precedent (git log --grep="e2-arsenal" + its Balance block, entity files, and e2e spec — copy its architecture, never invent a parallel one) · src/game/Balance.ts · the weapon/turret entity families in src/entities/.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green before starting.

## Why (owner 2026-07-18: goal-tree review — the era arsenals are the largest ratified-but-unarmed content block; the storybook grid is canon law)
E8's additions: vacuum law — light-only weapons ('by E8's vacuum, light-only weapons will be the LAW'); WATCH: MAGNET GRAPPLE (yank enemies into each other — silent collision comedy) + lens turret + breach-patch SEAL kits (the wall you carry). Read the full E8 arsenal section for the FIRE/POWDER adaptations and implement as written.

## Scope — each item TESTABLE; era-gate by epoch activation (the era's items resolve/appear only at epoch-8-orbital+); ALL tunables in Balance.e8Arsenal; transform law: turret transforms keep the SAME silhouette height as every turret before them
1. THE MAGNET GRAPPLE — Watch command-arm weapon: pulls enemy units toward a point/each other (CombatSystem resolves collision stagger; no damage-to-humans law holds).
2. BREACH-PATCH SEALS — deployable instant-wall kit (BuildSystem legal paths; placement-limited via Balance).
3. THE LENS TURRET — Watch turret transform (light weapon, same silhouette).
4. FIRE/POWDER vacuum adaptations per the book (light-only law: assert in the spec that E8's new weapons emit no smoke/flame vfx class).
5
5. Spec e2e/e8-arsenal.spec.ts (GATE-AUTHORSHIP, both projects): each new item exists and is era-gated (absent before epoch-8-orbital, present at it) · THE CURE-ARMS ASSERTION (human-class enemies hit by the new weapons emit freed/turned-back events, never death; fevered machines power down) · zero console/page errors · the E2 arsenal + adjacent boss suites unmodified-green.
## Firewall: TOUCH-ONLY Balance.ts (e8Arsenal block), the weapon/turret/deployable entities you add, arsenal/loadout wiring points the E2 precedent already touched, your spec. NO CombatSystem law changes (it stays sole damage resolver — route everything through it), NO Economy writes, NO sim-timestep changes, NO touching other eras' arsenals.
## Self-check: tsc+build green · your spec both projects · adjacent suites green · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table (item → file → spec line).
