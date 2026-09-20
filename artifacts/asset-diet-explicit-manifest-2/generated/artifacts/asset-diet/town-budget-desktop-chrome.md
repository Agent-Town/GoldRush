# Town byte budget — desktop-chrome

## Release-gated cue-window transfer total

| Release-gated cue-window arm | provenance | cueWindowTotalBytes | cueWindowUniqueBytes | cueWindowDuplicateBytes | Headroom against 25,000,000 |
| --- | --- | ---: | ---: | ---: | ---: |
| cue test | read from the on-disk fallback artifact (not measured in this run) | 10488378 | 10485408 | 2970 | 14511622 |

## A/B cue-window transfer totals (recorded, not release-gated)

| A/B cue-window arm | cueWindowTotalBytes | cueWindowUniqueBytes | cueWindowDuplicateBytes |
| --- | ---: | ---: | ---: |
| normal | 6533885 | 6533885 | 0 |
| saveData | 4989074 | 4989074 | 0 |

Desktop normal measured 24,604,025 bytes at f1621-1 (`75632a7e3`), 26,115,186 in the f1625-1 runner, and 23,259,297 at the f1625-1 drain: a 12.3% swing across the 25,000,000 ceiling.

Cue-window delta (normal - saveData): **1544811 bytes**.

## Settled <=20 s transfer totals (recorded, not gated)

| Settled arm | settledTotalBytes | settledUniqueBytes | settledDuplicateBytes | settled duplicate URL count | settle duration (ms) | settleCapHit |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| cue test | 39401027 | 39398057 | 2970 | 1 | 20046 | true |
| normal | 44376303 | 42093549 | 2282754 | 11 | 20028 | true |
| saveData | 28812974 | 26530220 | 2282754 | 11 | 12721 | false |
| prefetchWait=false, cacheDisabled=false | 40553399 | 40550429 | 2970 | 1 | 20001 | true |
| prefetchWait=false, cacheDisabled=true | 37634206 | 37631236 | 2970 | 1 | 20012 | true |
| prefetchWait=true, cacheDisabled=false | 43507779 | 41225025 | 2282754 | 11 | 20013 | true |
| prefetchWait=true, cacheDisabled=true | 43592014 | 41023960 | 2568054 | 12 | 20042 | true |

### URLs fetched more than once

| Settled arm | URL | fetch count |
| --- | --- | ---: |
| cue test | /favicon-32.png | 2 |
| normal | /favicon-32.png | 2 |
| normal | /assets/town-plate-C90tsADa-diet-1408f6b4.glb | 2 |
| normal | /assets/town-v3-tavern-CXl1aOfB-diet-1408f6b4.glb | 2 |
| normal | /assets/claim-office-CY6Ib5so-diet-1408f6b4.glb | 2 |
| normal | /assets/general-store-Crb4mVFW-diet-1408f6b4.glb | 2 |
| normal | /assets/chapel-DqOSe4LC-diet-1408f6b4.glb | 2 |
| normal | /assets/assay-office-xAW04uBp-diet-1408f6b4.glb | 2 |
| normal | /assets/schoolhouse-BR3cnoTX-diet-1408f6b4.glb | 2 |
| normal | /assets/covered_wagon-DoD5oKIb-diet-1408f6b4.glb | 2 |
| normal | /assets/pan_monument-DXhG2mKX-diet-1408f6b4.glb | 2 |
| normal | /assets/water_trough-GmocFW04-diet-1408f6b4.glb | 2 |
| saveData | /favicon-32.png | 2 |
| saveData | /assets/town-v3-tavern-CXl1aOfB-diet-1408f6b4.glb | 2 |
| saveData | /assets/town-plate-C90tsADa-diet-1408f6b4.glb | 2 |
| saveData | /assets/claim-office-CY6Ib5so-diet-1408f6b4.glb | 2 |
| saveData | /assets/general-store-Crb4mVFW-diet-1408f6b4.glb | 2 |
| saveData | /assets/assay-office-xAW04uBp-diet-1408f6b4.glb | 2 |
| saveData | /assets/chapel-DqOSe4LC-diet-1408f6b4.glb | 2 |
| saveData | /assets/schoolhouse-BR3cnoTX-diet-1408f6b4.glb | 2 |
| saveData | /assets/covered_wagon-DoD5oKIb-diet-1408f6b4.glb | 2 |
| saveData | /assets/water_trough-GmocFW04-diet-1408f6b4.glb | 2 |
| saveData | /assets/pan_monument-DXhG2mKX-diet-1408f6b4.glb | 2 |
| prefetchWait=false, cacheDisabled=false | /favicon-32.png | 2 |
| prefetchWait=false, cacheDisabled=true | /favicon-32.png | 2 |
| prefetchWait=true, cacheDisabled=false | /favicon-32.png | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/town-plate-C90tsADa-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/town-v3-tavern-CXl1aOfB-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/general-store-Crb4mVFW-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/claim-office-CY6Ib5so-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/chapel-DqOSe4LC-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/assay-office-xAW04uBp-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/schoolhouse-BR3cnoTX-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/covered_wagon-DoD5oKIb-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/pan_monument-DXhG2mKX-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/water_trough-GmocFW04-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /favicon-32.png | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/town-v3-tavern-CXl1aOfB-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/town-plate-C90tsADa-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/claim-office-CY6Ib5so-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/general-store-Crb4mVFW-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/assay-office-xAW04uBp-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/chapel-DqOSe4LC-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/schoolhouse-BR3cnoTX-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/covered_wagon-DoD5oKIb-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/pan_monument-DXhG2mKX-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/water_trough-GmocFW04-diet-1408f6b4.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/townsfolk-tavernkeeper-1biiFpXR-diet-1408f6b4.png | 2 |

