# f1426-2 — repair the concurrency harness contract

- **Slice:** `f1426-2-repair-the-concurrency-harness-contract`
- **Branch / tip:** `lane/m3` @ `0afddcec` (base `c40fd144`)
- **Merged to main:** `08ec76b53b94e4bd3e20a7819335378c39e36d70` (s1428 fire)
- **Drained:** 2026-08-03, s1428

## Verdict

**MERGED.** Both cures are real and both were proved by manufactured red rather than by their
green. Two further load-bearing decisions in the same diff are correct but **uncovered by the
self-test** — filed non-blocking as **F-1428-1**.

## What it does

`scripts/concurrency-class-rate.mjs` is the standalone instrument the F-1424-4 successor
measurement will run on. s1426 found it unable to do the job it was pointed at:

- **F-1426-2** — `normalizeSubject` accepted a bare-file subject at the door, but
  `collectExecutions` emitted keys unconditionally line-qualified and `assertComplete` compared
  them to the **raw** subject strings. A bare-file subject therefore produced
  `executions=N/2` deterministically, on the first run, forever. The cure adds `subjectFile()`
  + `subjectMatches()`: bare subjects compare at **file** granularity, `file:line` subjects stay
  **exact**.
- **F-1426-1** — `playwright.config.ts` leaves `fullyParallel` unset, so scheduling is
  **per-file**; the ceiling is `distinct files × projects`. `parseArgs` now refuses arms above it.
  Without this a `1,2,6` sweep would have obtained 1, 2, 2 — two upper arms that are identical
  runs wearing different labels — and published a clean NULL indistinguishable from a real
  negative result.

The fix **direction** matters and was checked: bare-file subjects are made to **work**, not
rejected. Rejecting them would have re-opened F-1426-1 from the other side, because the successor
measurement *requires* multi-file subjects (≥3 spec files to reach a 6-worker arm). The standing
prohibition is respected.

## Evidence

Gated in detached worktree `gate-s1428` (§3.0b — undecided content never entered main's tree).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | ✓ built in 2.65s |
| `--self-test` | 5/5 arms pass |
| Firewall: `playwright.config.ts` / `e2e` / `src` / `package.json` | diff **EMPTY** |
| `fullyParallel` occurrences in merged config | **0** (prohibition held) |
| `workers: isFireShell ? 1 : undefined` | intact, `playwright.config.ts:50` (F-1270-3) |
| Key node guards (gate-caller-audit, law-pointer, goal-tracker, drain-block-check, fire-shell-serialisation, gate-battery) | **59/59 pass** |
| Code consumers of the instrument | **zero** (grep: only itself, BACKLOG, two review files) → no adjacent suites, no runtime surface |
| Playwright | none run and none required — same basis as `f1424-4` |

### The acceptance was the reds, and I reproduced them myself

s1426 set the acceptance explicitly as **two manufactured reds, not a passing report**. The
runner's tail did quote them; a quoted red is a claim, so I mutated the merged tree myself. I
broke **every** load-bearing decision in the diff rather than only the two claimed — the one that
stays green is the finding:

| # | Decision broken | Result |
|---|---|---|
| A | `subjectMatches` bare-file logic (F-1426-2 cure) | 🔴 rc 1 — `Incomplete run: … executions=4/2` |
| B | ceiling check (F-1426-1 cure) | 🔴 rc 1 — `AssertionError: Missing expected exception` |
| C | `exactCountMismatch` | 🟢 **rc 0 — deletable with the self-test still green** |
| D | `extras` detection | 🔴 rc 1 — `Missing expected exception` |
| E | `labelFor` summary labelling | 🟢 **rc 0 — deletable with the self-test still green** |

Probe reverted; `git status` clean afterwards.

## F-1428-1 — two load-bearing decisions ship unguarded (non-blocking, laddered)

C and E stay green under deletion, so the first question is whether they are dead code. Direct
probes say **no — both are load-bearing**, which is what makes the gap worth recording:

- **`exactCountMismatch`** is the guard keeping `file:line` subjects exact. Constructed the case
  it defends — two distinct tests sharing line 9, subject `e2e/a.spec.ts:9`:
  `missing=[] extras=[] executions=4/2`. **Nothing else catches it**; `missing` and `extras` are
  both empty. It is precisely the anti-regression guard for the exactness that the F-1426-2
  widening could loosen, and it has no test.
- **`labelFor`** — with a bare-file subject, `state.subjects` holds `e2e/a.spec.ts` while rate rows
  are keyed `e2e/a.spec.ts:4`, so the old `labels.get(row.subject)` returns undefined. Measured
  both ways: with the fix the table reads `S1:4` / `S1:9`; without it, **three rows of
  `| undefined |`**. A report whose subject column is `undefined` is unreadable, and the
  self-test never renders a summary.

**This is F-1426-2's own shape recurring.** That finding was *"a green self-test certified an
instrument that could not do the job it was pointed at"* — its coverage was narrower than the
contract its callers used. The repair fixed the contract but the self-test still does not cover
everything the repair changed. Non-blocking: the shipped code is correct, verified by direct
probe. But the successor measurement will rest on two decisions no test defends.

**Cure (laddered):** add two self-test arms — a same-line `file:line` subject asserting the
`4/2` throw, and a `writeSummary` render over a bare-file subject asserting no `undefined`
reaches the table. Do **not** cure by deleting either decision.

## Merge classification

Base `c40fd144`; single file `scripts/concurrency-class-rate.mjs`, **LANE-TOUCHED only** — main
never moved it. Clean `ort` merge, no conflicts. Scope 4 (*measure nothing*) obeyed: the repaired
instrument is reviewed on its own, not beside output produced by itself.

## Findings

- **F-1428-1** (new, non-blocking, laddered) — `exactCountMismatch` and `labelFor` are
  load-bearing but uncovered; both proved load-bearing by direct probe. Cure above.
- **F-1426-1 / F-1426-2** — CURED by this merge, each proved by manufactured red.
- **F-1426-3** (`--workers` de-duplicates repeated arms) — unchanged; now documented in the
  file header, express repetitions with `--runs`.
- **F-1424-4** — still open. This merge repairs the instrument and deliberately measures
  nothing; the lane-shell-vs-fire-shell question is untouched.
