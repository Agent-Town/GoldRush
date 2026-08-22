# Review — c4-assay-queue-index (the KV-cap cure: the assay poll costs ONE read, not the whole county)

**Slice:** `c4-assay-queue-index` · **Branch:** `lane/d` · **Tip:** `3d70625fd runner(lane-d): c4-assay-queue-index.md`
**Base:** `ced8c2c1e` · **Main at gate:** `b2a55db9f` · **Gated by:** s2190 fire, 2026-08-22
**Gate site:** detached worktree `gate-s2190/` (§3.0b — undecided content never entered main's tree or index; merge commit `b61e1982b`, worktree removed after gating)

## VERDICT: 🛑 HOLD — NOT MERGED. One blocking finding (F-2190-1), corrective `f2190-1-assay-index-reconcile` authored and dispatched to lane-d over this work.

> ✅ **SUPERSEDED — THIS SLICE SHIPPED. The HOLD above is preserved verbatim as the record of why it waited; it is no longer the state of the board.**
> Discharged by **`9db6f52bd`** (s2193 drain, 2026-08-22), which merged this slice together with the corrective it was held for. **Ancestry-verified:** `git merge-base --is-ancestor 9db6f52bd main` → true. The hold's own stated lift condition — *"it lifts when corrective f2190-1-assay-index-reconcile lands the sweptAt stamp + periodic reconcile on top of this lane"* — was satisfied, so this was a `gate-side` lift requiring no owner word (F-1383-1). F-2190-1 was reproduced **independently** at that drain against c4's own bare-array seed before the cure was accepted. See `reviews/f2190-1-assay-index-reconcile.md`.
> The sentence below about `lane/d` is likewise **spent**: the lane is fully absorbed (`main..lane/d` = 0) and is now safe to refresh.

`lane/d` is left **untouched and undrained on purpose**: its content is the corrective's base. Do NOT refresh or reset this lane.

## What it does

Replaces `onRequestAssayQueue`'s full sweep — one KV `get` per contract, 41 boards per poll — with a single `assay-queue-index` key holding pending locators. The index is maintained at the three write sites (taped submission, verdict, requeue/pending flip), the poll reads only the boards its locators name, re-verifies every row against the board (the board stays the source of truth), prunes stale locators, and falls back to a full sweep + rewrite when the index is missing or unparseable. The endpoint's response shape is unchanged.

The measured saving is real and large: **idle poll 41 reads → 1**. At the worker's 15 s default that is ~236k reads/day against a 100k/day free cap, down to ~5.8k.

## Evidence (all re-run by the drain on the merged tree — not inherited from the runner's report)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ built in 1.81s |
| `node scripts/test-standings.mjs` | ✅ **94** checks |
| `node scripts/test-stats.mjs` | ✅ **87** checks |
| `node scripts/test-accounts.mjs` | ✅ **43** checks |
| `node scripts/test-multiplayer.mjs` | ✅ **466** checks |
| Runner's own headline | stats 87 · standings 94 · accounts 43 · multiplayer 466 — **matches the drain's re-run exactly** |

No `src/**`, `e2e/**`, `src/sim/`, `src/systems/` or `src/entities/` paths are touched, so no playwright suite and no `test:node-guards` trigger applies (§3.1 path rule). The diff is two code files.

## Merge classification

| File | Class | Notes |
|---|---|---|
| `functions/api/standings.ts` | **LANE-TOUCHED** | main has not moved it since `ced8c2c1e` |
| `scripts/test-standings.mjs` | **LANE-TOUCHED** | main has not moved it since `ced8c2c1e` |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | conflict on row 1 — both sides rewrote the KV-cap row. Resolved `--ours` **for gating only**; nothing merged. A real drain must hand-resolve row 1. |

## Findings

### 🛑 F-2190-1 (BLOCKING) — the index's lost update has no clock: a raced locator is invisible until unrelated traffic happens to rebuild it

`syncAssayBoardIndex` (`functions/api/standings.ts:800` in the lane) is a non-atomic read-modify-write that replaces *that board's whole locator set* from a snapshot read earlier. Two concurrent taped submissions to **different** boards therefore lose one of each other's locators.

**REPRODUCED BY THE DRAIN, DETERMINISTICALLY** — barrier KV forcing both index reads to complete before either write, against the merged tree:

```
submissions: 200 200 | stored: true true
board A rows: 1 | board B rows: 1   <- BOTH boards persist
index after race: ["race-b"]
QUEUE served:     ["race-b"]
=> LOST (pending on its board, invisible to the assay worker): ["race-a"]
```

The lost row stays `assay:"pending"` on its own board forever while the assay worker never sees it — so the player's run is never verified and never shown a verdict. The index remains **valid**, so the specified missing/corrupt self-heal never fires. This is a genuine correctness regression against main, whose full sweep can never miss a pending row.

**Two facts the runner's report did not carry, both measured here, and both make the cure smaller than the runner proposed:**

1. **The race requires a pre-existing VALID index.** With the index absent or corrupt, `syncAssayBoardIndex` falls back to `rebuildAssayIndex` — a full sweep — which is self-correcting. The drain's first probe run, identical barrier but no seeded index, produced **no loss at all** (`index after race: ["race-a","race-b"]`). The exposure is the steady state, not cold start.
2. **The loss is repaired by the next state change on the same board.** A later submission or any verdict on that contract rewrites that board's locators from its live rows, and the lost locator returns:
   ```
   --- healing probe: a later submission to the LOST row's own board (the-claim) ---
   QUEUE now: ["race-b","race-a","later-write"]
   => lost locator race-a RECOVERED by a later same-board write: true
   ```
   So the damage is unbounded **only on a quiet contract**, where nothing ever triggers a rebuild.

**The defect is therefore precisely that there is no clock** — recovery exists but depends on unrelated traffic. Cure: bound the index's staleness with a `sweptAt` stamp and a periodic full reconcile (`f2190-1`). That keeps the idle poll at 1 read within the window and costs ~96 extra reads-sweeps and ~96 writes/day at a 15-minute interval.

### ⚖️ F-2190-2 (OWNER'S DESK, non-blocking) — the Durable Object route is a money decision, not an engineering one

The runner's recommendation was *"serialize index ownership in a Durable Object or ratify an eventually-reconciled design before merge."* **Durable Objects require the Workers Paid plan**, so that route is owner-gated and sits directly adjacent to the ruling already recorded in `docs/OWNER-DECISIONS.md §F` (upgrade to Workers Paid, $5/mo, in announcement week, because the **write** cap of 1,000/day is the sharper launch cliff). I have ratified the **eventually-reconciled** design instead, because it needs no new infrastructure, no money, and no plan change — and it is a generalisation of the self-heal the ratified master already specifies in its own scope item 3, not new scope. If Robin wants the DO at launch, it supersedes `f2190-1`'s clock rather than conflicting with it.

### ⓘ F-2190-3 (non-blocking, context) — this hazard class is pre-existing and accepted one key over

`functions/api/standings.ts:632` **on main today** already carries `// ponytail: KV read-modify-write; move this board to a Durable Object if concurrent submissions measurably collide.` The *board* key has the identical non-atomic read-modify-write, annotated and accepted, and a lost update there is strictly worse — it loses the score row itself, unrecoverably, where the index case only delays an assay and self-heals on the next same-board write. This is **not** an argument for merging c4 as-is; it is the reason the runner's "launch-blocking, not safely fixable" framing is an over-statement, and the reason the DO question is one decision about the whole endpoint rather than a veto on this slice.

## Why HOLD rather than merge-and-follow-up

The trade on offer is a **correctness** property (main's sweep can never miss a pending row) for a **cost** property that is already cured for free: the interim `ASSAY_POLL_MS=180000` is live on the droplet (~20k reads/day, ≤3-min latency), and the owner has already ruled on the launch-scale answer. There is no urgency that outweighs shipping a silent-loss path into the assay pipeline, and the corrective is small and already dispatched. Merging both together is the cheaper, safer landing.

## Runner conduct

The runner **reported the defect instead of fixing it out of scope, and did not commit** — a firewall success, and the right call. Its diagnosis was correct in substance; the drain's contribution is the two refinements above, which shrink the cure from "Durable Object + plan change" to "a stamp and a clock". Its gate numbers reproduced exactly.