The saveData arm is a lower bound, not a clean isolation of the two bulk halls: it also narrows advance-stream prefetch to priority one.

| URL | normal settled bytes | saveData settled bytes | settled delta |
| --- | ---: | ---: | ---: |
| /assets/dry-gulch-terrain-DrNSfJzI-diet-1408f6b4.glb | 1457296 | 0 | 1457296 |
| /assets/twin-banks-terrain-wfls7mwN-diet-1408f6b4.glb | 1196224 | 0 | 1196224 |
| /assets/trestle-terrain-DVDcl8lY-diet-1408f6b4.glb | 1065336 | 0 | 1065336 |
| /assets/baron-terrain-BCMhESct-diet-1408f6b4.glb | 942700 | 0 | 942700 |
| /assets/hill-mine-terrain-lIlZBTlV-diet-1408f6b4.glb | 905888 | 0 | 905888 |
| /assets/night-shift-terrain-DbDYIAEb-diet-1408f6b4.glb | 567968 | 0 | 567968 |
| /assets/bison_skeleton-BrypvPYn-diet-1408f6b4.glb | 347988 | 0 | 347988 |
| /assets/cactus_thicket-cPXwzDBz-diet-1408f6b4.glb | 341264 | 0 | 341264 |
| /assets/ruined_mining_operation-Y-r6s95T-diet-1408f6b4.glb | 339624 | 0 | 339624 |
| /assets/abandoned_farmhouse-eq1Q_XCt-diet-1408f6b4.glb | 338692 | 0 | 338692 |
| /assets/isolated_spring-DCCsJ8Br-diet-1408f6b4.glb | 333976 | 0 | 333976 |
| /assets/south_bank_homestead-DsyydbmB-diet-1408f6b4.glb | 333172 | 0 | 333172 |
| /assets/north_bank_homestead-BluaXgEd-diet-1408f6b4.glb | 333124 | 0 | 333124 |
| /assets/floodplain_dressing_pack-CnuiFPeK-diet-1408f6b4.glb | 327824 | 0 | 327824 |
| /assets/north_bank_winch-w06B_6LB-diet-1408f6b4.glb | 324288 | 0 | 324288 |
| /assets/south_bank_winch-C7P2heFz-diet-1408f6b4.glb | 324248 | 0 | 324248 |
| /assets/tailings-and-scree-pack-Douw0ivo-diet-1408f6b4.glb | 298864 | 0 | 298864 |
| /assets/flooded-gallery-CqAlEcB_-diet-1408f6b4.glb | 285680 | 0 | 285680 |
| /assets/boiler-house-site-Cv5Cb45U-diet-1408f6b4.glb | 278116 | 0 | 278116 |
| /assets/mine-mouth-and-ruined-headframe-DQ9yzT-I-diet-1408f6b4.glb | 270716 | 0 | 270716 |
| /assets/switchback-rail-kit--d3X7vM4-diet-1408f6b4.glb | 270240 | 0 | 270240 |
| /assets/north-approach-kit-gVK99X6e-diet-1408f6b4.glb | 217188 | 0 | 217188 |
| /assets/south-approach-kit-BD6oNCOc-diet-1408f6b4.glb | 217056 | 0 | 217056 |
| /assets/oxblood_banners-xuhJCyy3-diet-1408f6b4.glb | 207128 | 0 | 207128 |
| /assets/fortified_far_bank-zfEdoWU4-diet-1408f6b4.glb | 206908 | 0 | 206908 |
| /assets/rocket_cart-FCpYnyK_-diet-1408f6b4.glb | 202144 | 0 | 202144 |
| /assets/seized_headframe-D0s-zZdM-diet-1408f6b4.glb | 194396 | 0 | 194396 |
| /assets/mine-spur-kit-C-DiErAk-diet-1408f6b4.glb | 194012 | 0 | 194012 |
| /assets/trestle-crossing-CoF4ZtzB-diet-1408f6b4.glb | 193876 | 0 | 193876 |
| /assets/siege_line-CBqDyVTI-diet-1408f6b4.glb | 193196 | 0 | 193196 |
| /assets/north-boiler-site-BnGcOKtE-diet-1408f6b4.glb | 192832 | 0 | 192832 |
| /assets/south-boiler-site-C96-5wwv-diet-1408f6b4.glb | 192828 | 0 | 192828 |
| /assets/lampworks_yard-D_fJljF--diet-1408f6b4.glb | 188188 | 0 | 188188 |
| /assets/stamp-mill-CxhOFdRx-diet-1408f6b4.glb | 183160 | 0 | 183160 |
| /assets/seven_lantern_terraces-BPtx7YmJ-diet-1408f6b4.glb | 182500 | 0 | 182500 |
| /assets/night_work_road-9e8pum3s-diet-1408f6b4.glb | 169356 | 0 | 169356 |
| /assets/dynamo-hall-D_Gc9RPJ-diet-1408f6b4.glb | 151600 | 0 | 151600 |
| /assets/dark_rock_shoulders-iLngyNh5-diet-1408f6b4.glb | 134516 | 0 | 134516 |
| /assets/central_ford-fyG_0oOm-diet-1408f6b4.glb | 129028 | 0 | 129028 |
| /assets/dry-gulch-panorama-BSQAYWzK-diet-1408f6b4.glb | 89556 | 0 | 89556 |
| /assets/hill-mine-panorama-3ccIMjU7-diet-1408f6b4.glb | 89112 | 0 | 89112 |
| /assets/baron-panorama-CdAE75QJ-diet-1408f6b4.glb | 88156 | 0 | 88156 |
| /assets/trestle-panorama-Digfg-ru-diet-1408f6b4.glb | 87036 | 0 | 87036 |
| /assets/night-shift-panorama-DiCUCJUt-diet-1408f6b4.glb | 86352 | 0 | 86352 |
| /assets/twin-banks-panorama-iMEXVcqG-diet-1408f6b4.glb | 85640 | 0 | 85640 |
| /assets/char-youngster-m-sheet-walk8-r0c5-XZpnVgR--diet-1408f6b4.png | 59940 | 0 | 59940 |
| /assets/char-youngster-m-sheet-walk8-r0c6-McRjv5gm-diet-1408f6b4.png | 59485 | 0 | 59485 |
| /assets/char-youngster-m-sheet-walk8-r0c4-CkWY96uY-diet-1408f6b4.png | 58296 | 0 | 58296 |
| /assets/char-youngster-m-sheet-walk8-r0c1-M3peYt_A-diet-1408f6b4.png | 58059 | 0 | 58059 |
| /assets/char-youngster-m-sheet-walk8-r0c2-DCSVP95N-diet-1408f6b4.png | 56020 | 0 | 56020 |
| /assets/char-youngster-m-sheet-walk8-r0c7-mdD62QOB-diet-1408f6b4.png | 55450 | 0 | 55450 |
| /assets/char-youngster-m-sheet-walk8-r0c3-XpztFS5O-diet-1408f6b4.png | 54789 | 0 | 54789 |
| /assets/char-youngster-f-sheet-walk8-r3c0-_adq-vtF-diet-1408f6b4.png | 52038 | 0 | 52038 |
| /assets/char-youngster-f-sheet-walk8-r3c4-8nfS-xOf-diet-1408f6b4.png | 51011 | 0 | 51011 |
| /assets/char-youngster-f-sheet-walk8-r3c1-BwWqGoFL-diet-1408f6b4.png | 50855 | 0 | 50855 |
| /assets/char-youngster-f-sheet-walk8-r3c6-2MZyA692-diet-1408f6b4.png | 50056 | 0 | 50056 |
| /assets/char-youngster-f-sheet-walk8-r3c2-DWycdt3X-diet-1408f6b4.png | 49554 | 0 | 49554 |
| /assets/char-youngster-f-sheet-walk8-r3c3-CVwwd6td-diet-1408f6b4.png | 49153 | 0 | 49153 |
| /assets/char-youngster-f-sheet-walk8-r3c7-U-TUhCSW-diet-1408f6b4.png | 47146 | 0 | 47146 |
| /assets/char-youngster-f-sheet-walk8-r3c5-BuaOdwAr-diet-1408f6b4.png | 46745 | 0 | 46745 |
| /assets/char-youngster-m-sheet-walk8-r0c3-B1nJ2qxa-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c4-Cb_mzNVN-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c5-BAollFY--diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c6-CvQ6nGWN-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c7-jvalAQnk-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c1-_Br78z-o-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-m-sheet-walk8-r0c2-WdShnPgk-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c6-BT_rathw-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c7-MefPjxM3-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c0-C1fXCwXP-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c1-DfGAhBVv-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c2-Dg6ENS_a-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c3-1g9BBF7j-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c4-Dnuu-2Cv-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/char-youngster-f-sheet-walk8-r3c5-DM2-oVk0-diet-1408f6b4.js | 123 | 0 | 123 |
| /assets/mine-mouth-and-ruined-headframe-YXTypaNI-diet-1408f6b4.js | 121 | 0 | 121 |
| /assets/floodplain_dressing_pack-CUBcALmO-diet-1408f6b4.js | 114 | 0 | 114 |
| /assets/garden-pressure-manifold-Bl724i25-diet-1408f6b4.js | 114 | 0 | 114 |
| /assets/west-terrace-pipe-header-B2FPPmdP-diet-1408f6b4.js | 114 | 0 | 114 |
| /assets/east-terrace-pipe-header-D4nJQtex-diet-1408f6b4.js | 114 | 0 | 114 |
| /assets/ruined_mining_operation-BEqEbtZQ-diet-1408f6b4.js | 113 | 0 | 113 |
| /assets/tailings-and-scree-pack-Dloeve27-diet-1408f6b4.js | 113 | 0 | 113 |
| /assets/coal-seam-service-winch-BExmIJyH-diet-1408f6b4.js | 113 | 0 | 113 |
| /assets/water-band-pump-station-MfGygJOG-diet-1408f6b4.js | 113 | 0 | 113 |
| /assets/seven_lantern_terraces-BGcFJ5jq-diet-1408f6b4.js | 112 | 0 | 112 |
| /assets/north_bank_homestead-BGjUupbe-diet-1408f6b4.js | 110 | 0 | 110 |
| /assets/south_bank_homestead-CCk-Xw1d-diet-1408f6b4.js | 110 | 0 | 110 |
| /assets/abandoned_farmhouse-BeNEDulS-diet-1408f6b4.js | 109 | 0 | 109 |
| /assets/dark_rock_shoulders--PAwtlLE-diet-1408f6b4.js | 109 | 0 | 109 |
| /assets/switchback-rail-kit-BLAGJTVv-diet-1408f6b4.js | 109 | 0 | 109 |
| /assets/fortified_far_bank-ncVG49G3-diet-1408f6b4.js | 108 | 0 | 108 |
| /assets/south-approach-kit-BnzZhLcv-diet-1408f6b4.js | 108 | 0 | 108 |
| /assets/north-approach-kit-z7n9lEkB-diet-1408f6b4.js | 108 | 0 | 108 |
| /assets/boiler-house-site-CZYeFYow-diet-1408f6b4.js | 107 | 0 | 107 |
| /assets/south-boiler-site-BBJ_-eqO-diet-1408f6b4.js | 107 | 0 | 107 |
| /assets/north-boiler-site-DWPYVBl4-diet-1408f6b4.js | 107 | 0 | 107 |
| /assets/south_bank_winch-58pBM6qp-diet-1408f6b4.js | 106 | 0 | 106 |
| /assets/north_bank_winch-BOgmBtVw-diet-1408f6b4.js | 106 | 0 | 106 |
| /assets/seized_headframe-z_baRF-u-diet-1408f6b4.js | 106 | 0 | 106 |
| /assets/trestle-crossing-DrNxWg-A-diet-1408f6b4.js | 106 | 0 | 106 |
| /assets/isolated_spring-C3El87BE-diet-1408f6b4.js | 105 | 0 | 105 |
| /assets/night_work_road-C2B8_8Ap-diet-1408f6b4.js | 105 | 0 | 105 |
| /assets/oxblood_banners-CRqlDRn7-diet-1408f6b4.js | 105 | 0 | 105 |
| /assets/flooded-gallery-CnK6-TPW-diet-1408f6b4.js | 105 | 0 | 105 |
| /assets/bison_skeleton-BE3oHyvf-diet-1408f6b4.js | 104 | 0 | 104 |
| /assets/cactus_thicket-ClCVAEuQ-diet-1408f6b4.js | 104 | 0 | 104 |
| /assets/lampworks_yard-C3cujnqs-diet-1408f6b4.js | 104 | 0 | 104 |
| /assets/mine-spur-kit-Bra6S1Js-diet-1408f6b4.js | 103 | 0 | 103 |
| /assets/central_ford-DrhS3CoI-diet-1408f6b4.js | 102 | 0 | 102 |
| /assets/rocket_cart-BIPZ6YD_-diet-1408f6b4.js | 101 | 0 | 101 |
| /assets/siege_line-Z71bX_b2-diet-1408f6b4.js | 100 | 0 | 100 |

