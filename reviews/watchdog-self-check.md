# watchdog-self-check — the health watchdog checks its own launch agents

- **Slice:** `watchdog-self-check` (main slot)
- **Branch/tip:** main slot, uncommitted runner output; landed as `b4d8e199c`
- **Drained by:** s2459, 2026-09-02
- **Verdict:** ✅ **MERGED — green, in firewall, and already proven live on this machine**

## What it does

The watchdog watched the game and the runner and not itself. On 2026-09-02 the
attended session found the `com.goldrush.dashboard` and `com.goldrush.health`
launch agents had vanished from `~/Library/LaunchAgents` and nothing had noticed
for six days; the boards went stale on 2026-08-27 and the owner's eye was the
alarm.

`scripts/health-watch.sh` now resolves `launchctl list` on every pass and on
`status`, and asserts all three labels are present. A missing label turns the
pass from `ok` to `FAIL`, appends ` AGENT MISSING: <label>` to the pass line,
and writes the exact command the owner types into `logs/.health-state`
(`launchctl bootstrap gui/<uid> ~/Library/LaunchAgents/<label>.plist`). The
alert fires **once per state change**, not once per pass, so a missing agent
does not turn into a mail every ten minutes; recovery alerts too. `status` grows
an `agents :` block listing each label LOADED/MISSING. If `launchctl` itself is
unavailable to the watchdog's launch context the script exits 1 with the error
rather than shipping a check that always passes — the master's own honesty guard.

## Evidence

| Leg | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, clean (no output) |
| `npm run build` | rc=0 |
| `node --test scripts/health-watch-agents.test.mjs` | **2 pass / 0 fail**, 3.19 s |
| `battery-manifest` + `gate-caller-audit` + `run-guards` (the guards that read the `test:node-guards` line this slice edits) | **62 pass / 0 fail**, 15.7 s |
| `package.json` JSON parse | OK |
| `bash -n scripts/health-watch.sh` | clean |
| **Live pass lines**, `logs/health.log` 23:13 / 23:23 / 23:33 | `ok runner=1 … agents=com.goldrush.dashboard:LOADED,com.goldrush.health:LOADED,com.goldrush.fire:LOADED …` |
| `health-watch.sh status` (via node, F-2350-1) | prints the three labels, all LOADED |
| Console / page errors | **N/A** — no rendered surface changes (`git status --short -- src/ e2e/ functions/ assets/` is empty) |

**`test:node-guards` is not path-mandated here and I say why rather than
implying it** (F-1460-1): the diff touches no `src/sim`, `src/systems` or
`src/entities` — it touches no `src/` at all. The three guards that *are*
genuinely implicated (they parse the `test:node-guards` string in
`package.json`) were run directly and are green.

### Teeth — proven by manufacturing the defect, not by a green

A passing guard never executes its violation path, so its green says nothing
about its red. On a scratch copy of `scripts/health-watch.sh` I replaced
`PASS=FAIL` with `PASS=ok` — i.e. a missing agent no longer fails the pass, the
exact defect this slice exists to prevent. `node --test
scripts/health-watch-agents.test.mjs` → **rc=1**. The file was restored and
verified **byte-identical** (`Buffer.equals`) before anything else was done.
The guard has teeth.

## Merge classification

Main-slot output: uncommitted working-tree dirt plus a done-move, which is the
normal shape for this slot (the runner auto-commits **lanes only**). No merge,
no conflict resolution — the content was already in main's tree.

| File | Class |
|---|---|
| `scripts/health-watch.sh` | MAIN-SLOT runner output, +48/-2 |
| `scripts/health-watch-agents.test.mjs` | new file, runner output |
| `package.json` | wire only — `scripts/health-watch-agents.test.mjs` prepended to `test:node-guards` |

Everything is inside the master's TOUCH-ONLY list (`health-watch.sh`, the new
test, `package.json`, BACKLOG row). Nothing under `src/`, no plist, no
`fire-runner.sh`, no `lane-runner-v3.sh` — the DO-NOT-RESTORE epitaphs are
untouched, verified by the empty `git status` on those paths.

## Findings

**F-2459-1 — the runner did not write its BACKLOG row; the drain wrote it.**
The master's TOUCH-ONLY list names a BACKLOG row and no such row was in the
working tree. The only uncommitted `tasks/BACKLOG.md` edit at lock time was an
**attended** row (it quotes the owner verbatim and answers the CAPABILITY-LADDER
ratification questions), so it belonged to a different author entirely and was
committed separately as §2A bookkeeping. Non-blocking: the row is written in
this drain's bookkeeping commit, which is where a drain's ledger duty lands
anyway. Recorded because "the master named a row" and "a row exists" are
different facts, and only the second one is evidence.

**Non-finding, recorded so it is not re-derived:** the live watchdog was
*already* running this code when the gate ran — `logs/health.log` carries the
new `agents=` shape at 23:13, 23:23 and 23:33, before the commit. That is not a
leak: `health-watch.sh` is read from disk at each launchd invocation, and the
runner had written the file into main's working tree. It is the strongest
evidence in this review — three real passes on the real machine — but it is
evidence about the *file*, not about the *commit*, and the commit is
byte-identical to the file that produced them.
