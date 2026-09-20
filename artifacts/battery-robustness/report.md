# battery-robustness-f-poc-8 — report

Branch `fix/battery-robustness` in a scratch worktree cut from main `21648cdcf`. Node v26.4.0
(`/opt/homebrew/bin` first). This worktree's `node_modules` is its own `npm ci`, never the
primary's symlink; the primary checkout was verified untouched at the end (`vite 8.0.13`, 46
entries, no files of mine in its `git status`).

THE BOX WAS NEVER QUIET. Between 2 and 9 foreign `run-node-guards` batteries, a Codex lane, a
playwright chromium and other agents shared it throughout; measured load averages ran 20 to 141.
Every number below carries the conditions it was taken under, and the one red I could not clear is
named rather than excused.

## Commits

| commit | scope item | what |
|---|---|---|
| `49c978305` | 1 + 4 | the TAP-progress watchdog; `scripts/node-guards-watchdog.test.mjs` joins stage 1 |
| `acf4e317a` | 1 | pid-reuse hardening; N re-pinned against a first-hand 1085.3 s |
| `b6c4273fc` | 3 | `server.watch: null` across 62 files / 76 call sites |
| `683708d5f` | 2 | vite 8.0.13 -> 8.3.0, rolldown binding 1.0.1 -> 1.2.9 |

## 1. The crash counts (scope 2)

20 direct runs per file per arm (`node scripts/<file>`, 120 s cap each, crash = exit by signal or
status >= 128). Raw rows: `crash-runs-before-vite8.0.13.json`, `crash-runs-after-vite8.3.0.json`.

| arm | vite | @rolldown/binding-darwin-arm64 | `open-sea-water` | `rider-parity-retirement` | load1 during |
|---|---|---|---|---|---|
| before | 8.0.13 | 1.0.1 | **0 / 20** | **19 / 20** (SIGBUS + SIGSEGV) | 39.5 - 44.5 |
| after | 8.3.0 | 1.2.9 | **0 / 20** | **0 / 20** | 133.6 - 140.5 |

THE UPGRADE WAS TAKEN. The after arm ran under 3x the load of the before arm, so the zero is not a
quiet-box artifact — it is the opposite. Gates on it: `tsc` clean, `npm run build` green,
`GR_RELEASE=e1 npm run build` green (`build-vite8.3.0.log`), and the full battery below.

Attribution, because the shape of the cure matters for the ledger:

- `rider-parity-retirement.test.mjs` ALREADY set `server.watch: null` and already awaited every
  `ssrLoadModule` before closing. The teardown-order cure the task offered as the alternative could
  not have reached it; a bisect (`crash-bisect.mjs`) showed a single open -> `ssrLoadModule` ->
  `close` cycle dying on its own, while open -> close with no module load survived 3/3.
- The death is not only the rolldown SIGBUS the ledger recorded. One bisect run died with
  `FATAL ERROR: v8::Object::SetAlignedPointerInInternalField()` inside
  `node::fs::FSReqCallback::~FSReqCallback()` from `uv__work_done`. This Homebrew node links the
  SHARED `/opt/homebrew/opt/libuv/lib/libuv.1.dylib` (`otool -L`), so the family is "an in-flight
  fs request outlives the isolate at teardown", which the binding bump resolves.
- The per-file rate is not stable across days: F-NCB-10's row has `open-sea-water` dying 2 of 3
  direct runs, and today it survived 20 of 20 on the same vite. Do not read a single file's rate as
  the population's.
- The F-NCB-10 retry arm STAYS. It is cheap, it covers any future native death, and it is the only
  thing that tells a fire a red was never a verdict.

## 2. The watchdog and its N (scope 1)

`scripts/run-node-guards.mjs` now runs the `node --test` child asynchronously and watches the TAP
transcript it already writes. No growth for the budget => nothing in the whole battery finished =>
find the `--test` child's OWN children by pid tree (`ps -Ao pid=,ppid=`, NEVER a pattern), keep only
those alive since the silence began, `sample <pid> 3` each into the transcript directory, SIGKILL
it, and let the F-NCB-10 arm re-run it alone once. The retry is watched too. Exit codes propagate
exactly; on a stall the transcript dir is PRESERVED (partial TAP + samples) and named on stderr.

