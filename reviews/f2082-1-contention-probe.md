# f2082-1 — the node-guards contention probe counts OBSERVERS as batteries

**Slice:** `f2082-1-contention-probe-counts-observers` · **branch:** `lane/lane-a` · **tip:** `15b25ce91`
**Merged to main:** `58ee26db9320e46630fe74086c348817f52edaec` (s2083 fire, 2026-08-20)
**Base:** `ea1953bf1` · **Gated in:** detached worktree `gate-s2083` (§3.0b)

## VERDICT: MERGED — cure proven by independent control; three battery reds, none caused by this slice

---

## What it does

`contentionStamp()` in `scripts/run-node-guards.mjs` asked *"is another copy of this battery
running?"* with a bare `pgrep -f 'run-node-guards'` — a pattern that matches **any process whose
command line merely mentions the harness**. The standard wait-for-quiet idiom in this factory
(`until ! pgrep -f "run-node-guards"; do sleep …; done`) therefore counted **as a battery**, so one
genuine battery was reported as two or three.

The slice puts **one shared predicate** in `scripts/node-guards-concurrency.mjs` —

```js
/^(?:(?:\S*\/)?(?:ba|da|z)?sh\s+-c\s+)?["']?(?:.*\/)?node["']?\s+["']?(?:.*\/)?run-node-guards\.mjs["']?(?:\s|$)/
```

— and imports it into **both** callers (the harness and `waitForQuietBoard()` in the guard), which is
what scope 1 required: a cure that fixed only the harness would have left the guard red for the
original reason. `ps` now reports `command=` so matches can be discriminated, forests are collapsed
to roots, and a stamp is emitted only at **two or more genuine batteries**.

Three files, +54/−11. Zero conflicts. Scope audit: exactly the three files the firewall permits.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **clean**, 4.58 s |
| `npm run build` (merged tree) | **green**, 15.67 s |
| `node --test scripts/node-guards-contention.test.mjs` | **1/1 pass**, 1.2 s |
| Same guard **under its own harness** | **rc=0, 1/1 pass**, 1.4 s |
| `npm run test:node-guards` (full battery) | 469 tests · **461 pass / 3 fail** / 5 skipped · 595.5 s |
| Advisory contract preserved (scope 4) | `EXIT_CODES: passing alone=0 sibling=0; failing alone=1 sibling=1` |
| Repaired sibling fixture (scope 5) | `MANUFACTURED_DETECTION: shell + node sibling collapsed to 1 battery; reported 2 total` |

### Independent control — NOT a re-run of the runner's own test

A passing guard never executes its violation path, so the guard's green is not evidence about the
red. Two controls were run against the **merged** predicate, independent of the slice's own suite:

**(a) Predicate replay of the finding's own measured command lines — 10 pass / 0 fail.**
Both real forest members from Measurement A score `RUNS-BATTERY=true`; **both waiter shapes**, a
`grep` for the name, a bare `pgrep`, the task file's own name, shell prose, and a fire whose *prompt
text* mentions the harness all score `false`.

**(b) Live persistent waiter on a battery-free board.**

```
OLD predicate (bare pgrep -f run-node-guards) matches : 1  -> would report CONTENDED
  pid 93474  NEW runs=FALSE  /bin/sh -c while true; do sleep 1; done # until ! pgrep -f run-node-guar
NEW predicate genuine batteries                       : 0  -> SILENT (correct)
```

The defect is reproduced and the cure demonstrated on the live board: the old arithmetic reports
**CONTENDED with zero batteries alive**; the new one is correctly silent. The waiter was reaped.

### The two questions the master ordered PROVEN, not assumed

- **The off-by-one self-count: DISPROVEN.** The master flagged it as *indicated, not proven* and
  forbade curing it blindly. The runner disproved it on a controlled board, and this drain
  re-measured the mechanism independently: **macOS `pgrep` excludes the calling ancestor.** From
  inside the harness, `pgrep -f run-node-guards` returns `(none)` while the harness ancestor is
  demonstrably alive. The cure therefore makes the self-count **conditional**
  (`batteryPids.has(process.pid) ? 0 : 1`) rather than deleting it — correct on macOS and portable
  to platforms that do return self. This is the right outcome: the master expected to CONFIRM, and
  the runner refuted it with evidence instead.
