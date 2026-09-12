# Boss models preserve identity but lose the art's defining shapes

Date: 2026-09-08. Review base: `d41ab98ce`. Branch: `sol/boss-art-fidelity-review`.
Scope: read-only art, asset and runtime investigation requested by Robin. No models, source code, canon, specs, or game balance changed.

**Verdict: substantial improvement is possible. The next pass should correct specific shapes and surface treatment, rather than uniformly increase polygon counts.**

[Open the seven-boss comparison gallery](../artifacts/boss-art-fidelity-2026-09-08/index.html). Each entry links its full raw illustration, freshly rendered current GLB, second angle and exact asset. [Source hashes](../artifacts/boss-art-fidelity-2026-09-08/asset-manifest.json) and [binary inspection](../artifacts/boss-art-fidelity-2026-09-08/glb-inspection.json) pin what was examined.

## What was actually compared

The target is preservation of the modeling reference's recognizable silhouette, dominant proportions, mechanical purpose, material hierarchy and story states in a freely rotating game asset. Exact pixel matching would be misleading: the illustrations use different perspectives and lighting, contain atmospheric linework and sometimes conflicting mechanical detail, and do not provide complete orthographic surfaces.

I inspected the seven authored machine GLBs, their actual raw modeling references, existing turntables and state boards, Blender construction/UV code, current loaders and state transforms. I then imported the current binaries into Blender 5.1.2 and made fourteen new neutral views without rebuilding the assets. A separate unprimed visual reviewer examined the original reference/turntable pairs and independently identified the same large-shape problems.

The neutral views preserve original GLB materials and default morph weights. They use fixed neutral studio lighting and fit each object to the frame. They establish geometry and surface evidence, not the appearance of production lighting. The source illustration and studio image are not a camera-matched pair, so there is no claimed percentage fidelity or pixel-difference score.

| Boss | Raw modeling reference in `assets/raw/` | Actual GLB in `assets/pilots/` | Triangles | Current game use |
|---|---|---|---:|---|
| Armored Railcar | `plate-e2-boss-component.png` | `railcar-3d/railcar.glb` | 10,948 | Loaded by `src/entities/pools.ts:53` |
| Dynamo Crawler | `plate-e3-boss-dynamo-crawler.png` | `crawler-3d/crawler.glb` | 11,980 | Loaded by `src/systems/CrawlerBossSystem.ts:12` |
| Land Yacht | `boss-land-yacht.png` | `land-yacht-3d/land-yacht.glb` | 10,632 | **Created but not loaded** |
| Dredge Queen | `boss-dredge-queen.png` | `dredge-queen-3d/dredge-queen-detail-opus5.glb` | 33,124 | Loaded by `src/systems/DredgeQueenBossSystem.ts:17` |
| Homemaker-9000 | `plate-e6-boss-homemaker-9000.png` | `homemaker-9000-3d/homemaker-9000.glb` | 7,644 | Loaded by `src/systems/HomemakerBossSystem.ts:28` |
| Salvage King's Claw | `boss-salvage-claw.png` | `salvage-claw-3d/salvage-claw-detail-opus5.glb` | 30,100 | Loaded by `src/systems/SalvageClawBossSystem.ts:16` |
| Old Digger | `boss-old-digger.png` | `old-digger-3d/old-digger.glb` | 7,192 | Loaded by `src/systems/OldDiggerBossSystem.ts:14` |

All seven binaries have one material, three component meshes except Queen's four, and zero animation clips. Counts come from their current glTF accessors, not the README claims.

Queen and Claw already received a detail upgrade and an owner-confirmed selection in July (`reviews/boss-detail-adoption.md:8-18`). Their original and Sol alternative GLBs remain archived in place. This review uses the adopted Opus models. The later Queen, Claw and Digger modeling references also differ from the earlier `plate-e*` saga illustrations; judging them solely against those older plates would conflate a changed design with a modeling error.

## Findings, ranked by useful next action

### F-BF-01 — Homemaker needs its rounded silhouette back

**High confidence; best first remodeling pilot.** The reference depicts a domed, cylindrical appliance with a flared teal skirt, a distinct cream apron, an inset illuminated lens, and an enormous flexible vacuum hose. The model's body is a beveled rectangular cabinet. Its skirt is a flat lower panel; the lens reads as a solid orange disc; the hose is a narrow angular strip leading to a slab-shaped head. The top rack exists but loses the reference's arched metal-and-glass enclosure treatment.

These differences remain clear in the fresh neutral three-quarter view and all four historical views. Lighting cannot turn the cabinet into a dome or restore the missing silhouette of the apron and hose.

