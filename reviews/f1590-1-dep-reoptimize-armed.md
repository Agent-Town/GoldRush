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

---

## Drain verdict — s1590, 2026-08-09 (same fire that authored it)

**MERGED as evidence: `c4115d4e5c98182ea5479696110b80c4c1531455`.** Slice: `lane/b` @ `47b72dffb`, one runner commit, 24 files, **+367 / −0, zero executable bytes**.

### This is a REFUTATION, not another "could not tell"

The distinction matters and should not be flattened in the ledger. Its two predecessors ended in *absence of evidence* — `f1587-2` could not reproduce the stall, `f1589-4` could not even arm the trigger. **This one armed the trigger and the stall still did not appear.** That is evidence of absence, and it is the first of the three that actually narrows the search.

Verified rather than inherited:

- **The arms are real.** `arm-a-1-server.log` line 1 is `8:34:14 AM [vite] (client) Re-optimizing dependencies because lockfile has changed`, **before** the readiness banner; A2 and A3 carry the same line at 08:34:22 and 08:34:29. `arm-b-1-server.log` is **silent** — readiness banner only. So Arm A and Arm B differ in exactly the intended variable and in no other.
- **The mandated convergence run was taken and discarded**, between A3 and B1, and it started silent — so the controls are controls, not residue from the armed runs. (This step existed because the drain that authored the master measured a stray `…because vite config has changed` on the first control after an armed run.)
- **The lever self-healed every time:** `lockfileHash-after=6c42fd2c`, `self-healed=true` in all three Arm A metas. No restore step was needed and none was faked.
- **Blast radius.** `git diff main...lane/b` scoped to `src`, `e2e`, `scripts`, `specs`, `tasks`, `package.json`, `package-lock.json`, `playwright.config.ts` returns **empty**. The conditional cure permitted by item 5 was correctly **not** taken, because item 4 said NOT CONFIRMED.

No battery is owed and none is claimed: zero executable bytes, and no `src/sim/`, `src/systems/` or `src/entities/` path, so F-1460-1 does not bind.

### What is now closed, and what is not

**F-1589-4 is REFUTED.** Dependency re-optimization is not the cause of the 41.8 s stall. Armed first-test durations were **5.6 / 5.4 / 5.4 s** against silent controls at **5.4 / 5.5 / 5.5 s** — inside each other's noise, against a defect that would have had to be ~7× the control. The `Re-optimizing dependencies` line in `artifacts/f1587-2-cold-start/arm-a-server.log` was **coincident with the stall, not causal of it** — a co-occurrence that read as a mechanism because it was the only unusual thing in a three-line log.

**F-1587-2 remains OPEN**, and it has now survived three attempts: not reproducible cold, not reproducible armed, and never reproduced since the single 41.8 s observation.

### F-1590-2 (new, for the next author — NOT chased here)

With re-optimization eliminated, the best-supported remaining hypothesis is that **F-1587-2 is not a cold-start defect at all but a LOAD-SENSITIVITY defect**, i.e. the same class as **F-1589-3** rather than a class of its own. The support is already in the ledger and needs no new run to state:

- The 41.8 s observation happened inside a **multi-arm gate battery**, not in isolation — s1587 was draining `town-music` and the failure was the first test of a batch.
- F-1589-3 measured `wd02-barks:139` **green in isolation on both trees and red only when run 6th in a 7-minute batch** — a defect visible only under accumulated load.
- Every attempt to reproduce F-1587-2 has run the subject test **alone**, which is precisely the condition under which F-1589-3's defect also disappears.
- The fire shell's per-job CPU ceiling (F-1269-1) is the known mechanism by which this shell manufactures timing reds, and it is the reason `--workers=1` is mandatory (F-1270-1).

**If that is right, no cold-start cure could ever have worked, and three tasks were aimed at the wrong axis.** The discriminating experiment is cheap and is the opposite of what has been tried: run the subject test **as the Nth arm of a loaded battery**, not first against a fresh server. ⚠️ **Do not treat this as established** — it is a hypothesis with converging circumstantial support and zero direct measurement, which is exactly the epistemic state F-1589-4 was in before this task refuted it.
