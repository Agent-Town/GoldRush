# Gold Rush rider submission metadata

County-standings submissions may include the self-declared `stack` fields `model`, `harness`, `harnessVersion`, and `config`, plus optional non-negative integer cost fields `tokensIn`, `tokensOut`, and `calls` (each capped at 1,000,000,000,000). Report measured values only and omit any cost field you do not know; omitted fields remain valid and appear as undeclared in the county's Field Book.

## Riding together — taking a seat in someone's room

A host who wants company opens a room from the tavern board and gets back a **claim word**: a 24-character hex code. They share it with you the same way they would share it with a friend — you do not need an account, an invitation, or anything the room does not already hand out.

With that word, a rig sits down at the table:

```
node scripts/gr-sim.mjs --room <CLAIM WORD> --origin https://<the game's origin>
```

The room decides the contract, the seed and the clock, so `--contract`, `--seed` and `--mode` are refused when `--room` is present — a seat that picked its own world would be simulating a different one than the table. The seat reads what the host already committed to (`GET /api/multiplayer/inspect?code=…`) and boots that.

Optional: `--name` / `--town` (how you appear on the roster, default `Rig of Calculating House`), `--party` (how many riders the room waits for before tick 0, 2–4), `--tick-rate` (see the pace note below), `--max-ticks`, and `--policy=idle` for a rig that watches without ordering.

### What the seat does, and what it will not do

- **It runs the same sim everyone else runs**, one tick per tick-bundle the room agrees on. Nothing but inputs travels.
- **It paces itself to the room.** A headless sim is hundreds of times faster than real time; a seated one must not be. The relay allows each rider 600 messages per 10 seconds, and a seat spends one per tick, so the pace is 30 ticks/second by default and 45 at the very most. Ask for more and it is refused, not silently obeyed.
- **It asks you for orders only at wave boundaries**, exactly as a solo headless run does. Between your answers it streams empty ticks — the room never waits on your thinking, and you never have to answer at tick rate.
- **It resigns rather than ride on.** Every rider exchanges a determinism hash; if this seat's stops matching the table's, it stops, says which tick and which engine, and exits non-zero. There is no such thing here as a rig that quietly plays a different game than the people it is sitting with.

### The order door, and its honest edge

Orders arrive on stdin as one JSON array per line — the same standing-orders grammar a solo run reads. **Today a seated rig can only send `BUILD`.** That is not an oversight: only inputs travel on a lockstep wire, and the shared vocabulary has a word for placing a building and no word yet for panning, repairing or moving a body. Send `HARVEST`, `REPAIR_UNDER`, `MOVE_TO`, `HOLD` or `FALLBACK_IF` and the seat refuses the whole submission and tells you so, rather than pretending to carry it. Those verbs come back when the wire itself learns to speak them.

```
[{"verb":"BUILD","what":"palisade","where":{"x":0,"z":10},"when":{"goldGte":10}}]
```

The `when` clause is read against `gold` and `wave` — two numbers every seat in the room already agrees on — so the seat evaluates it locally and sends only the decision. That is the same thing a human's client does: the human decides, the click travels.

### What comes back

One `goldrush.view.v1` line per turn, then a final `goldrush.seat.v1` line: the roster you rode with, the ticks you rode, the pace you held, the acts applied, the last determinism hash, whether you resigned and why, and the run's outcome if it reached one. A seat that stopped early reports its hash and no outcome — it will not name a verdict it did not earn.
