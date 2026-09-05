# Release verdict — the owner's device runs (attended template, 2026-09-05)

Why this exists: Astra's review (F-ASTRA-12, verified) showed that every iOS user agent is sent to the lite tier (`src/game/PerformanceTier.ts:245-247`), so the sculpted terrain never installs on iPhone or iPad, and that our 390px Chromium gate proves neither iPhone frame time nor iPhone look. The factory can bind the delivery budget (`deploy-budget-hard-verdict`); only a human can hold the phone. Record one verdict per public build as `docs/release/verdict-<build>.md` using the table below. `deploy.sh` prints whether the file exists.

| Check | How | Record |
|---|---|---|
| Build | `https://agenttown.app/goldrush/version.json` | build id, date |
| Delivery budget | the deploy's RELEASE VERDICT block | bytes vs 25,000,000, PASS/FAIL |
| iPhone (lite) first usable frame | Safari, fresh tab, The Claim from the landing link; count seconds until the hero moves | seconds, device, iOS version |
| iPhone (lite) sustained play | play to wave 8; note stutter, readability of the painted ground, HUD legibility at 390 | pass / notes |
| Android under combat pressure | Chrome, a mid-range phone; play The Claim-Jumper Baron to wave 10+ | frame feel, thermal, notes |
| Lantern reel on the phone | open a watch link from the landing; does the world read? | pass / notes |
| Verdict | one line | SHIP / HOLD, signed by the owner |

Owner directive (2026-09-05): "lets have it fix these findings. This is important stuff." The device rows are the owner's; a fire never fills them.
