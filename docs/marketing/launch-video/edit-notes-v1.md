# Edit notes, v1: "What is a claim?", the launch film's cut (2026-09-29)

**Status.** v1, for the owner's notes. Task `launch-video-cut-3`, the film's phase 3. The treatment (`docs/marketing/launch-video/treatment.md`) is the script, the phase-2 takes are the footage, and the cut adds no copy, no shot and no sound the treatment does not name. Owner, 2026-09-29, verbatim: "lets do the film cut using Opus - it should not be too long". The treatment's 94 seconds is the ceiling; the cut runs exactly 94.000 s (5,640 frames at 60 fps).

**Where to watch.** Outside the repository, in `~/.goldrush/launch-video/cut/`:

| File | What it is |
|---|---|
| `gold-rush-launch-film-1920x1200-v1.mp4` | The master, in the takes' own 1920x1200 at 60 fps, nothing upscaled |
| `gold-rush-launch-film-1920x1080-v1.mp4` | The same cut in 16:9 for platforms |
| `gold-rush-launch-film-vertical-1080x1920-v1.mp4` | The 9:16 cut |
| `gold-rush-launch-film-web-1280x800-v1.mp4` and `…-poster.jpg` | For the landing page (owner: "we then need the film also to add it there"); the embed itself is a follow-up task |
| `gold-rush-launch-film-teaser-30s-1920x1080-v1.mp4` | The 30-second teaser |

**How it is made, and how a v2 is made.** `scripts/launch-video/cut/edl.mjs` holds every shot, in-point, crop, card and cue. `cards.mjs` renders the type, `mix.mjs` the soundtrack and `assemble.mjs` everything else. A v2 after the owner's notes is one edit to `edl.mjs`, then one run: `node scripts/launch-video/cut/cards.mjs` (only when a word or a slip changed), then `node scripts/launch-video/cut/assemble.mjs --all`. `assemble.mjs --check` prints the cut list without building anything and fails if a take, an in-point or a plate is missing or if the HUD toggles inside a shot. The generated cut list is `artifacts/launch-video-cut-3/cut-list.md`, and the numbers are in the same folder.

## Honesty: what the viewer sees, and what was staged

- **Real footage, played by the capture pilot (F-LVC2-2; owner 2026-09-26: "real footage").** Every frame of gameplay in the film is real play at real speed (1x), on the plain seed, on the current engine (era 6), recorded in phase 2 on 2026-09-26. No hand held the controls. Every take was played by a capture script, the capture pilot (`scripts/launch-video/lib/pilot.mjs`), through the page's own keyboard and mouse. It reads what a player sees and never writes game state. Nothing in the film is sped up, slowed down or reversed.
- **STAGED frames appear, each disclosed (F-LVC2-1; owner 2026-09-26: "yes, they can appear").** Five shots, of three kinds, rest on a staged setup:
  - The Baron, three shots: his entry in B6 (0:38.38 to 0:41.00), his taunt in B8 (0:51.60 to 0:53.00) and his arrival in B8 (0:53.00 to 0:56.00). His map was opened for the capture on a copy of the capture profile's ledger, with one secured Twin Banks score added, the only thing the unlock reads. The ride itself is real play at 1x.
  - The Herald's issue No. 5 in B8 (0:56.00 to 1:00.00): a seeded profile from the gazette e2e (`e2e/gazette-living.spec.ts`), because no profile has turned the Baron back on this engine.
  - The Ride Together invitation in B10 (1:12.37 to 1:14.87): the claim word BRASS-PAN is the e2e fixture code (`e2e/mp-07c-3-invitation.spec.ts`), served locally, because the relay is a live service.
  - Not in the film: the Field Book's fixture board. Made-up standings under the county's heading would read as real ones, so B10 shows the real Front Desk instead.