## Normal-arm decomposition

| prefetchWait | cacheDisabled | cueWindowTotalBytes | settledTotalBytes | settledUniqueBytes | settledDuplicateBytes | settled delta from false/false | settleCapHit |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| false | false | 3918698 | 40553399 | 40550429 | 2970 | 0 | true |
| false | true | 2195434 | 37634206 | 37631236 | 2970 | -2919193 | true |
| true | false | 6533775 | 43507779 | 41225025 | 2282754 | 2954380 | true |
| true | true | 6524954 | 43592014 | 41023960 | 2568054 | 3038615 | true |

## Missing or unparseable content-length audit

### Cue test — cue-window sample

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-1408f6b4.css | absent | 1 |
| /assets/index-D13RlqEQ-diet-1408f6b4.js | absent | 1 |
| /version.json?t=1788585149379 | absent | 1 |
| /assets/TownNaming-kbSGeB3B-diet-1408f6b4.js | absent | 1 |
| /assets/StartMenu-Bve5BlCz-diet-1408f6b4.js | absent | 1 |
| /assets/payload-7QK_ReTL-diet-1408f6b4.js | absent | 1 |
| /assets/EraBackdrop-B1SD0Oxj-diet-1408f6b4.js | absent | 1 |
| /assets/SoundSystem-oDRhZ_tj-diet-1408f6b4.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-1408f6b4.css | absent | 1 |
| /assets/story-CuHlxcO4-diet-1408f6b4.js | absent | 1 |
| /assets/townEraProps-XR4xd-UB-diet-1408f6b4.js | absent | 1 |
| /assets/TownTavernPilot-BAYOnyg2-diet-1408f6b4.js | absent | 1 |
| /assets/ceremonyPostscripts-CRGhzncE-diet-1408f6b4.js | absent | 1 |
| /assets/AssetLoading-DfI6ryJc-diet-1408f6b4.js | absent | 1 |
| /assets/scripts-FbooY-oA-diet-1408f6b4.js | absent | 1 |
| /assets/WeatherSystem-CZo3SRG8-diet-1408f6b4.js | absent | 1 |
| /assets/WaterRegion-BuO1dBg4-diet-1408f6b4.js | absent | 1 |
| /assets/LandmarkCollision-C7oRR30I-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-1408f6b4.css | absent | 1 |
| /assets/WorldInfoNotes-D2xa3aCb-diet-1408f6b4.js | absent | 1 |
| /assets/Renderer-YP2i5A4q-diet-1408f6b4.js | absent | 1 |
| /assets/AssayBench-Cudo257i-diet-1408f6b4.js | absent | 1 |
| /assets/ConvoyBehavior-C3-OZ9YK-diet-1408f6b4.js | absent | 1 |
| /assets/SpriteAnimator-D7fw18el-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-BH-T2_Qs-diet-1408f6b4.js | absent | 1 |
| /assets/runBeacon-DyB7pglI-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain-DclIvMMr-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain3dClaimPilot-CpPgS4AF-diet-1408f6b4.js | absent | 1 |

