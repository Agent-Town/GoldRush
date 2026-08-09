# F-1590-1 dependency re-optimization A/B

## Verdict

**NOT CONFIRMED.** All three Arm A repetitions provably entered Vite's lockfile re-optimization path, yet their first-test durations (5.4–5.6 s) remained in the same band as the silent Arm B controls (5.4–5.5 s). No run approached the prior 41.8 s stall or separated from control by several times. F-1589-4's dependency re-optimization hypothesis is therefore not confirmed.

## Pre-flight

- Lane `lane/b` had no ahead commits and no uncommitted changes.
- Both arm-lever sentinels and the predecessor-report sentinel were present at the required locations.
- `npm install --no-audit --no-fund` returned rc=0: `up to date in 327ms`.
- The pre-flight `npm run build` returned rc=0: tsc passed, Vite 8.0.13 built 2,184 modules in 1.51 s, and asset-diet passed.
- The required post-build cleanliness line was empty. `git diff --stat -- package-lock.json` was also empty.

Raw pre-flight summary: `artifacts/f1590-1-dep-reoptimize-armed/preflight.txt`.

## Arm proof

Each Arm A repetition kept `node_modules/.vite/deps/` intact and wrote only `lockfileHash: "deadbeef"` in its untracked `_metadata.json`. Each fresh server ran on port 5231, the runner waited only for Vite's own readiness line, sent no warming request, and then invoked the requested one-test Playwright command with `GR_CAPTURE_EXTERNAL_SERVER=1` and `GR_CAPTURE_BASE_URL=http://127.0.0.1:5231`.

- A1: `8:34:14 AM [vite] (client) Re-optimizing dependencies because lockfile has changed`
- A2: `8:34:22 AM [vite] (client) Re-optimizing dependencies because lockfile has changed`
- A3: `8:34:29 AM [vite] (client) Re-optimizing dependencies because lockfile has changed`

Vite restored `lockfileHash` from `deadbeef` to `6c42fd2c` after every Arm A repetition. The lever self-healed and required no restore step.

## Results

| Arm | Repetition | Armed? | First-test duration | Suite duration | Wall | rc | Optimizer line after readiness? |
|---|---:|:---:|---:|---:|---:|---:|:---:|
| A | 1 | Yes | 5.6 s | 6.7 s | 7.92 s | 0 | No |
| A | 2 | Yes | 5.4 s | 6.2 s | 7.41 s | 0 | No |
| A | 3 | Yes | 5.4 s | 6.2 s | 7.38 s | 0 | No |
| Convergence (discarded) | 1 | No, silent | 5.4 s | 6.2 s | 7.37 s | 0 | No |
| B | 1 | No, silent control | 5.4 s | 6.2 s | 7.33 s | 0 | No |
| B | 2 | No, silent control | 5.5 s | 6.3 s | 7.43 s | 0 | No |
| B | 3 | No, silent control | 5.5 s | 6.3 s | 7.46 s | 0 | No |

The required throwaway convergence run was taken between A3 and B1 and discarded from the comparison. It started silently. B1–B3 were then identical silent controls: none printed an optimization line at startup or during the test.

## Optimizer activity during the test window

No optimization line appeared after the readiness banner in A1, A2, A3, the discarded convergence run, B1, B2, or B3. In particular, no run logged `new dependencies optimized`, `optimized dependencies changed. reloading`, or another optimization/reload line during its test window. The only optimizer lines in all seven full server logs are the three required Arm A lockfile lines, each before readiness.

## Cure ruling and verification scope

The evidence supports **no cure**. It does not support adding a settle wait, a `GET /` warm-up, or any other branch to `scripts/gate-battery.mjs`; the armed cause did not reproduce the stall. Accordingly, neither gate-battery file nor any other executable product/driver byte changed.

The pre-flight build passed, and all seven measured subject invocations returned rc=0. Because the verdict is NOT CONFIRMED and the tracked diff is evidence-only, tsc/build/suites are provably unaffected beyond the already-recorded pre-flight build; no unrun suite is claimed. Full server logs, Playwright output, and per-run metadata are under `artifacts/f1590-1-dep-reoptimize-armed/`.
