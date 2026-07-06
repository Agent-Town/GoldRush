# Codex Art Run 005 - batch-008 Prospector companion

Date: 2026-07-06
Tool path: Codex built-in `image_gen` / gpt-image-2
Task: `tasks/running/art--20260706-193925-art-batch-008-prospector-companion.md`

## Outputs

- `assets/raw/char-prospector-sheet-hover4-a.png`
  - source: `/Users/robin/.codex/generated_images/019f3770-c81a-73f2-b6f4-1907ec1f9cd6/ig_0c55e5bf4076cdd6016a4ba4a7c82c8191a40abba9042de80e.png`
- `assets/raw/char-prospector-sheet-hover4-b.png`
  - source: `/Users/robin/.codex/generated_images/019f3770-c81a-73f2-b6f4-1907ec1f9cd6/ig_08fe650f52d8386a016a4ba5516e7881919610f9736c5ffe44.png`
- `assets/raw/char-prospector-portrait.png`
  - source: `/Users/robin/.codex/generated_images/019f3770-c81a-73f2-b6f4-1907ec1f9cd6/ig_06bb49025225dddd016a4ba3cc17848191acaba1b1184c62da.png`

No extraction, contract wiring, or `src/` changes were done in this run.

## Prompts Used

### Sheet A final prompt

Use case: stylized-concept
Asset type: Gold Rush three.js game sprite sheet raw asset, `char-prospector-sheet-hover4-a.png` retry
Primary request: Create one square 4-column x 4-row sprite sheet for the player's AI companion, canon name "the Prospector": a SMALL HOVERING AUTOMATON assistant, charming robot buddy, round brass-and-copper lantern-like body, warm teal agent-glow core seam, tiny articulated arms, one arm holding a small prospector's pan, subtle miner's-cap silhouette, no legs.
Reference style: Match the visible Gold Rush hero sprite sheets: Frontier Ledger game art, fine sepia engraved linework and hatching, muted warm brass/copper/rust colors, soft upper-left light ON THE CHARACTER ONLY, illustrated, not photorealistic, readable at gameplay scale.
Scale law: the final image will be about 1254 px square with 4x4 cells of about 313 px. In EACH cell, the automaton body plus hover exhaust should be about 230-250 px tall, centered with padding. Do not make it tiny. Do not let the pan arm make one cell much taller than the rest.
ABSOLUTE BACKGROUND RULE: every pixel outside the character must be one uniform solid chroma-key color #ff00ff. No vignette, no gradient, no lighting, no glow spill, no shadow, no floor, no texture, no halos. Keep teal glow inside the character/exhaust only, not on the magenta background.
Canvas/grid: Square sprite sheet, exactly 4 equal columns and 4 equal rows, uniform cell sizes, no drawn grid lines, no labels, no text.
Rows top to bottom: south/front view, southeast/front-three-quarter view, east/right profile view, northeast/back-three-quarter view.
Columns left to right in every row: hover-bob low, mid-rise, high, mid-fall. Make the hover cycle distinct through vertical offset and a subtle teal core/exhaust pulse, but keep the same identity, same scale, and same pan-arm side across all cells.
Pan-arm law: The prospector pan is held by the automaton's same physical right-side arm as it turns; do not mirror the design inconsistently.
Constraints: no text, no letters, no watermark, no weapons, no guns, no firearm silhouette, no gore, no legs, no walk cycle, no extra characters, no Native American imagery, no photorealism.

### Sheet B final prompt

Use case: stylized-concept
Asset type: Gold Rush three.js game sprite sheet raw asset, `char-prospector-sheet-hover4-b.png` final retry
Primary request: Create the SECOND square 4-column x 4-row sprite sheet for the SAME automaton companion from the accepted sheet A retry: small hovering brass-and-copper lantern robot buddy, warm teal agent-glow core seam, articulated arms, one arm holding a small prospector's pan, subtle miner's-cap silhouette, no legs.
Reference style: Match accepted sheet A and the visible Gold Rush hero sprite sheets: Frontier Ledger game art, fine sepia engraved linework and hatching, muted warm brass/copper/rust colors, soft upper-left light ON THE CHARACTER ONLY, illustrated, not photorealistic, readable at gameplay scale.
Scale law: the final image will be about 1254 px square with 4x4 cells of about 313 px. In EACH cell, the automaton body plus hover exhaust should be about 230-250 px tall, centered with padding. Do not make it tiny. Do not let the pan arm make one cell much taller than the rest.
ABSOLUTE BACKGROUND RULE: every pixel outside the character must be one uniform solid chroma-key color #ff00ff. No vignette, no gradient, no lighting, no glow spill, no shadow, no floor, no texture, no halos. Keep teal glow inside the character/exhaust only, not on the magenta background.
Canvas/grid: Square sprite sheet, exactly 4 equal columns and 4 equal rows, uniform cell sizes, no drawn grid lines, no labels, no text.
Rows top to bottom:
Row 1 = north/back view: rear brass panel and rear cap visible, front teal chest/core window hidden; tiny teal hover exhaust under the body.
Row 2 = northwest/back-three-quarter view: back-left side visible, front core only barely edge-visible or hidden.
Row 3 = west/left profile view: side silhouette, pan arm on the far/back side if needed, no arm swap.
Row 4 = southwest/front-three-quarter view: front core visible, matching sheet A identity.
Columns left to right in every row: hover-bob low, mid-rise, high, mid-fall. Make the hover cycle distinct through vertical offset and subtle core/exhaust pulse, same identity and same scale.
Pan-arm law: The prospector pan stays attached to the automaton's same physical right-side arm from sheet A. It may be hidden behind the body in back/side views, but it must not jump to the opposite arm.
Constraints: no text, no letters, no watermark, no weapons, no guns, no firearm silhouette, no gore, no legs, no walk cycle, no extra characters, no Native American imagery, no photorealism.