**N = 45 min, not the 10 the master proposed, and the measurement is the whole argument.**

The proposed N came with the premise "~30x the slowest healthy file". That premise is false here:

| measurement | value | source |
|---|---|---|
| slowest healthy unit, post-open-maps battery | 880.1 s | `artifacts/post-open-maps-correctives/attended-battery-node26.log` |
| slowest healthy unit, needs-cells battery | 973.5 s | `artifacts/needs-cells-art-batch/attended-battery-node26.log` |
| same guard on this tree, 152 subjects | 921.6 - 1262.2 s | batteries 1-3 below |
| **longest TAP silence in a real battery, measured by the instrument itself** | **1085.3 s (18.1 min)** | `battery-1-before-watchnull.log` |

The slow unit is `fixture-teardown.test.mjs`: ONE synchronous test that `spawnSync`s `node --test`
over every fixture-owning guard in turn. It blocks its own event loop, which is why the 300 s
`--test-timeout` never fires on it — the same mechanism that hides the F-POC-8 hang. Under the
gating fire arrangement (file concurrency 1) it is TAP-silent for its whole 15-21 minutes. 115 of
the battery's guards share that shape (a synchronous test body that `spawnSync`s).

So a 10-minute bound would SIGKILL a healthy guard on every fire battery (F-1460-1: a red board
nobody trusts is worse than no bound). 45 min is 2.5x the largest silence ever measured here, and
still 6.4x tighter than the 4 h 46 min hang it replaces. Two further reasons it is safe at that
size: every run now prints `TAP-QUIET MAX`, so the margin stays measured rather than remembered;
and a false kill is largely self-healing, because the killed file is re-run ALONE where contention
is gone, and a pass there turns the battery green with the kill still named on stderr.

`GR_NODE_GUARDS_STALL_MS` can only LOWER the bound (clamped, asserted by execution) — F-1410-2
forbids relaxing a hang bound, and an env knob that could raise one silently is that defect with
extra steps.

### The manufactured hang (transcript)

A fixture that spins `while (true) {}` behind a passing sibling, fire arrangement, bound lowered to
4 s. Killed, sampled, retried, killed again, reported red, rc=1, whole cycle 17 s:

```
⚠️ TAP-STALL WATCHDOG (F-POC-8): no TAP record for 4s (bound 4s) — SIGKILLed
   /tmp/wd-hang-K0nL/zzz-spin.test.mjs (pid 13958); sample:
   /var/folders/.../node-guards-tap-SlVc67/hang-sample-13958.txt. A blocked event loop cannot be
   timed out from inside itself; read the sample, do not raise the bound.
ℹ TAP-QUIET MAX: 4.0s of 4s bound (F-POC-8 watchdog)
⚠️ SIGNAL-DEATH RETRY (F-NCB-10): /tmp/wd-hang-K0nL/zzz-spin.test.mjs died by SIGKILL — ...
⚠️ TAP-STALL WATCHDOG (F-POC-8) [retry]: no TAP record for 4s (bound 4s) — SIGKILLed ... (pid 18406)
❌ SIGNAL-DEATH RETRY: failed again (rc=1) — a real red, or a crash that survives isolation.
ℹ HANG EVIDENCE KEPT: /var/folders/.../node-guards-tap-SlVc67 (partial TAP + sample).
```

The sample is real: 114,887 bytes with `Call graph:` and 2,448 main-thread samples; the TAP record
the retry arm reads carries `signal: 'SIGKILL'`.

### A hardening the live run found

PID REUSE is fast on this box — pid 11025 was two unrelated processes four minutes apart while four
batteries shared the machine. A stale entry in the "alive since the stall began" map could make a
freshly spawned sibling look old enough to blame, so dead children are now forgotten each tick and
a returning pid is timed from now (errs toward sparing an innocent file). `acf4e317a`.