### Cue test — settled <=20 s capture

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-1408f6b4.css | absent | 1 |
| /assets/index-D13RlqEQ-diet-1408f6b4.js | absent | 1 |
| /version.json?t=1788585149379 | absent | 1 |
| /assets/TownNaming-kbSGeB3B-diet-1408f6b4.js | absent | 1 |
| /assets/StartMenu-Bve5BlCz-diet-1408f6b4.js | absent | 1 |
| /assets/payload-7QK_ReTL-diet-1408f6b4.js | absent | 1 |
| /assets/EraBackdrop-B1SD0Oxj-diet-1408f6b4.js | absent | 1 |
| /assets/SoundSystem-oDRhZ_tj-diet-1408f6b4.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-1408f6b4.css | absent | 1 |
| /assets/story-CuHlxcO4-diet-1408f6b4.js | absent | 1 |
| /assets/townEraProps-XR4xd-UB-diet-1408f6b4.js | absent | 1 |
| /assets/TownTavernPilot-BAYOnyg2-diet-1408f6b4.js | absent | 1 |
| /assets/ceremonyPostscripts-CRGhzncE-diet-1408f6b4.js | absent | 1 |
| /assets/AssetLoading-DfI6ryJc-diet-1408f6b4.js | absent | 1 |
| /assets/scripts-FbooY-oA-diet-1408f6b4.js | absent | 1 |
| /assets/WeatherSystem-CZo3SRG8-diet-1408f6b4.js | absent | 1 |
| /assets/WaterRegion-BuO1dBg4-diet-1408f6b4.js | absent | 1 |
| /assets/LandmarkCollision-C7oRR30I-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-1408f6b4.css | absent | 1 |
| /assets/WorldInfoNotes-D2xa3aCb-diet-1408f6b4.js | absent | 1 |
| /assets/Renderer-YP2i5A4q-diet-1408f6b4.js | absent | 1 |
| /assets/AssayBench-Cudo257i-diet-1408f6b4.js | absent | 1 |
| /assets/ConvoyBehavior-C3-OZ9YK-diet-1408f6b4.js | absent | 1 |
| /assets/SpriteAnimator-D7fw18el-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-BH-T2_Qs-diet-1408f6b4.js | absent | 1 |
| /assets/runBeacon-DyB7pglI-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain-DclIvMMr-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain3dClaimPilot-CpPgS4AF-diet-1408f6b4.js | absent | 1 |

