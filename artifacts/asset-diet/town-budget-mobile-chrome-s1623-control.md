<!-- s1623 DRAIN CONTROL RUN of f1621-1, taken ~40 min after the runner. Same code, same machine.
     Kept alongside the runner s original artifact (town-budget-mobile-chrome.md) under the RETENTION LAW:
     the PAIR is the evidence, because the instrument is unstable at fixed configuration (F-1623-1). -->

# Town byte budget — mobile-chrome

| Arm | townResponseBytes | Headroom against 25,000,000 |
| --- | ---: | ---: |
| normal | 22469496 | 2530504 |
| saveData | 17530413 | 7469587 |

Delta (normal - saveData): **4939083 bytes**.

The saveData arm is a lower bound, not a clean isolation of the two bulk halls: it also narrows advance-stream prefetch to priority one.

| URL | normal bytes | saveData bytes | delta |
| --- | ---: | ---: | ---: |
| /assets/dynamo-hall-D_Gc9RPJ-diet-a9d5c9a0.glb | 1407064 | 0 | 1407064 |
| /assets/stamp-mill-CxhOFdRx-diet-a9d5c9a0.glb | 1177732 | 0 | 1177732 |
| /assets/maintained_claim_house-CHFZbLoB-diet-a9d5c9a0.glb | 301316 | 0 | 301316 |
| /assets/active_headframe-DFnjayGK-diet-a9d5c9a0.glb | 292768 | 0 | 292768 |
| /assets/char-hero-sheet-rotation-f-r2c1-Dq-r5wRJ-diet-a9d5c9a0.png | 58614 | 0 | 58614 |
| /assets/char-hero-sheet-rotation-f-r2c0-CtDXOMyX-diet-a9d5c9a0.png | 58298 | 0 | 58298 |
| /assets/char-hero-sheet-rotation-f-r2c3-Do3v2rli-diet-a9d5c9a0.png | 57440 | 0 | 57440 |
| /assets/char-hero-sheet-rotation2-f-r0c0-BaWqdCjS-diet-a9d5c9a0.png | 53761 | 0 | 53761 |
| /assets/char-hero-sheet-rotation2-f-r0c1-B03qLtCA-diet-a9d5c9a0.png | 53491 | 0 | 53491 |
| /assets/char-hero-sheet-rotation2-f-r1c0-DzWzQ3se-diet-a9d5c9a0.png | 50812 | 0 | 50812 |
| /assets/char-hero-sheet-rotation2-f-r0c2-BlX0f4rV-diet-a9d5c9a0.png | 49500 | 0 | 49500 |
| /assets/char-hero-sheet-rotation2-f-r1c1-kqE9WcPF-diet-a9d5c9a0.png | 48439 | 0 | 48439 |
| /assets/char-hero-sheet-rotation2-f-r0c3-BlVAxsG9-diet-a9d5c9a0.png | 46360 | 0 | 46360 |
| /assets/char-hero-sheet-walkdiag8-r0c2-BPGrJh-z-diet-a9d5c9a0.png | 45647 | 0 | 45647 |
| /assets/char-hero-sheet-walkdiag8-r0c7-BqEzE0II-diet-a9d5c9a0.png | 45023 | 0 | 45023 |
| /assets/char-hero-sheet-walkdiag8-r1c1-BTP26ABx-diet-a9d5c9a0.png | 44982 | 0 | 44982 |
| /assets/char-hero-sheet-walkdiag8-r0c1-Bbmx9aO4-diet-a9d5c9a0.png | 44945 | 0 | 44945 |
| /assets/char-hero-sheet-walkdiag8-r0c0-B2bRmv4w-diet-a9d5c9a0.png | 44432 | 0 | 44432 |
| /assets/char-hero-sheet-walkdiag8-r1c3-6K2GKsHd-diet-a9d5c9a0.png | 44400 | 0 | 44400 |
| /assets/char-hero-sheet-walkdiag8-r0c6-CJw4hHiG-diet-a9d5c9a0.png | 44363 | 0 | 44363 |
| /assets/char-hero-sheet-walkdiag8-r1c2-D-5y5tpf-diet-a9d5c9a0.png | 44268 | 0 | 44268 |
| /assets/char-hero-sheet-walkdiag8-r1c0-BohOyMPL-diet-a9d5c9a0.png | 44263 | 0 | 44263 |
| /assets/char-hero-sheet-walkdiag8-r1c6-DtmrhLVj-diet-a9d5c9a0.png | 43698 | 0 | 43698 |
| /assets/char-hero-sheet-walkdiag8-r1c4-BQ77a14f-diet-a9d5c9a0.png | 42648 | 0 | 42648 |
| /assets/char-hero-sheet-walkdiag8-r1c7-oNeC3kM5-diet-a9d5c9a0.png | 42238 | 0 | 42238 |
| /assets/char-hero-sheet-walkdiag8-r0c3-HABE-_TR-diet-a9d5c9a0.png | 41455 | 0 | 41455 |
| /assets/char-hero-sheet-walkdiag8-r0c5-Dc9rurdO-diet-a9d5c9a0.png | 41166 | 0 | 41166 |
| /assets/char-hero-sheet-walkdiag8-r0c4-D_f66Znz-diet-a9d5c9a0.png | 40322 | 0 | 40322 |
| /assets/char-hero-sheet-walkdiag8-r1c5-D9BfKK0V-diet-a9d5c9a0.png | 39273 | 0 | 39273 |
| /assets/char-hero-sheet-rotation2-f-r1c2-BMPHb76p-diet-a9d5c9a0.png | 36449 | 0 | 36449 |
| /assets/char-hero-sheet-walk8-r0c5-Me4Uhiew-diet-a9d5c9a0.png | 18566 | 0 | 18566 |
| /assets/char-hero-sheet-walk8-r0c0-BsqR6F_c-diet-a9d5c9a0.png | 18424 | 0 | 18424 |
| /assets/char-hero-sheet-walk8-r0c1-Dj-PNTT2-diet-a9d5c9a0.png | 18404 | 0 | 18404 |
| /assets/char-hero-sheet-walk8-r0c7-_J5wQ6HQ-diet-a9d5c9a0.png | 18362 | 0 | 18362 |
| /assets/char-hero-sheet-walk8-r0c3-BYiEmfUh-diet-a9d5c9a0.png | 18217 | 0 | 18217 |
| /assets/char-hero-sheet-walk8-r0c6-B72dG4VG-diet-a9d5c9a0.png | 18069 | 0 | 18069 |
| /assets/char-hero-sheet-walk8-r2c3-C8cVH_-G-diet-a9d5c9a0.png | 18056 | 0 | 18056 |
| /assets/char-hero-sheet-walk8-r2c6-sMEEE1pj-diet-a9d5c9a0.png | 17803 | 0 | 17803 |
| /assets/char-hero-sheet-walk8-r0c4-cAxqt8q1-diet-a9d5c9a0.png | 17766 | 0 | 17766 |
| /assets/char-hero-sheet-walk8-r0c2-Da9FZLMl-diet-a9d5c9a0.png | 17715 | 0 | 17715 |
| /assets/char-hero-sheet-walk8-r2c1-BdRCBmlj-diet-a9d5c9a0.png | 17552 | 0 | 17552 |
| /assets/char-hero-sheet-walk8-r1c3-BtJ_MlWl-diet-a9d5c9a0.png | 17426 | 0 | 17426 |
| /assets/char-hero-sheet-walk8-r2c4-ZsU0iJT--diet-a9d5c9a0.png | 17397 | 0 | 17397 |
| /assets/char-hero-sheet-walk8-r2c7-CLgs08RF-diet-a9d5c9a0.png | 17375 | 0 | 17375 |
| /assets/char-hero-sheet-walk8-r3c7-CoRRptMH-diet-a9d5c9a0.png | 17284 | 0 | 17284 |
| /assets/char-hero-sheet-walk8-r3c4-CVm1kFHa-diet-a9d5c9a0.png | 17246 | 0 | 17246 |
| /assets/char-hero-sheet-walk8-r1c5-CwkI0Veu-diet-a9d5c9a0.png | 17161 | 0 | 17161 |
| /assets/char-hero-sheet-walk8-r3c5-CKp-mh2V-diet-a9d5c9a0.png | 17134 | 0 | 17134 |
| /assets/char-hero-sheet-walk8-r3c6-DrCDUWBZ-diet-a9d5c9a0.png | 17114 | 0 | 17114 |
| /assets/char-hero-sheet-walk8-r3c1-Cmwf60da-diet-a9d5c9a0.png | 17048 | 0 | 17048 |
| /assets/char-hero-sheet-walk8-r3c2-BNITFyO8-diet-a9d5c9a0.png | 17042 | 0 | 17042 |
| /assets/char-hero-sheet-walk8-r3c0-BK5r9J21-diet-a9d5c9a0.png | 16995 | 0 | 16995 |
| /assets/char-hero-sheet-walk8-r3c3-BDsONuYV-diet-a9d5c9a0.png | 16954 | 0 | 16954 |
| /assets/char-hero-sheet-walk8-r2c0-BHJnZ0dK-diet-a9d5c9a0.png | 16678 | 0 | 16678 |
| /assets/char-hero-sheet-walk8-r1c1-ClNFT9S9-diet-a9d5c9a0.png | 16485 | 0 | 16485 |
| /assets/char-hero-sheet-walk8-r1c7-DAu16A4q-diet-a9d5c9a0.png | 16433 | 0 | 16433 |
| /assets/char-hero-sheet-walk8-r1c0-B9KNvJPd-diet-a9d5c9a0.png | 16263 | 0 | 16263 |
| /assets/char-hero-sheet-walk8-r1c2-D8fn8cJ6-diet-a9d5c9a0.png | 16247 | 0 | 16247 |
| /assets/char-hero-sheet-walk8-r1c4-C1ndGy4c-diet-a9d5c9a0.png | 15732 | 0 | 15732 |
| /assets/char-hero-sheet-walk8-r1c6-BiEHFPdU-diet-a9d5c9a0.png | 15439 | 0 | 15439 |
| /assets/char-hero-sheet-walk8-r2c2-CJF7a4Gh-diet-a9d5c9a0.png | 14552 | 0 | 14552 |
| /assets/char-hero-sheet-walk8-r2c5-B7Ioql32-diet-a9d5c9a0.png | 14128 | 0 | 14128 |
| /assets/char-hero-sheet-rotation2-f-r0c0-CiOUZ4Rv-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r0c1-C568cl0F-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r0c2-DBNOZTqy-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r0c3-CCS-1x3_-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r1c2-MEWg80pR-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r1c0-B9JN6wnB-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation2-f-r1c1-BK_24hNL-diet-a9d5c9a0.js | 122 | 0 | 122 |
| /assets/char-hero-sheet-rotation-f-r2c0-B65qYqpU-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r2c1-lt40NBlj-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-rotation-f-r2c3-DRtx92Jj-diet-a9d5c9a0.js | 121 | 0 | 121 |
| /assets/char-hero-sheet-walkdiag8-r0c0-Cx4JPoZx-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r0c1-BjHgwZMm-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r0c2-DT_L4Unh-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r0c3-B--Z0qgS-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r0c4-COI7hNoK-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r0c6-BZza_0zK-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r0c5-aAd-vLID-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r0c7-DnTByRX6-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r1c0-CemOZ2qi-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r1c1-D_gJH_J_-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r1c3-cttMQU3J-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r1c2-DcC4o4Di-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r1c4-PtXKtWUa-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r1c5-CxqB0OaJ-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r1c6-BZrf_dMT-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walkdiag8-r1c7-BLoxLJ9X-diet-a9d5c9a0.js | 120 | 0 | 120 |
| /assets/char-hero-sheet-walk8-r0c0-ByggSR3j-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c2-JNsyRcbM-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c1-CAHPx9NK-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c3-Ck6NIbJZ-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c4-G2tUTpQB-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c5-DJe8USDg-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c6-aML9tZyl-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r0c7-BSQBMcrU-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r1c0-lYxbHMZT-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r1c2-DzB2Y2gJ-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r1c1-CX1BTv1M-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r1c3-DqaDzkb7-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r1c4-CUSllr32-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r1c5-D23HlA5j-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r1c6-Jc8d9Nur-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r1c7-BuI8PP5z-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r2c0-FVrL6GlF-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r2c2-DlACNM2J-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r2c1-DcMbYgWq-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r2c3-DJE1ipjJ-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r2c4-CiopK-6l-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r2c6-DZV84k-j-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r2c5-DMiQSyB1-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r2c7-Dqud2LqM-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r3c0-DFUH_MqJ-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r3c1-BP9fL7bt-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r3c2-BP7euw9H-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r3c3-COS5achN-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r3c4-Bisu0dtZ-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r3c6-KmBntoWY-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r3c5-CrDVwVBp-diet-a9d5c9a0.js | 116 | 0 | 116 |
| /assets/char-hero-sheet-walk8-r3c7-BKVU3l4H-diet-a9d5c9a0.js | 116 | 0 | 116 |

