# Task lane-c-e6-wrangle-verb: THE WRANGLE — win by patience (E6's gentlest weapon) (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/epoch-saga/e6-atomic-bundle.md §B + §C (the verb: feral appliances WIND DOWN if kited long enough — exhaust, then wrangle; captured appliances join the pen as economy bonuses; "you can win waves by patience"); lore/STORYBOOK.md E6 (the wrangler + the pen + the vaccine — the therapeutic half is now RULED canon: the pen keeps freed machines free); src/systems/DecaySystem.ts (wind-down timers ride the unified scheduler — the bundle's own law); src/systems/CombatSystem.ts (enemy lifecycle; the freed-walker grammar for the capture read); src/game/Balance.ts (add `wrangle`).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/e2-arsenal main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: grep -i wrangle in src/ — absent = BUILD; present = STOP SHIPPED.

## Why: E6's thesis mechanic ("the town that will one day refuse to destroy the Old Digger learns the habit here") — and its systems are all merged: the decay scheduler (wind-down), the store (the pen persists), the freed grammar (the capture read). Inert until E6 arms (machine-class enemies only, era-gated).
## Scope
1. WIND-DOWN: machine-class E6 enemies register decay timers (DecaySystem) that tick while the enemy is aggro'd-but-unhurt ("kited"); damage RESETS the wind-down (patience vs powder — the design tension); at zero: the enemy enters EXHAUSTED state (harmless, slow, capturable).
2. THE WRANGLE: a capture interaction on exhausted machines (proximity verb per house interaction patterns) → the machine is CAUGHT: removed from the wave legally, joins THE PEN (profile-persistent roster via TileStateStore; pen economy bonus per Balance — small steady trickle, Economy-legal single-writer).
3. THE PEN'S LAW (ruled canon): penned machines never re-feral — the roster only grows; expose pen contents via diagnostics for the future pen UI (render surface is a later slice).
4. Spec e2e/e6-wrangle.spec.ts (GATE-AUTHORSHIP, both projects, ?debug boss-free e6 boot): wind-down ticks only while unhurt (damage resets it — asserted); exhausted state reachable; capture removes-legally + pen roster grows + persists same-profile; economy trickle Economy-authored; zero console; task-025 + decay-framework spec unmodified-green.
## Firewall: new wrangle module + enemy-state additions for machine-class E6 variants + Balance + spec + ≤30-line hooks. NO Homemaker (its own lane task), NO pen UI, NO era-arming changes.
## Self-check: tsc+build green · spec green both projects · adjacents green · zero console · screenshot reviews/shots-wrangle/exhausted-capture.png.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the wind-down/damage-reset numbers + the pen roster shape.
