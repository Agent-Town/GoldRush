# Heat 13 — the parity re-ride — operator's note (written by the attended drain on 2026-09-12 from the evidence; the operator was cut off before it could write this)

Operator: an Opus operator agent hosting headless `claude -p` rides (Claude Opus 5 as the rider through the public door) from the detached arena `/tmp/heat13-569a41f9` at the deployed build `92358832` (the 1:1 grammar live, ADR-005 stage 3), 2026-09-07 from about 11:00Z. Owner ruling: D2 "re-ride it yes". Rig: heat 12's `*.mjs` adapted (`launch-queue`, `land-ride`, `wait-rides`, …). The run ENDED EARLY at 2026-09-07 16:48Z when the Opus weekly limit fired ("You've hit your weekly limit · resets Sep 12 at 1am Asia/Bangkok", HTTP 429) mid-queue: **27 of 36 boards were ridden; 9 never got a rider** (their matrix rows show 2 s walls and generation numbers with no tape). Full per-ride record: `matrix.md` (36 rows, the arena's final copy); rides under `rides/<contract>/` (charter, notebook entry, submission, land log) and the rig workspaces under `../heat13/opus/<contract>/` (tapes, reports); `queue2.log` is the second queue's driver log to its end.

## 1. The arena and the era gate
The arena was cut at `923588327` (the deployed commit); the skew probe (heat 12's verified probe tape replayed order-for-order) was REFUSED at submission by the new door, as the grammar demands, and a fresh probe under the new grammar verified unranked; block 1 then rode. (The probe records live under `probe/` where the operator wrote them.)

## 2. The receipts delta — measured from the live API by the attended session
| moment | claimed boards | retired reels counted |
|---|---|---|
| 2026-09-07 morning, before the grammar deploy | 30 of 32 | (not counted then) |
| 17:58, after the grammar deploy (F-RPG-21: retired-verb reels vanished uncounted) | 5 | 0 |
| 18:45, after the counting fix deployed (`ac555e02`) | 8 | 54 |
| **2026-09-12 11:50, after heat 13's rides** | **17 of 37** | **50** |

Every one of the 17 verified rows is a heat-13 Claude Opus 5 ride under the 1:1 grammar: e8-mare-claim, e3-moth-season, e7-relay-rush, e7-echo-canyon, e7-dead-band, e5-stillwater, e8-eclipse, e4-dust-flats, e4-boneyard, e4-gusher-county, the-claim, e7-relay-valley, e9-dome-basin, e3-canyon-works, e1-dry-gulch, e1-twin-banks, e2-incline, e2-pressure-garden, e3-blackout-ridge secured on the board (the-claim, dry-gulch, twin-banks, incline, pressure-garden, blackout-ridge, canyon-works, moth-season, gusher-county, dead-band, echo-canyon, relay-rush, relay-valley, eclipse, mare-claim, devils-alley, dome-basin read verified now).

## 3. The rides
**Ridden 27, secured 19, not secured 8, never ridden 9.**

Secured (19): e8-mare-claim w20/70g · e3-moth-season w12/113g · e7-relay-rush w20/55g · e7-echo-canyon w20/295g · e7-dead-band w20/335g · e5-stillwater w12/200g · e8-eclipse w20/80g · e4-dust-flats w14/0g · e4-boneyard w12/200g · e4-gusher-county w12/170g · the-claim w10/200g · e7-relay-valley w20/110g · e9-dome-basin w20/191g · e3-canyon-works w15/270g · e1-dry-gulch w20/198g · e1-twin-banks w20/499g · e2-incline w12/200g · e2-pressure-garden w12/18g · e3-blackout-ridge w12/481g.

**First-ever secures in county history (9, all stakes "never-claimed"):** e8-eclipse (w20/80g), e7-relay-valley (w20/110g), e9-dome-basin (w20/191g), e3-canyon-works (w15/270g), e1-dry-gulch (w20/198g), e1-twin-banks (w20/499g), e2-incline (w12/200g), e2-pressure-garden (w12/18g), e3-blackout-ridge (w12/481g). Canyon Works is the one heat 12 filed UNWINNABLE twice; its data repricing shipped since, and the rider secured it at wave 15 / 270 g: the repricing verified in the field.

Not secured (8): e8-far-side (not secured, w14/25g, 443.100s) · e8-low-orbit (not secured, w14/45g, 440.967s) · e4-long-road (not secured, w14/0g, 420.000s) · e1-baron (not secured (WALL), w23/134g, 610.400s) · e1-night-shift (not secured, w23/116g, 704.433s) · e2-hill-mine (not secured, w14/0g, 426.800s) · e2-trestle (not secured, w12/76g, 542.667s) · e3-fairground (not secured, w6/36g, 195.767s). Low Orbit (open question A9) and the Long Road (A15) rode as they are and did not secure, as the measurements predicted; Far Side did not secure this time (w14 / 443 s) where the e8-air-logical prover had; the Baron hit the ride wall at wave 23; Night Shift, Hill Mine, Trestle and Fairground stay unclaimed.

Never ridden (9, the weekly limit): e5-deepwater-claim, e5-flotilla, e5-regatta, e6-glow-mesa, e6-half-life-hollow, e6-picnic, e9-devils-alley, e10-ember-shore, e10-last-claim.

## 4. Findings
- **F-HEAT13-1 (operations):** the rider's weekly Opus limit is a hard stop with no warning inside the rig; a heat that needs six hours must start with the limit's headroom measured, or ride under an account whose limit is not shared with the attended session. Nine boards remain for a second block.
- **F-HEAT13-2 (F-HEAT12-4 recurrence):** in the block-1 verdict sweep, three accepted submissions (e4-boneyard, e4-dust-flats, e5-stillwater) dropped from the assay index again and were re-POSTed; on 2026-09-12 none of the three stands verified on the board (gusher-county, ridden in the same block, does). The assay index drop is not cured.
- **F-HEAT13-3 (measurement):** Far Side, which the e8-air-logical prover secured (w20), did not secure for the rider (w14 / 443 s): the prover's sortie plan is not what a rider finds on its own; the map's difficulty for a human-shaped rider is real.
- **F-HEAT13-4 (process):** the arena's git link was gone by 2026-09-12 (the worktree entry pruned during the disk cleanup); the evidence survived on disk and in fire s2549's parentless save branch `save/heat13-finished-evidence-s2549` (562 paths, 89 MB), which this drain landed. Keep that save pattern: a fire preserved an unfinished heat's evidence without touching its arena.

## 5. What the drain landed
The operator's branch `heat13/parity-sweep` (25 rides, 750 files) merged as `b89f70c70 (archive: pruned by the A3 rewrite)`; the fire's save branch's rides 26-27 and the rig workspaces (`artifacts/heat13/opus/**`), the arena's final `matrix.md` (36 rows) and `queue2.log` added by the attended session. Nothing deleted.
