# Review — f2253-1-mp07c-inspect-mock

**Slice:** `f2253-1-mp07c-inspect-mock` (fire-authored s2253 from F-2253-1)
**Branch:** `lane/b` · **Gated tip:** `ec926950c` · **Base:** `25ab25181`
**Merge:** `54c113365a8f55ea383a73efa14856c5fa931b5e` (main, `--no-ff`)
**Drained by:** s2254 fire, 2026-08-24
**Gate worktree:** `worktrees/gate-s2254` (detached, §3.0b)

## Verdict

**MERGED — the acceptance test is green on both projects and the cure is exactly the
five-line, assertion-free repair the master specified.**

## What it does

`e2e/mp-07c-3-invitation.spec.ts` mocked `**/api/multiplayer/create` and was handed a synthetic
room code, but never mocked `inspect`. So `src/mp/RideTogether.ts:163` fetched
`/api/multiplayer/inspect?code=…` against the **live** relay, no such room existed, and
`functions/api/_multiplayer.ts:262` answered `room_not_found` with a correct **404**. The browser
logged the failed resource load, and the spec's blanket `expect(errors.console).toEqual([])` at
`:59` rejected it.

This slice adds an origin-agnostic `page.route('**/api/multiplayer/inspect**', …)` beside the
existing create mock, fulfilling 200 with `{ ok: true, started: false, players: 0, roster: [] }` —
the shape `e2e/mp-ride-lobby.spec.ts` already uses in its seeding helper. **The product was never
wrong**; only the test invented a room that was never created. Nothing in `src/**` or
`functions/**` was touched, and the console guard was strengthened by being satisfied rather than
weakened (F-1441-3 / Mistake #10 both respected).

The trailing `**` in the glob is load-bearing: the real call carries a `?code=…` query string, so
a bare `**/api/multiplayer/inspect` would not intercept it. Origin-agnostic by construction, which
is the whole lesson of F-2252-1 — this mock survives the next origin change.

## Evidence (measured s2254 on the MERGED tree, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (no output, rc=0) |
| `npm run build` | **green, 1.19s** |
| `e2e/mp-07c-3-invitation.spec.ts` — **the acceptance test** | **2 passed / 0 failed**, both projects, 14.0s (desktop 5.6s, mobile 6.0s) |
| Console + page guard at `:59`–`:60` | **empty** — this IS the acceptance criterion, and it passed |
| `e2e/mp-ride-lobby.spec.ts` (adjacent, pattern source) | **4 passed / 0 failed**, both projects, 46.1s |
| Boot probe, desktop + 390px mobile | discharged **by the acceptance spec itself**, which runs on both projects and asserts zero console/page errors |
| `npm run test:node-guards` | **NOT owed, not run** — merged diff is `e2e/` + `reviews/shots-*` only, touching none of `src/sim/ src/systems/ src/entities/` (F-1460-1's key). Verified against the *merged diff*, not the runner's claim. |
| Screenshots | `reviews/shots-mp-07c-3/desktop-chrome-invitation.png` (741,403 B), `…/mobile-chrome-invitation.png` (905,408 B) — both tracked on main |

**The diff is 5 insertions and 0 deletions.** No assertion value, expected string or test title
moved — proven by the deletion count, not asserted.

## Merge classification

- **Base:** `25ab25181`. Main moved exactly 2 files since: `STATUS.md` and
  `artifacts/s2253-mp07c.log` — both bookkeeping.
- **Intersection with the lane's 3 paths: ZERO.**
- Therefore all 3 paths are **LANE-TOUCHED**; none MAIN-MOVED. Three-way merge, **zero conflicts**.
- Absorption verified after the merge: `git log main..lane/b` is **empty**, and
  `lane-usable.mjs lane-b` flipped `HOLDS` → `USABLE` (`ahead=0`).

## Findings

### F-2254-1 — `e2e/mp-ride-lobby.spec.ts` is LOAD-SENSITIVE at two distinct assertion sites; the discriminator is WALL TIME, not the line (NON-BLOCKING)

The adjacent suite **redded on its first gate run and greened on re-run**, and the runner had
independently reported the same suite going "4/4 green on retry" after a *different* miss. Two
observations, two different lines, same suite:

| Observer | Project | Site | Outcome |
|---|---|---|---|
| lane-b runner | desktop | websocket poll | red once, green on retry |
| s2254 gate | mobile | `:83` `toHaveAttribute('aria-hidden','true')`, 8s budget | red once, green on retry |

**The wall time is the tell, and it is a 2× spread on the identical tree and identical command:**
the run that redded took **1.5m** for 4 tests; the green re-run took **46.1s**. The single failing
test passes **in isolation in 11.8s**.

This is a **load ceiling, not a line** — which is why it must not be recorded as two separate
flaky assertions. Causality to this slice is **refuted by measurement, not by argument**:
`e2e/mp-ride-lobby.spec.ts` is **byte-identical across the merge** (blob
`31a25dac288ab6b2c0eb9e07055d33ae6f58667a` on both `main` and the merged HEAD), and playwright
route mocks are per-context, so no path exists from this diff to that suite.

⚠️ **This bears directly on the next fire's priority (B), the red-inventory refresh.** The
inventory currently reports `NOT-IN-INVENTORY` for this spec off a **12-day-stale** snapshot
(threshold 7; 148 commits have touched `e2e/` or `src/` since) and honestly declares that
*"absence here is not evidence either way."* **A refresh taken while this suite is load-flaky
would bank a load ceiling as a suite red** — the same error s2251 guarded against when it ruled
the refresh must follow the fixture repairs. Refresh on a quiet machine, and re-run any red once
before recording it.

### F-2253-1 — CLOSED by this merge

The 404 at `:59` is gone; the console guard is genuinely empty rather than merely emptier. The
runner reported no new console error surfacing behind it, and the passing guard confirms that
independently — there was no second layer to the mask.

## GZ-01

**No gazette item owed.** The filter law keys on a player-visible change; this slice touches one
e2e spec and two screenshots, and ships no product behaviour. Recorded explicitly so the next
fire's backfill sweep does not read the absence as a missed duty.
