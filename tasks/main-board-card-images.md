# Task main-board-card-images: every contract card gets ITS OWN image (MAIN SLOT, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running at the repo root (main slot).
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · src/town/TownScene.ts:79-95 (the plate map: 6 explicit plates, everything else falls back — the owner hit this: "From the trestle onward the contract board does not feature new images") · artifacts/map-rebuild-spike/ (per-map renders: `<map>-proposed-overview.png` / `<map>-landmarks-proposed-overview.png` / `<key>-reuse-verdict.png` — real pictures of every sculpted map) · assets/raw/plate-contract-*.png (the 6 house-style anchors — engraved sepia contract plates).

Pre-flight (MAIN-SLOT): tracked-clean tree check per template; npm install; tsc+build green.

## Why (owner playtest 2026-07-19, verbatim: "From the trestle onward the contract board does not feature new images for the contracts but it uses the same image - can you solve this?")
35 of 41 contracts share one fallback plate. The sculpt program already photographed every map — use those as MAP-TRUE interim cards; engraved plates replace them per art batch (027-031 laddered).

## Scope
1. A build script (scripts/build-board-cards.mjs, committed): for each contract WITHOUT an explicit plate, select its map's best artifact render via an explicit per-contract table (contract-id → artifact filename; variants like picnic/dead-band use their reuse-verdict renders; tileId-reuse twins like flotilla/stillwater may reuse their base map's render — note it in the table), center-crop/downscale to the card aspect the 6 plates use, write `assets/processed/board-cards/<contract-id>.png`. Deterministic (same inputs → same bytes); run it and COMMIT the outputs.
2. TownScene card resolution becomes three-tier: explicit plate (wins) → board-card file → the-claim fallback (never a wrong-map image when a right-map one exists). Data-driven — adding a future plate file needs zero code.
3. Spec e2e/board-card-images.spec.ts (both projects): every visible board card's image URL differs from the-claim's EXCEPT the-claim itself (drive the board with debug all-chapters); trestle specifically shows its own image (the owner's find); zero console.
## Firewall: TOUCH-ONLY the script, assets/processed/board-cards/, the TownScene resolution map, your spec. NO contract data changes, NO plate art edits.
## Self-check: tsc+build · your spec + a town boot green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the per-contract source table.