- **Drawn plates are pages of the book.** B2, the first shot of B8, B11 and B12 are the storybook's plates from the art store, shown inside a parchment page border so a viewer can always tell drawing from play. Gameplay runs full-bleed, with a small "in game" mark in the lower right for its first second after a drawing (0:01, 0:14.5, 0:51.6).
- **The end card keeps its second line (F-LVC2-3; owner 2026-09-26: "keep the second line").** Top to bottom: "Go on. It's your claim now." · the emblem · GOLD RUSH · an Agent Town tale · The Frontier Edition · "Play in your browser: agenttown.app/goldrush" · "Bring your agent: agenttown.app/goldrush/skill.md". No price, no date, no token.
- **Boards unnamed, printed slips, no Baron ride (F-VIBE-Q; owner 2026-09-26: "C6 - lets keep it as it is, 7 - slips is good, 8 - unnamed").** No rider's model or harness name appears. No voice was recorded or generated. The film cuts on the Baron's arrival, and the Herald prints the ending.
- **Nothing was generated or bought (owner 2026-09-19: "do not buy").** No image, video, voice or music generation. The only network use of the whole cut was fetching the two Google Fonts faces.

## Every take used

Labels are read from each take's own sidecar at build time. Take times are seconds of the take's own clip.

| Take (in `~/.goldrush/launch-video/`) | Label | Beats and shapes | In to out |
|---|---|---|---|
| `B1-B6-B7-e1-night-shift-1280x800-t1.mp4` | real | B6 Night Shift; B7 dark (landscape shapes) | 199.20 to 200.37; 322.80 to 325.80 |
| `B1-B6-B7-e1-night-shift-1280x800-t2.mp4` | real | B1 (all shapes; the vertical reframes it); B7 golden and dusk (landscape shapes) | 310.90 to 314.90; 199.60 to 202.60; 247.20 to 250.20 |
| `B1-B6-B7-e1-night-shift-390x844-t1.mp4` | real | vertical: B6 Night Shift, B7 golden, dusk and dark | 198.90 to 200.07; 201.00 to 204.00; 247.40 to 250.40; 322.80 to 325.80 |
| `B3-menu-1280x800-t1.mp4` | real | B3 the live menu (landscape shapes) | 3.95 to 6.05 |
| `B3-menu-390x844-t1.mp4` | real | vertical: B3 | 3.90 to 6.00 |
| `B4-B5-B9-the-claim-1280x800-t1.mp4` | real | B5 (landscape shapes) | 19.40 to 28.32 |
| `B4-B5-B9-the-claim-1280x800-t2.mp4` | real | B4 pan, sluice, beacon; B9 (landscape shapes) | 19.20 to 22.02; 72.60 to 75.42; 265.90 to 268.23; 78.68 to 87.15 |
| `B4-B5-B9-the-claim-390x844-t2.mp4` | real | vertical: B5 | 18.60 to 27.52 |
| `B4-B5-B9-the-claim-390x844-t3.mp4` | real | vertical: B4 pan, sluice, beacon; B9 | 19.90 to 22.72; 73.95 to 76.77; 265.30 to 267.63; 79.33 to 83.33 then 85.55 to 90.02 |
| `B6-e1-dry-gulch-1280x800-t1.mp4` | real | B6 (landscape shapes) | 10.80 to 11.97 |
| `B6-e1-dry-gulch-390x844-t1.mp4` | real | vertical: B6 | 10.10 to 11.27 |
| `B6-e1-twin-banks-1280x800-t1.mp4` | real | B6 (landscape shapes) | 17.40 to 18.57 |
| `B6-e1-twin-banks-390x844-t1.mp4` | real | vertical: B6 | 16.70 to 17.87 |
| `B6-B8-e1-baron-1280x800-t2.mp4` | STAGED (the unlock; the play is real at 1x) | B8 the taunt (all shapes) | 319.70 to 321.10 |
| `B6-B8-e1-baron-1280x800-t3.mp4` | STAGED (the unlock; the play is real at 1x) | B6 the entry; B8 the arrival (all shapes) | 9.00 to 11.62; 532.85 to 535.85 |
| `B8-herald-1280x800-t1.mp4` | STAGED (a seeded profile) | B8 the Herald (all shapes) | 10.60 to 14.60 |
| `B10-field-book-front-desk-1280x800-t1.mp4` | real | B10 the Front Desk (all shapes) | 1.00 to 4.90 |
| `B10-ride-together-invitation-1280x800-t1.mp4` | STAGED (the fixture claim word) | B10 the invitation (all shapes) | 6.47 to 8.97 |
| `B10-lantern-show-1280x800-t1.mp4` | real | B10 the Lantern Show (all shapes) | 15.50 to 20.63 |

