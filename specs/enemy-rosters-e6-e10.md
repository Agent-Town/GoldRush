# ENEMY ROSTERS E6-E10 — design sheets from the book

## NO-BLOCKER LAW

Owner, 2026-07-18, verbatim: **"you can wire things in game, I just correct them later. I am already blocking so much work - lets not add more to that."**

The pipeline runs **design -> art -> wiring without waiting for owner review at any stage**. Corrections land post-hoc. Every choice below is reversible at one seam: mobile identities live in contract `enemyRoster` data, weather identities live in a contract-owned hazard descriptor, art lives behind one slot per identity, and each contract owns its lists. A correction swaps one roster row, one hazard descriptor, one slot mapping, or one contract list without changing shared movement code.

## Reading laws

- Source order: `lore/STORYBOOK.md` E6-E10 supplies the fiction; the design-locked epoch bundles settle roster conflicts; current `Enemy.ts`, `WaveSystem.ts`, and `OrbitSpawner.ts` supply the reusable movement grammar.
- **Mutation-law read:** E6 wants helpfulness; E7 wants voices and recorded patterns; E8 is the law's negative proof, beyond the Fever's reach, where appetite is ordinary, signed, and billable; E9 is the clean world; E10 is the Fever's final mutation, a want for meaning itself.
- **E9 law, verbatim:** **"nothing on this world WANTS. Things merely work, or weather"** (`STORYBOOK.md:535`). No E9 face or rivet carries the gold-dust tell.
- Cure-arms copy uses only **freed**, **turned back**, **powers down**, and **disperses**. E8-E9 company crews and weather are not Fevered; the same outcomes describe their warm, non-gory exit presentation without changing that fact.
- Reused movement names are literal: **chase** = current hero-target + formation steering; **lane** = current edge/scripted-route movement; **orbit** = current orbit-then-peel route; **siege** = current building-target route. Existing thief state may layer onto lane or orbit.
- Roster wiring adds no general AI. Each era may own one shared signature behavior family, identified below; all other movement stays on the four existing archetypes.
- Art law: Frontier Ledger linework, era palette, no letters, no watermarks, warm and never gory. Animated source cells normalize into the existing 244-332 px enemy subject band; runtime scale establishes the stated world-height ratio against `char.claim_jumper`.
- **PROPOSAL** means chapter-uncited. It remains data-driven and replaceable even when a design-locked bundle or existing plate already supplies it.

## E6 — The Atomic Homestead

**Roster law:** the strain wants HELPFULNESS and wants to be wanted. Gold seams at feral rivets identify the grip; amber enamel is Combine paint beneath it. The era's one signature family is **herd drive** on the Lawn-Shepherd; the Homemaker reuses the already specified component-boss siege path.

| id | name (mutation-law voice) | class (machine/nature/company/static) | cure-arms outcome (freed walks home / powers down / disperses) | behavior in one sentence (sim-grammar: chase/lane/orbit/siege — reuse existing movement archetypes, name which) | visual brief for the art batch (era vocabulary, height band vs existing sprites, NO letters, warm-never-gory) | chapter citation (line/quote) |
|---|---|---|---|---|---|---|
| `feral_toaster` | **Feral Toaster — wants every breakfast served** | machine | powers down; a fully wound-down unit can be wrangled into the pen | Reuse **chase** with the current formation spread; hopping and toast arcs are animation/readability, not a second movement controller. | Knee-high at 0.45x claim-jumper world height; chrome and pastel enamel, amber heat slots, gold seams at rivets, teal decay dial; no letters; warm, never gory. | `STORYBOOK.md:320,328` — "chasing a runaway toaster"; "a toaster that wants to serve you to death." |
| `lawn_shepherd` | **Lawn-Shepherd — wants every customer neatly gathered** | machine | powers down; an exhausted shepherd is freed into the pen and stays well | Reuse **lane** toward the claim, plus E6's sole signature **herd drive**, a deterministic steering bias that draws nearby toaster lanes with it. | 0.65x claim-jumper height; low chrome-and-mint mower, copper shepherd loop, readable teal dial, gold seams only at feral rivets; no letters; warm, never gory. | `STORYBOOK.md:328-329` — "a mower that herds its own customers"; "a lassoed lawn-shepherd, exhausted, freed of the hunger." |
| `glowjack` | **Glowjack — wants the mesa's glow inventoried** **[PROPOSAL: chapter-uncited]** | company | freed walks home, leaving the isotope satchel behind | Reuse **lane + thief state**: seek the nearest era-resource holding, grab, then flee through the spawn edge. | Match the 1.0x claim-jumper adult band; lead-lined enamel-mint duster, amber goggles, sample satchel and copper tongs only; no letters; warm, never gory. | **PROPOSAL — no E6 chapter citation.** Design-locked source: `e6-atomic-bundle.md:11`; existing plate: `plate-e6-enemy-glowjack.png`. |
| `homemaker_9000` | **The Homemaker-9000 — wants every chore DONE** | machine | powers down in the chair it builds; the town keeps it on tended ground | Reuse **siege** through the existing Homemaker component path: VAC prioritizes town works, RACK holds a lane, CORE ends the schedule. | House-sized component silhouette at 3.5x claim-jumper height; polished chrome, pastel enamel, pictogram-only bubbles, VAC/RACK/CORE shapes readable without labels; no letters; warm, never gory. | `STORYBOOK.md:367-371` — "the boss that helps you to death"; "Builds ONE CHAIR from debris"; "Powers down." |

