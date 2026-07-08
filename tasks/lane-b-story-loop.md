# Task story-loop: the player stays IN the world — run end → Return to Town → next contract (LANE-B, branch lane/m4, commit prefix "story:")

You are Codex, implementer for Gold Rush, on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; specs/town-v1 (T3's routing default + T6's merged menu-thinning); the run-end surfaces (Run Ledger overrun card, Claim Secured card, dawn victory); SS-01/02 beats; the board. Pre-flight: safe-dupe rule — JUDGE BY CONTENT per the s225 note pattern (reset stale-but-merged tips; STOP only on genuinely unmerged content). npm install; build green. SEQUENCING: after e2-enemies in this lane.

## OWNER ORDER (2026-07-09, verbatim)
"After a claim/contract is done there should be the option 'Return to town' which leads the user to town where they can start the next contract. The flow from story -> contract -> play -> story/town has to be setup and the story mode for the player has to be established and they have to stay captured in it."

## Scope
1. **Every run ending gets "Return to Town" as the PRIMARY button** (Claim Secured, overrun Run Ledger, dawn victory, Baron defeat): leads to the town square (board one step away). "Try Again"/"New Claim" remain secondary (the quick-loop stays for those who want it). Town entry after a run fires a RESULT-AWARE beat (tavernkeeper: secured → "The town heard. Drinks tonight."; overrun → "You're breathing. The claim can be re-staked." — data entries, once per return, result-keyed).
2. **The loop closes**: town → tavern board → contract (briefing card) → play → ending card → Return to Town → beat → board. No dead-ends into the start menu mid-loop; the menu remains reachable (Exit) but never forced.
3. **First-boot enters the loop**: new profile → founding naming → the Elder's welcome → the board glows (SS-01 pointer) — the story mode IS the default path from minute one.
4. e2e: the full circle on a seeded profile (town→launch→scripted secure→Return→beat fires→board open) + overrun variant + menu never force-shown mid-loop.

## Firewall
Touch ONLY: run-end button wiring/routing, result-keyed beat entries, the return transition, e2e. NO sim, NO board/briefing logic changes, NO removing existing quick-loop buttons.

## Self-check
tsc/build; the circle e2e both projects; town + board + run-end suites + m1-01 + m2-01 green; zero console errors; screenshots (ending card with Return primary, the result beat) into artifacts/story-loop/. Commit on lane/m4. End: READY-FOR-GATES + results.
