# Native play proofs — run 5 handoff

2026-09-25. **READY-FOR-GATES with the recorded full-proof holds.** Three-map batch: **Dome Basin FAIL, Seed Run FAIL, Devil's Alley PARTIAL (phone PASS)**. No new map has full desktop-and-phone acceptance. No quota refusal, disconnect or timing failure is claimed. This closes at the task's expected three-to-six-map batch boundary. Base `e657f54597128d8b6303af9159086fc5fe7f9170`, lane `sol/map-art-campaign-2`.

| Map | Desktop / phone | Evidence |
| --- | --- | --- |
| Dome Basin | FAIL, deaths wave 15 / 13. Quarry 4/4, gates 3/3 and all five named building grounds complete, eight builds each. | [F-PP5-1](e9-dome-basin/finding.md) |
| Seed Run | FAIL, deaths wave 13 / 14. Caravan arrives with 236.4 / 234.8 guard; three / four late defenses. | [F-PP5-2](e9-seed-run/finding.md) |
| Devil's Alley | PARTIAL desktop, PASS phone. Both wave 20 / 600.07 s, bank/Book/reload/clean PASS; desktop misses east-bay build, phone proves all three bays and both yards. | [F-PP5-3](e9-devils-alley/finding.md) |

Six new-map rows have zero console/page errors. Full-objective assertions remain enabled: five commands exit 1; Devil's Alley phone exits 0. All three maps received exactly two honest attempts, desktop then phone. Do not repeat these holds without a planned follow-up. Neither Dome nor Seed establishes a map defect; their live objectives work, while these defense orders fail survival. Devil's Alley desktop shows a missed build, not impossible placement or balance.

## Driver changes and evidence limits

The Dome opening works the northern quarry and holds C1–C3 before building the five briefing grounds. Desktop revealed the old home helper clamping a seed-row centre to the first declared zone, the distant quarry renovation pad. Phone selects the correct seed-row zone; survival still fails.

Seed follows the caravan on foot and deliberately declines optional planting to preserve guard. The crossing succeeds both times. The ordinary wave-20 terminal remains required after arrival. Phone moves the post-escort home from the western waypoint to the central three-seam ground. No planting or planting-persistence acceptance is claimed.

Devil's Alley crosses both yards then builds around the anchors. Desktop's eastern beacon does not register despite a valid preview; its exact missed-input cause is not captured. The build helper now handles upgrades immediately before confirmation and retries at most three native Space presses, stopping once a purchase is observed or the preview becomes invalid. Phone proves all named goals. The desktop proof is NOT promoted based on the phone correction. Per-attempt driver snapshots retain the actual versions.

The unchanged Incline strategy was run on desktop and phone after each relevant driver revision and before the next map: initial Dome version, Dome circuit + Seed escort, Seed central home + Alley route, and final build confirmation. Earlier logs are retained; `e2-incline/row-*.json` and its boards represent the final run.

## Method and preflight

Progressed-profile seed, staged launch, permitted timescale 4, real WASD/Space/upgrade keys and HUD clicks; diagnostics are read-only. Desktop 1280×800 and phone 390×844, one worker, sequential browser projects, trace off. No gameplay, balance, contract, existing non-native-test, config or art-store edits.

Clean lane, no ahead commits, no discarded evidence. Authorized reset/clean, `npm install --no-audit --no-fund`, preflight `npm run build`: exit 0. Restored only npm-generated optional-platform libc lock metadata; verified clean before edits. A transient git index lock cleared without intervention. Owned Vite PID 68050 on port 5303, stopped at closeout; no attended ports used. Task firewall excludes vault writes; this allowed artifact is the durable handoff.

## Commands and gates

Per map/project: `GR_NATIVE_PROOF=1 GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/native-proofs/<id>.spec.ts --project=<desktop-chrome|mobile-chrome> --workers=1 --reporter=line --output=artifacts/sol/play-proofs/run-5/<id>/<desktop|mobile>-results`. Incline additionally sets `GR_NATIVE_RUN=5` and runs both projects in sequence.

- Final `npx tsc --noEmit`: PASS, exit 0 ([log](tsc-final.log)).
- Final `npm run build`: PASS, exit 0, including TypeScript and asset checks; existing Vite/asset-diet warnings ([log](build-final.log)).
- Collection: PASS, exit 0, 3,452 tests / 469 files ([log](default-list.log)). Actual env-unset native run: **34 skipped**, exit 0 ([log](gate-unset.log)); collection alone is not a skip proof.
- Final-driver Incline: **PASS desktop/phone**, both wave 14 / 577.47 s; 143 / 63 HP, carts 180/180 HP, all six cells, zero console/page errors. [Final command log](incline-final.log), [desktop row](e2-incline/row-desktop-chrome.json), [phone row](e2-incline/row-mobile-chrome.json). Earlier three paired regressions also exit 0 in incline.log, incline-seed.log and incline-alley.log.
- Existing unmodified `e2e/locked-win.spec.ts --grep 'The Claim card names'`, desktop/phone, one worker, trace off: **2 passed**, exit 0 ([log](adjacent.log)). This is a bounded adjacent check, not the full suite.
- `python3 artifacts/sol/play-proofs/run-5/verify.py`: PASS ([result](verification.json)). Eight final rows, all clean; exactly three second-column status edits; one appended report section; allowed paths; required terminal and successful Book PNGs. The verifier caught the initial Alley status match missing the curly apostrophe. Commit `4197cf0c7` corrects that cell separately rather than rewriting history; this is the exception to same-map-commit packaging.
- Direct image inspection: Dome desktop loss, Seed phone loss, Alley desktop secure and phone Book. No false full-map acceptance inferred from a successful overlay.

## Commits

- `99b2e785b` — Dome Basin attempts, objective checks and circuit correction.
- `7feaf2556` — Seed Run escort attempts and central defense home.
- `7f6521921` — Devil's Alley phone proof, desktop partial and build confirmation correction.
- `4197cf0c7` — correct the missed Alley status cell (curly-apostrophe match).
- Final evidence and handoff: containing closeout commit, hash in final response.

## REMAINING LIST IN ORDER

Current unresolved map first, untouched continuation next, exhausted findings last. **Next untouched: e9-old-canal.**

1. e9-devils-alley — PARTIAL: phone PASS; desktop east-bay build unproved, F-PP5-3. Two attempts exhausted.
2. e9-old-canal — untouched.
3. e10-last-claim — untouched.
4. e10-river — untouched. Its briefing describes the post-credits, no-wave pan; do not mistake raw wave-20 survival for that authored ending.
5. e9-dome-basin — FAIL, F-PP5-1, two attempts exhausted.
6. e9-seed-run — FAIL, F-PP5-2, two attempts exhausted.

E8 trio and earlier campaign holds remain excluded. E8 requires an orbital movement driver before a planned retry; Canyon Works remains with its separate corrective owner.
