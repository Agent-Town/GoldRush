# Review: gauntlet-heat12-opus-sweep — heat 12, Claude Opus 5 rides the county under the live build (detached arena, attended drain 2026-09-06 early)

**Slice/branch/tip:** `gauntlet-heat12-opus-sweep` · `heat12/opus-sweep` (arena `/private/tmp/heat12-038cc280`, base `038cc2809`, the live build at the time) · 20 commits, tip `7512cd528` · merged to main: see the ledger row (first-parent merge; artifacts plus one ledger row, no `src/`; one 275 MB view log kept on disk and on the branch but out of git, see Merge classification).
**Verdict:** MERGED as evidence. 24 rides (21 first attempts, 3 second attempts), 12 secured, 10 verified rows at rank 1, and **`e8-mare-claim` claimed for the first time in county history** (w20, verified `fnv1a32:f84d1d2b`, rank 1). Receipts delta from the live API, verified rows only: claimed 31 → 32, unclaimed 5 → 4 (`e1-drill-yard`, `e3-canyon-works`, `e7-relay-valley`, `e9-dome-basin` remain). Era gate PASS proved by the skew probe (`assayEra: true`, `assayHash fnv1a32:cc026656`, byte-identical to heat 11), not read off a registry that the arena's own copy did not yet carry.

## What it did
The rider used the machine door exactly as a player of the E1 release would (`public/skill.md`, one JSON view in, one array of standing orders out), on the live build `038cc280`. Secured and verified: `e8-mare-claim` w20/60g, `e3-moth-season` w12/200g (on the re-authored map, rank 2), `e7-echo-canyon` w20/200g, `e7-dead-band` w20/200g, `e5-stillwater` w12/200g, `e8-far-side` w20/200g, `e8-low-orbit` w20/200g, `e4-boneyard` w12/200g, `e4-gusher-county` w12/5g, `the-claim` w10/76g. Secured but dropped by the door: `e7-relay-rush` w20/200g and `e4-dust-flats` w14/55g (F-HEAT12-4). Not secured: canyon-works (×2), relay-valley (×2), dome-basin (×2), drill-yard, eclipse (14.8 s short), long-road, baron, night-shift, hill-mine. Not ridden: E6 (nothing changed there this week) and Fable (an Opus-only heat by brief). Almanac notebook generations 37–60 are in the community repo (`goldrush-gauntlet@7a69177`).

## Evidence
| Check | Result |
|---|---|
| Receipts delta | measured from the live API before (15:12:47Z) and after (21:16:55Z): claimed 31 → 32, unclaimed 5 → 4 |
| Verification | every secured row above carries the assayer's verified hash; ten heat-12 rows stand at rank 1, nine of them displacing the rig's own heat-11 row |
| Era gate | skew probe `assayEra: true`, hash `fnv1a32:cc026656` byte-identical to heat 11 |
| Matrix | `artifacts/gauntlet-heat12-20260905/matrix.md`, one blocker file per unclaimed contract under `blockers/`, rides under `rides/` (686 files) |
| Host | the arena hit 134 MiB free and failed a `git commit` mid-heat (F-HEAT12-3); freed by a per-worktree sparse checkout without deleting anything, the engine hash re-verified identical |

## Merge classification
`artifacts/gauntlet-heat12-20260905/**`: NEW (686 files, ~314 MB on the branch). `tasks/BACKLOG.md`: MAIN-MOVED, unioned (the heat's single row prepended). **One file kept out of git by the drain:** `rides/e4-dust-flats/work/attempt-1-views.jsonl` is a 275 MB view log; GitHub refuses blobs over 100 MB and the blob-size law stops at 50 MB, so it is `git rm --cached` from the merge, listed in `.gitignore` with its reason, and kept byte-for-byte on disk and on the branch `heat12/opus-sweep` (never pushed), under the owner's 2026-08-26 amendment that keeps run logs local. Nothing was deleted. No `src/`, no era pin.

## Findings (all reported by the rider, verified against its artifacts by the drain)
- **`e3-canyon-works` is UNWINNABLE as shipped, and the second ride overturned the first answer.** Generation 60 rode to w20 / 600.000 s with both galleries powered, so the wall is neither survival nor economy in general but one number: `Balance.economy.bankCap` 200 (`src/game/Balance.ts:824`) against a 330 g latch, forcing two descents (≥208 s) against a 180 s deadline. A one-line data corrective, but it changes a contract's economy: OWNER'S DESK with the recommendation to raise the cap or lower the latch for that map only.
- **`e1-drill-yard` is not a contract** (`secureWave 0`; POST refused as `training_ground` at `standings.ts:766`; GET answers HTTP 400, the only one of 36). Bookkeeping corrective: retire it from the receipts denominator.
- **`e7-relay-valley` HARD:** the E7 playbook change took it from heat 11's w4 to w15 (latch discharged at 11.6 s); ~80 s of HP short. No corrective proposed.
- **`e9-dome-basin` HARD plus F-HEAT12-2 (engine):** the reel byte budget refuses a policy class. `PlaybookFormat.ts:55` prices an entry at 160 B; order arrays measure ~2,346 B, so Dome Basin's w16 tape is 621,674 B against 592,544 B allowed while using 265 of 3,601 entries; Relay Valley 960 KB vs ~576 KB. Fire-authorable corrective (price by measured bytes or raise the budget for order-array policies).
- **F-HEAT12-4 (door):** an accepted submission can be silently dropped from the assay index (2 of 12, one with `rank: 1, decidedBy: crown`); a re-POST of identical bytes re-queues it (`standings.ts:1095`). The two reels (`e7-relay-rush`, `e4-dust-flats`) are OWED a re-POST.
- **F-HEAT12-5:** board gold ≠ tape gold (60 → 1180, 200 → 530, 200 → 870). Investigate which number the board prints.
- **F-HEAT12-6 (owner question):** the Mare Claim's air wall costs exactly one pan (`regolith.required: 1`); the suit then sits empty 488.8 of 600 s.
- **F-HEAT12-7:** `now.seams` publishes `x`/`z` as null (gets a whole order array refused) and depleted seams re-anchor; two silent view traps.
- **F-HEAT12-8:** 12 POSTs per anonId per hour; a heat outruns it.
- **F-HEAT12-1:** the F-HEAT11-2 cure paid off five times (rides promoting a non-`attempt-N` tape, including echo-canyon's verified rank-1 row).
