# F-1511-2 blocker-slide geometry gate

**Slice:** `lane-f1511-2-blocker-slide-geometry-gate`  
**Branch:** `lane/c`  
**Base tip:** `7c7d178c43d5`

## Verdict

**READY-FOR-GATES for the gameplay change; merge gate requires a supported-Node rerun of
`test:node-guards`.** Both routing judges and all landmark consumers are green. The exact node-guard
command ran under the lane shell's unsupported Node 23.11.1 and failed only the known F-1507-1
timeout-semantics guard; all Baron and E2 outcome pins passed unchanged.

## Change

`ClaimJumperEnemy.resolveBlocker()` now uses the existing blocker-centre-relative slide policy for
every blocker when the goal lies inside that blocker's padded span. That geometric head-on gate gives
a stable `avoidanceSide()` fallback without changing the enemy-relative `blockerSlideDirection()`
fall-through that protects wedge routing. No scalar deadband or new policy was added.

## Evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0; existing chunk-size warning only |
| `npx playwright test e2e/landmark-collision.spec.ts e2e/never-trap.spec.ts --workers=1` | rc 0; **18/18 passed** in 1.8m, desktop + mobile |
| `landmark-collision.spec.ts:68` | **2/2 passed**; deterministic county-landmark go-around |
| `never-trap.spec.ts:88` | **2/2 passed**; Night Shift wedge/progress invariant preserved |
| `npm run test:node-guards` | rc 1 on Node 23.11.1; **343/345 passed**. Both reds are the same F-1507-1 timeout-semantics failure (direct plus fixture-owner replay). Baron driver and E2 Baron pinned outcomes passed; no Baron pin moved. |
| `npx playwright test e2e/map-census.spec.ts e2e/fort-landmark-collision.spec.ts --workers=1` | rc 0; **96/96 passed** in 6.4m, desktop + mobile |
| Browser error probes | Green through the specs' assertions; only known Three.Clock/render-demotion warnings appeared |

The F-1512-2 wandering `map-census.spec.ts:43` batch flake did not reproduce; all ten spot cases
passed, so no map drew the known flake in this run.

## Merge classification

**CONDITIONAL GREEN:** the scoped gameplay change is supported by 114/114 browser checks and stable
sim pins. Before merge, the supervisor should rerun `npm run test:node-guards` with the repository's
`.nvmrc` Node 26.4.0 installed normally. The lane does not carry that runtime, and guard infrastructure
is outside this task's firewall.

## Findings

- **F-1511-2 — CURED:** the centre-relative padded-span gate clears the deterministic head-on stall
  without reverting the F-BW-10 wedge cure.
- **F-1507-1 — ENVIRONMENTAL GATE BLOCK:** the lane shell uses Node 23.11.1 while `.nvmrc` pins
  26.4.0; Node 23 applies `--test-timeout` at file granularity and necessarily reds the protected
  per-test-budget assertion. No test or runtime file was changed to mask it.
- **F-1512-2 — NOT OBSERVED:** the known wandering mobile-spot flake drew no map in this run.
