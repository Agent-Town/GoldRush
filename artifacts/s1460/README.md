# s1460 — the Baron driver divergence is NOT the cross-engine class (F-1460-1)

Fire s1460, 2026-08-05. No drain was available (board drain-dry, all six queues empty at
lock time). This is what the fire did instead.

## F-1460-1 — a REAL sim regression is sitting on main, wearing a benign known-red's label

`scripts/gr-sim.test.mjs:355` — "the Baron driver runs the declared fight and keeps medal
writes off headless" — is RED on main and has been since some commit on 2026-08-04.

    expected   kills: 869   eventLogHash: fnv1a32:b9566c6d   (pinned 653c7fef, 2026-08-03)
    actual     kills: 861   eventLogHash: fnv1a32:36004eab

**s1458 recorded this red as "CONTROL-PROVEN pre-existing … = the F-1403-1/F-1404-2
cross-engine class."** Half of that is right and half is wrong, and the wrong half is the
part that matters:

- ✅ **PRE-EXISTING: CONFIRMED.** Re-measured at `57097d8a` (s1458's own control commit,
  before its merge): RED. s1458 was correct that `3b7abe4e` did not cause it.
- ❌ **CROSS-ENGINE: REFUTED BY MEASUREMENT.** The whole point of that class is that two
  Node engines disagree. They do not. Same tree, same hour:

      Node 26.4.0  (.nvmrc pin, fire shell)      → kills 861, fnv1a32:36004eab
      Node 23.11.1 (the engine the runner uses)  → kills 861, fnv1a32:36004eab

  **Byte-identical.** Both engines agree with each other and disagree with the PIN. This is
  not an engine split; it is a behaviour change nobody re-pinned.

  Corroborating, from `scripts/cross-engine-skip.mjs`'s own header: after the f1405-1 cure
  "every probe allowed to finish returned fnv1a32:30373c0b on both engines. The f1405-1 cure
  holds." The cross-engine class was CLOSED. This red is a different animal.

- The sim is internally deterministic: `assert.deepEqual(second, first)` at
  `gr-sim.test.mjs:392` PASSES on every tree tested. Two runs in one process agree. So this
  is neither flake nor engine — it is a changed fight.

**Why the misfiling is the real cost.** A red attributed to a known, excused, owner-gated
class is a red nobody investigates — it is read as already-explained. This one has been
carried as such across at least two fires while `kills` silently differ by 8 in the E1 Baron
fight, and `test:node-guards` has been red on every fire that ran it.

**It also gates ER-02.** `specs/e2-readiness/README.md:10` makes ER-02 depend on
"ER-01 drivers + ER-00 determinism". The Baron driver is one of those drivers and its
determinism pin does not hold. ER-02 should not be authored against it until this is ruled.

### The cause: `e788002c`, bisected with a validated instrument

    $ git bisect start 57097d8a 91eff09f
    $ git bisect run node ../artifacts/s1460/baron-bisect-probe.mjs
    GOOD 52664cf2 · BAD c65e1773 · GOOD 9292de51 · BAD f64075eb · GOOD 0c76d220 · BAD e788002c
    e788002cf57acf8b6176eac94f82b706a15362c0 is the first bad commit

`e788002c` — `runner(lane-c): f1452-1-fort-solidity-routes-long-static-blockers.md`,
2026-08-04T07:24. It touches `src/systems/BuildSystem.ts` (+139/−31) and one line of
`src/entities/Enemy.ts`:

    -    if (this.watchdogElapsed >= Balance.pathing.stuckWatchdogSeconds) {
    +    if (this.watchdogElapsed >= Balance.pathing.stuckWatchdogSeconds && route.blocker) {

That gates the stuck-watchdog on a blocker actually being on the route — enemy unstick
behaviour changes, so engagement changes, so an 8-kill delta over a 20-wave fight is exactly
the shape you would predict. **The mechanism matches the symptom; this is not a coincidence
of dates.**

**So `kills: 861` is very probably CORRECT.** f1452-1 was a deliberate, spec'd, reviewed
change that shipped with its own specs green (`e2e/fort-static-routing.spec.ts`,
`e2e/fort-landmark-collision.spec.ts`). What went wrong is narrower and more boring: it
reached main via the "recovered orphan" drain `8e5b5608` / `f64075eb`, whose evidence line
reads **"4/4 own specs both projects"** — its battery did not include the gr-sim node guard
that the change happened to move. A cross-cutting sim change was gated only on its own specs.

### The window (all measured, not inferred)

    GREEN  91eff09f  2026-08-04T06:11  s1453 author: f1453-1             (verified 2x direct)
    GREEN  0c76d220  2026-08-04T07:17  goals: today's seven drains …     (bisect)
    RED    e788002c  2026-08-04T07:24  runner(lane-c): f1452-1 …         ← FIRST BAD
    RED    57097d8a  2026-08-05T19:40  s1458: cite the er01 spec …       (verified 2x direct)
    RED    main      2026-08-05T21:xx  (Node 26.4.0 AND 23.11.1)

### What the corrective must do

1. **Confirm, then re-pin** `gr-sim.test.mjs:393` to `kills: 861` /
   `fnv1a32:36004eab`, with a comment citing `e788002c` as the commit that moved it and
   f1452-1 as the reason. Re-pinning blind would be the wrong reflex — the pin is the only
   thing asserting the Baron fight is stable — but re-pinning WITH the cause identified is
   the correct close. The outcome still secures (`secured: true`, `waves: 20`), so the fight
   is not broken, only different.
2. **Widen the drain battery, which is the reusable half.** A change to `Enemy.ts` /
   `BuildSystem.ts` is cross-cutting sim code; gating it on "its own specs" cannot see what
   it moved. `npm run test:node-guards` (which contains `gr-sim.test.mjs`) belongs in the
   battery for any drain touching `src/entities/`, `src/systems/` or `src/sim/`.

## F-1460-2 — my own bisect probe was broken, and an impossible answer is what exposed it

The first `git bisect run` predicate was a shell script testing:

    grep -qE '^. pass 1'

against `node:test` output, which prints `ℹ pass 1`. **`ℹ` is three bytes in UTF-8**, and
under the fire shell's locale grep's `.` matches one BYTE — so the pattern matched nothing,
**every commit reported BAD**, and bisect dutifully "converged" on `91eff09f`.

That answer was impossible on its face, which is the only reason it was caught:
`91eff09f` touches `artifacts/` + `tasks/BACKLOG.md` + `tasks/f1453-1-*.md` + `goals.json`
and NOTHING else; `git diff 91eff09f^ 91eff09f -- src/` is EMPTY; and its sole parent is
`80308b70`, which had already measured GREEN. Two trees with identical `src/` cannot produce
different sim results. Re-tested directly, `91eff09f` passes 2/2.

The manual runs were never affected — they used a JS regex, and JS regexes operate on UTF-16
code units, so `.` matches `ℹ`. The bug lived only in the shell rewrite.

**Lesson, in the house's terms:** a fresh classifier's first hit is probably its own bug, and
the guard against it is to VALIDATE THE INSTRUMENT ON KNOWN OUTCOMES BEFORE TRUSTING IT. The
replacement probe (`baron-bisect-probe.mjs`) was run against one known-GREEN and one known-RED
commit first, and reproduced both, before any bisect was believed. The broken shell probe is
retained beside it as an epitaph (RETENTION LAW), not deleted.

## Files

- `baron-bisect-probe.mjs` — the validated predicate (use this one).
- `baron-bisect-probe.sh` — the BROKEN first attempt, kept as the epitaph. DO NOT RESTORE.
