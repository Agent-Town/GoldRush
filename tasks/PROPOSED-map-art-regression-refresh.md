> ⛔ PROPOSAL, NOT A MASTER — DO NOT QUEUE. A design note from Astra's map campaign (sol/map-art-inventory-20260908 883a3521e, landed as era 6 on 2026-09-14); it has no role line, no pre-flight, no goal leaf, and never ran. A fire authors a real master from it only on an owner word (bannered attended 2026-09-14 so task-guard-audit reads it for what it is).

# Map-art regression fixture refresh

These are proposed updates to protected e2e files. They do not establish full map playability or concept fidelity.

## Blast zero-height fixture

`e2e/blast-relief-height.spec.ts` assumes the loaded Claim sculpt crosses height zero at x=0,z=0..12. The current ford is above zero there; repeated failures read0.326921m. The fixture also samples before the sculpt-ready boundary.

Apply the reviewed-by-execution candidate patch at `artifacts/map-art-repairs-20260908/blast-zero-fixture-01/proposal.patch`: wait for ready terrain and require a bracketed zero crossing across existing bank columns. It preserves the raised-ground, flat impact-offset and deterministic simulation assertions. The copied suite passes4/4 desktop/mobile: `blast-zero-fixture-01/test.log`. Original file remains unchanged.

## Night lighting fixture

`artifacts/map-art-repairs-20260908/night-lighting-integration-01/proposed-e2e.patch` reconciles the deliberate fog distances, actual hero position, material tint space and isolated enemy contribution with current rendering. The copied suite passes18/18 desktop/mobile. Read `test-owner-handoff.md` in that folder for the measurement errors each change corrects. Original `e2e/e1-night-shift.spec.ts` remains unchanged.

## Still unresolved

Hill Mine's exact equality between analytic and rendered creek height fails identically with before/current dependency metadata. No patch is proposed for that assertion until the intended visual/simulation relationship is checked. Broader replay, engine-identity and fixture failures recorded in the readiness ledger remain open.

## E2 pressure fuel census

The fuel-duration repair changes `Balance.boilerHouse.coalSeconds` from12 to36 to make the authored waves8–12 pressure window fuel-feasible. Independent review confirmed the existing E2 census still pins12. Apply `artifacts/map-art-repairs-20260908/pressure-fuel-budget-01/census-02.patch` with this repair; it preserves the explicit manifest assertion at36. Protected original unchanged; copied census verification is pending. Broader regression and engine identity remain required.

The first copied census run reached a second stale assertion: it expected the retired elevation dependency warning. Revision02 also asserts that `engineDependencies` is absent, matching the separately verified elevation-dependency retirement. The original eight failing results remain in `pressure-fuel-budget-01/census.log`; revision02 results are in `census-02.log`.

Revision02 census verification completed: **8 passed (3.3m)** across desktop/mobile project configurations. Original protected census remains unchanged. The integration patch is `pressure-fuel-budget-01/census-02.patch`; preserve both assertions when applying it.

## Opaque sculpt edge metadata

Blackout review confirms the old night alpha rim reveals the scene background because painted ground is hidden. The shared night terrain repair retains pool lighting but removes that transparency gap; the published `data-terrain3d-pilot-skirt-blend` now reads `opaque-sculpt-edge`. The protected `e2e/terrain3d-registry.spec.ts:281` still expects `painted-underlay-alpha-rim`. Refresh this expected presentation value and verify all registered maps still load, with night rim screenshots showing no exposed background band. Existing e2e file has not been edited. Evidence: `artifacts/map-art-repairs-20260908/blackout-render-repair-01/`.


## Correct the registry panorama coverage claim

The target is readable map-specific scenery with the lighting and silhouettes required by each concept plate. Increasing a statistic in a patch of ordinary ground does not establish that target.

