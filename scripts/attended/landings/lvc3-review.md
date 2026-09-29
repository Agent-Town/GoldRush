**Slice / branch / tip:** `launch-video-cut-3`, scratch worktree `wt-lvc3`, branch `feat/launch-video-cut-3` cut from the re-landed main `65f128c8a`: `5bcd44971` (the cut tooling: edl, cards, mix, assemble, contact sheet), `4aaae5bb4` (edit notes v1 + the treatment's phase-3 section, append-only), `20a8c7e03` (evidence), `ffd7d96e5` (attended: the report from the implementer's final message after the hook refused its write, F-ATT-7; the F-LVC3-1 verifier cure, one line). Opus 5.5 at max effort, 687,995 tokens, 2026-09-29 05:45Z to 07:47Z, on the owner's go ("lets do the film cut using Opus - it should not be too long").

**What it does.** Phase 3 of the launch film: the cut. From the 23 phase-2 takes and the plates, with nothing generated or bought, `scripts/launch-video/cut/assemble.mjs` builds five exports outside the repository under `~/.goldrush/launch-video/cut/`: the master (1920x1200, the takes' own frame size, 94.000 s), a 16:9 1080p, a 9:16 vertical, a web export with poster for the landing page (18.5 MB, faststart, under Cloudflare Pages' file limit) and a 30-second teaser. The slips and cards are the treatment's words in Rye and Wellfleet rendered as PNG overlays by headless Chromium (this Mac's ffmpeg has no drawtext); the Pan Theme carries the film end to end with the E1 loop extending it; the mix is normalized to -14 LUFS. The edit notes disclose every STAGED take and the capture pilot exactly as the owner ruled (F-LVC2-1/2), and the end card keeps its second line (F-LVC2-3). 94 seconds was the ceiling ("not too long"); every movement boundary lands on the treatment's timecode.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Master `gold-rush-launch-film-1920x1200-v1.mp4` | 94.000 s, 156,701,247 B, H.264 High, 60 fps, AAC 48 kHz (ffprobe, re-run attended) |
| 1920x1080 / vertical 1080x1920 | 94.000 s each; 147,624,862 B / 124,373,170 B |
| Web export + poster (for the landing) | 94.016 s (16 ms audio padding), 18,538,642 B at 1,577 kb/s; poster 253,221 B (re-run attended: both under the embed task's limits of 20,000,000 and 300,000 B) |
| Teaser 30 s 1920x1080 | 30.000 s, 29,946,455 B |
| Loudness | films -14.0 LUFS integrated, -2.2 dBTP true peak; teaser -13.8 LUFS, -1.9 dBTP; every export opens and closes on true black |
| Reproducibility | `assemble.mjs --check` exit 0, the committed cut list reproduced byte for byte; a no-change rebuild leaves every export byte-identical; the 2.4 GB build cache stays in `cut/work` |
| Fallbacks (per the treatment, disclosed in the edit notes) | B1 vertical reframed (hurt vignette in the phone take); B7 no brass flash (no turret raised in any take); B8 the Baron's standard and men (no clear frame of the Baron); B10 fixture board kept out, no "THIS IS THE RIDE." print; vertical reframes and fitted panels; the held breath is river and drone only |
| tsc / build | exit 0 / exit 0 (nothing under `src/`) |
| Phase-2 verifier `verify-capture-list.mjs` | red after the cut (its six mismatches were exactly the six exports in `cut/`, the phase-2 folder for cut takes), green again after the one-line cure (rc 0, re-run attended) |
| Evidence budget | 0.8 MB added, inside the 25 MB task budget and the 40 MB ceiling; no video in git |
| Merge | `git merge-tree` clean against main (0 conflicts); `hash: unchanged` |
| First landing battery (07:52Z to 08:11Z) | 1,047 Node tests, 1,041 pass, 1 fail: `is-main.test.mjs` test 9 (the argv[1] census) named `cut/assemble.mjs:465` and `cut/mix.mjs:59`, which compared `process.argv[1]` by hand instead of asking the shared `isMain()` helper (the symlink-safe idiom the guard exists to enforce). Fixed attended on the branch (two imports, two calls); the guard 12/12 on the worktree; `assemble.mjs --check` still exit 0; the second landing battery is the verdict |

**Merge classification.** Base: main at the chain cut. New: `scripts/launch-video/cut/**`, `docs/marketing/launch-video/edit-notes-v1.md`, `artifacts/launch-video-cut-3/**`. Touched: `docs/marketing/launch-video/treatment.md` (38 lines appended, none removed), `scripts/launch-video/verify-capture-list.mjs` (one filter line plus a comment). No `src/**`, `e2e/**`, `site/**`, `assets/**`.

**Findings.**
- **F-LVC3-8 (fixed on the branch before landing):** the two cut scripts hand-rolled the entry-point check the is-main guard forbids; cured with the shared helper. Authoring note: an Opus master that adds `scripts/**/*.mjs` tools should name `isMain` from `scripts/is-main.mjs` in its self-check.
- **F-LVC3-1 (cured here):** the verifier read the phase-3 exports as unlisted cut takes; it now skips `gold-rush-launch-film-*` names.
- **F-LVC3-2 (owner/attended):** the Baron's taunt card is on screen only 1.3 to 1.5 s where phase 2 expected 3.8 s; the cut works around it (a 1.4 s shot). A game-side lengthening is a design question, not for this landing.
- **F-LVC3-3 (recorded):** the hurt vignette appears in many takes; the cut avoids it where it can.
- **F-LVC3-4 (owner):** the brand book says masters go to `marketing/reel/`; this task keeps every video out of the repository (156 MB master; GitHub's limit and F-2742-1). Recommendation: the private assets store or a Cloudflare R2 bucket when the owner wants them archived; disk-local until then.
- **F-LVC3-5/6/7 (recorded):** Google Fonts build hashes differ from the ten-eras reel's fonts; the teaser's hook is silent after the pan tap; the implementer took the drain lock for server-less Chromium runs.
- **The owner's word decides v1 or v2.** He watches the master from `~/.goldrush/launch-video/cut/`; notes become one `edl.mjs` edit and one `assemble.mjs --all`.