"Landscape shapes" means the master and the 1920x1080 copy, which share every in-point. Four kept takes are not used: `B4-B5-B9-the-claim-390x844-t1` (no Prospector order, and its HUD-off stretch shows the touch controls), `B6-B8-e1-baron-1280x800-t1` (Wren fell at wave 17; t2 and t3 carry the same moments), `B10-field-book-fixture-1280x800-t1` (the STAGED fixture board, kept out as above) and `B10-ride-together-card-1280x800-t1` (the unopened card; the treatment's visual is the invitation).

## Plates and other sources

| Source | Where |
|---|---|
| `store:kit-valley-master.png` | B2 the valley (the 2.5D parallax); B3 the menu's backdrop for the match; B12 the end card's ground, darkened to ledger-ink |
| `store:mkt-hero-16x9-f.png` | B2 the pair |
| `store:plate-contract-baron.png` | B8 the shadow and the banner |
| `store:kit-era-1.png` to `kit-era-10.png` | B11 |
| `store:plate-arsenal-e1.png` | B12 the pan |
| `store:codex-prospector-e1.png` | B9 the badge on the Prospector's slip |
| `assets/processed-full/ui-title-emblem.png` | B3 the lockup; B12 the end card |

`store:` is `/Users/robin/Claude/Projects/GoldRush-assets/raw/`. Nothing in `assets/**` was changed.

## Fallbacks and adaptations, beat by beat

- **B1, the hook.** Night Shift t2 from 310.90 s: one second of black, then the post relit at 311.6 s (film 0:01.7) and the walkers coming up the lane to the pool. t2, because it is the only desktop window free of the hurt vignette from the dark post through the relight to the rim (310.85 to 315.6 s, measured); t1 pulses throughout its relight. The night grade lifts the blacks to ledger-ink. Adapted: the two Rye cards sit above the pool, not low centre, because in the real frame the walkers enter from the bottom and low cards would hide their arrival. Vertical: the fallback, a reframe of this same window, because the 390x844 take's relight pulses with the hurt vignette at 311.8, 312.65 and 313.6 s.
- **B2, the world.** The valley plate with a hand-cut 2.5D parallax: the near scrub and rocks are cut along a line traced by eye (`VALLEY_NEAR_LINE` in `edl.mjs`), the valley pushes 1.000 to 1.035 and the near layer 1.00 to 1.06 over 5.25 s. Where the layers part, the far layer shows the bank's own pixels cloned 18 px down; nothing is painted or generated. A 0.5 s dissolve to the pair drifting across at 1.05x, then a 0.4 s dissolve into the valley at the menu's framing, which is the match for B3. The Tavernkeeper's line is printed in full across the two plates, the first slip typed in two beats.
- **B3, the title.** The match-dissolve: B2 ends on the valley drawn at the live menu's own framing, with the game's own CSS (`src/styles.css:61-86`). The menu's backdrop is that very picture: `assets/processed/kit-era-1.png` against `store:kit-valley-master.png` measures PSNR 40.8 dB at 418x235. The live menu (real) dissolves in over it in 0.5 s, and "Wren" is typed. Adapted: the take has no "card lifts away" motion (the game cuts from the typed card to a loading frame at 6.05 s), so the lift is a 0.35 s dissolve of the live menu back to its own backdrop, and the composited lockup (the emblem, GOLD RUSH in Rye, "an Agent Town tale" in Wellfleet italic, as in the ten-eras reel) lands at 0:16.10. The "ledger local only" chip stays in frame.
- **B4, stake the claim.** Claim t2: the pan, the sluice going down by the water, the beacon. Adapted: the beacon is the run's second one (wave 8, 266.48 s), because the first (77.92 s) sits 0.7 s before the HUD returns for the Prospector's order. The HUD's opening banner is not a shot of its own (the card's three shots are the pan, the sluice and the beacon), and "STAKE THE CLAIM." echoes it. At the game's 0.7 camera floor the sluice and the beacon read at game scale (gap 1). t2, so that B5 can take t1.
- **B5, the cure.** Claim t1, one continuous shot from 19.40 s: the approach, the Spark Rig's arc and the turn for home, with all four FREED labels at the ford (20.9, 24.5, 25.9 and 27.3 s) and a 5 percent push from its third second. Adapted (gap 12): the labels come from waves 0 and 1, because FREED floats over a run's first four freed walkers only; the card planned waves 3 to 8.
- **B6, five contracts.** The Dry Gulch, Twin Banks and Night Shift at golden (all real), then the Baron's entry (STAGED), which carries the Rye card over its last 1.4 s. The fifth contract is the Claim, already on screen in B4 and B5. The optional Dry Gulch rule slip is not used.
- **B7, night.** Golden and dusk from Night Shift t2, the dark from t1 at 322.80 s (0.05 s after a hurt vignette fades out, measured). Fallback: no turret was raised in any Night Shift take (phase 2, "as shot", item 8), so the card's "turrets flash brass" is not on film. The dark shot holds the pool, her warm light and the Prospector's teal one together, with the Fevered at the rim.
- **B8, the Baron.** The plate with the Baron's line; the taunt card; the arrival; the Herald. Adapted: every taunt card in the three Baron takes is up only 1.3 to 1.5 s before the next wave's callout replaces it (all seven taunts measured), so the taunt shot is 1.40 s, inside the card, and the plate takes the spare 0.1 s. The wave-12 taunt (the same words as wave 5) is used because its framing matches the arrival's, while the wave-5 frames carry a build prompt or sit on the far bank. The arrival starts at 532.85 s, after the Assay Clerk card clears (532.6 s) and after a hit tints the frame (532.4 to 532.8 s, measured). It shows his oxblood standard coming down to the ford and his men crossing, and the film cuts on it. The treatment's "the man himself, four times a man's height" is not on film: the take holds no clear frame of him before it ends, as phase 2 recorded. The Herald is realised as a tilt down the page at 1.35x, from the headline THE BARON IS TURNED BACK to its first line, "Dragged off by his own men, swearing revenge."
- **B9, her deputy.** Claim t2 with the HUD on: the pair, G opening the charter (its trust ladder on the right third), the order to the seam and the trip. The teal-riveted slip carries the portrait badge and the three job titles, then "CLAIM WINS GROW IT." and "I will keep the claim books steady." Adapted: the pair is established in the world, not by the pair plate again, following the card's own motion, "In the world only". t2 rather than t1, because t1 is the profile's first run (the Prospector at L0) and its order window is crossed by two Assay Clerk cards. The beat is 8.47 s: the take's HUD-on window closes at 87.17 s. Vertical: in the 390x844 take the charter is a full-screen sheet (up from 82.70 to 85.50 s, measured), and the clean HUD-on time either side of it is 469 frames of the 508 needed. So the vertical shows the charter opening for 0.63 s, then cuts to the order (86.37 s) and the trip.
- **B10, the same door.** The Field Book's real Front Desk, the STAGED Ride Together invitation (a pan across at 1.8x from the claim word to "Share this claim"), and the Lantern Show replaying Wren's own kept Claim from the shelf. Adapted: the Field Book take is a blank loading page before 0.9 s and a stretched element capture after 5.8 s, and the invitation is fully open only from 6.4 s of its 9.0 s take, so the three run 3.90, 2.50 and 5.13 s. The shelf's show does not print "THIS IS THE RIDE." (gap 15). Its control bar, with the page's local address, is cropped (F-LVC2-7). The invitation is framed below the dev-only "Open every claim" button (F-LVC2-6) and above its shell command.
- **B11, the road.** As the card: kit-era-1 to kit-era-10, each 0.92 or 0.93 s with 0.25 s dissolves, under one continuous 8 percent push shared by all ten.
- **B12, the close.** As the card: a slow push onto the pan (1.00 to 1.25 over 3 s) under "The gold rush was never about the gold." in Wellfleet italic, then the end card, held 4 s and fading to black over the last 0.5 s.

