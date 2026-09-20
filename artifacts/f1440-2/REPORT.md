# f1440-2 — E1 perf gate without a frozen baseline

Status: **READY-FOR-GATES**. The supervisor still owes the explicitly requested different-machine run; this lane is the same Apple M4 Max class and browser identity as the committed baseline.

## Change

`e2e/e1-perf-pass.spec.ts` is restored from `452eb747` with one opt-in boundary:

- `E1_PERF_COMPARE_BASELINE=1` enables committed census and pixel comparisons.
- Without the flag, the spec does not read `census-before-*.json` or `before/*.png`.
- The 200 draw-call cap, absolute `frameBudgetMs * collapseRatio` p95 cap, census/snapshot publication, and both page-error checks are unchanged.

## Default-path proof

Command shape: `E1_PERF_ARTIFACT_DIR=artifacts/f1440-2/default-run E1_PERF_STAGE=default npx playwright test e2e/e1-perf-pass.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1` on scratch port 5239.

Result: **2 passed in 2.0 minutes**, with no `before/` directory in the fresh artifact root. This proves the default path did not read a committed census or screenshot baseline.

The default path executes **12 assertions per project, 24 total**:

- five `pressure.maxDrawCalls <= 200` assertions;
- five `pressure.p95Ms <= Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio` assertions;
- census-page console/page errors equal `{ console: [], page: [] }`;
- snapshot-page console/page errors equal `{ console: [], page: [] }`.

The census and 20 snapshots were published under `artifacts/f1440-2/default-run/`.

Different-machine caveat: both the committed baseline and this run report `ANGLE Metal Renderer: Apple M4 Max` with the same Chromium user-agent. This is a clean independent run without baseline files, but not honest evidence of different hardware. The draining supervisor must take that final proof on another host.

## Manufactured regression

Target: `artifacts/e1-perf-pass/census-before-desktop-chrome.json`.

- SHA-256 before: `7b507a44198c9a06e9bd108e2ceff08fa05c948f22f7edd49eaf97953f46d7e3`
- Temporary mutation: `e1-night-shift.pressure.maxDrawCalls` from `139` to `0`
- Opt-in: `E1_PERF_COMPARE_BASELINE=1`
- Result: **rc=1**

```text
Error: e1-night-shift draw calls
Expected: <= 0
Received:    139
MANUFACTURED_REGRESSION_RC=1
```

The mutation and temporary census were removed. SHA-256 after restoration: `7b507a44198c9a06e9bd108e2ceff08fa05c948f22f7edd49eaf97953f46d7e3` — byte-identical.

## Draw-call reproducibility

Fresh desktop `e1-dry-gulch` samples were **137, 137, 137**. On this host the current count is reproducibly 137, not the committed 136. Evidence: the default census plus `draw-samples/census-sample-{2,3}-desktop-chrome.json`.

## Gates and adjacency

- `npx tsc --noEmit`: clean
- `npm run build`: green
- scoped default Playwright, both projects, `--workers=1`: 2/2 passed
- opt-in manufactured regression: rc=1 on the named draw-call contract
- `rg "artifacts/e1-perf-pass" e2e --glob '!e1-perf-pass.spec.ts'`: no adjacent suite reads this artifact tree

Independent review raised two pre-existing/out-of-scope concerns: ordinary default publication targets retained `after` paths when no artifact override is supplied, and Night Shift pressure snapshots disable carried lanterns. The first conflicts with this task's explicit instruction to preserve publication exactly; the second is unchanged from `452eb747`. Neither was folded into this firewalled corrective.
