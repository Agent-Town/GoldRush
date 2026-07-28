# Task art-e9-town-icons: THE E9 TOWNSFOLK — the Red Fields cast, fourth rung of the pinned portrait convention (ART SLOT)
FIRE-AUTHORED s1165, **RE-AUTHORED s1166 AS ATTEMPT 2 WITH A CHANGED PREMISE (§7.5)** (attended review welcome) — **6 files EXACT: 4 fresh portraits + 1 identity-preserving aging edit + 1 five-up contact sheet. The same shape as the E7 batch (LEDGER row 62), for the reason given below.**
You are Codex with image_gen, running in the ART slot.
CODEX: model=gpt-5.6-sol effort=high

> 🔁 **ATTEMPT 1 STOPPED LAWFULLY AND YOU SHOULD READ WHY BEFORE YOU START** (`reviews/art-e9-town-icons-stop.md`, runner commit `9ae877d9`, zero art diff). It generated **five** native canal-reeve portraits — **118.8 · 184.4 · 171.7 · 75.1 · 161.0** — none inside the admissible band, and stopped as instructed. **It did nothing wrong: every number was reported, no channel arithmetic was applied, and nothing was copied into `assets/raw/`.** Two things about attempt 1's MASTER were wrong, and both are fixed below.
> **(1) THE FIVE-ATTEMPT CAP WAS SET BELOW THE MEASURED COST OF A SUCCESS (F-1166-2).** Chalk — the only portrait ever completed under this exact absolute band — was **selected on attempt SIX** (`reviews/art-e7-chalk-portrait.md:62-72`), and her first five (111.4 · 87.7 · 208.9 · 113.7 · 199.8) are **the same bimodal miss pattern** as the reeve's five, which in fact average *slightly cooler* (142.2 vs 144.4). **A five-cap would have stopped Chalk one attempt before the portrait that shipped.** So attempt 1's stop is a sampling artifact of a tight cap, **not** a verdict that E9's palette cannot meet the band. The cap is raised below, and it costs nothing: `AGENTS.md:26` **IMAGE GENERATION LAW — native `image_gen` "is free"** (verified at source s1166).
> **(2) THE BACKDROP CONSTRAINT EXISTED ONLY AS PROSE (F-1166-3).** §77's *"a rust-red world does not require a rust-red parchment ground"* sat in the **retake rule's rationale**, while the clause that actually reached the generator — the style anchor — said only *"on parchment"*, and the E9 palette rider said **"rust-red engraved earth/timber"** with nothing confining that to costume and props. **The two 60×60 corners the statistic measures are exactly where a generator puts "rust-red earth".** It is now a binding clause in every prompt.
> ⚠️ **THE BAND ITSELF IS NOT TOUCHED AND MUST NOT BE.** 124–145 is the convention-bearing constant across all 22 shipped portraits and the entire point of F-1162-2. **If you find yourself wanting to widen it, STOP and report instead** — widening the band is an owner call, not yours or mine.

## Why — the E7 era-art row closed an hour ago and E9's A4 row is the next one owed
**Unshipped proof (F-1044-4 art gate — cite the BACKLOG line):** `tasks/BACKLOG.md:1518` verbatim: *"**NEXT ART RUNG — `art-e9-town-icons` (THE E9 TOWNSFOLK). READY TO AUTHOR, CITATIONS GATHERED s1164** … With `art-e7-chalk-portrait` shipped (`ad7f2a9c`, LEDGER row 64) the **ART SLOT IS FREE and the E7 era-art row is CLOSED**."*

**The audit row you are filling**, `reviews/era-art-audit.md:93` verbatim: *"| A4 | Canal Reeve; Ice Quarry Chief; Greenkeeper; Weather Warden; grown Moon-born Child; aging pass | **MISSING ×6** | `plate-e9-townsfolk-era.png` is explicitly absent (`assets/LEDGER.md:187`). Owed five named `tf-*-e9.png` outputs plus `<existing-tf-id>-e9.png` edits. |"*

**File-probe agrees (run s1165 this fire, not inherited):** `git ls-files | grep -Ei 'tf-.*e9|e9.*tf-'` returns **ZERO rows**, and no `art-e9-*-town-icons` master exists. The class is owner-unblocked (E6 `c7601082` row 61 → E7 `7873eaee` row 62 → E8 `1d25c5cf` row 63 → Chalk `ad7f2a9c` row 64); **22 `tf-*.png` portraits ship today and none of them is E9.**

