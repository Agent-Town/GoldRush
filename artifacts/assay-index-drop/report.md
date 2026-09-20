# F-HEAT14-6 — the county was deleting honest standings, not losing them

Written 2026-09-19 by the implementer for `tasks/assay-index-drop-f-heat14-6.md`, branch
`fix/assay-index-drop`, base `21648cdcff9cafc1a44a56eb94c15eb9bf5d2a14`.

**The mechanism in one sentence:** the verdict path enforced "one standing per rider" by DELETING a
row from storage — `functions/api/standings.ts:368-375` **as it stood at base `21648cdc`**, which on a `verified` verdict
looked for another verified row with the same `standingOwnerKey` and wrote the board back as either
`rows.filter((candidate) => candidate !== row)` (the row it had just verified, gone) or the mirror
(the incumbent, gone) — so eleven of heat 14's accepted reels were verified by the assayer and
removed by the door in the same request, and every later `?verdict=<reel id>` answered
`assay_not_found` because the row was no longer on the board.

## 1. The hypothesis the master named, and why it is not the cause

The master's first hypothesis was the `assay-queue-index` KV race: one key, read-modify-written per
accepted POST, last-writer-wins, so two POSTs inside one propagation window drop a locator. That race
is REAL — the code says so in its own voice at `standings.ts:1305` ("ponytail: one KV key cannot
serialize concurrent writes"), it is reproduced deterministically in `scripts/test-standings.mjs`
`checkAssayIndexRace`, and that test also proves `onRequestAssayQueue` heals it when the envelope
ages past `ASSAY_INDEX_MAX_AGE_MS` (15 min).

It is not what took heat 14's twelve, and three independent instruments say so:

| instrument | what it shows |
| --- | --- |
| the assayer's journal, `journalctl -u goldrush-assay --since 2026-09-18` | it REACHED and VERIFIED nine of the twelve by name — e2-incline 00:56:41Z, e4-gusher-county 02:22:33Z, e7-dead-band 02:46:13Z, e7-echo-canyon 03:06:46Z, e9-devils-alley 04:22:00Z, e5-flotilla 05:19:10Z, e5-regatta 05:42:20Z, e6-half-life-hollow 06:21:56Z, e10-last-claim 07:21:11Z. A row the queue never served cannot be verified. |
| the live ledger, `sqlite3 -readonly /opt/goldrush-ledger/ledger.db` | `standings:s2:epoch-2-steamworks:e2-incline` holds exactly two rows today: the SAME rider's era-5 reel (`agent-f5032288...`, verified, w12/200g) and another rider's era-5 reel (w12/88g). Heat 14's `agent-85fac865...` is absent. |
| the receipts delta, `receipts-before.json` / `receipts-after.json` | of the 18 boards that GAINED a standing, 13 lost exactly one retired reel; of the 12 that DROPPED, **all 12** held their retired count unchanged. 18/12 with no exception either way — the two arms of one `if`. |

The heat-14 note read the drop as scaling with submission rate. It scales with something else that
also grew: how many boards this rider already held a verified row on. Heat 13 rode 27 of 36 and heat
12 before it, so heat 14 met an incumbent on more boards than heat 13 did.

Heat 13's own note already located it and nobody followed the sentence: *"in the block-1 VERDICT
SWEEP, three accepted submissions (e4-boneyard, e4-dust-flats, e5-stillwater) dropped from the assay
index again"* (F-HEAT13-2). And heat 12's operator diagnosed it correctly the first time — its note
records that the first write-up "blamed the one-standing-per-owner retention rule
(`rankedRows` / `retainPartition`)" and then RETRACTED that in favour of the KV note. The retraction
was the error. The delete branch landed in `53450564a` on 2026-09-04, one day before heat 12: the
whole chain F-HEAT12-4 -> F-HEAT13-2 -> F-HEAT14-6 is one bug with one birthday.

## 2. The mechanism, with the code

```ts
// functions/api/standings.ts, the assay-verdict handler, AS IT STOOD AT BASE 21648cdc.
// Every coordinate in this block is a BASE coordinate; on this branch the site is :368-395.
const competing = verdictValue === 'verified'
  ? rows.find((c) => c !== row && sameStandingOwner(c, row) && c.assay === 'verified')   // :368-369
  : undefined;
const verifiedRows = competing && compareScores(competing, row, locator.contractId) < 0
  ? rows.filter((candidate) => candidate !== row)                                        // :371-372
  : verdictValue === 'verified'
    ? rows.filter((c) => c === row || !sameStandingOwner(c, row) || c.assay !== 'verified') // :374
    : rows;
const next = retainUnranked(verifiedRows, locator.contractId);                            // :376
await kv.put(boardKey(locator.epochId, locator.contractId), JSON.stringify(next));        // :377
```

* `standingOwnerKey` is `anonId \n rotationId \n riderCount` (`:1171-1173` on this branch). The heat-12/13/14 rider
  is one `anonId` — `9677a7e7ba4a1704cafa3f083b74e935` in all three — so every board it had ridden
  before held a `competing` row.
* `compareScores` (`:1376-1388` on this branch) falls through to `submittedAt`, so an **exact tie also deletes the
  newcomer** (the older row sorts first). That is e4-boneyard and e5-stillwater, both w12/200g in
  heat 13 and heat 14 alike.
* The row is deleted from the blob. `?verdict=` (`:633` on this branch) then answers `assay_not_found` on `!row`,
  which is why the symptom reads like a queue miss.
* The door still answered the assayer `{"ok":true, locator, assay:"verified"}` — the verdict it
  RECORDED, on a row it had just dropped. The assayer's journal and the county disagreed by design.

Two things make it indefensible rather than merely surprising:

1. **The deletion bought no board change.** `rankedRows` (`:1151-1159` on this branch) already dedupes by
   `standingOwnerKey` after sorting — landed in the SAME commit — so the published board shows one
   row per rider whatever storage holds. The write-side deletion only destroyed the losing receipt.
2. **`compareScores` knows nothing about rankability.** Heat 14's incumbents were era-5 rows that
   `isRankedRow` (`:1161-1165` on this branch) can never publish, so the county threw away the only row on the
   board that could have stood. That is why `e2-incline`'s published board is `[]` today while two
   era-5 reels sit in its blob — the county has a winner it deleted and two reels it cannot rank.

### The twelve, with their timeline

| contract | heat-14 score | door receipt | assayer verdict (2026-09-18) | incumbent that beat it | today |
| --- | --- | --- | --- | --- | --- |
| e2-incline | w12/129g | `stored:true rank:1 crown` | verified 00:56:41Z | heat 13 w12/200g (era 5) | `assay_not_found` |
| e4-gusher-county | w12/135g | `stored:true rank:1 crown` | verified 02:22:33Z | heat 13 w12/170g | `assay_not_found` |
| e7-dead-band | w20/5g | `stored:true rank:1 crown` | verified 02:46:13Z | heat 13 w20/335g | `assay_not_found` |
| e7-echo-canyon | w20/200g | `stored:true rank:1 crown` | verified 03:06:46Z | heat 13 w20/295g | `assay_not_found` |
| e9-devils-alley | w20/200g | `stored:true rank:1 crown` | verified 04:22:00Z | an earlier heat's row | `assay_not_found` |
| e5-flotilla | w12/200g | `stored:true rank:1 crown` | verified 05:19:10Z | an earlier heat's row | `assay_not_found` |
| e5-regatta | w12/200g | `stored:true rank:1 crown` | verified 05:42:20Z | an earlier heat's row | `assay_not_found` |
| e6-half-life-hollow | w20/200g | `stored:true rank:1 crown` | verified 06:21:56Z | an earlier heat's row | `assay_not_found` |
| e10-last-claim | w8/90g | `stored:true rank:1 crown` | verified 07:21:11Z | an earlier heat's row | `assay_not_found` |
| e4-boneyard | w12/200g | `stored:true rank:1 crown` | (after the 09:19Z restart) | heat 13 w12/200g — an exact tie | `assay_not_found` |
| e5-stillwater | w12/200g | `stored:true rank:1 crown` | (after the 09:19Z restart) | heat 13 w12/200g — an exact tie | `assay_not_found` |
| e10-archive-world | w12/200g | `rate_limited` (F-HEAT14-7) | verified 12:17Z after re-delivery | none (first-ever secure) | **verified, rank 1** |

So the honest count is **eleven deleted, not twelve**: `e10-archive-world` was a rate-limit casualty
whose re-delivery at 12:15:16Z landed on a board with no incumbent, verified two minutes later, and
stands. It is the control: the same rider, the same rig, the same day — the only difference is that
it had nothing of its own to lose to.

## 3. The cure

`functions/api/standings.ts`, the verdict path: the nine lines above become

```ts
const next = retainUnranked(rows, locator.contractId);   // :395 on this branch
```

The verdict path may re-rank a board and may never shrink it. One standing per rider stays enforced
where it is published (`rankedRows`), the beaten receipt stays stored, and `?verdict=<reel id>`
answers `verified` for it instead of 404. `retainUnranked` bounds the blob exactly as it does on the
POST path (ranked survivors + up to `MAX_ROWS` others per partition), so nothing grows unbounded.

**Nothing published changes.** The board arm of the new guard is the control: it was GREEN on the
base tree before the cure and is green after — one rider, one published standing, the best one.
`npm run test:stats` (320 checks on the KV backend, 320 on sqlite) is green on both trees, including
`checkVerdicts`, `checkAssayIndexRace`, `checkLineageReassay` and the `53450564a` assertion "a worse
verified snapshot cannot erase the prior personal best" — which now passes because the better row
still RANKS first, not because the worse one was destroyed.

### One published number DOES move, and it should (F-HEAT14-5's other half)

`retiredCount` becomes monotonic. Before the cure, when a rider's new verified row beat its own
era-5 incumbent, that incumbent was deleted and the board's retired count FELL — which is exactly
the non-monotonic counter F-HEAT14-5 recorded as a puzzle (69 -> 56 across heat 14, "13 of the 18
boards that gained a row lost exactly one retired reel each"). After the cure the incumbent stays
and the count holds. So a post-deploy board may report a HIGHER `retiredCount` than the same board
did before, for the same reels. That is the county counting what it kept; the old number was
counting a deletion. Declared here so a drain reads it as the cure working rather than a regression.
The era-5 arm of the guard pins it (`retiredCount: 1` with the incumbent kept).

### One thing left alone, reported (F-HEAT14-6b)

The assay slip's `ranked` field is `isRankedRow(row)` — "this row is ELIGIBLE to rank" — not "this
row is published". With two same-owner verified rows both stored, both answer `ranked: true` while
the board shows one. The looseness predates this cure (a pending row of the same owner already
answered `true`), and narrowing it would change a published meaning the heat rigs read
(`repoll-verdicts.mjs` prints it). Pinned as-is in the guard; an owner/attended call.

## 4. The recovery verb

`POST /api/standings/reassay` gains `"storedUnassayed": true`. Full page:
`docs/ops/assay-recovery.md`.

* **Index only.** Every `pending` row with a reel gets its locator back into `assay-queue-index`. No
  row is rewritten, so `submittedAt` — the first-secure date — is untouched **by construction**, and
  no `lineage` mark is invented (a row that was always pending was never re-queued by a composition
  change, so ADR-004's lineage vocabulary does not apply to it).
* **Idempotent and honest.** `requeued` counts only the locators that were MISSING; a second call
  answers `0` and writes nothing.
* **Response shape unchanged:** `{ ok, epochId, contractId, requeued, requeuedAt }`. No new refusal
  reason — a non-boolean flag is `bad_reassay`, like every other malformed field.
* It cures the OTHER class: a row stored and pending that the index lost. `onRequestAssayQueue`
  heals that on its own after 15 minutes; this is the same repair on demand, which is what an
  operator wants at the end of a heat.

### The dry run against the heat-14 receipts (read-only, live API, 2026-09-19)

`node artifacts/assay-index-drop/recovery-dry-run.mjs` — three GETs per reel, no key, no POST.
Output: `recovery-dry-run.json`, `recovery-dry-run.summary.json`.

```
{"reels":31,"verified":19,"pending":0,"storedUnassayed":0,
 "deletedAtVerdict":11,"neverAccepted":1,"sweepsNeeded":0,"reDeliveriesNeeded":11}
```

* **19 stand** (the 18 in the note plus `e10-archive-world`, re-delivered after the note's snapshot).
* **0 need the sweep today.** The sweep's class is a slip that still reads `pending`, and no
  heat-14 reel does. The `storedUnassayed` verb would be a no-op against production right now —
  which is itself the finding: there is no stored-but-unqueued row to recover, because the rows
  were not stored-but-unqueued, they were deleted.
* **11 need a re-delivery**, because a deleted row cannot be re-queued: it is gone from the live
  ledger AND from every nightly backup (`ledger-2026-09-18.db`, taken 02:37:59Z, already shows
  e2-incline's blob without it — the backup ran after the 00:56:41Z verdict that deleted it). The
  only surviving copies are the arena's own `rides/<contract>/submission.json`.
* **1 was never accepted**: `e9-dome-basin`, refused by nginx with HTTP 413 before the door saw it
  (F-HEAT14-4). Not a county loss; a first delivery when its transport is fixed.

**What the attended session runs after `scripts/deploy.sh`:**

```
# 1. prove the fix is live and the board is whole (read-only, ~40 s)
node artifacts/assay-index-drop/recovery-dry-run.mjs

# 2. re-deliver the eleven, one at a time, a 429 is not a delivery (the same reel is retried,
#    never skipped). deliver.mjs already encodes that rule; its first argument is the gap in
#    SECONDS. 900 is the cadence the heat's own operator settled on.
cd artifacts/gauntlet-heat14-e3949bfa && node deliver.mjs 900 \
  e2-incline e4-boneyard e4-gusher-county e5-flotilla e5-regatta e5-stillwater \
  e6-half-life-hollow e7-dead-band e7-echo-canyon e9-devils-alley e10-last-claim

# 3. optional belt-and-braces once the deliveries are in: an index sweep per board.
#    Answers requeued:0 on a whole index and writes nothing.
curl -sX POST https://agenttown.app/api/standings/reassay \
  -H "x-assay-key: $ASSAY_WORKER_SECRET" -H 'content-type: application/json' \
  -d '{"epochId":"<epochId>","contractId":"<contractId>","reason":"F-HEAT14-6 post-deploy sweep","storedUnassayed":true}'

# 4. re-run the dry run; expect verified 30, deletedAtVerdict 0, neverAccepted 1 (dome-basin).
```

Order matters: step 2 before the cure is deployed re-delivers rows the door will delete again.

The cap is not in the way of this recovery, and the arithmetic should be said rather than assumed:
eleven deliveries spend eleven of the thirty per-`anonId` slots, and the window is empty today —
the last accepted submission was 2026-09-18T12:15:16Z, so the counter key expired an hour later.
At the 900 s cadence above the sweep is about 2.75 hours of wall, all of it inside one window.
F-HEAT14-7 bites the NEXT 37-board heat, not this repair.

A re-delivered row is a NEW `submittedAt`. First-secure receipts are history and do not move
(F-RECEIPTS-1), so a re-delivery cannot restore a first-secure date a deletion took. That asymmetry
is the real cost of this bug and the reason the cure matters more than the recovery.

## 5. F-HEAT14-7 — the submission cap, measured, NOT changed (owner ruling)

Measured in the source, not inferred:

* `MAX_REQUESTS_PER_ANON = 30`, `MAX_REQUESTS_PER_IP = 120`, `RATE_TTL_SECONDS = 3600`
  (`functions/api/standings.ts:166-168`), bumped together in `Promise.all` at `:993-994`; either
  refusal answers `429 rate_limited`.
* `bumpCounter` (`functions/api/_ratelimit.ts:6-12`) refuses at `count >= limit` **before** the put,
  so a refusal does not extend the window — and on every ACCEPTED submission it re-`put`s with a
  fresh `expirationTtl: 3600`. The window is therefore a sliding hour from the last ACCEPTED
  submission, not a fixed hour. Under heat traffic it never rolls and "30 per hour" is **30 per
  heat**. Heat 14 used exactly 30 and its 31st submission was refused.
* Because both counters bump unconditionally in the same `Promise.all`, an IP-cap refusal still
  consumes an anon slot (and the reverse). Minor, but it means the anon budget is not exactly 30
  accepted submissions under contention.

**Three options for the owner, with blast radius:**

1. **Raise `MAX_REQUESTS_PER_ANON` above the board count** (37 today; 60 leaves room for re-POSTs,
   120 matches the per-IP cap). *Blast radius: one constant in `standings.ts`. No semantics change,
   no other door touched. `anonId` is a client-declared 32-hex string, so it was never an abuse
   control on its own — the per-IP cap is, and it stays. Smallest diff, ships today.*
2. **Stop refreshing the TTL so the hour is a real hour.** *Blast radius: `_ratelimit.ts` is shared
   by six doors — standings (IP + anon), accounts request-code (email + IP), telemetry, bug reports,
   redeem, refusals — so this changes the limiter for all of them, including a genuine abuse control
   on account codes. It needs a stored window start (KV cannot read a key's remaining TTL), i.e. the
   counter value becomes a record, and every caller's tests move with it. It is the option that
   actually fits a heat's shape: 37 submissions over heat 14's 8.15 hours is 4.6/h, far under 30.*
3. **Exempt a declared operator harness.** *Blast radius: largest. `stack.harness` is rider-declared
   and forgeable, so the exemption must be authenticated — the assayer's shared secret (as
   `assayRequest` already does) or a new operator key. That puts a rate-limit bypass beside the
   public submission door, and a leaked key is then an unlimited write path. Only worth it if the
   county expects many heats from many operators.*

Recommendation for the attended session to carry: **1 before the next heat, 2 when someone is
willing to move six doors' limiters together.** Neither is needed for the F-HEAT14-6 recovery — 11
deliveries fit inside today's empty window. 1 is the cheap unblock for a 37-board heat; 2 is the
correct shape and can follow it.

## 6. The guard

`scripts/assay-standing-drop.test.mjs`, joined to `test:node-guards` stage 1 in `package.json`
(next to `scripts/assay-replay.test.mjs`).

| arm | base `21648cdc` | after the cure |
| --- | --- | --- |
| a verified standing the rider has already beaten is kept, not deleted | RED (1 stored row, expected 2; the slip 404s) | GREEN |
| the published board still shows exactly one standing per rider | **GREEN** (the control: nothing published changes) | GREEN |
| an identical score does not delete the newcomer either | RED (1 stored row, expected 2) | GREEN |
| an incumbent that can never rank cannot delete a current-era standing | RED (1 stored row, expected 2) | GREEN |
| a stored row missing from the assay index is re-queueable without losing its `submittedAt` | RED (`bad_reassay` 400) | GREEN |
| the stored-unassayed sweep restores every row a concurrent burst cost the index | RED (`bad_reassay` 400) | GREEN |

**Counts: 1 of 6 green on the base tree, 6 of 6 after.**

The last arm also measures the index race the master hypothesised, six concurrent cross-board POSTs
served one pre-burst index snapshot: **1 of 6 locators survives, 6 of 6 ROWS are stored**, and the
sweep restores all six. That is the honest statement of the race — it costs the queue, never the row.

## 7. Gates

| gate | result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run build` | green |
| `npm run test:stats` (`test-stats` + `test-standings` + `test-ledger-worker`) | green — 87 / 320 kv / 320 sqlite / 26 |
| `npm run test:mp` | green — 466 checks |
| `npm run test:accounts` | **RED on the base tree and after, identically**: `The entry-point file at "../../../functions/api/_account-registry.ts" was not found.` That file has never been tracked in this repo (`git log -- functions/api/_account-registry.ts` is empty; `git cat-file -e 21648cdc:...` fails), so the red is pre-existing, environmental and untouched by this branch, exactly as the master predicted. |
| `scripts/assay-standing-drop.test.mjs` | RED 5/6 on base, GREEN 6/6 after |
| `GR_GUARD_NO_ARTIFACT=1 node scripts/run-guards.mjs --changed-since 21648cdc` | selected `test:node-guards, test:power-budget, test:task-guards, test:citations, test:gate-callers` + `test:stats, test:accounts, test:mp` (1 file in `functions/**`). Two of its gates came back red; both are attributed below. |

### The two run-guards reds, attributed

This host was shared with other agents' guard batteries throughout. The battery harness measures
that itself and said so: `CONTENDED — 4 concurrent batteries` at line 5 of the uncapped run, and by
the end `ps` counted **eight** concurrent `run-node-guards` roots. Neither red is a verdict on this
branch.

**`test:power-budget`, `rc=1`.** It asserts a wall-clock p95 for `PowerGraphSystem.step` against a
0.500 ms cap, importing only `src/systems/PowerGraph.ts`. `git diff 21648cdc --name-only -- src/`
is **empty** — this branch touches no `src/` file, so the measured code is byte-identical to the
base and the number cannot be a consequence of the change. Measured, all on the same branch tip:

| reading | p95 | batteries on the box |
| --- | --- | --- |
| inside run-guards | 0.904 ms | ~4 |
| alone, contended | 7.795 ms | ~5 |
| alone | **0.394 ms PASS** | 6 |
| alone | **0.398 ms PASS** | 6 |
| alone | **0.379 ms PASS** | 6 |

A 20x spread on identical code is the instrument reading the machine's load, not the branch.

**`test:node-guards`, `rc=signal:SIGTERM` at 900 s.** That is `run-guards.mjs:256`'s own 15-minute
per-gate `spawnSync` timeout, and a signal-killed child reports no verdict at all (the runner's own
comment at `:263` says exactly that). Re-run UNCAPPED on the branch tip, the battery produced 434+
test results with **one** failure —
`scripts/agent-reels.test.mjs` :: "agent reel validation reuses the door bounds and CLI tape content
stays deterministic under unique ids", 51.5 s. That file is the one guard in the battery that reads
the door's own bounds, so it was the red worth chasing. Run ALONE on the same tip it is **GREEN in
13.4 s** (`node --test scripts/agent-reels.test.mjs` -> `tests 1, pass 1, fail 0`) — a 3.9x wall
difference and a pass, i.e. the contention class, not the door. The uncapped battery was still
running under eight-way contention when this branch was finished; its verdict, whenever it lands,
should be read with that count in hand.

## 8. Production was read, never written

Every droplet touch was a read: `ls`, `stat`, `journalctl -u goldrush-assay`, `sqlite3 -readonly`.
Cloudflare state was read through the public API only. No restart, no file edit, no re-queue verb, no
deploy, no `wrangler` write. The rate limiter is reported in §5 and unchanged in code.

One thing worth recording for whoever reads the runbook next: **`/api/standings*` is served by the
droplet's local ledger on `127.0.0.1:8791`, not by Cloudflare KV** — `ops/droplet/agenttown.app.nginx.conf`
line 2 ("L3 cutover 2026-08-23"). The store is `/opt/goldrush-ledger/ledger.db` (`SqliteStorage`,
a KV-shaped table) with nightly `VACUUM INTO` backups in `/opt/goldrush-ledger/backups/`.

That does NOT make the index race impossible, and the temptation to say so should be resisted:
SQLite serializes each STATEMENT, while `syncAssayBoardIndex` is a read and a write in two separate
statements, so two concurrent request handlers in one Node process can still interleave and lose a
locator. What it does change is the propagation window — a local WAL read sees the previous write
immediately, where Cloudflare KV can serve a stale value for up to a minute — which shrinks the race
from "a whole propagation window" to "the microseconds between two statements in one handler". The
race is real, it is guarded and self-healing, and it is not what took heat 14's eleven; the evidence
for that is the assayer's journal and the receipts' 18/12 split, not the storage engine.
