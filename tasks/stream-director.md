# stream-director — segment 3 goes live (lane-b; commit prefix "feat:")
ROLE: pipeline tooling. WORKDIR: lane-b (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner vision verbatim in docs/marketing/STREAMING.md §THE THREE-SEGMENT CHANNEL. Build the director.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: docs/marketing/STREAMING.md (the segment spec + never-list — ABSOLUTE) · scripts/stream-watchdog.sh (obs-websocket reachability pattern) · scripts/dashboard-gen.sh (the data the stream-mode view re-presents) · the e2e spec naming convention (slice → its spec file) · playwright headed launch (the virtual display: env DISPLAY n/a on mac — headed windows land on the active space; position the window on the virtual display via window bounds if identifiable, else document the owner's one-time manual placement).

## SCOPE:
1. `scripts/stream-dashboard.html` (STREAM-MODE dashboard): a branded (brand-book palette/type), big-type, auto-refreshing view built from the dashboard data — shows: what just merged (slice name + one-liner), gates green count, lanes at work (task titles only), the day's ship list. NO file paths, NO commands, NO log excerpts. Generated/refreshed alongside dashboard-gen.
2. `scripts/stream-showcase.mjs`: given a spec path (or slice name), runs it HEADED via playwright (slowMo ~80ms for watchability, viewport 1600×900) — the "AI testing it live" window. Exits cleanly; never leaves browsers running (kill-timeout).
3. `scripts/stream-director.mjs`: the switchboard — `--showcase <slice>` does: check obs-websocket reachable+authed (config from env/.env.local, NEVER committed) → switch scene to FACTORY → run showcase → dwell 10s on the green result → switch back to AUTOPILOT. Any precondition failing = exit 0 silently (autopilot sacred). Also `--check` prints readiness (websocket? scenes exist? virtual display hint).
4. FIRE HOOK (docs edit): STREAMING.md gains the duty line — after a player-visible drain merges AND the gazette item is written, fires MAY run `node scripts/stream-director.mjs --showcase <slice>` (never blocks the drain; failures ignored).
5. Validation: node --test for the director's decision logic (mock websocket); a dry-run mode proving scene-switch calls without OBS; the showcase runs a real spec headed locally (screenshot evidence).

## Firewall
Touch ONLY: the three new scripts, the STREAMING.md duty line, node tests, artifacts/stream-director/. NO OBS config writes, NO stream keys anywhere, NO changes to sync/player/curator, NO src/.

## Self-check
node tests green · --check + dry-run outputs in the report · a headed showcase screenshot · tsc/build untouched-green.
If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the director decision table (every precondition → behavior).
