# Old Canal restoration helps but does not clear both viewports

2026-09-27. **Desktop HELD; phone gameplay PASS; separate bank-cell screenshot missing.** Read [the diagnosis](diagnosis.md) first; it was committed before changing the shared driver. One fresh diagnostic and one changed-premise strategy ride per project, no further attempts. All four rows have zero console/page errors.

| Run | Project | Wave / sim s | HP | Gold | Repairs | Defenses standing at end |
| --- | --- | --- | --- | --- | --- | --- |
| Default diagnostic | desktop | 18 / 544.400 | 0 | 3 | 1 | 0/8 |
| Default diagnostic | phone | 18 / 540.667 | 0 | 4 | 4 | 0/8 |
| restore-ground | desktop | 19 / 599.733 | 0 | 33 | 11 | 0/7 |
| restore-ground | phone | 20 / 600.133 | 120.6 | 37 | 9 | 0/7 |

The strategy restores wrecks through ordinary proximity repair, checks every 8 simulation seconds rather than 25, acts below 80% rather than 55% HP, approaches within 1.2 units of the building centre (native repair reach 1.4), funds at least 40 gold before repair work, and stops expansion from wave 12. Repair waits are bounded to eight polling ticks; existing opening kit, upgrade order, circuit, economy and map data are unchanged. Repair money is a replenishment target, not a guaranteed floor after spending.

The baseline loses its whole ring, then the hero, and will neither select a wreck nor replenish funds after reaching the eight-defense cap. Both strategy runs demonstrate wreck restoration in their `mended ... (0/... HP)` notes. Desktop lasted 55.333 s longer than its fresh diagnostic and phone secured 59.467 s after its diagnostic death. These single paired observations show a useful strategy candidate, not a controlled effect-size estimate: input timing changes build placements and progression.

Desktop dies at (2.396,-2.912), wave 19, 891 kills, 33 gold. Late notes show repeated beacon restoration and a final failed seam approach. The stable lowest-HP selection can repeatedly choose a recently destroyed beacon ahead of a turret; the strategy still loses the entire ring. Phone reaches the terminal with 908 kills and 120.6 HP even though all seven defenses are wrecked in the terminal snapshot. There is no claim that this strategy keeps a lasting defensive ring or guarantees survival.

Phone passes the unchanged secure, NEW banked score, Book return, byte-identical plain reload (7,228 score bytes) and clean-browser assertions. [Terminal](terminal-mobile-chrome.png), [Book](board-mobile-chrome.png), [row](row-mobile-chrome.json). Direct image inspection confirms the wave-20 secured overlay and Book. The Book screenshot shows its initial Dome Basin card, not Old Canal's best-score cell. **The requested separate bank-cell screenshot is missing.** Do not infer it from the successful storage assertion or substitute a reconstructed image. The full evidence gate therefore remains incomplete. The two rides per project are retained without another screenshot-only survival retry.

[Desktop row](row-desktop-chrome.json) and [terminal](terminal-desktop-chrome.png). No desktop bank, Book or reload is claimed. Twin Banks was not attempted because Old Canal did not clear both projects. No balance change or second strategy was tried.

Recommendation: retain `restore-ground` as an opt-in experiment, not the default. Old Canal phone is the only newly demonstrated unlock. A future authorized desktop/score-cell proof should capture the real Book score cell in the original browser context. Do not generalize success to Twin Banks or other held maps. Orbital movement/air, Canyon traversal, power-storage and escort-specific holds remain separate questions; these measurements justify no map-balance changes.
