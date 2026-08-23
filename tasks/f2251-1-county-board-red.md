# Task f2251-1-county-board-red: the county board's twelve reds — find the commit, fix it, refresh the inventory (lane-b, prefix "fix:")

**FIRE-AUTHORED s2251 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST:
- `AGENTS.md`
- `reviews/ap15-frontier-registry.md` — **the evidence this task exists for**; its two-arm control table is the measurement you are inheriting, do not re-derive it before reading it
- `e2e/lb-01-county-standings.spec.ts` (the three failing tests are at `:247`, `:630`, `:730`)
- `e2e/milk-county-board.spec.ts` (the three failing tests are at `:374`, `:400`, `:442`)
- `functions/api/standings.ts` and `src/encyclopedia/reader.ts` — the two surfaces those suites exercise
- `logs/suite-red-inventory.md` — the inventory whose snapshot is stale, and the file item 4 refreshes

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — expected, list, proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**Citation check (hard STOP if it fails).** Before item 1, run:
`grep -Fc "The red is main's and predates this branch." reviews/ap15-frontier-registry.md`
Expect **1**. A `0` means your lane is behind the commit carrying this task's evidence — do NOT proceed, do NOT guess; report the count and STOP.

## Why (measured s2251, drain of `ap15-frontier-registry`, merge `d87b9097`)

While gating that slice, two identical detached worktrees were run back-to-back in the same shell at `--workers=1`, the only variable being the merge:

| Arm | Tree | Result |
|---|---|---|
| Merged | merge(`e49c36ba3`, `2a102749f`) | 12 failed / 30 passed |
| Control | `e49c36ba3` — **clean main** | **12 failed / 30 passed** |

The failing set is **identical test-for-test on both projects**. The red is main's and predates that branch; it did not block the merge and must not be blamed on it.

`red-inventory-lookup` records `milk-county-board` as **CLEAN** at its snapshot of **2026-08-11**, and warns the snapshot is 12 days stale with **145 commits** touching `e2e/` or `src/` since. So the red rotted onto main inside that window and the inventory still tells every reader the suite is green.

Owner-facing stake: `lb-01:730` is *"Claim Ledger renders the seeded county board and its empty contract state"* — a surface the player sees. And every fire gating anything near the county board re-pays ~14 minutes of control-running until this is closed.

## Scope

1. **Bisect the window.** Find the commit that turned these six tests (×2 projects) red. `git bisect` between the 2026-08-11 inventory snapshot and current main, using ONE cheap failing test as the probe (`lb-01-county-standings.spec.ts:730` is the shortest) at `--workers=1`. Record the first-bad commit hash and its subject.
2. **Diagnose before fixing.** State in your report WHY that commit reddens these tests — the actual mechanism, not the diff summary. If the six failures have more than one root cause, say so and treat each separately; do not assume one commit explains all six.
3. **Fix the product, not the test.** Correct the source defect so all six tests pass unmodified on both projects. ⛔ **Editing an assertion, a timeout, or a selector to make a red go away is FORBIDDEN and is an automatic STOP** — if a test's expectation is genuinely wrong, do NOT change it: report the evidence and STOP for an attended ruling. A re-pin needs a named cause (F-1441-3).
4. **Refresh the red inventory.** Regenerate/update `logs/suite-red-inventory.md` so its snapshot reflects the post-fix truth for these two suites, with today's date. The next fire must inherit the answer rather than re-derive it.
5. **Prove it did not spread.** The same defect class may sit in sibling county surfaces; run the adjacent suites named in the self-check and report their state either way.

## Firewall

Touch ONLY: the source file(s) the bisect actually implicates (expected to be under `functions/api/standings.ts`, `src/encyclopedia/`, or `src/news/`), plus `logs/suite-red-inventory.md`, plus a BACKLOG row.
NO changes to: the six failing tests themselves (see item 3), ranking or verdict order, `assets/contracts/frontier-registry.json`, `assets/contracts/null-floors.json`, the sim, tapes, or any spec.
Reporting an adjacent defect you are not fixing is GOOD and expected; fixing it is a firewall violation.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean · `npm run build` green · `e2e/lb-01-county-standings.spec.ts` and `e2e/milk-county-board.spec.ts` **fully green on BOTH projects** at `--workers=1` (that is the whole point of the task — 42/42) · adjacent `e2e/field-book.spec.ts` + `e2e/gazette-living.spec.ts` unmodified-green both projects · `node --test scripts/frontier-registry.test.mjs` 3/3 · zero console/page errors on a plain boot (no `?debug`) · screenshots of the repaired county board desktop **and** 390px mobile into `reviews/shots-f2251-1/`.

If the diff ends up touching `src/sim/`, `src/systems/` or `src/entities/`, `npm run test:node-guards` is ALSO owed (F-1460-1) — it is ~9 minutes, run it ALONE.

## No-op / honesty guard

If the bisect lands on a commit whose change is DELIBERATE and the tests encode a superseded expectation, that is a design fork, not a bug: STOP and report the commit, the intent, and which of the two is stale. Do not resolve it yourself. If the six tests do not reproduce red on current main at all when you start, STOP and report that too — the red may have been fixed between s2251 and your run, and the honest outcome is then item 4 alone.

End: **READY-FOR-GATES** + report: the first-bad commit (hash + subject), the mechanism in one paragraph, whether the six failures shared one root cause, the fix's shape, and the inventory's before/after state for both suites.
