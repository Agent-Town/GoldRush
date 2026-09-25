# Report: launch-video-vibe-check-1, phase 1 (2026-09-25)

**READY-FOR-GATES (phase 1).** Phase 1 is done: items 1, 2, 3 and 5 of `tasks/launch-video-vibe-check-1.md` are complete. Phase 2 (item 4, the live look) has not started. It waits for the attended session's word, because an Astra play run is using the machine. No server was started, no browser was opened, no request went to any live site, nothing was generated or published, and no money was spent.

- **Branch:** docs/launch-video-vibe-check-1, in the scratch worktree `/Users/robin/Claude/Projects/wt-vibe`.
- **Implementer:** Claude Opus 5.5.
- **Pre-flight at start:** `git status --short` showed only the untracked `node_modules` symlink; `git log main..HEAD` was empty (base `c274ba796`).

## The deliverables
1. **The vibe check:** `docs/marketing/launch-video/vibe-check-2026-09-25.md`. It holds what Gold Rush is in three sentences, the six pillars each with the frame that proves it, art against game for the five Frontier maps and twelve more, the ten moments, fourteen canon guardrails, and the verdict.
2. **The treatment:** `docs/marketing/launch-video/treatment.md`, "WHAT IS A CLAIM?". It has the thesis line, **12 beats in 94 s** with a seven-field shot card each (checked mechanically: 12 of 12 cards carry all seven fields, and the durations sum to 94 s), the look, music and sound with a cue sheet and three tempos, the title and end cards, the capture runbook and list, eleven gaps, and three owner questions.
3. **The mood board:** `docs/marketing/launch-video/mood-board.md`, with **24 frames** grouped by beat, one line each.
4. **This report**, with the path checker `artifacts/launch-video-vibe-check-1/check-paths.mjs` and its output `artifacts/launch-video-vibe-check-1/check-paths.out.txt`, the guard output `artifacts/launch-video-vibe-check-1/guards.out.txt`, and the viewing log `artifacts/launch-video-vibe-check-1/viewing-log.md`.

**The thesis line.**
> A warm, hand-engraved frontier where a young miner and her brass Prospector hold one claim together, and where every rider, human or machine, comes through the same door and learns from the last one's tape.

**The verdict paragraph** (verbatim from the vibe check, §6).
> Gold Rush is thrilling where the light is. That means Night Shift's fall from gold to black, the lantern pool with the Fevered at its rim, the Baron's banner coming up the valley at the twentieth horn, and the teal rings that turn a hungry crowd for home under the word FREED. It is fun in its own voice: the tavernkeeper's question, the Herald's front pages, and a brass deputy whose job title climbs from "follows and observes" to "does trusted chores". And it is genuinely new where the county replays any ride in your browser and a machine and a human come through the same door. It goes flat where the camera is. The default daylight boots, shot from a high fixed angle, turn beautiful plates into ground; the maps beyond the frontier are dimmer and flatter than their art; and the system screens are parchment panels of text. **The one thing the film should lean on is the lantern in the dark.** Every thrilling thing in this game happens at the edge of a pool of warm light, and that pool is also the canon's thesis made visible: the lit window the wanting cannot face, and the keeper whose light is the reply (`lore/world-dispatches.md`, Era 3, fragments 2 and 5). So light the film the way Night Shift is lit: warm pools, brown shadows, and the gold in the Fevered's eyes coming into the light hungry and leaving it freed. And the brass deputy at her shoulder is one of the night's lights too (the night-mode lane lists "hero, Prospector, powered lanterns, carried lanterns" as its light sources, `reviews/lane-night-mode-truth.md`), so the mission gets its image for free: in the dark, the agent beside her is a second lamp.

## What I read (counts)

**The READ FIRST list, whole, in order:**
- **The storybook,** `lore/STORYBOOK.md`: all 742 lines (E1 to E10, the ten interstitials, appendices A to E).
- **The other nine lore pages:** README, canon-rules, story-arc (121 lines), characters, agent-town-heritage, world-dispatches (262 lines), claim-herald, archive-world-pages and third-printing-brief.
- **The brief,** `docs/GOLD_RUSH_BRIEF.md`: all 300 lines, including §2 to §5 and §9 as ordered.
- **The ADRs:** ADR-001, ADR-003 and ADR-004.
- **The specs:** `specs/release-e1/README.md` and `specs/epoch-saga/README.md`.
- **The existing marketing:** `docs/marketing/FEVER-CAMPAIGN.md`, `docs/marketing/STREAMING.md`, `marketing/LEDGER.md`, `marketing/briefs/teaser-shots.md` and both documents in `marketing/reel/`.
- **The landing page,** `site/index.html`: its text and structure. Its three inline images were decoded to the session scratchpad and viewed; none was committed.
- **The one item I could not read:** specs/00_product_story.md does not exist (F-VIBE-1).

