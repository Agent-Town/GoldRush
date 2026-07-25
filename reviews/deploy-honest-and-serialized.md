# deploy-honest-and-serialized — drain review (s1049)

**Slice:** `tasks/lane-b-deploy-honest-and-serialized.md` (FIRE-AUTHORED s1048)
**Branch/tip:** `lane/m4` @ `286c2f48` (`runner(lane-b)`, 2026-07-25 23:55:44)
**Merged to main:** `ab528c3f51c1f8db710953f76c3684bc92c7fcf9`
**Verdict:** ✅ **MERGE.** Both findings closed, firewall held exactly, and the two claims that could only be settled by execution were executed by this drain. **It does not fix the outage** — see LIMIT.

## What it does

Two changes to `scripts/deploy.sh`, +29/−1, nothing else in the diff.

1. **F-1048-4 — the diagnostic stops guessing.** `:74`'s hardcoded *"auth expired? project missing? owner: wrangler login / pages project create gold-rush"* is replaced by the wrangler error **actually captured** in `$CAPTURE`: ANSI stripped, `\r` removed, the `ERROR`/`Error:` block joined with ` | `, capped at 240 chars, with two fallbacks (last non-empty line, then a fixed string) so the note is never empty.
2. **F-1048-5 — deploys serialize.** An exclusive `lockf(1)` lock on `$(git rev-parse --git-common-dir)/gold-rush-deploy.lock` (shared across worktrees; falls back to `logs/deploy.lock`), taken **before the build**. A collided run notes `SKIP: deploy already running (exclusive lock held)` and `finish skipped 6`. `HUP`/`INT`/`TERM` traps route to `finish interrupted`.

`flock` is Linux-only, so `lockf` is the correct macOS choice — and `/usr/bin/lockf` was confirmed present rather than assumed.

## Evidence

Everything below was run by the drain on the merged tree. The report was read, then ignored in favour of execution.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | green, **1.88s** |
| `bash -n scripts/deploy.sh` | rc=0 |
| Lock mechanism (isolated) | holder **ACQUIRED** → second attempt **REFUSED (rc=75)** → third **ACQUIRED after release** |
| **Lock on the shipped script** | with the lock held, the real `scripts/deploy.sh` exited **rc=0 in 0.1s**, printed `SKIP: deploy already running (exclusive lock held)`, and **never reached `building…`** |
| Error reporting vs the 21:41 real failure | `✘ [ERROR] A file or directory could not be found. \| Error: Failed to upload files… {"errno":-2,"code":"ENOENT",…"path":".../dist/assets/index-CQNr9KPZ-diet-576343bc.js"}` |
| Error reporting vs the 23:03 real failure | `✘ [ERROR] Failed to upload files. Please try again. Error: {}) \| 🪵 Logs were written to ".../wrangler-2026-07-25_16-03-59_520.log"` |
| Merge classification | stale-base lane; clean 3-way; **only `scripts/deploy.sh` staged** |

**On s1048's three rejection criteria**, which this drain was told to enforce:
- **(a) the five never-block exit codes** — ✅ every `finish` path still exits 0 while `STRICT=0`; the new `lock_failed 6` / `skipped 6` / `interrupted 129|130|143` codes route through the same `finish()`, so `deploy.sh:3-4`'s never-block law is intact, demonstrated by the rc=0 skip above.
- **(b) a demonstrated lock collision whose second run exits 0** — ✅ demonstrated **on the shipped artifact**, not on a model of it. This was the check worth paying for: it proves the lock sits *before* the 15-minute leg, which is the whole point of the change.
- **(c) a forced-failure paste proving the real cause is readable without opening the log** — ✅ for the ENOENT class the message now names the exact missing file. For the opaque `Error: {}` class it surfaces the **wrangler log path** — which is precisely the breadcrumb this same fire followed to find `UND_ERR_HEADERS_TIMEOUT` (F-1049-2). Not the root cause in the note itself, but one grep away instead of a guess pointing the wrong direction.

*(Testing note, so the second row is not over-read: the trailing `[deploy]` line visible in the 23:03 extraction is an artifact of how the drain sliced `logs/deploy.log` for the test — `$CAPTURE` holds only wrangler's own output at runtime. Not a defect.)*

**Merge classification:** the lane's two-dot diff against main showed deletions of `reviews/deploy-path-false-green.md`, `scripts/status-line1.mjs`, `tasks/goals.json` entries and two task files. **All phantom** — the lane branched before those commits, and the 3-way preserved every one of them (staged set was `scripts/deploy.sh` alone). No file was LANE-TOUCHED and MAIN-MOVED simultaneously, so no 3-way resolution was required.

## LIMIT — read this before believing the deploy is fixed

**This merge does not end the outage, and nothing here should be read as if it did.** `deploy.sh` still decides success on **wrangler's exit code alone**, and wrangler 4.107.0 exits **0** after a failed upload (it crashes in its own exit path on `process.exit('ENOENT')`). The false green that has kept the family on a 23-hour-old build — **F-1049-1**, proven by fetching the live `/version.json` — is untouched by this change, because the master predates the finding.

That is not a defect in this task. It was authored against F-1048-4/5 and delivers both.

**Successor queued by this drain:** `tasks/lane-b-deploy-verify-published.md` → `tasks/queue/lane-b/`, now legal to queue because its predecessor has merged (queued earlier it would have STOPped its own SAFE-DUPE pre-flight into a zero-work done-move). It adds: success requires a **captured `pages.dev` URL**, upload from an **immutable snapshot** of `dist/` (F-1049-3: the clobber comes from *gate builds*, which a deploy-only lock cannot see), and a post-deploy **`/version.json` confirmation**.

## Findings

- **F-1049-4 (partially addressed here):** the `HUP`/`INT`/`TERM` traps mean a signalled run now records a terminal state instead of vanishing — the 21:25:49 run left no record at all. A `SIGKILL`ed run still leaves nothing; acceptable, and noted rather than fixed.
- **No new findings.** No gazette item (deploy infrastructure — nothing player-visible; filter law). No deploy attempted by this fire: it merged zero gameplay bytes, and starting a 15-minute upload while the successor that fixes the success-detection is queued would only produce another unverifiable `DEPLOYED ok`.
