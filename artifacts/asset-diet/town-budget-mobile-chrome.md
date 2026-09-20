# Town byte budget — mobile-chrome

## Release-gated cue-window transfer total

| Release-gated cue-window arm | cueWindowTotalBytes | cueWindowUniqueBytes | cueWindowDuplicateBytes | Headroom against 25,000,000 |
| --- | ---: | ---: | ---: | ---: |
| cue test | 22497140 | 22494170 | 2970 | 2502860 |

## A/B cue-window transfer totals (recorded, not release-gated)

| A/B cue-window arm | cueWindowTotalBytes | cueWindowUniqueBytes | cueWindowDuplicateBytes |
| --- | ---: | ---: | ---: |
| normal | 25531440 | 23142078 | 2389362 |
| saveData | 22340545 | 19951183 | 2389362 |

Desktop normal measured 24,604,025 bytes at f1621-1 (`75632a7e3`), 26,115,186 in the f1625-1 runner, and 23,259,297 at the f1625-1 drain: a 12.3% swing across the 25,000,000 ceiling.

Cue-window delta (normal - saveData): **3190895 bytes**.

## Settled <=20 s transfer totals (recorded, not gated)

| Settled arm | settledTotalBytes | settledUniqueBytes | settledDuplicateBytes | settled duplicate URL count | settle duration (ms) | settleCapHit |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| cue test | 48582362 | 48294092 | 288270 | 2 | 20030 | true |
| normal | 53268250 | 50878888 | 2389362 | 11 | 20049 | true |
| saveData | 28082904 | 25693542 | 2389362 | 11 | 10230 | false |
| prefetchWait=false, cacheDisabled=false | 48297062 | 48294092 | 2970 | 1 | 20037 | true |
| prefetchWait=false, cacheDisabled=true | 47713206 | 47710236 | 2970 | 1 | 20021 | true |
| prefetchWait=true, cacheDisabled=false | 53553550 | 50878888 | 2674662 | 12 | 20017 | true |
| prefetchWait=true, cacheDisabled=true | 53268250 | 50878888 | 2389362 | 11 | 20025 | true |

### URLs fetched more than once

| Settled arm | URL | fetch count |
| --- | --- | ---: |
| cue test | /favicon-32.png | 2 |
| cue test | /assets/townsfolk-tavernkeeper-1biiFpXR-diet-a9d5c9a0.png | 2 |
| normal | /favicon-32.png | 2 |
| normal | /assets/town-plate-C90tsADa-diet-a9d5c9a0.glb | 2 |
| normal | /assets/town-v3-tavern-CXl1aOfB-diet-a9d5c9a0.glb | 2 |
| normal | /assets/general-store-Crb4mVFW-diet-a9d5c9a0.glb | 2 |
| normal | /assets/claim-office-CY6Ib5so-diet-a9d5c9a0.glb | 2 |
| normal | /assets/chapel-DqOSe4LC-diet-a9d5c9a0.glb | 2 |
| normal | /assets/assay-office-xAW04uBp-diet-a9d5c9a0.glb | 2 |
| normal | /assets/schoolhouse-BR3cnoTX-diet-a9d5c9a0.glb | 2 |
| normal | /assets/covered_wagon-DoD5oKIb-diet-a9d5c9a0.glb | 2 |
| normal | /assets/water_trough-GmocFW04-diet-a9d5c9a0.glb | 2 |
| normal | /assets/pan_monument-DXhG2mKX-diet-a9d5c9a0.glb | 2 |
| saveData | /favicon-32.png | 2 |
| saveData | /assets/town-v3-tavern-CXl1aOfB-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/town-plate-C90tsADa-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/claim-office-CY6Ib5so-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/general-store-Crb4mVFW-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/assay-office-xAW04uBp-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/chapel-DqOSe4LC-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/schoolhouse-BR3cnoTX-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/covered_wagon-DoD5oKIb-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/water_trough-GmocFW04-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/pan_monument-DXhG2mKX-diet-a9d5c9a0.glb | 2 |
| prefetchWait=false, cacheDisabled=false | /favicon-32.png | 2 |
| prefetchWait=false, cacheDisabled=true | /favicon-32.png | 2 |
| prefetchWait=true, cacheDisabled=false | /favicon-32.png | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/town-v3-tavern-CXl1aOfB-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/town-plate-C90tsADa-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/general-store-Crb4mVFW-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/claim-office-CY6Ib5so-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/assay-office-xAW04uBp-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/chapel-DqOSe4LC-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/schoolhouse-BR3cnoTX-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/covered_wagon-DoD5oKIb-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/pan_monument-DXhG2mKX-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/water_trough-GmocFW04-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/townsfolk-tavernkeeper-1biiFpXR-diet-a9d5c9a0.png | 2 |
| prefetchWait=true, cacheDisabled=true | /favicon-32.png | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/town-v3-tavern-CXl1aOfB-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/town-plate-C90tsADa-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/general-store-Crb4mVFW-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/claim-office-CY6Ib5so-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/chapel-DqOSe4LC-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/assay-office-xAW04uBp-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/schoolhouse-BR3cnoTX-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/covered_wagon-DoD5oKIb-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/water_trough-GmocFW04-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/pan_monument-DXhG2mKX-diet-a9d5c9a0.glb | 2 |

