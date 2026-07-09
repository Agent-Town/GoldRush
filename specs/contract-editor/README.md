# The Contract Editor — the owner's hands on the ground (and the Charter Press's first floor)
Status: SEED 2026-07-09 (owner: "A level/contract editor. Is it overkill? Should we use something existing? If I could manipulate and talk to you directly while we modify the map that would be a quick way to get great results.")

## The verdict: NOT overkill — it's the Charter Press pulled forward
The saga's FINAL milestone (the kids' adventure builder) IS a contract editor with guardrails. Building the owner-grade editor now = building the Press's engine with the owner as user #1. Not a new construction site; the endgame's foundation, early.

## Existing tools? (surveyed honestly)
Tiled/generic editors fit CLASSIC tilemaps; our contracts are DESCRIPTORS (analytic heightfields, zones, lanes, water params, scatter, palette) that the game already renders. The cheapest powerful editor is therefore IN-GAME (the renderer is the preview) + the descriptor as the document. External tools = only a Tiled-importer fallback if T1 stalls.

## THE THREE TIERS
**T0 — CONVERSATIONAL EDITING (available TODAY, zero build):** the owner opens the game on a contract (`?contract=` + vite hot-reload); the attended session edits the descriptor DATA live in conversation ("ridge steeper, spring 10 east, third lane from the north") → the map updates in seconds → react, iterate. This IS the Charter Press Layer-1 fantasy (describe → the agent composes), proven on ourselves. First session candidates: tune the Re-survey; or design E1's 7th contract (Ghost Town) together.
**T1 — THE IN-GAME EDITOR MODE (`?editor`, the milestone):** ED-01 descriptor inspector + live-apply (sliders/fields for every tileParam, export JSON) · ED-02 terrain brush (raise/lower/smooth the heightfield, paint zones/water/lanes) · ED-03 placement + validation (build-zones, spawns, briefing editor; the CONTRACT VALIDATOR = the assayer's gate logic reused — an invalid map explains itself). Owner-facing first; sim untouched (editors write descriptors, never engine).
**T2 — THE PRESS:** T1 + vocabulary guardrails + kid-grade UX + sharing = the Charter Press engine (E4+ per the owner's timing ruling). The validator IS the ratified reject-don't-stretch law made visual.

## Sequencing
T0: schedule anytime (attended session + open game). T1: after MP-03/04 land (the same lanes free up); ED-01 fire-authorable from this spec then. T2: unchanged (owner's E4+ ruling).
