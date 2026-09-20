---
task: lane-d-f1152-1-confirmbuild-cause
date: 2026-07-28
kind: diagnosis
---

# F-1152-1 — `confirmBuild()` false-exit cause

## Verdict

`confirmBuild()` failed in **8/21 fresh-page scenarios (38.1%)** across **115 placement attempts**. Every failure took `BuildSystem.confirm()`'s `!this.valid` exit and, one level deeper, `computeValid()`'s overlap check.

The state was one placement stale in all 8 failures. The requested next placement differed from `ghostPos`, while `playerPos` and `ghostPos` still described the preceding placement. The stale ghost therefore overlapped the building just placed.

The race is in the shared debug surface, not `BuildSystem` gameplay logic:

1. `__GR_TEST__.teleport()` moves `localActor.group.position` (`Game.ts:1649-1655`) but does not refresh `actionActorPosition`.
2. `BuildSystem` was constructed with the separate `actionActorPosition` vector (`Game.ts:1205-1212`).
3. That vector is normally refreshed on a fixed tick (`Game.ts:2244-2247`) and immediately before the production confirm path (`Game.ts:6884-6889`).
4. `__GR_TEST__.confirmBuild()` does not perform that immediate refresh (`Game.ts:1862-1867`).
5. If a fixed tick lands between the harness calls, placement succeeds. If it does not, `updateGhostPosition()` uses the previous action-actor position, reproducing the observed 38.1% race.

## False-exit enumeration

Current working-tree line numbers:

| Exit | Source | Diagnostic reason |
|---|---|---|
| Build mode off | `src/systems/BuildSystem.ts:892-895` | `mode_off` |
| Recomputed validity false | `src/systems/BuildSystem.ts:902-905` | `invalid_*` |
| Economy rejected spend | `src/systems/BuildSystem.ts:917-919` | `economy_rejected` |
| Pool/place returned `< 0` | `src/systems/BuildSystem.ts:922-925` | `place_failed` |
| Deepwater wrapper short-circuit | `src/game/Game.ts:1864` | `deepwater_claim` |

No additional false exit exists in `BuildSystem.confirm()`. `invalidBuild()` at `BuildSystem.ts:1401-1404` is the common false-return helper used by the last three BuildSystem branches, not a sixth independent condition.

The `!valid` branch expands in `computeValid()` as:

| Sub-check | Source |
|---|---|
| max count | `src/systems/BuildSystem.ts:1481` |
| insufficient gold | `src/systems/BuildSystem.ts:1482` |
| terrain/placement contract | `src/systems/BuildSystem.ts:1483` |
| range from action actor | `src/systems/BuildSystem.ts:1484-1487` |
| overlap with an existing/reserved footprint | `src/systems/BuildSystem.ts:1488` |

## Measurement

Command:

```text
node scripts/probe-s1152b-confirmbuild-cause.mjs 7
```

Full per-scenario output:

```text
s1152b-1 trajectory run 1: failed — stockpile x=0 reason=invalid_overlap ghost=(2,9) player=(2,11)
s1152b-1 trajectory run 2: failed — stockpile x=0 reason=invalid_overlap ghost=(2,9) player=(2,11)
s1152b-1 trajectory run 3: passed
s1152b-2 trajectory run 1: passed
s1152b-2 trajectory run 2: passed
s1152b-2 trajectory run 3: failed — stockpile x=0 reason=invalid_overlap ghost=(2,9) player=(2,11)
s1152b-3 trajectory run 1: passed
s1152b-3 trajectory run 2: failed — palisade x=-1 reason=invalid_overlap ghost=(-2,9) player=(-2,11)
s1152b-3 trajectory run 3: passed
s1152b-4 trajectory run 1: passed
s1152b-4 trajectory run 2: passed
s1152b-4 trajectory run 3: passed
s1152b-5 trajectory run 1: failed — stockpile x=0 reason=invalid_overlap ghost=(2,9) player=(2,11)
s1152b-5 trajectory run 2: passed
s1152b-5 trajectory run 3: passed
s1152b-6 trajectory run 1: failed — palisade x=1 reason=invalid_overlap ghost=(0,9) player=(0,11)
s1152b-6 trajectory run 2: passed
s1152b-6 trajectory run 3: failed — palisade x=1 reason=invalid_overlap ghost=(0,9) player=(0,11)
s1152b-7 trajectory run 1: failed — palisade x=0 reason=invalid_overlap ghost=(-1,9) player=(-1,11)
s1152b-7 trajectory run 2: passed
s1152b-7 trajectory run 3: passed

SUMMARY scenarios=21 placementAttempts=115 passedScenarios=13 placementFailures=8 placementFailureRate=0.38095238095238093
```

Every full failure object is retained in `artifacts/f1152-1-confirmbuild/invocation-01.json` through `invocation-07.json`; the aggregate is `summary.json`.

Common failure state:

- `mode=true`, `valid=false`, `deepwaterClaim=false`
- `economyOk=true`, `placementOk=true`, `rangeOk=true`, `overlapOk=false`
- `distanceSq=4`, `placeRadius=6`
- gold and cost were both `0`
- count remained below max count

