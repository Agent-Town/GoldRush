# lane-c-f1148-1-trajectory-split — review (s1150)

- **Slice:** `lane-c-f1148-1-trajectory-split` (measurement-only; F-1148-1)
- **Branch / tip:** `lane/e2-arsenal` @ `5bf6a101` ("chore: retain blocked trajectory probe")
- **Base (merge-base):** `5be29c6e`
- **Done-move:** `tasks/done/20260728-025106-lane-c-f1148-1-trajectory-split.md`
- **§3.0 `drain-block-check`:** ✅ **CLEAR** — run as the first command, before classification.

## Verdict

**MERGED as a LAWFUL STOP — retention landing, not a completed measurement.**
The runner did not deliver the three-arm classification. It stopped honestly under the task's own
two-strike rule, reported **UNMEASURED**, invented no data, and committed the instrument it had
built. F-1148-1 remains **OPEN**. What merges here is the probe + the report, so the next attempt
inherits an instrument instead of rebuilding one.

**The runner's judgement was correct and its report is a model of the form** — it declined to infer
a pathing result from a placement failure, which is exactly the trap that would have produced a
confident wrong answer.

## What it does

`scripts/probe-f1148-1-trajectory.mjs` (104 lines, new) boots the m2-04 wall seed in an isolated
Chromium context, builds the five-palisade line + stockpile through `__GR_TEST__`, spawns the south
thief, and samples its world `x/z` in a `requestAnimationFrame` loop until `gold_stolen`. It reports
sim time, summed path distance, X floor/ceiling and sample count per run, and rejects zero-sample or
zero-distance runs as `VOID`. `artifacts/f-1148-1-trajectory-split.md` (80 lines, new) is the stop
report.

Zero `src/`. Zero `e2e/`. The probe is a standalone script that nothing imports.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** (see caveat below — it does **not** cover this slice's file) |
| `node --check scripts/probe-f1148-1-trajectory.mjs` | **rc=0** — the gate that actually covers the merged file |
| `npm run build` | **rc=0**, built in 1.12 s |
| `node scripts/run-guards.mjs` | **8/8 PASS, rc=0** (see F-1150-3 — an intervening 7/8 was my own measurement load, not the tree) |
| `e2e/m2-04-gold-stealing.spec.ts` desktop-chrome | 6 passed / 1 failed — **fingerprint unchanged**, fails at `:226` (budget `20.99… < 20`), the known F-1147-1/F-1148-1 red |
| `e2e/m2-04-gold-stealing.spec.ts` `--repeat-each=3` (wall test) | 3/3 fail at `:226` — **never at placement** |
| `e2e/m2-04-gold-stealing.spec.ts` blob, main vs lane | `677577ff9c0e…` on **both** — **byte-identical** |
| `src/` or `e2e/` files in `5bf6a101` | **none** (2 files: the probe + the report) |

**Gate-coverage caveat, stated rather than assumed:** `tsconfig` omits `scripts/`, so `tsc` rc=0 is
*not* evidence about the merged probe. `node --check` was run for that reason. A green gate that
does not cover the file under test is not a green for that file.

**Bar clauses from s1149's handoff:** the measurement clauses (three arms, per-run values, sample
count control, arm-C scratch port) are **N/A — the measurement did not occur and is declared
UNMEASURED.** The clauses that *do* apply to a stop all pass: zero committed `src/`
(`git status --porcelain -- src/` empty), zero `e2e/` diff, and the declared **REJECT** condition —
editing `e2e/m2-04-gold-stealing.spec.ts` to force a green `:226`/`:227` — provably never happened
(blob hashes identical on main and lane).

## Merge classification

| File | Class | Handling |
|---|---|---|
| `scripts/probe-f1148-1-trajectory.mjs` | LANE-TOUCHED, pure add | `git checkout 5bf6a101 --` (main never had the path) |
| `artifacts/f-1148-1-trajectory-split.md` | LANE-TOUCHED, pure add | same |
| `STATUS.md` | MAIN-MOVED-ONLY | not taken |
| `scripts/tmp-s1149-line1.txt` | MAIN-MOVED-ONLY (main deleted it in `511f4073`) | not taken |

No conflicts; no 3-way graft needed.

## Findings

### F-1150-1 — the block that stopped the runner is **an artifact of the standalone probe rig, not a game fault**. ✅ MEASURED, not inferred.

The runner was blocked twice by `confirmBuild failed: palisade@…` and attributed it to "the separate
`placeBuildableAt` fault already recorded by the predecessor". **That attribution is wrong**, and the
distinction matters because it decides whether F-1148-1 is blocked on a game bug (expensive, owner-
gated territory) or on its own instrument (cheap, fire-authorable).

Measured on current main with `scripts/probe-s1150-confirmbuild-rate.mjs` (new, merged here),
5 runs per arm, positive control `anyPlacement: true`:

