# Review — fix-town-spec-flow (lane/e2-arsenal `7f0bdb62`)

**Slice:** fix-town-spec-flow — "town blender specs learn the new create→enter flow"
**Branch/tip:** lane/e2-arsenal `7f0bdb627e008c0e93490262376c4dea0bb24a76` (author: runner, 2026-07-20 05:46:58)
**Base:** merge-base `5d63a5c4` (s749 lock); main untouched all 10 files since fork → clean additive checkout-graft, no 3-way.
**Verdict:** ❌ **BLOCKED — do NOT merge. Partial fix; the slice's own specs are RED (spec-not-green fails the drain gate, CLAUDE.md §6 code-slice bar).**

## What it does
Rewrites the shared `openTown()` helper in all 10 `e2e/town-*-blender.spec.ts` from the stale flow (`goto('/?terrain2d')` → click `start-menu-enter-town`) to a synthetic direct-boot (`addInitScript(history.replaceState({goldRushScene:'town'}))` → `goto('/${search}')` → wait `__GR_TOWN_DIAGNOSTICS__.frame>N`). Net −62/+20 lines, spec-helpers-only, no src (firewall respected).

## Evidence (the gate)
- `npx tsc --noEmit` — clean. `npm run build` — ✓877ms. (Expected: task is test-only.)
- **`e2e/town-dynamo-hall-blender.spec.ts`, single-worker isolated run (`--reporter=list`, no contention): 4 passed / 8 FAILED.** Clean, reproducible — this is the definitive result (the full-10 parallel run also throws a `import.meta.glob is not a function` webServer-transform race that masks per-spec results; single-spec runs are authoritative).
- Failing tests (both `desktop-chrome` + `mobile-chrome`):
  - `:80` complete Dynamo Hall … → `walkToHall` `expect.poll(activePrompt).toBe('dynamo-hall')` → **Received: null** (8000ms predicate timeout).
  - `:107` a pre-T2 profile never renders/requests the 3D Dynamo Hall → red.
  - `:117` a failed load preserves crank → `walkToHall` red (same activePrompt null).
  - `:124` owner eye … every registered 3D building → `walkToHall` red.
- Screenshots (before revert): `artifacts/town3d-dynamo-hall/{desktop,mobile}-chrome-before-facade.png` — town DID render (facade visible), so the boot loads; the failure is **interaction/state**, not render.

## Root cause (F-1)
The initial `openTown` rewrite is *correct in principle*: with a profile already seeded via `installSeedAndWebglCounter` (localStorage `PROFILE_KEY` + `territory:3`), the current boot flows **straight into town** — the Start Menu never appears, which is exactly why the old `getByTestId('start-menu-enter-town').click()` timed out (the button still exists in `src/ui/menu/StartMenu.ts:142` but the menu isn't shown when a profile auto-continues).
BUT the fix stopped there. It did **not** update the **mid-test re-entry sequences** that every walk/prompt test still performs — e.g. dynamo-hall `:84-85`: `getByTestId('town-exit').click()` → `replaceState(pilot params)` → `getByTestId('start-menu-enter-town').click()`. That re-entry path is still stale (2 of 10 specs — dynamo-hall + plaza-props — still reference `start-menu-enter-town`), so after re-entry the prospector/interaction state is not established and `walkToHall` never drives `activePrompt` to the building id. The pre-T2 test (`:107`) also depends on the boot honoring the un-seeded state through the synthetic direct-boot, which it does not.

## Disposition
- Graft REVERTED (working tree clean at main `b1f283da`); partial preserved as salvage-ref **`save/fix-town-spec-flow-partial`** (`7f0bdb62`).
- Corrective authored: **`tasks/fix-town-spec-flow.md`** re-written (attempt 2, CHANGED premise per CLAUDE.md §7.5 — must reproduce full create→enter state, fix the re-entry sequences, and land ALL 10 specs green both projects with a per-spec table). The prior attempt shipped `READY-FOR-GATES` **without** running the specs green — that is the defect this corrective closes.
- Lane reset queued (`tasks/janitor/refresh-lane-c.req`) so lane/e2-arsenal returns to main before the corrective is queued (SAFE-DUPE pre-flight would otherwise STOP on the 1-ahead partial). Next fire queues the corrective once `git log main..lane/e2-arsenal` is EMPTY.

## Findings
- **F-1 (BLOCKING → corrective queued):** re-entry sequences + pre-T2 boot not migrated; `walkToHall` activePrompt null; 8/12 dynamo-hall red. Fixed by the re-authored master.
