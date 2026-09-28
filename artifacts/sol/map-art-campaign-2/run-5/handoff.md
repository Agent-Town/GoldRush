# Motor map correction passes stop after three maps

READY-FOR-GATES. Owner cap reached: Dust Flats, Long Road, Gusher County, in that order. No Boneyard work was started. This is a bounded correction delivery; all three maps remain IMPROVED / HELD for complete concept fidelity.

Code branch: `sol/map-art-campaign-2`, based on `19421c655efc2cf830f92d76bb7c3637e3a6861b`. Dust commit `f6eb64d1ba4fbbf777388e8eab1cdb162c81b6ec`; Long Road commit `c258a41dfe75e9500ce23d00f18b030a937c25a3`; Gusher County is this handoff's commit, titled `art: Gusher County — expose the actor and quiet the oil camp`. Store branch: `astra/corrections-3`, with all three per-map commits pushed. Neither main nor lane branch history was changed.

| Map | Result and evidence |
| --- | --- |
| [Dust Flats](e4-dust-flats/review.md) | IMPROVED ground RMS -79.89% desktop / -73.89% phone; roads follow the actual ring/corridors. FIXED primary inspection fit at 5 m: phone HUD 31.57% → 0.006%. HELD full loop, entry landmark context, central-derrick vista and outer-field dressing. |
| [Long Road](e4-long-road/review.md) | IMPROVED ground RMS -85.41% / -54.02%, apron -61.72%. FIXED the apron gap through a 97-vertex underlap and wagon inspection fit at 5 m. HELD road-to-horizon view, roadside-stop entry context, close wagon placement and remaining body art. |
| [Gusher County](e4-gusher-county/review.md) | IMPROVED actor occlusion 100% → 2.00% / 2.27%; camp red-body share 57.6% → 0%; ground RMS -44.27% / -38.98%. FIXED full camp inspection fit at 5 m. HELD phone entry crop, oil-channel/lease vista and connected pipe dressing. Iron paint is darker; no body luminance gain is claimed. |

All whole-body emission stays at 0.45, below 0.6. Every original defect clause, body luminance, projected bounds, normal-HUD boards, masks, triangle budgets and validation receipts is linked in the map reviews. Terrain heights, collision footprints, gameplay, camera, HUD and character assets are unchanged. The inherited E2–E10 table entries remain on one line.

## Camera/UI handoff via Claude

Inspection stations do not move the camera or entry spawn. They declare where the body can be assessed within the existing camera. Persistent masks exclude temporary story strips only; ordinary entry boards retain the full HUD and story cards.

| Map/body | Entry | Declared station |
| --- | --- | --- |
| Dust charting post | Phone completely offscreen, projected y -432.5 to -346.8; not 0% occlusion | 5 m: phone 0.006%, desktop 0%; 14 m comparison 31.57% phone |
| Long Road wagon | Phone 12.369% persistent coverage, x196.1–375.7 / y251.7–653.8; desktop 0% | 5 m: phone 0.011%, desktop 0%; 14 m comparison 27.35% phone |
| Long Road west stop | Entry stop beyond the visible framing | 5 m: phone 0.016%, desktop 0.084%; full bounds fit |
| Gusher camp | Phone 19.097%, bounds x-19.8–409.8 / y365.2–690.8, side crop; desktop 0%. Fraction rises from 13.523% because the visible body area shrinks | 5 m: phone 0.010%, desktop 0.006%; 14 m comparison 60.135% phone |
| Gusher outhouse / representative derrick | Full outer-field/lease context is absent at entry | 5 m: phone 0% / 0.180%, both fit |

Small values below 0.5% are mask/sway sampling noise. The named owner for the remaining framing and HUD work is the camera/UI owner via Claude. Contract/layout owner via Claude owns the central derrick/road horizon/oil-channel composition conflicts. The campaign art owner retains the explicitly unaccepted body/pipe/outer-field dressing gaps.

## Engine and store boundary

| Map | Engine before | Engine after | Store commit |
| --- | --- | --- | --- |
| Dust Flats | `fd5fb81fed8b9a783e33d43b7fce6068b74179c9c7c815bb774d830a0f01d2c9` | `f314eba93a1f7304139063ecef8cad5ab46806bce335058cefa4abcfb1ef00f3` | `d316da20c98b0f8bce1022bfdf9b3a25e212933a` |
| Long Road | `f314eba93a1f7304139063ecef8cad5ab46806bce335058cefa4abcfb1ef00f3` | `d9771424552e194e198257098a5c4e235d0101c5c9f063adf030d42fcd2ef0eb` | `0f6ef32c9ebb7652c6796b8ccda622a282e8ffca` |
| Gusher County | `d9771424552e194e198257098a5c4e235d0101c5c9f063adf030d42fcd2ef0eb` | `491f2a917b0e360fcaa1e0eda3ee5eb7ba840cc1cd9bf852e3d574d34350725d` | `b9597680a8c6eff78526b0c2af2cdc3f05b86f85` |

Each map has four timing runs per arm/viewport, all in a comparable single mode and within 15%. Median p95 desktop / phone: Dust 9.30→9.25 / 9.50→9.20 ms; Long 8.80→8.85 / 9.00→8.90; Gusher 9.35→9.25 / 8.80→8.75. Draws stay unchanged at 77/52, 59/49 and 73/54 respectively; all authored triangle caps pass.

TypeScript/default/full builds pass for each map. Required shared brightness/collision, loading/repeat, 34 render guards and three named guards pass. Dust's six deterministic Motor failures reproduce on exact base; its story timeout passes final retry. Long's four focused checks pass. Gusher's original panorama regression was ours, reproduced green on base, then corrected: final panorama matrix passes. Its isolated errand retry passes 2/2 after a navigation-context failure. No protected assertion changed. Detailed results are in each map's failure/gate receipts; no gameplay-completion status was changed.

The full node battery and engine pin remain the drain's. The requested `run-guards --changed-since` invokes that full battery unconditionally (`scripts/run-guards.mjs:107-113`), so the scope conflict is HELD for the drain, as in run 4. Scoped guards are not claimed as the full selector green. The stale atlas-census failure is attributed on the campaign base in Dust's receipt.

Tracked PNG churn was restored by exact filename. Newly generated gate screenshots and their check receipt were preserved under `_raw`, as recorded in [final-churn.json](final-churn.json); no raw evidence was deleted or staged. Only the pre-existing permitted `logs/guard-stats.jsonl` remains outside the delivery. The owned port-5303 server is stopped at closeout.

## Last Claim judgment and continuation

My Last Claim verdict is still UNACCEPTED. The retained entry evidence shows a fallback surface without the circular orbital deck, central orrery, ornate rim or three preserve stations. Portrait supplies no architectural landmark. A proper sculpt pack remains required; this capped run does not revisit its art.

Continue in this exact order:

1. The Boneyard — `e4-boneyard`
2. The Glow Mesa — `e6-glow-mesa`
3. Half-Life Hollow — `e6-half-life-hollow`
4. The Picnic — `e6-picnic`
5. The Dead Band — `e7-dead-band`
6. Relay Rush — `e7-relay-rush`
7. The Far Side — `e8-far-side`
8. Low Orbit — `e8-low-orbit`
9. The Dome Basin — `e9-dome-basin`
10. The Seed Run — `e9-seed-run`
11. Devil's Alley — `e9-devils-alley`
12. The Old Canal — `e9-old-canal`
13. The Last Claim — `e10-last-claim`

After those, the held extras remain in order: Ember Shore (terrain/titan), Archive World (entry gate/terraces), River (render half only; no fallback alias or contract/finale decision).