### ⚠️ WHY THIS IS **FIVE** PORTRAITS AND A **FIVE**-UP SHEET, NOT SIX — READ THIS BEFORE THE SCOPE, AND OVERRULE IT ONLY WITH A REASON
The audit row lists **six labels** and the count `MISSING ×6`, so a careless reading of it makes six portraits. **It does not.** The sixth label is *"aging pass"*, and the fifth is *"grown Moon-born Child"* — **and those are the same deliverable**, because the moon-born child of E8 and the grown moon-born child of E9 are canonically **one person**:
> `lore/STORYBOOK.md:688` — *"**THE MOON-BORN LINE**: E8 born under Earth (the river question) → E9 the first swim → E10 aboard, the answer in their body."*

`CLAUDE.md` §8 states the consistency law in terms: **"Era transforms are image-EDITS of existing art."** So her E9 portrait *cannot* be a fresh generation without breaking that law — it **must** be an edit of `assets/raw/tf-moon-born-child-e8.png`, which shipped in row 63 **two hours before this master was written**. Delivering her as the aging pass satisfies both labels at once, and it reproduces the E7 batch's exact arithmetic (row 62: *"4 fresh E7 townsfolk portraits + 1 identity-preserving Combine-Defector aging edit + 1 five-up contact sheet"*).

**Corollary you must honour: the sheet is FIVE-up.** A six-up sheet would need a sixth portrait, and there isn't one.

READ FIRST (paths, all on main):
- `assets/LEDGER.md` **row 60** — THE CONVENTION, written expressly "for E6–E10 batches to cite", **and the pinned ground-warmth statistic**. Obey it literally.
- `assets/LEDGER.md` **rows 61 + 62** — the two batches that each carried an aging edit; **row 62 is your structural twin**.
- `assets/LEDGER.md` **row 63** — the E8 batch, which is (i) the source of your edit file and (ii) the batch whose finding F-1162-2 rewrote this master's warmth clause.
- `assets/LEDGER.md` **row 51** — `art-e9-buildings-a`, the **shipped E9 palette and world**: your portraits must sit in the same era as those five buildings. Its PALETTE NOTE is quoted below.
- `tasks/art-e7-town-icons.md` — your immediate structural precedent: 4 fresh + 1 edit + a five-up sheet, same firewall discipline.
- `assets/raw/tf-{assay-clerk,elder-rowan,mei,preacher,schoolteacher,storekeeper}.png` — the six E1 portraits = style ground truth **and your instrument-validation control**.
- `assets/raw/tf-moon-born-child-e8.png` — **the edit source for file 5. Do not modify it.**
- `assets/raw/tf-{launch-master,dome-gardener,suit-fitter}-e8.png` — the era your cast steps *out of*; the greenkeeper is the gardener's apprentice (see below).
- `assets/contact-sheets/tf-e8-town-sheet.png` — the sheet whose construction yours mirrors.
- `lore/STORYBOOK.md` **lines 540–542** (the five identities, verbatim below), **:570** (beat 4, the first swim), **:687–688** (the two lineages this batch carries).
- `specs/epoch-saga/e9-redfields-bundle.md` **lines 8 + 11–12** — the buildings, the identities, the terrain.
- `docs/GOLD_RUSH_BRIEF.md` §9 + `docs/decisions/ADR-001` — canon.

## SCOPE 1 — THE PREMISE GATE. RUN IT FIRST, WRITE IT DOWN, AND IT MAY STOP THE TASK — A STOP HERE IS A SUCCESS, NOT A FAILURE.
**Do not call `image_gen` until all four checks below have passed and their results are in your run file.** This class's mandatory pre-flight has now stopped **two** bad masters with zero diff — `49d49007` (a wrong warmth band) and `5dffbb52` (a probe that its own filename falsified) — and **both times it caught the AUTHOR, never the generator.** Assume it is aimed at me.

**(a) THE CANON IS STILL THERE AND STILL NAMES ALL FIVE.** Read `lore/STORYBOOK.md:540–542` and quote it verbatim into your run file. It must contain **"The moon-born child, grown"**, **"The canal reeve"**, **"The greenkeeper"**, **"the ice quarry chief"** and **"the weather warden"**. If any name has moved, softened or been superseded — **STOP and report.** You would be drawing a cast off a citation instead of a canon.

