# Advance-stream cache reuse

Boot flags: `debug&timescale=24&nolevel&seed=advance-stream-walkthrough` · arm: dev-server · route interception: none · network emulation: none · project: desktop-chrome
Observed `cache-control` via CDP `Network.responseReceived`: `no-cache`

| Door | DOUBLE-DOWNLOAD | REVALIDATED | OVERLAP | CACHE-HIT | Wire bytes |
|---|---:|---:|---:|---:|---:|
| menu | 0 | 0 | 0 | 0 | 18052922 |
| town | 2 | 8 | 0 | 0 | 16550002 |
| contract1 | 2 | 0 | 13 | 0 | 35427963 |
| town-return | 8 | 2 | 0 | 0 | 25946082 |
| contract2 | 1 | 1 | 8 | 0 | 19282389 |

| URL | Prefetch bytes | Subsequent fetch bytes and bucket |
|---|---:|---|
| /assets/pilots/town-plate-3d/town-plate.glb | 7904347<br>7904347<br>7904347 | 7904347 (DOUBLE-DOWNLOAD)<br>7904347 (DOUBLE-DOWNLOAD) |
| /assets/pilots/tavern-3d/town-v3-tavern.glb | 912453<br>912453<br>0 | 127 (DOUBLE-DOWNLOAD)<br>912453 (DOUBLE-DOWNLOAD) |
| /assets/pilots/general-store-3d/general-store.glb | 1219823<br>1219823<br>0 | 127 (REVALIDATED)<br>1219823 (DOUBLE-DOWNLOAD) |
| /assets/pilots/claim-office-3d/claim-office.glb | 1227119<br>1227119<br>0 | 127 (REVALIDATED)<br>1227119 (DOUBLE-DOWNLOAD) |
| /assets/pilots/assay-office-3d/assay-office.glb | 1455399<br>1455399 | 127 (REVALIDATED)<br>127 (REVALIDATED) |
| /assets/pilots/chapel-3d/chapel.glb | 1212923<br>1212923 | 127 (REVALIDATED)<br>127 (REVALIDATED) |
| /assets/pilots/schoolhouse-3d/schoolhouse.glb | 1386543 | 127 (REVALIDATED)<br>1386543 (DOUBLE-DOWNLOAD) |
| /assets/pilots/plaza-props-3d/covered_wagon.glb | 54551 | 127 (REVALIDATED)<br>54551 (DOUBLE-DOWNLOAD) |
| /assets/pilots/plaza-props-3d/water_trough.glb | 34623 | 127 (REVALIDATED)<br>34623 (DOUBLE-DOWNLOAD) |
| /assets/pilots/plaza-props-3d/pan_monument.glb | 59787 | 127 (REVALIDATED)<br>59787 (DOUBLE-DOWNLOAD) |
| /assets/pilots/map-rebuild-spike/the-claim-terrain.glb | 8126415 | 8126415 (DOUBLE-DOWNLOAD) |
| /assets/pilots/map-rebuild-spike/the-claim-panorama.glb | 518097 | 518097 (DOUBLE-DOWNLOAD) |
| /assets/pilots/run3d/assay-bench.glb | — | 350301 (OVERLAP)<br>350301 (OVERLAP) |
| /assets/pilots/run3d/boiler-house.glb | — | 361601 (OVERLAP)<br>361601 (OVERLAP) |
| /assets/pilots/run3d/lantern-post.glb | — | 158577 (OVERLAP)<br>158577 (OVERLAP) |
| /assets/pilots/run3d/palisade.glb | — | 347977 (OVERLAP)<br>347977 (OVERLAP) |
| /assets/pilots/run3d/sluice.glb | — | 447333 (OVERLAP)<br>447333 (OVERLAP) |
| /assets/pilots/run3d/turret.glb | — | 419605 (OVERLAP)<br>419605 (OVERLAP) |
| /assets/pilots/run3d/stockpile.glb | — | 483305 (OVERLAP)<br>483305 (OVERLAP) |
| /assets/pilots/run3d/sentry-beacon.glb | — | 351905 (OVERLAP)<br>351905 (OVERLAP) |
| /assets/pilots/map-rebuild-spike/dry-gulch-terrain.glb | 8457311 | 8457311 (DOUBLE-DOWNLOAD) |
| /assets/pilots/map-rebuild-spike/dry-gulch-panorama.glb | 520777 | 127 (REVALIDATED) |
