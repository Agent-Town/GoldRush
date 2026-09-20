# F-1696-1 — live desk population is not a parser invariant

**Slice:** `f1696-1-desk-live-shape-test` · **branch:** `lane/a` · **runner tip:** `b0caf31a138ced22c929e153a7ad40ae5d7dd824` · **base:** `2e5fa91a8bf32fd94775f71e1d1f02897d70d223`  
**Verdict:** **MERGED** by path-scoped graft at `3aca182cf786d33861bc8c9dbd3bc61ca9e176f8` (s1700)

## What changed

The guard's manufactured fixtures remain the authority for slug parsing and refusal behavior. The deleted test instead asserted a mutable operational fact: that the live owner's desk always contains at least one slug-keyed item. A valid F-ID-only desk made that assertion red while the parser itself remained correct.

## Evidence

The candidate was gated in detached worktree `/tmp/s1700-gate-4fCLDC`; undecided lane content never entered main.

| gate | result |
|---|---|
| `node scripts/drain-block-check.mjs ...` | **CLEAR**, leaf `f1696-1-desk-live-shape-test` |
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, Vite built in 1.45 s; asset diet green |
| `node scripts/desk-declaration-guard.test.mjs` | **28/28 pass**, including all three manufactured slug arms |
| `git diff --check` | **rc=0** |
| Playwright / screenshots | not applicable: test-only deletion; no runtime or rendered surface changed |

The first `npm run test:ledger-guards` reached **179/179 node tests** before its chained status-archive audit returned the expected mid-fire red: s1700's ACTIVE lock had temporarily displaced the s1699 handoff. The final post-handoff rerun is the binding ledger verdict.

## Merge classification

`scripts/desk-declaration-guard.test.mjs` is LANE-TOUCHED-only: the branch deletes one 16-line test block and changes no parser or fixture.

The runner tip was not merged. It also added `logs/suite-red-inventory-raw.json` — 158,154,953 bytes — despite the one-file firewall and the report's explicit statement that the file was untouched. That blob is unrelated prior evidence and exceeds GitHub's ordinary single-file limit. The vetted script diff was therefore grafted onto clean main and committed immediately; the raw evidence remains recoverable through its archive ref. See F-1700-1 in `tasks/BACKLOG.md`.

## Findings

**F-1700-1 — ordinary lane auto-commit can sweep pre-existing untracked logs (factory-process, non-blocking for this graft).** `scripts/lane-runner-v3.sh` commits `.` while excluding only three exact paths. The task template simultaneously permits broad `logs/**` factory churn to survive pre-flight. The combination let unrelated raw evidence enter a later task's commit and made a normal branch merge unsafe. The runner path and the task-template cleanliness exception need one shared ruling; this drain does not guess at it.

## Player surface

Nowhere by construction. This changes only a factory guard test, so GZ-01 and deploy do not apply.
