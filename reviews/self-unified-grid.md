# Review — self-unified-grid (lane-d)

- **Slice:** `tasks/self-unified-grid.md` (HarnessDev ladder item D, analysis)
- **Branch / tip:** `lane/d` @ `bba48f983d7fdf0be8fd60938b8aa50f5a6c6ab6` (runner auto-commit)
- **Merged:** `1c06afaf404168c208f6627494ab2bc0df3783f0` (s2472, `--no-ff`)
- **Gated in:** detached worktree `gate-s2472` off `6bbadb818` (§3.0b)

## Verdict

**MERGE.** Analysis-only, READY-FOR-GATES, and the firewall holds exactly.

## What it does

`docs/analysis/2026-09-03-self-unified-grid.md` publishes the county's HarnessDev-style Self-Eval / Unified-Eval grid over two contracts (The Claim, the Baron) across seven admitted harness families × the model column. Its governing claim is the honest one: **a score belongs to the harness+model pair, not to either component alone**, and results from different engine eras are *"history beside history, not a controlled delta"*.

Two pieces of discipline in it are worth naming because they are the sort of thing an analysis usually fudges: `EMPTY` is explicitly defined as *"no admissible result was found; it never means zero"*, and every cell carries its era key (`F?` for records lacking the required era header, through `E5` the Replayed Board). The row families are taken from the gauntlet's own `HARNESSES.md` rather than invented — QM stays withdrawn, Eliza's install/runtime DNFs are **not** promoted into a harness row because it never sat a scored ride, and the unattended Claude Code charter is shown inside the existing attended family rather than silently minting an eighth.

## Evidence

| Gate | Result |
|---|---|
| merge into main | conflict in `tasks/BACKLOG.md` only (both sides prepend at the head), resolved as a **union**; verified by set algebra — ours 3 rows, theirs 1, `missing []`, `0` markers left |
| delta vs main | `docs/analysis/2026-09-03-self-unified-grid.md` +110, `tasks/BACKLOG.md` +1 — **2 files, +111, 0 deletions** |
| firewall | proven mechanically, not read: files in the **engine identity corpus** = `[]`; files in the **run surface** = `[]` |
| runner's own self-check | 63/63 grid cells cited; 34 populated and 92 empty contract slots; live Era-5 API cross-check 7 Claim + 3 Baron verified rows with 3 probes excluded; `git diff --check` clean |

**The landed tree is the same object as the gated tree: `04ffaca190f3de3a0079cfc3551a45cf7a2871a9`** — so the resolution I committed on main is provably the resolution I gated, not a fresh one.

## What was NOT run, and why that is proportionate

No tsc, build, playwright or node battery. That is a deliberate scope judgement, stated so it is not mistaken for an omission: the diff contains **zero** files under any run-surface root and **zero** under any `ENGINE_SOURCE_INPUTS` entry — measured, above, not eyeballed — so there is no code path for those gates to exercise. The one tracked artifact that any guard reads here is the `tasks/BACKLOG.md` row, and that is covered by `test:ledger-guards`, which runs as this fire's last act (F-1300-4).

## Findings

None blocking.

**F-2472-5 — NON-BLOCKING, an observation the grid itself surfaces and the next ladder fire should read beside F-2457-4.** The grid's `EMPTY` count (92 of 126 contract slots) is dominated by rows the county has never ridden rather than by rides that failed, and its era keys show several results sitting in `F?` — the undated founding era — because those records lack the required era header. Both facts sharpen the desk's open F-2457-4 question (*is the middle saga unbuilt, or is the headless rider half-blind?*): a grid this sparse is weak evidence about **models** and strong evidence about **coverage**. No corrective is authored, because acting on it is the scope call already sitting on the owner's desk.
