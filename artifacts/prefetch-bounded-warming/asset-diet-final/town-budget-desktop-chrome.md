# Town byte budget — desktop-chrome

## Release-gated cue-window transfer total

| Release-gated cue-window arm | provenance | cueWindowTotalBytes | cueWindowUniqueBytes | cueWindowDuplicateBytes | Headroom against 25,000,000 |
| --- | --- | ---: | ---: | ---: | ---: |
| cue test | measured in this run | 11338053 | 11335083 | 2970 | 13661947 |

## A/B cue-window transfer totals (recorded, not release-gated)

| A/B cue-window arm | cueWindowTotalBytes | cueWindowUniqueBytes | cueWindowDuplicateBytes |
| --- | ---: | ---: | ---: |
| normal | 18666466 | 16277104 | 2389362 |
| saveData | 9371549 | 9371549 | 0 |

Desktop normal measured 24,604,025 bytes at f1621-1 (`75632a7e3`), 26,115,186 in the f1625-1 runner, and 23,259,297 at the f1625-1 drain: a 12.3% swing across the 25,000,000 ceiling.

Cue-window delta (normal - saveData): **9294917 bytes**.

## Settled <=20 s transfer totals (recorded, not gated)

| Settled arm | settledTotalBytes | settledUniqueBytes | settledDuplicateBytes | settled duplicate URL count | settle duration (ms) | settleCapHit |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| cue test | 27071274 | 27068304 | 2970 | 1 | 10776 | false |
| normal | 32042462 | 29653100 | 2389362 | 11 | 10347 | false |
| saveData | 29457666 | 27068304 | 2389362 | 11 | 12322 | false |
| prefetchWait=false, cacheDisabled=false | 27071274 | 27068304 | 2970 | 1 | 12499 | false |
| prefetchWait=false, cacheDisabled=true | 26399138 | 26396168 | 2970 | 1 | 10014 | false |
| prefetchWait=true, cacheDisabled=false | 31370326 | 28980964 | 2389362 | 11 | 10396 | false |
| prefetchWait=true, cacheDisabled=true | 32042462 | 29653100 | 2389362 | 11 | 13942 | false |

### URLs fetched more than once

| Settled arm | URL | fetch count |
| --- | --- | ---: |
| cue test | /favicon-32.png | 2 |
| normal | /favicon-32.png | 2 |
| normal | /assets/town-v3-tavern-CXl1aOfB-diet-a9d5c9a0.glb | 2 |
| normal | /assets/town-plate-C90tsADa-diet-a9d5c9a0.glb | 2 |
| normal | /assets/general-store-Crb4mVFW-diet-a9d5c9a0.glb | 2 |
| normal | /assets/claim-office-CY6Ib5so-diet-a9d5c9a0.glb | 2 |
| normal | /assets/assay-office-xAW04uBp-diet-a9d5c9a0.glb | 2 |
| normal | /assets/chapel-DqOSe4LC-diet-a9d5c9a0.glb | 2 |
| normal | /assets/schoolhouse-BR3cnoTX-diet-a9d5c9a0.glb | 2 |
| normal | /assets/covered_wagon-DoD5oKIb-diet-a9d5c9a0.glb | 2 |
| normal | /assets/water_trough-GmocFW04-diet-a9d5c9a0.glb | 2 |
| normal | /assets/pan_monument-DXhG2mKX-diet-a9d5c9a0.glb | 2 |
| saveData | /favicon-32.png | 2 |
| saveData | /assets/town-v3-tavern-CXl1aOfB-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/town-plate-C90tsADa-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/general-store-Crb4mVFW-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/claim-office-CY6Ib5so-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/chapel-DqOSe4LC-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/assay-office-xAW04uBp-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/covered_wagon-DoD5oKIb-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/schoolhouse-BR3cnoTX-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/pan_monument-DXhG2mKX-diet-a9d5c9a0.glb | 2 |
| saveData | /assets/water_trough-GmocFW04-diet-a9d5c9a0.glb | 2 |
| prefetchWait=false, cacheDisabled=false | /favicon-32.png | 2 |
| prefetchWait=false, cacheDisabled=true | /favicon-32.png | 2 |
| prefetchWait=true, cacheDisabled=false | /favicon-32.png | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/town-plate-C90tsADa-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/town-v3-tavern-CXl1aOfB-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/claim-office-CY6Ib5so-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/general-store-Crb4mVFW-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/assay-office-xAW04uBp-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/chapel-DqOSe4LC-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/schoolhouse-BR3cnoTX-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/covered_wagon-DoD5oKIb-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/pan_monument-DXhG2mKX-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=false | /assets/water_trough-GmocFW04-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /favicon-32.png | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/town-plate-C90tsADa-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/town-v3-tavern-CXl1aOfB-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/claim-office-CY6Ib5so-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/general-store-Crb4mVFW-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/chapel-DqOSe4LC-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/assay-office-xAW04uBp-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/schoolhouse-BR3cnoTX-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/covered_wagon-DoD5oKIb-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/pan_monument-DXhG2mKX-diet-a9d5c9a0.glb | 2 |
| prefetchWait=true, cacheDisabled=true | /assets/water_trough-GmocFW04-diet-a9d5c9a0.glb | 2 |

