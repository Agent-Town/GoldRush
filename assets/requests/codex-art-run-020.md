# Codex Art Run 020 - E7 Signal Era saga-library plates

Date: 2026-07-09
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260709-144301-art-saga-library-e7.md`

Scope: raw saga-library plate generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `specs/epoch-saga/e7-signal-bundle.md` art manifest and style anchor.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` current kit, codex, turnaround, and E2/E3/E5/E6 saga-library rows.
- `lore/canon-rules.md` Persistence Law and canon guardrails.
- E6 continuity anchor: `kit-era-6.png`.
- Character anchors: `codex-hero-e1.png`, `turn-hero-base.png`, `codex-prospector-e1.png`, `turn-prospector.png`.

Style anchor used in every prompt:

> Frontier Ledger style: antique expedition ledger map or concept plate, hand-engraved storybook illustration, fine sepia ink hatching and cross-hatch shading, tactile parchment texture, illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image.

E7 palette addendum used in every prompt:

> vacuum-tube warmth: walnut consoles, glass tubes glowing honey-gold, punch-tape ribbons, teal agent-glow now EVERYWHERE (this is their era); signal drawn as engraved concentric arcs.

Every prompt specified no text/letters/numbers/logos/watermarks/signatures, no firearms or gun-like silhouettes, no gore, no Native American enemy imagery, and no bright magenta/#ff00ff.

## Outputs

- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/kit-era-7.png`
  - source: `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_0326ee5e6c97c6aa016a4f51b58f548191aaf967061cd158f9.png`
  - purpose: Signal Era continuity plate, conditioned on `kit-era-6.png` and the Persistence Law.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/codex-hero-e7-outfit.png`
  - source: `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_0326ee5e6c97c6aa016a4f521a85408191a5370230e8ab7a7c.png`
  - purpose: hero Signal Era outfit reference, conditioned on hero codex/turnaround anchors.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/codex-prospector-e7.png`
  - source: `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_0326ee5e6c97c6aa016a4f52715b3c8191808dbfb93ae66b15.png`
  - purpose: Prospector signal variant reference, conditioned on Prospector codex/turnaround anchors.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e7-enemy-rogue-automaton.png`
  - source: `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_0326ee5e6c97c6aa016a4f52c4e59081919df9bef1acb333e6.png`
  - purpose: rogue automaton/corrupted-playbook enemy plate.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e7-enemy-data-rustler.png`
  - source: `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_0326ee5e6c97c6aa016a4f531edb048191b071014178b6e7ec.png`
  - purpose: data rustler/outlaw tapper enemy plate.
  - post-copy normalization: width resized from 1671 to 1672 px; height unchanged.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e7-enemy-static-hare.png`
  - source: `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_0326ee5e6c97c6aa016a4f5382e9788191b7ebb5d6e1cdfb03.png`
  - purpose: static hare/nature interference enemy plate.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e7-boss-the-echo.png`
  - source: `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_0326ee5e6c97c6aa016a4f53e556bc8191afb1cafe5ebb7ddf.png`
  - purpose: Echo boss material/layout-copy reference plate.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e7-bld-relay-tower.png`
  - source: `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_0326ee5e6c97c6aa016a4f544517f48191a79a13e6fe23761b.png`
  - purpose: Relay Tower signature pylon building plate.
  - post-copy normalization: width resized from 1670 to 1672 px; height unchanged.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e7-bld-the-exchange.png`
  - source: `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_0326ee5e6c97c6aa016a4f549fde5481919d628215967a72ed.png`
  - purpose: the Exchange tavern-annex/switchboard-hall poster plate.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e7-bld-playbook-library.png`
  - source: `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_005c23fd449f5c78016a4f56ca1d588191ad3b344cadfad833.png`
  - purpose: Playbook Library schoolhouse/card-catalog building plate.

Rejected source:

- `/Users/robin/.codex/generated_images/019f45d4-7e64-7be1-8ca2-d658a6c40006/ig_0326ee5e6c97c6aa016a4f55679cf48191b10240dd4a3773bb.png`
  - rejected for possible page/writing marks on the Playbook Library; retake prompt forced blank cards/plaques and punch holes only.

QA contact sheet: `artifacts/art-saga-e7/contact-sheet.png`.

## Burn count

- New image generations: 11
- Accepted final assets: 10
- Rejected attempts: 1
- Retakes: 1
- Exchange retakes used: 0 of 4
- Rate-limit/quota errors: 0

## Prompt notes

