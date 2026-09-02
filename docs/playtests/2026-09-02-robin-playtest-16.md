# Robin playtest 16 — 2026-09-02 (build 3df87c46 live; the Lantern Show of the winning Claim reel)

## His words, verbatim
"One thing I saw in the lantern run for the winning agent entry - the map is not displayed but only a schematic view of a grey area is shown. That is a bit disappointing. Also the agent never moves the hero but still sends the prospector to gold seams which are collected instantly. As a player, I can't do that. So the AI has an advantage here? That should not be the case. The laws for human and AI players have to be the same. People also say that reading what an AI output is not fun and not worth their time. So I will manually edit the announcement before publishing it."

## Findings
- **F-PT16-1 (BUG, verified, BLOCKING FOR THE BENCHMARK CLAIM):** `pan_at` grants a full pan tick instantly on arrival in both engines (`src/sim/HeadlessContractSim.ts:2171-2210`, `src/game/Game.ts:7465-7492`, invoked from `src/agent/StandingOrders.ts:353`). A HARVEST order pays travel but not time: 5 gold per order on arrival versus 5 gold per 1.5 seconds of channeling for a human hero. Ruling recorded as CAPABILITY-LADDER L7 THE SAME LAWS LAW. Corrective: `tasks/same-laws-harvest-parity.md` (lane-d). SEE THE SECOND RULING BELOW: the cure is human-side, no era bump. Open sub-question inside the master: bodies parity (does a human plain boot field the Prospector companion the rider fields?).
- **F-PT16-2 (KNOWN-SCOPE → task):** the true reel names 'terrain layout' as a placeholder (`src/ui/TrueReelRenderer.ts:28`); the ground is deterministic from manifest + seed, so it can be drawn. Task: `tasks/lantern-true-terrain.md` (lane-c).
- **DECISION (owner):** the announcement will be hand-edited by the owner before publishing; the interview draft v2 and the launch facts are raw material only.

## Second ruling, same hour (owner, verbatim)
"It is ok that the Prospector can do that - it just has to work for the human, too."
Consequence: the Prospector's power stands; the cure moves to the HUMAN side (a player command that dispatches the Prospector through the same `pan_at`, recorded in the human tape). NO era bump; boards stand. The first dispatch of the corrective (which would have stripped the tick and bumped the era) was stopped at rc143 before it edited anything; the master was rewritten and re-queued.

## Recommendation on publish timing (attended, revised)
With no era bump and no retirement, publishing need not wait for the human-side command; land it in the first days after so the "same laws" sentence is fully true for players. Owner's call.
Fix F-PT16-1 and re-ride the field under era 6 BEFORE announcing: the announcement's central claim is "same door, same physics", and the boards it points to were earned with the surplus. A day of delay is cheaper than a retraction. Owner's call.

## Outcome (2026-09-02, attended)
Both findings shipped and deployed the same day: F-PT16-2 as `c1084e547` (+ the lantern_post mapping `4c4b0a9a2`), F-PT16-1 as `9e5d0636d`, live at build `1f3bb821` and verified on production (crown reel over real ground; Prospector command reachable in a plain boot). No era bump; boards stand. The owner announces next.