### Failing-placement distribution

| Requested placement | Failures |
|---|---:|
| palisade `x=-2` | 0 |
| palisade `x=-1` | 1 |
| palisade `x=0` | 1 |
| palisade `x=1` | 2 |
| palisade `x=2` | 0 |
| stockpile `x=0,z=13` after fifth palisade | 4 |

The palisade failures do **not** cluster on one `x`; they occur on three successive positions. The stronger cluster is structural: every failure reuses the immediately preceding placement. Half the failures occur when the requested stockpile inherits the fifth palisade's `(2,9)` ghost, which may explain why a bare probe looked like a fifth-palisade cluster without proving the two probes are identical.

The measured 38.1% scenario failure rate corroborates s1152's 27–40% range.

## Recommended cure — not implemented

Make `__GR_TEST__.teleport()` update `actionActorPosition` synchronously after moving the local actor, so the debug hook's positioning promise is atomic for all immediate harness actions. The narrower alternative is to make `__GR_TEST__.confirmBuild()` mirror production `confirmAction()` by calling `updateActionActorPosition()` immediately before `BuildSystem.confirm()`. No retry and no briefing dismissal is warranted.

## Self-checks

### TypeScript

```text
$ npx tsc --noEmit
[no output]
rc=0
```

### Build

```text
$ npm run build
> gold-rush@0.1.0 build
> tsc && vite build && node scripts/asset-diet.mjs
vite v8.0.13 building client environment for production...
✓ 2001 modules transformed.
✓ built in 1.25s
[asset-diet] 235 terrain/landmark GLBs 592176964 -> 92768500 bytes (84% cut); 53 plate-class PNGs 183518013 -> 24346570 bytes (87% cut).
rc=0
```

### Guards

```text
$ node scripts/run-guards.mjs
PASS  rc=0  6s  test:node-guards
PASS  rc=0  0s  test:power-budget
PASS  rc=0  4s  test:stats
PASS  rc=0  1s  test:accounts
PASS  rc=0  4s  test:mp
PASS  rc=0  79s  test:deploy-contract
PASS  rc=0  1s  test:deploy-site-contract
PASS  rc=0  0s  test:task-guards

guards: 8/8 passed
```

### Default m2-04 suite

```text
$ npx playwright test e2e/m2-04-gold-stealing.spec.ts --project=desktop-chrome --workers=1 --reporter=list
Running 7 tests using 1 worker
  ✓  1 ... › steal debits bank through gold_stolen and shows a float
  ✓  2 ... › fleeing carrier moves toward its own spawn edge and despawns
  ✓  3 ... › killed carrier drops reclaimable gold pickup
  ✓  4 ... › bank cap blocks pickup reclaim until room exists
  ✘  5 ... › thief routes around a finite palisade line to steal
  ✓  6 ... › real waves spawn no thieves without a stockpile
  ✓  7 ... › loose pickup can be re-stolen without another Economy event

Error: expect(received).toBeLessThan(expected)
Expected: < 20
Received:   20.999999999999982
> 226 | expect(...).toBeLessThan(20);

1 failed
6 passed (45.1s)
```

Classification: **known budget red at `:226`**. This run had no `resolves.toBe(true)` placement failure.

### Additive-only `src/` diff

The exact complete `git diff -- src/` output is also retained verbatim at `artifacts/f1152-1-confirmbuild/src.diff`.

