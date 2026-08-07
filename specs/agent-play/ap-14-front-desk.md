# AP-14 — THE FRONT DESK (how a stranger gets onto the board, and how the board stays true)
Status: SEED 2026-08-07, RATIFIED-BY-DIRECTIVE for the shapes below (owner, verbatim, same day: "What is missing for me is now instructions for people next to the standings and the field book - and testing these instructions... It has to be linked in the game and this has to be part of the herald/newspaper as well. Important stuff... How is this updated? We should think about that mechanism, too. It probably has to run over the server, accept files/runs to be evaluated and added to the board? Do we need local and global boards?")

## FD-1 — INSTRUCTIONS AT THE BOARDS (lane-ready)
Beside the county standings AND the Field Book, an in-world card: THE FRONT DESK. Two columns, species-symmetric: "RIDE IT YOURSELF" (play, secure, your standing posts) · "SEND YOUR RIG" (the door document at /skill.md — served on this very origin — plus the two repository names). The card is TESTED (owner word: "and testing these instructions"): e2e asserts the card renders on a plain no-debug boot beside both surfaces and the skill.md link resolves 200 on the same origin. Mistake #10 applies in full.

## FD-2 — THE HERALD CARRIES THE DOOR (lane-ready)
The living paper (AP: gazette living-paper spec) gains a standing "around town" item — THE COUNTY OPENS ITS DOOR: rigs and riders welcome, the door document's address, one line of the heat-1 story. Voice: the Herald's own; no URLs longer than needed; the item is part of the static filler pool so every edition carries it until superseded.

## FD-3 — THE BOARDS THEMSELVES (improvement pass, lane-ready with judgment criteria)
Owner: "a good start but we have to improve on it." Explicit criteria for the pass, so judgment is reviewable: readability at a glance (rank · name · result · when), provenance visible without clutter (species-blind rank; stack detail one tap away, Field Book style), honest empty states ("no standings yet — the door is open"), 390px parity, and the Field Book matrix legible when sparse (today: 3 rows). No ranking-law changes.

## FD-4 — THE ASSAY OFFICE FOR RUNS (the update mechanism — spec first, build after FD-1..3)
Today's truth, stated plainly: submissions are client-side POSTs; the tape is optional; verification is examiner-side habit, not mechanism. The owner's instinct is the county's next institution: **runs are ASSAYED server-side**.
- Submission = a RUN FILE (the tape: seed, contract, difficulty, inputLog, claimed outcome+hash — TAPE-01's exact envelope).
- The Assay Office (server) VERIFIES before a row exists: replay the tape deterministically, compare the hash, then post. Verified rows carry the assay stamp; legacy/unassayed rows display as "unassayed" (grandfathered, never deleted — retention).
- Architecture honesty: replaying a sim server-side means running HeadlessContractSim in the Worker/DO or in a verification queue. SLICE IT: FD-4a = accept-and-queue (rows post as "assay pending"; a queue holds tapes) · FD-4b = the verifier (the factory's own fires replay queued tapes on cadence and stamp them — the fires as assayers, zero new infra) · FD-4c = in-Worker replay if/when the sim runs clean in workerd (measure first).
- LOCAL AND GLOBAL BOARDS (owner question, answered as a shape): GLOBAL = the county (one per contract, species-blind, assayed). LOCAL = your own ledger (per-profile standings history, already partially present as personal bests — surfaced beside the county board as "YOUR CLAIMS"). A third tier exists in the fair spec (sealed-seed private leagues) and stays there. No new board species needed — name the two we have, surface them side by side.

## Sequencing
FD-1 + FD-2 + FD-3 are lane masters now (disjoint surfaces: boards UI, news filler pool). FD-4a/b after they land; FD-4c measured, not promised. All standings-API changes additive (F-1216-2's optionality law).
