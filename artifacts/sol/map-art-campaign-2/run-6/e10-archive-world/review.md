# Archive World — run 6 correction, 2026-09-22

**IMPROVED / HELD; full concept remains unaccepted.** An open two-pier library portal replaces the filled entry body. The black edge is replaced by a continuous ground apron; paving is quieter, and local warm pools appear only around already-restored wings.

| Original defect | Result |
| --- | --- |
| Entry gate fills the foreground | IMPROVED 1,128→888/3,000 triangles, exact old envelope and mount; two narrow piers replace the bridge-school slab, with a 7.64 m lower central opening and 69.81% less footing area. Entry on-screen body pixels fall 84,556→57,647 (−31.83%) desktop; phone pixels fall 88,699→36,901, partly because the piers remain clipped. The phone pixel decrease is not a full-silhouette success. |
| Terraces and stack depth disappear | IMPROVED a height-aware floor grade and brighter diffuse landmark paint retain the existing book shelves, columns and four flat build terraces. HELD broad layered facade scenery and ordinary-entry vista by terrain/composition/camera owners via Claude. The entry camera faces the southern perimeter from z=−52; the stack wings at z=−6 and +40 lie behind that view. Labelled exploration is not credited as entry visibility. |
| Repetitive paving dominates | IMPROVED fixed-region RMS −55.44% desktop / −50.11% phone, with half the original engraved surface retained. HELD large-scale engraved detail and more varied masonry by terrain-art owner; the floor still repeats. |
| Dark distant band obscures the vista | IMPROVED the existing continuation method now also covers Archive’s ground to 160 m, adding 5,120 decorative triangles with zero sampled height gap at the 128 m playfield boundary. The original panorama ridge remains separate. HELD the plate’s distant library skyline and full layered vista by panorama/composition owners. |
| Weak local warm light pools | IMPROVED localized floor light follows the existing restoredWingIds, never activating on unearned wings. A 0→west→all→none material-state test returns exactly [0,0,0]→[1,0,0]→[1,1,1]→[0,0,0], preserves its input, chains the existing render callback and disposes its test resources. The staged screenshots demonstrate material states only, not native restoration completion. HELD richer facade lighting and dramatic plate-scale pools by presentation/art owners. |
| Phone HUD obscures gate | IMPROVED entry persistent HUD coverage 27.663→15.794% (desktop 49.675→22.764%). HELD severe portrait framing/overlay conflict by camera/UI owners. The 10 m inspection fits the full bbox but still covers 68.719% of the gate’s visible body with HUD; no camera/HUD fix is claimed. |

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Independent critique](independent-review.md). Ordinary frames retain normal HUD and dialogue. A few trial stations are explicitly rejected below; their narrower on-screen mask does not excuse offscreen clipping.

Whole-body emission remains **0.45**, below 0.6. Gate entry body median **0.232→0.494 desktop / 0.220→0.438 phone**. At the declared 10 m inspection: **0.226→0.416 / 0.225→0.393**; all projected corners fit, desktop HUD **0.044→0.000%**, phone **40.552→68.719%**. This phone regression reflects removing central mass while keeping piers under existing side HUD panels, and remains explicitly unaccepted.

Other inspections use 3 m: west/east/warning/marker phone coverage **8.122% / 7.349% / 13.604% / 0.007%**. Those bboxes fit. Their same-body 5 m trial coverage was **15.412% / 15.290% / 22.252% / 0.815%**. The gate’s 3/5/8 m trial bboxes crop horizontally; 14 m crops vertically. No tested distance solves the gate’s phone framing and HUD simultaneously. [Final measurements](visual-metrics.json) · [Distance trials](station-distance-trials-metrics.json).

Clear-ground median **0.104→0.241 / 0.111→0.229**, RMS **0.02376→0.01059 / 0.02350→0.01172**; samples below 0.1 fall **43.41%→0% / 34.30%→0%**. The phone region sits below the temporary prospector hint; the earlier hint-contaminated trial ROI is rejected for terrain conclusions.

All four peer GLBs, all atlases, terrain/panorama assets, mounts, collision registry, sampler and gameplay contracts remain unchanged. The saved source re-exports all five GLBs byte-identically. The gate provenance now cites the actual Archive plate. Existing continuation behavior for Ember/Moth/other contracts is preserved by exact normalized function comparison; Archive is its sole additional consumer. No raster generation/editing occurred. Native objective status is unchanged.

The upper-edge clear regions brighten **0.071→0.226 desktop / 0.074→0.225 phone**, with pixels below 0.1 falling **100%→0%**. The earned-pool control holds restoration color fixed and disables only the new pool term: local ground median **0.247→0.395 (+60.01%)**. [Edge and isolated pool measurements](edge-pool-metrics.json). The four Archive contract/hold/ledger/wiring checks pass; the source proof does not grant or persist a wing.

Independent review confirms the open gate and attached teal details, with no definite broken attachment. It also records unresolved weak structural contact, simplified book/spine contrast and large uniform ground fields. The straight gray/brown wing edges belong to the existing `src/world/ArchiveRestoration.ts` state visualization, outside this task’s allowed files; its zone masks and grayscale remain unchanged. Those transitions are HELD by that presentation owner, while richer facade/contact work remains with the map-art owner via Claude.

The initial full distance-trial receipt was overwritten by the second capture before backup. Complete derived trial metrics and PNGs remain; the partial second receipt is kept in raw evidence, and the replacement trial index explicitly explains the limitation. Final station receipts are complete.

Final TypeScript/default/full builds and scoped render 34/34 / named 3/3 guards are recorded in their receipts. Own board/profile **2/2**, story **14/14**, full-registry simulation parity **2/2**, Archive contract/state node checks **4/4**, shared brightness/collision **16 pass / four opt-in skips**, loading **8/8**, repeat **2/2**, six dedicated mount/dispose cycles and all-five-source exports pass. The census and registry mount suites have **four exact-base failures**; [attribution](failure-attribution.md). Station metadata was finalized after behavioral checks; no rendered/gameplay field changed in that final metadata step.

Engine `0df7afdfb61520a896c158f0208e401731a733f465ab77a8fc4232bc495c65ba` → `9ab63072bf545c545e192f2a6d4623ccceb60235662638adb6f3c27736648cf5`; pin untouched.

Four quiet-host runs per arm/viewport: p95 medians **9.35→9.50 ms / 9.50→9.80 ms desktop/phone**, draws **72→73 / 51→52**, both within 15%. [Full distributions](performance-summary.json).

Store `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7` pushed on `astra/corrections-4`. READY-FOR-GATES for this bounded correction, with all full-concept holds explicit.
