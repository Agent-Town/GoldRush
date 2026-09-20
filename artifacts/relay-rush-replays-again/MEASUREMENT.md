# relay-rush-replays-again — the measurement

Claude Opus 5 implementer, scratch worktree, branch `fix/relay-rush-replays-again`, base `e5f3ac820`,
2026-09-06. Every number below was produced by the instruments in this directory; nothing is quoted
from a predecessor's note without being re-measured.

## 0. The correction that had to come first

The master (and the re-assay row it quotes) calls the retired reel "heat 12's". It is not.
`artifacts/reassay-county-2026-09-06/before.json` names the row's reel as
`agent-bf8cd86d-75f73cc6-ae0e-4f79-ae6f-167c3085475e`, dated `2026-09-04T23:17:57.752Z` — **heat
11's** Opus ride (`artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/`), verified under
engine pin `a607a81f`. Heat 12's ride is a *different* reel, `agent-e8c4f218-…`, recorded
2026-09-05T17:24Z, and it **replays green on today's tree**. The two reels are the whole story, so
both are measured here.

The "870 → declared 200" in the row is the F-2464-2 gold-meaning cure, not a discrepancy: this run
panned 870 over its life and *held* 200 at the secure tick (`artifacts/board-tape-gold/relay-rush-*-cure.json`).

## 1. The failure, reproduced

`node artifacts/relay-rush-replays-again/probe.mjs . <retired reel>` on `e5f3ac820`:

```
tape ran out after 36001 steps with the run still alive
final: tick 36001 · wave 40 · t 1200.03 s · gold 200 · hero 175/175 alive
```

Word for word the re-assay's message. The 36001 (rather than 36000) is arithmetic, not a
second fault: the seam runs while `steps < durationTicks + FROZEN_STEP_ALLOWANCE`
(`src/replay/AgentTapeReplay.ts:16,48`) and this tape declares `durationTicks` 18001.

The run reaches **wave 20 at tick 18000 with 200 gold and a full-health hero** — exactly its
declared score — and then simply keeps going: waves 21, 22 … 40. It is not failing to play the map.
It is not allowed to *finish* it.

## 2. The bisect (by instrument, one probe per commit)

Ledger: `bisect/ledger.txt`; per-commit JSON beside it. `ALIVE-AT-CAP` is the probe stopped at 20400
steps — 2400 past the tape, twelve times heat 12's own 600-step settle — so a green tree could not
be mistaken for a red one. First-parent commits of `main`, oldest first.

| # | commit | when (local) | replay outcome |
|---|---|---|---|
| — | `032ccd392` | 09-05 06:27 | **SECURES** w20 / 600 s / 200 g / `fnv1a32:f0fbaa92` |
| 4 | `0958456a4` | 09-05 07:22 | **SECURES** w20 / 600 s / 200 g / `fnv1a32:f0fbaa92` |
| 5 | `b38d60295` | 09-05 07:24 | **ALIVE AT CAP** — w22 / 680 s, never terminal |
| 8 | `de21da4f5` | 09-05 07:42 | ALIVE AT CAP |
| 18 | `f429f19c6` | 09-05 10:23 | ALIVE AT CAP |
| 38 | `2fb1f6151` | 09-05 11:44 | ALIVE AT CAP |
| 78 | `55ac2976f` | 09-05 20:20 | ALIVE AT CAP |
| — | `41b1e63cf` | 09-06 08:27 | ALIVE AT CAP |
| — | `78fe8e586` | 09-06 11:52 | ALIVE AT CAP |
| — | `502a398d9` | 09-06 15:45 | ALIVE AT CAP |
| — | `e5f3ac820` | 09-06 21:14 | ALIVE AT CAP (HEAD) |

**The named commit is `b38d60295`** — `merge: lane/b e7-playbook-rows`, landed 2026-09-05 07:24
local, **one hour and seven minutes after the reel was verified**. Its parent `0958456a4` is green.

