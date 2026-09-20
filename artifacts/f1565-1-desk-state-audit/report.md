# F-1565-1 desk-state auditor — lane report

## Result

Implemented the advisory desk-state auditor, its fixture-driven tests, and the existing `test:ledger-guards` registration. The shared `findings-state-guard.mjs` vocabulary was not changed.

## Gates

- Dependency probes: `1` / `1`.
- Pre-edit: `npm install --no-audit --no-fund` green; `npm run build` green.
- `npx tsc --noEmit`: rc 0.
- `npm run build`: green (`vite` built in 1.29s; asset-diet within ceiling).
- `node --test scripts/desk-state-audit.test.mjs`: 9 tests, 9 pass, 0 fail.
- `test:ledger-guards` before: 14 node-test files, 115 tests, 115 pass, 0 fail.
- `test:ledger-guards` after: 15 node-test files, 124 tests, 124 pass, 0 fail; all chained leaves green.
- No Playwright was run: this slice touches no `src/**` or `e2e/**`.
- `test:node-guards` was not run: this slice touches none of `src/sim/`, `src/systems/`, or `src/entities/`.

The proactive `codex review --uncommitted` replayed the focused suite and full ledger battery green, then hung while probing repository history and returned no verdict. It was stopped; no independent clean-review claim is made.

## Manufactured false-positive proof

Fixture: desk carries `F-1541-2`; the only BACKLOG occurrence is incidental inside the subject zone of `- ✅ **F-1542-1 CLOSED — cites F-1541-2.**`.

Subject-first filter temporarily removed:

```json
{"id":"F-1541-2","type":"finding","verdict":"CLOSED","evidence":[1]}
```

The targeted test failed: 0 pass / 1 fail, because `--strict` exited 1.

Filter restored:

```json
{"id":"F-1541-2","type":"finding","verdict":"UNRECORDED","evidence":[]}
```

The focused suite then passed 9/9. The temporary mutation was fully reverted.

## Lane-board run

`node scripts/desk-state-audit.mjs` produced:

```text
SKIP — line-1 is a lock line, no desk to audit
```

Therefore there is no per-item table to report from the lane's current line 1: it begins `ACTIVE`, and the auditor correctly exits 0 before reading an unfinished desk. The exact output is in `lane-board.txt`.

This lane's ledgers are stale and must not be represented as main's state. Blob hashes differ:

| File | lane/b | main |
| --- | --- | --- |
| `STATUS.md` | `08af31f5e7aa93562d54b43cf91d353688ee4eb1` | `ef176932bec0514ea196f6c6a23fa77c761beb32` |
| `tasks/BACKLOG.md` | `ccc7326094a64ebe938e39218140c1155078c1b9` | `794a7a86d2cee2be365be68ea857d103acc2e53d` |

## Judgement call: shared vocabulary

Do not fold `OPEN-DESK-ONLY` into the shared `scan()` vocabulary yet. Simply admitting `🔺` rows raises the shared census on noise and recreates the three measured conflicts because `scan()` currently treats every F-ID inside the 90-character zone as a state claim. The safe future change is a separately reviewed subject-first migration of the shared census and every consumer, with conflict fixtures. Until that larger semantic change is justified, keeping the fallback local to this advisory tool gives fires the answer without reddening unrelated gates.
