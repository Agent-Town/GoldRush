# scripts/attended — the attended session's landing toolkit, tracked

Until 2026-09-25 this machinery lived in one session's scratchpad under `/private/tmp` and died with it (the preview helper vanished mid-day; every landing was a hand-derived copy of a 24 KB script, and two copies shipped with a quoting slip that pushed main with the bookkeeping missing). The owner's word that day: *"Move the landing templates into the tracked scripts directory so the next session inherits them."*

Everything here is for the ATTENDED session or an Opus implementer it spawns. Fires never run it (their law is `scripts/fire.md`); Codex never runs it (`AGENTS.md`).

## The pieces
| File | What it is |
| --- | --- |
| `dlock.sh <cmd…>` | one attended drain or implementer batch at a time; a `mkdir` lock at `~/.goldrush/drain.lock` (stale locks with a dead holder are reclaimed after 10 min). Every vite or playwright run outside a lane goes through it. |
| `fire-hold.sh start [name] \| stop \| status` | keeps the fires off main by holding the DIRECTORY `tasks/.fire.lock` (mkdir first, then touch; a FILE there silences the fires forever, see `law-file-argmax-and-fire-liveness`). Only for operations that rewrite the ledgers on main. |
| `land.sh <landing.json>` | the landing: merge into a detached chain worktree, gates, verdict, pin, review, bookkeeping, ff, push, deploy, battery. Run under `dlock.sh`. Stops write `… — needs hands` into `~/.goldrush/land/<tag>-gates.txt` and leave the chain worktree at `~/.goldrush/land/wt-<tag>`. |
| `land-lib.cjs` | the node half of `land.sh` (config, conflict policies, pin, review, bookkeeping, verdict); tested by `scripts/attended-land.test.mjs`. |
| `lawfix.sh` + `law-rebase.cjs` | re-base `scripts/fire.md`'s drifted pointers by their banked excerpts inside the chain; refuses when an excerpt is not found exactly once. |
| `md-3way.cjs <file>` | resolves the two shared campaign markdown files by key (`## ` sections, `\| name (id) \|` rows) inside a merge. |
| `control.sh <port> <n> <spec…>` | the control arm on a detached clean-main worktree: attribute a red by measurement, never by the inventory alone. |
| `preview-redeploy.sh --yes` | the all-epochs preview branch deployment (rebuilt from logs; watch its first run). |
| `cures/` | drain-side cure scripts a config may name (`remint-e1-manifests.mjs` re-mints the E1 manifest fixtures through vite). |
| `landings/` | one JSON per landing, kept as the record of its parameters (the examples show the three shapes). |

