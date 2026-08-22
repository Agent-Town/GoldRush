# Review — f2190-1-assay-index-reconcile (the assay index gets a clock; c4's KV-cap cure ships with it)

**Slice:** `f2190-1-assay-index-reconcile` (+ its held predecessor `c4-assay-queue-index`) · **Branch:** `lane/d`
**Tip:** `5a8b654e5 runner(lane-d): f2190-1-assay-index-reconcile.md` · **Predecessor:** `3d70625fd runner(lane-d): c4-assay-queue-index.md`
**Base:** `ced8c2c1e` · **Main at gate:** `8d9852c3c` · **Merged at:** `9db6f52bd` · **Gated by:** s2193 fire, 2026-08-22
**Gate site:** detached worktree `gate-s2193/` (§3.0b — undecided content never entered main's working tree or index; gated commit `35fcfea5b`, worktree removed after merge)

## VERDICT: ✅ MERGED. Both commits land together; the gate-side hold on c4 is lifted by the condition its own `blockedReason` named.

`c4-assay-queue-index` was `status:"blocked"`, `blockClass:"gate-side"` — a fire-recorded readiness hold, not an owner fork. Its stated lift condition, verbatim: *"it lifts when corrective f2190-1-assay-index-reconcile lands the sweptAt stamp + periodic reconcile on top of this lane."* That corrective is the second commit on this lane. §3.0 re-run by me at the gate, not inherited: `c4` **rc=1 gate-side** with the condition printed, `f2190-1` **✅ CLEAR**. Per F-1383-1 the merge is the lawful lift and no owner word is required; per F-1384-1 the code commit is immediately followed by the leaf commit, because a commit cannot contain its own hash.

## What it does

c4 replaced `onRequestAssayQueue`'s full sweep — one KV `get` per contract, 41 boards per poll — with a single `assay-queue-index` key holding pending locators. **Idle poll 41 reads → 1**, which is what brings the worker back inside the free tier.

f2190-1 adds the clock c4 lacked. The index payload becomes `{version:1, sweptAt, locators}`; `parseAssayIndex` accepts only that shape, so c4's legacy bare arrays return `null` and migrate for free through the rebuild path that already existed. Once `Date.now() - sweptAt` exceeds `ASSAY_INDEX_MAX_AGE_MS` (default 900 000, overridable from `context.env`), the next poll runs the full reconcile, rewrites the index with a fresh stamp, and serves from it. Crucially `sweptAt` is advanced by **full rebuilds only** — incremental board syncs carry it through untouched, so a busy contract cannot push the deadline forward forever and starve a quiet one.

## Evidence (all re-run by the drain on the merged tree — not inherited from the runner's report)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean, 4.4s |
| `npm run build` | ✅ built, 14.6s (asset-diet green) |
| `node scripts/test-standings.mjs` | ✅ **111** checks (main: 94 — 17 new) |
| `node scripts/test-stats.mjs` | ✅ **87** — unmodified-green |
| `node scripts/test-accounts.mjs` | ✅ **43** — unmodified-green |
| `node scripts/test-multiplayer.mjs` | ✅ **466** — unmodified-green |
| Runner's own headline | standings 111 · stats 87 · accounts 43 · multiplayer 466 — **matches the drain's re-run exactly** |

**Path triggers measured, not assumed:** the diff is `functions/api/standings.ts`, `scripts/test-standings.mjs`, `tasks/BACKLOG.md`. Zero `src/**` or `e2e/**` paths, so no playwright suite applies, and zero `src/{sim,systems,entities}/` paths, so the F-1460-1 `test:node-guards` trigger does not fire.

### The cure is proven by manufacturing the defect, not by a green (s1299/s1300 standard)

A passing test never executes its violation path, so the suite's green is not by itself evidence about the bug. Both controls were run by the drain.

**Negative control — c4's code, c4's own bare-array seed.** My first attempt at this control was *confounded and is worth recording*: swapping in c4's `standings.ts` while leaving the new harness's `{version:1,...}` seed in place made the race test fail with `actual: 2, expected: 1` — c4 lost **nothing**, because it cannot parse the v1 envelope and therefore fell back to the self-healing full sweep. That is fact (1) of `reviews/c4-assay-queue-index.md` reappearing as a measurement artifact: *the race requires a pre-existing VALID index.* Re-seeded with c4's own shape:

```
poll 1 serves: ["race-b"]
poll 2 serves: ["race-b"]
poll 3 serves: ["race-b"]
LOST ROW STILL PENDING ON ITS BOARD: true
RESULT: served=race-b lost=race-a
```

Three consecutive polls and `race-a` never returns — pending on its board, invisible to the assay worker, forever. This reproduces s2190's finding independently and matches the runner's reported control (`served=race-b, lost=race-a, lost-row-pending=true`) to the character.

**Positive control — the merged tree, same race, same polls.**

| Index state | Serves | Ops |
|---|---|---|
| FRESH (inside the window) | `race-b` only | 2r / 0w — fast path, no sweep |
| STALE (`sweptAt` aged out) | **`race-a` + `race-b`** | 43r / 1w — clock fires, locator restored with **no other traffic** |
| next poll | both | 3r / 0w — stamp refreshed, back on the fast path |

That is the eventually-reconciled design s2190 ratified: the single key still cannot serialize concurrent writes, so the race still drops a locator — but the staleness is now **bounded by a clock** instead of depending on luck.

### Budget, re-derived by the drain rather than accepted

| Cadence | Polls/day | Sweeps/day | Reads/day | Writes/day |
|---|---|---|---|---|
| 15 s (worker default) | 5 760 | 94 | **9 708** | 94 |
| 180 s (live interim) | 480 | 80 | **3 840** | 80 |
| main today (full sweep, 15 s) | 5 760 | — | **236 160** | — |

Free caps are 100 000 reads/day and 1 000 writes/day. The arithmetic reproduces the runner's figures exactly ((5760−94)×1 + 94×43 = 9 708). Against main that is a **24× read reduction**, from 2.36× over the cap to 9.7% of it. The interim `ASSAY_POLL_MS=180000` droplet setting can now be returned to seconds whenever the owner wants verification latency back.

## Merge classification

| File | Class | Notes |
|---|---|---|
| `functions/api/standings.ts` | **LANE-TOUCHED** | main has not moved it since `ced8c2c1e`; merged clean |
| `scripts/test-standings.mjs` | **LANE-TOUCHED** | main has not moved it since `ced8c2c1e`; merged clean |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | conflict on row 1, hand-resolved — see below |

**The BACKLOG resolution, audited per-line (F-2192-1).** Both sides had rewritten the KV-cap row. Kept: main's five drain-authored rows (`F-2190-2` desk row, the `F-2190-1` HOLD row, the `F-2189-1` row, `F-2189-5`, and main's KV-cap row) plus the lane's genuinely-new `↳ F-2190-1 corrective implemented` ladder row. Dropped: the lane's version of the KV-cap row, whose *"not safely fixable inside the single-key contract; serialize index ownership in a Durable Object … before merge"* framing s2190 explicitly refuted — the finding was right, its severity was not, and main's row is the successor that records both. Audit output: **every emitted row byte-identical to an input row, 0 fused, 0 invented, 1 deliberate supersede, 0 markers remaining.** The shipped tree was then proven equal to the gated tree (`git diff 35fcfea5b HEAD` → empty).

