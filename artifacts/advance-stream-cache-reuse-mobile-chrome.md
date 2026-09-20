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
