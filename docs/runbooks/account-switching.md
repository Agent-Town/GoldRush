# RUNBOOK — Switching the three subscription meters (owner copy, 2026-07-09)
The factory runs on three separate meters by design. Each switches independently; nothing else changes.

## A. THE FIRES' ACCOUNT (Opus 4.8 — config dir ~/.claude-fires)
1. Open **Terminal.app** (a real terminal — the `!` prefix inside a session won't work for logins).
2. Run: `CLAUDE_CONFIG_DIR=~/.claude-fires claude`
3. Inside: type `/login` → complete the browser flow with the NEW Opus-capacity account → accept the workspace trust dialog if it appears → quit (`/exit` or Ctrl+C).
4. DONE. The launchd job already points at that directory — the next fire (≤5 min) uses the new account automatically. No plist edits, no reloads.
5. Verify (optional): within ~10 min, `git log --oneline -1` in the repo shows a fresh `sNNN:` fire commit.
6. Safety net: the first fire after any gap runs the POST-WALL RECOVERY LAW automatically (sweeps failed tasks, re-queues vanished work).

## B. THE ATTENDED ACCOUNT (Fable 5 — this session)
1. In the LIVE Claude Code session, type `/login` → pick the new subscription. **The session and its context survive the swap** — auth changes, the conversation doesn't.
2. If the session ended instead: just start a new one in the repo. CLAUDE.md + the ledgers + lore/ + memory ARE the context; the next session reads them at start (that's the whole design).

## C. THE CODEX ACCOUNT (the runner's implementer)
1. Switch accounts in the Codex app/CLI as usual (`codex` login flow).
2. Tell the attended session "codex switched" — it probes (`codex exec "reply exactly: OK"`) and runs the casualty sweep (rc1s from the gap get re-queued).
3. If unattended: the fires' CODEX-WALL protocol probes and auto-resumes on its own.

## THE ONE RULE ACROSS ALL THREE
A meter dying mid-task costs at most one re-queue — never lost work — IF the recovery sweeps run. Attended: say "switched" and it's handled. Unattended: the fires' laws handle it. Anything that still looks lost: file-probe against main before believing any ledger line (Mistake #16).


## D. TRI-ACCOUNT AUTO-ROUTING (owner request 2026-07-10: three logins, orchestrator juggles)
ONE LOGIN PER CONFIG DIR — a session cannot hot-swap tokens, but the SYSTEM routes work classes to accounts:

| Config dir | Account | Carries | Who dispatches |
|---|---|---|---|
| ~/.claude (default) | Max/Fable (interactive) | the attended session + its Workflow swarms | Robin opens it |
| ~/.claude-fires | Opus sub | the 5-min fires (launchd) | already wired, untouched |
| ~/.claude-batch | third sub | heavy HEADLESS batch jobs (reviews, authoring sweeps, audits) | the attended session, via: CLAUDE_CONFIG_DIR=/Users/robin/.claude-batch claude -p '<job prompt>' |

OWNER ONE-TIME (per new account, ~1 min each): in a terminal, run
  CLAUDE_CONFIG_DIR=/Users/robin/.claude-batch claude login
and complete the browser OAuth for the subscription that dir should carry. (Logins are ALWAYS the owner's hands — agents never enter credentials.)

ROUTING LAWS for the orchestrator:
1. A single Workflow swarm bills ONE account (its session's) — partition BY JOB, never mid-job.
2. Interactive judgment + design + drains = the attended account. Cadence bookkeeping = fires. Embarrassingly-batchable analysis/authoring = batch account via claude -p.
3. Before dispatching to an account, probe its meter mood: a refusal/limit error on dispatch = route the job elsewhere and note the wall (fire.md wall protocol applies).
4. The session-5h and weekly meters are visible only in the app UI — when the owner posts a screenshot, record burn-relevant rulings here.
