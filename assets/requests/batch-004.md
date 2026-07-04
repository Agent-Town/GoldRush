# GPT Image batch-004 — FULL animation matrix (Robin directive: "I need full animation sheets")

Gate LIFTED 2026-07-04: side sheets survived extraction→contract→in-game (Robin: "the sheets are walking"). This batch completes directions + actions per the VP-02 orientation model: `side` (mirrored at runtime for the 4th direction), `front` (toward viewer / walking down-screen), `back` (away / walking up-screen). "Turning" is orientation-switching in code, not art.

**Format (every prompt):** ONE image, 3 columns × 2 rows grid of equal cells, NO borders/labels/text, SAME character in every cell (identical outfit/colors/proportions/scale/lighting), flat solid uniform bright magenta #ff00ff background everywhere, no magenta spill/reflections, soft light from upper left, Frontier Ledger style anchor (as batch-001/002/003). Cells are listed top row left→right, then bottom row left→right (r0c0,r0c1,r0c2,r1c0,r1c1,r1c2).

**Processing:** `extract-alpha.mjs --key ff00ff --grid 3x2` per sheet → cells + frames.json; cell semantics below are BINDING for the contract clips.

## Sheets + cell maps

### char-hero-sheet-front.png — hero facing the viewer (3/4 top-down, walking down-screen)
r0c0 idle standing · r0c1 walk LEFT foot fwd · r0c2 walk RIGHT foot fwd · r1c0 hurt flinch (lean back) · r1c1 panning (crouched, swirling the brass pan, few gold glints) · r1c2 brace-aim (feet planted, chest lantern flaring teal — the rig charging)

### char-hero-sheet-back.png — hero seen from behind (walking up-screen)
r0c0 idle back · r0c1 walk-back LEFT foot fwd · r0c2 walk-back RIGHT foot fwd · r1c0 build hammer RAISED (kneeling at ground) · r1c1 build hammer STRUCK · r1c2 hurt flinch from behind

### char-hero-sheet-side-actions.png — same 3/4 side view as the existing walking sheet
r0c0 panning swirl (pan level, circular motion) · r0c1 panning tip (pouring water off, gold glint) · r0c2 build hammer RAISED (kneeling) · r1c0 build hammer STRUCK (dust puff) · r1c1 brace-aim side (lantern flare) · r1c2 true standing idle (relaxed, pan at side)

### char-jumper-sheet-front.png — claim jumper facing viewer
r0c0 sneak-idle crouch, grasping hands up · r0c1 sneak-walk LEFT foot fwd · r0c2 sneak-walk RIGHT foot fwd · r1c0 hurt flinch · r1c1 snatch-grab reaching LOW (hands toward ground) · r1c2 snatch-grab CLUTCHING nugget to chest

### char-jumper-sheet-back.png — claim jumper from behind (fleeing up-screen is the money view)
r0c0 sneak-walk-back LEFT foot fwd · r0c1 sneak-walk-back RIGHT foot fwd · r0c2 sneak-idle back · r1c0 FLEE scurry-A (leaning fwd, nugget clutched, glance over LEFT shoulder) · r1c1 FLEE scurry-B (opposite legs, glance over RIGHT shoulder) · r1c2 hurt flinch from behind

## Character descriptions (identical wording every prompt)

HERO: single gender-neutral frontier gold prospector — simple wide-brimmed hat, rolled sleeves, sturdy boots, leather satchel, small brass pan, small teal-glowing lantern-gadget on the chest strap (subtle, the only cool color); warm, capable, slightly whimsical storybook look, not a caricature, not childlike. SAME character as the two previous sprite sheets in this conversation.

JUMPER: single roguish claim-jumper bandit — rust-red poncho, dusty hat pulled low, bandana over the face, empty-handed grasping gloved hands unless a cell says otherwise, NO weapons of any kind; mischievous storybook menace, sneaky and greedy, not frightening, not gory, no ethnic or cultural caricature. SAME character as the previous bandit sprite sheet in this conversation.

## Status log
- Prompts written + generation run 2026-07-04 (s9d, Claude-in-Chrome + subagent, same conversation as batch-002/003 for character continuity).
- **GENERATED + DOWNLOADED 5/5, all QA PASS, no regenerations** (subagent visual QA per sheet). ChatGPT titles → targets, in download order: "Prospector in action poses"→char-hero-sheet-front · "Adventurer sprite sheet in action"→char-hero-sheet-back · "Prospector sprite sheet in sepia tones"→char-hero-sheet-side-actions (poses read slightly front-three-quarter vs strict side — acceptable, actions unambiguous) · "Outlaw character pose sheet"→char-jumper-sheet-front · "Cowboy thief character pose sheet"→char-jumper-sheet-back (tiny gold-sparkle bits near hand in flinch cell — dropped nuggets, not text). Mover: `scripts/move-batch-004-downloads.sh` (newest-5 by mtime, ordered).
- **Timing lesson (update the hang heuristic):** generations ran 1–7 min this round ("Thought for 6m 56s" on sheet 3 was LEGITIMATE); treat a stop-icon stall as hung only after ~8 min. One aborted/stopped turn remains in the conversation (harmless, no stray image).
- Next: extract with `--key ff00ff --grid 3x2` per sheet; wire orientation clips per VP-02 (side sheets already in-game; front/back/actions extend the contract); "turning" = code-side orientation switching.