Note the master's stated search window, `502a398d9..main`, was too narrow by 150 commits: the reel
was verified 2026-09-04T23:17Z, not at `502a398d9`. The bracket was re-derived from the reel's own
`date` field before the search ran (F-RRR-3).

## 3. Why that commit changed Relay Rush — one paragraph

`e7-playbook-rows` gave the four Signal Era maps the `PLAYBOOK_USE` verb they had been measured as
lacking (`docs/audits/2026-09-02-era-mechanic-audit.md:43-46` graded `e7-relay-rush` a RESKIN:
"`frontsArrived: 0`, no ladder mechanic"), and in the same slice it made the proof of invocation the
price of the claim: `autoSecureWaveForRun` gained `|| !this.playbookObjectiveAllowsSecure`
(`src/sim/HeadlessContractSim.ts:1473`), one clause per map, each derived from that map's own
declarations (`src/systems/E7PlaybookLatch.ts:26-30`). Relay Rush declares `twist.interferenceFront`,
so its clause is `suspended`: `interferenceFront.refusals.playbooks > 0` — the rider must have had a
playbook **muted by the static wall** before the run can secure at any wave. Heat 11's rider carries
`REPAIR_UNDER`, `HARVEST`, `BUILD`, `PICK_UPGRADE` and one closing `SECURE_CHOICE`, and **no
`PLAYBOOK_USE` at all** — the verb did not exist on this map when it rode. So its run does
everything its row claims, reaches wave 20 with its 200 gold, and can never be granted the secure.
Nothing leaked in from another map: the clause is selected by Relay Rush's own contract row, and it
is `null` on every contract off the Signal bundle.

**VERDICT: INTENDED.** ADR-004 rule 2 working exactly as ratified — a contract's composition
changed, the row recorded on the old composition does not replay, and it retires with a lineage
reason while staying in the almanac. The change belongs to the era-mechanic audit and to the owner's
standing "fix the epochs" direction; it is not a regression and there is no leak to cure.

Two things that could have looked like second causes, both measured and both **not** causes:

- The retired reel's `durationTicks` of 18001 exceeds the flat `MAX_PLAYBOOK_TICKS` of 18000, and
  its own ride warned it would be refused as `reel_duration_exceeded`
  (`…/opus/summary.json`, `doorRisk`). **That warning is stale.** The dome-basin envelope cure made
  the inclusive-endpoint slack unconditional (`src/playbook/PlaybookFormat.ts:98`); measured today,
  `runTapeEnvelopeForContract('e7-relay-rush').maxTicks` is **18002**, so 18001 fits.
- The relay-site deadline (three of four grounds lit when the third front arrives, t = 270 s) was
  **met** by the retired reel: `interferenceFront.objectiveMet` is `true` at the end of its tape.

## 4. The map is still winnable — the public-verb prover

`prover.mjs` drives `scripts/gr-sim.mjs` as a separate process over stdin/stdout in the door's own
vocabulary and nothing else: `PLAYBOOK_USE`, `BLAST_AT`, `BUILD`, `HARVEST`, `HOLD`, `SECURE_CHOICE`.
No engine import, no private handle, no balance edit, no minted gold.

It discharges both of the map's latches:

| Latch | Rule | How the prover pays it |
|---|---|---|
| the relay deadline | 3 of 4 sites lit when front 3 arrives (t = 270 s) | the first three rungs of the build ladder land a powered work on r2, r1 and r3 by t ≈ 46 s; `litAtDeadline` 4 |
| the era's errand | `interferenceFront.refusals.playbooks > 0` | `PLAYBOOK_USE` at the first turn past 55 s installs the rider's own submissions as a program, then the wheel is deliberately left alone (a bare newline, which gr-sim reads as "no orders") until front 1 sweeps at t = 90–110 s and suspends it: `programSuspensions` 1, `refusals.playbooks` 1, `objectiveMet` true at t = 100.9 s |

