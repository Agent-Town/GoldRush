# Advance-stream cache reuse: dev vs production headers

Boot flags: `debug&timescale=24&nolevel&seed=advance-stream-walkthrough` · route interception: none · network emulation: none · project: mobile-chrome
Dev `cache-control` observed via CDP `Network.responseReceived`: `no-cache`
Production `cache-control` observed via CDP `Network.responseReceived` from Vite preview's native header option: `public, max-age=31536000, immutable`

| Door | Dev DOUBLE-DOWNLOAD | Dev REVALIDATED | Dev OVERLAP | Dev CACHE-HIT | Dev wire bytes | Production DOUBLE-DOWNLOAD | Production REVALIDATED | Production OVERLAP | Production CACHE-HIT | Production wire bytes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| menu | 0 | 0 | 0 | 0 | 14089508 | 0 | 0 | 0 | 0 | 5160996 |
| town | 1 | 5 | 4 | 0 | 9597930 | 0 | 0 | 0 | 10 | 0 |
| contract1 | 0 | 0 | 15 | 0 | 35586615 | 0 | 0 | 8 | 7 | 2884228 |
| town-return | 2 | 4 | 4 | 0 | 10510256 | 0 | 0 | 0 | 10 | 2722924 |
| contract2 | 0 | 0 | 10 | 0 | 16161807 | 0 | 0 | 0 | 15 | 0 |

## Dev-server detail

# Advance-stream cache reuse

Boot flags: `debug&timescale=24&nolevel&seed=advance-stream-walkthrough` · arm: dev-server · route interception: none · network emulation: none · project: mobile-chrome
Observed `cache-control` via CDP `Network.responseReceived`: `no-cache`

| Door | DOUBLE-DOWNLOAD | REVALIDATED | OVERLAP | CACHE-HIT | Wire bytes |
|---|---:|---:|---:|---:|---:|
| menu | 0 | 0 | 0 | 0 | 14089508 |
| town | 1 | 5 | 4 | 0 | 9597930 |
| contract1 | 0 | 0 | 15 | 0 | 35586615 |
| town-return | 2 | 4 | 4 | 0 | 10510256 |
| contract2 | 0 | 0 | 10 | 0 | 16161807 |

| URL | Prefetch bytes | Subsequent fetch bytes and bucket |
|---|---:|---|
| /assets/pilots/town-plate-3d/town-plate.glb | 8061791<br>8061791<br>8061791 | 8061791 (DOUBLE-DOWNLOAD)<br>8061791 (DOUBLE-DOWNLOAD) |
| /assets/pilots/tavern-3d/town-v3-tavern.glb | 912453<br>912453<br>0 | 127 (REVALIDATED)<br>912453 (DOUBLE-DOWNLOAD) |
| /assets/pilots/general-store-3d/general-store.glb | 1219823<br>1219823<br>0 | 127 (REVALIDATED)<br>127 (REVALIDATED) |
| /assets/pilots/claim-office-3d/claim-office.glb | 1227119<br>1227119<br>0 | 127 (REVALIDATED)<br>127 (REVALIDATED) |
| /assets/pilots/assay-office-3d/assay-office.glb | 1455399<br>1455399 | 127 (REVALIDATED)<br>127 (REVALIDATED) |
| /assets/pilots/chapel-3d/chapel.glb | 1212923<br>1212923 | 127 (REVALIDATED)<br>127 (REVALIDATED) |
| /assets/pilots/schoolhouse-3d/schoolhouse.glb | — | 1386543 (OVERLAP)<br>1386543 (OVERLAP) |
| /assets/pilots/plaza-props-3d/covered_wagon.glb | — | 54551 (OVERLAP)<br>54551 (OVERLAP) |
| /assets/pilots/plaza-props-3d/water_trough.glb | — | 34623 (OVERLAP)<br>34623 (OVERLAP) |
| /assets/pilots/plaza-props-3d/pan_monument.glb | — | 59787 (OVERLAP)<br>59787 (OVERLAP) |
| /assets/pilots/run3d/assay-bench.glb | — | 350301 (OVERLAP)<br>350301 (OVERLAP) |
| /assets/pilots/run3d/boiler-house.glb | — | 361601 (OVERLAP)<br>361601 (OVERLAP) |
| /assets/pilots/run3d/lantern-post.glb | — | 158577 (OVERLAP)<br>158577 (OVERLAP) |
| /assets/pilots/run3d/palisade.glb | — | 347977 (OVERLAP)<br>347977 (OVERLAP) |
| /assets/pilots/run3d/sluice.glb | — | 447333 (OVERLAP)<br>447333 (OVERLAP) |
| /assets/pilots/run3d/turret.glb | — | 419605 (OVERLAP)<br>419605 (OVERLAP) |
| /assets/pilots/run3d/stockpile.glb | — | 483305 (OVERLAP)<br>483305 (OVERLAP) |
| /assets/pilots/run3d/sentry-beacon.glb | — | 351905 (OVERLAP)<br>351905 (OVERLAP) |

## Production-headers detail

# Advance-stream cache reuse

Boot flags: `debug&timescale=24&nolevel&seed=advance-stream-walkthrough` · arm: production-headers · route interception: none · network emulation: none · project: mobile-chrome
Observed `cache-control` via CDP `Network.responseReceived`: `public, max-age=31536000, immutable`

