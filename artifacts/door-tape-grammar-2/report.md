# door-tape-grammar-2: report (HOTFIX continuation, P0, F-DTG1-1 and F-DTG1-2)

READY-FOR-GATES. Branch `fix/door-tape-grammar-2`, stacked on `fix/door-tape-grammar-1` at `0cf8e12f5` (never merged or rebased). Commits:
- `1682deef2`: the three verbs, with their red-first rows.
- `90c55a61b`: the retirement walk, with its manufactured rows.
- The report commit.

Implementer: Claude Opus 5.5, worktree `/Users/robin/Claude/Projects/wt-dtg1`, Node v26.4.0. Nothing was deployed, and nothing contacted the county door, the live site or the droplet.

## Verdict in one paragraph
After grammar-1 the door still answered `400 bad_payload` to three reels the browser records:
- a reel with a solo dispatch of the Prospector;
- a reel with a probe recovery;
- a reel whose party carries a seated agent rider's orders.

The client's own validator accepts all three. The door now accepts all three verbs in exactly the shape the client's normalizer writes, with every free field bounded. The recorder-built reels are stored, ranked, and read back through `?reel=` into the client's `validateRunTape` with their actions intact. An unknown verb and every malformed field are still refused.

F-DTG1-2 is closed. A verb retired after acceptance now RETIRES a stored row whose orders ride a playbook use or a seated rider's stream: the row is unranked and counted, and its bytes are untouched. Before, it dropped silently.

Counts: `scripts/test-standings.mjs` goes 412 -> 467 checks per backend, with all 412 existing checks green. Each of 20 loosened clauses turns a row red. `src/` is byte-identical to `5abb349d6`, and the computed engine hash equals the registry (`c63def1b`).

## Where the player sees it
Return to Town after securing: the standing lands on the county board instead of "Standing not accepted.". This now also covers these runs:
- a run in which the player dispatched the Prospector (HUD, Game.ts:1899-1904 -> :8256-8262);
- a run in which the player recovered the Far Side probe (:5727);
- a ride with a seated agent rider, which lands on the two-rider board (`&party=2`).

A retired verb shows as `retiredCount` on the board, never as a vanished row.

## What changed (against `0cf8e12f5`: 2 files, +221 / -9)

**`functions/api/standings.ts` (+67 / -5).** Only `validTapeAction`, `tapeGrammarRefusal`, their new helpers, and one adaptation (see Adapted, item 1).

`validTapeAction` changes:
- `recover` beside `fund` (`:1765`).
- `prospector_dispatch` (`:1772`).
- the wire's `agent_orders` (`:1773`).

New helpers:
- `cleanedToken` (`:1782`).
- `SEAT_ORDERS_MAX_BYTES` and `validSeatOrders` (`:1790-1795`).
- `ordersShape` (`:1798`).
- `jsonByteLength` (`:1803`).

`tapeGrammarRefusal` (`:1235-1257`):
- It walks `playbookUses` (`:1244`).
- It judges both order forms (`:1250`).

The adaptation:
- `validTapePlaybookUses` takes `stored` (`:1651`, `:1683`) and, when stored, hands the client's parser `ordersJudgedForShape(playbook)` (`:1690`, `:1698-1718`).

Untouched: every other clause, the handler's entry points, the env types, and the routing.

**`scripts/test-standings.mjs` (+154 / -4):**
- The kit gains the client's `normalizeLockstepAction` and `validateStandingOrders` (`:36-38`).
- `recorderReel` gains `dispatch`, `recover` and `seatOrders` (`:1693`). Its grammar-1 recording is unchanged when they are absent.
- `checkRecorderVerbs` (`:453`) and `checkRetiredEmbeddedOrders` (`:537`) run in each backend pass (`:55-56`).

## The three accepted shapes
Each shape mirrors `LockstepClient.ts` `normalizeAction` (`:1060-1120`). The door accepts only a value that the client's normalizer returns unchanged. A test row checks that the client's normalizer returns each recorded verb unchanged.

