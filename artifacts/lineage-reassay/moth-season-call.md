# The Moth Season re-assay — the exact live call, and what it should do

**Status: NOT RUN. Written 2026-09-06 by the `lineage-reassay-on-composition-change` implementer, who
has no production access and, per the task's honesty guard, never pointed this verb at the live door.
The attended session runs it after the deploy that carries this slice.**

## The case

`e3-moth-season`'s composition changed on 2026-09-05. Era-5 pin `324bb3cd0e32f2b7…` records it in its
own words:

> content re-hash: e3-moth-season drain (de21da4f5) rewrites the Moth Season contract row
> (assets/contracts/epoch-3-voltage/contracts.json) — the sabotageable light circuit as contract data,
> zero src/ edits; every other contract replays byte-identical …

Two verified standings sit on that board (BACKLOG, "F-PERF-14 HALF-DONE" and "OWNER'S DESK: F-PERF-14"):

| | rider | recorded under | measured today |
| --- | --- | --- | --- |
| rank 1 | Claude Opus 5, heat 12 (2026-09-06) | the **new** composition | expected to replay |
| rank 2 | Claude Fable 5, heat 11, reel `agent-bb0b3b67-da54dcd9-4293-42ee-b29b-1425fb419a2e` (verified 2026-09-03) | engine pin `a607a81f…`, the **old** composition | replays to `fnv1a32:9be0399e` against its recorded `fnv1a32:64e32dde` |

The divergence was reproduced twice by the perf survey's `sim-tape.mjs` (loads 64 and 16) and
independently by the repo's own `scripts/assay-replay-agent.mjs`; all 24 other measured county tapes
match exactly. Re-POSTing the identical bytes cannot fix it — the door assays only `pending` rows and
retains a verified row on ties (`retained: 'goal_snapshot'`), which is precisely why the verb exists.

## The call

Run it from the deployed checkout, with the same secret the assayer uses
(`/etc/gold-rush-assay.env` on the droplet, or the Cloudflare Pages `ASSAY_WORKER_SECRET`).

```sh
curl -sS -X POST 'https://agenttown.app/api/standings/reassay' \
  -H "x-assay-key: $ASSAY_WORKER_SECRET" \
  -H 'content-type: application/json' \
  -d '{"epochId":"epoch-3-voltage","contractId":"e3-moth-season","reason":"e3-moth-season composition changed at engine pin 324bb3cd0e32f2b7 (2026-09-05)"}'
```

Or let the sweep find it and phrase the reason itself:

```sh
node scripts/assay-lineage-sweep.mjs --contract e3-moth-season            # dry: prints the plan
ASSAY_WORKER_SECRET=... node scripts/assay-lineage-sweep.mjs --contract e3-moth-season --commit
```

Expected immediate response, where `requeued` is however many verified rows the live board holds at
that moment (two at the time of writing):

```json
{ "ok": true, "epochId": "epoch-3-voltage", "contractId": "e3-moth-season", "requeued": 2, "requeuedAt": 1757… }
```

## What should happen next, and how to check it

The assayer picks both rows up on its next poll (default 15 s) and replays each one.

1. **The Opus row stays verified.** It was recorded under the current composition, so the replay
   should reproduce its `eventLogHash`; the worker posts `verified`, the county clears the lineage
   mark and writes a fresh `assayedAt`. Its `submittedAt` — the day the standing was earned — is
   never touched by the verdict path, so its first-secure date is unchanged and it holds rank 1.
2. **The Fable row retires.** Its replay diverges, the worker posts `rejected`, and because the row
   carries a lineage mark the county records `retired` with
   `lineage: recorded under a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04, no
   longer replays under <the engine hash of the deployed build>`.
3. **The board.** `GET /api/standings?epoch=epoch-3-voltage&contract=e3-moth-season` should return one
   ranked row (Opus), `retiredCount: 1`, `rejectedCount` unchanged. The retired row stays in storage.
4. **The almanac.** `?reel=agent-bb0b3b67-da54dcd9-4293-42ee-b29b-1425fb419a2e` still serves the reel;
   `?verdict=<that id>` answers `assay: "retired"`, `ranked: false`, the lineage reason, and the cause
   the county gave for asking again.
5. **The receipts do not move.** `assets/rotations/winnability-receipts.json` already records Moth
   Season's first secure as Claude Opus 5, reel `agent-1faff8b1-a4dc9c44-05df-47a2-bda0-fda42e5813a5`,
   pin `a607a81f…`, 2026-09-03T22:09:34.911Z. That is history, not derived state (F-RECEIPTS-1,
   ADR-004 rule 3): the retired rider is not the receipt holder, and the generator keeps the stored
   receipt unless the live board offers a strictly earlier verified secure. Re-run
   `node scripts/winnability-receipts.mjs` afterwards and expect a zero diff on that row.

## Honesty

Points 1 and 2 are **predictions, not measurements**. The rider reels live on the live door and are
not banked in this checkout (`artifacts/gauntlet-heat*/` holds no Moth Season submission), so nothing
here was replayed. What *is* measured is the mechanism: the same state machine is driven end to end
against both storage arms in `scripts/test-standings.mjs`
(`checkLineageReassay`), on a fixture built to this exact shape — one row on the current engine pin,
one on an earlier era-5 pin whose score is a goal snapshot.

If the Opus row also fails to replay, it retires too and the board is left with no ranked standing on
Moth Season until someone rides it again. That is ADR-004 rule 2 working as ruled, not a fault; the
row and its reel remain in the almanac either way.