### Portrait prompt

Use case: stylized-concept
Asset type: Gold Rush HUD/bench portrait raw asset, `char-prospector-portrait.png`
Primary request: Create a single bust/three-quarter portrait of the SAME accepted automaton companion from the two previous Prospector sprite sheets: the player's AI companion, canon name "the Prospector". Preserve identity exactly: small hovering brass-and-copper lantern-like robot buddy, warm teal agent-glow core seam, subtle miner's-cap silhouette, tiny articulated arms, one arm holding a small prospector's pan on the same physical side, charming and warm.
Reference style: Match the visible townsfolk portrait framing and the Gold Rush Frontier Ledger style: fine sepia engraved linework and hatching, muted warm colors, tactile brass/copper materials, parchment/frontier storybook feel, illustrated, not photorealistic.
Composition/framing: Square portrait, bust/three-quarter view, centered, upper-body/lantern body fills the frame similarly to the visible townsfolk portrait. The automaton faces slightly toward the viewer with the teal core seam readable, pan arm partly visible, generous margins, clean HUD-ready silhouette.
Background: parchment-tone warm neutral background like the townsfolk portrait family, softly flat and unobtrusive. No magenta background for the portrait.
Lighting/mood: warm, helpful, cooperative, soft upper-left light; teal intelligence glow contained in the core seam.
Constraints: no text, no letters, no watermark, no weapons, no guns, no firearm silhouette, no gore, no legs, no extra characters, no Native American imagery, no photorealism, do not make it a human miner.

## Retry Log

- Sheet A attempt 1 rejected after measurement: visually clean identity, but most cells measured only 196-201 px high against the requested ~221-265 px companion band.
- Sheet A retry accepted: scale landed close to target, cell map remained correct.
- Sheet B attempt 1 rejected: top row read too front-facing for north/back, and the magenta background had visible vignette.
- Sheet B retry 1 accepted visually but superseded after Sheet A retry changed scale.
- Sheet B final retry accepted with caveat: row map and identity pass, but native foreground heights remain smaller than target after the allowed two retries.
- Portrait attempt 1 accepted: same brass lantern automaton, parchment portrait framing, no text/weapons.

## Measured QA

Measurement method: hero band from processed alpha bboxes of `assets/processed/char-hero-sheet-rotation2-r*c*.png`; sheet foreground bboxes measured against magenta with max-channel distance `> 40` to avoid counting near-key background drift.

- Hero rotation2 measured band: 316-379 px.
- Companion target at ~70%: 221-265 px.
- Sheet A: 1254x1254, 4x4 cells of 313.5 px.
  - Foreground heights by row: `222,224,224,224`; `222,221,225,223`; `215,214,215,214`; `220,221,224,221`.
  - Height band: 214-225 px; median 222 px. PASS with small low-profile side-view shortfall.
  - Border key: exact `255,0,255` = 0.00%; within extractor default tolerance (`<=26`) = 99.99%; within `<=32` = 100.00%. PASS for `--key ff00ff` tolerance, not literal exact key.
- Sheet B: 1254x1254, 4x4 cells of 313.5 px.
  - Foreground heights by row: `209,209,219,210`; `206,207,219,207`; `200,203,212,205`; `202,205,205,206`.
  - Height band: 200-219 px; median 207 px. PARTIAL: under the 221-265 px target after retry limit; flag for fire-side scale-match/review before activation.
  - Border key: exact `255,0,255` = 0.00%; within extractor default tolerance (`<=26`) = 99.99%; within `<=32` = 100.00%. PASS for `--key ff00ff` tolerance, not literal exact key.

Cell-map QA:

- Sheet A rows: south/front shows teal core and pan; southeast shows front-three-quarter with right-side pan; east reads profile; northeast reads back-three-quarter with rear vent/side details.
- Sheet B rows: north/back shows rear brass panel and cap; northwest shows back-three-quarter; west reads profile with core edge/side arm; southwest returns to front-three-quarter with teal core.
- All sheets contain 16 distinct cells with consistent 4x4 alignment.
- Hover phases read left to right as low, mid-rise, high, mid-fall through top-offset changes and teal exhaust/core pulse.
- Pan-arm side is visually consistent enough across accepted cells: the pan stays on the same design side and appears/occludes with turn angle rather than swapping as a mirrored duplicate.
- 25% zoom: teal core/exhaust remains readable in front and three-quarter cells; back cells rely on exhaust glow, which still reads at gameplay scale.
- Canon: no text, letters, watermarks, weapons, firearm silhouettes, gore, or Native American enemy imagery found in the accepted assets.

## Processing Notes For Fire

- Do not assume literal exact `#ff00ff`; these built-in image_gen raws are near-key magenta. The current `extract-alpha.mjs --key ff00ff` default tolerance should handle the border, but inspect teal exhaust edges after extraction.
- Sheet B is smaller than Sheet A. Use the existing scale-match decision gate before wiring `char.prospector_agent`; do not activate if cross-sheet size pops are visible.
