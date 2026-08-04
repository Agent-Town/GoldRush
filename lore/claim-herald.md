# THE CLAIM HERALD — the town's paper, and the law of what it prints
Created 2026-08-04 by the GZ-L1 shift (the Living Paper), under lore law 2 (SAME-COMMIT CANON) and law 3 (CITED, DATED, SOURCED). Herald facts were previously scattered across `characters.md` (the Chen family, the newsie), `agent-town-heritage.md` (the Pony Express delivers), `world-dispatches.md` (the dispatch tables), and `specs/gazette-house/`. This page gathers them and adds the one fact the owner ordered on 2026-08-04 that the wiki did not yet hold: **why a new arrival is news.**

## THE ARRIVAL IS NEWS (new canon, owner-ruled 2026-08-04)
Owner, verbatim, in-session (`specs/gazette-house/living-paper.md:2`): *"In the first edition, it should highlight that a new person has entered town and how this is a special event as it does not happen often."*

**THE RULING, stated as canon:** a new hand arriving in the valley is a **front-page event**, because it is rare. The paper leads with it, names the newcomer, and says plainly that the claim book does not fill often.

**WHY it is rare — the mechanism was already canon, and it is THE SPARING (`lore/STORYBOOK.md:33`, owner-answered 2026-07-16):** the Baron was in this valley first, "panned the easy creek, found the color thin, and pronounced the ground **SPENT** — publicly, professionally, on his own survey maps… **the world's money reads them like scripture.**" The same wrong opinion that shelters the town from the Fever also keeps the road empty. Nothing sends wagons to ground the world has been told is worthless. **The valley's first roof was a wrong opinion; so is its quiet.** A hand who stops here has ignored the best-read map in the world, and that is worth a headline.

**WHAT the paper does with the arrival — already canon, now load-bearing for E1:**
- The standing headline is **NEW HANDS, WELCOME** (`lore/STORYBOOK.md:406`, retroactive canon, owner-ruled): "The Harbor House seats them; the schoolhouse enrolls them; **the Gazette prints their trade under NEW HANDS, WELCOME.** That was always the whole intake form." The Herald is that Gazette's E1 form; the headline is inherited, not invented.
- The instrument of record is **the clerk's ledger at the claim office** (`lore/agent-town-heritage.md:8`): "registering CLAIMS (E1's water-and-land law) matures into registering INHABITANTS (the town hall). **The clerk's ledger is the future citizen registry.**" At E1 a name entered in the claim book IS the town's registry event — the paper reports the ledger, not the person's history.
- **Nobody asks what they fled** (`lore/STORYBOOK.md:406` + `:35`): the wagon ring "feeds whoever walks out of the dark — hungry-eyed or clear, no questions asked, a plate at the fire… **The saga's whole intake form is set here, at a wagon-ring fire: one plate long, no questions on it.**" The Herald's arrival lead therefore prints the name, the claim, and the welcome — never a past.
- Every era's newcomers **always were refugees of the fevered world** (`lore/STORYBOOK.md:406`, retroactive canon; `lore/story-arc.md:76`). The paper does not know this at E1 and never speculates.

## THE E1 FORM OF THE PAPER (assembled from existing canon — cited, not new)
- **It has no press yet.** Chen Wei "until it builds: hand-copies notices at the claim office board" (`lore/characters.md:54`). The press arrives by rail in E2 — "**the Baron's rail brought the town its voice**" (`lore/STORYBOOK.md:93`). E1 editions are therefore *hand-copied at the claim office board*, and the paper may say so.
- **The Gazette House PRINTS; the Pony Express DELIVERS** (`lore/agent-town-heritage.md:9`, amending `specs/gazette-house/` GZ-H1/H2).
- **The newsie is Chen Mei** (`lore/characters.md:46`, ruled 2026-07-10 — "not Pip, not Juniper"): "Cap, satchel of papers, quick on the plaza… Voice: sharp, fast, first with the news" (`:47`).
- **The masthead's own law: it prints nothing it cannot prove** (`lore/characters.md:55`). Where the paper cannot confirm a thing, it says so and prints it anyway as a report — the Occult Law's newspaper form (`lore/story-arc.md:60`; the medicine-show dispatch at `lore/world-dispatches.md:29` is the model: "The Gazette can confirm the wagon. The Gazette cannot confirm the timing, and says so.").
- **Ledger voice** (`lore/world-dispatches.md:6-8`): "warm, plain, a frontier paper doing its job… the text itself never lies"; "**Fable, never lecture**"; "the Fevered are victims — freed/turned back language only; the Baron is the author of the madness; the town's tone is **stubborn hope, not dread**."

