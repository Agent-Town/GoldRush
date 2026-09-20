# Dust Flats — run 5 correction

IMPROVED / HELD. The candidate is less wrong on ground readability; it does not reproduce the plate's industrial vista.

| Original defect | Result |
| --- | --- |
| Coarse high-contrast painted ground | IMPROVED — fixed-region display-RGB RMS 0.08238 → 0.01657 (-79.89%) desktop; 0.07919 → 0.02068 (-73.89%) phone. Original atlas contribution remains 22%, with quiet earth pigment and small grain rather than enlarged machinery as the dominant ground signal. |
| Oversized dark forms | IMPROVED — broad baked road cuts lose their near-black dominance. Existing tar locations remain dark local stains. No body, collision volume or terrain vertex was scaled. |
| Road loop | IMPROVED locally — pale shoulders and paired ruts follow the four published road corridors and existing 24 m ring, including its authored wobble. The full circle exceeds the entry camera footprint; full-loop vista HELD for camera/layout owner via Claude. |
| Derrick group | HELD — the contract puts twelve harvest claims in the outer fields and starts the Motor Camp empty; the plate's occupied central cluster conflicts with that geometry. Contract/layout owner via Claude. Actual outer-field derrick dressing remains a campaign art gap, not accepted by this pass. |
| Open desert spacing | IMPROVED by quieter intervening ground; no mount/build-field spacing changed. Full sparse service-chain vista remains HELD for camera/layout and subsequent art. |
| Portrait context | HELD — the charting post is offscreen at entry (projected y -432.5 to -346.8). This is not counted as zero HUD obstruction. At its newly declared 5 m inspection station only, full phone bounds fit x46.3–343.7 / y240.6–453.7 and persistent coverage falls 31.57% at the 14 m comparison to 0.006%; desktop 0% at 5 m. UI/camera owner via Claude owns entry framing; story/HUD unchanged. |

[Desktop plate and plain before/after](board-1280.png) · [Phone plate and plain before/after](board-390.png) · [Masks and numerical metrics](visual-metrics.json). Plain boots use the same seed, 1280×800/390×844, DPR 1, timeAlive 10 seconds, normal HUD and no debug/test hook; every final boot has zero console/page errors. Frozen diagnostics and station masks are labelled separately. Persistent masks retain normal HUD panels, world notes and touch controls; temporary story strips are excluded only from that diagnostic mask. Differences below 0.5% are sampling/sway noise, not a material HUD obstruction.

Whole-body emission stays 0.45. All geometry, atlases, source blends, footprints, mount transforms and gameplay remain unchanged. Only the charting-post inspection declaration changes in both mirrored art contracts. Ground pigment eases back to the original edge paint before meeting the unchanged panorama. Terrain 32,768/60,000 triangles; panorama 2,688/4,000; all five bodies remain under 3,000. [Budget audit](asset-budgets.json) · [Invariants](invariants.json).

TypeScript/default/full builds pass. Own batch: 29 pass / 7 initial failures; six failures reproduce on exact base and the remaining story-beat timeout passes its final 2/2 candidate retry. Shared brightness/collision: 16 pass / 4 optional skips. Loading/repeat: 8/8 and 2/2. Render guards: 34/34; named guards: 3/3. Atlas-census filename failure also reproduces on exact base. No assertion changed. [Failure fingerprints](failure-attribution.md) · [Exact-base engine/source restoration](base-own.json) · [Build receipts](build-gates.json) · [Node checks and changed-since scope conflict](node-gates.json). The changed-since selector invokes the drain-only full battery, so its complete green remains HELD for the drain.

Four fresh runs per arm/viewport remain in one timing mode: median p95 9.30 → 9.25 ms desktop (-0.54%), 9.50 → 9.20 ms phone (-3.16%). Draws remain 77 / 52; rendered triangles remain 98,332 / 97,216. [All frame samples and mode comparison](performance-summary.json).

Engine `fd5fb81fed8b9a783e33d43b7fce6068b74179c9c7c815bb774d830a0f01d2c9` → `f314eba93a1f7304139063ecef8cad5ab46806bce335058cefa4abcfb1ef00f3`; pin unchanged. Store commit `d316da20c98b0f8bce1022bfdf9b3a25e212933a` is on `astra/corrections-3`.