## Deviations from the treatment's timecodes

| Beat | Treatment | The cut | Why |
|---|---|---|---|
| B2 | valley 5 s, pair 4 s | valley 0:05.00 to 0:10.25, pair 0:09.75 to 0:13.90, match 0:13.50 to 0:14.00 (dissolves overlap) | the dissolves, and the match into B3 inside B2's last half second |
| B4 | 0:18 to 0:26; pan 3 s, sluice 3 s, beacon 2 s | 0:18.00 to 0:25.97; 2.82, 2.82, 2.33 s | cut on the E1 loop's beat grid |
| B5 | 0:26 to 0:35; approach 3 s, arc 2 s, turn 4 s | 0:25.97 to 0:34.88, one shot | the four FREED labels come inside one continuous 8.92 s |
| B6 | 0:35 to 0:41; 1.2 s x 4, then the card 1.2 s | 0:34.88 to 0:41.00; 1.17 s x 3, then the Baron 2.62 s carrying the card | the card rides the last shot rather than a black gap |
| B8 | plate 1.5 s, taunt 1.5 s | plate 1.6 s, taunt 1.4 s | the taunt card is up only 1.3 to 1.5 s in every take |
| B9 | 1:00 to 1:09 | 1:00.00 to 1:08.47 | the take's HUD-on window closes at 87.17 s |
| B10 | 1:09 to 1:20; 3.5 s, 3 s, 4.5 s | 1:08.47 to 1:20.00; 3.90, 2.50, 5.13 s | the takes' clean stretches (above) |
| B1, B3, B7, B11, B12 | as the treatment | as the treatment | |

