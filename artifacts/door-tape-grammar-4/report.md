# door-tape-grammar-4: report (F-DTG3-1, F-DTG3-5)

READY-FOR-GATES. Branch `fix/door-tape-grammar-4`, stacked on `fix/door-tape-grammar-3` at `0515f4b0d` (`git log fix/door-tape-grammar-3..HEAD` was empty at the cut). It was never merged or rebased. Commits:
- `aff05b4c2`: `research_pick` and `context_action` join the client-judged set, with the red-first rows (F-DTG3-1).
- `a1dd6df15`: the comment above `validateTape` describes the door as it is now (F-DTG3-5). It changes a comment only.
- The report commit: this file and the evidence beside it.

Implementer: Claude Opus 5.5 at maximum effort, continuing from grammar-3. Worktree `/Users/robin/Claude/Projects/wt-dtg3`, Node v26.4.0. Nothing was deployed, and nothing contacted the county door, the live site or the droplet.

## Verdict in one paragraph
The last six door-looser rows of grammar-3's 79-row probe are closed. The door accepted two more kinds of action that its own client refuses:
- a `research_pick` id that trims to nothing (`'   '`, `'\t\n'`);
- a `context_action` upgrade or demolition whose target, trimmed, names no building the client knows (`'   '`, `'nonsense'`).

Such a reel was stored and ranked (RED 1: ranks 1 to 6), while the Lantern and the assayer cannot load it. Both verbs join `CLIENT_JUDGED_ACTIONS`. The door now refuses them with `400 bad_payload`, and a row stored before this grammar retires at read instead of being dropped (RED 2 to GREEN: board `[1, 0]` to `[0, 1]`).

Counts: `scripts/test-standings.mjs` goes 514 -> 576 checks per backend, and all 514 existing checks stay green.

The probe: door-looser 6 -> 0, door-tighter 14 -> 14, equal 59 -> 65. Exactly the six targeted rows moved, all in the door column. Each of 14 mutations turns red at its own shape.

The comment above `validateTape` now states both halves of the rule.

## Pre-flight
- The branch was cut with `git checkout -b fix/door-tape-grammar-4 fix/door-tape-grammar-3` at `0515f4b0d`, and `git log fix/door-tape-grammar-3..HEAD` was empty.
- `git status --short` showed only the untracked `node_modules` symlink. The two gate artifacts grammar-3 left unstaged (`artifacts/accounts-worker/test-accounts.json`, `artifacts/multiplayer-relay/test-multiplayer.json`) had been restored to HEAD by another hand at 18:12:57Z. That is their mtime, and my reflog shows no operation at that time.
- Re-measured, not inherited:
  - The 79-row probe at `0515f4b0d` reads LOOSER 6, tighter 14, equal 59. Its six LOOSER rows are exactly the master's six.
  - `node scripts/test-standings.mjs` reads 514 and 514, rc=0.

## Where the player sees it
- **An honest rider sees no change.** The recorder cannot write any of the six shapes: a test row offers them down both recorder paths, and the reel comes out identical to one without them. The recorder-built controls are still stored and read back loadable:
  - A research pick of `assay_grading`, from a multiplayer tick's action list (`Game.ts:10285`, then `:7969-7974`). A solo pick is never recorded (`Game.ts:10257-10270`).
  - An upgrade and a demolition of the sluice the reel placed, through `recordRunTapeAction` (`Game.ts:10102`, `:10111`).
- **A hand-built POST** carrying one of the shapes now gets "Standing not accepted." (`400 bad_payload`).
- **The county board** no longer ranks a stored reel that carries one; `retiredCount` counts it.
- **No honest stored row is expected to move.**
  - `research_pick` still accepts any id that trims to something.
  - For building targets: across the 8 commits that touched `src/game/buildables.ts`, no building id was ever removed (the set grew from 7 to 10). Its last change (2026-09-06) predates era 6, which opened on 2026-09-14 (`c010f5f69`). So no current-era reel names a building the client no longer knows.
  - The live population is UNVERIFIED: I read no live board.

## What changed (against `0515f4b0d`: 2 files, +132 / -15)
**`functions/api/standings.ts` (+16 / -12), inside the firewall only:**
- `CLIENT_JUDGED_ACTIONS` (`:1796`) gains `'research_pick'` and `'context_action'`. Its own doc comment (`:1789-1795`) now lists all five verbs.
- The comment above `validateTape` (`:1573-1580`) describes the door as it is now:
  - at the door, every field has the door's own shape, and every client-judged action must also be one the client's normalizer keeps;
  - at read, the shape stays required, and two judgments move to `tapeGrammarRefusal`: the standing orders' verbs (ADR-005) and the client-judged actions (ADR-004 rule 2). It retires and counts a row and never drops it.
