# Shared atlas lifecycle stops at stale production filenames

The outage-recovery desktop test fails at `shared-atlas-dedupe.spec.ts:94`, before the lifecycle evaluation: the census names five GLBs that do not exist in the current `dist/assets` directory. Expected `true`, received `false`. The trace confirms that the five-image group assertion at line 91 passed, while line 94 failed. Neither `lifecycle(...)` nor `runtime.dispose()` was evaluated. There are no lifecycle renderer counts to classify.

All five census filenames end in `-diet-a9d5c9a0.glb`; their current counterparts end in `-diet-1408f6b4.glb`. Their content-hash name segments are unchanged:

| Asset | Content-hash segment | Historical filename present | Current counterpart present |
| --- | --- | --- | --- |
| active_headframe | DFnjayGK | No | Yes |
| claim_stake | DlQCz6m- | No | Yes |
| maintained_claim_house | CHFZbLoB | No | Yes |
| riparian_dressing_pack | 93xutUyz | No | Yes |
| working_camp | D0I4uygC | No | Yes |

Static GLB parsing confirms that all five current counterparts contain the exact census image bytes: WebP, 271,074 bytes, SHA256 `bee54f1adcac334370f489399a85140158e78a82f29f002e349f8f0176e7caf8`. This proves the current failure is filename membership drift, not a measured loss of atlas sharing or disposal.

`vite.config.ts:23–28` derives the diet suffix from `asset-diet.mjs`, `asset-diet.manifest.json`, and `package-lock.json`. Direct hashing yields `1408f6b4` for both current and HEAD input bytes. The test, census, browser harness, AssetLoading, SharedAtlasPlugin, dispose utility, Vite config, and fingerprint inputs are all byte-identical to HEAD; exact SHA256 pairs are recorded in [shared-atlas-dedupe.json](shared-atlas-dedupe.json). This is source/fixture evidence, not a current HEAD browser reproduction.

The test boots `the-claim`. Its failure trace records no Baron-props, Railcar, Crawler, or production `/dist/assets/` GLB requests, and no page/console errors. The changed boss material paths do not participate in the failed filesystem assertion. Their disposal behavior remains a separate question; this failure provides no supported introduced resource-lifetime defect.

At this bounded recovery-log snapshot, only the production lifecycle case has a failure header in this file. The other three desktop residency artifacts written during recovery contain:

| Contract | Native/shared renderer textures | Native/shared landmark images | Native/shared landmark estimated bytes |
| --- | --- | --- | --- |
| the-claim | 58 / 54 | 5 / 1 | 27,962,026.67 / 5,592,405.33 |
| e2-hill-mine | 58 / 54 | 5 / 1 | 27,962,026.67 / 5,592,405.33 |
| e8-mare-claim | 54 / 50 | 5 / 1 | 27,962,026.67 / 5,592,405.33 |

All three artifact error/control-error arrays are empty. These observed records do not imply that the unfinished recovery suite is green. In the earlier collection, all four desktop cases failed before the test body because the server refused `/@vite/client`; mobile lifecycle reached this same line-94 filename mismatch. Those earlier errors must not be conflated with measured disposal counts.

No browser, test, build, source, asset, census, or production-output modification was performed for this triage. No baseline attribution is claimed.
