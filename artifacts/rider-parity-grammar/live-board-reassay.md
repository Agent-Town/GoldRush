# The ten live heat-12 rows the drain must re-assay

**Written 2026-09-07 by `rider-parity-grammar-stage3` (stage B item 7), for the drain that holds
`ASSAY_WORKER_SECRET`.** This task cannot make the call: retiring a live board row is a
`POST /api/standings/reassay` against the county, and the secret is the drain's.

**What changed.** ADR-005 stage 3 removed `MOVE_TO`, `HOLD` and `FALLBACK_IF` from the door. A tape
naming one of them no longer validates, so the assayer cannot reproduce these rows: the county's
worker answers `malformed tape` before a tick runs (`src/replay/AgentTapeReplay.ts:67`), and a live
rider submitting the same plan is refused at submission with `orders[i].verb "<VERB>" is unknown.`
Both refusals are honest and fail-closed; neither is a divergence.

**The record.** `artifacts/rider-parity-grammar/retirement-ledger.json` — 57 tapes / 22 scored rows /
22 rides, re-run against the LANDED door on 2026-09-07 and byte-identical to the pre-removal
prediction. `scripts/rider-parity-retirement.test.mjs` replays every one of those 57 rows against the
door and holds the ledger's recorded message to the door's actual answer.

**RETENTION LAW (CLAUDE.md 4.10b): nothing is deleted.** No tape, no ride directory, no board row is
removed from disk by this task. A retired row stops being reproducible; it does not stop existing.

## The ten rows (heat 12, `harness: heat12-operator`, every one at rank 1)

| contract | board row | ride tape | tape id | seed | recorded terminal hash | first refusal |
|---|---|---|---|---|---|---|
| `e8-mare-claim` | w20 / 1180 g | `attempt-1-tape.json` | `agent-4036192d-b1ebab0e-a2e1-42ba-b7dd-c2edf9f3d797` | `e8-mare-claim-01` | `fnv1a32:e06bda53` | tick 1381, order 2, `HOLD` |
| `the-claim` | w10 / 720 g | `attempt-1-tape.json` | `agent-2d257d8b-91bfcbf4-53e5-4c23-b5ae-d195fe447e9d` | `e1-the-claim-01` | `fnv1a32:23da1694` | tick 0, order 31, `HOLD` |
| `e3-moth-season` | w12 / 530 g | `attempt-1-tape.json` | `agent-7739d978-82ca7118-bd78-4b36-ae7c-9051ac88d5e7` | `e3-moth-season-01` | `fnv1a32:b98efd5e` | tick 1820, order 0, `HOLD` |
| `e7-echo-canyon` | w20 / 870 g | `tune-1-tape.json` | `agent-d47dfbaa-7f9bcd5a-824a-42be-a3c1-fc18fd4ca4af` | `e7-echo-canyon-01` | `fnv1a32:19817b46` | tick 0, order 25, `HOLD` |
| `e7-dead-band` | w20 / 1470 g | `attempt-1-tape.json` | `agent-c4c98518-9e45c5db-09d9-4386-b7bb-d2cd624ba982` | `e7-dead-band-01` | `fnv1a32:297c535f` | tick 0, order 31, `HOLD` |
| `e5-stillwater` | w12 / 200 g | `attempt-1-tape.json` | `agent-82a5f5e0-59609077-337d-490f-90ca-7b9abc2ccf79` | `e5-stillwater-01` | `fnv1a32:3e887b17` | tick 0, order 31, `HOLD` |
| `e8-far-side` | w20 / 1470 g | `attempt-1-tape.json` | `agent-03784526-96166760-5341-4b3e-bd9f-7338d954441f` | `e8-far-side-01` | `fnv1a32:f540c405` | tick 0, order 31, `HOLD` |
| `e8-low-orbit` | w20 / 1470 g | `attempt-1-tape.json` | `agent-6d2f797a-909e53e2-3dd6-4aa9-8160-2be17e6a78f7` | `e8-low-orbit-01` | `fnv1a32:8629a98e` | tick 0, order 13, `HOLD` |
| `e4-boneyard` | w12 / 475 g | `attempt-1-tape.json` | `agent-3af455e5-52d1fd7c-5ddf-475e-84f1-1081e5f2caf0` | `e4-boneyard-01` | `fnv1a32:76da210d` | tick 0, order 1, `MOVE_TO` |
| `e4-gusher-county` | w12 / 370 g | `attempt-1-tape.json` | `agent-30665e9d-03c08c59-94c6-4b86-b1fd-16259206a52d` | `e4-gusher-county-01` | `fnv1a32:b61647e9` | tick 0, order 1, `MOVE_TO` |

Board figures are the operator's own record (`artifacts/gauntlet-heat12-20260905/heat12-note.md` §2,
"Ten heat-12 rows now stand on the board, every one of them at rank 1"). Everything else is read out
of the retirement ledger.

## The twelve scored rides NOT on the live board

Retired by the same ruling and in the same ledger, but with nothing to re-assay because no row of
theirs stands: `e1-baron`, `e1-drill-yard`, `e1-night-shift`, `e2-hill-mine`, `e3-canyon-works`,
`e4-dust-flats`, `e4-long-road`, `e7-relay-rush`, `e7-relay-valley` (and its `attempt-1`),
`e8-eclipse`, `e9-dome-basin.attempt-1`. Two of these — `e7-relay-rush` and `e4-dust-flats` — were
won and accepted but never reached the board (F-HEAT12-4, their assay locators were dropped); they
are retired before they were ever owed a re-POST.

## What the re-ride needs (owner D2, verbatim: "re-ride it yes")

The heat-12 board is re-ridden on the new grammar, never repaired (ADR-005 amendment clause 6). The
gauntlet master for that re-ride is authored from this list and from the ledger; two of the ten
carry a caution worth writing into it:

- `e4-gusher-county` and `e4-boneyard` are Motor maps, and the errand stops there are ground no hero
  can stand on. A re-ride's plan needs the aim ladder `scripts/e4-motor-floor.mjs` now writes.
- `e4-long-road` (not on the board, but in the ladder) cannot land its convoy errand at all under
  the 1:1 grammar — F-RPG-10. A re-ride should not be scheduled for it until that finding is ruled on.

## Wider than the board

The removal retires **every banked agent tape on disk**, not only heat 12: the heat-5 and heat-5b
corpora and the whole `artifacts/assay-e2e-20260822` round-2 corpus each name a retired verb in every
tape (measured 2026-09-07, all 57 heat-12 rows plus every tape under those three roots). The ledger
covers the live board because that is what the county can act on; the rest are retired in place, kept
on disk, and no longer replayable. `scripts/assay-replay.test.mjs` states that for the two the guards
used to replay.
