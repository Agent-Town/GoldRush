# Drain review (attended landing): `sol-play-proofs-holds-1`, Glow Mesa proved by the driver fix, Deepwater's boss beaten, Long Road held at the far stop; F-2725-1 attributed by paired trials

**Branch** `sol/map-art-campaign-2` at `673003605` · **merge** `a69534fe9` · engine hash unchanged (`2d180e6b`, no pin) · drained attended 2026-09-28 02:02Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `sph1`).

**Verdict: LANDED.**

**Slice / branch / tip:** `sol-play-proofs-holds-1` (run 15 on disk), lane-c `sol/map-art-campaign-2`, nine commits ending at `673003605` (Astra, gpt-6-astra, 204,131 tokens, 21:57Z to 22:15Z 2026-09-27). Attended landing after two fire drains stopped on the same native-ride red (s2725, s2726) and the second fire deferred the landing to the attended session in its own block note.

**What it does.** The shared native-proof driver (`e2e/native-proofs/driver.ts`) learns three errands the campaign's rides could not perform: the Long Road motor errand (`motorOpening` resolves the convoy corridor from `twist.motorFrontier`, grades the start with Confirm, gathers the tar nodes, calls `motorStop` at the authored end), the Deepwater deck-pad boss (the driver targets the authored pad ids through the deck context, boards, and pursues the Dredge-Queen through acts 2 and 3), and authored early endings (the bank predicate requires a fresh secured score after the observed Claim Secured terminal without the wave-12 floor; `finally` only fills a missing terminal snapshot and can no longer overwrite pre-bank counters). Three re-ride specs and the run-15 evidence carry the results. No `src/**` change; no balance change.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Glow Mesa, desktop / phone (Astra, run 15) | PASS / PASS: Claim Secured at wave 8, banked, Book back, 7,225 score bytes identical across reload |
| Deepwater Claim, desktop / phone (run 15) | act 2 unlocked, hold destroyed, act 3 with hulk present; wave 12 secured; bank/Book/reload PASS; the last deck correction `5f74a1483` not re-ridden in run 15 |
| Deepwater final deck fix (s2725 fire gate, both screens) | VERIFIED: three occupied pads, three moved buildings, reanchored hull, carried hero; secure wave 12 / 272.133 s / 100 HP / 40 purse; bank/Book/7,223-byte reload PASS |
| Long Road, desktop / phone (run 15) | HELD: corridor resolved, stake graded, 24 fuel and 3 tar; the approach to the far stop stalls at (187.8, 5.2) and (185.3, 3.6) for target (190, 0); deaths at wave 3; the s2725 control on clean main dies at waves 5 and 7 at the same secure assertion |
| Flotilla / Regatta equivalence (desktop) | PASS, rows compared to run 12 |
| Rides, errors | 8 rides in run 15, zero console and page errors; the s2725 gate's 6 candidate rides zero browser errors |
| Evidence budget | 2,834,659 B added (run 15), inside the 25 MB task budget and the 40 MB fire ceiling |
| F-2725-1 paired attended trials (`artifacts/f2725-1-attribution/`) | candidate `cf9cd95c4` phone Glow Mesa PASS 2/2 (wave 8, 72 and 91 HP, banked); clean main `1ff7054fe` with the unchanged driver: one death at wave 10, one wave-8 ending failing only the old bank floor |
| tsc / build / adjacent specs / ledger battery | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the time of the chain cut. New files: `e2e/native-proofs/e4-long-road.spec.ts`, `e5-deepwater-claim.spec.ts`, `e6-glow-mesa.spec.ts` re-ride variants and `artifacts/sol/play-proofs/run-15/**` (75 new paths in the s2725 classification). Lane-touched: `e2e/native-proofs/driver.ts` (the three correctives), the run-14 note's table amendment, and the four other lane-touched paths the s2725 classification lists. No `src/**`, `scripts/**`, `functions/**` or `site/**` change, so `hash: unchanged` (the engine corpus is untouched). Conflicts: none expected; the toolkit's merge step records any.

**Findings.**
- **F-2725-1 (controlled, non-blocking for this landing).** The fire shell killed the Glow Mesa phone ride at wave 4 twice (s2725 at 142.8 s, s2726 at 144.8 s on the synchronized candidate `8f3c4a6f7`) while Astra's run-15 phone ride and both attended trials passed at wave 8, and the unchanged driver on clean main itself swung between a wave-10 death and a wave-8 ending. Native rides are real-time games; under the fire shell's per-job CPU ceiling (F-1269-1) they are a weaker instrument than in the attended or lane shells. The fires' "different stage = new red" rule is right for deterministic suites and wrong for this class; owed: a `scripts/fire.md` note that native-proof stages are attributed by paired attended trials, not by a single fire ride, and that a fire defers such landings (as s2726 did).
- **F-PPH1: none.** No reproducible plain-boot map defect; the Long Road far-stop approach and the Deepwater wreck re-entry are driver follow-ups (candidate holds-4 after holds-2 and holds-3).
- **Owner's desk:** nothing new. The survival-ceiling holds stay under F-PP-CAMPAIGN.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=0   24 passed (1.8m)  01:45Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1040 ℹ pass 1034 ℹ fail 1 ℹ skipped 5  02:02Z` |
| engine hash | `merged: 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d (pinned 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d)` |
