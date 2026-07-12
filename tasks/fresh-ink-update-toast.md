# fresh-ink-update-toast — stale tabs learn the news
ROLE: app-shell fix. WORKDIR: lane-b (worktrees/lane-b), after town-cast-metrology.
CODEX: model=gpt-5.6-sol effort=medium

## WHY (root cause, owner incident 2026-07-12 evening): the owner's long-lived tabs ran pre-fix bundles for hours — an old-code session DESTROYED his post-Claim run records via the superseded global-top-5 scoreboard, and separately showed already-fixed bugs (pressure gauge) as still-broken. Stale bundles make QA lie and can run retired write-paths against live data. The family shares this machine; tabs live for days.
## READ-FIRST: the deploy pipeline (scripts/deploy.sh; Pages serves hashed bundles + index) · public/_headers (cache posture) · src/main.ts boot · the suspend law (closing/refreshing keeps your place — refresh is SAFE mid-run by design; say so in the toast).
## SCOPE
1. Version stamp: embed the build id (__APP_BUILD__ exists) + emit a tiny `version.json` at deploy (build id + time).
2. The check: on boot + every N minutes + on visibilitychange (tab wakes), fetch version.json (cache-busted); if newer than the running build → warm toast, canon voice: "Fresh ink — a newer build is out. Refresh keeps your place." One tap = reload. NEVER auto-reload mid-run (respect the sim); auto-reload allowed ONLY on the start menu / town when idle >60s.
3. While a newer version is known: suppress destructive writes where cheap (scoreboard record path may no-op with a console note) — old code must not overwrite new data. (Best-effort: version-gate the scoreboard write with a build-id column? Keep simple: the toast is the cure; the write-guard only if trivial.)
4. e2e: stub version.json newer → toast appears on menu + auto-reload path fires; mid-run → toast only, no reload; same version → nothing. Both projects.
## TOUCH-ONLY: main.ts/app-shell check module, deploy.sh version.json emit, public/_headers if needed, one e2e, artifacts/.
## NO: service workers (scope creep), sim, forced reloads mid-run.
## SELF-CHECK: tsc; build; new spec + 044 + run-suspend green BOTH projects; zero console; toast screenshot.
END: READY-FOR-GATES + the toast shot.
