# F-PP3-1 — Dust Flats haul and defense openings both lose the Prospector

2026-09-25. FAIL desktop/phone after two honest attempts, commands exit 1. Both boots/clean PASS, zero console/page errors. No bank, Book return or reload acceptance. This is a strategy finding, not proof of impossibility or a diagnosed map defect.

Desktop, haul first: harvested all three tar nodes with real movement, confirmed at (0,12) to grade and call the Hauler, then at (0,72). The Hauler rested at (0.346,71.793) at 43.9 s, after 88.344 units travel (60.744 on road), using 13.739 fuel. The authored haul latch is set on arrival within 2.5 units (`src/sim/MotorSocket.ts`, update/nearStop); the terminal additionally waits for the wave-14 Land-Yacht (`assets/contracts/epoch-4-motor/contracts.json`, Dust Flats twist). The Prospector died gathering for the first turret at wave 2 / 69.2 s, 24 kills, 15 gold, zero buildings. The boss had not spawned.

Phone, defense first: built a turret at (-1,4) at 67.33 s and beacon at (-4,8) at 129.87 s, harvested all three fuel nodes, but died heading for the dispatch stake at (9.832,-6.000), wave 4 / 143.73 s, 78 kills and zero gold. Hauler remained idle. The retained driver uses this second opening. Neither attempt reached the boss, so boss balance is unmeasured. No timing rerun was warranted: both boots succeeded and play ended in death.

[Desktop row](row-desktop-chrome.json) · [phone row](row-mobile-chrome.json) · [desktop terminal](terminal-desktop-chrome.png) · [phone terminal](terminal-mobile-chrome.png). Rows retain samples, upgrades, builds, exact vehicle/fuel readings and errors. Each log is the enabled one-worker command on port 5303. Two attempts exhausted; next map Gusher County.
