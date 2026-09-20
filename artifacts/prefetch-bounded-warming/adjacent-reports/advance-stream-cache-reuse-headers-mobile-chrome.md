# Advance-stream cache reuse: dev vs production headers

Boot flags: `debug&timescale=24&nolevel&seed=advance-stream-walkthrough` · route interception: none · network emulation: none · project: mobile-chrome
Dev `cache-control` observed via CDP `Network.responseReceived`: `no-cache`
Production `cache-control` observed via CDP `Network.responseReceived` from Vite preview's native header option: `public, max-age=31536000, immutable`

| Door | Dev DOUBLE-DOWNLOAD | Dev REVALIDATED | Dev OVERLAP | Dev CACHE-HIT | Dev wire bytes | Production DOUBLE-DOWNLOAD | Production REVALIDATED | Production OVERLAP | Production CACHE-HIT | Production wire bytes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| menu | 0 | 0 | 0 | 0 | 13932064 | 0 | 0 | 0 | 0 | 4880370 |
| town | 5 | 1 | 4 | 0 | 9440486 | 0 | 0 | 2 | 8 | 3036296 |
| contract1 | 0 | 0 | 15 | 0 | 35427963 | 0 | 0 | 8 | 7 | 2920820 |
| town-return | 4 | 2 | 4 | 0 | 12799500 | 8 | 0 | 0 | 2 | 4273368 |
| contract2 | 0 | 0 | 10 | 0 | 19803039 | 0 | 0 | 8 | 2 | 4623884 |

## Dev-server detail

# Advance-stream cache reuse

Boot flags: `debug&timescale=24&nolevel&seed=advance-stream-walkthrough` · arm: dev-server · route interception: none · network emulation: none · project: mobile-chrome
Observed `cache-control` via CDP `Network.responseReceived`: `no-cache`

| Door | DOUBLE-DOWNLOAD | REVALIDATED | OVERLAP | CACHE-HIT | Wire bytes |
|---|---:|---:|---:|---:|---:|
| menu | 0 | 0 | 0 | 0 | 13932064 |
| town | 5 | 1 | 4 | 0 | 9440486 |
| contract1 | 0 | 0 | 15 | 0 | 35427963 |
| town-return | 4 | 2 | 4 | 0 | 12799500 |
| contract2 | 0 | 0 | 10 | 0 | 19803039 |

| URL | Prefetch bytes | Subsequent fetch bytes and bucket |
|---|---:|---|
| /assets/pilots/town-plate-3d/town-plate.glb | 7904347<br>7904347<br>7904347 | 7904347 (DOUBLE-DOWNLOAD)<br>7904347 (DOUBLE-DOWNLOAD) |
| /assets/pilots/tavern-3d/town-v3-tavern.glb | 912453<br>912453<br>0 | 127 (DOUBLE-DOWNLOAD)<br>912453 (DOUBLE-DOWNLOAD) |
| /assets/pilots/general-store-3d/general-store.glb | 1219823<br>1219823<br>0 | 127 (DOUBLE-DOWNLOAD)<br>1219823 (DOUBLE-DOWNLOAD) |
| /assets/pilots/claim-office-3d/claim-office.glb | 1227119<br>1227119<br>0 | 127 (DOUBLE-DOWNLOAD)<br>1227119 (DOUBLE-DOWNLOAD) |
| /assets/pilots/assay-office-3d/assay-office.glb | 1455399<br>1455399 | 127 (DOUBLE-DOWNLOAD)<br>127 (REVALIDATED) |
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
| menu | 0 | 0 | 0 | 0 | 4880370 |
| town | 0 | 0 | 2 | 8 | 3036296 |
| contract1 | 0 | 0 | 8 | 7 | 2920820 |
| town-return | 8 | 0 | 0 | 2 | 4273368 |
| contract2 | 0 | 0 | 8 | 2 | 4623884 |

