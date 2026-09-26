# river-assay-1: a River reel verifies in its ceremony world

**Verdict: READY-FOR-GATES**, with one call for the attended session (F-RVA1-6, section 7). (Committed by the attended session from the implementer's final message, verbatim in substance: a hook refused the implementer's own write of this file, F-ATT-7.)

- Slice `river-assay-1`: owner, 2026-09-26, verbatim "2 - sure, lets do that", answering F-PP6-2 (the county-board half).
- Branch `feat/river-assay-1`, base `8f4be3286`, tip `3501e94c1`: 17 commits, never merged or rebased. The code has been frozen since `94c0c1a3b`; later commits are evidence only.

## 1. What it does
1. **The ceremony world** (`f665d8674`). `scripts/assay-replay.mjs` (`riverCeremony`) and the watch path in `src/main.ts` (`riverCeremonyReplay`) stamp THE RIVER charter as `E10FinaleSystem.launchRiver` does, replaying an `e10-river` reel at `?contract=the-claim&nowaves=` with the same two session entries (`gr.contract.launch.v1`, `gr.charter.launch.v1`); the charter's seed policy is `inherit`, so there is no seed pin; every other reel keeps its query unchanged; closing a watched River reel clears the staged launch and drops `nowaves`.
2. **The ceremony's outcome** (`505c72205`). In a replay, `completeRiverEnding` keeps the completed score it writes at the pan (secured, wave 0, the gold, the time); diagnostics publish it as `run.secured` and `run.securedSnapshot`, the fields the instrument reads; the worker compares `timeAlive` at `TIME_ALIVE_TOLERANCE_SECONDS = 1e-6` (the instrument prints the replayed clock to the microsecond, error at most 5e-7; a replay one sim step off misses by 33,333 µs; a verified row publishes the replay's raw snapshot, never the claim); the microsecond print stays (`624a7aebe`), `e2e/assay-replay-roundtrip.spec.ts` pins it.
3. **The headless arm refuses** (`51068d739`): `replayAgentTape` throws for `e10-river` before any engine loads ("the River ceremony, a browser run: its reel is assayed by the browser arm"); a River reel carries no `agent_orders`, so the worker's `isAgentTape` check already routes it to the browser arm; `HeadlessContractSim.ts` untouched.
4. **The seams' seed** (`7c15a2444`, form (b), replacing the literal `2b4e68c38`): `harvestSeedFor(runSeed)` in `Game.ts`: a live seed (`gold-rush`, or any seed `liveSeedRotationId` knows) keeps the constant layout (`DEFAULT_SEED`); any other seed, a pin, seeds the seams itself as it always did; `liveSeed.ts` only read.
5. **The F-RVA1-1 fix** (`0f6f2d1cf`, under the attended firewall lift): a live solo run moves by the rounded axes its reel records (`recordedIntents`).
6. **The switch** (`94c0c1a3b`), alone and last: `e2e/river-ending-score.spec.ts` routes county requests to the door's own handlers over a per-test store and asserts ONE standing POST at the pan whose tape equals the kept reel; the door answers 200 `stored`, the slip reads `pending`; still exactly one POST after a second pan, a reload and a re-pull; the county's own worker (`scripts/assay-worker.mjs --once`, Node 26.4.0) verifies it (claimed hash equals replayed hash); the Claim Ledger board ranks it first.

## 2. Verdicts before and after (real worker, `--once --dry-run`, local queue; "before" = base `8f4be3286`, "after" = `7c15a2444`; the flip changes no replay)
| Reel | Before | After |
| --- | --- | --- |
| report desktop `3f5a03c5` | rejected, replayed `9b896265` (raw River, no seams) | rejected, `cc10780d`: same seams, pan tick and score; probes off by 0.001 m (F-RVA1-1) |
| report phone `647005f9` | rejected, `b350adce` | rejected, `95bceda6`, same cause |
| run 7 desktop `a1a3a3f5` | rejected, `b1fdf4e8` | rejected, `883207a0`, same cause |
| run 7 phone `b9509309` | rejected, `a8c8b9fa` | rejected, `f9a8b8f2`, same cause |
| fresh River desktop `eef28ae4` (diagonal walk, fixed build) | not measured | VERIFIED |
| fresh River phone `10904fbe` (diagonal walk) | not measured | VERIFIED |
| spec desktop `ef71da37`, phone `027f7f02` (door and worker) | not measured | VERIFIED, ranked 1 |
| gold tamper (5 to 50) | | rejected, "outcome mismatch: gold" (hash reproduced) |
| time tamper (5 ticks early) | | rejected, "outcome mismatch: timeAlive" (hash reproduced) |
| pan-tick tamper (cut by 5 ticks) | | rejected, eventLogHash mismatch, replayed `913bc99c` |
| heat-15 probe `b131e18e`, r1 `f3a9c00c`, r2 `b92da1bf` | VERIFIED | VERIFIED, identical |
Byte-identical, base against final (`wallMs` excluded), seven replays: the three heat-15 reels through the worker's instrument; the era-6 agent tape `a45ba9ac` and the heat-15 probe through the headless arm; the heat-14 idle tape through the browser arm (`5a139ec0`); the same-laws human reel `a6c04f80`. Null floors 83 of 83 at `94c0c1a3b` (647.5 s). Fresh Claim reels (diagonal walk, fixed build, `edb5cd6a` and `44b865a8`) reproduce their hashes; the worker calls them unassayable because they are death reels. The watch path (plain page, no `?debug`, `33a0e9f88`): the shelf's hand-off redirects to the River's reel link, replays in "The River" on `the-claim` to the reel's own hash (`a4b3f10f` desktop, `3508bf39` phone), "Back to shelf" reloads the town with `nowaves` dropped; 0 console or page errors.

