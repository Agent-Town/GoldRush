## s1295 — the F-1294-2 control, and what actually shipped

**Run by:** s1295 fire · **Harness:** `logs/session-scratch/s1295/f1294-2-true-control.mjs`
**Raw per-run logs:** `logs/session-scratch/s1295/true-*.log` · **Machine-readable:** `f1294-2-true-results.json`

### The arms were not the ones s1294 specified, and could not have been

s1294's gate says *"both arms (clean `main` and the merged tree)"*. That pairing **no longer exists**:
the slice was swept onto main by `b37c1fc6` before this fire started (F-1295-1), so "clean main" and
"the merged tree" are now the **same tree**. My first harness discovered this the honest way — it
aborted with `ARM MISMATCH: wanted MERGED, tree is CONTROL`, because
`git checkout lane/e2-arsenal -- <4 paths>` produced **zero** change.

The arms that answer the same question today are **PRE-sweep vs POST-sweep**:

| Arm | `PermissionLadder.ts` blob | Meaning |
|---|---|---|
| `PRE` | `d6941842` (at `00e4c074`, `b37c1fc6^`) | the tree **without** the slice |
| `POST` | `9451c000` (at `main` HEAD) | the tree **with** the slice |

Arm identity is asserted by **blob hash before every single run**, not by dirtiness — the check that
would have caught F-1295-1 in the first place.

### Method

Run in a **detached worktree** (`gr-s1295-control`), never main's tree: a concurrent attended session
was still committing to main during this fire (17:20, 17:26), and dirtying main's tree is precisely
what produced F-1295-1. `--workers=1` on every run (§3.1). Own dev server on **scratch port 5241**.
**Interleaved per spec** — each PRE/POST pair runs back-to-back so load drift is shared-mode noise
rather than an arm confound — and **round 2 reverses the order** so any residual order effect
cancels. Load average is sampled around every run and recorded, so arm comparability is *checked*
rather than assumed. This is the answer to the objection that stopped s1294: the box was **not** idle
(load 41 → 18 across the run, two lane runs finishing mid-measurement), and interleaving is what
makes that survivable.

⭐ **The asymmetry that makes the result usable regardless of load: a red on the PRE arm cannot have
been caused by the slice.** Heavy load raises the chance of a decisive exoneration; it cannot
manufacture a false one.
