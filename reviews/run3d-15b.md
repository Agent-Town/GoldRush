# run3d-15b — the Gold Seam in 3D + restore the plain-boot 3D default

**Slice:** `run3d-15-gold-nodes` (attempt 1 content, kept) + `run3d-15b-gold-nodes-flagoff-fix` (corrective)
**Branch:** `lane/m3` · **Tip gated:** `96e60415` · **Base:** `4e1fc5ed`
**Merge:** `9ee3b710c09f5bb6575d2fe754af47e111c0ac80` (--no-ff, s1389)

## VERDICT: MERGED

Both commits in `main..lane/m3` merged. The corrective closes F-1387-3 — verified against the two
suites that actually witness the regression, not against the slice's own spec.

## What it does

Rider 15 adds a `gold_seam` GLB to the RUN-3D pilot registry and mirrors live harvest nodes
read-only off `__THREE_GAME_DIAGNOSTICS__.harvest.activeNodes`, unmounting depleted seams.
`gold_seam` is deliberately excluded from the `all` selection, so it renders only when asked for
by name — the exclusion the master specified.

The corrective (`96e60415`) undoes the one thing attempt 1 got wrong. Rider 15 had added:

```ts
if (!params.has('run3dPilot')) { publish(host.canvas, 'off'); return { ... }; }
```

That early return fired on **every plain boot** — the overwhelming majority of real player boots —
short-circuiting the landed `?? 'all'` default and turning 3D buildings off for everyone.
Classic Mistake #10 (Debug-Gate Leftover). The corrective deletes it, drops the now-unreachable
`'off'` from `publish()`'s state union, and re-points the flag-off assertion to `'ready'`.
7 lines of src, 1 line of spec.

## Evidence (merged tree, detached worktree `/tmp/gr-gate-s1389`, `--workers=1`, serial)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, clean |
| `npm run build` | rc=0, built in 1.06s |
| `e2e/run3d-gold-seam.spec.ts` (own spec) | **8/8** desktop + mobile |
| `e2e/m2-05-base-damage-repair.spec.ts` | **14/14** desktop + mobile |
| `e2e/night3d-perf.spec.ts:98` (readiness oracle `:118`) | **PASS** both projects |
| `e2e/_s106-prospector-boot-probe.spec.ts` + `f1297-2-plain-boot-tape-button` | **4/4**, zero console/page errors, desktop + 390px |
| `e2e/night3d-perf.spec.ts:67` (p95 gate) | **RED both projects — pre-existing on main, see F-1389-1** |

**Why the m2-05 / night3d-perf pair is the load-bearing evidence and the own spec is not:**
s1387 measured that rider 15's own spec *passed because of the defect* — it asserted
`run3dPilotState === 'off'` on flag-off boot, which is exactly what the bug produced. A green own
spec was therefore worthless as proof here. The two suites whose `waitForFunction` calls timed out
under the defect (`m2-05:353`, `night3d-perf:118`) are the real oracles, and both are green.

## Findings

### F-1389-1 — `night3d-perf.spec.ts:67` p95 ratio is RED ON MAIN, not merge-caused. Classifies F-1387-4.

s1387 measured this ratio at 1.400/1.418 against a 1.15 bar mid-battery and could not classify it.
s1388 deferred the control run on the reasoning that a control run under the load you are
controlling for is not a control, and asked for an idle machine. The machine was idle this fire.

| Arm | Tree | Load | mobile ratio |
|---|---|---|---|
| s1387 | merged | heavy battery, lane-a busy | 1.400 / 1.418 |
| s1389 gate | merged (`9ee3b710`) | m2-05 + night3d-perf, 18 tests | **1.5046** |
| s1389 **control** | **clean main `4e1fc5ed`** | **night3d-perf alone, idle machine** | **1.4815** |

Both projects fail in every arm. **The fire-shell CPU-ceiling hypothesis (F-1269-1/F-1270-1) is
REFUTED for this red:** removing the load made it marginally *worse*, not better. The merge does
not cause it either — clean main without a single byte of this slice is red at 1.4815, within noise
of the merged tree's 1.5046.

So this is a genuine standing regression on main against the 1.15 bar, **not** in
`logs/suite-red-inventory.md` (which records a *different* night3d-perf red, `:135` mobile-only,
that passed in all of my runs). It is ~29% over bar, which is too large to be sampling noise and
too old to belong to this slice. Not a blocker for this drain under the §3 "fingerprint-matched to
known-reds with proof" clause — the proof is the control run above. **Owed: a bisect to find which
main commit crossed the bar.** Left open.

### F-1389-2 — `drain-block-check.mjs` matched a stale branch-keyed block; the commit-level check is what saved it.

`node scripts/drain-block-check.mjs lane/m3` exits **1 / BLOCKED**, citing goal leaf
`rf-34-hero-y-restore-roundtrip` (`owner-fork`, "lane/m3 f1fce725 gated"). That block is real but
**does not apply to this drain**: `f1fce725` is already an ancestor of main, so it is not in
`main..lane/m3` at all. The two commits actually in range block-check **CLEAR**
(`run3d-15-gold-nodes`, `run3d-15b-gold-nodes-flagoff-fix`).

The leaf is keyed to a *branch name*, and lane branches are long-lived and reused — `lane/m3` has
carried many slices since rf-34. So this block will keep firing on every future lane/m3 drain
forever, and its citation will always look authoritative.

This is the "CLEAR task on BLOCKED commit" law working exactly as written: block-check **every
commit in `main..branch`**, not the branch. The hazard is the inverse of the rf-34 incident — there
a fire merged something genuinely owner-gated; here a fire could freeze a clear drain on a block
whose content shipped long ago, or, worse, learn to wave blocks away. Neither failure is safe.
**Recommend an attended session re-key the rf-34 leaf to its commit** (`f1fce725`) rather than to
`lane/m3`. Not fire-authorable: rf-34 is an owner design fork and I will not touch its leaf.

## Merge classification

Base `4e1fc5ed`; `git merge --no-ff lane/m3`, **no conflicts**. 17 paths:
16 **pure adds** (LANE-TOUCHED only — the GLB, .blend, build/verify scripts, 6 screenshots,
2 p95 JSONs, model-contract.json, report.md, the new spec) and 1 modified,
`src/game/Run3dPilot.ts`, also LANE-TOUCHED only — main never moved it during the lane's life.
Nothing MAIN-MOVED, so no graft was needed. `main..lane/m3` is now **0**.

## Notes

- **Duplicate dispatch (F-1388-2) resolved benign.** Two done-moves, one master. Run 1
  (`20260802-111836`, 3.6 MB log) succeeded at `96e60415`. Run 2 (`20260802-113842`, 37 KB,
  15,410 tokens) hit its mandatory pre-flight, found the tip already at `96e60415` instead of the
  expected `d0a861a9`, and **stopped without touching anything** — the correct refusal, and a
  zero diff there is not Mistake #1. Both done-moves prefixed `shipped-s1389-`.
- Custody per §3.0b: all gating happened in a detached worktree. Main's working tree never held
  undecided slice content at any point.
