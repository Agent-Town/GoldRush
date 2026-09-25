# map-play-proofs-1: the generic secure-playability census of the eighteen pending maps (2026-09-25)

Written by the attended session from the second implementer's final summary (its harness refused to write this file; the first implementer died with the session that spawned it, its rows on disk).

## Method
`e2e/playability-secure.spec.ts` widened by `GR_SECURE_CONTRACTS` (a comma list or `all`; unset, unchanged and still gated behind `GR_PLAYABILITY_SECURE`). The eighteen maps on desktop-chrome and mobile-chrome, `--workers=1`, under the attended drain lock, in batches (b1, b1b, b2, b3, the re-runs rr-*, the controls); the batch logs and the driver `batch-run.sh` are under `batches/`. Rows: `artifacts/open-maps-acceptance-e1-e4/secure-rows.jsonl` (48). Census: `docs/bench/playability-secure-census-2026-09-25.md`; the eighteen status rows' second column updated.

## Counts
- 0 of 18 maps pass all six checks on either project; 0 fail outright.
- boots 36/36 pairs; clean (zero console and page errors) 36/36.
- secured on both projects: e2-pressure-garden, e3-blackout-ridge, e10-last-claim, e10-river. Secured on one: e9-devils-alley (desktop), e9-seed-run (mobile).
- instrument limit, 12 maps: an objective the generic kit has no verb for (e1-baron, e2-incline, e3-canyon-works, e3-fairground, e4-dust-flats, e4-gusher-county, e4-boneyard); the opening defences could not be funded from the kit's circuit (e8-far-side, e8-low-orbit, e8-eclipse, e9-dome-basin, e9-old-canal).
- single-project deaths with every defence built: e9-seed-run desktop (wave 14 of 20), e9-devils-alley mobile (wave 16).
- banks: failed on every row that secured (see F-MPP1-1); board and reload therefore unmeasured.

## Attribution of the banks failure (controls)
- Tree before `ux-entry-robustness-1` (`d30d50451`): e1-dry-gulch desktop secured at wave 20, banks failed with the identical detail ("the click wrote no new secured row ... (0 new row(s): [])").
- Today's tree: e1-dry-gulch desktop died at wave 17 (never reached banks); e10-last-claim desktop secured at wave 8 on BOTH trees and failed banks identically.
- History: the only banks "pass" (2026-09-17T23:55Z, e1-dry-gulch) was a seeded row struck by the spec's own report; `secure-rows-AFTER-desktop.jsonl` shows the same failure string on 2026-09-18.
- Cause: since `07248387a` (2026-07-22, "lock Claim wins") the game writes the secured score at secure time, before the click; Return to Town rewrites the same row in place; the spec counts only a row the click adds. `e2e/locked-win.spec.ts` asserts the real behaviour and is green on both trees. Not a regression; `ux-entry-robustness-1` changes no line on this path.

## Findings
F-MPP1-1 (instrument: the banks count), F-MPP1-2 (seven maps need an objective verb), F-MPP1-3 (five maps: opening defences unfunded), F-MPP1-4 (the spec reads secureWave 0 where the engine secures at 20), F-MPP1-5 (two single-project deaths), F-MPP1-6 (a harness-stopped partial row replaced by complete rows).

## Remaining, in order
1. F-MPP1-1 and F-MPP1-4 corrective (fire-authorable): scoreboard snapshot at boot, the engine's secure wave; then re-run the ten secured pairs (about 40 minutes) to measure banks, board and reload.
2. The hand-driven proofs: `tasks/sol-play-proofs-1.md` (Astra, lane-c), queued by the drain that lands this.

READY-FOR-GATES (landed by the attended drain).
