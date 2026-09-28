# door-tape-grammar-1: report (HOTFIX, P0, F-LSR1-0)

READY-FOR-GATES. Branch `fix/door-tape-grammar-1`, base `5abb349d6`. Fix commits: `29a349814`, then `ef834236a`. Implementer: Claude Opus 5.5, attended scratch worktree `/Users/robin/Claude/Projects/wt-dtg1`, Node v26.4.0. Nothing was deployed, and nothing contacted the county door, the live site or the droplet.

## Verdict in one paragraph
The door's tape grammar (`validTapeInput`) now accepts the two input-log keys the browser recorder has written since early September. `playbookUses` has been on every browser reel since 15dc51b89 (2026-09-05), and `motorActions` rides once a motor was driven, since 5823eaad6 (2026-09-04). Before this fix a recorder-built reel was refused `400 bad_payload` by the real handler; after it the same reel is stored and ranked. The reel reads back through `?reel=` into the client's own `validateRunTape` with both keys intact. Every existing check in `scripts/test-standings.mjs` passes unchanged: 372 per backend before, and 372 of 412 after. Nothing else was loosened: 17 mutations and both maxEntries caps are refused, and a mutation check shows each new clause is pinned by a red row. The net diff touches two files. `src/game/RunTape.ts` ends byte-identical to the base, because all of `src/` is engine identity; see "Adapted" item 1.

## Where the player sees it
Return to Town after securing: banking the secured claim ends the run. The `run_ended` handler calls `submitCountyStanding` (`src/game/Game.ts:2042`); for a secured run that ends in a death, the call is at `:1992`. That call posts the standing with `tape: submittedTape` (`:8115`, `:8142`). The standing now lands on the county board. Before the fix, the refusal set `state: 'refused'` with the door's "Standing not accepted." (`Game.ts:8153-8155`). Now `state: 'submitted'` carries its rank (`Game.ts:8166-8170`). In the test, the row `both recorder standings are ranked on the county board` reads the board back with both rows on it. The fix reaches production only through the ordinary deploy, which restarts `goldrush-ledger`. The droplet loads this same module through vite (`server/ledger/serve.mjs:14`, `configFile: false`; `:16`, `vite.ssrLoadModule('/functions/api/standings.ts')`).

## What changed (net against `5abb349d6`: 2 files, +194 / -4)
- `functions/api/standings.ts` (inside the grammar only):
  - Two imports: `validateRunTape` from `src/game/RunTape` at `:6`, and `validatePlaybook` plus the `RunTapeEnvelope` type added to the existing PlaybookFormat import at `:8`.
  - `validTapeInput`'s `hasOnlyKeys` set gains exactly `'motorActions', 'playbookUses'` (`:1627`).
  - One new check before its `return true` (`:1646-1648`).
  - Two new helpers: `validTapeMotorActions` (`:1652-1671`) and `validTapePlaybookUses` (`:1673-1693`).
  - Every other clause of `validTapeInput` is byte-identical. No entry point, env type or routing line changed.
- `scripts/test-standings.mjs` (+145 / -2):
  - The recorder kit is loaded from the real modules (`:32-37`).
  - `checkRecorderReel` (`:369`) is called in each backend pass (`:53`).
  - `recorderReel` (`:1553`) builds the reel the way Game.ts does. It is a real `RunTapeRecorder` with real ticks, a `place_build` routed through `recordAction`, two `recordMotorAction` calls, and one `recordPlaybookUse` of a playbook recorded by the real `PlaybookRecorderSession` and read back with `parsePlaybookText` (Game.ts:3900-3907). It then calls `snapshot(outcome, eventLog)`, `submittedRunTape`, and the Game.ts body.
- `src/game/RunTape.ts`: byte-identical to the base. `29a349814` exported `validateMotorActions` as the master allowed, and `ef834236a` took the keyword back (Adapted, item 1).

## The two keys' exact accepted shapes
Both keys are OPTIONAL: absent is lawful, exactly as before.

**`motorActions`** is checked by the client's own `validateMotorActions` (RunTape.ts:425-440), reached through the exported `validateRunTape` over a minimal tape that carries nothing else, plus one door bound:
- The value is an array of at most `envelope.maxEntries` elements. For the-claim that is 3,601.
- Each element has exactly the keys `{ t, kind, point }`, and `point` has exactly `{ x, z }`.
- `t` is an integer with `0 <= t < max(1, durationTicks)` and is non-decreasing across the list.
- `kind` is `'motor_grade'` or `'motor_haul'`.
- `x` and `z` are finite numbers in `[-256, 256]`.
- An empty list is accepted, as the client accepts it.
- The door's own bound is `t >= 0`. The client's first element may sit at tick -1 (F-DTG1-3), and every door entry starts at 0 (`standings.ts:1700`).