Every other beat boundary sits on the treatment's timecode: 0:05, 0:14, 0:18, 0:41, 0:50, 1:00, 1:20, 1:27 and the end at 1:34.

## Sound

- **Sources**, all in `assets/audio/raw/`, none new: the Pan Theme `title-theme.mp3` (59.98 s), the E1 frontier loop `era-e1-frontier-loop.mp3` (89.98 s), `river-ambience-loop.mp3`, `desert-dusk-loop.mp3`, `baron-arrival-sting.mp3`, `baron-defeat-fanfare.mp3`, `agent-works.mp3` and `ledger-open.mp3`. No stock music, no generated audio, no voice.
- **The cue sheet as mixed** (the treatment's, to the frame): silence; the pan tap at 0:01 (the Pan Theme's own first sound); held breath 0:02 to 0:05; the Pan Theme from its top at 0:05; the E1 loop takes over at 0:18 from its phrase downbeat 15.444 s, the drive after its intro; the band drops out into held breath at 0:41; the arrival sting on the plate's banner at 0:50; the E1 loop re-enters hard at 0:53 from its phrase downbeat 45.444 s; the defeat fanfare under the Herald at 0:58; the Pan Theme again from its bar downbeat 28.479 s at 1:00, so its fiddle-and-bass middle runs under B9, its fullest statement (theme 38.5 to 54.5 s, measured by band energy) runs from 1:10 to 1:26 under B10 and B11, and it resolves from 1:26, ending at 1:31.5; agent chimes at 1:00.4 (the Prospector at her shoulder) and 1:05.0 (the order); the paper sound at 1:08.65 as the Claim Ledger opens; one last pan tap at 1:33, then silence on the card.
- **Beat-true edits.** The Pan Theme measures 120.00 BPM (first downbeat 0.479 s, bars every 2 s) and the E1 loop 128.00 BPM (beat 0 at 0.444 s, 4-bar phrases every 7.5 s), by onset autocorrelation. Every music edit lands on a downbeat, pre-rolled 20 to 30 ms with a matching fade.
- **Held breath: what exists and what does not.** River water is `river-ambience-loop.mp3`. The low drone is `desert-dusk-loop.mp3`, whose energy sits below 120 Hz (-52.8 dB there against -68 dB above 400 Hz, measured). The treatment also asks for a lantern's hiss, a heartbeat near 60, and in B1 a lantern catching and slow footsteps. None of these exists in the game's audio (56 files), and relighting a post plays no sound in the game (the repair path in `src/systems/BuildSystem.ts` calls no `onSound`). They are absent, and none was generated.
- **Level.** Per-cue gains are in `edl.mjs`. The sum is normalised by a two-pass `loudnorm` to -14 LUFS integrated with a -1.5 dBTP ceiling, so that the AAC encode stays under -1 dBTP. Both passes and the re-measures of every export are in `artifacts/launch-video-cut-3/loudness.txt`.
- **The full band arrives 10 s early.** The cue sheet puts the full band statement at 1:20 and the resolution at 1:27, but the theme's own full statement runs 16 s. Landing its resolution by 1:27 without cutting inside it means the full band begins at 1:10. The alternative, a splice inside the theme's full statement, was not needed.
- **One disagreement inside the treatment, resolved.** B3's card says the Pan Theme's guitar enters on the dissolve (0:14), while the cue sheet starts the theme at 0:05. The film follows the cue sheet; the teaser, which has no B2, follows B3's card.

