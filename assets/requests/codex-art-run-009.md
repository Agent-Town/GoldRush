# Codex Art Run 009 - batch-012-mkt campaign key art

Date: 2026-07-07
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260707-161743-art-batch-012-mkt-keyart.md`

Scope: raw marketing generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `specs/marketing/README.md` positioning: pillar 1 warm frontier + pillar 2 agent beside you.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` header and current batch rows.
- Existing visual references: `assets/raw/hero-homesteader.png`, `assets/raw/char-prospector-portrait.png`, `assets/raw/ui-menu-backdrop.png`, `assets/raw/bld-sentry-beacon.png`.

Style anchor used in every prompt:

> Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.

## Outputs

- `assets/raw/mkt-hero-16x9.png`
  - source: `/Users/robin/.codex/generated_images/019f3bde-78a0-7020-9e53-19ea2b35222a/ig_057084fbfa57d084016a4cc4b130d88191a209cd1a363f9785.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/mkt-hero-9x16.png`
  - source: `/Users/robin/.codex/generated_images/019f3bde-78a0-7020-9e53-19ea2b35222a/ig_057084fbfa57d084016a4cc526e74481919305aaa2508742e0.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/mkt-hero-1x1.png`
  - source: `/Users/robin/.codex/generated_images/019f3bde-78a0-7020-9e53-19ea2b35222a/ig_057084fbfa57d084016a4cc5a43120819195b1dc73a8b35c1c.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/mkt-og-banner.png`
  - source: `/Users/robin/.codex/generated_images/019f3bde-78a0-7020-9e53-19ea2b35222a/ig_057084fbfa57d084016a4cc643da8c8191a201a6e344b6b780.png`
  - raw prep: copied as generated; no processing.

## Burn count

- New image generations: 4
- Accepted final assets: 4
- Rejected attempts: 0
- Retakes: 0
- Rate-limit/quota errors: 0

## Prompts used

### `mkt-hero-16x9.png`

```text
Use case: ads-marketing
Asset type: Gold Rush campaign key art raw image, target filename assets/raw/mkt-hero-16x9.png
Primary request: Full-bleed 16:9 landscape hero image for "Gold Rush — an Agent Town tale". Golden-hour ridge overlooking the river-valley claim: sluices on the water, a rough palisade ring with clear lane gaps, and teal-glow frontier-tech turrets/sentry beacons around the claim. In the foreground, the player character and the Prospector agent stand side by side with backs to camera, looking down over the claim. The mood is companionship and trust, not combat.
Foreground subjects: player is a warm frontier homesteader/prospector in a broad hat, simple shirt/vest, satchel, and a small teal agent-tech lantern. The Prospector agent is a round brass-and-copper hovering automaton with a miner helmet, teal lens-glow, small articulated arms, and a gold pan; it reads as a helpful robot deputy standing beside the player. Both figures must read clearly at thumbnail size.
Scene/backdrop: river bend through a warm valley claim, small sluice works, timber palisades, lane openings, brass/wood teal-glow sentry beacons, dusty hills, no active enemies.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: cinematic full-bleed 16:9, stable horizon around upper third, figures in foreground lower center, valley below them, no border, no UI, no text.
Lighting/mood: golden hour, warm parchment/ochre/brass palette, dusty teal accents only for agent-tech and river highlights, calm hopeful launch key art.
Constraints: NO text, NO logos, NO letters, NO numbers, NO signage, NO watermark, NO signature. NO magenta. NO gore. NO firearms, no rifles, no pistols, no cannons, no realistic gun barrels; turrets must look like brass-and-teal survey beacons or agent-tech rigs. No Native American enemy imagery, no enemies, no wanted-poster/cowboy parody tropes.
```

### `mkt-hero-9x16.png`

```text
Use case: ads-marketing
Asset type: Gold Rush campaign key art raw image, target filename assets/raw/mkt-hero-9x16.png
Primary request: Full-bleed 9:16 vertical portrait version of the same Gold Rush campaign scene. Golden-hour ridge overlooking the river-valley claim: sluices on the water, rough palisade ring with clear lane gaps, and teal-glow frontier-tech turrets/sentry beacons around the claim. In the lower third foreground, the player character and the Prospector agent stand side by side with backs to camera, looking down over the claim. The mood is companionship and trust, not combat.
Foreground subjects: player is a warm frontier homesteader/prospector in a broad hat, simple shirt/vest, satchel, and a small teal agent-tech lantern. The Prospector agent is a round brass-and-copper hovering automaton with a miner helmet, teal lens-glow, small articulated arms, and a gold pan; it reads as a helpful robot deputy beside the player. Both figures must read clearly at thumbnail size.
Scene/backdrop: valley rises upward through the tall frame: nearby ridge at bottom, river bend and sluices through the middle, palisade claim with lane gaps, teal beacons, warm hills and sky above.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: exact tall 9:16 portrait composition, full bleed with no border. Figures lower third, valley rising vertically, stable horizon high in frame, no UI, no text.
Lighting/mood: golden hour, warm parchment/ochre/brass palette, dusty teal accents only for agent-tech and river highlights, calm hopeful launch key art.
Constraints: NO text, NO logos, NO letters, NO numbers, NO signage, NO watermark, NO signature. NO magenta. NO gore. NO firearms, no rifles, no pistols, no cannons, no realistic gun barrels; turrets must look like brass-and-teal survey beacons or agent-tech rigs. No Native American enemy imagery, no enemies, no wanted-poster/cowboy parody tropes.
```

