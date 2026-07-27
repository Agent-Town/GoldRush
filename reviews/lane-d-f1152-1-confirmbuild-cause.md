# Review — lane-d-f1152-1-confirmbuild-cause (F-1152-1 ANSWERED)

**Slice:** `lane-d-f1152-1-confirmbuild-cause` (attempt 3, diagnosis-only)
**Branch/tip:** `lane/perf` @ `f386f27e` · base `cb0682c9`
**Merged:** `4f3223f8` (real `git merge --no-ff`)
**Drained by:** s1153 fire, 2026-07-28

## VERDICT: **ACCEPT.** The five-fire flake hunt has an answer, and it is a **TEST-HARNESS race, not a gameplay bug.**

## What it does
Adds a read-only `BuildSystem.confirmDiagnostics` getter plus a `lastConfirmFailure` tag set at each of `confirm()`'s four false-exits, surfaced through a new debug hook `__GR_TEST__.confirmBuildDiagnostics()`. It then measures which exit actually fires. **No repair was attempted — correctly, the master scoped this to diagnosis only.**

**The answer:** all 8/21 failures took the `!this.valid` exit and, one level deeper, `computeValid()`'s **overlap** check. The state is **one placement stale**: `ghostPos` and `playerPos` still describe the *preceding* placement while a new position is requested, so the ghost overlaps the building just placed.

**The mechanism — ✓ VERIFIED BY ME AT SOURCE, not taken from the report** (all five sites read on the merged tree):
| # | Claim | Verified |
|---|---|---|
| 1 | `__GR_TEST__.teleport()` moves `localActor.group.position` but never refreshes `actionActorPosition` | ✓ `Game.ts:1649-1655` — sets position, `syncHeroVisualHeight`, velocity, e8 reset, `snapRenderState`; **no `updateActionActorPosition()`** |
| 2 | `BuildSystem` holds the separate `actionActorPosition` vector | ✓ `Game.ts:1205-1212` — passed by reference into the ctor |
| 3 | That vector is normally refreshed on the fixed tick | ✓ `Game.ts:2246` `this.updateActionActorPosition()` |
| 4 | **Production** `confirmAction()` refreshes it *immediately* before confirming | ✓ `Game.ts:6887` — `updateActionActorPosition()` on the line before `buildSystem.confirm()` |
| 5 | **Harness** `confirmBuild()` does **not** | ✓ `Game.ts:1862-1867` — straight to `buildSystem.confirm(this.timeAlive)` |

⇒ If a fixed tick happens to land between the harness's `teleport` and `confirmBuild`, placement succeeds; if not, `updateGhostPosition()` uses the stale actor position. **The production path cannot exhibit this race** — it refreshes synchronously. That asymmetry is the whole finding.

## Evidence (measured on the MERGED tree by me, not inherited)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** clean |
| `npm run build` | **rc=0** green — run as a single command, **no pipe** (a pipeline masks the exit code) |
| `node scripts/run-guards.mjs` | **8/8 PASS** |
| `m2-04-gold-stealing.spec.ts` desktop, `--workers=1` | **6 passed / 1 failed** |
| Re-run of the slice's own probe on main (`probe-s1152b… 5`) | **5/15 scenarios failed = 33.3%** |
| `git status --porcelain -- src/ e2e/ scripts/` before merge | **clean** (only the known `artifacts/` churn, F-1136-3) |

**m2-04 classified by ASSERTION, never by the spec's name (F-1152-4 is explicit that the name absorbs two different faults):** the single failure is at **`:226`**, `expect(timeAlive - spawnedAt).toBeLessThan(20)` receiving **20.999…** — the **known budget red** of the F-1147-1 ladder (bisected at `bb7f14c3`). **It is NOT a placement failure**; no `resolves.toBe(true)` assertion failed in this run. Pre-existing and documented since s1148; this slice cannot affect thief routing time.

**The probe re-measurement is the strongest evidence and it confirms the mechanism from the data alone.** Every failure carried `overlapOk:false` with `economyOk/placementOk/rangeOk` all true, `distanceSq:4`, `placeRadius:6` — and critically **`playerPos:{x:2,z:11}` while the requested placement was `(0,13)`**. The actor position the BuildSystem reads is literally the *previous* placement's. My 33.3% sits inside the runner's 38.1% and s1152's interleaved 27–40%.

## Firewall check — additive-only, PASS
The diff is **1419 insertions / 4 deletions**. I read all four deletions: they are the four early-returns being re-braced to record a reason —
`if (!this.mode) return false;` → `{ lastConfirmFailure='mode_off'; return false; }`, and the same shape for `!this.valid`, `!result.ok`, `placed < 0`, each still returning `this.invalidBuild()`.
**Return values identical, control flow identical, no branch added or removed.** The getter is invoked only from the debug hook, which is gated behind `?debug` (`Game.ts:1646`). This meets "must not change return value, control flow or timing".

## Merge classification
Base `cb0682c9`; `git log cb0682c9..main -- src/ scripts/ artifacts/` is **empty**, so all 14 files are **LANE-TOUCHED** with **no MAIN-MOVED collision and no graft required**. Merged onto clean main.

## Findings
- **F-1153-1 (the answer, non-blocking, cure OWED as its own slice).** The harness's positioning promise is not atomic: `teleport()` updates the actor but not `actionActorPosition`. **Recommended cure (the runner's, and I concur): make `__GR_TEST__.teleport()` refresh `actionActorPosition` synchronously**, so *every* immediate harness action inherits an honest position — strictly better than the narrower alternative of patching only `confirmBuild()`, because the same staleness must affect any other harness call that reads the action-actor. ⛔ **Explicitly NOT warranted: a `confirmBuild` retry loop, or the briefing-card dismissal s1152 refuted.**
- **F-1153-2 (scope note).** This **retires s1150's premise** that "placement is reliable through the test runner (4/4)" — 4/4 was a small sample of a ~⅓-failure process. It also explains, without quite proving, s1152's bare-chromium "fifth palisade" cluster: half the failures are the stockpile inheriting the fifth palisade's `(2,9)` ghost. **The report is careful to say it has not proven the two probes identical, and I am keeping that hedge rather than flattening it into one fault.**
- **F-1153-3 (unchanged, not caused here).** `m2-04:226` remains red — a *separate* fault from the placement race, per F-1152-4. The cure for `:226` stays owner-gated under E① F-1131-5 / F-1147-1.

## Player-visible surface
**None.** Diagnostics are debug-gated; no rendering, no sim, no UI change. ⇒ **no GAZETTE item** (the filter law working as designed) and **deploy correctly skipped** — nothing gameplay-affecting shipped.
