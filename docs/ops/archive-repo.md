# The archive repository: keep everything, make the working repo small

**Owner ruling 2026-09-06, verbatim:** "I don't want to pay and don't want to lose everything. Maybe we can have an archive GitHub repository? then the one to use for implementation gets smaller and we still can keep everything."

## What exists now (2026-09-06)
- `Agent-Town/GoldRush` (private, 19.3 GB on GitHub): the implementation repo, every session's history since June.
- `Agent-Town/GoldRush-archive` (private, created 2026-09-06): the frozen full-history mirror. Filled by `scratchpad/archive/mirror.sh` in chunks of first-parent commits (GitHub refuses any single push over 2 GB and any blob over 100 MB), then every other branch and tag. Six refs cannot go to GitHub as they are and stay local (they carry a 151–262 MB blob each): `archive/lane-a-s1688-f1643-2-raw-quarantine`, `archive/suite-red-inventory-raw-171mb`, `archive/suite-red-inventory-raw-f1643-2-151mb`, `backup/main-pre-trace-rewrite`, `heat12/opus-sweep`, `save/heat12-merge-attempt`. Their contents are on this disk and in the local pack; nothing is lost, and the RETENTION LAW holds.
- The archive is never rewritten and never force-pushed. A weekly fire duty appends new main commits to it (the same chunked push, from the last mirrored commit).

