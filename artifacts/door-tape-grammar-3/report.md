# door-tape-grammar-3: report (F-DTG2-2)

READY-FOR-GATES. Branch `fix/door-tape-grammar-3`, cut from main at `3b12c4236` (grammar-2 on main: `git log --oneline main | grep -c door-tape-grammar-2` = 3). It was never merged or rebased. Commits:
- `a3531c91b`: the grammar, with its red-first rows.
- The report commit: this file and the evidence beside it.

Implementer: Claude Opus 5.5 at maximum effort, worktree `/Users/robin/Claude/Projects/wt-dtg3`, Node v26.4.0. Nothing was deployed, and nothing contacted the county door, the live site or the droplet.

## Verdict in one paragraph
In three places the door accepted an action its own client refuses. A reel carrying one was stored and ranked, but the Lantern and the assayer judge a reel with `validateRunTape` and could not load it. The three places:
- a `place_build` id of whitespace only;
- a `pick_upgrade` id of whitespace only;
- a `set_agent_ability` naming an ability the client does not know.

The door now asks the client's own normalizer about these three verbs and refuses exactly what it refuses, `400 bad_payload`. Every other bound of the door stays as it was.

A row stored before this grammar is not dropped. At read the old shape still stands, and `tapeGrammarRefusal` RETIRES the row: it leaves the ranked board, it is counted in `retiredCount`, its bytes are untouched and its reel stays on the shelf.

Counts: `scripts/test-standings.mjs` goes 467 -> 514 checks per backend, with all 467 existing checks green. Every one of 8 mutations turns a row red. A 79-row differential probe of the door against the client measures that exactly the 7 targeted rows moved, all at the door. The read grammar (`validateTape` with `stored`) keeps all 79 of its verdicts; the only change at read is the intended retirement.

Not every looser place is closed. The same probe finds 6 more rows where the door is looser than the client, outside the three this master names: `research_pick` ids, and `context_action` target ids (F-DTG3-1). So the master's title, "a stored reel can always be loaded", is true for these three verbs only.

## Where the player sees it
- **An honest rider sees no change.** The browser recorder cannot write any of the three shapes, because both of its paths run the client's normalizer first (`RunTape.ts:205-209`; `LockstepClient.ts:862-865`). In a plain boot, Return to Town after securing lands the standing as before. The recorder-built controls are still stored and read back loadable, and a test row pins each one.
- **A hand-built POST** carrying one of the shapes now gets "Standing not accepted." (`400 bad_payload`). Before, it was stored and ranked (RED 1: ranks 1, 2 and 3).
- **The county board** no longer ranks a stored reel that nobody can replay. The response's `retiredCount`, documented for agents in `public/skill.md:54`, counts it. No in-game screen reads `retiredCount`: `grep -rn retiredCount src` is empty.

## What changed (against `3b12c4236`: 2 files, +159 / -14)
**`functions/api/standings.ts` (+21 / -4).** It touches only `validTapeAction`, `tapeGrammarRefusal`, one new helper and one import:
- The import of the client's `normalizeLockstepAction` (`:7`). `LockstepClient.ts` is already in the function's graph, through `RunTape.ts:3-11` and `PlaybookFormat.ts:1`.
- The helper `CLIENT_JUDGED_ACTIONS` and `clientRefusesAction` (`:1786-1795`). It returns true only for the three verbs, and only when the client's normalizer returns null.
- `validTapeAction`: one gate, `if (!stored && clientRefusesAction(value)) return false;` (`:1753-1755`). It sits at the door only. No `value.type === '...'` literal was added, so the same-game audit's action list is unchanged.
- `tapeGrammarRefusal`: one line (`:1252`) that returns a retirement reason for such an action, in the primary entries, every stream and every playbook recording it walks. The doc comment above it (`:1236-1241`) says so and cites ADR-004.

Untouched: every other clause, the handler's entry points, the env types, the CORS arm (`:169`, `:1897-1910`), and `src/`, which is byte-identical to `3b12c4236` (`git diff --quiet`).

