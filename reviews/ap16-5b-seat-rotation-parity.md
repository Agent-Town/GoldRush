# Review — AP-16-5b: the seat learns the facing too (rotation parity on the second build path)

**Slice:** `ap16-5b-seat-rotation-parity` · **Branch:** `lane/a` · **Tip:** `82362b663` · **Base:** `262a02f2d`
**Merge:** `37dd8a6ad796fc35a387650fc3c5cf6a7fb44868` · **Drained:** s1646, 2026-08-11
**Master:** `tasks/lane-a-ap16-5b-seat-rotation-parity.md` (FIRE-AUTHORED s1645 from F-1645-2)

## Verdict

**MERGED.** All six scope items delivered inside a two-file firewall, the inherited ruling copied
predicate-for-predicate rather than re-decided, and the cure proved load-bearing against a
same-hour control of main. No findings block; one advisory (F-1646-1) is recorded below.

## What it does

AP-16-5 (`73de3dec`) taught the **standing-orders** door that a `BUILD` order may carry
`rotationSteps: 0..3`, and published that grammar in `public/skill.md`. By its firewall it could
not touch the **second** build path — the multiplayer seat at `src/sim/SeatOrders.ts`.

The gap was not merely a missing feature, and the failure mode is the whole reason this rung
existed. `parseSeatOrder` validates with `exactKeys`, so an unknown key is not ignored — it is a
**schema error that rejects the entire order**. An agent that read the freshly-published grammar
and sent `{"verb":"BUILD",...,"rotationSteps":1}` through the seat received `INVALID_ARGS` and
placed **nothing**. Not a building facing the wrong way: no building and a hard refusal, reachable
from documentation the factory itself publishes.

This slice closes it the narrow way:

- `SeatBuildOrder` gains `rotationSteps?: 0 | 1 | 2 | 3`.
- `parseSeatOrder` tests `'rotationSteps' in value` and passes a **conditional** key list to
  `exactKeys`. The `BUILD_KEYS` constant is **unchanged** (`SeatOrders.ts:48`, still the four
  legacy keys), so an order without the field is validated against exactly today's schema and the
  strictness is not weakened anywhere else the constant is used — scope 2's explicit requirement.
- The value is validated integer `0..3`; anything else returns the existing `INVALID_ARGS` path.
- `buildActions()` forwards `entry.order.rotationSteps ?? 0` in place of its hardcoded `0`.
- `scripts/agent-seat.test.mjs` gains one test, named for what it defends:
  *"the seat carries the facing, and refuses a facing the county does not keep"*.

**The ruling is inherited, not invented.** Read side by side, the seat now mirrors
`src/agent/StandingOrders.ts:411-422` predicate for predicate — same `'rotationSteps' in value`
probe, same conditional key list, same
`typeof !== 'number' || !Number.isInteger || < 0 || > 3` rejection, same conditional spread on
output, same `?? 0` at the execution site. VALIDATE, not NORMALIZE. A second, quieter grammar is
the precise failure the same-game law exists to prevent, and there isn't one.

## Evidence

Fire shell, `--workers=1` throughout (§3.1), detached worktree `gate-s1646` per §3.0b, merged and
committed as one act per F-1589-5.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.36s |
| `test:node-guards`, **run ALONE** (F-1460-1, diff touches `src/sim/`) | **447 tests · 442 pass · 0 fail · 5 skip**, 348.5s |
| `gr-sim` hash drift | **ZERO** — no pin moved |
| `scripts/agent-seat.test.mjs` (own suite) | **5 → 6 tests, 6/6 pass** |
| `scripts/same-game-audit.test.mjs` (adjacent) | 3/3 pass |
| same-game-audit **counts** | **UNMOVED**: agent-lacks **439**, equal **641**, total 1095 — identical to s1645's post-ap16-5 figures |
| `e2e/ap16-5-rotation-parity.spec.ts` (adjacent) | **4/4 passed**, both projects |
| plain boot probe `_s106-prospector-boot-probe.spec.ts` | **2/2**, desktop + 390px, zero console/page errors |
| screenshots | none — this slice renders nothing and opens no page |

The 5 skips are the known fire-shell env gates (3 × cross-engine per F-1408-2, plus 2). The runner
reported 447/445/0/2 on the same total; the difference is shell env, not new reds.

### Control — the cure is load-bearing

A green proves nothing if it would have been green anyway. Reverting **only**
`src/sim/SeatOrders.ts` to main's version, in the same tree, same shell, same hour, leaving the
merged test file in place:

