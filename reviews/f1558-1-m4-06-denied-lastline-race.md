# f1558-1 — M4-06 denied-receipt: assert the refusal line at the moment it is said

- **Slice:** `f1558-1-m4-06-denied-lastline-race`
- **Branch:** `lane/b` · **tip** `17c7fdde4` · **base** `6608f8605`
- **Merge:** `88e00904ac7d8d33ac7dc3fea010a45cf07e196d` (`--no-ff`, `ort`, no conflicts)
- **Drained by:** s1559 fire, 2026-08-08

## Verdict

**MERGED.** The cure is proven by the runner's own pre-fix data rather than by absence of failure,
the master's stated acceptance gate is satisfied exactly, and its firewall held.

## What it does

The M4-06 permission-denied test asserted the Prospector's last spoken line **350 ms after** the
denial. F-1558-1 established that a denial leaves the agent *idle* (the refusal path returns early
without setting `moving`), which makes it eligible for `Embodiment.updateSimulation`'s idle-survey
branch — and `src/agent/Voice.ts` defines `survey: ['survey','ledger']`. So the denial is the very
thing that makes the agent eligible for the bark that erases its own line. This slice captures the
companion **immediately** after `panAt` returns and asserts the refusal set there, then deletes the
post-wait assertion, leaving a comment naming the mechanism so nobody restores it. The assertion is
strictly *stronger* than before: it now pins the line at the instant the rule fires, instead of
350 ms later when an unrelated timer may have overwritten it.

Notably it does **not** widen the accepted set to include `survey`/`ledger` — the master forbade
that, correctly: a widened set could no longer tell a denial from an agent that never spoke.

## Evidence

Gated on the **merged tree** in detached worktree `gate-s1559` (§3.0b), `--workers=1` (§3.1),
lanes idle, self-booted dev server on 5188 (verified free before the run).
Transcript: `artifacts/f1558-1-m4-06-denied-line/s1559-gate.txt`.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, no output |
| `npm run build` | green, `✓ built in 1.10s` |
| `m4-06-embodiment.spec.ts` desktop-chrome | **9/9 passed** (40.8 s) |
| `m4-06-embodiment.spec.ts` mobile-chrome | **9/9 passed** (40.9 s) |
| adjacent `m4-07-prospector-panel` + `m4-08-agent-attribution` desktop-chrome | **6 passed** (16.9 s) |

`test:node-guards` **NOT run, and I say so rather than implying coverage**: the diff touches `e2e/`
and `artifacts/` only — no `src/sim`, `src/systems` or `src/entities` — so F-1460-1 does not bind.
No boot probe, no 390 px capture, no full e2e suite: **nothing in this diff renders.**

### The runner's pre-fix measurement is the real proof (`samples.txt`, 70 lines)

60 pre-fix samples (30 × mobile-chrome, 30 × desktop-chrome), counted from the artifact:

| Sample point | Refusal line | `ledger` | Rate |
|---|---|---|---|
| `immediate` (new assertion) | **60 / 60** | 0 | **100%** |
| `afterWait` (deleted assertion) | 58 / 60 | **2** | 96.7% |

That is the F-1558-1 mechanism reproduced under control: the quantity the old assertion read is
flaky at ~3%, the quantity the new one reads is not flaky at all in 60 samples. Post-fix the runner
reports desktop 30/30 and mobile 30/30.

**The master's STOP condition did not fire:** it required `immediate` to lie inside
`['held','ask me','no trust']` on every sample, and a value outside that set would have been a
PRODUCT finding, not a test fix. All 60 read `no trust`.

### Sibling sites cleared

The runner checked the two other sample sites the master named: `:241` is immune (successful XP
collection keeps movement/work active) and `:384` is immune (it samples during verified pan
movement). Neither reaches the idle-survey branch. This discharges item (C) of s1558's handoff —
no further corrective is owed there.

## Merge classification

Base `6608f8605`. Main advanced 5 commits during the drain window (s1559 bookkeeping: STATUS,
`logs/`, `.claude/skills/drain/SKILL.md`, `tasks/BACKLOG.md`) — **none touching either path**,
verified with `git log 6608f8605..main -- <both paths>` returning empty.

| File | Class | Resolution |
|---|---|---|
| `e2e/m4-06-embodiment.spec.ts` | **LANE-TOUCHED only** | clean apply, +4/−1 |
| `artifacts/f1558-1-m4-06-denied-line/samples.txt` | **NEW** | free |

## Findings

**F-1559-2 (non-blocking, recorded so a later fire does not mis-compare).** This slice inserts
`const immediate = await companion(page);` — a real page round-trip — *between* `panAt` and
`waitForTimeout(350)`, which lengthens the wall-clock window over which `driftAbs` is sampled.
Since F-1559-1 establishes that `driftAbs` is **quantised by how many fixed sim steps land inside
that window**, a longer window could in principle shift the quanta.

⚠️ **I hypothesised a shift and the evidence does not support it, so I am recording the measurement
rather than the hypothesis.** Both post-merge gate runs logged
`driftAbs=0.3529334214834294` — bit-identical to the pre-merge quantum. That is one sample per
project, so it is weak evidence of *no* shift rather than proof; but it is direct evidence against
the shift I expected. **Anyone re-deriving the quanta for F-1285-2 must sample the POST-merge
arrangement**, and should not assume the pre-merge values in
`artifacts/f1557-3-m4-06-denied/distribution.txt` still describe the tree they are testing.

**No blocking findings.** The firewall held: `src/**` untouched, which is correct — the survey bark
is intended behaviour, not a defect.
