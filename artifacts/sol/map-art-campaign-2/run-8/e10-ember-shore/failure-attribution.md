# Ember Shore — exact-base attribution

The full existing terrain registry file reports **13 pass / 6 fail / 1 skip** on the candidate. The same six selected cases fail on exact code base `70f67c0ae47714a8db14f877940d6a98b4aeb900` and store `f3078c4001d86b8f177a1f1727464c32bdc166bb`, with the same fingerprints in both browser projects:

- The Claim mount census: expected 32,768 triangles, received 51,200, line 217.
- The Claim skirt probe: expected `painted-underlay-alpha-rim`, received `opaque-sculpt-edge`, line 281.
- LITE fallback: expected `failed`, received `lite`, line 362.

[Exact source/asset hashes, invocation and restoration receipt](base-registry-final.json). The reproduced base engine is `c72f302925f627b0a783f8d44bd132ed1fa61ae737379454a746e1033e1adfeb`; restoring every candidate byte yields the original candidate engine exactly. Added sources and the native image were absent during the replay. No assertions changed. These registry owners retain the failures; this map does not claim the full browser battery green.