**`scripts/test-standings.mjs` (+138 / -10):**
- Two new checks run in each backend pass (`:57-58`): `checkClientGrammar` (`:585`) and `checkRetiredClientGrammar` (`:649`).
- `recorderReel` (`:1804`) gains three options:
  - `upgrade`: a `pick_upgrade`, recorded through `recordAction` as a solo level-up pick is (`Game.ts:8810`).
  - `ability`: a `set_agent_ability`, recorded in a tick's action list, the only way it reaches a tape (from a multiplayer ride: `Game.ts:8750-8751`, then `:7969-7974`; solo play applies it and returns at `:8761-8762`).
  - `offered`: actions handed down BOTH recorder paths.

  With the options absent the recording is unchanged. The grammar-1 and grammar-2 counts (40, 41, 14) are identical before and after.
- Grammar-2's local `storedRowOf` moved to module scope unchanged (`:1873`), so both retirement checks share it.
- Two small helpers: `reelActions` and `reelVerb` (`:688-694`).

## The three refused shapes (at the door, `400 bad_payload`)
Each shape is refused exactly where the client's `normalizeLockstepAction` (`LockstepClient.ts:1060-1120`) returns null. The door keeps every bound it already had: exact keys, the 64-character cap, the position range, `rotationSteps` 0 to 3, and a boolean `granted`.

1. **`{ type: 'place_build', id, position, rotationSteps }` whose `id` trims to nothing.** For example `'   '` or `'\t\n'`. The client's `cleanToken(value.id, 64)` returns null (`:1063-1066`, `:1158-1162`).
2. **`{ type: 'pick_upgrade', id }` whose `id` trims to nothing** (`:1083-1085`).
3. **`{ type: 'set_agent_ability', ability, granted }` whose trimmed `ability` is not one of the client's five:** `auto_collect`, `auto_repair`, `auto_pan`, `light_duty`, `place_building` (`:1106-1111`). For example `'fly'`, `'AUTO_PAN'` or `'   '`.

