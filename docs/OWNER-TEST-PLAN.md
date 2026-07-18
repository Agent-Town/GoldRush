# THE OWNER TEST PLAN — your time, spent only where only you can spend it
Written 2026-07-18 (owner: "I really have to start testing. How can we optimize my time?"). Deploy under test: **https://d2f9c11e.gold-rush-3in.pages.dev** (today's build: all arsenals, ceremonies T3-T5, bosses, audio, CP-05, town/menu fixes).

## THE DIVISION OF LABOR (the whole trick)
- **The machine proves FUNCTION.** Every merge carries specs: maps boot, zero console, era-gating holds, cure-arms law enforced, ceremonies arm exactly once, saves persist. **Never spend a minute re-verifying these.**
- **Only you can judge FEEL.** Fun, mood, readability, difficulty, pace, delight, "does it look like a fight or a holiday." That is 100% of your job here.
- **I do everything else.** You play and speak; I ledger, verify, author fixes, and re-deploy.

## THE PROTOCOL (near-zero friction)
1. Open a session below; click links; play.
2. Per item, tell me ONE LINE, raw and unfiltered — "ok" · "boring" · "gorgeous" · "too hard by 2min, swarms" · "can't read the river". Voice-note-style typing is perfect. No structure needed — that's my job (playtest-intake turns raw lines into verified findings and tasks).
3. Screenshot ONLY when something looks wrong (the picture saves you a paragraph).
4. STOP when tired. A tired verdict is noise. The ledger keeps your place; nothing is lost between sessions.

## THE SESSION MENU (ordered by what unblocks the most downstream work)
| Session | Time | What | Why first |
|---|---|---|---|
| **A — THE NEW SPINE** | ~35 min | The things NOBODY has ever played: T3 valve ceremony (E3→E4!), one E5 run + one E6 run with the new arsenals (hear the new sounds live), the Homemaker fight + wrangle, the Old Digger swap (E9) | Verdicts today's mega-wave while it's fresh; gates balance passes |
| **B — COUNTY TOUR E1-E5** | ~45 min | 21 maps × ~2 min each: boot, look around, one line (mood / readability / one-thing-wrong) | Unblocks 3D-D polish returns + map fixes |
| **C — FAR TOUR E6-E10** | ~40 min | 16 maps incl. every new landmark pack in place | Verdicts the whole landmark program |
| **D — PHONE PASS** | ~15 min | 3 maps + menus on your phone | Verdicts the overlay fix |
| **E — THE PRESS** | ~15 min | Stamp a charter, play it, then play THE RIVER | The product-inside-the-product |

Recommended order: **A today** (highest information), then B/C split across days, D+E whenever convenient.

