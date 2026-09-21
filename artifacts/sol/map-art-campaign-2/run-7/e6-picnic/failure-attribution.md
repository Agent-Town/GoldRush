# Picnic — exact-base browser attribution

Final serial batch: **45 passed, 6 failed, 1 skipped**, both projects, one worker, 16.7 minutes. All six failures are the following three unchanged terrain-registry assertions, each on desktop and phone. Picnic opening/roster/census and both collision suites pass.

| Assertion | Candidate and exact-base fingerprint | Owner |
| --- | --- | --- |
| `terrain3d-registry.spec.ts:217` | expected 32,768 triangles, received 51,200; Twin Banks declares 51,200 in its existing contract | Terrain-registry fixture owner: the suite assumes one grid resolution across all maps |
| `terrain3d-registry.spec.ts:281` | expected `painted-underlay-alpha-rim`, received `opaque-sculpt-edge` | Terrain-registry fixture/presentation owner |
| `terrain3d-registry.spec.ts:362` | expected invalid GLB state `failed`, received `lite` | Terrain-registry fixture owner: the invalid-byte arm follows the LITE arm on the same profile |

All six selected assertions reproduced on code `823b06b1dce4b861be2fccf646245fc4cc864588` and store `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7`. The base engine hash exactly matches the pre-edit hash, `4374cdbfcb7631c86982f9439fb30583eb3eba1acbf70e1bcccaf8fb6e210b21`. The candidate was restored byte-for-byte and its engine hash rechecked. [Receipt](base-terrain-registry.json).

No assertion changed. These failures prevent an all-green claim for the broad file and remain outside this task’s edit firewall. The four target maps are covered directly by the map-specific mount/transform, walk/escape, plain-boot and performance probes.

An earlier interrupted batch is excluded: extracting HTML/tsconfig scratch files inside the watched checkout caused Vite to force a page reload. Its palisade and boot failures vanished on the complete stable rerun. The final batch ran after moving the scratch tree out and restarting/warming the server; no source or contract writes occurred during it.
