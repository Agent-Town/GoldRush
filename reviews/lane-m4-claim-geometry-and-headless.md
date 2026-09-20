# lane/m4 — `claim-geometry-declared` + `headless-the-claim` — s1381 gate

**Branch:** `lane/m4` · **tip** `cce99524` · **merge-base with main** `74f95634`
**Done-moves:** `tasks/done/20260802-064330-lane-claim-geometry-declared.md` · `tasks/done/20260802-072041-lane-headless-the-claim.md`
**Gated in:** detached scratch worktree `/tmp/gate-s1381` (§3.0b custody)

## VERDICT: HOLD BOTH — RE-LAND REQUIRED, NOT A HAND-MERGE

Neither slice is defective. Both are **unlandable as they stand**, for two independent reasons.

## §3.0 block check — and the hole it does not cover

Both slices gate **CLEAR**:

```
✅ CLEAR — lane-claim-geometry-declared.md [e1-claim-geometry-declared] status="queued"
✅ CLEAR — lane-headless-the-claim.md      [e1-headless-the-claim]      status="queued"
```

But `git log main..lane/m4` is **three** commits, and the bottom one is not clear:

| commit | task | §3.0 |
|---|---|---|
| `cce99524` | headless-the-claim | ✅ CLEAR |
| `c876f675` | claim-geometry-declared | ✅ CLEAR |
| **`7c4f132f`** | **f1328-1-drill-yard-census-debt** | ⛔ **BLOCKED (exit 1)** |

**F-1381-3.** §3.0 asks whether *this task* is blocked. Nothing in the drain protocol asks whether a
clear task's branch is **founded on** a blocked one. A `git merge lane/m4`, or any `diff main..lane/m4`
used as a change-set, carries `7c4f132f` into main silently — an owner-reserved design fork, merged
under a commit message about something else. This is the F-1295-1 shape one level up: the block has no
enforcement surface in git.

Separability is **not** uniform, which is the operational half:

- `cce99524` touches 5 files, **none** of which `7c4f132f` touched → liftable in principle.
- `c876f675` touches `e2e/agent-view.spec.ts` and `e2e/fixtures/e1-mechanics-manifests.json`, **both of
  which `7c4f132f` also modified** → its versions of those two files sit on top of blocked content, so a
  path-scoped copy imports the block. It needs a per-commit 3-way lift.

## The second reason, found by trying it rather than reasoning about it

I lifted `cce99524`'s 5 paths onto clean main and ran `tsc`:

```
src/sim/HeadlessContractSim.ts(125,82): error TS2339:
  Property 'lossCondition' does not exist on type 'ContractStakeMarker'.
```

**F-1381-4 — `lane/m4` predates a repo-wide rename that main absorbed on 2026-08-01.** Commit
`8efae704` (*"lane-herostart-rename: stakeMarkers.lossCondition -> heroStart, repo-wide"*, drained s1329)
renamed the field. `git merge-base --is-ancestor 8efae704 $(git merge-base main lane/m4)` → **false**:
the lane's base **predates** it, and main is **270 commits ahead** of that base. Both slices were
authored against the old vocabulary; `lossCondition` appears in seven files at `cce99524`, including
`ContractFamilies.ts:410` where main now reads `heroStart: boolean`.

Neither runner did anything wrong — they were dispatched onto a branch nobody had rebased.

## Why RE-LAND and not a graft

`CLAUDE.md` Mistake #15: *stale + conflicted = RE-LAND on fresh main with the old branch as salvage-ref;
agent hours are cheap, subtle merge corruption is not.* Here the staleness is 270 commits, spans a
repo-wide identifier rename, and the branch is founded on owner-blocked content. Hand-grafting two
slices across that gap is precisely the blind hand-merge the law names.

**Recommended:** re-author both masters against current main (`heroStart`, current
`ContractFamilies` shape), with `lane/m4` kept as a salvage-ref. Do **not** reset `lane/m4` — it holds
the blocked `7c4f132f` and both undrained slices (LANE-SAFETY LAW).

## Evidence table

| # | Check | Result |
|---|---|---|
| 1 | `drain-block-check` × 3 | 2 CLEAR, 1 **BLOCKED** (`7c4f132f`) |
| 2 | `git log main..lane/m4` | 3 commits, blocked one at the **base** |
| 3 | per-commit `--stat` overlap | `cce99524` disjoint from blocked · `c876f675` shares **2 files** with it |
| 4 | lift `cce99524` 5 paths → clean main, `tsc` | ❌ **TS2339 `lossCondition`** |
| 5 | `git merge-base --is-ancestor 8efae704 <base>` | **false** — base predates the rename |
| 6 | `git rev-list --count <base>..main` | **270** |

## Custody note (§3.0b)

All of the above ran in the detached scratch worktree. Main's working tree never received content from
either slice. Nothing was merged.
