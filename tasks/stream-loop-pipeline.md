# stream-loop-pipeline — the autonomous channel's content conveyor
ROLE: pipeline scripts. WORKDIR: lane-c (worktrees/lane-c).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner order 2026-07-12, verbatim): "a certain folder which content is looped and new content can be added and old content removed by the software factory... just the content and playlist in the folder will be played autonomously." RULED DELEGATION: loop-folder curation is factory-autonomous for the APPROVED CONTENT CLASS ONLY (finished game footage, era art cards/reels, ceremony recordings, sonilo-audio only — never unreviewed/experimental art, never anything with readable text beyond the wordmark, never non-game content). Everything else keeps per-item owner approval.
## READ-FIRST: docs/marketing/RELEASE-AND-EPOCH-PLAN.md (asset inventory + gap tiers) · assets/ (the reel, era chains, s1-s5 segments, gameplay webms) · scripts/health-watch.sh (watchdog grammar).
## SCOPE
1. assets/stream/loop-manifest.json — the versioned, reviewable playlist: ordered entries {file (repo path or capture), title, class, addedAt, approvedBy:"class-delegation-2026-07-12"}. Seed it: the ten-eras reel, era-chain segments, the best E1 gameplay webms (convert webm→mp4 h264 where needed for VLC), kit-era card slideshow (5s stills via ffmpeg).
2. scripts/stream-sync.sh — idempotent: renders/copies manifest entries into ~/GoldRushStream/loop/ (creates dir; NEVER touches anything outside it; removes loop files absent from the manifest = the factory's add/remove hand). ffmpeg conversions cached. bash -n clean; safe to run every fire cycle.
3. scripts/stream-watchdog.sh — checks OBS process + (if obs-websocket reachable) stream status; logs to logs/stream-health.log; NO auto-restart v1 (report-only — restarts are the owner's OBS setup's job via --startstreaming on login).
4. docs/marketing/STREAMING.md — the architecture (autopilot = file playback, NEVER screen capture; live scenes = window-capture only, attended), the OBS one-time setup steps (VLC source at the loop folder: loop+shuffle, scene AUTOPILOT vs LIVE, --startstreaming login item, Focus/DND automation), the pre-live checklist (notifications off, terminal/editor on the never-list, window-capture only), and the delegation ruling verbatim.
## TOUCH-ONLY: assets/stream/, scripts/stream-*.sh, docs/marketing/STREAMING.md, artifacts/stream-pipeline/. NO src/, no OBS config files (owner-side), no publishing.
## SELF-CHECK: bash -n both scripts; a dry-run sync into a scratch dir with the seeded manifest (evidence: ls + ffprobe durations); doc complete enough that the owner does OBS setup in <15 min.
END: READY-FOR-GATES + the dry-run listing.