- Nothing else changed. `clientRefusesAction`, the door gate and the retirement line are grammar-3's, unchanged. `src/` is byte-identical to `0515f4b0d`.

**`scripts/test-standings.mjs` (+116 / -3):**
- The kit gains `buildableIds`: the client's own `buildableDefs`, loaded through the same vite graph (`:38-40`).
- `recorderReel` gains two options:
  - `research`: a research pick in a tick's action list;
  - `context`: an upgrade or demolition through `recordAction`.

  With both absent the recording is unchanged. The earlier counts (40, 41, 14, 23, 24) are identical.
- `clientJudgedIdShapes()` (`:697`) holds the six shapes. It is a function, because the checks run from the top of the file, before a later module-level const would be initialized.
- `checkClientJudgedIds` (`:708`, 26 checks) and `checkRetiredClientJudgedIds` (`:768`, 36 checks) run in each backend pass (`:61-62`).

## The six refused shapes (at the door, `400 bad_payload`)
Each shape is refused exactly where the client's `normalizeLockstepAction` returns null:
- for `research_pick`: `LockstepClient.ts:1090-1093`;
- for a context target: `:1097-1102` and `normalizeBuildingRef` (`:1137-1142`). A target must trim to an id that `isBuildableId` knows (`buildables.ts:173-175`).

1. `{ type: 'research_pick', id: '   ' }`
2. `{ type: 'research_pick', id: '\t\n' }`
3. `{ type: 'context_action', action: 'upgrade', target: { id: '   ', index } }`
4. the same shape as 3, with `demolish`
5. `{ type: 'context_action', action: 'upgrade', target: { id: 'nonsense', index } }`: no building has that id
6. the same shape as 5, with `demolish`

Still accepted, because the client keeps them (each pinned by a row):
- a research id with edge whitespace (`' assay_grading '`);
- a research id naming no research node (`'no-such-node'`). The client's `research_pick` takes any id, so the door must not judge ids against the research tree;
- a target id with edge whitespace (`' sluice '`);
- a target index of 256. The client clamps it, and the door's own bound stays 10000;
- every building in the client's `buildableDefs`, as an upgrade target and as a demolition target;
- the targetless `fund` and `recover`, which now also meet the client's normalizer.

## RED first (scope 1)
**How the shapes were built.** Each shape is made BY HAND from its own recorder reel carrying the valid verb, because the recorder refuses every one of them. A test row shows it: the six shapes are handed down both recorder paths, and the reel's entries come out identical.

**RED 1: the door.** The test file was byte-identical to the one committed in `aff05b4c2` (checked with `cmp`). It ran against this slice's base door: `functions/api/standings.ts` was written from `0515f4b0d` for the run, then restored and checked with `cmp`. Command `node scripts/test-standings.mjs`, rc=1:

```
contract clock census 42/25/17/0
recorder reel kv checks (40)
recorder verbs kv checks (41)
retired embedded orders kv checks (14)
client grammar kv checks (23)
retired client grammar kv checks (24)
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: the door refuses research ids and building targets the client refuses: [{"ok":true,"stored":true,"rank":1,"decidedBy":"crown"},{"ok":true,"stored":true,"rank":2,"decidedBy":"submittedAt"},{"ok":true,"stored":true,"rank":3,"decidedBy":"submittedAt"},{"ok":true,"stored":true,"rank":4,"decidedBy":"submittedAt"},{"ok":true,"stored":true,"rank":5,"decidedBy":"submittedAt"},{"ok":true,"stored":true,"rank":6,"decidedBy":"submittedAt"}]
+ actual - expected
  (six times:)
    [
+     200,
+     true
-     400,
-     'bad_payload'
    ],

    at checkClientJudgedIds (file:///Users/robin/Claude/Projects/wt-dtg3/scripts/test-standings.mjs:740:3)
```

The full paste is in `red-run-1.txt`. On the base, all six shapes were STORED and RANKED (ranks 1 to 6). Every earlier check passed, including grammar-3's 23 and 24. So did every row before this assertion:
- each control carries its verb once;
- the client's normalizer refuses all six shapes;
- the recorder refuses all six on both paths;
- the three controls are accepted (`200 stored`);
- each control reads back through `?reel=` loadable, with its verb intact.

**RED 2: the stored rows (scope 1, last clause).** Same tree, with only the order of the two new check calls swapped for this one run. It was then restored and verified with `cmp`. rc=1:

```
AssertionError [ERR_ASSERTION]: a stored row with a research_pick id of whitespace only is RETIRED and COUNTED, not dropped and not ranked
  actual: [ 1, 0 ],
  expected: [ 0, 1 ],
    at checkRetiredClientJudgedIds (file:///Users/robin/Claude/Projects/wt-dtg3/scripts/test-standings.mjs:783:5)
```

On the base the shaped row RANKED. The two rows before it passed: the clean stored row ranks, and at read the grammar keeps the shaped reel, which the client cannot load.

## GREEN
Committed tip `a1dd6df15`, the tree equal to HEAD for `functions/`, `src/` and `scripts/`. Command `node scripts/test-standings.mjs`:

```
recorder reel kv checks (40)
recorder verbs kv checks (41)
retired embedded orders kv checks (14)
client grammar kv checks (23)
retired client grammar kv checks (24)
client judged ids kv checks (26)
retired client judged ids kv checks (36)
standings assay kv checks passed (576)
recorder reel sqlite checks (40)
recorder verbs sqlite checks (41)
retired embedded orders sqlite checks (14)
client grammar sqlite checks (23)
retired client grammar sqlite checks (24)
client judged ids sqlite checks (26)
retired client judged ids sqlite checks (36)
standings assay sqlite checks passed (576)
rc=0
```

The full paste, with the census and refusal-sample lines, is in `green-run.txt`. The intermediate commit `aff05b4c2` alone also ran green at 576 and 576 before `a1dd6df15`, which changes a comment only, was committed.

### Counts (`scripts/test-standings.mjs`)
| tree | kv | sqlite |
| --- | ---: | ---: |
| before: base `0515f4b0d` (re-measured, rc=0) | 514 | 514 |
| after: tip `a1dd6df15` | 576 | 576 |
| of which new: "client judged ids" 26 and "retired client judged ids" 36 | 62 | 62 |
| existing checks, all still green (576 - 62) | 514 | 514 |

The file is fail-fast, so rc=0 means every existing check ran green.

### The new checks per backend
**`checkClientJudgedIds`, 26 checks:**
- Recorder fidelity (3): each control carries its verb once; the client's normalizer refuses all six shapes; the recorder refuses all six down both paths.
- Controls (4): the door accepts the three recorder reels, and each reads back through `?reel=` loadable, with its verb intact.
- THE RED row (1): the six shapes through the real handler answer `400 bad_payload`.
- Per shape (12): `validateTape` null at the door, and `validateRunTape` null, which pins the premise that the client refuses it.
- Nothing else tightened (6): the research and target neighbours, every building, and `fund` and `recover`, as listed above.

**`checkRetiredClientJudgedIds`, 36 checks.** The six shapes, six checks each, as in grammar-3:
- the clean stored row ranks (`[1, 0]`);
- the grammar at read keeps the shaped reel, which the client cannot load;
- the shaped row is RETIRED and COUNTED (`[0, 1]`);
- the read leaves the stored bytes identical;
- `?reel=` serves the reel exactly as stored;
- the assay slip says `ranked: false`.

### Mutation check, per shape (`mutation.txt`)
Each run changed one clause at `a1dd6df15`, ran the door test, and restored the source byte-identical (`git diff --quiet HEAD`). For the door row, the six answers are listed in shape order.

| mutation | result |
| --- | --- |
| M0 none (control) | rc=0, 576/576 |
| M1 the set without `research_pick` | RED, answers `[stored, stored, bad_payload x4]` |
| M2 the set without `context_action` | RED, answers `[bad_payload x2, stored x4]` |
| M3 to M8: shape 1 to 6 let through at the door only | RED at the door row. In each run exactly that one answer turns `reel_not_current`, because the retirement clause still refuses it at POST but not as the grammar. |
| M9 to M14: shape 1 to 6 not retired at read only | RED at exactly that shape's "a stored row with ... is RETIRED and COUNTED" row, all six in turn |

### The probe before and after (`door-vs-client.txt`)
This is grammar-3's 79-row probe, unchanged (`artifacts/door-tape-grammar-3/diff-probe.mjs.txt`). One action is injected into a reel written by the real recorder, and three judges rule on it: the door at POST, the door at read, and the client (`validateRunTape`).

| tree | LOOSER (door accepts, client refuses) | tighter (door refuses, client accepts) | equal |
| --- | ---: | ---: | ---: |
| before: base `0515f4b0d` | 6 | 14 | 59 |
| after: tip `a1dd6df15` | 0 | 14 | 65 |