The existing `e2e/terrain3d-registry.spec.ts` rim/horizon test samples the central 17–83% of image width and 3–22% of height at spawn. For Night Shift, Relay Valley, Dome Basin and Ember Shore, the existing `farGroundProbe` identifies 84.23–100% of those sampled pixels as terrain on desktop/mobile. It identifies zero panorama and zero continuation-apron pixels. The panorama-only control also yields zero panorama pixels in that sample region, while the canvas confirms panorama materials were repainted. This conclusion concerns this sample region and these spawn poses; it does not claim the panorama is invisible everywhere.

All 16 captures completed with no page errors. `receipt.json` contains surface counts and the positive-control material receipts; `probe.mjs` reproduces them. `../blackout-render-repair-01/horizon-inspection06/` contains the untinted views. Those views remain dark/coarse and are not visually accepted. The earlier >8 threshold fails with both prior and current terrain code, as recorded in `../blackout-render-repair-01/horizon-baseline-comparison.json`.

The protected test remains unchanged. Retain its seam check, but replace the unsupported panorama-readability claim with explicit surface/camera coverage: verify asset loading separately; establish visible surface coverage at agreed player-accessible camera poses before judging detail; assess night visibility under both unlit and player-lit conditions. Do not simply lower the variance threshold, brighten the entire scene to satisfy it, or claim that asset loading proves concept fidelity. Full map visual review and native objective/persistence checks remain required.

Reproduce: `PATH=/opt/homebrew/bin:$PATH node artifacts/map-art-repairs-20260908/horizon-surface-census-01/probe.mjs`.

## Dry Gulch spring repair 16 — obsolete damp-cover gate

`e2e/shore-truth.spec.ts:31,44` reads `terrain3dPilotSpringPondDampGroundRadii` and requires a radius larger than the gameplay pool. Repair 16 removes the obsolete brown cover and its diagnostics entirely. Do not restore a fake radius to satisfy the old test. Replace the cover assertion with absence of the retired cover diagnostic, retaining visual/simulation radius equality, inside/outside zone classification, shore adjacency and actual sluice placement.

Runnable scoped copy: `artifacts/map-art-repairs-20260908/dry-gulch-spring-integration-16/shore.spec.ts`; desktop/mobile PASS (2 tests). Its config and output are adjacent. Runtime `capture-grounded.mjs` additionally checks the actual scene has no `SpringPondDampGround`, radius is 1.4, the bank rises above water at 16 samples, and six reed roots coincide with the visual height sampler. The protected original has not been edited and remains incompatible until the orchestrator applies this update; sibling-map portions must be retained when updating the original. These controlled fixtures do not prove native full objective completion.

## Lighting12 verification refresh

The current two-file lighting repair passes build, cross-map state/coverage checks and independent code review. Original E3Moth/day-night:10/10pass. Original protected Night Shift:3pass/15fail; known fog/sampling drift and additional timeouts remain, so the original suite is not green.

The previously prepared Night Shift proposal was copied to `artifacts/map-art-repairs-20260908/moth-season-light-integration-12/proposed-night.spec.ts` and has passing evidence for18unique cases across17initial passes plus2focused passes. It adds an accelerated-save fixture correction: wait for a saved wave at least1, freeze immediately, and verify restoration equals the captured saved wave. This preserves all lantern state/cost/rotation assertions and avoids40x timing assumptions. The protected e2e source remains unchanged. See `test-owner-handoff.md` and logs in the same artifact folder before integrating any test refresh.

## Full census baseline20 before Moth atlas/emission change

A copied, unmodified-in-logic47-case map census completed on current production presentation. All47 test functions completed, but14 of42 map rows contain nonpassing cells: the test records these failures without asserting the table. Therefore runner success is insufficient acceptance evidence. The Moth baseline row passes all checked cells. Candidate comparison is pending. Preserve original e2e source; the baseline table and parsed cells live in artifacts/map-art-repairs-20260908/moth-season-census-20/before-table.md and before-summary.json.

