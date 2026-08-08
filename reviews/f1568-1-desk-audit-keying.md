---
task: f1568-1-desk-audit-subject-first-keying
date: 2026-08-08
lane: lane-c
verdict: READY-FOR-GATES
---

# F-1568-1 desk audit keying

## Verdict

READY-FOR-GATES. `desk()` now delegates both finding and slug extraction to the carryforward guard's exported `deskTail()` and `deskItems()`. Its signature, return shape, and verdict logic are unchanged.

## Implementation

- Imported `deskTail` and `deskItems` from `scripts/desk-carryforward-guard.mjs` and deleted the duplicate desk parser.
- Kept `line1.startsWith('ACTIVE')` rather than importing `isLockLine`. This preserves the audit's lock exit exactly as required and avoids changing the accepted lock vocabulary in this item-keying slice.
- Mapped shared keys back to the existing `{ id, type }` shape with `FINDING_ONE`; findings remain `finding`, other shared keys remain `slug`.
- Added three regression tests: prose-only F-ID exclusion, post-`KEY_ZONE` citation exclusion, and exact key agreement with the carryforward parser.
- `scripts/desk-carryforward-guard.mjs` remained read-only. I found nothing there that I would change in this slice.

## Pre-flight

- Branch `lane/c` was clean and exactly at `main` (`main...HEAD` = `0 0`); no ahead commits or artifacts needed disposal.
- Both sequencing probes printed `1`.
- `npm install --no-audit --no-fund`: up to date.
- Baseline `npm run build`: green; Vite `1.70s`; Herald asset-diet `1,158,214` bytes.

## Deleted constants

Before editing, `rg -n "\\b<NAME>\\b" scripts/desk-state-audit.mjs` showed:

- `FINDING`: declaration line 32, use line 49.
- `SLUG`: declaration line 34, use line 53.
- `DESK_WORD`: declaration line 35, use line 46.
- `KEY_ZONE`: declaration line 36, use line 51.
- `FINDING_ONE`: declaration line 33, uses lines 52 and 64.
- `SUBJECT_CHARS`: declaration line 31, use line 64.

After delegation, `rg -n "^const (FINDING|SLUG|DESK_WORD|KEY_ZONE)\\b" scripts/desk-state-audit.mjs` returned no matches, proving the four deleted declarations dead. `FINDING_ONE` and `SUBJECT_CHARS` remain live at final lines 33 and 32 respectively.

## Manufactured RED

With the three new tests present, I restored only the old global finding extraction line (and its required `FINDING` declaration). `node --test scripts/desk-state-audit.test.mjs` returned rc `1`: 12 tests, 8 pass, 4 fail.

Failing tests and exact assertions:

1. `prose-only finding outside a desk segment is not an item`

   `AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:`

   actual `[ 'F-1567-2', 'F-1567-3' ]`; expected `[ 'F-1567-2' ]`.

2. `a late finding citation does not replace the segment key`

   `AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:`

   actual `[ 'F-1567-2', 'F-1567-3' ]`; expected `[ 'F-1567-2' ]`.

3. `desk audit and carryforward guard use the same item keys`

   `AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:`

   actual `[ 'F-1567-2', 'F-MILK-SS-3', 'F-1300-4' ]`; expected `[ 'F-1567-2', 'rf-34-hero-y-restore-roundtrip', 'F-MILK-SS-3' ]`.

4. Existing `goal slugs resolve merged and blocked states`

   `TypeError [Error]: Cannot read properties of undefined (reading 'verdict')`.

The fourth failure is expected from restoring only the old findings line after deleting its former local slug loop; the first three are the new regression arms. After restoring the shared-parser cure, the suite returned rc `0`, 12/12 pass.

## Live-board measurement and exits

- Extracted the archived `s1567 handoff (line-1 archive)` into a temporary file outside the repo and ran `desk-state-audit --status <temp> --json`.
- Parsed: **22 items**. Header declared: **22 awaiting a word**.
- Current repo line 1: `SKIP — line-1 is a lock line, no desk to audit`, rc `0`.
- Headerless `/dev/null` status: `REFUSING — no desk header on line-1`, rc `2`.

## Final gates

- `npx tsc --noEmit`: rc `0`.
- `node --test scripts/desk-state-audit.test.mjs`: before `9`; after `12`; `12 pass / 0 fail`.
- `npm run test:ledger-guards`: `15 files / 132 tests / 132 pass / 0 fail`, plus `12/12` chained leaves green. The test total exceeds s1567's recorded 129.
- `npm run build`: green; Vite `1.20s`; Herald asset-diet `1,158,214` bytes; terrain/landmark GLBs `592,044,952 -> 92,718,740`; plate PNGs `187,042,157 -> 24,822,346`.
- `git diff --check`: clean.
- No Playwright or `test:node-guards` run: this slice touches no `src/**`, `e2e/**`, `src/sim/**`, `src/systems/**`, or `src/entities/**`.