The saveData arm is a lower bound, not a clean isolation of the two bulk halls: it also narrows advance-stream prefetch to priority one.

| URL | normal settled bytes | saveData settled bytes | settled delta |
| --- | ---: | ---: | ---: |
| /assets/dry-gulch-terrain-DrNSfJzI-diet-a9d5c9a0.glb | 1457296 | 0 | 1457296 |
| /assets/dynamo-hall-D_Gc9RPJ-diet-a9d5c9a0.glb | 1407064 | 0 | 1407064 |
| /assets/twin-banks-terrain-wfls7mwN-diet-a9d5c9a0.glb | 1196224 | 0 | 1196224 |
| /assets/stamp-mill-CxhOFdRx-diet-a9d5c9a0.glb | 1177732 | 0 | 1177732 |
| /assets/trestle-terrain-DVDcl8lY-diet-a9d5c9a0.glb | 1065336 | 0 | 1065336 |
| /assets/pressure-garden-terrain-DaoGfpTw-diet-a9d5c9a0.glb | 961012 | 0 | 961012 |
| /assets/baron-terrain-BCMhESct-diet-a9d5c9a0.glb | 942700 | 0 | 942700 |
| /assets/incline-terrain-Zz102xQs-diet-a9d5c9a0.glb | 915732 | 0 | 915732 |
| /assets/hill-mine-terrain-lIlZBTlV-diet-a9d5c9a0.glb | 905888 | 0 | 905888 |
| /assets/incline-panorama-BS03wPuN-diet-a9d5c9a0.glb | 662016 | 0 | 662016 |
| /assets/pressure-garden-panorama-eKxL0Gf--diet-a9d5c9a0.glb | 659532 | 0 | 659532 |
| /assets/night-shift-terrain-DbDYIAEb-diet-a9d5c9a0.glb | 567968 | 0 | 567968 |
| /assets/baron-panorama-CdAE75QJ-diet-a9d5c9a0.glb | 527688 | 0 | 527688 |
| /assets/dry-gulch-panorama-BSQAYWzK-diet-a9d5c9a0.glb | 520500 | 0 | 520500 |
| /assets/trestle-panorama-Digfg-ru-diet-a9d5c9a0.glb | 484676 | 0 | 484676 |
| /assets/hill-mine-panorama-3ccIMjU7-diet-a9d5c9a0.glb | 481404 | 0 | 481404 |
| /assets/night-shift-panorama-DiCUCJUt-diet-a9d5c9a0.glb | 474332 | 0 | 474332 |
| /assets/twin-banks-panorama-iMEXVcqG-diet-a9d5c9a0.glb | 469768 | 0 | 469768 |
| /assets/bison_skeleton-BrypvPYn-diet-a9d5c9a0.glb | 347988 | 0 | 347988 |
| /assets/cactus_thicket-cPXwzDBz-diet-a9d5c9a0.glb | 341264 | 0 | 341264 |
| /assets/ruined_mining_operation-Y-r6s95T-diet-a9d5c9a0.glb | 339624 | 0 | 339624 |
| /assets/abandoned_farmhouse-eq1Q_XCt-diet-a9d5c9a0.glb | 338692 | 0 | 338692 |
| /assets/isolated_spring-DCCsJ8Br-diet-a9d5c9a0.glb | 333976 | 0 | 333976 |
| /assets/south_bank_homestead-DsyydbmB-diet-a9d5c9a0.glb | 333172 | 0 | 333172 |
| /assets/north_bank_homestead-BluaXgEd-diet-a9d5c9a0.glb | 333124 | 0 | 333124 |
| /assets/floodplain_dressing_pack-CnuiFPeK-diet-a9d5c9a0.glb | 327824 | 0 | 327824 |
| /assets/north_bank_winch-w06B_6LB-diet-a9d5c9a0.glb | 324288 | 0 | 324288 |
| /assets/south_bank_winch-C7P2heFz-diet-a9d5c9a0.glb | 324248 | 0 | 324248 |
| /assets/lower-yard-engine-crane-pHpgZdcv-diet-a9d5c9a0.glb | 309872 | 0 | 309872 |
| /assets/tailings-and-scree-pack-Douw0ivo-diet-a9d5c9a0.glb | 298864 | 0 | 298864 |
| /assets/flooded-gallery-CqAlEcB_-diet-a9d5c9a0.glb | 285680 | 0 | 285680 |
| /assets/boiler-house-site-Cv5Cb45U-diet-a9d5c9a0.glb | 278116 | 0 | 278116 |
| /assets/west-line-brake-tower-BZWa3SHa-diet-a9d5c9a0.glb | 273984 | 0 | 273984 |
| /assets/mine-mouth-and-ruined-headframe-DQ9yzT-I-diet-a9d5c9a0.glb | 270716 | 0 | 270716 |
| /assets/switchback-rail-kit--d3X7vM4-diet-a9d5c9a0.glb | 270240 | 0 | 270240 |
| /assets/garden-pressure-manifold-BgT8ZOtS-diet-a9d5c9a0.glb | 242772 | 0 | 242772 |
| /assets/water-band-pump-station-CGCTNEds-diet-a9d5c9a0.glb | 239644 | 0 | 239644 |
| /assets/coal-seam-service-winch-Bk0ncp5Y-diet-a9d5c9a0.glb | 227512 | 0 | 227512 |
| /assets/west-terrace-pipe-header-8iyI1Ae7-diet-a9d5c9a0.glb | 224108 | 0 | 224108 |
| /assets/east-terrace-pipe-header-SVrjFE5A-diet-a9d5c9a0.glb | 222728 | 0 | 222728 |
| /assets/north-approach-kit-gVK99X6e-diet-a9d5c9a0.glb | 217188 | 0 | 217188 |
| /assets/south-approach-kit-BD6oNCOc-diet-a9d5c9a0.glb | 217056 | 0 | 217056 |
| /assets/oxblood_banners-xuhJCyy3-diet-a9d5c9a0.glb | 207128 | 0 | 207128 |
| /assets/fortified_far_bank-zfEdoWU4-diet-a9d5c9a0.glb | 206908 | 0 | 206908 |
| /assets/rocket_cart-FCpYnyK_-diet-a9d5c9a0.glb | 202144 | 0 | 202144 |
| /assets/seized_headframe-D0s-zZdM-diet-a9d5c9a0.glb | 194396 | 0 | 194396 |
| /assets/mine-spur-kit-C-DiErAk-diet-a9d5c9a0.glb | 194012 | 0 | 194012 |
| /assets/trestle-crossing-CoF4ZtzB-diet-a9d5c9a0.glb | 193876 | 0 | 193876 |
| /assets/siege_line-CBqDyVTI-diet-a9d5c9a0.glb | 193196 | 0 | 193196 |
| /assets/north-boiler-site-BnGcOKtE-diet-a9d5c9a0.glb | 192832 | 0 | 192832 |
| /assets/south-boiler-site-C96-5wwv-diet-a9d5c9a0.glb | 192828 | 0 | 192828 |
| /assets/lampworks_yard-D_fJljF--diet-a9d5c9a0.glb | 188188 | 0 | 188188 |
| /assets/seven_lantern_terraces-BPtx7YmJ-diet-a9d5c9a0.glb | 182500 | 0 | 182500 |
| /assets/night_work_road-9e8pum3s-diet-a9d5c9a0.glb | 169356 | 0 | 169356 |
| /assets/dark_rock_shoulders-iLngyNh5-diet-a9d5c9a0.glb | 134516 | 0 | 134516 |
| /assets/central_ford-fyG_0oOm-diet-a9d5c9a0.glb | 129028 | 0 | 129028 |
| /assets/char-youngster-m-sheet-walk8-r0c5-XZpnVgR--diet-a9d5c9a0.png | 59940 | 0 | 59940 |
| /assets/char-youngster-m-sheet-walk8-r0c6-McRjv5gm-diet-a9d5c9a0.png | 59485 | 0 | 59485 |
| /assets/char-youngster-m-sheet-walk8-r0c4-CkWY96uY-diet-a9d5c9a0.png | 58296 | 0 | 58296 |
| /assets/char-youngster-m-sheet-walk8-r0c1-M3peYt_A-diet-a9d5c9a0.png | 58059 | 0 | 58059 |
| /assets/char-youngster-m-sheet-walk8-r0c2-DCSVP95N-diet-a9d5c9a0.png | 56020 | 0 | 56020 |
| /assets/char-youngster-m-sheet-walk8-r0c7-mdD62QOB-diet-a9d5c9a0.png | 55450 | 0 | 55450 |
| /assets/char-youngster-m-sheet-walk8-r0c3-XpztFS5O-diet-a9d5c9a0.png | 54789 | 0 | 54789 |
| /assets/char-youngster-f-sheet-walk8-r3c0-_adq-vtF-diet-a9d5c9a0.png | 52038 | 0 | 52038 |
| /assets/char-youngster-f-sheet-walk8-r3c4-8nfS-xOf-diet-a9d5c9a0.png | 51011 | 0 | 51011 |
| /assets/char-youngster-f-sheet-walk8-r3c1-BwWqGoFL-diet-a9d5c9a0.png | 50855 | 0 | 50855 |
| /assets/char-youngster-f-sheet-walk8-r3c6-2MZyA692-diet-a9d5c9a0.png | 50056 | 0 | 50056 |
| /assets/char-youngster-f-sheet-walk8-r3c2-DWycdt3X-diet-a9d5c9a0.png | 49554 | 0 | 49554 |
| /assets/char-youngster-f-sheet-walk8-r3c3-CVwwd6td-diet-a9d5c9a0.png | 49153 | 0 | 49153 |
| /assets/char-youngster-f-sheet-walk8-r3c7-U-TUhCSW-diet-a9d5c9a0.png | 47146 | 0 | 47146 |
| /assets/char-youngster-f-sheet-walk8-r3c5-BuaOdwAr-diet-a9d5c9a0.png | 46745 | 0 | 46745 |
| /assets/char-youngster-m-sheet-walk8-r0c3-DVjm3zCc-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c4-DlSU7Lkq-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c5-DEggh--u-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c6-DyGdHxkV-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c7-eWI-1F0f-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c1-BC6sCSHe-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c2-DVp3hJK6-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c6-akSbIjWh-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c7-CxoTa42--diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c0-B-hc7G_A-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c1-R9yzVSGx-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c2-DW_VKs5d-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c3-Deuu2TE0-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c4-DATBZM99-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c5-CeaiBBh0-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/mine-mouth-and-ruined-headframe-Cl8ys2rU-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/floodplain_dressing_pack-CACZW-J4-diet-a9d5c9a0.js | 114 | 0 | 114 |
| /assets/garden-pressure-manifold-CmDkB9s0-diet-a9d5c9a0.js | 114 | 0 | 114 |
| /assets/west-terrace-pipe-header-DBliwtvo-diet-a9d5c9a0.js | 114 | 0 | 114 |
| /assets/east-terrace-pipe-header-BQ0IQ7ZD-diet-a9d5c9a0.js | 114 | 0 | 114 |
| /assets/ruined_mining_operation-BziC0gpo-diet-a9d5c9a0.js | 113 | 0 | 113 |
| /assets/tailings-and-scree-pack-Ceu6g_eL-diet-a9d5c9a0.js | 113 | 0 | 113 |
| /assets/coal-seam-service-winch-CzuxgymD-diet-a9d5c9a0.js | 113 | 0 | 113 |
| /assets/water-band-pump-station-DZKWxE3C-diet-a9d5c9a0.js | 113 | 0 | 113 |
| /assets/lower-yard-engine-crane-BBHmGfiL-diet-a9d5c9a0.js | 113 | 0 | 113 |
| /assets/seven_lantern_terraces-DZyjgAtM-diet-a9d5c9a0.js | 112 | 0 | 112 |
| /assets/west-line-brake-tower-CBRB8xYx-diet-a9d5c9a0.js | 111 | 0 | 111 |
| /assets/east-line-brake-tower-v1mv19-R-diet-a9d5c9a0.js | 111 | 0 | 111 |
| /assets/upper-ore-cable-house-BRETxsn7-diet-a9d5c9a0.js | 111 | 0 | 111 |
| /assets/north_bank_homestead-CeMQJ5TN-diet-a9d5c9a0.js | 110 | 0 | 110 |
| /assets/south_bank_homestead-DIpKPW00-diet-a9d5c9a0.js | 110 | 0 | 110 |
| /assets/abandoned_farmhouse-CvonzAnd-diet-a9d5c9a0.js | 109 | 0 | 109 |
| /assets/dark_rock_shoulders-C94Yw_0J-diet-a9d5c9a0.js | 109 | 0 | 109 |
| /assets/switchback-rail-kit-DUCZzk0Z-diet-a9d5c9a0.js | 109 | 0 | 109 |
| /assets/fortified_far_bank-PYs39Das-diet-a9d5c9a0.js | 108 | 0 | 108 |
| /assets/south-approach-kit-B4i_ae5e-diet-a9d5c9a0.js | 108 | 0 | 108 |
| /assets/north-approach-kit-CtNd6SxC-diet-a9d5c9a0.js | 108 | 0 | 108 |
| /assets/boiler-house-site-D37LQiq9-diet-a9d5c9a0.js | 107 | 0 | 107 |
| /assets/south-boiler-site-CzRIv1aU-diet-a9d5c9a0.js | 107 | 0 | 107 |
| /assets/north-boiler-site-CHsukO7W-diet-a9d5c9a0.js | 107 | 0 | 107 |
| /assets/ford-service-pump-DabAdWtF-diet-a9d5c9a0.js | 107 | 0 | 107 |
| /assets/north_bank_winch-C0uj1XCH-diet-a9d5c9a0.js | 106 | 0 | 106 |
| /assets/south_bank_winch--kONd69O-diet-a9d5c9a0.js | 106 | 0 | 106 |
| /assets/seized_headframe-BYwAwPDQ-diet-a9d5c9a0.js | 106 | 0 | 106 |
| /assets/trestle-crossing-BxRMX7pF-diet-a9d5c9a0.js | 106 | 0 | 106 |
| /assets/isolated_spring-CJEfq1ty-diet-a9d5c9a0.js | 105 | 0 | 105 |
| /assets/night_work_road-CDwSM9G--diet-a9d5c9a0.js | 105 | 0 | 105 |
| /assets/oxblood_banners-y8Hfxe9d-diet-a9d5c9a0.js | 105 | 0 | 105 |
| /assets/flooded-gallery-COFvh5fX-diet-a9d5c9a0.js | 105 | 0 | 105 |
| /assets/cactus_thicket-D7OQB1wj-diet-a9d5c9a0.js | 104 | 0 | 104 |
| /assets/bison_skeleton-CNO90iQi-diet-a9d5c9a0.js | 104 | 0 | 104 |
| /assets/lampworks_yard-dglw4A4Q-diet-a9d5c9a0.js | 104 | 0 | 104 |
| /assets/mine-spur-kit-DpIB9ixh-diet-a9d5c9a0.js | 103 | 0 | 103 |
| /assets/central_ford-D3DfHT6D-diet-a9d5c9a0.js | 102 | 0 | 102 |
| /assets/rocket_cart-DfHKyjCF-diet-a9d5c9a0.js | 101 | 0 | 101 |
| /assets/siege_line-Cdmoiu2j-diet-a9d5c9a0.js | 100 | 0 | 100 |

