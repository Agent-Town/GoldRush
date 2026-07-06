# Review — task 031b: F-030-1 MetaProgress storage guard (MAIN slot)

**Verdict: GATE-PASS — merged to main.**
Drained by s79 fire (2026-07-06T11:47Z). Runner output: `src/game/MetaProgress.ts` guarded, queue task consumed, done-move `20260706-184055-031b-...`.

## What changed
`src/game/MetaProgress.ts` only (matches firewall — no gameplay/Balance/ProfileManager/Scoreboard touch, test spec untouched):
- `loadMetaProgress()` — `storage.getItem` read wrapped in try/catch → falls back to `migrateMetaProgress(null)` (fresh meta) on throw; the migrate write-back `setItem` wrapped in try/catch (swallowed) so a throwing store can't abort boot.
- `saveMetaProgress()` — `setItem` write-back wrapped in try/catch.
- Normal-storage behaviour unchanged (load → migrate → persist round-trip identical); no shape/key/migration/track-math change.

This closes **F-030-1** (from `reviews/task-030-wade-sampler-reticle-dim.md`): a blocked-storage object is truthy, so `RunManager.browserStorage()` handed it to `MetaProgress`, whose unguarded `getItem` threw uncaught → boot aborted → `__GR_TEST__` never installed. Guarded at the MetaProgress boundary so all callers are covered.

## Evidence
- `npx tsc --noEmit` → clean.
- `npm run build` → ok (472ms; pre-existing 900kB chunk-size advisory only).
- `npx playwright test task-024-blast-aim-presets` → **10/10 passed** desktop-chrome (1280×800) + mobile-chrome (390×844), including the acceptance test `difficulty preset falls back to default when profile storage is blocked` (was RED on main, asserts `difficultyPreset==='trail'` + zero console/page errors) — now green on both.
- `npx playwright test task-025-bandits-dont-swim` → **10/10 passed** both projects (no meta/run-path regression).
- Boot probe: both suites boot the game via `openGame` with zero-console/page-error assertions on both viewports (20 tests) — desktop + 390px both clean.
- GATE RIDER check: `git diff HEAD` shows only `MetaProgress.ts` changed in tracked code — no removal of committed code outside firewall; no Game.ts/office-branch regression.

Screenshots: N/A — non-visual defensive logic change, no rendering path touched. Evidence is the 20 green e2e tests above.

## Findings
None blocking. Merged.
