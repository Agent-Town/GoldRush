# Task lane-e7-arsenal: E7 arsenal per the storybook grid (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · lore/STORYBOOK.md §"THE ARSENAL" for E7 (THE ARSENAL, the four lines, E7 growth — every line grows toward agency) (the era's named additions — the design IS the book; quote it in your report) · §"THE ARSENAL AND ITS MODIFICATION LINES" (E1 roots + THE CURE-ARMS LAW, ruled 2026-07-13: weapons FREE the Fevered and power down fevered machines — only the Baron's un-fevered machines take honest damage; nothing is ever killed) · the shipped E2 arsenal precedent (git log --grep="e2-arsenal" + its Balance block, entity files, and e2e spec — copy its architecture, never invent a parallel one) · src/game/Balance.ts · the weapon/turret entity families in src/entities/.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green before starting.

## Why (owner 2026-07-18: goal-tree review — the era arsenals are the largest ratified-but-unarmed content block; the storybook grid is canon law)
E7's theme: agency — the mod line's ratified beat is the Spark Rig going PLAYBOOK-SLAVED ('the Echo can wield one'). Read the era's full arsenal section and implement its named additions exactly as written (agency-flavored: weapons that act on recorded/slaved behavior — the playbook engine PB-01/02 is merged and is your seam).

## Scope — each item TESTABLE; era-gate by epoch activation (the era's items resolve/appear only at epoch-7-signal+); ALL tunables in Balance.e7Arsenal; transform law: turret transforms keep the SAME silhouette height as every turret before them
1. PLAYBOOK-SLAVED SPARK RIG — a rig mod slot letting the agent/Echo entity wield a rig driven by the playbook engine (PB tape format; read src/playbook — consume, never modify).
2.-3. The era's other named line additions per the book's E7 arsenal section (enumerate them in your report with quotes; implement each as its line's grammar dictates: turret transform / deployable / hand weapon).
4
4. Spec e2e/e7-arsenal.spec.ts (GATE-AUTHORSHIP, both projects): each new item exists and is era-gated (absent before epoch-7-signal, present at it) · THE CURE-ARMS ASSERTION (human-class enemies hit by the new weapons emit freed/turned-back events, never death; fevered machines power down) · zero console/page errors · the E2 arsenal + adjacent boss suites unmodified-green.
## Firewall: TOUCH-ONLY Balance.ts (e7Arsenal block), the weapon/turret/deployable entities you add, arsenal/loadout wiring points the E2 precedent already touched, your spec. NO CombatSystem law changes (it stays sole damage resolver — route everything through it), NO Economy writes, NO sim-timestep changes, NO touching other eras' arsenals.
## Self-check: tsc+build green · your spec both projects · adjacent suites green · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table (item → file → spec line).
