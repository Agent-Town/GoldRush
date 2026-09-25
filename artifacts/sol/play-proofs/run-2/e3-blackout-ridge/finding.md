# F-PP2-1 — Blackout Ridge repairs do not keep the whole storage chain alive

2026-09-25. PARTIAL desktop/phone after two honest attempts. Both secure wave 12 at 360.13 simulation seconds, bank, return to the Book, preserve scoreboard bytes across plain reload and reopen the Book. Zero console/page errors. The authored current-storage assertion remains FAIL: both banks peak at 0 Wh.

- Desktop, nearest damaged bank/frame first: 15 repairs; both banks finish at 70/70 HP, but west and middle trunk frames finish wrecked. Hero 119/175 HP, 10 gold, 196 kills; score persistence 7,399 bytes. Bank positions (16,5), (7,4). The source is isolated from both banks at terminal.
- Phone, west-to-east repairs with a reserve for all damaged works: 12 repairs; all three trunk frames finish at 40/40 HP, but both banks finish wrecked. Hero 159/175 HP, 54 gold, 237 kills, position (-4.555,-5.782); score persistence 7,400 bytes. Both banks were built at (16,5), (7,4).

The competing repair routes each restored one half of the network while the other half fell. Neither proves simultaneous current storage, and neither establishes that every possible strategy fails. No gameplay, contract or balance edits. No host-load timeout occurred. Stop after the two attempts and continue to Canyon Works.

[Desktop row](row-desktop-chrome.json) · [phone row](row-mobile-chrome.json) · [desktop terminal](terminal-desktop-chrome.png) · [phone terminal](terminal-mobile-chrome.png). The committed driver retains the phone repair strategy; the desktop attempt used nearest-distance ordering and funded only the selected repair. Logs preserve both attempts. Both enabled commands exit 1 on the storage assertion; the other five cells pass.
