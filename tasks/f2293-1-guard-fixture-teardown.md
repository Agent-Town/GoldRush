# Task f2293-1-guard-fixture-teardown: eight guards must remove the temp directories they create (lane-b, commit prefix "fix:")

**FIRE-AUTHORED s2293 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `scripts/fixture-teardown.test.mjs` (the guard this cures — read it BEFORE editing anything, it defines what "leak" means here); `tasks/BACKLOG.md` (finding **F-2293-1**, top of file); `scripts/node-guards-timeout.test.mjs:43` (`withFixture` — the house teardown pattern already in this repo).

FRESHNESS CHECK (F-1424-3): this master is dispatched with its evidence commit. Verify the lane has it:
`grep -Fc 'F-2293-1 FIXTURE-TEARDOWN KEY s2293' tasks/BACKLOG.md` — must print `1`. If it prints `0`, the lane is STALE (it is missing the commit that carries this task's evidence): **STOP and report "lane stale — F-2293-1 evidence commit absent"**. Do NOT try to fix it yourself.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-2293-1, measured s2293 2026-08-25 — on MAIN, not inherited)

`npm run test:node-guards` is **RED on main**, and one of its two failures is this one. It was first seen inside the lane-a `f2289-1` run (run log `tasks/runs/20260825-083210-lane-a-f2289-1-sim-owned-orders-snapshot.md.log`, battery invoked at line 19211, result at line 21674: **546 tests / 542 pass / 2 fail**), and the failing assertion is:

```
test at scripts/fixture-teardown.test.mjs:24:1
✖ all 80 scripts/*.test.mjs fixture owners remove their temp directories (285886.150167ms)
  AssertionError: fixture survivors by file:
```

**This is NOT that slice's defect, and it is NOT accumulated debris.** Both readings were tested and both are refuted:

1. **`fixture-teardown` runs each subject in a child process with `TMPDIR` set to a FRESH scratch dir** (`scripts/fixture-teardown.test.mjs:34-42`), then lists what survived *in that scratch*. So every survivor it names was created **during that isolated child run** and left behind. The detector is correct.
2. **Reproduced independently on MAIN s2293** using the guard's own method on the 8 named subjects — **8 of 8 leak, with counts identical to the lane's run**:

| file | survivors | own tests |
|---|---|---|
| `attended-owed-cross-check-value-guard.test.mjs` | 10 | 8 pass |
| `desk-birth-row-denominator-guard.test.mjs` | 4 | 10 pass |
| `desk-birth-window-start-guard.test.mjs` | 8 | 8 pass |
| `desk-lock-predicate-guard.test.mjs` | 3 | 8 pass |
| `desk-row-key-token-guard.test.mjs` | 2 | 8 pass |
| `drain-block-worktree-guard.test.mjs` | 2 | 8 pass |
| `dry-board-bucket-verdict-guard.test.mjs` | 3 | 9 pass |
| `ghost-ladder-evidence-source-guard.test.mjs` | 8 | 8 pass |

**40 directories leaked per battery run.** Every child exited `rc=0` and really executed tests — so these guards **pass their own arms correctly**; the only thing missing is teardown.

**Blast radius on the machine, measured s2293:** the shared `TMPDIR` holds **5,670 directories** matching those 8 prefixes (corpus 18,802 entries), aged up to **47.5 hours**.

**Root cause, one class instantiated 8 times.** Each file has a local fixture-builder that `mkdtempSync`es and **returns a value** — argv array or root path — registering no cleanup, so nothing ever removes it. Canonical example, `scripts/desk-lock-predicate-guard.test.mjs:79`:

```js
function board(line1) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-lock-'));
  ...
  return ['--status', path.join(dir, 'STATUS.md'), ...];   // dir is never removed
}
```

All 8 are guards from the recent F-2204-1 corpus-declaration streak (s2223, s2227, s2229, s2236, s2244, s2245, s2259, s2260). **The guards built to catch silently-narrowed corpora have themselves been leaking fixtures into the machine.**

## Scope

1. **Give each of the 8 files deterministic fixture teardown.** For each file in the table above, ensure every directory its fixture-builder creates is removed when the file's tests finish — whichever mechanism fits that file: a module-level `after()` that empties a collected list, `t.after(...)` per test, or the existing `withFixture` try/finally shape at `scripts/node-guards-timeout.test.mjs:43`. Prefer the file's own idiom; consistency across the 8 is NOT required, correctness is.

2. **Teardown must survive a failing arm.** Removal must happen even when an assertion throws (that is exactly when fixtures are most useful to leak). `after()`/`t.after()`/`finally` all satisfy this; a trailing `rmSync` at the end of a test body does NOT.

3. **Use `rmSync(dir, { recursive: true, force: true })`** — `force` so a fixture a test already removed is not an error.

## Firewall

Touch ONLY these 8 files:
`scripts/attended-owed-cross-check-value-guard.test.mjs`, `scripts/desk-birth-row-denominator-guard.test.mjs`, `scripts/desk-birth-window-start-guard.test.mjs`, `scripts/desk-lock-predicate-guard.test.mjs`, `scripts/desk-row-key-token-guard.test.mjs`, `scripts/drain-block-worktree-guard.test.mjs`, `scripts/dry-board-bucket-verdict-guard.test.mjs`, `scripts/ghost-ladder-evidence-source-guard.test.mjs`.

NO changes to:
- **Any assertion, arm, fixture CONTENT, or test name in those 8 files.** This task adds cleanup and nothing else. If an arm looks wrong to you, **report it, do not fix it** — that is a separate finding.
- **`scripts/fixture-teardown.test.mjs`** — it is the gate. Editing the detector to accept the leak is the failure mode this task exists to prevent.
- **`package.json`** — all 8 files are already rooted in `test:node-guards` and `test:ledger-guards`; nothing needs adding.
- The guards' SUBJECTS (`desk-state-audit.mjs`, `drain-block-check.mjs`, `dry-board-probe.mjs`, `ghost-ladder-row-guard.mjs`, `attended-owed-audit.mjs`, …) — this is a test-hygiene task, not a tool change.
- `src/**`, `e2e/**`, the other red (`moth-season-pressure` — attributed and NOT yours, see below).

## Self-check (evidence, not vibes)

⚠️ **THE REVERSE CONTROL IS THE POINT OF THIS TASK'S GATE, so run it FIRST and report it before anything else.** The cheapest way to make `fixture-teardown` green is to stop creating fixtures or to delete arms — which would silently gut eight guards while showing a green. **Therefore pin the counts:**

1. **Per-file counts UNCHANGED.** Run each of the 8 alone (`node --test scripts/<file>`) and report `tests`/`pass`/`fail` for each. They must be **exactly** `8/10/8/8/8/8/9/8` tests, **all passing, zero failures**, in the table's order. Any count that moves is a regression — report and STOP rather than "fixing" it.
2. **`node --test scripts/fixture-teardown.test.mjs` → green**, and quote its `ℹ tests/pass/fail` lines. (It is slow — ~286 s — because it spawns one child per subject. Expected; do not shorten it.)
3. **`npx tsc --noEmit`** rc=0.
4. **`npm run build`** green, with timing.
5. **`npm run test:node-guards`**, run **ALONE** (~530 s, contends on shared fixtures — never overlap it with another battery). Report the full `tests/pass/fail/cancelled/skipped` line.
   ⓘ **EXPECT ONE REMAINING FAILURE AND DO NOT CHASE IT:** `moth-season-pressure.test.mjs` is a **load ceiling, already attributed by s2293 and NOT in your scope** — its `run()` helper wraps `spawnSync` with `timeout: 30_000`, and under contention `gr-sim` drops to ~0.34 waves/s so the child is killed and `result.status` is `null` (that is the literal `null !== 0`). It was **green on main in 15.2 s** when measured alone. If you see it red, say so and move on; if you see it green, say that too. **Do NOT re-pin it, do not raise its timeout, do not touch that file.**
6. **State the leak count directly:** after your cure, report survivors per file as `0` for all 8, measured the way `fixture-teardown` measures (fresh `TMPDIR` per child).

## Report

END WITH: **READY-FOR-GATES** + (a) the per-file count table from self-check 1 against the pinned `8/10/8/8/8/8/9/8`; (b) `fixture-teardown` green with its own counts; (c) the full `test:node-guards` line and whether `moth-season-pressure` was red or green in YOUR run; (d) the teardown mechanism you chose per file, one line each; (e) anything you were tempted to fix and did not.