| Run | Result |
|---|---|
| seed `-01`, run 1 | **SECURED** — w20 / 600.000 s / 200 g / 650 kills / 669 calls / `fnv1a32:847b22a1`, hero 175/175 |
| seed `-01`, run 2 | byte-identical to run 1 (`identical: true` in `prover.json`) |
| the tape it wrote, replayed through the assayer's own seam | **SECURES** — `fnv1a32:c965e16e`, outcome `{secured, 20, 200 g, 600 s}`, `securedSnapshot` equal to the declared score, 18001 steps (`prover-01.replay.json`) |

The honest ladder behind that: the FIRST ride of this policy discharged **both** era gates and still
died at wave 15 / 458.1 s, because it let all sixteen upgrade picks default to `first-offer` and the
hero stayed at 100 max hp. Reading `now.pendingOffer` and preferring `tinkers_plating` (three stacks,
100 → 175 hp) is the single lever between wave 15 and wave 20 — the same F-RVW-5 wall Relay Valley
measured, answered here with the picks the door already offers rather than a new contract number.

**No map change was needed and none was made.** The prover exists to answer "is it still winnable",
and the answer is yes, with the mechanic the slice added rather than around it.

### One thing the prover tape is not

It is a proof, not a postable reel. At 669 accepted submissions it is 2,345,914 bytes against this
contract's `maxTapeBytes` of 1,938,784, and 669 order entries against `maxOrderEntries` 601 — a rider
that answers every one of the door's turns with a 31-order array writes 21% over the byte envelope.
Heat 12's securing reel spends 68 calls and fits easily. Recorded as F-RRR-4, not cured here.

## 5. Floors and the engine hash

- **Floors: UNMOVED.** Both Relay Rush rows re-measured with the same `--policy=idle` ride
  `scripts/null-floor-anchors.mjs` uses: `-01` `{false, w2, 81333 ms, 0 g, 35 kills, fnv1a32:ebf7134e}`,
  `-02` `{false, w2, 79833 ms, 0 g, 34 kills, fnv1a32:862ecace}` — byte-identical to
  `assets/contracts/null-floors.json`. Nothing regenerated.
- **Engine hash: UNMOVED.** `70c31bbbb782ee669ee254bafb04715ad2583727e04fdf34a39881d3c065d7be`,
  equal to the registry's current era-5 pin. This branch touches no file in `ENGINE_SOURCE_INPUTS`,
  so no new pin is owed.
- **What the ADR-004 re-assay will print for Relay Rush after this branch: exactly what it printed
  before it.** The retired row stays retired; the composition is unchanged, so nothing is re-queued
  and no row moves. A new verified row needs a new ride — and heat 12's already-posted reel is one:
  it replays to its declared score on this tree (`fnv1a32:d381ebe2`, pinned by the guard).

## 6. Instruments in this directory

| File | What it is |
|---|---|
| `probe.mjs` | the bisect instrument: `assay-replay-agent`'s seam with the vite root as a parameter, stepped by hand so a non-terminating run can still be described |
| `bisect.sh` / `search.sh` / `range.txt` | one probe per commit, and the binary search over `range.txt` that drove them |
| `bisect/*.json`, `bisect/ledger.txt` | every probe's full report, and the one-line table |
| `prover.mjs` | the public-verb prover |
| `prover.json` | both runs, byte-identical |
| `prover-01.tape.json` | the tape run 1 recorded (sha256 `acd05ffcfd708ada5435becd8398242e82b280b9ee8e0a6f0161eceedf8e7c67`) |
| `prover-01.replay.json` | that tape replayed through the assayer's seam |
| `head-full-ceiling.json` | the retired reel at the seam's own 36001-step ceiling on HEAD |
| `stranded-guards.log` | the seven guards F-RRR-1 found unwired, measured one at a time |