The saveData arm is a lower bound, not a clean isolation of the two bulk halls: it also narrows advance-stream prefetch to priority one.

| URL | normal settled bytes | saveData settled bytes | settled delta |
| --- | ---: | ---: | ---: |
| /assets/dynamo-hall-D_Gc9RPJ-diet-a9d5c9a0.glb | 1407064 | 0 | 1407064 |
| /assets/stamp-mill-CxhOFdRx-diet-a9d5c9a0.glb | 1177732 | 0 | 1177732 |

## Normal-arm decomposition

| prefetchWait | cacheDisabled | cueWindowTotalBytes | settledTotalBytes | settledUniqueBytes | settledDuplicateBytes | settled delta from false/false | settleCapHit |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| false | false | 6985157 | 27071274 | 27068304 | 2970 | 0 | false |
| false | true | 5183651 | 26399138 | 26396168 | 2970 | -672136 | false |
| true | false | 11639256 | 31370326 | 28980964 | 2389362 | 4299052 | false |
| true | true | 10663773 | 32042462 | 29653100 | 2389362 | 4971188 | false |

## Missing or unparseable content-length audit

### Cue test — cue-window sample

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-DjF6a2wN-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1788581150239 | absent | 1 |
| /assets/StartMenu-0LCFBLBj-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownNaming-qKvYsZXO-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-DVJ8BFWK-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-C-r35hHJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CfMc8oF8-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-DAmA3BpM-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BYVrgG0w-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-Cv1M30Iw-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B_NCHz28-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-CRUI63Za-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WaterRegion-Dw64Dwdi-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-vkASG7ir-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B7Z9_4QK-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-BgRy6TH8-diet-a9d5c9a0.js | absent | 1 |
| /assets/WeatherSystem-DJIyjhpS-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-wCaVCkVP-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-CP9B5pr2-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-Cle279Tz-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-YYnxVNxm-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BLirah_7-diet-a9d5c9a0.js | absent | 1 |

### Cue test — settled <=20 s capture

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-DjF6a2wN-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1788581150239 | absent | 1 |
| /assets/StartMenu-0LCFBLBj-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownNaming-qKvYsZXO-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-DVJ8BFWK-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-C-r35hHJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CfMc8oF8-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-DAmA3BpM-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BYVrgG0w-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-Cv1M30Iw-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B_NCHz28-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-CRUI63Za-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WaterRegion-Dw64Dwdi-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-vkASG7ir-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B7Z9_4QK-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-BgRy6TH8-diet-a9d5c9a0.js | absent | 1 |
| /assets/WeatherSystem-DJIyjhpS-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-wCaVCkVP-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-CP9B5pr2-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-Cle279Tz-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-YYnxVNxm-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BLirah_7-diet-a9d5c9a0.js | absent | 1 |