## A landing, end to end
1. The implementer's branch is READY-FOR-GATES (report under `artifacts/<slice>/report.md`).
2. Write `scripts/attended/landings/<tag>.json` (copy the nearest example) and `scripts/attended/landings/<tag>-review.md` (the review body: what it does, the drain's own cures, merge classification, findings; the evidence table is generated). No apostrophes are needed anywhere because nothing is spliced into code.
3. `nohup scripts/attended/dlock.sh scripts/attended/land.sh scripts/attended/landings/<tag>.json > ~/.goldrush/land/<tag>.out 2>&1 &` and watch `~/.goldrush/land/<tag>-gates.txt` for `LAND-<tag>-DONE` or `needs hands`.
4. After DONE, verify three things on main before believing it: the goal leaf's `status`, the row key in `tasks/BACKLOG.md`, the phrase on STATUS line 1 (memory `landing-template-bookkeeping-quoting`).
5. Commit the two landing files with the handover.

## Config shape (`landings/example-*.json` are complete)
`tag`, `branch`, `port`, `mergeMessage`, `hash` (`pin` with `pinCause`, or `unchanged` for test/scripts-only branches), `gates` (`releaseBuild`, `payload`, `halo`, `nullFloors`, `releaseSuite`, `functions`, `ledgerBattery`, extra `guards`, `specs`, `warmup`, `warmupSpec`, `allowedE2E` regexes, extra `allowedBattery` substrings), `cure` (optional script run in the chain after the merge; it commits itself), `review` (`path`, `title`, `body` file), `bookkeeping` (`taskFile`, `rowKey`, `rowEmoji`, `rowText` with `{PIN}`, `statusPhrase` with `{PIN}` and no F-ID, `drainedBy`), `deploy`, `preview`, `evidenceDir`.

## Laws this tool encodes (each learned by a named failure)
- Never gate on main's working tree: a detached chain worktree beside a scratch store worktree, then ff-only (Mistake #12, `fires-live-drain-via-detached-worktree`).
- A fire owns main while STATUS line 1 carries a lock shape OR `tasks/.fire.lock` is a fresh directory; a fire's `lock CLEARED` commit can precede its last write by minutes (F-E1T-2).
- `--workers=1` always; a real warm boot before any counted e2e (F-1270-1, F-ENV-1); the pin is measured LAST, after the battery.
- The two campaign markdown files resolve by key, never by union (`shared-markdown-needs-key-3way`); `package.json`'s node-guards roster resolves by union of test names; `engine-era.json` conflicts stop the landing.
- Never `git fetch --depth`/`--filter` into the working repo (F-E1T-3); never edit a script that `ps` shows running (Mistake #17); never `rm` factory artifacts (the Retention Law).
- Every red is attributed against clean main by a control run; inventory membership excuses nothing (F-1444-2).

## Learned on the first real run (hm06, 2026-09-25)
Config paths (`cure`, `review.body`) are relative to the PRIMARY repository and are resolved before the tool enters the chain worktree; a chain worktree is a detached checkout of main and holds none of the session's uncommitted files. The first run stopped at `cure … No such file or directory` for exactly that reason and was re-queued after the fix.
Also learned there: the chain's STATUS line 1 is a snapshot of main at merge time and may carry a fire's ACTIVE shape; bookkeeping must not read it as a live lock (the live lock is the fast-forward gate). And a fixed stop resumes: `GR_LAND_RESUME=1 scripts/attended/dlock.sh scripts/attended/land.sh <cfg>` skips the merge, the cure and every gate when the gates log already carries `verdict: clean`, and continues at the pin.

## Battery rows that read as load, not regression (attribute by a quiet re-run, never by allowing them blindly)
`fixture owners remove their temp directories` (the sweep itself, allowed by default), the two registry rows before a pin (allowed by default), and `board-tape-gold.test.mjs`'s "the browser door submits the purse held at the secure tick" (a headless browser boot with 120 s waits; red in every battery that ran beside another playwright batch on 2026-09-25, green alone). The last one is deliberately NOT in the default allow list: when it is red alone on a quiet machine, the door has changed.

## Two rules learned on 2026-09-25 (pp3 resume; the vibe and kv1 landings)
- **Commit landing-config edits before you resume or queue.** The main-merge wait needs ZERO non-log tracked changes on the PRIMARY repo and counts your own dirt: an edited `landings/<tag>.json` or `<tag>-review.md` left uncommitted stalls the landing silently at the ff step (pp3 slept 17 minutes on two such files). Path-scoped commit first, then `GR_LAND_RESUME=1 …`.
- **Owner items get their own BACKLOG row.** `desk-declaration-guard` counts a finding as declared only when it is the FIRST F-ID in a row's subject zone; a mention inside the landed row is not a declaration. In the cure: `node scripts/attended/desk-row.cjs <F-ID> "(date, from <landing>): <subject>.** <body>"` (idempotent; inserts above the first desk row; run from the chain root, commit `tasks/BACKLOG.md`).

## Two locks, not one (2026-09-25, F-LAND-1)
`dlock.sh` (the drain lock) is for implementer BATTERIES. Landings run through `land-queue.sh <landing command>`: one landing at a time on `~/.goldrush/land.lock`, admitted when the 1-minute load average is under `GR_LAND_LOAD_MAX` (default 20). The single shared lock had become a six-way, non-FIFO queue at load 9 with the two landings an hour deep behind four batteries. A battery running beside a landing can only cost it a load-class row, which the drain attributes by reading the log; it cannot touch main. Queue shape: `nohup scripts/attended/land-queue.sh scripts/attended/land.sh scripts/attended/landings/<tag>.json > ~/.goldrush/land/<tag>.out 2>&1 &`.

## One vite cache per checkout (2026-09-25, worktree-vite-cache-1)
Vite's dependency cache now lives in the checkout that uses it (`.vite-cache/` at its root, gitignored; `cacheDir` in `vite.config.ts`). It used to be `node_modules/.vite`, which every worktree and chain worktree reaches through its `node_modules` symlink, so it was ONE directory for the whole Mac while vite keys it by `config.root`: any dev server or vite-loading node guard booting in another checkout deleted and rewrote it under a running server (measured that day: eight other configurations rewrote it at least 127 times in 19 minutes, and 3 of 6 timed boots of an uncured worktree never booted in 180 s, on 504 "Outdated Optimize Dep" before `Game.ts` loaded; none of its three "warm" boots found its own cache). The dependency scan now reads only `index.html` and `src/replay/harness.html`, because the default `**/*.html` glob followed `assets/pilots` into the art store's `hero-3d/compare.html` and died on `[TSCONFIG_ERROR]` in every checkout, the primary included. So a fresh checkout's first boot, or its first vite-loading node guard, pre-bundles six deps once (about a second), every later boot in that checkout is warm, and no other checkout can touch it: 6 of 6 cured boots reached a running game in 2.5 to 3.4 s at load 15 to 38 with no reload. The warm-up boot before counted e2e stays as cheap insurance; a warm-up that still logs "optimized dependencies changed" is now a finding about that checkout, not about its neighbours. Evidence: `artifacts/worktree-vite-cache-1/report.md`.
## Attribution is a command, not a snippet (2026-09-25, F-LAND-3)
`scripts/attended/attribute.sh <tag> "<battery row substring>" <reason>` allows one battery row for one landing, writes the reason into the review body, recomputes the verdict and appends `verdict: clean` to the gates log ONLY when the lib reports exactly that. It exits 1 and prints the remaining reasons otherwise (an e2e red, a guard red). Read the row's assertion first: "child failed"/TimeoutError shapes are host load; "fixture survivors" never is; on a hash-moving branch the sweep's `bench-seeds` child is the pre-pin red the pin cures. Never append `verdict: clean` by hand.

## Pinned landings, one at a time (2026-09-25, F-LAND-4)
The chain computes its pin (#N is the registry index) BEFORE waiting for the fast-forward. If another pinned landing lands first, the RESUME's main-merge stops with "engine-era conflict (another pin landed)" and `assets/engine-era.json` unmerged, and the resolver stops at that first file (so `tasks/BACKLOG.md`, a plain union, stays unmerged too). Rules: never queue two pinned landings at once; queue the second only after the first is DONE. To repair a collision by hand in the chain: `git checkout --theirs -- assets/engine-era.json` (main's registry), union the other conflicted files, commit the merge, compute the merged tree's hash, `node scripts/attended/land-lib.cjs pin <cfg> <store> <hash>` (appends #N+1), `sed` the old "#N `hash8`" out of the chain's BACKLOG row and review (bookkeep does not update an existing row), commit, run `engine-era-guard` and `bench-seeds` in the chain, then RESUME. The structural cure (pin after the main merge) is owed to `land.sh` once the queue is quiet.

## The load gates and this Mac's baseline (2026-09-26, F-LAND-5)
The host idles at a 1-minute load of 25 to 45 with the owner's iOS simulator, Chrome and the Codex desktop app running, before any battery of ours. A landing gate at 20 held the lock for an hour without starting a landing; the run-queue gate at 16 never opened. `land-queue.sh` now defaults to 40 (`GR_LAND_LOAD_MAX` overrides); the Astra queue jobs gate at 32. Read the load beside every timing, never as a verdict.
