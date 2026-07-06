# Review — Task 030: F-025-1 wade-speed sampler + disarm reticle dim

**Verdict: PASS (drained + merged to main, s78 fire 2026-07-06T11:29Z)**

Main-slot output from the lane runner (`tasks/done/20260706-181418-030-...md`), gated and committed.

## Scope delivered (diff vs HEAD, in-firewall)
- `e2e/task-025-bandits-dont-swim.spec.ts`: replaced the wall-clock `waitForSim(0.5)` + protocol-sampled speed read with an in-page rAF `armWadeSampler` (records min/max hero speed + `speedMul` while `terrain.playerZone === 'river'`), asserting `minSpeed < heroSpeed·speedMul + 0.25`. Wall-clock-independent per the s27 in-page-sampling law. Extends the existing disarm test with `aim-reticle--disarmed` class assertions (armed→disarmed→re-armed); **no new spec file** (task constraint honored).
- `src/game/Game.ts`: `updateBlastAim()` now computes `disarmed = heroWeaponsDisarmed()`, toggles `aim-reticle--disarmed` on the canvas, and hides the reticle mesh (`|| disarmed`) so it no longer reads as "can fire" while wet-powder-disarmed; `reset()` clears the class. Additive UI-only — CombatSystem untouched, no Balance/gameplay change, no removal of committed code outside firewall.

## Evidence
- `npx tsc --noEmit` → clean.
- `npm run build` → ✓ built (925 kB bundle, chunk-size warning only — pre-existing).
- `npx playwright test task-025 task-024` → **18 passed**, 2 failed. Both 030-owned tests (025 ford + 025 wade/disarm) green on desktop-chrome + mobile-chrome; full aim trio (024) green. The 2 failures are OUT OF 030 SCOPE — see F-030-1.
- Boot probe (throwaway `_s78-probe`, since removed): booted `?debug` on desktop-chrome (1280×800) + mobile-chrome (390×844), zero console/page errors, canvas non-blank (river/ford/hero/HUD render). Shots in `reviews/shots-task-030-wade-sampler-reticle-dim/`.

## Findings
### F-030-1 (PRE-EXISTING, NOT 030 — main bug, lane-a/difficulty territory) — blocks nothing for 030
`task-024 › "difficulty preset falls back to default when profile storage is blocked"` fails on both projects: the game never boots (times out at `openGame`'s `waitForFunction`) when `localStorage` methods throw.

✓ VERIFIED root cause: `MetaProgress.ts:37` `loadMetaProgress()` calls `storage.getItem(META_PROGRESS_KEY)` with **no try/catch**. `RunManager.browserStorage()` (RunManager.ts:318) returns the storage object whenever `globalThis.localStorage` is truthy — and the test's blocked-storage object IS truthy (its getter doesn't throw; only its *methods* throw). So `loadMetaProgress` runs against a throwing store, `getItem` throws uncaught in the RunManager constructor, boot aborts, `__GR_TEST__` never installs. `Balance`, `Scoreboard`, and `browserStorage()` itself are all try-guarded; only the `loadMetaProgress`/`saveMetaProgress` call path is not.

Introduced with 1489db7 (024+025 difficulty-preset/meta feature) — predates 030, disjoint from 030's files. Fix: wrap `getItem`/`setItem` in `loadMetaProgress`/`saveMetaProgress` (return fresh meta on throw), OR harden `browserStorage()` to probe a method before returning. Small, main-slot, defensive. Flagged to next fire / Robin (see STATUS handoff) — NOT auto-queued this fire to avoid collision with the stranded lane-a demo-profiles (`gr.difficultyPreset.v1`) work, which lives in the same meta/difficulty area and remains unmerged.