## 3. The seams proof
Live: the fresh River runs lay `gold-seam-1 (-9, 6.7)` and `gold-seam-2 (-1.5, -6.4)` and pan gold-seam-1. Replay: all six River replays boot the same two seams and end with 5 gold at exactly the reel's claimed time (4.8333 s, tick 145, for `3f5a03c5`). The old reels still differ only in `probes`, by at most 0.001 (the mid-point diagnostic); with the F-RVA1-1 fix no field differs on desktop or phone. The literal item 2 (`0f6f2d1cf` era) moved every unpinned Claim's seams to (25, 6.9) and (18, -7) and reddened `trail-guide-plain-boot` twice, so the attended session ruled form (b). The code gives no reason for the seams reading the URL pin: at base `createRng(getDebugSeed())` (`src/systems/HarvestSystem.ts:79`), unchanged since m1-04 `9c9fa7e6e` (2026-07-03); F-RES1-6 arose because both replay paths pinned the tape's seed in the URL while a live run carried none. One edge: a `?seed=` pin spelled exactly like a live seed lays the constant layout in live play and replay alike; the game sets `?seed=` only for a `fixed` charter seed policy; no tracked URL, spec or charter pins a live seed.

## 4. Why form (b) is the honest reading of F-RES1-6
F-RES1-6 said "any live browser run that pans replays on different seams": its subject was the replay, not the live seams. The cure needs the seams' seed to be a pure function of what the reel records; form (b) is that function: a live seed yields the one layout every unpinned run has always laid, any other seed seeds the seams as its pin always did. It moves no live layout, no pinned floor (83 of 83), no existing replay (seven byte-identical), and makes every replay lay its own run's seams.

## 5. F-RVA1-1 in its general form (fixed here)
A live solo run moved by its raw input axes while its reel records them through `lockstepInputFromIntents`, which rounds to 1e-3 (`roundAxis`, `src/mp/LockstepClient.ts:1180`); a keyboard diagonal is 0.7071067811865476; the measured drift 0.001 m after a 7 m diagonal; the probes (positions every 30 ticks, inside `runTapeEventLogHash`) could never be reproduced; nothing River-specific. `roundAxis` landed with MP-02 `1990b055e` (2026-07-09); the reel has recorded rounded axes since TAPE-01 `c75890d7a` (2026-07-31); TAPE-01's determinism proof drove axes the round leaves exact (`e2e/tape-01-run-tape.spec.ts:154-164`), so it could not see the drift. The fix (`0f6f2d1cf`, `recordedIntents`): the live run moves by exactly the axes it records, as lockstep and the playbook recorder already did. Reels recorded before the fix verify only if no tick carried an off-grid axis; the four old River reels cannot verify on any engine.