**Archetype audit:** chase 1 · lane 2 · orbit 0 · siege 1 · signature families 1 (`herd drive`).

## E7 — The Signal Era

**Roster law:** the strain wants the network because it cannot make a voice of its own; it steals recordings and walks familiar gestures wrong. The era's one signature family is **corrupted replay**, shared by Rogue Automata at unit scale and the Echo at base scale.

| id | name (mutation-law voice) | class (machine/nature/company/static) | cure-arms outcome (freed walks home / powers down / disperses) | behavior in one sentence (sim-grammar: chase/lane/orbit/siege — reuse existing movement archetypes, name which) | visual brief for the art batch (era vocabulary, height band vs existing sprites, NO letters, warm-never-gory) | chapter citation (line/quote) |
|---|---|---|---|---|---|---|
| `rogue_automaton` | **Rogue Automaton — wants your habit for its own** | machine | powers down; the corrupted recording is turned back into a readable tape | Reuse **lane** over a bounded scripted route, with E7's shared **corrupted replay** selecting and misordering deterministic route beats. | Match the 1.0x claim-jumper band; agent-frame silhouette, tangled punch tape, honey-glass tubes, broken teal poses and gold seams at the frame; no letters; warm, never gory. | `STORYBOOK.md:410-411` — "the strain wants voices"; "your habits, glitched and embodied, walking your own patrol routes wrong." |
| `data_rustler` | **Data-Rustler — wants every voice in the ledger** | company | freed walks home, leaving the tapped reel to the archive | Reuse **lane + thief state**: seek the nearest relay holding, siphon, then flee through the entry edge. | Match the 1.0x claim-jumper adult band; crystal-set backpack, copper clips, coiled wire and relay tools only, old rail-scrip accent; no letters; warm, never gory. | `STORYBOOK.md:410-411,425` — "data-rustlers tap relays and siphon signal"; "anonymous, settles in old rail scrip." |
| `static_hare` | **Static Hare — wants every drone on the ground** **[PROPOSAL: chapter-uncited]** | nature | disperses in a harmless crackle; grounded drones recover | Reuse **lane** over E7's shared **corrupted replay**: sample a drone's bounded route beats, misorder them, and finish on the ordinary hero target without adding a drone-target resolver. | 0.35x claim-jumper height per hare, read as a compact flock; parchment fur, honey-gold crackle, broken teal signal ripples, playful bounding silhouettes; no letters; warm, never gory. | **PROPOSAL — no E7 chapter citation.** Design-locked source: `e7-signal-bundle.md:10`; existing plate: `plate-e7-enemy-static-hare.png`. |
| `the_echo` | **The Echo — wants certainty through your pattern** | static | disperses to one bright mote; the House jars what remains | Reuse **siege** as an advancing copied perimeter; E7's shared **corrupted replay** supplies the player's layout and recorded actions at boss scale. | Source-height follows each copied object at 1.0x; one semi-reflective teal/honey echo mask unifies copied walls, rigs and paths instead of a fixed body; no letters; warm, never gory. | `STORYBOOK.md:442-446` — "the boss that is your base"; "replaying your last-wave actions"; "de-rezzes to a single bright mote." |