**Improve:** reshape the existing body into the rounded pressure vessel, restore the flared skirt/apron, build a deeply inset layered lens, and give the hose and vacuum head their dominant curved volumes. Preserve the existing cleaning-machine character and the three state components. Do not spend the first pass adding tiny rivets to the cabinet.

[Comparison](../artifacts/boss-art-fidelity-2026-09-08/homemaker-comparison.png) · source `assets/pilots/homemaker-9000-3d/build_homemaker_9000.py:19` · loader `src/systems/HomemakerBossSystem.ts:613-638`.

### F-BF-02 — Salvage Claw's most characteristic shapes are undersized

**High confidence; largest identity gain on an already upgraded boss.** The illustration's enormous suspended crescent grapples, exposed hanging winch machinery and rising central spires define a floating salvage fortress. The current model's modest three-toed anchor feet, dark cylindrical underside and broad domed pavilion shift its read toward a walking turret. The detail pass added real spires and pendants, but did not recover the dominant claw-to-platform relationship.

**Improve:** enlarge and curve the grapple silhouettes, deepen and expose the hanging machinery, and restore a stronger vertical hierarchy in the crown. Preserve the gameplay's anchor arrangement and landing states; the number of claws visible in one illustration is not sufficient evidence to rewrite the encounter. Review both airborne and landed states.

There is a known implementation trap: enlarging the feet changes the bounding dimension used to normalize the whole model. Its existing author explicitly recorded this unresolved limitation (`assets/pilots/salvage-claw-3d/salvage-claw-detail-opus5-report.md:12-14`). Fix proportions inside a deliberate overall envelope rather than allowing the normalizer to shrink the crown accidentally.

[Comparison](../artifacts/boss-art-fidelity-2026-09-08/salvage-claw-comparison.png) · current loader `src/systems/SalvageClawBossSystem.ts:522-550`.

### F-BF-03 — Old Digger loses the scale cues of an industrial complex

**High confidence.** The twin wheel arrangement and gantry survive, but the reference's deep bucket rims, heavy conveyor trusses, substantial tracked base, multi-level central machinery and towers become thin toothed discs around a small central cart. The fresh render is well lit, so the missing mass is not an artifact of the dark historical board.

**Improve:** give the bucket wheels real depth and bucket cavities, thicken the conveyor structures into machinery-bearing volumes, and rebuild the central vertical stack with a few large industrial forms. Prioritize these over denser engraving. Retain the crossed-pickaxes crest and readable amber-to-teal heart.

This is a redemption asset. Its gentle state must keep it intact and usable, with the safe rails/boarding steps and corrected working parts; it must not acquire a destruction or wreck state. People deliberately do not live inside this GLB.

[Comparison](../artifacts/boss-art-fidelity-2026-09-08/old-digger-comparison.png) · state contract `assets/pilots/old-digger-3d/README.md:5-10` · loader `src/systems/OldDiggerBossSystem.ts:589-624`.

### F-BF-04 — Dredge Queen is a good foundation with specific remaining gaps

**High confidence for major forms.** The adopted model has a recognizable hull, curved grab, lattice derrick and detailed paddle wheels. The reference still carries much more architectural weight: a taller domed wheelhouse, a substantial armored hold, a broader vessel, secondary rigging and cloth with convincing torn edges. The current hold reads as a box, the wheelhouse as a small dome, and the large sail as a stiff panel.

**Improve:** concentrate on wheelhouse mass and windows, armored hold shape, paddle sponson/hull width, and the sail's silhouette and surface. Inspect both sides before declaring ornament or a wheel absent: the fresh view shows a crossed-tool sail structure that is weak or hidden in other angles. Some apparent part counts in the illustration are ambiguous and should not be treated as mechanical requirements.

The previous author independently recorded the abstract wheelhouse/hold and the narrower beam (`assets/pilots/dredge-queen-3d/dredge-queen-detail-opus5-report.md:9-14`). Another indiscriminate detail increase would repeat that unfinished work.

[Comparison](../artifacts/boss-art-fidelity-2026-09-08/dredge-queen-comparison.png) · current asset import `src/systems/DredgeQueenBossSystem.ts:17-18`.

### F-BF-05 — Land Yacht has both a modeling gap and an adoption gap

**Confirmed runtime fact:** `src/systems/LandYachtBossSystem.ts:11-17,77-86,338-353` loads raw plate textures and builds `LandYacht.PlaceholderPlateCrops`. No source file imports `land-yacht.glb`. The authored model's README calls it production, but changing that GLB alone would currently change nothing in play.

**High-confidence visual gap in the created model:** the immense wheeled ship becomes a compact wagon: small spoked wheels, a shallow rectangular platform, a reduced bridge, and a solid suspended grab shape where the art has an open articulated grapple.

