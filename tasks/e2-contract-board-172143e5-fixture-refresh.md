# e2-contract-board-172143e5-fixture-refresh — align the epoch-2 contract-board test suite to the real registry (commit prefix "test:")
ROLE: test corrective. WORKDIR: main slot (or lane-c if attended prefers). CODEX: model=gpt-5.6-sol effort=high
**FIRE-AUTHORED (s586, 2026-07-15 — attended review welcome).** WHY: baseline-proven this fire — 9 contract-board specs are red on CLEAN main (2-contract state) exactly as with the drip landed, so they are stale fixtures from attended's `172143e5` e4/e5 epoch additions, NOT drip-caused. The s586 drip drain (e2-drip-02/03) merged over them as documented known-reds (§6). They span board-pagination / era-activation / registry-loader semantics — NOT count-only bumps — so a fire must NOT blind-bump them (Mistake #13 masking risk). This master gathers them for one coherent, evidence-driven pass.

Pre-flight: standard tracked-clean (main) or safe-dupe (lane). npm install; build green. **Verify each failure is a STALE FIXTURE (received value reflects the true, intended registry), NOT a real regression — read the assertion + the received value + the code path before changing any expectation.**

## READ-FIRST
- The s586 review `reviews/e2-drip-02-pressure-garden.md` (s586 LANDED section — the baseline proof + the exact received values per spec).
- `172143e5` diff (the e4/e5 epoch additions that shifted these fixtures).
- The registry loader for `loadEpoch`/`listEpochs` (for `sci-04:123` locked-stub semantics — decide: is returning full contract objects for a LOCKED epoch INTENDED or a leak? The real guard in that test is `after === before` eligibility; confirm it still holds).

## SCOPE (each item: confirm intended value from code/behavior, then update the fixture; re-run to green both projects):
1. `sci-04-contract-registry.spec.ts:59` — `listEpochs()` returns 5 (`epoch-1-frontier, epoch-2-steamworks, epoch-3-voltage, epoch-4-motor, epoch-5-deepwater`). Update the two `.toEqual([...])` (ids + displayNames) to the real 5. (Pure e4/e5 list — safest item.)
2. `sci-04-contract-registry.spec.ts:123` — the LOCKED steamworks stub now returns full contract objects (not `[{id:'e2-hill-mine'}]`). DECIDE intended behavior first (read the loader): if full-data-when-locked is intended, relax the `toMatchObject` to assert only `locked:true` + the eligibility invariants; if it's a leak, that is a REAL bug — write a finding + corrective, do NOT paper over it.
3. `board-upcoming-surveys.spec.ts:44` — `contract-upcoming-e2-trestle` "SURVEY PENDING" element gone. Determine the current intended board composition (does trestle still show as an upcoming survey, or did `172143e5` change the teaser set?) and fix the locator/expectation to match intended.
4. `contract-briefings.spec.ts:259` — align to the current manifest briefing set (now includes the graduated garden/incline + e4/e5).
5. `e2-pressure-economy.spec.ts:94` — align the debug Steamworks override expectations to the current pressure chip/exchange rows.
6. `072-era-activation.spec.ts:246` + `:329` — `research-next-epoch` element/attribute (expects `epoch-3-voltage`). Determine why it's absent (next-epoch logic vs the e4/e5 registry) and fix the expectation OR flag a real next-epoch regression.
7. `town-t3-board.spec.ts:157` (board page-count "1 / 6" → real "1 / 12" now that garden+incline+e4/e5 are on the board) + `:268` (last-page memory). Update counts to the real board size; re-derive from live output, not arithmetic.

## TOUCH-ONLY: the 8 listed e2e spec files (fixture expectations only). NO: src/ changes (if a fix needs src, that's a real bug → separate finding+corrective), no contracts.json changes, no new contracts, no other suites.

## SELF-CHECK (gates): tsc clean (spec imports); the 9 named tests GREEN both desktop-chrome + mobile-chrome on a scratch config (5199/5231/5234 family); zero console/page errors; re-run the FULL board suite (`board-gating-and-profiles`, `sci-04-contract-registry`, `board-upcoming-surveys`, `contract-briefings`, `e2-pressure-economy`, `072-era-activation`, `town-t3-board`, `en-03-epoch-pages`) to confirm no collateral red. Report: per-spec old→new expectation + WHY (which registry fact changed), and any item that turned out to be a REAL regression (with a finding).
READY-FOR-GATES + report the 9 greens (both projects) + any finding spawned.