**Archetype audit:** chase 0 · lane 3 · orbit 0 · siege 1 · signature families 1 (`corrupted replay`).

## E8 — The Orbital Frontier

**Roster law:** E8 has no Fever strain. Its adversaries are the contrast set: ordinary greed with paperwork, weather, and consequence. Their wants are sane rather than Fevered: paid work, a valid invoice, a finished repossession. The era's one signature family is **descending repossession** on the Claw.

| id | name (mutation-law voice) | class (machine/nature/company/static) | cure-arms outcome (freed walks home / powers down / disperses) | behavior in one sentence (sim-grammar: chase/lane/orbit/siege — reuse existing movement archetypes, name which) | visual brief for the art batch (era vocabulary, height band vs existing sprites, NO letters, warm-never-gory) | chapter citation (line/quote) |
|---|---|---|---|---|---|---|
| `scrap_corsair` | **Scrap Corsair — wants the invoice settled** | company | freed walks home; the crew descends in good order | Reuse **orbit** around the claim and the current peel route into **chase**, presenting a grapple descent without another steering model. | 1.1x claim-jumper adult band including suit pack; silver-and-teal vacuum suit, brass joints, magnet gaff, blank pictogram tag, no gold seams; no letters; warm, never gory. | `STORYBOOK.md:481,506,508` — "unfevered greed with paperwork"; "corsairs rappel DOWN the lines"; "the crew takes the warm-law walk." |
| `debris_rain` | **Debris Rain — wants nothing; consequence follows its arc** | nature | disperses into harmless salvage pickups | Reuse **lane geometry** in a contract hazard scheduler—fixed entry arc, fixed landing lane, no target selection—and never route this row through `enemyRoster`. | Pieces range 0.25-0.75x claim-jumper height; warm-grey orbital scraps with silver/brass edges, teal arc telegraph, generous negative space; no letters; warm, never gory. | `STORYBOOK.md:480-481,505-506` — "debris rain (consequence, not craving)"; "debris rain intensifies on telegraphed arcs." |
| `sun_glare_shambler` | **Sun-Glare Shambler — wants nothing; glare drives the old route** | machine | powers down in shade and is herded home gently | Reuse slow **chase** with the current formation spread; shade is a treatment modifier, not a movement branch. | 0.8x claim-jumper height; squat old rover, warm-grey stipple, amber eye grammar, over-bright sunward panel and soft teal shade state, no gold seams; no letters; warm, never gory. | `STORYBOOK.md:480-481` — "sun-glare shamblers (weather, not want)"; "herded home to shade and powered down gently." |
| `salvage_kings_claw` | **The Salvage King's Claw — wants the whole claim repossessed** | company | powers down; its platform becomes the Low Orbit yard | Reuse **siege** for landed building targets, with E8's sole signature **descending repossession** moving CROWN -> WINCH -> ANCHOR-FEET before siege begins. | 3.5x claim-jumper-height platform read; silver/brass grapple crown, cable winch and anchor feet as unlabeled component silhouettes, blank claw-stamp tags; no letters; warm, never gory. | `STORYBOOK.md:504-508` — "The era's dread is PAPERWORK"; "begins lifting WHOLE BUILDINGS"; "the town rebuilds it as its first orbital yard." |

**Archetype audit:** chase 1 · lane 1 · orbit 1 · siege 1 · signature families 1 (`descending repossession`).

## E9 — The Red Fields

**Roster law:** **"nothing on this world WANTS. Things merely work, or weather."** Dust devils weather; terraformers and the Digger execute old instructions; prospect drones perform ordinary claim business. The era's one signature family is **blueprint reprogramming** on the Old Digger.