## Normal-arm decomposition

| prefetchWait | cacheDisabled | cueWindowTotalBytes | settledTotalBytes | settledUniqueBytes | settledDuplicateBytes | settled delta from false/false | settleCapHit |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| false | false | 19038753 | 48297062 | 48294092 | 2970 | 0 | true |
| false | true | 16209181 | 47713206 | 47710236 | 2970 | -583856 | true |
| true | false | 20709656 | 53553550 | 50878888 | 2674662 | 5256488 | true |
| true | true | 22037864 | 53268250 | 50878888 | 2389362 | 4971188 | true |

## Missing or unparseable content-length audit

### Cue test — cue-window sample

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-CVbDj4It-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786340244243 | absent | 1 |
| /assets/TownNaming-Dxx2zZaz-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-D2XDGSKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CMge4XmG-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-BW-xHfk0-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-DV9UHHau-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-BWW7G1yz-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BJd6RuKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-XWDLm9BM-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/LandmarkCollision-wa1_R8C0-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-rwBMZhJK-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B9lt1OCb-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-Dx12VFN4-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-uu8BxgJS-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-CnVfHUye-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-NLyT4KP4-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-w5fxN5YJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-XpQZaOOv-diet-a9d5c9a0.js | absent | 1 |

### Cue test — settled <=20 s capture

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-CVbDj4It-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786340244243 | absent | 1 |
| /assets/TownNaming-Dxx2zZaz-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-D2XDGSKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CMge4XmG-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-BW-xHfk0-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-DV9UHHau-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-BWW7G1yz-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BJd6RuKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-XWDLm9BM-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/LandmarkCollision-wa1_R8C0-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-rwBMZhJK-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B9lt1OCb-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-Dx12VFN4-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-uu8BxgJS-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-CnVfHUye-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-NLyT4KP4-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-w5fxN5YJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-XpQZaOOv-diet-a9d5c9a0.js | absent | 1 |