- **The guard's sibling-fixture comment: measured FALSE.** The shell exec-replaced itself, so the
  fixture never built the npm process shape it claimed to build. Repaired with `& wait`; both
  processes now persist and collapse correctly. The comment was not silently deleted.

## Findings

**F-2083-1 — `tasks/goals.json` carries two leaves whose `taskFile` is prose, and main is RED
because of it. NOT caused by this slice; caused by neither lane nor drain.**
`scripts/goal-tracker.test.mjs:79` asserts `taskFile` matches `/^[a-zA-Z0-9_-]+\.md$/`. Two leaves
(`tasks/goals.json:1011` and `:1372`) carry
`"ATTENDED-AGENT (no lane master; dispatched via Agent tool per owner engine directive)"`.
**Controlled:** the identical failure reproduces on **pristine main with no merge applied**, and this
slice touches only `scripts/node-guards-*` — it cannot reach `goals.json`. The owner's engine
directive created a legitimate dispatch mode (Agent tool, no lane master) for which the schema has
**no vocabulary**, so the bookkeeping is honest and the *schema* is what is behind. This reds
`test:node-guards` **and** `test:ledger-guards` for **every fire**, which is the s1301 duty's own
instrument — i.e. it is exactly the F-1460-1 disease ("a red nobody investigates is worse than no
test") one level up. Corrective master authored this fire. **REC:** admit an explicit sentinel
rather than loosening the pattern to accept arbitrary prose.

**F-2083-2 — the contention guard is not reliably runnable inside a 595 s full battery. PRE-EXISTING,
not a regression.** Inside `test:node-guards` the guard fails at **5051 ms** — `waitForQuietBoard()`'s
5 s deadline. s2082 recorded the identical failure at **5020 ms on the PRE-cure tree**, so the
fingerprint matches a known red with proof. It passes standalone (1.2 s) and under its own harness
(1.4 s) in **both** arms, pre- and post-cure, so the slice neither causes nor fixes it. Leading
hypothesis: over a 595 s window another session's battery (the agent worktrees were observed
launching batteries during s2082's measurements) genuinely occupies the board — in which case the
**cured** predicate is now reporting it *truthfully* and the guard's "absent when alone" assertion is
simply unsatisfiable while it is not alone. **This is a hypothesis, not a conclusion** — it needs a
controlled run on a provably quiet box. **Not blocking:** the stamp is advisory and cannot influence
`process.exit` (asserted green above).

**F-2083-3 (non-blocking, inherited, unowned) — `fixture-teardown.test.mjs` fails as a CONSEQUENCE of
F-2083-1**, reporting only `1 !== 0` ("goal-tracker.test.mjs child failed", 51615 ms). s2082 observed
the same coupling. The message names no cause, so this red is an anonymous echo three layers down —
worth knowing when triaging, since fixing F-2083-1 should clear it.

**Runner-reported, adjacent, untouched:** `/tmp/s2082-guards.mjs` wraps the full gate in unbounded
`spawnSync`, letting a wedged worker outlive its per-test bound — this is what prevented the runner
from running `test:node-guards` itself. That file is s2082's `/tmp` scratch and is already gone.

## Merge classification

Base `ea1953bf1`; `main..lane/lane-a` was **1 ahead** and is now **empty (absorbed)** — the classifier
flip confirms the merge landed. All three files **LANE-TOUCHED only**; main had moved none of them
(the master measured them byte-identical between lane and main at authoring time, and no concurrent
writer touched `scripts/node-guards-*` during the drain). `--no-ff`, **zero conflicts**, no 3-way
graft required.

## Where does the player see this?

Nowhere — this is a factory instrument, not game code. No `src/`, `e2e/`, or asset paths are touched,
so no boot probe or screenshots apply, and **no GZ-01 news item is owed** (not a player-visible
change).
