# Task lane-release-base-path: the game learns to live at agenttown.app/goldrush (LANE-B, release, commit prefix "feat:")
You are Codex (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=high
READ FIRST: vite config (base handling) + the release build mode (GR_RELEASE) · every absolute-path assumption (asset URLs, functions/api calls, the pinned telemetry/stats origins — site/assay-office.js F-tl03a-1 flagged this move!) · public/_headers.
## Why (owner 2026-07-26: "agenttown.app/goldrush — would that be ok?" — YES; this makes it true)
## Scope
1. `GR_BASE=/goldrush/` env → vite base for the release build; all asset/prefetch/loader paths base-relative (audit import.meta.glob URL builds); boot verified from a subpath preview.
2. API SPLIT LAW: the game's api calls (telemetry, stats, bug-report, redeem) target THE GAME PROJECT's absolute origin (https://gold-rush-3in.pages.dev/api/...) regardless of page origin — one config datum; CORS allowlists gain agenttown.app (+www) on every function.
3. Spec: release+base build boots from a subpath rig (serve dist under /goldrush/) — zero 404s (network capture), api calls hit the absolute origin, zero console; the plain release build (no base) stays byte-identical-behavior.
## Firewall: build config, path plumbing, CORS lines, spec. NO endpoint logic changes.
END: READY-FOR-GATES + the subpath-boot network table + exact wiring notes for the owner's Cloudflare session (two options: proxy route vs subdir deploy — recommend with reasons).
