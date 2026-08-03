# f1440-2 — re-land the E1 perf gate without a frozen foreign baseline

**Slice:** `f1440-2-perf-gate-baseline` · **Branch:** `lane/perf` · **Tip:** `284c6e3d` · **Base:** `8f3b0474`
**Merge:** `e21fa3d38760403d0161ea47deeb300554837429` (main, `--no-ff`, `ort` clean)
**Drained:** s1451, 2026-08-04 · fire shell, `--workers=1`, scratch port 5241, detached gate worktree

## VERDICT: MERGED

The cure works, and — more to the point — I proved the cure is *load-bearing* rather than
coincidental. One finding filed (F-1451-1, non-blocking, corrective queued), one correction to the
runner's own scope-5 answer (F-1451-2).

## What it does

The E1 perf spec merged its optimization as `d60adf88` at the s1440 drain with **the spec itself
withheld**. F-1440-2 was the reason: the spec never measured its `before` arm in-run. It read it from
a committed artifact (`census-before-<project>.json`) while `STAGE` defaulted to `'after'`, so every
ordinary run on every machine compared its own wall-clock, draw calls and pixels against numbers one
lane shell recorded on an M4 Max on 2026-08-03. Landing it unchanged would have put a permanently-red
suite into the shared default battery.

This slice re-lands it from `452eb747` with the cross-run comparison behind a single explicit opt-in,
`E1_PERF_COMPARE_BASELINE=1`. The diff against the withheld original is **five lines**: one `const`,
a three-line header comment explaining *why* the baseline is machine-specific, and the same
`COMPARE_BASELINE &&` conjunct added to three existing `STAGE !== 'before'` guards.

Everything the master required to survive did: the 200 draw-call budget, the absolute
`frameBudgetMs * collapseRatio` shed-line p95 cap, the census publication, and the zero-console/page
assertions on both the census page and the snapshot page.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **957 ms** |
| default path, both projects, `--workers=1` | **RC=0, 2/2 passed**, 121.0 s |
| opt-in path, same tree/host/shell | **RC=1, 2/2 failed** — see control below |
| `npm run test:node-guards` | **RC=0** |
| `npm run test:ledger-guards` | **RC=0** |
| adjacent suites | **none** — `grep -rl e1-perf-pass e2e scripts src` returns only the spec itself |
| console/page errors | zero, asserted by the spec across 5 contracts × 2 projects, both pages |
| firewall | held — `git diff --name-only 8f3b0474 lane/perf` is exactly `e2e/e1-perf-pass.spec.ts` + `artifacts/f1440-2/**`. No `src/**`, no `playwright.config.ts`, no baseline artifact regenerated. |

**Merge classification:** pure **LANE-TOUCHED**. `e2e/e1-perf-pass.spec.ts` is absent from main
(verified by `ls`, not grep — it is a re-land, not an edit); `artifacts/f1440-2/**` is new. Main moved
none of the 26 paths. 8200 insertions, **0 deletions**, no conflicts.

**Custody (§3.0b):** every gate above ran in a detached worktree (`gate-s1451`) with its own vite on
port 5241, so undecided content never entered main's working tree. 5188 was probed free first but
deliberately not used — the gate must serve the *merged* tree, not main's.

## The control that decides this merge

A green default path is not by itself evidence: the spec might pass because the flag correctly gates
the comparison, **or** because the comparison would have passed anyway on this host — and those two
worlds look identical from a green. A passing test never executes its failing branch.

So I flipped exactly one variable on the same tree, same host, same shell, same `--workers=1`, both
arms launched through one committed script (`artifacts/f1440-2/gate-battery.mjs`) so a flag could not
drift between them:

- **default** → `RC=0`, 2/2 passed
- **opt-in** → `RC=1`, 2/2 failed, on `e1-dry-gulch draw calls`, received **123**, expected `<= 122`

