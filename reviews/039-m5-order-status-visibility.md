# Review — 039 m5-order-status-visibility (main slot)

**Verdict: GATE-PASS — merged to main by s82 fire (2026-07-06T12:5xZ).**

Fixes Robin's live-play bug (playtest 2026-07-06 F1): posted crafting orders vanished
from the bench because `CraftingQueue` built its lists from `import.meta.glob` of
`approved/` + `rejected/` only — `pending/` was written by the middleware but never
read back. 039 adds a live read path so pending orders stay visible across reloads.

## What changed (firewall-clean)
- `vite.config.ts` — additive GET `/__goldrush/crafting-queue/state`: lists pending/approved/rejected
  for the active profile from disk at request time, contract.v1-validated.
- `src/crafting/CraftingQueue.ts` — read path now fetches the live endpoint on open/post,
  falling back to the build-time globs when unavailable (prod build).
- `src/crafting/CraftingQueueStatic.ts` — NEW: extracted build-time glob path (the prod fallback).
- `src/crafting/CraftingQueueContract.ts` — read validation for the live state payload.
- `src/crafting/AssayBench.ts` — pending section renders orders awaiting verdict as distinct,
  non-selectable rows in ledger voice; verdicts refresh on re-open without a dev restart.
- `src/styles.css` — pending-row styling.
- `e2e/m5-04-offline-queue.spec.ts` — extended coverage.

Diff scope: 6 tracked files + 1 new, 376 insertions / 86 deletions. NO out-of-firewall
changes (no Game.ts, no order-posting-format, no contract-rule, no sim, no 036/037 touch).
Verified via `git diff --stat HEAD` — only the firewall set.

## Evidence
- `npx tsc --noEmit` — clean.
- `npm run build` — clean (CraftingQueueStatic bundled; only pre-existing chunk-size warning).
- `e2e/m5-04-offline-queue.spec.ts` — **20/20 both projects**, incl. the two tests that
  directly validate the bug fix:
  - `posted orders stay visible across reloads and refresh to verdicts on reopen`
  - `stale open refresh cannot hide a newly posted pending order`
  - plus `verdicted order ids cannot be recreated as pending` (036 pending-clean law holds).
- Adjacent suites green:
  - `m2-01-build-menu` incl draw-call<200 stress — 8/8 both projects
  - `lane-c-activations-assay-office` — 6/6 both projects
  - `task-025-bandits-dont-swim` — green both projects
  - `m1-01-claim-jumpers-death` — **8/8 both projects** (death-flow :29 + fps/budget :95 both
    GREEN this fire — the s80 env-flakiness was host-load from the 2 live lanes, which have
    since done-moved; no env exception needed).
- Zero console/page errors desktop 1280×800 + mobile 390×844 — VERIFIED via the spec's own
  `consoleErrors`/`pageErrors` buckets asserted empty at 10+ points across both projects.

## Notes
- Copy honesty preserved: approved items still say collection/application opens later
  (033 scope boundary stands — no item effects wired here).
- Robin's real pending order (the Spark Rig multi-target request) is untouched by the tests
  (036 harness law: tests clean their own posts only).
