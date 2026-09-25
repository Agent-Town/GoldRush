# The Incline — native proof passes desktop and phone

2026-09-25, Trail progressed profile, 1280×800 desktop / 390×844 Pixel 5 project. All six cells PASS on both projects. Each cart arrived at 180/180 HP, then the railcar was defeated and Claim Secured appeared. The genuine score is newer/better than the map's seeded wave-1 entry, retained after Return to Town, and byte-identical after plain `/` navigation and reopening the Book on foot.

| Project | Terminal | HP | Builds | Persistence |
| --- | --- | --- | --- | --- |
| desktop-chrome | wave 14 / 590.80 s | 74.6 | 5 | score retained across reload (7397 bytes) and the Book reopened on foot |
| mobile-chrome | wave 14 / 576.40 s | 137.8 | 5 | score retained across reload (7397 bytes) and the Book reopened on foot |

[Desktop row](row-desktop-chrome.json) · [phone row](row-mobile-chrome.json) · [desktop terminal](terminal-desktop-chrome.png) · [phone terminal](terminal-mobile-chrome.png) · [desktop Book](board-desktop-chrome.png) · [phone Book](board-mobile-chrome.png). Zero console/page errors across each full journey. Terminal screenshot explicitly reads THE INCLINE RAILCAR: DEFEATED. No art/runtime/balance edits, no debug or engine seam.

Strategy: real Town → tavern → Steamworks chapter → Incline launch button. The Book generates `mode=escort`; reload that generated URL adding only the permitted `timescale=4`. Gather through the authored ±12 fords, build one beacon and four turrets spanning the lower haul lines, and hold near (0,-18) after wave 8. No resource/expansion trips after the fourth turret. The successful strategy is the new spec's default.

F-PP1-4 (resolved instrument issue): bare contract launch leaves `escort.enabled=false`. The initial wrong-mode probe died wave 1 and is preserved in `wrong-mode-desktop-row.json`; it is not the authored Haul proof. A subsequent actual-Haul gather-and-extend desktop attempt delivered its cart but died wave 11 / 472.5 s; preserved in `gather-desktop-row.json` and `haul-desktop.log`. Holding the already-built defense then passed on phone and desktop. This establishes a working strategy, without changing the map.

Commands: `GR_NATIVE_PROOF=1 GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/native-proofs/e2-incline.spec.ts --project=desktop-chrome --workers=1 --reporter=line` (exit 0, `hold-desktop.log`). Phone used the same command with `--project=mobile-chrome` and `GR_NATIVE_STRATEGY=hold-ground` (exit 0, `haul-phone.log`); that behavior is now the Incline default. The removed unused boss-position branch never ran in the passing phone attempt; the mounted standard is a defeat prop, not a live boss tracking point.
