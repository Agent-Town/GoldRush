# F-PP5-3 — Devil's Alley passes phone; desktop misses one bay build

2026-09-25. PARTIAL overall: desktop full-goal FAIL, phone PASS. Exactly two attempts, one per project; no third retry. Both reach Claim Secured at wave 20 / 600.07 s, bank a new secured score, return to the Book, and preserve the complete 7,398-byte score across a plain reload with the Book reopened on foot. Zero console/page errors throughout both journeys.

Both cross from the southern yard (0,-48) to northern yard (0,48), then return to build near the anchor stakes. Desktop: 147 HP, 911 kills, eight buildings; west and centre bays built, east beacon does not register despite ghostValid=true. The full goal assertion correctly remains red rather than crediting the overlay alone. Source inspection shows `build` allowed an upgrade to interrupt the interval between preview selection and Space, then made only one confirmation attempt. The exact cause of the desktop missed input is not proven by the recorded samples.

Phone: the helper now handles pending upgrades before confirmation, verifies the building count, and retries up to three native Space presses only while a live valid build preview remains. Its opening central turret still fails an invalid preview, but the west beacon (-34,-10), east beacon (45,11), and subsequent central turrets complete all three bay goals. Ends with 85 HP, 925 kills, eight builds, all six cells PASS. Nineteen wind sweeps complete in the desktop row; anchor protection is observed. No relocation is required by the briefing and none is falsely claimed.

Desktop and phone driver snapshots retain the actual versions. The final build helper requires a fresh Incline regression on both projects, recorded in the run note. Desktop command exit 1, phone exit 0. No timing-shaped failure or rerun. Full desktop acceptance remains held, not a map defect.

[Desktop row](row-desktop-chrome.json) · [phone row](row-mobile-chrome.json) · [desktop secure](terminal-desktop-chrome.png) · [phone secure](terminal-mobile-chrome.png) · [desktop Book](board-desktop-chrome.png) · [phone Book](board-mobile-chrome.png).
