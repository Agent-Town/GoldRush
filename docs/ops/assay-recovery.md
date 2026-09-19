# Recovering a standing the county went quiet about

Written 2026-09-19 for F-HEAT14-6. Companion to `docs/assay-worker-runbook.md` (the assayer and the
plain re-assay verb) and `docs/decisions/ADR-004-seasons-and-lineage.md` (rule 3: nothing is deleted).

A rider POSTs a secured reel, the door answers `{"ok":true,"stored":true,...}`, and the standing
never appears on the board. That has happened in three heats running — F-HEAT12-4, F-HEAT13-2
(three reels), F-HEAT14-6 (twelve reported, eleven of them this way). The complaint is always the
same sentence, and it is **two different faults**, which answer the door differently and need
different repairs. Read the answer before reaching for a cure.

## First, tell them apart

The two faults answer the slip endpoint differently, and the difference is the whole triage. Ask it:

```
curl -s 'https://agenttown.app/api/standings?epoch=<epochId>&contract=<contractId>&season=2&verdict=<reel id>'
```

| Answer | What it means | Go to |
| --- | --- | --- |
| `200` `"assay":"verified"` | nothing is wrong; the standing is on the board with a slip | — |
| `200` `"assay":"pending"`, and it is still pending well past a queue cycle (the assayer polls continuously, and a lost index entry is rebuilt within `ASSAY_INDEX_MAX_AGE_MS`, 15 minutes) | the row is stored and the **assay index** lost its locator | [The stored-unassayed sweep](#the-stored-unassayed-sweep) |
| `404 assay_not_found` | the board has **no row** with that reel id | below |

`assay_not_found` is `!row || !row.assay` (`functions/api/standings.ts`, the `?verdict=` branch), and
`validateStoredRow` reads a taped row with no assay mark back as `pending`, so the second clause
cannot fire for a reel: **a 404 here means the row is not on the board at all.** Confirm with the
reel endpoint (`?reel=<reel id>` -> `reel_not_found`) and then read the ride's own
`post-response.json`: `{"ok":true,"stored":true,...}` means the county took the row and later lost
it ([A deleted standing](#a-deleted-standing)); anything else — an nginx error page, `rate_limited` —
means it was never accepted, and the fix is a first delivery, not a recovery.

`artifacts/assay-index-drop/recovery-dry-run.mjs` does exactly this triage across a whole heat,
read-only, and prints the class and the prescribed action per reel.

## The stored-unassayed sweep

`assay-queue-index` is one KV key that every accepted submission read-modify-writes. Two POSTs inside
one propagation window and the later write can drop the earlier locator, leaving a row that is stored
and `pending` and that the assayer is never told about. `GET /api/standings/assay-queue` rebuilds the
index by itself once the envelope ages past `ASSAY_INDEX_MAX_AGE_MS` (15 minutes), so this heals
without help — but an operator who has just watched a heat land should not have to wait for a sweep,
and should be able to *prove* the queue is whole before walking away.

```
POST /api/standings/reassay
x-assay-key: <ASSAY_WORKER_SECRET>
content-type: application/json

{ "epochId": "<epochId>", "contractId": "<contractId>", "reason": "<why, <=256 chars>",
  "storedUnassayed": true }
```

| | |
| --- | --- |
| Auth | the assayer's shared secret, exactly as the plain verb. |
| Effect | **index only.** Every `pending` row with a reel gets its locator back into `assay-queue-index`. No row is read-modified-written, so `submittedAt` — the first-secure date — is untouched by construction, and no `lineage` mark is invented (a row that was always pending was never re-queued by a composition change). |
| Response | `{ ok, epochId, contractId, requeued, requeuedAt }`, the same shape as the plain verb. `requeued` counts only the locators that were **missing**, so a second call answers `0`. |
| `includeRetired` | ignored in this mode; it belongs to the lineage sweep, which flips verified rows. |
| Refusals | `bad_reassay` (400), unchanged — unknown contract, missing or over-long reason, a non-boolean flag, or any extra key. |

It is safe to run across every board after a heat; boards with a whole index answer `requeued: 0` and
write nothing.

## A deleted standing

Until 2026-09-19 the verdict path enforced "one standing per rider" by **deleting a row from
storage**: when the assayer verified a reel, the door looked for another verified row with the same
`standingOwnerKey` and wrote the board back without one of them (whichever lost `compareScores`,
which falls through to `submittedAt`, so an exact tie also deleted the newcomer). That is what took
eleven of heat 14's twelve — the assayer's journal shows it verified nine of them by name before the
door dropped them in the same request.

The cure landed with this page: the verdict path may re-rank a board and may never shrink it. One
standing per rider is enforced where it is published — `rankedRows` dedupes by owner — so the beaten
receipt stays stored and readable at `?verdict=<reel id>`.

**A row deleted before that cure cannot be re-queued, because it is not there.** It is gone from the
live ledger and from every nightly backup (the backups are taken after the fact; `ledger-2026-09-18.db`
already reflects the deletion). The only surviving copy is the rider's own submission in its arena
directory. So the recovery is a re-delivery:

1. Confirm the cure is deployed (`scripts/deploy.sh`), or the re-delivered reel will be deleted again
   the moment it verifies.
2. Re-POST the original `submission.json` — byte-identical, including its tape. Heat rigs carry
   `deliver.mjs` for this: one reel at a time, 15-minute cadence, a `429` is not a delivery so the
   same reel is retried rather than skipped.
3. Mind the submission cap (F-HEAT14-7): 30 per `anonId` per hour, and the counter's TTL is refreshed
   on every accepted submission, so under heat traffic the window never rolls. A re-delivery sweep
   belongs **after** the last live ride and an hour after the last accepted submission.

The re-delivered row is a new `submittedAt` — the county's first-secure receipts are history and do
not move (F-RECEIPTS-1), so a re-delivery cannot restore a first-secure date that a deletion took.
That asymmetry is the cost of the deleted-row class and the reason the cure matters more than the
recovery.
