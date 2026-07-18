# Task lane-a-e6-boss-homemaker: THE HOMEMAKER-9000 — the boss that helps you to death (LANE-A, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; lore/STORYBOOK.md E6 §BOSS CHOREOGRAPHY — THE HOMEMAKER-9000 (RATIFIED: components VAC/RACK/CORE; Act 0 offscreen tidying dread; Act 1 unbuilds politely highest-HP first, never targets people; Act 2 curates loose pickups into piles, frantic; Act 3 CORE cracked → builds ONE CHAIR, sits, DONE, powers down — the first Fevered thing to finish wanting; the town keeps it); src/systems/DredgeQueenBossSystem.ts + src/systems/OldDiggerBossSystem.ts (the house patterns — component acts + the no-conventional-verb precedent); assets/pilots/homemaker-9000-3d/ (the banked model incl. the chair state — wire with placeholder fallback); assets/contracts/epoch-6-atomic (the glow-mesa arena); src/systems/DecaySystem.ts (E6 grammar — its timers may drive the RACK cadence); src/game/Balance.ts (add `homemaker`).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/m3 main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: grep HomemakerBossSystem in src/ — absent = BUILD IN FULL; present = STOP SHIPPED.

## Why: E6's boss — choreography ratified, model banked with the chair state, arena sculpted+wired, decay grammar merged. Inert until E6 arms (boss-flagged e6-glow-mesa runs; the DQ/Digger precedent).
## Scope
1. HomemakerBossSystem: Act 0 (pre-arrival: stockpile "tidied" markers — render-side dread); Act 1 VAC unbuilds player structures highest-HP-first via LEGAL build-system removal (parts-stack pickups refund per Balance), RACK suppresses with arcing toast (area denial, real damage to structures' zones, NEVER players); Act 2 (VAC broken): re-prioritizes LOOSE pickups into tidy piles (moves ground drops — infuriating, harmless), RACK escalates; Act 3 (CORE cracked): stops, builds THE CHAIR from debris (a placed prop), sits, DONE pictogram event, powers down → non-hostile persistent kept-machine (TileStateStore, the pen's warm ground — Digger precedent).
2. Component damage via CombatSystem's legal channels (sole-resolver law); model wiring with placeholder fallback; Balance.homemaker block.
3. Spec e2e/e6-boss-homemaker.spec.ts (GATE-AUTHORSHIP, both projects): act transitions on component breaks; NEVER-TARGETS-PEOPLE assertion (zero player-damage events across the full fight); Act 2 pile behavior observable; Act 3 chair + powered-down persistence across same-profile re-run; zero console; DQ + Digger-adjacent + task-025 unmodified-green.
## Firewall: new system + model wiring + Balance block + spec + ≤40-line contract/Game hook. NO wrangle system (separate slice), NO decay-framework changes, NO other bosses.
## Self-check: tsc+build green · spec green both projects · adjacents green · zero console · screenshots reviews/shots-homemaker/{act1-unbuild.png, act3-chair.png}.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + act evidence + the chair beat as landed.