- `kit-era-7.png`: preserve `kit-era-6.png` harbor/lighthouse/boats/shore rails/mill/dynamo works/reactor dome/diner; add ridgeline relay masts, dish, punch-tape ribbons, walnut console huts, teal agent-glow everywhere, honey-gold tubes, and engraved concentric signal arcs.
- `codex-hero-e7-outfit.png`: same young woman miner identity; add field coat, slim headset, folding antenna, punch-tape bandolier, operator satchel, and teal cuff/collar trim.
- `codex-prospector-e7.png`: same round brass Prospector chassis; add concentric-arc antenna ring, honey-gold glass-tube core pip, teal seams, punch-tape reel, and relay fittings.
- `plate-e7-enemy-rogue-automaton.png`: corrupted playbook machine swarm, mis-sequenced ghost poses, jagged teal glow, tangled punch-tape loops.
- `plate-e7-enemy-data-rustler.png`: lone outlaw tapping relays with crystal-set backpack, copper tap-wires, alligator clips, and hand tools only.
- `plate-e7-enemy-static-hare.png`: mischievous static-charged hare swarm with honey-gold sparks and broken teal signal ripples.
- `plate-e7-boss-the-echo.png`: semi-reflective teal/honey-gold material applied to a mirrored base layout of palisades, beacon rigs, turret rigs, relay posts, and resource paths.
- `plate-e7-bld-relay-tower.png`: lattice mast, dish, two relay cells, walnut console hut, teal base glow, engraved LOS arcs.
- `plate-e7-bld-the-exchange.png`: tavern annex transformed into a switchboard hall, retaining booth/jukebox lineage with walnut switchboards, tubes, plug cords, punch-tape loops, teal sockets, and an operator.
- `plate-e7-bld-playbook-library.png`: schoolhouse library of blank cards, punch-tape catalogs, walnut drawers, honey-gold reading lamps, and teal helper-filing glow; first pass retaken for stricter no-writing compliance.

## Measured QA

Dimensions and magenta purity were checked with ImageMagick and a `pngjs` scan. Letter/text, firearms, no-gore, identity-chain, persistence, palette, and role-read checks are visual checks against the saved assets and contact sheet.

| File | Size | Magenta | Identity / persistence check | Canon check | Verdict |
|---|---:|---:|---|---|---|
| `kit-era-7.png` | 1672x941 | 0 exact, 0 near | Harbor, lighthouse, boats, shore rails, mill/dynamo works, reactor dome, and diner visibly persist; relay masts, dish, console huts, teal network glow, punch-tape, and concentric arcs added over them. | No visible text/firearms/gore; E7 walnut/honey-gold/teal palette held. | PASS |
| `codex-hero-e7-outfit.png` | 1672x941 | 0 exact, 0 near | Same young woman miner face/build; headset, field coat, folding antenna, punch-tape bandolier, and teal trim clear. | No visible text/firearms/gore; operator read, not soldier. | PASS |
| `codex-prospector-e7.png` | 1672x941 | 0 exact, 0 near | Same round brass Prospector silhouette; antenna ring, honey-gold tube pip, teal seams, and punch-tape reel clear. | No visible text/firearms/gore; civic agent read, not weapon. | PASS |
| `plate-e7-enemy-rogue-automaton.png` | 1672x941 | 0 exact, 0 near | Corrupted playbook swarm reads as machine silhouettes with mis-sequenced ghost poses and jagged teal glow. | Machine/program enemy only; no people, text, firearms, or gore. | PASS |
| `plate-e7-enemy-data-rustler.png` | 1672x941 | 0 exact, 0 near | Lone rustler, relay tap, crystal-set backpack, copper clips/wires, and signal-siphon posture readable. | Outlaw only, no tribe coding; tap-tools only, no visible firearms/text/gore. | PASS |
| `plate-e7-enemy-static-hare.png` | 1672x941 | 0 exact, 0 near | Bounding static hare swarm, crackling fur, honey-gold sparks, broken teal signal ripples, and comedic motion read clear. | Nature enemy only; no people, weapons, text, or gore. | PASS |
| `plate-e7-boss-the-echo.png` | 1672x941 | 0 exact, 0 near | Echo material reads as mirrored palisade/beacon/turret-rig/relay layout looking back at the player. | Machine/pattern boss only; no people, text, firearms, or gore. | PASS |
| `plate-e7-bld-relay-tower.png` | 1672x941 | 0 exact, 0 near | Lattice mast, dish, linked relay cells, walnut console hut, teal base glow, and LOS arcs are readable. | Building only; no text/firearms/gore. | PASS |
| `plate-e7-bld-the-exchange.png` | 1672x941 | 0 exact, 0 near | Tavern-annex massing, booth/jukebox lineage, walnut switchboard hall, tubes, plug cords, punch-tape loops, teal sockets, and operator figure all visible. | No visible text/firearms/gore; poster plate passes with 0 Exchange retakes. | PASS |
| `plate-e7-bld-playbook-library.png` | 1672x941 | 0 exact, 0 near | Schoolhouse library, blank card catalogs, punch-tape reels, walnut drawers, reading lamps, and teal helper-filing glow read clear after retake. | No visible text/firearms/gore; cards/plaques are blank or hole-punched only. | PASS |

No alpha extraction, processed outputs, layer-contract edits, source changes, specs, reviews, e2e, or commits were created.
