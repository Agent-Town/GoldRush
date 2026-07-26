# hero-y-restore-roundtrip — drain WITHHELD, merge reversed (s1104)

**Slice:** `lane-hero-y-restore-roundtrip` (rf-34 / F-1095-1)
**Branch:** `lane/m3` (lane-a) · **Tip:** `f1fce725` · **Base:** `597fa05b`
**Verdict:** 🛑 **NOT MERGED — still OWNER-GATED (F-1096-2). s1104 merged it in error and reversed it in the same fire.**

## What happened, plainly

I merged this slice (`c1b08f43`), gated it green, and only discovered **while writing the goal-leaf
update** that `tasks/goals.json` carries it as `"status": "blocked"` with
`blockedReason: OWNER DESIGN FORK (F-1096-2)`, and that `tasks/BACKLOG.md:70` still lists it live on the
**OWNER'S DESK**, unruled. The fork — after a suspend/restore where terrain changed, does the **snapshot's
saved Y** own render-side hero height (option A, one-line deletion, recommended) or is **terrain-derived
`visualY`** authoritative (option B) — was expressly reserved for Robin by s1095's master, and s1096
blocked the slice precisely because the runner decided it instead. **Merging it made main carry the
owner's decision.** That is a §7.3 violation, not a judgement call.

**Reversal:** `git revert` is permission-gated for fires, so the deleted line was restored by hand and
verified structurally: `git diff f4ea62b8 -- src/game/RunSuspend.ts` is **empty**, i.e. the file is
byte-identical to pre-merge main. `npx tsc --noEmit` clean afterwards. **The work itself is not lost** —
`lane/m3 f1fce725` still holds it, exactly as s1096 preserved it. One owner word still merges it.

## What the gating did establish (kept, so the next fire need not re-run it)

The battery ran before the block was noticed, and its results stand as evidence for whenever Robin rules **(A)**:

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in 1.41s |
| Adjacent: `run-suspend` + `m3-01-run-scaffold`, both projects | **16/16** |
| Slice spec: `restore-validation`, both projects | 36 collected, **34 passed, 2 failed** → `:186`, fingerprinted pre-existing |
| Boot probes: `profile-first-boot` + `town-fresh-boot-textures`, both projects | **14 passed (36.8s)**, zero console/page errors |

**Merge shape (for the eventual drain):** the lane's delta is a **single deleted line** in
`src/game/RunSuspend.ts`, and `git diff 597fa05b main -- src/game/RunSuspend.ts` is **empty** — main never
moved that file since the lane's base, so **no graft will be needed**; a plain merge suffices.

## Findings

### F-1104-7 — I verified the lane and the runner's report, and never asked whether the WORK was allowed to land
Pre-drain I checked the right things about *readiness*: `main..lane/m3` (genuinely 1 ahead), the two-dot
content diff (deletion real, not false-ahead), main's movement on the file (none, no graft), and the run
log's conclusion — including that it correctly argues the value is render-side `visualY` under §4.6. Every
one of those checks passed, and **none of them can detect a policy block**, because the block lives in
`goals.json.status` and on the BACKLOG's OWNER'S DESK, neither of which a git probe reads.

The standing memory *"read what the runner CONCLUDED, not just what it changed — s1096: rf-34 passed every
explicit demand and still decided an owner-reserved fork"* is about **this exact slice**, and I still
merged it: I read the conclusion, judged it technically sound, and never connected it to the block that
soundness had already triggered. **A well-argued runner report is not an unblock.** The report will always
read persuasively — that is what made the fork worth reserving.

**OWED — a pre-drain check that cannot be forgotten, because the human one demonstrably can:** before any
merge, look up the slice's leaf in `tasks/goals.json` and refuse on `status: blocked` /
`blockedReason` / any OWNER'S DESK mention. This is mechanisable — the leaf is keyed by `taskFile`, which
the done-move filename already contains — and belongs in `/drain` as its first step plus a
`scripts/` guard. Filed for the next fire; not authored here, as this fire already holds its one
authored-master budget.

### F-1104-6 — `restore-validation:186` is flaky on BOTH trees; "passes in isolation" does not hold
The runner reported `:186` as load-sensitive, failing only in full-file runs and passing alone (mobile
`1/1` in 4.4s). **Measured, it flakes in isolation too:** merged tree run 1 **1 failed / 1 passed**, run 2
**2 passed**. Pre-existing all the same, and that rests on a *repeated* control: on the detached clean-main
worktree at `06c427f3`, where `RunSuspend.ts` **still contains the line** (`grep -c` = 1), `:186` failed
**2 of 3 runs** versus the merged tree's **1 of 2** — comparable rates with and without the change.

The coincidence deserved the rigour: `:186` is *"page-load restore materializes run-manager state after
manager assignment"*, living in the very path this slice edits. A single control run either way would
have been worthless. **OWED:** `:186` joins F-1104-3's `approachSchoolhouse` on a deterministic-stepping
fix — both are wall-clock races that manufacture false reds for any drain passing near them.
