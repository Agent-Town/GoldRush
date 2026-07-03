# visual-polish/01-batch001-asset-integration

**Contract:** the six processed batch-001 assets render in-game through the existing slot contracts, with procedural placeholders kept as fallback when an image is missing or fails to load.

Assets already exist in `assets/processed/` and are mapped by `assets/layer-contracts/m1-core.layer-contract.v1.json`:

- `char.hero`
- `char.claim_jumper`
- `node.gold_seam`
- `bld.sentry_beacon`
- `terrain.bank`
- `terrain.river`

## Acceptance

- The hero, claim jumper, gold seam, sentry beacon, bank, and river visibly use the processed batch-001 art in a normal run.
- Missing/failed image loads fall back to current procedural placeholders without breaking gameplay.
- `assets/LEDGER.md` marks these six slots integrated only after screenshots prove they render.
- Desktop and mobile screenshots are saved under `reviews/shots-visual-polish-01/`.
- Main loop still works: move, pan, build beacon, level up, die/restart.

## Verification

- `npm run build`
- focused visual Playwright check or existing visual suite plus one asset-presence assertion
- browser console/page error check
- canvas nonblank check
- desktop and mobile screenshots

## Firewalls

- No M2 mechanics.
- No new generated assets.
- No batch-002 icon integration unless Robin has generated those files.
- No art-pack/skin system.
- No new dependencies.

## Done — 2026-07-03T23:42Z

- Integrated all six batch-001 processed assets with procedural fallback retained.
- Added diagnostics for generated asset load status and visible generated sprite counts.
- Added focused Playwright coverage for normal asset rendering and a forced gold-seam image failure fallback.
- Evidence review: `reviews/visual-polish-01-batch001-asset-integration.md`.
- Screenshots: `reviews/shots-visual-polish-01/desktop-batch001-assets.png` and `reviews/shots-visual-polish-01/mobile-batch001-assets.png`.
