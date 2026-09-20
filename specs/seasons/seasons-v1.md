# SEASONS v1 — the county's history, manifested in the application

STATUS: RATIFIED 2026-08-10 (owner directive, verbatim below). Boundaries and page anatomy are the attended session's proposal under the standing veto window — reversible by design, per the owner's own clause.

## The owner's words (2026-08-10, verbatim — the law)
> "I would make that into seasons. Explain in a season page what happened in that season and then have the results and runs of the different models as well as a comment about them, their performance, what we learned from each of the experiments. This manifests this important step in history in the application. If users don't like we can later remove it. I think that its important."

## Laws
1. **Seasons are the player-facing chaptering of the county's history.** The technical substrate stays the era stamp (a rules-changing merge hash, Walk Era precedent); a season is the STORY unit wrapped around one or more stamps.
2. **No row is ever deleted by a season change** (retention law). Every standing carries its season label; old crowns are history, not cheats.
3. **A season page owes four things**: (a) *what happened* — county-voice narrative of the season's events; (b) *the results* — the season's boards/runs by model and harness; (c) *commentary* — performance read on each mind/rig that rode; (d) *what we learned* — the lessons per experiment, plainly stated.
4. **Sources are the county's own ledgers**: `bench/gauntlet/*` reports, `HARNESSES.md` dossiers, the memories notebooks, the gazette, board rows. Season commentary cites them; uncited commentary is a proposal (lore-wiki law applied to history).
5. **Removability**: the whole surface sits behind one flag/tab so the owner's "we can later remove it" is a one-line act. Removal hides the PAGES, never the data.

## Season boundaries (proposed)
- **SEASON 1 — "The Founding Season"**: everything from the door's first opening (heat 1) to the day the Same-Game Law lands. Contains, as in-season events: the door opens · heat 1 and the first crowns · the Walk correction (`55ce6f7d` — harvest teleport abolished mid-season, both hash eras acknowledged on the page) · heat 2 and the eight minds · the model ablations (prime flash→Sol, Eliza flash→Sol) · the Same-Game discovery (F-SAME-1, found by a harness reading the source).
- **SEASON 2 — "The Same Game"**: opens when AP-16-1..3 land under one era stamp. Agents draft, blast, and build exactly what humans do; the pick clock (30/20/10) paces both species.
- Later seasons: any rules-changing epoch (MP-07c ride-the-browser, co-op boards, E2 Steamworks contracts joining the gauntlet).

## Slices
- **SEA-1 (registry + labeling, fire-authorable after AP-16-0 merges)**: a checked-in season registry (id, name, dates, era stamps, one-line summary); API rows gain a derived `season` label (from submittedAt/era — additive, GET-only, no ranking change).
- **SEA-2 (the Season Page)**: encyclopedia/Field Book family — a Seasons tab listing seasons; each page renders the four owed things; per-model/per-harness season results reuse the Minds/Rigs cell rendering (do not fork it). 390px containment per house rule; honesty banner inherited.
- **SEA-3 (Season 1 content)**: the narrative + commentary, county voice, cited from bench evidence. Attended-drafted or fire-drafted-from-sources; owner may enjoy reading it either way.

## Ratification note
Boundaries/naming above are proposal-grade: one owner word renames a season or moves a boundary; nothing else in this spec depends on the names.
