# Task f2282-1-blocker-panel-real-history-arm: the one real-history arm of `blocker-panel-closed-guard` asserts pre-F-2228-1 behaviour — re-anchor it on a pair today's rule still reds on (lane-c, prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2282, from its own measurement of the standing red. Supersedes the cure prescribed in the F-2280-4 ledger row, which s2282 measured and **refuted** (see Why).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST (paths, not vibes):
- `scripts/blocker-panel-closed-guard.test.mjs` — the subject. The failing arm is the FIRST test, at `:40`
  (`reds on the pre-strike ledger that manufactured the owner directive, greens on the struck one`). Its
  fixture helper is `:16`; read the comment at `:14–15` and the one at `:37–39` — both state intent you must
  preserve or consciously supersede.
- `scripts/blocker-panel-closed-guard.mjs` — the guard itself. **NOT the subject; do not edit it.** Read
  `main()`: the panel-selection extraction (`extractSelection`), the wide-vocabulary census, and in particular
  the `subjectLedClosure(...)` line inside the violation loop, whose comment names **F-2228-1** and explains
  why a row that merely CITES an id must not lend that id its state.
- `scripts/desk-state-audit.mjs` — exports `subjectLedClosure`. Read it. **NOT the subject; do not edit it.**
- `tasks/BACKLOG.md` — finding **F-2282-1** (this task's WHY, with the measurement table) and the older
  **F-2280-4** row whose prescribed cure is refuted. Do not delete F-2280-4; supersede it in prose.
- `scripts/fire.md` — the F-2215-1 clause (*a control whose failure mode is silence cannot be told from the
  silence it measures*) and the F-1274-2 behaviour-neutrality standard. Both bind this task's evidence.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template (ahead content already on main =
SAFE DUPE → `git checkout -B lane/c main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign
edits). FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list,
proceed. Then `npm install --no-audit --no-fund`; build green.

**CITATION CHECK (hard STOP, run before any edit):** `grep -Fc "F-2282-1" tasks/BACKLOG.md` must return **≥1**.
If it returns 0 the lane is stale and this master's evidence is not present — STOP and report the number; do NOT
proceed and do NOT attempt a refresh yourself.

## Why (measured s2282, 2026-08-24, on clean main — every claim below is a command's output, not an inference)

`node --test scripts/blocker-panel-closed-guard.test.mjs` reds on main today, one arm of six:

```
✖ reds on the pre-strike ledger that manufactured the owner directive... (:40)
  panel rows : 7 · rows with an F-ID : 7 · census closed : 176 · closed-on-panel : 0
  0 !== 1
```

The ledger's F-2280-4 row diagnoses this as the fixture's **coupling** having rotted — historical `BACKLOG.md`
at `2e02098f` paired with a **live** `dashboard-gen.sh` whose row-selection rule has drifted, so that
`F-1030-2` "is no longer among" the drawn rows — and prescribes: *pin the panel script alongside the BACKLOG at
the same commit.* **s2282 measured that diagnosis and both of its halves are false.**

| # | Question | Measured result |
|---|---|---|
| 1 | Does the LIVE panel rule still draw `F-1030-2` from the `2e02098f` ledger? | **YES** — it is among the 7 selected rows. The row (`BACKLOG:1459`) matches neither the live nor the historical exclusion vocabulary. |
| 2 | Does the prescribed cure (pin BOTH at `2e02098f`) restore the red? | **NO** — 15 rows selected, **still 0 offenders, status 0.** |
| 3 | Then what disarmed it? | `subjectLedClosure(backlog,'F-1030-2')` → **`[]`**, while `subjectLedClosure(backlog,'F-1040-1')` → **`[1461]`**. |
| 4 | When? | `subjectLedClosure` occurs **0×** in the guard before `020f62c0b` and **2×** after. That commit is *"fix: one F-ID pattern, correct at both ends … (F-2228-1)"*, 2026-08-23 — one day before the red was first logged. |

**MECHANISM.** `F-1030-2`'s closure lives at `BACKLOG:1461`, on a row whose subject zone reads
*"F-1040-1 / F-1030-2 UPDATE"*. F-2228-1 taught this guard **subject-first attribution**: a row states the state
only of the **first** id in its subject zone. So that row closes **F-1040-1**, and `F-1030-2` is `continue`d
before it can ever become a violation. **The guard is behaving correctly and the fixture is asserting behaviour
the guard deliberately no longer has.** This is not rot to be reversed — F-2228-1's own comment records that the
looser rule once declared a genuinely-open finding closed and would have struck it off the owner's panel.

**CONSEQUENCE, STATED HONESTLY AND SMALLER THAN THE LEDGER CLAIMS.** F-2280-4 calls this *"a guard whose red path
is now PROVEN unexercised."* That is **false**: the synthetic arm at `:55` asserts `status 1` with offender
`F-9001-1` and **passes**, as does the REFUSE arm at `:87`. The guard's red path and its refusal path are both
exercised. What rotted is only this arm's claim to exercise them **against real history** — which is exactly the
property its own comment calls load-bearing (*"A guard that cannot red here is decoration"*).

**FEASIBILITY IS ESTABLISHED, so this task cannot dead-end.** s2282 replayed today's full rule (live selection +
wide census + subject-first) across `tasks/BACKLOG.md` history, sampling every 25th commit: **64 historical
commits still red.** Worked example — `d5407705` (2026-08-06): 17 rows, offenders
`F-1310-1, F-1269-1, F-1270-1, F-1457-1`. You are **not** required to use that commit; you are required to
justify whichever you pick.

## Scope (each item testable)

1. **Re-anchor the real-history arm onto a pair TODAY's rule reds on.** Keep the arm's shape: a real historical
   `tasks/BACKLOG.md` from git, the **live** `dashboard-gen.sh` (the `:14–15` comment's reason still holds — a
   stub would test nothing), an assertion that the guard exits **1** naming a specific offender, and the paired
   assertion that the **live root greens**. Pick the commit yourself and **verify it before you rely on it**;
   do not paste `d5407705` on my word alone (Mistake #4 — my sample was 1-in-25 and is not a census).
2. **Write down WHY that pair reds, in a comment, in terms of the mechanism** — the offender's own row is on the
   panel AND its closure is **subject-led by that same id**. The comment at `:37–39` currently narrates the
   2026-07-30 owner directive; whatever you replace it with must make the *next* reader able to tell a rotted
   fixture from a real regression without re-deriving what this task derived.
3. **Pin the behaviour that disarmed the old pair, so it can never silently revert.** Add an arm asserting that
   on the `2e02098f` ledger the guard does **NOT** flag `F-1030-2`, *because* its closure row is subject-led by
   `F-1040-1`. This converts a rotted assertion into a live regression pin for F-2228-1 and keeps the real
   incident in the suite rather than deleting it (Retention Law: supersede, never erase).
4. **Do NOT edit `blocker-panel-closed-guard.mjs`, `desk-state-audit.mjs`, or `findings-state-guard.mjs`.**
   The subject is the **test file**. If you become convinced the defect is in the guard, **STOP and report** with
   your evidence — do not fix it. Reversing F-2228-1 is explicitly forbidden: it would re-arm a rule that was
   measured to strike genuinely-open findings off the owner's panel.
5. **Do NOT "fix" this by loosening the arm** — no `assert.ok(status === 0 || status === 1)`, no try/catch around
   the assertion, no skip, no deletion of the arm. An arm that cannot fail is the thing this task exists to end.

## Self-check (run these, paste real numbers — a claim without its output is not evidence)

- `node --test scripts/blocker-panel-closed-guard.test.mjs` → **all arms green**, and report the count
  (it is 6 today; say what it is after your change).
- **Prove the new arm can actually red (F-2215-1: a green is not evidence about a red).** Manufacture the defect:
  temporarily neuter the guard's `subjectLedClosure(...)` filter on a **scratch copy** (never in the tree),
  confirm your new arm's outcome CHANGES, then restore. Paste both outcomes. If your arm does not move, it is
  decoration and item 1 is not done.
- `npm run test:ledger-guards` → green; report the leg count and wall time.
- `node scripts/blocker-panel-closed-guard.mjs` at the repo root → unchanged from before your change
  (**F-1274-2 behaviour-neutrality**: same stdout, same rc). Assert your control ARM RAN — paste its byte/line
  count — because a control whose failure mode is silence cannot be told from the silence it measures.
- `npx tsc --noEmit` → rc=0. `npm run build` → green.
- **NOT required:** playwright, `test:node-guards` in full, screenshots. This slice touches **no** `src/`,
  `e2e/`, `functions/` or asset path and renders nothing. Say so in your report rather than running them.

## Firewall

TOUCH-ONLY:
- `scripts/blocker-panel-closed-guard.test.mjs`

NO (report, never edit):
- `scripts/blocker-panel-closed-guard.mjs` · `scripts/desk-state-audit.mjs` · `scripts/findings-state-guard.mjs`
- `scripts/dashboard-gen.sh` — the live panel is the fixture's *input*; changing it changes what the owner reads.
- `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` — ledger surfaces; the drain owns them.
- `package.json` — this guard is already rooted in `test:ledger-guards`; no new leg is needed.
- Any `src/**`, `e2e/**`, `functions/**`, `assets/**`.

READY-FOR-GATES. Report: which historical commit you anchored on and **why that one**; the offender id your arm
now asserts; the before/after of your manufactured-defect proof; the `test:ledger-guards` leg count and wall time;
the behaviour-neutrality control with its byte count; and anything you found that contradicts this master's Why —
a runner that reports a defect instead of fixing it is a firewall success, not a failure.
