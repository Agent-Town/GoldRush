# visual-polish/01 — batch-001 asset integration

Status: done 2026-07-03T23:42Z.

## Scope

Integrated the six processed batch-001 slots through the existing asset contracts:

- `char.hero`
- `char.claim_jumper`
- `node.gold_seam`
- `bld.sentry_beacon`
- `terrain.bank`
- `terrain.river`

Procedural meshes/textures remain the fallback path when a generated image is missing or fails to load.

## Visual Review

- `terrain.bank` and `terrain.river` now carry the Frontier Ledger texture language in-game: parchment ground, engraved washes, dusty teal river, and muted warm contrast. The river still reads as a gameplay band.
- `char.hero`, `char.claim_jumper`, and `node.gold_seam` render as illustrated billboard sprites at gameplay zoom. The homesteader remains a settler/self-insert silhouette; the claim jumper reads as a rust-toned frontier hazard, not a Native American enemy.
- `bld.sentry_beacon` reads as frontier-tech: brass/wood tripod, teal intelligence core, no firearm silhouette. It stays illustrated rather than gory or grim.
- The fallback path was verified by forcing the gold seam PNG to fail loading; gameplay stayed playable and panning still worked on the procedural seam.
- Screenshot critique carried forward: river/water still reads as rectangular geometry with hard banks; terrain texture repetition is visible; billboard characters need stronger contact shadows; mobile HUD/touch controls need a separate layout/styling pass. These are not batch-001 wiring blockers.

Screenshots:

- `reviews/shots-visual-polish-01/desktop-batch001-assets.png`
- `reviews/shots-visual-polish-01/mobile-batch001-assets.png`

## Verification

- `npm run build` — pass.
- `npx playwright test e2e/visual-polish-assets.spec.ts --project=desktop-chrome --workers=1` — 2/2 pass.
- `npx playwright test e2e/visual-polish-assets.spec.ts --project=mobile-chrome --workers=1` — 2/2 pass.
- `npx playwright test e2e/visual.spec.ts --project=desktop-chrome --workers=1` — 5/5 pass.
- `npx playwright test e2e/visual.spec.ts --project=mobile-chrome --workers=1` — 5/5 pass.
- `npx playwright test e2e/m1-04-gold-panning-economy.spec.ts --project=desktop-chrome --workers=1` — 4/4 pass.
- `npx playwright test e2e/m1-05-sentry-beacon-build.spec.ts --project=desktop-chrome --workers=1` — 6/6 pass.
- `npx playwright test e2e/m1-06-level-up-choices.spec.ts --project=desktop-chrome --workers=1` — 8/8 pass.
- `npx playwright test e2e/m1-01-claim-jumpers-death.spec.ts --project=desktop-chrome --workers=1` — 4/4 pass.
- `codex review --uncommitted` — no discrete introduced issues found.

The focused asset spec checks load status, visible generated sprite counts for hero/seam/beacon/enemy, canvas nonblank, desktop/mobile screenshots, normal console/page errors, and one induced image-failure fallback.
