# county-board-open-week-1: implementer report

**Branch** `feat/county-board-open-week-1` in `/Users/robin/Claude/Projects/wt-cbw1`, cut from main at `be37d83cf` (the master names `b3762cab9`; main had moved by one commit, the authoring of this master). Main was not merged or rebased.
**Implementer** Claude Opus 5.5 at maximum effort, attended-side scratch worktree, never Codex. **Date** 2026-09-26.
**Owner directive** 2026-09-26, verbatim "3 - ok, lets do that", answering F-LSR1-1.
**Verdict: READY-FOR-GATES.** Shape (a): the public board GET reads one week's partition by `?rotation=<id>` or `?rotation=open`, and the unfiltered board keeps every byte. The in-game County Standings opens a rotation contract on the week a live run of it rides, labelled "Week 39 claim", with All time one tap away. A rider's secured live standing is on the board they open, measured end to end. The engine hash moves (`642edcf6` pin #66 to `cc0b2288`; ruled a pinned landing). The door half alone (`2a26070e4`) leaves it unchanged.

---

## 0. How this run went
1. **Premises measured first (section 2).** Two were false: the brief's coordinates for the board fetch, and the master's "Engine hash expected UNCHANGED (door GET + UI only)". The engine corpus is all of `src/`, so the in-game half cannot leave the hash alone.
2. **Interim message:** shape (a) chosen; the in-game half held on the hash premise, with the measurement.
3. **The attended session's ruling:** build the in-game half as its own commit after the door half; the hash moves and the landing pins it, as live-seed-rotation-1 did at #62. Shape (a) approved as described, including the strict param arithmetic and 400 `bad_rotation` for an unknown, unopened or non-carrying week.
4. **Named lift F-CBW1-1** (the attended session's): one line in `e2e/assay-season-roll.spec.ts`, its own commit.
5. **Four locked batteries** under `scripts/attended/dlock.sh`:
   - battery 1 (11:34Z to 12:08Z): build, hashes, door table, replays, e2e, test:stats, node-guards, null floors;
   - battery 2 (12:08Z to 12:12Z): the fixed spec, three mutants, and the clean-base control;
   - battery 3 (17:06Z): the door half alone;
   - battery 4 (17:09Z): the board shots re-framed.
   Battery 1's first spec run found two defects in my own tests, not in the code (end of section 8), fixed before any commit.

---

## 1. What changed
| Commit | Concern | Paths |
| --- | --- | --- |
| `851cf903c` | the public board serves one week's partition (door half) | `functions/api/standings.ts`, `e2e/county-board-open-week.spec.ts` (the two door tests) |
| `2a26070e4` | `test:stats` reads the week's board through the Pages runtime | `scripts/test-stats.mjs` |
| `d71aa1415` | the in-game county board opens on the live week (board half) | `src/encyclopedia/reader.ts`, `src/encyclopedia/reader.css`, `src/game/liveSeed.ts`, `e2e/county-board-open-week.spec.ts` (the three in-game tests) |
| `c2423804b` | lift F-CBW1-1: assay-season-roll opens the all-time board first | `e2e/assay-season-roll.spec.ts` (one line) |
| `a9289a04a` | the board shots frame the rows | `e2e/county-board-open-week.spec.ts` (the shot helper) |
| (this commit) | report and evidence | `artifacts/county-board-open-week-1/**` |

The client board files are `src/encyclopedia/reader.ts` (the Claim Ledger's County Standings: `renderStandingsLedger`, `loadCountyStandings`, `onLedgerClick`) and `src/encyclopedia/reader.css`. `src/game/liveSeed.ts` gains one export, the "missing export" the master allows, and no semantic change.

---

## 2. Premises, measured before building
| Premise (master or brief) | Measured | Verdict |
| --- | --- | --- |
| `functions/api/standings.ts:714`, the public partition `rows.filter((row) => !row.rotationId && ...)` | read at `:714` | true |
| `:579-589`, the transfer board: `?rotation=<id>`, `url.searchParams.size !== 2`, verified solo only | read at `:578-:590` (`:580` the size check, `:585` the verified-solo filter) | true |
| `:716-717` `currentOrLatestRotation`, `heldOutFor`; `:769` rows carry `rotationId` | read | true |
| `src/game/liveSeed.ts`: `resolveLiveSeed`, `liveSeedLabel` gives "Week N claim" | read `:38-:60`, `:66-:70` | true |
| the registry holds r2026w37..w40, week 40 opens Monday 2026-09-28 00:00 UTC | read `assets/rotations/rotation-seeds.json` | true |
| `src/town/TownScene.ts:2516` shows the seed label in the ride setup | read | true |
| brief: the client fetch of the board is `src/main.ts:578` | `:578` is inside `openWatchDeepLink`, the WATCH deep link's reel lookup (`?reel=&contract=&epoch=`) | **false** |
| brief: the encyclopedia reader at `src/encyclopedia/reader.ts:558` and `:637` | `:558` is `loadSeasonResults` (the Seasons page, `?view=byStack/byHarness`); `:637` is `loadFieldBook` (`?view=`). The county board is `loadCountyStandings`, its fetch at `:914` on the base (`:957` now); `:954` is its WATCH reel lookup | **false** (the board was found by the master's own grep instruction) |
| master: "Engine hash expected UNCHANGED (door GET + UI only)" | `ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36-:44`) hashes every `.json/.mjs/.ts` under all of `src/`: 662 files. Base `642edcf6` (= pin #66). One byte appended to `reader.ts` in memory: `fee026e4`. `functions/`, `scripts/test-stats.mjs`, `e2e/` and `reader.css` are outside the corpus | **false**; ruled a pinned landing |
| master: `test:stats` passes `ALLOW_LOCALHOST_ORIGINS=1` since localhost-cors-2 | lc2 was not on main at my cut (`80854592d` not an ancestor of `be37d83cf`); it landed later (`78afe945f`). My base admits localhost unconditionally, so the harness passes either way | true on main now |
| `public/skill.md` fenced rotations block (do not edit) | untouched; it already lists r2026w40's seeds (7 mentions), two days before that week opens | noted, F-CBW1-5 |

---

## 3. The door, shape (a), and why
**Shape (a).** The public board's plain branch (`getBoard`) takes one more optional param, `rotation`. It is counted into the same strict arithmetic as `season`, `difficulty` and `party` (`functions/api/standings.ts:697-:699`), and resolved before the ledger is read (`:715-:716`; `boardWeek` at `:1312`):
- `open` resolves through `currentOrLatestRotation(now)`, the function the held-out cell already reads; any other value must be a registry id.
- A week that has not opened yet (`specs/transfer-board.md` L2), or one that does not carry the contract, answers `400 bad_rotation`, "Rotation not accepted." (the transfer board's own words). A closed week stays readable as history. The Drill Yard is refused `bad_contract` before any of this, exactly as without the param: `knownContract` keeps no board for it.
- The partition predicate becomes `(week ? row.rotationId === week.id : !row.rotationId)` (`:723`), so ranks are minted inside one week and nowhere else. Everything below it runs unchanged: the party partition, `rankedRows`, the same `heldOutFor(row, rows, contractId, currentOrLatestRotation(now))` call, the difficulty filter, and the three counts (now counted inside the week).
- The payload names `rotationId` only when a week was asked for (`:740`), so the unfiltered payload keeps its exact keys.

**Why (a) and not (b).** The in-game board already speaks this grammar (contract, epoch, party, difficulty, season: `loadCountyStandings`). One param reuses every rule, where a second board kind would re-derive them all: party sizes, the difficulty filter, the counts, the season books, the strict arithmetic. A second kind would also sit beside the transfer board, which is verified-solo by design and stays untouched.

**`heldOut`, preserved.** The same call with the same rotation argument serves both boards. A verified row with a `harnessDigest` points at the best same-digest showing on the week the county reads now. On the current week's own board that can be the row itself, which is true and harmless.

**Untouched:** the unfiltered board (byte-identical, section 4), CORS, the POST path, `compareScores`, the transfer board, party rules, the field book (`?view=`, still constant-seed only: F-CBW1-7), and the reel and verdict lookups (their own arithmetic refuses a stray `rotation`, as spec'd).

---

## 4. Door rows before and after (one ledger, one clock, both doors)
`door-before-after.mjs` loads `functions/api/standings.ts` from the clean base (a detached worktree at `be37d83cf`) and from this branch through vite's SSR loader. It pins the clock mid-week (2026-10-01T12:00Z: latest week r2026w40, prior r2026w39) and asks both doors the same 15 questions over the same ledger: an all-time row, a solo, a posse and a refused reel on the latest week, and a row on the week before. Full output: `door-before-after.txt` and `door-before-after.json`.

| Question | Before (`be37d83cf`) | After (this branch) | |
| --- | --- | --- | --- |
| `?contract=the-claim&epoch=epoch-1-frontier` | 200 [1. All-Time Rider] | 200 [1. All-Time Rider] | byte-identical |
| `...&party=2` / `&difficulty=trail` / `&season=1` / `&season=2` | 200, 200, 200, 200 | identical | byte-identical |
| `?board=transfer&rotation=r2026w40` | 200 transfer | identical | byte-identical |
| `?view=byStack&epoch=epoch-1-frontier` | 200 | identical | byte-identical |
| `...&rotation=r2026w40` | 400 `bad_contract` | 200 week r2026w40 [1. Week Rider], rejected 1 | new |
| `...&rotation=open` | 400 `bad_contract` | 200, identical to the named week | new |
| `...&party=2&rotation=r2026w40` | 400 `bad_contract` | 200 [1. Week Posse] | new |
| `...&rotation=r2026w39` (closed week) | 400 `bad_contract` | 200 [1. Last Week Rider] | new |
| `...&rotation=r1999w01` | 400 `bad_contract` | 400 `bad_rotation` | new code |
| `?contract=e1-drill-yard&...&rotation=r2026w40` | 400 `bad_contract` | 400 `bad_contract` | identical |
| `?contract=e2-trestle&epoch=epoch-2-steamworks&rotation=r2026w40` / `=open` | 400 `bad_contract` | 400 `bad_rotation` | new code |

**8 byte-identical, 7 moved, and every move is a request the base refused.**

---

## 5. The in-game board
**Where the player sees it, in a plain boot (Mistake #10):** Start menu, Claim Ledger, County Standings. A contract with a rotation seed opens on the week a plain run of it rides now, named as the ride card names it, with All time one tap away.

- `standingsWeek(contractId)` (`src/encyclopedia/reader.ts:470`) takes `resolveLiveSeed(contractId)`, the rule `Game.ts:1612` and `RideTogether.ts:200` start a run on. It names the week with `liveSeedLabel` ("Week 39 claim") and finds its registry id with the one new export, `liveSeedRotationId` (`src/game/liveSeed.ts:75`). The existing functions are byte-identical, the module still imports nothing but the registry, and the unit test passes 7 of 7; the export matches the registry for 24 of 24 minted seeds and is null for the constant and for a look-alike. So the board a rider opens is the week their live run posted to.
- `renderStandingsWeeks` (`:477`) draws the chip row under the contracts: the week chip (pressed by default) and "All time". The board label reads the week's label, or "County board" on All time (unchanged there).
- `loadCountyStandings` (`:942`) names the week only on the week's board (`:967`). All time sends the request this reader has always sent, byte for byte: the spec asserts `?contract=the-claim&epoch=epoch-1-frontier`. The week the label shows and the week the request names are fixed together at render (`currentStandingsShownWeek`), so a render and its fetch cannot straddle Monday 00:00 UTC.
- The closed first ledger shows no week row and names no week. A contract no week carries keeps its single board (spec'd on the Steamworks board).
- **Boot writes nothing** (Mistake #7): the fetch stays where the board is opened, GET only, with no new timer or polling. The spec counts zero county requests on a plain boot until the board is opened, and only GETs after.
- **Phone:** the chip row joins the existing chip rules in `reader.css`, including the 390px wrap. The spec asserts no sideways scroll in the row and the row inside the viewport, on both projects.

**The rider's own standing, end to end** (`board: a secured live run posts to its week...`, both projects): a dev boot secures the Claim on the live seed, and the REAL door (in process, in-memory ledger) answers `200 {"ok":true,"stored":true,"rank":1,"decidedBy":"crown","rotationId":"r2026w39"}` (`own-standing-door-*.json`). The stored row carries `rotationId: r2026w39`. Back at the menu, the county board opens on "Week 39 claim" with Robin at rank 1; All time does not carry the row.

**Screenshots** (both projects): `board-week-{desktop,mobile}-chrome.png` (the week board, its label and its row), `board-all-time-{desktop,mobile}-chrome.png` (the all-time board, one tap away), `own-standing-{desktop,mobile}-chrome.png` (the rider's own week standing). Each shot is taken with the week row at the top of the ledger's own scroll and row 1 asserted in the viewport first (battery 4), so the chips, the label and the rows share the frame. On 390px the Reel column sits behind the board's own horizontal scroll (`reader.css:397-:399`, `overflow-x: auto`, untouched here).

---

## 6. Engine hash, replay, floors
| | |
| --- | --- |
| base `be37d83cf` | `642edcf65fcab2089164c6f33cfabf4a1a9805735a3b6df6f33dfa947cb6a32a` (= pin #66; the probe replica equals `computeEngineHash`) |
| door half alone `2a26070e4` | `642edcf6...` unchanged (battery 3) |
| the board half, `d71aa1415` onward (the tip included: every later commit is outside the corpus) | `cc0b2288965ecf45d7c1f30cd19de2aca66c6391ba0ade33141ef502ee3a05fb` |
| **pin cause, one line** | **"the county board reader's bytes; no sim, contract, floor or table changed"** (`src/encyclopedia/reader.ts`, `src/game/liveSeed.ts`; `reader.css` is outside the corpus) |

Main has since pinned #67 and #68 for other slices, so the landing computes the pin on the merged tree, not on `cc0b2288`.

**The assay replay agrees.** `scripts/assay-replay-agent.mjs` ran on three tapes, each on the clean base and on this branch; each pair of outputs is identical byte for byte (`gates/replay/`):
- the era-6 agent-door tape `artifacts/gauntlet-heat14-e3949bfa/rides/the-claim/work/probe-idle-tape.json` (engine pin index 7, 2026-09-18) replays to `eventLogHash fnv1a32:a45ba9ac`, 2 waves, 0 gold, 81.767 s, 2453 ticks on both trees, exactly the tape's own declaration;
- the heat-15 regatta probe fails identically on both ("tape ran out after 27600 steps with the run still alive");
- the `eh3-fixture` fails identically on both ("malformed tape"). Both of these are stale tapes, pre-existing and unchanged by this slice.

**Every pinned floor holds:** `node scripts/null-floor-anchors.mjs --check`, rc 0, **83 of 83 null floors match** `assets/contracts/null-floors.json` (290.1 s, on the hash-moved tree).

---

## 7. Evidence
| Check | Result |
| --- | --- |
| tsc | rc 0 at the tip; rc 0 at `2a26070e4` alone (battery 3) |
| `npm run build` | rc 0 (battery 1, 11:34Z) |
| `e2e/county-board-open-week.spec.ts`, desktop and mobile | **10 of 10** (battery 2, 18.2 s); **10 of 10** again after the shot re-framing (battery 4, `a9289a04a`, 19.7 s) |
| the same spec at the door half alone (`2a26070e4`: its 2 door tests) | 4 of 4, both projects (battery 3) |
| adjacent: `live-seed-rotation`, `tl-02-public-stats`, `task-025-bandits-dont-swim`, `m2-01-build-menu`, both projects | **52 of 52**, rc 0 (battery 1) |
| board-pinning specs (`lb-01`, `milk-county-board`, `assay-season-roll`, `sea-2-season-page`, `en-01-claim-ledger`, `transfer-board`), both projects | 46 passed, 12 red; **all 12 red identically on the clean base** (section 8) |
| `agent-reels -g "town board"`, both projects | 6 red; **all 6 red identically on the clean base** |
| `npm run test:stats` | **rc 0**: stats worker 99 checks (13 of them the new week-board checks through `wrangler pages dev`), standings kv 617, sqlite 617, ledger worker 26 |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` | rc 1: 1037 tests, 1026 pass, 6 fail, 5 skipped; every fail attributed (section 8) |
| null floors | rc 0, 83 of 83 |
| mutations (section 8) | 3 of 3 planted defects caught, each file restored byte for byte (sha256 OK); unmutated control 3 of 3 |
| zero console and page errors | asserted in all three in-game tests on plain boots, both projects |
| boot writes nothing | zero county requests before the board opens; GETs only after (spec) |
| merge onto main `73b381bce` (68 commits ahead of the base, lc2 and pins #67, #68 among them) | clean: `git merge-tree` rc 0, no conflicted path. The three files lc2 also touched (`standings.ts`, `test-stats.mjs`, `assay-season-roll.spec.ts`) carry both sides in the merged tree |
| tested bytes | the 7 checksums of battery 2 (`gates/tested-files.sha256`) match the tree at `c2423804b`, 7 of 7; the one later change (the shot helper, `a9289a04a`) was re-run whole in battery 4 and its checksum matches that commit |

**Expected reds in the landing's list** (this spec, `live-seed-rotation`, `tl-02`, `task-025`, `m2-01`, both projects): **none.** The door tests pin their clock. The own-standing test needs any open Claim week in the registry: r2026w39 until Monday, r2026w40 after. Otherwise it skips with the F-LSR1-2 reason rather than reddening. **Expected pre-pin node-guard reds** until the landing pins: the two registry rows below, and the fixture sweep through its `bench-seeds` child.

---

## 8. Reds, each attributed by a control
**E2E** (outside the landing's list; the control ran the same files on a clean-base worktree `wt-cbw1-ctl` at `be37d83cf`, same flags, both projects: `gates/e2e-board-control-base.log`, `gates/e2e-reels-control-base.log`):
| Red (both projects) | Failing assertion, branch | On the clean base | Reading |
| --- | --- | --- | --- |
| `assay-season-roll.spec.ts:103` test 1 | `:122` row-1 "Fresh Season Rider" not found | same assertion at `:121` | F-LC2-13, pre-existing: the fixture tapes carry no era papers (`tape()` builds no `meta`), so `currentLineageRefusal` keeps them unranked and the boards are empty. The lift's click (`:121`) runs and succeeds before it; the lift is one line, so every later line sits one lower |
| `assay-season-roll.spec.ts:148` test 2 | `:157` archive board empty | same at `:156` | F-LC2-13 |
| `lb-01-county-standings.spec.ts:387` | `:613` full-board POST answer | same | the POST path, untouched |
| `lb-01-county-standings.spec.ts:654` | `:661` no POST within 8 s | same | the POST path, untouched |
| `milk-county-board.spec.ts:446` | `:579` `replay` URL param null after WATCH | same | the WATCH hand-off, untouched |
| `transfer-board.spec.ts:8` | `:38` console: "Failed to resolve module specifier './standing-rule.js'" (`site/assay-office.js` under `page.setContent`) | same | `site/`, untouched |
| `agent-reels.spec.ts:288`, `:322` | the Lantern never mounts: "The county clerk cannot find that reel" | same | the `eh3-fixture` reel is refused (`malformed tape` on both trees, section 6) |
| `agent-reels.spec.ts:303` | the node replay of the Hill Mine crown throws | same | stale crown tape |

**Node guards** (the same seven guard files re-run on both trees, with `TMPDIR` in scratch: base 78 tests with 16 failing, branch 78 with 18 failing, the branch's reds = the base's 16 + exactly the two registry rows; `gates/node-guard-reds-*.log`):
| Red | Reading | On the clean base |
| --- | --- | --- |
| `bench-seeds` "rotation registry stays outside the engine identity corpus" | computed `cc0b2288` against declared `642edcf6` | green; **pre-pin, cured by the landing's pin** |
| `engine-era-guard` "the landed registry names the live engine and stays outside its hash corpus" | `cc0b2288` absent from era 6 | green; **pre-pin** |
| `desk-declaration-guard` "the live board is green under this guard" | REFUSING: a linked worktree whose STATUS line 1 is not main's | same |
| `ledger-backup-pull` x2 | "GR_DROPLET_HOST missing from the environment and .env.local": a scratch worktree carries no `.env.local`, which this run never read or copied | same |
| fixture sweep | its failing children are exactly the above, plus three ledger guards of the same `.env.local` class; its one survivor `s2672-dest-*` comes from `ledger-mirror-freshness-guard` failing | same: one `s2672-dest-*` survivor on each tree |

**Mutations** (battery 2; each defect planted alone, run, restored, sha256 checked: `gates/mutation-*.log`):
| Mutant | Planted in | Caught by |
| --- | --- | --- |
| m1: the door ignores the week (partition always `!row.rotationId`) | `standings.ts` | both door tests (2 failed) |
| m2: the door admits a week before it opens (no `opensAt` check) | `standings.ts` | the refusal test (1 failed, the other 1 passed) |
| m3: the reader never names the week in its request | `reader.ts` | the in-game week-board test |
| unmutated control of the same three selections | | 3 of 3 passed |

**My own two test defects, found by battery 1 and fixed before any commit** (`gates/e2e-spec-first-run.log`):
- the door test expected `bad_rotation` for the Drill Yard, which the door refuses `bad_contract` first. The non-carrying case now uses the first board the door keeps that no week carries (`e2-trestle`), and pins the Drill Yard's `bad_contract`.
- the own-standing test's live fence caught `GET /api/stats`: the Claim Pages records card reads the assay office once a run has discovered it. That read is not the board's, so the spec's county server answers it with the office's empty payload.

---

## 9. Merge classification
Against current main `73b381bce`: clean (`git merge-tree --write-tree` rc 0, no conflicted path).
- **Files main moved under this branch:** `functions/api/standings.ts` (lc2: import, the CORS call sites, `corsHeaders`), `scripts/test-stats.mjs` (lc2: the binding in `startPages`), `e2e/assay-season-roll.spec.ts` (lc2: the switch in `serveCounty`, lines 90-96; the lift is at line 121), `assets/engine-era.json` (pins #67, #68; not touched here).
- **Files only this branch touches:** `src/encyclopedia/reader.ts`, `src/encyclopedia/reader.css`, `src/game/liveSeed.ts`, `e2e/county-board-open-week.spec.ts`, `artifacts/county-board-open-week-1/**`.

---

## 10. Findings
- **F-CBW1-1 (the attended session's named lift, landed as `c2423804b`):** the county board's default view is now the week, so `assay-season-roll` test 1's constant-seed assertion needs the all-time toggle first. One line, nothing else in the file. Both tests of that file stay red for the pre-existing F-LC2-13 (stale fixtures without era papers), identically on the base.
- **F-CBW1-2 (the master's premise):** "Engine hash expected UNCHANGED (door GET + UI only)" is false for any slice that touches `src/`. `ENGINE_SOURCE_INPUTS` covers all of it, UI included, by design ("conservative source identity"). Ruled: a pinned landing, cause as in section 6. Masters that say "UI only" should say "pinned" whenever `src/` moves.
- **F-CBW1-3 (the brief's coordinates):** `src/main.ts:578` is the WATCH reel lookup; `reader.ts:558` and `:637` are the Seasons and Field Book reads. The county board is `loadCountyStandings` (`:914` on the base).
- **F-CBW1-4 (skill.md, outside my firewall):** `public/skill.md` documents the transfer board and the public `heldOut` cell but not the new `?rotation=<id>|open` on the public board. An agent cannot learn the week's board from the door document. One sentence belongs in its ROTATION section; skill.md is guarded, so that is an attended or fire edit.
- **F-CBW1-5 (consistency note, no action here):** `specs/transfer-board.md` L2 says a week's seeds are "published the moment the rotation opens". skill.md (7 mentions) and the transfer board (`?board=transfer&rotation=r2026w40` answers 200 with its seeds) already publish week 40 two days before it opens, following the mint-a-week-ahead practice (F-LSR1-2). The public board added here refuses an unopened week, as approved. Whether L2's wording or the transfer board should change is the owner's call.
- **F-CBW1-6 (cosmetic):** `docs/bench/same-game-audit.md` cites `functions/api/standings.ts:17xx` by line (672 cells). It was already 17 lines stale on the base (`weapon_toggle` cited at `:1750`, at `:1767` on the base), and this slice adds 20 more (`:1787`). No guard reads those coordinates; `node scripts/same-game-audit.mjs --write-report` at the next audit landing regenerates them.
- **F-CBW1-7 (a slice, if wanted):** the Field Book (`?view=`) is still constant-seed only (`standings.ts:605`, `!row.rotationId`), so week rows appear in no field book view. Out of scope; recommendation only.
- **F-CBW1-8 (process, my own slips, recorded so the next run avoids them):**
  - The session scratchpad is shared by the attended session's implementers. My generic `msgs/c1..c4.txt` overwrote four commit-message drafts of the is-main-2 implementer, written at 09:16; the commits they drafted are in git (`5cd992fbc` .. `0f4ecee78`), so nothing is lost. Everything of mine then moved under `scratchpad/cbw1/`.
  - Docker's backend listens on `127.0.0.1:5548`, so battery 1's control vite could not bind and that control arm was void. It was re-run in battery 2 on a port probed free, with the listener verified to be the pid started. Batteries should verify listener ownership, not only a free-looking port.
- **Pre-existing reds, for their owners (all measured identical on the clean base, none touched here):** `lb-01` `:613` and `:661`; `milk-county-board` `:579`; `transfer-board` `:38` (`standing-rule.js` under `setContent`); `agent-reels` town-board x3 (the `eh3-fixture` is malformed under today's grammar; the Hill Mine crown's node replay throws); the ledger guards need `.env.local`; the desk guard refuses in linked worktrees once main moves; `ledger-mirror-freshness-guard` leaves an `s2672-dest-*` directory when it fails.

---

## 11. Remaining, in order
1. **The landing pins the merged tree's hash**, cause "the county board reader's bytes; no sim, contract, floor or table changed". The two registry rows and the sweep's `bench-seeds` child are the expected pre-pin reds.
2. F-CBW1-4: one sentence for the public board's `?rotation=` in skill.md's ROTATION section (attended or fire).
3. F-LC2-13: refresh `assay-season-roll`'s fixtures with era papers (pre-existing, its own slice).
4. The other pre-existing reds above, to their owners.
5. F-CBW1-7 (optional): a week view in the Field Book.
6. F-CBW1-6 (cosmetic): regenerate the same-game audit report.

The worktree carries regenerated evidence from the adjacent specs (`artifacts/live-seed-rotation-1/*`, `reviews/shots-*`, `artifacts/county-standings/`, `artifacts/en-01/`, `artifacts/056/`). It is factory churn, left uncommitted: not this slice's to land. The control worktree `wt-cbw1-ctl` is removed; battery 3's `wt-cbw1-door` is removed.
