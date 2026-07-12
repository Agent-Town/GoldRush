# dashboard-truth-pass — the board tells what REALLY happened (owner findings 2026-07-12)
ROLE: pipeline script surgeon. WORKDIR: main slot (repo root; tracked-clean per throttle) or lane-b.
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner, verbatim): "is this the main interesting piece of information about what really happened? Could we then highlight it more? I think also the times there are wrong and I would like to know which models were used" + "The items are not in the queue of the dashboard anymore?" (drained branches still shown as WAITING TO MERGE).
## READ-FIRST: scripts/dashboard-gen.sh (whole file — the section order, the RECENTLY FINISHED duration math, the WAITING TO MERGE branch scan, the existing CODEX-header model parsing on other lines) · scripts/health-watch.sh (data sources).
## SCOPE
1. RECENTLY FINISHED becomes the TOP section (above queues), renamed "WHAT REALLY HAPPENED (last 24h)": one row per task = name · started HH:MM · REAL duration · model@effort (parse the CODEX: header from the done-move file; default label per lane default) · outcome badge (MERGED <hash> / done-moved awaiting drain / FAILED / NO-OP) — outcome via git log --grep of the task name + failed/ dir membership.
2. FIX the duration math: started = timestamp in the done-move FILENAME; finished = file mtime at done/; guard negative/zero (clock skew → show "~"), never "took 0 min" for runs with a run-log (fall back to run-log first/last line timestamps).
3. WAITING TO MERGE: for each ahead-branch, detect CONTENT-MERGED (git cherry main <branch> — all "-" = merged) → move to a "MERGED, branch retirement pending" line instead of WAITING; keeps real waiters (unmerged "+" commits) prominent.
4. Keep it bash-only (no new deps), regenerate logs/dashboard.html, screenshot-diff sanity in the report.
## TOUCH-ONLY: scripts/dashboard-gen.sh (+ scripts/health-watch.sh read-only), artifacts/dashboard-truth/.
## NO: the live runner script, STATUS/BACKLOG, tasks/ files, src/.
## SELF-CHECK: bash -n; generate twice (idempotent); the three owner complaints each visibly fixed in the output HTML (attach before/after screenshots); no section lost.
END: READY-FOR-GATES + before/after dashboard screenshots.
