# Old Canal diagnosis before strategy implementation

Written 2026-09-26T17:13:28.635106+00:00. Shared driver still byte-identical to pre-task main. One fresh diagnostic ride per project; both full proof assertions failed honestly (command exit 1). No browser errors.

## Cause supported by observations

Both heroes die after central defense collapse, poor rather than rich. The default maintenance path excludes wrecks, checks only every 25 simulation seconds, and can accept arrival outside the 1.4-unit repair radius (target z-1 with tolerance 1). That geometric weakness is source-derived; these captures do not prove a particular failed maintenance call. The stronger demonstrated defect is abandoning all wrecks once the eight-piece cap is reached, without replenishing repair money.

Run 6: desktop wave 19 / 571.6 s, 1 gold, 2 repairs, eight wrecks; phone wave 18 / 540.4 s, 15 gold, eight wrecks (seven acknowledged builds). All choices worked. Fresh evidence follows.

Enemy composition: authored feral_terraformer and claim_jump_prospect_drone, alternating by wave/edge/spawn index in WaveSystem. North/west/east spawn edges. Plain diagnostics expose aggregate alive counts, not individual variants or the killing damage source; enemyPositions is debug-only and was unavailable. Exact surviving composition and killing attacker are therefore UNKNOWN, not invented. No debug was enabled.

## desktop-chrome

Death wave 18, 544.400 s; hero (-2.250, 4.324); HP 0; gold 3; kills 787; enemies alive 37; repairs 1. All three choices complete. All eight defenses wrecked by 527.733 s, hero then 147.0 HP.

| Defense | Position x,z | Final HP / max |
| --- | --- | --- |
| sentry_beacon 0 | -2, 1 | 0/40 |
| sentry_beacon 1 | 9, -5 | 0/64 |
| sentry_beacon 2 | 1, 6 | 0/70 |
| sentry_beacon 3 | -1, -7 | 0/76 |
| turret 0 | 2, -3 | 0/50 |
| turret 1 | 2, -2 | 0/50 |
| turret 2 | 7, -3 | 0/58 |
| turret 3 | 2, 5 | 0/74 |

Upgrades, ordered: double_tap_coil, spring_heels, double_tap_coil, split_spark, split_spark, heavy_spark, tinkers_plating, tinkers_plating, tinkers_plating, heavy_spark, heavy_spark, spring_heels, spring_heels, double_tap_coil, long_resonator, beacon_dynamo, long_resonator, wide_ring, wide_ring, quick_fuse, prospectors_luck, pan_legend, beacon_dynamo, quick_fuse, powder_charge.

Last 30 simulation seconds: 138 actual input events; counts {'KeyA': 35, 'KeyW': 31, 'KeyD': 30, 'KeyS': 34, 'Digit3': 2, 'KeyP': 6}. Full ordered timestamps: [orders](last-30-orders-desktop-chrome.json). Hero continued the ordinary circuit; no late gold recovery or wreck restoration.

| Sim s | HP | Gold | Live defenses |
| --- | --- | --- | --- |
| 515.73 | 169.4 | 3 | 5 |
| 520.53 | 169.4 | 3 | 3 |
| 525.33 | 163.8 | 3 | 1 |
| 530.13 | 131.0 | 3 | 0 |
| 535.73 | 95.8 | 3 | 0 |
| 540.53 | 42.2 | 3 | 0 |

## mobile-chrome

Death wave 18, 540.667 s; hero (5.431, 3.069); HP 0; gold 4; kills 778; enemies alive 46; repairs 4. All three choices complete. All eight defenses wrecked by 523.467 s, hero then 135.0 HP.

| Defense | Position x,z | Final HP / max |
| --- | --- | --- |
| sentry_beacon 0 | -2, 1 | 0/40 |
| sentry_beacon 1 | 8, -5 | 0/64 |
| sentry_beacon 2 | 1, 5 | 0/70 |
| sentry_beacon 3 | -1, -6 | 0/76 |
| turret 0 | 2, -2 | 0/50 |
| turret 1 | 7, -2 | 0/50 |
| turret 2 | 12, -2 | 0/58 |
| turret 3 | 2, 5 | 0/74 |

Upgrades, ordered: double_tap_coil, spring_heels, double_tap_coil, split_spark, split_spark, heavy_spark, tinkers_plating, tinkers_plating, tinkers_plating, heavy_spark, heavy_spark, spring_heels, spring_heels, double_tap_coil, long_resonator, beacon_dynamo, long_resonator, wide_ring, wide_ring, quick_fuse, prospectors_luck, pan_legend, beacon_dynamo, quick_fuse, powder_charge, powder_charge.

Last 30 simulation seconds: 130 actual input events; counts {'KeyA': 35, 'KeyW': 25, 'KeyD': 36, 'KeyS': 28, 'Digit3': 2, 'KeyP': 2, 'Digit1': 2}. Full ordered timestamps: [orders](last-30-orders-mobile-chrome.json). Hero continued the ordinary circuit; no late gold recovery or wreck restoration.

| Sim s | HP | Gold | Live defenses |
| --- | --- | --- | --- |
| 515.20 | 167.0 | 4 | 3 |
| 520.27 | 151.0 | 4 | 2 |
| 525.07 | 127.0 | 4 | 0 |
| 530.67 | 75.8 | 4 | 0 |
| 535.47 | 35.0 | 4 | 0 |
| 540.27 | 2.2 | 4 | 0 |
| 540.67 | 0.0 | 4 | 0 |
| 540.67 | 0.0 | 4 | 0 |
| 540.67 | 0.0 | 4 | 0 |
| 540.67 | 0.0 | 4 | 0 |

## Chosen single strategy premise

`restore-ground`: after the existing opening kit, maintain the purchased defense ring instead of abandoning wrecks. Check every 8 s, repair below 80% (wrecks first), enter the actual 1.4-unit repair disc, and keep a 40-gold repair reserve before further expansion. Stop expansion at wave 12 so late gold pays for restoration. Use the existing native fund/journey/repair actions, default upgrades and default circuit; no balance or hero-stat changes. Test this one strategy once per project; a failed row is an honest hold, not grounds for another strategy.

This may still lose: native repair requires standing still, farming exposes the hero, and hostile damage may exceed restoration throughput. These measurements cannot establish impossible map balance.
