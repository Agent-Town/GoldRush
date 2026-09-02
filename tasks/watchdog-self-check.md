# Task watchdog-self-check: the health watchdog checks that its sibling launch agents are loaded (main slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac at the repo root (main slot).
READ FIRST: AGENTS.md; `scripts/health-watch.sh` (the watchdog: its `status` and pass logic; verified 2026-09-02 it contains NO `launchctl` reference); `scripts/com.goldrush.dashboard.plist`, `scripts/com.goldrush.health.plist`, the fire plist (the three launch agents; labels `com.goldrush.dashboard`, `com.goldrush.health`, `com.goldrush.fire`); `logs/health.log` (the pass line the fires read); `scripts/fire.md` §2 (fires read the health log; they cannot run `launchctl`).
Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED — list briefly, proceed.
FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a STOP; list them and proceed (F-1407-1, s1407): (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence (the F-1266-1 exception).

## Why (attended 2026-09-02: the dashboard and health launch agents had vanished from ~/Library/LaunchAgents and nothing noticed for six days; the boards went stale on 2026-08-27 and were found by the owner's eye)
The watchdog watched the game and the runner but not itself. A watcher that cannot notice its own sibling is missing leaves the owner as the alarm.

## Scope
1. `health-watch.sh` gains an `agents` check in every pass: `launchctl list` must contain all three labels; a missing label writes `AGENT MISSING: <label>` into the pass line and the remedy the owner types (`launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/<label>.plist`) into `logs/.health-state`.
2. `status` prints the three labels with LOADED/MISSING.
3. The pass stays `ok` only when all three are loaded (a missing agent is a failing pass, so the existing alarm path reaches the owner's email through the edge-watch mail the same way a dark edge does; cite the site and confirm one mail is sent per state change, not per pass).
4. A shell test `scripts/health-watch-agents.test.mjs` (in `test:node-guards`) that runs the check against a stubbed `launchctl` output for LOADED and MISSING and asserts both pass-line shapes.

## Firewall
Touch ONLY: `scripts/health-watch.sh`, the new test, `package.json` (wire), BACKLOG row. NO changes to: the plists, `fire-runner.sh`, `lane-runner-v3.sh` (the DO-NOT-RESTORE epitaphs live there), deploy scripts, anything under `src/`.

## Self-check (evidence, not vibes)
`bash scripts/health-watch.sh status` shows the three labels; one real pass line quoted with all LOADED; the stub test green both shapes; `npm run test:node-guards` green (count stated); `bash -n scripts/health-watch.sh` clean.
End: READY-FOR-GATES + the pass line, the status output, the mail-dedupe site.

## No-op / honesty guard
If `launchctl list` is unavailable to the watchdog's own launch context (it should not be), STOP and report the exact error rather than shipping a check that always passes.
