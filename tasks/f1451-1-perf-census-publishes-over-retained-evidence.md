CODEX: model=gpt-5.6-sol effort=high
# f1451-1 — the E1 perf census must stop publishing over retained evidence
**FIRE-AUTHORED (attended review welcome)** — s1451, 2026-08-04

ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

## READ FIRST (paths, not memory)
- `reviews/f1440-2-perf-gate-without-a-frozen-baseline.md` — the drain that filed F-1451-1. Its
  "Findings" section is the defect you are curing; read the measured numbers, not this summary.
- `e2e/e1-perf-pass.spec.ts` — the subject. Read `ARTIFACT_DIR` and `STAGE` at the top, then every
  site that writes under them (`captureStaticMaps`, and the census `writeFile` near the end).
- `artifacts/e1-perf-pass/` — the retained evidence tree. `before/`, `after/`,
  `census-before-*.json`, `census-after-*.json` are the s1440 perf pass's proof. They are RETAINED
  HISTORY (RETENTION LAW) and this task exists to protect them.
- `playwright.config.ts` — read `testDir`, `testIgnore`, `claimedByAnotherConfig`.

## WHY (drain finding F-1451-1, s1451, measured on the merged tree)
`e2e/e1-perf-pass.spec.ts` merged into the shared default battery at `67b31523`. It is correctly NOT
in `claimedByAnotherConfig`, so it now runs on every ordinary `npx playwright test`. But:

```
const ARTIFACT_DIR = path.resolve(process.env.E1_PERF_ARTIFACT_DIR ?? 'artifacts/e1-perf-pass');
const STAGE = process.env.E1_PERF_STAGE ?? 'after';
```

so with no env override it publishes its census and its 10 screenshots per project **straight over the
committed `after/` arm**.

Measured, not inferred — one project alone, run exactly as the battery runs it:

```
dirtied tracked files under artifacts/e1-perf-pass: 13
 M artifacts/e1-perf-pass/after/desktop-chrome-e1-baron-pressure.png
 ... (10 PNGs + census-after-desktop-chrome.json + ...)
```

Both projects leave ~26. The cost is not tidiness:
1. Any fire that runs a full battery on main afterwards finds main **dirty**, which contaminates the
   next drain's clean-main check.
2. It is exactly the s1294 / F-1295-1 hazard — 26 modified binaries sitting in the tree waiting for
   someone's broad `git add` to sweep them into an unrelated commit.
3. It quietly rewrites the `after/` arm that the *original* perf pass's proof rests on. Future readers
   of `artifacts/e1-perf-pass/after/` get whatever the last battery run produced, not the s1440
   evidence they think they are reading.

This is **not** a RETENTION LAW violation (these are tracked files; git keeps every version), and it is
**not** the f1440-2 runner's error — that master ordered the census publication kept "exactly as
written", so curing it in-slice would have been a firewall violation. It flagged the problem and
correctly declined to fix it. This task is the follow-up it was owed.

## THE LAW THIS SERVES
A gate publishes its own evidence; it never overwrites someone else's. Retained evidence is read-only
to every run except the one that produced it.

## SCOPE
1. Make an ordinary battery run publish somewhere that is **not** the retained tree. Recommended
   shape (take it unless you find a reason not to, and say so if you do): leave `ARTIFACT_DIR`'s
   default alone but change the default `STAGE` from `'after'` to a neutral value such as `'latest'`,
   so ordinary runs write `artifacts/e1-perf-pass/latest/` and `census-latest-<project>.json` and
   touch neither `before/` nor `after/`. Explicit `E1_PERF_STAGE=after` must still work for anyone
   deliberately re-recording that arm.
2. Ensure the new default output does not become new git churn — add the ordinary-run output path to
   `.gitignore` if that is the honest answer, and say in your report which path you ignored and why
   ignoring it does not lose retained history. (Ordinary battery output is regenerable and is NOT
   factory history; the `before/`/`after/` arms ARE, and must stay tracked.)
3. Add a header comment at the write site saying **why** the default stage is neutral — a reader six
   fires from now must learn from the file itself that `before/` and `after/` are retained evidence.
4. **PROVE THE CURE THE ONLY WAY THAT COUNTS: manufacture the pre-cure condition and show it is gone.**
   A green run proves nothing here because a green is exactly what the buggy version produced too.
   Required transcript, in this order, in your report:
   - on the tree BEFORE your change: run the spec with no env override, one project, and show
     `git status --short -- artifacts/e1-perf-pass` listing the dirtied tracked files, **with the
     count**;
   - `git checkout -- artifacts/e1-perf-pass` to restore;
   - on the tree AFTER your change: the same run, and show the same command returning **empty**;
   - confirm `artifacts/e1-perf-pass/after/` and `before/` are byte-identical to HEAD afterwards
     (hash a couple of files before and after, or `git status` on the whole tree — state which).
5. Confirm the spec's assertions are unchanged in number and identity by your edit — it must still be
   the machine-independent gate f1440-2 landed. Name the assertions that run.

## TOUCH-ONLY
- `e2e/e1-perf-pass.spec.ts`
- `.gitignore` (only if scope 2 needs it)
- `artifacts/f1451-1/` for your evidence

## NO
- **NO** changes to `src/**`. No gameplay, render or Balance code is under review here.
- **NO** re-recording, regenerating, deleting or "tidying" anything under
  `artifacts/e1-perf-pass/before/` or `after/` or the four `census-{before,after}-*.json`. They are
  retained history and this task's whole purpose is that they stop being overwritten. If your run
  dirties them, restore them and say so.
- **NO** weakening the gate to solve this: do not remove or loosen the 200 draw-call budget, the
  absolute `frameBudgetMs * collapseRatio` p95 cap, the census publication itself, or either
  console/page-error assertion.
- **NO** adding this spec to `claimedByAnotherConfig`. Hiding it from the battery is not the cure and
  is adjacent to the F-1296-3 standing order about `release-build.spec.ts`.
- **NO** touching `playwright.config.ts` `workers` (F-1270-3).
- **NO** changing the `E1_PERF_COMPARE_BASELINE` opt-in that f1440-2 just landed (F-1440-2). The
  baseline comparison stays opt-in and stays behind that exact flag name.

## PRE-FLIGHT (LANE-SAFETY invariant)
Verify this worktree is clean vs main before resetting; if any tracked blob here is unreachable in git,
**STOP and report** rather than resetting.

**FACTORY-CHURN EXCEPTION (F-1407-1):** modifications confined to `logs/`, `artifacts/`, `tasks/runs/`,
`tasks/done/`, `tasks/queue/`, `STATUS.md`, `tasks/goals.json` and `tasks/BACKLOG.md` are the factory's
own bookkeeping churn and do **NOT** constitute a dirty tree for this pre-flight. Do not STOP on them.

## SELF-CHECK
- `npx tsc --noEmit` clean · `npm run build` green
- `e2e/e1-perf-pass.spec.ts` green, both projects, `--workers=1`
- the scope-4 before/after transcript, with the dirtied-file **count** on the pre-cure arm and an
  **empty** result on the post-cure arm
- adjacent: by grep, name every file that reads or writes `artifacts/e1-perf-pass` (at the time of
  writing the spec itself is the only one — verify, do not inherit)
- zero console/page errors

READY-FOR-GATES + report: the dirtied-file count before, the empty result after, which path you
ignored and why that loses no retained history, and the list of assertions still running in the
default path.