| id | name (mutation-law voice) | class (machine/nature/company/static) | cure-arms outcome (freed walks home / powers down / disperses) | behavior in one sentence (sim-grammar: chase/lane/orbit/siege — reuse existing movement archetypes, name which) | visual brief for the art batch (era vocabulary, height band vs existing sprites, NO letters, warm-never-gory) | chapter citation (line/quote) |
|---|---|---|---|---|---|---|
| `dust_devil` | **Dust Devil — wants nothing; weather takes the crooked lane** | nature | disperses, dropping every carried object intact | Reuse **lane geometry** on scheduled waypoints in a contract hazard scheduler; pickup/relocation are contact payloads, and this row never enters `enemyRoster`. | Column reaches 1.6x claim-jumper height; rust-red hatch spirals, parchment gaps, loose props visibly circling, no face and no gold tell; no letters; warm, never gory. | `STORYBOOK.md:535,557` — "dust devils are weather with a sense of humor"; "PICK THEM UP and RELOCATE them." |
| `feral_terraformer` | **Faithful Terraformer — wants nothing; the blueprint says continue** | machine | powers down beside the corrected canal | Reuse **siege** against the nearest canal/building target, presenting the hit as a precise old-plan correction. | 1.8x claim-jumper height; house-sized old Combine craft, rust-red dust, amber work lamp without gold seams, teal correction state; no letters; warm, never gory. | `STORYBOOK.md:535,544` — "craftsmanship gone wrong-by-faithfulness"; "a perfect machine, working perfectly, wrong." |
| `claim_jump_prospect_drone` | **Claim-Jump Prospect Drone — wants nothing; the invoice says survey** | company | powers down; its claim tag folds blank | Reuse **orbit + thief state** around the nearest era-resource holding, then peel to the exit edge after a claim scan. | 0.45x claim-jumper height; brass/regolith crow-like survey drone, teal sensor, blank folding claim tag, bored posture, no gold seams; no letters; warm, never gory. | `STORYBOOK.md:535` — "claim-jump prospect drones"; "sane greed, billable, bored." |
| `old_digger` | **The Old Digger — wants nothing; the old tape says dig** | machine | powers down for the tape swap, then returns to work under the reeve's charts | Reuse **siege** while executing the old canal plan; E9's sole signature **blueprint reprogramming** pauses the hull, swaps the recorded route, and resumes it as town fleet. | 4.0x claim-jumper-height landmark; ancient bucket wheels, boarding gantries, one preserved corporate seal as pictogram only, repairable teal state, no gold seams; no letters; warm, never gory. | `STORYBOOK.md:560-564` — "the fight is a REPROGRAMMING"; "replace its blueprint mid-operation"; "It joins the town's fleet." |

**Archetype audit:** chase 0 · lane 1 · orbit 1 · siege 2 · signature families 1 (`blueprint reprogramming`).

## E10 — The Deep Sky

**Roster law:** the Static is the Fever's final mutation, a want for MEANING: ink, color, memory, attention, pattern and care. Its forms are the finale's grammar—mote, unraveled memory, squall, heart. The era's one signature family is **Static aura**, shared as bounded desaturation/mix-duck rings and strongest on the Quiet.

