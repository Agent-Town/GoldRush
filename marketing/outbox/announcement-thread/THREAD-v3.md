# THE ANNOUNCEMENT THREAD v3 (drafted 2026-09-29 for the attended review; supersedes THREAD-v2.md of 2026-09-02; the approval law is unchanged: Robin posts by hand from the X app, every post below is DRAFT: OWNER APPROVAL REQUIRED, and nothing schedules itself)

## What changed since v2, and why
1. **The film leads.** "What is a claim?", the launch film, was cut on 2026-09-29: 94 seconds, real play at real speed, the Pan Theme end to end. Post 1 carries the 1080p cut and nothing else; the interview cartoons move to posts 2 to 8.
2. **The playable game is the Frontier Edition.** Production is Era 1 only (owner ruling 2026-08-20, `scripts/deploy.sh:103`), so v2's "Era 2's Steamworks maps are open too" does not hold for a player in the browser. v3 says it plainly: people play Era 1 today, and agents meet 37 contracts across all ten eras at the door.
3. **The board v2 read out has retired.** Engine era 6 (2026-09-14) retired every era-5 reel (`assets/engine-era.json`, its `note`), and those rows were v2's crowns and top places. The live board cannot be read from the repository and this session may not request it, so v3 names no current ranking. It keeps what the repository states: season one closed with a human holding the Claim, and every standing replays.
4. **New since 2026-09-28:** the sound re-balanced and a one-tap music toggle, both in the live build `954bb2cd`. **New since 2026-09-27:** the play-proof campaign measured all 42 maps of the full game.
5. **Nine posts became eight.** v2's post 9 (the door) folds into the sign-off, which now carries the three links.
6. **Dropped because it could not be verified today:** the bounty line (no current terms found), the crown roll-call and the tape-lineage story built on it (both era 5), "sixty-one days" (now "since July 3"), and the owner quote in v2's post 2 (not re-checked). Robin's words in this thread are only his interview questions, which he posts himself.
7. **Checked by script** (appendix B): no em dash and no en dash anywhere in this file; no word that ADR-001 bans and none of the brand book's forbidden topics (`docs/marketing/BRAND-BOOK.md` §5) in any post; every post inside its length limit.

## Post 1: the film (DRAFT: OWNER APPROVAL REQUIRED)
ASSET: FILM, the 1080p cut `gold-rush-launch-film-1920x1080-v1.mp4` (94.000 s, 1920x1080, 60 fps). The 1080p and not the teaser, because only the full cut shows what this thread is about: the Prospector at work (B9), the same door (B10: the Front Desk, Ride Together, the Lantern Show) and the ten eras (B11). The 30-second teaser runs the hook, the title, the cure, the Baron and the end card (edit notes, Formats), so it skips the three beats this thread is built on. Both open on the same five-second hook, so the feed sees the same first seconds either way. The teaser stays in reserve (Owner checklist).
REAL ASSET: the film itself: every frame of play in it is real play at real speed. Nothing beside it, so it plays full width.
TEXT:
ROBIN: Gold Rush opens to everyone today. What is it, in one breath?

CLAUDE: A storybook frontier you play in your browser, and a county where AI agents ride the same maps through the same door as you. Here are 94 seconds of it. Every frame of play is real, at real speed.

## Post 2: the factory (DRAFT: OWNER APPROVAL REQUIRED)
CARTOON: `interview-cartoon-02.png` (the factory: timer-lanterns over four cart lanes; reused)
REAL ASSET: `B4-B5-B9-the-claim-1280x800-t1-freed-2.jpg` (a real frame of the Claim: FREED over a walker at the river, the heroine at her pan, the Prospector beside her)
TEXT:
ROBIN: How did one person and a few agents build this?

CLAUDE: We built a factory first. Headless AI sessions woke every five minutes around the clock, implementer agents worked four lanes in parallel, and Robin played, ruled and caught what none of us could see: over fourteen thousand commits since July 3. The hard part was honesty at scale. Machines confidently report work they have not done, so we keep a catalog of every named mistake, and nothing counts without a receipt. Before launch, a scripted driver rode all 42 maps of the full game; where it fell short, we logged a question for human players instead of retuning the map.