**(b) THEY ARE STILL UNSHIPPED — *AS ASSETS*.** `git ls-files 'assets/**' | grep -Ei 'tf-[a-z-]*-e9'` must return **zero rows**. If anything comes back, **STOP and report what exists.**
> ⚠️ **The namespace scoping is deliberate and you must not "helpfully" widen it.** `5dffbb52` died because an un-scoped `git ls-files | grep …` matched **the master's own filename** once the master was committed — a gate that the act of queueing it falsifies. This master is `tasks/art-e9-town-icons.md`; it is outside `assets/**` *and* it does not match `tf-…-e9`, so the probe is double-safe. **s1165 ran this exact form against the live tree immediately before queueing and got 0.** Run it exactly as written.

**(c) THE EDIT SOURCE EXISTS, AND YOU PIN IT BEFORE YOU TOUCH ANYTHING.** `assets/raw/tf-moon-born-child-e8.png` must exist. **Record its `sha256` and byte size in your run file NOW, before any generation** — you will re-state the same hash at the end as the firewall proof that the source stayed byte-intact. A hash recorded afterward proves nothing; this one is recorded first on purpose.

**(d) YOUR INSTRUMENT REPRODUCES KNOWN ANSWERS** (the standing control). Measure the six E1 raws with your own warmth code **before measuring anything you generate**:

| E1 control | expected TL+TR mean | vs the 120 floor |
|---|---:|---|
| `tf-assay-clerk.png` | ≈137.8 | pass |
| `tf-elder-rowan.png` | ≈134.0 | pass |
| `tf-mei.png` | ≈105.3 | **the ONE fail** (F-1120-1's known drift) |
| `tf-preacher.png` | ≈124.5 | pass — accepted below 130; the case that killed the old band |
| `tf-schoolteacher.png` | ≈140.4 | pass |
| `tf-storekeeper.png` | ≈143.9 | pass |

**Your instrument is correct only if it reproduces all six within ~±1 AND flags exactly one (`tf-mei`).** Two flags or none = the instrument is wrong; fix it before measuring a single generated pixel. Report the full control table.

## THE CONVENTION (LEDGER row 60, binding — do not drift)
A townsfolk portrait is a small illustrated **BUST** in the engraved-sepia plate hand: warm etched linework, **parchment ground**, **shoulders-up**, character **reading clearly at ~120px**, **FULL-BLEED with NO `#ff00ff` key** (UI portraits, not sprite cells), filename `tf-<role>.png`, **processing: NONE**. Canvas **1254×1254 RGB, no alpha**.

**E9 palette rider — take it from the five shipped E9 buildings, not from your own idea of Mars** (`assets/LEDGER.md` row 51, measured at that batch's drain): **rust-red engraved earth/timber · aged brass · warm parchment · honey-lit interior glass.** The era steps **back** from E8's Orbital silver. ⚠️ **SCOPED s1166 (F-1166-3): this palette describes HER — clothing, tools, and the light on her skin. It does NOT describe the plate she is drawn on.** These are *portraits in the town's book*, not scenes: there is no landscape behind the figure, and the backdrop stays neutral aged parchment in every era. **Attempt 1 read this rider as licence to put rust-red earth in the frame's corners, which is precisely where the warmth statistic is measured, and three of its five attempts overshot the ceiling because of it.** And the one literal instruction:
> Row 51's PALETTE NOTE, verbatim: *"the spreading vegetation uses the E1 riverbank-green callback swatch `#50674c` … **literal same green, the callback is the point**."*

That green is the saga's whole thesis in one colour — the greenkeeper's plantings and the moon-born child's grass square are where it appears in this batch. Use the swatch, not an approximation.

### THE GROUND-WARMTH GUARD — ABSOLUTE BAND, BOTH CORNERS, AND NO ARITHMETIC
> **GROUND WARMTH := mean of (R−B) over the TL 60×60 corner and the TR 60×60 corner.**
> **GATE: flag below 120.** Accepted range across all 22 shipped `tf-*` portraits is **124–145**; aim inside it.
> **Report TL and TR SEPARATELY as well as their mean (F-1161-2)**, and state the spread. E8's four each cleared 120 on **both** corners individually and Chalk did too — that is the standard now, so say whether each of yours does.
> ⛔ Never a 4-corner or whole-image mean (row 60 measured that it false-fails 10 of 11 accepted portraits). ⛔ Never a single corner (`tf-appliance-wrangler` spreads 13.9 points across its own top edge, so which corner you sampled would decide the verdict).

⚠️ **NO POST-HOC CHANNEL ARITHMETIC (F-1162-2 — binding, and it has now proved itself twice).** The E8 gardener met a *comparative* warmth requirement by a disclosed deterministic **+5.5% red-channel** multiply on an image that had **already passed the 120 floor** (121.4 → 135.4). The runner was honest; the fault was the master's, which demanded *"the warmest of the four"* — **a ranking against three files that did not exist when she was generated.** The rule: **state warmth as an absolute aimable band, never a rank**, because *a guard that can be satisfied by arithmetic on the very channel it measures has stopped measuring the art.*

**So, for every file in this batch:** the number must come from the **GENERATION**. Retake natively as often as you like and **report every attempt's number, including discarded ones**. You may **NOT** apply per-channel multiplies, curves, levels, or any global tone operation to a delivered PNG. **ATTEMPT BUDGET — RAISED s1166, and the number is derived, not guessed (F-1166-2).** The only completed portrait under this band (Chalk) needed **six** natives, with five misses in **both** directions first. So: **up to TEN native attempts per portrait**, and a role is only declared unreachable after ten. **Report every attempt's number, including discards** — the attempt history is the evidence that the band was aimed at rather than calibrated into. ⓘ **Ten is a ceiling, not a target**; if a role lands on attempt 2, take it and move on. Budget guidance for the batch: four fresh portraits, so plan around ~24 natives and treat >40 as the signal to stop and report rather than grind.
**If native generation cannot put a given portrait inside 124–145 in TEN attempts, STOP for that role and report all ten numbers** — and say explicitly whether the misses were mostly **high**, mostly **low**, or **bimodal**, because that distinction is what tells the next fire whether the prompt or the band is at fault. A stop is lawful here; a calibration is not.
⚠️ **AND DO NOT STOP THE WHOLE BATCH ON ONE ROLE.** Attempt 1 stopped at the canal reeve and never attempted the other four, so we learned nothing about them. **If a role exhausts its ten, park that role, carry on to the remaining roles, and report per-role at the end** — four solved roles and one parked is a far more useful outcome than one parked role and four unknowns. (The five-up sheet needs all five, so if any role is parked, deliver the solved portraits **without** the sheet and say so.)

🔻 **AND THIS BATCH'S REAL RISK IS THE CEILING, NOT THE FLOOR — E9 IS THE FIRST BATCH WHERE THAT IS TRUE.** Every prior batch fought to get *warm enough*: E8's silver/teal was the guard's most direct threat yet. **E9's palette is rust-red earth under a red sky — the warmest world in the saga** — and the evidence that this bites is one rung old: Chalk's E7 brass landed at **144.8, i.e. 0.2 under the 145 ceiling**, and two of her six attempts (**208.9** and **199.8**) were **discarded for OVERSHOOTING**. That discard is the band working: a rank has one failure direction, **a band has two, and only a band can be aimed at.**
> **Therefore: a portrait measuring above 145 is a RETAKE, exactly like one below 120.** Do not "bring it down" with a channel operation — that is the same crime as the E8 calibration, run in reverse, and it would be caught by the hash check below. Retake natively; a rust-red *world* does not require a rust-red *parchment ground*, and the ground is what the statistic measures.

### 🔑 PROVENANCE IS CHECKABLE, NOT PROMISED — NEW CLAUSE, AND IT IS CHEAP
s1164's drain converted the no-arithmetic clause from a promise into a **fact**: the run named its selected native source, the drain hashed both ends, and `assets/raw/tf-civic-agent-e7.png` proved **byte-identical** to `~/.codex/generated_images/…/call_….png` (`sha256 878c53d6…4db9a81a`, 3,485,591 B). Under that hash **no channel multiply, curve, level, tone op, resize or key is *possible*.** Its recommendation, now binding here:

> **For each of the four FRESH files, report the ABSOLUTE PATH of the native generated image you selected, plus the `sha256` and byte size of BOTH that source and the delivered `assets/raw/` file.** If your workflow copies the native output unmodified, those two hashes are **identical** and the no-arithmetic claim is *proved* rather than asserted. **If they differ, say exactly what differed and why** — a resize, a crop, or a format round-trip is a disclosable act, not a hidden one.
>
> The aging edit (file 5) is exempt from *identity* of hashes — it is by definition a new image — but it must still name its native `image_gen` output path and hash, and it must re-state the **source** hash from scope 1(c) unchanged.

## SCOPE 2 — THE BATCH: 6 files EXACT (4 fresh + 1 edit + 1 sheet)
Identities are `lore/STORYBOOK.md:540–542` verbatim; the roster is corroborated at `specs/epoch-saga/e9-redfields-bundle.md:11` — *"**Townsfolk (5+aging):** canal reeve … · ice quarry chief · greenkeeper … · weather warden · the moon-born child grown."*

In `assets/raw/`:

**1. `tf-canal-reeve-e9.png`** — fresh. STORYBOOK:541 verbatim: *"**The canal reeve** — water law returns. The claim office's OLDEST job (E1: who may divert the river, and how much) reborn on a world where every drop is ledgered. The era's civic drama: the reeve's rulings are the town's first LAWS ABOUT THE FUTURE — water allocated to fields that don't exist yet, on behalf of people not yet born."*
A civic officer of the claim-office lineage — **the E1 assay clerk's descendant in function, not in face** (do not chain a face here; no E1-reeve exists to edit). Brass gauge-keys or a lock-wheel spanner at the collar, the measured calm of someone whose word decides who drinks. Warm, fair, unhurried. ⚠️ **This one is the batch's letters trap — see the canon riders.**

**2. `tf-ice-quarry-chief-e9.png`** — fresh. ⚠️ **CANON IS THIN HERE AND YOU MUST NOT THICKEN IT.** STORYBOOK:542 and the bundle both name the ice quarry chief and give **no descriptive clause** — unlike the other four, who each carry a sentence. **This is not a block** (there is no fork: she is a working townsperson of E9, and Chalk's block was about a *species*, which is a different kind of unknown). But the correct response is to derive her from **the workplace canon that IS specified**, and to invent no backstory, no lineage and no relationship.
The workplace is shipped art — `assets/raw/bld-ice-quarry-rig.png`, LEDGER row 51, described at its drain as: *"a brass-and-timber gantry/derrick over an excavated ice cut, chain-hoisting one teal-white ice block, a toothed saw-wheel cutting the pit, cut blocks crated at the base + a waterwheel — **a CIVIL cutting/hoisting works, NOT an emplacement/weapon (canon §9)**."*
So: a foreman of that rig. Cold-weather working clothes over the era's rust-and-brass, frost at the collar, **one teal-white ice chip or a hoist-hook** as the read-at-120px cue — the era's only cool colour note, which is exactly why she is distinguishable from the other four. **Look at `bld-ice-quarry-rig.png` before you draw her.** Her ice is the town's water; she is the person who cuts the drink.

**3. `tf-greenkeeper-e9.png`** — fresh. STORYBOOK:542 verbatim: *"**The greenkeeper** — the dome gardener's apprentice, now planting OUTSIDE (her teacher grew comfort under glass; she grows defiance under sky)"*, with the lineage pinned at **:687 — *"THE GARDEN LINE: E8 dome gardener (the grass square) → E9 greenkeeper (plants outside) → E10 tends the hall tree."***
**She is an apprentice grown into her own trade, NOT an aging edit** — she is a different person from `tf-dome-gardener-e8.png`, and drawing her as that face would break the canon, not honour it. **But look at the E8 gardener first**: the kinship should be legible as a *tradition* (the way she holds a seedling, the shape of her tools), never as a face. Bare-headed under an open sky where her teacher worked under glass; a seedling in the **`#50674c` E1-riverbank green**; soil on her hands. *Defiance under sky* is the brief — make her the most hopeful face in the batch.

**4. `tf-weather-warden-e9.png`** — fresh. STORYBOOK:542 verbatim: *"**the weather warden** (E4/E5's weather tech matured into shepherding — the spire minigame steers fronts to water the far rows)"*.
**Shepherding is the word to draw.** She reads the sky and *asks it* for rain; she does not shoot it. Anemometer cups, a vane-ring, a condensation coil, brass instrument at the eye — the same instrument family as the shipped `bld-weather-spire.png`. ⚠️ **This is the batch's weapon-form trap — see the canon riders.**

**5. `tf-moon-born-child-e9.png`** — **THIS IS THE `<existing-tf-id>-e9.png` AGING EDIT, and it is an image-EDIT, not a fresh generation** (consistency law, `CLAUDE.md` §8). **Edit source = `assets/raw/tf-moon-born-child-e8.png`** (hash pinned in scope 1(c); it stays byte-intact).
STORYBOOK:540 verbatim: *"**The moon-born child, grown** — arrived aboard the Riverward (the vessel their own name christened), carrying E8's grass square in a tin. It goes into the commons soil on landing day: the first green on the red world, one square foot, hex-identical to a riverbank nobody here has seen. They tend it all era."*

⚠️ **THIS IS THE LARGEST AGE STEP THIS CLASS HAS ATTEMPTED, AND YOU ARE ALLOWED TO STOP.** E6's edit re-roled an adult; E7's was *"one era step (~+8 years)"* on an already-adult face. **This one is a child becoming a young adult** — the identity has to survive a change of proportion, not just a change of years. What must carry through: the **hair worn up in the same bun**, the same eye shape and set, the same warmth. What legitimately changes: an adult's face and shoulders, and **E8's small Earth pane is gone** — she has arrived; the sky behind her is red and open.
**Her identity object is canon and it replaces the Earth cameo: the grass square in its tin**, in the `#50674c` green, held or set at her shoulder. **NO WRITING ON THE TIN.**
> **If you cannot hold the identity through this edit, STOP and report rather than generating a stranger.** A stranger delivered here would poison E10 as well, because `:688` runs this same person aboard the Ark. Say plainly which cues you used and whether you believe a viewer would recognise her beside the E8 file.

In `assets/contact-sheets/`:

**6. `tf-e9-town-sheet.png`** — **five-up** contact sheet, **the five above in the order listed (reeve, ice chief, greenkeeper, warden, moon-born child)**, mirroring the E8 sheet's construction (four undistorted 627px cells → yours is five undistorted cells; do not stretch).

Style anchor **verbatim in every prompt**: `"Gold Rush townsfolk portrait, engraved-sepia plate hand: warm etched bust on NEUTRAL AGED PARCHMENT ground, shoulders-up, no letters, no gore, reads at 120px."`

🔑 **BACKDROP CLAUSE — BINDING, ALSO VERBATIM IN EVERY PROMPT (F-1166-3, the fix for attempt 1's misses).** Append to every prompt: `"The background is neutral aged parchment — the same plate stock as the twenty-two shipped portraits. No red sky, no rust-red earth, no coloured light spill, no environmental backdrop, no scene behind the figure. The era's rust-red and brass live ONLY in her clothing, her tools and the warm light on her skin."`
**Why this clause and not a warmer/cooler instruction:** the ground-warmth statistic is the mean of `R−B` over the **top-left and top-right 60×60 corners** — i.e. **the empty plate behind her head and shoulders, and nothing else.** A rust-red *scene* in those corners is what produced 184.4, 171.7 and 161.0; an over-corrected dim one produced 75.1. **Neither is a portrait problem — both are backdrop problems**, and the backdrop is the one thing in the frame that the E9 palette rider should never have been allowed to touch. ⚠️ **This is a composition instruction, NOT a post-hoc correction** — it changes what you *generate*, never what you do to a generated file. The no-arithmetic law below is unchanged and absolute.

## Canon riders (ADR-001 / brief §9) — E9 attacks TWO rules, from two different directions
- ❌ **NO LETTERS — and the CANAL REEVE is the sharpest instance this batch.** Her whole office is *records*: water "**ledgered**", rulings, allocations to fields that don't exist yet. A reeve wants a ledger-book, a tally board, a gauge with graduations, a seal. **Every one of those renders blank, blind-embossed, or as punched holes / notches and nothing else.** No words, no numerals, no monograms, no legible type anywhere — not on her ledger, not on a gauge, not on the ice chief's crates, not on the child's tin, not on the warden's dial faces. **Graduation marks are notches, never numbers.** E7 fought this on five fronts (punch-tape, card catalogue, tape coils, jack labels, patch panel) and won; do not lose it on the fourth batch.
- ❌ **NO FIREARMS, EVER (ADR-001) — and the WEATHER WARDEN is this batch's canon-risk atom, exactly as the weather spire was for the buildings.** Row 51 recorded the spire as *"an atmospheric-control INSTRUMENT (calls rain / breaks fronts), **NO barrel/muzzle/target/beam/gun form** … the batch's canon-risk atom, VERIFIED weapon-form-free."* The warden inherits that verdict. **Nothing she holds may have a barrel, muzzle, bore, stock, mount, sight or aimed line**, and note the specific hazard: E9's own arsenal contains a *storm-lance* and a *terraform cannon* (`specs/epoch-saga/e9-redfields-bundle.md`), so the wrong silhouette lands her in the weapons roster of her own era. **She shepherds weather; she never aims at it.**
- ❌ **The ICE QUARRY CHIEF carries the same risk in miniature**: saws, picks and cutting tools are *civil implements* here — row 51's own words for the rig are *"a CIVIL cutting/hoisting works, NOT an emplacement/weapon."* No tool is brandished, raised, or held as a weapon would be held.
- ✅ **Illustrated and warm, never gory.** No wounds, no damage, no menace.
- ✅ **These are townsfolk, not enemies** — E9's enemies are dust devils, feral terraformers and claim-jump drones, and **no peoples are ever the enemy**. Nothing military, nothing cowering, nothing pitiable.
- ✅ **Engraved-house voice** — the same etched sepia hand as all 22 shipped portraits. These are *drawings in the town's book*, not renders.

## NOT IN THIS BATCH — named so you do not helpfully add them
- ❌ **No clerk-line portrait.** STORYBOOK:542 does say *"**the clerk line** poles the canal packet-boat (eighth uniform)"*, so the temptation is real. But **the audit's A4 row does not name the clerk**, and the clerk line has **no E7 or E8 face to age from** — its last portrait is `tf-depot-clerk-e6.png`, three eras back, so an "aging edit" would in practice be a fresh generation wearing an edit's name. **That is a decision, not a chore**: next rung, or attended.
- ❌ **No `icons-e9.png`, no `#ff00ff`-keyed sheet, no sprite cells** — different tier, its own rung (the audit's A6 row, MISSING ×12). Exactly the E6/E7/E8 split.
- ❌ **No aging edit of `tf-mei`** (the F-1120-1 convention outlier — editing it forward either propagates the drift or silently "corrects" a shipped face).
- ❌ **No `bld-*` buildings, no `ter-redfields-atlas.png`, no `plate-e9-townsfolk-era.png`.** ⓘ **Adjacent but NOT blocking, and stated here so you do not rediscover it:** **F-1044-3** (`tasks/BACKLOG.md:915`) is an open **owner adjudication** about `art-e9-buildings-a` having regenerated five `bld-*.png` raws that main already ships — those files sit in the art-staging audit's **DIVERGED** bucket today. **That is a different filename namespace from `tf-*-e9.png` and it does not touch you** — but it is exactly why you must not go near `bld-*`.

## Self-QA — MEASURED, per file, in the run file (not eyeballed)
- **Scope-1 gate results FIRST**: the verbatim STORYBOOK:540–542 quote, the zero-rows probe output, the pinned source hash, and the six-row instrument control table. **Do not proceed if the control fails.**
- Canvas **1254×1254 RGB, no alpha** on all 6 (state measured dims + channel count). **0 transparent px, 0 exact- and near-magenta px** (correct full-bleed reference tier).
- **Ground warmth per portrait: TL, TR, mean, and spread.** Mean must clear the **120 floor**; say whether **both corners individually** clear it; say whether the mean lands inside **124–145** — **and if any lands above 145, say so and state that you retook rather than corrected.**
- **Every generation attempt's warmth number**, including discarded ones, and an explicit line: **"no channel arithmetic, curves, levels or tone operations were applied to any delivered file."**
- **Provenance table (the new clause): native source path + sha256 + byte size, and the delivered file's sha256 + byte size, for all five portraits.** State for each fresh file whether the two hashes are identical, and if not, exactly what differed.
- **Reads at 120px: actually downscale each to 120px and view it** — distinct silhouette / face / prop per role (gauge-key · ice chip · seedling · vane-ring · grass tin). Say that you did it, and save the strip to `reviews/shots-art-e9-town-icons/e9-portraits-120px-strip.png`.
- **Framing consistent across the five** (shoulders-up, comparable head size) — **the CONVENTION is the deliverable as much as the faces are.**
- **Contact sheet order, verified not asserted (F-1154-3) — AND MEASURED WITH AN INSTRUMENT THAT COULD DISAGREE.** Pair every cell against every raw (**5×5 matrix**): report the MAE for each true pairing **and the range across all 20 wrong pairings**, which are your positive control, plus the separation ratio.
  > ⚠️ **Do not report a tautological 0.00 and stop there.** s1162's drain caught exactly this: the run's true-pairing 0.00 was *near-tautological* because the sheet is a Lanczos3 composite of the same raws, so the matrix was re-sliced under a **different kernel (nearest)** and gave true 7.86–10.71 vs wrong 34.95–40.38 — a **×3.26** minimum separation, which is a real measurement. **Do the same: build the sheet with one resampling kernel and verify it with another**, and report both numbers. A matrix that cannot fail proves nothing.
- **`tf-moon-born-child-e9` vs `tf-moon-born-child-e8`: identity held.** Name the cues you carried (hair, eye set, warmth), name what changed (proportion, the Earth pane's removal, the grass tin), and **say plainly whether you believe a viewer would recognise her**. Confirm the E8 source is **byte-identical** to the hash you pinned in scope 1(c).
- **Canon, stated PER FILE, at full size AND at 120px:** no letters (name the ledger/gauge/crate/tin/dial and how each stayed blank) · no firearms (name the warden's instrument and the ice chief's tools and why neither reads as ordnance) · no gore · townsfolk not enemies.
- **Firewall proof:** confirm all **22** prior `tf-*.png` are byte-identical after your run, and that the E6/E7/E8 contact sheets are untouched.

## FIREWALL
**TOUCH-ONLY:** `assets/raw/tf-{canal-reeve,ice-quarry-chief,greenkeeper,weather-warden,moon-born-child}-e9.png` (the 5) · `assets/contact-sheets/tf-e9-town-sheet.png` · `reviews/shots-art-e9-town-icons/` (QA strip only) · `assets/LEDGER.md` (one new row, **65**) · your run file under `tasks/runs/`.

**NO:**
- ❌ **Do not touch or regenerate any of the 22 shipped `tf-*.png`.** File 5 is a NEW file derived from one; **the source stays byte-intact** and you proved its hash before you started.
- ❌ **Do not touch, repaint or regenerate `assets/contact-sheets/tf-e{6,7,8}-town-sheet.png`** or any other shipped sheet.
- ❌ No `bld-*`, no `icons-e9.png`, no `#ff00ff`-keyed sheet, no sprite cells, no walk sheets, no full bodies.
- ❌ No extraction, no `extract-alpha`, no `assets/processed/` (**reference-tier law: no consumer exists** — `grep -rn 'tf-' src/` returns only `utf-8` — so nothing is wired and no player-visible surface changes).
- ❌ No `src/**`, no `e2e/**`, no contracts, no `generated.ts`, no `tasks/*` other than your own run file.
- ❌ No E10 portraits, no He-3 assayer (owner-gated, F-1161-3), no clerk-line portrait (above).
- ❌ **Do not run the playwright suite or start a dev server.** Nothing here is testable that way, and a 2,396-test full-suite inventory has been live in lane-d for over **2h45m** — a second heavy job corrupts that measurement (Mistake #12).

One batch in flight (✓ verified s1165 at queue time: `tasks/queue/art/` empty and `tasks/running/` holds only the lane-d suite job).

⚠️ **A NOTE ON YOUR OWN COMMIT (F-1162-1, verified STILL LIVE by s1165 — not inherited).** The runner process in memory predates the `d10167f4` fix, so its post-run `git commit` carries **no pathspec** and publishes whatever is staged tree-wide. Proof at tip: the last ART-slot commit `ad7f2a9c` — a clean, well-behaved run — nonetheless swept `logs/dashboard.html` and `logs/task-stats.jsonl`, which are outside any art task's TOUCH-ONLY list. An earlier one took four of the owner's untracked marketing videos. **Nothing you can do in this task fixes that** — the remedy is a runner restart and it is on the owner's desk. What you CAN do: **stage nothing yourself outside your TOUCH-ONLY list, and never run `git add -A`.** Leave unrelated dirt unstaged so the bare commit has less to publish.

END: **READY-FOR-GATES** + the scope-1 gate results (canon quote, zero-rows probe, pinned source hash, control table) + the measured QA table (6 rows) + every attempt's warmth number + the provenance hash table + the no-arithmetic statement + the 5×5 two-kernel pairing matrix + the identity-held verdict on file 5 + the LEDGER row + one line on whether the convention held or drifted.
