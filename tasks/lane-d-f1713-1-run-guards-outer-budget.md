# Task F-1713-1: give run-guards enough outer time for Node 26 (LANE-D, commit prefix `fix:`)

**FIRE-AUTHORED s1714 (attended review welcome).**
**CODEX: model=gpt-5.6-sol effort=medium**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` at F-1713-1; `reviews/version-rigor.md`; `artifacts/f1712-1-gate-s1713.txt`; `scripts/run-guards.mjs` at the child `spawnSync`; `scripts/run-guards.test.mjs` at `a signal-killed guard is never a pass`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

SEQUENCING LAW: verify `git merge-base --is-ancestor b78a67967d3c6d25abd87a733b3d8d5a6dc9570b main`; `grep -Fc 'timeout: 10 * 60 * 1000,' scripts/run-guards.mjs` must print `1`; `grep -Fc 'a signal-killed guard is never a pass' scripts/run-guards.test.mjs` must print `1`. Any other result means the evidence or subject moved: STOP and report, do not guess.

## Why

The fixed 600-second child ceiling is now below a measured healthy run on the pinned Node 26.4.0 runtime. In s1713 the wrapper SIGTERM-killed a progressing `test:node-guards` arm at 600 seconds; the identical standalone arm completed green in 637.6 seconds. The s1714 standalone control also completed green in 508.5 seconds. The variance, not any per-test timeout, is the defect.

## Scope

1. Change only the child-process outer timeout in `scripts/run-guards.mjs` from 10 minutes to 15 minutes. Keep every per-test timeout and all guard behavior unchanged.
2. In the existing `scripts/run-guards.test.mjs`, add one small static contract test proving the outer timeout is 15 minutes and the old 10-minute literal is gone. Reuse its existing `fs` import and `SCRIPT` path.
3. Preserve the existing signal-killed-child behavior and its test.
4. If the source already satisfies the contract, write a report explaining the no-op before exiting.

## Firewall

Touch ONLY:
- `scripts/run-guards.mjs`
- `scripts/run-guards.test.mjs`

NO new script, helper, abstraction, environment variable, configuration, dependency, package script, product code, simulation code, e2e spec, or timeout change outside the one outer child budget.

## Self-check

- `node --test scripts/run-guards.test.mjs`
- `node scripts/run-guards.mjs --only test:power-budget`
- `npm run test:ledger-guards`
- `npx tsc --noEmit`
- `npm run build`
- `git diff --check`
- `git diff --name-only main...HEAD` lists exactly the two firewall paths.

End with `READY-FOR-GATES` and report the new outer budget, confirmation that per-test budgets are unchanged, the focused test count, and the full ledger-guard result.
