# F-PP1-3 — Pressure Garden coal route works; full boiler play remains unproved

2026-09-25. Two real-input attempts; both boot/clean PASS with zero console/page errors. Both visited all three high-terrace coal seams at (-12,39), (-5,43), (3,39), collecting 12 coal. Thus the generic census's inability to reach resources is not reproduced by this authored route.

- Desktop resource-first: died wave 3 / 99.47 s, 36 kills, 120 gold, at (20.02,26.22), before building. [Row](row-desktop-chrome.json), [terminal](terminal-desktop-chrome.png), [log](desktop.log).
- Phone defense-first: placed turrets at (-28,24) and (-21,27), then collected coal and 200 gold. Reached the boiler beds at wave 8 / 251.87 s with 49.6 HP. Placed boilers at (-12,12), (-1,12), (16,12); only two were observed hot simultaneously. Died wave 11 / 345.6 s, 370 kills, 85 gold, at (24.00,39.40) while funding a further turret. [Row](row-mobile-chrome.json), [terminal](terminal-mobile-chrome.png), [log](phone.log).

Both attempts fail before the wave-12 Claim Secured terminal; bank/Book/reload untested. The pressure side objective's 8–12 window and all three run-card boiler beds remain unproved. These are strategy failures, not proof that the map cannot be completed: the phone strategy commissioned its boilers too late and exposed the hero on another resource trip. No balance/contract/runtime edits or test-only channels were used. Per the two-attempt rule, continue to The Incline.

Run command: `GR_NATIVE_PROOF=1 GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/native-proofs/e2-pressure-garden.spec.ts --project=desktop-chrome --workers=1 --reporter=line`; phone adds `GR_NATIVE_STRATEGY=hold-ground` and uses `--project=mobile-chrome`. Both exited 1. Coal collection is automatic at the seam; the driver uses only WASD, upgrade keys, Build clicks and Space.
