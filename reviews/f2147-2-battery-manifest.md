# Review — f2147-2: a deterministic manifest for the guard battery

**Slice/branch/tip:** `lane/b` @ `e6b6c9f5c` (`runner(lane-b): f2147-2-battery-manifest.md`) · base `36b0fae09210b0f22a016858957e8973399cfee3` · merged to main at **`47fda66c1aa9a3f89beadcb64eb0c1493dc09481`** · drained s2153, 2026-08-22.

**Verdict: MERGED.** Gated on the merged tree in a detached worktree (§3.0b), including a **full `test:node-guards` run** — the first drain in a while able to take that arm honestly, because both lanes went idle and nothing else was holding the battery.

## What it does

`scripts/battery-manifest.mjs` turns a `test:node-guards` run into a **deterministic, sorted manifest** — every named test as `{file, name, status}`, plus the run's reported totals — and `--diff` reports **ADDED / REMOVED / STATUS-CHANGED** between two manifests. Its most useful output is the **RESIDUE** line: whether the change in `totals.tests` is fully explained by the change in *named* tests. That is the question the battery could not previously answer about itself. A **file-level collection failure moves the tally without naming a single test**, so it hides inside a number; the manifest surfaces it as `RESIDUE: UNACCOUNTED`. This is the instrument F-2151-1 wanted when it described a ~490-test tally *"whose deltas nobody can currently attribute."*

## Evidence

Gated in `gate-s2153b` on the merged tree. **The window was clear** — `tasks/running/` empty, both lanes finished — so unlike the sibling drain this fire took the full battery without risking the s1536 overlapping-fixture wedge.

| Gate | Result |
|---|---|
| `drain-block-check.mjs` | ✅ CLEAR, `status="queued"` |
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | rc=0, built in 1.17s |
| `scripts/battery-manifest.test.mjs` (the new guard) | **5 tests / 5 pass / 0 fail**, 615ms |
| `scripts/gate-caller-audit.mjs` | **PASS** — every gate-shaped subject reached or grandfathered |
| **`npm run test:node-guards` (full, ALONE)** | **rc=0 in 501.7s** |
| Merged tool run on that battery's own log | **499 tests / 494 pass / 0 fail / 5 skipped / 0 cancelled**; **499 named tests across 78 files** |

### The instrument certifies itself

Running the merged `battery-manifest.mjs --from-log` against the log of the very battery that gated it: **named tests (499) == `totals.tests` (499)** — i.e. **RESIDUE FULLY ACCOUNTED**, zero unattributed tally. And the arithmetic closes exactly against the recorded baseline:

```
490  s2147 baseline (recorded in the master)
  +4  scripts/f2135-canyon-census-player.test.mjs   (f2152-1, merged f2b870e6d this same fire)
  +5  scripts/battery-manifest.test.mjs             (this slice)
 ---
 499  measured on the merged tree
```

Both new guards are accounted for to the test, which is the strongest available evidence that the union merge below lost nothing.

⏱️ **Cost note, recorded rather than left to rot:** this run took **501.7s** against F-2099-1's measured **404.7s**. Two of the difference are structural (the roster grew 75 → 77 files, +9 tests) and the remainder is load — F-2099-1's own correction says the margin moves with machine load and the figure *"only ever drifts upward."* **Not** treated as a regression; recorded because that clause has now been re-taken three times and will be again.

## Merge classification

Base `36b0fae09`. Four of the five paths are **NEW** (free). `package.json` is **BOTH-MOVED** — and that was **predicted in writing 12 minutes earlier**, as F-2153-2 in `reviews/f2152-1-census-player-safe-default.md`.

| File | Class | Note |
|---|---|---|
| `scripts/battery-manifest.mjs` | NEW | the tool |
| `scripts/battery-manifest.test.mjs` | NEW | its rooted guard, 5 tests |
| `artifacts/battery-manifest/2026-08-21T20-04-56Z-node-guards.json` | NEW | banked baseline manifest |
| `artifacts/battery-manifest/2026-08-21T20-04-56Z-node-guards.log` | NEW | banked baseline log |
| `package.json` | **BOTH-MOVED** | the `test:node-guards` roster line — resolved as a **UNION** |

### How the conflict was resolved, and why it is provable rather than eyeballed

Both slices prepend exactly one guard to the **same single line**. Neither supersedes the other, so the resolution is the union — but "keep both" is easy to assert and easy to get subtly wrong on a line holding 75 filenames. It was therefore resolved **structurally, with refusals**, against the three merge stages:

1. `strip(ours[KEY], NEW_OURS) === base[KEY]` — main added **exactly** its one entry and nothing else.
2. `strip(theirs[KEY], NEW_THEIRS) === base[KEY]` — the lane added **exactly** its one entry and nothing else.
3. Every **other** key in `scripts` proven identical between the two sides (29 keys) — so the conflict is confined to this one line.
4. Post-condition: both entries present; roster count **75 → 77**.

Any violation throws and aborts rather than writing a guess.

✅ **Byte-identity control on the landing:** main's resolved `package.json` was compared to the `gate-s2153b` tree's — **byte-identical**. The tree that merged is the tree that was measured, which is the one thing a detached gate cannot otherwise prove.

## Findings

**F-2153-2 — CLOSED by this merge.** Filed at the f2152-1 drain predicting this exact conflict and its resolution ("keeping BOTH entries — neither addition supersedes the other"). It arrived as described and resolved as prescribed. Recorded here because a prediction that comes true and is then verified is worth more than the same fact discovered by surprise.

**Runner's Node 23 arm, fingerprinted not re-pinned.** The runner's first battery attempt on Node 23.11.1 gave `488 tests / 2 failures / 1 cancellation` and it correctly **re-ran alone on `.nvmrc` Node 26** rather than touching a pin — explicitly reporting *"No tests were repinned."* That matches F-2076-1's measured mechanism (v23 bounds at FILE granularity and never consults per-test budgets) and the identical shape seen in the sibling f2152-1 run this same fire. My own full battery on Node 26 was **rc=0**, which settles it.

**Player visibility (Mistake #10).** *Nowhere* — no `src/**`, no render surface. No e2e, screenshots or perf table owed, and **no GZ-01 item**: this is factory instrumentation, not a player-visible change.

**Retention.** The slice banks its baseline manifest **and** the raw log as tracked files under `artifacts/battery-manifest/` — the correct shape under the Retention Law, and the reason a future `--diff` has something real to compare against.
