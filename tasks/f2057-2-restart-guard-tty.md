# Task f2057-2-restart-guard-tty: the runner-custody guard cannot run in a fire shell, so it reds forever (lane-d, prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2057, from a measured drain-side finding (F-2057-2).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST:
- `AGENTS.md`
- `scripts/runner-restart-recipe.test.sh` — the subject. Find the custody arm by CONTENT, not by line: `grep -n '/usr/bin/script -q /dev/null /usr/bin/env'` (2 hits — the control arm and the substitute-runner arm; BOTH are the subject).
- `scripts/start-lane-runner.sh` — the helper under test. It is **healthy and must not be modified**.
- `scripts/fire-shell-serialisation.test.mjs` — the house pattern for a guard that must behave differently by environment and asserts BOTH directions rather than pinning one.
- `tasks/BACKLOG.md` — read F-2057-2 (find it by CONTENT: `grep -F "THE RUNNER-CUSTODY GUARD IS UNRUNNABLE IN A FIRE SHELL"`).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): ahead commits already on main = SAFE DUPE → `git checkout -B lane/lane-d main && git clean -fd`, PROCEED; STOP only on un-merged ahead content or foreign uncommitted edits. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1) + FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` never a STOP; modified tracked `src/**`/`scripts/**`/`e2e/**`/`tasks/**`/`specs/**`/`reviews/*.md` still STOP.

**CITATION CHECK — run this BEFORE any edit; 0 means the lane drifted, so STOP and report:**
```
grep -Fc 'real helper custody failed: pid=' scripts/runner-restart-recipe.test.sh          # expect 1
grep -Fc 'helper accepted a substitute runner after its recorded PID exited' scripts/runner-restart-recipe.test.sh   # expect 1
grep -Fc '/usr/bin/script -q /dev/null /usr/bin/env' scripts/runner-restart-recipe.test.sh # expect 2
```
Then `npm install --no-audit --no-fund`; `npm run build` green.

## Why (measured s2057, during the assay-worker-loop drain — evidence, not inference)

`npm run test:ledger-guards` is the battery **F-1300-4 requires as the LAST act of every fire that writes a ledger row**. In the s2057 fire shell it returned **rc=1 with exactly 2 failures**, both from `runner-restart-recipe.test.sh`:

```
FAIL — real helper custody failed: pid=none PPID=gone TTY=gone
FAIL — helper accepted a substitute runner after its recorded PID exited
```

**Attribution was done properly and the slice being drained is NOT the cause**: a same-root control with the slice reverted (`git reset --hard` in the gate worktree, only the content varying) reproduced **both failures identically**.

**The single root cause was then measured directly**, by replicating the custody arm and printing the helper output the guard discards:

```
=== helper exit: 1 ===
=== control.out ===
script: tcgetattr/ioctl: Operation not supported on socket
=== extracted control_pid: [EMPTY] ===
```

`/usr/bin/script` requires a **tty on stdin**. A fire runs headless (`claude -p`) with stdin on a **socket**, so `script` aborts before ever executing `$HELPER`. `control.out` therefore never contains `runner UP at pid`, `control_pid` is empty, and:
- assertion 1 fails because there is no pid to check for `PPID 1` / `TTY ??`;
- assertion 2 fails because it greps for `FAILED — no runner process`, which the helper also never printed.

**Two failures, one cause.** This is not a flake and not load-dependent: it is deterministic for every fire shell.

⚠️ **THE HELPER ITSELF IS HEALTHY — DO NOT "FIX" IT.** Verified the same fire: `bash scripts/start-lane-runner.sh --check` → **rc=0**, `codex 0.147.0 at ~/.nvm/versions/node/v23.11.1/bin/codex`, child node `v23.11.1`, `CLAUDE_CONFIG_DIR/CLAUDECODE scrubbed`, `environment is READY`, and it correctly **REFUSED** because the live runner (pid 451) was alive. §2.0b's sanctioned restart path is intact. **The defect is in the GUARD's fixture, nowhere else.**

The PTY arm landed in `12383d95f` (s1816, 2026-08-15T23:33) as part of the F-1815-3 custody cure — which was correct work, validated where a tty exists. What it did not carry is an environment discriminator.

**WHY THIS IS WORTH A TASK RATHER THAN A SHRUG:** a battery that is permanently rc=1 in the one shell that is required to run it teaches every fire to discount it. That is precisely how F-1460-1's `cross-engine` label decayed — a red nobody investigates is worse than no test — and here it would mask the ledger/law/desk guards that share the chain, which are the ones that actually protect the board.

## Scope

1. **Add a tty discriminator to the two PTY-dependent arms of `scripts/runner-restart-recipe.test.sh`.** When stdin is not a tty (`[ -t 0 ]` is false), those two arms must emit a **loud, visible SKIP** — a line matching `SKIP` that names the reason (no controlling terminal) — and must **not** count as failures. When a tty IS present, they must run exactly as they do today, unchanged. Do not delete the assertions and do not weaken them.
2. **The skip must not be silent and must not be a fake pass.** Follow the file's existing reporting shape: whatever `ok`/`bad` do today, add a third verb (e.g. `skip`) that prints and is excluded from the `RESULT: N failure(s)` count. `RESULT` must remain rc=0 only when there are zero genuine failures.
3. **Prove BOTH directions, the `fire-shell-serialisation.test.mjs` way.** The guard must be exercised so that:
   - with **no tty** it reports the two SKIPs and exits **0** (given everything else passes);
   - with **a tty** it still reaches and runs the real custody arms.
   For the tty direction, drive the guard itself through `/usr/bin/script` (that is the only PTY tool this repo already depends on — do not add a dependency). If you cannot obtain a tty in the lane shell, say so explicitly and report the arm as UNMEASURED rather than claiming it.
4. **Report, do not fix, anything else.** If any other leaf of `test:ledger-guards` is red in the lane, name it with its assertion text and leave it alone.

## Firewall

Touch ONLY: `scripts/runner-restart-recipe.test.sh`.

NO changes to: `scripts/start-lane-runner.sh` (verified healthy — modifying it is the failure mode this task exists to prevent), `scripts/lane-runner-v3.sh`, `scripts/runner-processes.sh`, `scripts/health-watch.sh`, `package.json`, `tasks/**`, `CLAUDE.md`, `scripts/fire.md`, any `src/**`, any other guard. **Do not touch the live runner process or `tasks/.runner.lock`** — this task is a test-file edit and must never `kill`, restart, or `rmdir` anything.

## Self-check

- `bash scripts/runner-restart-recipe.test.sh` in the lane shell: report the FULL `ok`/`skip`/`FAIL` list and the `RESULT` line, plus the exit code.
- `npm run test:ledger-guards`: report rc and, if non-zero, the exact failing assertion texts.
- `npx tsc --noEmit` + `npm run build` green (the repo bar, even though this is a shell file).
- State plainly which of the two directions in scope item 3 you actually measured, and which (if either) you could not.

End: **READY-FOR-GATES** + report: the before/after `RESULT` lines, the exit codes, the tty-vs-no-tty evidence, and any other `test:ledger-guards` leaf you found red but did not touch.

## No-op / honesty guard

The forbidden green here is a guard that **stops failing by stopping testing** — e.g. skipping the arms unconditionally, or reporting `ok` where it should report `skip`. If your change makes the no-tty run green, you must be able to show the tty run still executes the real helper. A silent unconditional skip would remove the only mechanical protection on runner custody, which is worse than the permanent red it replaces.
