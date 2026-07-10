# Multiplayer v1 — the family rides together (deterministic lockstep co-op)
Status: RATIFIED-BY-ORDER 2026-07-09 (owner: "can we then look at the multiplayer feature again? …we are now in the time frame to work on it" — pulled forward from the after-E2 gate by owner word; recorded as the re-ruling). Scope: **2–4 humans + their Prospectors, one claim, one shared run.** Family/friends scale (the accounts layer's audience), not public matchmaking.

## Why this is weeks not months (the accidental readiness)
The sim is FIXED-TIMESTEP, SEEDED, EVENT-LOGGED with per-tick determinism hashes (defended for two days as law, proven by perf-04's harness) = **lockstep's entire prerequisite**. M6's `actors[]` means the engine already thinks in multiple heroes. AC-01's worker gives us the Cloudflare home for a relay. Run-suspend snapshots give us REJOIN. None of this was built "for multiplayer" — all of it was built BY LAW, and the laws compound.

## Architecture (deliberately classic)
**Input-delay lockstep over a Cloudflare Durable Object relay.** Each client runs the full deterministic sim; only INPUTS travel (tiny). Ticks advance when all players' inputs for that tick arrived (delay buffer ~3 ticks smooths latency). The relay is dumb: rooms, ordered input fan-out, no game logic server-side (the sim IS the server, everywhere at once). **Desync detection = the determinism hash we already compute**: clients exchange hashes every N ticks; mismatch → pause + auto-resync from the freshest run-suspend snapshot (the save system becomes the healer). Rejoin after disconnect = the same snapshot path.

## Laws
1. The planar-sim/determinism laws are now LOAD-BEARING for netplay — any future PR breaking seeded-hash identity breaks multiplayer; the determinism harness becomes a merge-gate for sim-touching tasks.
2. Randomness stays seeded-shared; audio/render layers stay free (they never enter the hash).
3. Each player brings their OWN Prospector (actors[] per player, rungs/receipts per owner) — the family's agents work the same claim side by side.
4. Economy: ONE shared pool v1 (the family homestead thesis); attribution (M4-08) already splits credit per actor — the ledger shows who panned what.
5. Host = the contract picker (tavern board gains "Ride Together": creates a room code); joiners enter the code from THEIR town. Same contract config, same seed, same briefing.
6. Privacy: room codes are unguessable, rooms die with the run, no chat v1 (the game IS the communication; family uses the couch or a call).

## Slices
- **MP-01 the relay** (buildable NOW, fire-independent): Durable Object room worker in functions/ — join/leave, tick-input fan-out, hash-exchange plumbing, snapshot blob pass-through for resync; dev-mode + a headless 2-client node test harness. No game code.
- **MP-02 lockstep core** (flagged): the tick loop consumes remote inputs; local 2-tab proof via the relay; hash-compare + desync pause; input-delay buffer. e2e: two headless clients, seeded, N ticks, identical hashes.
- **MP-03 the second hero** (render+actors): remote players as full actors (hero sprite variants/tints + their Prospectors), name chips (town names!), camera stays per-player local.
- **MP-04 ride together** (the flow): board button → room code card → joiner flow → the briefing shows the party → run end returns EVERYONE to their towns (story-loop compatible).
- **MP-05 the family gate**: owner + son, two devices, one claim — THE acceptance test. Nothing ships to the board default without this playtest.

## Ratification items (defaulted, veto with a word)
1. Pause semantics: any player pauses → all pause (family-friendly) — DEFAULT yes.
2. Overrun: shared fate (claim falls = run ends for all) — DEFAULT yes v1.
3. Disconnect grace: 60s hold-and-rejoin before the run continues without them — DEFAULT yes.

## MP-BALANCE — rider-count scaling (owner design session 2026-07-10)
**THE OWNERSHIP QUESTION IS OPEN — TEST, DON'T ASSUME (owner 2026-07-10 verbatim: 'I am really not sure what is more fun, me building my own sluice or me building a community sluice for my team. We will have to test later.')** V1 ENGINE = shared claim (one pool, one set of buildings, anyone repairs/upgrades — simplest, matches the shared-credit ruling). THE CHEAP TEST (no engine work): the shared engine supports BOTH play styles as social conventions — playtest session A = 'everything is ours', session B = 'you build yours, I build mine' (agreed, not enforced). Only if my-own-sluice WINS on fun does per-player ownership earn engine work (wallets/ownership tags = a big slice; don't build it on a guess). 2–4 riders per room (relay cap).
**THE SCALING LAW (owner verbatim: 'larger amount of gold to collect so players dont have to fight each other for ressources… two players means also more firepower and that has to be accounted for'):** a data-driven riderCount multiplier table in Balance — wave pressure scales SUB-LINEARLY and starts CONSERVATIVE (owner caution, same day: 'harder in multiplayer only works if there is really more advantages for the players' — coordination overhead eats part of the extra firepower; the sim harness measures the REAL multi-rider power multiple before any table lands, and the playtest gates the feel); seam richness scales modestly (each rider pans, so income already multiplies — tune the CURVE not a flat 2x); one knob set per rider count, deterministic (part of the shared-setup handshake, sol/lockstep-actions brief). Tuning evidence: a StatSimHarness sibling (seeded N-rider sims → survival/gold-rate deltas) + THE FAMILY PLAYTEST as the feel gate (MP-05 findings feed the table). AUTHORABLE after sol/lockstep-actions lands (the handshake carries the table).
