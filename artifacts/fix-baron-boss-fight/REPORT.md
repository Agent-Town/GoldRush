---
task: fix-baron-boss-fight
date: 2026-07-13
---

# Baron boss-fight repair

## F-BAR-1 probe verdict

The HP source was correct, but the only diagnostic recomputed that source ratio and never checked the rendered fill. The rendered bar also kept all seven dividers lit throughout the fight, which made its full-width silhouette read as unchanged. `bossHpBar.renderedRatio` now reports the actual fill mesh scale, and dividers extinguish as each of the eight HP sections is spent. The scripted 2/3 and 1/3 probe asserts source ratio, rendered ratio, and visible section count together on desktop and mobile.

## Tuned e1-baron values

| field | before | after | reason |
|---|---:|---:|---|
| hpScale | 160 | 240 | Gives focused damage time to describe a readable bar arc instead of an incidental add-clear kill. |
| contactDamageScale | 4.25 | 5 | Makes nearby Baron contact a clear hero threat. |
| buildingDamageScale | 12 | 16 | A neglected palisade is decisively wrecked. |
| supportBuildingDamageScale | 8 | 12 | Turrets and sluices cannot safely tank him. |
| pursuitRange | 45 | 18 | Stops a hero anywhere near the claim from suppressing the wrecker fantasy; he turns to buildings unless the hero is genuinely close. |

Scale remains 4 (owner praise: “the size is great”). Rocket volley and capture/research flow are unchanged.

## Launcher

Removed the body and four wheels. The existing brass rails, rockets, teal fuses, telegraph pulse, and volley mechanics now ride against the Baron's back instead of trailing 2.9+ world units behind him. Diagnostics assert the carried rack stays within 2.5 world units of his render position.

## Evidence

- `npx tsc --noEmit`: green
- `npm run build`: green
- focused rendered-bar/carried-launcher probe: desktop-chrome green, mobile-chrome green
- 055 Baron kill-stop: 7 passed / 1 intentional mobile skip
- 057 rocket/capture/research: 6/6 desktop green
- Screenshots: `desktop-chrome-baron-bar-two-thirds.png`, `desktop-chrome-baron-bar-one-third.png`, `desktop-chrome-baron-carried-launcher.png` (mobile equivalents included)

The supervisor still owes the full Baron battery, 057 mobile, and adjacent task-025 gate. A focused 054 run fails exactly at its old hard-coded `hpScale: 160` expectation (received the tuned 240-scale HP); those assertions cannot be both unmodified and green after the required manifest tuning. This is called out for drain review rather than hidden by editing 054.