| id | name (mutation-law voice) | class (machine/nature/company/static) | cure-arms outcome (freed walks home / powers down / disperses) | behavior in one sentence (sim-grammar: chase/lane/orbit/siege — reuse existing movement archetypes, name which) | visual brief for the art batch (era vocabulary, height band vs existing sprites, NO letters, warm-never-gory) | chapter citation (line/quote) |
|---|---|---|---|---|---|---|
| `static_mote` | **Static Mote — wants the smallest remembered color** | static | disperses under re-ink; one mote is kept in a jar | Reuse **orbit** around the nearest lit or remembered objective, then peel inward on the existing orbit route. | 0.25x claim-jumper height; tiny un-inked parchment wisp with a thin inverse-gold rim, no face; the shared Static aura stays very small; no letters; warm, never gory. | `STORYBOOK.md:591-593,613` — "a want for meaning itself"; "one static-mote, kept, in a jar." |
| `unraveled_machine` | **Unraveled Memory — wants its borrowed shape remembered** | static | disperses; the source era's portrait-memory re-inks on the wall ledger | Reuse **chase** from whichever prior-era enemy identity the mask wraps; source class and movement stay intact beneath the shared Static presentation. | Reuse each source sheet at its exact original height; one half-un-ink mask grays edges while preserving the era silhouette and one warm color clue; no letters; warm, never gory. | `STORYBOOK.md:609-611` — "unraveled machines board"; "every prior era's enemies return half-un-inked"; "Every one dispersed restores a MEMORY." |
| `static_squall` | **Static Squall — wants every channel quiet at once** | static | disperses as color and sound return behind it | Reuse **lane geometry** as a scheduled front in the contract weather scheduler; the shared Static aura supplies bounded desaturation/mix thinning, and this row never enters `enemyRoster`. | Screen-tall weather band rather than a body; un-inked paper edge with sparse deep-ink stipple and a readable warm re-ink wake; no letters; warm, never gory. | `STORYBOOK.md:601-605,609-613` — "Static squalls"; "rings of desaturation"; "the music thins channel by channel." |
| `the_quiet` | **The Quiet — wants all meaning to stop asking back** | static | disperses in play but is presented as **RECEDES**; ink, instruments and portraits return | Reuse **siege** against the three preserves; E10's sole **Static aura** expands, forgets older-era cure-arms first while leaving the Starlight Pan usable, then weakens as lantern, song and portrait hold. | 4.0x claim-jumper-height storm-heart read, mostly absence; concentric un-ink rings, deep-ink core and three preserved warm accents, never a creature face; no letters; warm, never gory. | `STORYBOOK.md:609-613` — "it is an ABSENCE"; "YOUR WEAPONS — the oldest first — stop working"; "The Quiet does not die. It RECEDES." |

**Archetype audit:** chase 1 · lane 1 · orbit 1 · siege 1 · signature families 1 (`Static aura`).

## THE ART BATCH PLAN

Run these as five sequential roster batches, **one batch in flight at a time**. Reuse the accepted saga-library plates as conditioning references; do not regenerate reference plates. Each accepted file maps to one slot, so a post-hoc replacement changes only that slot's files and ledger row.

### Batch R-E6 — Atomic roster

- `char.e6.feral_toaster` <- `enm-feral-toaster-sheet.png` (4x4 hop phases; reference `plate-e6-enemy-feral-toaster.png`).
- `char.e6.lawn_shepherd` <- `enm-lawn-shepherd-sheet-a.png`, `enm-lawn-shepherd-sheet-b.png` (walk4 A/B; reference `plate-e6-enemy-lawn-shepherd.png`).
- `char.e6.glowjack` <- `enm-glowjack-sheet-a.png`, `enm-glowjack-sheet-b.png` (walk4 A/B; reference `plate-e6-enemy-glowjack.png`).
- `boss.e6.homemaker_9000` <- `boss-homemaker-9000.png`, `boss-homemaker-9000-damage.png` (component cutouts; reference `plate-e6-boss-homemaker-9000.png`).
- Batch size: **4 slots / 7 files**. Accept, process, ledger, and close before R-E7 starts.

### Batch R-E7 — Signal roster

- `char.e7.rogue_automaton` <- `enm-rogue-automaton-sheet-a.png`, `enm-rogue-automaton-sheet-b.png` (walk4 A/B with deliberately misordered pose read; reference `plate-e7-enemy-rogue-automaton.png`).
- `char.e7.data_rustler` <- `enm-data-rustler-sheet-a.png`, `enm-data-rustler-sheet-b.png` (walk4 A/B; reference `plate-e7-enemy-data-rustler.png`).
- `char.e7.static_hare` <- `enm-static-hare-sheet.png` (4x4 bound phases; reference `plate-e7-enemy-static-hare.png`).
- `fx.e7.echo_mask` <- `boss-the-echo-mask-sheet.png` (copied-object material/mask states; reference `plate-e7-boss-the-echo.png`).
- Batch size: **4 slots / 6 files**. The Echo receives no fixed body sheet.

### Batch R-E8 — Orbital roster

