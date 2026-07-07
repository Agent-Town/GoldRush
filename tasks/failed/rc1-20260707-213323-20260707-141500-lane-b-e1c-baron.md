# Task e1c-baron: THE CLAIM-JUMPER BARON — E1's graduation contract, C6 (LANE-B, branch lane/m4, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; **specs/e1-contracts/README.md §C6 (BINDING — the twist, the taunt schedule, the defeat beat, canon laws)**; the `?contract=` loader; Enemy/CombatSystem (elite = stat block + banner attachment — CombatSystem stays the SOLE damage resolver, no special-case damage paths); batch-011 Baron art (char-baron-sheet-walk4-a/b + prop-baron-banner — use processed if available, else scale-tinted jumper placeholder per placeholder-first law); ledger-voice copy patterns. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after town-T3 in this lane's queue (the board renders his locked card meanwhile — metadata ships in this task's manifest either way).

## Scope (per spec §C6 — a named enemy, warm-melodrama, never gory)
1. Contract manifest `e1-baron`: standard claim tile, +15% wave cadence, unlock = frontier science tree COMPLETE (the owner already qualifies — he reached the ceiling honestly at wave 41).
2. Ledger taunts at waves 5/12/18 (spec copy verbatim: "The Baron sends his regards. The claim won't hold.").
3. WAVE 20 — THE BARON: elite claim-jumper (HP ×40, speed ×0.8, scale ×1.4, escort squad per manifest), banner attachment (world-anchored, object-frame law), standard weapons hurt him (assert: no damage special-casing).
4. Defeat beat: "Dragged off by his own men, swearing revenge." → ceremony line + DOUBLE science payout + per-profile `baronBeaten` medal (board card shows it). Loss to him = normal overrun copy.
5. E2 foreshadow line in the medal blurb ("He'll be back — with machines.") — data only.

## Firewall
Touch ONLY: contract manifest, elite-variant support in Enemy (stat block + attachment — additive), taunt/beat copy wiring, medal persistence (per-profile, additive), e2e, artifacts. NO changes to: CombatSystem damage paths (elite uses existing resolution), wave scheduler structure (cadence = existing knob), default claim, other contracts.

## Self-check
tsc/build; new `e2e/e1-baron.spec.ts` per the spec's gates (locked until science-complete (seeded both states) · taunts at 5/12/18 · Baron spawns wave 20 with stats+banner · standard damage kills him · defeat beat + double payout + medal persists · loss = normal overrun · seeded determinism) both projects; default-boot + e1-dry-gulch + m1-01 + m2-01 regression green both projects; zero console errors; screenshots (the Baron mid-march with banner, the medal card) into artifacts/e1-baron/. Commit on lane/m4. End: READY-FOR-GATES + results.
