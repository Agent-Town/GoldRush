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

## 13. Addendum, 2026-09-26: the county post held, F-RES1-4 fixed, re-run (the attended session's follow-up)

**Verdict: READY-FOR-GATES.** Two commits on top of `bea0a4dcb`, then this addendum with its evidence (`followup-2026-09-26/`). The tip's `src/game/Game.ts` is the only engine input that moved.

### 13.1 The county post is held (commit `0d1387632`)
- `const RIVER_STANDING_POSTS_ENABLED: boolean = false;` (`Game.ts:11151`), with the comment citing F-RES1-1 and F-RES1-6 above it. `completeRiverEnding` (`:7754-7762`) still writes the completed score and keeps the reel in the tape ring, and calls `submitCountyStanding` only `if (RIVER_STANDING_POSTS_ENABLED)` (`:7761`). The standing path's River branches (the scored epoch, the descriptor-check skip) stay in place, so the assay slice flips one line.
- Spec (a)+(b) now asserts ZERO standing POSTs after the first pan, through a second pan, a reload and a re-pull, and from the lever to the Book (`county-calls: []` on both projects). The dev-send flag stays seeded, so the silence is the hold's, not the opt-in's.
- The kept reel is still judged in-process. `validateRunTape(reel)` returns the reel whole. The door's own `onRequest`, given the body `submitCountyStanding` would build (`doorShapedStanding`, field for field), answers 200 `{ok: true, stored: false}` on both projects (`door-shaped-standing-*.json`).
- Row, reel and Book assertions unchanged: one secured `e10-river` row (waves 0, gold 5), one reel with the `secured` outcome, "Secured: wave 0, 5 gold".
- **Control:** the same new spec on the pre-change tip `bea0a4dcb` fails exactly at "the River posts no standing while RIVER_STANDING_POSTS_ENABLED is false" on both projects (it received the POST body); its other 4 tests pass (`control-prechange-spec.log`). The older `standing-*.json` (commit `c580007a4`) are that pre-hold POST, kept as history.

### 13.2 F-RES1-4 fixed (commit `6af7bf60b`)
- **The change.** Three sites now use `scoredContractId()` instead of `activeContract.id`, so on the River a playbook is recorded, replayed and kept under `e10-river`. On every other run the id is the same as before.
  - the replay guard (`Game.ts:4300`);
  - the agent rider's `PLAYBOOK_USE` guard (`:3913`);
  - the recorder's label (`:4244`).
- **Correction to section 9, with measurement: no plain boot reaches this.**
  - The Tape Reel surface mounts only when `activeEpoch.order >= 7` (`Game.ts:1917`).
  - A `?contract=` run takes its contract's epoch (`ContractFamilies.ts:1122-1124`), and `the-claim` is E1.
  - The only paths left are the `?debug` dev bridge, and an agent rider in a multiplayer room, where `completeRiverEnding` writes nothing (`:7755`).
- **So no spec row** (it would need `?debug`). A probe runs instead, through the dev bridge (`followup-2026-09-26/instruments/playbook-guard-probe.mjs`, `playbook-probe-*.json`):

| probe, desktop and phone | pre-change `bea0a4dcb` | tip `6af7bf60b` |
| --- | --- | --- |
| a playbook recorded on the River is labelled | `the-claim` | `e10-river` |
| a Claim playbook's replay | accepted | refused, `contract-mismatch` |
| the River playbook's replay | accepted | accepted |
| the reel's playbook uses | 2, both `the-claim` | 1, `e10-river` |
| standing POSTs | 1 | 0 |
| `validateRunTape(reel)` | refused | refused, for a different and older reason (F-RES1-7) |

### 13.3 F-RES1-7 (new): a stopped playbook replay spoils ANY run's reel (pre-existing, not River-specific)
- **Why the tip's reel is still refused, although its one playbook use is now lawful:**
  1. While a playbook replay is active, the recorder takes the replay actor as its primary slot (`Game.ts:8024`, `RunTape.ts:158`) and records the player's hero as an additional stream, slot 0 (`RunTape.ts:186`).
  2. When the replay stops, the primary returns to slot 0 and the empty slot-0 stream stays.
  3. `validateInputStreams` refuses a stream on the primary slot (`RunTape.ts:518-521`).
