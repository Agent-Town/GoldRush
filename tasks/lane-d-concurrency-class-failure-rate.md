CODEX: model=gpt-5.6-sol effort=high
# lane-d-concurrency-class-failure-rate — MEASURE THE CLASS'S FAILURE RATE. DO NOT CURE ANYTHING.
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled. **FIRE-AUTHORED s1216 (attended review welcome).**

WHY: three consecutive fires have landed on one theme and **none of them produced a number you can act on.** F-1214-1 (s1214) proved a spec fails at `--workers=4` and passes at `--workers=1` even under *higher* CPU load — so the variable is concurrent browsers, not loadavg. F-1215-1 (s1215) found a second member. F-1215-2 (s1215) is the finding that blocks everything downstream, and it is a **contradiction**: s1214's failing arm and the lane-d cure's clean arm were **nominally the same configuration** and returned opposite verdicts. Its ruling, verbatim from `tasks/BACKLOG.md`:

> **DO NOT author a third single-shot arm and do not re-queue the cure as-is:** the owed instrument is a **measured failure RATE** over N runs at each worker count, covering both specs, which is also the only thing that can tell a real cure from a lucky quiet box.

s1216 then hit the class a third time while draining LB-02 (F-1216-1), and its three arms are the clearest statement of the problem yet — **the same tree, same command, same box, three samples: 11 failed, 8 failed, 4 failed.** The treatment arm produced both the worst and the best result. **At N=1 per arm nobody can distinguish a cure from luck, and that is exactly why this instrument comes before any cure.**

**YOU ARE BUILDING A MEASUREMENT, NOT A FIX.** Nothing in `src/` may change. No test's assertion, bound, timeout or retry count may change. If you finish this task and the suite is exactly as red as it was, **you have succeeded.**

READ-FIRST (all of them, before you write a line):
- `tasks/BACKLOG.md` — F-1214-1, F-1215-1, F-1215-2, and **F-1216-1** (s1216, the three-arm measurement and the `locked-win:65` datum).
- `reviews/lb-02-bench-fields.md` §Findings F-1216-1 — the arm table and how the control was run.
- `logs/session-scratch/s1214-f1211-6/measurements.md` — s1214's four arms; **this is the format to beat, and its one weakness is N=1.**
- `logs/suite-red-inventory.md` — **especially its existing row for `tl-01-run-telemetry.spec.ts:236` at 7/12 = 58.3%.** That row is your calibration standard; see scope 4.
- `scripts/suite-red-inventory.test.mjs` + whatever script generates that inventory — you are extending an existing instrument's vocabulary, not inventing a parallel one.
- `e2e/gazette-welcome.spec.ts:44` · `e2e/ap-standing-orders.spec.ts:80` · `e2e/locked-win.spec.ts:65` · `e2e/tl-01-run-telemetry.spec.ts:229` — the four subjects.

PRE-FLIGHT (LANE-SAFETY invariant — **re-verify by content, never trust this paragraph**): `lane/perf` was **0 commits ahead of main** when this master was authored (s1216, verified by `git rev-list --count main..lane/perf`), so a reset destroys nothing. Re-run that check yourself. If it is non-zero, or the worktree holds tracked dirt whose blobs are unreachable in git, **STOP and report** — do not reset.

SCOPE:
1. **Build the harness as a committed script** (suggested `scripts/concurrency-class-rate.mjs`), not a scratch shell loop, because F-1215-2 exists precisely because two fires ran unrepeatable one-offs. It takes the subject list, a worker-count list, and N, and emits a table of **failures / executions per (subject × project × worker count)**. It must record, per run: worker count, project, pass/fail per subject, `loadavg` at start and end, and the tree's `git rev-parse HEAD`.
2. **Sample properly: N ≥ 8 runs per worker count, at minimum `--workers=1`, `2`, and `4`.** N=1 is the defect this task exists to fix; a table with N=3 is the same defect wearing a bigger hat (a 25% flake reads clean in 3 runs ~42% of the time — that arithmetic is already recorded in this repo's ledger, at leaf `m2-05`). **INTERLEAVE the worker-count arms** (1,2,4,1,2,4,…) rather than running all the 1s then all the 4s — execution order is a confound, and a drifting background load would otherwise be perfectly aliased onto the variable under test.
3. **One external vite on a scratch port, reused by every arm, and NEVER port 5188** (the lane runner's shared port — binding it can starve a live lane's gates). Verify the port is free before binding and released at exit. Set `GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL` so the config does not spawn a per-arm server; a per-arm server would make server startup a hidden variable.
4. **CALIBRATE THE INSTRUMENT BEFORE YOU TRUST ITS NEW NUMBERS.** `tl-01-run-telemetry.spec.ts:229/:236` is already inventoried at **7/12 = 58.3%** on both projects. It is in your subject list *for this reason*: if your harness reports something far from ~58% for that subject at the worker count the inventory used, **your instrument is wrong and its other rows are worthless** — say so in the report and fix the harness before drawing any conclusion. A measuring device that has never been checked against a known value is a hypothesis, not an instrument.
5. **Report, in `logs/session-scratch/<your-run>/rates.md`:** the full table; which subjects are **monotonic in worker count** (rate rises with concurrency ⇒ genuinely in the class) versus **flat** (rate independent of concurrency ⇒ a different defect wearing the same symptom, which is a finding in its own right); and the calibration result from scope 4. **Name any subject whose rate is 100% at every worker count — that is not a flake at all, it is a deterministic red, and it must be labelled as one.** (`locked-win:65` failed 3/3 arms in s1216 and is a candidate.)
6. **Update `logs/suite-red-inventory.md` from the measurement**, adding the members that are missing from it — `locked-win.spec.ts:65` is known-absent as of s1216 — each with its **measured** rate and denominator. Do not hand-enter a rate you did not measure; an inventory row with an invented number is worse than an absent row.

TOUCH-ONLY: the new harness script · its node test (if you add one) · `logs/suite-red-inventory.md` · `logs/session-scratch/<your-run>/**` · the generator of the inventory **only if** its schema genuinely cannot express a measured rate, and then say so explicitly in your report.
NO: any file under `src/` · any `e2e/*.spec.ts` assertion, bound, timeout or retry · `playwright.config.ts` (pinning `workers` there is an **automatic reject** — it would hide the class from the canonical `npm test`, which is the whole danger F-1214-1 named) · any other lane's files · any cure for any subject.

**AUTOMATIC REJECTS** — each of these has been tried or tempted before, and each defeats the purpose: widening a bound · adding `retries` · deleting or skipping a subject · declaring the class cured · reporting a rate you did not measure · running fewer than 8 samples per arm and calling it a rate.

SELF-CHECK (run these, report the numbers, do not paraphrase them):
- `npm run test:node-guards` **FIRST** — expect **74/74 exit 0**. If your harness adds a node test, expect 75+/… and say so.
- `npx tsc --noEmit` clean · `npx vite build` green.
- `npx playwright test --list` → **2460 tests / 344 files** unless you added a spec (you should not have).
- `git diff --stat` proving **zero `src/` bytes and zero `e2e/` assertion changes**.
- The calibration result from scope 4, stated as a number next to the inventory's 58.3%.

READY-FOR-GATES + report: the rate table itself (paste it), the calibration verdict, which subjects are monotonic vs flat vs deterministic, and — explicitly — **which single cure you would now recommend and what its acceptance number would be**, so the next fire authors a cure against a threshold instead of against a vibe. Do not implement that cure.
