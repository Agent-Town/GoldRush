# Owner fork — `e1-baron` admission

## Measured gap

The authored boss is wave 20 with `hpScale: 240` (`assets/contracts/epoch-1-frontier/contracts.json:354-367`). Current base enemy HP is 25.2 and per-wave HP scale is 1.115 (`src/game/Balance.ts:28-30,88-90`), so:

```text
Baron HP = 25.2 * 1.115^20 * 240 = 53,346.893
best remainder = 49,025
best burn = 4,321.893 = 8.1015%
remaining gap = 91.8985% (about 12.34x the measured burn)
```

That is Heat 5 attempt 4, replayed unchanged on today's engine. H10 was vetoed by lawful geometry and H11 did not move the terminal result.

## A — rebalance for door play

Smallest single dial: `twist.baron.hpScale` only.

- Exact knife-edge at the best measured burn: `240 -> 19.44`.
- With a 10% victory margin: `240 -> 17.50`.
- A practical integer proposal would be `19`, followed by two clean public-door secures and browser regression.

Price: a 91.9% HP cut. It is the narrowest code/data edit, but not a small experience change; it would substantially redefine the authored boss and risks making the human fight trivial. No other balance dial needs to move.

## B — stamp ACCEPTED-ELITE

Follow the current `e9-old-canal` / `e9-seed-run` precedent at `src/sim/HeadlessContractSim.ts:178-228`: retain an honest cited exemption, declare the difficulty deliberate, remove admission debt, and keep the census truthful until a future owner-directed rebalance.

Price: the Baron remains unavailable to the public agent door and earns no current standings rows. The browser fight remains untouched, the historical admission claim is corrected, and no fake solvability promise remains.

## C — standing bounty

Leave the unsupported admission problem open and invite a future lawful two-secure prover campaign.

Price: continued operational ambiguity. The retained campaign already spans eleven distinct current-door hypotheses (nine Heat-5 families plus H10/H11), while the measured damage envelope is 12.34x short. A bounty is honest only if the census shows the contract as unproven/exempt meanwhile; leaving it admitted would preserve the unsupported state.

## Recommendation

Choose **B, ACCEPTED-ELITE**, and optionally keep C as a non-blocking challenge. The measured gap is too large to call option A a tune: changing only HP is mechanically minimal but experientially drastic. The e9 precedent already expresses exactly this case—mechanics live, map/balance deliberately beyond public-door provers, exemption honest and non-debt. The owner rules; this audit makes no admission or balance edit.

