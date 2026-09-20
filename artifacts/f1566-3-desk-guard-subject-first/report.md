# f1566-3 — desk guard subject-first closure report

## Change

- Exported `subjectLedClosure(backlogText, id)` from `desk-state-audit.mjs`. It reuses the auditor's `subjectRows()` and shared `subjectState()` path, with `findings-state-guard`'s wide `scan()` remaining the only closure reader.
- Replaced the carry-forward guard's raw census lookup with that subject-first predicate and corrected the header with the measured 21-of-343 citation-only attribution count.
- Extended `desk-carryforward-guard.test.mjs` because it already owns the guard's fixtures and CLI boundary. No new test file or `package.json` edit was needed.

## Manufactured RED

The fixture drops `F-1541-2` while its only BACKLOG mention is a citation in `- ✅ **F-1542-1 CLOSED — supersedes F-1541-2.**`.

With only the guard predicate temporarily restored to the old raw-census lookup:

```text
✖ citation-only closure cannot silently excuse a dropped desk item
tests 1
pass 0
fail 1
AssertionError: Expected values to be strictly equal:
0 !== 1
```

The actual `0` is the old fail-open: the CLI silently passed. After restoring the subject-first predicate:

```text
✔ citation-only closure cannot silently excuse a dropped desk item
tests 1
pass 1
fail 0
```

The passing test asserts CLI exit `1` and that stderr names `F-1541-2`. The same CLI fixture also proves a genuine subject-led `F-1541-2 CLOSED` row exits `0`, `DESK-DROPPED: F-1541-2` exits `0`, absent and empty previous desks each exit `2`, and an ACTIVE line exits `0` with `SKIP`.

## Lane-board verdict before and after

Both runs were byte-identical:

```text
=== desk-carryforward-guard ===
SKIP — STATUS.md line-1 is a live ACTIVE lock, not a handoff.
  The desk is written at handoff time; test:ledger-guards gates it then.
```

This is only the lane-board verdict, not a claim about current main. At the final check the lane blobs were stale relative to main:

```text
                    lane                                      main
STATUS.md           5afd2b1f470cb6ca337f126abff1a5d336d79b93 dc4ed125674bf8931eeb62e32e05bbefbc8a080b
tasks/BACKLOG.md     a0e7d4ebeee9f312831c2871af8c8d3fbd193a9d fc166a504990d468242bec90dec7b2fe47c5619e
```

No live-board verdict changed and no silent-drop id newly surfaced in this lane run.

## Verification

- Pre-change: `npm install --no-audit --no-fund` green; `npm run build` green.
- Post-change: `npx tsc --noEmit` rc 0; `npm run build` green; asset-diet green.
- Focused guard file: 15 tests / 15 pass / 0 fail.
- Auditor regression file: 9 tests / 9 pass / 0 fail.
- `test:ledger-guards` merge candidate (current main `5e820a61b` plus this three-file diff): **15 files / 129 tests / 129 pass / 0 fail**, compared with the stated s1566 baseline **15 files / 124 tests / 124 pass / 0 fail**.
- All 12 chained leaves passed: findings-state; blocker-panel; ruling-propagation; citations; desk-declaration; desk-birth; status-archive-audit; attended-owed-audit; main-lock-gate-guard; janitor-request-rejection; lane-dispatch-safety-guard; nul-audit.
- The stale lane alone produced 128/129 because pristine dispatched main independently failed `gate-caller-audit` on the newly merged `desk-state-audit.mjs` baseline. Current main commit `5e820a61b` repaired that baseline without touching this slice's three files; the detached merge-candidate run above is green.
- `git diff --check` clean.
- No Playwright owed: no `src/**` or `e2e/**` changes.
- No `test:node-guards` owed: no `src/sim/`, `src/systems/`, or `src/entities/` changes.

Independent `codex review --uncommitted` was attempted three times (including a resumed session); CLI v0.145.0 exited after setup each time without returning a verdict or modifying files.