### A/B normal — cue-window sample

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-1408f6b4.css | absent | 1 |
| /assets/index-D13RlqEQ-diet-1408f6b4.js | absent | 1 |
| /version.json?t=1788585758088 | absent | 1 |
| /assets/TownNaming-kbSGeB3B-diet-1408f6b4.js | absent | 1 |
| /assets/StartMenu-Bve5BlCz-diet-1408f6b4.js | absent | 1 |
| /assets/SoundSystem-oDRhZ_tj-diet-1408f6b4.js | absent | 1 |
| /assets/payload-7QK_ReTL-diet-1408f6b4.js | absent | 1 |
| /assets/EraBackdrop-B1SD0Oxj-diet-1408f6b4.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-1408f6b4.css | absent | 1 |
| /assets/story-CuHlxcO4-diet-1408f6b4.js | absent | 1 |
| /assets/townEraProps-XR4xd-UB-diet-1408f6b4.js | absent | 1 |
| /assets/TownTavernPilot-BAYOnyg2-diet-1408f6b4.js | absent | 1 |
| /assets/ceremonyPostscripts-CRGhzncE-diet-1408f6b4.js | absent | 1 |
| /assets/scripts-FbooY-oA-diet-1408f6b4.js | absent | 1 |
| /assets/AssetLoading-DfI6ryJc-diet-1408f6b4.js | absent | 1 |
| /assets/LandmarkCollision-C7oRR30I-diet-1408f6b4.js | absent | 1 |
| /assets/runBeacon-DyB7pglI-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain-DclIvMMr-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain3dClaimPilot-CpPgS4AF-diet-1408f6b4.js | absent | 1 |
| /assets/WaterRegion-BuO1dBg4-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-1408f6b4.css | absent | 1 |
| /assets/WeatherSystem-CZo3SRG8-diet-1408f6b4.js | absent | 1 |
| /assets/Renderer-YP2i5A4q-diet-1408f6b4.js | absent | 1 |
| /assets/WorldInfoNotes-D2xa3aCb-diet-1408f6b4.js | absent | 1 |
| /assets/ConvoyBehavior-C3-OZ9YK-diet-1408f6b4.js | absent | 1 |
| /assets/AssayBench-Cudo257i-diet-1408f6b4.js | absent | 1 |
| /assets/SpriteAnimator-D7fw18el-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-BH-T2_Qs-diet-1408f6b4.js | absent | 1 |