**`playbookUses`** is checked by `validTapePlaybookUses`:
- The value is an array of at most `envelope.maxEntries` elements.
- Each element has exactly the keys `{ kind: 'playbook_use', atTick, playbook }`.
- `atTick` is an integer in `[0, durationTicks]`, never less than the previous use's `atTick`.
- `playbook` is accepted by `validatePlaybook(playbook, envelope.maxTicks, envelope.maxEntries)`, imported from `src/playbook/PlaybookFormat.ts:181-219` and not re-typed. It is the same parser RunTape.ts `validatePlaybookUses` calls (`:549`).
- The playbook's `contractId`, `seed` and `difficultyPreset` equal the tape's, as the client's `validateRunTape` requires (RunTape.ts:406).
- The byte envelope (`maxTapeBytes`, checked first in `validateTape`, `standings.ts:1573`) still bounds the whole tape.

One scratch `validateTape` call at the tip checked the empty and null cases for both keys:

| input-log value | verdict |
| --- | --- |
| key absent | accepted |
| `motorActions: []` | accepted |
| `playbookUses: []` | accepted |
| `motorActions: null` | refused |
| `playbookUses: null` | refused |

## RED first (scope 1): the new rows on the untouched grammar
The rows were written first and run on the branch base (`5abb349d6`, with `standings.ts` and `RunTape.ts` untouched) using `node scripts/test-standings.mjs`. The run exited with rc=1:

```
contract clock census 42/25/17/0
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: the door accepts the recorder's reels (with a playbook use and motor actions, and plain): [{"ok":false,"error":"bad_payload","message":"Standing not accepted."},{"ok":false,"error":"bad_payload","message":"Standing not accepted."}]
+ actual - expected

  [
    [
+     400,
+     'bad_payload'
-     200,
-     true
    ],
    [
+     400,
+     'bad_payload'
-     200,
-     true
    ]
  ]

    at equal (file:///Users/robin/Claude/Projects/wt-dtg1/scripts/test-standings.mjs:1730:10)
    at checkRecorderReel (file:///Users/robin/Claude/Projects/wt-dtg1/scripts/test-standings.mjs:381:3)
    at async file:///Users/robin/Claude/Projects/wt-dtg1/scripts/test-standings.mjs:53:5 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: [ [ 400, 'bad_payload' ], [ 400, 'bad_payload' ] ],
  expected: [ [ 200, true ], [ 200, true ] ],
  operator: 'deepStrictEqual',
  diff: 'simple'
}

Node.js v26.4.0
```

The real handler refused both recorder reels: the one with a playbook use and two motor actions, and the plain one with its empty `playbookUses`. Each answer was `400 bad_payload` "Standing not accepted.". The rows stay in the file as the regression.

### Attribution with the real recorder (scratch probe, same method as live-seed-rotation-1)
The probe followed live-seed-rotation-1's method: the real door ran in process on an in-memory store and judged the browser body. The probe source is `door-probe.mjs.txt` in this directory. Base `5abb349d6` (`probe-base.txt`):

| reel (built by `RunTapeRecorder`) | inputLog keys | door | `validateTape` | client `validateRunTape` |
| --- | ---: | --- | --- | --- |
| A: one playbook use and one motor action | 14 | 400 bad_payload | null | valid |
| B: plain (`playbookUses: []`, no motor) | 13 | 400 bad_payload | null | valid |
| C: B with the empty list dropped (the live-seed control) | 12 | 200 stored | valid | valid |
| D: A without `playbookUses` (motor only) | 13 | 400 bad_payload | null | valid |
| E: A without `motorActions` (playbook only) | 13 | 400 bad_payload | null | valid |

D and E show that each key alone was enough to refuse a reel. B is the case every browser standing hit.

After the fix (`probe-after.txt`), A through E all answer `200 stored`, with `validateTape` valid and the client valid.

## GREEN (scope 2 to 4)
The same file was run at the committed tip `ef834236a`, where the tree equals HEAD for `functions/`, `src/` and `scripts/`, with `node scripts/test-standings.mjs`:

