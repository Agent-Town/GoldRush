# launch-video-cut-3 — report (Opus 5.5 implementer at max effort, 2026-09-29; committed by the attended session from the implementer's final message: the report-writing hook refused the subagent's write, F-ATT-7)

READY-FOR-GATES. The film is cut: 94.000 s, five exports, all from the phase-2 takes and the plates; nothing generated or bought; the only network use was the two Google Fonts faces (Rye, Wellfleet).

**Master to double-click:** `~/.goldrush/launch-video/cut/gold-rush-launch-film-1920x1200-v1.mp4`

| Export (all under `~/.goldrush/launch-video/cut/`) | Duration | Size | Notes |
|---|---:|---:|---|
| `gold-rush-launch-film-1920x1200-v1.mp4` (master) | 94.000 s | 156,701,247 B | H.264 High, 60 fps, AAC 48 kHz; the takes' own frame size, nothing upscaled |
| `gold-rush-launch-film-1920x1080-v1.mp4` | 94.000 s | 147,624,862 B | 16:9 for platforms |
| `gold-rush-launch-film-vertical-1080x1920-v1.mp4` | 94.000 s | 124,373,170 B | 9:16 |
| `gold-rush-launch-film-web-1280x800-v1.mp4` + `-poster.jpg` | 94.016 s | 18,538,642 B + 253,221 B | for the landing page; 1,577 kb/s, faststart; the 16 ms is audio padding |
| `gold-rush-launch-film-teaser-30s-1920x1080-v1.mp4` | 30.000 s | 29,946,455 B | B1 hook, B3 title, a Claim beat, the Baron's arrival, the end card |

**Loudness:** the four film exports -14.0 LUFS integrated, true peak -2.2 dBTP; the teaser -13.8 LUFS, -1.9 dBTP. Every export opens and closes on true black; no frame near white.

**Beats that took the treatment's fallback:** B1 vertical is a reframe of the desktop take (the phone take pulses with the hurt vignette during the relight); B7 has no brass flash (no turret was raised in any Night Shift take); B8's arrival is the Baron's standard and his men at the ford (no clear frame of the Baron himself exists); B10 keeps the fixture board out and the Lantern Show prints no "THIS IS THE RIDE." (its control bar is cropped); the vertical uses reframes or fitted panels for the Baron, the Herald, the Field Book, the invitation and the Lantern Show; the held breath is river and drone only (no heartbeat, lantern hiss or footstep exists in the game, none generated).

**Adapted:** B1's cards sit above the lantern pool; B3's card lift is a dissolve; B5 is one shot with all four FREED labels; B8's taunt shot is 1.4 s (every taunt card is on screen 1.3 to 1.5 s); B9 runs 8.47 s; the theme's full band starts at 1:10. Every movement boundary lands on the treatment's timecode.

**Checks:** pre-flight clean (`main..HEAD` empty, build exit 0); after the work `npx tsc --noEmit` exit 0, `npm run build` exit 0; `node scripts/launch-video/cut/assemble.mjs --check` exit 0 and reproduces the committed cut list byte for byte; a rebuild with no changes leaves every export byte-identical; evidence 824 KB, no file over 5 MB. Red, attributed: `scripts/launch-video/verify-capture-list.mjs` was green before the work and red after, its six mismatches being exactly the six exports placed in `cut/` (F-LVC3-1; cured in the landing by skipping `gold-rush-launch-film-*` names, since that folder was the phase-2 convention for cut takes).

**Findings:** F-LVC3-1 (verifier vs the exports; cured in the landing) · F-LVC3-2 the Baron's taunt card is on screen only 1.3 to 1.5 s (phase 2 expected 3.8 s) · F-LVC3-3 the hurt vignette appears in many takes · F-LVC3-4 the brand book says masters go to `marketing/reel/`, this task keeps video out of the repo · F-LVC3-5 the Google Fonts builds differ by hash from the ten-eras reel's fonts · F-LVC3-6 the teaser's hook is silent after the pan tap · F-LVC3-7 the drain lock was taken for Chromium runs that used no server.

**Process:** only the implementer's own build processes were stopped, by pid; a bug where the teaser overwrote a film intermediate was found and fixed and the exports re-checked; the 2.4 GB build cache stays in `cut/work` so a v2 is fast (one edit to `edl.mjs`, one `assemble.mjs --all`).

**Remaining, in order:** the owner's notes on v1 → v2; the landing-page embed of the web export (follow-up task, drafted); F-LVC3-2 and F-LVC3-4 for the owner.
