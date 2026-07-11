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
T0: schedule anytime (attended session + open game). T1: after MP-03/04 land (the same lanes free up). ⭐ OWNER DIRECTION 2026-07-10 ('that might also be something to bring in GPT 5.6 Sol for? Yes, lets keep going down that direction.'): T1 = a SOL ASSIGNMENT — ED-01 (descriptor inspector + live-apply) on sol/editor-ed01 once its fixed-step branch drains; the attended session writes the ED-01 brief when Sol is free. T2: unchanged (owner's E4+ ruling).

## THE TWO PILLARS (owner product ruling 2026-07-11, verbatim: 'if you look at Roblox, Unity or similar game editors, then they have a ton of functionality. We can gap alot of that with the ability to have a chatbox in there and allow the user to have AI support. But certain details would be amazing if the user could use the mouse or touch interface to just drag/resize, change terrain/geography, change colours and so on. The ability to either fix the fine details or start something new somewhere on the map.')
**THE LAW THAT MAKES IT COHERENT: both pillars are DESCRIPTOR WRITERS.** The chat proposes descriptor diffs; the hand applies descriptor edits; neither touches the engine — the renderer rebuilds from the document (ED-01 proved the loop; B5's document seam + undo stack serve both). One writer surface, two input modalities.
### PILLAR 1 — THE HAND (direct manipulation)
- ED-02/B6 (in drain): terrain brush — raise/lower/smooth, zone/water/lane paint. ✔ covers 'change terrain/geography'.
- **ED-04 — GIZMOS (new):** select any placed thing (zones, spawn markers, props, water sources) → drag to move, handles to resize, rotate; touch-first hit targets (the iPad IS a target device); every gesture = a descriptor edit on the undo stack.
- **ED-05 — THE PALETTE (new):** per-contract color/material identity editing (tint bands, water color, scatter palette — the descriptor already carries palette fields); color pickers in the inspector family. ✔ 'change colours'.
- **ED-06 — START FRESH (new):** 'stake a new patch' — a blank-region tool: pick a spot, choose a template (flat/basin/ridge), and the authored grid seeds it. ✔ 'start something new somewhere on the map'.
### PILLAR 2 — THE CHAT (AI support in the editor)
- **ED-07 — THE CHATBOX (new, OWNER-ONLY v1):** a panel in `?editor`: describe the change ('make the ridge steeper and move the spring 10 east') → the AI returns a DESCRIPTOR DIFF + one-line summary → PREVIEW (applied live, revertable) → keep/discard. Architecture: a functions/api/editor-chat worker proxying the LLM (owner's Anthropic key as a CF secret — never client-side); the chat NEVER mutates the engine, only proposes document diffs through the same validation boundary (069/assayer reasons — an invalid proposal explains itself). Rate-limited, editor-gated, adults-only until the Charter Press child-UX work (T2) rules otherwise.
- The T0 sessions (owner+attended live) remain the zero-infrastructure version of this pillar and the training ground for its prompt patterns.
### Sequencing
Current stack lands first (B5→B6 in drain, ED-03 in progress) → ED-04 gizmos → ED-05 palette → ED-06 start-fresh → ED-07 chat (needs the owner key one-time). T2 Charter Press inherits BOTH pillars with kid-grade UX + vocabulary guardrails.
