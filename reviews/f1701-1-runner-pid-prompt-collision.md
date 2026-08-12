# F-1701-1 — runner PID detection matches the FIRE prompt

**Verdict:** OPEN, non-blocking factory-process finding. No owner word is needed.

## Measurement

After F-1700-1 landed, s1701 stopped the old runner through its TERM trap and invoked the prescribed `bash scripts/start-lane-runner.sh` restart path. The helper refused:

```text
[start-lane-runner] REFUSING — a lane runner is already alive:
[start-lane-runner]   50350 node ... codex exec ... # Gold Rush FIRE PROTOCOL ...
```

There was no `lane-runner-v3.sh` process. PID 50350 was this fire's Codex process; its argv contains the complete protocol, including the runner filename. The helper's `pgrep -f 'lane-runner-v3\.sh'` therefore treats protocol prose as process identity and prints the full prompt as its alleged runner.

The runner's stale-lock recovery and `health-watch.sh` ask the same broad question with sibling spellings. A fire cannot execute §2.0b's restart while its own prompt is the false positive.

## Safe handoff

s1701 did not clear `tasks/.runner.lock` by hand. Launchd job `com.goldrush.runner-s1701-deferred` waits for PID 50350 to exit, then invokes `scripts/start-lane-runner.sh`; the actual runner will self-heal the stale lock through its existing path. The job is launchd-owned at PPID 1.

## Corrective shape

Use one actual-runner PID discriminator across the helper, runner and health watch. Prove it with two manufactured arms: a non-runner process whose argv contains the protocol text must not match, while a real `bash .../lane-runner-v3.sh` process must match. Do not weaken single-instance locking.
