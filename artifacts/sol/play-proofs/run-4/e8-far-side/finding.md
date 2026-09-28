# F-PP4-1 — Far Side crossing works; driver drift and survival prevent the full proof

2026-09-25. FAIL desktop/phone after two honest attempts; both commands exit 1. Boots/clean PASS with zero console/page errors. No bank, Book return or reload proved.

Desktop reached the crater at (9.708,39.163), earning one air-supported crossing with 46.667 seconds remaining. It then coasted out of the harvest disc after releasing movement, and the funding loop waited without reapproaching: zero gold, zero buildings, death wave 12 / 375.07 s, 436 kills. The source explains the driver mismatch: E8PhysicsSystem filters momentum (floaty drift response 1.4/s), while HarvestSystem requires range <=1.6 and low movement speed. Terminal nodes remained active at (9,-22) and (16,-34). This is an instrument defect, not a blocked-map finding.

Phone used counter-thrust near the target, rechecked harvest range while waiting, and verified recovery after real Space presses. It gathered, built four defenses, recovered the probe with exactly one playback, and earned all four air-supported crossing credits (windows 0,1,2,4), with zero breathless entries and zero suit harm. It died wave 17 / 519.07 s, 722 kills, zero gold, before wave 20. All four buildings were in the landing yard; the northern build goal remains unmet. The fourth crossing's walking helper returned false at (10.001,39.783), although the objective correctly credited the actual entry. Its strict stopping check still spends time chasing sub-unit position/momentum errors; do not infer a route obstruction.

The two driver versions are preserved as desktop-driver.ts and mobile-driver.ts. Failed full-goal assertions stay enabled. Two attempts exhausted; no timing-shaped failure or rerun. Next: Low Orbit.

[Desktop row](row-desktop-chrome.json) · [phone row](row-mobile-chrome.json) · [desktop board](terminal-desktop-chrome.png) · [phone board](terminal-mobile-chrome.png).
