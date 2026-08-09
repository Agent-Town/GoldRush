# f1616-1 — walkthrough artifact custody + a real prefetch control

**Slice:** `f1616-1-walkthrough-artifact-and-real-control` · **branch:** `lane/c` · **tip:** `542ec15a4`
**Base:** `825d8363b` (main) · **Merged:** `s1617` · **Review author:** s1617 fire

## Verdict

**MERGE.** Both cures land, and the one that mattered — the control arm — came back **stronger than the master
specified**. Every gate green on the merged tree, run in a detached worktree (§3.0b) on scratch port 5199.

## What it does

f1614-1 shipped the advance-stream walkthrough table but arrived with two defects that s1616 filed at drain time.
This slice cures both in a single file (`e2e/advance-stream-walkthrough.spec.ts`, +16/-6), touching **zero `src/`**:

1. **The control is now a real control (F-1616-1).** The old control booted `?tier=lite`, which
   `AdvanceStream.ts:250-252` uses to gate the *entire* 3D path — prefetch *and* demand-loads alike. It therefore
   returned all-zeros in **both** columns, and an all-zero table cannot distinguish "prefetch stopped warming" from
   "nothing was requested at all". The new control stalls only **prefetch-marked** GLB requests through the
   `page.route` handler the spec already installs, leaving demand loads live.
2. **The tracked-review rewrite is gone (F-1616-2).** The spec wrote `reviews/advance-stream-walkthrough.md`, a
   tracked file, on every run — the exact predicate `f1406-1` died on for 54,875 tokens (F-1407-1). Reports now
   write per-project to `artifacts/advance-stream-walkthrough-<project>.md`, which also retires the two projects'
   race on one shared path at the 6 workers a lane uses.
3. **`COLD > 0` is now asserted in the control arm** — the missing assertion that let an all-zero table pass.

## Evidence (merged tree, detached worktree, `--workers=1` per F-1270-1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | rc=0, built in 2.69 s |
| walkthrough spec — **normal arm** | **2/2** both projects, 40.0 s |
| walkthrough spec — **control arm** | **2/2** both projects, 31.6 s |
| adjacent `e2e/advance-stream.spec.ts` | **10/10** both projects, 32.2 s |
| console/page errors | `expect(errors).toEqual([])` asserted in-spec, green in all 14 instances |
| `test:node-guards` | **correctly OUT of battery** (F-1460-1): diff is `e2e/` + `artifacts/`, **zero `src/`** |

### The control works, and the arithmetic proves it

Reproduced drain-side, independently of the runner. WARM collapses to zero at every door **while COLD survives** —
which is precisely what the vacuous `tier=lite` control could never show:

| Door | Normal (desktop) W/C | Control (desktop) W/C | W+C normal | W+C control |
|---|---:|---:|---:|---:|
| menu | 0/0 | 0/0 | 0 | 0 |
| town | 2/8 | **0/10** | 10 | **10** |
| contract1 | 7/8 | **0/15** | 15 | **15** |
| town-return | 6/4 | **0/10** | 10 | **10** |
| contract2 | 2/8 | **0/10** | 10 | **10** |

⭐ **The demand set is conserved exactly at every door, in both projects.** Prefetch moves assets from the COLD
column to the WARM column and requests nothing extra. That is a stronger statement than the master asked for: it
rules out the failure mode where a "control" quietly changes *what* is requested rather than *when*, and it does so
without any causal story — just arithmetic.

### F-1616-2 cured, verified by manufacture (not by a green)

After **three spec runs / 14 test instances** in the merged worktree, `git status --short`:

```
M artifacts/advance-stream-walkthrough-desktop-chrome.md
?? node_modules
```

No tracked `reviews/*.md`. The defect the runner cured passed every green gate f1614-1 ran, so the proof had to be
manufactured rather than inferred — it was, both runner-side and here.

## Merge classification

`main..lane/c` = 1 commit (`542ec15a4`), **3 paths, all LANE-TOUCHED**, main moved none of them since the base.
⚠️ The two-dot `main..lane/c` diff shows 11 files including apparent **deletions** of `logs/session-scratch/s1616-*`
and hunks of `tasks/BACKLOG.md` — those are **phantom**: `lane/c` was `behind=2`, so they are main moving forward,
not the lane touching them. Classified from the lane commit's own `--stat` and merged three-way (`ort`, clean), never
by two-dot copy. Merged and committed as **one act**, never staged (F-1589-5).

## Findings

- **[F-1617-3] non-blocking — the committed desktop artifact is a snapshot of a genuinely variable leg.**
  `town-return` is bimodal and has now been measured at **2/8** (s1616), **3/7** (runner), and **6/4** (this drain),
  while every other door reproduced *exactly* across all three runs and both projects (menu 0/0 · town 2/8 ·
  contract1 7/8 · contract2 2/8). So `artifacts/advance-stream-walkthrough-desktop-chrome.md` will churn on that one
  row whenever it is regenerated. **This is lawful, not a defect**: both pre-flight templates list `artifacts/**` as
  an explicit factory-churn exception, never a STOP — which is exactly why moving the write there was the right cure
  rather than a relabelling of the same bug. Worth knowing only so a later reader does not mistake the churn for a
  regression. **GATE: none owed to the owner.**
- **F-1616-3 remains OPEN and untouched by this slice** — whether the WARM column's re-requests are a `page.route`
  interception artifact or real in play. `AdvanceStream.ts:191-193` prefetches with `cache: 'force-cache'`, so a
  genuinely cache-warm asset should fire no request and land in *neither* column; `WARM > 0` is only possible when a
  completed prefetch failed to prevent a second request. **If real, the advance stream downloads its assets twice in
  normal play** — larger than either drain. One probe settles it: walk the same doors with no `page.route` and count
  requests per URL. Not this slice's job; still worth a fire's room.
- **Runner conduct: exemplary.** It reported its two superseded attempts (occupied 5188 → 0 tests; aborting
  prefetches → retry-driven console errors, fixed by bounded stalling) rather than burying them, and reported that
  its third prescribed citation grep needed `-F` because a literal `{` is a BSD `grep` syntax error. Pre-flight
  citation counts `1 / 1 / 1`.
