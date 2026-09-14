# Sprite roster inspection and repairs — active goal

The purple/violet fringe milestone is fixed locally. The complete character/animation goal remains active; do not treat a clean pixel census as a full art or animation sign-off. Fires remain disabled. No commit, push, merge or deploy was made.

## Confirmed and repaired

- **F-SPR-01, chroma fringe:** reproduced on the 390px mobile town view, including a walking child. The factory already contained the diagnosis (`anim-pass-fringe.mjs`), alpha bleed in `extract-alpha.mjs`, staged re-extraction, and an opaque-preserving composite recipe. The residual sheets had been held because naive re-extraction undoes cutout mends or moves artwork.
- Reused those tools. Repaired 20 sheets, 334 shipped cells and 166 masters. Restored original alpha and opaque RGB after processing. The Baron was cleaned from its current cells; its raw-sheet rebake was rejected. The 1,300-image character census moved from 298 affected / 115,065 visible magenta pixels to **zero**. All 500 changed PNGs preserve original alpha and opaque RGB exactly.
- Added alpha-weighted filtering within the self-contained extractor. The optimizer/downscale recipe remains unchanged for compatibility with historical masters. Fixed the re-extractor's off-by-one output count.
- Updated the halo guard's held/cured provenance. Master verification now checks immutable repair hashes. Recorded 140 newly divergent color-preserving pairs and 32 pre-existing undocumented pairs, retaining the existing 26 entries; all 198 are byte-pinned. This records intentional differences without permitting arbitrary replacements.

## Verification

- `npm run build`: pass on the final asset set (`build-final.log`).
- `node scripts/rgba-resample.test.mjs`: pass, including transparent-key rejection, partial alpha, opaque RGB, edge extension, and a relocated copy of the actual CLI.
- `node scripts/master-repair-check.test.mjs`: exact-byte positive control passes; altered digest is rejected.
- `node --test scripts/character-direction-assets.test.mjs scripts/hero-clip-groups.test.mjs`: 9 pass.
- `node scripts/halo-reextraction-check.mjs`: 1,043 cured, 0 held, 32 separately regenerated, 1,400 scanned; alpha and opaque RGB unchanged.
- `node scripts/anim-pass-reextract.mjs --verify-downscale`: 281 byte-identical, 198 intentional/hash-verified, **0 unexplained** across 479 masters.
- Desktop 1280px and mobile 390px/DPR2 town captures: zero console/page errors before and after. Browser emulation, not a physical-device test. Storekeeper/preacher require an additional building-unlocked capture.
- All 25 files from the completed code-repair hash manifest remain unchanged.
- Independent `codex review` found three compatibility issues: changing the historical downscale recipe, stale halo provenance, and relocated-script helper imports. Resolved by retaining the legacy downscale, updating provenance with exact hashes, and keeping the extractor self-contained with a relocated-CLI regression check. Raw review: `pipeline-review.log`.

## Remaining goal work

`artifacts/sol/sprite-roster-fixes-20260908/roster-ledger.md` and `.json` track 49 identified character/variant/rendering entries; most animation entries are pending, and epoch fallback variants must still be enumerated. Next:

1. Inspect every active clip and direction through the actual SpriteAnimator and separate TownActorRuntime paths; review contact sheets and animation loops individually.
2. Resolve the confirmed Hero north-idle, action-to-walk fallback, panning ground rectangle and age/skin continuity findings in `reviews/sol-findings-sprites-factory-20260908.md`.
3. Inspect town feet/ground anchoring beyond the three metadata-bound actors, the preacher/teacher/assayer direction maps, frame counts and low-frame-rate timing. These are investigation leads, not yet signed-off fixes.
4. Cover pooled enemy variants across all epochs, companion skins, boss components and their phase/damage animations. Generate replacement plates with native image generation only when existing approved art cannot satisfy the required state.
5. Re-run final visual/runtime checks after those repairs and complete the goal only when every ledger entry has a disposition backed by evidence.

## Evidence location

All current evidence is under `artifacts/sol/sprite-roster-fixes-20260908/`. `mobile-fringe-comparison.png` is the compact before/after; full captures and JSON samples retain context. `applied-rebakes.json` pins each original/result. `original/`, `rebake/`, and `baron-*` retain recovery/candidate material; they are working evidence, not intended as a blanket publication payload. Development server for this work uses port 5319, never a reserved gate/rig port.

## September 8 continuation — idle, town contact and full-frame inspection

**F-SPR-02 fixed:** `OrientationResolver.idleDirectionFor` now preserves the last heading. `SpriteAnimator` holds the current direction's own walk-sheet pose for idle, including resolved Hero age/skin, instead of appending mismatched old rotation art or collapsing diagonals to north/south. Slots without a declared idle hold one of their own walk frames. This repairs the original north-idle finding and the idle portion of age continuity; it does not repair missing action art.

**F-SPR-03 fixed:** all nine walking town actors now use their existing extraction metadata for foot contact. The three four-column sheets (preacher, schoolteacher, assayer) loop over their actual column count; newsie's authored frame map remains authoritative. Existing breathing and sway are unchanged. A suspected low-frame-rate skipped-step issue was withdrawn: the town loop caps delta at 0.05 seconds, below the shipped 0.125-second frame duration.

Verification of this continuation:

- `npm run build`: passed after the same-era pin (`build-idle-ground-pinned.log`). `npx tsc --noEmit` also passed before the build.
- `node scripts/review-sprite-idle.mjs`: passed real Hero stop transitions for four ages and all four diagonals, plus 160 idle/direction cases across all 20 registered slots; no browser errors (`idle-regression.log`). Stock skins exercised; distinct selected coats/neckerchiefs still need their own coverage.
- `node scripts/review-town-walk.mjs`: passed 144 samples across nine actors, asserting existing cells, complete frame cycles and metadata contact (`town-walk-regression.log`). This uses the actual actor class and actual metadata imports; it does not certify an artist's gait.
- Character direction, clip-group and engine-era source checks: 14 passed (`idle-ground-source-checks.log`).
- Actual Start Menu entry with an unlocked test profile: all ten town actors visible and loaded at 390px/DPR2 and 1280px, no page/console errors (`town-full-cast-grounded.json` and PNGs). Earlier direct-history town fixtures bypassed profile storage scoping and omitted two actors; those are not full-cast evidence. The corrected fixture exercises the real entry flow.
- Independent read-only Codex review found no actionable defects in the three changed runtime files and idle regression. Its additional checks passed eight heading-preservation cases, missing-frame fallbacks and 144 town frame samples (`idle-ground-review.log`).
- All 24 prior code-repair files remain byte-identical. The 25th, `assets/engine-era.json`, only gained the presentation-change pin and retains the prior repair pin. Current hash: `51cc8c0b4c55e05c1eafc855afe1d15a21a28a174328ca8a4d52951dc4bc220d` (`code-repair-preservation-idle.json`).
- Existing `e2e/vp-02b-rotation-resolver.spec.ts` contains assertions for the superseded hemisphere-idle behavior. It was not edited under the existing-e2e restriction. Do not describe the entire old e2e suite as green; the new browser check pins the intended behavior.