- Exactly six rows moved: the two `research_pick` rows and the four `context_action` target rows. All six moved in the door-at-POST column, from "accepts" to "refuses".
- The read column is identical on all 79 rows, and so is the client column.
- The 14 tighter rows are grammar-3's F-DTG3-4, unchanged.

## Stored rows: what happens to a row already stored with each shape
Each of the six shapes, manufactured as the door would have stored it, is RETIRED at read. Test rows, in both backends, show that it:
- leaves the ranked board;
- is counted in `retiredCount`;
- keeps its stored bytes, identical after the read;
- stays on the shelf (`?reel=` 200, exactly as stored);
- answers `ranked: false` on its assay slip.

It is never dropped. The mechanism is grammar-3's, unchanged: `tapeGrammarRefusal` -> `clientRefusesAction`. Every other surface behaves as grammar-3 measured for its shapes:
- the ranked views leave the row out;
- the assay queue still hands it to the assayer while it is `pending` (F-DTG3-2).

## Gates (self-check)
- `npx tsc --noEmit`: rc=0 at `a1dd6df15`, and at `aff05b4c2` alone.
- `npm run build`: rc=0 at the tip (20 s).
- `src/` is byte-identical to `0515f4b0d`.
- The same-game audit is unchanged: `node scripts/same-game-audit.mjs --json` at the tip reads `{ agent-exceeds 0, agent-lacks 595, equal 1252, not-offered 0 }` over 1847 rows, equal to the pin at `scripts/same-game-audit.test.mjs:455`. The set is not a `value.type === '...'` literal, and the audit does not read it (`same-game-audit.mjs:154-164`).
- No em or en dashes in the diff, the commit messages, the evidence or this report (grep count 0).

**Under the drain lock.** Each batch was one blocking call of `scripts/attended/dlock.sh`, backgrounded with nohup and waited on through its own output file. Batch 1 (tip `a1dd6df15`) held the lock from 18:23:50Z to 18:40:53Z:

