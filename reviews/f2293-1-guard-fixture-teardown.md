# f2293-1-guard-fixture-teardown — drain review (s2294)

**Slice:** `f2293-1-guard-fixture-teardown` (FIRE-AUTHORED s2293, cure for F-2293-1)
**Branch:** `lane/b` · **tip:** `93de6a6d71f8c1d4cb69e4c84184e2d24ce97209`
**Merge-base:** `12a883df56460e22e52bef0b0854da8d21e2dba4`
**Gated in:** detached worktree `.gate-s2294` (§3.0b — undecided content never entered main's tree)
**Gate merge probe:** `de6a7d1570c3e07591e5da7ecff224364574daa0`
**Merged to main:** `da32563682cf8086d1f7b4ba6d579e74d5141b85`

## VERDICT: MERGE — all pins held, leak count 0/40, zero regressions.

## What it does

Eight guard suites from the F-2204-1 corpus-declaration streak each built their fixtures with a
local `mkdtempSync` helper that **returned a value** (an argv array or a root path) and registered
no cleanup, so every temp directory they created survived the run. `fixture-teardown.test.mjs`
detected this correctly and was one of the two reds making `npm run test:node-guards` **RED on main**.

The cure is one class applied eight times: a module-level `const fixtures = []`, an
`after(() => fixtures.forEach(dir => rmSync(dir, { recursive: true, force: true })))` hook, and a
`fixtures.push(dir)` at each `mkdtemp` site. **No assertion, arm or subject was touched** — the
diff is `+38/-9` across 8 files, and the deletions are entirely the `import { test }` →
`import { after, test }` lines plus one hoisted `mkdtempSync` expression.

## Evidence

| gate | result |
|---|---|
| `drain-block-check` | ✅ CLEAR — `status="queued"`, no block |
| merge | clean by `ort`, **zero conflicts** |
| classification | 8 files **ALL LANE-TOUCHED**, **0 MAIN-MOVED**, 0 BOTH-MOVED |
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green, 1.52 s**, asset-diet respected (84% GLB / 87% PNG cuts) |
| `fixture-teardown.test.mjs` | **1 test / 1 pass / 0 fail**, 189.4 s, all **80** subjects |
| `npm run test:node-guards` | **546 tests / 541 pass / 0 fail / 0 cancelled / 5 skipped**, rc=0, **675.1 s**, run ALONE |

### The pinned counts — run FIRST, because a suite that greens by deleting arms looks identical to a cure

Each of the 8 run **alone**, each in a **fresh `TMPDIR`** (the way `fixture-teardown` measures):

| file | tests / pinned | pass | fail | survivors |
|---|---|---|---|---|
| `attended-owed-cross-check-value-guard.test.mjs` | 8 / 8 | 8 | 0 | **0** |
| `desk-birth-row-denominator-guard.test.mjs` | 10 / 10 | 10 | 0 | **0** |
| `desk-birth-window-start-guard.test.mjs` | 8 / 8 | 8 | 0 | **0** |
| `desk-lock-predicate-guard.test.mjs` | 8 / 8 | 8 | 0 | **0** |
| `desk-row-key-token-guard.test.mjs` | 8 / 8 | 8 | 0 | **0** |
| `drain-block-worktree-guard.test.mjs` | 8 / 8 | 8 | 0 | **0** |
| `dry-board-bucket-verdict-guard.test.mjs` | 9 / 9 | 9 | 0 | **0** |
| `ghost-ladder-evidence-source-guard.test.mjs` | 8 / 8 | 8 | 0 | **0** |

**Sequence `8/10/8/8/8/8/9/8` — matches the master's pin exactly.** Total survivors **0**.

### The control that makes the zero mean something (F-2215-1)

`survivors=0` is also what a probe that measures nothing prints. So the **same probe, same hour,
same machine** was run against **pre-cure main**, the only variable being the tree:

- **pre-cure main → 40 survivors**, distributed `10/4/8/3/2/2/3/8`
- **merged tree → 0 survivors**

That distribution reproduces s2293's independent measurement **to the digit**, on all eight files.
The probe is valid and the cure is real. (My first run of it reported `tests=null` on all 8 —
that was my own regex expecting TAP `# tests`, where this reporter emits `ℹ tests`. The subject was
never at fault; recorded because a broken instrument that prints `BAD` is luckier than one that
prints `OK`.)

## Findings

**F-2294-1 (NON-BLOCKING, informational).** The ~5,670 stale directories s2293 measured in the
shared `TMPDIR` are **not** cleaned by this slice and deliberately were not cleaned by this drain.
The cure is at the generator and it has landed; the historical debris is inert, and a headless fire
mass-deleting under a shared `TMPDIR` is not a drive-by act. Re-measure at leisure; it is now a
closed, non-growing set.

**F-2293-1 — CLOSED by this merge.** The battery is **rc=0 with 0 fail**, so *both* reds are gone:

- `fixture-teardown` → ✔ *all 80 fixture owners remove their temp directories* (186.7 s) — cured here.
- `moth-season-pressure` → ✔ (11.0 s) — **never a defect**, and this run confirms s2293's
  load-ceiling attribution **from the other direction**. Its `run()` wraps `spawnSync` with
  `timeout: 30_000`; a timeout kill reports `status: null`, which is the literal `null !== 0` the
  red asserted. It was measured green on main alone at 15.2 s, and is green here at 11.0 s — i.e.
  it reds only under contention. The runner left the file alone exactly as instructed, and this
  drain re-pinned nothing.

The **5 skipped** matches the documented s2166 baseline exactly. `546` tests is the same denominator
the lane-a `f2289-1` run reported at its line 21674, with the 2 failures now at 0.

This also retires the **differential gating** s2293 had to fall back on: the board's canonical
battery is green on main again, so the next drain can gate on the battery itself rather than on a
slice differential.
