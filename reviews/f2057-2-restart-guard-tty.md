# f2057-2-restart-guard-tty — the runner-custody guard gets a tty discriminator

- **Slice:** `f2057-2-restart-guard-tty` (cure for F-2057-2, fire-authored s2057)
- **Branch / tip:** `lane/lane-d` @ `6c35c3115` — `runner(lane-d): f2057-2-restart-guard-tty.md`
- **Base:** `2982ecbf206591087c768ed0ee015a5394228f01` (the s2057 commit that authored the master)
- **Merged to main:** `9cc9ba9e40c537bb98bb04eeb281285725b2d91b` (s2058, 2026-08-18)
- **Gated in:** detached worktree `/tmp/gr-s2058-gate` (§3.0b — undecided content never entered main's working tree)

## VERDICT: MERGED — with one finding filed (F-2058-1) and its corrective authored in the same fire.

The cure does exactly what its master specified, and the specification is very slightly
wider than the defect. Both halves are measured below rather than argued.

## What it does

`scripts/runner-restart-recipe.test.sh` drives the real `start-lane-runner.sh` through
`/usr/bin/script` to prove process custody (recorded PID, `PPID 1`, no controlling
terminal) and to prove the helper refuses a substitute runner. `/usr/bin/script` requires
a tty on **stdin**. The slice wraps those two arms in `if [ ! -t 0 ]` and emits two loud
`SKIP —` lines instead, leaving the other 17 assertions untouched. Six inserted lines,
one file, test-only. No product code, no helper change (the helper was firewalled NO-touch
and is byte-identical).

## Evidence

Merge classification: **pure LANE-TOUCHED.** `git log 2982ecbf2..main -- scripts/runner-restart-recipe.test.sh scripts/start-lane-runner.sh` is **empty** — main moved neither the guard nor its subject since the lane's base, so there was no three-way work and no conflict resolution to record.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **rc=0**, 4.3 s |
| `npm run build` (merged tree) | **rc=0**, 16.0 s, `✓ built in 1.37s` |
| `npm run test:ledger-guards` (merged tree) | **rc=0** |
| `npm run test:ledger-guards` (main, pre-cure, this shell) | **rc=0** — see F-2058-1 |
| npm-script chaining | guard is chained in **`test:ledger-guards` only** (grepped `package.json`) |
| `test:node-guards` | **not triggered** — diff touches no `src/sim/`, `src/systems/`, `src/entities/` (F-1460-1's path predicate) |
| Playwright | **not run, deliberately** — the diff is one test-only bash script that no product code imports; nothing renders and nothing the sim replays changes |

### The forbidden green is closed — measured, not asserted

The master named the risk itself: *"a guard that stops failing by stopping testing."* The
question is whether the arms still execute where they CAN. Under a real pty (allocated via
`python3 -c "import pty; pty.spawn(...)"`), the cured guard runs both arms and passes them:

| stdin shape | kind seen by child | PRE-CURE guard | CURED guard |
|---|---|---|---|
| **real pty** | TTY | rc=0 · 19 ok · 0 SKIP | **rc=0 · 19 ok · 0 SKIP** ← arms RUN |
| `pipe` | **SOCKET** | **rc=1 · 17 ok · 2 FAIL** | rc=0 · 17 ok · 2 SKIP ← **cure fixes a real red** |
| inherit (this fire) | CHARDEV | rc=0 · 19 ok · 0 SKIP | rc=0 · 17 ok · 2 SKIP ← **coverage loss** |
| `/dev/null` fd | CHARDEV | rc=0 · 19 ok · 0 SKIP | rc=0 · 17 ok · 2 SKIP ← **coverage loss** |

The two FAIL lines in the socket row are verbatim the two F-2057-2 named:
`real helper custody failed: pid=none PPID=gone TTY=gone` and
`helper accepted a substitute runner after its recorded PID exited`.

This is the s1299/s1300 standard: the red path was **proven by manufacturing the defect**
(a socket on fd 0), not inferred from a green.

## Findings

### F-2058-1 — the skip predicate is broader than the defect it cures (non-blocking; corrective authored)

`[ ! -t 0 ]` means *"not a terminal"*. The actual failure condition is narrower:
**stdin is a socket.** With stdin on a character device — `/dev/null`, and this fire's own
inherited stdin — `/usr/bin/script` works fine and the pre-cure guard passes **19/19**.
The cure skips those two arms there anyway, so most fires lose two assertions that were
previously running and passing.

Not blocking, and the merge is still the right call: it removes a hard `rc=1` from the
battery every fire must run as its last act (F-1300-4), the skips are **loud** rather than
silent, and full coverage is retained under any tty. But the coverage loss is real and
should be owed rather than absorbed. Corrective: replace the fd-shape guess with a direct
capability probe (`/usr/bin/script -q /dev/null /usr/bin/true`), which asks the question
that actually matters and cannot rot as fd plumbing changes.

### F-2058-2 — F-2057-2's quantifier is too strong, and it reconciles a disputed history (informational)

F-2057-2 states the battery *"HAS BEEN STRUCTURALLY rc=1 IN EVERY FIRE SHELL SINCE s1816."*
Measured: it is rc=1 in every fire shell **whose stdin is a socket**. In this fire's shell
`npm run test:ledger-guards` is **rc=0 pre-cure**.

That single qualifier dissolves an apparent contradiction the ledger has been carrying.
s2056 recorded the battery as *"rc=0 chain complete — run TWICE"*; s2057 measured rc=1
seven minutes later and honourably declined to assert s2056 was wrong (*"I did NOT re-derive
what it executed"*). s2055 recorded 19/19 ok and called F-2054-3 *"REFUTED AS STATED"*,
correctly flagging that its own node invocation gave `/dev/null` stdin. **All three were
telling the truth about different stdin shapes.** The fire shell's stdin is not constant —
it varies with how the shell was spawned — so this is a genuine environment variable, not
anyone's error.

**Reusable:** *when two careful fires report opposite exit codes for the same command, the
disagreement is usually a hidden environment parameter, not a stale belief.* Look for the
parameter before believing either report — and before writing a quantifier like "every".
s2055 had already named this exact parameter three fires earlier; the cost of the next two
fires re-deriving it was the whole of F-2057-2's over-broad claim.

## Artifacts

- `artifacts/s2058-restart-guard-stdin-matrix.txt` — the four-shape matrix, both guard versions
- `artifacts/s2058-restart-guard-gate.txt` — tsc / build / battery transcripts on the merged tree