## SESSION A LINKS
- T3 ceremony: play an E3 run to the science ceiling, raise the Refinery at the schoolhouse, HOLD the valve. `https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e3-canyon-works&debug&terrain3dPilot&run3dPilot=all`
- E5 new arsenal (harpoon ballista, depth charges): `https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e5-deepwater-claim&debug&terrain3dPilot&run3dPilot=all`
- E6 arsenal + Homemaker + wrangle: `https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e6-glow-mesa&debug&terrain3dPilot&run3dPilot=all`
- E9 Old Digger (board it while it works; swap the tape): `https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e9-dome-basin&debug&terrain3dPilot&run3dPilot=all`
**WHY `&debug&terrain3dPilot&run3dPilot=all` on every door (F-TOUR-1, found by the owner's first click):** the direct-boot param is debug-gated BY DESIGN — without it the game safely falls back to the Claim rather than bypass progression. For the tour that gate is exactly what we override. A plain visit to the deploy root gives the honest progression boot.
Tip: add `&preset=greenhorn` if you want to judge content not challenge; add `&debug&terrain3dPilot&run3dPilot=all` for the test tools (gold, teleport) when you just want to REACH something.

## THE FULL MAP TABLE (tour sessions B+C — click straight in)
| Era | Map | Door |
|---|---|---|
| E1 | The Claim | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=the-claim&debug&terrain3dPilot&run3dPilot=all |
| E1 | The Dry Gulch | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e1-dry-gulch&debug&terrain3dPilot&run3dPilot=all |
| E1 | Night Shift | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e1-night-shift&debug&terrain3dPilot&run3dPilot=all |
| E1 | Twin Banks | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e1-twin-banks&debug&terrain3dPilot&run3dPilot=all |
| E1 | The Claim-Jumper Baron | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e1-baron&debug&terrain3dPilot&run3dPilot=all |
| E2 | The Hill Mine | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e2-hill-mine&debug&terrain3dPilot&run3dPilot=all |
| E2 | The Trestle | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e2-trestle&debug&terrain3dPilot&run3dPilot=all |
| E2 | The Pressure Garden | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e2-pressure-garden&debug&terrain3dPilot&run3dPilot=all |
| E2 | The Incline | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e2-incline&debug&terrain3dPilot&run3dPilot=all |
| E3 | Blackout Ridge | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e3-blackout-ridge&debug&terrain3dPilot&run3dPilot=all |
| E3 | Moth Season | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e3-moth-season&debug&terrain3dPilot&run3dPilot=all |
| E3 | The Canyon Works | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e3-canyon-works&debug&terrain3dPilot&run3dPilot=all |
| E3 | The Fairground | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e3-fairground&debug&terrain3dPilot&run3dPilot=all |
| E4 | The Dust Flats | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e4-dust-flats&debug&terrain3dPilot&run3dPilot=all |
| E4 | The Long Road | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e4-long-road&debug&terrain3dPilot&run3dPilot=all |
| E4 | Gusher County | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e4-gusher-county&debug&terrain3dPilot&run3dPilot=all |
| E4 | The Boneyard | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e4-boneyard&debug&terrain3dPilot&run3dPilot=all |
| E5 | The Deepwater Claim | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e5-deepwater-claim&debug&terrain3dPilot&run3dPilot=all |
| E5 | The Regatta | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e5-regatta&debug&terrain3dPilot&run3dPilot=all |
| E5 | Stillwater | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e5-stillwater&debug&terrain3dPilot&run3dPilot=all |
| E5 | The Flotilla | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e5-flotilla&debug&terrain3dPilot&run3dPilot=all |
| E6 | The Glow Mesa | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e6-glow-mesa&debug&terrain3dPilot&run3dPilot=all |
| E6 | The Showroom | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e6-showroom&debug&terrain3dPilot&run3dPilot=all |
| E6 | Half-Life Hollow | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e6-half-life-hollow&debug&terrain3dPilot&run3dPilot=all |
| E6 | The Picnic | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e6-picnic&debug&terrain3dPilot&run3dPilot=all |
| E7 | The Relay Valley | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e7-relay-valley&debug&terrain3dPilot&run3dPilot=all |
| E7 | Echo Canyon | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e7-echo-canyon&debug&terrain3dPilot&run3dPilot=all |
| E7 | The Dead Band | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e7-dead-band&debug&terrain3dPilot&run3dPilot=all |
| E7 | Relay Rush | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e7-relay-rush&debug&terrain3dPilot&run3dPilot=all |
| E8 | The Mare Claim | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e8-mare-claim&debug&terrain3dPilot&run3dPilot=all |
| E8 | The Far Side | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e8-far-side&debug&terrain3dPilot&run3dPilot=all |
| E8 | Low Orbit | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e8-low-orbit&debug&terrain3dPilot&run3dPilot=all |
| E8 | The Eclipse | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e8-eclipse&debug&terrain3dPilot&run3dPilot=all |
| E9 | The Dome Basin | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e9-dome-basin&debug&terrain3dPilot&run3dPilot=all |
| E9 | The Seed Run | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e9-seed-run&debug&terrain3dPilot&run3dPilot=all |
| E9 | Devil's Alley | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e9-devils-alley&debug&terrain3dPilot&run3dPilot=all |
| E9 | The Old Canal | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e9-old-canal&debug&terrain3dPilot&run3dPilot=all |
| E10 | The Ember Shore | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e10-ember-shore&debug&terrain3dPilot&run3dPilot=all |
| E10 | The Archive World | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e10-archive-world&debug&terrain3dPilot&run3dPilot=all |
| E10 | The Last Claim | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e10-last-claim&debug&terrain3dPilot&run3dPilot=all |
| E10 | The River | https://d2f9c11e.gold-rush-3in.pages.dev/?contract=e10-river&debug&terrain3dPilot&run3dPilot=all |

## VERDICT SINK
Paste raw lines to the attended session (me) any time — even mid-session. I run intake same-day: finding → task → lane → re-deploy. Your only deliverable is impressions.