### Sampling also tells the two classes apart

Live, mid-battery, my own `rider-parity-context-press.test.mjs` child sat 15 minutes with no TAP
progress. Sampled: **0.0 % CPU, blocked in `kevent` inside `uv__io_poll`** — waiting on its own
nested child, healthy. The F-POC-8 hang was 100 % CPU in a spin. That is exactly the discrimination
F-POC-8 could not make ("the stack was not sampled before the kill"), and it is now automatic.

## 3. `server.watch: null` (scope 3)

62 files, 76 call sites, every changed line a `server:` line and nothing else (`git show b6c4273fc`).
Accounting that reconciles the finding's "64 of the 71": 71 files call a `createServer`, 7 already
set `watch: null` (9 call sites), and 2 of the remaining 64 use **node:http's** createServer
(`assay-worker`, `external-server-is-dev`), leaving 62 vite files / 76 sites. After the sweep, 0
vite call sites lack the line and 85 have it.

Only one guard uses any watcher-adjacent API — `standing-orders-module-split.test.mjs`, which calls
`moduleGraph.invalidateModule` explicitly and never needed chokidar. It is green, as is
`board-tape-gold.test.mjs`, the only guard that opens a REAL listening server for a browser.

## 4. Battery wall clocks

`npm run test:node-guards` end to end (stage 1 plus its chained stages), same worktree, same day.
The box was never quiet: the count is foreign batteries seen at start.

| run | tree | wall | foreign batteries at start | `TAP-QUIET MAX` | `fixture-teardown` | tests | fail | cancelled |
|---|---|---|---|---|---|---|---|---|
| 1 `battery-1-before-watchnull.log` | watchdog, vite 8.3.0, **no** watch: null | **1306 s** | 3 | 1085.3 s | 1262.2 s | 926 | 2 | 2 |
| 2 `battery-2-after-watchnull.log` | + watch: null | **1044 s** | 3 | 880.3 s | 1007.4 s | 926 | 2 | 0 |
| 3 `battery-3-final-tree.log` | final tree (upgrade committed) | **953 s** | 9 | 800.3 s | 921.6 s | 926 | 2 | 0 |

-20.1 % from run 1 to run 2 and -27.0 % from run 1 to run 3, while the foreign battery count at
start went UP (3 -> 9). Runs 2 and 3 are the same effective tree, so their 9 % gap is the run-to-run
variance this box carries; the before/after gap is 2-3x that. `fixture-teardown` — which runs every
fixture-owning guard as a child and so amplifies any per-server cost — moved with it, 1262 -> 922 s.
Honest caveat: on a box this contended these are not clean-room numbers, and I could not get a
quiet one.

## 5. Reds, every one attributed

- **`node-guards-contention` — ENVIRONMENTAL, not cleared.** It asserts the node-guards board stays
  quiet for 300 ms; 2 to 9 foreign batteries were live on it continuously (measured at every
  attempt, including six spaced retries that all read 9). Re-run alone: still red, board still
  busy. Nothing in this branch touches it, and it was red the same way before my first edit.
- **`fixture-teardown` — the same red, cascaded.** Its own failure text names
  `scripts/node-guards-contention.test.mjs child failed`; it runs that guard as a child.
- **2 cancellations in run 1 only** (`gr-sim.test.mjs`: "runtime rush and --overtime..." at
  90,001 ms of a 90 s budget, "the CLI science input..." at 30,001 ms of a 30 s budget) —
  per-test budgets timing out under four concurrent batteries. Re-run alone: **rc=0, both green at
  50.9 s and 3.4 s** (`attrib-gr-sim-alone.log`). Gone in runs 2 and 3.
- No signal deaths and no TAP stalls in any of the three batteries.

## 6. Owed / not done

- The two consecutive green batteries are green APART FROM the environmental guard above, twice
  identically. A clean pair needs a quiet board, which this box never offered.
- `tasks/BACKLOG.md` is firewalled here, so F-POC-8's and F-NCB-10's rows still read as owed. The
  ledger edit is the drain's.
