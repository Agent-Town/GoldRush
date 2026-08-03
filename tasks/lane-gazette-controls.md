CODEX: model=gpt-5.6-sol effort=high
# lane-gazette-controls — GG-04: the Gazette learns which finger does what
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner playtest 2026-08-03, verbatim: "The gazette is really good now. This helps a lot. There is one thing that is not explained in it though, the use of the grenade with the Q button, the B button to build buildings - the players have to understand which buttons to press to do what."): the first issue teaches concepts, never controls.
READ-FIRST: specs/greenhorn-gazette/README.md (the six panels + laws) · src/game/InputController.ts (THE SOURCE OF TRUTH for bindings — Q blast charge, B build, all of it) · the HUD touch controls (what mobile fingers press instead — hud-build etc.) · the Herald renderer (panel structure + GG-03 engraving slots) · canon: the grenade is the BLAST CHARGE (ADR-001 frontier-tech; never "grenade" in player copy).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE:
1. NEW PANEL 7 — "THE PROSPECTOR'S HANDS": the control scheme as Gazette copy, INPUT-AWARE — desktop sessions render the keyboard set (move WASD · aim/pan with the mouse · Q hurls the blast charge · B opens the build menu · the rest from the source of truth); touch sessions render the touch set (the HUD buttons by their in-game names). Detection follows however the game already distinguishes input (read, don't invent).
2. DRIFT-PROOF LAW: the panel derives its key names from a single exported bindings table (create one in/next to InputController if none exists — InputController consumes it too). A hardcoded second list is forbidden — controls copy must be UNABLE to lie (the card-truth law, applied to fingers).
3. Inline mentions: THE ARMS panel gains one sentence naming the blast-charge key/button; THE WORKS panel gains one naming build. Same input-awareness, same derivation.
4. Engraving: panel 7 reuses an existing engraving (the arms or works plate) until the art slot mints a hands plate — placeholder-first; register the art request as one BACKLOG ladder line in your report.
5. e2e: desktop project sees "Q" + "B" in the issue · mobile project sees the touch names and NO keyboard letters · derivation test: rename a binding in the table, panel copy follows (test-the-test style).
TOUCH-ONLY: the Gazette/Herald content module + the bindings table export + InputController's consumption of it (mechanical only) + specs. NO: actual bindings/behavior changes, Trail Guide barks (laddered separately), HUD layout.
SELF-CHECK: both projects green · release-build suite green (the Gazette ships in E1) · zero console · issue screenshots desktop + 390px showing the new panel.
READY-FOR-GATES + report: panel copy verbatim (both input flavors) + the derivation proof.
