# F-2289-1 cure verification

## Module-split regression

`node --test scripts/standing-orders-module-split.test.mjs` passes all three arms:

- safety: a bound executor with zero submissions remains a valid empty log;
- control: reloading `StandingOrders.ts` without invalidation retains the live executor and hash;
- armed: invalidating and re-instantiating `StandingOrders.ts` produces the empty fallback, while `sim.standingOrdersSnapshot()` retains the live executor and hash.

The recorder and assayer now hash `sim.standingOrdersSnapshot()` and perform no late `StandingOrders.ts` lookup at the hashing boundary.

## Real-tape replay

| Tape | Claimed | Replayed | Outcome match |
| --- | --- | --- | --- |
| Hill Mine attempt 10 | `fnv1a32:a45ba9ac` | `fnv1a32:85cb8a01` | Yes: secure, wave 17, 5 gold, 529.8 s |
| Night Shift attempt 1 | `fnv1a32:889d9357` | `fnv1a32:889d9357` | Yes: secure, wave 25, 115 gold, 750.033 s |

The refused Hill standing would now hash to `fnv1a32:85cb8a01`. It was not re-admitted.

## Gates run locally

- `npx tsc --noEmit`: pass.
- `npm run build`: pass, including asset-diet.
- `node scripts/gr-sim.test.mjs`: pass (18 passed, 2 expected skips).
- `node --test scripts/assay-replay.test.mjs`: pass (4 passed).
- Canonical Node 26 `npm run test:node-guards`: the new regression appears and passes; aggregate result is 542 passed, 2 failed, 2 skipped. The failures are unrelated pre-existing fixture-teardown leaks and a load-only Moth Season timeout. `node --test scripts/moth-season-pressure.test.mjs` passes alone (1/1).

No retained tape, hash semantics, fallback semantics, standing, or admission was changed.