### `mkt-hero-1x1.png`

```text
Use case: ads-marketing
Asset type: Gold Rush campaign key art raw image, target filename assets/raw/mkt-hero-1x1.png
Primary request: Full-bleed 1:1 square tight crop variant of the same Gold Rush campaign scene. The two companions dominate the lower half: the player character and the Prospector agent stand side by side with backs/three-quarter backs to camera, looking down over the glowing river claim below. The mood is companionship and trust, not combat.
Foreground subjects: player is a warm frontier homesteader/prospector in a broad hat, simple shirt/vest, satchel, and a small teal agent-tech lantern. The Prospector agent is a round brass-and-copper hovering automaton with a miner helmet, teal lens-glow, small articulated arms, and a gold pan; it reads as a helpful robot deputy beside the player. Both figures must read clearly at thumbnail size.
Scene/backdrop: below them is a compact view of the river-valley claim with sluices, a rough palisade ring with lane gaps, and teal-glow brass/wood sentry beacons/turrets. The claim should glow subtly with warm camp lights and teal agent-tech accents.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: exact square 1:1 full-bleed crop, no border. Tight readable crop: two figures large and clear, glowing claim below and between them, stable horizon, no UI, no text.
Lighting/mood: golden hour, warm parchment/ochre/brass palette, dusty teal accents only for agent-tech and river highlights, calm hopeful launch key art.
Constraints: NO text, NO logos, NO letters, NO numbers, NO signage, NO watermark, NO signature. NO magenta. NO gore. NO firearms, no rifles, no pistols, no cannons, no realistic gun barrels; turrets must look like brass-and-teal survey beacons or agent-tech rigs. No Native American enemy imagery, no enemies, no wanted-poster/cowboy parody tropes.
```

### `mkt-og-banner.png`

```text
Use case: ads-marketing
Asset type: Gold Rush Open Graph banner raw image, target filename assets/raw/mkt-og-banner.png
Primary request: Full-bleed wide Open Graph banner in 1200×630 proportion (about 1.91:1), same Gold Rush campaign key-art scene. Golden-hour ridge overlooking the river-valley claim: sluices on the water, rough palisade ring with clear lane gaps, and teal-glow frontier-tech turrets/sentry beacons around the claim. The player character and the Prospector agent stand side by side with backs to camera, looking down over the claim. The mood is companionship and trust, not combat.
Foreground subjects: player is a warm frontier homesteader/prospector in a broad hat, simple shirt/vest, satchel, and a small teal agent-tech lantern. The Prospector agent is a round brass-and-copper hovering automaton with a miner helmet, teal lens-glow, small articulated arms, and a gold pan; it reads as a helpful robot deputy beside the player.
Scene/backdrop: river bend, sluice works, palisade ring with lane gaps, brass/wood teal-glow sentry beacons, dusty hills, no active enemies.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: exact wide 1200×630-proportioned banner, full bleed with no border. The entire left third must be clear negative space for later engine-side title placement: quiet warm sky and simple shaded ridge/parchment texture only, low detail, no faces or bright clutter there. Place the two figures and the readable river claim mainly in the center/right two-thirds. Stable horizon, no UI, no text.
Lighting/mood: golden hour, warm parchment/ochre/brass palette, dusty teal accents only for agent-tech and river highlights, calm hopeful launch key art.
Constraints: NO text, NO logos, NO letters, NO numbers, NO signage, NO watermark, NO signature. NO magenta. NO gore. NO firearms, no rifles, no pistols, no cannons, no realistic gun barrels; turrets must look like brass-and-teal survey beacons or agent-tech rigs. No Native American enemy imagery, no enemies, no wanted-poster/cowboy parody tropes.
```

## Self-QA

| File | Size | Palette matches warm band | Both figures read at thumbnail | No letters/numbers | Horizon/tilt sane | Notes |
|---|---:|---|---|---|---|---|
| `mkt-hero-16x9.png` | 1672x941 | PASS | PASS | PASS | PASS | Strong wide hero; palisade gaps, river sluices, teal beacons, and companion stance all read. |
| `mkt-hero-9x16.png` | 941x1672 | PASS | PASS | PASS | PASS | Vertical recomposition works; figures sit in lower third and valley rises through frame. |
| `mkt-hero-1x1.png` | 1254x1254 | PASS | PASS | PASS | PASS | Tight crop keeps the two companions large with glowing claim below. |
| `mkt-og-banner.png` | 1730x909 | PASS | PASS | PASS | PASS | Left third is clear parchment/sky negative space; title can land engine-side. |

No processing or retakes were used.
