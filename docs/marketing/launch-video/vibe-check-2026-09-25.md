# Vibe check: Gold Rush, the Frontier Edition (2026-09-25)

**What this is.** The owner asked, verbatim, on 2026-09-25: *"Can you make an Opus 5.5 max task to read the storybook, checkout the main artwork, and the game and do an overall vibe check? It should have a goal, so it could collect information it can use to do a launch video for the game in the style of the artwork. It should be fun and thrilling."* This page is the vibe check. The goal it serves is the launch film in `docs/marketing/launch-video/treatment.md`, and the frames to cut it from are gathered in `docs/marketing/launch-video/mood-board.md`.

**How it was made.** Phase 1 of `tasks/launch-video-vibe-check-1.md`, with no live boot (phase 2 will correct this page from one). I read the whole storybook (742 lines), the nine other lore pages, the brief (all of it, including §2 to §5 and §9), ADR-001, ADR-003 and ADR-004, the Frontier Edition spec, the saga index, every marketing doc and brief, and the landing page. Then I looked at 86 images with my own eyes: 33 from the art store, 29 map boards and in-game frames, 18 HUD, menu and system captures, the landing page's 5 images, and one contact sheet of five frames from the ten-eras reel. The full log is in `artifacts/launch-video-vibe-check-1/viewing-log.md`.

**How to read the paths.** Repo paths are relative to the repository root. `store:` means the art store at `/Users/robin/Claude/Projects/GoldRush-assets/raw/`. Every path on this page was checked by `artifacts/launch-video-vibe-check-1/check-paths.mjs`.

---

## 1. What Gold Rush is, in three sentences

> Gold Rush is a frontier survivors game you play in your browser: you stake a claim on a river, pan it for gold, build sluices and brass beacons, and hold it wave after wave until the claim is secured. The waves are the Fevered, ordinary frontier folk the Claim-Jumper Baron has infected with a hunger for gold, and your arc-casters do not kill them: they break the grip, and the word the game prints for a win is FREED. You never hold the claim alone: the Prospector, a brass helper, works at your side as far as you trust it, and on the county's boards humans and machines ride the same maps through the same door.

Five contracts are open in the Frontier Edition, and nine more eras wait on the survey table. The gold rush was never about the gold.

*Sources:* the concept and loop, brief §2. The Fevered, turned back and FREED: `lore/STORYBOOK.md:14`, `lore/STORYBOOK.md:39`, `lore/story-arc.md` (§THE GOLD FEVER, owner ruling 2026-07-13). The brass arc-caster: `lore/STORYBOOK.md:51`. The Prospector's ladder: `lore/STORYBOOK.md:44` and the game's own status lines in `src/game/Game.ts` (`prospectorIntroAbility`). The same door and five contracts: `site/index.html` ("Five frontier contracts in Epoch One... nine more epochs on the survey table"). The title thesis: `lore/STORYBOOK.md:6`.

---

## 2. The emotional pillars, as they show up today

The brief names five pillars: Warmth, Trust, Curiosity, Agency and Town pride (brief §3.4). A survivors game needs a sixth, which the brief states as a law rather than a pillar: "the brand is warm even when the genre is tense" (brief §4.5). For each pillar below: how it shows, the frame that proves it, and how strong it is right now.

### Warmth: welcoming before impressive
- **How it shows.** The plain boot *is* the storybook. The first screen is the valley plate with the pan emblem and one question, "Who's prospecting? Name the claim-holder before the first claim." The town's paper prints a victory as a kindness: "They were neighbours with gold dust in the creases of their faces, and they were freed, every one of them, and every one of them went home." At phone size the heroine and the Prospector read as themselves: her hat, teal charm and pan at the hip; its brass dome, miner's lamp and teal jet.
- **Proof.** `artifacts/ux-entry-robustness-1/desktop-chrome-menu-shared-contract.png`, `reviews/shots-gazette-unique/desktop-chrome-edition-5-baron.png`, `artifacts/sec-headers-and-data-hygiene-1/boots/390-the-claim.png`.
- **Strength.** Strong in the shell (menu, Herald, town). Medium on the maps, where the default daylight camera sees more ground than people.
- **Canon note.** In this canon, warmth means the empathic kind: being kept, seen and tended, never temperature (`lore/canon-rules.md`, §THE WARMTH DEFINITION). So the film's warmth has to be people and their helper keeping each other. Sunsets alone won't carry it.

