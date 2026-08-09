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

---

## Drain verdict — s1590, 2026-08-09

**MERGED as evidence: `12190838aaf3415ad4c4b03e5c377c06af9c9919`.** Slice: `lane/b` @ `14c744c8e`, one runner commit, 24 files, **+3788 / -0, zero executable bytes**.

### The report is accurate, and the negative result is the right one

Verified rather than inherited:

- **Blast radius.** `git diff main...lane/b --name-only` is 23 files under `artifacts/f1589-4-dep-reoptimize/` plus this review. The same diff scoped to `src e2e scripts specs tasks package.json package-lock.json playwright.config.ts` returns **empty**. The firewall held exactly.
- **The arm really was absent.** `arm-a-1-server.log` contains only the readiness banner; `arm-a-1-meta.txt` records `cache-deps-before-server=MISSING`, `optimization-line=` (empty), `rc=0`, test 5.9 s. The runner did not dress a miss as a hit.
- **No cure shipped**, as the master required. The verdict is one of the three allowed words.

Per the master's own terms and the `f1587-2` precedent, **no tsc/build/spec battery is owed** — the drain checks the diff rather than the claim, and the diff changes nothing executable. F-1460-1 does not bind: no `src/sim/`, `src/systems/` or `src/entities/` path is touched.

### F-1590-1 — the runner could not have armed it, because both prescribed levers were structurally incapable

This is the reusable half, and it moves the fault off the runner and onto the master. Read from vite's own source (`node_modules/vite/dist/node/chunks/node.js`) and then **proved by manufacture** (`artifacts/f1590-1-arm-lever/`, three runs, transcripts recorded):

- `:31487` prints `Re-optimizing dependencies because lockfile has changed` **only inside `if (cachedMetadata)`**. Lever 1 — renaming `node_modules/.vite` away — deletes the very metadata whose mismatch produces the message, so the branch is unreachable **by construction**. A cold cache optimizes *silently*; it never *re*-optimizes.
- `:32019-32031` — `getLockfileHash()` hashes the lockfile's **content** (`getHash(readFileSync(lockfilePath, 'utf-8'))`). Lever 2 — touching its mtime — cannot move it.

So `COULD-NOT-ARM` was the only reachable verdict, and the runner reaching it honestly — rather than relabelling six unarmed runs as an A/B — is the task working as designed.

**The lever that does work**, measured this fire: leave `deps/` intact and stale only the stored hash in `node_modules/.vite/deps/_metadata.json`. Run 1 printed the premise line verbatim (`8:21:45 AM [vite] (client) Re-optimizing dependencies because lockfile has changed`); the converged control run was silent. `node_modules/**` is untracked, so this arms the trigger **without touching `package-lock.json` at all** — it satisfies the firewall that blocked the runner rather than needing it lifted. It also self-heals: vite rewrites the correct hash as part of re-optimizing (`lockfileHash-after=6c42fd2c`, `self-healed=true`).

### What the six runs DO establish, stated so it is not lost

The table is not an armed-vs-disarmed comparison — the runner is right to refuse that reading. But it is not nothing: with the dep cache **fully absent**, first-test duration was 5.6–5.9 s against 5.6–5.7 s warm, all six rc=0. A from-scratch dep optimization on this tree therefore costs **~0.2 s, not ~36 s**. That bounds one branch of the hypothesis — bulk optimization work is not the stall — and leaves the *re*-optimization path (which additionally invalidates an existing cache while a client is attached) as the part still untested.

**F-1589-4 remains OPEN. F-1587-2 remains OPEN.** Two non-reproductions from two premises bound the defect's rate; neither touches its existence.