### A/B normal — settled <=20 s capture

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-1408f6b4.css | absent | 1 |
| /assets/index-D13RlqEQ-diet-1408f6b4.js | absent | 1 |
| /version.json?t=1788585758088 | absent | 1 |
| /assets/TownNaming-kbSGeB3B-diet-1408f6b4.js | absent | 1 |
| /assets/StartMenu-Bve5BlCz-diet-1408f6b4.js | absent | 1 |
| /assets/SoundSystem-oDRhZ_tj-diet-1408f6b4.js | absent | 1 |
| /assets/payload-7QK_ReTL-diet-1408f6b4.js | absent | 1 |
| /assets/EraBackdrop-B1SD0Oxj-diet-1408f6b4.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-1408f6b4.css | absent | 1 |
| /assets/story-CuHlxcO4-diet-1408f6b4.js | absent | 1 |
| /assets/townEraProps-XR4xd-UB-diet-1408f6b4.js | absent | 1 |
| /assets/TownTavernPilot-BAYOnyg2-diet-1408f6b4.js | absent | 1 |
| /assets/ceremonyPostscripts-CRGhzncE-diet-1408f6b4.js | absent | 1 |
| /assets/scripts-FbooY-oA-diet-1408f6b4.js | absent | 1 |
| /assets/AssetLoading-DfI6ryJc-diet-1408f6b4.js | absent | 1 |
| /assets/LandmarkCollision-C7oRR30I-diet-1408f6b4.js | absent | 1 |
| /assets/runBeacon-DyB7pglI-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain-DclIvMMr-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain3dClaimPilot-CpPgS4AF-diet-1408f6b4.js | absent | 1 |
| /assets/WaterRegion-BuO1dBg4-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-1408f6b4.css | absent | 1 |
| /assets/WeatherSystem-CZo3SRG8-diet-1408f6b4.js | absent | 1 |
| /assets/Renderer-YP2i5A4q-diet-1408f6b4.js | absent | 1 |
| /assets/WorldInfoNotes-D2xa3aCb-diet-1408f6b4.js | absent | 1 |
| /assets/ConvoyBehavior-C3-OZ9YK-diet-1408f6b4.js | absent | 1 |
| /assets/AssayBench-Cudo257i-diet-1408f6b4.js | absent | 1 |
| /assets/SpriteAnimator-D7fw18el-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-BH-T2_Qs-diet-1408f6b4.js | absent | 1 |

### A/B saveData — cue-window sample

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-1408f6b4.css | absent | 1 |
| /assets/index-D13RlqEQ-diet-1408f6b4.js | absent | 1 |
| /version.json?t=1788585783617 | absent | 1 |
| /assets/StartMenu-Bve5BlCz-diet-1408f6b4.js | absent | 1 |
| /assets/TownNaming-kbSGeB3B-diet-1408f6b4.js | absent | 1 |
| /assets/SoundSystem-oDRhZ_tj-diet-1408f6b4.js | absent | 1 |
| /assets/payload-7QK_ReTL-diet-1408f6b4.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-1408f6b4.css | absent | 1 |
| /assets/EraBackdrop-B1SD0Oxj-diet-1408f6b4.js | absent | 1 |
| /assets/story-CuHlxcO4-diet-1408f6b4.js | absent | 1 |
| /assets/townEraProps-XR4xd-UB-diet-1408f6b4.js | absent | 1 |
| /assets/TownTavernPilot-BAYOnyg2-diet-1408f6b4.js | absent | 1 |
| /assets/ceremonyPostscripts-CRGhzncE-diet-1408f6b4.js | absent | 1 |
| /assets/AssetLoading-DfI6ryJc-diet-1408f6b4.js | absent | 1 |
| /assets/scripts-FbooY-oA-diet-1408f6b4.js | absent | 1 |
| /assets/LandmarkCollision-C7oRR30I-diet-1408f6b4.js | absent | 1 |
| /assets/WaterRegion-BuO1dBg4-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-1408f6b4.css | absent | 1 |
| /assets/WorldInfoNotes-D2xa3aCb-diet-1408f6b4.js | absent | 1 |
| /assets/WeatherSystem-CZo3SRG8-diet-1408f6b4.js | absent | 1 |
| /assets/Renderer-YP2i5A4q-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-BH-T2_Qs-diet-1408f6b4.js | absent | 1 |
| /assets/SpriteAnimator-D7fw18el-diet-1408f6b4.js | absent | 1 |
| /assets/ConvoyBehavior-C3-OZ9YK-diet-1408f6b4.js | absent | 1 |
| /assets/AssayBench-Cudo257i-diet-1408f6b4.js | absent | 1 |
| /assets/runBeacon-DyB7pglI-diet-1408f6b4.js | absent | 1 |

