# Codex Art Run 006 - batch-009 title and menu shell art

Date: 2026-07-07
Tool path: Codex built-in `image_gen` / gpt-image-2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260707-074246-art-batch-009-title-and-menu.md`

Scope: raw generation only. No extraction, `assets/processed/`, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `CLAUDE.md` section 7 image pipeline.
- `docs/GOLD_RUSH_BRIEF.md` sections 4.1, 4.2, 4.3, and 9.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` header and current batch rows.
- `tasks/044-start-screen-and-menu.md` for the paired start-screen consumer.

## Outputs

- `assets/raw/ui-title-emblem.png`
  - source: `/Users/robin/.codex/generated_images/019f3a07-0408-7940-887e-e2d063d3b64d/ig_042a02f81f961c48016a4c4be1e8b8819190778d1dd080747c.png`
  - raw prep: magenta-like background pixels normalized to exact `#ff00ff`; no alpha extraction.
- `assets/raw/ui-menu-backdrop.png`
  - source: `/Users/robin/.codex/generated_images/019f3a07-0408-7940-887e-e2d063d3b64d/ig_042a02f81f961c48016a4c4c1d090c8191b865db0c983708e7.png`
- `assets/raw/ui-menu-panel.png`
  - source: `/Users/robin/.codex/generated_images/019f3a07-0408-7940-887e-e2d063d3b64d/ig_042a02f81f961c48016a4c4c50dac48191abb579de832c38d6.png`

## Burn count

- New image generations: 3
- Retries: 0
- Rejected assets: 0

## Prompts used

### Title emblem

Use case: logo-brand
Asset type: Gold Rush start-screen raw UI emblem, target filename ui-title-emblem.png
Primary request: Create a square badge/crest emblem for a browser game's title screen. The emblem is only the art around a separately typeset wordmark, so it must contain NO text.
Subject: a brass prospector's pan catching glinting gold nuggets, crossed diagonally with a slender teal-glowing agent-tech survey rod, framed by a rope-and-timber ring. At the base inside the ring, include a tiny river-valley claim vignette with a bend of river and small sluice shape.
Style/medium: Frontier Storybook shell surface, warmer and more composed than in-game cutouts: fine sepia engraved linework and hatching, tactile brass/wood/rope, parchment-warm ochre and sand tones, one controlled teal intelligence accent, illustrated, not photorealistic, not pixel art.
Composition/framing: centered, bold silhouette, generous padding, symmetrical enough to read clearly at both 128px and 512px, no thin stray details at the outer edge.
Background rule: perfectly flat solid #ff00ff chroma-key background across the entire image, with no gradient, no texture, no shadow, no glow, no floor plane, no vignette, no reflection. Do not use #ff00ff anywhere in the emblem.
Constraints: no text, no letters, no numbers, no signage, no labels, no monograms, no watermark, no signature, no characters, no realistic firearms or firearm silhouettes, no gore, no Native American imagery.

### Menu backdrop

Use case: illustration-story
Asset type: Gold Rush start-screen menu backdrop raw asset, target filename ui-menu-backdrop.png
Primary request: Create a wide 16:9 full-bleed painted menu backdrop for a browser game's start screen: the Gold Rush river claim at golden hour, seen from a bluff.
Scene/backdrop: a winding river and ford through a warm valley, simple sluice works near the water, a rough palisade line, small distant town hints on the horizon, soft frontier settlement atmosphere.
Style/medium: Frontier Storybook shell surface: cinematic painted backdrop with fine sepia engraved texture and hatching, warm parchment/ochre/sunlit cream palette, dusty teal river accents, tactile and composed, illustrated, not photorealistic, not pixel art.
Composition/framing: exact wide 16:9 landscape composition, full bleed with no border. The left third must be intentionally darker and quieter with a soft vignette and low-detail shadowed foreground so parchment-light menu text and buttons will be readable there. The right and center show the valley claim and river as the main scenic read. Horizon around upper third, stable and calm.
Lighting/mood: golden hour, warm but not saturated, edges darken subtly toward the frame, no harsh black.
Constraints: no text, no letters, no signage, no labels, no watermark, no UI, no magenta background, no characters in focus; distant tiny silhouettes are acceptable only if they are not readable as individuals. No realistic firearms, no gore, no Native American enemy imagery, no parody cowboy/wanted-poster tropes.

### Menu panel texture

Use case: stylized-concept
Asset type: Gold Rush start-screen UI panel texture raw asset, target filename ui-menu-panel.png
Primary request: Create a clean parchment / ledger panel texture for menu buttons and cards.
Subject: warm parchment paper grain with a subtle darker inked edge border, faint fibers, slightly worn corners, tactile ledger-page surface. No objects except the panel texture itself.
Style/medium: Frontier Storybook shell surface, parchment-warm, restrained, readable, fine sepia engraving texture, handmade paper feel, illustrated material texture, not photorealistic, not pixel art.
Composition/framing: square full-bleed texture, tileable-ish center area, border visible near the edges but not ornate, no heavy shadows, no strong directional lighting, no folds that would fight button text.
Color palette: sand, cream, ochre, muted brown ink edges; no bright colors, no teal except maybe imperceptible aged-paper coolness.
Constraints: no text, no letters, no numbers, no symbols, no watermark, no signature, no UI labels, no magenta background, no characters, no firearms, no gore.

## Measured QA

- `ui-title-emblem.png`: 1254x1254. Exact `#ff00ff` key covers 40.01% of pixels after raw prep; every magenta-like pixel equals exact key. Foreground bbox is `[50,49]..[1201,1204]`.
- Emblem 128px read: rope/timber ring, brass gold pan, and teal rod remain identifiable. Emblem 512px read: river/sluice vignette and gold glints are clear. Visual inspection found no text, letters, numbers, watermark, characters, firearms, or gore.
- `ui-menu-backdrop.png`: 1672x941, aspect 1.7768. Left-third approximate luminance is 28.4/255, center 90.3/255, right 115.0/255, so the menu column is darker than the scenic read. Horizon sits near the upper third; composition supports one left-side action group per section 4.3. Visual inspection found no text/UI, no characters in focus, no firearms, and no gore.
- `ui-menu-panel.png`: 1254x1254 full-bleed parchment panel texture. Center stays quiet for button/card text, edge border is present, and visual inspection found no text or symbols.
- Palette: parchment/ochre/brass warmth with teal accents only where requested; no saturated non-canon colors except the emblem extraction key.

## Processing notes for fire

- Use `assets/layer-contracts/ui.v1.json`; all three slots are DORMANT/PENDING-PROCESSING.
- `ui-title-emblem.png` is key-ready for `--key ff00ff`; this run did not extract alpha.
- `ui-menu-backdrop.png` and `ui-menu-panel.png` are full-bleed raws; no magenta key expected.
