# Node guard ps capture — lane-a report

Verdict: READY-FOR-GATES for F-2546-1; HOLD for integration because the full Node battery remains red on independent base failures.

## Change

- `scripts/run-node-guards.mjs`: the advisory contention reader now bounds `ps` capture at 64 MiB.
- `scripts/node-guards-contention.test.mjs`: the loud quiet-board reader now bounds `ps` capture at 64 MiB.
- The existing contention test now uses PATH-local fake `pgrep` and `ps` executables to emit a 1,200,009-byte observer command, above Node's prior 1 MiB default. It runs the real classifier for observer-only and observer-plus-battery cases. No giant real process is launched.
- Existing lone-battery silence, wrapper/child collapse, missing-`pgrep`, and child pass/fail exit-code checks remain.

The 64 MiB bound is finite. Quiet-reader capture failures beyond it remain loud; advisory-reader capture failures beyond it still omit the optional stamp.

## Capture verdicts

- Oversized observer only: quiet-reader `false`; launcher emits no contention stamp.
- Oversized observer plus one genuine battery row: quiet-reader `true`; launcher emits `CONTENDED — 2 concurrent batteries` before and after its child.

## Teeth

Pinned Node: v26.4.0.

- Scratch copy with only the quiet-reader `maxBuffer` removed: exit 1, `spawnSync ps ENOBUFS`.
- Scratch copy with only the advisory-reader `maxBuffer` removed: exit 1, both expected stamps are `null`.
- Cured focused test: 1 pass, 0 fail.

Evidence: `mutation-red.txt`, `pinned-verification.txt`.

## Verification

- `node --test scripts/node-guards-contention.test.mjs`: PASS, 1/1 on Node v26.4.0.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS.
- `node scripts/gate-caller-audit.mjs --include-untracked`: PASS.
- `npm run test:node-guards`: HOLD, terminal exit 1 on Node v26.4.0; 742 tests, 737 pass, 3 fail, 2 skip, 607,804.511 ms. No reduced-concurrency banner was present. No `ENOBUFS` occurred. The contention regression passed. The failing initial Node leg prevented every chained-tail command from running.

Full-battery reds, retained without weakening or out-of-scope edits:

1. `deploy-mirror-allowlist.test.mjs`: missing resolved `assets/raw/plate-contract-the-claim.png`.
2. `desk-declaration-guard.test.mjs`: correctly refuses the linked worktree's stale `STATUS.md` line 1.
3. `fixture-teardown.test.mjs`: stopped at `board-tape-gold.test.mjs`, whose three historical tapes fail as malformed under current grammar (F-2541-1 family).

The fixture-owner sweep declared 128 subjects but actually visited 20 before stopping at the failing subject. The exact ordered list is in `fixture-owner-visited.txt`; the title alone is not used as proof of full visitation.

## Review and cleanup

Independent `codex review --uncommitted` found one P1 factory-churn issue: verification had emptied `logs/task-stats.jsonl`. All 789 tracked rows were restored from HEAD. Temporary scratch copies were removed. Final tracked changes are confined to the two allowed scripts.
