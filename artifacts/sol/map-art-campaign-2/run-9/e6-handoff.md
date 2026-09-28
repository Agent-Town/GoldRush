# E6 fidelity — ready for the drain

2026-09-23. **READY-FOR-GATES. Remaining E6 list: none.** Game branch `sol/map-art-campaign-2`; store branch `astra/fidelity-2`. Main and engine pin were not modified. No E1 payload work applies to this leg.

| Map | Quoted art clause and result | Evidence |
| --- | --- | --- |
| Glow Mesa | SKIPPED: latest run-6 review has no art-owned HELD clause and no independent-review file. No art/code change. | [Run note](e6-run-note.md) |
| Half-Life Hollow | “Its present stylized clock frame remains less architectural than the plate; this is not full gate-art acceptance.” IMPROVED architectural arch 508→1,956/3,000; station luminance 0.25196→0.29684 desktop/0.25280→0.29195 phone. Phone HUD 0.165746→0.065006%; desktop small increase disclosed. Materials/contact/full fidelity HELD. | [Review, boards and checks](e6-half-life-hollow/review.md) |
| Picnic | “The existing large cross-shaped ground shadow and primitive prop forms remain visible in the board; no full art-fidelity claim.” FIXED cross marks; IMPROVED props (2,480/1,888/1,960 of 3,000), ground RMS −43.96%/−29.56% versus own run 6. Emission 0.45, exact envelopes/authorities; full material/contact/entry/UI/gathering HELD and small HUD rises disclosed. | [Review, boards and checks](e6-picnic/review.md) |

| Map | Engine before | Engine after | Pushed store commit |
| --- | --- | --- | --- |
| Glow Mesa | `49242d1713cb1c67838adc284919b18f067b4efad6ea61a61b42cba95bdfd731` | same, skipped | none |
| Half-Life Hollow | `49242d1713cb1c67838adc284919b18f067b4efad6ea61a61b42cba95bdfd731` | `083530624944acf74fd7beb888149f7dc017721185f8398be1b7eefec2e14ca6` | `92db3dc4f87789f976b7c310b7adb7372f8c5c30` |
| Picnic | `083530624944acf74fd7beb888149f7dc017721185f8398be1b7eefec2e14ca6` | `e7c87a88d08517d84983d408a876cfa994068807fa51b3c54ee96bbe24710e32` | `9e33801ab1a2f2349fce6929f576a81a6611a7e2` |

Hollow game commit `d3e30384225b8a3d332693d5dcf567286a7bfdfc`, supplemental gate-timing evidence `a14029b7a` (required files were initially hidden by the repository's `gate-*/` ignore rule, then explicitly force-added). Picnic is the `art: refine Picnic props and remove painted cross marks` commit carrying this handoff. Every map's store proof is in its evidence directory. Store changes are committed separately from game evidence; no raw scratch or unrelated churn is included.

Both changed maps pass TypeScript/default/full builds, 34+3 scoped guards, loading 8/8 and repeat 2/2. Picnic additionally passes the mirror check and six texture/mount/dispose cycles. Hollow browser 51 pass/5 skips/4 failures reproduced on the exact base (3 exact fingerprints); Picnic 51 pass/5 skips/4 failures reproduced on the exact base (2 exact fingerprints). All reported failures reproduce on each map's exact baseline and candidate restoration is verified. No assertions, null floors, simulation, heights, masks, footprints, mounts or stations changed. Full node battery and final pins remain drain-owned.

Four fresh boots per arm/viewport for both entry and changed-body views, all samples retained and all pairs within 15%. Runtime bytes: Hollow +92,996 B; Picnic +11,804,162 B raw source bytes, not transfer measurements. [Picnic host-context caveat](e6-picnic/host-context.json) records another attended-drain browser on the shared host.

Rejected iterations are disclosed, never counted as acceptance proof. Two native image originals and prompts live under store `sources/e6-picnic-fidelity-2/`; no paid image API. E7/E8/E9 are separate epoch legs and were not touched.
