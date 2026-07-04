# GPT Image batch-003 — terrain variety + character walk poses

## GENERATION LOG 2026-07-04 (Claude-in-Chrome relay, Robin's Pro account, conversation "Image Generation Request" 6a485bd8-68fc)

**Robin pivot mid-batch (BINDING for all future character art): SPRITE SHEETS, not single poses** — all frames of a character in ONE image (2x2+ grid) for in-image consistency, on a flat distinct key color (**magenta #ff00ff**) for clean grid cutting. The 4 single-pose prompts below were superseded after 2 generations (hero walk-a/b singles = spares in the conversation, NOT downloaded, do not integrate).

Generated + downloaded (ChatGPT title → target filename):
- "Aged desert terrain texture" → `terrain-bank-tile-b.png` (plain filler ✓ quiet, tiles invisibly)
- "Desert ground with scattered pebbles" → `terrain-bank-tile-c.png` (sage-tuft accent ✓)
- "Western adventurers on a treasure hunt" → `char-hero-sheet-side.png` (2x2 magenta: idle-ish/walk-L/walk-R/hurt — 3/4 oblique 'side' orientation; NOTE cell 1 reads as walk too, idle can stay batch-001 standing frame)
- "Bandit rogue in motion poses" → `char-jumper-sheet-side.png` (2x2 magenta: sneak-idle/walk-L/walk-R/flee-with-nugget)

Batch-002 was generated the same session (all 6 icons, titles → filenames): coils→icon-firerate, lightning bolt device→icon-damage, energy rod→icon-range, electrical terminal→icon-volley, chest armor→icon-plating, spring-loaded boot→icon-mobility.

**Robin directive (next art iteration, → batch-004):** characters must cover ALL movement directions + actions (left/right/up/down, turning, shooting, getting hit, panning, building; extensible). Architecture per VP-02 spec addendum: 3 generated orientations (side→mirrored for 4th, front, back) × action cells; one orientation per sheet. Generate batch-004 ONLY after the two side sheets survive extraction→contract→in-game (placeholder-first law: prove the pipeline before buying the matrix).

For Robin: paste each prompt into ChatGPT (GPT Image 2.0), save into `assets/raw/` with the exact filename. Square 1024×1024. **Generate AFTER batch-002 (upgrade icons)** — or in the same sitting if you're up for it; 002 has been waiting longer and unblocks the card UI.

Routed from your 2026-07-04 playtest: terrain repetition + sprite animation. The walk poses are FLIPBOOK PAIRS: per character, generate frame A and frame B with the SAME description, only the stride differs. Minor drift between frames is fine (storybook flipbook at low fps) — but if a frame comes out with different clothing/colors, regenerate that frame, not the pair.

Style anchor (in every prompt, per Portal's Frontier Ledger pipeline): *"Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated."*

Rules baked into each prompt: flat `#8a8a8a` gray background for cutouts (never ask for transparency); no text, no letters, no numbers, no watermarks; muted warm sand/ochre/terracotta/rust palette; greens desaturated and dusty; soft light from upper left.

---

## terrain-bank-tile-b.png — slot `terrain.bank` variant b (full-bleed tile, no gray background)

Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. A seamless square top-down terrain tile of a dry riverbank gold claim: quiet, even parchment-sand ground with fine sepia hatching and scattered small pebbles only — deliberately plain filler ground with NO large features, no ruts, no washes, no paths, so it tiles invisibly; edges fade toward plain aged parchment. Top-down with a very slight oblique tilt, soft light from upper left. No text, no letters, no watermarks, no border lines.

## terrain-bank-tile-c.png — slot `terrain.bank` variant c (full-bleed tile, no gray background)

Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. A seamless square top-down terrain tile of a dry riverbank gold claim: parchment-sand ground with fine sepia hatching, one small patch of dusty desaturated sage tufts off-center and a few scattered pebbles — a gentle low-contrast accent tile with NO linear features, no ruts, no washes, so repetition stays invisible; edges fade toward plain aged parchment. Top-down with a very slight oblique tilt, soft light from upper left. No text, no letters, no watermarks, no border lines.

## hero-homesteader-walk-a.png — slot `char.hero` walk frame A

Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. A single gender-neutral frontier gold prospector character seen from a high oblique three-quarter top-down angle, WALKING mid-step with the LEFT foot forward and arms in a natural stride swing: simple wide-brimmed hat, rolled sleeves, sturdy boots, leather satchel, holding a small brass pan; a small teal-glowing lantern-gadget clipped to the chest strap (subtle, the only cool color). Warm, capable, slightly whimsical storybook look — not a caricature, not childlike. Full figure fully inside frame on a flat solid #8a8a8a gray background, no shadows cast outside the figure, no text or letters or watermarks. Soft light from upper left.

## hero-homesteader-walk-b.png — slot `char.hero` walk frame B

Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. A single gender-neutral frontier gold prospector character seen from a high oblique three-quarter top-down angle, WALKING mid-step with the RIGHT foot forward and arms in the opposite natural stride swing: simple wide-brimmed hat, rolled sleeves, sturdy boots, leather satchel, holding a small brass pan; a small teal-glowing lantern-gadget clipped to the chest strap (subtle, the only cool color). Warm, capable, slightly whimsical storybook look — not a caricature, not childlike. Full figure fully inside frame on a flat solid #8a8a8a gray background, no shadows cast outside the figure, no text or letters or watermarks. Soft light from upper left.

## enemy-claim-jumper-walk-a.png — slot `char.claim_jumper` walk frame A

Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. A single roguish claim-jumper bandit character seen from a high oblique three-quarter top-down angle, sneaking WALK mid-step with the LEFT foot forward, crouched and eager: rust-red poncho, dusty hat pulled low, bandana over the face, empty-handed with grasping gloved hands (no weapons of any kind). Mischievous storybook menace — sneaky and greedy, not frightening, not gory, no ethnic or cultural caricature. Full figure fully inside frame on a flat solid #8a8a8a gray background, no text or letters or watermarks. Soft light from upper left.

## enemy-claim-jumper-walk-b.png — slot `char.claim_jumper` walk frame B

Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. A single roguish claim-jumper bandit character seen from a high oblique three-quarter top-down angle, sneaking WALK mid-step with the RIGHT foot forward, crouched and eager, arms in the opposite swing: rust-red poncho, dusty hat pulled low, bandana over the face, empty-handed with grasping gloved hands (no weapons of any kind). Mischievous storybook menace — sneaky and greedy, not frightening, not gory, no ethnic or cultural caricature. Full figure fully inside frame on a flat solid #8a8a8a gray background, no text or letters or watermarks. Soft light from upper left.