**Improve:** restore wheel-to-hull scale, hull depth, the layered bridge and open claw; then adopt it through the existing boss component presentation. Treat wiring as an explicit follow-up with its own evidence, rather than assuming the asset is already live.

[Comparison](../artifacts/boss-art-fidelity-2026-09-08/land-yacht-comparison.png). This review does not claim to have captured a running Land Yacht GLB.

### F-BF-06 — Crawler needs electrical machinery, not just more small parts

**High confidence after fresh asset inspection.** Boiler, mast and bank placement convey the right machine. The towering ribbed coil bank becomes short canisters; the mast's stacked insulators become sparse large beads; running gear and pipes lose the reference's weight. The top and side silhouettes are simpler than the plate even when camera compression is removed.

**Improve:** taller ribbed coil stacks with connected pipes, a more articulated insulator mast, and stronger visible drive gear. Keep the three component identities legible from the run camera. This model already has 11,980 triangles against its documented original 12,000 ceiling, so a substantial geometry pass needs a deliberately revised budget rather than an unnoticed overflow.

[Comparison](../artifacts/boss-art-fidelity-2026-09-08/crawler-comparison.png) · contract `assets/pilots/crawler-3d/README.md:9-19`.

### F-BF-07 — Railcar is the closest match and can receive a focused finish pass

**High confidence on feature simplification; moderate on perspective-dependent proportions.** The locomotive silhouette, cowcatcher, boiler, cab and connecting rods all read. The reference's armored/louvered cab, heavy driving wheels, underbody cylinder, rear platform and layered platework are reduced or absent. It retains the generic locomotive more strongly than the distinctive siege locomotive.

**Improve:** restore the cab's armored openings, strengthen running gear and underbody masses, and organize the panel/brass hierarchy. Preserve its rail fit and boss-bar height assumptions. Do not lengthen the vehicle just to match an unmatched illustration camera.

[Comparison](../artifacts/boss-art-fidelity-2026-09-08/railcar-comparison.png) · rail/bar anchoring `src/entities/pools.ts:43,1416-1422,1627-1639`.

### F-BF-08 — The shared texture recipe preserves palette, not surface fidelity

**Confirmed construction fact.** These models were constructed by Blender scripts that interpret the plates. They are not literal image-to-3D reconstructions. The shared approach samples colors from the painting, creates general engraved/noisy/striped material regions, automatically projects each part, then fits its UVs into those regions. See `assets/pilots/dredge-queen-3d/build_dredge_queen_detail_opus5.py:79-165` and `detail_opus5_kit.py:586-605`.

That is why brown patterned surfaces can occur everywhere while the specific metal panels, glass lenses, ornamental relief and cloth of the painting do not. In the fresh neutral renders, several trims and mechanical discs read as pale wood or clay. The actual Queen, Homemaker, Claw and Digger materials all set metalness to 0 and roughness to approximately 0.9, with no normal or occlusion map declared in the inspected material. This is a deliberate painted setup, but it gives little independent response to iron, brass, glass and cloth.

**Improve after shape:** map a few important surfaces deliberately (lens, boiler plates, wheel rims, crown, cloth) and introduce controlled variation in roughness/metalness plus selective relief where it reads at game distance. One material can still carry those maps; many separate material slots are unnecessary. Keep the illustrated style instead of turning the machines into photoreal chrome.

### F-BF-09 — Production presentation can hide the work

**Confirmed source behavior; visual impact observed, causality not isolated by an A/B test.** Crawler, Queen, Homemaker and Digger copy their albedo map into the emissive channel and apply strong whole-component emission (intact values 1.8–2, state values up to 3). See `CrawlerBossSystem.ts:454,490`, `DredgeQueenBossSystem.ts:589,618`, `HomemakerBossSystem.ts:634,650`, and `OldDiggerBossSystem.ts:610,624`. Claw does not apply this override. This was introduced for readability and state signaling; simply removing it could harm night play.

Fresh desktop diagnostic captures verify that Queen, Homemaker and Claw load their current GLBs in full tier with zero collected console/page errors. The Queen's labels obscure meaningful parts of the model and its surfaces read as a broad gold/brown field. The initial Homemaker view is largely obscured by terrain/pictogram; the initial airborne Claw crown lies above the frame. These are limitations of those exact diagnostic spawn/camera conditions, not proof that every normal encounter is framed this way.

**Improve/test separately:** compare selective lighting/emission with the existing night-read baseline and inspect state labels and camera framing before judging a new sculpt. New geometry that is hidden behind a label or outside the camera will not help the player. Keep full screenshots alongside any unobstructed crops; never hide the presentation problem in evidence.

