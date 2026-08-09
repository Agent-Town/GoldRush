# F-1589-4 dependency re-optimization stall

## Verdict

**COULD-NOT-ARM. F-1589-4 is not confirmed.** Neither allowed lever produced Vite's required optimizing/re-optimizing log line: renaming `node_modules/.vite` out of Vite's view rebuilt the cache silently, and touching only `package-lock.json`'s mtime produced an ordinary 95 ms startup. The six observations below therefore do not constitute an armed-vs-disarmed causal comparison.

## Pre-flight trigger check

`npm install --no-audit --no-fund` reported `added 2 packages in 175ms`, but did not consume a visible re-optimization window:

- `package-lock.json` stayed byte-identical at SHA-256 `1a1fa48ea5f6998f1f663732de3fe16dce266ba90be4e24c7b7ea3fab26ee863`.
- `node_modules/.vite/deps` kept epoch mtime `1786234282` (`2026-08-09T07:11:22+0700`) before and after the install.
- `npm run build` passed before measurement; Vite built in 1.56 s and the asset-diet check passed.

Raw evidence: `artifacts/f1589-4-dep-reoptimize/preflight.txt`, `preflight-install.txt`, and `preflight-build.txt`.

## Arming attempts

For each planned Arm A repetition, the existing cache was reversibly renamed from `node_modules/.vite` to a repetition-specific `node_modules/.vite-f1589-*` path. `node_modules/.vite/deps` was proven `MISSING` before each fresh server. Vite rebuilt it during the test, but every full server log contained only its readiness output, for example:

> `VITE v8.0.13  ready in 96 ms`

**Required optimization/re-optimization line: NONE in A1, A2, or A3.** These runs are marked unarmed below because the task says a run counts as armed only when that line is present.

The second allowed lever was also tried independently. Touching `package-lock.json` moved its mtime from epoch `1786237449` to `1786237607` while preserving the SHA-256 above and leaving `git diff --stat -- package-lock.json` empty. A fresh server then printed only:

> `VITE v8.0.13  ready in 95 ms`

**Required optimization/re-optimization line after the lockfile-mtime touch: NONE.** Raw proof is in `touch-probe-meta.txt` and `touch-probe-server.log`.

## Six-run observation table

All runs used a fresh Vite process on port 5231, waited only on Vite's readiness line, sent no warming request, and ran the requested single desktop test with one worker. Arm B retained the dependency cache produced by A3.

| Planned arm | Repetition | Armed? | First-test duration | Suite duration | Wall | rc |
|---|---:|:---:|---:|---:|---:|---:|
| A: cache absent | 1 | No | 5.9 s | 7.1 s | 7.77 s | 0 |
| A: cache absent | 2 | No | 5.7 s | 6.5 s | 7.12 s | 0 |
| A: cache absent | 3 | No | 5.6 s | 6.5 s | 7.06 s | 0 |
| B: cache retained | 1 | No, control | 5.7 s | 6.5 s | 7.09 s | 0 |
| B: cache retained | 2 | No, control | 5.6 s | 6.4 s | 7.03 s | 0 |
| B: cache retained | 3 | No, control | 5.7 s | 6.5 s | 7.04 s | 0 |

Each repetition has a full `arm-*-server.log`, raw `arm-*-playwright.txt`, and `arm-*-meta.txt` under `artifacts/f1589-4-dep-reoptimize/`.

## Cure ruling

The observed cache-absent runs were 5.6-5.9 s versus 5.6-5.7 s with the retained cache, with all six passing. That is no 41.8 s stall and no several-times separation, but the absent proof line prevents using these numbers to refute the specific re-optimization hypothesis.

The evidence supports **no cure in this task**. It does not support adding a `GET /` warm-up, waiting for optimization, or pre-warming the dep cache in `scripts/gate-battery.mjs`; none of those treatments has a confirmed cause here. A document warm-up also remains insufficiently targeted in principle because Town is dynamically imported, but this experiment did not reach a state that could compare cures.

## Verification and blast radius

- Zero executable bytes changed; no driver, product code, configuration, lockfile content, or spec was modified.
- The required pre-flight `npm run build` passed. Per the task, no tsc/spec gate or suite rerun is owed for an evidence-only diff; the six subject invocations are measurements, not a claimed regression suite.
- The subject test regenerated `artifacts/era-lights/after/desktop-chrome-day.png`; it was discarded under the evidence-artifact exception because it is outside this task's touch-only evidence directory.

