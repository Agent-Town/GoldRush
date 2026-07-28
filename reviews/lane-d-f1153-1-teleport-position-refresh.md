# Review — lane-d-f1153-1-teleport-position-refresh

**Slice:** F-1153-1 — the CURE for F-1152-1 (harness `teleport()` left `actionActorPosition` one placement stale)
**Branch:** `lane/perf` · **Tip:** `892116c1` · **Base:** `fe35b8f1` · **Drained:** s1156, 2026-07-28
**Merge:** path-scoped onto main (see hash in the drain commit)

## Verdict

**PASS — and the cure is GONE, not REDUCED.** The runner met the strict bar s1154/s1155 set for this slice (before *and* after rates, with n, in interleaved arm order) and then some: four arms in **ABBA** order, 21 scenarios each. I re-derived every headline number from the raw artifacts it committed, and re-measured the cured arm **on merged main** — because main moved the probe's own `SOURCE` file after this lane forked.

## What it does

`window.__GR_TEST__.teleport()` moved `localActor.group.position` but never refreshed `actionActorPosition` — the separate vector `BuildSystem` holds by reference (`Game.ts:1211`) and uses as the build-ghost origin. Production's `confirmAction()` refreshes it immediately before confirming (`Game.ts:6888`); the harness `confirmBuild()` did not. A test that teleported and immediately confirmed was therefore validating placement against the **previous** placement's position, which `computeValid()` rejected as `invalid_overlap`.

The cure adds two lines to the `teleport()` body: the production seam `updateActionActorPosition()`, plus a multiplayer fallback for the case where `actionActor !== localActor`.

**This is a test-harness defect, not a gameplay bug** — re-confirmed at source this drain: the whole `__GR_TEST__` object is constructed only under `!__GR_RELEASE_E1__ && ?debug` (`Game.ts:1646`). Release builds never see it.

## Evidence

### Arm rates — re-derived by the drain from the committed raw summaries, not read off the report

| Order | Arm | Scenarios | Placement failures | Rate | Failure reasons |
|---|---|---:|---:|---:|---|
| 1 | before-ab | 21 | 10 | 47.6% | all `invalid_overlap` |
| 2 | after-ab | 21 | 0 | 0% | — |
| 3 | after-ba | 21 | 0 | 0% | — |
| 4 | before-ba | 21 | 10 | 47.6% | — |
| | **Combined** | **42 / 42** | **20 → 0** | **47.6% → 0%** | |

Arm order is **interleaved ABBA**, so time-on-box is controlled — the confound that invalidated s1152's first result. The two before-arms agree to the scenario (10/21 both times), which is itself a stability check.

### The drain's own re-measurement — on merged main, cured arm