### A/B normal — cue-window sample

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-DjF6a2wN-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1788581172919 | absent | 1 |
| /assets/TownNaming-qKvYsZXO-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-0LCFBLBj-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-C-r35hHJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-DVJ8BFWK-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CfMc8oF8-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-DAmA3BpM-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BYVrgG0w-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-Cv1M30Iw-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B_NCHz28-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-CRUI63Za-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-Cle279Tz-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-YYnxVNxm-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BLirah_7-diet-a9d5c9a0.js | absent | 1 |
| /assets/WaterRegion-Dw64Dwdi-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WeatherSystem-DJIyjhpS-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-wCaVCkVP-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-BgRy6TH8-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B7Z9_4QK-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-vkASG7ir-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-CP9B5pr2-diet-a9d5c9a0.js | absent | 1 |

### A/B normal — settled <=20 s capture

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-DjF6a2wN-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1788581172919 | absent | 1 |
| /assets/TownNaming-qKvYsZXO-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-0LCFBLBj-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-C-r35hHJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-DVJ8BFWK-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CfMc8oF8-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-DAmA3BpM-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BYVrgG0w-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-Cv1M30Iw-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B_NCHz28-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-CRUI63Za-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-Cle279Tz-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-YYnxVNxm-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BLirah_7-diet-a9d5c9a0.js | absent | 1 |
| /assets/WaterRegion-Dw64Dwdi-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WeatherSystem-DJIyjhpS-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-wCaVCkVP-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-BgRy6TH8-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B7Z9_4QK-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-vkASG7ir-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-CP9B5pr2-diet-a9d5c9a0.js | absent | 1 |

### A/B saveData — cue-window sample

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-DjF6a2wN-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1788581190108 | absent | 1 |
| /assets/TownNaming-qKvYsZXO-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-0LCFBLBj-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-C-r35hHJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-DVJ8BFWK-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CfMc8oF8-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-DAmA3BpM-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BYVrgG0w-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-Cv1M30Iw-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B_NCHz28-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-CRUI63Za-diet-a9d5c9a0.js | absent | 1 |
| /assets/WaterRegion-Dw64Dwdi-diet-a9d5c9a0.js | absent | 1 |
| /assets/WeatherSystem-DJIyjhpS-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WorldInfoNotes-BgRy6TH8-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-wCaVCkVP-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-vkASG7ir-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B7Z9_4QK-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-CP9B5pr2-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-Cle279Tz-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-YYnxVNxm-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BLirah_7-diet-a9d5c9a0.js | absent | 1 |

### A/B saveData — settled <=20 s capture

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-DjF6a2wN-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1788581190108 | absent | 1 |
| /assets/TownNaming-qKvYsZXO-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-0LCFBLBj-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-C-r35hHJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-DVJ8BFWK-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CfMc8oF8-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-DAmA3BpM-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BYVrgG0w-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-Cv1M30Iw-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B_NCHz28-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-CRUI63Za-diet-a9d5c9a0.js | absent | 1 |
| /assets/WaterRegion-Dw64Dwdi-diet-a9d5c9a0.js | absent | 1 |
| /assets/WeatherSystem-DJIyjhpS-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WorldInfoNotes-BgRy6TH8-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-wCaVCkVP-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-vkASG7ir-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B7Z9_4QK-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-CP9B5pr2-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-Cle279Tz-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-YYnxVNxm-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BLirah_7-diet-a9d5c9a0.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=false, cacheDisabled=false)

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-DjF6a2wN-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1788581207715 | absent | 1 |
| /assets/TownNaming-qKvYsZXO-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-0LCFBLBj-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-DVJ8BFWK-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-C-r35hHJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CfMc8oF8-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-DAmA3BpM-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BYVrgG0w-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-Cv1M30Iw-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B_NCHz28-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-CRUI63Za-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WaterRegion-Dw64Dwdi-diet-a9d5c9a0.js | absent | 1 |
| /assets/WeatherSystem-DJIyjhpS-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-BgRy6TH8-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-vkASG7ir-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B7Z9_4QK-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-wCaVCkVP-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-CP9B5pr2-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-YYnxVNxm-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-Cle279Tz-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BLirah_7-diet-a9d5c9a0.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=false, cacheDisabled=true)

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-DjF6a2wN-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1788581224654 | absent | 1 |
| /assets/TownNaming-qKvYsZXO-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-0LCFBLBj-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-DVJ8BFWK-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-C-r35hHJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CfMc8oF8-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BYVrgG0w-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-DAmA3BpM-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B_NCHz28-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-Cv1M30Iw-diet-a9d5c9a0.js | absent | 1 |
| /assets/WeatherSystem-DJIyjhpS-diet-a9d5c9a0.js | absent | 1 |
| /assets/WaterRegion-Dw64Dwdi-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-CRUI63Za-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/Renderer-wCaVCkVP-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-CP9B5pr2-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-BgRy6TH8-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B7Z9_4QK-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-vkASG7ir-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-YYnxVNxm-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-Cle279Tz-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BLirah_7-diet-a9d5c9a0.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=true, cacheDisabled=false)

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-DjF6a2wN-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1788581240284 | absent | 1 |
| /assets/TownNaming-qKvYsZXO-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-0LCFBLBj-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-DVJ8BFWK-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-C-r35hHJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CfMc8oF8-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-DAmA3BpM-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BYVrgG0w-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-Cv1M30Iw-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B_NCHz28-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-CRUI63Za-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-Cle279Tz-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-YYnxVNxm-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BLirah_7-diet-a9d5c9a0.js | absent | 1 |
| /assets/WaterRegion-Dw64Dwdi-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WeatherSystem-DJIyjhpS-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-BgRy6TH8-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-wCaVCkVP-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-CP9B5pr2-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-vkASG7ir-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B7Z9_4QK-diet-a9d5c9a0.js | absent | 1 |