| gate | result |
| --- | --- |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` | rc=1: 1018 tests, 1009 pass, 4 fail, 5 skipped |
| `npm run test:accounts` | rc=0: kv 43, sqlite 43, sign-in hardening 27, office credential 26, ledger road 86, kv-to-ledger migration 16 |
| `npm run test:mp` | rc=0: multiplayer relay 528 |
| `npm run test:stats` | rc=0: stats 87; standings 576 kv and 576 sqlite; ledger worker HTTP contract 26 (loaded through `loadLedgerHandlers`, the droplet's path) |

**The four reds, attributed.** The controls ran at this slice's clean base `0515f4b0d`, in the same batch.

| red at the tip | attribution |
| --- | --- |
| `ledger-backup-pull`: two tests | Pre-existing, environmental. The base control gives the identical two reds: "GR_DROPLET_HOST missing from the environment and .env.local". There is no `.env.local` here, and none was read. |
| `fixture-teardown`: all 161 owners | Pre-existing, environmental. Its first failing child is `ledger-backup-fill-gaps-guard`, with the same missing-host message. That file at the base: rc=1, 1 pass, 7 fail. |
| `node-guards-contention`: "absent when alone" | Environmental: another battery ran during this one ("CONTENDED, 2 concurrent batteries"). The test references neither changed file. It was green alone at the tip (batch 2, 18:41:40Z) and green at the base control. |

`board-tape-gold`, red once for grammar-3 under contention, was green in this battery and green alone on both trees (30 s each). `desk-declaration-guard` and `same-game-audit.test.mjs` were green. `test:accounts` and `test:mp` rewrote their two tracked artifacts again (factory churn, F-1407-1). They are left unstaged and are in no commit. Full detail is in `gates-summary.txt`.

## Adapted, and why
1. **The set's own doc comment was updated with the set** (`:1789-1795`). I read it as part of `CLIENT_JUDGED_ACTIONS`, since it documents that declaration and would otherwise have said "three verbs". The gate comment inside `validTapeAction` was NOT touched, because it is outside this firewall (F-DTG4-1).
2. **Two commits, one concern each:** F-DTG3-1 (the set and its rows), then F-DTG3-5 (the comment). The first was verified green alone (576 and 576).
3. **The building row reads the client's own `buildableDefs`** rather than a copy. A copied list would silently miss a building added later, which is the same drift this slice closes.
4. **Mutations per shape at both paths.** The master asked for "a mutation check per shape". Removing a verb from the set covers the shapes only by verb, so each shape is also exempted once at the door only and once at read only (M3 to M14). Each of the six is thereby pinned on both paths.
5. **The RED runs were redone with the final test file.** The first RED runs used a draft with a hard-coded building list. After the switch to `buildableDefs`, both RED runs were repeated against the base door, and the committed test file is byte-identical to the one they used (`cmp`).

## Findings (reported, not fixed)
- **F-DTG4-1 (a comment outside this firewall): the gate comment inside `validTapeAction` (`standings.ts:1756-1757`) still names three verbs.** It reads "a place_build, pick_upgrade or set_agent_ability must also be one the client can load", and the set now holds five. This firewall names only `CLIENT_JUDGED_ACTIONS` and the comment above `validateTape`, so the comment is left for a one-line follow-up. Suggested text: "at the door every verb in `CLIENT_JUDGED_ACTIONS` must also be one the client can load".
- **F-DTG4-2 (pointer): the READ FIRST names `src/game/RunTape.ts` as "the client's normalizer for `research_pick` and `context_action` targets".** `RunTape.ts` has no such normalizer. It reaches `normalizeLockstepAction` (`src/mp/LockstepClient.ts:885`; `normalizeAction` at `:1060-1120`) through `validatePlaybook` -> `validateEntries` (`PlaybookFormat.ts:260-261`). The substance is unchanged.
- **F-DTG4-3 (latent, now with an ordinary trigger): F-DTG3-3's drop can be reached by removing a building.**
  - A solo playbook recording carries building upgrades and demolitions. The recorder's sample takes `multiplayerSampleActions` (`Game.ts:4115`), which pushes `context_action` upgrade and demolish (`Game.ts:4035-4062`).
  - So if a building ever leaves `buildableDefs`, the two kinds of stored reel part ways:
    - a reel that upgrades it in its own entries now RETIRES (this slice);
    - a reel whose EMBEDDED playbook recording upgrades it is DROPPED at read (`validTapePlaybookUses` -> `validatePlaybook`, `standings.ts:1689`, `:1709`), because the client's parser judges embedded actions strictly at read. The drop was MEASURED for an embedded `place_build` the client refuses (grammar-3 `stored-rows.txt`: board 0, `retiredCount` 0, `?reel=` 404). For an upgrade of a removed building it is READ: the same parser path, through `normalizeBuildingRef`.
  - Not reachable today, since no building was ever removed.
  - Recommendation: land F-DTG3-3's cure before any building is removed.
- **F-DTG4-4 (the probe reads zero; what that does and does not prove).** The 79-row probe finds no place where the door accepts an action the client refuses. It covers each action verb's fields with chosen neighbours: it is not a proof over all inputs, and it covers actions only, not the tape's other fields. The 14 door-tighter rows (F-DTG3-4) stand, and they are harmless to recorder reels. F-DTG3-2 (the assay queue) and F-DTG3-3 stand.

## Merge readiness
Read-only dry runs at the tip with `git merge-tree --write-tree`:

| `fix/door-tape-grammar-4` merged with | exit code |
| --- | --- |
| `main` `c32973c77` | rc=0 |
| `fix/door-tape-grammar-3` `0515f4b0d` (its parent, not yet in main; queued) | rc=0 |
| `fix/kv-counters-to-ledger-2` `b9984e055` | rc=0 |
| `fix/same-game-audit-verbs-1` `26dd076b1` | rc=0 |

Since the grammar-3 cut, `main` gained 10 commits, and none touches either file. The branch stacks on grammar-3, so the drain lands grammar-3 first and this branch on top.

## Evidence in this directory
| file | what it holds |
| --- | --- |
| `red-run-1.txt` | RED 1 above |
| `red-run-2.txt` | RED 2 above |
| `green-run.txt` | GREEN above |
| `mutation.txt` | the 14 mutations and the control; runner `mutate4.mjs.txt` |
| `door-vs-client.txt` | the 79-row probe before and after, and the rows that moved (probe source in `artifacts/door-tape-grammar-3/`) |
| `gates-summary.txt` | the locked gate batch, the red attribution and its controls |

## Remaining list, in order
1. Drain: land `fix/door-tape-grammar-3`, then `fix/door-tape-grammar-4` on top.
2. Then the ordinary deploy, which restarts `goldrush-ledger`. I deployed nothing.
3. F-DTG4-1: the one-line gate comment.
4. F-DTG3-3, sharpened by F-DTG4-3: relax the embedded client-judged verbs to shape at read, before any building or client verb is ever removed.
5. F-DTG3-2: keep grammar-retired rows out of the assay queue.
6. Housekeeping: done. The control worktree `scratchpad/dtg3/ctl-base`, moved to `0515f4b0d` for this slice's controls, was retired with `git worktree remove --force`. `git worktree list` no longer shows it.
