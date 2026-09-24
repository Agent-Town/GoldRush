# Phone entry census, run 10

2026-09-24. Plain launches at 10 simulation seconds, 390×844 and 1280×800. All 40 before/after boots have no test hook and zero console/page errors. The run-6 selector and color threshold are unchanged. No camera, spawn, art or simulation source changes in this slice.

| New map | Width | Painted union before → after | Entry body before → after | Visible body pixels before → after |
|---|---:|---:|---|---:|
| e1-night-shift | 390 | 11.277190% → 11.277190% | 13.09% → 8.03% | 9016 → 9016 |
| e1-night-shift | 1280 | 13.917676% → 13.917676% | 15.09% → 15.09% | 77229 → 77229 |
| e1-twin-banks | 390 | 11.277190% → 11.277190% | 22.84% → 6.16% | 16159 → 16159 |
| e1-twin-banks | 1280 | 13.917676% → 13.917676% | 75.00% → 75.00% | 88735 → 88735 |
| e1-baron | 390 | 11.277190% → 11.277190% | 68.14% → 0.00% | 19650 → 19650 |
| e1-baron | 1280 | 13.917676% → 13.917676% | 19.71% → 19.71% | 68221 → 68219 |
| e2-trestle | 390 | 13.313890% → 13.313890% | OFFSCREEN → OFFSCREEN | 0 → 0 |
| e2-trestle | 1280 | 15.152051% → 15.152051% | 58.68% → 58.68% | 7766 → 7766 |

The clipped rectangle union (which includes touch hit boxes) falls from 25.497451% to 24.836374% for Night Shift and Twin Banks. Baron remains 25.497451%; Trestle remains 27.537796%. This measure overestimates painted coverage but confirms the reduced confirmation-button area.

## Original six maps

All twelve painted union values equal the saved run-8 after values exactly. All panel boxes equal the run-10 before boxes exactly, at both widths. Body-mask sampling remains live: small differences are not credited to CSS. The desktop Relay Rush frame varies by about one point despite identical panel boxes and no matching new CSS selector.

| Map | Width | Union before → after | Body coverage before | Body coverage after |
|---|---:|---:|---|---|
| e8-low-orbit | 390 | 13.405639% → 13.405639% | claw-carcass-rig: 6.99% | claw-carcass-rig: 6.99% |
| e8-low-orbit | 1280 | 15.895605% → 15.895605% | claw-carcass-rig: 0.00% | claw-carcass-rig: 0.00% |
| e9-seed-run | 390 | 12.122980% → 12.122980% | center-seed-vault: 2.11% | center-seed-vault: 2.11% |
| e9-seed-run | 1280 | 14.625684% → 14.625684% | center-seed-vault: 0.00% | center-seed-vault: 0.00% |
| e10-archive-world | 390 | 14.558877% → 14.558877% | archive-entry-gate: 7.27% | archive-entry-gate: 7.27% |
| e10-archive-world | 1280 | 15.577734% → 15.577734% | archive-entry-gate: 22.74% | archive-entry-gate: 22.72% |
| e7-dead-band | 390 | 14.228339% → 14.228339% | dead-gap-charting-station: 9.59%; iron-shadow-warning-frame: 0.00% | dead-gap-charting-station: 9.59%; iron-shadow-warning-frame: 0.00% |
| e7-dead-band | 1280 | 15.768262% → 15.768262% | dead-gap-charting-station: 43.24%; iron-shadow-warning-frame: 0.00% | dead-gap-charting-station: 43.24%; iron-shadow-warning-frame: 0.00% |
| e7-relay-rush | 390 | 13.820634% → 13.820634% | west-ridge-dish-cluster: OFFSCREEN; rush-relay-r2-frame: 0.45%; dead-gap-charting-station: OFFSCREEN | west-ridge-dish-cluster: OFFSCREEN; rush-relay-r2-frame: 0.43%; dead-gap-charting-station: OFFSCREEN |
| e7-relay-rush | 1280 | 15.768262% → 15.768262% | west-ridge-dish-cluster: OFFSCREEN; rush-relay-r2-frame: 1.04%; dead-gap-charting-station: 96.42% | west-ridge-dish-cluster: OFFSCREEN; rush-relay-r2-frame: 0.04%; dead-gap-charting-station: 96.42% |
| e6-glow-mesa | 390 | 11.277190% → 11.277190% | isotope-cooling-rack: OFFSCREEN | isotope-cooling-rack: OFFSCREEN |
| e6-glow-mesa | 1280 | 13.917676% → 13.917676% | isotope-cooling-rack: 52.51% | isotope-cooling-rack: 52.51% |

## Boards and limits

- [e1-night-shift: existing plate and unretouched phone before/after](e1-night-shift/board-390.png).
- [e1-twin-banks: existing plate and unretouched phone before/after](e1-twin-banks/board-390.png).
- [e1-baron: existing plate and unretouched phone before/after](e1-baron/board-390.png).
- [e2-trestle: existing plate and unretouched phone before/after](e2-trestle/board-390.png).

The inherited union backdrop at z-index 4 excludes the lower-stacked touch controls; the retained selector also omits the prompt-stack parent backing. The landmark persistent masks include the touch controls and establish the phone-body improvement. The unchanged union value must not be read as unchanged touch-button area. Per-panel clipped rectangles, painted masks, live clock and body denominators are in [before.json](before.json) and [after.json](after.json). Transient story cards differ naturally between plain frames and are excluded only from the labelled persistent masks.

Trestle bridge, Glow Mesa cooling rack and Relay Rush west dishes/charting station remain OFFSCREEN on phone. Relay Rush west dishes also remain OFFSCREEN on desktop. These are camera handoffs, never zero-coverage passes. Baron entry rigs are a prior run-3 camera hold; this pass measures its fort only. Desktop body coverage is not cured by this phone-only slice.