- **Measured** with `instruments/playbook-reel-diag.mjs` (`stream-slot-diag-*.json`): record a playbook, replay it, stop the replay, take the reel.

| run | primary slot | stream slots (entries) | `validateRunTape` | without streams | without playbook uses |
| --- | --- | --- | --- | --- | --- |
| tip, River (reel at the pan) | 0 | [0] (0) | refused | valid | refused |
| tip, plain Claim (reel at run end) | 0 | [0] (0) | refused | valid | refused |
| BASE `be37d83cf`, plain Claim (reel at run end) | 0 | [0] (0) | refused | valid | refused |

- **Attribution:** it happens on base and on every contract, and it lies outside this firewall (`RunTape.ts` is open to this slice only for the outcome).
- **Consequence:** any E7-or-later run whose agent replay stops before the reel is taken keeps a reel that the client and the door refuse.
- **Owner:** the tape/playbook owner. The shape of the cure: drop or re-slot a stream that lands on the primary slot when the reel is taken, or stop switching the primary slot during a replay.

### 13.4 The re-run, tip `6af7bf60b` (all servers under the drain lock, started and stopped by PID)

| gate | result | file |
| --- | --- | --- |
| tsc | rc 0 | `followup-2026-09-26/tsc.log` |
| `npm run build` | `EXIT=0` | `followup-2026-09-26/build.log` |
| the spec, both projects | 6 passed (1.8 m) | `spec-both-projects.log`, `spec-results.json` |
| the master's three adjacent specs, both projects (task-025, m2-01, charter-press-totality) | 28 passed (1.7 m) | `adjacent-three.log` |
| the new spec on the pre-change tip (control) | 2 failed at the zero-POST assertion, 4 passed | `control-prechange-spec.log` |
| existing tapes replayed on base `be37d83cf` and on the tip | byte-identical | `replay-comparison.txt` |
| law-pointer-guard, source-pointer-guard | PASS, PASS | `law-pointer-guard.log`, `source-pointer-guard.log` |
| the two engine-registry rows | 2 failed, both the pre-pin rows naming `29324ba8...` (7 of 9 pass) | `registry-rows-prepin.log` |

The four replays behind "byte-identical":
- **Agent arm, `probe-idle-tape.json`** (heat 14, the Claim): rc 0 on both, the same 148 bytes of stdout.
- **Agent arm, `e3-moth-season.tape.json`**: rc 1 on both ("declared runStart is not installable by this door"), with the same stderr.
- **Browser arm, the River reel:** identical outputs with `wallMs` excluded.
- **Browser arm, the reel relabelled to `the-claim`:** identical outputs with `wallMs` excluded.

Pans measured in the spec, as swing then landing:
- desktop: 3.400 / 4.867 s;
- phone: 3.433 / 4.867 s;
- after a reload and after a re-pull: each landing between 4.60 and 4.73 s.

### 13.5 Engine hash
- **Before:** `642edcf65fcab2089164c6f33cfabf4a1a9805735a3b6df6f33dfa947cb6a32a` (pin #66).
- **After, tip `6af7bf60b`:** `29324ba84fc802adf46cd38825f4721686a75f8d62e4d6089f0d6854c8a21b1f` (`followup-2026-09-26/engine-hash-tip.txt`). This replaces section 7's `0f2c5904...`, which the drain must not pin.
- **Cause, one line:** `src/game/Game.ts` only. The River ceremony's first pan records a completed score and reel, its county post is held, and the River's playbooks are judged under the reel's contract. No sim rule, contract, collision, floor or table moved.

### 13.6 Commits and remaining
- **Commits:**
  - `0d1387632`: the hold, and the spec asserting it.
  - `6af7bf60b`: F-RES1-4.
  - This addendum and `followup-2026-09-26/` in the next commit, with the refreshed pan, Book and reel evidence of the re-run.
- **Remaining, in order:**
  1. The drain pins `29324ba8...`.
  2. F-RES1-1 and F-RES1-6 become the assay follow-up slice, which flips `RIVER_STANDING_POSTS_ENABLED`.
  3. F-RES1-2 goes to the Astra harness line.
  4. F-RES1-3 and F-RES1-5 go to the owner's desk.
  5. F-RES1-7 goes to the tape/playbook owner.
