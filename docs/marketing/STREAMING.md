# Gold Rush autonomous stream

## Platform: X-FIRST (owner ruling 2026-07-14), YouTube later
X ingest: X Premium account → Media Studio (studio.x.com) → **Producer** → Create broadcast (source: RTMP) → copy the RTMP server URL + stream key → OBS Settings → Stream → Service **Custom**, paste both. IMPORTANT X differences vs YouTube: (1) after OBS starts pushing, you must press **Go Live** in the Producer console (OBS alone doesn't publish); (2) a broadcast is a one-time object — if the connection drops, the broadcast ENDS and a new one (new key) must be created; the watchdog reports but never re-arms by design. THEREFORE: X = attended/event-style sessions and scheduled loop windows, announced as posts; the 24/7 unattended autopilot belongs on YouTube when we add it (indefinite streams, auto-resume). Same scenes, same loop folder, same never-list for both.

The autopilot is file playback only. It never captures a screen, desktop, terminal, editor, browser, or notification. The factory curates `assets/stream/loop-manifest.json`; `scripts/stream-sync.sh` turns that reviewed order into `~/GoldRushStream/loop/`, converts WebM and still cards to VLC-compatible H.264 MP4, caches unchanged outputs, and removes files no longer listed. Live scenes use window capture only and are attended.

## One-time OBS setup (under 15 minutes)

1. Run `bash scripts/stream-sync.sh`.
2. Create scene **AUTOPILOT**. Add a **Browser source** → check **Local file** → pick `~/GoldRushStream/player.html` → size 1920×1080 → enable "Control audio via OBS". The player reads `loop/loop.json`, plays the program in order with crossfades, and RE-READS THE PLAYLIST BETWEEN CLIPS — the factory can reprogram the channel while the stream runs (edit manifest → sync → the player picks it up at the next clip boundary; no re-encode, no OBS touch). Never add Display/Screen Capture. (VLC source works too if libvlc loads on your install, but the player is the canonical path.)
3. Create scene **LIVE**. Add only explicit Window Capture sources for the game. Never add the terminal, editor, browser, Finder, password manager, or desktop.
4. Set AUTOPILOT as the startup scene. Add OBS to macOS Login Items with `--startstreaming`; OBS owns restart-on-login. This repository's watchdog reports only and never restarts OBS or a stream.
5. Enable obs-websocket on localhost (default port 4455) and authentication. Optionally install/configure `obs-cli` so `scripts/stream-watchdog.sh` can report authenticated stream status; without it the watchdog still reports the OBS process and websocket reachability.
6. Create a Focus mode for streaming: Do Not Disturb on, notification previews off, and automation that activates it whenever OBS is open.
7. Run `scripts/stream-sync.sh` and `scripts/stream-watchdog.sh` each factory fire cycle. Health history is appended to `logs/stream-health.log`.

## Parallel-work setup (owner machine, 2026-07-14)
- AUTOPILOT needs nothing: Media Source file playback inside OBS — no screen interaction; OBS runs minimized while normal work continues.
- LIVE gameplay while working: the game window goes FULLSCREEN ON A VIRTUAL DISPLAY (DeskPad/BetterDisplay or a dummy-HDMI plug) — browsers throttle occluded/background-Space windows, which freezes a captured stream; a virtual display keeps the canvas rendering while the owner works on the physical screen. LIVE scene window-captures that window only (never-list unchanged).
- OBS encoder: Apple VT hardware (Settings → Output) — near-zero CPU next to the factory lanes and Blender sessions.

## Before any attended live scene

- Focus/DND is active; notification banners and previews are off.
- AUTOPILOT remains file-only. LIVE contains window capture only.
- Terminal, editor, browser, Finder, password manager, messages, email, and the desktop are on the never-list.
- The selected game window contains no debug UI, secrets, private names, or unreviewed content.
- Preview the scene and audio before switching from AUTOPILOT; return to AUTOPILOT before opening any other app.

## Delegated content boundary

Owner order 2026-07-12, verbatim: "a certain folder which content is looped and new content can be added and old content removed by the software factory... just the content and playlist in the folder will be played autonomously."

Loop-folder curation is factory-autonomous only for the approved content class: finished game footage, era art cards/reels, ceremony recordings, and sonilo-audio. Never add unreviewed or experimental art, anything with readable text beyond the wordmark, or non-game content. Everything outside that class still requires per-item owner approval. Editing the manifest is the reviewable add/remove action; publishing and OBS configuration remain owner-side.

## THE THREE-SEGMENT CHANNEL (owner vision, 2026-07-14 — verbatim: "one segment could be the trailer, preview of art and mechanics, another segment game play of the current version, and a last segment the software factory... It would be somehow impressive if the factory would be switched in when it really completes something new and then the world could see it being tested by the AI in realtime.")

SEGMENT 1 — THE SHOWCASE (trailers, art previews, mechanics reels): the playlist classes era-art-reel/era-art-card/ceremony — already curated.
SEGMENT 2 — GAMEPLAY (current build): the finished-game-footage class — owner recordings + future headed captures.
SEGMENT 3 — THE FACTORY (live, event-driven): when a drain MERGES something player-visible, the stream switches to the factory scene and the world watches the new slice get tested in realtime.

### Segment-3 mechanics (the director)
- **Trigger**: the fires' existing post-drain moment (the same beat that writes the gazette item).
- **The scene**: OBS scene FACTORY = window-capture of (a) the stream-mode dashboard (a branded, big-type view of logs/dashboard.html) and (b) THE SHOWCASE WINDOW — a HEADED browser on the virtual display replaying the merged slice's own e2e spec (or its owner-shot scenario): the AI literally testing the new thing, live and unrehearsed.
- **The switchboard**: obs-websocket (localhost, authenticated). The director switches AUTOPILOT → FACTORY, runs the showcase, switches back. If OBS is off / websocket unreachable / no virtual display: the director does NOTHING (autopilot never interrupted by a failed stunt).
- **NEVER-LIST UNCHANGED AND ABSOLUTE**: the factory scene may contain ONLY the dashboard window and the game window. Terminal, editor, code, logs-with-paths, browser chrome: never. The stream-mode dashboard shows slice names, gates, and progress — no file paths, no keys, no command lines.
