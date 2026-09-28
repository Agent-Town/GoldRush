# F-PP1-2 — Twin Banks native wave-20 terminal remains unproved

2026-09-25. Two honest attempts using the authored ±16 fords; no gameplay changes. Both boot and clean pass, zero console/page errors. Neither secured, so banking/Book/reload remain untested. This is a failed proof, not evidence of an impossible map or a diagnosed balance defect.

- Desktop gather-and-extend: died wave 19 / 582.9 s, 888 kills, 1 gold, eight builds and one repair. Seven defenses remained standing. See [row](row-desktop-chrome.json), [terminal](terminal-desktop-chrome.png), [log](desktop.log).
- Phone hold-ground: died wave 18 / 554.1 s, 825 kills, 115 gold, seven builds, at (-2.326, -13.729). Held the center from wave 13 instead of funding/repair excursions; maintained 71 HP through wave 16, then lost it. A late turret selection exhausted retries after upgrade interruptions; two pause warnings are preserved. The unused gold and missing eighth defense remain strategy/driver limitations. See [row](row-mobile-chrome.json), [terminal](terminal-mobile-chrome.png), [log](phone.log).

The trial does not show that a better repair/build order cannot win. Per the two-attempt limit, move to Pressure Garden. No host-load timing failure occurred, so there is no load re-run.

Commands: `GR_NATIVE_PROOF=1 GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/native-proofs/e1-twin-banks.spec.ts --project=desktop-chrome --workers=1 --reporter=line`; phone adds `GR_NATIVE_STRATEGY=hold-ground` and uses `--project=mobile-chrome`. Both exited 1 on the secure assertion. Tracing is off; JSON, terminal PNGs and logs remain.
