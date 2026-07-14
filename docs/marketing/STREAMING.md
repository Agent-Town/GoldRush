# Gold Rush autonomous stream

## Platform: X-FIRST (owner ruling 2026-07-14), YouTube later
X ingest: X Premium account → Media Studio (studio.x.com) → **Producer** → Create broadcast (source: RTMP) → copy the RTMP server URL + stream key → OBS Settings → Stream → Service **Custom**, paste both. IMPORTANT X differences vs YouTube: (1) after OBS starts pushing, you must press **Go Live** in the Producer console (OBS alone doesn't publish); (2) a broadcast is a one-time object — if the connection drops, the broadcast ENDS and a new one (new key) must be created; the watchdog reports but never re-arms by design. THEREFORE: X = attended/event-style sessions and scheduled loop windows, announced as posts; the 24/7 unattended autopilot belongs on YouTube when we add it (indefinite streams, auto-resume). Same scenes, same loop folder, same never-list for both.

The autopilot is file playback only. It never captures a screen, desktop, terminal, editor, browser, or notification. The factory curates `assets/stream/loop-manifest.json`; `scripts/stream-sync.sh` turns that reviewed order into `~/GoldRushStream/loop/`, converts WebM and still cards to VLC-compatible H.264 MP4, caches unchanged outputs, and removes files no longer listed. Live scenes use window capture only and are attended.

## One-time OBS setup (under 15 minutes)

1. Run `bash scripts/stream-sync.sh`.
2. Create scene **AUTOPILOT**. Add a VLC Video Source whose playlist is every MP4 in `~/GoldRushStream/loop/`; enable loop and shuffle. Do not add Display Capture or Screen Capture.
3. Create scene **LIVE**. Add only explicit Window Capture sources for the game. Never add the terminal, editor, browser, Finder, password manager, or desktop.
4. Set AUTOPILOT as the startup scene. Add OBS to macOS Login Items with `--startstreaming`; OBS owns restart-on-login. This repository's watchdog reports only and never restarts OBS or a stream.
5. Enable obs-websocket on localhost (default port 4455) and authentication. Optionally install/configure `obs-cli` so `scripts/stream-watchdog.sh` can report authenticated stream status; without it the watchdog still reports the OBS process and websocket reachability.
6. Create a Focus mode for streaming: Do Not Disturb on, notification previews off, and automation that activates it whenever OBS is open.
7. Run `scripts/stream-sync.sh` and `scripts/stream-watchdog.sh` each factory fire cycle. Health history is appended to `logs/stream-health.log`.

## Before any attended live scene

- Focus/DND is active; notification banners and previews are off.
- AUTOPILOT remains file-only. LIVE contains window capture only.
- Terminal, editor, browser, Finder, password manager, messages, email, and the desktop are on the never-list.
- The selected game window contains no debug UI, secrets, private names, or unreviewed content.
- Preview the scene and audio before switching from AUTOPILOT; return to AUTOPILOT before opening any other app.

## Delegated content boundary

Owner order 2026-07-12, verbatim: "a certain folder which content is looped and new content can be added and old content removed by the software factory... just the content and playlist in the folder will be played autonomously."

Loop-folder curation is factory-autonomous only for the approved content class: finished game footage, era art cards/reels, ceremony recordings, and sonilo-audio. Never add unreviewed or experimental art, anything with readable text beyond the wordmark, or non-game content. Everything outside that class still requires per-item owner approval. Editing the manifest is the reviewable add/remove action; publishing and OBS configuration remain owner-side.
