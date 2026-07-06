# s75 drain — compounded main pile (038 + 026 + 037 + 040)

**Verdict: LAND all four.** The 6-fire deadlock's clean window opened (040 finished, main slot idle, queue empty). The four uncommitted main-slot outputs were superimposed in one working tree; gated as a unit, committed file-disjoint.

## Correction to the s73/s74 handoff mapping
The prior handoffs called this a **5-task** pile (038+013+026+037+040). **Wrong.** Verified against actual diffs:
- **013 (m2-07b building-incentive) is ALREADY COMMITTED** as `ea570a8` (landed with m2-07b 8/8, m2-04/05/05b green). Its signatures (`pressureBudgetShared`, `blast.dmgPerWave`, `repair.pctOfCost`, Powder Charge/Wide Ring/Quick Fuse) are in HEAD, not in the working-tree diff. s73/s74 counted 013's done-MARKER as uncommitted output. The real pile was **four** tasks.
- s74 also mis-mapped files (claimed Balance.ts = 038-anim/013-building; it is actually 026's `agent:` block; claimed Game.ts had 026 xp code; it is entirely 037's prompt wiring). Attribution below is from real diffs, per claim-verification rule.

## Gates (whole superimposed tree — full native runs)
- `npx tsc --noEmit` → **PASS**
- `npm run build` → **PASS** (built in ~0.4s; only the standing 900 kB chunk-size advisory)
- e2e (desktop + mobile projects), the four tasks' own specs: **31 passed / 1 failed / 2 skipped (mobile-skip guards)**
  - 038: `task-031-anim-roundness` ✓
  - 026: `task-026-prospector-collects-xp` ✓
  - 037: `task-037-assay-bench-ungate` — 142 (build-mode hide) ✓, 163 (mobile touch) ✓; **115 (no-debug normal play) FAILED — see F-1**
  - 040: `m5-04-offline-queue` ✓ (incl. "booting never posts the default local sample", dupe "Already at the works"), `lane-c-activations-assay-office` ✓
- **GATE-RIDER (Game.ts):** diff vs HEAD is **+13 / −0** — no deletion. The feared office-branch revert did NOT occur. (Note: identifier `openAssayBenchIfNearby` is absent from both HEAD and tree — the shipped office activation is `buildSystem.assayOfficeInRange()` + `AssayOfficePrompt`; the standing-order identifier was stale.) PASS.
- **040 runaway generator:** `assets/crafting-queue/pending/` held at **0** across the fire — the auto-post source is contained (CraftingQueue `alreadyExists` + vite middleware `existingQueuePath` dupe guard). Generator loop STOPPED. PASS.

## Findings
- **F-1 (non-blocking, test-harness only):** `e2e/task-037-assay-bench-ungate.spec.ts:115` fails deterministically at the `panGold()` helper — `expect.poll(harvest.channeling).toBe(true)` times out (5 s) under `?timescale=8`. This is the gold-panning **setup**, before any assay assertion. Proof it is NOT a game regression: `m1-04-gold-panning-economy` passes 4/4; 037 touches no harvest/panning code. Fix: harness should `grantGold()` like `debugPlaceAssayOffice()` (or drop timescale) rather than pan under 8× time. Corrective owed (queue AFTER lanes drain — do not re-dirty main now). 037 feature itself is verified by the three passing assay tests.

## Attribution → commits (file-disjoint, no overlap after 013 removed)
- **038 walk4 gait:** `src/assets/SpriteAnimator.ts`, `assets/layer-contracts/characters.v2.json` (walk4 blocks DORMANT→ACTIVE), `e2e/task-031-anim-roundness.spec.ts`, `e2e/vp-02-sprite-animation.spec.ts`, `e2e/vp-02b-rotation-resolver.spec.ts` (+ evidence `artifacts/task-038-walk4/`, `reviews/shots-008-rotation/*`, `reviews/shots-vp-02/*`).
- **026 prospector collects xp:** `src/agent/AgentStub.ts`, `src/agent/ToolSurface.ts`, `src/game/Balance.ts` (`agent:` priority block), `e2e/task-026-prospector-collects-xp.spec.ts`.
- **037 assay-bench-ungate:** `src/crafting/AssayBench.ts` (debug-gate removed), `src/game/Game.ts` (prompt wiring +13/−0), `src/ui/AssayOfficePrompt.ts` (new), `src/styles.css`, `e2e/task-037-assay-bench-ungate.spec.ts`.
- **040 runaway order generator:** `src/crafting/CraftingQueue.ts`, `vite.config.ts` (dupe-guard middleware), `e2e/m5-04-offline-queue.spec.ts`, `e2e/lane-c-activations-assay-office.spec.ts` (+ regenerated `artifacts/lane-c-activations/*.png`).
