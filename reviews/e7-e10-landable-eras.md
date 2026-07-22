# Review — E7/E10 landable eras (F-REH-02/03 P0 correctives)

- **Slice:** lane-e7-e10-claimable (combined E7 + E10, QUEUED from saga-rehearsal draft, attended 2026-07-22)
- **Branch/tip:** `lane/m3` tip `1135df1a` "runner(lane-a): lane-e7-e10-claimable.md"
- **Base:** `73408c6e` (s912's census-triage fix, the lane's own merge-base — FRESH, not stale)
- **Merge:** `c96cd289ff9b6c27ec4b8d3de36a21873724efac` (`--no-ff` 3-way onto clean main; s913, 2026-07-22)
- **Verdict:** ✅ MERGED — clean graft, full gate battery green, on-spec.

## What it does (player-visible)
Makes the two saga flagships **landable in plain play** — the first time E7 and E10 are reachable by a player without a debug URL flag:
- **E7 "The Relay Valley"** (`?contract=e7-relay-valley`) now boots directly to the Signal era (epoch-7), briefing names "The Relay Valley", and **THE ECHO arrives on that live contract with no `&e7boss` flag** (arrival wave per its spec). Previously The Claim opened instead (zero `harvestAnchors`) and the Echo only ran behind the `&e7boss` debug seam on The Claim — Mistake #10 (Debug-Gate Leftover) class.
- **E10 "The Last Claim"** (`?contract=e10-last-claim`) boots directly to epoch-10-deepsky, ark loads, and **THE STATIC engages in plain play with no `&e10static` flag** (appetite `meaning`, arrivalCount 1). The existing re-ink→river-lever→River→post-credits finale chain is unchanged and still verified.

## How (mechanism)
- `src/meta/ContractFamilies.ts`: new `LIVE_SAGA_FLAGSHIPS` map (`e7-relay-valley→epoch-7-signal`, `e10-last-claim→epoch-10-deepsky`). `activeEpochId()` returns the flagship's epoch when `?contract=<flagship>` is present; `activeContractSelection()` grants the two flagships a `liveSagaFlagship` bypass so they resolve natively (not `debug-disabled`→The-Claim) while EVERY other contract still requires debug/launched. Minimal, additive, scoped to exactly two ids.
- `assets/contracts/epoch-7-signal/contracts.json` + mask-table: real `harvestAnchors` for `e7-relay-valley` (4, consistent with its lanes). The three non-flagship E7 contracts (`e7-dead-band`, `e7-relay-rush`, `e7-echo-canyon`) get explicit **"Board-launch-only until <consumer> lands"** descriptions — the scope's decide-and-record (Slice 1.3), no vocabulary stretch.
- `assets/contracts/epoch-10-deepsky/contracts.json` + mask-table: real `harvestAnchors` for `e10-last-claim` (4). `e10-ember-shore`/`e10-archive-world` marked board-launch-only; `e10-river` marked **post-credits-only through the Charter Press river lever** (Slice 2.4 record — matches the 064 finale law).
- e2e specs extended (not thinned): each adds a plain-boot boss-arrival test whose assertion path carries **no boss flag**; the pre-existing flag-path + unarmed-without-seam tests are preserved (the harness `&e7boss`/`&e10static` seams stay for the stable-Claim production-system tests).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ 1.26s |
| `e7-boss.spec.ts` + `e10-static-boss.spec.ts` (slice's own, desktop-chrome) | **7/7 pass** (36.4s) — incl. both NEW plain-boot boss-arrival tests + preserved flag-path/unarmed-seam tests |
| Adjacent: `board-gating-and-profiles`, `e7-signal-systems`, `e7-roster`, `tour-era-seed` (desktop-chrome) | **11/11 pass** (30.4s) — gating/fallback logic intact; "era parameter is inert without debug" still green |
| Mobile 390px (`mobile-chrome`): both plain-boot boss-arrival tests | **2/2 pass** (14.3s) |
| Console/page errors | zero (asserted `errors.toEqual([])` in every new plain-boot test, desktop + mobile) |
| Screenshots | `reviews/shots-e7-e10-landable/` — relay-valley-plain-boot, relay-valley-echo-arrival, last-claim-plain-boot, last-claim-static-arrival (mobile-chrome) |

## Merge classification
7 files, +109/-19. Base `73408c6e` is the lane's own merge-base and is FRESH (s912's census merge = same content on main), so **NO phantom deletions** this drain (unlike s912's census drain). Verified `git diff 73408c6e main -- <all 7 files>` was EMPTY before merge → main had touched none of them → clean 3-way, zero conflicts, all 7 files LANE-TOUCHED-only. STATUS.md/docs on main and the e7-e10 files on lane are disjoint sets.

## Findings
- **F-E710-01 (non-blocking, OWNER'S DESK):** the plain-boot boss-arrival tests use `?debug&contract=<flagship>` (LIVE_QUERY) only to expose the `__GR_TEST__` harness for forcing the arrival wave (`startWaveForTest` / `advanceSim`) — the *gating* is proven flag-free (PLAIN_QUERY resolves the contract; the flag-path/unarmed tests confirm the boss does NOT arm on The Claim without its seam). A full unforced-wave playthrough to the arrival wave in a truly plain boot is the acceptance proof the master names ("the saga-rehearsal driver's E7/E10 segments then rehearse the REAL contracts") — that live rehearsal is owner/attended, not a fire gate. No code concern.
- **F-E710-02 (recorded, by design):** the 5 non-flagship E7/E10 contracts remain board-launch-only pending their per-contract consumers (signal-suppression, interference-front, broadcast-mirror, Static-squall, procgen-v3). Descriptions now state this plainly; no engine work was in scope.
