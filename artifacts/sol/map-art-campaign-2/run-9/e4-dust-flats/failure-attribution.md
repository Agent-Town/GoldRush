# Dust Flats browser failures — exact baseline replay

Candidate: 85 passed, 5 skipped, 20 failed across both projects. All 20 failing tests also fail with the exact code/store/engine base restored. Sixteen assertion/value fingerprints match exactly. Two Claim-horizon checks fail the same >8 predicate with slightly different sampled values. Two E5 arsenal checks fail opposite immediate weapon-toggle assertions, so they are explicitly **not exact-assertion matches**. Their test opens unchanged Deepwater Claim; neither Dust Flats GLB is a dependency of that scene.

The E5 test toggles at lines 57 and 59 and immediately reads cached diagnostics at lines 58/60. `Game.ts:2352` exposes `toggleWeapon()` without publishing diagnostics; the method at `Game.ts:9496` changes weapon state and returns without a diagnostic refresh. This is consistent with the observed stale-toggle phases; it is a static attribution, not a timing fix. The game/test owners retain the issue. No assertion or gameplay code was modified.

[Per-case candidate/base fingerprints](browser-failure-attribution.json) · [restoration receipt](base-failures.json). The receipt's original JSON was overwritten by an evidence filename collision, recovered from captured tool stdout, and candidate backup byte identity was rechecked. The parser now refuses to overwrite a restoration receipt; the separate fingerprints are in `baseline-failures.json`.

Builds and all 34 render + 3 named guards pass. An initial source-ledger guard caught extra metadata outside its fixed three-field schema. That metadata was removed from the shared ledger; provenance remains in the pack and source files. The corrected guard passes.