Triage table cells against current contracts before refreshing expectations: Drill Yard intentionally uses painted rendering with no mounted landmarks; Mare/Eclipse glass makes the blanket unlit-material flag suspect; preview timeouts need direct flow evidence; Ember Shore brightness0.059 needs visual/ROI inspection. These interpretations do not dismiss the failures or certify the other rows.

## Rendered-height preview evidence24

The two screenPoint calls in previewProbe currently projectY0 while the ray intersects sculpted relief. A copied spec using terrainVisualY resolves11 MQ1 baseline failures, including Dry Gulch, Baron, Hill Mine and Dome Basin. Original ghostXZ/height assertions are retained. The change is not ready for blind integration: Regatta/Flotilla use boat interaction surfaces and now time out; Low Orbit reports ghostY0 versus visualY0.24. Keep these domain-specific failures visible and verify the actual interaction-surface owner before editing the protected test. Evidence: artifacts/map-art-repairs-20260908/census-visual-height-24/summary.json.

## Latest terminal checks — 2026-09-10

Baron native desktop 01 failed at wave 17: the prospector died during a repair perimeter approach. Six earned buildings and three repairs preceded the failure; boss defeat, secure, bank and reload are unproved. Evidence: `artifacts/map-art-repairs-20260908/player-entry-focused-baron-native-desktop-01/checks.json`. This is a failed playthrough, not yet a diagnosed runtime defect.

Visible-surface census 26 completed all 47 runner cases. Every available map contract passed preview position and height, including Regatta/Flotilla; Low Orbit mobile passed. Projecting the pointer at the actual top interaction surface resolves the earlier relief/water targeting mismatch without changing runtime or protected assertions. The table still contains brightness/material, framing and load-time failures; archive-world and river are unavailable. No blanket green or full-playability claim. Evidence: `artifacts/map-art-repairs-20260908/census-visible-surface-26/table.md` and `summary.json`.

## Harvest-free census correction — 2026-09-10

The prior census's “contract unavailable” labels for Archive World and The River were stale test assumptions, not current launch failures. Its `isAvailable` checked only the empty seam array, while `src/meta/ContractFamilies.ts:1364` also permits the authored `harvestFreeObjective` declaration. A copied diagnostic test now mirrors that predicate; the protected test is unchanged.

Focused census 27 ran three cases: Archive World passes all recorded desktop cells. The River boots and passes render, preview position/height and depenetration on desktop/mobile; its band expectation fails on both. These direct debug-launch fixtures do not prove the intended finale lever, archive light-hold/lore persistence, or full player objectives. Evidence: `artifacts/map-art-repairs-20260908/census-harvest-free-27/table.md`, `summary.json`.

Current source still declares archiveWingZones/lightHoldSites but the `src/` search finds no light-hold consumer; the build-authorized restoration spec remains the next implementation authority. River's intended finale path is `E10FinaleSystem.launchRiver` → post-credits charter → staged `the-claim` lineage, distinct from direct e10-river debug entry. Keep these paths separate in completion evidence.

Baron native desktop02 is running with repair routes outside the headframe and travel telemetry. Driver/evidence: `artifacts/map-art-repairs-20260908/baron-native-02.mjs` and `player-entry-focused-baron-native-desktop-02/`. No production gameplay changes in these diagnostic corrections.

### EN-01 briefing precondition — 2026-09-10
The copied regression53 passes all six desktop/mobile tests after clicking the real Begin button before in-run ledger pause assertions. Regression52 failed those two assertions while the briefing was visible. Integrate that startup precondition into protected EN-01 when the orchestrator refreshes tests; preserve every assertion. Evidence: `artifacts/map-art-repairs-20260908/archive-ledger-regression-53/run.log`.

## Current E2 prover and authored-start collision audit98