## 6. Engine hash
Before (base `8f4be3286`): `7bfbed8b0c6ecfff4ec3aa9457f74866bcc49c119a242631f2ac9b783a246551` (pin #69). After (`94c0c1a3b`, unchanged through the tip): `f6084527ce4a4d1c9a02ecf84d0859c105d69f04add6316998545a790535b5b0`. 3 of 662 inputs differ: `scripts/assay-replay-agent.mjs`, `src/game/Game.ts`, `src/main.ts`. Cause line for pin #70: "river-assay-1: a River reel replays in its ceremony world and verifies to its completed score; the harvest seams follow the run's seed (live seeds keep the constant layout); a live solo run moves by the rounded axes its reel records (F-RVA1-1); the headless arm refuses e10-river. No contract, collision, floor or table moved."

## 7. Human standings, and F-RVA1-6 (new)
The tree holds one real human standing: row 0 of `artifacts/ops/seedrun-board-backup-20260822.json` (`e9-seed-run`, secured, 20 waves, 600 s, a keyboard walk with 500 diagonal ticks, submitted 2026-08-20; the live door rejected it then with "instrument exited 143").
| Measurement | Tip `71510d4e7` | Base `8f4be3286` |
| --- | --- | --- |
| real worker, dry run | unassayable: 120 s playback timeout, three attempts | unassayable, same |
| where the replay stops | tick 274, paused; a further advance moves nothing | tick 274, same |
| same reel with its 7 `set_pause` actions removed | runs to tick 18000, desynced (wave 2 at 89.8 s) | not run |
| control: same-laws human reel `a6c04f80` | completes, tick 601 | not run |
Its first recorded action is `set_pause paused:true` at t=273 and all seven pause actions read `paused:true`. On this build a River run with one pause and one resume records exactly one action, `set_pause paused:true` at t=50; its replay stops at tick 51 and the instrument times out; with that action removed the replay reproduces the hash the live run computed WITH the pause (`a8c5af79`) and verifies. **F-RVA1-6:** every pause press is recorded as `set_pause paused:true` and the resume is never recorded (`RunTape.ts:171` passes no `pauseTarget`, so `LockstepClient.ts:859` writes `true`); a replay applies the pause (`Game.ts:3779`) and never advances again; so any human standing whose player paused is unassayable, on every contract, today. A pause changes nothing in the event log, so the fix moves no hash: either replays skip `set_pause`, or the reel stops recording pause presses, as the playbook recorder already does (`Game.ts:4128`). Outside this slice's firewall; its owner is the tape recorder. With `RIVER_STANDING_POSTS_ENABLED = true`, a paused River run posts a standing that ranks while pending (`isRankedRow`, `functions/api/standings.ts:1229`) then drops as unassayable; an unpaused River run verifies. Recommendation: keep the flip and queue the F-RVA1-6 fix at once; the River is then no worse than every other contract. The answer to the attended question: a human standing recorded after this slice verifies if the player never paused; with any pause it is unassayable (F-RVA1-6); one recorded before this slice with any diagonal tick cannot verify (F-RVA1-1); the seed-run standing has both problems.

## 8. Gates (final battery at `94c0c1a3b`, drain lock, port 5857, `--workers=1`)
| Gate | Result |
| --- | --- |
| tsc / build | rc 0 / green |
| `e2e/river-ending-score.spec.ts` | 6 of 6, desktop and mobile |
| task-025, m2-01, charter-press-totality, live-seed-rotation | 54 of 54 |
| wider set (tape-01, tape-02, assay-replay-roundtrip, lantern-true-world, pb02-replay-actor, perf-04-determinism, f1297-2, same-laws-harvest-parity, sim-fixed-step, trail-guide-plain-boot, county-board-open-week) | 50 passed, 18 failed (all red on the base too), 8 skipped |
| `node --test scripts/river-assay.test.mjs` | 3 of 3; spliced right after the runner in `test:node-guards` |
| the assay worker's own tests | 21 of 21 |
| `npm run test:stats` | rc 0 |
| null floors | 83 of 83 |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` | 1040 tests: 1028 pass, 7 fail, 5 skipped |
Reds by control: `lantern-true-world` x16 and `pb02-replay-actor` x2 are the same 18 ids red on the base; `bench-seeds:47` and `engine-era-guard:65` wait for pin #70; `desk-declaration-guard`, `ledger-backup-pull` x2 and the fixture-teardown sweep identical on the base (linked worktree, no `.env.local`; `ledger-mirror-freshness-guard` test 23 leaves the one `s2672-dest-*` directory); `node-guards-contention` host load, passes alone.

## 9. Screenshots
`spec/county-board-desktop-chrome.png` and `spec/county-board-mobile-chrome.png`: the Claim Ledger board with row 1 "Robin 0 waves · 00:05 · 5 gold", assay verified; also `spec/pan-*.png` and `spec/book-*.png`.

## 10. Findings
F-RVA1-1 fixed here (§5). F-RVA1-6 new, pre-existing, owner the tape recorder (§7): a corrective task is owed. F-RVA1-2 (diagnostics hazard, non-blocking): under manual sim, animation frames step replay sessions while the sim does not step; instruments must advance in one synchronous call. F-RVA1-3 (observation): idle agent tapes carry no `agent_orders`, so `isAgentTape` sends them to the browser arm (`a45ba9ac` → `5a139ec0`, unassayable, as before). F-RES1-7 still open. Observation: at 390 px the county board clips its Reel column. Evidence churn: 19 tracked evidence files of other slices regenerated, left uncommitted in the worktree.

## 11. Adapted
Item 2 in form (b) per the attended ruling (the literal `2b4e68c38` stays in history). The switch landed twice (`67e04f0d9`, reverted `0d1c0bcde` while two adjacent reds were fixed, final `94c0c1a3b`). The old River reels cannot verify (F-RVA1-1); fresh diagonal reels on the fixed build stand in. `package.json`: `scripts/river-assay.test.mjs` spliced right after the runner; the roster not rebuilt.

## 12. Commits
`f665d8674` item 1; `505c72205` item 3; `51068d739` headless refusal; `2b4e68c38` item 2 literal; `0f6f2d1cf` F-RVA1-1 fix; `02be4953e` verdict rows and roster; `7d8282e23` spec; `67e04f0d9` flip; `0d1c0bcde` revert; `624a7aebe` microsecond print restored; `7c15a2444` item 2 form (b); `b8a7c1a72` fixture; `94c0c1a3b` final flip; evidence `33a0e9f88`, `bb07b82a2`, `71510d4e7`, `3501e94c1`.
