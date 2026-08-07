# f1523-1-dispatch-guard-residue — the dispatch guard refuses on RESIDUE, not on the coarse `HOLDS` word

**Slice:** `f1523-1-dispatch-guard-residue` (F-1523-6 corrective)
**Branch:** `lane/c` · **tip:** `441e14a14` · **base:** `main` at gate time `bfeaf4398`
**Gated in:** detached worktree `worktrees/gate-s1525` (§3.0b custody), three-way merge commit `36a60028`
**Drained by:** s1525 · **Verdict:** ✅ **MERGE**

## What it does

s1523 merged the F-1522-1 pre-dispatch lane-safety guard, which refuses to dispatch into any lane whose
`lane-usable.mjs` verdict word is exactly `HOLDS`. The guard was correct as specified — its defect was one
of **resolution**: `lane-usable.mjs` computes `held` at **blob identity**, while the `(N of M added lines
absent from main)` residue text every fire reads is display-only and never feeds the verdict. So the
ordinary post-drain state of a lane — every added line already absorbed, but main has since moved the file
further — reads `HOLDS`, and the guard would have refused it.

This slice adds a **second, narrower question inside the `HOLDS` branch**: for the held paths the verdict
itself named, run `scripts/lane-absorbed-lines.mjs <branch> <path>…` and dispatch anyway when *every* held
path is fully absorbed, logging the paths it cleared and why. `lane-usable.mjs` is untouched (standing
prohibition F-1212-4 / F-1419-1) — the fix lives in the consumer that asked the wrong-resolution question.

The runner also added a **deletion probe** (`git diff --numstat main...<branch>`) alongside the absorption
probe, because `lane-absorbed-lines.mjs` proves only that *additions* are absorbed and is structurally
silent about *deletions*. A held path with a deletion the addition-only helper cannot vouch for now
refuses. This is beyond the master's literal wording but strictly *more* conservative and inside the
firewall; accepted.

**The fail-open/fail-closed asymmetry is implemented deliberately and the runner said so explicitly:** the
*outer* probe fails **open** (a broken instrument must not brick dispatch), the *inner* residue probe fails
**closed** (unmerged work must not be reset over by an instrument that could not prove it safe). Both
probes are bounded by a 10-second perl-based process-group timeout.

