# F-PP1-1 — Baron native terminal remains unproved

2026-09-25. Two completed play attempts, one per viewport, after two short instrument probes. No gameplay or balance edits. Trail progressed-profile seed matches the secure census; keyboard movement/Space and HUD clicks only. The contract selector and timescale=4 follow the reference launch method; no debug or seed override.

- Desktop, gather and extend: died wave 16, 421.7 s, 589 kills, 26 gold, seven buildings. Last position (25.0, 6.16), during a funding trip; boss had not spawned. [Row](row-desktop-chrome.json), [terminal](terminal-desktop-chrome.png), [log](desktop-play-1.log).
- Phone, hold ground: died wave 23, 609.5 s, 552 kills, 60 gold, position (11.33, -9.06). Two earned turrets both wrecked, no repairs. Sluice at (7, 6) refused placement. Subsequent routes failed to reach seams at (7.5, 6.5) and (-9, 6.7); gold stayed below the third turret's 95 cost. Rocket Cart fired ten volleys; boss retained 33,237.29/53,346.89 HP (62.3%). [Row](row-mobile-chrome.json), [terminal](terminal-mobile-chrome.png), [log](phone-play-2.log).
- Both boots and clean cells PASS: zero console/page errors. Secure, banking, Book return and reload remain unproved. These failed strategies do not establish that every honest build order fails, nor that either seam is impossible to reach.

The first instrument probe omitted the contract selector and booted The Claim; `boot-instrument-row.json` preserves it. A second probe stopped at an upgrade-overlay/build-tile click race (`build-interruption-row.json`); the new driver retries real clicks after taking the upgrade. Neither counts as a full attempt. The phone trace packager failed after the completed run; this is a Playwright artifact error, not a page error or a load-shaped play failure. New specs disable heavyweight tracing and retain JSON/PNG evidence. Raw traces remain local, ignored rather than deleted.

Driver follow-ups for the next map: shorter key pulses near a destination reduce overshoot at timescale 4; unreachable locations are keyed by coordinates because seam IDs move when replenished. These refinements have not re-proved Baron. Per the two-attempt rule, proceed to Twin Banks.

Commands: `GR_NATIVE_PROOF=1 GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/native-proofs/e1-baron.spec.ts --project=desktop-chrome --workers=1 --reporter=line`; phone adds `GR_NATIVE_STRATEGY=hold-ground` and uses `--project=mobile-chrome`. Both completed play commands exited 1; see saved logs for their output paths.
