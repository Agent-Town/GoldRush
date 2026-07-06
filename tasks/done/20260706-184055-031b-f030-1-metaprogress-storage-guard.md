# Task 031b: F-030-1 — guard MetaProgress storage so blocked localStorage can't crash boot (MAIN slot; defensive, NO gameplay change)

**FIRE-AUTHORED (s78, attended review welcome).** From an existing committed acceptance test that is currently RED on main — this is a test-corrective, not new scope.

## Context (s78 gate of task 030, reviews/task-030-wade-sampler-reticle-dim.md — F-030-1)
`e2e/task-024-blast-aim-presets.spec.ts › "difficulty preset falls back to default when profile storage is blocked"` fails on BOTH projects: the game never boots (times out at `openGame`'s `waitForFunction`; `__GR_TEST__` never installs) when `localStorage` methods throw.

✓ Verified root cause: `src/game/MetaProgress.ts` `loadMetaProgress()` (~line 37) calls `storage.getItem(META_PROGRESS_KEY)` and later `storage.setItem(...)` with **no try/catch**. `RunManager.browserStorage()` (src/game/RunManager.ts:318) returns the storage object whenever `globalThis.localStorage` is truthy — and a blocked-storage object IS truthy (only its *methods* throw, not its getter). So `RunManager` constructs with a throwing store, `getItem` throws uncaught, boot aborts. `Balance`, `Scoreboard`, and `browserStorage()` are already try-guarded; only the MetaProgress read/write path is not.

## Do
1. In `src/game/MetaProgress.ts`, make `loadMetaProgress(storage)` resilient: wrap the `storage.getItem` read AND the `storage.setItem` write-back in try/catch. On any throw, fall back to `migrateMetaProgress(null)` (fresh meta) and skip the write-back silently — the game must still boot. Do the same defensive guard for `saveMetaProgress(storage, meta)` (setItem must never throw out).
2. Keep behavior identical when storage works normally (load → migrate → persist round-trip unchanged). Do NOT change `MetaProgress` shape, keys, migration logic, or any track math.

## Firewall / do-not-touch
- NO gameplay/Balance changes. NO changes to difficulty-preset logic, ProfileManager/ProfileStorage/Scoreboard (those are lane/m3 demo-profiles territory — stay out).
- Only `src/game/MetaProgress.ts` should change (add try/catch guards). If a call-site tweak in `RunManager.browserStorage()` is genuinely cleaner, that is allowed too, but prefer guarding at the MetaProgress boundary so all callers are covered.
- Test hooks additive-only. Do not edit `e2e/task-024-blast-aim-presets.spec.ts` (the storage-blocked test is the acceptance criterion — make it pass, don't weaken it).

## Self-check before READY-FOR-GATES
- `npx tsc --noEmit` clean; `npm run build` ok.
- `npx playwright test task-024-blast-aim-presets` → ALL green on desktop-chrome + mobile-chrome, including "difficulty preset falls back to default when profile storage is blocked" (asserts `diagnostics.difficultyPreset === 'trail'`, zero console/page errors).
- `npx playwright test task-025-bandits-dont-swim` still green (no regression to the meta/run path).