- `char.e8.scrap_corsair` <- `enm-scrap-corsair-sheet-a.png`, `enm-scrap-corsair-sheet-b.png` (walk4 A/B).
- `hazard.e8.debris_rain` <- `enm-debris-rain-sheet.png` (4x4 telegraph/flight/landing/dispersal phases).
- `char.e8.sun_glare_shambler` <- `enm-sun-glare-shambler-sheet-a.png`, `enm-sun-glare-shambler-sheet-b.png` (walk4 A/B).
- `boss.e8.salvage_kings_claw` <- **new runtime cutouts** `boss-salvage-claw-cutout.png`, `boss-salvage-claw-damage-cutout.png`.
- Batch conditioning: `plate-e8-enemies-roster.png`, `plate-e8-boss-salvage-kings-claw.png`, and the existing `boss-salvage-claw*.png` full-bleed scenes. Those 1672x941 RGB scenes are references only—unprocessed and not slot-ready—so the new cutouts still require normal transparency, thumbnail, ledger, and attended-QA gates.
- Batch size: **4 slots / 7 files**.

### Batch R-E9 — Red Fields roster

- `hazard.e9.dust_devil` <- `enm-dust-devil-sheet.png` (4x4 wander/pickup/carry/drop phases; reference `plate-e9-enemy-dust-devil.png`).
- `char.e9.feral_terraformer` <- `enm-feral-terraformer-sheet-a.png`, `enm-feral-terraformer-sheet-b.png` (walk4 A/B; derive family shape from the accepted Old Digger plate).
- `char.e9.claim_jump_prospect_drone` <- `enm-claim-jump-prospect-drone-sheet.png` (4x4 hover/orbit/scan/fold phases; reference `plate-e9-enemy-claim-crow.png`).
- `boss.e9.old_digger` <- **new runtime cutouts** `boss-old-digger-cutout.png`, `boss-old-digger-gentle-cutout.png`.
- Batch size: **4 slots / 6 files**. The existing `boss-old-digger*.png` files are unprocessed full-bleed conditioning scenes, not slot-ready art; generate the cutouts through the normal transparency, thumbnail, ledger, and attended-QA gates. Default without review: derive the missing terraformer reference from `plate-e9-boss-old-digger.png`, keeping it clearly smaller and simpler.

### Batch R-E10 — Deep Sky roster

- `char.e10.static_mote` <- `enm-static-mote-sheet.png` (4x4 drift/orbit/re-ink/dispersal phases; condition on `plate-e10-boss-the-quiet.png`).
- `fx.e10.unravel_mask` <- `fx-static-unravel-mask.png` (one reusable mask treatment; no duplicate prior-era sheets).
- `hazard.e10.static_squall` <- `enm-static-squall-sheet.png` (4x4 front-edge states suitable for tiling).
- `boss.e10.the_quiet` <- `boss-the-quiet.png`, `boss-the-quiet-recede.png` (storm-heart and re-ink states; condition on `plate-e10-boss-the-quiet.png`).
- Batch size: **4 slots / 5 files**. Art efficiency law holds: prior-era identities return through one mask.

## THE WIRING PLAN

Add **mobile** identities as per-contract `twist.enemyRoster` entries and use existing `baron`/boss hooks for boss rows. Add debris rain, dust devils, and Static squalls through a separate contract-owned hazard descriptor/scheduler that reuses lane geometry but never calls `WaveSystem`'s `ClaimJumperEnemy` roster path; this is a data/schedule seam, not another target-selection AI. Keep all HP, speed, share, and cadence numbers out of this design slice and under the later balance pass. The list below is the complete reversible contract routing.

### E6 contract family

- `e6-glow-mesa`: `feral_toaster` (chase), `lawn_shepherd` (lane/herd), `glowjack` (lane/thief); existing wave-8 `homemaker_9000` boss remains.
- `e6-showroom`: `feral_toaster`, `lawn_shepherd`; waking order enables product families, not new identities.
- `e6-half-life-hollow`: `feral_toaster`, `glowjack`, then `lawn_shepherd`; timed terrain changes routes, not roster code.
- `e6-picnic`: `feral_toaster`, `lawn_shepherd`; omit Glowjacks because lunch, not isotope holdings, is the contract target.

### E7 contract family

- `e7-relay-valley`: `rogue_automaton`, `data_rustler`, `static_hare`.
- `e7-echo-canyon`: all three standard entries; route the chapter's Echo encounter through `the_echo` boss hook.
- `e7-dead-band`: `data_rustler`, `static_hare`; omit Rogue Automata because playbooks are unavailable here.
- `e7-relay-rush`: `data_rustler`, `static_hare`, then `rogue_automaton`; the scheduled interference front stays contract weather, not a fifth roster identity.