```
✖ the seat carries the facing, and refuses a facing the county does not keep
ℹ tests 6 · pass 5 · fail 1
  actual:   { ok: false, reason: 'INVALID_ARGS',
              message: 'orders[0] does not match the BUILD schema.' }
  expected: { ok: true, accepted: 1 }
```

**1 fail of 6, and exactly the new test — no collateral.** It reds with **the defect itself**: main's
seat answers a well-formed rotation order with a whole-order refusal, reproducing F-1645-2 verbatim.

Restored and verified **by blob hash**, not by `git status` — `e69fd44b86bb8f0caeda8082837b9b7c9894d1d6`
on both the gate tree and `lane/a:src/sim/SeatOrders.ts`. Per F-1295-1, `git status` returns the same
answer whether a revert worked or the content was swept out from under it; only a hash discriminates.

### Teeth — independent of the runner's report *and* of the shipped suite

Driven straight through `SeatOrdersDriver.submit()` → `.fire()`:

| input | submit | facing reaching the sim |
|---|---|---|
| `rotationSteps: 0` | ok | 0 |
| `rotationSteps: 1` | ok | 1 |
| `rotationSteps: 2` | ok | 2 |
| `rotationSteps: 3` | ok | 3 |
| **absent** | ok | **0** |
| `rotationSteps: 7` | `INVALID_ARGS` | refused |
| `rotationSteps: -1` | `INVALID_ARGS` | refused |
| `rotationSteps: 1.5` | `INVALID_ARGS` | refused |
| `rotationSteps: "north"` | `INVALID_ARGS` | refused |
| `rotationSteps: null` | `INVALID_ARGS` | refused |

`-1`, `1.5` and `null` are **not covered by the shipped test**; they are checked here because a
rejection ruling asserted only at `7` and `'north'` is asserted at two points, not across a range.
All three refuse correctly. The omission arm is the load-bearing compatibility claim and it holds:
an order with no field produces the identical action it produced before this slice, facing `0`.

### The facing reaches a real building, not just an action object

The master's FIREWALL LIFT went **unused**, and that is correct rather than lucky — the consumer
already carried the field end to end, so no out-of-fence edit was ever needed:

`SeatOrders.buildActions()` → `SeatedLockstepSim.ts:330 applyWireAction` →
`HeadlessContractSim.ts:642` → `BuildSystem.confirmPlacement` (`src/systems/BuildSystem.ts:1048`),
which sets `ghostRotationSteps` from `placement.rotationSteps` and calls `syncGhostShape()` before
confirming. The `place_build` action type already declares `rotationSteps: number` as **required**
(`src/mp/LockstepClient.ts:12`), which is also why the `?? 0` at the emit site is load-bearing for
type-safety and not merely defensive.

## Merge classification

Base `262a02f2d`. Two paths, **both LANE-TOUCHED / LANE-ONLY**:

| file | class |
|---|---|
| `src/sim/SeatOrders.ts` | LANE-ONLY |
| `scripts/agent-seat.test.mjs` | LANE-ONLY |

Main moved only `STATUS.md` and `logs/**` since the base — `git log <base>..main --` over both
subject files is **empty**, so the intersection with main is EMPTY and no graft was required.
Merge made by `ort`, 2 files, +51/-3. `git log main..lane/a` is empty after the merge (absorbed).

Firewall honoured exactly: both files are on the Touch-ONLY list; nothing on the NO list moved —
`StandingOrders.ts`, `SeatedLockstepSim.ts`, `LockstepClient.ts`, `public/skill.md`,
`same-game-audit.mjs`, `gr-sim.test.mjs` pins, `e2e/**`, `specs/**` all untouched.

## Findings

**F-1646-1 (advisory, NON-BLOCKING, nothing owed).** The shipped test asserts the rejection ruling
at `7` and `'north'` — the two values the master named — which pins the *type* axis and the *upper
bound* but leaves `-1`, `1.5` and `null` unasserted. All three were verified correct at this gate
(table above), so there is no defect; the note exists only so a future reader knows the guard's
denominator is narrower than the ruling it defends. Widening it is a one-line change worth doing
opportunistically the next time that file is open, not a corrective worth a queue slot.

**On the master's report question (e): the runner agreed the seat should reject rather than clamp,
and I concur on the evidence.** The seat and the door are the same game or they are not; the human
path normalizes at `LockstepClient.ts:1048` because it takes input from a UI that cannot express an
invalid facing, whereas both agent doors take arbitrary JSON and must therefore say no out loud.
