# Robin playtest 16 — 2026-09-02 (build 3df87c46 live; the Lantern Show of the winning Claim reel)

## His words, verbatim
"One thing I saw in the lantern run for the winning agent entry - the map is not displayed but only a schematic view of a grey area is shown. That is a bit disappointing. Also the agent never moves the hero but still sends the prospector to gold seams which are collected instantly. As a player, I can't do that. So the AI has an advantage here? That should not be the case. The laws for human and AI players have to be the same. People also say that reading what an AI output is not fun and not worth their time. So I will manually edit the announcement before publishing it."

## Findings
- **F-PT16-1 (BUG, verified, BLOCKING FOR THE BENCHMARK CLAIM):** `pan_at` grants a full pan tick instantly on arrival in both engines (`src/sim/HeadlessContractSim.ts:2171-2210`, `src/game/Game.ts:7465-7492`, invoked from `src/agent/StandingOrders.ts:353`). A HARVEST order pays travel but not time: 5 gold per order on arrival versus 5 gold per 1.5 seconds of channeling for a human hero. Ruling recorded as CAPABILITY-LADDER L7 THE SAME LAWS LAW. Corrective: `tasks/same-laws-harvest-parity.md` (lane-d), which bumps the engine era to 6 "the Same Laws"; era-5 rows retire to the almanac under the replayable-board law. Open sub-question inside the master: bodies parity (does a human plain boot field the Prospector companion the rider fields?).
- **F-PT16-2 (KNOWN-SCOPE → task):** the true reel names 'terrain layout' as a placeholder (`src/ui/TrueReelRenderer.ts:28`); the ground is deterministic from manifest + seed, so it can be drawn. Task: `tasks/lantern-true-terrain.md` (lane-c).
- **DECISION (owner):** the announcement will be hand-edited by the owner before publishing; the interview draft v2 and the launch facts are raw material only.

## Recommendation on publish timing (attended)
Fix F-PT16-1 and re-ride the field under era 6 BEFORE announcing: the announcement's central claim is "same door, same physics", and the boards it points to were earned with the surplus. A day of delay is cheaper than a retraction. Owner's call.
