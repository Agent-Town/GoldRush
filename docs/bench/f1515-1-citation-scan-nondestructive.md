# F-1515-1 citation scan — non-destructive pairing

Date: 2026-08-07  
Task: `lane-f1515-1-citation-scan-nondestructive`  
Outcome: **READY-FOR-GATES**

## Pre-flight and baseline

```text
$ git merge-base --is-ancestor 6706dba05 HEAD
ancestor_rc=0

$ grep -c "const QUOTED_BY_KIND = " scripts/citation-title-guard.mjs
1
```

`git status --porcelain` printed nothing at the original pre-flight. The orchestrator then committed the licensed attempt-1 stop and re-authored scope 3 with a relative bar at `a8ab8dfd2`; the implementation baseline on that amended task was:

```text
$ node scripts/citation-title-guard.mjs --report
=== citation-title-guard (report) ===
citations: 515
  NUMBER-ONLY     262
  CARRIES-TITLE   210
  CARRIES-LINE    43
  NOT GATED: 1148 citation(s) in 175 tracked .md outside tasks/ — largest logs/suite-red-inventory.md (646).
```

Thus `B_scanned=515`, `B_title=210`, and `B_number=262`.

## Implementation

`matchingQuote()` keeps the loose scanner as its compatibility source, then enumerates every same-kind opening/closing pair in the 400-character window without consuming delimiters. Candidate spans retain the existing 12–160 character and no-newline limits and still resolve through `matchesATitle()`. The explicit O(k²) scan is bounded by the existing window; the full 515-citation report took **0.56 s** (`real`) locally.

`TITLE_DECL` now admits only `skip`, `only`, `fixme`, `slow`, `fail`, `describe`, `describe.skip|only|configure`, and `describe.serial|parallel` with their valid chained `.only` forms. Arbitrary helpers such as `test.setBalance(...)` no longer contribute titles.

Both production paths still use the one mechanism: the title scan calls `matchingQuote()` at `scripts/citation-title-guard.mjs:218`, and the source-line fallback calls it at `scripts/citation-title-guard.mjs:225`.

## Manufactured-defect evidence

I temporarily reverted both implementation regions with `apply_patch`, ran only the two new named arms, then restored the fixed code with `apply_patch`.

Old behavior:

```text
✖ an odd same-kind delimiter cannot consume the following quoted title
✖ a test helper string is not harvested as a title
ℹ tests 2
ℹ pass 0
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
old_behavior_rc=1
```

The first arm got `NUMBER-ONLY 1` and expected exit 0; the second got `CARRIES-TITLE 1`/exit 0 from the polluted helper and expected exit 1.

Restored fixed behavior:

```text
✔ an odd same-kind delimiter cannot consume the following quoted title
✔ a test helper string is not harvested as a title
ℹ tests 2
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
```

The full citation-title file also passed **18 tests / 18 pass / 0 fail / 0 cancelled / 0 skipped**, including the valid `describe.serial.only` and `describe.parallel.only` regression arm added after review.

## Corpus acceptance

After:

```text
$ node scripts/citation-title-guard.mjs --report
=== citation-title-guard (report) ===
citations: 515
  NUMBER-ONLY     259
  CARRIES-TITLE   212
  CARRIES-LINE    44
  NOT GATED: 1148 citation(s) in 175 tracked .md outside tasks/ — largest logs/suite-red-inventory.md (646).
```

Scope 3 passes arithmetically: `515 == B_scanned 515`; `212 >= B_title 210` (**+2**); `259 <= B_number 262` (**-3**). Both tables sum to 515.

Scope 2's prediction is confirmed independently. With only the modifier allowlist active and the old union quote scanner temporarily restored, the report remained byte-for-byte **515 / 262 / 210 / 43**. Removing polluted helper titles moved no live verdict; the final movement comes from the non-destructive quote scan.

## Verification

- `scripts/citation-title-guard.test.mjs` is directly present in `package.json`'s `test:node-guards` roster. The full battery output names both new arms as passing, proving they ran.
- `npm run test:node-guards` on Node `v23.11.1`: `rc=1`; **351 tests / 349 pass / 2 fail / 0 cancelled / 0 skipped**. The two reds are exactly the standing F-1507-1 runtime split named by the task: `all 23 scripts/*.test.mjs fixture owners remove their temp directories` and `a per-test timeout still overrides the default, so declared budgets are untouched`.
- `codex review` found one P2: the first allowlist missed Playwright 1.61.1's valid `describe.serial.only` and `describe.parallel.only` chains. The allowlist and regression fixture now cover both; the focused file passes 18/18 and the corpus tally remains unchanged.
- `npx tsc --noEmit`: `rc=0`, no output.
- `scripts/citation-title-baseline.json`, `package.json`, and `tasks/**` are unchanged by the implementation. No `--update-baseline` command was run.
- `npm run build` and a browser battery were not run and are not owed: no `src/**` or browser run surface changed. No Playwright command was run.

**READY-FOR-GATES.**
