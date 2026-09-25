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
