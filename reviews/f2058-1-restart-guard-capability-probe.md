# Review — f2058-1-restart-guard-capability-probe

**Slice:** `f2058-1-restart-guard-capability-probe` (lane-d, fire-authored s2058 from F-2058-1)
**Branch:** `lane/lane-d` @ `ecfca7886` (base `35a83577e`)
**Merged to main:** `f58af9fff8d6ea89611c0582f330d8817f17dc9a`
**Drained by:** s2059, 2026-08-18

## VERDICT: MERGED — the gate condition was met exactly, and I measured it myself rather than reading the runner's table.

## What it does

`scripts/runner-restart-recipe.test.sh` guards the sanctioned runner-restart recipe — the
cure for the ~5h03m F-1652-1 outage. Two of its arms drive the real helper through
`/usr/bin/script`, and s2058's predecessor (`f2057-2`, `d4a8594ea`) wrapped them in
`[ ! -t 0 ]` to stop them failing in a headless fire.

That predicate asks *"is fd 0 a terminal?"*. The condition that actually breaks
`/usr/bin/script` is narrower: *stdin is a socket*. On a **character device** — which is
what a fire's own stdin is — `script` runs fine and both arms pass. So the predecessor's
cure was suppressing two live, passing assertions in the common case.

This slice replaces the guess with the measurement: run `/usr/bin/script -q /dev/null
/usr/bin/true`, keep its rc and its stderr, and skip only if it actually fails. Nine
inserted lines, three removed, in one test-only file.

## Merge classification

**Base:** `35a83577e` (this fire's own lock commit).
**Pure LANE-TOUCHED, one file** — `git show --stat ecfca7886` lists
`scripts/runner-restart-recipe.test.sh` and nothing else. `git merge --no-ff` resolved by
the `ort` strategy with no conflict and no three-way work.

`git diff main lane/lane-d` also listed `STATUS.md`, and that is **MAIN-MOVED-ONLY, not a
conflict**: the lane's copy is s2057's line-1, main has since moved twice (s2058's handoff
and my lock). The lane commit never touched it. Verified by reading the commit's own stat
rather than the branch diff — the branch diff cannot tell the two apart.

⚠️ **Note for the next drainer, because it nearly cost me the wrong measurement:**
`git log main..lane/d` reports a 100+ file diff and reads like a huge undrained pile.
`lane/d` is a **stale ref**; `git worktree list` shows `worktrees/lane-d` checked out on
`lane/lane-d`. Both refs exist, so the wrong one resolves silently and answers about a
different branch. Resolve slot→branch from `git worktree list`, never from a remembered name.

## Evidence

Gated on the **merged tree** in a detached scratch worktree (`/tmp/gr-s2059-gate`,
main + `lane/lane-d` merged there), so no undecided content ever entered main's working
tree or index — §3.0b / F-1589-5.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 4.7s |
| `npm run build` | **rc=0**, 17.0s |
| `npm run test:ledger-guards` | **rc=0**, 62.8s |
| `test:node-guards` | **not triggered** — no `src/sim`/`src/systems`/`src/entities` path in the diff (F-1460-1) |
| Playwright | **not run** — one test-only bash script, imported by no product code |

**The three directions, re-measured drain-side across both trees, only fd 0 varying**
(`artifacts/s2059-restart-guard-matrix.txt` carries the harness and the raw counts):

| stdin shape | main (pre-probe) | merged (cured) |
|---|---|---|
| tty (`pty.spawn`) | rc=0 · 19 ok · 0 SKIP | rc=0 · 19 ok · 0 SKIP |
| **chardev** (`/dev/null` fd) | rc=0 · 17 ok · **2 SKIP** | rc=0 · **19 ok · 0 SKIP** |
| socket (`stdio:['pipe',…]`) | rc=0 · 17 ok · 2 SKIP | rc=0 · 17 ok · **2 SKIP** |

F-2058-1's gate reads: *"closes when the chardev row of that table reads 19 ok / 0 SKIP
while the socket row still reads 2 SKIP."* **Both halves hold.** My own shell measured
`isCharDev true / isatty false` before any of this ran — the row that was losing coverage
was this fire's own.

**The restored arms proved themselves inside the mandated battery, which is the strongest
form this evidence could take.** `test:ledger-guards` was spawned with `stdio: 'ignore'` on
fd 0 — a character device — so its run of the guard printed:

```
ok   — real helper launched its recorded PID at PPID 1 with no controlling terminal
ok   — helper rejects a substitute runner instead of verifying the wrong PID
```

Before this merge, those two lines read `SKIP` in that same battery. The coverage F-1300-4
requires every fire to run is genuinely back, not merely back under a synthetic harness.

**Both forbidden greens closed, in both directions:**
- *Skipping too much* (the defect): the chardev row runs the arms and passes them.
- *Skipping too little* (regressing F-2057-2): the socket row still skips, rc=0, and its
  SKIP text now carries the probe's own stderr — `script: tcgetattr/ioctl: Operation not
  supported on socket` — so a reader can tell an environment limit from a broken helper
  without re-deriving anything. Scope item 2 satisfied verbatim.

**Firewall honoured:** `scripts/start-lane-runner.sh` is byte-identical; nothing else in the
diff at all. No runner process was touched — pid 451 was alive throughout and still is.

## Findings

**None blocking.** No new F-ID.

**F-2058-1 — CLOSED by this merge.** Its gate is a measurable condition and the measurement
is above. The `blockClass`/leaf bookkeeping lands in the following commit (a commit cannot
contain its own hash — the standing two-commit sequence).

ⓘ **Non-blocking observation, recorded rather than actioned.** The runner's own report
claimed exactly this table before I measured it. It was right, and I still re-derived it —
the drain's re-run is a free control, and a report that agrees with your expectation is the
one most worth checking. Cost: about ninety seconds.

💡 **The reusable half, which is really about instrument design rather than about ttys.**
Two fires in a row shipped a predicate that was *correlated* with the thing it needed to
know instead of *being* it. `[ -t 0 ]` correlates with "`script` can run" and diverges on
exactly the shape most fires have. The general rule the corpus keeps re-learning: when a
guard can cheaply **run the real capability and look at the result**, guessing it from an
adjacent property is a defect waiting for the day the correlation breaks — and it will
break quietly, because a wrong skip never reddens.
