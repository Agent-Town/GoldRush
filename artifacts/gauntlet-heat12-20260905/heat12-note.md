# Heat 12 — the mechanic-changed sweep — operator's note

Operator: an attended Claude agent hosting headless `claude -p` rides from one detached arena.
Rig: **Claude Opus 5** (`claude-opus-5`) via Claude Code CLI **2.1.257**, one ride at a time under
`nice -n 5` because other implementers shared this host. Started 2026-09-05 15:16Z, stopped
2026-09-05 21:55Z (**6 h 39 min** wall clock against a whole-night budget; the last ride ended 21:35Z, the rest is the closing sweep). Full per-ride record:
`matrix.md`. Blockers: `blockers/*.md`. Rig: the `*.mjs` here, adapted from heat 11 and cited in §7.

---

## 1. The arena and the era gate — proved against the door, not read from a file

| fact | value |
|---|---|
| live build | `038cc280 (archive: pruned by the A3 rewrite)`, builtAt `2026-09-05T14:14:13Z` (`https://agenttown.app/goldrush/version.json`) |
| arena | `/tmp/heat12-038cc280`, `git worktree add --detach 038cc2809f317fa61fec25fa5765ff37c48b8803 (archive: pruned by the A3 rewrite)`, `npm ci` (57 packages), branch `heat12/opus-sweep` |
| arena `computeEngineHash` | `86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b` |
| era gate | **PASS** |

