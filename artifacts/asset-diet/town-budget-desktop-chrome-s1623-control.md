<!-- s1623 DRAIN CONTROL RUN of f1621-1, taken ~40 min after the runner. Same code, same machine.
     Kept alongside the runner s original artifact (town-budget-desktop-chrome.md) under the RETENTION LAW:
     the PAIR is the evidence, because the instrument is unstable at fixed configuration (F-1623-1). -->

# Town byte budget — desktop-chrome

| Arm | townResponseBytes | Headroom against 25,000,000 |
| --- | ---: | ---: |
| normal | 21297362 | 3702638 |
| saveData | 13600227 | 11399773 |

Delta (normal - saveData): **7697135 bytes**.

The saveData arm is a lower bound, not a clean isolation of the two bulk halls: it also narrows advance-stream prefetch to priority one.

| URL | normal bytes | saveData bytes | delta |
| --- | ---: | ---: | ---: |
| /assets/dynamo-hall-D_Gc9RPJ-diet-a9d5c9a0.glb | 1407064 | 0 | 1407064 |
| /assets/stamp-mill-CxhOFdRx-diet-a9d5c9a0.glb | 1177732 | 0 | 1177732 |
| /assets/the-claim-terrain-CPmx4txo-diet-a9d5c9a0.glb | 966064 | 0 | 966064 |
| /assets/the-claim-panorama-DkzE3d2l-diet-a9d5c9a0.glb | 517820 | 0 | 517820 |
| /assets/maintained_claim_house-CHFZbLoB-diet-a9d5c9a0.glb | 301316 | 0 | 301316 |
| /assets/active_headframe-DFnjayGK-diet-a9d5c9a0.glb | 292768 | 0 | 292768 |
| /assets/char-hero-sheet-front-f-r0c2-D8AzHpw2-diet-a9d5c9a0.png | 80474 | 0 | 80474 |
| /assets/char-hero-sheet-front-f-r0c1-Cw7207bN-diet-a9d5c9a0.png | 79737 | 0 | 79737 |
| /assets/char-hero-sheet-back-f-r0c1-CZIs_syN-diet-a9d5c9a0.png | 77599 | 0 | 77599 |
| /assets/char-hero-sheet-front-f-r0c0-BrhLgP5D-diet-a9d5c9a0.png | 76948 | 0 | 76948 |
| /assets/char-hero-sheet-front-f-r1c0-DpI-Opau-diet-a9d5c9a0.png | 75067 | 0 | 75067 |
| /assets/char-hero-sheet-back-f-r0c2-DVOXysPU-diet-a9d5c9a0.png | 74816 | 0 | 74816 |
| /assets/char-hero-sheet-back-f-r1c2-CZLWX9Lo-diet-a9d5c9a0.png | 74526 | 0 | 74526 |
| /assets/char-hero-sheet-front-f-r1c2-bdykDZaZ-diet-a9d5c9a0.png | 74071 | 0 | 74071 |
| /assets/char-hero-sheet-back-f-r0c0-BSsAeqnI-diet-a9d5c9a0.png | 73317 | 0 | 73317 |
| /assets/char-hero-sheet-back-f-r1c1-Dfqp-ftL-diet-a9d5c9a0.png | 72194 | 0 | 72194 |
| /assets/char-hero-sheet-back-f-r1c0-CImOsw_9-diet-a9d5c9a0.png | 70564 | 0 | 70564 |
| /assets/char-hero-sheet-front-f-r1c1-C0vWCLAS-diet-a9d5c9a0.png | 69964 | 0 | 69964 |
| /assets/char-hero-sheet-rotation-f-r0c1-BNLd8QO_-diet-a9d5c9a0.png | 61357 | 0 | 61357 |
| /assets/char-hero-sheet-rotation-f-r0c2-DgGCeWfo-diet-a9d5c9a0.png | 60951 | 0 | 60951 |
| /assets/char-hero-sheet-rotation-f-r0c3-IC5wZbtG-diet-a9d5c9a0.png | 60903 | 0 | 60903 |
| /assets/char-hero-sheet-rotation-f-r0c0-QtN8lYOq-diet-a9d5c9a0.png | 58806 | 0 | 58806 |
| /assets/char-hero-sheet-rotation-f-r2c1-Dq-r5wRJ-diet-a9d5c9a0.png | 58614 | 0 | 58614 |
| /assets/char-hero-sheet-rotation-f-r2c0-CtDXOMyX-diet-a9d5c9a0.png | 58298 | 0 | 58298 |
| /assets/char-hero-sheet-rotation-f-r2c3-Do3v2rli-diet-a9d5c9a0.png | 57440 | 0 | 57440 |
| /assets/char-hero-sheet-rotation-f-r2c2-BK-qH9cq-diet-a9d5c9a0.png | 57419 | 0 | 57419 |
| /assets/char-hero-sheet-rotation-f-r1c2-DnC71R4h-diet-a9d5c9a0.png | 57282 | 0 | 57282 |
| /assets/char-youngster-f-sheet-walk8-r1c5-DlyVRTUG-diet-a9d5c9a0.png | 55676 | 0 | 55676 |
| /assets/char-youngster-m-sheet-walk8-r2c6-jedDM-Km-diet-a9d5c9a0.png | 55171 | 0 | 55171 |
| /assets/char-hero-sheet-rotation2-f-r0c0-BaWqdCjS-diet-a9d5c9a0.png | 53761 | 0 | 53761 |
| /assets/char-hero-sheet-rotation-f-r1c1-se-bKQJV-diet-a9d5c9a0.png | 53588 | 0 | 53588 |
| /assets/char-hero-sheet-rotation2-f-r0c1-B03qLtCA-diet-a9d5c9a0.png | 53491 | 0 | 53491 |
| /assets/char-hero-sheet-rotation-f-r1c0-CTPQPgU6-diet-a9d5c9a0.png | 52359 | 0 | 52359 |
| /assets/char-hero-sheet-rotation2-f-r1c0-DzWzQ3se-diet-a9d5c9a0.png | 50812 | 0 | 50812 |
| /assets/char-hero-sheet-rotation-f-r1c3-BsBCN3cn-diet-a9d5c9a0.png | 50130 | 0 | 50130 |
| /assets/char-hero-sheet-rotation2-f-r0c2-BlX0f4rV-diet-a9d5c9a0.png | 49500 | 0 | 49500 |
| /assets/char-hero-sheet-rotation2-f-r1c1-kqE9WcPF-diet-a9d5c9a0.png | 48439 | 0 | 48439 |
| /assets/char-youngster-f-sheet-walk8-r1c6-DwUcG7VP-diet-a9d5c9a0.png | 48204 | 0 | 48204 |
| /assets/char-newsie-mei-sheet-walk8-r2c7-BtvlG99K-diet-a9d5c9a0.png | 47848 | 0 | 47848 |
| /assets/char-prospector-sheet-hover8-r3c5-D4To1GG9-diet-a9d5c9a0.png | 47333 | 0 | 47333 |
| /assets/char-prospector-sheet-hover8-r3c1-CRFsFBAZ-diet-a9d5c9a0.png | 47180 | 0 | 47180 |
| /assets/char-youngster-f-sheet-walk8-r1c7-axdxIGSF-diet-a9d5c9a0.png | 46816 | 0 | 46816 |
| /assets/char-prospector-sheet-hover8-r3c0-DS8s4uGN-diet-a9d5c9a0.png | 46608 | 0 | 46608 |
| /assets/char-hero-sheet-rotation2-f-r0c3-BlVAxsG9-diet-a9d5c9a0.png | 46360 | 0 | 46360 |
| /assets/char-prospector-sheet-hover8-r3c6-D9hLAYEZ-diet-a9d5c9a0.png | 45717 | 0 | 45717 |
| /assets/char-prospector-sheet-hover8-r3c4-Csv60xUm-diet-a9d5c9a0.png | 45615 | 0 | 45615 |
| /assets/char-prospector-sheet-hover8-r3c2-IXWbGT5V-diet-a9d5c9a0.png | 44866 | 0 | 44866 |
| /assets/char-prospector-sheet-hover8-r3c7-GQ5FxGuP-diet-a9d5c9a0.png | 44275 | 0 | 44275 |
| /assets/char-prospector-sheet-hover8-r2c2-DW7AbXL9-diet-a9d5c9a0.png | 43787 | 0 | 43787 |
| /assets/char-prospector-sheet-hover8-r2c6-Bg-wK2-L-diet-a9d5c9a0.png | 43759 | 0 | 43759 |
| /assets/char-prospector-sheet-hover8-r2c4-C-apYupi-diet-a9d5c9a0.png | 43483 | 0 | 43483 |
| /assets/char-prospector-sheet-hover8-r3c3-DuTNeWDS-diet-a9d5c9a0.png | 43287 | 0 | 43287 |
| /assets/char-youngster-m-sheet-walk8-r2c7-Cehrtsv3-diet-a9d5c9a0.png | 43008 | 0 | 43008 |
| /assets/char-prospector-sheet-hover8-r2c7-BATofvDn-diet-a9d5c9a0.png | 41491 | 0 | 41491 |
| /assets/char-prospector-sheet-hover8-r2c0-lUGohRgo-diet-a9d5c9a0.png | 40752 | 0 | 40752 |
| /assets/char-prospector-sheet-hover8-r2c5-B8LvKVfR-diet-a9d5c9a0.png | 40742 | 0 | 40742 |
| /assets/char-prospector-sheet-hover8-r2c1-B28ExyX9-diet-a9d5c9a0.png | 40652 | 0 | 40652 |
| /assets/char-prospector-sheet-hover8-r2c3-DVnMtCqV-diet-a9d5c9a0.png | 40108 | 0 | 40108 |
| /assets/char-hero-sheet-rotation2-f-r1c2-BMPHb76p-diet-a9d5c9a0.png | 36449 | 0 | 36449 |
| /assets/char-hero-sheet-rotation2-f-r1c3-U0TG2Wvm-diet-a9d5c9a0.png | 34094 | 0 | 34094 |
| /assets/char-hero-sheet-walk8-r0c0-BsqR6F_c-diet-a9d5c9a0.png | 18424 | 0 | 18424 |
| /assets/char-hero-sheet-walk8-r0c1-Dj-PNTT2-diet-a9d5c9a0.png | 18404 | 0 | 18404 |
| /assets/char-hero-sheet-walk8-r0c3-BYiEmfUh-diet-a9d5c9a0.png | 18217 | 0 | 18217 |
| /assets/char-hero-sheet-walk8-r0c2-Da9FZLMl-diet-a9d5c9a0.png | 17715 | 0 | 17715 |
| /assets/char-prospector-sheet-hover8-r2c1-D9F2zITr-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r2c2-BAnTicSm-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r2c3-BxiltpWZ-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r2c4-UfuZ0xDE-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r2c5-CZbe0mUA-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r2c6-DSksmhpg-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r2c7-Bfj6VNS2-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r3c1-C7HNyBHE-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r3c0-C41zqBTi-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r3c2-5lAouDCp-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r3c3-C7NRSsVW-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r3c4-BO_VR5Ls-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r3c5-9XqUqQeT-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r3c6-BPf2_KtF-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-prospector-sheet-hover8-r3c7-lbpfQsqL-diet-a9d5c9a0.js | 123 | 0 | 123 |
| /assets/char-hero-sheet-rotation2-f-r1c3-C7UakkK9-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r0c0-CiOUZ4Rv-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r0c1-C568cl0F-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r0c2-DBNOZTqy-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r0c3-CCS-1x3_-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r1c2-MEWg80pR-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r1c0-B9JN6wnB-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r1c1-BK_24hNL-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation-f-r0c1-DJLydaeX-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r0c0-CyKNXNTR-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r2c2-DjH65zJJ-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r0c2-DlsUC9ON-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r0c3-DVyPcFMJ-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r1c0-IYZdqL29-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r1c1-4bbyYB_r-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r1c2-C5cfbtIr-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r1c3-D2rUZJPx-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r2c0-B65qYqpU-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r2c1-lt40NBlj-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r2c3-DRtx92Jj-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-back-f-r0c2-BhKBzyXX-diet-a9d5c9a0.js | 117 | 0 | 117 |
| /assets/char-hero-sheet-back-f-r0c1-C9_Eu7Wc-diet-a9d5c9a0.js | 117 | 0 | 117 |
| /assets/char-hero-sheet-back-f-r0c0-B1cvNLeF-diet-a9d5c9a0.js | 117 | 0 | 117 |
| /assets/char-hero-sheet-back-f-r1c0-BSN2flQg-diet-a9d5c9a0.js | 117 | 0 | 117 |
| /assets/char-hero-sheet-back-f-r1c1-v4P1WSBk-diet-a9d5c9a0.js | 117 | 0 | 117 |
| /assets/char-hero-sheet-back-f-r1c2-Do1fWzjP-diet-a9d5c9a0.js | 117 | 0 | 117 |
| /assets/char-hero-sheet-walk8-r0c0-ByggSR3j-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c1-CAHPx9NK-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c2-JNsyRcbM-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c3-Ck6NIbJZ-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c6-aML9tZyl-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c5-DJe8USDg-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c4-G2tUTpQB-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c7-BSQBMcrU-diet-a9d5c9a0.js | 116 | 0 | 116 |

