# MP-07 — ONE ENGINE AT THE TABLE (agent + human rooms that tell the truth)
Status: DRAFT 2026-08-08 (attended, overnight). Seeded by the owner's 1AM report, verbatim: **"There seems to be an issue in agent + human games with a diversion of the game state?"** — filed same night as F-AH-1/F-AH-2/F-DOOR-1 in BACKLOG. Ratification questions at the bottom.

## What the owner saw, and why it is true by construction
An agent seat (`gr-sim --room <code>`, `src/sim/SeatedLockstepSim.ts`) and a browser rider in the same room run **two different engines**:
- The browser hashes a **run-suspend snapshot** (`Game.ts:3343 multiplayerStateHash`); the seat hashes **gr-sim state** (`SEAT_HASH_ENGINE = 'gr-sim.headless.v1'`, `HeadlessContractSim.ts:71`). The seat's own resignation text states it: *"engine-crossed rooms disagree by construction"* (`SeatedLockstepSim.ts:172-179`).
- So at the **first hash exchange (tick 30, ~1 s in)** the room desyncs: the browser pauses ("The wire crossed — Tick N disagreed"), the host republishes a snapshot, the seat cannot restore (`onSnapshot: () => false`) and **resigns**. The human is left mid-pause with a rider gone.
- Even with a unified hash surface the sims would still diverge honestly: the seat honours only `place_build` off the wire; movement and every other browser act are **tallied as unhonoured** (`SeatedLockstepSim.ts:285-310`), and the headless hero walks on IDLE_INTENTS. Two worlds, one room.

**Baseline measured 2026-08-08 (attended):** `scripts/agent-seat-room.mjs` — seat+seat rooms are GREEN, 51/51 checks, same eventLogHash as the solo control. The transport is honest; the broken class is exactly **mixed-engine rooms**.

## The mechanics-parity ledger (the second face of the same root)
The headless sim is not just differently-hashed — it is missing browser mechanics:
- **F-AH-2**: on `e1-night-shift` the browser gives wreckers a **1.18× speed boost outside light** (`Game.ts:5048-5056 nightSpeedMultiplier`, `Balance.ts:878`); headless builds a `LightField` **only for mothSeason** (`HeadlessContractSim.ts:324`) and has **zero** `nightSpeed` references. Agents secure a mechanically different Night Shift than humans play. (Independently rediscovered by the pi entrant, run 4: "no night-darkness mechanics, lanterns cosmetic".)
- The F-1403/1405/1406 float thread already proved even same-code cross-engine determinism is fragile; outcome-level parity is pinned for three E1 contracts, hash surfaces are not unified anywhere.

## Laws (proposed)
1. **No silent divergence.** A mixed-engine room must either be refused at the door with a sentence a rider can act on, or ride in a mode that declares itself. A desync banner one second into every mixed ride is neither.
2. **The browser is the engine of record wherever a human sits.** In mixed rooms the human's sim is truth; the agent's process must not run a second world and call it the same room. (Headless-only rooms keep gr-sim as engine of record; seat+seat stays as shipped — it is green.)
3. **Parity gaps are findings, not flavor.** Any mechanic that fires in one engine and not the other gets an F-ID, a ledger line, and either a cure or an honest label in the door doc.

## Slices
- **MP-07a — THE HONEST DOOR (small, lane-executable now).** The seat detects a mixed room and says so: relay join payload gains a `client: 'browser' | 'headless'` field; `gr-sim --room` refuses to take a chair in a browser-hosted room with a foreshadowing rejection (naming MP-07c as the rung that fixes it), unless `--advisory` is passed. `--advisory` rides with hash exchange suppressed for the seat and the seat's roster name suffixed "(scout)" — builds still land (they are wire acts), the agent's own view is declared approximate in its turn envelope. Checkpoint: a mixed room either refuses cleanly or rides without a single "wire crossed" card; seat+seat rooms byte-identical to today. GATE: agent-seat-room harness extended with a browser rider arm (playwright, per scripts/test-multiplayer.mjs machinery) asserting both paths.
- **MP-07b — NIGHT PARITY (independent, lane-executable now).** Headless night-shift gains the wrecker outside-light speed law: `LightField` built for dayNightCycle contracts, fed by lantern/works sources exactly as the browser feeds it, `nightSpeedMultiplier` applied to wreckers. Bench pins for `e1-night-shift` re-derived (they WILL move — that is the point), almanac projections updated if they model enemy arrival. Checkpoint: the pinned night-shift outcome changes once and then holds on both Node engines. GATE: gr-sim bench green with new pins + a targeted test asserting a wrecker outside light outruns one inside it, headless.
- **MP-07c — THE AGENT RIDES THE BROWSER'S WORLD (the real cure, spec-then-lanes).** In mixed rooms the seat stops simulating: the host browser becomes the engine of record and **serves the agent its view**; the agent's standing orders travel as wire acts the browser applies to an embodied agent hero (the M4 embodiment machinery is the natural body). The lockstep vocabulary grows the missing verbs (HARVEST / MOVE_TO / HOLD / REPAIR_UNDER / FALLBACK_IF as acts, exactly the rung `SeatOrders.ts` foreshadows in its rejection text). The seat process becomes transport + inference only — one world, one writer, the human sees the agent's hero do what the agent ordered. This is the Agent Town promise ("people + their agents") made mechanically true. Needs its own spec pass before lanes touch it.

## Integration map
Touches: relay join payload + inspect (`functions/api/multiplayer*`), `SeatedLockstepSim.ts`, `gr-sim.mjs` seat mode, `HeadlessContractSim.ts` (07b), `LockstepClient` vocabulary + `Game.applyMultiplayerActions` (07c only), `public/skill.md` (door doc honesty lines), agent-seat harnesses.
Untouched: browser-vs-browser rooms, the county ladder/standings, gr-sim solo door, bench seeds (except night-shift pins, 07b), the gauntlet protocol.

## Ratification questions (owner)
1. **MP-07a's `--advisory` mode**: do you want the scout-rider option (agent builds land, agent marked "(scout)", no desync cards), or a clean refusal until 07c? Recommendation: ship the refusal + the label; advisory is one flag away if you want to play with it.
2. **MP-07b re-pins night-shift**: agents' Night Shift gets the browser's wrecker speed law, so headless runs get slightly harder and old almanac intuitions shift. Any standing you care about on e1-night-shift? (County board currently has no secured night-shift agent run — pi's best is wave 24/25 — so the window to fix it costlessly is NOW.)
3. **MP-07c scope**: is the embodied-agent-in-browser-world direction the one you want (it is the "agents play together with people" road), or should mixed rooms stay refused and agents remain headless-only for E2?