The gate needed care, and this is the first thing a future heat should copy. `86e53f37…` **is** the
current era-5 pin in *main's* `assets/engine-era.json` — but it is **not** in the *arena's* copy,
because the bookkeeping commit that appended it (`95fc285cf`, "era-5 pin 86e53f37; deployed at
038cc280 (archive: pruned by the A3 rewrite)") landed one commit *after* the deploy it describes. Reading the arena's file would have
produced a false STOP; reading main's would have been trusting a file about a server.

So the gate was **proved against the live door**: the skew probe came back `assayEra: true`,
`assay: verified`, `assayHash fnv1a32:cc026656` — **byte-identical to heat 11's probe** — and
`ranked: false` (`harness: operator-probe`, which `public/skill.md:52` defines as "verified but
never ranked"). The probe also re-ran heat 11's verified debut orders through this arena and
reproduced `eventLogHash fnv1a32:a93d1bbc` exactly: **simulation behaviour is unchanged across the
entire pin lineage**, including this week's thirteen mechanic changes and the lighting/sampler work.
`viewVersion` moved 1 → 2. The probe tape also carried `durationTicks 9001` with its last entry at
tick 9000 — a shape the pre-F-HEAT11-1 door refused. **The fencepost cure is live.**

---

## 2. The receipts delta — measured from the live API, verified rows only

`receipts-before.json` (15:12:47Z) and `receipts-after.json` (21:16:55Z) both query
`https://agenttown.app/api/standings` for **all 36 board contracts** and count only rows whose
`assay` is `verified`.

> ### **5 unclaimed → 4 unclaimed. One contract claimed for the first time in county history: `e8-mare-claim`.**

| | before (2026-09-05 **15:12:47Z**) | after (2026-09-05 **21:16:55Z**) |
|---|---|---|
| board contracts | 36 | 36 |
| **claimed** (≥1 verified row) | **31** | **32** |
| **unclaimed** | **5** | **4** |
| the unclaimed set | `e1-drill-yard` · `e3-canyon-works` · `e7-relay-valley` · `e8-mare-claim` · `e9-dome-basin` | `e1-drill-yard` · `e3-canyon-works` · `e7-relay-valley` · `e9-dome-basin` |

**Newly claimed: `e8-mare-claim`** — Claude Opus 5, w20, board gold 1180, first verified row in county
history for that contract. The rig's own margin note: *"wide, not thin — the hero held its full
running maximum of 175 HP from t = 270 to t = 448, finished 92.6/175, all ten works stood unwrecked at
the bank, and `threats.alive` peaked at 34 against a published 60 cap; the thin part was only the
opening, where 30 seconds of quiet buys exactly one 50-gold turret."*

**Ten heat-12 rows now stand on the board, every one of them at rank 1** (`harness:
heat12-operator`), which is the part the unclaimed count cannot show:

| contract | heat-12 row | what it replaced |
|---|---|---|
| `e8-mare-claim` | rank 1, w20 / 1180 g | **nothing — first secure in county history** |
| `the-claim` | rank 1, w10 / 720 g | took rank 1 from a heat-11 `claude-code-cli` row (6 other species below) |
| `e3-moth-season` | rank 1, w12 / 530 g | its own heat-11 Opus row, on the re-authored map |
| `e7-echo-canyon` | rank 1, w20 / 870 g | its own heat-11 Opus row |
| `e7-dead-band` | rank 1, w20 / 1470 g | its own heat-11 Opus row |
| `e5-stillwater` | rank 1, w12 / 200 g | its own heat-11 Opus row, on the crewed storm |
| `e8-far-side` | rank 1, w20 / 1470 g | its own heat-11 Opus row, with SuitAir composed |
| `e8-low-orbit` | rank 1, w20 / 1470 g | its own heat-11 Opus row, with SuitAir composed |
| `e4-boneyard` | rank 1, w12 / 475 g | its own heat-11 Opus row, with Vehicles composed |
| `e4-gusher-county` | rank 1, w12 / 370 g | its own heat-11 Opus row, with Vehicles composed |

Two more were **won, submitted and accepted and are still not on the board** — `e7-relay-rush`
(w20 / 200 g) and `e4-dust-flats` (w14 / 55 g, POST answered `rank: 1, decidedBy: "crown"`) — because
their assay locators were dropped. See **F-HEAT12-4**; both are owed a re-POST, and the county's own
rate limit (12 POSTs per `anonId` per hour, `functions/api/standings.ts:145`) blocked the retry inside
this session's window.

**Final state of the two, re-checked at 21:50Z:** `e7-relay-rush` shows only heat 11's
`claude-code-cli` row at rank 1; `e4-dust-flats` shows heat 11's two `claude-code-cli` rows. The
`e4-dust-flats` re-POST *did* take (its slip read `assay: pending, ranked: true`) and then the
locator was dropped a second time — which is corroboration, not a contradiction: the same race can
eat the same reel twice. **Both are owed a re-POST once the rate-limit hour rolls.** Their tapes,
submissions and POST responses are on disk under `rides/e7-relay-rush/` and `rides/e4-dust-flats/`;
nothing needs re-riding.

That single first-secure is the honest headline, and it undersells the night in one direction and
oversells the board in another. Both need saying:

- **Eleven already-claimed contracts got a current-era receipt they did not have** — nine of them
  standing at rank 1 right now, two owed a re-POST. Those receipts do not move the unclaimed count,
  because the maps were already claimed; but the point of the heat was that *their old receipts
  described old maps*, and now they do not.
- **Three of the four still-unclaimed contracts are not "not yet". They are answered**, with
  evidence, in `blockers/`. One of them is not a contract at all, one needs a one-line repricing, and
  only two are still open questions of play.

### Per-era table

| era | contracts | claimed after | unclaimed after | heat-12 rides | heat-12 rows now standing |
|---|---|---|---|---|---|
| E1 Frontier | 6 | 5 | `e1-drill-yard` *(not a contract)* | 4 (`the-claim`, `e1-baron`, `e1-night-shift`, `e1-drill-yard`) | 1 |
| E2 Steamworks | 4 | 4 | — | 1 (`e2-hill-mine`) | 0 |
| E3 Voltage | 4 | 3 | `e3-canyon-works` | 3 (`e3-moth-season`, `e3-canyon-works` ×2) | 1 |
| E4 Motor | 4 | 4 | — | 4 | 2 (+1 dropped) |
| E5 Deepwater | 4 | 4 | — | 1 (`e5-stillwater`) | 1 |
| E6 Atomic | 3 | 3 | — | 0 *(nothing changed there this week)* | 0 |
| E7 Signal | 4 | 3 | `e7-relay-valley` | 5 (all four, `relay-valley` ×2) | 2 (+1 dropped) |
| E8 Orbital | 4 | 4 | — | 4 | 3 |
| E9 Redfields | 2 | 1 | `e9-dome-basin` | 2 (`e9-dome-basin` ×2) | 0 |
| E10 Deepsky | 1 | 1 | — | 0 | 0 |
| **total** | **36** | **32** | **4** | **24 rides** | **10** |

---

## 3. The four that remain, and what each one actually is

| contract | class | the answer |
|---|---|---|
| `e1-drill-yard` | **NOT A CONTRACT** | `twist.secureWave = 0`; `RunManager.ts:300` returns early so `run_secured` never fires; `gr-sim.mjs:108-111` caps the ride at wave 2; the door refuses a POST with `training_ground` (`standings.ts:766`) and answers **HTTP 400 `bad_contract`** to a GET — the only one of 36 board rows that does not answer 200. **Corrective is bookkeeping, not engine.** |
| `e3-canyon-works` | **UNWINNABLE as shipped — and it is ONE NUMBER** | `Balance.economy.bankCap` is **200**; the connect latch costs **330 g** of `sentry_beacon` (`maxCount: 6`, every unit pre-spent by the objective). **The purse cannot hold the tour**, so it must be bought in two descents, and two descents (≥ 32 s each) + an 81 wu opening commute + 330 g at the seams' hard 2.07 g/s ceiling = **≥ 208 s against a 180 s deadline**. No income speed can fix a cap. **Corrective is a one-line repricing.** See the retraction below. |
| `e7-relay-valley` | **HARD** | The map moved a long way toward winnable this week: the objective latch now discharges at **t = 11.6 s** where heat 11 reached wave 4 with no playbook verb at all. Best line **w15 / 460.3 s**, ~80 seconds of HP short of a wave-20 gate. **No corrective proposed.** |
| `e9-dome-basin` | **HARD, plus an engine defect that would refuse the win** | Six controllers over two heats, best **w16**; the second attempt *priced the trade* (mended bait freezes the purse at 1.09 g/s, unmended runs 2.16 g/s and the fort is eaten to 20/20 wrecked). And the best policy's reel is **621,674 B against a 592,544 B ceiling** — see F-HEAT12-2. |

### The retraction that matters: `e3-canyon-works` was half wrong, and the second ride fixed it

Generations 12 (heat 11) and 37 (heat 12, attempt 1) **both** died at wave 3, t ≈ 100, in seven
configurations between them, and **both reported the Canyon Works as a survival wall as well as an
economy wall.** The first version of `blockers/e3-canyon-works.md` said so, in this operator's words,
with the HP curve attached.

**Generation 60 — the one second attempt this heat spent on it — rode to wave 20 / 600.000 s, hero
78/150, with all six beacons built and BOTH galleries powered 2/2.** Survival is not a wall on this
map. The objective is buildable. What is not possible is building it *before t = 180*, and the reason
is a cap, not a rate: 330 gold will not fit in a 200-gold purse, so the tour takes two descents.

Three things follow, and they are the reason a second attempt with a changed plan is worth its wall
clock: the diagnosis went from "four constants conspire" to **one number**; the corrective went from
three options to **one line**; and both of generation 12's open caveats are now closed by
measurement rather than by argument. A heat that had stopped at one ride each would have filed a
confident, well-evidenced, half-wrong finding.

---

## 4. What the mechanic changes actually did — the field's answer

**E7 is transformed, and it is the clearest positive result of the heat.** The `e7-playbook-rows`
drain added `PLAYBOOK_USE` and the signal-system composition; `e7-player-playbook-parity` made
`E7PlaybookLatch.ts` the single four-rule secure decision. Measured against heat 11 on the same
seeds:

| contract | heat 11 | heat 12 |
|---|---|---|
| `e7-relay-valley` | not secured, **w4** | not secured, **w15**, latch discharged at t = 11.6 s, `relaysLitByProgram: ['relay-site-r3']`, `programRuns: 1` |
| `e7-relay-rush` | secured (after the F-HEAT11-1 cure admitted the refused reel) | secured again, w20 |
| `e7-echo-canyon` | secured w20 | secured w20 and **took rank 1 from heat 11's own row** |
| `e7-dead-band` | secured but never submitted (F-HEAT11-2) | secured w20, verified, **submitted this time** |

The era's audit row said "RESKIN — no E7SignalSystem or substitute headless". That is now false by
measurement on all four maps.

**E8's air is composed, and on the Mare Claim it costs exactly one pan.** The first-secure ride's own
paragraph is the finding: `now.air` publishes a full suit dial (60 s capacity, 1 s/s drain outside a
dome, 4/s refill inside), `domes[]` per pad, and `regolith { grounds: 6, required: 1, … }` — and no
secure is offered at any wave until `regolith.complete`. But **`required` is 1**, so the whole air
wall is discharged by a single `HARVEST` in the opening seconds, after which *"the suit sat empty for
488.8 of 600 seconds with 197 breathless pans and nothing whatsoever happening — the consumer damages
nothing and mints nothing once the gate is shut."* The mechanic is real, composed, and load-bearing
for **one order**. That is a design question for the owner, not a defect: see F-HEAT12-6.

**E4 held under the vehicles change on three maps of four, and regressed on one.**
`e4-boneyard`, `e4-dust-flats` and `e4-gusher-county` all secured. `e4-long-road` — which heat 11
secured at w12 — stalled at **w5**, and the rider priced why: the six harvest anchors are strung 60
units apart along a 400-unit road, so when the anchor nearest the claim depletes on its 20 s respawn
the next live one is 90–150 units away; nearest-first walked the Prospector to x = −30 for five gold
at ~1.0 g/s and the fourth rung was unbought when the wave-4 pulse landed. It called that its own
budget, not a wall, and **declined to declare a scored attempt.**

**E5's crewed Stillwater still secures.** `e5-stillwater-front-crew-2` put a corsair skiff into the
32-second storm; the rig secured at w12 / 200 g on the first scored attempt, verified, rank 1.

**E3's Moth Season is no longer a cost with no benefit.** `d07a0e2e7` rewrote the contract row into a
sabotageable light circuit as pure data. The rig secured w12 / 200 g and took rank 1 — *"wide on
health and thin on the fort: the hero never dropped below its running maximum of 100 across all 74
views and finished 119/175 at level 16, but all six beacons were wrecked by the bank with 63 threats
alive."*

---

## 5. Findings

### F-HEAT12-1 — the F-HEAT11-2 cure paid for itself on the second ride of the heat, and four more times after

Heat 11's operator discovered scored tapes by the **filename** pattern `^attempt-\d+-tape\.json$`
and never read the outcome file's own `tape` field, so a rig that lawfully promoted a differently
named tape was silently reported "NOT SECURED" — it cost `e7-dead-band` a claim for a day.

The heat-12 rig reads the tape id **from the tape's own JSON** and takes the scored tape from the
rig's own declaration. It mattered immediately and repeatedly: `e7-relay-valley` (gen 38, promoted
`tune-3-tape.json`, `discoveredBy: outcome-file`), `e7-echo-canyon` (`tune-1-tape.json` — **a secure
and a verified row heat 11's rule would have thrown away**), `e9-dome-basin` twice, `e4-long-road`.
**Five of twenty-four rides promoted a non-`attempt-N` tape.** Keep this cure.

### F-HEAT12-2 — the reel BYTE budget refuses a policy class, not a size — and it is still open

Heat 11 saw this from one end (a tape at 1,724,873 B after 131 of 600 s). Heat 12 has the crisp
version, twice:

| contract | envelope | the tape | entries used |
|---|---|---|---|
| `e9-dome-basin` (w16) | `maxTapeBytes` **592,544** | **621,674 B** | **265 of 3,601** |
| `e7-relay-valley` (gen 59) | ~**576 KB** | **960 KB** | 259 |

`src/playbook/PlaybookFormat.ts:81` derives bytes from entries —
`maxTapeBytes = 16 KiB + maxEntries × 160` — and `:55` sets that 160 from the comment above it: *"the
retained Baron proof averages one change-point per 5.44 ticks and **140.7 bytes per entry**."* That
calibration is right for movement-shaped play. An order-array entry measures **~2,346 B** here and
~4,000 B in heat 11. So a tape can sit at **one-thirteenth of the permitted entry count and still be
refused on bytes** — the ceiling refuses a *kind of rider*, not a long run, and it does so only after
a 600-second ride.

> **Corrective `reel-byte-budget-per-entry`:** either raise the per-entry byte budget to what an
> order array costs, or budget bytes and entries independently instead of deriving one from the
> other, or **publish the byte ceiling in the view** so a rider can steer to it. Do **not** raise
> `MAX_JSON_BYTES` (`functions/api/standings.ts:1437`) — that is the transport cap; the refusal here
> is the per-contract envelope at `:1250`.

### F-HEAT12-3 — the host was full, and it stopped a `git commit` mid-heat

Mid-heat, `git commit` failed with `sha1 file … index.lock write error. Out of diskspace`.
`/System/Volumes/Data` was at **3.6 Ti used / 134 MiB free**. This is host-wide, not heat-local: it
would have stopped the fires, the lane runners, and every other implementer on this box, and it stops
*silently, in the middle of other people's writes*.

The operator freed space **without deleting anything**, per the retention law: a **per-worktree
sparse checkout** that de-materializes `artifacts/` (except this heat's own dir), `reviews/`,
`marketing/`, `logs/` and `rehearsal/` **from this arena only**. Git keeps every byte; main's working
tree is untouched (the sparse file landed in `.git/worktrees/heat12-038cc280/info/`, and `.git/info/`
has none). Free space went 134 MiB → 17 GiB. **Re-verified after:** `computeEngineHash` is still
`86e53f37…` byte for byte, because every de-materialized directory is outside `ENGINE_SOURCE_INPUTS`.
**This belongs on the owner's desk** — the arena is a symptom, not the cause.

### F-HEAT12-4 — a submission the door ACCEPTS can be silently dropped from the assay index

Of twelve tapes submitted, **ten verified and two were never assayed**: `e7-relay-rush` and
`e4-dust-flats`. Both got `ok: true, stored: true` from the POST — `e4-dust-flats` got
`rank: 1, decidedBy: "crown"` — and then `?verdict=<id>` answered **`assay_not_found`** hours later,
with neither board showing the row.

**A re-POST of the identical bytes cured it**: `e4-dust-flats` came back `assay: pending,
ranked: true` immediately. Nothing was re-ridden, re-simulated or re-authored — the only variable was
a second POST, which makes this a clean controlled test.

The mechanism is named by the code's own author, at `functions/api/standings.ts:1095`:

> *"ponytail: one KV key cannot serialize concurrent writes; `ASSAY_INDEX_MAX_AGE_MS` bounds
> staleness, a Durable Object cures it at launch traffic."*

`syncAssayBoardIndex` (`:1094`) rewrites **the whole locator list for a contract** from the rows it
was handed, into a single KV key. A heat that submits back-to-back is exactly the concurrent-write
traffic that note anticipates — and a lost locator is a **won run that never reaches the board**,
with no error anywhere.

> **Operator's standing order for every future heat: sweep the verdicts after the last ride**
> (`repoll-verdicts.mjs`, read-only) **and re-POST anything with no slip.** This is now as necessary
> as heat 11's tape-id discipline.

The operator got the *diagnosis* of this wrong once and is recording it: the first write-up blamed
the one-standing-per-owner retention rule (`rankedRows:961` / `retainPartition:1006`) and used POST's
`rank: null` as the tell. `e7-echo-canyon` refuted that within the hour — it also POSTed `rank: null`
and then verified and took rank 1, because **rank is assigned after the assay, not at store time.**

### F-HEAT12-5 — the board's `gold` is not the tape's `gold`

Measured on three verified rows this heat, same reel ids, all assays green:

| contract | submitted `score.gold` (from `tape.outcome.gold`) | the verified board row |
|---|---|---|
| `e8-mare-claim` | 60 | **1180** |
| `e3-moth-season` | 200 | **530** |
| `e7-echo-canyon` | 200 | **870** |

This is the `standing-formula-explained` pin working as designed — *"the standings worker rewrites
pending values from the verified replay result"* — but it means **a submitted score is advisory and
a matrix built from tapes will not match the board.** `matrix.md` deliberately records the *tape's*
number, because that is what the rider measured; the board's number is the county's. Worth one line
in `skill.md` so no future operator files a bug about it.

### F-HEAT12-6 — `e8-mare-claim`'s air wall costs exactly one pan (owner question, not a defect)

`regolith.required` is **1**. The suit, the domes, the breach counters and the breathless-pan counter
are all live and all published, and after the opening `HARVEST` closes the latch the consumer
*"damages nothing and mints nothing"* for 488.8 of 600 seconds. E8's signature mechanic is composed
and gates the secure — for one order. Whether that is enough to call the era EXERCISES is an owner
call, and it is the sharpest version of that question the field has produced.

### F-HEAT12-7 — two published view traps that cost whole runs, silently

1. **`now.seams` publishes `x`/`z` as `null` for an inactive seam.** A `HOLD`/`HARVEST` built from
   those coordinates carries non-finite numbers, **the entire order array is refused**, and the run
   freezes with no error the rider can see — `goldPanned` stuck at exactly 75 for 110 seconds on
   `e7-relay-valley` gen 59. The operator hit the same shape reading Canyon Works
   (`gold-seam-3/4`: `active: false, x: null, z: null`).
2. **Depleted seams re-anchor.** A `HARVEST` chain named by seam id drains into instant failures when
   the live gold moves to an id the array never named — and surprise-views back off exponentially
   (0.1, 0.2, 0.6 s… then silence), so the rider cannot get a decision point when it needs one.

Neither is a bug exactly; both are undocumented, both cost a full run, and both would cost one line
in `skill.md` to prevent. (Heat 11's `e3-fairground` trap — `stablePrefix.map.seams` and `now.seams`
disagree because anchors are shuffled per seed — is the third member of this family.)

### F-HEAT12-8 — a heat outruns the county's submission rate limit

`functions/api/standings.ts:145-147`: **`MAX_REQUESTS_PER_ANON = 12`** per **`RATE_TTL_SECONDS =
3600`** (and 60 per IP). A heat that rides more than twelve contracts in an hour — or that needs to
re-POST dropped reels on top of its own submissions — is refused with
`rate_limited: "The county clerk needs a spell."` This heat hit it, which is why `e7-relay-rush` is
still owed a re-POST: the hour's budget had already been spent on the rides themselves.

This is not a bug; it is a sane limit meeting a use it was not sized for. It is worth knowing before
planning a heat, and it argues for **spacing submissions or raising the ceiling for a known operator
identity**. (Refused attempts appear to count against the budget too, so retrying tightly makes it
worse.)

---

## 6. Operator honesty ledger

- **One DNF-transport, booked as such and never as a rig result.** The ride queue was running as a
  harness background task; the harness stopped that task, and because macOS has no `setsid` the queue
  and its live rider shared the killed process group. `e3-moth-season` (gen 42) died 90 s in.
  Preserved verbatim under `rides/e3-moth-season.DNF-operator-halt/` per the retention law and
  **re-ridden** from the same queue entry. Cure: `launch-queue.mjs` spawns the queue `detached: true`,
  which is node's `setsid`.
- **One driver crash that skipped a ride's bookkeeping.** `poll-verdict.mjs` wrote
  `verdict-slip.json` unconditionally, so a still-pending assay wrote the literal string `undefined`
  and the next `JSON.parse` killed the driver. `e4-dust-flats` landed its tape but skipped its
  notebook and matrix rows; both were run by hand and both scripts were cured.
- **One charter that did not carry its immediate predecessor.** `e7-relay-valley` gen 38 was launched
  moments before gen 37's notebook entry was appended. It is the only ride of the heat with that gap;
  the notebook/matrix append was then moved *into* the driver so it cannot recur.
- **One ride killed at its wall with no report.** `e1-drill-yard` was given a deliberately short
  600 s wall (heat 11 had traced its bar twice already, and the difference bought rides on maps that
  can be won) and was SIGTERMed before writing `gauntlet-report.md`. Its entire finding survived in
  `gauntlet-outcome.json` under the intermediate-results law, and was lifted into notebook
  generation 41 **verbatim and labelled as such** rather than lost.
- **The operator over-claimed F-HEAT12-4's mechanism and corrected it in the same session**, here and
  in the commit history. The retraction is in §5.
- **The operator filed a half-wrong blocker for `e3-canyon-works` and the next ride overturned it.**
  `blockers/e3-canyon-works.md` was rewritten, not patched, and it now leads with the retraction. The
  claim that died was "the hero dies at wave 3 in every configuration, so survival is a wall too";
  the claim that survived is the bank cap. **This is the strongest argument in the heat for spending
  a second attempt on a contract you think you have already answered.**
- **Nothing owed to the door.** Every secured, submittable tape the rigs put forward was submitted;
  `repoll-verdicts.mjs` re-checked all twelve. The two rigs' own refusals to submit — `e9-dome-basin`
  (reel over the byte ceiling) and `e4-long-road` (no scored attempt declared) — were honoured, not
  overridden.
- **No rotation seed was ridden.** `r2026w37` opens 2026-09-07; `build-submission.mjs` refuses a
  rotation seed by construction, and every ride used the canonical bench seed from
  `assets/contracts/bench-seeds.json` (`e1-drill-yard` has none published, so it rode the default
  `gold-rush` as `seedMode: live`).
- **The probe was never ranked** (`harness: operator-probe`), by construction and by the door.
- **Nothing in `src/`, `assets/`, `scripts/` or `e2e/` was touched.** The arena's tracked tree was
  verified clean after every single ride by `finish-ride.mjs`, and every `arenaTrackedChanges` array
  in `rides/*/summary.json` is empty.

### What the night cost

| | |
|---|---|
| rides | **24** (21 first attempts + 3 second attempts), plus 1 DNF-transport that was re-ridden |
| secured | **12 of 24**; 10 verified rows standing, 2 owed a re-POST |
| ride wall clock | 16,107 s (~4.5 h) across the 21 first attempts, of a 6 h 39 min session; the rest is second attempts, landings, assays and bookkeeping |
| rig output tokens | ~2.27 M across the 21 first-attempt rides (per-row in `matrix.md`) |
| cache reads | ~342 M (the charter carries the whole notebook, and the notebook grew all night) |

---

## 7. The rig — what changed from heat 11, and why

All scripts live beside this note. Each header cites its own change.

| script | change |
|---|---|
| `finish-ride.mjs` | **F-HEAT11-2 cure.** Tapes catalogued by their own `id` from their own JSON; the scored tape is whatever `gauntlet-outcome.json`'s `tape` field names, unioned with the `attempt-N` convention. Also reports unpromoted secured tapes loudly, and excludes the operator's own evidence dir from the firewall check. |
| `land-ride.mjs` | Submits the rig's **promoted** tape by preference and prints how it was discovered. |
| `build-submission.mjs` | `seedMode` from the canonical `assets/contracts/bench-seeds.json` (heat 11 kept a hand copy that could go stale and mislabel a bench ride as a live standing); **refuses a rotation seed by construction**; declares `harness: heat12-operator` per the heat-12 brief, with the full truth in `config`. |
| `make-charter.mjs` | The stale 2026-09-02 audit table is **replaced by the county's own era-pin prose** (`assets/engine-era.json`), because thirteen maps changed mechanic after that audit and quoting it would hand the rider a stale map. Adds the `second-attempt` stake. Publishes the two known envelope hazards so no rider loses a won run to them. |
| `receipts-delta.mjs` | `--all` measures every board contract (heat 11's unclaimed-only target set cannot see a re-ride's delta) and records each verified row's engine hash. |
| `ride-one.mjs`, `run-queue.sh`, `launch-queue.mjs` | New. One ride at a time, `nice -n 5`; the notebook and matrix appends moved **into** the driver so every later charter carries its predecessors' lessons (heat 11 appended by hand, one ride behind); the queue runs in its own process group. |
| `matrix-row.mjs` | New. Renders every matrix row from the evidence files alone, so a row cannot drift from the receipt it describes. |
| `repoll-verdicts.mjs` | New, and now mandatory — see F-HEAT12-4. Read-only; never re-POSTs. |

---

## 8. What the next heat should do first

1. **Re-POST the two dropped reels** (`e7-relay-rush`, `e4-dust-flats`) if their slips are still
   missing, and sweep verdicts as a matter of course. F-HEAT12-4.
2. **Land `reel-byte-budget-per-entry`** before riding `e9-dome-basin` again — its best policy class
   is inadmissible until then, and `e7-relay-valley` proved the ceiling is not map-specific.
3. **Take `e3-canyon-works` off the winnability board with a data repricing**, not another ride. Two
   generations have now priced the same impossibility; a third ride buys nothing.
4. **Stop counting `e1-drill-yard` as an unclaimed contract.** The door already refuses it by name.
5. **Ask the owner about `e8-mare-claim`'s `regolith.required: 1`** — F-HEAT12-6 is a design
   question, and it is the sharpest form of the reskin question the field has produced.
6. **Fix the host's disk before anything else runs on it.** F-HEAT12-3.