### A/B normal settled <=20 s cell (prefetchWait=true, cacheDisabled=true)

Missing or unparseable `content-length`: **29 responses**.

| URL | reason | occurrences |
| --- | --- | ---: |
| /?town3dPilot=all&tier=full | absent | 1 |
| /assets/index-CNz6tqNS-diet-a9d5c9a0.css | absent | 1 |
| /assets/index-DjF6a2wN-diet-a9d5c9a0.js | absent | 1 |
| /version.json?t=1788581261541 | absent | 1 |
| /assets/TownNaming-qKvYsZXO-diet-a9d5c9a0.js | absent | 1 |
| /assets/StartMenu-0LCFBLBj-diet-a9d5c9a0.js | absent | 1 |
| /assets/SoundSystem-DVJ8BFWK-diet-a9d5c9a0.js | absent | 1 |
| /assets/payload-IkboOid1-diet-a9d5c9a0.js | absent | 1 |
| /assets/EraBackdrop-C-r35hHJ-diet-a9d5c9a0.js | absent | 1 |
| /assets/story-DUNHFs8m-diet-a9d5c9a0.css | absent | 1 |
| /assets/story-CfMc8oF8-diet-a9d5c9a0.js | absent | 1 |
| /assets/townEraProps-BWPb1u6B-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownTavernPilot-DAmA3BpM-diet-a9d5c9a0.js | absent | 1 |
| /assets/ceremonyPostscripts-BYVrgG0w-diet-a9d5c9a0.js | absent | 1 |
| /assets/scripts-B_NCHz28-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssetLoading-Cv1M30Iw-diet-a9d5c9a0.js | absent | 1 |
| /assets/LandmarkCollision-CRUI63Za-diet-a9d5c9a0.js | absent | 1 |
| /assets/runBeacon-Cle279Tz-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain-YYnxVNxm-diet-a9d5c9a0.js | absent | 1 |
| /assets/Terrain3dClaimPilot-BLirah_7-diet-a9d5c9a0.js | absent | 1 |
| /assets/WaterRegion-Dw64Dwdi-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-Dl4sfjmy-diet-a9d5c9a0.css | absent | 1 |
| /assets/WeatherSystem-DJIyjhpS-diet-a9d5c9a0.js | absent | 1 |
| /assets/WorldInfoNotes-BgRy6TH8-diet-a9d5c9a0.js | absent | 1 |
| /assets/TownScene-vkASG7ir-diet-a9d5c9a0.js | absent | 1 |
| /assets/Renderer-wCaVCkVP-diet-a9d5c9a0.js | absent | 1 |
| /assets/SpriteAnimator-B7Z9_4QK-diet-a9d5c9a0.js | absent | 1 |
| /assets/AssayBench-CP9B5pr2-diet-a9d5c9a0.js | absent | 1 |
| /assets/ConvoyBehavior-_uaGgp-0-diet-a9d5c9a0.js | absent | 1 |