[Initial runtime evidence](../artifacts/boss-art-fidelity-2026-09-08/runtime/report.json). A second bounded pass produced a useful [landed Claw view](../artifacts/boss-art-fidelity-2026-09-08/runtime/salvage-claw-landed.png) and an [arrived Homemaker view](../artifacts/boss-art-fidelity-2026-09-08/runtime/homemaker-visible.png), with setup recorded in [additional evidence](../artifacts/boss-art-fidelity-2026-09-08/runtime/report-readable.json). The latter still shows terrain and pictogram occlusion. All five captures have mounted models and zero collected console/page errors. These captures are diagnostic boots with accelerated arrival/manual simulation, not natural progression playthroughs or a frame-time benchmark. No mobile visual verdict is claimed.

## The other bosses are a different kind of comparison

- **Baron:** the body remains a generated sprite, with separate 3D launcher/rocket/keg props. A body-to-GLB fidelity comparison does not exist here (`src/entities/pools.ts:452,1752,1791`).
- **Echo:** its art describes a mirrored settlement. Runtime uses translucent box copies, a perimeter, a jar and mote (`src/systems/EchoBossSystem.ts:363-408`). Closer fidelity would mean representing the mirrored building forms and encounter effect, not importing a single monster GLB.
- **Quiet:** its art describes a spreading absence amid the Ark. Runtime uses a translucent heart sphere, ring and mote (`src/systems/E10StaticBossSystem.ts:89-119`). This belongs to an environment/effects review. Inventing a physical mechanical boss would contradict the reference's purpose.

## Smallest useful improvement sequence

1. **One Homemaker pilot.** Preserve its current component/state system; change body, apron, lens and vacuum forms first. Show source, silhouette view, neutral color view, current game camera and final chair state. Decide on those major forms before polishing the atlas.
2. **Apply the proven approach to Claw and Old Digger.** The Claw needs deliberate extent normalization and airborne/landed checks. Digger needs industrial mass while preserving its gentle conversion.
3. **Finish Queen, Crawler and Railcar selectively.** Land Yacht needs a deliberate asset-adoption slice before model work can reach the player. Keep the material/night-read correction as its own comparison so it is not mistaken for a geometry improvement.

The first pilot should demonstrate that the named signature features survive both close inspection and game distance, that all original damage/transformation states still work, and that original identity is stronger without increased visual noise. Use a fixed-camera before/after at desktop and 390px mobile for acceptance. Re-measure actual frame time, draw calls and texture memory after any approved geometry/texture change; the July working-load benchmark does not establish present mobile headroom.

## Constraints to retain when implementing

The current six GLB loaders enforce exact triangle equality, exact component mesh counts and names, one shared source material, and one named morph at index 0. See `pools.ts:1577-1597`, `CrawlerBossSystem.ts:432-458`, `DredgeQueenBossSystem.ts:568-593`, `HomemakerBossSystem.ts:613-638`, `SalvageClawBossSystem.ts:522-542`, and `OldDiggerBossSystem.ts:589-614`. A new mesh can be valid glTF and still be rejected by the game if those pins are stale.

Maintain placement, scale and contact points; in particular Railcar's rail height/heading, Queen's sea-level placement, Claw's 0.78 runtime scale, and terrain-relative machines. Keep the existing binary damage morphs, Queen's retained hulk, Homemaker's chair, Claw's civic landing and Digger's gentle state. All six intentionally use fallback presentation in lite tier, which must be checked separately.

These GLBs contain no animation clips and join parts by component/state rather than moving joint. Independent wheel, tread or crane animation would require another presentation change. It is not necessary to begin the fidelity improvements above.

## Verification and deliverables

- Fourteen fresh neutral views of seven current GLBs; original assets untouched; Blender 5.1.2 import/render exited 0.
- SHA-256 provenance for every compared raw image and GLB; binary triangle, mesh, morph and material inspection retained.
- Seven comparison boards and a local HTML gallery, with full originals available alongside any labeled crop.
- Three current full-tier boss mounts confirmed across five runtime screenshots; exact capture setup and errors retained.
- Independent visual critique agrees on major-shape losses and material similarity. Perspective-dependent wheel counts and hidden sail marks were not promoted to definitive defects.
- No gameplay tests/build were run: no production code or assets changed. No performance or release approval is claimed.

Reproduce neutral views with `/Applications/Blender.app/Contents/MacOS/Blender -b --python artifacts/boss-art-fidelity-2026-09-08/render-assets.py`; with project Node dependencies available, compose the boards using `node artifacts/boss-art-fidelity-2026-09-08/make-gallery.mjs`. Runtime capture scripts are retained in the evidence folder and name their diagnostic setup.

**Review complete. Follow-up modeling is proposed, not implemented or queued.**
