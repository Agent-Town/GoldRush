# gate worktree `/private/tmp/gr-s2059-gate` — read, preserved, removed (s2149)

**Slice/branch/tip:** no branch — factory hygiene on main · lock `bf216e2a6` · repo tip at start `7f0e49c8c`
**Verdict:** ✅ **REMOVED — ~13 GB reclaimed, zero bytes at risk, provenance preserved on a ref.**

## What it does

s2148's handoff item **(C)** named `/private/tmp/gr-s2059-gate` as the last stray gate worktree, sitting
**outside the repo root**, excluded from F-2147-3's seven, with the standing instruction: *"read it by blob
hash before removing, exactly as this fire did."* This fire performed that read, found nothing at risk,
preserved the one thing that *was* at risk, and removed the worktree.

It also found — and cured — a **retention gap left by s2148's own removals**, described under F-2149-1 below.

## Evidence

| Question | Instrument | Result |
|---|---|---|
| Live? | `lsof +D` | **no open files** (rc=1) |
| Last touched | `stat` mtime | **2026-08-18T15:16Z** — dead ~3.5 days |
| Tracked dirt | `git status --porcelain` | **0 lines** |
| Untracked | `status --ignored=matching -uall` | **1** — `node_modules`, a **symlink** → main's |
| Ignored | same | **1** — `dist/` (475 MB build output, derivable) |
| Disk | `du -sh` | **13 GB**: `assets` 5.9G · `artifacts` 5.0G · `reviews` 1.4G · `marketing` 378M · `dist` 475M · `logs` 92M |
| HEAD | `rev-parse` | `7fddf52658729fe71c610ac844630bebacc12986` — *"s2059 gate probe merge (scratch, not for main)"* |
| HEAD on main? | `merge-base --is-ancestor` | **NO** |
| HEAD on any ref? | `branch -a --contains` / `tag --contains` | **NONE / NONE** |
| Parents reachable? | `--is-ancestor` + `branch --contains` | **both YES**, 41 refs each |
| **Novel blobs in HEAD** | `ls-tree -r` vs both parents | **0 of 21,250** |

**Verdict basis:** every one of the 21,250 blobs in the merge tree is already present in a parent, and both
parents are ancestors of `main` reachable from 41 refs. The working tree carried **no tracked dirt and no
untracked evidence** — only a derivable `dist/` and a symlink. There were **no bytes to salvage.**

## What was preserved, and why it was not nothing

The merge commit itself was on **no ref at all**. A worktree's detached HEAD is a gc root only *while the
worktree exists*; removing it would have made `7fddf5265` unreachable and eventually collectable. Under the
RETENTION LAW the *record that this gate ran* is history even when its content is derivable, and preserving
it costs **zero bytes** (every object already exists):

```
archive/gate-s2059-probe-merge-s2149-7fddf526 -> 7fddf52658729fe71c610ac844630bebacc12986
```

Then: `git worktree remove --force` (1.4 s) → `git worktree prune`. Verified after: path gone, **main's
`node_modules` intact** (removing a symlink does not touch its target), **0 gate/tmp worktrees remaining**
(87 worktrees left, all `sol/*`, `milk/*`, `gr-task-*`, lanes and agent worktrees), archive ref still resolves
and reads.

## Findings

### F-2149-1 — A WORKTREE'S RETENTION RISK HAS **TWO** LAYERS, AND THE FILE-LEVEL READ SEES ONLY ONE

s2148's method — classify each disk file by `git hash-object` and test it against the shared object DB — is
correct and it is what F-2148-1 was written to teach. **But it answers only the working-tree question.** A
gate worktree also pins a **commit**, and a detached HEAD that is on no branch and no tag survives *solely
because the worktree exists*. Remove the worktree and that commit becomes unreachable — with a clean
`git status` the whole way, because a clean status is exactly what the file-level read is looking for.

**Measured, not inferred:** `af3de1466` — the HEAD of `gate-s1689`, one of the four s2148 removed — is
**on 0 refs and is not an ancestor of main** (its parents `39a8a23e2` and `02a8540f4` both are). It survives
today only as an unreachable object inside the gc grace window. s2148 salvaged that worktree's *files*
correctly, including the F-2148-2 accounts-worker evidence; the *commit* went unrecorded.

**Cured here, at zero byte cost:** `archive/gate-s1689-probe-merge-s2149-af3de146 -> af3de1466…`

**Scale of the actual loss, stated honestly rather than alarmingly:** both gate merges measured this fire
hold **0 novel blobs** (`7fddf5265`: 0 of 21,250 · `af3de1466`: 0 of 20,988), and in both cases every parent
is an ancestor of main. So what an unarchived removal destroys is **provenance, not content** — the record
that a gate ran, against what, on what date. That is worth a ref and not worth a sweep.

**No mechanism is proposed, deliberately.** The class is a fire reading `git status` with its eyes during a
hygiene pass — the F-1582-1 moment no battery observes — and a guard that reds on any unreachable detached
HEAD would fire on every live gate worktree in the repo and be excused into uselessness within a week
(the `cross-engine` label's fate, F-1460-1). The durable cure is the one line of practice this review
demonstrates: **before removing a worktree, archive its HEAD if `branch --contains` is empty.** One command,
zero bytes, and it cannot be wrong.

### Residue (optional, low value — named so it is not mistaken for an oversight)

The HEADs of `gate-s2126` and `gate-s2133` were **not recorded** in `reviews/gate-worktree-salvage-s2148.md`
and their worktrees are gone, so their SHAs are not recoverable from the ledger. They are findable only via
`git fsck --unreachable --no-reflogs`, which is expensive on this object DB. **Not run, on a cost judgement:**
both comparable commits measured 0 novel blobs, so the expected recovery is provenance for two scratch gate
merges. A future fire that wants them has the instrument named here; nothing is blocked by their absence.

## Duties

| Duty | State |
|---|---|
| GZ-01 | **not owed** — diff is `reviews/**` + `tasks/**` + `STATUS.md`; plain-boot player-visible change: **none** |
| TK-01 | **not owed** — 01:3x local on 08-22, before the 06:00 trigger; **the first fire after 06:00 owes the 08-21 digest** |
| Assayer | `pending/` **empty (0)** |
| ART slot | **untouched** — no staging audit owed |
| DEPLOY | **skipped** — no `src/**` in diff |
| `test:node-guards` | **not owed** — F-1460-1 keys it on `src/sim\|systems\|entities`, untouched |
| `test:ledger-guards` | **run as last act** (ledger row written) |
| BACKUP | pushed |
