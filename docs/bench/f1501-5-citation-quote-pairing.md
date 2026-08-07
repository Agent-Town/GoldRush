# F-1501-5 — citation quote pairing

## Verdict

READY-FOR-GATES. The scanner now accepts a candidate found by either the existing loose quote scan or a delimiter-matched scan. This preserves every old recovery while fixing short-code-span and bare-apostrophe pairing failures.

## Pre-flight

Raw output:

```text
ancestor_rc=0
1
```

`git status --porcelain` printed nothing. The lane contains `2a7cc6e2cfeee1d4a99bc4c4543c0358f263ca2e`, the subject declaration count is exactly one, and no tracked dirt existed before the edit.

## Corpus measurement

Before:

```text
=== citation-title-guard (report) ===
citations: 511
  NUMBER-ONLY     263
  CARRIES-TITLE   205
  CARRIES-LINE    43
  NOT GATED: 1146 citation(s) in 174 tracked .md outside tasks/ — largest logs/suite-red-inventory.md (646).
```

After:

```text
=== citation-title-guard (report) ===
citations: 511
  NUMBER-ONLY     262
  CARRIES-TITLE   206
  CARRIES-LINE    43
  NOT GATED: 1146 citation(s) in 174 tracked .md outside tasks/ — largest logs/suite-red-inventory.md (646).
```

The hard bar is met: `CARRIES-TITLE` is 206, one above the required 205; `NUMBER-ONLY` is 262, one below the maximum 263; `CARRIES-LINE` stays 43; and the denominator stays exactly 511.

## Formulation and shared path

`QUOTED_BY_KIND` adds correctly paired straight double, curly double, straight single, curly single, and backtick captures. `matchingQuote()` tries the old loose scanner first and the paired scanner second, returning the first candidate that resolves. The loose behavior is therefore preserved rather than replaced.

Both call sites use that same helper: the title scan at `scripts/citation-title-guard.mjs:200` and the `CARRIES-LINE` fallback at `scripts/citation-title-guard.mjs:207`.

## Manufactured defect

I added two cases to the existing `scripts/citation-title-guard.test.mjs`: a quoted retired title followed by a three-character inline code span and the real quoted title, and the sibling shape with a bare prose apostrophe before the real title.

Against the old guard implementation, after adding only the tests:

```text
✖ a short code span cannot consume the following quoted title
✖ a bare apostrophe cannot consume the following quoted title
ℹ tests 15
ℹ suites 0
ℹ pass 13
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
OLD_BEHAVIOUR_TEST_RC=1
```

Both failures printed `NUMBER-ONLY 1`. With the union scanner:

```text
✔ a short code span cannot consume the following quoted title
✔ a bare apostrophe cannot consume the following quoted title
ℹ tests 15
ℹ suites 0
ℹ pass 15
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
FOCUSED_TEST_RC=0
```

Each new arm asserts `CARRIES-TITLE 1`, so the arm demonstrably ran and recovered the second title rather than merely obtaining a generic pass.

## Gates and firewall

`package.json` already names `scripts/citation-title-guard.test.mjs` directly in `test:node-guards`; it was not changed.

Ambient runtime:

```text
v23.11.1
```

Full raw node-test tally:

```text
ℹ tests 348
ℹ suites 0
ℹ pass 346
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 97222.847
```

`npm run test:node-guards` returned rc=1. The two reds are exactly the task-predicted F-1507-1 Node 23 file-timeout semantics failures: `all 23 scripts/*.test.mjs fixture owners remove their temp directories` and `a per-test timeout still overrides the default, so declared budgets are untouched`. The citation test contributed 15 visible greens, including both new named arms.

```text
TSC_RC=0
```

The live `node scripts/citation-title-guard.mjs` gate also passed with 511 scanned and the same 262 / 206 / 43 split. `git diff --check` returned rc=0.

`git status --porcelain scripts/` lists only:

```text
 M scripts/citation-title-guard.mjs
 M scripts/citation-title-guard.test.mjs
```

Therefore `scripts/citation-title-baseline.json` is unchanged. `git status --porcelain` also shows no `tasks/**` change. No baseline update command was run.

`npm run build` and a browser battery were not run and are not owed: this slice touches no `src/`, e2e, browser, rendering, or simulation surface.
