# DIVERGENCES — kit scripts vs the live Gold Rush originals
### Written 2026-07-17. The live scripts (`scripts/**` in the Gold Rush repo) are READ-ONLY source material; the running factory depends on those exact bytes. Every behavioral difference in the kit versions is listed here, with its reason. Anything not listed is a faithful port with constants moved to `foundry.config.json`.

## lane-runner.sh (from `scripts/lane-runner-v3.sh`)

**REPAIR (a) — missing worktree = FAILED pickup, never a root fallback.**
- *Live:* the slot→dir convention plus historical fallback behavior let a slot whose `worktrees/<slot>` was absent resolve to the repo ROOT, where the auto-commit's `git add -A` swept the entire working tree — the s130/s198 incident family (five sweep incidents cited in the live script's own s283 comment: bfadfc2, ff46a53, …). The live v3 patch mitigates only the art slot, by scoping its adds to `assets artifacts`, and otherwise silently *skips* a missing-dir slot every 15 s forever (`"$slot dir missing, skip"` — the task stays queued, invisible).
- *Kit:* a non-main slot with an absent worktree **fails the pickup loudly**: the task file moves to `tasks/failed/NO-WORKTREE-<name>` and the runner logs an ERROR line telling the operator to create the worktree (worktrees/README.md) and re-queue. The queue never silently rots and the repo root is never a candidate working dir.

**REPAIR (b) — auto-commit can never sweep the repo root, and is path-scopable per slot.**
- *Live:* lanes auto-commit with `git add -A`; the art-at-root special case adds `-- assets artifacts`.
- *Kit:* (1) if a non-main slot's working dir somehow resolves to the repo root, the auto-commit is REFUSED outright (belt-and-braces — repair (a) already makes this unreachable); (2) any slot may declare `runner.slots.<slot>.addPaths` in `foundry.config.json`, and its auto-commit becomes `git add -A -- <paths…>` (the scaffold ships `art: ["assets","artifacts"]`, matching the live mitigation); (3) slots without `addPaths` keep `git add -A` — safe there because the working dir is a dedicated worktree, never the root. The main slot never auto-commits, exactly as live.

**Other deliberate divergences:**
- **Config, not constants:** implementer binary (`codex`), default model/effort, poll interval (15 s), run-log retention (3 days), main-slot lock pattern (`ACTIVE 2`), and janitor clean-dirs all come from `foundry.config.json` (baked fallbacks equal the live values).
- **Routing header renamed:** masters carry `IMPLEMENTER: model=<m> effort=<e>`; the legacy `CODEX:` form is still accepted, so live-style masters run unchanged.
- **`--dry-run` added** (kit gate requirement): parses config, prints resolved settings, per-slot workdir resolution (flagging would-fail pickups), queued heads, and the exact command that would run — executes nothing, takes no lock.
- **Janitor `clean-tests` hardening:** the dirs it deletes come from config and are validated (relative, no `..`, non-empty) before `rm -rf` — the live version hardcodes two paths.
- **Lock self-heal pgrep pattern** matches the script's own basename instead of the literal `lane-runner-v3.sh`.
- **`tasks/janitor/` is created at startup** (live assumes it exists; the glob was harmless but the drop-dir wasn't guaranteed).
- **Byte-offset fragility note (not fixed, mitigated):** bash re-reads the script file by offset while running, so editing the live file mid-run corrupts the loop (known live bug #2). The kit cannot change how bash works; the mitigation is operational and documented in kit-README.md — never edit `scripts/lane-runner.sh` in place while it runs; stop it, edit, restart (the health watchdog restarts a dead runner automatically). The kit's structure keeps the long-lived loop body minimal to shrink the exposure window.

## fire-runner.sh (from `scripts/fire-runner.sh`)
- **Config, not constants:** repo path (self-resolved from the script's location instead of hardcoded), model, protocol path, log dir, lock-stale minutes (50), log retention (14 days), optional `CLAUDE_CONFIG_DIR` — all from `foundry.config.json`; `FIRE_MODEL` env override kept.
- **Node is resolved before config parsing** (config needs node; the live script resolved node after taking the lock). Same nvm/homebrew/volta/asdf search as live (the s55 thin-PATH lesson).
- **Protocol-file existence is checked** with a FATAL log line (live would pass `cat`'s empty output to `claude -p`).
- **`--dry-run` added:** prints repo, config presence, model, protocol presence, log/lock paths, resolved binaries, and the exact command — executes nothing, takes no lock, writes no logs.
- The Gold-Rush-dated comment about the 2026-07-15 Opus cap is dropped (bookkeeping, not behavior).

## dashboard-gen.sh (from `scripts/dashboard-gen.sh`)
- **Discovery over hardcoding:** queue slots iterate `tasks/queue/*/` (live hardcoded `main lane-a…art`); lane/save branches come from `git for-each-ref 'refs/heads/lane/*' 'refs/heads/save/*'` (live hardcoded seven Gold Rush branches, which is why retired lanes ghosted on the board — Mistake #5 adjacent).
- **Config, not constants:** title/name, output path, goals file, refresh seconds, fire cadence label, default model label; env overrides simplified to `FOUNDRY_ROOT` / `FOUNDRY_NODE_BIN`.
- **Crafting-pending is optional:** the pending-orders line renders only when `dashboard.pendingDir` is set (live hardcoded `assets/crafting-queue/pending/`).
- **goals.json optional:** absent file renders a pointer placeholder instead of `exit 1` mid-page (the live script dies if `tasks/goals.json` is missing; a fresh factory gets `{"goals":[]}` from init, and the node section now tolerates an empty list).
- **Routing header:** reads `IMPLEMENTER:` and legacy `CODEX:` (live: `CODEX:` only). Goal-tree file path is passed via env var instead of being baked into the embedded node script.
- The run-log timestamp-scrape fallback for durations (two greps over the log body) was dropped; mtime-based duration is kept. Cosmetic-only difference.

## health-watch.sh (from `scripts/health-watch.sh`)
- **Config, not constants:** root self-resolved, project name in the notification title and dashboard header, health-log path, fire-log dir, lock-stale minutes (reuses `fire.lockStaleMinutes` instead of a second hardcoded 50), pending dir optional (check #4 is skipped at zero when unset).
- **Lane list discovered** via `git for-each-ref 'refs/heads/lane/*'` (live hardcoded five branches).
- **Restart target** is `scripts/lane-runner.sh`; pgrep patterns match the kit script names and the parameterized fire title (`claude -p # <name> FIRE`).
- The Codex-specific 401 alert text is generalized to "implementer account/login".

## What was kept byte-faithful on purpose
The mkdir-based single-instance locks, the stale-lock reap thresholds, the crash-salvage of stale pids to `failed/CRASHED-*`, the STATUS.md head-2 main-slot gate, lane commit-to-branch (the s76 root-cause fix), the janitor request whitelist (nothing from a `.req` file is ever executed as code), the `.git` stale-object sweep, macOS BSD `stat -f %m` / `date -j`, and the dashboard's whole visual/ledger structure. These encode paid-for lessons; the kit changes their *parameters*, not their *shape*.
