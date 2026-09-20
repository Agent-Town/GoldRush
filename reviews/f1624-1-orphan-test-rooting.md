# Review — f1624-1 orphan-test rooting

**Slice:** `f1624-1-orphan-test-rooting` (FIRE-AUTHORED s1624, from F-1624-1 recorded at the `stack-directory` drain)
**Branch:** `lane/b` · **Tip:** `e32166b77d3dc53d688a13842e120a6a0c322ef9` · **Base:** `abd84847b4c8935d81f20961cc01a1b47ca466d6`
**Merged:** `3f330d8bb67c68ab834a09c822ad7adcefa25e47` (s1626, 2026-08-10)

## VERDICT: MERGED — gate green, no unpredicted orphan, teeth proven by a manufactured defect.

## What it does

`gate-caller-audit` exists to find gate-shaped things nobody calls, and it could not report an orphan
test file anywhere in the tree, ever — its subject loop dropped `.test.mjs` *before* the guardish-name
test was applied. This slice makes every tracked `*.test.mjs` a subject in its own right (`kind: 'test file'`),
reached through the same edge vocabulary as every other subject.

Widening the subject set surfaced the class the audit had been structurally blind to. Its three outcomes:

- **58** test files were already reached via `test:node-guards` — genuinely gated, unchanged.
- **7** are reached only from `test:ledger-guards`, which is **deliberately** unrooted (F-1300-4: it runs
  the guards that read the LIVE ledger and must run *after* the drain-bookkeeping commit). These are
  grandfathered in `gate-caller-baseline.json`, each carrying the inherited reason in the house voice.
- **2** were reached by nothing at all and are now rooted into `test:node-guards`:
  `scripts/master-shipped-classifier.test.mjs` (12 tests, guarding the shipped-master census s1595 leaned
  on) and `src/encyclopedia/stackDirectory.test.mjs` (2 tests, the whole matcher table, shipped the
  previous drain).

The header comment's claim about what the audit reads was updated in the same commit, and
`gate-caller-audit.test.mjs` gained a fixture asserting that a tracked test file nothing calls is reported
as a NEW orphan at rc=1.

## Evidence (gated in detached worktree `gate-s1626` per §3.0b; removed after)

| gate | result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green, built in 2.07s |
| `gate-caller-audit` BEFORE (main) | `50 subjects / 12 orphans / 12 grandfathered` — PASS |
| `gate-caller-audit` AFTER (merged) | `117 subjects / 19 orphans / 19 grandfathered` — PASS |
| `npm run test:node-guards` (merged tree, run ALONE) | **rc=0, 402.1s, ZERO failing tests, ZERO contention stamps** |
| the 2 rooted files + `gate-caller-audit.test.mjs` | **40/40 pass** (12 + 2 + 26) |
| merge classification | base `abd84847b`; all 4 files LANE-TOUCHED / MAIN-UNMOVED; clean `ort` merge, no conflicts |

**The delta was checked by arithmetic, not taken on trust.** Subjects rose by exactly **+67**, the number of
tracked `*.test.mjs` files, and orphans by exactly **+7**. 58 reached + 7 grandfathered + 2 rooted = 67.
That closes the master's question (d) — *any file that surfaced as an orphan which this master did not
predict* — from the numbers rather than from the runner's word for it: there is no room in the arithmetic
for an eighth.

**Runner's own figures (reported, not re-derived here):** battery 60 files / 439 tests / 437 passed / 2 skipped
/ 191.58s against the s1537 baseline of 363/360/3/181.3s. My run corroborates rc=0 and zero failures; I did
not re-extract the test count, and say so rather than restate a number I did not measure. The battery is
MEANT to grow — count it, never prune it back.

**Manufactured defect (scope 5, the s1299/s1300 standard — a passing guard never executes its violation
path).** The runner armed the probe with `--include-untracked`, got rc=1 naming `scripts/zz-orphan-probe.test.mjs`,
and PASS again after removal. The *tracked* arm is proven independently by the new fixture test in
`gate-caller-audit.test.mjs`, which asserts `NEW src/lonely.test.mjs NO CALLER` at rc=1 — so both arms of the
F-1576-1 distinction are covered, one by transcript and one by fixture.

## The gate that had to be fought for, and why it is recorded

The first full battery ran **rc=1 in 447.5s** with two reds — `node-guards-contention.test.mjs:106` and
`fixture-teardown.test.mjs:40` — and its own output ended `CONTENDED — 2 concurrent batteries`. A lane had
started a second battery mid-run. That is precisely the F-1537-1 collision s1625 deferred this drain to
avoid, and it happened anyway because two Codex runners (lane-a `ap16-audit`, lane-c `f1625-1`) were cycling
batteries continuously.

**Attribution was settled by a control, not by an argument:** the same two files run from **main's** tree —
none of this slice's content — reproduced **both reds identically**, 28.3s/5.04s against 28.1s/5.04s. The reds
belong to the shell.

The verdict does not rest on that control, though. After a 103s tight poll the board went genuinely quiet and
the full battery ran **rc=0 with zero contention stamps**, so the merge is gated on a clean measurement and the
control merely explains the discarded one.

⚠️ **One probe of mine returned a false zero and is recorded so the next reader does not repeat it.** My first
liveness poll used `pgrep -f "run-node-guards\|playwright test"` — `pgrep` takes an ERE, where `\|` is a
literal pipe, not alternation. It reported `QUIET after 0s` against a board carrying two live batteries. A
hand-written pattern returns a false zero, never an error; two separate probes replaced it.

## Findings

**[F-1626-1] NON-BLOCKING, cosmetic — the audit's orphan listing glues the reason to long names.** The name
column is padded to a fixed width, so any subject longer than it runs straight into its reason:
`scripts/banked-master-preflight-guard.test.mjss1624 F-1624-1: REACHED ONLY FROM...`. Five of the seven new
grandfather entries are long enough to hit it. Harmless to the verdict (rc and membership are unaffected) but
it degrades exactly the output a human reads when deciding whether a grandfather is honest. Worth one line in
a later slice that touches this file; not worth a task of its own.

**No blocking findings.** The master's forbidden failure mode — quietly baselining an unexpected orphan to
reach green — did not occur, and the arithmetic above is what proves it rather than the absence of a complaint.

## Duties

GZ-01: **not owed by this merge.** The slice changes gate topology only — no player-visible surface. DEPLOY:
correctly skipped, not gameplay-affecting.