| URL | Prefetch bytes | Subsequent fetch bytes and bucket |
|---|---:|---|
| /assets/town-plate-C90tsADa-diet-a9d5c9a0.glb | 879116<br>0<br>0 | 0 (CACHE-HIT)<br>879116 (DOUBLE-DOWNLOAD) |
| /assets/town-v3-tavern-CXl1aOfB-diet-a9d5c9a0.glb | 294796<br>0<br>0 | 0 (CACHE-HIT)<br>294796 (DOUBLE-DOWNLOAD) |
| /assets/general-store-Crb4mVFW-diet-a9d5c9a0.glb | 196224<br>0 | 0 (CACHE-HIT)<br>196224 (DOUBLE-DOWNLOAD) |
| /assets/claim-office-CY6Ib5so-diet-a9d5c9a0.glb | 191908<br>0 | 0 (CACHE-HIT)<br>191908 (DOUBLE-DOWNLOAD) |
| /assets/assay-office-xAW04uBp-diet-a9d5c9a0.glb | 249584<br>0 | 0 (CACHE-HIT)<br>249584 (DOUBLE-DOWNLOAD) |
| /assets/chapel-DqOSe4LC-diet-a9d5c9a0.glb | 204068<br>0 | 0 (CACHE-HIT)<br>204068 (DOUBLE-DOWNLOAD) |
| /assets/schoolhouse-BR3cnoTX-diet-a9d5c9a0.glb | 224688<br>0 | 0 (CACHE-HIT)<br>224688 (DOUBLE-DOWNLOAD) |
| /assets/stamp-mill-CxhOFdRx-diet-a9d5c9a0.glb | 1178038<br>0 | — |
| /assets/dynamo-hall-D_Gc9RPJ-diet-a9d5c9a0.glb | 1407370<br>0 | — |
| /assets/covered_wagon-DoD5oKIb-diet-a9d5c9a0.glb | 54578<br>0 | 0 (CACHE-HIT)<br>54578 (DOUBLE-DOWNLOAD) |
| /assets/water_trough-GmocFW04-diet-a9d5c9a0.glb | 0 | 34650 (OVERLAP)<br>0 (CACHE-HIT) |
| /assets/pan_monument-DXhG2mKX-diet-a9d5c9a0.glb | 0 | 59814 (OVERLAP)<br>0 (CACHE-HIT) |
| /assets/the-claim-terrain-CPmx4txo-diet-a9d5c9a0.glb | 966368 | 0 (CACHE-HIT) |
| /assets/the-claim-panorama-DkzE3d2l-diet-a9d5c9a0.glb | 518124 | 0 (CACHE-HIT) |
| /assets/active_headframe-DFnjayGK-diet-a9d5c9a0.glb | 293072 | 0 (CACHE-HIT) |
| /assets/maintained_claim_house-CHFZbLoB-diet-a9d5c9a0.glb | 301620 | 0 (CACHE-HIT) |
| /assets/working_camp-D0I4uygC-diet-a9d5c9a0.glb | 294784 | 0 (CACHE-HIT) |
| /assets/claim_stake-DlQCz6m--diet-a9d5c9a0.glb | 281888 | 0 (CACHE-HIT) |
| /assets/riparian_dressing_pack-93xutUyz-diet-a9d5c9a0.glb | 285976 | 0 (CACHE-HIT) |
| /assets/assay-bench-Bjbx1XJa-diet-a9d5c9a0.glb | — | 350328 (OVERLAP)<br>350328 (OVERLAP) |
| /assets/boiler-house-D9Un6OkB-diet-a9d5c9a0.glb | — | 361628 (OVERLAP)<br>361628 (OVERLAP) |
| /assets/lantern-post-DBKwGdtm-diet-a9d5c9a0.glb | — | 158604 (OVERLAP)<br>158604 (OVERLAP) |
| /assets/palisade-B4vjb3yv-diet-a9d5c9a0.glb | — | 348004 (OVERLAP)<br>348004 (OVERLAP) |
| /assets/sluice-C0nN0uF0-diet-a9d5c9a0.glb | — | 447360 (OVERLAP)<br>447360 (OVERLAP) |
| /assets/turret-DHjcPTUp-diet-a9d5c9a0.glb | — | 419632 (OVERLAP)<br>419632 (OVERLAP) |
| /assets/stockpile-BGhyDRv3-diet-a9d5c9a0.glb | — | 483332 (OVERLAP)<br>483332 (OVERLAP) |
| /assets/sentry-beacon-DBPVij-2-diet-a9d5c9a0.glb | — | 351932 (OVERLAP)<br>351932 (OVERLAP) |
| /assets/dry-gulch-terrain-DrNSfJzI-diet-a9d5c9a0.glb | 1457602 | 0 (CACHE-HIT) |
| /assets/dry-gulch-panorama-BSQAYWzK-diet-a9d5c9a0.glb | 520804 | 0 (CACHE-HIT) |