All 20 registered slots have before/after runtime boards and sampled frame-source traces under `runtime/` and `runtime-idle-fixed/`. Every shipped frame of all nine walking town actors was visually inspected in `town-cycles/` (224 cells, respecting newsie's four-frame map). This is broader coverage, not blanket animation approval.

### Remaining confirmed art/rendering work

- **F-SPR-04, partially repaired:** teacher east facing, north head clipping and detached east fragments are fixed in the follow-up below. Assayer east was subsequently repaired in the follow-up below. Preacher east is correctly right-facing in the current sheet (the older three-row suspicion was stale); its west/north views are oblique and the repeated stride changes too little. Other town cardinal headings were inspected and correctly oriented. Temporal gait quality remains open.
- **F-SPR-05, fixed locally:** opposing enemies now own independent animation cursors and material pairs. Cached frame views have immutable UV transforms and share their atlas source. The default sprite path retains the same draw-call count. See the final enemy regression and independent review below.
- **F-SPR-06:** nine E6-E9 slots expose a flat loop without direction registrations; isolated animator boards show the same facing for all eight requested headings. New directions require art/contract work, not merely a resolver change.
- **F-SPR-07:** Baron NW/NE boards contain dark triangular ground remnants, and its east row differs visibly in style. Claim Jumper cardinal walk art varies in size/style. Rail Tough north and Prospector west need raw-to-runtime direction reconciliation.
- Hero action-to-walk fallback, south panning ground, and aged action identity remain open under F-AN0908-2/3/4. The existing clean-pan candidate is also still staged, not activated.
- Claim-Day and the two alternate Prospector coats are explicitly marked “at the tailor” by the current wardrobe; their fallback/selection paths need review before counting them as complete distinct shipped art.

### Factory generation and acceptance

The existing extraction/re-extraction, frame metadata, fringe inspection, crop, duplicate and master-verification tools cover the technical pipeline. They do not prove correct directional anatomy or a real alternating walk just because a sheet has the requested number of cells.

Three native-image teacher candidates are banked under `teacher-candidates/`, with SHA-256 provenance and summarized briefs. Initially none was activated: v1 repeated stride poses, v2 improved passing poses but failed alternating leg contacts, and v3 exaggerated kicks without fixing the front-row alternation. The whole-sheet replacements remain rejected. A later row repair reuses only v2 north to restore head and cardinal facing; it does not certify the gait. No paid image service, fire, lane task or subscription change was used.

The goal remains active. The shared-family enemy facing problem is now repaired. Remaining art repairs need direction-specific, visibly alternating poses. Boss components and epoch fallback variants remain in the ledger. Fires are still disabled; no commits, merges, pushes or deployments occurred.

## Enemy ownership and teacher cardinal follow-up

### Runtime repair and validation

Each occupied enemy pool slot owns its cursor and cloned primary/fade material, using the existing sprites. Recycling releases that state, including when a slot changes family. Fifteen animated families share cached atlas sources, and immutable frame views prevent a second animator from changing the first body's selected UVs. The experimental instancing flag uses the existing Sprite path for these animated bodies. The default path's draw count does not increase: the two-bandit reproduction remains 21 calls before and after. Baron raw-speed cadence and common-sheet warm-up are retained.

Independent CLI review found one introduced tint-cloning defect: a fallback already drawn under tint supplied a darkened base to its clone, applying the tint twice. `GeneratedSpriteBatch.cloneMaterial` now copies the stored untinted base. The runnable enemy regression reproduces fallback rendering before ownership, verifies one tint application, then restores the untinted color. No other actionable introduced defect was reported.

Final checks:

- `npm run build` passed after the final same-era pin: `008e906d7fdaf4d56e159eeac91f8f3f0e6683a7e14964ae7518f5b3983ea6c1` (`build-enemy-teacher-final.log`).
- `node scripts/review-enemy-sprites.mjs` passed 15 families at 1280 and 390/DPR2, including the experimental flag, opposing movement, distinct cursors/materials, immutable same-atlas frame views, separate clips, tint restoration and recycled slots. GPU textures remained 28 to 28 over repeated warmed cycles. A first final run timed out during software-browser startup while the build and town probe ran; the sequential rerun passed both viewports.
- Direction/clip-group/engine-era guards: 14 passed (`enemy-teacher-source-checks.log`). Town frame check: 144 samples across nine actors passed after the art edit.
- Existing run gait and scene animation-refresh e2e: six passed across desktop/mobile before the final tint helper. The prior Hero idle regression also passed after the immutable-view change. No claim of a full legacy e2e pass.
- All 24 prior code-repair source files are byte-identical. The engine registry only appends presentation pins and retains the earlier mechanics-repair pin (`code-repair-preservation-enemy.json`).

### Factory row repair, with remaining art limits

The native east strip was keyed with the existing extractor, packed losslessly at verified empty gutters, grafted with `anim-pass-graft.mjs`, then extracted at the existing 4x4, 512px, scale-1 convention. Direct grafting of the uneven native strip was rejected because it dropped scanlines. Safe packing and key normalization produced zero lost scanlines. The north row was taken from the already banked v2 candidate; a new standalone north strip was rejected for moving the satchel to the wrong side and repeating the raised boot. No paid image service was used.

Only raw rows 2/3, eight processed cells and their metadata bboxes changed. Original south/west raw bands and eight cells are byte-identical; all originals are retained in `teacher-candidates/east-original/`. The existing town sheet binding is unchanged. No new runtime system, atlas format or duplicate live sheet was introduced. The new directions keep the original 313px figure height and footline. The repaired cells no longer clip; the complete 1,300-PNG character census still finds zero visible magenta pixels.

An unprimed visual reviewer confirms no visible clipped extremities, stray fragments or bag/identity swaps. It also confirms unresolved issues: east repeats A/B/A/B silhouettes with snapping skirt folds; west is oblique while east is strict profile, causing width changes; east is slightly warmer in color. North's feet are hard to distinguish, so no gait approval is inferred. These are recorded in the roster ledger; the teacher remains partially repaired. The normal mobile close capture is obscured by UI panels. A separately labeled sprite-only canvas capture hides HTML overlays in the test page to inspect the actual WebGL body; it is not evidence that the UI overlap is repaired. The reviewer then confirmed clean mobile edges and plausible scale, with no clear floating gap or buried feet. Teacher contact shadow is less visible than the player and remains a medium-confidence grounding-quality concern.

Actual Start Menu entry loads all ten town actors at both viewports with no errors. The schoolteacher uses the repaired east c0 and reports footY 0.02. Sources, decisions and SHA-256 provenance are in `teacher-candidates/provenance.json`; before/after row boards and the current cardinal sheet are beside it.

Fires remain disabled and unloaded. The whole-roster goal remains active: E6-E9 directional art, town gait/direction continuity, Hero action/age art, selected skins, companions and boss component/phase review are not complete. No commits, pushes, merges, deploys or scheduler restarts occurred.

## Boss factory wiring and selected-skin follow-up

### F-SPR-08 — repaired integration: the Land-Yacht was displaying concept boards

The actual E4 capture showed overlapping opaque parchment rectangles. `LandYachtBossSystem` was cropping `boss-land-yacht.png` and `boss-land-yacht-damage.png`, which are full concept boards. The factory already supplied `assets/pilots/land-yacht-3d/land-yacht.glb`; BACKLOG's earlier wiring entry records a silent no-op. The old queued wiring task also describes four nodes and E5, contradicting the current asset's three nodes and actual E4 consumer. The current source and asset contract were used instead of inheriting those stale details.

The existing GLB is now lazily loaded through `createGltfLoader`. Its named wheels, crane and wheelhouse meshes use `Damage_BeachedWheels`, `Damage_SlackCrane` and `Damage_CrackedWheelhouse`. The model SHA-256 remains `902191310b8cf604a1196902696ff14de78811f81bb30dd4bb5a3011f5ce7a01`; all 10,632 triangles and the authored negative-X prow are preserved. A small geometry fallback serves loading, LITE and failures without introducing paper into the world. The model was added to the existing asset-diet boss manifest after the strict build correctly rejected its missing entry. No new asset pipeline or generated model was added.

An independent code review found four introduced integration defects in the first draft: destroyed positions dragged the hull away from survivors; restored wreck pose differed; performance-tier demotion retained the GLB; and fallback ends were reversed. All four were repaired and reproduced by the runnable check. Surviving components retain local offsets; defeat and restoration use the same authoritative wreck position and authored heading; tier changes cancel ownership before load/mount and release mounted models. Simulation acts, component damage resolution, balance and economics were not changed.

Validation:

- `npm run build`: passed, including all asset-diet guards; seven boss GLBs now compress from 26,273,232 to 3,822,712 bytes as a family. `npx tsc --noEmit` passed. Current render-only engine pin is `24ffd8002effbb136c100ea7f54f922c6fab849d75455fb45ae533882b782020`.
- `node scripts/review-land-yacht.mjs`: six cases pass against the authored GLB, and again against the exact compressed production GLB. Covers independent morph thresholds, unusual component death order with a 48-unit surviving-body move, authored heading, wreck persistence, reset/disposal, zero model requests on LITE, invalid named components, disposal during load, and LITE demotion during and after load. Zero page/console errors. Repeated warmed renders keep texture counts stable.
- Existing E4 boss e2e: all four desktop/mobile cases pass after the review repairs. Engine-era and component-boss source guards: 11 pass.
- Bounded real-game before/after samples at 1280 and 390/DPR2 retain 65 and 60 draw calls respectively. P95 frame intervals were 10.2→10.4ms and 10.2→10.3ms. This development-machine sample is not a physical-phone performance guarantee; the model adds 10,626 rendered triangles relative to the old sprites.
- All 24 prior code-repair files are byte-identical and the earlier mechanics pin is retained (`code-repair-preservation-land-yacht.json`). Original Land-Yacht source/captures are banked under `land-yacht-before/`.

### F-SPR-09 — original finding; direction repair recorded below

The actual owned-skin matrix passes all eight combinations of four Hero ages and both Prospector coats. The selected Prospector coat uses its own hover8 cells. Young Claim-Day uses its own walk/idle source; midlife, silver and elder correctly fall back to age-matched stock because aged coat siblings are missing. The probe explicitly serializes `sourceFrameKey`: ordinary JSON serialization omits that non-enumerable diagnostic and misleadingly retains legacy idle labels. No idle regression was found.

All 32 cells of each stock/complainant/gilded hover8 sheet, all 32 stock hover4 cells and both 16-cell young Claim-Day sheets were visually inspected. In all three hover8 coats, declared west is front/oblique and east faces left. Closer inspection established that both legacy profile rows face left from different sides; they are not a safe east-facing substitute. Claim-Day cardinal/diagonal views appear directionally coherent, but full gait/action continuity remains unapproved. The wardrobe's “at the tailor” designation is intentional: the cosmetics spec requires a complete set of sheet siblings, not only the active hover8 or young walk4 set. It was not changed.

### F-SPR-10 — open boss readability and remaining verification

Direct inspection and a fresh unprimed visual reviewer agree: the Land-Yacht body merges into dark terrain, wreck changes are weak at game scale, a teal cylinder looks detached from the authored cabin, and mobile HUD panels obscure the central body. Uneven wood mapping is a medium-confidence concern. The diagnostic fixture's missing contact shadow cannot establish a floating chassis. Detailed findings and current crops are in `land-yacht-review/visual-critique.md`. The integration repair does not certify the existing model's art quality.

The wider nine-suite boss run produced 50 passes and four failures across desktop/mobile, before the Land-Yacht edit. Two Crawler cases fail a strict renderer artifact comparison (cold textures 33 versus pinned 32), after mount/morph/disposal assertions pass. That count is not silently re-pinned or declared harmless. Two E10 cases cannot find `bank-secured-claim`; the existing `tasks/e10-bank-secured-claim-regression.md` documents the same earlier failure, with stale flow versus regression still unresolved. Other phase/gating/fallback assertions passed. This is not a claim that the full boss suite is green.

Dredge act-1/hulk desktop shots show the GLB and damage but overlapping labels. Homemaker's capture is obscured by the wave banner; Salvage Claw's body is largely outside its capture. Dedicated unobstructed desktop/mobile phase views remain necessary, as do Echo, Old Digger, Static and Railcar visual completion. Thirteen e2e-generated tracked review shots were copied into `boss-screenshots/` and their original repository bytes restored; they are evidence, not new approved baselines.

The 49-entry roster ledger now distinguishes these runtime checks from unfinished art. The factory fire remains disabled and unloaded. No generation, dispatch, subscription changes, commits, pushes, merges or deployment occurred during this follow-up. The whole-roster goal remains active.


## Prospector directions and darker violet edge follow-up

### F-SPR-09 — W/E directions repaired, temporal polish remains open

Three native-image plates supply eight right-facing frames each for stock, complainant and gilded Prospector. Existing left-facing row 2 was moved into declared W row 1; native E replaces row 2. No mirroring changes anatomical pan handedness. The 4x2 native outputs were normalized with the existing extractor, grafted using `anim-pass-graft.mjs`, then processed through `anim-pass-reextract.mjs` at each sheet's existing size/master convention. Direct grafting of unnormalized backgrounds was rejected after lost-scanline evidence. Final grafts lose zero scanlines.

The change activates 48 cells and 16 stock masters plus three raw sheets and their frame metadata. Raw S/N bands are unchanged. All 134 pre-direction-repair files are retained under `prospector-repair/original/`; provenance records the three native outputs and hashes. Later shared edge cleanup changes RGB on S/N cutout borders too, so only the raw S/N bands remain byte-identical to that earlier capture. Existing contract keys, grids and runtime bindings remain in use. No alternate factory or paid image service was added.

All six stock/coat × desktop/mobile cases pass eight headings, all eight active frames and held idles, with zero browser errors. These are 384 direction/frame combinations, including diagonal aliases, not 384 unique assets. The diagnostic gallery boots the actual owned skin and uses actual SpriteAnimators, but is not a normal gameplay composition. The separate actual Start Menu town capture loads all ten actors at 390/DPR2 and 1280 with zero errors.

The independent visual reviewer confirms correct facing and pan handedness without clipping or detached fragments. Remaining art concerns are W near-profile versus E three-quarter view, minor pale edges on some older W/N coat frames, and unapproved W/N thrust cadence. The wardrobe's incomplete-sibling designation is unchanged. Current evidence: `prospector-repair/coat-cardinal-comparison.png`, `visual-critique-final.md`, `runtime/results.json`, and `provenance.json`.

### F-SPR-11 — darker violet silhouettes repaired in the shared factory path

The earlier bright-magenta census was too narrow to detect dark painted violet ink. A broader read-only colour scan found 6,091 edge-near violet pixels across 564 of 1,300 character PNGs. The old opaque-RGB preservation rule retained some of those outlines.

The existing `despillSaturatedKey` now also supports cutout-only repair through `--despill-only`. For the magenta key it subtracts only the common red/blue excess over green within three pixels, including diagonal corners, of fully transparent background. Alpha, dimensions and all colours outside that band remain exact. Hidden RGB is cleaned too. Ordinary saturated-key grid and nongrid extraction finish with the same operation, preventing future factory output from recreating this edge class. Gray-key and full-bleed paths remain unchanged.

The repair examined all 1,300 character PNGs and 476 matching native masters. It changed 1,021 processed files and 429 masters (1,450 total), with 2,073,266 visible RGB pixels adjusted. An independent per-pixel oracle verifies every alpha and interior RGB value is preserved across all 1,776 examined files. Immutable originals, resulting SHA-256 values and change counts are in `violet-repair/before/` and `manifest.json`.

The broader census now retains one pixel: complainant S r0c2 at (197,197), RGBA (98,73,97,128), near alpha 5 but seven pixels from alpha zero. It lies outside the intentionally narrow repair band and remains preserved. This is not a claim of zero violet anywhere in the artwork, nor removal of pale outlines. `edge-census-before.json` and `edge-census-final.json` preserve the comparison.

Verification:

- `npm run build` passed after the final source and asset changes.
- `node --test scripts/despill-cutout.test.mjs scripts/rgba-resample.test.mjs` passed. Includes diagonal corners, opaque/semitransparent edges, translucent interiors, hidden colour, alpha/dimensions, idempotence, invalid combinations, normal grid/nongrid extraction and RGBA resampling.
- Direction, clip-group and engine-era checks: 14 passed.
- `node scripts/halo-reextraction-check.mjs`: 987 historical cutouts preserved, 88 separately regenerated cells clean, 1,400 images scanned. Only exact edge despill is permitted for changed opaque RGB; alpha remains strict. The 88 replacement exceptions are 32 Elder, eight Teacher and 48 Prospector cells, scoped to exact rows.
- `node scripts/anim-pass-reextract.mjs --verify-downscale`: 27 byte-identical, zero unexplained, 452 intentionally divergent of 479 masters. Per-resolution edge cleanup deliberately differs from fresh downscaling; touched pairs have exact SHA pins. The original 198-entry registry is preserved. `node scripts/master-repair-check.test.mjs` accepts exact bytes and rejects a changed digest.
- Final independent CLI review found no actionable defects. In-memory checks cover exact 3px diagonal scope, alpha/interior preservation, guard mutation rejection, and eight original-versus-current grid/nongrid/resize/full-bleed cases (5,684 pixels). Log: `violet-repair/review-actual-final.log`.
- All 24 prior code-repair files remain byte-identical; the existing mechanics-repair engine pin is retained. No new engine pin was needed for this scripts/assets-only batch.

### Factory inspection follow-up

The existing generation, graft, extraction, metadata and master tools were reused. The generation wrapper `scripts/anim-pass-gen.mjs` still contains a global mtime fallback when it cannot parse a session ID. Static inspection shows that concurrent image outputs could be claimed under that fallback; its header still overstates concurrency safety. This run used exact native-tool output paths and retained hashes, so it did not use that fallback. Record this as a remaining factory provenance defect rather than dispatching fires to investigate it.

The 49-entry roster ledger remains active. E6-E9 missing directional art, town gaits/Assayer direction, Hero action/age identity, complete coat sets and remaining boss readability/phase checks are unfinished. Fire `com.goldrush.fire` was reverified disabled and unloaded. No commits, pushes, merges, deployments, fire dispatches or subscription changes occurred. READY-FOR-GATES applies to this repair batch, not to completion of the whole-roster goal.


## Assayer direction, pose references and grounded town actors

### F-SPR-04 — Assayer east repaired; remaining gait work retained

The live Assayer sheet declares rows S/W/E/N, but row E faced left. Seven native-image iterations are banked under `assayer-repair/`, with exact prompts, output paths, hashes and rejection/donor status. The first swapped the ledger and pencil. Subsequent strips repeated the same half-stride, and mixing separate pose outputs changed body proportions. A new forward passing pose plus a final native unification produced consistent body proportions and four distinct east poses. Only the final unified plate is directly activated. The existing Hero GLB's walk was rendered as a coloured-leg pose guide; that model is not newly wired or shipped by this change.

The shared factory normalized the key, grafted row 2 against the existing W scale/footline and re-extracted at the existing 4x4/512px/scale-1 convention. Zero scanlines were dropped. Four processed E cells, their metadata and the raw E band changed. Raw S/W/N bands, all twelve other processed cells and their metadata remain exact; all eighteen original files are preserved. This sheet has no processed-full masters. Existing asset keys and town imports are unchanged. See `assayer-repair/activated.json` and `provenance.json`.

Independent visual critique confirms consistent identity, proportions and attached props. The fourth pose now lifts the forward boot while the rear boot supports the body; the third stride no longer stretches excessively. Contact silhouettes in poses 1/3 remain similar, and stills do not certify smooth alternation. Existing S/W/N frames barely change legs, and cardinal camera angles remain uneven. Full Assayer gait approval is still open.

`scripts/review-town-character.mjs assay_clerk` reuses the actual TownActorRuntime source, texture loader, authored character definition, scale and FPS in a labeled diagnostic scene. Both 390/DPR2 and 1280 runs cover all sixteen sources with zero browser errors and world footY 0.02. The first fixture used child scale; it was corrected to import the authored definition, and final evidence was regenerated. The GIF uses deterministic east frames at 8fps with a following diagnostic camera. This is not proof of natural route traversal: the ordinary Assayer definition has no walking loop and stands at its post. The repaired directional state is exercised through the actual runtime's movement input in the diagnostic.

### F-SPR-12 — grounded townsfolk inherited companion hover and rocking

Runtime closeups revealed soles lifting above the ground marker despite the prior footY check passing. TownActorRuntime added a whole-group vertical sine offset to every full-body actor and rotated its billboard around the sprite centre. The old check asserted the local metadata footline, excluding these extra transforms.

Only the Prospector now receives those hover/rocking transforms. Grounded townsfolk retain their authored frame alignment. `scripts/review-town-walk.mjs` asserts group position plus local footline and zero billboard rotation across 144 samples for all nine walking actor types; a positive companion control retains nonzero hover and sway. The source change is presentation-only. Same-era engine pin appended: `9301cb6fca6770ead7198eb2aa8fad639f2b8d16d5eafa31afdf83066afd67ea`; prior pins remain intact.

Final checks:

- Build passed (`assayer-repair/build-final.log`); direction, clip-group and engine-era checks: fourteen passed.
- Town frame/grounding check: 144 samples plus companion hover control passed. Authored-scale browser Assayer check: 32 direction/frame samples across the two viewports passed.
- Factory halo guard: 983 historically preserved cutouts, 92 independently regenerated cells, 1,400 scanned. The additional four exceptions are exactly Assayer row2 columns0–3, not the whole sheet. Independent review checked neighbouring rows/sheets remain protected.
- Native master verification remains 27 byte-identical, zero unexplained and 452 intentionally divergent of 479. The broader violet census remains one unchanged interior-near-low-alpha pixel; the new Assayer cells add none.
- Independent CLI review found no actionable defects in the bounded runtime/guard batch. It verified four mutation controls, preserved Assayer rows/cells/metadata and exact exception scope. Its browser-harness review was static against saved evidence; the later authored-definition fixture correction was rerun in Chromium.
- All twenty-four earlier code-repair files remain byte-identical; mechanics-repair pin retained (`code-repair-preservation-assayer.json`).

### F-SPR-13 — Assayer placement remains partly occluded in normal town

The actual mobile town close capture shows the Assayer behind the Assay Office roof, even with HTML overlays hidden. It does not provide an unobstructed natural-game east view. Static tracing shows `townActorPlazaPlacement` prefers the old portrait-post offset even when an actor now has a full-body sprite. That is a concrete next investigation; building occlusion is not fixed by the diagnostic gallery. Both actual town captures load all ten actors with zero errors, but loaded/present does not mean unobstructed.

The initial four-case existing-town e2e run inadvertently used the config's reserved default port 5188, creating a temporary server that Playwright then stopped. No listener remained there. Those results are superseded by the explicitly targeted external-server run on this worktree's port 5319: all four desktop/mobile roster and ring-road cases passed (`assayer-repair/town-e2e.log`). No fire was started. Use `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5319` for further e2e runs.

The whole-roster goal remains active. Next work includes Assayer/town placement, remaining gait and view continuity, missing E6–E9 directions, Hero action/age identity, full coat siblings, boss visual phases, and the factory generation wrapper's unresolved global-mtime fallback. Fire remains disabled/unloaded; no commits, pushes, merges, deployments or subscription changes occurred.


## Factory generation and walk-prompt follow-up

### F-SPR-14 — fixed: concurrent art could still be claimed by the wrong generation job

The existing chain is cast registry → `anim-pass-prompt.mjs` → `anim-pass-gen.mjs` (optionally fan-out through `anim-pass-batch.mjs`) → key/extract/graft/re-extract helpers → contracts/runtime → visual checks. Keep using it; no replacement generator or paid provider is needed. `anim-pass-reclaim.mjs` is a historical F-EW-2 recovery tool, not a general cleanup command: its assumption that every alternative is misclaimed does not apply to new legitimate alternatives. It was inspected, not run.

The generation wrapper's earlier repair still fell back to globally modified image files when its banner lacked a session ID. Even with an ID, substring matching admitted names outside the exact session directory, and nonzero/terminated runs could copy art. It now requires exit code zero, exactly one structurally valid session banner, and ordinary image files directly inside that exact session directory. No global scan/fallback remains. Failure retains the diagnostic log and does not overwrite the prior primary art. Default model, prompt stdin transport, source-path logs, output naming and batch failure signaling stay intact.

`scripts/anim-pass-gen.test.mjs` executes the wrapper body with a mocked CLI and an isolated home-path provider, without changing HOME or invoking generation. Eight cases cover own outputs, absent/malformed/ambiguous banners, failed/terminated runs, missing/empty session folders, neighbouring jobs, substring paths and symlink exclusion. Existing output preservation and legitimate alternatives are asserted. The historical wrapper fails the same check by selecting a substring-directory image. Independent CLI review found no actionable introduced defect and recognized all 71 existing batch-log banners. Review limits: no live generation, actual concurrent CLI processes, timeout kill, or full batch/reclaim execution was attempted.

### F-SPR-15 — fixed template: four-frame walks requested only half a stride

The shared prompt called left-contact/down/passing/up a complete four-frame walking cycle. It now requests left contact, passing with left support/right swing, right contact, then passing with right support/left swing. The current factory roster applies this branch to Preacher, Schoolteacher, Assay Clerk, Rail Tough, Steam Wrecker and Coal Thief. This is a confirmed template defect and a plausible contributor to repeated half-strides, not proof that every existing plate came from this exact prompt. The prompt correction does not change existing pixels or certify their gait.

The same runnable check generates all 72 prompts (18 cast entries × four diagonal directions) in temporary directories; all walking prompts include both contacts, four-frame prompts alternate support/swing legs, eight-frame sequences and companion hover remain intact. The old prompt fails on Preacher. No banked prompts or assets were overwritten. This one-line template correction and prompt checks followed the independent provenance review; they were locally verified, not separately reviewed by the CLI.

Evidence: `artifacts/sol/sprite-roster-fixes-20260908/factory-provenance/` contains `check.log`, `negative-controls.json`, `review.log`, `build.log` and `preservation.json`. Build passed; both historical defects fail the new guard; all twenty-four earlier code-repair files remain byte-identical. No runtime source changed, so no engine-era pin was added. This batch is READY-FOR-GATES; the whole-roster goal stays active. Town placement F-SPR-13 and remaining character/animation art findings remain open. Fire is still disabled/unloaded; no generation, dispatch, commit, push, merge, deployment or subscription change occurred in this follow-up.


## Town posts: F-SPR-13 repaired; projected grounding remains open

The full-body placer now ignores portrait-only offsets. Assayer moves from (7,3.4) to (8.35,6.1), clearing the Assay Office roof. Tavernkeeper's first patrol point moves from (-6.5,-4.85) to (-5.5,-4.5), clearing the porch rail and nearby lamp. A deterministic follow-up exposed the Storekeeper's head behind the lite porch at (1.15,-8.2); that post now sits at (1.15,-7.5). Both patrol approach endpoints, durations and pauses remain unchanged. Elder's working world position (-6.72,4.95) is preserved by moving that value into the full-body offset table. Teacher, Preacher and pre-authored loops retain their positions/routes.

An initial unrotated-footprint inference about Teacher placement was withdrawn after tracing the shell yaw. The visible Teacher was already outside the rotated Schoolhouse shell. No Teacher placement edit was made. Existing world-relative offsets remain world-relative; no new placement system was introduced.

`scripts/review-town-placement.mjs` captures the actual unlocked town in full 3D and lite at 390/DPR2 and 1280/DPR2. Full mode waits for all six building GLBs. A test-only route hook exposes the real TownScene and placer without changing production diagnostics. Every capture settles the same building-relative camera destination, stops the normal loop, selects the real patrol's first pause, waits for its exact frame, asserts the actor is at its defined standing post, then freezes that pose for measurements/screenshots. Full-body independence from portrait offsets, portrait-only compatibility, and pre-authored loop object identity are asserted. This covers standing posts, not entire patrol visibility.

The scene is rendered synchronously with the target sprite normal, hidden, and finally without depth testing as a visibility reference; sprite settings are restored. Pixels differing from background by more than 8 RGB levels define the measurable silhouette. All 24 final standing-post cases have 100% of those pixels visible, with zero page/console errors and all ten actors loaded. This metric excludes low-contrast pixels and HTML overlays. Final files: `town-placement/final-clear-{full,lite}/`; comparison: `town-placement/post-clearance-comparison.png`. UI-inclusive screenshots are saved separately and still show overlapping cards; canvas clearance is not a UI approval.

The historical control rewrites only the prior placement rule and Tavern/Store offsets in browser responses, retaining the current worktree/art. In lite mobile it reproduces Assayer visibility of approximately 4%, Tavernkeeper 85%, and Storekeeper 95%; desktop is likewise obstructed. The old-posts control is diagnostic, not a passed-placement claim.

Independent code review found one actionable test defect: a slow load could let Tavernkeeper reach the unchanged approach and falsely pass. The harness now drives and asserts the changed standing point and freezes the frame; the final browser runs verify this correction. The reviewer found no introduced source placement, interaction-reach, portrait/loop compatibility or engine-pin defect in its scoped static review. Storekeeper's subsequent numeric offset and the final harness correction were locally verified, not separately re-reviewed by CLI. A full capture attempt concurrent with build/pin activity lost its injected scene reference; its failure log is retained as `final-clear-full-initial.log`, and a later stable-build run passed. No failure is treated as a pass.

Build passed; fourteen direction/clip/era checks passed; nine-actor grounding check retains 144 frame samples plus companion control; four existing desktop/mobile town roster/ring-road e2e cases passed with the explicit external server at 5319. All twenty-four earlier code-repair files remain exact. Final same-era presentation pin: `6e7316d81db2cd5508ac00286d5c2d174e999b08d588de8d0e1fcd21c1b140e7`; intermediate and older pins are retained. Evidence logs and `preservation.json` are in `town-placement/`.

### F-SPR-16 — projected boots do not align with town contact shadows

Independent and direct visual inspection show shadow ovals behind boots for several adults; Teacher's shadow is not discernible. The numerical footY regression is insufficient to establish camera-projected ground contact. `TownActorRuntime.fitSpriteToTexture` offsets the sprite centre upward in world Y while leaving `Sprite.center` at (0.5,0.5). The installed three.js sprite vertex shader expands its quad along camera X/Y. At a tilted camera, those two axes differ, so a numerically correct world-Y footline does not necessarily project onto the actor's ground point. This is the next root-cause verification/fix: anchor the texture's footline through Sprite.center at the ground point, then verify actual projected boots/shadows across directions and viewports. Do not move shadows merely to fit one camera.

The moving Storekeeper sleeve interruption remains a separate observation requiring source/depth tracing; it is absent from final standing frames, so it is not yet a validated art defect. The older gait, action/age identity, E6–E9 directions, coat continuity and boss phase findings remain open. No art generation, fire dispatch/restart, commit, push, merge, deploy or subscription change occurred. Fire remains disabled/unloaded. This post-clearance batch is READY-FOR-GATES; the full-roster goal is active.


## F-SPR-16 — town billboard foot anchor repaired

`TownActorRuntime.fitSpriteToTexture` now sets `Sprite.center.y` to the texture's registered foot UV and places the sprite origin at FEET_CONTACT_Y. The installed three.js sprite shader expands the quad in camera space: the previous world-Y centre offset could numerically report footY=0.02 while visibly separating feet and the ground shadow. The new check fails the old code at the first Tavernkeeper camera-pitch sample (`before-check.log`) and passes all576 samples across nine walkers, four cardinal rows and three camera pitches. It also reads each requested PNG's actual alpha bottom, so a wrong metadata footline cannot satisfy both checks. The complete240-cell census differs from metadata by at most half a pixel; the gameplay frame-map samples remain authoritative for Newsie.

`Sprite.center` changes depth as well as silhouette placement. The first real renders therefore exposed Elder/bench occlusion, Teacher standing above the assumed flat floor, and close Preacher/Assayer porch conflicts. A downward ray against the real TownPlate found Teacher's former ground at approximately0.153, while the actor and shadow still assumed0. Original flat-pad and moved-position probes are retained. Final posts are Elder(-6.5,5.25), Teacher(-8.3,7), Preacher(-5.85,12), Assayer(8.35,6.8); Tavernkeeper/Storekeeper retain the previous repaired posts. These are presentation positions within their existing building anchors; authored patrol routes, FPS, scale and art remain intact. The full scene now clears their billboard footprints in both renderers. No depth test was disabled in production and shadows were not moved to compensate for one camera.

The production diagnostics expose the actual spriteCenterY. Two existing image-derived e2e contact formulas were updated by one line each to use that pivot: `town-cast-wiring.spec.ts` and `elder-walk8-woman.spec.ts`. Their PNG alpha-bottom evidence and tolerances remain; the tests do not substitute the cached footY. This is necessary verification of the authorized visual repair, following STATUS's canary-intent lesson. The nine-actor check preserves the companion's hover/rotation positive control; portrait-only construction stays unchanged, and the missing-metadata full-body fallback uses a bottom anchor with footY still null.

Independent code review identified Elder clearance and stale pivot assumptions in those two canaries. Both were fixed and verified. A second bounded review encountered transport reconnection errors, resumed lengthy analysis against intermediate placements, and was explicitly stopped before the final numeric post edits. Its log is retained as incomplete, not a clean final verdict. No additional code-review pass is claimed. Final source behavior is validated by the source, image and browser checks below, and the separate fresh visual reviewer.

Final verification:

- Build passed (`build-final-posts.log`), fourteen direction/clip/engine-era checks passed, and576 frame/projection/PNG-bottom samples passed (`complete-check.log`).
- Twelve targeted existing desktop/mobile e2e cases passed on the explicit external server5319: Elder source/normal-boot, town-cast contract/normal-boot and town roster/ring-road. Evidence `complete-e2e.log`; no legacy test expectation was weakened.
- `town-placement/anchored-visible-{full,lite}/`:24 deterministic six-adult standing-post captures, minimum measured visibility99.862% full mobile /99.902% full desktop and100% both lite widths, zero errors. Full readiness now requires the six named building models plus the plate, not a transient count of six. The inspection camera uses a fixed actor-relative stance to keep moved posts on mobile screen; this is not the former building-relative before/after camera, so use these as final clearance evidence rather than pixel-identical framing comparison. UI-inclusive captures remain separate and are not HUD approval.
- Fresh independent visual review confirms connected boots/shadows for five adults and clear Teacher silhouette. The broad oval shadow is artistically weak for Teacher's wide-stride pose, without proven vertical offset. Storekeeper's pale nearby prop overlaps the shoulder outline without established geometry intersection. No conspicuous pale outlines were found. The review establishes fixed-pose placement only.
- All24 earlier code-repair files remain byte-identical, prior mechanics pin retained. Final same-era pin `aad7faee337ff3c33f627485721cd57817c43c325e669c00a3b9f9c19e0c7226`; prior/intermediate pins preserved. See `preservation.json` and `final-source-hashes.json`.

Failed intermediate visibility/camera checks are retained and superseded only by the final named directories. The Teacher's isolated four-direction runtime gallery also passed32 samples at both widths before the later post moves; its scene is diagnostic and has no buildings. No art bytes were edited in this batch. Fire remains disabled/unloaded; no generator, factory dispatch, commit, push, merge, deployment or subscription change occurred. The implementation batch is READY-FOR-GATES with the stated incomplete second-review limit; the complete sprite/animation goal remains active. Outstanding work still includes temporal gaits and view continuity, missing epoch directions, Hero action/age/coats, boss phases, and visual edge cases recorded in the49-entry ledger.


## Factory coverage follow-up

The existing Eight Winds factory covers 18 named characters and produces diagonal additions (SW/SE/NW/NE). Its cast does not include the nine directionless E6–E9 slots in F-SPR-06. Those slots need cardinal source art and direction contracts before the existing diagonal workflow can complete them; merely running the batch will not provide full-roster coverage. Reuse the existing generation provenance, graft, extraction and inspection arms rather than creating a second pipeline. Exact cast and gap inventory: `artifacts/sol/sprite-roster-fixes-20260908/factory-provenance/coverage.json`. This inspection ran no generation or batch dispatch.


## F-SPR-06 — Feral Toaster now has eight authored directions

The first later-epoch directionless family now uses 64 native-authored hop frames: S/SW/SE/N from the new `walk8-a` plate and W/NW/NE/E from `walk8-b`. The original raw art and eight processed cells remain unchanged. Two first candidates were corrected through native image edits after independent review found ambiguous profiles and a reversed front-panel decoration. The final reviewer found all eight views readable, consistent panel/vent/rear details, no substantial silhouette, lighting, scale or seam defect, and only mild folded-foot density at compressed poses. Direct inspection also covered the 390px runtime board. This is a completed directional repair for this family, not approval of every crowded game scene or all remaining enemies.

Evidence root: `artifacts/sol/sprite-roster-fixes-20260908/toaster-directions/`. `provenance.json` records all four native outputs, prompts and selected hashes. `image-checks.json` verifies 64 unique, nonempty 256px cells, no positive red/blue-over-green spill within the three-pixel transparent-edge band, and at least 20px margins. `cut-check.log` finds no crossing components; the unused 6px-right/3px-bottom remainder contains two magenta corner-noise pixels per sheet, not character parts.

### F-SPR-19 — preserve authored within-cell motion through extraction

The normal extractor independently centres each alpha bounding box, which suppresses the authored hop. New opt-in `--grid-origin` keeps each source cell's centre fixed; default extraction is unchanged. `anim-pass-reextract.mjs` reads the persisted `origin: grid` and forwards the flag. Its actual round trip reproduced all 64 cells plus both metadata files byte-for-byte. No second image pipeline was created. The 256px output at scale 0.5 preserves the normalized size of the existing 512px/scale-1 convention, while eight directional RGBA atlases occupy 16MiB instead of 64MiB at 512px, before mipmaps. Existing fallback allocation and decode memory are additional; this is not a total memory measurement.

### F-SPR-17 — retain a usable loop when a directional image fails

The first independent code review reproduced a partial image-decode failure that replaced the intact older loop with a one-frame pose. `createRuntimeSlot` now supplies the previously loaded directional/coarse/side walk as the fallback; `createRuntimeOrientation` uses it when the new walk is incomplete. The second review caught the all-failed edge case: assigning that multi-frame loop to idle animated a stopped character. The early return now gives idle exactly the first fallback frame while preserving the whole walk loop. Both findings were repaired. Healthy/default/custom clip handling, deferred group paths and orientation-fade independence passed the reviewer's in-memory checks; final all-failed-idle repair was locally verified rather than followed by another CLI review.

### F-SPR-18 — remove hop ghosts without disabling heading fades

Actual runtime captures exposed doubled toaster cases during frame blending. A per-clip `frameBlendMs` override retains the existing global default for other clips. Both the new hop and its old fallback use zero; heading fades still use their separate duration. `1280-directions.png` is retained as the earlier ghosted capture; final `1280-normal.png` and `390-normal.png` show clean bodies. The eight authored phases retain the previous runtime cadence: Balance's speed-based gait calculation governs it (19fps in the no-speed-override gallery), not the nominal contract 8fps. An early gallery assertion incorrectly assumed a one-second loop and was corrected by tracing `effectiveFps`; no gameplay timing was changed. Another harness correction aligns the incoming source key with the dominant crossfade frame before capture.

Verification so far: build passes; 16 source/clip-group/era tests pass; 15-family real EnemyPool checks pass at desktop and mobile with stable 29→29 warmed texture allocations. Six final runtime cases verify all 64 sources and held idle at both widths, manifest-entry absence falling back to all eight original frames, and one failed directional decode preserving the complete older loop for that heading. A separate entire-row failure check exercises the single-frame idle repair.

Existing game tests: six passed (E6 roster/outcomes and heading fades, desktop/mobile), two failed at the old Hero `frameCount === 4` expectation with actual 8. The Hero contract is semantically identical to the pre-toaster backup, and both failing tests had already passed their serialized default-blend assertions before reaching that count. These legacy tests were left unchanged; no all-green e2e claim.

All 12 original toaster files and all 24 earlier code-repair files remain exact. Other character slot contracts are unchanged. Full-roster goal remains active: eight later-epoch families still need directions, plus the town gait, Hero action/age/coat and boss phase work already recorded. No commits, pushes, merges, deployments, fire dispatches or subscription changes occurred.

Final entire-row failure captures passed at both widths (`runtime/results-broken-row.json`, `runtime-all-failed-final.log`): all eight original fallback frames cycle for walking, and idle holds still. The preceding mobile capture was interrupted by development-server reload during a build/re-extraction; its failure log is retained and superseded by this stable-source retry. Final evidence totals eight runtime cases, zero browser errors. Final same-era engine pin: `d9c0f7f016b9faf5e6ccd6e0911f93924d795729992d4a6942c8d77a28181127`; every prior/intermediate pin and the mechanics pin remain. `git diff --check` passes. Fire is disabled and unloaded. This Toaster/factory repair batch is READY-FOR-GATES with the two stated legacy Hero test failures; the complete goal is active.


## F-SPR-06 — Lawn Shepherd directional repair and factory reuse

Lawn Shepherd now has 64 native-authored frames across eight explicit headings. The original directionless eight-frame loop and all twelve original art/metadata files remain byte-identical as fallback/history. Fallback metadata now names Lawn Shepherd rather than Bandit. Enemy mechanics, tint and visualScale are unchanged. The two plates use the existing contract loader and factory extraction/re-extraction tools; no additional generation system or fire dispatch was introduced.

Evidence: `artifacts/sol/sprite-roster-fixes-20260908/lawn-shepherd-directions/`. All five native calls and exact prompts/hashes are in `provenance.json`. An initial B plate crossed cell cuts; regenerated layout fixed this. Bright moving wheel-rim marks then looked like flashing highlights in independent visual review; native matte-copper correction resolved them. Final full-board/detail review found readable directions, stable rigid body/handle/aerial, consistent size/pivot, no clipping and no violet outlines. Direct mobile runtime inspection agrees. Motion, particularly the front roller, remains subtle; exact physical wheel rotation and crowded gameplay readability are not established by stills.

Use `--grid 8x4 --key ff00ff --cell 256`, scale `.8` for A and `.97` for B. Ordinary bounding-box centring removes accidental layout drift from this grounded rolling machine; Toaster's optional grid-origin setting would preserve that drift here. Both metadata files pin their scales. The actual `anim-pass-reextract.mjs` roundtrip reproduced all 64 cells and two metadata files byte-identically. No components cross final source cuts. The unused source border holds only two magenta corner-noise pixels per plate. All 64 cells are unique, nonempty and have at least 20px margins with zero positive R/B-over-G spill in the three-pixel transparent-edge band.

The existing Toaster runtime probe now accepts a family, while preserving its default command and hard-cut checks. Lawn Shepherd retains default frame blending. Independent CLI review found one introduced harness bug: the default evidence path still named Toaster when selecting another family. The path now derives from the selected family, preserving the historical Toaster path and explicit override; a direct check of the actual initializer passes. No other actionable integration or failure-assertion issue was found in static review. The reviewer did not execute browser checks; those were run locally.

Verification: build passes; 11 focused source checks pass; eight runtime cases pass at 1280 and 390/DPR2 (normal, absent manifest entry, one failed PNG, whole-row decode failure), each with zero browser errors. All eight phases and held idles are verified in every heading, default blending stays active, and the previous speed-based runtime cadence remains 19fps in this fixture. Missing art retains the original complete walking loop and a held idle. The 15-family real EnemyPool probe passes at both widths, including opposing Lawn Shepherd headings, independent frame UVs/clips/materials, tint restoration and recycling. Warmed GPU texture counts remain 30→30. All six existing E6 roster tests pass at desktop/mobile, including deterministic Lawn Shepherd herd drive and cure/wrangle outcomes.

All 24 earlier code-repair files remain exact; every other slot contract and the earlier mechanics pin are preserved. Same-era presentation pin: `277edc63389794b96d20d9df0838dbdacff4398cd17c4d2e667123b74ea8459e`. No commit, push, merge, deployment, subscription change or fire restart. Prior unrelated Hero four-frame e2e failures remain recorded; this batch does not claim a full green regression.

The 49-entry goal remains active. Seven later-epoch families still need directional art, alongside the already recorded town gaits, Hero action/age/coat work and boss phases. Factory coverage JSON and the roster ledger reflect this bounded improvement. Lawn Shepherd batch READY-FOR-GATES with the stated temporal/crowded-scene limits.

Post-parameterization Toaster control also passes at both widths (`lawn-shepherd-directions/toaster-control/results-normal.json`): 64 sources, held idle, and its hard-cut/no-ghost setting remain intact. Final engine hash matches source and `git diff --check` passes. Fire verified disabled/unloaded after all checks.


## F-SPR-20 — factory inspection used different cell cuts from extraction

`extract-alpha.mjs` slices cells at `floor(width/cols)` and `floor(height/rows)`, leaving remainder pixels unused. The factory inspector instead divided proportionally and rounded each boundary, measuring different pixels on non-divisible sheets. Its duplicate-proof and head-crop consumers reconstructed the same proportional origin rather than using the grid belonging to the saved report.

The inspector now uses the extractor's floored cell sizes for cell statistics and boundary probes, and reports unused right/bottom dimensions. Duplicate proof and head crops use the saved report's cell dimensions; historical proportional reports retain their original coordinate system, with the previous convention as fallback for older reports lacking dimensions. Existing historical reports were not rewritten.

Real-sheet proof is in `glowjack-directions/factory-grid-real/comparison.json`. Glowjack1607×979 at4×2 had vertical cuts402/804/1205 instead of401/802/1203 and horizontal490 instead of489. Toaster/Lawn1774×887 at8×4 drifted by up to5px horizontally and2px vertically. Across these three sheets69 of72 measured cell bboxes differed. The new measurements match the extractor's cell geometry. This is not a claim that all old artistic judgments were wrong; the independently floor-based cut/re-extraction checks used in earlier repairs remain valid.

`scripts/anim-pass-grid.test.mjs` executes the actual extractor, inspector, duplicate proof and head crops. It verifies divisible and remainder-bearing sheets, remainder exclusion, true-boundary detection, six identical full-resolution pairs, identical head crops, and historical cached grids with/without saved dimensions. Reverting each of the three tools independently makes the test fail. Build and four focused factory/extraction tests pass. The independent CLI review found no introduced defect in the initial grid correction; the later historical-cache handling and expanded tests were locally verified. Source/test logs, mutation results and real-art reports are retained in `glowjack-directions/`. No runtime art/source contract or engine pin changed in this batch.

## Glowjack — eight directional loops integrated

F-SPR-06 is repaired for Glowjack. Its contract now uses64 distinct frames across eight headings, with the original eight-frame loop preserved as fallback and fallback metadata corrected to its own first frame. Twenty-three native image_gen calls, exact prompts/hashes, all rejected candidates and the selected plates are recorded in `glowjack-directions/provenance.json`.

North's early frame3 support reversal and South's frame6 support error were corrected. SW now has a distinct passing pose followed by heel presentation, independently confirmed; a native NE edit removes pose-guide trouser color. Tight SE crops caused the earlier categorical wrong-leg finding to be withdrawn: screen-X is insufficient to assign anatomical legs under lantern/coat occlusion. NW/SE exact leg roots remain partly uncertain, and SW has close phase pairs with a brief dwell. These limits and the visual reasoning are in `glowjack-directions/visual-review.md`.

Actual-SpriteAnimator comparison of80/40/0ms blending found doubled boot silhouettes with both nonzero settings at19fps. The existing per-clip0 setting removes that overlap for Glowjack's directional and fallback walk loops. Shared cadence, heading transitions and simulation mechanics remain unchanged.

The existing factory is reused, including its cut-mend tool for178 neighboring-row hat pixels outside SW component owner cells. All eight final raw sheets have zero cut-crossing components. `integrated-factory-roundtrip.json` verifies all72 processed cells/metadata byte-identical; `integrated-cell-audit.json` verifies64 unique, nonempty cells, zero3px edge violet and minimum31px alpha margin. The broader excess-over16 violet scan retains41 interior pixels; this is not a zero-color claim.

Validation: all eight desktop1280/mobile390-DPR2 runtime cases pass (normal, missing entry, one decode failure, full direction decode failure), with64 normal sources, eight frames per heading,19fps, held idle, hard cuts and zero browser errors. The15-family EnemyPool checks pass at both widths, including opposing headings, separate cursors/materials, immutable UVs, tint restoration, recycling and stable31→31 textures. All six E6 gameplay tests and17 focused source checks pass; production build passes. Independent scoped Codex review found no introduced defect. All four earlier two-plate Toaster controls pass (normal/broken-row at desktop/mobile), zero errors. This Glowjack integration slice is READY-FOR-GATES.

All11 original Glowjack files, every other slot contract and24 earlier code repairs remain unchanged. Engine pin c8934045f4e1cbca2755b52e0a8ee75660722dff6c6aa10e46f2f1b74034ab80 is appended in the existing era with the mechanics pin retained. Fires are disabled/unloaded. The full49-entry goal remains active: six late-epoch directional gaps plus the previously recorded town, Hero, enemy activation and boss work remain. No commit, push, merge, deployment or factory dispatch occurred.

## Rogue Automaton — directional glitch poses integrated

F-SPR-06 is repaired for `char.e7.rogue_automaton`:64 cells across eight explicit headings replace its single-facing loop. The original loop remains fallback and its first frame now supplies its own fallback metadata. The E7 design bundle calls for deliberately mis-sequenced mechanical poses; this repair preserves that intent rather than normalizing it to a human walk.

Six native image_gen calls produced two final8×4 plates. Fresh independent review of all eight row crops found repeated pose families and crown spill; native revisions added distinct split, opposite-knee, compressed and passing poses and restored crown clearance. Final cuts are clean. Some pose families remain similar, East frame6 resembles East frame2, and tapes read as rigid perforated loops; exact whole-cell duplicates were not demonstrated. All64 extracted files are unique. Direction and machinery remain coherent, with no new high-confidence construction defect. Full observations and references are in `rogue-automaton-directions/visual-review.md`.

Actual-SpriteAnimator candidate comparisons showed the default80ms blend doubling hands and feet at19fps. Existing per-clip0 blending preserves discrete glitches. Four no-blend candidate cases and two default-blend controls passed at desktop/mobile and9.5/19fps; these are isolated playback evidence, not E7 gameplay activation. The final integrated runtime probe is separate.

Existing factory extraction at256px/scale.75/bbox centering reproduces all66 cells/metadata byte-identically. Final audit:64 nonempty cells, minimum54px alpha margin, zero3px edge violet and34 retained interior excess-over16 violet pixels. No global palette-erasure claim. All11 original files, other slot contracts,80 preceding Glowjack art files,24 earlier code repairs and102 prior engine pins remain unchanged. New engine pin09a987ee6fed03870d0434d19e27f5fe47f1e8ae395944d5adc907bb74f3d56f; mechanics pin retained.

Build and17 source checks pass. Independent scoped Codex review found no introduced issue. The runtime probe now asserts a unique contract slot for the family instead of hardcoding E6, while retaining the existing E6 boot fixture and manual animator; E7 activation is tested separately. All8 integrated runtime cases pass at1280/390-DPR2 with eight-frame19fps playback, held idle,64 normal sources, full fallback behavior and zero errors. EnemyPool passes all15 families at both widths with zero errors and stable32→32 textures, including independent body state, tint and recycling. E7 original suite reports4 passed and2 failures at its preexisting obsolete source-text guard. The isolated copy omitting only that assertion passes all6 tests(20.1s), including the remaining draw-call/error checks; original spec unchanged. Toaster controls pass at1280/390-DPR2 with64sources and zero errors. Five later-epoch directional gaps and the prior town/Hero/boss/activation work remain; the49-entry goal stays active. Fires remain disabled/unloaded. No commit, push, merge, deployment or dispatch occurred.

## F-SPR-21 — obsolete shared-animator source assertions

`e2e/e7-roster.spec.ts:107`, `e2e/e8-roster.spec.ts:108` and `e2e/e9-roster.spec.ts:108` assert the literal shared-animation loading guard removed by the F-SPR-05 per-body ownership repair. E7 fails at this string comparison on desktop/mobile after its roster/era behavior assertions; its other four cases pass. Current non-contract source with the backed-up character contract reconstructs pre-Rogue engine pin c8934045 exactly, proving this predates the new integration. The source guard must not be restored by undoing independent animation ownership.

An isolated E7 validation copy omits only that obsolete assertion, retains all behavior checks and passes6/6. Exact copy diff, original suite log and hash proof are retained under `rogue-automaton-directions/`. Existing specs remain unchanged under the project ownership constraint. E8/E9 matches are statically verified, not claimed as executed. An unqueued proposal at `tasks/PROPOSED-sprite-source-assertions-20260908.md` calls for behavior-based lazy-loading/ownership checks. The ordinary E7 gate remains red until that assertion is updated; the isolated pass is not a claim that the unchanged suite is green.

## F-SPR-06 follow-up — Data Rustler eight-direction integration

All 64 Data Rustler frames now resolve through eight registered headings. Existing factory cutting/extraction/re-extraction was reused without dispatch; 72 extracted files round-trip exactly. All 28 native outputs, rejected drafts, local leg/equipment corrections and independent verdicts are retained. Final frames measure 140–150px with minimum53px margin; zero bright edge-violet and one dark low-alpha edge pixel remain. Close poses and occluded thigh roots are documented limitations.

Paced desktop/mobile playback verifies eight dominant frames at9.5/19fps, 95/191 transitions per ten seconds, zero errors. Per-clip0 avoids visible default-blend double silhouettes. Eight integrated normal/failure cases pass; all15 pooled families pass at both widths with33→33 textures. Isolated E7 behavior tests6/6 pass17.8s, retaining all behavioral assertions while omitting the known F-SPR-21 obsolete source assertion. Original specs remain unchanged; the ordinary suite is not claimed green. Build and17 focused checks pass; independent code review found no introduced issue.

All11 originals and172 prior repairs remain byte-identical. Only this character slot and one appended visual engine pin change; all103 older pins remain. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/data-rustler-directions/review.md`, `integration-summary.json`, `preservation.json`. Fires verified disabled/unloaded. Four later-epoch flat-loop gaps and broader town/Hero/boss work remain. Full roster goal active.

## F-SPR-06 follow-up — Scrap Corsair source inspection and rejected drafts

Direct inspection finds little phase progression in the original single-facing Corsair loop. Three native East attempts remain rejected: repeated anatomical stride halves, intermittent flask loss, and a torso-plus-pose-guide attempt that still fails to establish opposite leading contact. Independent review and tight crops establish the first two defects; main inspection rejects the third. No new Corsair art is active or claimed verified. All11 original art/metadata files, current contract and engine pin are preserved. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/scrap-corsair-directions/review.md`. Next: establish an unambiguous opposite contact pose before extending the loop.

## F-SPR-22 — factory graft could erase missing source columns (fixed)

The row graft accepted a source-count mismatch, erased the whole destination row and wrote only available figures. A missing middle source cell also shifted subsequent frames. It now rejects any total/nonempty count mismatch before scaling or writing. Real-CLI negative control fails against old code; four invalid source fixtures preserve target bytes after the repair, and valid2x2-to4-column flattening/untouched-row control passes. Build2.38s and independent code review pass. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/scrap-corsair-directions/graft-safety.md`. No runtime art or engine pin changes from this guard.

## F-SPR-06 follow-up — Scrap Corsair South staged and verified

South's8frames are independently accepted after targeted leg-ownership, tag and support-shin corrections. Nine extracted files round-trip exactly; all frames160px high, minimum48px margin, zero edge-violet. Four desktop/mobile candidate playback/default-blend cases pass at9.5/19fps with95/191transitions per ten seconds and zero errors. Per-clip0 is visually preferred, still staged. Close phase pairs and higher Left lift remain documented. Eleven native outputs retained; East attempts still fail to establish a complete alternating cycle. No new Corsair runtime registration; all11originals, contract/engine and83Data Rustler final hashes preserved. Seven Corsair directions and full integration checks remain. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/scrap-corsair-directions/review.md`.

## F-SPR-06 follow-up — Scrap Corsair North staged and verified

North joins South as 16 staged frames after two-tank, rear-heel and F3/F7 leg-continuity corrections. Existing factory cut repair removed335px of claw overhang from two neighbor cells; six unaffected frames remain byte-identical. Final scan has no crossings and all18 extracted files reproduce exactly. Heights160–164px, minimum46px margin, zero bright edge-violet; three very dark edge-classified pixels retained. Final North desktop/mobile checks pass at9.5/19fps with95/191transitions and no browser errors, bringing candidate playback/control coverage to six cases. North wall durations10.004–10.355s; cadence checks use paced simulation time, not exact wall-time equality. West drafts still have grip and repeated-stride defects; diagonal review continues. No new Corsair runtime registration. Original11files, whole contract/engine,83Data Rustler sources and two graft repair sources remain unchanged. Six directions plus integration remain.

## F-SPR-06 follow-up — Scrap Corsair Northeast staged

Northeast joins South/North for24 staged frames, three directions. Independent critique confirms corrected opposing leg roles and equipment; F3 supporting-boot occlusion and close phases remain. Existing factory cut repair removed562px of claw spill into two neighbors, retaining six other frames byte-for-byte; final scan has zero crossings. All27 PNG/metadata files roundtrip exactly. NE heights152–160px, zero edge-violet. Desktop/mobile9.5/19fps checks pass,95/191transitions, zero errors; total candidate playback/control cases8. Nineteen native outputs and originals retained. Five directions and full runtime integration/fallback/E8 checks remain; no runtime activation, fires stopped and full goal active. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/scrap-corsair-directions/review.md`.

## F-SPR-06 follow-up — Northwest staged; West grips corrected

Corsair S/N/NE/NW now provide32 staged frames and36 factory-exact files. NW leg-root corrections pass independent static review;1,240px claw overhang repaired in two neighbors, final cut clean. Four other frames byte-identical; two owners differ only in seven fully transparent RGB pixels each. Visible silhouettes/alpha are unchanged in all six. NW desktop/mobile9.5/19fps playback and final mobile critique pass, total candidate cases10. Cramped leg overlap and uneven phases remain. West hand attachment now passes equipment review, but stride still held. Four directions and full integration remain;25native outputs retained, no Corsair activation. Full roster goal active, fires stopped. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/scrap-corsair-directions/review.md`.


## Factory inspection refresh — 2026-09-09

The existing sprite factory remains the implementation path: cast/prompt → native generation → cut/graft/extract/re-extract → character contract → runtime verification. Its original cast covers 18 characters and four diagonal additions; coverage of that cast does not establish coverage of every later epoch. Four late-epoch slots still lack activated directional replacements, including the staged Corsair. See `factory-provenance/coverage.json` for the explicit boundary.

Re-read the generation and graft guards and reran `node --test scripts/anim-pass-gen.test.mjs scripts/anim-pass-graft.test.mjs`: both files pass, including eight generation-provenance cases, 72 cast/direction prompts, invalid graft source preservation and valid flattened-row preservation. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/factory-provenance/check-20260909.log`. This invokes no real generation job or scheduler. Previous build and independent review evidence remain linked above; no new production code was changed in this refresh.

Confirmed `com.goldrush.fire` is disabled and absent from the user's launchd domain. The health monitor is enabled; it is a distinct service and was left as configured. No fire/queue dispatch, subscription or model changes occurred.


## Corsair Southwest candidate — factory checks pass, visual approval held

Six Southwest native iterations corrected passing poses, F4 ownership, cell spacing and subsequent F6/F7 regressions. Final source has zero cut crossings without a cut mend or graft; its eight cells measure 158–160px at scale .51, with zero edge-violet. Forty candidate frames and 45 PNG/metadata files reproduce exactly. Final Southwest desktop/mobile checks pass both cadences with eight frames, 95/191 transitions and no errors, giving 12 candidate/control cases total.

Final independent review returned no verdict after two confirmed stream disconnects. Main inspection retains a concern about the F6 lifted kneepad's shape variation. Southwest is therefore held, with only S/N/NE/NW (32 frames) independently accepted for staging. Two new West attempts also remain rejected and unused. All 33 native originals, prior 40 staged source hashes, original Corsair art/contract/engine, 83 Data Rustler sources and both graft-repair sources were verified unchanged. No Corsair replacement is activated. Full-roster goal remains active; fires stay disabled/unloaded. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/scrap-corsair-directions/review.md`.


## Corsair Southwest and Southeast accepted for staging

The previous Southwest hold is resolved: a fresh independent reviewer confirmed F6's kneecap defect; native repair restores its dome. The suspected F7→F8 leg swap was withdrawn after tracing the crossover thigh. Southeast required F6 support, F7 armor and F8 swing corrections. Both final static and rendered mobile reviews pass. Six staged directions now total48 unique frames,54 factory-exact PNG/metadata files and14 desktop/mobile playback/control cases. Each new direction shows eight frames at9.5/19fps,95/191 transitions and zero browser errors. No cut mend/graft or cross-cut fragments on either plate. Heights148–164px overall, minimum46px margin, no bright edge-violet; three previously documented dark North edge pixels retained. Exact final source/prompts and38 native outputs are retained in Corsair provenance.

Close phases, shallow SE angle and complete temporal smoothness remain limitations. No replacement Corsair art is registered; E/W and integrated E8/fallback/pool checks remain. Original11 Corsair files, whole contract/engine,83 Data Rustler sources and both graft-repair files remain unchanged. Prior40 staged source hashes were verified before saving the expanded60-file manifest.

## F-SPR-23 — E9 source margins expose clipped machinery

Current Terraformer raw F1/F2/F5/F6 have90/59/90/48 non-key pixels at their right cell edges; F8 has18 at its left edge. Direct inspection shows cropped rear equipment. The factory's existing `anim-pass-inspect.mjs` independently flags all five cells with zero margins. Drone F4/F8 have one-pixel left margins (near-clipping rather than proven missing art). The existing cut tool reports zero connected-component crossings on both, demonstrating why that check alone cannot prove complete silhouettes. No new pipeline helper was added.

Both families still expose one flat8-frame clip. Read-only evidence also captures their distinct contract/static fallback declarations and the Terraformer's faithful reuse in LanternWorldStage. Twenty current raw/processed/metadata files are hashed and unchanged. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/e9-direction-preflight/preflight.md`, factory inspection JSON and source boundary measurements. Directional replacement and full runtime review remain open. Fires stay disabled/unloaded; no commit/push/merge/deploy/queue/subscription change. Full-roster goal remains active.


## F-SPR-06 follow-up — West staged through the existing factory

Corsair now has seven independently accepted staged directions/56frames,63 factory-exact PNG/metadata files and16 desktop/mobile playback/control cases. Fifty native outputs remain preserved. West's four repaired cells use native single-frame donors placed by the existing graft helper's optional `--col`. Each operation preserves seven neighboring cells plus the unused bottom row exactly. Final cut scan clean, West158–162px/minimum47px margin, zero bright edge-violet; one dark palette edge pixel retained. Final static/rendered review passes with minor donor rendering variation and partly occluded far knee; temporal smoothness remains unproven.

The factory extension preserves whole-row behavior and the F-SPR-22 count guard. Independent review caught blank column input coercing to zero; fixed before acceptance. Real CLI checks,72 generation prompt cases, build and follow-up review pass. Prior helper bytes remain pinned in `graft-cell-original/`; current source hashes distinguish the intentional extension. East and integrated E8/fallback/pool checks remain. Original Corsair11files, whole character contract/engine and83 Data Rustler files are unchanged. Fires disabled/unloaded, goal active. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/scrap-corsair-directions/review.md` and `graft-cell-safety.md`.


## East partial repair and measured factory tolerance — 2026-09-09

East remains held; seven accepted directions/56 frames are unchanged. Fresh independent anatomy review corroborated that the original East F1/F5 repeat the same support configuration. Full dressed references repeatedly recreated that pose. A native colored pose study using the existing 3D guide exposed both hip roots; the reviewer confirmed opposite near-Right support from geometry, not just color. Gray clothing, coat and gaff were restored in separate native edits, retaining that lineage. All sources and prompts remain in provenance.

Native F5 gaff-clear and F6 recovery donors are grafted into an isolated fixture. F4's original extension was too wide; boot-only transition plus narrower gaff fits without clipping. The resulting `plate-e-frame456-tol35.png` uses three single-cell grafts, each preserving seven neighboring cells and the unused bottom row exactly. F4/F5/F6 placements are352x441 at18,24;386x441 at1,24;385x440 at1,24. Factory cut finds zero crossings; two non-key background outliers remain in the untouched bottom remainder, not character silhouette. Original runtime art remains unchanged.

`east-cell-456-preview` checks the real SpriteAnimator at1280/390,DPR2,9.5/19fps:8 frames,95/191 transitions over10.003–10.021s, no errors or blends. These checks establish loading/cadence, not visual acceptance. Independent review rejects the assembled loop: F3 lacks a passing pose; F4–F6 form a brighter yellow block with a narrower torso/smaller helmet/longer-looking legs. F4 gaff clearance passes. Whole-sheet continuity attempt regressed leg ownership and was rejected. The next isolated F5 torso-only edit preserves legs while matching the darker gray/brass treatment; its source/rendered review is in progress.

The fixed graft cutoff26 misclassified four native background border samples (maximum distance34), inflating F5 to1254px wide and causing a clipped526px placement. That output was rejected. The minimal optional `--tol` setting now permits measured35, retaining default26 and all row/cell safety. Real positive/negative CLI controls,72 prompt cases, build and independent review pass. See `graft-tolerance-safety.md` and source/preservation manifests. No alternate extraction pipeline was added.

Accepted70 staged source hashes,11 original Corsair files and83 Data Rustler sources verified exact. No Corsair runtime activation, commit, push, merge, deployment, queue or subscription changes. Fires remain disabled/unloaded (`fire-state-east-repairs.json`). Full-roster goal active.


## East accepted and Corsair directions registered

The East hold above is resolved for staging. Native F5 torso-only matching preserves the corrected right-leading support while matching the original bronze/gray appearance at normal rendered size. Adjacent F4/F6 were matched to this accepted donor. A new F3 passing pose brings the recovering thigh through beneath the pelvis. Independent source and final desktop/mobile reviews accept the assembled East: two knees/two boots, plausible partly occluded F3 root, useful F3→F4 progression, and clear gaff/boot gaps. Cooler fabric and narrower donor stance are mild, accepted variations; close phases and larger arm/gaff transitions remain motion limitations.

Final East `plate-e-final-candidate.png` uses F3/F4/F5/F6 donors recorded in provenance. F4 required measured tolerance36 for two background outliers beyond35; source border maximum36 and stable silhouette bbox are recorded in `east-frame4-background-measurement.json`. Other donors use35. All placements fit. Each graft preserves every non-target cell and bottom remainder RGBA. Factory cut has zero crossings; East8cells height156–160,min48margin,one dark edge-violet,zero bright. Nine extracted files reproduce exactly. The untouched raw remainder contains two background outliers, not clipped character art.

Eight directions/64frames are now installed and registered in the Corsair contract with per-clip hard cuts and its own original first-frame fallback. Original8fallback cells remain. All72 factory files reproduce exactly; overall height148–164,min46margin,5dark edge palette pixels,zero bright edge-violet. Seventy native originals are retained. Final East paced previews pass1280/390,DPR2,9.5/19fps,8frames95/191transitions with no errors, giving18 accepted preview/control cases total.

Integrated normal/missing-entry/broken-cell/broken-row cases pass both viewport widths:64healthy sources,8fallback sources for missing-entry,complete fallback per broken direction,held idle and19fps hard cuts. `runtime/results.json` contains8cases. Build2.56s,17focused checks pass; independent `codex-review.log` reports no introduced findings. Enemy-pool and isolated E8 behavior checks remain running as of this entry. Existing E8 source assertion F-SPR-21 is untouched; isolated copied spec omits only that obsolete shared-animation assertion and relocates imports/output paths.

`integration-preservation.json` verifies11 original Corsair art/metadata files,80 Data Rustler art/metadata files,all other character slots and104 prior engine pins. Three shared files from Data Rustler's83-file manifest intentionally change for Corsair: contract,engine pin and enemy probe expectation. Current94-file manifest includes91art/metadata plus those3shared files. Engine hash85cffbba279ddfd985ed395d7a45d96b9bd7ec3706cb09ed42c66237edc416bb,105pins. Mechanics source unchanged. No commit/push/merge/deploy/queue/subscription changes; full-roster goal active.


### Corsair integration verification complete

Enemy-pool regression passes all15families at desktop/mobile with34→34textures after warm-up, independent material/cursor/clip behavior and correct opposing Corsair headings. The six isolated E8 behavior tests pass in22.8s, including era gating,E8 stats/cure exits and no-debug boot. The source suite itself is not claimed green: its known obsolete shared-animation string assertion remains untouched (F-SPR-21). Runtime mobile boards,actual pool crop and E8 gameplay screenshot inspected; no bright violet edge seen. Build2.56s and17focused checks pass; independent code review has no introduced findings.

The full goal remains active. Corsair has directional art and verified integration, with close-phase/occluded-hip/gaff-transition limitations recorded. Crowded-scene appearance remains separate. Three late-epoch flat-loop families remain. Shambler preflight preserves11original files and confirms it is a jointed lunar rover, not a humanoid; `../shambler-directions/preflight.md` begins the next review. Fires rechecked disabled/unloaded in `fire-state-integration.json`; no commit/push/merge/deploy/dispatch.


### Shambler South/East staging: existing factory reused

Six native calls produced two staged headings/16frames. Four-legged rover anatomy is an explicit clarification of the ambiguous source. East front-leg swing was repaired with two single donors using existing factory graft; six neighboring cells and sheet remainders remain exact. Extractor handles native South alpha without a new pipeline. All16 extracted frames have zero detected violet pixels;18 processed/metadata files round-trip exactly. Four actual SpriteAnimator desktop/mobile previews pass both9.5/19fps with no errors. Static review accepts staging; minor donor material difference and continuous motion/support remain limits. See `artifacts/sol/sprite-roster-fixes-20260908/shambler-directions/review.md`.

No Shambler runtime activation: six headings and integration checks remain. Original11 Shambler files,94 current Corsair files,contract,engine and factory graft code preserved. Fires verified disabled/unloaded. Full-roster goal remains active.


### Shambler North/West staging continuation

North rear-heading failure fixed with native attachment rotation; independent extracted review clears small hip highlights as interior metal. West left-facing topology and swing poses pass static review. Thirty-two cardinal candidate frames now have0detected violet pixels and36factory outputs reproduce exactly. Eight desktop/mobile SpriteAnimator cases pass9.5/19fps95/191transitions/errors0; temporal rhythm/support remains unverified by still images. See Shambler `review.md` and `candidate-audit.json`. Four diagonal headings and integration checks remain. Contract/engine/original assets/Corsair preserved; fires disabled/unloaded, goal active.


### Shambler Northeast anatomy repair continues

Rejected fullplates with shallow heading, persistent three-leg silhouettes and foot connected to upper arm. A single four-legged NE standing reference and diagonal swing donor pass independent anatomy review; opposite swing donor generated. No new loop accepted. Existing factory dryfit fits but changing supportfootline implies2.55percent scale difference, requiring body consistency review before assembly acceptance. See shambler-directions/northeast-review.md. Prior32staged cardinalframes/runtime/contract/engine/Corsair preserved. Fires disabled/unloaded, goalactive.


### Shambler Northeast accepted; factory preserves common frame coordinates

Eight native single poses assembled pixel-exactly with existing montage tool plus validated optional --gap0. Existing grid-origin extraction at.104 preserves body position/scale; avoids2.55percent pose-specific footline scaling risk. Default montage spacing unchanged. RealCLI check/negativecontrol pass,build2.42s,independent code review nofindings. Independent fullsequence and rendered review accepts NE staging. Ten paced desktop/mobile cases acrossfiveheadings now pass; all40frames0violet,45factoryoutputs exact. Three diagonals and integration remain; continuous rhythm/support unverified. Originalassets/contract/engine/Corsair/graftcode preserved;firesdisabled/unloaded;goalactive. See Shambler northeast-review.md for current evidence and prior rejected attempts.


### Shambler eight-heading integration — 2026-09-09

F-SPR-06 source coverage is repaired for Shambler with 64 installed frames and own fallback. Final East repair separates E from SE and keeps all four leg identities stable. Existing factory extraction and re-extraction reproduce 72 outputs exactly, zero edge violet. Static and 16 paced viewport checks pass; build, 17 source checks, six isolated E8 behavior cases and scoped code review pass. All eight fallback cases and both 15-family pool checks pass (textures35→35); continuous support and gait smoothness remain unproven. Details and final status: `artifacts/sol/sprite-roster-fixes-20260908/shambler-directions/review.md`. Terraformer and Drone remain the two late-epoch flat-loop gaps; the wider 49-entry roster is not complete.


### Terraformer first-heading staging and factory centres — 2026-09-09

Original clipped equipment replaced in eight staged SW poses; no runtime activation. Default full-silhouette centring moved chassis when gantry height changed, so opt-in measured centres now preserve a fixed body reference through existing extraction/re-extraction. Independent static/rendered review, two viewport cadence checks, nine exact factory outputs, build18source checks and scoped code review pass. Remaining seven headings and rolling/terrain quality are open. See `artifacts/sol/sprite-roster-fixes-20260908/terraformer-directions/review.md`.


Terraformer continuation:32frames now staged acrossS,SW,W,N. Four views pass independent identity/framing checks, eight desktop/mobile paced cases pass,36factory outputs reproduce exactly. North frame7floating speck removed via native donor and existing montage; seven other rawcells and visible processed pixels/alpha preserved. Four headings and gameplay rolling/terrain motion remain. No runtime activation; fires disabled/unloaded. See Terraformer review.md and source manifests.


## F-SPR-24 — Unfevered E8/E9 actors receive a Fever overlay (fixed and verified)

`src/entities/pools.ts:186` classified every non-Baron/non-railcar actor as Fevered, including all four E8/E9 families. Their roster law in `specs/enemy-rosters-e6-e10.md` explicitly excludes Fever. Lit travel captures show a large pale disc obscuring Terraformer machinery and Drone wings. Shared classification now excludes the existing E8/E9 variant tables, preserving explicit watch paint and earlier Fever/surge behavior. Evidence and runnable regression: `artifacts/sol/sprite-roster-fixes-20260908/enemy-motion/`.

## F-SPR-25 — Grounded enemy art floats above actor position (open)

`src/entities/pools.ts:1793` applies a fixed .72 world-Y lift with centered sprites, regardless of authored wheel/foot support. Terrain-relative lit captures show Terraformer wheels separated from the ground position ring. Main and independent review agree. Preserve airborne Drone placement; measure grounded support points before choosing the shared anchor fix. Current travel covers seven actual headings, not eight; W target is diverted to NW by normal steering/hysteresis.

## F-SPR-26 — Human wrecker marker overlaps Terraformer machinery (open)

`src/entities/pools.ts:1469` shows sackMesh for all wreckers, with the human accessory transform at `sackLocalMatrix`. Lit E9 captures show the large brown low-poly marker crossing the detailed machine as it turns. Repair machine presentation without losing carrying/wreck-state information. Before captures and independent critique are in the enemy-motion evidence folder.

F-SPR-24 verification: build2.17s,18source checks,9family classification/matrix check,unchanged fevered-tell desktop/mobile tests pass; scoped code review has no findings. Both E9 actors recaptured at both widths and independently reviewed: discs removed. F-SPR-25/F-SPR-26 remain open. Engine pin109 preserves prior108.


### F-SPR-25/F-SPR-26 follow-up — first grounded registration verified

Shared source-specific groundContactY support now anchors current/fading sprites; Terraformer uses measured wheel support and its own original fallback support. Empty authored-wrecker accessory removed while preserving actual carrying and generic fallback tells. Build1.62s,18source checks,5runtime failure modes,2fifteen-family pool cases and independent code/visual review pass.182art files preserved. F-SPR-25 remains open for other grounded families; continuous gait, wheel rolling, shadows and mobile detail are not certified. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/enemy-grounding/review.md`.


## F-SPR-27 — Fever disc detaches from newly grounded sprites (open)

Seven more families now carry measured fixed support lines;21runtime failure modes/build/source checks pass, but grounded Toaster travel reveals the procedural Fever head disc floating above its body. `tasks/fevered-tell.md` permits existing tint/overlay channels and requires subtle glint/shimmer. Repair loaded-sprite Fever through the tint channel, preserving explicit watch paint and procedural fallback. Do not accept broad grounded visual quality until verified. Current capture run and next constraints: `artifacts/sol/sprite-roster-fixes-20260908/enemy-grounding/late-roster/review.md`.


### F-SPR-27 verified — shared sprite shimmer

Loaded sprites now receive Fever through existing tint/brightness; procedural fallback and explicit watch paint retained. Build,18source checks, ten-family state/color checks, unchanged two-project Fever tests and both15-family pool checks pass (textures37→37). All14travel captures complete; main and independent still reviews find discs removed without a new visual defect. State readability in motion, early enemy ground gaps and tiny mobile Toaster remain open. Full evidence and next shadow finding: `artifacts/sol/sprite-roster-fixes-20260908/sprite-fever-tint/review.md`.


### F-SPR-25 — five early-family registrations verified, source defects remain

Base/Thief/Rail Tough/Steam/Coal fixed source anchors reduce the rendered gap;15failure-mode cases,18source checks,build,10travel captures and both15-family pool regressions pass. Rail Tough support remains provisional due to baked purple material beneath boots. Baron not registered. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/enemy-grounding/early-roster/review.md`.

## F-SPR-28 — Early enemy rows depict the wrong facing (open)

Existing contract-backed source art: Thief walk8/se facesSW; Rail Tough walk4/n facesleft/front; Coal Thief walk4/n facesfront; Steam Wrecker walk4/n facesfront/right. Main and independent review agree. Fix source rows, not runtime facing assertions. Sources/measurements and screenshots in early-roster/source-review.md.

## F-SPR-29 — Rail Tough opaque purple shadow survives edge cleanup (open)

`assets/processed/char-railtough-sheet-walkdiag4-a-r0c0.png` contains a large burgundy crescent beneath boots, confirmed directly on beige and in desktop/mobile runtime. This is opaque source contamination, outside the narrow edge-fringe repair. Trace raw plate and existing extraction before selective repair; preserve legitimate dark clothing and inspect every sibling cell. See early-roster/rail-purple-source.png.


### F-SPR-29 verified — Rail Tough diagonal key shadows

All16diagonal cells repaired through the existing opt-in factory deshadow pass, with original raw art and centres preserved. Shadow setting now survives re-extraction.19source checks,build,15ground/fallback cases,17exact factory outputs,desktop/mobile captures and independent code/visual reviews pass. Deep-blue/unusual-key false positives found during review were fixed and retested. F-SPR-28 and broader temporal work remain open. Final evidence: `artifacts/sol/sprite-roster-fixes-20260908/rail-shadow/review.md`.

### F-SPR-28 partial repair — Rail Tough north

Rail north now uses four native rear-view poses processed through the existing factory, preserving other headings and own fallback. Build,19source checks,1728support/fallback samples,30pool cases, five exact factory outputs and desktop/mobile independent reviews pass. Steam north, Coal north, Thief southeast and complete temporal gait remain open. Existing unused B plates inspected before generation; evidence: `artifacts/sol/sprite-roster-fixes-20260908/early-north/review.md`.

### F-SPR-28 partial repair — Coal Thief north

Coal north source now faces away and retains exposed coal and supporting hand. Existing factory extraction and exact re-extraction reused; build,19source checks,1728support/fallback samples and desktop/mobile source/runtime reviews pass. Scoped code review finds no regressions. North is more upright than neighboring hunched headings; continuous turn/gait remains open. Steam north and Thief southeast remain wrong-facing source defects. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/coal-north/review.md`.

### F-SPR-28 partial repair — Steam Wrecker north

Steam north now shows rear vent and correct-side equipment, preserving crescent claws and four feet. Build,19source checks,1728support/fallback samples, exact factory outputs and desktop/mobile independent reviews pass. Brighter finish, similar planted poses and full temporal review remain open. Thief southeast remains the known unresolved wrong-facing row. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/steam-north/review.md`.

### F-SPR-28 Thief southeast staging

Mapping verified correct; raw row faces southwest. Seven native candidates retained; current identity anchor corrects satchel side/volume and southeast direction. No candidate full gait accepted: independent review confirms attempted opposite contact still leads with same right leg. Runtime untouched. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/thief-southeast/review.md`.

### Thief SE local integration — visual acceptance still open

Eight correct-facing alternating poses integrated with own fallback and16fps preserved. Runtime/support/factory/code checks pass, but desktop/mobile reveal conspicuous yellow/gold palette versus dark-brown neighboring headings. Native palette correction remains required. F-SPR-28 Thief source facing changed locally; complete visual/temporal repair unaccepted. Evidence thief-southeast/review.md.

### F-SPR-28 source-facing repairs verified

Rail north, Coal north, Steam north and Thief southeast now have corrected source headings. Thief native palette follow-up removes conspicuous gold mismatch in desktop/mobile runtime; original cadence and own fallback preserved. Full temporal animation quality remains open across the roster. Latest evidence `artifacts/sol/sprite-roster-fixes-20260908/thief-southeast/finish-runtime/` and review.md.

### F-SPR-30 — shared ground shadows disappear when sprites load

EnemyPool's load callback hid its shadow along with placeholder body parts. Restored the existing shadow, with terrain projection separate from body bob/lean and dead/dark/special exclusions preserved. Executable lifecycle check reproduced the original defect and passes after repair; build and19source checks pass. Evidence and remaining visual limits: `artifacts/sol/sprite-roster-fixes-20260908/ground-shadows/review.md`.

### Baron source cleanup staging

Two native eight-pose W/NE candidates remove baked boot-attached ground streaks. Existing factory montage/extraction reused;16cells all≥50px clear margin. Independent source review passes silhouettes/boots and cleanup, notes modest finish drift. Runtime registration and validation remain pending; production originals untouched. Evidence `artifacts/sol/sprite-roster-fixes-20260908/baron-cleanup/review.md`.

### Baron W/NE cleanup locally integrated

Sixteen cleaned poses registered through existing factory;18outputs reproduce exactly. Mixed anchor turn discontinuity found by code review corrected across all Baron directions and fallback.1728normal/failure-mode samples, final build and19source checks pass. Final visual captures include true west at bothspeeds/widths; previous W→SW fixture issue corrected. Final independent review/pool evidence in baron-cleanup/review.md. E halos, banner fallback defects and full temporal work remain open.

### Baron pale E halo repaired through factory

Raw original E plate was clean; processed assets retained pale outline and ground smear. Existing reextract refreshed32masters/32shipped cells plusmetadata;65outputs exact. Original art and new W/NE plates preserved.1728placement/fallback samples,build and19source checks pass; desktop/mobile actual travel captured. See baron-reextract/review.md. Banner fallback and temporal findings remain open.

### Baron fallback diagonals repaired

Existing approved poses assembled through factory into four true walk4 diagonals. Removes side-view aliases and baked banner/neighbor-row fragments; keeps separate banner owner.17outputs exact,1728normal/fallback samples,build19checks and independent code review pass. Forced fallback desktop/mobile banner off/on evidence in baron-banner/review.md. Separate banner/health-bar overlap and temporal quality remain open.

### Baron health-bar/banner overlap repaired

Loaded banner and standalone Baron bar now separate along camera-up with shared layout dimensions.54projected gap checks across camera angles/scales/bob pass, with banner-off/grouped/recycle guards. Build19checks and desktop/mobile captures pass. Evidence baron-banner-layout/review.md. Full temporal/crowd goal remains open.

### Teacher gait candidate and rejected clock finding

Teacher E candidate adds distinct passing poses; second native edit corrects golden palette. Existing factory stages east only with S/W/N pixel-exact preservation. Runtime/temporal acceptance pending (teacher-gait/review.md). Direct TownActor large-delta finding was rejected after actual Loop caller proof: updates cap at50ms, below125msanimation interval. Temporary clock patch and pin restored away byte-exactly; town-animation-clock/review.md records why no production timing fix remains.

### Teacher east candidate activated through existing factory

Four E frames/metadata exactly re-extract; three other raw bands and twelve other shipped cells remain unchanged. Actual TownActorRuntime covers all16frames at both widths, full town captures have no errors, 576town grounding samples pass. Build passes; engine pin125 unchanged. Distinct passing silhouettes improve the repeated E row; hidden leg alternation, S/W/N cycles and full temporal acceptance remain open. Evidence teacher-gait/review.md.

Preacher oblique N/W source selection repaired using existing B true cardinal art; eight cells reproduce exactly, other directions preserved. Runtime32frames, grounding576samples and build pass. Town patrol state audit covers actual placed nine actors at two widths over60seconds; stop/reset behavior passes. Full temporal gait still open. Evidence preacher-cardinals/review.md and town-patrol-motion/review.md.

Preacher follow-up: reused B west cell2 omitted the book. Independent review caught it; native single-cell edit restored book/grip through the existing graft/extract pipeline. Final runtime32frames and8exactfactory cells pass; full gait remains open. Supersedes the earlier no-generation statement for this repair. Evidence preacher-cardinals/runtime-final/ and provenance.json.

Assayer W/N and Teacher W corrected from existing B cardinal rows through factory montage/graft/extract. Twelve changed cells reproduce exactly; other raw/processed rows preserved, including Teacher recent E gait.64actual runtime frame samples pass at desktop/mobile. No generation; full temporal quality remains open. Evidence town-archive-cardinals/review.md.

Assayer north follow-up: sourceB N2/3 lacked ledgers. Native edits restore them and target external mauve sole marks; current candidate3 standard extraction in assay_clerk/runtime3. Temporary deshadow recipe removed; other rows remain preserved. Supersedes no-generation statement for Assayer N repair. Final cleanup/temporal acceptance remains separate.

Assayer candidate4 boot-contour repair accepted: external mauve sole marks removed in desktop/mobile review, book/tool/pose retained. Current evidence town-archive-cardinals/assay_clerk/runtime4 and visual-review-fourth.md; factory preservation, build and grounding pass. Earlier sole-cleanup-open statements are superseded. Full gait remains open. Hero south-pan candidate bounds investigated in hero-pan-cleanup/review.md; no Hero activation yet.

Hero south pan v4 remains staging-only: native identity improved and rectangle removed, but water/edge artifacts and gaze-phase drift fail review. Existing factory standard/deshadow variants checked across eight poses at both widths; deshadow damages hair without resolving all flecks. Production unchanged. Evidence hero-pan-cleanup/v4-review.md and review.md.

Hero pan staging: V5 fixes water artifacts and gaze phase; V6 neutral-key trial removes violet but leaves gray narrow gaps. Existing despill and pocket-mean24 trials do not solve them. No production activation. Detailed evidence and next decision in hero-pan-cleanup/review.md.

Hero south pan v7 activated: native cutouts remove ground rectangle and defective outflow, preserve8pan/gaze phases, align original body height via stored factory centers. Eight512cells/metadata exact re-extract; originalwork8 assets and allother runtime directions untouched. Production120timeline samples at390/1280 and19targeted checks/build pass. Pin126. Minor sleeve-edge traces and full temporal/terrain/otherHero actions remain open. Provenance and evidence: artifacts/sol/sprite-roster-fixes-20260908/hero-pan-cleanup/review.md and v7-provenance.json.

Hero pan activation final naming: char-hero-sheet-work8-south-clean-v7; same approved v7pixels, originalwork-sheet prefix retained. Newfamily excluded from first-town payload. Scoped review findings resolved;32payload/engine checks and2unchanged Hero pose e2e tests pass. Pin126 finalhash b32aaa7a7edd439d29c2504c1d765e2f888720b055af4b9a8b32a9137b846cb8. Fullpayload command separately reports pre-existing missing ceremony bundle. No deploy.

Town younger cast follow-up:160actual frame samples pass loading/anchor checks. Independent review confirms newsie east active0/1/6/7 near-repeat legs; south/north weakalternation and hand/groundflecks remain. Children show stronger step variation, with full cadence/foot-slide still open. Native eastcandidate1 rejected for same-leg A/B/A/B repetition; no productionchanges. Evidence town-young-walk/execution.md and review.md.

Newsie east legcycle repaired: nativecandidate2 pluslower-knee singlepose, factorygrafted activeE0/1/6/7 only. Fourprocessed cells/meta match factory; other28raw/processed cells preserved.32productionframes,576town grounding,480before/stagedmovingticks andbuild pass. Pin126 unchanged. Uneven arms/fulltemporal and otherdirections remain. Evidence town-young-walk/execution.md and activation-provenance.json.

Newsie south S0/1/6/7 native repair activated: sourcehand/paperholes restored,groundflecks removed,oppositefootdistinction improved. Factory4selectedcells/meta; previousEpreserved; combined8S/Efactoryoutputs match and24othercells unchanged.32runtimeframes,576grounding andbuild pass; pin126unchanged. Phase/sharpnessvariation,fullcadence andN/Wremain. Evidence town-young-walk/south-provenance.json and execution.md.


Newsie north N0/1/6/7 repair activated via the existing factory: corrected rear satchel/strap side, alternate heel poses and clean boot shafts. Independent visual review passes; 32 desktop/mobile production frames, 576 grounding checks and build pass. Twelve S/E/N cells now factory-matched; other 20 preserved. Pin126 unchanged, fires disabled. West art and continuous-motion review remain open. Evidence: town-young-walk/north-provenance.json, north-candidate5-review.md and execution.md.


West source review: ground strokes/beige leg-gap region and braid damage confirmed. Native cleanup returned output moderation rejection; no candidate or production change. Existing factory deshadow also leaves these artifacts and was rejected for activation. Evidence: town-young-walk/west-review.md and west-deshadow-comparison.png. West remains open.


Children east continuous grid diagnostic:480 production-rate ticks plus480 staged16fps ticks, all8keys/zeroerrors. Next-pose boot shifts largely compensate held-pose sliding; no cadence change justified yet. Boy pose order/phase spacing needs closer assessment. Production unchanged. See town-young-walk/execution.md, children-ground-motion-comparison.json and children-ground-motion-review.md.


Boy east: source phase/order issue confirmed;16fps candidate not accepted. Native8-pose replacement also rejected for repeated broad strides/missing passing poses. Production unchanged. Evidence town-young-walk/boy-east-source-order.png, boy-east-provenance.json and execution.md. Individual support/passing poses require repair.


Boy east assembled cycle V2 staged: three native poses plus five originals,8fps retained,64runtime frames/240motionticks pass. Recovery palette/arm corrected; full-cycle review pending. Production unchanged. See town-young-walk/boy-cycle-provenance.json and execution.md.


Boy24fps review: first stance improves to~155pxretreat vs167pxtravel, while opposite stance appears to overcompensate (~200pxvs146px, lowertrackingconfidence). Noactivationapproval. Staged elapsed-frame catch-up restores47expectedadvances at20Hz; original8fpsproduction unchanged. Source asymmetry/finish andall-directiontiming remainopen. Evidence town-young-walk/boy-cycle-24fps-review.md and boy-cycle-cadence-metrics.json.


Boy actual town scale measured:~45CSSpx atframing1/~119CSSpx atclosest.36, both390/1280DPR2. Remaining stance mismatch is relevant atplayablezoom; screenshots have storyoverlay and are not foot-contactapproval. Evidence town-young-walk/boy-town-scale/visible-scale.json and execution.md.


Boy V4 contact correction staged; onlyE4changedfromV3,waistcenterupdatedfornewsource.24/30fpscomparisons and20Hzcatchup passloading/timing, visualstanceapprovalpending. Productionunchanged. Evidence town-young-walk/boy-cycle-v4-provenance.json,boy-cycle-v4-timing.json andexecution.md.


Boy V5 staged: supportbootprogression andpassingarm corrected, onlyE2/E5changedfromV4.240runtimeframes pass; correctlytimed2svideo saved. Visualapprovalpending; productionunchanged. Evidence town-young-walk/boy-cycle-v5-provenance.json andexecution.md.


BoyV6lateposepalette match staged; onlyE6/E7changedfromV5,240runtimeframes pass, timedvideoavailable. Visualapproval/otherheadingcadences remainopen; productionunchanged. Evidence town-young-walk/boy-cycle-v6-provenance.json andexecution.md.


### Boy W6 forearm alpha restoration

Shipped char-youngster-m-sheet-walk8-r1c6.png had a forearm hole absent from raw art. Exact factory reextraction restores326 alpha values with identical RGB. Only this cell activated; raw/meta/31siblings preserved.240 desktop/mobile runtime ticks and build pass. Evidence: artifacts/sol/sprite-roster-fixes-20260908/town-young-walk/boy-west6-repair.md. East candidateV8 remains staged and full-roster goal active.


Recovered boy S/W/N:24nativevideo poses now staged using cachedU2Net and existingfactory.720desktop/mobileticks pass correctdirections/anchors/zeroerrors; cadenceandfullmotion stillunapproved. Evidence: artifacts/sol/sprite-roster-fixes-20260908/town-young-walk/boy-recovered-cardinals-review.md. No productionactivation.


## 2026-09-09 — Pip original-video cycles activated

All32 poses recovered through the existing factory, S/N aligned to E/W,26fps on unchanged patrol. Shared town clock catches up at legal low frame rates.2880 production diagnostic patrol ticks across desktop/mobile and60/20Hz,576 grounding samples, six cadence cases,19 source tests and build pass; scoped independent review found no actionable defects. Full-roster and crowded-town/terrain temporal review remain open. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/town-young-walk/boy-recovered-activation-review.md`. Earlier Pip staged-only/W6 notes are superseded by this activation.


## 2026-09-09 — Juniper original-video recovery staged

All32 poses recovered with existing factory; W/S half-cycle alignment, E2 ground-tail matte correction.3360 desktop/mobile patrol ticks at60/20Hz pass with24fps staged. Production unchanged; activation and final cadence review pending. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/town-young-walk/girl-recovered-review.md`.


## 2026-09-09 — Juniper recovered cycles activated

All32 recovered original-video poses active; W/S phase-aligned, E2 ground tail removed,24fps on unchanged patrol.3360 production desktop/mobile ticks at60/20Hz,576 grounding samples,19 source tests, build and independent review pass. Pin128 preserves all earlier pins. PNG delta+822,582bytes; existing missing release-script declaration still prevents total payload computation. Full-roster goal remains open. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/town-young-walk/girl-recovered-activation-review.md`.


## Hero variants — 2026-09-09

160 existing walk4 cells inventoried;96 aged Claim-Day cells missing. Direction/gait/color/framing defects F-HVAR-1..5 documented;10 age-binding tests pass, which does not validate visuals. Native elderB candidate rejected and not activated. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/review.md`.

### Hero silver/elder E0 residue correction

Removed 19/7 isolated raw boundary pixels causing bbox-centering displacement; activated only two E0 cells and matching source/metadata. Build, 10 age-binding tests, four-frame runtime checks at390/1280 and independent scoped review pass. Remaining elder height variation and gait defects stay open. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/east-residue/`; full limitations in `hero-variant-audit/review.md`.

### Detached-component census expanded to1,944 character-family PNGs

21 leads:13 drone alpha1 residues with fixed body centres,4 legacy Hero flecks,4 opaque Baron walk4 B-row2 fragments below boots. Current young NE uses newer walkdiag8 sources; no claim that legacy flecks affect normal NE walking. Baron raw-boundary cleanup is the next concrete repair candidate. Evidence and scope limitations: `artifacts/sol/sprite-roster-fixes-20260908/detached-residue-review.md`.

### Elder opposite-contact geometry improved; Baron scope corrected

Five sequential native edits now retain the opposite physical leading leg, plausible backward/occluded free arm and compatible body proportions. Independent review still rejects assembly because the final finish is glossier and more golden than contact1. Staging lineage: `hero-variant-audit/elder-sw-generation-provenance.json`. Baron walk4 B row2 fragments are on unused historical frames; current cardinal/diagonal fallback bindings avoid them, so the prior repair recommendation is superseded. No production changes this pass.

### Elder southwest direction and four-pose row activated

Correct-facing native row now alternates physical support legs and uses forward/neutral/back/neutral free-arm progression. Factory alignment and alpha checks, production390/1280 playback, build,10age tests and scoped independent review pass. Evidence: `hero-variant-audit/elder-sw-activation.json` and `review.md`. Runtime inter-frame blending visibly ghosts in one capture; compare80msdefault with discrete cels before claiming smoothness/foot-lock. Full-roster goal remains open.

### F-HVAR-6 — Hero walk4 inter-frame ghosting repaired

80msdefault overlays create duplicate limbs and outlines across discrete poses. Existing clip override0 now applies to8Hero walk4 directions; no global/fps/asset/runtime-code changes.48aged-direction cases preserve turn fades and eliminate frame overlays.13source checks, build,10age tests and real game390/1280 checks pass. Independent review’s registry-head finding corrected. Evidence: `hero-variant-audit/blend-comparison/review.md`. Full-roster temporal approval remains open.

## Bandit, Coal Thief and Lawn Shepherd frame ghosting

Disabled inter-frame blending for20directional walk clips after matched west-facing80/0captures and independent visual review. All40direction/viewport runtime checks preserve source cycles and direction fades;13source checks and build pass; scoped code review found no actionable defects. Engine pin130. Evidence and limitations: `artifacts/sol/sprite-roster-fixes-20260908/frame-blend-roster/review.md`. Other families and broader motion quality remain open.

## Thief, Rail Tough and Steam Wrecker walk ghosting

Repaired 20 directional walk clips through existing frameBlendMs settings. Matched west-pose comparisons and independent visual review confirm doubled silhouettes disappear without source content loss. All 40 runtime direction/viewport checks, eight source checks, build and scoped code review pass. Engine pin 131. Evidence and limits: `artifacts/sol/sprite-roster-fixes-20260908/frame-blend-enemies-2/review.md`. Complete gait and other remaining families are still open.

## Baron and Prospector pose ghosting

Repaired eight Baron clips and four grid-derived Prospector direction overrides, inherited by all three coats. Matched phase inspection confirms doubled outlines; 64 runtime direction/viewport cases, eight source checks, final build and both scoped code reviews pass. Pins132/133. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/frame-blend-baron-prospector/review.md`. Default young Hero walk8 blend remains to inspect; full-roster animation quality is not closed.

## Default young Hero walk8 ghosting

Added eight existing contract blend overrides for cardinals/diagonals.16runtime direction/viewport cases,13source checks,10age tests,build and scoped code review pass. Engine pin134. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/frame-blend-young-hero/review.md`. Independent visual review also confirms source brown strips under boots, including a raised boot; that defect and separate action blends remain open.

## Hero authored actions: pan ghosting repaired, attack cutout defect isolated

Inspected all four authored pan directions and the sole authored attack direction. Final code disables only pan frame blends; attack remains unchanged because blending briefly masks missing weapon pixels.10runtime cases,13source checks,final build and2gameplay pose tests pass. Raw attack cells retain substantially more weapon than processed sprites. Evidence, review scope and remaining W/E/N pan defects: `artifacts/sol/sprite-roster-fixes-20260908/frame-blend-hero-actions/review.md`. Pin135.

## Hero east attack weapon cutout repaired

Factory U2Net matte was tested and rejected because it removes the rig. Activated one native six-phase keyed plate through existing extraction/centres, preserving old art. Rig remains connected throughout charge/discharge/recoil/recovery.6cells exact-regenerate;2runtime half-second cases,2gameplay tests,18source checks,build and32payload/engine checks pass. ReviewP2missing claim-only payload exclusion fixed. Full payload measurement retains the pre-existing missing ceremony-bundle blocker. Pin136. Evidence/provenance: `artifacts/sol/sprite-roster-fixes-20260908/hero-attack-cutout/review.md`. Other directions, aged action identity and broader roster remain open.

## Hero west pan recovered through the existing factory

Recovered all eight west-facing pan cutouts from retained original RGB using the existing cached U2Net matte and alpha extractor. Only west pan frame bindings changed; eight-frame 8fps timing and claim gating remain. Bowl holes are restored; independent visual review accepts the cutout with original square-ended pouring streams still a quality concern. Exact regeneration of all eight PNGs and metadata passes, as do 41 source/payload/engine checks, build, two gameplay pose tests and mobile/desktop runtime captures. Scoped code review found no actionable issue. Engine pin137. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-pan-west/review.md`. East/north pan and full-roster review remain open; fires remain paused.

## East/north pan recovery candidates rejected; native north staged

Factory matte tested on all13active source cells. Independent review rejects pale edges, discontinuous streams and north prop artifacts. Two native north plates retained; v1 clean cutout passes two180tick runtime cases but lacks teal accessory and sufficient pan rocking; v2 accessory size/attachment still wrong. No production activation. Evidence and next correction: `artifacts/sol/sprite-roster-fixes-20260908/hero-pan-east-north/review.md`. Fires verified disabled; full roster goal stays active.

## North original-pose cleanup staged and visually accepted

Rejected redesignv3 for opposite-side pan jump. Native cleanup of original seven poses, followed by removal of lamp-area white wedges, produces original-clean-v2. Independent visual review accepts cutout/identity/pose pattern. Two180tick staged runtime cases pass, seven cels have zero opaque purple/border pixels. Small height variation and real-game adjacent-direction validation remain before activation. No production change. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-pan-east-north/review.md`.

## North pan cleanup activated

Seven original-pose native cleanup frames now replace north-only bindings. Actual-game N/E/N/W/N settled-pose checks pass at390/1280; exact regeneration,41source checks,build,2gameplay pose tests and scoped CLI review pass. Pin138; PNG payload +11891bytes. Small height variation and broader temporal/terrain review remain. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-pan-east-north/review.md`. East pan and complete roster goal remain open.

## East pan cleanup activated

Six native original-pose cleanup frames remove arm-gap white remnants and ragged pan/ground edges. Exact regeneration, corrected41sourcechecks,build,2gameplay tests and staged/production390/1280 E/N/E/W/E checks pass. Independent activation review finds no defect. Retired oldpanfamily required dynamic-family correction to deferred-group negative test. Pin139,PNGbytes−191494. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-pan-east/review.md`. All four pan directions repaired; full-roster motion/identity work remains.

## F-HMAKE-VIS-1 — Homemaker phase visibility blockers

Six fresh desktop/mobile act1/2/3 captures confirm central cream obstruction, lower-body diagonal occlusion and oversized pictogram; chair state unreadable despite correct morph diagnostics. GLB base origin and sampled heights do not explain full obstruction. Investigate simultaneous pooled component visuals with scene isolation before changing model height/art. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/homemaker-visual/review.md`. No production change this pass.

## F-HMAKE-VIS-1 causal isolation

Actual scene ray hits and reversible hide/show identify six-vein-control-pylon and GlowMesaTerrain as central/lower obstructions. Removing both exposes ordinary character sprites beneath the model; pooled component ownership also needs repair. Earlier imported Terrain height sample inference is invalid because it used a separate Vite module instance. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/homemaker-visual/scene-probe.json`, `no-pylon-390.png`, `no-terrain-pylon-390.png`. Production unchanged.

## F-HMAKE-VIS-1 correction — pooled rendering is not defective

Actual sprite inventory identifies a legitimate Glowjack and Hero; withdraw the earlier redundant-component suppression proposal. Candidate initial anchor(-12,-18) clears pylon/terrain in inspected mobile act1; all six candidate phase captures complete without browser errors. Label height8.2 clears roof but overlaps mobile HUD, so a lower placement is under test. Production unchanged; combat and persistence checks remain required. Evidence and limitations: `artifacts/sol/sprite-roster-fixes-20260908/homemaker-visual/review.md`.

## F-HMAKE-VIS-1 local placement repair — pin140

Homemaker initial anchor moves to(-12,-18), clear of pylon and raised terrain. Smaller status plate above-left clears roof and mobile victory banner in inspected phases. Build,54 source checks,2 production desktop/mobile gameplay cases,12 production/normal-speed phase captures and independent code review pass. Saved anchors preserved; old chairs are not migrated. Full simulation regression, fallback appearance and model damage/grounding remain open. See homemaker-visual/review.md and activation.json. Goal remains active.

## Homemaker fallback facing and intact evidence — pin141

Fallback chair backrest moved behind seat, correcting reversed facing. Six failed-GLB placeholder phases, two explicitly all-intact model captures, five engine-era checks and build pass. Earlier Act1 captures already had a damaged rack; they were not fully intact proof. Shutdown disk and hose are authored geometry, not duplicate render artifacts. Shading, grounding, companion intersections, close intact roof/label gap and full simulation regression remain open. Evidence: homemaker-visual/review.md and fallback-activation.json.

## Homemaker grounding candidate

Whole-material dimming rejected after six phase captures and independent comparison: silhouette worsens without fixing the hose. Existing blob-shadow pass excludes 3D models. A browser-only contact ellipse using the landmark recipe yields modest mobile grounding improvement with no new artifact; cyan diagnostic confirms its ground placement. Lifecycle/arrival/fallback sizing must pass before activation. Production remains pin141; full simulation regression remains open. Evidence: homemaker-visual/review.md.

## Homemaker contact grounding activated — pin142

Presentation-owned contact ellipse follows machine visibility/position/disposal, with smaller fallback-chair footprint. Twelve model/fallback phase cases,40 moving-position checks,4 hide/disposal cases,build and11 source checks pass. Independent code/visual reviews find no new defect; improvement is modest. Full3348-test regression remains unrun; hose/companion/label-spacing quality items remain open. Evidence: homemaker-visual/contact-activation.json and review.md. Full roster goal active.

## F-CLAW-VIS-1 — buried crew ladders and phase readability

Eight clear desktop/mobile inspection states and4 adapted gameplay cases establish the current Salvage Claw model. Actual morphed geometry plus Blender groups identify both crew ladders0.524 below terrain in the landed state. Factory candidate preserves base geometry/materials/atlas and raises only those ladder morphs to0.0156 runtime clearance;2 candidate gameplay cases pass. Not activated yet. Dark body, weak phase distinction, mobile contact and front health-bar overlap remain open. Evidence: artifacts/sol/sprite-roster-fixes-20260908/salvage-claw-visual/review.md. Full roster goal active; production pin142 preserved.

## F-CLAW-VIS-1 ladder grounding repaired locally

Existing factory derives ladder drop from normalized geometry, removing0.524 runtime burial. Production GLB, reviewed candidate and Blender re-export are byte-identical; only crown ladder POSITION morph coordinates change. Base geometry/atlas unchanged;4 production gameplay cases andbuild pass. Overhead images cannot fully certify ladder attachments/rung visibility, which remain to inspect. Other Salvage Claw visual findings andfull regression remain open. Evidence: salvage-claw-visual/activation.json andreview.md. Engine pin142 unchanged; goal active.


## Shared drone idle — pin161

Missing idle clips froze drone wings on stopping. Existing8frames now animate at8fps in all9 clip groups;4 desktop/mobile cases, build and5 engine guards pass. Prior maintenance-pair overlap inference withdrawn after actor-count verification: that screenshot contained one survivor; corrected2-actor capture shows separation. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/drone-hover/activation.json`. Full50-row roster goal remains active.


## Railcar — factory reuse and marker repair, pin164

Three generic sack overlays removed from painted Railcar fallback. Six final desktop/mobile loaded/Lite/failed phase cases, build,5 engine guards and192 source controls pass. Independent review caught a cabin/hit-target mismatch in a proposed heading flip; that change is withdrawn. Factory has no wheel cycle, and fallback composition/material/mobile issues remain. Existing complete cutout is available for evaluation. See `artifacts/sol/sprite-roster-fixes-20260908/railcar-visual/review.md`; full-roster goal active.


### Town shadow perimeter repaired —2026-09-10

Town cast and player reuse their existing instanced circles with vertex-alpha feathering. No texture or extra draw call; day/night render checks, old-code negative control, build, five engine guards, four town tests and independent review pass. Exact individual-boot contact and run-world shadows remain separate. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/town-activation/soft-shadow/review.md`.


### F-HERO-GROUND — padded aged Hero floats above its base

check-contact.mjs renders exact SpriteAnimator frames against a fixed ground line; after orientation fade settles, current north alpha-bottom lies0.2424–0.2496world units above the nominal base (sprite y0.9, height1.85). Candidatev2 lies0.2677–0.2749above. The line and settled tick63/69/75/82captures expose this gap. Tick0still contains the expected orientation crossfade and is not pure north evidence.

check-actual-hero-contact.mjs repeats with the actual Hero class at RUN_CAST_SCALE1.5, its actual generated sprite and procedural motion. Across120ticks at each390/1280 width, the current north visible-bottom gap relative to Hero.group is0.36358–0.40939; candidate0.40157–0.44735. Procedural bob ranges approximately0–0.035local, so it cannot explain the baseline gap. Both run allfourkeys with zero browser errors. Frame alpha threshold89matches the material0.35clip; calculation uses current atlasUVregion and actual world scale2.775. This is a fixed horizontal inspection camera and flat origin, not a claim that perspective pixels represent vertical world coordinates in the ordinary tilted camera.

Root: Hero attaches every generated sprite at fixed localy0.9 with centered pivot, irrespective of the transparent padding of the selected aged sheet. SpriteAnimator exposes authored groundContactY but Hero does not consume it. EnemyPool already uses authored contacts and independently anchors the overlay. The shared frame atlas preserves the full padded cell. A new north plate alone cannot fix this.

Next priority: supply/verify Hero frame support lines and consume them for the base and orientation overlay, preserving gait bob semantics deliberately. Cover all active age/skin/action paths and fallback; do not blindly use the lowest painted pixel when a pan/tool extends beneath a planted boot. Candidatev2 remains unactivated while this owner-level grounding issue is addressed. Contact/kicking interpretation is not solved by moving a screenshot line.


### Hero padding gap repaired —2026-09-10

Hero now anchors the base and fade to inspected per-frame support lines. The measured Elder north0.36world-unit baseline gap is removed, preserving gait bob.259metadata values audited;16runtimecontexts/227actualkeys,784overlays,10age tests,build and independent review pass. See `artifacts/sol/sprite-roster-fixes-20260908/hero-ground-contact/review.md`. Candidate north art remains staged; gait and full terrain approval remain open.


### Elder north replacement activated —2026-09-10

Four direct-rear alternating poses replace the oblique/repeated north row, using existing factory graft/extraction and reviewed support lines. Other12 cells preserved;10 age tests,build,five engine guards and mobile/desktop playback pass. Gait polish and neighboring headings remain open. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-north-current/review.md`.


### Current Elder full-direction audit —2026-09-10

All32currentwalkcells/16mobile-desktopcontexts confirm support grounding; independent inspection identifies six remaining nonalternating old rows, wrong NW facing and accessory continuity concerns. NW native repairs remain unactivated after visual rejection. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-heading-continuity/review.md`.


### Elder northwest repair activated —2026-09-10
Rear-left facing and genuine physical leg alternation now replace the front-left repeated row. Fourcells/supports only;N/SW/W preserved. Factoryreproduction,build,5guards,10age tests and390/1280playback pass. FiveotherElderrows/fullgait remainopen. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-heading-continuity/review.md`.


### Elder west walk —2026-09-10
Four native alternating poses activated through existing factory graft/extraction and centre controls; other12 B-sheet cells preserved. Exact reproduction,259supports,build,5guards,10age tests and390/1280gameplay pass. Sources and remaining texture/timing/terrain limits: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-west-current/review.md`. Elder NE/E/S/SE and full roster remain open.


### Elder northeast diagnostic work —2026-09-10
Current gameplay resolves allfourframes at390/1280 without errors, but old art repeats one stride. Native fullplate and first opposite-contact rejected for pan hand-switching. Corrected fourpose diagnostic now alternates visible support and preserves right-hand pan/right-hip satchel; independent review requires more compact passing poses before activation. No production changes. Sources, hashes and next action: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-northeast-current/review.md`.


### Elder northeast activated —2026-09-10
Four native alternating poses replace A-sheet row3, keeping right-hand pan/right-hip satchel and restored gray braid. Existing factory centres align head spread0.68px;0visibleviolet and432/432/432/433support. Other12cells preserved. Exactreproduction,259supports,build,5guards,10age tests and390/1280gameplay pass. Sourceprovenance and remaining heel-lift/terrain/turn limits: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-northeast-current/review.md`. Pin178; no commits/deploy/fire restart.


### Elder east activated —2026-09-10
Four native east-profile poses replace A-sheetrow2 with alternating contact/support, attached right-handpan/rightpouch and corrected phase3 trouserdetail. Existing factory alignment: headspread0.81px,352pxheight,432/512support,0visibleviolet. Other12cells preserved including NE. Exactreproduction,259supports,build,5guards,10age tests and390/1280production pass. Sourceprovenance, capture-route correction and remaining gait/terrain limits: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-east-current/review.md`. Pin179; firesdisabled.


### Elder south activated —2026-09-10
Four frontal alternating contact/support poses replace A-sheetrow0, with relaxed advancing boot pitch and one common source scale. Other12cells/255contacts preserved. Exact factoryreproduction,259supports,build,5guards,10age tests and390/1280gameplay pass. Two near-black half-alpha candidates inspected, no brightviolet fringe. Sourceprovenance, terrain-boundary capture correction and remaining gait/outline limits: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-south-current/review.md`. Pin180; SE and fullroster remainopen; firesdisabled.


### Elder southeast activated —2026-09-10
Four southeast alternating contact/support poses replace A-sheetrow1, including right-arm/pan counter-swing and consistent single front bag closure. Native source edits reused existing factory, common scale and centres. Other12cells/255contacts preserved. Exact reproduction,259supports,build,5guards,10age tests31.7s and390/1280gameplay pass. Capture sampling race corrected in artifact script; exact phase plates use controlled renderer. Two near-black color candidates inspected, no brightviolet fringe. Sources, rejected cumulative-edit texture candidates and remaining arm/cadence/turn/terrain limits: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-southeast-current/review.md`. Pin181; all8Elder headings have alternating sources, fullcontinuity and broaderroster remainopen. Firesdisabled.

### Storekeeper cardinal and idle checkpoint —2026-09-10, pin183
S/E/N24 repaired from retained complete cycles, common west scale and integer sampling; prior W8 preserved. One native idle edit plants both boots, wired through existing idle support. Exactreproduction, build,5guards,4town tests, actual390/1280playback, stop/resume/8heading contracts and200towncaptures pass. Independent source/visual/code reviews recorded. Shared contact-shadow fit, sourcegrain/palette, foot sliding/cadence, turn/alias continuity and the broader roster remain open. Report: `artifacts/sol/sprite-roster-fixes-20260908/town-gait-followup/storekeeper-cardinal-current/review.md`. Next clear separate correction: Elder SW hand/hip/costume continuity recorded in `hero-variant-audit/elder-heading-continuity/pin181-all-heading-critique.md`. Fullgoal active; firesdisabled; no publication.


### Elder southwest repaired — 2026-09-11 ICT, pin185
Native four-pose edits repair right-hand pan/right-hip satchel, wrist-length coat/pendant, physical alternation and the SW three-quarter view. The pin184 intermediate view was too frontal; pin185 corrects it. Existing factory graft/extraction reused. Other12 B cells and255 contacts preserved. Exact reproduction,259supports,build,5guards,10age tests32.6s,480grounded samples and390/1280production playback pass. One dark half-alpha candidate inspected; no tested brightviolet fringe. Sources/prompts/hashes and full limits: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-southwest-current/angle-correction/review.md`. N palette, trouser-fabric continuity, restrained upper-body motion and full turn/terrain/roster work remain open. Firesdisabled; no publication.

### F-SPR-31 — P2 — Elder neighboring views still change palette and trouser material
`assets/processed/char-hero-elder-sheet-walk4-b-r0c0.png` (N) is visibly duller than its neighboring NW/NE views. W/N/NW trousers have conspicuous gold ornament while S/SE/SW are predominantly brown. An all-heading plate and fresh independent critique reproduce this after the SW direction/prop repair. Evidence: `hero-variant-audit/elder-southwest-current/angle-correction/all-headings-staged.png` and `visual-review.md` under the roster evidence directory. Next: align these existing source materials without changing physical pose/scale/props, then inspect animated turns. SW upper-body/pan motion is also restrained; static pose acceptance does not close gait/cadence/terrain review.


### Elder north palette repaired — 2026-09-11 ICT
One native color edit of the verified active candidate2 source brings the rear coat closer to neighboring gold views. Existing factory graft/extraction reused; other12 B cells and all259 runtime contacts unchanged. Exact reproduction,259supports,build,5guards,10age tests32.4s,480grounded samples and390/1280ordinary playback pass. Full filename matching fixes a capture-script ambiguity with south0; failed evidence retained. Engine remains atpin185. N palette subcase of F-SPR-31 repaired; boot/tread forms, trouser material, upper-body motion and continuous turn/terrain/full-roster work stay open. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-north-palette/review.md`. Firesdisabled; no publication.


### Schoolteacher west cycle repaired — 2026-09-11 ICT
Four native contact/recovery poses replace row1 through the existing factory; the other twelve PNGs, cell entries and three raw bands stay byte-identical. Saved baseline reference prevents cumulative graft scaling; saved centres keep head spread under 0.43px. Exact native-source graft/extraction, build, five guards, four town tests, 576 grounding samples, 240 installed runtime ticks and both-width normal-town captures pass. Independent visual review retains minor recovery/hidden-leg limits; independent code review finds no introduced defect. Engine remains at pin185. Sources, rejected candidates, commands and limits: `artifacts/sol/sprite-roster-fixes-20260908/town-gait-followup/schoolteacher-current/review.md`. Stationary walking-pose hold F-SPR-32, S/N gait, turns, shadow/crowd work and the full roster remain open. Fires disabled; no publication.

### F-SPR-32 — repaired at pin186 — Schoolteacher fixed post freezes a walking pose

Before pin186, Nora's fixed schoolhouse post reused east walking0 while facing southeast. The pre-fix normal-town captures show an extended boot held indefinitely. The separate native planted idle now uses the existing generic idle loader; the post behavior and all sixteen walking cells are preserved. Source, prompts, factory reproduction, transition/grounding checks and current town captures: `artifacts/sol/sprite-roster-fixes-20260908/town-gait-followup/schoolteacher-current/idle/review.md`. This closes the stationary-pose defect; F-SPR-33 ordering and the broader roster remain open.


### Schoolteacher planted idle repaired — 2026-09-11 ICT, pin186
A native edit replaces the fixed post's held walk0 with a separate planted idle through the existing generic town loader. All sixteen walking PNGs, raw sheet and metadata are preserved. Existing extraction/minification and saved centres reproduce the313px figure,413px support and0.04px head alignment to east walk0. Build, five guards,576 grounding samples,240 runtime ticks, eight-heading stop/resume at390/1280 and the four town tests pass; an initial Tavernkeeper timing timeout did not recur when tests ran alone. Independent code review found no introduced idle defect. F-SPR-32 is repaired. Normal town review confirmed F-SPR-33: NPCs can cover a nearer hero because their render layer wins over distance. Sources, prompts, failures, visual limits and remaining whole-roster work: `artifacts/sol/sprite-roster-fixes-20260908/town-gait-followup/schoolteacher-current/idle/review.md`. Fires remain disabled; no publication.

### F-SPR-33 — repaired at pin187 — Town NPCs override the nearer hero in transparent sorting

All nine full-body walking NPCs now use Hero's gameplay layer; Prospector and portrait NPCs keep companion ordering. Auto-created SpriteAnimator fades share their body's layer, avoiding a second inversion when the farther Hero turns. Baseline162/324 pair mismatches became0/324 in full and0/324 in lite, at390/1280, three camera angles, both near/far arrangements and idle/walk/real orientation fades. The NPC-only candidate still failed the farther-Hero turn at both widths. Normal town screenshots and fresh visual critique agree with the installed fix. Existing576 grounding samples, companion/portrait compatibility, build, five guards, four town tests and twelve Hero age/fallback/fade tests pass. Independent scoped code review found no supported introduced defect; it did not rerun the tests. Exact scoped diff, failures, verification and remaining limits: `artifacts/sol/sprite-roster-fixes-20260908/town-depth-order/review.md`.

### F-SPR-34 — P2 — Young Hero baked ground strips repaired locally at pin188

The64-frame sweep expanded the original E0 finding to40 affected cells: S/W/E tan residue and SW/NE pink ground strips. Five native cleanup plates now replace those40 cells and masters through the existing factory. Other24 cells/master pairs and raw bands remain unchanged; all259 contacts match actual visible boots, retiring the historical eight S boot-over-shadow overrides. Added an explicit all-palette option to the existing despill-only routine for inspected palettes; default edge-only behavior is preserved. Native sources, exact reproduction, visual findings and final gates: `artifacts/sol/sprite-roster-fixes-20260908/hero-boot-residue/review.md`. This repairs the painted floor; enlarged seam appearance and gait/shadow quality remain F-SPR-36.

### F-SPR-35 — P3 — Rectangular ground patches remain visible in town

The independent critic identified rectangular brown patches near cacti and the left fence in the normal390/1280 town images; the same patches are visible before the sprite-order fix. They resemble transparent card boundaries, but the owning mesh/material and intended role have not yet been traced. Evidence: `town-depth-order/visual-review.md`, baseline and production full-town captures. Inspect ownership and blending before attributing them to a particular shadow system. This adjacent scene defect is recorded, not repaired by new character art.

### F-SPR-36 — P2 — Young Hero gait progression and enlarged leg finish remain open

Both fresh critics identify three main east poses repeated through eight cells:0/3/6,1/4/7,2/5; the eight-cell wrap does not form a regular three-pose sequence. SW/NE leading-leg variation and upper-body motion are limited. Exact phases are retained in `hero-boot-residue/runtime-production/`; a dedicated temporal gait pass is still needed before claiming a visible hitch or approval. The current idle holds a stepping pose and the soft contact shadow plus existing procedural bob can suggest hovering, despite verified boot anchors. Enlarged S0/S7 details still read faintly mauve to the critic after numeric key-chroma removal; this is not conspicuous in either full-town image, but remains a visual limitation. A sixth native S source attempt retained narrow gaps and was not activated. Do not broaden global color removal to force a pass. Repair/review the source gait and leg finish together, then verify all eight headings, stop/resume, contact shadow and turns. Evidence: `hero-boot-residue/visual-review.md`, final40-frame boards, full/cropped town evidence and the retained unused S2 plate.

F-SPR-34 gates: build,5engine guards,9character/clip guards, factory fixtures,259contacts,1920runtime ticks and full/lite town pass. Browser regression12passed/2failed; both static failures hard-code the superseded Thief SE and Baron NE filenames already in the saved pre-activation registry. Evidence `hero-boot-residue/outlaw-test-baseline.json`; existing e2e assertion update remains with the orchestrator. No broad gate-pass claim.

Independent F-SPR-34 code review completed: no supported introduced defect. It verified default despill compatibility, scoped hashes, contacts, registry/history and current pin188; accepted the preexisting static-test attribution. Browser/build evidence was inspected, not independently rerun. Full visual/roster acceptance remains open.


### F-SPR-37 — P2 — Newsie west background residue repaired locally
Four active west frames recovered from the original factory video cache. Combined existing U2Net and conservative border-key masks remove boot floor strokes, the leg pocket and W6 braid gap while retaining original RGB. A first model-only candidate failed independent visual review and was rejected. Other 28 raw/processed cells and metadata entries remain unchanged. Pin188 unchanged. Six exact factory outputs, 32 installed pose samples, 240 moving ticks, 5760 normal full/lite route ticks, build, five engine guards, two direction guards and four town tests pass. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/town-newsie-west-recovery/review.md`.

### F-SPR-38 — P2 — Newsie route intersects the pan monument
`src/town/townsfolk.ts:209` composes Mei's patrol from the tavern radial trail; `src/town/townLayout.ts:152` places the pan monument at the same center used by radial paths. At both widths the actual placed actor spends 112 consecutive ticks inside its radius0.68 footprint and approaches within0.0025 world units of its center. The normal full-town screenshots hide her there. Later unobscured crops establish clean sprites, not a repaired route. Correct the placed path and verify ordinary full/lite patrol visibility before closing. Evidence: `town-newsie-west-recovery/route-obstruction.json` and full/cropped town captures.

### F-SPR-39 — P2 — Newsie holds a walking pose during the long stop
`src/town/TownScene.ts:3393` settles her to W0 after0.15s; the source W0 has a trailing lifted boot. Actual route ticks1200–1380 remain stationary in that pose. Existing four-phase selection and8fps timing were preserved by the cleanup, and stills/state checks do not establish planted-foot locking or natural cadence. Review the idle source and continuous motion across all four headings, turns and follow behavior. Evidence: `town-newsie-west-recovery/visual-review.md` and installed runtime/route results.

F-SPR-37 independent review: Independent scoped Codex review completed (session 01a08d1c-01d0-73b1-9e9f-8587962ea0d4): no supported introduced defect. Read-only checks confirmed all six activation hashes, 28 preserved sibling cells, provenance, runtime mapping, scale, alpha and metadata. It did not rerun reproduction/build/browser checks or establish cadence, foot locking or physical-device behavior. Full animation approval remains open.

### F-SPR-38 repaired — Newsie turns before the monument, pin189
Default patrol now omits the plaza-center point using the existing Prospector route pattern. Duration16s preserves walking speed within1.1%; tavern endpoint and4s pause remain. Closest sampled center distance improves from0.002435 to1.158796; the all-loop geometric guard fails before and passes installed. Build,5engine guards,5760 consecutive full/lite desktop/mobile route ticks pass. Existing town suite6passed/2storage failures; an artifact copy serving the saved original route reproduces the same storage assertion. Fresh visual critique accepts remaining pan-rim overlap as plausible depth occlusion. Follow/return steering and F-SPR-39 remain open. Exact changes, preserved art/history, rejected captures and evidence: `artifacts/sol/sprite-roster-fixes-20260908/town-newsie-route/review.md`.

### F-SPR-40 — P2 — Newsie dialogue portrait is registered to Pip's art
`src/town/townsfolk.ts:199` assigns Newsie the same `youngsterAPortraitUrl` as Pip at159. The URL resolves to `assets/processed/townsfolk-youngster-a.png`, visually a curly-haired boy in tan/brown clothing, unlike Mei's braid and teal jacket. `src/town/TownScene.ts:1801` directly consumes this URL for the bark portrait and1822 retries it. This establishes the registration/consumer mismatch; actual dialogue activation, era coverage and a suitable factory source still need inspection. No portrait asset or registration was changed in the route fix.

Independent scoped Codex review completed (session 01a08d36-7585-7bc3-918f-888d000bdddd): no supported introduced defect. It independently checked activation hashes, continuous geometric clearance, runtime consumers, both engine hashes and all188 preserved prior pins. The original-route desktop result supports a preexisting storage issue; TS-04 is not fully green and its later console-error assertion is not reached. Build/browser results were inspected, not rerun. Welcome/return steering, full animation and full-roster approval remain outside this verdict.

### F-SPR-40 repaired — Mei has a readable portrait, pin190
One native edit of the retained turnaround now supplies the town dialogue and registered E1 story portrait. The first reused walk-frame candidate fixed identity but failed actual-size readability; the native bust passes fresh visual review in both layouts at390/1280. Existing full-bleed384px factory processing repeats byte-exact. All189 earlier pins and50 baseline files, including walking art and all nine later-era Mei portraits, are preserved. Regular build, six guards, four town tests and both-width plain dialogue/renderer fixtures pass. Source, exact prompt, provenance, activation hashes and release limitations: `artifacts/sol/sprite-roster-fixes-20260908/town-newsie-portrait/review.md`.

### F-SPR-41 — P3 — Mobile story card overlaps the touch stick
At390×844, the settled story card covers the stick's upper arc and slightly clips its yellow knob. The portrait itself remains unobscured. Fresh visual critique and the saved original-portrait renderer fixture reproduce the overlap; this is not introduced by F-SPR-40. Story layout is `src/story/story.css:16`, touch-stick placement is `src/styles.css:891` and its mobile override at1791. Verify current active story beats and input usability before changing shared layout. Evidence: `town-newsie-portrait/before/390-story-full.png`, current production counterpart and `visual-review.md` under the roster artifact root. An earlier apparent washed-out portrait was an entrance-transition capture error, corrected by waiting for opacity1; it is not an asset defect.

### F-SPR-42 — P1 — E1 release guard rejects later-era portrait assets
The current `GR_RELEASE=e1 npm run build:release` compiles and processes assets, then `scripts/assert-release-build.mjs:55` rejects85 later-era filenames. A separate Vite build supplying the saved original townsfolk/speakers/payload modules reproduces the exact guard failure with the same85 names; no live source rollback was used. The portrait declarations in `src/story/speakers.ts` and release transform in `vite.config.ts:141` need a release-scoped review. Do not remove the guard or later-era art. Evidence: `town-newsie-portrait/release-comparison.json`, `baseline-release.mjs` and both release logs. The first-town reporter also measures50,203,925 declared bytes including355,216 for the new portrait; that reporter's success is declaration coverage, not a payload-budget pass.

Independent scoped Codex review completed (session 01a08d4e-1009-75c0-831a-3eefdf3f45c8): no actionable introduced defect. It independently verified baseline/installed hashes, portrait registrations and PNG decoding, provenance/reproduction hashes, single355,216-byte payload emission, both engine hashes, all189 prior pins and50 unchanged files. The two release outputs contain the same85 rejected later-era names. Build/browser evidence and saved images were reviewed, not rerun; story fixture, physical-device and payload-budget limits remain explicit.

### F-SPR-39 idle repaired — Mei has four planted stopping views, pin191
Existing factory extraction/centering/despill processes one native four-view plate. Shared idle selection now uses cardinal rows when present and retains row0 for existing single-pose actors. Walk frames, frameMap,8fps, route, travel setting and pause preserved. Build, six guards, four existing town tests,576 walking samples,32 stop/resume checks, four missing-idle fallbacks,16 browser stop headings and5760 placed patrol updates pass; reproduction byte-exact. Independent visual review accepts installed full/lite390/1280 integration. Artistic cadence, foot locking and natural welcome/return steering remain open. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/town-newsie-idle/review.md`.

### F-SPR-43 — P2 — Lite building facades visibly intersect plain shell roofs
Fresh visual critique and primary inspection show detailed facade cards over large box roofs/backplates with hard exposed seams in `town-newsie-idle/town-production-lite/1280-idle-r1c0.png`. The current `createShell` in `src/town/TownScene.ts:4595` combines the painted front plane at4629 with plain side/back boxes and pitched roof slabs at4678; this entire function is unchanged against the saved pin190 baseline. This is a separate preexisting lite presentation issue, not an idle-art defect. Inspect at default player framing and across all lite buildings before choosing a source/geometry correction. No building change is included in F-SPR-39.

F-SPR-39 independent review: Independent scoped Codex review completed (session 01a08d68-ce12-7d12-9c56-f7a8b7f3a330): no actionable introduced defect. Read-only checks independently confirm installed/baseline hashes, preserved history, contract grounding, stop/resume selection, deferred-load protection, missing-idle fallback and the old-row discriminator. Builds, browser suites and generation were not rerun by the reviewer; full gait, physical-device, natural welcome/return, release/payload and F-SPR-41/42/43 limits remain open.

### F-SPR-44 — P2 — Elder walk cells retain painted floor and eroded skirt hems
The installed32 female Elder cells retain brown floor hatching beneath boots, most evident in south/north rows, and damaged side-view skirt edges. Original960px decoded frames remain under `assets/motion-pilot/production-elder-woman/frames/`; the selected down/up take3 and left/right take1 sources are the factory's approved woman, not the archived bearded sheet. Existing cached U2Net masking plus row graft/extraction is being verified against the original samples. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/town-elder-recovery/row-0-comparison.png` through `row-3-comparison.png`, source/selection and baseline hashes. Scope preserves the original video sample order; temporal gait acceptance remains separate.

### F-SPR-45 — P2 — Elder fixed post holds a stride pose
`src/town/townsfolk.ts` places Elder Rowan at a stationary south-facing schoolhouse post, while `src/town/TownScene.ts` supplies only walk metadata and therefore holds south0. Before captures show a boot held forward indefinitely. Recovered south1 is a balanced retained pose suitable for the existing single-pose idle metadata path. Baseline existing Elder e2e4/4 pass; their literal walk0 and exact old silhouette-height expectations will become stale when the repaired source/idle is installed. Keep those protected specs unchanged and report any resulting failure explicitly. Candidate and actual-town review remain in `town-elder-recovery/`.

F-SPR-44/45 repaired locally at pin192. All32 registered female Elder walk cells recovered from retained factory frames, with complete hems/boots and no conspicuous floor/fringe; south1 supplies a planted idle at the unchanged fixed post. Existing factory output reproduces35 processed files exactly. Regular build, six engine/route guards,576 walking/grounding samples,40 stop/resume checks, four missing-idle fallbacks,64 installed directional frame samples,240 moving ticks and16 stop headings pass. Full/lite390/1280 installed captures keep the entire Elder silhouette visible with zero errors. Existing town suite4/4 and adapted Elder artifact canary4/4 pass. Protected original Elder canary is4/4 failed on superseded minimum-height/idle literals, after a4/4 baseline; source left unchanged. Exact evidence and remaining enlarged softness/pose wobble, chalk, full gait and UI/release limits: `artifacts/sol/sprite-roster-fixes-20260908/town-elder-recovery/review.md`. Independent code review follows.

F-SPR-44/45 independent review completed (`01a08d88-8e8f-7453-b615-3c3a8e7ce8e0`): no additional actionable production defect. P2 integration blocker confirmed: protected Elder test expectations need update; artifact copy is outside the standard gate. Exact four-literal/comment patch is `town-elder-recovery/protected-canary-expectations.patch`, unapplied under existing-e2e ownership. Do not call the standard gate green or integrate before that update. Source/runtime/art recovery remains verified; entire roster goal continues.

### F-SPR-46 — P2 — Preacher hat fragment and interior violet flecks survived edge cleanup
The current Preacher east0 has an opaque pink triangle above its hat plus smaller rear-brim marks. Fresh source review independently confirms it. Small violet residues also remain in the Preacher's front thigh/hand gaps and Clerk's rear ledger-hand boundary, beyond the earlier conservative edge-only cleanup. The exact32-cell baseline, crop evidence and native east0 cleanup candidate are in `town-post-idles/`. Both inspected palettes are sepia with no intentional violet; existing opt-in all-palette despill is staged with exact alpha preservation, independently from the triangle shape repair. Other source poses and prop repairs are preserved.

### F-SPR-47 — P2 — Preacher and Clerk fixed posts freeze advancing steps
Both `TownScene` entries supply walk-only metadata while `townsfolk.ts` places each at a stationary south-facing post. All four front source poses retain staggered stepping legs; fresh still review finds no unambiguous planted stance. Two native single-pose candidates are staged through the existing generic idle path and factory graft/extractor, preserving the characters, props, existing walk timing and post definitions. The candidate was subsequently activated and verified as recorded below.

### F-SPR-48 — P3 — Assay Office proximity cards cover the Clerk on mobile

At390px, approaching the Assay Office at its building-relative `(1,4.5)` camera destination places the Clerk behind the normal proximity prompt; only boots remain visible. Confirmed in ordinary plain-URL and debug captures, and in the pre-activation full-town baseline. A building note and lingering Tavernkeeper card compound the occupied area. `src/town/TownScene.ts` supplies the normal prompt; unchanged DOM layout, not sprite alpha/depth, causes this occlusion. Evidence: `town-post-idles/town-staged-full-plain/390-assay_clerk-ui.png`, `town-before-full/390-assay_clerk-ui.png` and `visual-review.md`. Open UI follow-up, related to F-SPR-41; canvas visibility ratio1 is not a normal UI pass.

F-SPR-46/47 repaired locally at pin193. Seven native walk-cell cleanups and two planted idles reuse the existing factory; all32 walk poses inspected,4 raw/38 processed files reproduce byte-exact. Build, six guards,576 walk samples,56 idle checks, four fallback cases,64 installed browser frames,480 moving ticks and32 stop headings pass. Plain full/lite390/1280 captures load all10 actors with zero errors; mobile Clerk UI obstruction remains F-SPR-48. Existing town suite initially3/4 with a mobile5s readiness timeout; unchanged isolated retry recorded separately. Prior protected Elder expectations and release/payload limits remain unresolved. Full evidence and exact resume state: `artifacts/sol/sprite-roster-fixes-20260908/town-post-idles/review.md`. Full gait and broader roster remain open.

F-SPR-46/47 gate follow-up: exact failed mobile town boot test passed unchanged on one isolated retry (15.1s); initial5s readiness timeout retained. No claim of a clean4/4 run. Protected Elder canary and F-SPR-48 remain open.
