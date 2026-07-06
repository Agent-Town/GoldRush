# Task: fix pre-existing task-027 victory-meta failures (test-only, profile-scope regression)

You are Codex, implementer for Gold Rush (native Mac). READ FIRST: AGENTS.md; CLAUDE.md §5/§9.

## Problem (discovered during s93's m4-05 gate — evidence in reviews/m4-05-agent-closeout.md F-1)
`e2e/task-027-victory-must-matter.spec.ts` fails on both desktop-chrome and mobile-chrome.
VERIFIED pre-existing: the whole test already failed at the s92 main tip `4f6f1c3` (reproduced
with s93's Game.ts reverted), so it is NOT caused by the w1-04 or m4-05 drains. The **product
code is healthy** — the on-screen Claim Office payouts (`claim-payout-*` = +1 ×4) and the runtime
diagnostics assertion (`run.meta.tracks.territory > 0`) both pass. The spec is STALE against the
demo-profiles-v2 storage refactor. There are (at least) TWO stale spots:

1. **Line ~62 — meta read uses the flat key.** `META_PROGRESS_KEY` ('gr.meta.v1') was moved into
   `PROFILE_DATA_KEYS`, so meta now persists to the profile-scoped key
   `profileDataKey('robin', META_PROGRESS_KEY)` = `gr.profile.v2.robin.gr.meta.v1`
   (`src/game/ProfileStorage.ts` `profileDataKey()`, default active profile id `'robin'`). The test
   reads the flat `localStorage.getItem('gr.meta.v1')` → null → `meta.tracks` mismatch.
   **VERIFIED FIX (apply this):** import `profileDataKey` from `../src/game/ProfileStorage` and read
   `profileDataKey('robin', META_PROGRESS_KEY)` instead of the flat `META_PROGRESS_KEY`. This makes
   line ~63 (`toMatchObject({ territory:1, science:1, hero:1, agent:1 })`) pass.

2. **Line ~95 — post-bank new-run death no longer triggers.** After banking the secured claim and
   starting the next claim, the spec does `teleport(0,12)` + `spawnPack(1, 0.1, { speedScale: 0 })`
   with `enemy.contactDamage=999` and polls `runState === 'dead'` (8s) — it stays `'playing'`.
   INVESTIGATE the real cause (do NOT just bump the timeout): confirm `spawnPack`'s radius origin
   (is `0.1` measured from world-center vs from the hero? the hero was teleported to (0,12), so a
   pack spawned near center never contacts a stationary `speedScale:0` enemy), and whether the fresh
   post-bank run applies spawn-suppression / hero i-frames that block an instant contact-kill. Fix
   the TEST setup so a stationary lethal enemy is actually placed on the hero (e.g. spawn at the
   hero's post-teleport position, or teleport the hero onto the pack), matching current `spawnPack`
   semantics. The intent of the assertion (a new run can end in death, best-claim row still shows
   SECURED) must be preserved.

3. **Line ~85 — scoreboard read uses flat `SCORE_KEY`.** SCOREBOARD_KEY is ALSO in
   `PROFILE_DATA_KEYS`. This assertion happened to pass in the observed run, but CONFIRM it reads the
   correct (scoped vs flat) key under current storage; if it only passes by luck, fix it to
   `profileDataKey('robin', SCOREBOARD_KEY)` for consistency. Audit EVERY `localStorage.getItem`/
   `setItem`/`removeItem` and `addInitScript` key in this spec against `PROFILE_DATA_KEYS` and fix
   any that read/clear the flat key where the data is now profile-scoped.

## Firewall
Touch ONLY: `e2e/task-027-victory-must-matter.spec.ts`. NO product-code changes. NO other specs.
If investigation proves a genuine PRODUCT regression (not a stale test) in death/spawn/new-run,
STOP and write findings to `reviews/027-victory-regression.md` instead of editing product code.

## Acceptance / self-check
- `npx tsc --noEmit` clean.
- `e2e/task-027-victory-must-matter.spec.ts` GREEN on BOTH desktop-chrome AND mobile-chrome.
- No new console/page errors (the spec already asserts `errors.consoleErrors/pageErrors` empty).
- NOTE: fixed dev port 5188 may be held by the lane runner — gate on a scratch port
  (`npm run dev -- --port 5233 --strictPort` + a temp reuseExistingServer config) if so.
End: READY-FOR-GATES + files touched + per-project results + which of the 3 spots were stale-test
vs (if any) a real product regression.
