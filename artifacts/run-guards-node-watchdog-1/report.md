# Node watchdog wrapper — preflight stopped

WHY: The assigned task explicitly requires STOP-and-report when the worktree holds uncommitted changes not made by this task, except regenerated evidence. Initial `git status --short` returned `?? node_modules`. This is a pre-existing symlink (dated September 20) to `/Users/robin/Claude/Projects/Gold Rush/node_modules`, outside the evidence exceptions. It was preserved. No dependency installation, checkout/reset, cleanup, source edit, or gate execution was performed.

## Verified state

- Lane: `art/portraits-e5-e10-generated`.
- Initial HEAD: `04d88f868be9e53ed06e0be96262be1ad3a6e13f`.
- Observed main: `047b6fc103991ba84d27c70a6e3d767539a11b9b`.
- `git log --oneline main..HEAD`: empty; no undrained ahead commits.
- `git diff HEAD main -- scripts/run-guards.mjs scripts/run-guards.test.mjs`: empty.
- Current wrapper: every guard receives `timeout: 15 * 60 * 1000`.
- Requested policy, NOT implemented: `test:node-guards` 60 minutes; all others remain 15 minutes.
- No candidate implementation commit exists. No full-wrapper duration, per-guard exit code, focused count, typecheck or build result is claimed.
- `scripts/run-node-guards.mjs` and both scoped scripts remain unchanged.
- No evidence was discarded; no processes were stopped.

## Remaining work, in order

1. Resolve or explicitly exempt the pre-existing dependency symlink from the assigned cleanliness rule.
2. Bring the lane to the verified main base; read current evidence and recheck running processes/locks.
3. Install dependencies, typecheck and build before edits.
4. Implement the local Node-only 60-minute budget and bounded actual-spawn-option fixture coverage; preserve failing-child and signal-child tests.
5. Run focused checks and the literal diff-selected wrapper once to completion on the candidate; attribute any red using unchanged-base controls.
6. Record actual timings, exit codes, counts and hashes, then commit only authorized paths with `fix:`. Browser drain gates remain with the orchestrator.

Status: BLOCKED AT PREFLIGHT, not READY-FOR-GATES.
