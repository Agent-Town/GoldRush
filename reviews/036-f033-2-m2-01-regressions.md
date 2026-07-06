# Review — Task 036: F-033-2 m2-01 build-menu regressions + F-033-3 m5-04 leak

**Slice:** 036 (MAIN slot corrective for F-033-2 / F-033-3)
**Gated by:** s62 fire (2026-07-06)
**Codex run:** tasks/runs/20260706-122829-main-036-f033-2-m2-01-regressions.md.log (READY-FOR-GATES)
**Verdict:** ✅ **PASS — merged** (with one orchestrator corrective applied on top; see F-033-2-race below)

## What landed
Codex touched 5 files: `src/crafting/AssayBench.ts`, `src/game/Game.ts`, `src/main.ts`,
`src/entities/pools.ts`, `e2e/m5-04-offline-queue.spec.ts`. Root causes:

- **F-033-2a/c** — the Assay Bench mounted **open** on every `?debug` load, intercepting build-menu
  clicks and swallowing Escape → build menu "never closed" (beacon-cost poll timeout) and the 390px
  bench overlaid the HUD. Fix: bench now mounts hidden and only opens for the m5 harness URLs
  (`?profile`/`?queueNow`) or on Enter near an Assay Office. New `Game.confirmAction()` routes Enter
  to build-confirm when in build mode, else opens the bench if an Assay Office is in range — this
  **restores** the office confirm branch (gate-rider s61 concern: no committed code removed outside firewall).
- **F-033-2b** — claim-jumper batch-fade overlays drew every live enemy sprite twice; stress packs
  blew the draw budget. Fix (`pools.ts`): fade overlays are skipped once `active > 64` enemies until
  sprites are instanced.
- **F-033-3** — m5 harness leaked `order_local_prospector_*` pending orders every run. Fix: per-test
  `afterEach` cleanup of posted orders.

## Gate evidence (native, playwright.w1.config.ts — self-booting vite:5231, desktop 1280×800 + mobile 390×844)
- `npx tsc --noEmit` — clean ✓
- `npm run build` — green, 425ms ✓
- `e2e/m2-01-build-menu.spec.ts` — **12/12 green both projects** ✓ (beacon cost curve, 390px menu
  clear-of-HUD, and **stress draw calls < 200** all pass — draw-budget-200 law held; codex measured 133)
- `e2e/m5-04-offline-queue.spec.ts` — **10/10 green both projects, ×3+ stable runs, pending/ empty after** ✓
- `e2e/task-025-bandits-dont-swim.spec.ts` — 10/10 (isolated, ×2) ✓ — *see env exception below*
- `e2e/m1-01-claim-jumpers-death.spec.ts` — 8/8 green ✓
- `e2e/lane-c-activations-assay-office.spec.ts` — 6/6 green ✓
- Boot probe — plain `?debug` boot on desktop + 390px: zero console/page errors; Assay Bench NOT
  mounted-open; Build menu reachable and clear of HUD. Shots: `reviews/shots-036/{boot,build-menu}-{desktop,mobile-}chrome.png`.

## Findings

### F-033-2-race (orchestrator corrective — APPLIED before merge)
Codex's `afterEach` swept **all** `order_e2e_*` files. Under the w1 gate config the desktop+mobile
projects run in parallel against a shared `assets/crafting-queue/pending/` dir, so the **mobile
worker's cleanup deleted the desktop worker's in-flight order file mid-test** → `ENOENT` on the
"post the order writes the exact pending request JSON" read (reproduced deterministically: parallel
red, `--workers=1` green). This would have re-introduced an m2-01-style intermittent red.

**Fix (test-harness only, <20 lines, s62):** scoped `cleanPostedOrders` to (a) `local_prospector`
orders broadly — race-free because no test reads those back — plus (b) **only the current project's
own** `order_e2e_<project>_*` namespace, which is the sole file a test reads back. Re-verified:
parallel 10/10 ×3 stable, and `pending/` genuinely empty after runs (the `local_prospector` leak,
which is REAL and clock-timestamped, is now swept — codex's original `e2e`-only scope would have
left it). `normalizeQueueProfile` imported for exact-prefix scoping.

### F-036-note-1 (visual, non-blocking, accepted)
`pools.ts` disables spawn/death **fade overlays** when `active > 64` concurrent enemies. Under
extreme stress packs, enemy fade-in/out is visually suppressed until sprites are instanced. Trade
accepted to hold the 200 draw-call law; flagged for the eventual sprite-instancing pass.

### F-036-env-1 (environment flake, NOT a merge blocker)
In one **combined** 24-test run (task-025 + m1-01 + lane-c-activations, 2 workers) the water-physics
timing test `task-025 …:122 hero still wades … wet powder` flaked red on both projects. Isolated,
task-025 is 10/10 green **twice**. Cause is frame-timing sensitivity of the wading test under heavier
parallel load — unrelated to 036 (which touches no water/hero/terrain code). Recommend running
task-025 in its own shard, or de-flaking the wading timing, in a future corrective.

## Firewall check ✓
m2-01 spec assertions untouched (the tests are the contract). No sim/terrain/Balance changes.
pools.ts edit is the identified draw-call source (rendering, not sim). Only additive m5-04 harness plumbing.