### A/B normal — cue-window sample

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-CVbDj4It-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786340272734 | absent | 1 |
| /assets/TownNaming-Dxx2zZaz-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-D2XDGSKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CMge4XmG-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-BW-xHfk0-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-DV9UHHau-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-BWW7G1yz-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BJd6RuKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-XWDLm9BM-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-w5fxN5YJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-wa1_R8C0-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-NLyT4KP4-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-XpQZaOOv-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/Renderer-Dx12VFN4-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-rwBMZhJK-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-uu8BxgJS-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-CnVfHUye-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B9lt1OCb-diet-a9d5c9a0.js | absent | 1 |

### A/B normal — settled <=20 s capture

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-CVbDj4It-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786340272734 | absent | 1 |
| /assets/TownNaming-Dxx2zZaz-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-D2XDGSKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CMge4XmG-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-BW-xHfk0-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-DV9UHHau-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-BWW7G1yz-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BJd6RuKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-XWDLm9BM-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-w5fxN5YJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-wa1_R8C0-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-NLyT4KP4-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-XpQZaOOv-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/Renderer-Dx12VFN4-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-rwBMZhJK-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-uu8BxgJS-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-CnVfHUye-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B9lt1OCb-diet-a9d5c9a0.js | absent | 1 |

### A/B saveData — cue-window sample

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-CVbDj4It-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786340299082 | absent | 1 |
| /assets/TownNaming-Dxx2zZaz-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CMge4XmG-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-D2XDGSKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-BW-xHfk0-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-DV9UHHau-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-BWW7G1yz-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BJd6RuKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-XWDLm9BM-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-Dx12VFN4-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-wa1_R8C0-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-uu8BxgJS-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WorldInfoNotes-rwBMZhJK-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B9lt1OCb-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-CnVfHUye-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-w5fxN5YJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-NLyT4KP4-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-XpQZaOOv-diet-a9d5c9a0.js | absent | 1 |