### E8 contract family

- `e8-mare-claim`: enemy roster `scrap_corsair`, `sun_glare_shambler`; hazard list `debris_rain`; route the Claw finale through `salvage_kings_claw` boss hook.
- `e8-far-side`: enemy roster `sun_glare_shambler`; hazard list `debris_rain`; omit corsairs to preserve the chapter's lonely subtraction.
- `e8-low-orbit`: enemy roster `scrap_corsair`; hazard list `debris_rain`; the salvaged yard is scenery, not a repeated boss.
- `e8-eclipse`: enemy roster `sun_glare_shambler`, then `scrap_corsair`; hazard list `debris_rain`; darkness changes presentation and power pressure only.

### E9 contract family

- `e9-dome-basin`: enemy roster `feral_terraformer`, `claim_jump_prospect_drone`; hazard list `dust_devil`; route the Old Digger finale through `old_digger` boss hook.
- `e9-seed-run`: enemy roster `claim_jump_prospect_drone`, `feral_terraformer`; hazard list `dust_devil`; siege selects the caravan fixture through the existing building-target seam.
- `e9-devils-alley`: enemy roster `claim_jump_prospect_drone`; hazard list `dust_devil`; omit terraformers so relocation remains the map's single joke.
- `e9-old-canal`: enemy roster `feral_terraformer`, `claim_jump_prospect_drone`; hazard list `dust_devil`; the inherited canal supplies targets, not a second Digger encounter.

### E10 contract family

- `e10-ember-shore`: enemy roster `static_mote`, `unraveled_machine`; hazard list `static_squall`.
- `e10-archive-world`: enemy roster `static_mote`, then `unraveled_machine` as rescued wings re-ink; hazard list `static_squall`.
- `e10-last-claim`: both standard enemy entries plus hazard `static_squall`; route the finale through `the_quiet` boss hook, including oldest-first cure-arm forgetting inside its aura.
- `e10-river`: empty `enemyRoster`, no boss, no waves. This contract remains one pan and the river.

## SELF-CHECK

- Five era tables present; each has exactly 4 entries and the required 7 columns.
- All chapter-backed entries carry line-and-quote citations; the two chapter gaps are visibly marked **PROPOSAL** and cite their design-locked bundle/plate sources.
- E6-E7 cravings, E8 beyond-reach contrast, E9 clean-world law, and E10 meaning appetite are explicit.
- One signature behavior family per era, maximum; all other movement names an existing chase/lane/orbit/siege archetype.
- Art queues are sequential, filenames follow current `enm-*-sheet[-a/-b].png` and `boss-*.png` conventions, and every identity owns one reversible slot.
- Lexicon check is clean for prohibited cure-arms terms; visual law is no letters, warm, never gory.
- No code, generated art, balance value, existing spec, review, or orchestrator ledger changed.

## READY-FOR-GATES

- **E6:** helpful appliances move in; the pen turns patience into a roster rule.
- **E7:** the hunger steals voices and habits; one replay substrate scales from automata to the Echo.
- **E8:** no Fever crossed the black; paperwork, glare, debris and repossession provide the pressure.
- **E9:** nothing wants; weather and faithful work test a town that keeps tending anyway.
- **E10:** the Static wants meaning; mote, memory, squall and Quiet form the finale's grammar.

### Open questions for the owner (post-hoc; none blocks design -> art -> wiring)

1. Keep Glowjack in E6 as the bundle's company/thief entry, or replace it with a fourth appliance so every standard E6 row carries the helpfulness strain?
2. Keep Static Hare in E7 and add one chapter sentence later, or replace it with the chapter-cited Interference Front as a roster hazard?
3. Is the E8 Scrap Corsair public line **"wants the invoice settled"** dry enough, or should every unfevered E8 name use an explicit **"wants nothing; works for pay"** form?
4. Keep the existing **Claim Crow** plate as the look of the chapter's Claim-Jump Prospect Drone, or reserve that plate for a later variant?
5. For the Quiet's gameplay outcome, may the diagnostics value remain `disperses` while every player-facing surface says **RECEDES**?
