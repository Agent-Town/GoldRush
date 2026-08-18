# Task f2058-1-restart-guard-capability-probe: the custody guard skips on "not a tty" when the real limit is "script cannot run" (lane-d, prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2058, from a measured drain-side finding (F-2058-1) during the `f2057-2-restart-guard-tty` drain.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST:
- `AGENTS.md`
- `scripts/runner-restart-recipe.test.sh` — the subject. Find the discriminator by CONTENT, not by line: `grep -n 'custody not run: no controlling terminal'` (2 hits — the two SKIP messages) and `grep -n 'if \[ ! -t 0 \]'` (1 hit — the predicate to replace). ⚠️ Do NOT grep the bare phrase `no controlling terminal`: it returns **3**, because an unrelated passing assertion at the end of the custody arm also ends in those words. That third hit is a message you must leave alone.
- `scripts/start-lane-runner.sh` — the helper under test. It is **healthy and must not be modified**.
- `reviews/f2057-2-restart-guard-tty.md` — the drain that landed the predicate and measured why it is too wide. The four-shape table is the evidence for this task.
- `artifacts/s2058-restart-guard-stdin-matrix.txt` — the raw transcripts behind that table.
- `tasks/BACKLOG.md` — read F-2058-1 (find it by CONTENT: `grep -F "THE SKIP PREDICATE IS BROADER THAN THE DEFECT"`).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): ahead commits already on main = SAFE DUPE → `git checkout -B lane/lane-d main && git clean -fd`, PROCEED; STOP only on un-merged ahead content or foreign uncommitted edits. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1) + FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` never a STOP; modified tracked `src/**`/`scripts/**`/`e2e/**`/`tasks/**`/`specs/**`/`reviews/*.md` still STOP.

**CITATION CHECK — run this BEFORE any edit; a wrong count means the lane drifted, so STOP and report:**
```
grep -Fc 'custody not run: no controlling terminal' scripts/runner-restart-recipe.test.sh   # expect 2 (the bare phrase returns 3 — see READ FIRST)
grep -Fc '/usr/bin/script -q /dev/null /usr/bin/env' scripts/runner-restart-recipe.test.sh  # expect 2
grep -Fc 'real helper custody failed: pid=' scripts/runner-restart-recipe.test.sh           # expect 1
```
Then `npm install --no-audit --no-fund`; `npm run build` green.

## Why (measured s2058 during the drain of the very slice this corrects — evidence, not inference)

`f2057-2-restart-guard-tty` (merged `d4a8594ea88f66d23d8fb59ed64d9cf6d01ac744`) cured a real red: with stdin on a **socket**, `/usr/bin/script` aborts with `tcgetattr/ioctl: Operation not supported on socket` and both custody arms fail. That cure is correct and must not be reverted.

But its predicate is `[ ! -t 0 ]` — *"stdin is not a terminal"* — and the actual failure condition is narrower. Measured across four stdin shapes, same root, only fd 0 varying:

| stdin shape | kind seen by child | PRE-CURE guard | CURED guard (today's main) |
|---|---|---|---|
| real pty | TTY | rc=0 · 19 ok · 0 SKIP | rc=0 · 19 ok · 0 SKIP |
| `pipe` | **SOCKET** | **rc=1 · 17 ok · 2 FAIL** | rc=0 · 17 ok · 2 SKIP |
| inherit (a live fire's own stdin) | **CHARDEV** | **rc=0 · 19 ok · 0 SKIP** | rc=0 · 17 ok · **2 SKIP** |
| `/dev/null` fd | **CHARDEV** | **rc=0 · 19 ok · 0 SKIP** | rc=0 · 17 ok · **2 SKIP** |

Read the bottom two rows: on a character device `/usr/bin/script` **works**, the helper really is driven, and the arms **passed 19/19**. Today's predicate skips them anyway. The s2058 fire's own shell was exactly this shape, so **the common case silently lost two real assertions** — the ones that protect runner process custody, which is the thing a ~5h03m outage (F-1652-1) was made of.

This is not a claim that the cure was wrong. It is a claim that `[ -t 0 ]` answers *"is fd 0 a terminal?"* when the question the guard needs answered is *"can `/usr/bin/script` run here?"* — and those differ on exactly the shape most fires have.

**WHY THIS IS WORTH A TASK RATHER THAN A SHRUG:** a skip that fires more often than it must is the slow half of the forbidden green. It never reddens, so nothing forces anyone to notice, and the coverage drains away quietly. F-1460-1's `cross-engine` label decayed the same way, from the other direction.

## Scope

1. **Replace the fd-shape guess with a direct capability probe.** Before the two PTY-dependent arms, run a cheap real probe — `/usr/bin/script -q /dev/null /usr/bin/true` — capturing its output and exit code and discarding nothing. If it succeeds, RUN the arms. If it fails, SKIP them. Keep the existing loud `skip` verb and keep the arms excluded from the `RESULT: N failure(s)` count when skipped.
2. **Name the real reason in the SKIP text.** Today both SKIP lines say `no controlling terminal`, which will be inaccurate once the predicate changes (a socket stdin is not about a *controlling terminal* per se). Make each SKIP line state that `/usr/bin/script` is unusable in this shell, and include the probe's own failure text if it produced any. A reader must be able to tell a genuine environment limit from a broken helper without re-deriving anything.
3. **Prove ALL THREE directions, the `fire-shell-serialisation.test.mjs` way** — both directions asserted, never one pinned:
   - **tty** (drive the guard through `/usr/bin/script`): arms RUN, expect 19 ok / 0 SKIP.
   - **chardev** (`bash scripts/runner-restart-recipe.test.sh < /dev/null`): arms **RUN** — this is the behaviour being restored, expect 19 ok / 0 SKIP.
   - **socket** (manufacture it: spawn the guard from node with `stdio: ['pipe','pipe','pipe']`, which uv implements as a socketpair on macOS): arms **SKIP**, `RESULT` 0 failures, rc=0.
   Report the ok/SKIP/FAIL counts and exit code for each of the three. If you cannot obtain one of them, report it as UNMEASURED rather than claiming it.
4. **Report, do not fix, anything else.** If any other leaf of `test:ledger-guards` is red in the lane, name it with its assertion text and leave it alone.

## Firewall

Touch ONLY: `scripts/runner-restart-recipe.test.sh`.

NO changes to: `scripts/start-lane-runner.sh` (verified healthy — modifying it is the failure mode the predecessor task existed to prevent), `scripts/lane-runner-v3.sh`, `scripts/runner-processes.sh`, `scripts/health-watch.sh`, `package.json`, `tasks/**`, `CLAUDE.md`, `scripts/fire.md`, any `src/**`, any other guard. **Do not touch the live runner process or `tasks/.runner.lock`** — this is a test-file edit and must never `kill`, restart, or `rmdir` anything.

## Self-check

- The three-direction table from scope item 3, with real counts and exit codes.
- `npm run test:ledger-guards`: report rc and, if non-zero, the exact failing assertion texts.
- `npx tsc --noEmit` + `npm run build` green (the repo bar, even though this is a shell file).
- State plainly which directions you measured and which (if any) you could not.

End: **READY-FOR-GATES** + report: the three-direction evidence, the before/after `RESULT` lines, and any other `test:ledger-guards` leaf you found red but did not touch.

## No-op / honesty guard

Two forbidden greens here, in opposite directions:
1. **Skipping too much** — making the probe fail-closed so the arms never run anywhere. That is the predecessor's defect made permanent.
2. **Skipping too little** — running the arms where `script` genuinely cannot work, restoring the F-2057-2 red.

A change that only re-words the SKIP text without changing WHEN it fires is a no-op: say so rather than reporting it as done. The whole deliverable is that the chardev row of the table flips from 2 SKIP back to 19 ok while the socket row stays at 2 SKIP.
