# Review — f2152-1: the census player's safe default (F-2142-4 cured at the code)

**Slice/branch/tip:** `lane/d` @ `6ecbaae7f` (`runner(lane-d): f2152-1-census-player-safe-default.md`) · base `a9e2f345956542ae3c68bc4efa0c02c8eb4a1d48` · merged to main at **`f2b870e6d0a0d0a72dc385f067599ebe02aba40e`** · drained s2153, 2026-08-22.

**Verdict: MERGED.** Gate green on the merged tree in a detached worktree (§3.0b); the guard was proven non-vacuous by manufacturing its red in this drain rather than accepting the runner's paste.

## What it does

`scripts/f2135-canyon-census-player.mjs` stops writing the **banked, cited** census artifact by default. Its output now resolves to `artifacts/f2135-canyon-census/scratch/<runId>.json`, and landing bytes in `artifacts/f2135-canyon-census/census.json` requires naming that path explicitly through `F2135_CENSUS_FILE` — so the legitimate explicit-output flow s2142/s2143 used is preserved while the dangerous *default* is removed. The slice also repairs a second, sharper mechanism: `persist()` recomputed the `comparison` block **only inside `if (artifact.runs.length === 2)`**, so a third run did not leave the block untouched — it **froze it permanently**, and every run thereafter was invisible to it. `comparison` is now recomputed across every run, carrying `identical: null` for a single run and `runs.every(r => r.rows === runs[0].rows)` otherwise.

This is F-2142-4's cure moved out of a task master's prose and into the code. F-2151-1 named the class precisely: *a cure that lives in a task's prose has a denominator of ONE RUN* — it protects only the invocations that quote it, and the next invoker reproduces the defect without ever seeing the warning.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check.mjs` (pre-merge, then re-asserted on merged tree) | ✅ CLEAR both times, `status="queued"` |
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | rc=0, built in 1.63s |
| `scripts/f2135-canyon-census-player.test.mjs` (the new guard) | **4 tests / 4 pass / 0 fail**, 528ms |
| `scripts/gate-caller-audit.mjs` | **PASS · unrouted 0** (3 owner escalations, all pre-existing grandfathered F-1624-1 entries) |
| `check-power-graph-budget.mjs` | `p95=0.378ms cap=0.500ms samples=160` **PASS** |
| `task-guard-audit.mjs` | correctly **SKIPPED** in the linked worktree (F-1151-1); re-run from main's checkout after the merge |
| Firewall: banked census untouched | `git status --short` in the gate worktree returned only the untracked `node_modules` symlink — `artifacts/f2135-canyon-census/census.json` unmodified |

**Runner's own battery, reported not re-run:** Node 26.4.0, `test:node-guards` **494 total / 492 pass / 0 fail / 0 cancelled / 2 skipped**; `test:ledger-guards` 183/183. Its initial Node 23.11.1 pass produced `483 pass / 2 fail / 1 cancelled` with all affected files byte-identical to main — consistent with F-2076-1's measured mechanism (v23 bounds at FILE granularity and never consults per-test budgets) and with F-2099-1's correction that the margin moves with machine load. Not treated as a red.

### The manufactured red — the control this drain took for itself

A passing guard never executes its violation path, so its green is not evidence about its red (the s1299/s1300 standard). In the detached worktree I reverted **only** `scripts/f2135-canyon-census-player.mjs` to main's version, keeping the new guard, and re-ran:

```
✖ a default write leaves the banked census byte-identical
✖ an explicit F2135_CENSUS_FILE write still lands where asked
✖ a differing third run recomputes the comparison across all three runs
ℹ tests 4 · pass 1 · fail 3
```

Then restored, and the guard returned **4/4**. ⓘ **The one test that passes on the OLD code is correct and is itself evidence:** *"the committed two-run artifact round-trips byte-identically"* is the backward-compatibility assertion, and old code round-trips two runs byte-identically too. A backward-compat test that went red under the old implementation would be testing the wrong thing.

## Merge classification

Base `a9e2f3459`. Main moved **zero** of the slice's three paths between the base and the merge — `git diff --name-status a9e2f3459 main -- <the three paths>` was empty — so all three are **LANE-TOUCHED ONLY** and the merge needed no 3-way judgment. The base is ~25 minutes old (it is s2152's own authoring commit), so no staleness path applies.

| File | Class | Note |
|---|---|---|
| `scripts/f2135-canyon-census-player.mjs` | LANE-TOUCHED | the cure: default output + comparison recompute (`+7/−6`) |
| `scripts/f2135-canyon-census-player.test.mjs` | NEW | the rooted guard, 112 lines |
| `package.json` | LANE-TOUCHED | the ONE script-rooting line — the new guard prepended to `test:node-guards` |

## Findings

**F-2153-2 (non-blocking, a scheduling hazard for the NEXT drain, not a defect in this slice).** This merge and the live `lane-b` run (`f2147-2-battery-manifest`) both edit **the same single line** of `package.json` — the `test:node-guards` roster — because both root a new guard into it. `f2152-1` prepended `scripts/f2135-canyon-census-player.test.mjs`; `f2147-2`'s TOUCH-ONLY names *"`package.json` (the ONE script-rooting line)"* and it will add its own. **Expect a textual conflict on that line when lane-b drains**, resolved by keeping BOTH entries — neither addition supersedes the other. This is the s1625 *"gate topology has one owner at a time"* condition arriving as an outcome rather than a warning, and it is why this fire authored no gate-topology corrective of its own.

**Adjacent battery deliberately not run, with its reason (not an omission).** `test:node-guards` is **not owed** here by F-1460-1, which keys the duty on `src/sim/`, `src/systems/` or `src/entities/` — none of which this diff touches (the diff is `scripts/**` + one `package.json` line). Running it anyway would have been actively harmful: `lane-b` is executing that exact battery live, and `f2147-2`'s entire deliverable **is an accurate battery tally**. Overlapping batteries on shared fixtures is the s1536 ~19-minute wedge, and a green bought by corrupting the measurement another lane exists to produce is worth less than not taking it. Same reasoning s2152 applied to `null-floor-anchors.test.mjs`, at wider scope.

**Player visibility (Mistake #10, answered rather than left blank).** *Nowhere.* The diff contains no `src/**` and no render surface; this is factory instrumentation. No e2e, screenshots or perf table are owed, and **no GZ-01 gazette item is owed** — the filter law requires a player-visible change.

**Scope honoured.** The runner left `run-1` as the default label deliberately and said so: the scratch path now contains the collision, and changing the label would alter legitimate explicit-output flows. Correct call — the master asked for the dangerous default to go, not for the label to move.
