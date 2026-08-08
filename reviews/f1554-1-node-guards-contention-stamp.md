# f1554-1 — node-guards contention stamp

**Slice:** `f1554-1-node-guards-contention-stamp` (cure for F-1554-1)
**Branch:** `lane/c` · **Tip:** `58117a5d7ceb32fc707bd397357a4f36d0f0fdc0`
**Merge:** `82a4c15c4ed5981a95090f35dcf3da11c381147a` (`--no-ff`, three-way, onto clean main)
**Drained:** s1557, 2026-08-08 · fire shell
**Task master:** `tasks/lane-c-f1554-1-node-guards-contention-stamp.md` (authored s1556)

## VERDICT: MERGED — green, and the green is load-bearing rather than incidental

## What it does

`test:node-guards` is the factory's expensive battery, and F-1554-1 established that a fire told to
"run it ALONE" has no instrument that tells it whether it actually did. This slice adds that
instrument as an **advisory stamp**, not a gate.

`scripts/run-node-guards.mjs` gains `contentionStamp()`: it `pgrep -f run-node-guards`, resolves
`pid`/`ppid` for every match, and **collapses each `sh -c` + `node` pair into ONE battery** by
counting only roots of the matching process forest (a process whose parent is not itself in the
match set). When it finds siblings it prints `CONTENDED — <n> concurrent batteries` to stderr, once
before the child battery starts and once after it exits — so the stamp brackets the run and is
visible in a log tail even when the battery's own output is enormous.

That collapse is the whole point of the slice, and it encodes a correction s1556 made to
F-1554-1's own arithmetic while authoring the master: **`npm run` interposes an `sh -c` wrapper
whose command line also matches `run-node-guards`, so one battery presents TWO matching pids.**
A naive `pgrep … | wc -l` therefore reports 2 for a battery running perfectly alone, and F-1554-1's
original evidence (the pid pairs `34453/34454` and `69380/69381`) was **two batteries, not four**.
The finding's conclusion was untouched by that error; only its counting was wrong. The cure counts
batteries.

`scripts/node-guards-contention.test.mjs` (new, 154 lines) registers in the existing
`test:node-guards` list.

## Evidence

All measured by me on the MERGED tree, fire shell, `2026-08-08`. Archived:
`artifacts/s1557-node-guards-f1554-1.txt` (in git, per the retention law).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | green, `✓ built in 1.39s`; asset-diet ceilings respected (Herald 1,158,214 / 1,500,000 B) |
| `test:node-guards` **run ALONE** | **rc=0 — 393 tests / 390 pass / 0 fail / 3 skipped / 310.3 s**, 56 guard files |
| new guard's own test | `✔ contention is advisory, correctly counted, and absent when alone (1032.5 ms)` |
| contention stamp during that alone run | **absent from stderr — correct**, the no-false-positive arm proving itself in production |
| 3 skips | the documented fire-shell cross-engine skips (F-1408-2), pre-existing, not new |

**Board genuinely quiet for the battery**, checked before starting rather than assumed:
`pgrep -f run-node-guards` returned rc=1 (no matches) immediately prior; all six queues empty, no
lane runner dispatching, lane-c's own Codex process already exited.

### The green is not the evidence — the manufactured red is (s1299/s1300 standard)

A passing guard never executes its violation path, so its green says nothing about its red. This
guard **manufactures the defect**, and its stdout records that it did:

```
MANUFACTURED_DETECTION: shell + node sibling collapsed to 1 battery; reported 2 total
EXIT_CODES: passing alone=0 sibling=0; failing alone=1 sibling=1
```

It spawns a real detached `/bin/sh -c '"$NODE_BIN" "$HARNESS_PATH" "$FIXTURE_PATH"'` sibling —
deliberately the **same two-process shape `npm run` produces** — waits for it to signal readiness,
and then asserts the stamp appears exactly twice reading `CONTENDED — 2 concurrent batteries`
(`:32`). Had the harness counted pids it would have said 3, and the test would red.

Four properties I checked in the code rather than taking from the report:

1. **Advisory, not a gate** (`:143`–`:146`): exit codes are asserted **equal** with and without a
   sibling, in both a passing and a failing arm. A contended battery still reports its own verdict;
   the stamp only tells you how much to trust it.
2. **No false positive when alone** (`:119`–`:123`), and non-trivially so: `waitForQuietBoard()`
   requires 300 ms of measured quiet first, because *other guard files in the same battery launch
   this harness briefly*. Without that wait the "alone" arm would race the battery it runs inside
   and flake. The runner found this by running the full battery once and adapting — that is the
   right order of operations.
3. **Degrades silently** (`:125`–`:127`): with `PATH=''` (no `pgrep`) the stamp is swallowed and the
   exit code is unchanged. An instrument that cannot measure must not fail the thing it measures.
4. **`NODE_TEST_CONTEXT` deleted from the child env** (`:13`–`:17`) — the known hazard where a
   spawned child inherits the test context and exits 0 regardless of its real result.

### Blast radius

`git diff main...lane/c --stat` = 3 files, +188/-1. All three classified **HELD LANE-ONLY** by
`lane-usable.mjs` before the merge — main had moved none of them, so no three-way graft was needed
and no `MAIN-MOVED` reconciliation applies. Merge was clean, zero conflicts.

`package.json` moves **exactly one line** — the `test:node-guards` file list, gaining the new guard.
**No new npm script**, so gate topology is unchanged and `gate-caller-audit` has nothing new to
root. No `src/`, no `e2e/`, no runtime or player-facing surface.

### Playwright: NOT RUN, and deliberately so

Declared explicitly so nobody inherits a false green. The diff touches only `scripts/` plus one
`package.json` script line; there is no rendering, sim, or UI surface for a browser to exercise, and
`npm run build` covers the only bundling risk. The slice's own spec **is** the node battery, and it
ran alone and green. No boot probe or 390px capture is claimed.

## Findings

**F-1557-2 (non-blocking, no corrective owed).** The stamp is stderr-only and unstructured, so it
is readable by a human tailing a log but **not queryable by any guard** — nothing can later ask
"was this recorded green taken under contention?" of an archived run. That is the correct scope for
this slice (the master firewalled it to the stamp), and building a machine-readable contention field
into archived evidence is a larger question about evidence format that should not be smuggled in
here. Recorded so the limit is known rather than discovered later: **a fire reading an inherited
green still cannot tell whether it was contended unless the log tail was kept.**

**Noted, not a finding:** the two-stamp bracket (before + after) is intentional and asserted, but it
means a battery that is contended only *midway* through its run still prints at both ends or neither.
The stamp answers "was anything else running at the boundaries", not "was the run contended
throughout". For the purpose F-1554-1 describes — deciding whether to trust a red — the boundaries
are the right sampling points, since a fire's own concurrent work brackets its battery.

## Ledger

- Goal leaf `f1554-1-node-guards-contention-stamp` → `merged`, `mergeHash` `82a4c15c4ed5981a95090f35dcf3da11c381147a`.
- `tasks/done/20260808-134850-lane-c-f1554-1-node-guards-contention-stamp.md` → `drained-82a4c15c4-…`.
- F-1554-1 closed in `tasks/BACKLOG.md` in the drain commit.
- GZ-01: **no news item owed** — no player-visible change (factory instrumentation only).