### A/B saveData — settled <=20 s capture

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-1408f6b4.css | absent | 1 |
| /assets/index-D13RlqEQ-diet-1408f6b4.js | absent | 1 |
| /version.json?t=1788585783617 | absent | 1 |
| /assets/StartMenu-Bve5BlCz-diet-1408f6b4.js | absent | 1 |
| /assets/TownNaming-kbSGeB3B-diet-1408f6b4.js | absent | 1 |
| /assets/SoundSystem-oDRhZ_tj-diet-1408f6b4.js | absent | 1 |
| /assets/payload-7QK_ReTL-diet-1408f6b4.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-1408f6b4.css | absent | 1 |
| /assets/EraBackdrop-B1SD0Oxj-diet-1408f6b4.js | absent | 1 |
| /assets/story-CuHlxcO4-diet-1408f6b4.js | absent | 1 |
| /assets/townEraProps-XR4xd-UB-diet-1408f6b4.js | absent | 1 |
| /assets/TownTavernPilot-BAYOnyg2-diet-1408f6b4.js | absent | 1 |
| /assets/ceremonyPostscripts-CRGhzncE-diet-1408f6b4.js | absent | 1 |
| /assets/AssetLoading-DfI6ryJc-diet-1408f6b4.js | absent | 1 |
| /assets/scripts-FbooY-oA-diet-1408f6b4.js | absent | 1 |
| /assets/LandmarkCollision-C7oRR30I-diet-1408f6b4.js | absent | 1 |
| /assets/WaterRegion-BuO1dBg4-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-1408f6b4.css | absent | 1 |
| /assets/WorldInfoNotes-D2xa3aCb-diet-1408f6b4.js | absent | 1 |
| /assets/WeatherSystem-CZo3SRG8-diet-1408f6b4.js | absent | 1 |
| /assets/Renderer-YP2i5A4q-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-BH-T2_Qs-diet-1408f6b4.js | absent | 1 |
| /assets/SpriteAnimator-D7fw18el-diet-1408f6b4.js | absent | 1 |
| /assets/ConvoyBehavior-C3-OZ9YK-diet-1408f6b4.js | absent | 1 |
| /assets/AssayBench-Cudo257i-diet-1408f6b4.js | absent | 1 |
| /assets/runBeacon-DyB7pglI-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain-DclIvMMr-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain3dClaimPilot-CpPgS4AF-diet-1408f6b4.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=false, cacheDisabled=false)

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-1408f6b4.css | absent | 1 |
| /assets/index-D13RlqEQ-diet-1408f6b4.js | absent | 1 |
| /version.json?t=1788585801275 | absent | 1 |
| /assets/TownNaming-kbSGeB3B-diet-1408f6b4.js | absent | 1 |
| /assets/StartMenu-Bve5BlCz-diet-1408f6b4.js | absent | 1 |
| /assets/SoundSystem-oDRhZ_tj-diet-1408f6b4.js | absent | 1 |
| /assets/payload-7QK_ReTL-diet-1408f6b4.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-1408f6b4.css | absent | 1 |
| /assets/EraBackdrop-B1SD0Oxj-diet-1408f6b4.js | absent | 1 |
| /assets/story-CuHlxcO4-diet-1408f6b4.js | absent | 1 |
| /assets/TownTavernPilot-BAYOnyg2-diet-1408f6b4.js | absent | 1 |
| /assets/townEraProps-XR4xd-UB-diet-1408f6b4.js | absent | 1 |
| /assets/ceremonyPostscripts-CRGhzncE-diet-1408f6b4.js | absent | 1 |
| /assets/AssetLoading-DfI6ryJc-diet-1408f6b4.js | absent | 1 |
| /assets/scripts-FbooY-oA-diet-1408f6b4.js | absent | 1 |
| /assets/WeatherSystem-CZo3SRG8-diet-1408f6b4.js | absent | 1 |
| /assets/WaterRegion-BuO1dBg4-diet-1408f6b4.js | absent | 1 |
| /assets/LandmarkCollision-C7oRR30I-diet-1408f6b4.js | absent | 1 |
| /assets/Renderer-YP2i5A4q-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-1408f6b4.css | absent | 1 |
| /assets/AssayBench-Cudo257i-diet-1408f6b4.js | absent | 1 |
| /assets/WorldInfoNotes-D2xa3aCb-diet-1408f6b4.js | absent | 1 |
| /assets/SpriteAnimator-D7fw18el-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-BH-T2_Qs-diet-1408f6b4.js | absent | 1 |
| /assets/ConvoyBehavior-C3-OZ9YK-diet-1408f6b4.js | absent | 1 |
| /assets/runBeacon-DyB7pglI-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain-DclIvMMr-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain3dClaimPilot-CpPgS4AF-diet-1408f6b4.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=false, cacheDisabled=true)

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-1408f6b4.css | absent | 1 |
| /assets/index-D13RlqEQ-diet-1408f6b4.js | absent | 1 |
| /version.json?t=1788585824166 | absent | 1 |
| /assets/TownNaming-kbSGeB3B-diet-1408f6b4.js | absent | 1 |
| /assets/StartMenu-Bve5BlCz-diet-1408f6b4.js | absent | 1 |
| /assets/SoundSystem-oDRhZ_tj-diet-1408f6b4.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-1408f6b4.css | absent | 1 |
| /assets/payload-7QK_ReTL-diet-1408f6b4.js | absent | 1 |
| /assets/EraBackdrop-B1SD0Oxj-diet-1408f6b4.js | absent | 1 |
| /assets/story-CuHlxcO4-diet-1408f6b4.js | absent | 1 |
| /assets/townEraProps-XR4xd-UB-diet-1408f6b4.js | absent | 1 |
| /assets/ceremonyPostscripts-CRGhzncE-diet-1408f6b4.js | absent | 1 |
| /assets/TownTavernPilot-BAYOnyg2-diet-1408f6b4.js | absent | 1 |
| /assets/scripts-FbooY-oA-diet-1408f6b4.js | absent | 1 |
| /assets/AssetLoading-DfI6ryJc-diet-1408f6b4.js | absent | 1 |
| /assets/WeatherSystem-CZo3SRG8-diet-1408f6b4.js | absent | 1 |
| /assets/WaterRegion-BuO1dBg4-diet-1408f6b4.js | absent | 1 |
| /assets/LandmarkCollision-C7oRR30I-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-1408f6b4.css | absent | 1 |
| /assets/WorldInfoNotes-D2xa3aCb-diet-1408f6b4.js | absent | 1 |
| /assets/Renderer-YP2i5A4q-diet-1408f6b4.js | absent | 1 |
| /assets/AssayBench-Cudo257i-diet-1408f6b4.js | absent | 1 |
| /assets/ConvoyBehavior-C3-OZ9YK-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-BH-T2_Qs-diet-1408f6b4.js | absent | 1 |
| /assets/SpriteAnimator-D7fw18el-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain-DclIvMMr-diet-1408f6b4.js | absent | 1 |
| /assets/runBeacon-DyB7pglI-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain3dClaimPilot-CpPgS4AF-diet-1408f6b4.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=true, cacheDisabled=false)

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-1408f6b4.css | absent | 1 |
| /assets/index-D13RlqEQ-diet-1408f6b4.js | absent | 1 |
| /version.json?t=1788585847381 | absent | 1 |
| /assets/StartMenu-Bve5BlCz-diet-1408f6b4.js | absent | 1 |
| /assets/TownNaming-kbSGeB3B-diet-1408f6b4.js | absent | 1 |
| /assets/SoundSystem-oDRhZ_tj-diet-1408f6b4.js | absent | 1 |
| /assets/payload-7QK_ReTL-diet-1408f6b4.js | absent | 1 |
| /assets/EraBackdrop-B1SD0Oxj-diet-1408f6b4.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-1408f6b4.css | absent | 1 |
| /assets/story-CuHlxcO4-diet-1408f6b4.js | absent | 1 |
| /assets/townEraProps-XR4xd-UB-diet-1408f6b4.js | absent | 1 |
| /assets/TownTavernPilot-BAYOnyg2-diet-1408f6b4.js | absent | 1 |
| /assets/ceremonyPostscripts-CRGhzncE-diet-1408f6b4.js | absent | 1 |
| /assets/scripts-FbooY-oA-diet-1408f6b4.js | absent | 1 |
| /assets/AssetLoading-DfI6ryJc-diet-1408f6b4.js | absent | 1 |
| /assets/LandmarkCollision-C7oRR30I-diet-1408f6b4.js | absent | 1 |
| /assets/runBeacon-DyB7pglI-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain-DclIvMMr-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain3dClaimPilot-CpPgS4AF-diet-1408f6b4.js | absent | 1 |
| /assets/WaterRegion-BuO1dBg4-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-1408f6b4.css | absent | 1 |
| /assets/WeatherSystem-CZo3SRG8-diet-1408f6b4.js | absent | 1 |
| /assets/Renderer-YP2i5A4q-diet-1408f6b4.js | absent | 1 |
| /assets/WorldInfoNotes-D2xa3aCb-diet-1408f6b4.js | absent | 1 |
| /assets/ConvoyBehavior-C3-OZ9YK-diet-1408f6b4.js | absent | 1 |
| /assets/SpriteAnimator-D7fw18el-diet-1408f6b4.js | absent | 1 |
| /assets/AssayBench-Cudo257i-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-BH-T2_Qs-diet-1408f6b4.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=true, cacheDisabled=true)

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-1408f6b4.css | absent | 1 |
| /assets/index-D13RlqEQ-diet-1408f6b4.js | absent | 1 |
| /version.json?t=1788585873964 | absent | 1 |
| /assets/TownNaming-kbSGeB3B-diet-1408f6b4.js | absent | 1 |
| /assets/StartMenu-Bve5BlCz-diet-1408f6b4.js | absent | 1 |
| /assets/SoundSystem-oDRhZ_tj-diet-1408f6b4.js | absent | 1 |
| /assets/payload-7QK_ReTL-diet-1408f6b4.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-1408f6b4.css | absent | 1 |
| /assets/EraBackdrop-B1SD0Oxj-diet-1408f6b4.js | absent | 1 |
| /assets/story-CuHlxcO4-diet-1408f6b4.js | absent | 1 |
| /assets/townEraProps-XR4xd-UB-diet-1408f6b4.js | absent | 1 |
| /assets/TownTavernPilot-BAYOnyg2-diet-1408f6b4.js | absent | 1 |
| /assets/ceremonyPostscripts-CRGhzncE-diet-1408f6b4.js | absent | 1 |
| /assets/scripts-FbooY-oA-diet-1408f6b4.js | absent | 1 |
| /assets/AssetLoading-DfI6ryJc-diet-1408f6b4.js | absent | 1 |
| /assets/LandmarkCollision-C7oRR30I-diet-1408f6b4.js | absent | 1 |
| /assets/runBeacon-DyB7pglI-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain-DclIvMMr-diet-1408f6b4.js | absent | 1 |
| /assets/Terrain3dClaimPilot-CpPgS4AF-diet-1408f6b4.js | absent | 1 |
| /assets/WaterRegion-BuO1dBg4-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-1408f6b4.css | absent | 1 |
| /assets/WeatherSystem-CZo3SRG8-diet-1408f6b4.js | absent | 1 |
| /assets/Renderer-YP2i5A4q-diet-1408f6b4.js | absent | 1 |
| /assets/WorldInfoNotes-D2xa3aCb-diet-1408f6b4.js | absent | 1 |
| /assets/ConvoyBehavior-C3-OZ9YK-diet-1408f6b4.js | absent | 1 |
| /assets/AssayBench-Cudo257i-diet-1408f6b4.js | absent | 1 |
| /assets/SpriteAnimator-D7fw18el-diet-1408f6b4.js | absent | 1 |
| /assets/TownScene-BH-T2_Qs-diet-1408f6b4.js | absent | 1 |