```
contract clock census 42/25/17/0
recorder reel kv checks (40)
refusals kv sample {"ok":true,"counts":{"unsecured":1,"bad_payload":1},"recent":[{"reason":"bad_payload","contractId":"the-claim","refusedAt":1790347848051},{"reason":"unsecured","contractId":"the-claim","refusedAt":1790347848051}]}
standings assay kv checks passed (412)
contract clock census 42/25/17/0
recorder reel sqlite checks (40)
refusals sqlite sample {"ok":true,"counts":{"bad_payload":1,"unsecured":1},"recent":[{"reason":"bad_payload","contractId":"the-claim","refusedAt":1790347849326},{"reason":"unsecured","contractId":"the-claim","refusedAt":1790347849325}]}
standings assay sqlite checks passed (412)
rc=0
```

### Counts (`scripts/test-standings.mjs`)
| | kv | sqlite |
| --- | ---: | ---: |
| before, base `5abb349d6` (the pre-flight run) | 372 | 372 |
| after, tip `ef834236a` | 412 | 412 |
| of which new (`checkRecorderReel`, "recorder reel ... checks") | 40 | 40 |
| existing checks, all still green (412 - 40) | 372 | 372 |

The file is fail-fast: `assert` throws on the first miss. So rc=0 with 412 checks means every one of the 372 existing checks ran green, in both backends.

### The 40 new checks per backend, in `checkRecorderReel`
- **Accept (scope 1):**
  - The recorder output is as intended: one use and two motor actions on the full reel; `[]` and no motor on the plain reel.
  - Both bodies carry their tape (`submittedRunTape`).
  - Both reels answer `200` with `stored: true`.
  - Both stored rows hold the input log exactly as the recorder wrote it (deep equality).
  - The board lists both standings.
- **Round trip (scope 3):**
  - `GET ?reel=<id>` answers 200.
  - The client's `validateRunTape` accepts the reel.
  - `inputLog.playbookUses` and `inputLog.motorActions` deep-equal the recorder's. The Lantern replays both keys (`Game.ts:7823`, `:7827`).
  - The read also runs the stored-row path (`readBoard` -> `validateStoredRow` -> `validateTape(..., true)`). A reel that failed there would be `reel_not_found`.
- **Nothing loosened (scope 4):** each mutation re-hashes `inputLogHash`, so the refusal belongs to the grammar alone.
  - **Five rows through the real handler.** Each gives `validateTape` null and `400 bad_payload`:
    - The legacy twelve-key tape with an unknown thirteenth key. Its unmutated control is accepted (200) first.
    - The recorder reel with an unknown fifteenth key.
    - A use with a bad `kind`.
    - A use whose `atTick` is past the duration.
    - A use carrying a malformed playbook (no `version`).
  - **Twelve `validateTape` rows:**
    - A use with a negative `atTick`.
    - Uses whose `atTick`s run backwards.
    - A use with an unknown key.
    - A playbook recorded on another seed.
    - A playbook entry with an action no grammar knows.
    - `playbookUses` not a list.
    - A motor action before tick 0.
    - A motor action of an unknown kind.
    - A motor action at the duration.
    - A motor action off the map (x = 300).
    - Motor actions running backwards.
    - `motorActions` not a list.
  - **Caps:** for each key, `maxEntries` (3,601) copies are admitted. 3,602 copies still fit the byte envelope (measured) and are refused.

### Mutation check: does each clause of the new grammar bite? (`mutation.txt`, at `ef834236a`)
Each run changed one clause of `standings.ts`, ran the file, and restored the source byte-identical (`cmp`). The same ten runs at `29a349814` gave the same verdicts.

| mutation | result |
| --- | --- |
| M0 none (control) | rc=0, 412/412 |
| M1 no `kind` check | RED: "the tape grammar refuses a playbook use with a bad kind" |
| M2 `atTick` from -1 | RED: "... a playbook use with a negative atTick" |
| M3 no contract/seed/difficulty identity | RED: "... a playbook recorded on another seed" |
| M4 motor `t < 0` allowed | RED: "... a motor action before tick 0" |
| M5 playbook parser skipped | RED: TypeError at `validTapePlaybookUses` (the malformed-playbook row) |
| M6 no `playbookUses` cap | RED: "the grammar refuses 3602 playbookUses" |
| M7 no key check on a use | RED: "... a playbook use with an unknown key" |
| M8 `atTick` past duration allowed | RED: "... a playbook use whose atTick is past the duration" |
| M9 motor validation skipped | RED: "... a motor action before tick 0" |

