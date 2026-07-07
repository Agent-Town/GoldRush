# Task agent-actions-integrity: every promised agent function WORKS, or cannot be promised (LANE-B, branch lane/m4, commit prefix "m4:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; docs/playtests/2026-07-07-robin-playtest-02.md (eleventh wave — owner findings); src/agent/ToolSurface.ts:127 (`game.repair?.(building)` — the silent-no-op seam) + AgentStub/behaviors (XP collect = the working reference); src/game/Game.ts:886 (prospector.update — pause-gating context at ~1634 togglePause) + the m2-05 repair machinery (repair-ring, proportional costs from 013) + GoldPickupPool (Game.ts:145). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after town-T1 in this lane's queue.

## Owner findings (2026-07-07 ~17:20, live play — VERIFIED in code)
1. "If I press P to stop the game, the bot does not stop. It can still act." — prospector.update not pause-gated.
2. "The automated repair does not work" — VERIFIED: Game exposes NO `repair` facade; ToolSurface's optional call no-ops silently even when the rung permits and the toggle is on.
3. "Automated collection of gold also does not work" — VERIFIED: no collect-gold seam; only XP-mote collection was ever wired ("XP collection works great though").

## The law this task establishes (BT-01 do-nothing-tier lesson, agent edition)
**A panel function that cannot act must be impossible to offer.** The panel renders ONLY functions the ToolSurface actually implements (registry-driven — a function without a wired seam cannot appear as a toggle); every offered function must prove its effect in e2e.

## Scope
1. **Pause-gate the agent completely**: while `state.isPaused`, the Prospector performs NO actions, movement, targeting, or collection (idle hover animation may continue — render-only). Applies to both player-pause (P) and any overlay pause.
2. **Wire REPAIR end-to-end**: Game facade `repair(building)` → the existing m2-05/013 repair path (proportional gold cost via Economy — sole-writer law; same cost the player pays). Agent behavior: when toggled + rung permits, prioritize damaged buildings within patrol range, dwell like the player's repair ring, receipt logged ("Mended the north palisade — 6g"). Rung law unchanged (side-effect → rung ≥1); rung-blocked shows the existing lock line.
3. **Wire GOLD COLLECTION end-to-end**: agent collects GoldPickups within patrol range when toggled (mirror the working XP-mote behavior; Economy credit via the normal pickup path; actor-tagged for the M4-08 attribution split).
4. **The registry guard**: panel toggles derive from a capability registry populated ONLY by implemented ToolSurface functions; a seam returning undefined = function absent from the panel (compile-time typed, not runtime-optional). Diagnostics: per-function lastActionAt timestamp.
5. **Generic effect e2e**: for EVERY offered function — seed the situation, grant the rung, toggle on, assert the measurable effect (repair: HP rises + gold spent + receipt; gold: pickup collected + attribution; XP: existing) AND assert pause freezes all of them mid-act.

## Firewall
Touch ONLY: agent behaviors/ToolSurface/capability registry, Game facade additions (repair/collect seams — thin delegates to EXISTING systems), panel toggle source, e2e, artifacts. NO changes to: repair costs/Balance values, Economy internals, CombatSystem, pause semantics for the rest of the game, M4-08 attribution math.

## Self-check
tsc/build; new `e2e/m4-10-agent-actions-integrity.spec.ts` per scope-5 (all functions + pause-freeze) both projects; m4-05/06/07/08/09 + m1-01 + m2-01 + m2-05 unmodified green both projects; zero console errors; screenshots (agent mid-repair with receipt, panel with only-real functions) into artifacts/m4-10/. Commit on lane/m4. End: READY-FOR-GATES + which seams were wired + results.