## Evidence (measured s1525 on the merged tree, not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green**, 2,182 modules, built in 1.05s |
| `bash scripts/lane-dispatch-safety-guard.test.sh` | **rc=0, 8/8 arms pass** (5 pre-existing + 3 new) |
| Manufactured red (new test vs main's pre-fix runner) | **rc=1**, exactly one arm red — see below |
| `npm run test:ledger-guards` | 86/87; sole red = the **predicted, master-firewalled** law-pointer drift, cured in the drain commit |
| Runtime surface | **none touched** — diff is 2 × `scripts/*.sh`; no `src/`, `e2e/`, `playwright.config.ts`, or `package.json` |

Eight arms, all green after:

```
PASS(REFUSES-HOLDS)                         PASS(DISPATCHES-AHEAD-BUT-ABSORBED)
PASS(DISPATCHES-HOLDS-BUT-FULLY-ABSORBED)   PASS(DISPATCHES-USABLE)
PASS(REFUSES-HOLDS-WITH-REAL-RESIDUE)       PASS(DISPATCHES-DIRTY-RC2)
PASS(REFUSES-ON-RESIDUE-PROBE-FAILURE)      PASS(DISPATCHES-PROBE-FAIL-OPEN)
```

### The red was manufactured by the drain, not taken on trust (s1299/s1300 standard)

A passing guard never executes its violation path, so the runner's own paste is not evidence about the red.
This drain reproduced it independently: in the disposable gate worktree, `scripts/lane-runner-v3.sh` was
reverted to **main's pre-fix version** while keeping the merged test file, and the suite went **rc=1** with
exactly one arm failing and with the precise F-1523-6 signature:

```
FAIL(DISPATCHES-HOLDS-BUT-FULLY-ABSORBED): verdict=HOLDS; queue=kept;
  output=[lane-runner-v3] lane-a: REFUSE master.md — HOLDS undrained paths:
    HELD BOTH-MOVED  base.txt  (0 of 1 added lines absent from main)
```

*Zero of one added line absent from main, and refused.* That is the defect, on camera. The other seven arms
stayed green in both states, which is correct — the pre-fix script refuses on **all** `HOLDS`, so the two
new refusal arms cannot discriminate; they exist to prove the narrowing did not **disarm** the guard, and
they earn their keep against future edits, not against this one.

## Merge classification

Base `bfeaf4398`. Three-way `git merge --no-ff lane/c` in the gate worktree: **merged by the `ort`
strategy, zero conflicts**; merged-tree diff vs main is exactly the two firewalled files, +125/−4.

| File | Class | Resolution |
|---|---|---|
| `scripts/lane-runner-v3.sh` | **LANE-TOUCHED** (main never moved it in the window) | taken whole from the gate merge commit `36a60028` |
| `scripts/lane-dispatch-safety-guard.test.sh` | **LANE-TOUCHED** | same |
| `CLAUDE.md` | **MAIN-MOVED, drain-authored** | pointer re-base — see F-1525-1 below; the master firewalled this file and named the re-base as the drain's call |

Landed onto main by checking the two paths out of the gate merge commit — i.e. the merged artifact that was
gated, never a two-dot lane diff.

## Findings

### F-1525-1 — the dispatch-site law pointers rotted by +59, **predicted in advance for the second consecutive fire** (non-blocking; cured in the drain commit)

`CLAUDE.md` §4.10b cites `lane-runner-v3.sh:201` (the RETENTION LAW epitaph) and `:199` (the deliberately
spared `.git/*.stale*` sweep). This slice inserts 59 lines at the dispatch site above both, so
`law-pointer-guard` reddened on the gate — as it should.

**Substance re-verified by READING the merged file, never by the coordinate:** the epitaph is INTACT at
`:259–:272` — prune present only as a comment at `:260`, s1031 casualty named at `:263`
(`20260721-110240-lane-a-lane-town-variants-e8`, 886,731 tokens), **DO NOT RESTORE** stated at `:266`. The
`.git` scratch sweep is live at `:258`. Re-based `:201 → :260` and `:199 → :258`.

⭐ **The reusable half.** This is the *second consecutive* rot of this coordinate that its own rotting commit
predicted: the master firewalled `CLAUDE.md`, instructed the runner to **report** the shift rather than fix
it, and named the re-base as the drain's call. The runner reported `+59 (199→258, 201→260)` — correct on
both — and touched nothing. One red, on the gate, cured in the drain commit. Two clean executions running
makes this the **intended lifecycle** of a growing dispatch site, not a lapse. Expect the site to keep
growing and this coordinate to keep moving; the law text now says so.

### F-1525-2 — the guard remains INERT until the runner restarts (carried forward, unchanged, **owner-gated**)

Runner pid **35584** has been running since **Sat Jul 11 06:10:18 2026**; this makes **nine** landed-but-
never-executed commits to `lane-runner-v3.sh`. Neither this slice nor its predecessor can take effect until
Robin restarts it. The runner correctly did not restart, kill, or signal it.

⚠️ **What changed for the better:** s1523 revised F-1522-5's restart recommendation to a two-step
("let `f1523-1` land first") precisely because the un-narrowed guard would have refused lanes on their first
dispatch. **That gate is now closed on its merits rather than by hand-curing lanes** — with this slice
merged, a `HOLDS`-but-fully-absorbed lane dispatches on its own. The restart is a **one-step action** again,
and this time the underlying defect is fixed rather than worked around.

### The fleet under this change (reported, not tidied — scope 4)

Measured at drain time: `lane-a` **HOLDS** with real residue (`e2e/milk-county-board.spec.ts`, 6 of 6 added
lines absent from main) → the guard would **correctly REFUSE** it; that content is the second drain of this
fire. `lane-b`/`lane-d` **USABLE**, `lane-c` holds this slice. No lane was modified to make this table
tidier.
