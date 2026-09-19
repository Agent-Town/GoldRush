# The 37 held checkouts — restore, re-check, remove (2026-09-20)

**Owner 2026-09-20, verbatim:** "37 held checkouts - ok, check it" (the 2026-09-19 cleanup removed fifty checkouts with nothing uncommitted and held these 37 because they carried dirt or leftovers; ruling F-2569-2 "restore and re-check").

**Method.** Census first (`scratchpad/hold-census.jsonl`): each tree's `git status --porcelain --untracked-files=all` classified into regenerated evidence churn (`artifacts/**`, `reviews/shots-*`, `logs/**`, any PNG/JPG/WEBP), real tracked edits, untracked build output (ignored) and untracked non-build files. Then per tree: churn restored by name (`git checkout --`), real edits salvage-committed on the tree's branch (a detached HEAD got a `save/held-<tree>-work` branch first), untracked non-build files committed on the branch when the set was under 100 MB with no file over 50 MB, otherwise MOVED to `~/Claude/Projects/gr-worktree-evidence/<tree>/` with a manifest (retention law: nothing deleted), and only a tree with nothing left was removed with `git worktree remove` — every branch kept, so every commit these trees ever made is still reachable. Astra's sixteen Codex trees were not touched (owner 2026-09-20: "lets continue for now").

**Result.** 36 of 37 checkouts removed; `wt-census` was a directory without git metadata (an orphan of the 2026-09-19 pass, like `wt-preview-orphan-nogit`), renamed `wt-census-orphan-nogit` and left in place. Worktrees 68 → 33. Disk 660 GB → 1.0 TB free. One oversized untracked file (`rehearsal-video/the-ten-moments-reel.mp4`) and the rehearsal tree's 2,737 evidence files live under `gr-worktree-evidence/gr-task-rehearsal/`. Lesson: `.gitignore`'s `node_modules/` (trailing slash) does not match a `node_modules` SYMLINK, so every scratch tree that links the primary's modules shows `?? node_modules` forever; a cleanliness filter must strip the status prefix before matching.