## THE PRINTING LAWS (binding on every line the Herald renders)
1. **THE CLOCK LAW** (`lore/canon-rules.md:24`, `lore/STORYBOOK.md:80`, ratified 2026-07-20): time is TOLD, not counted — **no year printed, no birthday stated, no arithmetic performable on a face.** "The first writer who prints a date breaks the saga." The Herald's item dates render month-and-day only (`src/news/heraldReader.ts` `formatDate`); editions carry an issue number and no date at all.
2. **THE CURE-ARMS LEXICON** (`lore/canon-rules.md:14`, `lore/STORYBOOK.md:39`): the town's word for a win is **FREED**; the Fevered are **TURNED BACK**. No surface ever prints killed or slain. The Baron's own defeat line is canon and verbatim: "**Dragged off by his own men, swearing revenge**" (`lore/characters.md:23`).
3. **THE HERO IS NOT THE PROSPECTOR** (`lore/characters.md:4`): the player is **the hero, the claim-holder**, named by profile. "Prospector" is the brass agent's word (`lore/characters.md:8`) and the paper never misapplies it.
4. **THE CALCULATING HOUSE DOES NOT EXIST YET** (`lore/STORYBOOK.md:44`): at E1 it is six eras away. No E1 edition names it.
5. **ADR-001** (`lore/canon-rules.md:17`): frontier-tech, no firearms ever; enemies are outlaws, companies, machines, and nature — **never peoples**; warm (the empathic kind, `lore/canon-rules.md:10`), illustrated, never gory.
6. **NO FACTORY JARGON REACHES PRINT** (`specs/gazette-house/living-paper.md:11`): `INTERNAL_HERALD_PATTERNS` in `src/news/herald.ts` is the mechanical guard — no bare three-digit numbers, no `CODE-1` tokens, none of the factory's own vocabulary. Enforced on the living paper's copy by `e2e/gazette-living.spec.ts`.
7. **HEADLINES TEASE, ARTICLES NEVER SPOIL** (`lore/STORYBOOK.md:125`; `docs/CONTENT-MAP.md:25`).

## THE EDITION LADDER (E1 — shipped GZ-L1, 2026-08-04)
The paper is a function of the profile (`specs/gazette-house/living-paper.md:7`). E1 prints, in the player's own clear order:

| № | Fact that prints it | Lead |
|---|---|---|
| 1 | the welcome | **NEW HANDS, WELCOME** — the arrival, and why the ledger fills so rarely. Keeps the pinned greenhorn tutorial beneath it (`specs/greenhorn-gazette/`). |
| 2 | first contract secured | **THE FIRST CLAIM HOLDS** — the newcomer becomes the town's own; the deed prints. |
| 3..N | each further E1 contract secured | one edition per claim, contract-flavored. **The Drill Yard never prints — it is training, not news** (`specs/gazette-house/living-paper.md:20`). |
| final | the Baron turned back | **THE BARON IS TURNED BACK** — the defeat line verbatim, the freed walked home, the pride-wound named, and the E2 postscript from `lore/world-dispatches.md:35` **verbatim** (that file is the single source for dispatch text; its law is *never invent lines*). |

PLANNED: **GZ-L2** gives each edition class its own masthead engraving (until then the existing class-mapped plates serve, and unplated editions print *Engraving reserved*). **GZ-L3** rides world-dispatch fragments on later editions (`specs/world-dispatches/`). E2 changes the paper's own body: the steam-press arrives and the Herald stops being hand-copied (`lore/STORYBOOK.md:93`, `specs/gazette-house/README.md:10`).