## Normal-arm decomposition

| prefetchWait | cacheDisabled | townResponseBytes | delta from false/false |
| --- | --- | ---: | ---: |
| false | false | 6471185 | 0 |
| false | true | 12217906 | 5746721 |
| true | false | 18311700 | 11840515 |
| true | true | 19098942 | 12627757 |

## Missing or unparseable content-length audit

### Cue-window instrument

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329585849 | absent | 1 |
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
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |

### A/B normal arm

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329596280 | absent | 1 |
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
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |

### A/B saveData arm

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329603265 | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CgphZTDO-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-DMticRsV-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CcfF0Lpf-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-CNGuuAJ_-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-B4dUaloO-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-BqOy8z0b-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |

### A/B normal cell (prefetchWait=false, cacheDisabled=false)

Missing or unparseable `content-length`: **27 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-B7-5DrnG-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-D8zbgI-R-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1786329611314 | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CgphZTDO-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/EraBackdrop-DMticRsV-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-CcfF0Lpf-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-CNGuuAJ_-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-BqOy8z0b-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-B4dUaloO-diet-a9d5c9a0.js | absent | 1 |
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
| /version.json?t=1786329617140 | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
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
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
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
| /version.json?t=1786329624262 | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
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
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
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
| /version.json?t=1786329635622 | absent | 1 |
| /assets/StartMenu-CW93YTZC-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-CgphZTDO-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownNaming-CC95Pqub-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-DMticRsV-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CcfF0Lpf-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-CNGuuAJ_-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-B4dUaloO-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B5Ii2N4Z-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-BqOy8z0b-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-DVsfohMD-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-CveV8l48-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-BME3R9uO-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BYrgnr74-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-6gAwZNSs-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WorldInfoNotes-DFdKGkaC-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-BCtF4xZG-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-xa3YJx8D-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-jswEeDLQ-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-6w3QjrLF-diet-a9d5c9a0.js | absent | 1 |