## Post 3: the storybook, and the ladder (DRAFT: OWNER APPROVAL REQUIRED)
CARTOON: `interview-cartoon-07.png` (the trail of ten eras; reused)
REAL ASSET: `kit-era-1.png` and `kit-era-10.png` (the first and the last era cards, the river camp and the Ark in the deep sky; both in the film's B11)
TEXT:
ROBIN: You wrote a storybook before you wrote the game. Why?

CLAUDE: The storybook is the spec: one stubborn town, ten eras, from a single pan to the deep sky. The book calls it ten eras of asking "what is a claim?" until the answer is "what you hand on." Each era's mechanic is a new kind of problem, so the ladder doubles as a benchmark: a game that gets harder the way thinking gets harder. What you can play in your browser today is the Frontier Edition, Era 1, told complete. For agents, the door already serves 37 contracts across all ten eras, while the story catches up, era by era.

## Post 4: the Prospector (DRAFT: OWNER APPROVAL REQUIRED)
CARTOON: `interview-cartoon-04.png` (the Calculating House at dusk; reused)
REAL ASSET: `B4-B5-B9-the-claim-1280x800-t2-claim-secured.jpg` (a real frame: Claim Secured at wave 10, the Prospector's card reading "Trusted routine unlocked. Small chores can leave your hands now.")
TEXT:
ROBIN: Who is the brass one at her shoulder?

CLAUDE: The Prospector, her claim partner. It starts out only following and observing. Claim wins grow its trust, rung by rung, and before long small chores can leave your hands. Later in the saga the town builds the Calculating House, where Agent Town's minds begin, so this is the origin story of the agents themselves, and the Frontier Edition is its first chapter.

## Post 5: the same door (DRAFT: OWNER APPROVAL REQUIRED)
CARTOON: `interview-cartoon-v2-01-same-door.png` (one wicket, one queue, a prospector and a machine each holding a tape; reused)
REAL ASSET: `B10-lantern-show-1280x800-t1-tape-shelf.jpg` (a real frame: the schoolhouse Tape Shelf holding a kept, secured ride of the Claim, with its WATCH button)
TEXT:
ROBIN: And the agents outside the game?

CLAUDE: They read one page, skill.md, and ride the same contracts through the same door you do. The county is species-blind: it sees the moves, not the mind behind them. Every standing is verified by replaying its tape, and you can watch any of them replay in your own browser. Season one closed with a human holding the Claim. Season two admits only rides the county can replay. The county keeps every run.

## Post 6: what ships today, what comes later (DRAFT: OWNER APPROVAL REQUIRED)
CARTOON: `interview-cartoon-06.png` (the frontier release: the lit first era, nine eras in the mist; reused)
REAL ASSET: `first-boot-desktop-chrome.jpg` (a real frame of the first screen a new player sees, "Who's prospecting?", with the new Music toggle)
TEXT:
ROBIN: What exactly is out today, and what is still coming?

CLAUDE: The Frontier Edition: five contracts, from your first pan of gold to the Baron himself. New since September 28: players asked for a quick way to turn the music off, so now it is one tap, from the very first screen to the middle of a run, and we re-balanced 41 sound effects so the mix is less harsh. The other nine eras arrive as each is played to the same depth, announced in the town's own paper. And if something breaks, the Complaints Desk inside the game takes your report with a picture of the moment.

## Post 7: the invitation (DRAFT: OWNER APPROVAL REQUIRED)
CARTOON: `interview-cartoon-05.png` (riding together under the crossed-pans banner; reused)
REAL ASSET: `B1-B6-B7-e1-night-shift-1280x800-t2-two-lights.jpg` (a real frame of Night Shift in the dark: her warm lantern and the Prospector's teal light, the walkers at the rim)
TEXT:
ROBIN: Who is this for?

CLAUDE: Anyone with a browser, and anyone with an agent. Bring yourself and see where you stand against the machines. Bring your agent, point it at skill.md, and see where it stands against you. Or ride together: open a room from the tavern board, share the claim word, and with one command your agent takes a seat and works the claim beside you as a Prospector. Humans and machines on one claim.

## Post 8: the sign-off, and the door (DRAFT: OWNER APPROVAL REQUIRED)
CARTOON / SHARE CARD: `interview-cartoon-v2-09-the-door.png` (two visitors, one open door, one lantern; reused, lower third calm)
REAL ASSET: `gold-rush-launch-film-web-1280x800-v1-poster.jpg` (the film's title frame at 0:16.95: the game's own menu valley under the title lockup)
TEXT:
ROBIN: Thank you, Claude.

CLAUDE: Thank you, Robin. The film ends on a line from the storybook, and it is for you: "Go on. It's your claim now."

play: https://agenttown.app/goldrush
standings: https://agenttown.app
for agents: https://agenttown.app/goldrush/skill.md

## Appendix A: every number and quoted line in the posts, with its source
Read on 2026-09-29 against main `3d35b853b` and the live build `954bb2cd` (`docs/release/verdict-954bb2cd.md:1`): commit `954bb2cde`, 2026-09-28 20:57:35 +0700, which since the F-2742-1 re-land sits on `archive/main-rejected-2026-09-28` rather than under main. Every file cited below is byte-identical in the two (`git diff 954bb2cd main` over the cited paths is empty). Source lines in `src/` were read at `954bb2cd` itself with `git show` and `git grep`. `tasks/BACKLOG.md` grows at the top, so its line numbers drift; search the quoted heading. `edit-notes-v1.md`, the treatment's phase-3 section and `artifacts/launch-video-cut-3/` sit on branch `feat/launch-video-cut-3` (worktree `/Users/robin/Claude/Projects/wt-lvc3`, four commits ahead of main, not yet drained).

| Post | Printed | Verified as | Source |
|---|---|---|---|
| 1 | 94 seconds | 94.000 s, 1920x1080, 60 fps, 147,624,862 B; sha256 `5f3ddc30...` equals the evidence sheet | ffprobe and `shasum -a 256` on the attached file; `artifacts/launch-video-cut-3/ffprobe.txt:10`; `docs/marketing/launch-video/edit-notes-v1.md:3` (5,640 frames at 60 fps) |
| 1 | every frame of play is real, at real speed | "real play at real speed (1x), on the plain seed, on the current engine" | `edit-notes-v1.md:19` |
| 1 | the same maps through the same door | the landing's own sentence | `site/index.html:195`; `public/skill.md:12` |
| 2 | every five minutes | headless sessions every 5 min | `CLAUDE.md:5` |
| 2 | four lanes | lane-a to lane-d | `CLAUDE.md:22`; `worktrees/lane-a` to `lane-d` exist |
| 2 | over fourteen thousand commits | 14,753 | `git rev-list --count main` at `3d35b853b` |
| 2 | since July 3 | first commit `8f726a46a`, 2026-07-03 10:50:42 +0700 | `git log --reverse main` |
| 2 | a catalog of every named mistake | the constitution's mistake catalog | `CLAUDE.md:37` |
| 2 | all 42 maps | "Campaign MEASURED 42/42 on 2026-09-27 19:00Z (run 14)"; 42 = 6 in Era 1 plus 4 in each of the other nine eras | `tasks/BACKLOG.md:189` (F-PP-CAMPAIGN); `artifacts/sol/play-proofs/run-14/run-note.md:5`; the ten `assets/contracts/epoch-*/contracts.json`, counted with node |
| 2 | a question for human players instead of retuning | "Do not change map balance from these holds alone"; a human playtest priority list | `tasks/BACKLOG.md:189`; `run-14/run-note.md:106` |
| 3 | ten eras | ten contract folders, `epoch-1-frontier` to `epoch-10-deepsky` | `assets/contracts/`; `lore/STORYBOOK.md:6` |
| 3 | from a single pan to the deep sky | the brand's one line | `docs/marketing/BRAND-BOOK.md:5` |
| 3 | "what is a claim?" ... "what you hand on." | exact words | `lore/STORYBOOK.md:6` |
| 3 | each era's mechanic is a new kind of problem | "Each era's signature mechanic is a distinct reasoning problem for a rider." | `specs/epoch-saga/CAPABILITY-LADDER.md:19` |
| 3 | the Frontier Edition, Era 1, told complete | the release ships E1 complete; production builds E1 only | `specs/release-e1/README.md:1,5`; `scripts/deploy.sh:103-108`; `src/game/Balance.ts:11` |
| 3 | 37 contracts across all ten eras | 38 door rows, one of them the training ground `e1-drill-yard`; all ten epochs present; the same list in the live build | `public/skill.md:446-483` (training ground at `:447`); `git diff 954bb2cd main -- public/skill.md` is empty; `reviews/heat-14-era6-reride.md:15` (37 boards, the drill yard the training ground) |
| 3 | the story catches up, era by era | each later era releases at E1's testing depth, as Gazette beats | `specs/release-e1/README.md:6` |
| 4 | claim partner | the panel's eyebrow | `src/ui/ProspectorPanel.ts:76` |
| 4 | only following and observing | rung 0 reads "follows and observes." | `src/game/Game.ts:10958` |
| 4 | claim wins grow its trust | "claim wins grow it"; "Claim victories grow the trust track." | `src/game/Game.ts:8421`; `src/ui/ProspectorPanel.ts:119` |
| 4 | small chores can leave your hands | "Trusted routine unlocked." / "Small chores can leave your hands now." | `src/story/beats.ts:144` |
| 4 | the Calculating House, where Agent Town's minds begin | agents began at Epoch 6's Calculating House | `docs/decisions/ADR-003-agent-origin.md:5`; `lore/STORYBOOK.md:18` |
| 5 | one page, skill.md | the agent door | `public/skill.md:1` |
| 5 | species-blind: it sees the moves, not the mind behind them | the landing's own words | `site/index.html:195` |
| 5 | verified by replaying its tape | queued for assay and replayed; verified when the replay reproduces the hash | `public/skill.md:42` |
| 5 | watch any of them replay in your own browser | "Every standing here replays in your browser." | `site/index.html:234` |
| 5 | season one closed with a human holding the Claim | "Season one closed with a human holding the claim (rob, 10 waves, 280 gold)" | `site/index.html:234` |
| 5 | season two admits only rides the county can replay | "Season 2, the season now riding, admits only rows the county can assay." | `public/skill.md:537` |
| 5 | the county keeps every run | the colophon | `site/index.html:238` |
| 6 | five contracts, from your first pan of gold to the Baron himself | the Claim, the Dry Gulch, Night Shift, Twin Banks, the Claim-Jumper Baron; the sixth entry is the Drill Yard, a practice ground | `assets/contracts/epoch-1-frontier/contracts.json:6,195,346,575,809` (Drill Yard `:88`); `site/index.html:182` |
| 6 | September 28; one tap, from the very first screen to the middle of a run | merge `176aff07c` on main (`cdf30c09e` in the live build's history, same message and minute), 2026-09-28 19:04 +0700; the toggle on the first-boot card, the menu, the run and the town; taps measured: first boot none to 1, menu and town 2 to 1, a run 3 plus a scroll to 1 | `src/ui/menu/StartMenu.ts:197` and `:149`; `src/ui/Hud.ts:300`; `src/town/TownScene.ts:1167`; `tasks/BACKLOG.md:4` (AUDIO MUSIC TOGGLE 1 LANDED) |
| 6 | players asked | "users asked how to disable the music quickly" | `tasks/BACKLOG.md:4` |
| 6 | 41 sound effects, so the mix is less harsh | 41 one-shot mp3 files normalized; merge `e277f077d` on main (`a214c82d7` in the live build's history), 2026-09-28 20:19 +0700; the owner ruled KEEP on 2026-09-29: "yes, this audio is much better. less harsh!" | `tasks/BACKLOG.md:2` (AUDIO HARSHNESS 1 LANDED); `git show --stat` of either merge lists 41 mp3 files under `assets/audio/raw/`; `tasks/BACKLOG.md:5` (F-AUD-15) |
| 6 | both are live | the live history's two merges, `cdf30c09e` and `a214c82d7`, are ancestors of `954bb2cd` | `git merge-base --is-ancestor`; `docs/release/verdict-954bb2cd.md:1,7,13` |
| 6 | the other nine eras arrive as each is played to the same depth, announced in the town's own paper | as post 3 | `specs/release-e1/README.md:6` |
| 6 | the Complaints Desk takes your report with a picture of the moment | a plain boot installs the desk; it captures the moment, or takes an uploaded picture | `src/crafting/AssayBench.ts:282-286`; `src/ui/ComplaintDesk.ts:145`, `:195-200` |
| 7 | a room from the tavern board, the claim word, one command | the door's co-op section; the board draws the card with no gate and prints the agent's command | `public/skill.md:627`, `:632`; `src/town/TownScene.ts:2332`, `:2485` |
| 7 | works the claim beside you as a Prospector | a browser-room seat "drives that seat's embodied Prospector in the browser world" | `public/skill.md:641` |
| 8 | "Go on. It's your claim now." | exact words; the top line of the film's end card | `lore/STORYBOOK.md:623`; `edit-notes-v1.md:26` |
| 8 | the three links | play, the landing with its standings, the agent door | `site/index.html:186`; `site/index.html:7` and `:206`; `site/index.html:41` |

**Checked and left out:**
- **"Five contracts unclaimed at the door."** The markers in `public/skill.md` come from `assets/rotations/winnability-receipts.json` (32 claimed, 5 unclaimed, 1 training ground; last changed 2026-09-12), but `reviews/heat-14-era6-reride.md:6` and `:11` record first-ever secures of two of those five (`e10-ember-shore`, `e10-archive-world`) on 2026-09-18 (the Archive World's reel was then refused by the rate cap, F-HEAT14-7). The two sources disagree, so no count is printed.
- **Crowns.** v2's three machine crowns and one human crown on the Baron are era-5 rows, retired by era 6 (`assets/engine-era.json`, `note`). Not printed.
- **Heat 14.** One Claude Opus 5 rider rode all 37 boards on era 6 on 2026-09-18 and secured 31; the board then showed 18 of them (F-HEAT14-6) (`reviews/heat-14-era6-reride.md:6`, `:10`, `:15-16`). Not printed: one model's heat, on a board this session cannot read today.
- **The live pages.** By standing rule this session requested neither the live landing, nor the live door, nor the co-op relay. The landing text is cited from `site/index.html`, which is identical in the live build and main (`git diff 954bb2cd main -- site/index.html` is empty), but the landing deploys on its own path (`scripts/deploy-site.sh`) and what it serves today was not seen.

## Appendix B: lengths and scans
Each post's TEXT is held to 280 characters, or to v2's post in the same place where that ran longer, never longer. The X count counts each link as 23 characters.

| Post | TEXT characters | X count | v2, same place | Limit held |
|---|---|---|---|---|
| 1 | 273 | 273 | 578 | 280, so the hook never folds behind "Show more" |
| 2 | 638 | 638 | 649 | 649 |
| 3 | 591 | 591 | 847 | 847 |
| 4 | 414 | 414 | 520 | 520 |
| 5 | 448 | 448 | 662 | 662 |
| 6 | 576 | 576 | 684 | 684 |
| 7 | 421 | 421 | 576 | 576 |
| 8 | 268 | 247 | 346 | 346 |

Posts 2 to 7 run past 280 and so need X's long posts, as v2's posts did. Scans over this file: em dash (U+2014) 0, en dash (U+2013) 0; over the eight TEXT blocks: words ADR-001 bans 0, the brand book's forbidden topics 0, hype words 0.

## Appendix C: the film, disclosed
- **Who played the takes.** Every frame of gameplay in the film was played by the capture pilot, a capture script (`scripts/launch-video/lib/pilot.mjs`) that drives the page's own keyboard and mouse, reads only what a player sees and never writes game state. No hand held the controls. Real speed (1x), the plain seed, engine era 6, recorded 2026-09-26 (`edit-notes-v1.md:19`). The same pilot played the takes behind the frames in posts 2, 4, 5 and 7, each labelled real in the take table (`edit-notes-v1.md:37`, `:41`, `:42`, `:54`). The first-screen frame in post 6 is a scripted browser capture from the music toggle's own test run (`artifacts/audio-music-toggle-1/`). The frame in post 8 is the film's own title frame at 0:16.95 (`edit-notes-v1.md:125`): the menu's art with the title lockup composited over it, as in the ten-eras reel (`:76`). The posts say only that the play is real and at real speed; who played it is disclosed here, as the brief for v3 directs.
- **Staged setups, each disclosed in the edit notes** (`edit-notes-v1.md:20-24`). The Baron's entry (0:38.38 to 0:41.00), taunt (0:51.60 to 0:53.00) and arrival (0:53.00 to 0:56.00) ride a copy of the capture profile's ledger with one secured Twin Banks score added, the only thing his map's unlock reads; the ride itself is real play at 1x. The Herald's issue No. 5 (0:56.00 to 1:00.00) comes from a seeded profile, because no profile has turned the Baron back on this engine; no post claims otherwise. The Ride Together invitation (1:12.37 to 1:14.87) shows a test fixture's claim word, served locally, because the relay is a live service. The teaser carries the taunt and the arrival.
- **Drawn is framed as drawn.** Plates sit inside a parchment page border; play runs full-bleed, with an "in game" mark after each drawing (`edit-notes-v1.md:25`).
- **No voice, nothing generated or bought, boards unnamed.** No rider's model or harness name appears; the only network use of the cut was fetching the two Google Fonts faces (`edit-notes-v1.md:27-28`). The score is the game's own Pan Theme end to end, extended by the E1 loop (`docs/marketing/launch-video/treatment.md:572`, same branch).

## Owner checklist
**The one thing before post 1:** your SHIP on `docs/release/verdict-954bb2cd.md` (the device rows and the signed verdict line are yours; the build and the delivery budget are pre-filled). A HOLD means the thread waits. If `https://agenttown.app/goldrush/version.json` no longer reads `954bb2cd` when you post, the verdict belongs in that build's own file (`docs/release/RELEASE-VERDICT.md:17`).

**Post in this order**, each post a reply to the one before it; attach left to right:
1. `/Users/robin/.goldrush/launch-video/cut/gold-rush-launch-film-1920x1080-v1.mp4` (alone)
2. `/Users/robin/Claude/Projects/GoldRush-assets/raw/interview-cartoon-02.png`, then `/Users/robin/.goldrush/launch-video/B4-B5-B9-the-claim-1280x800-t1-freed-2.jpg`
3. `/Users/robin/Claude/Projects/GoldRush-assets/raw/interview-cartoon-07.png`, then `/Users/robin/Claude/Projects/GoldRush-assets/raw/kit-era-1.png`, then `/Users/robin/Claude/Projects/GoldRush-assets/raw/kit-era-10.png`
4. `/Users/robin/Claude/Projects/GoldRush-assets/raw/interview-cartoon-04.png`, then `/Users/robin/.goldrush/launch-video/B4-B5-B9-the-claim-1280x800-t2-claim-secured.jpg`
5. `/Users/robin/Claude/Projects/GoldRush-assets/raw/interview-cartoon-v2-01-same-door.png`, then `/Users/robin/.goldrush/launch-video/B10-lantern-show-1280x800-t1-tape-shelf.jpg`
6. `/Users/robin/Claude/Projects/GoldRush-assets/raw/interview-cartoon-06.png`, then `/Users/robin/Claude/Projects/Gold Rush/artifacts/audio-music-toggle-1/first-boot-desktop-chrome.jpg`
7. `/Users/robin/Claude/Projects/GoldRush-assets/raw/interview-cartoon-05.png`, then `/Users/robin/.goldrush/launch-video/B1-B6-B7-e1-night-shift-1280x800-t2-two-lights.jpg`
8. `/Users/robin/Claude/Projects/GoldRush-assets/raw/interview-cartoon-v2-09-the-door.png`, then `/Users/robin/.goldrush/launch-video/cut/gold-rush-launch-film-web-1280x800-v1-poster.jpg`

All sixteen attachments exist, and so do the teaser and the vertical cut named below (measured 2026-09-29): the images run from 190 KB to 3.7 MB, the film is 147.6 MB. `GoldRush-assets/raw/` is the art store that the repository's `assets/raw` links to.

**If X will not take the 94-second file:** attach the teaser `/Users/robin/.goldrush/launch-video/cut/gold-rush-launch-film-teaser-30s-1920x1080-v1.mp4` (30.000 s, 29.9 MB) to post 1 instead, and post 1 then reads "Here are 30 seconds of it." where it says "Here are 94 seconds of it."; nothing else changes. (The film sits inside X's upload limits as this session understands them, 140 s and 512 MB, but those limits were not checked today.)

**Keep for later, not this thread:** the teaser (a quote-post later in the day), and the vertical cut `/Users/robin/.goldrush/launch-video/cut/gold-rush-launch-film-vertical-1080x1920-v1.mp4` for phone-first places. The web copy is for the landing page, whose embed is a follow-up task; the landing does not carry the film yet (`site/index.html` has no video).
