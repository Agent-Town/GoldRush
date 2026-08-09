# MP-07c — THE AGENT RIDES THE BROWSER'S WORLD (people + their agents, one engine)
Status: DRAFT 2026-08-08 (attended, morning). Direction RATIFIED by owner same morning, verbatim: **"Yes, the player and their agent have to play together - if that means they play in the user's world, then that is ok for me."** Shape constraint from the same session's MP-07a ruling, verbatim: **"I would like the player to be able to invite his agent or multiple agents if they want."** Parent: `mp-07-one-engine-at-the-table.md` (slice 07c). Open questions batched at the bottom.

## The one idea
Stop running two engines. In a room with humans, the browsers ARE the engine of record; the agent's process stops simulating and becomes a **rider's brain on a wire**: views travel out to it, standing orders travel back as ordinary lockstep acts, and every browser applies those orders deterministically to an **embodied agent hero** in the shared world. The desync class F-AH-1 documented does not get fixed — it gets **removed by construction**, because there is no second world left to disagree.

## Why this is a wiring job, not a rewrite (verified against source 2026-08-08)
- **The order engine is already shared.** `StandingOrdersExecutor` (`src/agent/StandingOrders.ts:87`) is the same class the headless sim drives; the grammar, validation, and receipts are engine-agnostic.
- **The view builder is already shared.** `buildView(source)` (`src/agent/View.ts:123`) assembles an AgentView from a source interface — the browser can feed it as well as the headless sim can (the mechanics manifest already derives browser-side).
- **The body exists.** M4 embodied the Prospector's agent in the browser world with a tool surface (`src/agent/ToolSurface.ts` — place_building et al. already run as game side-effects). MP-07c gives that body a remote brain.
- **The transport exists.** The lockstep wire already carries per-player action queues in deterministic roster order (`SeatedLockstepSim.ts consume()` proved the ordering law); the relay already supports partySize 2-4.

## Laws
1. **One world where a human sits.** Browsers simulate; seats think. A seat in a mixed room never advances its own sim (scout mode's approximate shadow sim, MP-07a, is retired for rooms on this slice's vocabulary).
2. **Orders are inputs, not effects.** An `agent_orders` act carries the full replace-semantics order array; EVERY browser applies it at the same tick through the same executor. Nothing the seat sends mutates state directly.
3. **The view is a service the room owes its riders.** The agent's turn view is derived from the shared sim at wave boundaries and escalations (`needsRider`), addressed to the seat over the relay. A seat that misses a view acts late, never wrongly.
4. **The invitation is the door.** A player invites their agent(s); the room code is the credential (per the owner's ruling). Agent count bounded by partySize.
5. **Determinism stays measurable.** Browsers keep exchanging their snapshot hashes exactly as today; the seat exchanges none. Cross-browser desync detection is untouched.

## Slices
- **MP-07c-1 — THE EMBODIED ORDER CHANNEL (lane).** New lockstep action `agent_orders` (versioned payload: the standing-orders array + a submission id). Browser side: an `AgentRiderBody` — the M4 embodiment machinery instantiated per agent seat in the roster — plus a per-agent `StandingOrdersExecutor` fed by `agent_orders` acts, its acts resolving through the existing tool surface. Deterministic across browsers because inputs + executor are identical. Checkpoint: in a solo browser room with a SYNTHETIC seat (test harness injecting `agent_orders`), the agent hero visibly builds/holds/harvests per orders; two browser clients agree (hash exchange green) while the synthetic seat drives. GATE: e2e with two playwright browsers + injected agent_orders, zero desyncs, orders visibly executed, plus executor-level node tests.
- **MP-07c-2 — THE VIEW WIRE + THE THIN SEAT (lane, after 07c-1).** Relay learns a `view` message addressed to a seat (rate-limited, wave-cadence). The host browser (deterministic choice: roster[0] browser) assembles the agent's view via `buildView` and posts it. `gr-sim --room` in a mixed room becomes the thin seat: no sim, no hashes — receive view → emit orders (same NDJSON contract the headless door speaks, so every existing harness/adapter works unchanged). Checkpoint: a real V4-Flash seed-ladder session rides a browser-hosted room and its orders land. GATE: extended agent-seat-room harness — playwright browser host + real thin seat, ≥3 waves, zero desyncs, seat's stdout view/order transcript archived.
- **MP-07c-3 — THE INVITATION (lane, after 07c-2).** In-game door: the co-op room panel gains "invite your agent" — shows the room code beside a one-line command (and a Front Desk link, AP-14 tie-in) so a player can seat their agent(s) in one paste. Roster renders agent riders distinctly (the "(scout)" suffix retires; agents show as riders with an agent mark). Checkpoint: the owner can start a family room, paste one line, and watch his agent build beside him. GATE: e2e for the panel (desktop+390px, no-debug boot), copy in house voice, screenshots.
- **MP-07c-4 — THE RECKONING (lane, after 07c-2; parallel with 07c-3).** Standings/tape/almanac integration: what an agent-ridden co-op run records (stack declaration on the room's standing per AP-06 honesty), and scout mode's retirement path in MP-07a's strict/benchmark lane. GATE: standings row from a mixed ride carries the declared stack; benchmark rooms (agents only) unaffected.

## Integration map
Touches: `LockstepClient` vocabulary + `Game.applyMultiplayerActions` (new act), new `AgentRiderBody` wiring around existing embodiment, `functions/api/_multiplayer.ts` (view routing), `gr-sim.mjs` seat mode (thin-seat rewrite for mixed rooms), co-op room panel UI, `public/skill.md` (mixed-room section rewrite when 07c-2 lands).
Untouched: headless-only rooms (seat+seat lockstep stays exactly as shipped, hashes and all); the solo headless door; standings ranking; bench seeds; browser-vs-browser determinism machinery.

## Open questions (owner, unblocking only 07c-4)
1. Does an agent-ridden co-op secure count for the room's county standing like any co-op secure (with the agent declared in the stack), or should agent-assisted runs be a separate board flavor?
2. May invited agents ride ranked bench seeds, or bench rooms stay human-plus-benchmark-agents-only?
(Everything through 07c-3 proceeds without these answers.)


## ANSWERS (owner, 2026-08-09 desk walkthrough — unblocks 07c-4)
1. **Counts like any secure.** An agent-ridden co-op secure ranks on the county co-op board like any team secure, with the agent declared in the stack (species-blind ranking + the named-minds display rule carry the honesty).
2. **Bench stays benchmark-only.** Invited agents do NOT ride ranked bench seeds; mixed human+agent teams play LIVE seeds for the open county. Bench rooms remain the controlled exam.
MP-07c-4 (THE RECKONING) is now fire-authorable.