```diff
diff --git a/src/game/Game.ts b/src/game/Game.ts
index 91610e74..b6d23258 100644
--- a/src/game/Game.ts
+++ b/src/game/Game.ts
@@ -1866,6 +1866,15 @@ export class Game {
           this.publishDiagnostics();
           return placed;
         },
+        confirmBuildDiagnostics: () => {
+          const diagnostics = this.buildSystem.confirmDiagnostics;
+          const deepwaterClaim = Boolean(this.deepwaterClaim);
+          return {
+            ...diagnostics,
+            deepwaterClaim,
+            reason: deepwaterClaim ? 'deepwater_claim' as const : diagnostics.reason,
+          };
+        },
         testAudio: (name: string) => this.audio.play(name),
diff --git a/src/systems/BuildSystem.ts b/src/systems/BuildSystem.ts
index 1108fb4f..87272711 100644
--- a/src/systems/BuildSystem.ts
+++ b/src/systems/BuildSystem.ts
@@ -41,6 +41,35 @@ export type BuildableSnapshot = {
+export type ConfirmBuildDiagnostics = {
+  reason:
+    | 'mode_off'
+    | 'invalid_max_count'
+    | 'invalid_economy'
+    | 'invalid_placement'
+    | 'invalid_range'
+    | 'invalid_overlap'
+    | 'invalid_unknown'
+    | 'economy_rejected'
+    | 'place_failed'
+    | null;
+  mode: boolean;
+  valid: boolean;
+  selectedBuildable: BuildableId;
+  ghostPos: { x: number; z: number };
+  playerPos: { x: number; z: number };
+  count: number;
+  maxCount: number;
+  gold: number;
+  cost: number;
+  economyOk: boolean;
+  placementOk: boolean;
+  rangeOk: boolean;
+  overlapOk: boolean;
+  distanceSq: number;
+  placeRadius: number;
+};
@@ -386,6 +415,7 @@ export class BuildSystem {
+  private lastConfirmFailure: 'mode_off' | 'invalid' | 'economy_rejected' | 'place_failed' | null = null;
@@ -807,8 +837,62 @@ export class BuildSystem {
+  get confirmDiagnostics(): ConfirmBuildDiagnostics {
+    const def = this.selectedDef();
+    const count = this.countFor(def.id);
+    const maxCount = this.maxCountFor(def);
+    const cost = def.costCurve(count);
+    const economyOk = this.economy.gold >= cost;
+    const placementOk = this.matchesPlacement(def, this.ghostPos);
+    const dx = this.ghostPos.x - this.heroPosition.x;
+    const dz = this.ghostPos.z - this.heroPosition.z;
+    const distanceSq = dx * dx + dz * dz;
+    const placeRadius = this.placeRadius(def.id);
+    const rangeOk = distanceSq <= placeRadius * placeRadius;
+    const overlapOk = !this.overlapsExisting(def.id, this.ghostPos);
+    let reason: ConfirmBuildDiagnostics['reason'];
+    if (this.lastConfirmFailure === 'invalid') {
+      reason =
+        count >= maxCount
+          ? 'invalid_max_count'
+          : !economyOk
+            ? 'invalid_economy'
+            : !placementOk
+              ? 'invalid_placement'
+              : !rangeOk
+                ? 'invalid_range'
+                : !overlapOk
+                  ? 'invalid_overlap'
+                  : 'invalid_unknown';
+    } else {
+      reason = this.lastConfirmFailure;
+    }
+    return {
+      reason,
+      mode: this.mode,
+      valid: this.valid,
+      selectedBuildable: def.id,
+      ghostPos: { x: this.ghostPos.x, z: this.ghostPos.z },
+      playerPos: { x: this.heroPosition.x, z: this.heroPosition.z },
+      count,
+      maxCount,
+      gold: this.economy.gold,
+      cost,
+      economyOk,
+      placementOk,
+      rangeOk,
+      overlapOk,
+      distanceSq,
+      placeRadius,
+    };
+  }
+
   confirm(at: number, position?: { x: number; z: number }): boolean {
-    if (!this.mode) return false;
+    this.lastConfirmFailure = null;
+    if (!this.mode) {
+      this.lastConfirmFailure = 'mode_off';
+      return false;
+    }
@@ -816,7 +900,10 @@ export class BuildSystem {
-    if (!this.valid) return this.invalidBuild();
+    if (!this.valid) {
+      this.lastConfirmFailure = 'invalid';
+      return this.invalidBuild();
+    }
@@ -827,10 +914,16 @@ export class BuildSystem {
-    if (!result.ok) return this.invalidBuild();
+    if (!result.ok) {
+      this.lastConfirmFailure = 'economy_rejected';
+      return this.invalidBuild();
+    }
     const placed = this.place(def.id, this.ghostPos);
-    if (placed < 0) return this.invalidBuild();
+    if (placed < 0) {
+      this.lastConfirmFailure = 'place_failed';
+      return this.invalidBuild();
+    }
diff --git a/src/vite-env.d.ts b/src/vite-env.d.ts
index c6156ec5..35a5d6a7 100644
--- a/src/vite-env.d.ts
+++ b/src/vite-env.d.ts
@@ -10,6 +10,10 @@ type GrBuildableId = any;
+type GrConfirmBuildDiagnostics = Omit<import('./systems/BuildSystem').ConfirmBuildDiagnostics, 'reason'> & {
+  reason: import('./systems/BuildSystem').ConfirmBuildDiagnostics['reason'] | 'deepwater_claim';
+  deepwaterClaim: boolean;
+};
@@ -1173,6 +1177,7 @@ interface Window {
+    confirmBuildDiagnostics: () => GrConfirmBuildDiagnostics;
```

The diff changes no return value, branch condition, call order, wait, retry, or production behavior. The only writes in `confirm()` are diagnostic labels immediately before its existing returns.

### Independent review

`codex review --uncommitted` traced the same stale `actionActorPosition` seam and independently ran `tsc`, build, and guards successfully. Its review agent then recursively invoked `codex review --uncommitted`; that recursive run was stopped. No review finding was emitted before the stop.

## Scope

No repair was shipped. The briefing dismissal, retry loop, default spec, pathing budget, and all retained probes remain untouched.

Final status:

```text
 M src/game/Game.ts
 M src/systems/BuildSystem.ts
 M src/vite-env.d.ts
?? artifacts/f1152-1-confirmbuild-cause.md
?? artifacts/f1152-1-confirmbuild/
?? scripts/probe-s1152b-confirmbuild-cause.mjs
```

Every listed path is in the task's TOUCH-ONLY set.