## Findings

### ⓘ F-2193-1 (non-blocking, owner-facing measurement) — the reconcile spends 9.4% of the free WRITE cap, and the write cap is the cliff the owner already named

The maintenance sweep costs **94 writes/day** at the 15 s cadence against a **1 000/day** free write cap. That is small, it is exactly what the master specified (~96/day estimated, 94 measured), and it buys the 24× read reduction — so it is not a blocker and not a reason to change the design. It is recorded because the owner's ruling in `docs/OWNER-DECISIONS.md §F` rests on the write cap being *the sharper launch cliff* ("every submission + verdict is a write; a few hundred players hit it"), and the reconcile now consumes a tenth of that ceiling before a single player writes anything. **This is a number for pricing the announcement-week decision beside F-2190-2, not a defect** — and it strengthens rather than weakens the Durable Object case, since a DO would remove both this sweep and the race it exists to bound.

### ⓘ F-2193-2 (non-blocking, method) — a negative control that swaps code can silently swap the contract with it

Recorded above in full: substituting c4's `standings.ts` under the new harness changed the *index shape contract* as well as the code, so c4 took its self-heal path and the control reported "no defect" — the exact opposite of the truth. The confound was visible only because the failure message was read (`actual: 2, expected: 1` is the wrong direction for "c4 is buggy") rather than the exit code. **Reusable: when a negative control swaps one side of a serialized contract, check that the fixture is still speaking the old side's language — an rc≠0 that means "the control is broken" is indistinguishable from one that means "the defect is real" if you only read the status.**

## Standing-order duties discharged

- **GZ-01:** player-visible? The assay verdict pipeline is player-facing — a run that was raced away is never verified and never shown a verdict, so this is a real fix to something a player experiences. Item appended to `marketing/outbox/gazette-queue.md` for `9db6f52bd`.
- **Goal Registration Law:** `c4-assay-queue-index` flipped `blocked` → `merged`, `f2190-1-assay-index-reconcile` flipped `queued` → `merged`, both carrying `9db6f52bd`, in the bookkeeping commit immediately following the merge.