1. **`prospector_dispatch`**
   - Exactly the keys `{ type: 'prospector_dispatch', node }`.
   - `node` is a string of 1 to 64 characters with no leading or trailing whitespace. This is `cleanToken(node, 64)` kept as is.
   - Recorded on every solo dispatch (`Game.ts:8256-8262`) and, in multiplayer, among the slot's actions (applied at `:3754`, recorded at `:7969-7974`).
2. **`context_action` `recover`**
   - Exactly `{ type: 'context_action', action: 'recover' }`.
   - Targetless, like `fund`. Recorded at `Game.ts:5727`.
3. **The lockstep `agent_orders`**
   - Exactly the keys `{ type: 'agent_orders', version, orders, submissionId }`.
   - `version` is `1`.
   - `submissionId` is a string of 1 to 96 characters with no leading or trailing whitespace (`cleanToken(submissionId, 96)` kept as is).
   - The JSON of `orders` is at most 3 KiB (`3 * 1024` UTF-8 bytes, the client's `MAX_AGENT_ORDERS_BYTES`).
   - At the door, `orders` must pass `validateStandingOrders`: at most 32 orders, each by its verb's exact key set.
   - At read (`stored`), `orders` must only have the SHAPE: an array of at most 32 records, each with a string `verb`. `tapeGrammarRefusal` then judges the verbs (ADR-005), exactly as for the existing `kind: 'agent_orders'` entry.
   - The multiplayer writer is `SeatedLockstepSim.submitOrders` (`src/sim/SeatedLockstepSim.ts:203-217`). The browser records the seat's actions into that slot's stream (`Game.ts:3720-3722`, `:7975-7986`).
   - Accepted anywhere an action may stand. Unlike `kind: 'agent_orders'`, there is no still-axis rule, because the client has none for this form.

## RED first (scope 1 and 3)
**RED 1: the three verbs.** The new rows ran on the branch base `0cf8e12f5`, where `functions/` and `src/` are untouched, using `node scripts/test-standings.mjs`. The run exited with rc=1. Grammar-1's 40 rows pass first, then:

```
contract clock census 42/25/17/0
recorder reel kv checks (40)
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: the door accepts the recorder's reels with a dispatch, a recovery and a seated rider's orders: [{"ok":false,"error":"bad_payload","message":"Standing not accepted."},{"ok":false,"error":"bad_payload","message":"Standing not accepted."},{"ok":false,"error":"bad_payload","message":"Standing not accepted."}]
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
    ],
    [
+     400,
+     'bad_payload'
-     200,
-     true
    ]
  ]

    at equal (file:///Users/robin/Claude/Projects/wt-dtg1/scripts/test-standings.mjs:1874:10)
    at checkRecorderVerbs (file:///Users/robin/Claude/Projects/wt-dtg1/scripts/test-standings.mjs:473:3)
    at async file:///Users/robin/Claude/Projects/wt-dtg1/scripts/test-standings.mjs:55:5 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: [
    [ 400, 'bad_payload' ],
    [ 400, 'bad_payload' ],
    [ 400, 'bad_payload' ]
  ],
  expected: [ [ 200, true ], [ 200, true ], [ 200, true ] ],
  operator: 'deepStrictEqual',
  diff: 'simple'
}

Node.js v26.4.0
```

The rows that ran before this assertion passed:
- Each reel carries its verb exactly once. A solo dispatch reaches the recorder twice, through `recordAction` and through the tick's action list, and is kept once.
- The client's normalizer returns each recorded verb unchanged.
- Every body carries its tape.

**RED 2: the retirement (F-DTG1-2).** Same base, same file, with only the order of the two new check calls swapped for this one run, then restored and verified with `cmp`. The run exited with rc=1:

```
contract clock census 42/25/17/0
recorder reel kv checks (40)
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: a stored row with a playbook use whose recording carries agent orders naming a since-retired verb is RETIRED and COUNTED, not dropped
+ actual - expected

  [
    0,
+   0
-   1
  ]

    at equal (file:///Users/robin/Claude/Projects/wt-dtg1/scripts/test-standings.mjs:1874:10)
    at checkRetiredEmbeddedOrders (file:///Users/robin/Claude/Projects/wt-dtg1/scripts/test-standings.mjs:572:5)
    at async file:///Users/robin/Claude/Projects/wt-dtg1/scripts/test-standings.mjs:55:5 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: [ 0, 0 ],
  expected: [ 0, 1 ],
  operator: 'deepStrictEqual',
  diff: 'simple'
}

Node.js v26.4.0
```

Both controls before it passed: the clean row's tape is accepted, and the clean row ranks (`[1, 0]`). With the orders naming HOLD, the row vanished: board 0 and `retiredCount` 0. That is the F-RPG-21 silent drop.

**Attribution with the real recorder.** The grammar-1 probe (`artifacts/door-tape-grammar-1/door-probe.mjs.txt`), re-run at this tip, gives these verdicts:

| probe row | door at `0cf8e12f5` (grammar-1's `probe-after.txt`) | door here | `validateTape` here | client `validateRunTape` here |
| --- | --- | --- | --- | --- |
| F2: dispatch, twelve keys | 400 bad_payload | 200 stored | valid | valid |
| G2: recover, twelve keys | 400 bad_payload | 200 stored | valid | valid |
| I2: wire `agent_orders`, twelve keys | 400 bad_payload | 200 stored | valid | valid |

All thirteen probe rows now answer 200 (`probe-tip.txt`).

## GREEN (scope 1 to 4)
The committed tip `90c55a61b`, with the tree equal to HEAD for `functions/`, `src/` and `scripts/`, run with `node scripts/test-standings.mjs`:

```
contract clock census 42/25/17/0
recorder reel kv checks (40)
recorder verbs kv checks (41)
retired embedded orders kv checks (14)
refusals kv sample {"ok":true,"counts":{"unsecured":1,"bad_payload":1},"recent":[{"reason":"bad_payload","contractId":"the-claim","refusedAt":1790350525806},{"reason":"unsecured","contractId":"the-claim","refusedAt":1790350525806}]}
standings assay kv checks passed (467)
contract clock census 42/25/17/0
recorder reel sqlite checks (40)
recorder verbs sqlite checks (41)
retired embedded orders sqlite checks (14)
refusals sqlite sample {"ok":true,"counts":{"bad_payload":1,"unsecured":1},"recent":[{"reason":"bad_payload","contractId":"the-claim","refusedAt":1790350527057},{"reason":"unsecured","contractId":"the-claim","refusedAt":1790350527057}]}
standings assay sqlite checks passed (467)
rc=0
```

### Counts (`scripts/test-standings.mjs`)
| tree | kv | sqlite |
| --- | ---: | ---: |
| before: base `0cf8e12f5` (grammar-1's own GREEN) | 412 | 412 |
| after `1682deef2` (verbs) | 453 | 453 |
| after `90c55a61b` (tip) | 467 | 467 |
| of which new: "recorder verbs" 41 and "retired embedded orders" 14 | 55 | 55 |
| existing checks, all still green (467 - 55) | 412 | 412 |

The file is fail-fast, so rc=0 means every existing check ran green.

### The new checks per backend
**`checkRecorderVerbs`, 41 checks.**
- Recorder fidelity (3): each verb is recorded once, the client's normalizer returns each verb unchanged, and every body carries its tape.
- Door acceptance of the three reels (1).
- For each reel: stored exactly as recorded, read back through `?reel=` into `validateRunTape`, and the entries and streams deep-equal after the round trip (9).
- Boards (1): two reels on the solo board, one on the two-rider board.
- Four rows through the real handler, each giving `validateTape` null and `400 bad_payload` (8):
  - a verb no grammar knows (`prospector_recall`);
  - a dispatch with an unknown key;
  - a recovery with an unknown key;
  - a seated rider's orders naming HOLD.
- Eleven `validateTape` rows (11):
  - node empty, 65 characters, edge whitespace, whitespace only, not a string;
  - a targetless context action other than `fund` or `recover`;
  - seat orders with an unknown key, on version 2, with an empty submission id, with a 97-character submission id, with an edge-whitespace submission id.
- The 3 KiB bound (4): one check that the heavy orders (32 grammatical `HARVEST` orders) are grammatical yet over 3 KiB, so the bytes alone decide, then refusals for over 3 KiB, 33 orders, and orders that are not a list.
- At read (4): orders naming HOLD are still readable (shape only), while not-a-list, a non-order member and over 3 KiB stay refused.

**`checkRetiredEmbeddedOrders`, 14 checks.** Three cases:
- a playbook use whose recording carries `kind` orders;
- a playbook use whose recording carries a seated rider's orders;
- a seated rider's stream.

Each case gets four checks:
- the clean tape is accepted;
- the clean stored row ranks: board `[1, 0]`;
- the row with HOLD is retired and counted: `[0, 1]`;
- its stored bytes are unchanged.

Two more rows keep the shape required at read: embedded orders that are not a list, and embedded seat orders over 3 KiB.

### Mutation check (`mutation.txt`)
Each run changed one clause of `standings.ts` at `90c55a61b`, ran the door test, and restored the source byte-identical (`cmp`).

| mutation | result |
| --- | --- |
| M0 none (control) | rc=0, 467/467 |
| M1 recover: any extra key | RED "a recovery with an unknown key" |
| M2 dispatch: any extra key | RED "a dispatch with an unknown key" |
| M3 dispatch: node up to 65 | RED "a dispatch with a 65-character node" |
| M4 token: edge whitespace allowed | RED "a dispatch whose node carries edge whitespace" |
| M5 token: empty allowed | RED "a dispatch with an empty node" |
| M6 seat: any extra key | RED "a seated rider's orders with an unknown key" |
| M7 seat: any version | RED "... on wire version 2" |
| M8 seat: submission id up to 97 | RED "... with a 97-character submission id" |
| M9 seat: no 3 KiB bound | RED "... over the 3 KiB wire limit" |
| M10 seat: shape only at the door | RED "... naming a retired verb" |
| M11 seat: no shape at read | RED "at read ... not a list" |
| M12 shape: any list member | RED "at read ... holding a non-order" |
| M13 refusal: playbook uses not walked | RED "... playbook use whose recording carries agent orders ... RETIRED and COUNTED" |
| M14 refusal: seat orders not judged | RED "... playbook use whose recording carries a seated rider's orders ... RETIRED and COUNTED" |
| M15 read: recordings judged strictly | RED "... carries agent orders ... RETIRED and COUNTED, not dropped" |
| M16 read: embedded shape unchecked | RED "at read a recording whose agent orders are not a list is refused" |
| M17 read: embedded 3 KiB unchecked | RED "... over the 3 KiB wire limit is refused" |
| M18 recover clause removed | RED at the acceptance row (the recovery reel 400) |
| M19 dispatch clause removed | RED at the acceptance row (the dispatch reel 400) |
| M20 seat clause removed | RED at the acceptance row (the seated reel 400) |

## Gates (self-check)
- `npx tsc --noEmit`: rc=0 at `1682deef2` and at `90c55a61b`.
- `npm run build`: rc=0 at the tip tree.
- `src/` is byte-identical to `5abb349d6` (`git diff --quiet`).
- The computed engine hash equals the registry (`c63def1b`).
- No em or en dashes in the diff, the commit messages or this report.

**Under the drain lock** (`dlock.sh`, one blocking call per batch, backgrounded with its output file waited on), tip `90c55a61b`, 15:13:03Z to 15:29:12Z:

| gate | result |
| --- | --- |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` | rc=1: 1018 tests, 1008 pass, 5 fail, 5 skipped |
| `npm run test:accounts` | rc=0 |
| `npm run test:mp` | rc=0 |
| `npm run test:stats` | rc=0 (includes standings 467 and 467, and the ledger worker path that loads this module with `configFile: false`) |

**The five reds, attributed.** Batch 1 ran a control of the known-environmental files at the branch base `0cf8e12f5`, in a detached scratch checkout set up like this one. Batch 2 (15:31:42Z to 15:35:15Z) ran `board-tape-gold` alone twice on each tree.

| red at the tip | attribution |
| --- | --- |
| `desk-declaration-guard`: "the live board is green" | Pre-existing, environmental: red on the `0cf8e12f5` control too. It refuses any linked worktree. |
| `ledger-backup-pull`: two tests | Pre-existing, environmental: red on the control too. No `.env.local` here, and none was read. |
| `fixture-teardown`: all 161 owners | Its only failing child is `board-tape-gold` (`page.waitForFunction: Timeout 120000ms`), a load-sensitive browser boot; batteries ran 3-way contended. Batch 2: tip green twice (30 s, 29 s); base green once (31 s) and red once with the identical timeout (123 s). The test loads no file this branch changes. |
| `same-game-audit`: "runs over every contract" | **Caused by this branch**: the audit reads the door's action literals, so its pinned summary moves 511 -> 595 agent-lacks. This is F-DTG2-1; the drain decides. |

`node-guards-contention` was red on both control runs ("CONTENDED, 3 concurrent batteries") and green in the tip's full battery.

`test:accounts` and `test:mp` rewrote their two tracked artifacts again (factory churn, F-1407-1). They are left unstaged and are in no commit.

## Adapted, and why
1. **One change outside the helpers the firewall names.** `validTapePlaybookUses`, grammar-1's own helper, and its call in `validTapeInput` now take `stored`, and at read they hand the client's parser `ordersJudgedForShape(playbook)`.
   - Why: scope 3 says a future verb retirement must RETIRE such rows instead of dropping them. `tapeGrammarRefusal` only sees rows that survive their read, and at read `validatePlaybook` judged the embedded orders strictly. RED 2 measured the drop: board 0, `retiredCount` 0.
   - So a `tapeGrammarRefusal` walk alone could never make the manufactured row pass.
   - The change keeps the client's parser for every other field of the recording. It empties only well-shaped order lists, refuses malformed ones, and applies at read only.
   - It is pinned by M15, M16 and M17.
   - For playbook uses, the POST path (`stored` false) is exactly grammar-1's.
2. **The shapes are mirrored rather than delegated to `normalizeLockstepAction`.**
   - That normalizer is lenient: it trims, cuts, clamps and drops unknown keys, and the door stores the raw body.
   - Its `agent_orders` arm runs the strict order grammar, which at read would drop rows (the ADR-005 case).
   - The door therefore states the canonical shapes explicitly, in its own `hasOnlyKeys` style.
   - A row pins that the client's normalizer returns each recorded verb unchanged.
3. **`src/` untouched.** No export was needed. The 3 KiB bound is mirrored as `SEAT_ORDERS_MAX_BYTES`, because `MAX_AGENT_ORDERS_BYTES` is module-private (LockstepClient.ts:140).
4. **Two commits, one concern each:** the three verbs (`1682deef2`, green alone at 453 per backend), then the retirement walk (`90c55a61b`, 467).

## Findings (reported, not fixed)
- **F-DTG2-1 (a gate red CAUSED by this branch, outside its firewall; the drain's call): the same-game audit's pinned summary moves.**
  - The audit reads the door's source. It enumerates every `value.type === '...'` literal in `validTapeAction` as a human tape action (`scripts/same-game-audit.mjs:154-164`) and asks whether a standing-order verb reaches it (`:698-715`).
  - The two new literals therefore add one row per contract each. It is a ROW move, not a data move.
  - Measured with `node scripts/same-game-audit.mjs --json` (`audit-attribution.txt`):

    | tree | summary | rows |
    | --- | --- | --- |
    | `0cf8e12f5` (control) | agent-lacks 511, equal 1252 | 1763 |
    | this tip | agent-lacks 595, equal 1252 | 1847 |

  - The difference is exactly +84 rows, none removed:
    - 42 of `tape action prospector_dispatch | no prospector_dispatch standing order | agent-lacks`;
    - 42 of `tape action agent_orders | no agent_orders standing order | agent-lacks`.
  - `scripts/same-game-audit.test.mjs:452` pins `{ agent-exceeds: 0, agent-lacks: 511, equal: 1252, not-offered: 0 }`. It is red at the tip.
  - Both options edit files outside this master (`scripts/same-game-audit.*`, `docs/bench/same-game-audit.md`), so this is the drain's call.
    - (a) Re-pin to `{ 0, 595, 1252, 0 }` over 1847 rows, verbatim, the way this file records every earlier move.
    - (b) RECOMMENDED: first teach the audit what the rows mean, then re-pin whatever it measures:
      - `agent_orders` on the wire is the seated rider's own order channel, not a human control. Exempt it with that reason.
      - `prospector_dispatch` is the human's HUD dispatch of the Prospector to a seam or a sluice (`gold-seam-N`, `sluice-N`). Its standing-order counterpart looks like `HARVEST { seam | sluice }`: INFERRED from the target shapes, and ADR-005's controls ruling may govern it.
    - Option (a) would publish 84 parity gaps, and the 42 on `agent_orders` are a category error.
- **F-DTG2-2 (the door is looser than the client in three pre-existing places, measured).** A reel the door accepts but the client refuses stays on the shelf, yet the Lantern and the assay cannot load it. Measured with `validateTape` against `validateRunTape` on one-action tapes (`looser-than-client.txt`):

  | action on the tape | door | client |
  | --- | --- | --- |
  | `place_build` with id `'   '` | accepts | refuses |
  | `pick_upgrade` with id `'   '` | accepts | refuses |
  | `set_agent_ability` naming `fly` | accepts | refuses |
  | `set_agent_ability` naming `auto_pan` (control) | accepts | accepts |

  - Cause, for the whitespace ids: the door's `token()` (`standings.ts:1821`) has no trim rule, while the client's `cleanToken` trims (LockstepClient.ts:1158-1162).
  - Cause, for the abilities: the client accepts five abilities (LockstepClient.ts:1106-1110), while the door accepts any token.
  - The recorder never writes these values. Tightening them changes existing clauses, which is outside "nothing else loosened". Suggested follow-up: apply `cleanedToken` to the existing ids and the five-ability list, red-first.
- **F-DTG2-3 (edge, unreachable in practice): the client's `cleanToken` can write a token that ends in whitespace, and the door refuses it.**
  - How: `cleanToken` trims and then cuts to the maximum length, so a raw id longer than 64 (node) or 96 (submission id) characters, with whitespace at the cut, becomes a token ending in whitespace. The recorder would write it, and `cleanedToken` refuses it.
  - Real ids are `gold-seam-N` and `sluice-N` (HarvestSystem.ts:86, Game.ts:8330) and `seat-N` (SeatedLockstepSim.ts:211).
- **F-DTG2-4 (kept from grammar-1): the RunTape import cost (F-DTG1-5) and the client's tick -1 laxity (F-DTG1-3) stand unchanged.** This branch adds no import from `src/game`.

## Merge readiness
Read-only dry runs at the tip with `git merge-tree --write-tree` found no conflicts:

| this branch merged with | exit code |
| --- | --- |
| `fix/kv-counters-to-ledger-2` `b9984e055` | rc=0 |
| `main` `75d4c8bbe` (grammar-1 not yet on it) | rc=0 |

The branch is stacked on grammar-1 and was never merged or rebased, so the drain lands grammar-1 first and this on top.

## Evidence in this directory
| file | what it holds |
| --- | --- |
| `red-run-1.txt` | RED 1 above |
| `red-run-2.txt` | RED 2 above |
| `probe-tip.txt` | the grammar-1 probe re-run at this tip |
| `mutation.txt` | the 20-row mutation check |
| `looser-than-client.txt` | F-DTG2-2 |
| `audit-attribution.txt` | F-DTG2-1 |

## Remaining list, in order
1. Drain: land grammar-1, then this branch.
2. Re-pin `scripts/same-game-audit.test.mjs:452` (F-DTG2-1). Option (b), teaching the audit that `agent_orders` is the rider's own wire and that `prospector_dispatch` pairs with `HARVEST`, is recommended before the re-pin.
3. Then the ordinary deploy, which restarts `goldrush-ledger`, so the droplet's door serves the three verbs.
4. F-DTG2-2: tighten the three pre-existing places where the door is looser than the client, red-first.
5. Carried from grammar-1: F-DTG1-3 (the client's tick -1) and F-DTG1-4 (an embedded playbook's free text).
6. The control checkout `scratchpad/dtg1/ctl-base` is retired with `git worktree remove --force` at the end of this run.