Historical artifacts/e2-railcar-arsenal/prover.mjs uses removed HOLD and admissionProbe. Current96 removes the bypass but fails on the obsolete verb. Current97 substitutes legal hero movement and reveals the Trestle start inside its boiler collider; current99 uses the verified walkable south approach and remains in live play. These are current validation experiments, not admission updates. Preserve historical evidence.

Audit98 checks42 starts, finds6 landmark overlaps; Trestle is directly confirmed through Terrain.sample. Findings and repair surface are in artifacts/map-art-repairs-20260908/spawn-landmark-audit-98/findings.md. Boat/convoy overrides mean other overlap rows are not automatically broken. Refresh the current E2 route only after legal-verb terminal and replay/native evidence.


## E9 dependency labels still contradict live consumers (110)

Verified current source: SeedCaravanSystem.create is wired in Game:1732 and HeadlessContractSim:1069; ScheduledRelocationSystem.create in Game:837 and HeadlessContractSim:1092; CanalChoiceSystem.create in Game:827 and HeadlessContractSim:1075. The owning A8/A9/A10 reviews explicitly record that their `missing` labels were false after implementation. ContractFamilies:1824 now accepts `landed` with landedBy, so the old schema limitation no longer applies.

The three E9 contract descriptions and dependency rows still claim these consumers are absent. er01-e9-census.spec.ts:91 explicitly pins status missing; its opening comment still claims the schema has no other status. This is metadata/test debt, not proof of completed map gameplay.

Proposed bounded factory slice: update only those three dependency rows to landed with their owning A8/A9/A10 slices; replace their obsolete descriptions with the authored gameplay intent; update the census expectation/comment to require the accurate status without removing objective assertions. Retain the nonempty dependency declarations while their twist paths remain in DECLARED_INERT_PATHS. Verify both consumer instantiation and census, then continue separate native objectives/persistence. Existing e2e edits are reserved by this task's AGENTS contract, so no census edit or contradictory partial status edit was made here.


## Build trigger pointer focus151

A normal pointer click to open/close Build left its trigger focused. Subsequent Space both reached game confirm and natively clicked the trigger, reopening placement during Hollow's gathering/capture flow. `src/ui/BuildButton.ts` now blurs only pointer-origin clicks (`event.detail > 0`); keyboard activation retains focus. Native reproduction before151 fails and after151 passes; independent mouse/touch/keyboard Enter/Space/Tab checks plus build pass. Hollow desktop152 then completes its full objective/bank/reload.

When refreshing protected browser tests, retain the runnable sequence from `artifacts/map-art-repairs-20260908/build-focus-151.mjs`: pointer open/close, Space must leave build mode closed, keyboard focus+Enter must open the menu and keep focus. No existing e2e spec was edited here.


Ember169 regression proposal: keep the existing protected tests intact until orchestrator integration. Add current production desktop/mobile maximum-zoom corner coverage for the terrain-to-panorama join, plus the shore-rack view; assert mounted continuation, zero load/page errors, unchanged gameplay/pointer bounds and disposal of the cloned texture. Runnable proof already exists in `artifacts/map-art-repairs-20260908/ember-edge-integration-169/after/capture.mjs`; before/after captures and exact renderer costs are adjacent. This guard covers scenery coverage, not full map art acceptance.

Showroom171: when refreshing protected `e2e/run-suspend.spec.ts`, change `writeSuspend` to write the fixture's explicit Robin profile key: `[profileDataKey('robin', RUN_SUSPEND_KEY), raw]`. After menu navigation, an unscoped write may lose to the already-existing scoped snapshot. Original copies13pass/3fail; before171 source reproduces both legacy and boundary reload failures on both viewports. The one-line writer correction passes4/4 while retaining all assertions. Runnable copies, before-source server and diagnostics: `artifacts/map-art-repairs-20260908/showroom-persistence-171/`. No existing e2e was edited. The dedicated `check.mjs` also guards five/six capture restore, actual reload, new run reset, malformed inputs, wrong-owner refusal, legacy absence and shared future-state projection.
