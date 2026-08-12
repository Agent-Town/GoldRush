# F-1701-1 — identify actual runner processes, not protocol text

**FIRE-AUTHORED s1702 (attended review welcome).**  
**CODEX: model=gpt-5.6-sol effort=medium**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. ⚠️ The trap this closes: a run that STOPPED still ran playwright and still regenerated screenshots, so a stopped predecessor leaves tracked dirt that freezes its successor — three consecutive masters (gazette-welcome-drift-observation-frame v1/v2, newsie-drift-shell-divergence-rate) died before measuring anything, the third killed by the exhaust of the first two.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE, WHICH THE LANE TEMPLATE OWED AND DID NOT CARRY UNTIL s1505 (F-1505-1): `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Goal

Make the runner helper, the runner's stale-lock recovery, and the health watcher agree on which PIDs are actual `bash .../lane-runner-v3.sh` processes. Protocol prose containing that filename must never count as a runner.

## Read first / freshness gate

Read `AGENTS.md`, `reviews/f1701-1-runner-pid-prompt-collision.md`, `scripts/start-lane-runner.sh`, the stale-lock block in `scripts/lane-runner-v3.sh`, `scripts/health-watch.sh`, and `scripts/runner-restart-recipe.test.sh`.

Before editing, run:

```sh
grep -Fc 'Use one actual-runner PID discriminator across the helper, runner and health watch.' reviews/f1701-1-runner-pid-prompt-collision.md
```

Expected: exactly `1`. Otherwise STOP: the measured finding this master is written against moved.

## Why (F-1701-1, measured s1701 on 2026-08-12)

`scripts/start-lane-runner.sh` currently counts `pgrep -f 'lane-runner-v3\.sh'`; `scripts/lane-runner-v3.sh` asks the same broad question while recovering a stale lock; `scripts/health-watch.sh` uses the sibling `[l]ane-runner-v3.sh` spelling. A Codex FIRE process carries the whole protocol in its argv, so all three predicates can classify the FIRE as the runner. s1701 observed PID 50350 refused as "already alive" even though no runner process existed, and the helper printed the entire FIRE prompt as the alleged process.

This is a process-identity bug, not a lock-policy bug. Keep the lock and its self-healing semantics; replace the three broad argv substring searches with one shared, side-effect-free discriminator for the actual command shape.

## Scope

1. Add one small shared shell helper at `scripts/runner-processes.sh` that lists only actual runner PIDs. It must accept both relative and absolute script paths for the factory's real launch shape, and it must not match an unrelated process merely because later argv text mentions `lane-runner-v3.sh`.
2. Source and use that discriminator in `scripts/start-lane-runner.sh`, `scripts/lane-runner-v3.sh`, and `scripts/health-watch.sh`. Keep each caller's current behavior: the helper refuses a second live runner and verifies a new one; the runner excludes its own PID while deciding whether a held lock is stale; health-watch reports/restarts from the same truth.
3. Do not weaken the single-instance lock, clear `tasks/.runner.lock` by hand, or make liveness depend only on the lock directory. A genuine corpse must still self-heal; a genuine live runner must still prevent a second instance.
4. Extend `scripts/runner-restart-recipe.test.sh`; do not create another guard. Manufacture both arms with short-lived scratch processes:
   - a non-runner whose argv contains the FIRE protocol text and `lane-runner-v3.sh` is rejected by the discriminator;
   - a real `bash <scratch>/lane-runner-v3.sh` process is found exactly once, and the caller's self-exclusion leaves zero others.
5. Prove the old broad `pgrep -f` shape goes red on the prompt-carrier fixture while the new shared discriminator stays green. Clean every manufactured process and scratch directory through traps, including a failing test run.
6. If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Touch only

- `scripts/runner-processes.sh`
- `scripts/start-lane-runner.sh`
- `scripts/lane-runner-v3.sh`
- `scripts/health-watch.sh`
- `scripts/runner-restart-recipe.test.sh`

Do not edit `STATUS.md`, task masters, ledgers, package scripts, gameplay, specs, Playwright suites, or any other guard. No dependencies.

## Gates

```sh
bash -n scripts/runner-processes.sh
bash -n scripts/start-lane-runner.sh
bash -n scripts/lane-runner-v3.sh
bash -n scripts/health-watch.sh
bash scripts/runner-restart-recipe.test.sh
bash scripts/main-lock-gate-guard.test.sh
bash scripts/lane-dispatch-safety-guard.test.sh
bash scripts/runner-commit-decoupling-guard.test.sh
node scripts/gate-caller-audit.mjs --include-untracked
npm run build
git diff --check
git diff --name-only main...HEAD
```

The final path list must be exactly the five TOUCH-ONLY files. Report the discriminator's accepted command shape, both manufactured arms, preservation of corpse self-healing/live-runner refusal, and whether the detached runner needs another helper-script restart after drain. End `READY-FOR-GATES` only if every gate is green.
