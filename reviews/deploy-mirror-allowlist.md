# deploy-mirror-allowlist — the droplet mirror ships the runtime set and nothing else

**Slice:** `deploy-mirror-allowlist` (lane-d) · **branch:** `lane/d` · **lane tip:** `5773ea34f` · **base:** `1a6be1b76`
**Drained:** s2445, 2026-09-02 · **Gate worktree:** `gate-s2445` (detached, §3.0b)

## Verdict

**MERGE — PASS.** The guard was not taken on its green: three manufactured defects were used to prove it reds, and the file was restored byte-identical afterwards.

## What it does

Twice in a week the droplet mirror shipped gigabytes the box never reads — gate scratch, then review video and raw art — because the rsync excluded **by name**. A denylist is a promise to remember every future folder; the next new directory at the repo root shipped by default.

`scripts/deploy.sh` now sends a **positive runtime allowlist** and ends closed with a sender-only `--filter=-s *`, so a path that is not named cannot ship. `--delete` still removes receiver spillover, while `--filter=P /node_modules/***` protects the box-installed modules from it. The ledger DB (`/opt/goldrush-ledger/`) and site uploads sit outside the mirror root and the guard asserts that they survive.

`scripts/deploy-mirror-allowlist.test.mjs` (rooted in `test:node-guards`, now 85 legs) **derives** rather than transcribes: it walks the static import closure of `server/ledger/serve.mjs` and `scripts/assay-worker.mjs`, adds `ENGINE_SOURCE_INPUTS`, and asserts every one of those files is inside the allowlist — then rsync-`--dry-run`s a fixture tree of decoys and asserts none ships. Measured closure on this tree: **ledger 1450 files, assay 2233, engine 483, total 2344 unique.**

The post-sync gauge stays, with its ceiling lowered from 2500 MB to **2184 MB** — the first allowlisted sync's measured 1,456 MB (node_modules included) plus 50% headroom, so bloat is caught at the first deploy that ships it rather than after it has doubled.

**The honesty guard held.** The master forbade widening to a directory wholesale to make the test pass. The import closure reached four paths the author did not expect — `index.html`, `scripts/asset-diet.mjs`, `news/herald.json`, `lore/world-dispatches.md`, plus exact Vite-loaded GLBs, audio and plates — and the allowlist names each of them **individually** (`--include=/scripts/asset-diet.mjs`, `--include=/news/herald.json`, …) rather than admitting `/scripts/` or `/assets/raw/` wholesale. The BACKLOG row names them out loud.

`scripts/fire.md` gains one line to the DEPLOY LAW: the mirror is allowlisted; a new runtime dependency means extending the allowlist and passing the guard, never a fresh exclude.

## Evidence

| Gate | Result |
|---|---|
| `bash -n scripts/deploy.sh` | rc=0, syntax clean (run via the node route — `bash` is gate-refused, §2.0d) |
| `npx tsc --noEmit` | rc=0, no output |
| `npm run build` | rc=0, built in 4.08 s; asset-diet 1,158,214 B against a 1,500,000 B ceiling |
| `scripts/deploy-mirror-allowlist.test.mjs` alone | 1/1 pass, 1.14 s |
| `npm run test:node-guards` (full battery — the slice edits the battery manifest, and a targeted gate is blind to a collection break) | see below |

### The guard has teeth — proven by manufacturing, not by its green

A passing guard never executes its violation path, so its green is not evidence about its red. Three defects were manufactured on the live file, each reverted immediately; the file was confirmed **byte-identical** afterwards.

| Manufactured defect | Result |
|---|---|
| drop `--include=/server/***` (a runtime path stops shipping) | **RED**, rc=1 |
| drop the final `--filter=-s *` (the allowlist stops being closed — everything ships) | **RED**, rc=1 |
| drop `--filter=P /node_modules/***` (`--delete` eats the box's installed modules) | **RED**, rc=1 |

All three of the guard's stated jobs are genuinely covered. None is decoration.

### The engine identity does not rotate

This slice edits `package.json` (one battery leg). `ENGINE_SOURCE_INPUTS` was read on the merged tree and is `scripts/assay-replay-agent.mjs · assets/contracts · assets/crafting-queue/contract.v1.json · assets/crafting-queue/approved · assets/layer-contracts · assets/pilots/map-rebuild-spike · src` — **`package.json` is not in it**, since s2443's `engine-surface-narrowing`. So this merge cannot rotate the engine hash or put a stored reel at risk. Recorded because the open F-2416-2(ii) / F-2297-1 fork is exactly about `package.json` driving that corpus; this is one more data point that the narrowing did its job.

## Merge classification

Base `1a6be1b76`; 5 paths, **no conflicts** — but two of them are BOTH-MOVED and were verified rather than assumed, because an auto-merge is a claim about content.

| Path | Class | Resolution |
|---|---|---|
| `scripts/deploy-mirror-allowlist.test.mjs` | LANE-ONLY (new) | taken |
| `scripts/deploy.sh` | LANE-ONLY | taken |
| `package.json` | LANE-TOUCHED | auto |
| `scripts/fire.md` | **BOTH-MOVED** | auto-merged; both sides verified present |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | auto-merged; both sides verified present |

- **`scripts/fire.md`.** Main moved it in this same fire (my drain-1 gazette pointer re-base, `:1619` → `:1625`); the lane added a DEPLOY MIRROR LAW sentence in §2A. Verified on the merged tree: the lane's sentence is **present**, my `:1625` pointer is **present**, and the stale `:1619` is **absent**. Byte lengths corroborate — main 348,129, lane 345,565, merged **348,326**, i.e. main plus the lane's added sentence.
- **`tasks/BACKLOG.md`.** Each side edited a *different* row: main's release-pass row carries my drain-1 `reel-deep-links … IMPLEMENTED` edit, the lane rewrote the mirror row to `IMPLEMENTED`. Verified the merged mirror row is **byte-equal to the lane's** version and the merged release row retains **my** edit. Line counts main 5072 / lane 5064 / merged **5072**, zero conflict markers, and the single line "absent" from each side is precisely the row the *other* side edited — the signature of a correct three-way merge, not a loss.

## Findings

**None blocking.** No F-IDs opened against this slice.

One note, non-blocking and not a defect in the slice: **the allowlist is verified against the repo, not against the box.** The guard's dry-run proves what rsync *would* send from a fixture tree; the 1,456 MB figure and the 2184 MB ceiling come from the first real sync, which is attended evidence quoted in the master, not something a drain can re-measure. The first real deploy after this merge is what confirms the ceiling — and that deploy is owner-gated (below).

## Publication

`scripts/deploy.sh` is **PUBLISH-GATED: DO NOT WRAP** (F-2371-6). This drain merges the change; it does not exercise it. The next `bash scripts/deploy.sh` — the owner's — is the first run of the new filter set, and it is the one that will print the real mirror weight against the new 2184 MB ceiling.