## Gates (self-check)
- `npx tsc --noEmit`: rc=0 at `29a349814` and again at `ef834236a`.
- `npm run build`:
  - The pre-flight at base `5abb349d6` was green (54 s wall).
  - At `29a349814` it was rc=0.
  - At `ef834236a` it was rc=0 (29 s wall).
- No em or en dashes in the diff or in any file written here (grep count 0).

**Under the drain lock** (`dlock.sh`, one blocking call per battery, background with its output file waited on, Node v26.4.0):

| gate | battery 1, tip `29a349814` (14:20:47Z to 14:31:47Z) | battery 2, tip `ef834236a` (14:38:46Z to 14:49:55Z) |
| --- | --- | --- |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` | rc=1: 1018 tests, 1005 pass, 8 fail | rc=1: 1018 tests, 1008 pass, 5 fail, 5 skipped |
| `npm run test:accounts` | rc=0 | rc=0 (26 + 86 + 16 checks) |
| `npm run test:mp` | rc=0 | rc=0 (528 checks) |
| `npm run test:stats` | rc=0 | rc=0 (stats 87; standings 412 kv and 412 sqlite; ledger worker HTTP contract 26, which is the droplet's own `loadLedgerHandlers` path, `configFile: false`) |

**The reds, attributed.** Battery 2 also ran a control: the failing files, through the same runner (`GR_GUARD_NO_ARTIFACT=1 node scripts/run-node-guards.mjs <files>`), at clean base `5abb349d6`. That run used a detached scratch worktree set up like this one: node_modules symlinked, the art store resolved, no `.env.local`. The same subset was then run at the tip.

| red at `ef834236a` | tip, full battery | tip, subset | base control | attribution |
| --- | --- | --- | --- | --- |
| `desk-declaration-guard`: "the live board is green" | red | red | red | pre-existing, environmental. It refuses any linked worktree whose STATUS line 1 is not main's ("Re-run from the main worktree"). |
| `ledger-backup-pull`: two tests | red | red | red | pre-existing, environmental. `GR_DROPLET_HOST missing from the environment and .env.local`: the worktree has no `.env.local`, and I never read one. |
| `node-guards-contention`: "absent when alone" | red | red | red | pre-existing, environmental. "node-guards board did not stay quiet for 300ms"; every run printed "CONTENDED, 2 concurrent batteries". |
| `fixture-teardown`: all 161 owners | red | (not in subset) | see next row | its failing child is `board-tape-gold`: `page.waitForFunction: Timeout 120000ms exceeded` (the browser boot). |
| `board-tape-gold` browser arm (direct) | green (it was red in battery 1) | green (29.7 s) | **red, the identical `Timeout 120000ms`** | pre-existing flaky browser boot, reproduced on the base. The test loads neither changed file: it fulfils `/api/standings` itself (`:170`), and `git diff --name-only 5abb349d6 HEAD` is exactly `functions/api/standings.ts` and `scripts/test-standings.mjs`. |

**The three reds that WERE mine** were in battery 1 at `29a349814`: `bench-seeds.test.mjs:47`, `engine-era-guard.test.mjs:65`, and `fixture-teardown` through its bench-seeds child. All three were the engine hash moved by the `export` keyword. They are cured by `ef834236a` and green in battery 2 (Adapted, item 1).

## Adapted, and why
1. **`motorActions` is validated without touching `RunTape.ts`.** The master allowed an `export` on `validateMotorActions`, and `29a349814` added it. The first gate battery then reddened three guards at `29a349814`: `bench-seeds.test.mjs:47`, `engine-era-guard.test.mjs:65`, and `fixture-teardown.test.mjs:34` through its bench-seeds child.
   - Cause: `ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36-44`) hashes every byte under `src/`. That one word moved the computed engine hash from `c63def1b...` to `67ac7bdd...`, which is "absent from era 6; append a same-era pin".
   - A pin lives in `assets/engine-era.json`, outside this firewall. The master says "if more is needed STOP and report", so I took the keyword back (`ef834236a`) instead.
   - The door now reaches the same validator through the already-exported `validateRunTape`, over a minimal tape that carries nothing else (`validTapeMotorActions`, `standings.ts:1652-1671`).
   - The computed engine hash equals the registry again, measured before and after. The probe verdicts and the mutation check are unchanged.
   - If you prefer the plain export, it needs a same-era pin whose cause is "export keyword only, no behaviour change".
2. **`playbook` is checked with `validatePlaybook`** (PlaybookFormat.ts), the parser the client's `validatePlaybookUses` calls (RunTape.ts:549). The element grammar stays stated in the door, in the door's own `hasOnlyKeys` style. The high-traffic key, which rides on every reel, therefore does not depend on the minimal-tape route.
3. **Two door-side bounds the master did not spell out.** Neither can refuse a reel the recorder writes:
   - **Identity:** the playbook's contract, seed and difficulty must equal the tape's. This mirrors RunTape.ts:406, and the recorder only records uses that passed the same check (Game.ts:3903-3904, 4287-4289). It keeps the round-trip invariant: a reel the door accepts is a reel the client accepts.
   - **`t >= 0` and `atTick >= 0`:** the recorder writes `this.tick`, which is never negative (RunTape.ts:213-217, :222). The client's validators admit a first element at tick -1 (F-DTG1-3).
4. **The same grammar in both modes.** The door POST (`stored` false) and the stored re-read (`stored` true) use one grammar, so nothing is loosened at read. The ADR-005 consequence of that choice is F-DTG1-2.
5. **More rows than required.** The master asks for three refusal rows (bad kind, `atTick` past the duration, malformed playbook). They run through the real handler, and fourteen more rows plus the cap rows back them. The mutation table shows none is vacuous.

## Findings (outside this firewall; reported, not fixed)
- **F-DTG1-1 (P1 class, the same symptom): the door still refuses three action verbs the browser recorder writes.**
  - What was measured: with the real recorder, a reel whose entries carry any of these verbs is refused `400 bad_payload`, on the base AND after this fix, even with twelve keys (`probe-*.txt` rows F2, G2, I2). The client's `validateRunTape` accepts all three. The `pick_upgrade` control (H2) is stored.
  - The three verbs:
    - (a) `prospector_dispatch`. Every solo dispatch records it (Game.ts:8256-8262, from the HUD at Game.ts:1899-1904). VERIFIED by reading.
    - (b) `context_action` `recover`. Game.ts:5727 records it when the probe is recovered. VERIFIED by reading.
    - (c) The lockstep `agent_orders` action (`type`, not `kind`). Multiplayer records every slot's lockstep actions into the tape (Game.ts:7969-7985). INFERRED reachable in a mixed ride, not measured live.
  - Cause: the door's `validTapeAction` (`standings.ts:1717-1747` after this fix) lists no `prospector_dispatch`, only `fund` among targetless `context_action`s, and no `type: 'agent_orders'`. The client's `normalizeLockstepAction` (LockstepClient.ts:1060-1120) accepts all three.
  - `pick_upgrade` with `defaulted` is NOT a gap: Game.ts:7995-7998 strips `defaulted` before the tape.
  - Suggested follow-up: a `door-tape-grammar-2` master reconciling `validTapeAction` with `normalizeLockstepAction`, red-first with the same recorder rows.
- **F-DTG1-2 (latent, ADR-005): a future verb retirement would DROP, not retire, a stored row whose playbook use embeds that verb.**
  - `tapeGrammarRefusal` (`standings.ts:1238`) walks `entries` and `streams` but not `playbookUses`.
  - In stored mode, `validatePlaybook` judges an embedded playbook's `agent_orders` strictly. So a verb retired after acceptance would make `validateStoredRow` return null, which is the F-RPG-21 silent drop, instead of retired and counted.
  - Unreachable today, for two reasons:
    - No stored row carried `playbookUses` before this fix, because the door refused them all.
    - `PlaybookRecorderSession` records only lockstep actions (PlaybookSession.ts:152-161), so only an imported playbook text could embed orders.
  - Cure, outside the grammar helpers: walk `playbookUses` in `tapeGrammarRefusal`, and judge embedded orders for shape only when `stored`. Queue it before the next verb retirement.
- **F-DTG1-3 (client, minor): `validateMotorActions` and `validatePlaybookUses` accept a FIRST element at tick -1.** In RunTape.ts:432 and :548, `previousTick` starts at -1 and the test is `< previousTick`.
  - Effect: the Lantern's motor loop matches `t === tick` (Game.ts:7824), so a -1 motor action would stall every later motor action in a replay.
  - No recorder writes -1, and the door refuses both. Only the local ring (`readRunTapes`) still admits such a reel.
  - Cure is outside this firewall, in RunTape.ts.
- **F-DTG1-4 (surface note): inside `playbookUses[].playbook` the door stores what the client's parser tolerates.** `validatePlaybook` ignores unknown keys and bounds no string length.
  - Effect: a public reel can carry rider-chosen text inside an embedded playbook, bounded only by `maxTapeBytes`. The main input log's `name` is capped at 64 (`standings.ts:1629`).
  - The client drops unknown keys on read, so the Lantern never sees them.
  - I did not tighten this. A door-side key list or name cap re-types the client's schema, which is the drift that caused this very defect. Playbook names also have no client cap (PlaybookSurface.ts:177, PlaybookStore.ts:58), so a cap needs an owner ruling.
- **F-DTG1-5 (info): importing `RunTape` grows the standings function graph.** Rolldown bundles of `functions/api/standings.ts` (minified, offline, scratch), before and after:

  | measure | before | after | change |
  | --- | ---: | ---: | ---: |
  | bytes | 387,604 | 508,008 | +120,404 |
  | gzip bytes | 110,150 | 143,972 | +33,822 |
  | modules | 27 | 44 | +17 |

  - The added modules are `RunTape`, `ResearchTree`, `ContractFamilies`, `E7SignalSystem` and 13 contract JSONs (`bundle-modules-added.txt`).
  - This is far inside Workers limits. The added modules have no top-level browser global: `E7SignalSystem.ts:106`'s `document.createElement` is a class-field initializer.
  - The droplet-style load (vite, `configFile: false`) is exercised by `test:stats` (`test-ledger-worker.mjs` -> `loadLedgerHandlers`).
- **F-DTG1-6 (pointer): the master cites `server/ledger/serve.mjs line 3` for the droplet load.** Line 3 is the `node:http` import. The load is at `:16`, with `configFile: false` at `:14`. The substance was verified by reading.
- **F-DTG1-7 (drain note): live-seed-rotation-1's e2e has a workaround branch.** It re-asks the door with the empty `playbookUses` dropped (`wt-lsr1` `e2e/live-seed-rotation.spec.ts:262-276`). Its own comment says that branch stops running once the door accepts the raw body, so after this lands its `rawVerdicts` should be empty.
- **F-DTG1-8 (gate hygiene): `test:accounts` and `test:mp` rewrite `artifacts/accounts-worker/test-accounts.json` and `artifacts/multiplayer-relay/test-multiplayer.json`.** The master's self-check runs them without `GR_GUARD_NO_ARTIFACT`. The rewrites are factory churn (F-1407-1). They are left unstaged in the worktree and are not in any commit.

## Merge readiness
Read-only dry runs at the tip with `git merge-tree --write-tree` found no conflicts:

| this branch merged with | exit code |
| --- | --- |
| `fix/kv-counters-to-ledger-2` `b9984e055` | rc=0 |
| `fix/kv-counters-to-ledger-1` `e549582d1` | rc=0 |
| `main` `982e6ce10` | rc=0 |

- kv2's `standings.ts` hunks sit at `:20`, `:249`, `:548` and `:1768+`, and its `test-standings.mjs` hunks at `:17`, `:67` and `:76`. None is adjacent to this diff.
- The branch was never merged or rebased with main.

## Evidence in this directory
| file | what it holds |
| --- | --- |
| `red-run.txt` | the RED run above |
| `probe-base.txt` | the probe's verdicts at the base |
| `probe-after.txt` | the probe's verdicts at the tip |
| `door-probe.mjs.txt` | the scratch probe source; run it from a worktree root with Node 26 |
| `mutation.txt` | the mutation check at `ef834236a` |
| `bundle-modules-added.txt` | the 17 modules the RunTape import adds |

## Remaining list, in order
1. Drain: gate `fix/door-tape-grammar-1` and merge it. Then run the ordinary deploy, which restarts `goldrush-ledger`, so the droplet's door (`server/ledger/serve.mjs:16`) serves this grammar. I deployed nothing.
2. F-DTG1-1: author `door-tape-grammar-2` for `prospector_dispatch`, `context_action recover` and the lockstep `agent_orders` action. Same symptom, a smaller population.
3. F-DTG1-2: walk `playbookUses` in `tapeGrammarRefusal`, and relax embedded orders to shape-only when `stored`. Do this before the next verb retirement.
4. F-DTG1-3: bound the client's first motor action and first playbook use at tick 0, in RunTape.ts.
5. F-DTG1-4: an owner ruling on whether an embedded playbook's free text needs a door bound.
6. Housekeeping: the control worktree `.../scratchpad/dtg1/ctl-base` (detached at `5abb349d6`) is still registered. It is left in place, not deleted; `git worktree remove --force <path>` retires it.
