# F-2429-1 — the battery wedge, diagnosed from live specimens (s2429, 2026-09-01)

Four fires treated the `test:ledger-guards` wedge as an unreproducible flake and tried to
re-create it (s2412 caught it ~1-in-4 in one window; s2413 got 0/28; s2428 got 0/2).

**Five wedged processes were alive on this machine the whole time** — 15 hours old, orphaned
at `PPID 1`, `0.0%` CPU. They were never inspected. This directory is their post-mortem.

## The specimens

| pid | elapsed at capture | command |
|---|---|---|
| 12801 | 15:17:48 | `node /var/folders/…/s2412-lpg-grow-jUnZlF/variant.mjs --root <repo>` |
| 13028 | 15:16:48 | `node /var/folders/…/s2412-lpg-ni1UEf/variant.mjs --root <repo>` |
| 13454 | 15:14:52 | `node scripts/law-pointer-guard.mjs --root <repo>` |
| 13609 | 15:14:07 | `node /var/folders/…/s2412-lpg-grow-GKjjZZ/variant.mjs --root <repo>` |
| 65672 | 15:04:03 | `node scripts/law-pointer-guard.mjs --root <repo>` |

Launch times cluster at 03:04–03:17, i.e. the s2412 window. `sample-<pid>.txt` and
`lsof-<pid>.txt` are the raw captures; all five sample files are byte-identical in length
(79,850 B) because the stack is identical.

## The mechanism — 5/5 specimens, complete signature

```
node::Environment::Exit(node::ExitCode)              <- the script called process.exit()
node::DefaultProcessExitHandlerInternal(...)
node::DisposePlatform()
node::NodePlatform::Shutdown()
node::WorkerThreadsTaskRunner::Shutdown()            <- joining the V8 platform worker threads
uv_thread_join
_pthread_join
__ulock_wait                                          <- blocked here, forever
```

The subject **finishes its work**, calls `process.exit(0)` (`scripts/law-pointer-guard.mjs:470`),
and deadlocks inside node's own platform teardown, waiting to join a V8 worker thread that
never parks. Two sibling threads sit in `uv_sem_wait`/`semaphore_wait_trap` and `__psynch_cvwait`.
Nothing in the process can ever make progress, which is why these survived 15 hours at 0% CPU.

The parent then hangs for a *derived* reason: `spawnSync` waits for the child's stdout to reach
EOF, and EOF arrives only when the child exits. The child can never exit.

## What this refutes

- **NOT the stdout pipe / buffer.** The subject writes **1,571 B**; the macOS unix-socketpair
  buffer (`net.local.stream.sendspace`) is **8,192 B**. It never needed to block on a write, and
  no write frame appears in any of the five stacks. The `->(none)` peers in `lsof` are a
  **consequence** — the parent was killed later — not the cause.
- **NOT the subject's I/O weight** (s2413 measured this irrelevant across a 4.5× span; confirmed).
- **NOT a grandchild** (s2428 refuted; `law-pointer-guard.mjs` has zero subprocess calls).
- **NOT the tmpdir** (s2412 refuted).
- **NOT `node --test` specifically.** Concurrency raises the odds of losing the race; it is not
  required. This is why "spawn a node child from inside `node --test`" never reproduced.

## Why it never reproduced

Every attempt sized itself against a per-run probability (s2413: "1-in-4 should have shown ~7
times in my 28 runs"). This is a **scheduling race inside node's platform shutdown**, so its rate
tracks machine load at the instant of exit, not the number of runs. Independence never held, and
the sample-size arithmetic that made 0/28 look surprising was measuring the wrong model.

## What it validates

s2428's cure (`timeout` + `killSignal: SIGKILL` on every spawn in `law-pointer-guard.test.mjs`)
is **exactly right**, and now has a named reason: the deadlock is in the node runtime, not in our
code, so it cannot be fixed from here — it can only be made loud. `SIGKILL` also reaps the child,
which is what stops the orphan accumulation visible above. s2412's "polarity is not optional;
diagnosis is" holds, and the polarity cure is what kept this cheap.

## Not cured, and the restraint is deliberate

The obvious mitigation is `process.exit(0)` → `process.exitCode = 0`. It is **not** shipped here:

1. It cannot be measured. Three fires failed to reproduce the race, so "it works now" would be
   unfalsifiable — the same trap F-1410-2 forbids in the other direction.
2. It changes exit semantics for a guard whose exit code the whole battery reads.
3. The bug is in node's teardown; a workaround should be justified against a reproduction.

Filed priced as **F-2429-2**.

## Reproduction of the capture

```
node -e "…ps -Ao pid,ppid,stat,etime,%cpu,command…"   # find PPID-1 node orphans
node /tmp/s2429-forensics.mjs <pid> [<pid>…]           # sample + lsof each, compare signature
```

⚠️ Filter `ps` output to lines whose **command begins with `node`**. A bare `grep` for the script
name also matches the fire's own `claude -p` process, whose prompt text quotes it — the
`pgrep`-inside-the-command-it-probes tautology in a new costume. This bit once during capture.