### Trust: visible receipts, bounded autonomy
- **How it shows.** The HUD carries a chip: "the Prospector · suggest-only". Its toast says "Chip by weapon; claim wins grow it." The agent's job title climbs in the game's own words, from "follows and observes." to "can gather and mend with approval." to "does trusted chores." (`src/game/Game.ts`). The county's receipt is a replay, not a number: "THIS IS THE RIDE. THE COUNTY IS REPLAYING IT HERE IN YOUR BROWSER."
- **Proof.** `reviews/shots-prospector-presence/desktop-chrome-plain-boot.png`, `reviews/shots-true-reel-sprites/desktop-chrome-crown-mid-ride.png`, `reviews/shots-standing-formula-explained/desktop-chrome.png`. The claim-secured card stamps the growth as a receipt: "Territory +1, Science +2, Hero +1, Agent +1" (`artifacts/baron-presence/desktop-chrome-baron-defeat-card.png`, staged).
- **Strength.** The idea is the most original thing in the game. On screen it is type on parchment panels, so the film has to stage it: the ladder as three lines of type, the receipt as a lantern show.

### Curiosity: mystery, never confusion
- **How it shows.** The Baron's plate shows a shadow, not a face: an enormous man's silhouette laid across the road toward a lamp-lit valley, with five rockets streaking the sunset. On first boot the tavernkeeper asks the saga's question: "What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here." (`src/story/beats.ts`, the `first-boot` beat). The ten era plates hold one vantage while the valley grows steam, current, derricks, a dredge, a dome, radio rings, a rocket, a red canal and an Ark.
- **Proof.** `store:plate-contract-baron.png`, `artifacts/sol/map-art-campaign-2/run-10/code-presentation/e2-incline/board-1280.png` (the tavernkeeper's card is in frame), `store:kit-era-1.png` through `store:kit-era-10.png`.
- **Strength.** Strong. The copy and the plates already do this work.

### Agency: you are the settler, the agent is the helper
- **How it shows.** The contract card lays out the choice: "Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck." Where you build at the one ford decides who crosses. Panning is a place you choose to stand: "Gold Seam: A seam. Stand close and the pan works itself." And you command your helper: "The Prospector: Your deputy. G opens its charter. Select it, then click a seam to send it panning."
- **Proof.** `reviews/shots-prospector-presence/desktop-chrome-plain-boot.png` (the contract card), `artifacts/map-art-inventory-20260908/stations/e1-night-shift--seven_lantern_terraces.png` (the heroine kneeling at a seam), `artifacts/landmark-lighting-calibration/after-e1-night-shift-desktop-chrome.png` (the deputy's instruction).
- **Strength.** Medium in stills, strong in play. Agency lives in motion (build, hold, turn), so phase 2 must film a real build and hold, not a staged scene.

### Town pride
- **How it shows.** The canon town plate is a golden plaza of tavern, schoolhouse, chapel, store and claim office, with the Prospector hovering among the townsfolk. The in-game town is a sunlit square of red roofs with Mei's EXTRA card. The Herald's index reads like a family album of front pages: NEW HANDS, WELCOME; THE FIRST CLAIM HOLDS; THE DRY GULCH ANSWERS.
- **Proof.** `store:kit-town-canon.png`, `reviews/shots-town-cast/desktop-chrome.png`, `reviews/shots-gazette-unique/desktop-chrome-edition-5-baron.png`.
- **Strength.** Medium. In the Frontier Edition the town is a hub. The claim-becomes-a-town arc belongs to the saga's promise, not to this release's play.

### Warm dread: the genre's thrill, kept warm
- **How it shows.** Night Shift's light ramp takes the claim from full sun at wave 5, through golden at 6.5 and dusk at 8, to black at 10 (`assets/contracts/epoch-1-frontier/contracts.json`, `e1-night-shift`, `lightRamp`). After that the game is one lantern pool in the dark, with red-wrapped walkers pressing in at its rim, under the contract's own rule: "Beyond your light, the night owns the claim." The Baron arrives at four times a man's height under his banner. He taunts at waves 5, 12 and 18 ("The Baron sends his regards. The claim won't hold."), and his rockets are telegraphed 1.2 seconds before they land.
- **Proof.** `reviews/shots-night/desktop-chrome-after.png`, `reviews/shots-night/mobile-chrome-after.png`, `reviews/shots-bossbar/desktop-chrome-mid-fight.png`.
- **Strength.** The strongest feeling in the game today, and the film's spine.

---

## 3. Where the art and the game agree, and where they diverge

**The pattern first.** The plates are cinematography; the game is a map. Silhouettes and palette cross over. Vista and light do not. The game camera is fixed about 55 degrees down (camera offset 26.2 up and 18.3 back, wheel zoom 0.7 to 1.6 times: `src/game/Balance.ts`), so it sees ground, not horizon. The plates are low-angle panoramas lit at golden hour or by lamp. In the campaign's own ledger every map's visual acceptance is still open, and several are HELD by their camera, HUD and contract owners (`reviews/sol-map-art-current-status-20260909.md`, "Per-map readiness"). **So the rule for the film: plates for vista and light, the game for motion, agency and truth.**

### The five Frontier Edition maps

**The Claim** (`the-claim`)
- *Agrees:* warm sand ground, the river with its one centre ford, the tent and red-cabin silhouettes and, at phone size, the heroine and the Prospector exactly as their portraits. Carried by silhouette and palette.
- *Diverges:* the plate's river is a living bend with a gravel bar, a sluice pouring back, dusk light and a teal ribbon tied round the stake. The game's river is a straight, flat teal band under noon light.
- *Status:* objective PASS. Visual: "full fidelity still open: shoreline, ripple detail, gravel, timber/contact" (status doc, The Claim row).
- *Frames:* `store:plate-contract-the-claim.png` against `artifacts/sec-headers-and-data-hygiene-1/boots/1280-the-claim.png` and `artifacts/sec-headers-and-data-hygiene-1/boots/390-the-claim.png`. No campaign-2 board pairs this map with its plate (report, F-VIBE-8).

**The Dry Gulch** (`e1-dry-gulch`)
- *Agrees:* the best match of the five. The ochre-red palette, crackled mud, saguaro, a bison ribcage, the headframe and ore cart; the phone frame looks engraved. Carried by palette and texture.
- *Diverges:* the plate's heart, the one green spring the washes fall toward, is not in the entry frame. "Flat water, coarse shoreline, sparse vegetation and local contact detail remain" (status doc).
- *Status:* objective PASS on the phone (native wave 20). A later checkpoint heading records a full desktop pass ("Dry Gulch desktop19 full pass"). Final art acceptance is open.
- *Frames:* `store:plate-contract-dry-gulch.png` against `artifacts/sec-headers-and-data-hygiene-1/boots/1280-e1-dry-gulch.png` and `artifacts/sec-headers-and-data-hygiene-1/boots/390-e1-dry-gulch.png`. No campaign-2 board (F-VIBE-8).

**Night Shift** (`e1-night-shift`)
- *Agrees:* in feeling, once it is dark. A warm pool in black is the plate exactly. Carried by light.
- *Diverges:* the plate leads with seven burning lanterns in a receding procession. The game starts all seven posts cold. The owner ruled on 2026-09-24 that three should start lit and four cold (HM-01a, `docs/OWNER-DESK-2026-09-19.md`). That landing is queued for "the next quiet day" and has not happened yet; its master, `tasks/hm-01a-night-shift-lanterns.md`, still reads PARKED. The entry is daylight, cropped and covered by the HUD.
- *Status:* objective PARTIAL. Visual HELD: "seven cold fixtures and wide river geometry (contract owner); plain-entry cropping and HUD coverage".
- *Frames:* `store:plate-contract-night-shift.png`, `artifacts/sol/map-art-campaign-2/run-3/e1-night-shift/board-1280.png`, `reviews/shots-night/desktop-chrome-after.png`.

**Twin Banks** (`e1-twin-banks`)
- *Agrees:* in topology. The braid runs in an X around two gravel islands with twin fords (run 11 implemented it). Carried by silhouette.
- *Diverges:* the game's water is saturated turquoise where the plate is grey mirror. The entry camera cannot show both braids, and on the phone the river is offscreen at entry.
- *Status:* native play proof FAIL on 2026-09-25 (desktop died at wave 19, phone at wave 18). Visual: the braid is READY-FOR-GATES, the framing is held.
- *Frames:* `store:plate-contract-twin-banks.png`, `artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks/board-braid-1280.png`, `artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks/board-plain-390.png`.

**The Claim-Jumper Baron** (`e1-baron`)
- *Agrees:* in iconography. The oxblood crossed-pickaxe banners (three grounded standards), the red Rocket Cart and the seized headframe are all there. The kit portrait (top hat, waxed mustache, oxblood greatcoat, a watch chain across the waistcoat) is the man who walks in. Carried by silhouette and one colour: oxblood.
- *Diverges:* the plate's great idea, the Baron as a shadow thrown across a lit valley with rockets streaking the sunset, has no in-game equivalent. "The 55.21 m fort, second cart, broad occupied valley, desktop headframe crop and remaining HUD overlap are HELD."
- *Status:* native play proof FAIL on 2026-09-25 (desktop died at wave 16; the phone died at wave 23 with the Rocket Cart still at 33,237 of 53,347 HP). He is hard. That is a fact for the thrill, not the art.
- *Frames:* `store:plate-contract-baron.png`, `store:kit-the-baron.png`, `artifacts/sol/map-art-campaign-2/run-10/entry-framing/e1-baron/board-1280.png`, `reviews/shots-bossbar/desktop-chrome-mid-fight.png`.

### Twelve maps beyond the frontier (the promise, not the launch)

| Map | What agrees | What diverges | Board viewed |
|---|---|---|---|
| The Mare Claim (E8) | the strongest match of any board: three brass-ribbed glass domes on grey regolith; silhouette carries it | glass richness, inhabited interior and dressing still held | `artifacts/sol/map-art-campaign-2/run-2/e8-mare-claim/board-1280.png` |
| The Dust Flats (E4) | the ring-road topology | the derrick fields are missing at entry | `artifacts/sol/map-art-campaign-2/run-9/e4-dust-flats/board-1280.png` |
| The Hill Mine (E2) | the steam plumes over the boiler house | terraces dim, HUD heavy | `artifacts/sol/map-art-campaign-2/run-10/code-presentation/e2-hill-mine/board-1280.png` |
| The Trestle (E2) | the timber crib over the river | the gorge vista | `artifacts/sol/map-art-campaign-2/run-10/code-presentation/e2-trestle/board-1280.png` |
| The Incline (E2) | the rail line | the frame is dark | `artifacts/sol/map-art-campaign-2/run-10/code-presentation/e2-incline/board-1280.png` |
| The Canyon Works (E3) | the dynamo body | the plate's gorge strung with teal current reads as a flat dark plane | `artifacts/sol/map-art-campaign-2/run-9/e3-canyon-works/board-1280.png` |
| The Deepwater Claim (E5) | green water, the planked deck | the bell descending to the drowned town | `artifacts/sol/map-art-campaign-2/run-2/e5-deepwater-claim/board-1280.png` |
| The Glow Mesa (E6) | the derrick landmark | the raised mesa and the teal seams | `artifacts/sol/map-art-campaign-2/run-10/entry-framing/e6-glow-mesa/board-1280.png` |
| The Picnic (E6) | the checked blanket | the plate is a family crowd under attack; the game is an empty meadow | `artifacts/sol/map-art-campaign-2/run-9/e6-picnic/board-1280.png` |
| The Relay Valley (E7) | the plateau | a very dark boot; the towers go unseen | `artifacts/sol/map-art-campaign-2/run-2/e7-relay-valley/board-1280.png` |
| The Ember Shore (E10) | the lit brazier and the lava lines | the titan on the horizon and the warm palette (the ground reads olive) | `artifacts/sol/map-art-campaign-2/run-8/e10-ember-shore/board-1280.png` |
| The Archive World (E10) | stone arches | the canyon of shelves | `artifacts/sol/map-art-campaign-2/run-8/e10-archive-world/board-1280.png` |

**The lesson.** Landmark *objects* cross over; *places* do not. The film's promise beat uses the ten kit plates (illustration, labelled as the road ahead), not these boards.

---

## 4. The ten moments a viewer must see

| # | Moment | Map and situation | Frame that shows it today | Why it thrills |
|---|---|---|---|---|
| 1 | **"Who's prospecting?"** | The plain boot: the menu over the valley | `artifacts/ux-entry-robustness-1/desktop-chrome-menu-shared-contract.png` | The first frame of the game is already the art. There is no gap between the storybook and the play. |
| 2 | **The first pan** | The Claim: she kneels at a seam and "the pan works itself"; gold chimes | `store:plate-contract-the-claim.png` (the plate); `artifacts/map-art-inventory-20260908/stations/e1-night-shift--seven_lantern_terraces.png` (a kneel at a seam, in game) | The saga's first verb is also its last. The pan is never upgraded (`lore/STORYBOOK.md:50`, `lore/STORYBOOK.md:597`). |
| 3 | **The Fevered at the ford** | The Claim: gold-glow walkers wade the one crossing | `reviews/shots-legibility/fevered-crowd.png` (staged) | "The zombies want your gold, not your brains" (`docs/marketing/BRAND-BOOK.md` §1) in one picture. |
| 4 | **FREED** | The Claim: the arc takes them, teal rings open, they turn for home | `reviews/shots-legibility/freed-exodus.png` (staged), `reviews/shots-freed-walkers/machine-slump.png` | The genre's twist. Nobody dies; the fiction is what the damage does (`lore/canon-rules.md`, §THE CURE-ARMS LEXICON). |
| 5 | **Night falls** | Night Shift: golden at 6.5, dusk at 8, black at 10 | `reviews/shots-night/desktop-chrome-after.png`, `reviews/shots-night/mobile-chrome-after.png` | Dread without cruelty: a warm pool in black, and the walkers come to its rim. |
| 6 | **A lantern relit** | Night Shift: a cold post, 8 gold, and the pool opens on whoever is standing there | none yet (phase 2); the idea is in `store:plate-contract-night-shift.png` | Light is a purchase and a weapon at once. The player's choice decides what the camera can see. |
| 7 | **The banner at the twentieth horn** | The Baron: taunts at 5, 12 and 18, then the 4x boss, the Rocket Cart and telegraphed rockets | `reviews/shots-bossbar/desktop-chrome-mid-fight.png`, `store:plate-contract-baron.png` | Stage-melodrama menace, and the one villain with a face. |
| 8 | **THE BARON IS TURNED BACK** | The Herald's front page, No. 5 | `reviews/shots-gazette-unique/desktop-chrome-edition-5-baron.png` | The win arrives as the town's own news, in the town's voice, and it says the outfit were neighbours and every one went home. |
| 9 | **Her deputy** | The Claim: "follows and observes", then "Select it, then click a seam to send it panning" | `artifacts/sec-headers-and-data-hygiene-1/boots/390-the-claim.png`, `store:mkt-hero-16x9-f.png`, `artifacts/landmark-lighting-calibration/after-e1-night-shift-desktop-chrome.png`, `artifacts/baron-presence/desktop-chrome-baron-defeat-card.png` ("Agent +1", staged) | A helper you promote. Trust is a mechanic, earned by claim wins (`lore/STORYBOOK.md:44`). |
| 10 | **The same door** | The Field Book (RIDE IT YOURSELF / SEND YOUR RIG), Ride Together ("Invite your agent from the Calculating House"), the Lantern Show ("THIS IS THE RIDE.") | `reviews/shots-minds-and-rigs/minds-desktop-chrome.png`, `reviews/shots-mp-07c-3/desktop-chrome-invitation.png`, `reviews/shots-true-reel-sprites/desktop-chrome-crown-mid-ride.png` | Humans and machines on one board, and any ride can be watched in your own browser. No other game on the shelf has this. |

After the ten moments comes the promise, which is a frame rather than a moment: the valley that keeps everything, `store:kit-era-1.png` through `store:kit-era-10.png`, or the existing titled reel at `/Users/robin/GoldRushStream/loop/005-the-ten-eras-reel.mp4` (60 s, "TEN ERAS. ONE CLAIM.").

*A frame is only proof of the look.* Moments 3 and 4 were captured as staged review scenes (wave 0 at 00:00). Phase 2 films them in real play (report, F-VIBE-9).

---

## 5. Canon guardrails the film must never break

1. **No firearms, ever: not in a silhouette, not in a sound.** The Spark Rig is a brass arc-caster, turrets are brass, and rockets read as fireworks. Sound: "NO gunshot sounds, ever"; bolts are electric twangs (ADR-001, `docs/decisions/ADR-001-weapon-tech-language.md`; `specs/audio/README.md`; `docs/marketing/BRAND-BOOK.md` §2).
2. **Warm, illustrated, never gory. Nobody is killed.** The Fevered are FREED or TURNED BACK; no card ever says killed or slain (`lore/canon-rules.md`, §THE CURE-ARMS LEXICON; `lore/STORYBOOK.md:39`). The Baron's own exit line is canon: "Dragged off by his own men, swearing revenge." (`lore/characters.md`).
3. **Enemies are outlaws, companies, machines and nature, never peoples** (brief §9.3; `lore/canon-rules.md`, §THE STANDING GUARDRAILS). The Fevered are victims, "ordinary frontier folk" (`lore/STORYBOOK.md:37`). Shoot them that way: cut on the gold shine and the FREED turn, and never linger on a uniform crowd as the villain (report, F-VIBE-12).
4. **The heroine is a young woman, the claim-holder. She is never called "prospector"; that word belongs to the brass agent** (`lore/characters.md`; `lore/canon-rules.md`). She does not speak in cutscenes: "her verbs speak: pan, build, hold" (`lore/STORYBOOK.md:43`). Give her actions, not lines.
5. **The Prospector is brass with a teal core, a miner's lamp and a hover-jet. Teal is agent-tech only** (`docs/marketing/BRAND-BOOK.md` §2). The teal descends from her grandmother's charm, because "machines learned warmth from a person" (`lore/STORYBOOK.md:43`). Autonomy is granted, never assumed (`lore/STORYBOOK.md:421`).
6. **Agents begin at the Calculating House** (ADR-003, `docs/decisions/ADR-003-agent-origin.md`). The film may name the House, as the game's own Ride Together panel does. It never shows the House's founding.
7. **The mystery law.** No ceremony footage. No boss past its Act-0 dread for E2 onward. No era ending described. Never the Quiet, the watch, the kinship beat or the post-credits river (`docs/marketing/RELEASE-AND-EPOCH-PLAN.md`, header laws and §4 E10). The loop clip `/Users/robin/GoldRushStream/loop/003-ceremony-e3-voltage.mp4` exists and stays out. The remission beat is HELD and not canon (`lore/STORYBOOK.md`, E2).
8. **The Clock Law: no year printed in the fiction** (`lore/STORYBOOK.md:80`; `lore/canon-rules.md`). A release date, if the owner gives one, lives on the end card in plain type, outside the Gazette voice.
9. **No tokens, crypto or price talk, and no hype-speak** (`docs/marketing/BRAND-BOOK.md` §5; `docs/marketing/FEVER-CAMPAIGN.md`, laws). The end card names a place to play and nothing else (report, F-VIBE-5).
10. **Places and rituals, not tools** (brief §3.5, §9.4). The Claim Office, the Assay Office, the county book, the Lantern Show, the Book at the tavern. Monospace stays backstage (brief §4.2), so the Ride Together panel is cropped above its shell command (report, F-VIBE-13).
11. **In-game truth.** Show real footage at real speed; nothing is mocked up that the game can't show (`docs/marketing/BRAND-BOOK.md` §2 and §4). Concept plates are always framed as illustration, never passed off as gameplay (the honesty boundary of `marketing/reel/gold-rush-gameplay-ad-16x9-2026-07-13.md`).
12. **No letters inside artwork beyond the wordmark.** Every title is composited in the edit (`docs/marketing/BRAND-BOOK.md` §2).
13. **Fictional youngsters may appear; the owner's real family never** (`lore/characters.md`, §MARKETING KIDS-RULE). Minors are always clothed and belong to a household (`lore/canon-rules.md`).
14. **The owner approves every publication** (`docs/marketing/FEVER-CAMPAIGN.md`; `specs/marketing/README.md`, Laws). This treatment publishes nothing.

---

## 6. The verdict

Gold Rush is thrilling where the light is. That means Night Shift's fall from gold to black, the lantern pool with the Fevered at its rim, the Baron's banner coming up the valley at the twentieth horn, and the teal rings that turn a hungry crowd for home under the word FREED. It is fun in its own voice: the tavernkeeper's question, the Herald's front pages, and a brass deputy whose job title climbs from "follows and observes" to "does trusted chores". And it is genuinely new where the county replays any ride in your browser and a machine and a human come through the same door. It goes flat where the camera is. The default daylight boots, shot from a high fixed angle, turn beautiful plates into ground; the maps beyond the frontier are dimmer and flatter than their art; and the system screens are parchment panels of text. **The one thing the film should lean on is the lantern in the dark.** Every thrilling thing in this game happens at the edge of a pool of warm light, and that pool is also the canon's thesis made visible: the lit window the wanting cannot face, and the keeper whose light is the reply (`lore/world-dispatches.md`, Era 3, fragments 2 and 5). So light the film the way Night Shift is lit: warm pools, brown shadows, and the gold in the Fevered's eyes coming into the light hungry and leaving it freed. And the brass deputy at her shoulder is one of the night's lights too (the night-mode lane lists "hero, Prospector, powered lanterns, carried lanterns" as its light sources, `reviews/lane-night-mode-truth.md`), so the mission gets its image for free: in the dark, the agent beside her is a second lamp.
