# Task lane-b-e8-boss-salvage-claw: THE SALVAGE KING'S CLAW — the boss that descends in acts (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; lore/STORYBOOK.md E8 §BOSS CHOREOGRAPHY — THE SALVAGE KING'S CLAW (RATIFIED: components CROWN/WINCH/ANCHOR-FEET; Act 0 dread-is-PAPERWORK — small things vanish UPWARD between waves, claw-stamp tags left; Act 1 CROWN in orbit — debris rain on telegraphed arcs + grapple lines + corsairs rappel DOWN; Act 2 WINCH descends — lifts WHOLE BUILDINGS, break drums mid-lift to drop them back damaged-savable; Act 3 ANCHOR-FEET landed — committed, the siege inverts; warm quit: crew descends in good order, ONE bolt taken "for the ledger"; the carcass stays = the yard); src/systems/DredgeQueenBossSystem.ts + OldDiggerBossSystem.ts (house patterns); assets/pilots/salvage-claw-3d/ or landmarks path (the banked model + damage state; placeholder fallback); assets/contracts/epoch-8-orbital (the mare-claim arena); src/game/Balance.ts (add `salvageClaw`).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/m4 main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: grep SalvageClaw in src/systems/ — absent = BUILD; present = STOP SHIPPED.

## Why: E8's boss — the last unbuilt boss system in the saga (Echo needs none: your base replayed; Quiet is E10's preserve-fight, its own class). Choreography ratified, model banked, arena wired. Inert until E8 arms.
## Scope
1. SalvageClawBossSystem: Act 0 pre-fight theft ticks (small pickups/props vanish upward + printed tag markers — render+economy-legal); Act 1 orbital phase (crown untargetable overhead; telegraphed debris arcs; grapple lines with cuttable anchors; corsair rappel spawns); Act 2 the descent (winch in weapon range; BUILDING-LIFT: targeted structure rises on a visible line — breaking the drum drops it back DAMAGED-SAVABLE via legal channels; lifted-away = removed legally with salvage-tag event); Act 3 landed (feet targetable, crown dark, stationary siege); defeat = warm quit event chain (crew descent markers, the one-bolt beat as a ledger event) + THE CARCASS persists as a kept structure (TileStateStore — "kept so thoroughly it becomes a PLACE").
2. Components via CombatSystem legal channels; model wiring w/ placeholder fallback; Balance.salvageClaw.
3. Spec e2e/e8-boss-salvage-claw.spec.ts (GATE-AUTHORSHIP, both projects): act gating by component state; Act 2 lift-and-drop savable assertion; theft ticks legal (economy consistent); carcass persists same-profile re-run; zero player-targeting by the claw itself; zero console; adjacents (DQ, task-025) unmodified-green.
## Firewall: new system + wiring + Balance + spec + ≤40-line hooks. NO gravity/dome systems (separate era slices), NO other bosses.
## Self-check: tsc+build green · spec green both projects · adjacents green · zero console · screenshots reviews/shots-claw/{act1-rain.png, act2-lift.png, act3-landed.png}.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + act evidence + the carcass persistence shape.