| Rig | Boot | Placement result |
|---|---|---|
| Bare-chromium probe | `timescale=1` | **1/5 pass**, 4/5 fail |
| Bare-chromium probe | `timescale=10` | **1/5 pass**, 4/5 fail |
| Playwright test runner (the spec itself) | `timescale=10` | **4/4 place all five**, failing only later at `:226` |

Seven of the eight probe failures are the **fifth** palisade, `palisade@2,9`; one is the stockpile.

**Two hypotheses tested and killed, so the next fire does not re-run them:**
1. *Timescale* — the probe hardcodes `timescale=1`, the spec uses `10`. **Refuted:** identical 1/5
   rates in both arms.
2. *Readiness* — that `openGame` waits for more than the probe. **Refuted by reading it:** `openGame`
   (`m2-04-gold-stealing.spec.ts:17-23`) is the same three steps as the probe — goto, canvas visible,
   `frame > 10`.

Also equal between the rigs, verified in `playwright.config.ts`: the server (`npm run dev`, the same
vite dev server), viewport `1280x800`, and `channel: 'chromium'`. The placement helper is a faithful
three-step re-implementation of `placeBuildableAt` (same `z+2` teleport offset).

➡️ **Residual difference (? INFERRED — the discriminating test is NOT yet run):** the spec's context
comes from `devices['Desktop Chrome']`, which also sets `deviceScaleFactor`, `userAgent`, `hasTouch`
and `isMobile`; the probe's `browser.newContext({ viewport })` sets none of them. If placement
raycasts through pointer/DPR-dependent math, that is a mechanism. **The one-line test:** spread
`...devices['Desktop Chrome']` into the probe's `newContext` and re-run the rate probe. If it goes
5/5, the cure is one line and F-1148-1 is unblocked.

⚠️ **Consequence for re-authoring F-1148-1:** a bare-chromium script is **not** rig-equivalent to the
Playwright test runner for this fixture. Either fix the context (above) or build the instrument as a
spec run through the test runner. **A retry loop around `confirmBuild` would be the wrong repair** —
it would paper over an unexplained rig divergence rather than remove it, and the measurement's whole
value is that it is trustworthy.

**Non-blocking** for this merge: both merged files are inert (nothing imports them).

### F-1150-2 — `placeBuildableAt` is duplicated in **22** e2e spec files. 🟡 Non-blocking, observation only.

`grep` finds a private `placeBuildableAt` in 22 specs with drifting signatures (some return `void`,
some `HpEntry`, some take `rotated`). This is why the probe re-implemented it by hand instead of
importing it — there is no shared helper to import. Not this slice's scope; recorded so a future
e2e-hygiene task has the count. **No corrective authored** — consolidating 22 call sites is not a
drive-by, and touching them all would collide with live lane work.

### F-1150-3 — `scripts/stream-showcase-queue.test.mjs:58` is **load-sensitive** and can false-red a gate battery. 🟡 Non-blocking, measured in passing.

Mid-drain the guards went **7/8 RED** on `test:node-guards`, asserting
`actual: [false, true]` vs `expected: [true, false]` at `stream-showcase-queue.test.mjs:58` — the
*"concurrent appenders … concurrent consumers show once"* case, an **ordering** assertion.

**It was my own measurement load, not the tree** — and I proved that rather than assuming it:
the same node-guards batch run standalone passed **61/61 fail 0**, `test-ticker-stats.mjs` passed
alone, and after stopping my scratch vite server the full battery returned **8/8**. The red
appeared only while that server was competing for CPU.

Two things worth carrying forward:
1. **The load measurement must exclude the measurer.** A gate battery run beside your own probe
   server is a contaminated control; this guard is sensitive enough to notice.
2. **The counter and the exit code disagree by design here.** `test:node-guards` is
   `node --test … && node scripts/test-ticker-stats.mjs` — an `&&` chain. Reading "61/61 pass" and
   concluding green is wrong; the second command owns the exit code just as much. That is exactly
   how a red once hid for a day.

Not a corrective task: the flake is in a factory-side guard, reproduces only under contention, and
the honest fix (make the ordering assertion order-insensitive, or serialise the case) is small but
belongs to whoever owns that guard's semantics — I did not want to weaken an assertion I had not
studied. Recorded with the reproduction condition so the next false red is recognised in seconds.

## Follow-through

- F-1148-1 stays **OPEN and unclaimed**; its master must be re-authored with the rig lift named in
  F-1150-1 before it is re-queued. The old master must **not** be re-queued unchanged — an identical
  retry is forbidden (CLAUDE.md §7.5), and the premise it would retry on is now known to be wrong.
- The cure for the underlying m2-04 budget red remains **OWNER-GATED** (E① F-1131-5). Nothing here
  touches it.