**Read beyond the list, because each one binds a launch film:**
- **Marketing law and facts:**
  - `docs/marketing/BRAND-BOOK.md` (the video laws: the Pan Theme, intro/outro, real speed)
  - `docs/marketing/RELEASE-AND-EPOCH-PLAN.md` (the mystery law and its NEVER list)
  - `marketing/outbox/launch-facts-vE1.md` (where to play; the board facts)
  - `marketing/outbox/announcement-thread/THREAD-v2.md` and `THREAD.md` (the voice)
  - `marketing/raw/INDEX.md`
  - `specs/marketing/README.md`
- **Sound:** `specs/music/README.md` and `specs/audio/README.md`.
- **Art status:** `reviews/sol-map-art-current-status-20260909.md`: its header and the whole 42-map readiness table.
- **Owner rulings:** `docs/OWNER-DESK-2026-09-19.md` (HM-01a; F-NCB-1, "do not buy") and `docs/OWNER-DECISIONS-2026-09-24.md` (the live seed, the held maps).
- **Code and data, for the capture plan:**
  - `src/core/DebugParams.ts`, `src/app/GameApi.ts`, `src/main.ts` (contract launch, the watch deep link)
  - `src/game/Game.ts` (the county-standing submission and its dev gate; the Prospector's three status lines)
  - `src/telemetry/runBeacon.ts`, `src/telemetry/payload.ts`
  - `src/game/Balance.ts` and `src/systems/CameraZoomController.ts` (the camera)
  - `src/ui/Hud.ts`, `src/story/beats.ts`
  - `assets/contracts/epoch-1-frontier/contracts.json` (goals, rules, the light ramp, the Baron's twist)
  - `assets/engine-era.json`
  - `e2e/lantern-true-world.spec.ts` (the no-network pattern)
- **Measured locally:** the durations of 14 audio files, and the approximate tempo of 4 music files by onset autocorrelation (flagged in the treatment as approximate, to confirm by ear).

## What I viewed (counts)
**86 image views, each with my own eyes:** 33 from the art store, 29 map boards and in-game frames, 18 HUD, menu and system captures, the landing page's 5 images, and 1 contact sheet of 5 frames from the ten-eras reel. One line per image is in `artifacts/launch-video-vibe-check-1/viewing-log.md`.
- **Store plates** include every Frontier Edition map plate, the town plate (`kit-town-canon`), the valley master, all ten era plates, and the hero and Prospector portraits.
- **Maps compared plate against game:** the five Frontier Edition maps plus twelve beyond the frontier (Hill Mine, Trestle, Incline, Canyon Works, Dust Flats, Deepwater Claim, Glow Mesa, Picnic, Relay Valley, Mare Claim, Ember Shore, Archive World).
- **Process note, honest:** the tool's image limit dropped my first pass over the Frontier boards from the session's context before I had written notes. I re-viewed every one of them before writing, and the log counts the re-views.

## Self-check (the master's list)
- **Every path named in the three documents exists.** The checker read 167 path mentions in the three documents (234 with this report) and found 0 misses (`artifacts/launch-video-vibe-check-1/check-paths.out.txt`). It resolves repo paths, absolute paths and the documents' `store:` shorthand, strips line suffixes, and matches `*` segments against the directory. It walks every segment in exact case, because this filesystem answers true for a wrongly-cased path. A negative control with a wrong-cased path and a missing path failed as it should.
- **Every canon claim cites its lore file or brief section,** inline.
- **Every shot card has all seven fields:** 12 of 12.
- **The guards:** `GR_GUARD_NO_ARTIFACT=1 node --test scripts/no-emdash-guard.test.mjs scripts/citation-title-guard.test.mjs` passes 19 of 19, rc 0 (`artifacts/launch-video-vibe-check-1/guards.out.txt`). The em-dash guard does not scan `docs/marketing/`, so I also counted by hand: 0 em dashes and 0 en dashes in all three documents and the log. The citation guard gates only `tasks/`, and my documents carry no `spec:line` citations.
- **Commits** are path-scoped, prefixed `docs:`, and carry the trailer. There was one concern per commit, and the vibe check was committed before the treatment.

## Findings (none blocks phase 1; the firewalled ones go to the attended session or the owner)
- **F-VIBE-1: the master names a file that does not exist.** specs/00_product_story.md (in READ FIRST) is not in this repository, not in its history (`git log --all` finds nothing), and not anywhere under `/Users/robin/Claude/Projects`. It is an Agent Town Portal file that the brief quotes (`docs/GOLD_RUSH_BRIEF.md:37`) and cites (`docs/GOLD_RUSH_BRIEF.md:286`). I used the brief's quotation. *Cure:* future masters cite brief §3.1 (attended; `tasks/**` is firewalled for me).
- **F-VIBE-2: the landing's share card is a HUD-cropped game frame.** `site/index.html` points its `og:image` and `twitter:image` at `https://agenttown.app/assets/gold-rush-key-art.jpg`. In this checkout `site/assets/gold-rush-key-art.jpg` is an in-game frame of the Claim with its HUD cut at the top edge, and so is `site/assets/teaser-poster.jpg`. A launch film shared as a link would inherit that card. I did not check the deployed site (no live requests). *Cure:* an illustrated share card (attended or owner; `site/**` is firewalled).
- **F-VIBE-3: the best key art has no source file.** The landing's three illustrated images exist only as base64 inside `site/index.html` (1200x800 JPEGs). A SHA-256 search of the art store and this checkout found no matching file. *Cure:* land the originals in the store (owner or attended).
- **F-VIBE-4: site copy strays from canon.** The hero image's alt text reads "A prospector on a river gold-claim", giving the heroine the agent's word (`lore/characters.md`). The "For minds" image shows the Calculating House as a hall of identical hooded figures, which leans away from "never uncanny or threatening on first contact" (brief §3.6). The film uses neither. *Cure:* a site copy and art pass (firewalled).
- **F-VIBE-5: the landing carries a token link.** The footer links "$AGENTTOWN" to a token chart, while `docs/marketing/BRAND-BOOK.md` §5 and the Fever campaign's laws forbid token or price talk in marketing. The film's end card points at agenttown.app/goldrush, one click from that footer. The film itself never names a token. *The owner's call.*
- **F-VIBE-6: the brief contradicts itself on the hero.** `docs/GOLD_RUSH_BRIEF.md:300` says both "NEVER call her 'prospector' in prompts" and "names her explicitly: 'a young female prospector'". `lore/canon-rules.md` (§THE STANDING GUARDRAILS) settles it: "NEVER prompted 'prospector'". *Cure:* a one-line attended edit of the brief.
- **F-VIBE-7: the typography sources disagree.** Brief §4.2 sets Rye for display, while `docs/marketing/BRAND-BOOK.md` §2 says "Wellfleet (display + UI voice)". Both shipped reels used Rye for display. The game ships no `@font-face` (`public/_headers`), so in-game text renders in Georgia. The treatment follows §4.2 as the master orders. *Owner's preference.*
- **F-VIBE-8: two Frontier maps have no campaign board.** No plate-and-game board exists under `artifacts/sol/map-art-campaign-2/` for `the-claim` or `e1-dry-gulch`. I paired their plates with today's boot frames in `artifacts/sec-headers-and-data-hygiene-1/boots/`.
- **F-VIBE-9: two key moments have only staged frames.** The only frames of the FREED turn (`reviews/shots-legibility/`) and the build menu (GOLD 1000/200) are staged review states, and the Baron frames in `artifacts/baron-presence/` carry the debug "Game tuning" chip. They are right as evidence and wrong as film frames. Phase 2 films these moments in real play.
- **F-VIBE-10: a capture-day network hazard.** `src/app/GameApi.ts` hardcodes the live county. A dev build already keeps the standings POST and telemetry off, but the County Standings tab, live stats and the `?watch=` deep link would GET it. Phase 2 aborts `https://agenttown.app/**` and serves standings from the e2e fixtures; this is written into the runbook.
- **F-VIBE-11: no honest Baron replay exists today.** Every secured `e1-baron` tape on disk is era 3 or era 5, for example `artifacts/claude-debut-20260901/claude-opus-baron/attempt-3-tape.json` and `artifacts/baron-era3-20260829/run-1-tape.json`. The engine is era 6 (`assets/engine-era.json`, which retires era-5 reels), and the one era-6 Baron ride did not secure. `e2e/lantern-true-world.spec.ts` re-stamps tapes for its render test; a film must not, because "this is the ride" would then be false. *Owner question 1.*
- **F-VIBE-12: a canon watch-item on the crowd.** The E1 walkers wear ragged ponchos and wide hats (`/Users/robin/Claude/Projects/GoldRush-assets/raw/char-bandit-base-sheet-walk8.png`, `/Users/robin/Claude/Projects/GoldRush-assets/raw/char-jumper-s4-codex-v1.png`). That is within canon (the brief's avatar pool has "The Poncho Drifter"), but a uniform crowd lingered on at trailer scale could read as one people (brief §3.6, §9.3). The treatment cuts on the gold tell and the FREED turn. *The owner's eye.*
- **F-VIBE-13: a shell command on a player surface.** The Ride Together invitation prints a monospace shell command (`reviews/shots-mp-07c-3/desktop-chrome-invitation.png`), and brief §4.2 keeps monospace backstage. The film crops above it.

## Where I adapted the master
- I used the brief's quotation where the product story is missing (F-VIBE-1).
- I paired the Claim's and the Dry Gulch's plates with today's boot frames, because campaign 2 has no board for them (F-VIBE-8).
- Six of the 24 mood-board frames sit under `reviews/shots-*`, not `artifacts/` or the store, because no `artifacts/` capture shows those moments. They are referenced in place, never copied, and the mood board says so.
- The treatment's capture plans rest on the runbook's no-network rule (F-VIBE-10), the honest-launch rule (no `debug`, `seed` or `timescale` in a kept take), and the owner's 2026-09-19 "do not buy" (zero generation: plates move by hand-cut parallax).

## The phase-2 capture list (from the treatment's runbook)
Run it through the drain lock on port 5322, with `--workers=1`, every request to the live county aborted, and the capture profile "Wren" with telemetry off. Output goes to the owner's home folder `.goldrush/launch-video/`.
1. The menu, on a fresh profile, at both sizes (B3).
2. The Claim, 0:00 to 4:00, at both sizes (B4, B5, B9).
3. Night Shift, 2:30 to 5:30, at both sizes (B1, B6, B7).
4. Dry Gulch and Twin Banks entry walks, 20 s each, at both sizes (B6).
5. The Baron, a full run at 1280x800 (B6, B8).
6. The Herald, edition No. 5 (B8).
7. The Field Book, with fixtures (B10).
8. The Ride Together invitation (B10).
9. A secured Claim ride recorded on the day and replayed in the Lantern Show (B10).
10. Stills at each named moment.

## Commits (on the branch docs/launch-video-vibe-check-1)
- `7c9de7511` docs: the vibe check, with the viewing log and the path checker
- `ec5a76af0` docs: the treatment
- `13e571e58` docs: the mood board
- `71189a412` docs: vibe check corrections from the treatment pass
- `71a39daa9` docs: the viewing count corrected (86) and the log completed
- This report, with the checker and guard outputs, is the next commit on the branch.

## REMAINING LIST IN ORDER
1. **Phase 2, on the attended session's word only.** Run `npm run build` once, then the capture list above through the lock on port 5322 with the network blocked. Record the clips and stills to the owner's home folder `.goldrush/launch-video/`.
2. **Correct the documents from the live boot.** Answer phase 1's open checks:
   - Do the FREED labels live inside `#hud`?
   - Does the charter order ("send it panning") work at the starting rung?
   - How does the Prospector's light look at dark in a plain boot?
   - Does the Lantern Show's local reel shelf work?

   Then list every clip in the treatment by path with its duration.
3. **The owner's three answers.** The Baron ride for the camera, the voice, and the riders' names. The treatment's recommendations hold until then.
4. **Route the firewalled findings.** F-VIBE-2 to F-VIBE-6 concern the site, the brief and the art store; F-VIBE-1 concerns the master template.
