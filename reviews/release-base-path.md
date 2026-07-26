# release-base-path — THE GAME LEARNS TO LIVE AT agenttown.app/goldrush

**Slice:** `lane-release-base-path` · **branch:** `lane/m4` · **tip:** `bbc9b6db19d54de88c669c6b60afb5c204a0d558`
**Merge-base:** `286c2f48` · **Drained:** s1078, 2026-07-26 · **Verdict:** ✅ **MERGE** (one limitation recorded, proven pre-existing)

## What it does
Owner, 2026-07-26: *"agenttown.app/goldrush — would that be ok?"* — **YES**. This makes it true. Two halves:
1. **Base path.** `GR_BASE=/goldrush/` feeds vite's `base` **only for the release build**: `base: releaseE1 && process.env.GR_BASE ? process.env.GR_BASE : './'`. Absent the env, behaviour is **byte-identical to before** — the plain release and every dev boot are untouched. `public/_headers` gains `/goldrush/assets/*` and `/goldrush/*.html` cache rules **alongside** the existing ones, not replacing them.
2. **API SPLIT LAW.** A new `src/app/GameApi.ts` pins `GAME_API_ORIGIN = 'https://gold-rush-3in.pages.dev'` and every call site (`telemetry`, `liveStats`, `AccountSync`, `LockstepClient`, `RideTogether`, `ComplaintDesk`, `TownTavernPilot`) routes through `gameApiUrl('/api/…')`, so API traffic reaches **the game project** regardless of which origin serves the page.

**Firewall honoured:** no endpoint logic changed — every src edit is a URL-construction swap.

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green, 1.47s** |
| `e2e/release-base-path.spec.ts` (own spec, own config) | **4/4 — desktop + mobile-390 PASS** |
| `e2e/bug-office-desk.spec.ts` (covers `ComplaintDesk`) | **4/4 PASS** |
| `e2e/assay-ledger-page.spec.ts` (covers `liveStats`) | **4/4 PASS** |
| `e2e/accounts-sync.spec.ts` (covers `AccountSync`) | **UNVERIFIABLE under the available harness — proven not-mine (F-1078-6)** |

The own-spec's two tests are exactly the ones that matter: *"release boots cleanly beneath /goldrush/ and keeps API traffic on the game project"* and *"every game function permits both agenttown origins"* — the second is a real assertion, not a stub: **the CORS allowlists already carry `https://agenttown.app` and `https://www.agenttown.app` on all five functions** (`stats.ts:22`, `telemetry.ts:43`, `_bugs.ts:48`, `_multiplayer.ts:92`, `_accounts.ts:79`) — ✓ VERIFIED by reading main, so scope item 2's CORS half had landed in an earlier merge and the runner correctly did **not** redo it. That is a non-finding worth recording, because its absence from the diff looks like a gap.

**Merge classification:** merge-base `286c2f48`; per-file `git diff` shows **all 12 files LANE-TOUCHED-ONLY, main moved none** ⇒ no 3-way, applied byte-identical to the lane tip. `lane/m4`'s two other commits were **deliberately not drained**: `1e603005` (midgame) is already on main as `d2279d32` (s1077), and **`793c9f2f` is `scripts/deploy.sh`, which F-1073-1 standing-forbids.** `deploy.sh` is **not** among `bbc9b6db`'s files, so the path-scoped graft threads that trap with no judgement call.

## Findings
- **F-1078-6 — `accounts-sync.spec.ts` cannot be gated under the default harness; this is pre-existing, not a regression.** `:14` times out waiting for `getByTestId('account-dev-code')`, which is served by the `/api/accounts` dev endpoint. It looked like a textbook regression from this very slice (AccountSync now targets an absolute origin, so a local `/api` would be bypassed) — **so it was fingerprinted rather than assumed.** With `src/game/AccountSync.ts` reverted to clean main and everything else identical, **the same test fails identically at the same locator with the same 30.2 s timeout.** ⇒ the suite needs its dedicated `playwright.accounts.config.ts` (which stands up a functions server); under plain vite there is no `/api/accounts` at all. ✓ VERIFIED not-mine. **Honest limitation: this drain therefore does NOT prove the account sign-in path still works end-to-end after the origin swap.** Design-level risk is low — at `gold-rush-3in.pages.dev` the absolute origin *is* the page origin (no behaviour change), and at `agenttown.app` the CORS allowlist already permits it — but **the accounts path wants one run under `playwright.accounts.config.ts` before the owner's Cloudflare session.**
- **F-1078-7 (method, carried from this fire's first drain) — the default gate port 5188 was held by a FOREIGN tree for this entire drain.** `lsof` showed the listener's cwd as `/private/tmp/gr-ladder-tune-measure` (lane-c's live ladder-tune measurement). The default config's `reuseExistingServer: false` **refused it and errored out rather than measuring the wrong tree** — the F-1077-3 trap, caught structurally this time instead of by luck. Gates were re-run on scratch **5266** with a server this repo spawned itself. **Keep `reuseExistingServer: false`; it is load-bearing.**

## Where does the PLAYER see this, in a plain boot?
Nowhere yet, and that is correct — this is release plumbing. Nothing changes for a player until the owner points `agenttown.app/goldrush` at the build; without `GR_BASE` set, the bundle is behaviourally identical to today's. **No GAZETTE item** (GZ-01's filter law: no player-visible change).

## For the owner's Cloudflare session
The master asked for two wiring options with a recommendation; the runner's own END notes belong with the task file. What this drain adds: the **API SPLIT LAW is now enforced in code**, so whichever option is chosen, the game's API calls will keep reaching the game project rather than following the page origin — that was the fragile part, and it is no longer a matter of deployment configuration.
