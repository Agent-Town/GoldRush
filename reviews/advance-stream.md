# Review — THE ADVANCE STREAM + THE CASCADE

- **Slice:** `lane-advance-stream` (owner directive 2026-07-25, sequenced after the asset diet)
- **Branch/tip:** `lane/e2-arsenal` @ `d8240ec9` (runner, lane-c)
- **Base:** `0dfa1d3f` (the asset-diet merge — already an ancestor of main)
- **Merged to main:** `e109639f` (squash, path-scoped, 6 files / 458 insertions)
- **Drained by:** s1026 fire, 2026-07-25

## VERDICT: PASS — merged.

## What it does

The start menu stops being idle time. The moment it settles, the game begins warming the
cache one step ahead of the player: ① the town (the guaranteed next scene) ② the likely
contract (last-suspended → last-played → board frontier) ③ the rest of E1 ④ everything
else. In town the cascade continues to the likely next contract *and its successor*; inside
a run it warms the town (the guaranteed return) then the next contract. One priority
function — `advanceStreamPriority(scene)` — is consulted everywhere, which is what makes
the behaviour auditable instead of three copies of a heuristic.

It is polite by construction, and that is the part worth trusting:
- every fetch is `priority: 'low'` + `cache: 'force-cache'`, batched two at a time, scheduled
  through `requestIdleCallback` (80ms `setTimeout` fallback);
- **every scene transition calls `pause()`**, which bumps a generation counter *and* aborts the
  in-flight `AbortController` — so a launching run never queues behind prefetch bytes;
- `navigator.connection.saveData` collapses the plan to tier-1 only;
- lite/2D tiers skip 3D prefetch entirely (`threeDimensionalAssetsEnabled()`);
- a `data-asset-prefetch*` seam publishes scene/state/ready/total/failed/target, and the
  asset-diet's honest raise-cue consumes it: on a warm cache the town raises with no cue.

Assets are hash-named and immutable, so warming is pure win and re-visits cost nothing.

## Evidence (all on the MERGED tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green — diet still cutting 235 GLBs 84%, 53 plates 87% |
| `e2e/advance-stream.spec.ts` desktop+mobile | **10/10** |
| `e2e/asset-diet.spec.ts` **vs production bundle** | **4/4** (see F-1026-1) |
| `e2e/044-start-screen.spec.ts` desktop+mobile | 12/12 |
| `e2e/profile-first-boot.spec.ts` desktop+mobile | 8/8 |
| `e2e/_s106-prospector-boot-probe.spec.ts` | green, **zero console/page errors** |

The slice's own spec asserts the four claims that matter: menu idle warms town first and
publishes progress · `saveData` keeps tier-1 and skips bulk maps · lite rendering skips
unused 3D prefetch · closing profiles resumes the menu stream · **a launch aborts pending
prefetch before the run requests its own map** (the bandwidth-contention guard).

## Merge classification

Base `0dfa1d3f`. All 6 files **LANE-TOUCHED, zero MAIN-MOVED** — proven, not assumed:
`git log 0dfa1d3f..main -- <all six paths>` returned **empty**, so no 3-way graft was needed
and no conflict resolution was invented.

| File | Class | Change |
|---|---|---|
| `src/assets/AdvanceStream.ts` | LANE-TOUCHED (new) | +253 — the stream + priority function |
| `e2e/advance-stream.spec.ts` | LANE-TOUCHED (new) | +160 — 5 tests × 2 projects |
| `src/main.ts` | LANE-TOUCHED | +12 — `enter()`/`pause()` at every scene edge |
| `src/town/TownTavernPilot.ts` | LANE-TOUCHED | +17 — `townPrefetchUrls()` |
| `src/world/Terrain3dClaimPilot.ts` | LANE-TOUCHED | +13 — `contractPrefetchUrls()` |
| `src/assets/AssetLoading.ts` | LANE-TOUCHED | +4/-1 — cue suppressed on a warm town |

Note: `git diff main lane/e2-arsenal` is *misleading noise* on this board — the lane branch
predates the rig-repair drain, so that diff shows ~120 phantom deletions of `rehearsal/` and
`reviews/`. Classification was done against the lane's true base (`0dfa1d3f`) and the runner
commit itself. A future fire should do the same rather than trust a `main..lane` diff.

## Findings

**F-1026-1 — `asset-diet.spec.ts:65` is a PRODUCTION-BUNDLE-ONLY test and fails red on the
dev server, by construction. NOT a regression, and not this slice's fault.**
The suite asserts `townResponses < 25,000,000` bytes, but `playwright.config.ts`'s default
`webServer` is `npm run dev`, which serves the **undieted originals** — the diet is a
build-time transform. Measured both ways rather than argued:

| Tree | dev-server transfer | verdict |
|---|---|---|
| baseline (main, no merge) | **36,244,224 B** | FAIL |
| merged (advance stream live) | **36,253,834 B** | FAIL |
| merged, **production bundle** | under budget | **PASS 4/4** |

The prefetch's entire contribution to that window is **~9.6 KB (0.03%)** against an 11 MB
pre-existing overshoot. I reverted the four tracked files to main's state, re-ran, and got a
byte-for-byte-comparable baseline failure — that is how this was classified, not by assertion.
**Recommended corrective (non-blocking):** pin `asset-diet.spec` to the production bundle
(a `preview`-backed project, or a `test.skip` guard when `GR_CAPTURE_EXTERNAL_SERVER !== '1'`)
so it stops reading as a red to every future fire. Logged to BACKLOG.

**F-1026-2 — first-sweep failures in `044-start-screen` and `profile-first-boot` were
worker-contention flake, not defects.** Running four suites × two projects uncapped produced
12 failures; the identical set at `--workers=2` produced 2 (both F-1026-1). Baseline and
merged runs at matched parameters are **identical: 26 passed / 2 failed**. Fires gating this
repo should cap workers — an uncapped sweep manufactures reds that cost a drain its budget.

**F-1026-3 — the warm-town cue suppression also fires when prefetch is *disabled* (non-blocking,
cosmetic-only).** `assetPrefetchTownState` publishes `'ready'` when `!enabled` (lite/2D tiers),
which suppresses the "the town is raising…" cue. On those tiers the town loads no 3D GLBs, so
`total > ready` is false and the cue would stay hidden anyway — benign today, but it is
suppression-by-coincidence rather than by intent. Worth tightening if the lite tier ever
gains loadable assets. No corrective task spawned; recorded here.

**Where does the PLAYER see this, in a plain boot?** (Mistake #10 answer) — on the second
visit to town and on every contract launch after the menu has settled: the scene opens without
the "is raising…" cue, because the assets are already warm. `044-start-screen`'s
plain-boot Enter-Town test passes with no `?debug`, and the slice's own menu-idle test asserts
tier-① network activity from an ordinary boot.

## Owner's ask vs delivered

The task ended: *"READY-FOR-GATES + a throttled-network walkthrough table (menu→town→
contract1→town→contract2: what was already warm at each door)."* The runner delivered the
implementation and its spec; **the walkthrough table was not produced** as a document. The
spec's assertions cover the mechanism at each door, so this is an evidence-presentation gap,
not a functional one — but the owner asked for the table by name and should get it. Logged
to BACKLOG as a small follow-up rather than blocking a green slice.
