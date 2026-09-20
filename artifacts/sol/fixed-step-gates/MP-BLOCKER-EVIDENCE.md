# F-SOL-SIM-IMPL-003 — isolated MP resync blocker

Date: 2026-07-10

Branch: `sol/fixed-step-unification`

Implementation tip: `1b575fd`

## Exact isolated result

The exact task-067 case was run against the branch's fresh external dev server, once with `--repeat-each=2`: **0/2 passed**. Both attempts timed out at `e2e/mp-02-lockstep.spec.ts:82`, waiting for Bob to report at least one desync and resync. The retained output excerpt is `mp-02-isolated-repeat-final.txt`.

An independent reviewer then repeated the test from a fresh detached `1b575fd` checkout with fresh dependencies and a fresh Vite server on port 5294. A single isolated run failed; `--repeat-each=5` produced **1 pass / 4 failures**. `src/mp/LockstepClient.ts` is identical to compared main `e374f47`, excluding a stale server, stale merge, or branch-local MP edit.

## Focused diagnostic

The same case was temporarily instrumented to print both `window.__GR_MP__.state()` values on timeout, then the instrumentation was removed. `git diff --exit-code -- e2e/mp-02-lockstep.spec.ts` returned zero afterward.

At timeout:

| Peer | Tick | Desyncs | Resyncs | Paused | Connected |
|---|---:|---:|---:|---|---|
| Alice | 714 | 22 | 22 | false | true |
| Bob | 713 | 0 | 0 | false | true |

Alice's first post-injection hashes were `tick 90 = fnv1a32:f2462657` and `tick 120 = fnv1a32:6c3a4ea4`; Bob's were `tick 90 = fnv1a32:18f38c93` and `tick 120 = fnv1a32:6f9fb09e`. The streams stayed unequal through the last sampled tick 690 (`fnv1a32:138e2dc1` vs `fnv1a32:f9ee15dd`). The restore operation repeatedly completed for Alice, but it never restored an equal future.

## Why fixed-step exposes it

`LockstepClient.handle('hash')` compares only when `localHashes` already contains the tick. If the remote hash arrives first, it is discarded; `afterSimTick()` later stores the local hash but never compares it with a pending remote value. Stable fixed scheduling keeps the same peer on the detecting side, so Alice requests/restores while Bob remains at 0/0. This is hash-exchange/MP behavior, explicitly outside branch #1's firewall.

## The task-067 green was a false-positive for determinism

The checked-in `artifacts/mp-02/desync-resync.json` is green by the existing counter assertions, but its peers are not hash-identical after restore:

- tick 90: Alice `fnv1a32:88f71e9f`; Bob `fnv1a32:a35ea391`
- tick 120: Alice `fnv1a32:d90e03ca`; Bob `fnv1a32:cb359b78`

The existing test asserts that both clients are unpaused and each has a resync; it does not assert equality of post-restore hashes. Task 067's stated “hash-identical within 30 ticks” condition therefore was not actually gated.

## Required ruling

Do not mark this branch READY under isolated-red parity. Drain requires one explicit choice:

1. authorize the MP hash-order correction on this branch;
2. re-sequence F-SOL-PERSIST-002 ahead of the fixed-step tail and merge its complete-state correction back; or
3. amend the branch-1 gate with a rationale that accounts for the unilateral resync counter and unequal future hashes.