Main moved `e2e/f1148-1-trajectory-probe.spec.ts` (s1155's F-1152-2/F-1152-3 fixes) **after** this lane forked, and that file is the probe's `SOURCE`. The lane's numbers were therefore measured against a spec that no longer exists on main.

⚠️ **An after-arm alone would have been worthless here**, and not only for the usual reason. It is consistent with two different worlds: *the src fix cures the flake*, or *s1155's spec edit stopped the spec reproducing it*. A green re-run cannot tell those apart. So the drain ran a **runtime mutation control**: the two cure lines were removed from `Game.ts` **on merged main, against main's current spec**, the probe re-run, and the cure then restored.

| Arm (drain-side, merged main, main's current spec) | Scenarios | Placement failures | Rate |
|---|---:|---:|---:|
| Cure present | 21 | **0** | **0%** |
| **Cure reverted (runtime mutation control)** | 21 | **8** | **38.1%** |

The control's 8 failures were **all `invalid_overlap` with `overlapOk:false`**, and their recorded `playerPos` again reads the *preceding* placement — the same mechanism signature, on today's spec. Its 38.1% sits inside every prior independent estimate (s1153's 33.3%, the runner's 38.1%, s1152's 27–40%, this lane's 47.6%).

➡️ **So the flake still reproduces on main's current spec, and only the two lines suppress it.** s1155's spec change is exonerated as the cause of the green, and the cure is confirmed on the tree it actually landed on.

The cure was then **restored byte-identically** — `git diff` against the index is empty, so the mutation left nothing behind.

Raw records: `artifacts/s1156-drain-remeasure/summary.json` (cured), `artifacts/s1156-mutation-control/summary.json` (control).

### Gates (merged tree)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | **rc=0 (captured directly, not through a pipe)** |
| `npm run test:guards` | rc=0, **8/8** |
| Probe scenarios on merged main | 21/21 passed (cured); Playwright reporter surfaced no console/page errors |
| Boot surface | unchanged — harness is `?debug`-gated and absent from release builds (`Game.ts:1646`) |

### The m2-04 budget count rose 2 → 7, and that is unmasking, not a regression

The report states this without explaining it, so the drain settled it **at source rather than by argument**. `actionActorPosition` has exactly three references in `src/` (`Game.ts:392` declaration, `:998` the copy, `:1211` the injection into `BuildSystem`), and inside `BuildSystem` the injected vector is `heroPosition`, used only for ghost origin / placement-point / validity math. **There is no path from it to thief pathing, combat or the economy clock.** The `:226` assertion is a thief-journey time bound, so the cure cannot causally move it.

What the cure *does* do is let tests that previously died at the placement step run on to `:226`. Before: 6 placement + 2 budget = 8 failures. After: 0 placement + 7 budget = 7. Net m2-04 serial failures **fell** 8 → 7 while an entire failure class was eliminated.

⚠️ The `:226` budget red is a **separate, pre-existing** fault (F-1152-4's second face) and is now the dominant m2-04 red. It was partly hidden behind the placement flake; it is not new, and nothing in this slice widened it — `e2e/` is untouched.

## Merge classification

| File | Class | Resolution |
|---|---|---|
| `src/game/Game.ts` | LANE-TOUCHED, main never moved it since `fe35b8f1` | clean apply |
| `scripts/probe-s1152b-confirmbuild-cause.mjs` | LANE-TOUCHED, main never moved it | clean apply |
| `artifacts/f1153-1-teleport-refresh{,.md}` (97 files) | pure add | clean apply |
| `e2e/f1148-1-trajectory-probe.spec.ts` | **MAIN-MOVED only** (s1155) — lane did not touch it | left at main's version; see below |
| `scripts/stream-showcase-queue.test.mjs` | MAIN-MOVED only (s1155 F-1154-5) | left at main's version |

**s1155's flagged hazard (its handoff item I) is resolved with no graft.** It warned that it had edited `e2e/f1148-1-trajectory-probe.spec.ts` on main while lane-d was live, and that this drain would have to classify that file. The lane never touched it, so there is no conflict — but the probe *reads* it (`SOURCE`, line 14) and refuses to run if its `placeBuildableAt` helper or artifact-dir line changed shape (lines 40–41). Both survived s1155's edit, and the probe built and ran cleanly on main, which is the empirical proof the two changes compose.

## Findings

**F-1156-1 (🟡 non-blocking, cosmetic-but-misleading):** the two cure lines are **equivalent to one**. `updateActionActorPosition()` is a pure `actionActorPosition.copy(actionActor.group.position)` (`Game.ts:997-999`) with no other effect. When `actionActor === localActor` the second line is a no-op; when they differ the second line **overwrites the first entirely**. So in every case the net result is `actionActorPosition = localActor.group.position`, and the seam call contributes nothing observable. This is harmless and it faithfully satisfies scope items 2+3 as written, but the code reads as though two distinct things happen. Worth collapsing — or worth a comment saying the seam call is deliberate for symmetry with production. **Not corrective-task-worthy on its own; fold into the next `Game.ts` harness touch.**

**F-1156-2 (🟡 non-blocking, inherited):** `e2e/m2-04-gold-stealing.spec.ts:226` (`toBeLessThan(20)`, observed ~20.999) is now the dominant m2-04 red and no longer has a louder fault in front of it. It has been deferred repeatedly as "the known budget red". With the placement class gone, it is the next real question in this file. ⛔ Per this slice's own firewall, the answer is **not** to widen the constant.

## Firewall

**PASS.** Scope forbade touching `e2e/m2-04-gold-stealing.spec.ts`, widening `:226`, adding a `confirmBuild` retry loop or a sleep, refactoring the 22 duplicate `placeBuildableAt` helpers (F-1150-2), and changing `confirm()`/`computeValid()`/`BuildSystem`. Verified by `git diff --name-status fe35b8f1 lane/perf`: the only non-artifact files touched are `src/game/Game.ts` (two added lines, inside the `teleport()` body) and `scripts/probe-s1152b-confirmbuild-cause.mjs` (one line, making the artifact directory environment-selectable so four arms could keep their raw records). **No `e2e/` file was modified.**

Scope item 3 — the identity check that the master called "the single most likely way this task ships a no-op that looks like a cure" — was answered with source evidence (`Game.ts:373-374`, `:912-918`, `:2636-2643`, `:3241-3243`) rather than assumed, and produced the multiplayer fallback.