That is F-1440-2's exact shape — an off-by-one against a frozen number — still fully alive behind the
flag. The defect is therefore **quarantined, not accidentally cured**, and the default path's
machine-independence is structural rather than lucky.

It is structural in the strict sense too: the spec has exactly **three** `readFile` call sites for
baseline data (`:141`, `:149`, `:242`) and **all three** sit inside `COMPARE_BASELINE &&`. With the
flag off the default path cannot read a committed baseline, on any machine.

**On the "different machine" caveat.** The runner honestly flagged that its host is the same M4 Max
class as the baseline and said a different-machine run was still owed. It is still owed in the literal
sense, but it is no longer load-bearing: the fire shell is a materially *slower* regime than the lane
shell (F-1269-1), and it is precisely where s1440 measured the original spec red. The default arm is
green there and the opt-in arm is red there, in the same minute. Machine-independence is now proven by
the code path, not by a hardware sample.

## Findings

### 🔺 F-1451-1 — an ordinary battery run overwrites 26 retained tracked artifacts (NON-BLOCKING, corrective queued)

`ARTIFACT_DIR` defaults to `artifacts/e1-perf-pass` and `STAGE` defaults to `'after'`. The spec is not
in `claimedByAnotherConfig` (correctly — the master forbade hiding it), so it now runs in the shared
default battery, where it **publishes over the committed `after/` evidence**.

Measured, not inferred: one project alone, run exactly as the battery runs it, left **13 modified
tracked files** under `artifacts/e1-perf-pass/`; both projects leave ~26.

Why it matters beyond tidiness: any fire that runs a full battery on main afterwards finds main
**dirty**, which contaminates the next drain's clean-main check and is exactly the s1294 / F-1295-1
hazard — 26 modified binaries sitting in the tree waiting for someone's broad `git add`. It also
quietly rewrites the `after/` arm that the *original* perf pass's proof rests on.

It is **not** a RETENTION LAW violation (these are tracked files; git keeps every version), and it is
**not** the runner's error — the master explicitly ordered the census publication kept "exactly as
written", so curing it here would have been a firewall violation. The runner flagged it and correctly
declined. Corrective `f1451-1-perf-census-publishes-over-retained-evidence.md` queued to lane-d.

### 🟡 F-1451-2 — the drift is wider than the runner's scope-5 answer says (correction, no action)

Scope 5 asked whether `e1-dry-gulch`'s desktop draw count is 136 or 137. The runner answered 137,
reproducibly (137/137/137), and my census agrees — **137 desktop**, against a committed baseline of
136.

But that answer is incomplete, and the incompleteness is an artifact of the instrument: the opt-in
loop asserts contract-by-contract and stops at the first failure, so `e1-dry-gulch` masks everything
after it. Reading the full census instead of the failure shows **`e1-twin-banks` is also +1 over
baseline, on both projects** (desktop 127 vs 126, mobile 120 vs 119) — never reported because the run
died before reaching it.

Two contracts, both projects, all +1, and both of them are exactly the maps that have received
terrain/water work since the baseline was recorded (`f1441-2` crossings, gt-05 water depth,
tb-water-look — `65e3aaec` landed hours ago). That is not noise; it is legitimate feature work moving
a number that was frozen. Which is the strongest possible argument *for* this slice: an equality gate
against a frozen draw count would have gone red for every one of those merges.

For the record, all p95 figures sit far under the 33.40 ms shed line — worst case 19.9 ms — and moved
in **both** directions versus baseline (desktop `the-claim` 15.5 vs 18.5 = faster; desktop
`e1-dry-gulch` 18.1 vs 15.7 = slower), which is the wall-clock noise F-1440-2 named.

## Instruments committed

`artifacts/f1440-2/gate-battery.mjs` (both arms, one code path) and
`artifacts/f1440-2/gate-s1451/census-gate-{desktop,mobile}-chrome.json`. Every number above is
re-derivable; this is the tooling, not a summary of it.
