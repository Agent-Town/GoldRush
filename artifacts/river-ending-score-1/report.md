# river-ending-score-1: implementer report
**Branch** `feat/river-ending-score-1`, `/Users/robin/Claude/Projects/wt-rvs1`, cut at `be37d83cf` (= `b3762cab9` + the master's tasks-only commit). Opus 5.5, max effort, 2026-09-26. (Committed by the attended session from the implementer's final message: a hook refused the implementer's own write of this file; the text is verbatim.)
**Verdict READY-FOR-GATES.** On the lever's River, the first gold the player's own pan lands now writes one completed `e10-river` score, keeps its reel and posts one standing with that same reel; the door admits it unchanged. It writes once: a second pan, a reload or a re-pull writes nothing more, and nothing writes on boot. The run-6 bank assertion is red on base and green on the branch, both projects. Not met inside the firewall: no assay instrument can reproduce a River reel yet (F-RES1-1, F-RES1-6).

## 0. Pre-flight
- `git status`: only `?? node_modules`.
- `git log main..HEAD`: empty.
- `npm run build`: `EXIT=0` (`preflight-build.log`).

## 1. Premises, verified on base
- **Completed scores come only from the secure path.** `recordRunScore` (`Game.ts:7696-7724`) is reached only from `run_secured` `:1968`, a secured `hero_died` `:1987` and a secured `run_ended` `:2034`. TRUE: the lever's run has no secure and no death.
- **The lever produces `?contract=the-claim&nowaves=`.** `E10FinaleSystem.ts:171-184`. TRUE, so `activeContract.id` is `the-claim` (`ContractFamilies.ts:1378-1384`).
- **The pan events.** `Game.ts:3298-3307`, `:935`. TRUE.
- **The door's outcome grammar.** `validTapeOutcome` (`standings.ts:1634-1641`) admits only `death`, `secured` and `rush`. The client (`RunTape.ts:563`) and `EventBus.ts:15` agree.
- **What the River changes.** The pressed River differs from the shipped Claim only in name, briefing, board row and two lane-bias numbers (`probes/diff-river.mjs`).

## 2. Event chosen: the gold landing
Measured on base (`probes/base-lever-*.json`), hero walking from (0, 12) to the seam at (-9, 6.7):

| Candidate | Desktop sim | Phone sim | Gold |
| --- | --- | --- | --- |
| Swing (channel start) | 3.400 s | 3.300 s | 0 |
| First gold (`gold_panned`) | 4.867 s | 4.767 s | 5 |
| Book's return | not in the run (pause, then Back to Town, `Game.ts:8822-8826`) | | |

Why the landing:
- It is the first moment the act is certainly a pan. The swing can decay to nothing if the player walks on (`HarvestSystem.ts:247`), and the game's own seam card says "Stand close and the pan works itself."
- It is the run-6 driver's own test (`driver.ts:1391`, `:416`).
- It gives the score a real panned gold value (5).
- No seam is within 6.4 m of the spawn, so nothing can trigger it on boot.

With the change, the score lands at exactly that tick: 145 ticks (4.8333 s) desktop, 144 ticks (4.8000 s) phone.

## 3. The change (`bb1e04ed6`, `Game.ts` only, +77/-17)
- **River detection** (`:1579`, predicate at `:11147-11152`): waves are off, and the selected contract is byte for byte `stampCharter(getPostCreditsCharter()).document`. Node check (`probes/ceremony-predicate.txt`): pressed River true, plain Claim false, raw `e10-river` false.
- **Hook** (`:3313`), and `completeRiverEnding` (`:7750-7758`). It does nothing in a replay, in multiplayer, or once the latch is set. It also does nothing if the profile's scores already hold a secured `e10-river` row. Otherwise it calls `recordRunScore(0, timeAlive, true, 0)`, appends the reel to the tape ring, then calls `submitCountyStanding`.
- **Scored contract id** (`scoredContractId`, `:7761`): `e10-river` on the ceremony, the played contract everywhere else. It replaces the played id at `:7727`, `:8058`, `:8063`, `:8140-8145`, `:8154` and `:8170`.
- **One outcome builder** (`securedReelOutcome`, `:7766-7774`) for both reels, byte-identical to the literal it replaced.
- **Standing:** the ceremony skips the shipped-descriptor check (`:8143-8145`), which still guards every other run.
- **Latch reset:** `:9104`.
- **Deliberately not done:** no RunManager secure (it would freeze the sim, offer the Rush, and pay meta), and no overlay. The headless engine is untouched: nothing imports `game/Game`.

## 4. Spec and the run-6 assertion
`e2e/river-ending-score.spec.ts` (`96eb03f40`), no `?debug`. It stages the lever with `launchRiver`'s own calls, answers every county request locally, and judges the POST with the door's in-process `onRequest`.

| Test | What it checks | Desktop | Phone |
| --- | --- | --- | --- |
| (a)+(b) first pan | Run-6 predicate verbatim; the row, reel and standing (door 200); a second pan, a reload and a re-pull write nothing; the Back to Town exit and a plain reload keep the scores byte for byte; the Book shows "Secured: wave 0, 5 gold" | 25.9 s | 25.4 s |
| (c) no player action | Sim reaches 12 s with nothing written | 14.3 s | 14.4 s |
| plain `?contract=e10-river` | Both the plain boot (resolves to the Claim) and the Book-staged raw River boot clean and write nothing | 10.6 s | 10.6 s |

- **Counted run:** 6 passed in 1.7 min. Landing times (first pan, after reload, after re-pull): desktop 4.867 / 4.667 / 4.600 s, phone 4.833 / 4.500 / 4.467 s. The only county call was `POST /api/standings`.
- **Before:** `control-base-spec.log` shows 2 failed at "run 6 banks cell" (received undefined), 4 passed.
- **After:** green on both projects.
- **Screenshots:** `pan-*.png` and `book-*.png`, both projects.

## 5. Door verdict
The door admits only `death`, `secured` and `rush`, so no named ceremony reason is used; the ceremony rides `secured`. `standings.ts` is not changed. `validateTape` requires the reel's contract to equal the standing's (`standings.ts:1594`); that is why the recorder is also opened under `e10-river`. `onRequest` answered 200 `{ok:true, stored:false}` for both projects (`standing-*.json`).

## 6. Tape and assay
- **The reels:** `e10-river`, outcome `{secured, waves 0, gold 5, timeAlive}`; hash `fnv1a32:3f5a03c5` desktop, `fnv1a32:647005f9` phone. The posted reel is identical to the kept one.
- **Agent arm:** exit 1 on both reels, "AP-07 supports only ... received e10-river" (`assay-agent.txt`).
- **Browser arm** (the one the assay worker spawns): replays to `secured false`, gold 0, hash `9b896265` desktop / `b350adce` phone; stderr empty. The worker would reject both (`assay-worker.mjs:151-157`).
- **Control:** the same reel relabelled `the-claim` gives the same hashes. A diagnostic replay (`probes/replay-diag-*`) shows why:
  - On the raw River the replay has no seams at all.
  - On the Claim the seams sit at (25, 6.9) and (18, -7), where the live run had (-9, 6.7) and (-1.5, -6.4).
  - The replayed hero stops at (-5.6, 8.32); the live hero stopped at (-7.97, 6.57).

## 7. Engine hash
- Before: `642edcf6…` (pin #66).
- After: `0f2c5904…`.
- Cause: `Game.ts` River completion. The drain pins it.

## 8. Evidence
| Item | Result |
| --- | --- |
| tsc | 0 |
| Build | `EXIT=0` (`build-final.log`) |
| Spec | 6/6 |
| Adjacent suites | 104 of 126; the same 22 red on base (`control-base-adjacent-reds.log`) |
| Node guards | 1026 of 1037 (`node-guards.log`; attribution in `node-guards-controls/`) |

- **Zero console and page errors:** asserted in every test; a 45 s raw-River idle also had none.
- **Adjacent red detail:**
  - `cp04-lever:61` on base fails earlier (line 76, image `naturalWidth`). On the branch it fails at the same briefing failure as cp03, which fails on both.
  - `cp05` pins sha `a940bc45…`; the Claim data on base already gives `a258fe82…`.
  - `assay-auto-tape` expects a POST at the secure overlay; standings post at bank on both trees.

## 9. Findings
- **F-RES1-1: River reels cannot be assayed; blocks verified River standings.** Causes, all outside `Game.ts`:
  1. The replay opens the reel's own contract, i.e. the raw River with no seams (`main.ts:542-543`, `assay-replay.mjs:58-65`), not the ceremony world.
  2. The instrument reads RunManager's `run.secured` and snapshot (`assay-replay.mjs:100`, `:111`), which the ceremony never sets; the worker needs a snapshot (`assay-worker.mjs:132-133`).
  3. `timeAlive` is rounded to 1e-6 (`assay-replay.mjs:109`) against the raw float.
  4. F-RES1-6.

  Consequence: River standings go pending, then are rejected. Recommendation: a follow-up slice before any deploy, or an owner word.
- **F-RES1-2: the run-6 driver's seed (`driver.ts:72-75`).** It fabricates a waves-30 `e10-river` row, so a real completion never reads as new. Measured with `probes/trim-measure.txt`: kept false on that seed, true on a realistic profile, true on the seed minus its River row. The next native proof must seed no River row.
- **F-RES1-3: the raw River route has no seams, yet enemies spawn** (2 alive at 11.5 s and at 26.5 s). The spawn edge falls back to `'west'` (`WaveSystem.ts:362`) and the secure wave defaults to 20 (`Balance.ts:827`). A secure there would also satisfy this slice's once-guard. Belongs with the F-CORR4-18 pack.
- **F-RES1-4: a Claim playbook replayed in the River spoils its reel.** The playbook guard compares against `activeContract.id` (`Game.ts:4297`), and `validateRunTape` then refuses the reel (`RunTape.ts:406`). Fix: use `scoredContractId()` there too.
- **F-RES1-5: the ending is silent in the run**, and the Run Ledger (`RunManager.ts:280`) never lists it. No finisher ledger exists in the code.
- **F-RES1-6: browser seams follow the `?seed=` pin, not the run's seed.** Browser: `Game.ts:595` → `HarvestSystem.ts:79` → `Rng.ts:26`. Headless: `HeadlessContractSim.ts:1100-1105`. Any live browser run that pans replays on different seams; measured above.
- **Noted:** `field-book.spec.ts` is red on main (F-LC2-13), not run.

## 10. Adapted
- The spec starts from the lever's staged effect, not the finale button.
- The bank assertion is proven on a realistic seed.
- Evidence is written only with `GR_REFRESH_EVIDENCE=1`.
- The adjacent set is wider than the master's three.
- Both assay arms were run.
- The report travels in the final message because a hook refused the file; the attended session committed it.

## 11. Commits
`bb1e04ed6` (src), `96eb03f40` (spec), `c580007a4` (evidence).

## 12. Remaining
1. The drain pins the hash.
2. F-RES1-1 and F-RES1-6, or an owner word.
3. F-RES1-2.
4. F-RES1-3, -4, -5 to the desk.