### A/B saveData — settled <=20 s capture

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-CVbDj4It-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786340299082 | absent | 1 |
| /assets/TownNaming-Dxx2zZaz-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CMge4XmG-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-D2XDGSKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-BW-xHfk0-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-DV9UHHau-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-BWW7G1yz-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BJd6RuKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-XWDLm9BM-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-Dx12VFN4-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-wa1_R8C0-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-uu8BxgJS-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WorldInfoNotes-rwBMZhJK-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B9lt1OCb-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-CnVfHUye-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-w5fxN5YJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-NLyT4KP4-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-XpQZaOOv-diet-a9d5c9a0.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=false, cacheDisabled=false)

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-CVbDj4It-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786340315152 | absent | 1 |
| /assets/StartMenu-D2XDGSKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownNaming-Dxx2zZaz-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-BW-xHfk0-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CMge4XmG-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-DV9UHHau-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-BWW7G1yz-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BJd6RuKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-XWDLm9BM-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/LandmarkCollision-wa1_R8C0-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-rwBMZhJK-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-Dx12VFN4-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B9lt1OCb-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-CnVfHUye-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-uu8BxgJS-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-w5fxN5YJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-NLyT4KP4-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-XpQZaOOv-diet-a9d5c9a0.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=false, cacheDisabled=true)

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-CVbDj4It-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786340341341 | absent | 1 |
| /assets/TownNaming-Dxx2zZaz-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-D2XDGSKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CMge4XmG-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-BW-xHfk0-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-DV9UHHau-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-BWW7G1yz-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BJd6RuKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-XWDLm9BM-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/LandmarkCollision-wa1_R8C0-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-rwBMZhJK-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B9lt1OCb-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-Dx12VFN4-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-CnVfHUye-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-uu8BxgJS-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-w5fxN5YJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-NLyT4KP4-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-XpQZaOOv-diet-a9d5c9a0.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=true, cacheDisabled=false)

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-CVbDj4It-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786340368908 | absent | 1 |
| /assets/TownNaming-Dxx2zZaz-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-D2XDGSKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CMge4XmG-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-BW-xHfk0-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-DV9UHHau-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-BWW7G1yz-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BJd6RuKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-XWDLm9BM-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-wa1_R8C0-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-w5fxN5YJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-NLyT4KP4-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-XpQZaOOv-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-Dx12VFN4-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WorldInfoNotes-rwBMZhJK-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B9lt1OCb-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-uu8BxgJS-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-CnVfHUye-diet-a9d5c9a0.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=true, cacheDisabled=true)

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-CVbDj4It-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786340399163 | absent | 1 |
| /assets/TownNaming-Dxx2zZaz-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-D2XDGSKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CMge4XmG-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-BW-xHfk0-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-DV9UHHau-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-BWW7G1yz-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BJd6RuKP-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-XWDLm9BM-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-w5fxN5YJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-wa1_R8C0-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-NLyT4KP4-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-XpQZaOOv-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/Renderer-Dx12VFN4-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-rwBMZhJK-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-uu8BxgJS-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B9lt1OCb-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-CnVfHUye-diet-a9d5c9a0.js | absent | 1 |