Still accepted, because the client keeps them (each pinned by a row):
- ids with edge whitespace (`' sluice '`, `' heavy_spark '`);
- a `place_build` naming no building (the client's `place_build` takes any id);
- `' auto_pan '`;
- each of the five abilities.

## RED first (scope 1)
**How the shapes were built.** The controls come from the real `RunTapeRecorder`: a `place_build` `'sluice'` through `recordAction`, a `pick_upgrade` `'heavy_spark'` through `recordAction`, and a `set_agent_ability` `'auto_pan'` through a tick's action list. The three shapes were made BY HAND from those controls, because the recorder itself refuses each. A test row hands the three shapes down both recorder paths and finds the reel's entries identical to a reel without them. A second row finds `normalizeLockstepAction` returns null for each.

**RED 1: the door.** The new rows ran against the untouched door. `functions/` and `src/` were equal to `3b12c4236`, and the test file was byte-identical to the one committed in `a3531c91b` (checked with `cmp`). Command `node scripts/test-standings.mjs`, rc=1:

```
contract clock census 42/25/17/0
recorder reel kv checks (40)
recorder verbs kv checks (41)
retired embedded orders kv checks (14)
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: the door refuses a place_build id and a pick_upgrade id of whitespace only and an ability the client does not know: [{"ok":true,"stored":true,"rank":1,"decidedBy":"crown"},{"ok":true,"stored":true,"rank":2,"decidedBy":"submittedAt"},{"ok":true,"stored":true,"rank":3,"decidedBy":"submittedAt"}]
+ actual - expected

  [
    [
+     200,
+     true
-     400,
-     'bad_payload'
    ],
    [
+     200,
+     true
-     400,
-     'bad_payload'
    ],
    [
+     200,
+     true
-     400,
-     'bad_payload'
    ]
  ]

    at equal (file:///Users/robin/Claude/Projects/wt-dtg3/scripts/test-standings.mjs:2009:10)
    at checkClientGrammar (file:///Users/robin/Claude/Projects/wt-dtg3/scripts/test-standings.mjs:618:3)
    at async file:///Users/robin/Claude/Projects/wt-dtg3/scripts/test-standings.mjs:57:5 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: [ [ 200, true ], [ 200, true ], [ 200, true ] ],
  expected: [
    [ 400, 'bad_payload' ],
    [ 400, 'bad_payload' ],
    [ 400, 'bad_payload' ]
  ],
  operator: 'deepStrictEqual',
  diff: 'simple'
}

Node.js v26.4.0
```

On the base, all three shapes were STORED and RANKED (ranks 1, 2 and 3). The rows before the assertion passed:
- each control carries its verb once;
- the client's normalizer refuses each shape;
- the recorder refuses each shape on both paths;
- the three controls are accepted (`200 stored`);
- each control reads back through `?reel=` loadable, with its verb intact.

**RED 2: the stored rows (scope 3).** Same tree, with only the order of the two new check calls swapped for this one run. It was then restored and verified with `cmp`. rc=1:

```
AssertionError [ERR_ASSERTION]: a stored row with a place_build id of whitespace only is RETIRED and COUNTED, not dropped and not ranked
+ actual - expected

  [
+   1,
    0,
-   1
  ]

    at equal (file:///Users/robin/Claude/Projects/wt-dtg3/scripts/test-standings.mjs:2009:10)
    at checkRetiredClientGrammar (file:///Users/robin/Claude/Projects/wt-dtg3/scripts/test-standings.mjs:677:5)
```

The two rows before it passed:
- the clean stored row ranks (`[1, 0]`);
- at read the grammar keeps the shaped reel, which the client cannot load.

On the base the shaped row RANKED (`[1, 0]`): a row nobody can verify, sitting on the board.

## GREEN (scope 2 and 3)
Committed tip `a3531c91b`, the tree equal to HEAD for `functions/`, `src/` and `scripts/`. Command `node scripts/test-standings.mjs`:

```
contract clock census 42/25/17/0
recorder reel kv checks (40)
recorder verbs kv checks (41)
retired embedded orders kv checks (14)
client grammar kv checks (23)
retired client grammar kv checks (24)
refusals kv sample {"ok":true,"counts":{"unsecured":1,"bad_payload":1},"recent":[{"reason":"bad_payload","contractId":"the-claim","refusedAt":1790357155947},{"reason":"unsecured","contractId":"the-claim","refusedAt":1790357155947}]}
standings assay kv checks passed (514)
contract clock census 42/25/17/0
recorder reel sqlite checks (40)
recorder verbs sqlite checks (41)
retired embedded orders sqlite checks (14)
client grammar sqlite checks (23)
retired client grammar sqlite checks (24)
refusals sqlite sample {"ok":true,"counts":{"bad_payload":1,"unsecured":1},"recent":[{"reason":"bad_payload","contractId":"the-claim","refusedAt":1790357157447},{"reason":"unsecured","contractId":"the-claim","refusedAt":1790357157446}]}
standings assay sqlite checks passed (514)
rc=0
```

### Counts (`scripts/test-standings.mjs`)
| tree | kv | sqlite |
| --- | ---: | ---: |
| before: base `3b12c4236` (pre-flight run, rc=0) | 467 | 467 |
| after: tip `a3531c91b` | 514 | 514 |
| of which new: "client grammar" 23 and "retired client grammar" 24 | 47 | 47 |
| existing checks, all still green (514 - 47) | 467 | 467 |

The file is fail-fast, so rc=0 means every existing check ran green.

### The new checks per backend
**`checkClientGrammar`, 23 checks:**
- Recorder fidelity (3): each control carries its verb once; the client's normalizer refuses each shape; the recorder refuses each shape down both paths.
- Controls (4): the door accepts the three recorder reels, and each reads back through `?reel=` loadable, with its verb intact.
- THE RED row (1): the three shapes through the real handler answer `400 bad_payload`.
- Per shape (6): `validateTape` null at the door, and `validateRunTape` null, which pins the premise that the client refuses it.
- The rule, not one value (4): a tab-and-newline id for each id verb, `AUTO_PAN`, and an ability of whitespace only are refused by the door and by the client alike.
- Nothing else tightened (5): `' sluice '`, a `place_build` naming no building, `' heavy_spark '`, `' auto_pan '` and each of the five abilities are accepted by the door and by the client alike.

**`checkRetiredClientGrammar`, 24 checks.** Four cases: each of the three shapes in the primary entries, and an unknown ability in a second rider's stream (party board). Six checks per case:
- the clean stored row ranks (`[1, 0]`);
- the grammar at read keeps the shaped reel, which the client cannot load;
- the shaped row is RETIRED and COUNTED (`[0, 1]`);
- the read leaves the stored bytes identical;
- `?reel=` serves the reel exactly as stored;
- the assay slip says `ranked: false`.

### Mutation check (`mutation.txt`)
Each run changed one clause of `standings.ts` at `a3531c91b`, ran the door test, and restored the source byte-identical (`git diff --quiet HEAD`).

| mutation | result |
| --- | --- |
| M0 none (control) | rc=0, 514/514 |
| M1 the client judges no `place_build` | RED at the door row (the whitespace `place_build` stored, rank 1) |
| M2 the client judges no `pick_upgrade` | RED at the door row |
| M3 the client judges no `set_agent_ability` | RED at the door row |
| M4 the door gate removed | RED at the door row: all three answer `400 reel_not_current`, each with its retirement reason, instead of `bad_payload`. The read clause still refuses them at POST (`currentLineageRefusal`, `:1021-1022`), but not as the grammar. |
| M5 the gate also at read (the naive fix) | RED "at read the grammar keeps a stored reel with a place_build id of whitespace only" (the row would be DROPPED; see Stored rows) |
| M6 read: no retirement clause | RED "a stored row with a place_build id of whitespace only is RETIRED and COUNTED" |
| M7 over-tight: only values the client keeps unchanged | RED "a place_build id with edge whitespace is still accepted" |
| M8 read: retirement judged in primary entries only | RED "a stored row with a second rider's set_agent_ability ... is RETIRED and COUNTED" |

### Nothing else loosened or tightened (`door-vs-client.txt`)
One action was injected into a reel written by the real recorder, and three judges ruled on it:
- the door at POST;
- the door at read;
- the client (`validateRunTape`).

The probe has 79 rows, covering every action type `validTapeAction` knows, with the neighbours of each field.

| tree | LOOSER (door accepts, client refuses) | tighter (door refuses, client accepts) | equal |
| --- | ---: | ---: | ---: |
| base `3b12c4236` | 13 | 14 | 52 |
| tip `a3531c91b` | 6 | 14 | 59 |

- Exactly 7 rows moved, all in the door-at-POST column, all from "accepts" to "refuses". They are the 2 + 2 + 3 forms of the three shapes.
- The read column is identical on all 79 rows, and so is the client column.
- The 6 LOOSER rows left are F-DTG3-1.
- The 14 tighter rows are F-DTG3-4.

## Stored rows (scope 3): what happens to a row already stored with each shape
No writer in this repo produces these shapes, so only a hand-built POST could have stored one:
- The browser recorder normalizes on both paths (`RunTape.ts:205-209`, `LockstepClient.ts:862-865`).
- The headless door writes only `kind: 'agent_orders'` entries plus a resumed tape's own prefix, which `validateRunTape` already passed (`scripts/gr-sim.mjs:82-87`, `:311`).

The live population is UNVERIFIED, because I read no live board. Measured with manufactured rows through the real handlers (`stored-rows.txt`, `post-verdicts.txt`):

| stored row carrying | base `3b12c4236` | tip `a3531c91b` | naive fix (M5), for comparison |
| --- | --- | --- | --- |
| a `place_build` id of whitespace only | RANKED (board 1, retired 0) | RETIRED (board 0, retired 1) | DROPPED (0, 0, `?reel=` 404) |
| a `pick_upgrade` id of whitespace only | RANKED | RETIRED | DROPPED |
| a `set_agent_ability` naming `fly` | RANKED | RETIRED | DROPPED |
| a second rider's `set_agent_ability` naming `fly` (party board) | RANKED | RETIRED | DROPPED |
| each clean control | RANKED | RANKED | RANKED |

For each of the three shapes, the retired row at the tip behaves as follows on each surface:
- **The board:** it leaves the ranked board and is counted in `retiredCount` (`isRetiredRow` -> `currentLineageRefusal` -> `tapeGrammarRefusal`, `:548-549`, `:1224-1234`, `:1252`). The reason it carries: "This reel carries a place_build the client cannot load, so it cannot replay; it stands retired under ADR-004." ADR-004 rule 2 says the boards carry only standings that replay, the rest are "retired with a lineage reason", and "Nothing is deleted".
- **Its bytes:** untouched by the read (a test row checks them byte-identical).
- **The shelf:** `?reel=` still serves it exactly as stored (200). The Lantern still cannot play it, since the client refuses it, which is why it is retired.
- **The assay slip:** `?verdict=` answers `assay: 'pending'`, `ranked: false`.
- **The assay queue:** it stays in the queue while `pending` (measured: queued). A browser-recorded reel goes to the instrument's browser arm (`isAgentTape`, `assay-replay-agent.mjs:82-88`). That arm boots the game with the reel, and the game refuses it at boot: `assayReplayBoot` (`Game.ts:456-466`) throws "Assay replay refused: invalid tape payload." when `validateAgentRunTape` (`LanternShow.ts:38-58`, through `validateRunTape`) returns null. So every attempt fails, at the arm's 60 s boot wait or its 120 s playback wait (`assay-replay.mjs:70-71`, `:76-81`), and the worker ends the row `unassayable` after 3 (`assay-worker.mjs:30`, `:124-149`). The row stays retired and counted either way. INFERRED by reading, not run. See F-DTG3-2.
- **Every ranked view** leaves it out, because each ranks through `rankedRows` -> `isRankedRow` (read at `:577-578`, `:597`, `:707`): the transfer board and the byStack, byHarness and byParty views.
- **The same rider's later POST:** the retired row is not a `prior` (`:1060`). It is kept among the unranked rows (`retainUnranked`, `:1062-1065`), up to the pre-existing `MAX_ROWS` of 100 by recency that bounds every unranked row.

The naive fix, refusing the shapes at read too, would drop all four silently: board 0, `retiredCount` 0, `?reel=` 404, gone from the assay queue. That is F-RPG-21 again. M5 pins it.

A shape inside a playbook use's recording could never be stored. The door refused it at POST on the base too (`400 bad_payload`, measured), and before grammar-1 no `playbookUses` were accepted at all. If manufactured anyway, it is DROPPED at read on both trees. That is latent and unreachable today: F-DTG3-3.

## Gates (self-check)
- Pre-flight:
  - `git status --short` showed only the untracked `node_modules` symlink;
  - `git log main..HEAD` was empty;
  - grammar-2 was on main (3 hits);
  - `npm run build` was green before any edit (`BUILD_EXIT=0`).
- `npx tsc --noEmit`: rc=0 at `a3531c91b`.
- `npm run build`: rc=0 at the tip (29 s), and rc=0 at the base before any edit.
- `src/` is byte-identical to `3b12c4236` (`git diff --quiet 3b12c4236 HEAD -- src/`), so the engine hash cannot move.
- The same-game audit's summary is unchanged: `node scripts/same-game-audit.mjs --json` at the tip reads `{ agent-exceeds 0, agent-lacks 595, equal 1252, not-offered 0 }` over 1847 rows. That equals the pin at `scripts/same-game-audit.test.mjs:455`. The audit reads `value.type === '...'` literals between `function validTapeAction(` and `function tapeMatchesScore(` (`same-game-audit.mjs:154-164`), and this slice adds none.
- No em or en dashes in the diff, the commit messages, the evidence or this report (grep count 0).

**Under the drain lock.** Each batch was one blocking call of `scripts/attended/dlock.sh`, backgrounded with nohup and waited on through its own output file. Batch 1, tip `a3531c91b`, lock held 17:29:09Z to 17:48:59Z:

| gate | result |
| --- | --- |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` | rc=1: 1018 tests, 1008 pass, 5 fail, 5 skipped |
| `npm run test:accounts` | rc=0 (kv 43, sqlite 43, sign-in hardening 27, office credential 26, ledger road 86, kv-to-ledger migration 16) |
| `npm run test:mp` | rc=0 (multiplayer relay 528) |
| `npm run test:stats` | rc=0 (stats 87; standings 514 kv and 514 sqlite; ledger worker HTTP contract 26, loaded through `loadLedgerHandlers`, the droplet's own path: `server/ledger/serve.mjs:14-16`, `configFile: false`) |

**The five reds, attributed.** The controls ran at the clean base `3b12c4236`, in a detached scratch worktree set up like this one: `node_modules` and the art store linked, no `.env.local`.

| red at the tip | attribution |
| --- | --- |
| `ledger-backup-pull`: two tests | Pre-existing, environmental. The base control gives the identical two reds: "GR_DROPLET_HOST missing from the environment and .env.local". There is no `.env.local` here, and none was read. |
| `node-guards-contention`: "absent when alone" | Pre-existing, environmental. The base control gives the identical red: "did not stay quiet for 300ms", "CONTENDED, 2 concurrent batteries". |
| `fixture-teardown`: all 161 owners | Pre-existing, environmental. The test stops at its first failing child (`fixture-teardown.test.mjs:50`). Children run in sorted order, and the first failure was child 106 of 161 (0-based), `ledger-backup-fill-gaps-guard`: 8 tests, 1 pass, 7 fail, "GR_DROPLET_HOST missing". The same file at the base gives rc=1, 1 pass, 7 fail, with the same message. |
| `board-tape-gold`: "the browser door submits the purse held ..." | A load-sensitive browser boot, not this branch. It failed with `page.waitForFunction: Timeout 120000ms` at `:177` (154.9 s), while the board read "CONTENDED, 2 concurrent batteries". It cannot reach the change: it fulfils `/api/standings` itself (`:170-172`), no `src/` file imports `functions/`, and the branch changes only `functions/api/standings.ts` and `scripts/test-standings.mjs`. It is measured flaky at the tip: it was green as `fixture-teardown` child 25 in the same battery. In batch 2 (lock held 18:04:14Z to 18:06:15Z) it ran alone and was green twice on the tip (30 s, 30 s) and twice on the base (30 s, 31 s). |

`desk-declaration-guard`, which was red for grammar-1 and grammar-2, and `same-game-audit.test.mjs` were green.

`test:accounts` and `test:mp` rewrote their two tracked artifacts again (factory churn, F-1407-1). They are left unstaged and are in no commit. Full detail is in `gates-summary.txt`.

## Adapted, and why
1. **Imported, not mirrored.** The master allowed "import or mirror". The door asks `normalizeLockstepAction` itself, the function the client's `validateEntries` calls to refuse a tape (`PlaybookFormat.ts:260-261`).
   - A mirrored copy of the five abilities would drift the way the grammar-1 and grammar-2 defects drifted.
   - `AGENT_ABILITIES` (`AgentConsent.ts:12-18`) is the consent list, not the refusal authority. It matches today, but only the normalizer's inline set (`LockstepClient.ts:1108`) decides what the client refuses.
   - The door's own shape clauses stay, so the door refuses the UNION of its old refusals and the client's. That is "nothing loosened", and nothing the client keeps is newly refused.
   - Grammar-2 mirrored its verbs because it had to accept exact new shapes. Here the task is to refuse, so the client's verdict is the right authority.
   - No module is added: `LockstepClient.ts` was already in the graph.
2. **One gate and one set instead of three clauses.** `clientRefusesAction` is the one source for both halves: the door refusal and the read retirement. A verb added to the door can therefore never be left out of the retirement. Each member of the set is mutation-pinned (M1 to M3).
3. **The stored path keeps the old shape.** Without that, tightening `validTapeAction` for both modes drops every such row at read (measured: M5). The master asks for "retired and counted, never dropped silently".
4. **The retirement reason cites ADR-004, not ADR-005.** ADR-005 retires verbs for rider parity. These reels are retired because they cannot replay, which is ADR-004 rule 2.
5. **`research_pick` keeps its old clause** although it shares a line with `pick_upgrade` (`standings.ts:1763`). It has the same defect (F-DTG3-1), but the master says "nothing else loosened or tightened". The set makes the follow-up one line.
6. **The door refusal and the read retirement are one commit.** They are one concern: the refusal alone would be the naive fix's harm the moment it met a stored row. The evidence and this report are the second commit.

## Findings (reported, not fixed)
- **F-DTG3-1 (the same defect in two more places, measured; outside "nothing else"): the door is still looser than the client for `research_pick` ids and `context_action` target ids.**

  | action on the tape | door | client |
  | --- | --- | --- |
  | `research_pick` id `'   '` (and `'\t\n'`) | accepts | refuses |
  | `context_action` `upgrade` / `demolish`, target id `'   '` | accepts | refuses |
  | `context_action` `upgrade` / `demolish`, target id `'nonsense'` (not a building) | accepts | refuses |

  - Causes: the door's `token()` (`standings.ts:1763`, `:1772-1774`), against the client's `cleanToken` (`LockstepClient.ts:1090-1092`) and `normalizeBuildingRef` -> `isBuildableId` (`:1137-1142`, `buildables.ts:173-175`).
  - The recorder never writes them: `Game.ts:10102`, `:10111` record a real building's `{ id, index }`, and the recorder normalizes.
  - Suggested `door-tape-grammar-4`: add `'research_pick'` and `'context_action'` to `CLIENT_JUDGED_ACTIONS`, red-first, with the same retirement at read. For `context_action`, the client's normalizer keeps `fund`, `recover` and a building target as the door does.
- **F-DTG3-2 (pre-existing, measured): the assay queue still hands the assayer a pending row that the grammar has retired.**
  - The queue filters on `assay === 'pending' && tape` only (`standings.ts:297`, `:310`; the index writers `:1352`, `:1364`), so a retired pending row is queued (measured: queued at the tip).
  - Neither instrument arm can load such a tape. The headless arm throws "malformed tape" (`AgentTapeReplay.ts:71-72`). The browser arm, where a browser-recorded reel goes (`assay-replay-agent.mjs:82-88`), boots a game that refuses the reel at boot (`Game.ts:456-466`, `LanternShow.ts:38-58`), so it waits out its boot wait (60 s) or playback wait (120 s) (`assay-replay.mjs:70-71`, `:76-81`). The worker retries 3 times with backoff and then posts `unassayable` (`assay-worker.mjs:30`, `:124-149`).
  - The same holds for rows ADR-005 retired: INFERRED from the same filter, not measured.
  - Harmless to the board (the row stays retired and counted), but it spends instrument time: 3 attempts, each a boot that ends in a wait of 60 s to 120 s. INFERRED.
  - Which wait ends each browser attempt (boot or playback) is UNVERIFIED; I did not run the arm.
  - The cure is outside this firewall: skip rows whose `currentLineageRefusal` is non-null when building the queue, or have the worker pre-check `validateRunTape`.
- **F-DTG3-3 (latent, measured, unreachable today): a stored row whose EMBEDDED playbook recording carries an action the client refuses is DROPPED at read, not retired.**
  - At read, `validTapePlaybookUses` runs the client's `validatePlaybook` on the recording, and only its orders are relaxed to shape (`ordersJudgedForShape`, `standings.ts:1706-1721`). Measured: DROPPED (board 0, `retiredCount` 0, `?reel=` 404) on base and tip.
  - Unreachable today: the door refused such a reel at POST on the base too (measured `400 bad_payload`).
  - It becomes reachable the day the client's normalizer tightens a verb it accepts now, for example dropping one of the five abilities. Every stored reel whose embedded recording carries that verb would then vanish instead of retiring: the non-order twin of F-DTG1-2.
  - The cure is outside this firewall: at read, let `validTapePlaybookUses` pass the client-judged verbs through for shape, and let `tapeGrammarRefusal` retire them. It already walks those recordings.
- **F-DTG3-4 (information, measured): the door is TIGHTER than the client in 14 probe rows.** These are:
  - ids over 64 characters;
  - `rotationSteps` 4;
  - `pick_upgrade` with `defaulted`;
  - rung level 4 or -1;
  - target index 10001 or -1;
  - a dispatch node with edge whitespace or 65 characters.

  None can refuse a recorder reel. The recorder writes only normalized values (`RunTape.ts:205-209`, `LockstepClient.ts:862-865`), and Game.ts strips `defaulted` (`:7995-7998`). The dispatch edge is F-DTG2-3. No action is suggested; this is recorded so a future "one grammar" pass knows the full table.
- **F-DTG3-5 (a comment outside this firewall): the comment above `validateTape` (`standings.ts:1573-1577`) still says only the ORDER grammar is left to `tapeGrammarRefusal` at read.** It is now also the three client-judged verbs. This is a one-line follow-up for whoever next edits that function. The comment over `tapeGrammarRefusal` itself was updated.

## Merge readiness
Read-only dry runs at the tip with `git merge-tree --write-tree`:

| this branch merged with | exit code |
| --- | --- |
| `main` `24e962d24` (moved since the cut by one docs commit, which touches neither file) | rc=0 |
| `fix/kv-counters-to-ledger-2` `b9984e055` (touches both files) | rc=0 |
| `fix/same-game-audit-verbs-1` `c4f783860` | rc=0 |

- No `localhost-cors-2` branch exists yet.
- Its CORS arm lives at `standings.ts:169` and `:1897-1910`.
- This diff's nearest hunk ends at `:1795`, and it adds no line in or next to either CORS site.

## Evidence in this directory
| file | what it holds |
| --- | --- |
| `red-run-1.txt` | RED 1 above |
| `red-run-2.txt` | RED 2 above |
| `green-run.txt` | GREEN above |
| `mutation.txt` | the 8-mutation check; runner `mutate.mjs.txt` |
| `door-vs-client.txt` | the 79-row differential, base and tip, and the rows that moved; probe `diff-probe.mjs.txt` |
| `stored-rows.txt` | stored rows on base, tip and the naive fix; probe `stored-probe.mjs.txt` |
| `post-verdicts.txt` | the door's POST answers on base and tip; probe `post-probe.mjs.txt` |
| `gates-summary.txt` | the locked gate batch, the red attribution and its control |

Run each from a worktree root with Node 26: `node <probe>`; the mutation runner also takes an output path. The three probes run the real handlers in process on in-memory stores and open no port. The mutation runner runs `scripts/test-standings.mjs`, whose sqlite pass listens on ephemeral 127.0.0.1 ports, as it always does.

## Remaining list, in order
1. Drain: gate and merge `fix/door-tape-grammar-3`.
2. Then the ordinary deploy, which restarts `goldrush-ledger` so the droplet's door serves this grammar. I deployed nothing.
3. F-DTG3-1: `door-tape-grammar-4` for `research_pick` ids and `context_action` target ids. It is one line in `CLIENT_JUDGED_ACTIONS`, red-first, and without it the title's promise holds for three verbs only.
4. F-DTG3-3: relax embedded client-judged verbs to shape at read, before any client verb is ever tightened.
5. F-DTG3-2: keep grammar-retired rows out of the assay queue.
6. F-DTG3-5: the `validateTape` comment.
7. Housekeeping: the control worktree `/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/dtg3/ctl-base` (detached at `3b12c4236`) is left registered, not deleted. `git worktree remove --force <path>` retires it.