## Type

- Rye for display and Wellfleet for everything else, fetched from Google Fonts (Rye v17, sha256 `0b0e1d42…`; Wellfleet v25, sha256 `a4488f95…`) and rendered by headless Chromium into transparent PNGs (this ffmpeg has no `drawtext`). The ten-eras reel used a Rye build hashed `b7edee5e…` and a brand-kit Wellfleet hashed `347f3918…`: the same faces, different builds.
- Wellfleet ships a single Regular face, so the treatment's "Wellfleet italic" is Chromium's synthesised oblique.
- The slips follow the game's own HUD panel (`src/ui/theme.css`, `.hud-panel`): parchment `#f5e6c8`, a 2 px ledger-ink border, the inset brass line and the drop shadow, with four brass rivets (teal on the Prospector's slip) and ledger-ink type. The night slips carry the lantern glow `#ffe4a0`. The lockup and the end card's wordmark sit on the drawing, like the ten-eras reel's lockup, rather than on a slip.
- The masthead slip "NEW HANDS, WELCOME." is set in Wellfleet capitals between double rules. The Herald's own typeface is not in the repository.
- Every card sits inside the 10 percent title-safe area in every shape, and the "in game" mark inside 5 percent (checked by `cards.mjs` for all 96 cards).

## Formats

- **The master, 1920x1200.** The takes' own pixels (1280x800 at device scale 1.5, gap 10), 60 fps, H.264 High, AAC 48 kHz.
- **1920x1080.** The same cut, with each take cropped 1920x1080 from its 1920x1200 frame: centred, or at the top where the HUD's top row matters (B8's taunt and arrival, B9), or lower for B1 and the dark of B7. Plates are re-laid in a 16:9 page and the cards re-set for 16:9.
- **The vertical, 1080x1920.** The 390x844 takes' top 780x1387 (gap 19), scaled 1.385x, for B3, B4, B5, B6 (three shots), B7 and B9. The treatment's fallback, a 675x1200 reframe of the master scaled 1.6x, for B1 (see B1), the Baron's entry in B6, and his taunt and arrival in B8. UI panels are fitted to the width on ledger-ink for the Herald, the Field Book and the invitation, and a 676x1062 reframe is used for the Lantern Show. Plates are cropped to 9:16 inside the page border. The vertical B9 cuts around the charter (see B9).
- **The web copy, 1280x800.** The master scaled down, 30 fps, two-pass 1,450 kb/s video with 128 kb/s AAC, with the index at the front for streaming. The poster is the B3 title frame at 0:16.95.
- **The teaser, 30 s, 1920x1080.** B1 (5 s), B3 (4 s), B5 (8.92 s, with the "in game" mark on its first second, since it follows a drawing here), B8's plate, taunt and arrival (6 s) and the end card (6.08 s). The Pan Theme only: the tap at 0:01, silence over the hook, the theme's top from the B3 dissolve at 0:05, spliced on a bar downbeat at 0:17.48 (theme 48.479 s), 0.44 s before the Baron cut, into its full band statement and resolution, and one last tap at 0:29.3.
- **The paper.** A faint static parchment grain over every frame (Chromium's own turbulence noise, in ledger-ink at 30 percent), so that plates and play share one paper. It is static so that the web encode spends its bits on the picture.
- **Black at both ends, never white.** The film opens on a second of true black, then comes up from black over 0.5 s, and it goes to true black over its last half second, complete two frames before the end so that the 30 fps web copy also ends on black. The fades are applied after the grain. Measured on every export: first and last frame at luma 16.0 (black); the brightest frame is the Ride Together page at 195.7 of 235; no frame is above 200.
- **Colour.** The takes are full-range BT.601 as captured. Everything is composited in RGB and leaves as limited-range BT.709, tagged BT.709 for matrix, primaries and transfer.
