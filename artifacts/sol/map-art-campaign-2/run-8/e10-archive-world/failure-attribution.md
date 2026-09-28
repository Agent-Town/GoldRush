# Archive World — exact-base failures

The full own-spec batch is **35 pass / 8 fail / 1 skip**. Every failure occurs on the exact pre-map code `ec786009689270ebe6f5954f0d8ec1a9ce8afa91` and store `75bdd35936c531da53094eaee94503b71ea1ea7f`, with the same fingerprints in both browser projects:

- Archive census line138: expected undefined seeds, received `e10-archive-world-01` and `e10-archive-world-02`.
- The Claim registry line217: expected 32,768 triangles, received 51,200.
- Registry line281: expected `painted-underlay-alpha-rim`, received `opaque-sculpt-edge`.
- LITE fallback line362: expected `failed`, received `lite`.

[Exact-base replay, source/asset hashes and command](base-own-final.json). Added assets are absent during the replay; base engine matches the pre-map receipt. Candidate engine restores exactly. Tests and assertions remain unchanged. These failures remain with the census/registry owners; no all-green browser claim.
