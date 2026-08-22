# Task f2190-1: bound the assay index's staleness — a lost locator must become visible again on a clock, not on luck (lane-d, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; `reviews/c4-assay-queue-index.md` (the drain review that HELD your predecessor and reproduced the defect you are curing — read the evidence table before you write a line); `functions/api/standings.ts` in THIS LANE (your predecessor c4's work: `syncAssayBoardIndex` at ~:800, `rebuildAssayIndex` at ~:785, the poll's fast path in `onRequestAssayQueue` at ~:209); `scripts/test-standings.mjs` (the harness you extend, with its op-counting KV stub); `docs/ops/agenttown-server.md` §"KV budget".

LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: functions/api/standings.ts
EXPECTED-HOLDS: scripts/test-standings.mjs
EXPECTED-HOLDS: tasks/BACKLOG.md

**SEQUENCING LAW — YOUR BASE IS THE LANE, NOT MAIN. DO NOT RESET.** Your predecessor `c4-assay-queue-index` is **UNDRAINED AND HELD ON PURPOSE** (verdict HOLD, `reviews/c4-assay-queue-index.md`) — its content exists ONLY on `lane/d` and resetting the lane would destroy it (Mistake #2). Verify you are standing on it before touching anything:
`grep -c "one KV key cannot serialize concurrent state changes" functions/api/standings.ts` → **must print 1**. It prints **0 on main**, so 0 means the lane was refreshed out from under this master — **STOP and report "lane/d no longer holds c4; f2190-1 needs a re-land base"**. Do NOT re-implement c4 from scratch.

Pre-flight (LANE-SAFETY, runner-auto-commit aware — BUILD-ON-PREDECESSOR variant): the lane branch being ahead is **EXPECTED AND REQUIRED** here: the single ahead commit `3d70625fd runner(lane-d): c4-assay-queue-index.md` is your base. **DO NOT `git checkout -B lane/d main`, DO NOT `git reset --hard`, DO NOT `git clean -fd` over tracked files** — the normal SAFE-DUPE branch of this template is SUSPENDED for this master, because the held content is not a dupe, it is your foundation. STOP-and-report ONLY if the grep above prints 0, or if the worktree holds uncommitted edits to `functions/**`, `scripts/**`, `src/**`, `e2e/**`, `tasks/**`, `specs/**` or `reviews/*.md` that you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>`) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (drain review `reviews/c4-assay-queue-index.md`, F-2190-1, s2190 2026-08-22 — reproduced by the drain, not inherited from the runner's report)
c4 replaced a 41-read full sweep with a single `assay-queue-index` key. It works, and its gates are green (independently re-run at the drain: tsc, build, stats 87, standings 94, accounts 43, multiplayer 466). But the index is maintained by a **non-atomic read-modify-write**, and `syncAssayBoardIndex` replaces *that board's whole locator set* from a snapshot it read earlier — so two concurrent taped submissions to **different** boards lose one of each other's locators.

**REPRODUCED AT THE DRAIN, deterministically** (barrier KV: both index reads forced to complete before either write). Two simultaneous cross-board submissions → `submissions: 200 200 | stored: true true`, **both boards persist one row each**, and:
```
index after race: ["race-b"]
QUEUE served:     ["race-b"]
=> LOST (pending on its board, invisible to the assay worker): ["race-a"]
```
The lost row is `assay:"pending"` on its own board forever, but the assay worker never sees it, so it is **never verified and never shown a verdict**.

**TWO FACTS THE RUNNER'S OWN REPORT DID NOT CARRY, both measured at the drain, and together they are the whole reason this is a small fix rather than a Durable Object:**
1. **The race needs a pre-existing VALID index.** With the index absent or corrupt, `syncAssayBoardIndex` falls back to `rebuildAssayIndex` — a full sweep — which is self-correcting. The drain's first probe run, same barrier but no seeded index, produced **no loss at all**. The exposure is the steady state, not cold start.
2. **The loss is repaired by the next state change on the SAME board** — a later submission or any verdict on that contract rewrites that board's locators from its live rows, and the lost locator returns (`=> lost locator race-a RECOVERED by a later same-board write: true`). So the damage is **not** unbounded in general; it is unbounded only on a **quiet contract**, where the index stays valid and nothing ever triggers a rebuild.

That is the entire defect: **there is no clock.** Recovery is possible but depends on unrelated traffic. This task adds the clock. It does NOT add a Durable Object — DOs require the Workers Paid plan, which is an owner/money decision already parked on the desk (F-2190-2).

## Scope
1. **Give the index an envelope with a sweep stamp.** Replace the bare `AssayLocator[]` payload with `{ version: 1, sweptAt: number, locators: AssayLocator[] }`. `parseAssayIndex` accepts ONLY this shape and validates `sweptAt` as an integer in range exactly as it already validates `submittedAt`; anything else — including the **legacy bare array** — returns `null`. Returning `null` already routes to `rebuildAssayIndex`, so the migration from c4's shape is automatic and costs exactly one rebuild. Do not write a bespoke migration path.
2. **Reconcile on a clock in `onRequestAssayQueue`.** After a successful parse, if `Date.now() - sweptAt > ASSAY_INDEX_MAX_AGE_MS` treat the index as stale: run the same full `rebuildAssayIndex` the missing/corrupt path already runs, write it back with a fresh `sweptAt`, and serve from it. Default `ASSAY_INDEX_MAX_AGE_MS = 900_000` (15 min), overridable from `context.env` when present and parseable as a positive integer, else the default. Within the window the fast path is unchanged.
3. **`sweptAt` is set by a FULL REBUILD ONLY — incremental writes must preserve it verbatim.** This is the subtle half and it needs its own test: if `syncAssayBoardIndex` refreshed `sweptAt`, a busy contract would push the reconcile deadline forward on every submission and **a quiet contract's lost locator would starve forever** — exactly the bug this task exists to close, re-created by the fix. `syncAssayBoardIndex` must carry the existing `sweptAt` through untouched (and, on its own `null`-parse fallback rebuild, stamp a fresh one, since that IS a full rebuild).
4. **Never let reconciliation lose a locator it was meant to restore.** The rebuild is authoritative over the boards it scans; assert that a reconcile which restores a raced locator does not simultaneously drop a locator written between the read and the write (add the row, re-run, assert both present).
5. **Tests (extend `scripts/test-standings.mjs` and its op-counting KV stub).** No clock injection — control the age by seeding `sweptAt` directly (`0` = infinitely stale, `Date.now()` = fresh); do NOT add a time seam to production code for the tests' benefit.
   a. **The race itself**: barrier KV (both index reads complete before either write) + a pre-seeded VALID index → assert exactly one locator survives and the other's row is pending-but-unserved. This test must FAIL against c4's code and pass against yours — say so in the report.
   b. **Reconcile restores it**: with the raced index seeded `sweptAt: 0`, one poll restores the lost locator and serves both.
   c. **Fresh index does not sweep**: `sweptAt: Date.now()` → idle poll is still exactly **1 read, 0 writes**.
   d. **Incremental writes do not advance the stamp**: seed a stale-ish `sweptAt`, perform a submission on a busy board, assert `sweptAt` is unchanged and the next poll still reconciles.
   e. **Legacy bare array migrates**: seed c4's bare-array shape → first poll rebuilds, rewrites in the new shape, serves the correct queue.
   f. Keep c4's existing assertions green — idle 1 read, missing/corrupt self-heal, stale-locator pruning, response shape byte-compatible.
6. **Report the budget honestly, both cadences.** Measure and state reads AND writes per day at the 15 s cadence and at the live 180 s interim cadence, with the sweep included. The write cap (1,000/day free) is the sharper cliff per the owner's ruling, and a 15-min sweep adds ~96 writes/day on its own — if your measured figure differs, the measurement wins; report it rather than repeating this estimate.
7. **Update the `ponytail:` comment at `functions/api/standings.ts` (~:801)** so it states what is now true: the single key still cannot serialize concurrent writes, the staleness is now bounded by `ASSAY_INDEX_MAX_AGE_MS`, and a Durable Object remains the durable cure at launch traffic. Do not delete the marker.

## Firewall
Touch ONLY: `functions/api/standings.ts`, `scripts/test-standings.mjs`, and your `tasks/BACKLOG.md` ladder line.
NO changes to: `scripts/assay-worker.mjs`; board row shapes; verdict semantics; ranked-board behaviour; the `/api/standings/assay-queue` response shape (it must stay byte-compatible); any `src/**`; any `e2e/**`; **any Durable Object binding, `wrangler.toml`, or `package.json`** — the DO route is owner-gated on the Workers Paid plan (F-2190-2) and is explicitly NOT this task; **and do NOT reset or rebase this lane** (see the sequencing law above).

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green (note: `functions/` is outside tsc's include — the TESTS are the gate, run them). `node scripts/test-standings.mjs` green including all six new assertions. `node scripts/test-stats.mjs`, `node scripts/test-accounts.mjs`, `node scripts/test-multiplayer.mjs` unmodified-green (the F-1229-1 `functions/` battery) — report their counts; the drain measured **87 / 43 / 466** and standings **94** before your change, so a drop is a regression to explain, not a number to overwrite.
End: READY-FOR-GATES + report: (1) the race test's result against c4's code vs yours, (2) measured reads+writes/day at 15 s and 180 s, (3) how `sweptAt` is preserved across incremental writes and the test that proves it, (4) the legacy-shape migration path you observed, (5) anything in c4 you had to adapt and why.

## No-op / honesty guard
If you find the reconcile already present, or conclude the race is not reproducible in the harness, **STOP and write WHY into your report** — quote the code or the failing assertion. A silent no-op wastes a queue slot and a gate. Do NOT "fix" this by widening the self-heal to run on every poll: that restores the 41-read sweep this whole ladder exists to remove, and it would pass the tests while defeating the purpose — if you believe that is the only correct answer, STOP and report instead.