## Normal-arm decomposition

| prefetchWait | cacheDisabled | townResponseBytes | delta from false/false |
| --- | --- | ---: | ---: |
| false | false | 6471185 | 0 |
| false | true | 15658402 | 9187217 |
| true | false | 19796189 | 13325004 |
| true | true | 21946189 | 15475004 |

## Missing or unparseable content-length audit

### Cue-window instrument

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329493036 | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-DMticRsV-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CgphZTDO-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CcfF0Lpf-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-CNGuuAJ_-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-B4dUaloO-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-BqOy8z0b-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |

### A/B normal arm

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329504276 | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-DMticRsV-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CgphZTDO-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CcfF0Lpf-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-CNGuuAJ_-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-B4dUaloO-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-BqOy8z0b-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |

### A/B saveData arm

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329512759 | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CgphZTDO-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-DMticRsV-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CcfF0Lpf-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-CNGuuAJ_-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-B4dUaloO-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-BqOy8z0b-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |

### A/B normal cell (prefetchWait=false, cacheDisabled=false)

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329521248 | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CgphZTDO-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-DMticRsV-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CcfF0Lpf-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-CNGuuAJ_-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-B4dUaloO-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-BqOy8z0b-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |

### A/B normal cell (prefetchWait=false, cacheDisabled=true)

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329528970 | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CgphZTDO-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-DMticRsV-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CcfF0Lpf-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-B4dUaloO-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-CNGuuAJ_-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-BqOy8z0b-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |

### A/B normal cell (prefetchWait=true, cacheDisabled=false)

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329538672 | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-DMticRsV-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CgphZTDO-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CcfF0Lpf-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-CNGuuAJ_-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-B4dUaloO-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-BqOy8z0b-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |

### A/B normal cell (prefetchWait=true, cacheDisabled=true)

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329550197 | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CgphZTDO-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-DMticRsV-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CcfF0Lpf-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-B4dUaloO-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-CNGuuAJ_-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-BqOy8z0b-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
