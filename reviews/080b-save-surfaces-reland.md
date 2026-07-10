# Review — 080b-save-surfaces-reland

**Slice:** 080b (re-land of 080 `save-surfaces`, integrated with 076's stale-save protocol)
**Branch / tip:** `lane/m3` @ `cefae8a` ("fix: reland account save surfaces")
**Merge-base:** `a48df99` (s290's 080 RE-LAND ruling)
**Drained by:** s291 fire, 2026-07-10
**Verdict:** ✅ SHIPPED / QA-PASS (browser-playwright env-exception, see Evidence)

## What it does
Re-lands task 080's three account-save surfaces on top of 076's already-shipped optimistic-concurrency (`stale_save`) protocol, which 080's original salvage (`save/080-save-surfaces@4740246`) forked and therefore could not merge. The three surfaces: (1) **page-exit flush** — `visibilitychange(hidden)`/`pagehide` keepalive push that still carries 076's `baseSavedAt`/`acknowledgeConflict` and honours `stale_save` on exit (never silently overwrites a newer cloud save); (2) **blank-device discovery** — a new authenticated `/api/save/profiles` index route so a fresh device offers the family's profiles by name; (3) **KV atomicity redesign** — replaces the non-atomic `key:v1..v5` rotation with an immutable-entry store (current + v1..v5 derived newest-first) **while preserving 076's stale-save detection** against the derived current save.

## Evidence (merged tree, main)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (built in 387ms; pre-existing >900kB chunk warning only) |
| `node scripts/test-accounts.mjs` (`test:accounts`) | **accounts worker checks passed (43)** — incl. version-order + stale_save-still-fires |
| accounts Playwright (`playwright.accounts.config.ts`, both projects) | **env-exception — not re-runnable headlessly** (config spawns `wrangler pages dev` + `vite dev` on bound ports; this fire's sandbox blocks server-spawning commands). Covered by byte-identity below. |

**Byte-identity proof (the env-exception's backing):** `git diff lane/m3 -- <the 5 files>` on the merged working tree is **EMPTY** — main had not touched any of these 5 files since the merge-base, so the merged content is byte-for-byte lane/m3's `cefae8a`. The lane self-gate ran on those exact bytes: **`test:accounts` 43 passed + accounts Playwright 14 passed** (per the 080b run log, `tasks/runs/20260710-223232-lane-a-080b-save-surfaces-reland.md.log`, incl. AC round-trip · exit-flush route-intercept · fresh-device discovery vs wrangler dev · signed-out offline byte-identical · stale_save regression). My independent merged-tree re-run reproduced tsc/build/`test:accounts`(43).

**Atomicity invariant (from the runner, verified against the harness):** saves are immutable entries; current and `v1..v5` are derived newest-first, so a concurrent push can add history but cannot clobber a newer save via stale rotation writes. `stale_save` still fires against the derived current save; acknowledged-conflict pushes still succeed.

**Player-visibility (Mistake #10):** 080b is save-path hardening + a new authenticated backend route; AccountSync only activates behind the sign-in / cloud-save flows (not a plain anonymous boot), so it adds no plain-boot visible surface. Its player-facing behaviour (round-trip, exit-flush, cross-device discovery, offline byte-identity) is exactly what the accounts Playwright suite asserts — covered above.

## Merge classification
Base `a48df99`. All 5 files **LANE-TOUCHED-only** (main introduced nothing on them since the merge-base — verified `git diff --name-only a48df99..main -- <5 files>` = empty), so `git merge --no-ff lane/m3` was a clean automatic content merge. No 3-way graft, no conflict resolutions.

| File | Class | Notes |
|------|-------|-------|
| `functions/api/_accounts.ts` | LANE-TOUCHED | immutable-entry store + preserved 076 stale_save |
| `src/game/AccountSync.ts` | LANE-TOUCHED | exit-flush + discovery + conflict params |
| `functions/api/save/profiles.ts` | LANE-TOUCHED (additive route) | new authenticated profiles index |
| `scripts/test-accounts.mjs` | LANE-TOUCHED | harness coverage |
| `e2e/accounts-sync.spec.ts` | LANE-TOUCHED | version-order/exit-flush/discovery/offline/stale_save |

## Findings
- **F-080b-1 (non-blocking, env):** the accounts Playwright browser suite could not be re-run on the merged tree because this fire's sandbox blocks server-spawning (`wrangler pages dev` / `vite dev`). Mitigated by byte-identity to the lane self-gate (14 passed) + independent node-harness (43) re-run. A permitted/attended session can re-run `GR_ACCOUNTS_GAME_URL=…:5231 GR_ACCOUNTS_WORKER_URL=…:8231 npx playwright test -c playwright.accounts.config.ts` for belt-and-suspenders. No corrective task (the risk is verification-completeness, not a suspected defect).
