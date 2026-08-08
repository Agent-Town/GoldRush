# Review — f1561-2: the drift bound couples to constants on BOTH axes

- **Slice:** `f1561-2-m4-06-drift-constants-both-axes`
- **Branch / tip:** `lane/b` @ `682f5c42051b0d8610ede001b6c9da9e9817765c`
- **Base:** `64f127969` (the s1561 authoring commit)
- **Merged to main:** `92559f683963d964c757904fc1d3e1e3493625e6` (s1562, 2026-08-08)
- **Pre-drain archive:** `archive/lane-b-s1562-predrain-682f5c42` (taken BEFORE gating — see §Custody)

## Verdict

**MERGED.** Comment-only, single file, LANE-ONLY, green on both projects. The cure the s1561
drain called "half a cure" is now whole: the provenance comment names the constants on **both**
axes and states why a 2-D distance couples to both.

## What it does

`e2e/m4-06-embodiment.spec.ts` asserts `driftAbs < 0.4` for the denied-receipt case. `driftAbs` is
`Math.hypot(dx, dz)` — a **2-D** quantity — but the provenance comment landed by f1560-1 named only
the x-axis terms, and its citation `Embodiment.ts:288–299` ended exactly one line above the z anchor
at `:300`. So a reader following the citation stopped one line before the evidence against it.

This slice rewrites the comment to name the z follow offset (`-1.25`) and z oscillation
(`±0.18`, `0.52 Hz`) alongside the x terms, states `driftAbs is Math.hypot(dx, dz)`, and widens the
citation to `288–300`. Both `expect(...).toBeLessThan(0.4)` lines are untouched.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check.mjs --strict` | ✅ **CLEAR** — run as the FIRST command, before any opinion was formed (§3.0) |
| Merge classification | 1 file, **LANE-ONLY**: `git log 64f127969..main -- e2e/m4-06-embodiment.spec.ts` **empty** (main never touched it) |
| Comment-only proof | **mechanical**, not eyeballed: 5 changed lines, **0 non-comment** (filter `^[+-]\s*//`) |
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green, built in 1.17s |
| m4-06 desktop-chrome | **9 passed** (40.5s), `--workers=1` |
| m4-06 mobile-chrome (390px) | **9 passed** (41.9s), `--workers=1` |
| Observed `driftAbs` | desktop `0.3722002149381437` (the exact bit-identical mode s1561 measured 13/40 in arm A) · mobile `0.2833831328784402` |
| `test:node-guards` | **deliberately NOT run.** The diff is `e2e/` only — no `src/sim/`, `src/systems/`, `src/entities/` — so **F-1460-1 does not bind.** Stated rather than implied. |

**Custody (§3.0b):** gated on the merged tree in detached worktree `gate-s1562` inside the repo
root, `node_modules` symlinked. Nothing undecided ever entered main's working tree. Worktree removed
after the drain.

**Not run, declared so nobody inherits a false green:** no boot probe, no full e2e suite, no
screenshots. Nothing in this diff renders — every changed line is a `//` comment.

## Findings

### F-1562-1 — the widened citation now spans a NINTH constant, and the comment still does not name it (non-blocking)

✓ **VERIFIED by reading `src/agent/Embodiment.ts:285–301`, not inferred.** The new range `288–300`
is correct and inclusive of `:288`, which is:

```ts
this.drifting = distance > 0.06;   // :288
```

`0.06` is a **drift deadband**: the agent stops correcting toward the idle anchor once it is within
0.06, so the residual it tolerates is part of what bounds `driftAbs`. The comment enumerates eight
numeric constants — `4.8`, `0.58`, `-1.8`, `0.22`, `0.78`, `-1.25`, `0.18`, `0.52` — and the runner
explicitly reported "All are named." **The cited range contains nine.**

🔑 **The instructive half: this is the SAME shape F-1561-2 cured, at the other end of the range.**
F-1561-2 was "the citation stops one line short of a constant it omits"; this is "the citation now
reaches a constant it omits." Widening a range to capture missing evidence can capture *more*
missing evidence than you were looking for. **It is pre-existing, not introduced here** — `0.06` sat
inside the old `288–299` range too, unnamed in both revisions.

⚠️ **NOT a defect in this slice and NOT a reason to have held it:** the merge takes named constants
from four to eight and is a strict improvement. Filed as the next comment-only corrective.

### F-1562-2 — "seven constants" was an inconsistent count, and the runner corrected it (closed on arrival)

The s1561 master asserted **seven** constants and invited the runner to report an eighth if one
existed. The runner enumerated **eight** and named them. ✓ Verified: s1561's count grouped x's
oscillation as a single term (`±0.22 / 0.78 Hz`) while splitting z's into two (`±0.18`, `0.52 Hz`);
counted consistently the total is eight. **The master's invitation to correct the count is the only
reason this was caught** — a tidy seven confirmed would have been worth less, exactly as it argued.
No action owed; recorded because the count appears in law-adjacent prose.

### F-1562-3 — f-board-1 false done-move: a pre-flight STOP behind this very slice (no loss, re-queue owed)

At 16:34 an attended session dispatched `lane-fboard1-named-minds` into lane-b **while this slice
sat undrained**. The pre-flight did its job: it refused, reporting `lane/b has undrained commit
682f5c420 … its content is absent from origin/main`, and performed **no reset, no edits, no install,
no build**. Cost **40,237 tokens** for zero work; the run then **done-moved**, so
`tasks/done/20260808-163420-lane-fboard1-named-minds.md` is a **STOP wearing a completion's
filename** (Mistake #1 shape — a done-move is a claim, not a fact).

⚠️ **The lane-safety law worked and the dispatch ordering did not.** This is the LANE-SAFETY LAW's
"drain the lane first, refill second" observed from the other side: nothing was destroyed *because*
the guard held. Re-queued this fire now that the blocker is merged.
