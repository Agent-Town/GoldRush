# The Deepwater Claim — HELD, native driver does not engage the boss

Desktop default: bounded 600-second play budget exhausted alive at wave 100, 2406.667 simulation seconds, 100 HP, 0 gold, 0 kills, 0 builds, 0 repairs. Dredge-Queen act 1, two live paddles, act 2 locked, no persistent wreck. Phone default: the same bounded hold at wave 100 / 2406.400 s, 100 HP, 0 gold, 0 kills, 0 builds, 0 repairs. Both projects have 0/0 standing/total pieces and zero console/page errors. Both bosses retain two live paddles, act 2 locked and no persistent wreck. Both commands fail the unchanged secure assertion; paired command exit 1 (two failed).

The driver repeatedly uses ordinary ground ghosts on a deck-pad map (`ghostValid=false`); the screenshot shows the empty Claim-Boat and the separate native Claim Boat context menu. Its generic home circuit never engages the anchored boss. `Game.waitsForBaronDefeat` intentionally blocks secure until the Dredge-Queen is beaten; survival far past wave 12 is not completion. This is a driver/QA coverage hold, not proof of an impossible boss or erroneous terminal. Deck building/boss combat changes are outside the shared-driver movement-only exception.

No restoration retry: this is objective non-engagement, not a death with a working objective. No F-ID. No balance change recommended. Bank, Book return and byte-identical score reload are unproved; no successful-bank screenshots fabricated.

[Desktop row](../default/e5-deepwater-claim/row-desktop-chrome.json) · [Desktop objective](../default/e5-deepwater-claim/objective-desktop-chrome.json) · [Desktop terminal](../default/e5-deepwater-claim/terminal-desktop-chrome.jpg). Direct image inspection confirms wave 100 / 100 HP / 0 gold, active play and empty deck.

Command: `python3 artifacts/sol/play-proofs/run-12/run-map.py e5-deepwater-claim`. One worker, default strategy, desktop before phone. Full logs/rows under `~/.goldrush/play-proofs/run-12/default/e5-deepwater-claim/`.

[Phone row](../default/e5-deepwater-claim/row-mobile-chrome.json) · [Phone objective](../default/e5-deepwater-claim/objective-mobile-chrome.json) · [Phone terminal](../default/e5-deepwater-claim/terminal-mobile-chrome.jpg).