| Door | DOUBLE-DOWNLOAD | REVALIDATED | OVERLAP | CACHE-HIT | Wire bytes |
|---|---:|---:|---:|---:|---:|
| menu | 0 | 0 | 0 | 0 | 5160996 |
| town | 0 | 0 | 0 | 10 | 0 |
| contract1 | 0 | 0 | 8 | 7 | 2884228 |
| town-return | 0 | 0 | 0 | 10 | 2722924 |
| contract2 | 0 | 0 | 0 | 15 | 0 |

| URL | Prefetch bytes | Subsequent fetch bytes and bucket |
|---|---:|---|
| /assets/town-plate-Bf7CMFbQ-diet-76f76035.glb | 910364<br>910364 | 0 (CACHE-HIT)<br>0 (CACHE-HIT) |
| /assets/town-v3-tavern-CXl1aOfB-diet-76f76035.glb | 294796<br>294796 | 0 (CACHE-HIT)<br>0 (CACHE-HIT) |
| /assets/general-store-Crb4mVFW-diet-76f76035.glb | 196224<br>196224 | 0 (CACHE-HIT)<br>0 (CACHE-HIT) |
| /assets/claim-office-CY6Ib5so-diet-76f76035.glb | 191908<br>191908 | 0 (CACHE-HIT)<br>0 (CACHE-HIT) |
| /assets/assay-office-xAW04uBp-diet-76f76035.glb | 249584<br>249584 | 0 (CACHE-HIT)<br>0 (CACHE-HIT) |
| /assets/chapel-DqOSe4LC-diet-76f76035.glb | 204068<br>204068 | 0 (CACHE-HIT)<br>0 (CACHE-HIT) |
| /assets/schoolhouse-BR3cnoTX-diet-76f76035.glb | 224688<br>224688 | 0 (CACHE-HIT)<br>0 (CACHE-HIT) |
| /assets/stamp-mill-CxhOFdRx-diet-76f76035.glb | 183464<br>183464 | — |
| /assets/dynamo-hall-D_Gc9RPJ-diet-76f76035.glb | 151904<br>151904 | — |
| /assets/covered_wagon-DoD5oKIb-diet-76f76035.glb | 14650<br>14650 | 0 (CACHE-HIT)<br>0 (CACHE-HIT) |
| /assets/water_trough-GmocFW04-diet-76f76035.glb | 10470<br>10470 | 0 (CACHE-HIT)<br>0 (CACHE-HIT) |
| /assets/pan_monument-DXhG2mKX-diet-76f76035.glb | 17314<br>17314 | 0 (CACHE-HIT)<br>0 (CACHE-HIT) |
| /assets/the-claim-terrain-CPmx4txo-diet-76f76035.glb | 966368 | 0 (CACHE-HIT) |
| /assets/the-claim-panorama-DkzE3d2l-diet-76f76035.glb | 86646 | 0 (CACHE-HIT) |
| /assets/active_headframe-DesxPCzn-diet-76f76035.glb | 293316 | 0 (CACHE-HIT) |
| /assets/maintained_claim_house-BiR5eTdl-diet-76f76035.glb | 301872 | 0 (CACHE-HIT) |
| /assets/working_camp-CfQdJbCn-diet-76f76035.glb | 295016 | 0 (CACHE-HIT) |
| /assets/claim_stake-BE40PHzn-diet-76f76035.glb | 282120 | 0 (CACHE-HIT) |
| /assets/riparian_dressing_pack-CBXMqPR1-diet-76f76035.glb | 286224 | 0 (CACHE-HIT) |
| /assets/assay-bench-Bjbx1XJa-diet-76f76035.glb | — | 51522 (OVERLAP)<br>0 (CACHE-HIT) |
| /assets/boiler-house-D9Un6OkB-diet-76f76035.glb | — | 58946 (OVERLAP)<br>0 (CACHE-HIT) |
| /assets/lantern-post-DBKwGdtm-diet-76f76035.glb | — | 29690 (OVERLAP)<br>0 (CACHE-HIT) |
| /assets/palisade-B4vjb3yv-diet-76f76035.glb | — | 86714 (OVERLAP)<br>0 (CACHE-HIT) |
| /assets/sluice-C0nN0uF0-diet-76f76035.glb | — | 60674 (OVERLAP)<br>0 (CACHE-HIT) |
| /assets/turret-DHjcPTUp-diet-76f76035.glb | — | 52678 (OVERLAP)<br>0 (CACHE-HIT) |
| /assets/stockpile-BGhyDRv3-diet-76f76035.glb | — | 66414 (OVERLAP)<br>0 (CACHE-HIT) |
| /assets/sentry-beacon-DBPVij-2-diet-76f76035.glb | — | 22494 (OVERLAP)<br>0 (CACHE-HIT) |
| /assets/dry-gulch-terrain-D6tl2kN--diet-76f76035.glb | 733500 | 0 (CACHE-HIT) |
| /assets/dry-gulch-panorama-BSQAYWzK-diet-76f76035.glb | 89858 | 0 (CACHE-HIT) |
| /assets/ruined_mining_operation-d-TxRCLW-diet-76f76035.glb | 340184 | 0 (CACHE-HIT) |
| /assets/abandoned_farmhouse-Ch77gdPW-diet-76f76035.glb | 339244 | 0 (CACHE-HIT) |
| /assets/cactus_thicket-zQRx8AM9-diet-76f76035.glb | 341804 | 0 (CACHE-HIT) |
| /assets/bison_skeleton-B36gdcOu-diet-76f76035.glb | 348524 | 0 (CACHE-HIT) |
| /assets/isolated_spring-Die-pcd1-diet-76f76035.glb | 335472 | 0 (CACHE-HIT) |