| tree | branch | churn restored | real edits committed | untracked: committed / moved (MB) | removed | note |
|---|---|---|---|---|---|---|
| wt-census | detached | 0 | 0 of 0 | 0 / 0 | NO |  |
| wt-mapart | art/open-maps-art-blackout-fairground | 0 | 0 of 0 | 29 committed (26.7 MB) / 0 | NO | 1 paths still dirty — kept |
| agent-a074ca5aabe748fbe | worktree-agent-a074ca5aabe748fbe | 58 | 0 of 0 | 0 / 0 | YES |  |
| agent-a383c2ed5dd452ebd | worktree-agent-a383c2ed5dd452ebd | 20 | 0 of 0 | 0 / 0 | YES |  |
| agent-a448136106935d471 | worktree-agent-a448136106935d471 | 32 | 0 of 0 | 0 / 0 | NO | 1 paths still dirty — kept |
| agent-a6513377b3cf5b143 | worktree-agent-a6513377b3cf5b143 | 6 | 0 of 0 | 0 / 0 | YES |  |
| agent-a688e4a408c5fa62f | worktree-agent-a688e4a408c5fa62f | 0 | 0 of 0 | 18 committed (0.3 MB) / 0 | YES |  |
| agent-a6b1bbd373315d0c0 | worktree-agent-a6b1bbd373315d0c0 | 50 | 0 of 0 | 0 / 0 | YES |  |
| agent-a92ce8965ad80a2a3 | worktree-agent-a92ce8965ad80a2a3 | 3 | 0 of 0 | 0 / 0 | YES |  |
| agent-a98eb66014d0d4afc | worktree-agent-a98eb66014d0d4afc | 16 | 0 of 0 | 0 / 0 | YES |  |
| agent-a9ef6c846b5a10e64 | worktree-agent-a9ef6c846b5a10e64 | 22 | 0 of 0 | 0 / 0 | YES |  |
| agent-aa7ccb79d2d03ada8 | worktree-agent-aa7ccb79d2d03ada8 | 46 | 0 of 0 | 0 / 0 | YES |  |
| agent-ac6a4904ef7986cff | worktree-agent-ac6a4904ef7986cff | 3 | 0 of 0 | 0 / 0 | YES |  |
| agent-acb0d58c05ef3464e | worktree-agent-acb0d58c05ef3464e | 3 | 0 of 0 | 0 / 0 | YES |  |
| agent-ada3202c7f5b8074b | worktree-agent-ada3202c7f5b8074b | 3 | 0 of 0 | 0 / 0 | YES |  |
| agent-ae099afce3741d363 | worktree-agent-ae099afce3741d363 | 3 | 0 of 0 | 0 / 0 | YES |  |
| agent-afb0b4a8ee24d0d5f | worktree-agent-afb0b4a8ee24d0d5f | 3 | 0 of 0 | 0 / 0 | YES |  |
| gate-s2501 | detached | 6 | 2 of 2 | 0 / 0 | NO | 1 paths still dirty — kept |
| gr-task-3d-polish | sculpt/opus5-3d-night | 0 | 0 of 0 | 27 committed (34.7 MB) / 0 | NO | 1 paths still dirty — kept |
| gr-task-beauty2-e2-incline | beauty2/e2-incline | 1 | 0 of 0 | 0 / 0 | NO | 1 paths still dirty — kept |
| gr-task-beauty2-far-ground | beauty2/far-ground | 0 | 0 of 0 | 14 committed (7.3 MB) / 0 | NO | 1 paths still dirty — kept |
| gr-task-bench-opus5 | bench/opus5-boss-detail | 0 | 1 of 1 | 2 committed (10.7 MB) / 0 | YES |  |
| gr-task-bench-sol | bench/sol-boss-detail | 0 | 0 of 0 | 10 committed (83.2 MB) / 0 | YES |  |
| gr-task-bench-u-opus5 | bench/opus5-unbound | 0 | 1 of 1 | 1 committed (10.4 MB) / 0 | YES |  |
| gr-task-digger | boss/old-digger | 0 | 1 of 1 | 12 committed (10.2 MB) / 0 | NO | 1 paths still dirty — kept |
| gr-task-dispatch | lore/wd-05 | 0 | 0 of 0 | 1 committed (0.0 MB) / 0 | YES |  |
| gr-task-e1-gameplay | review/e1-gameplay-depth | 0 | 1 of 1 | 83 committed (76.9 MB) / 0 | NO | 1 paths still dirty — kept |
| gr-task-foundry | foundry/kit | 0 | 0 of 0 | 1 committed (0.0 MB) / 0 | YES |  |
| gr-task-map-fix-early | sculpt/map-fix-early | 0 | 1 of 1 | 0 / 0 | NO | 1 paths still dirty — kept |
| gr-task-map-fix-late | sculpt/map-fix-late | 0 | 1 of 1 | 5 committed (29.5 MB) / 0 | NO | 1 paths still dirty — kept |
| gr-task-masks | campaign/e2-e4-extras | 0 | 0 of 0 | 1 committed (0.0 MB) / 0 | NO | 1 paths still dirty — kept |
| gr-task-perf2-e1 | perf2/e1-extend | 0 | 0 of 0 | 1 committed (0.0 MB) / 0 | NO | 1 paths still dirty — kept |
| gr-task-persistence | tp/01-02 | 0 | 0 of 0 | 1 committed (0.0 MB) / 0 | YES |  |
| gr-task-playbook | pb/01-02 | 0 | 0 of 0 | 5 committed (0.0 MB) / 0 | YES |  |
| gr-task-press | press/cp01-03 | 0 | 0 of 0 | 1 committed (0.0 MB) / 0 | YES |  |
| gr-task-rehearsal | rehearsal/saga-e1-e10 | 0 | 0 of 0 | 0 / 2737 moved (648.8 MB) to gr-worktree-evidence/gr-task-rehearsal | NO | 2 paths still dirty — kept |
| gr-task-standing-orders | rehearsal/standing-orders | 0 | 0 of 0 | 2 committed (0.2 MB) / 0 | NO | 1 paths still dirty — kept |
worktrees now: 47
free: 896Gi

## Second pass (the first pass's leftover filter missed the status prefix; the only leftover was the node_modules symlink)
| tree | leftover before | moved | removed |
|---|---|---|---|
| wt-census | 0 | 0 | NO |
| wt-mapart | 0 | 0 | YES |
| agent-a448136106935d471 | 0 | 0 | YES |
| gate-s2501 | 0 | 0 | YES |
| gr-task-3d-polish | 0 | 0 | YES |
| gr-task-beauty2-e2-incline | 0 | 0 | YES |
| gr-task-beauty2-far-ground | 0 | 0 | YES |
| gr-task-digger | 0 | 0 | YES |
| gr-task-e1-gameplay | 0 | 0 | YES |
| gr-task-map-fix-early | 0 | 0 | YES |
| gr-task-map-fix-late | 0 | 0 | YES |
| gr-task-masks | 0 | 0 | YES |
| gr-task-perf2-e1 | 0 | 0 | YES |
| gr-task-rehearsal | 1 | 1 | YES |
| gr-task-standing-orders | 0 | 0 | YES |

worktrees after pass 2: 33 · free: 1.0Ti