## Where the weight is (measured 2026-09-06, packed on-disk bytes across all history)
| family | packed MB | at HEAD MB | loaded by the game? |
|---|---|---|---|
| `assets/motion-pilot` | 2,391 | 1,902 | yes (the town's motion pilot) |
| `assets/pilots` | 2,297 | 2,178 | yes (terrain and panoramas) |
| `assets/raw` | 1,526 | 1,593 | yes (story plates resolve to `assets/raw/<key>.png`) |
| `artifacts/**` (drain evidence) | ~5,500 | ~7,000 | no |
| `reviews/**` (screenshots) | ~1,500 | 1,538 | no |
| `tasks/BACKLOG.md` + `STATUS.md` histories | 941 | 8 | no (text churn: 11,474 commits) |
| `marketing`, `logs`, `tasks/runs` | ~600 | ~470 | no |
| everything else (`src`, `scripts`, `docs`, `assets/processed`, contracts) | ~1,000 | ~700 | yes |
| **total** | **21,403** | **14,122** | |

The game itself needs about 7 GB of art plus 0.7 GB of code and data. Everything else is evidence and text history.

## The plan (needs the owner's word: it rewrites the implementation repo's history, which invalidates every clone and worktree)
1. **Archive first** (done above): the full mirror is the only copy that keeps every version of every screenshot and log.
2. **Split the art out** into `Agent-Town/GoldRush-assets` (private, ~7 GB, changes rarely): `assets/pilots`, `assets/motion-pilot`, `assets/raw`, `assets/processed-full`. The implementation repo reaches it through a sibling checkout (`../GoldRush-assets`) and symlinks at the same paths, so no code path changes and Vite serves them as today. Every worktree shares ONE assets checkout, which also ends the 14 GB-per-worktree disk problem for good.
3. **Filter the implementation repo** (`git filter-repo`, not yet installed here) to drop `artifacts/**`, `reviews/shots-*`, `marketing/**`, `logs/**`, `tasks/runs/**` and the four art directories from history, keeping their CURRENT versions where the code needs them. Expected result: a working repo of about 1 GB of history instead of 20 GB.
4. **Evidence going forward** stays in the implementation repo (the drain law needs it beside the review) and a monthly fire duty moves evidence older than 60 days into the archive repo, then removes it from the working tree in a commit that names the archive commit. The RETENTION LAW's "mirror into git before any hygiene" is satisfied by the archive.
5. **Cost:** zero. Three private repositories of 20 + 7 + 1 GB; GitHub's soft guidance is 5 GB per repo, and it already tolerates 19 GB here. No LFS.

## How to do the rewrite when the owner says so (a quiet window, every lane idle, one evening)
- Verify the archive mirror is complete: `git ls-remote archive` shows every branch and tag except the six named above; `git log archive/main -1` equals `main`.
- Create the assets repo from the current tree's four art directories; verify a fresh clone plus the symlinks builds (`npm run build`) and the playability smoke boots all 42 contracts.
- `pip install git-filter-repo`; on a fresh clone run the filter with the path list above; verify `npm run build`, `test:node-guards`, and the size; push to a NEW repo name (`GoldRush-impl`) and only then swap the origin remotes, recut every worktree, and re-point the fire and the runner.
- Never force-push over `GoldRush` itself until the new repo has run one full day of fires.

## Mirror log (2026-09-06)
- 09:20-11:02Z: main's 11,474 first-parent commits pushed in chunks of 100 (`scratchpad/archive/mirror.sh`), then all tags. The archive's `main` stood at `502a398d9` when the pass ended; the branch pass below moves it to the day's tip.
- The first branch pass FAILED every one of 484 branches on a zsh modifier trap: `"refs/heads/$b:refs/heads/$b"` reads `$b:r` as the root-name modifier, the colon vanishes and git sees one concatenated refspec ("src refspec … does not match any"). Cure: `${b}` braces (the same trap as the chunk loop's `${C}` earlier in the day; grep every `$VAR:` in a script before running it).
- 11:09Z: `mirror-refs.sh` re-pushes every branch except the six named above, one push per branch (~20 s each, ~2.5 h). Final count and any twice-failed branch are recorded here by the next session; a failed branch is listed, never forced.

## State at 2026-09-06 23:00 (attended)
- **Archive complete.** `Agent-Town/GoldRush-archive` holds `main` (fast-forwarded to `e5f3ac820`), every tag, and every branch except the six >100 MB ones named above: `git ls-remote archive | wc -l` = 539 (541 local refs, six skipped, the count includes HEAD and the extra tag refs). The branch pass ran 15:09-15:30Z with zero failures once the zsh modifier trap was cured.
- **Art store complete.** `Agent-Town/GoldRush-assets` (private) holds `pilots/`, `motion-pilot/`, `raw/`, `processed-full/` (5.7 GB) in five chunked commits (README `7cb13f7`, chunks 1-5 `120a1f8`..`9fdd2e0`, each ≤ 1.4 GB so every push cleared GitHub's 2 GB limit), `main` = `9fdd2e0`. The remote URL must be the `git@github.com:` form; the bare `github.com:` form authenticates as the local user and is refused.
- **Shrink rehearsal running** in `scratchpad/shrink/` (`rehearsal.sh`): a fresh `--no-local` clone of `main`, `git filter-repo --invert-paths` over a computed drop-list (every `artifacts/*` and `logs/*` entry NOT referenced by `src/`, `scripts/`, `e2e/` or the configs, plus `tasks/runs`, `reviews/shots-*` and the four art directories), `--replace-refs update-or-add` so old commit ids still resolve, then the art store symlinked in, tsc, build and four guards. Its log carries the resulting `.git` size and the keep/drop lists; the real run repeats it on the final tree in a quiet window, then pushes to `GoldRush-impl`, and the working checkout is swapped only with eyes on it (the plan's own guardrail).

## Catch-up and rewrite, 2026-09-20 (owner: "A3 - ok, rewrite it")
- **The archive had fallen 1,192 commits behind main** (`e5f3ac820` → `32524c8f6`; the weekly fire duty of §"What exists now" never ran). Caught up 23:00–23:38Z: main pushed in first-parent chunks of 50 (772 first-parent commits), all tags, and 87 branches new since 2026-09-06; 465 branches were already identical. Nine refs cannot go to GitHub as they are (a blob over 95 MB each) and stay local: the six named above plus `drain/sprites-roster`, `sol/code-review-20260908` and `sol/sprite-animator-src-20260908` (all three carry `artifacts/sol/code-review-fixes-20260908/targeted-browser/evidence/…/mp-02-lockstep…`, ~100 MB). Archive refs 544 → 610. Scripts: `scratchpad/a3-phase1.sh` of the attended session (chunked push with halving on failure, per-branch blob scan with `git rev-list --objects <b> --not --remotes=archive | git cat-file --batch-check`).
- **The art store refreshed** with main's four art directories as of `32524c8f6` (5,949 changed entries in five chunked pushes). The first refresh extracted each directory one level too deep (`pilots/pilots/…`, a tar strip-count mistake carried by an `rsync --delete`) and was corrected the same hour by a second set of commits (store `4aa0b1f`); git deduplicated the blobs, so the mistake cost tree objects only. The store now holds `pilots/`, `motion-pilot/`, `raw/`, `processed-full/` at the top level, 12 GB checked out at `/Users/robin/Claude/Projects/GoldRush-assets`, which is the absolute path the implementation repo's symlinks use.
- **The filtered implementation repo** is being built in the attended scratchpad (`a3/impl`): a fresh `--no-local --single-branch` clone of main, `git filter-repo --invert-paths` over `artifacts/`, `logs/`, `marketing/`, `tasks/runs/`, `reviews/shots-*/` and the four art directories, then at HEAD the code-referenced evidence, the last 60 days of non-image evidence, the last 21 days of screenshots, `logs/` and the marketing texts re-added from main, absolute symlinks for the art directories, and `server.fs.allow` in `vite.config.ts` so Vite serves the store. Measured after the filter: `.git` 3.1 GB before verification (against 105 GB local / 19.3 GB on GitHub). Verification (tsc, both builds, the first-town payload, an e2e smoke, the full battery) and the push to `Agent-Town/GoldRush-impl` follow; the swap waits for a quiet factory window (no Astra or Opus run in flight).
