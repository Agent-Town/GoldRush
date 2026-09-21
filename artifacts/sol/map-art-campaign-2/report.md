# Map art campaign 2 — E5 candidate held at verification

2026-09-19. **No map is finished or accepted. No implementation commit.** The ordered campaign cannot advance past the shared E5 pass with the mandatory E5 gates red. The task forbids changing simulation code and existing e2e assertions; neither has been changed. This note is the no-op explanation and resumption handoff required by the task.

The unfinished render source has been reverted and its exact candidate preserved under `_raw/`, as the task requires. The restored engine hash equals the original base. The two base mobile probes both timed out before the final assertion; candidate texture-error attribution remains inconclusive. This is an evidence-only handoff, not a completed art release.

## Checkout and provenance

- Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/lane-c--20260919-185452-sol-map-art-campaign-2.md`.
- Worktree: `/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-c`; branch `sol/map-art-campaign-2`.
- Base: `2fbae0611befc25465a279e70be4310ca1c21b80`.
- Preflight found a clean `feat/hero-move-verb` at `5b3c45754`, contained in main with no ahead work. Created the task branch from main. Nothing discarded. Install and initial default build returned 0; post-build status was clean.
- Node 26 via `/opt/homebrew/bin`; Vite only on port 5303. Browser tests use the external dev server, desktop/mobile Chrome, one worker, traces off.
- Original 5b60 campaign tree was read-only. Its F42 panorama sampling correction and Claim Boat candidate 13 proportions remain authoritative. The rejected alpha-to-coverage sprite experiment was not repeated.
- No asset pack, mount, gameplay contract, height sampler, sprite, character, HUD, or engine pin was edited. No still image was generated. Boards only compose the existing plates and unretouched browser captures.

## Candidate and bounded visual verdict

The source experiment is confined to `src/world/Water.ts` and the sea rendering in `src/world/Terrain3dClaimPilot.ts`. A new `e2e/e5-sea-contact.spec.ts` verifies the four E5 mounts. No existing test changed.

| Defect | Candidate verdict and evidence |
| --- | --- |
| Bright repeated sea obscures reef/settlement | **IMPROVED, not accepted.** Two incommensurate samples break the single 20 m repeat; texture weight 0.35 to 0.10, opacity 0.72 to 0.56. Stillwater uses 0.25 to 0.06 and 0.78 to 0.62. In the frozen Deepwater diagnostic, quiet-water texture RMS falls 1.8271 to 0.7040 (**61.5%**); this is a fixed-region spatial measure, not an animation quality score. |
| Submerged landmark readability | **IMPROVED.** Same-page, frozen-simulation drowned-office roof texture RMS rises 2.7800 to 3.4340 (**23.5%**). Full settlement/reef concept correspondence remains **HELD**; the plain boat boot alone cannot demonstrate it. |
| Texture-density seam at panorama apron | **IMPROVED.** Route 768 existing submerged panorama triangles through the seabed atlas at its world scale. Independent Regatta review finds most of the diagonal panel contrast jump removed, but a faint line remains. No geometry positions move. |
| Hull/water contact | **IMPROVED.** A narrow feathered strip follows the actual hull/sea intersection and inherits its existing visual parent's transform/visibility. The initial continuous white outline was rejected; the revised version is softer and discontinuous. Claim Boat adds 1,804 triangles and one draw; Flotilla adds 516 triangles per hull. Review still finds edging rather than convincing displaced water. |
| Wave shape and full depth/contact acceptance | **HELD.** Fine olive stippling remains; the concept's broad swells, currents and foam around obstacles are not demonstrated. No full concept acceptance claimed. |
| Boat crane/material identity | **HELD by firewall.** The actual sculpture/materials are in `assets/pilots/claim-boat-3d/**` and `src/world/ClaimBoatView.ts`, outside the task's allowed files. Flotilla bodies likewise live outside the allowed asset directory. No workaround was injected into the terrain renderer to repaint unrelated boat parts. |
| Actor contact, player silhouette | **HELD.** Actor depth/fade ownership and character assets are outside this pass. The earlier alpha-to-coverage experiment broke other sprite consumers. |
| Framing, mobile wreck notices/HUD | **HELD.** Boat framing still dominates portrait view; HUD/text occlusion is excluded by the task. |

There are no FIXED or ACCEPTED visual claims in this run. Shared E5 experiments do not constitute four completed map passes.

Primary boards:

- [Deepwater desktop](e5-deepwater-claim/board-1280.png), [Deepwater phone](e5-deepwater-claim/board-390.png): existing concept, original plain boot, final plain candidate.
- [Deepwater frozen diagnostic](e5-deepwater-claim/final-station-board-1280.png), [phone diagnostic](e5-deepwater-claim/final-station-board-390.png), [measured crops](e5-deepwater-claim/final-station-metrics.json). These are explicitly debug/frozen stations, not plain boots.
- [Regatta desktop](e5-regatta/board-1280.png), [Regatta phone](e5-regatta/board-390.png), [independent visual verdict](e5-regatta/independent-visual-review.md). These assess the shared apron/contact experiment, not a completed Regatta pass.

The plain final Deepwater and Regatta captures each have zero console/page errors and no test hook. They ran without `?debug`. Under host contention they reached different elapsed times and adaptive lighting states than the original captures; they are not identical-lighting comparisons. The frozen diagnostic removes those timing differences. Other `after-*` files in this working evidence tree may be earlier experiments; the files named above are the final review surface.

## Geometry and rendering cost

- Terrain: 32,768 / 60,000 triangles. Panorama: 2,704 / 4,000 triangles. Both shipped E5 panorama variants retain all original positions and triangles.
- The 768 apron faces share **zero vertices** with sky faces, so their UV rewrite cannot alter sky UVs. Static GLB proof: `e5-apron-geometry-proof.json`; budgets: `e5-geometry-budgets.json`.
- The apron introduces one extra material group/draw. The single-hull contact adds one draw. Deepwater frozen before/after counts are **75 to 77 desktop**, **57 to 59 phone**. The contact meshes are separate from terrain/collision data.
- No asset pack changed; landmark loading/repeat scripts are not applicable to a pack rebake here.
- Timing repeat: four same-page alternating runs per arm returned median p95 **26.85 to 21.30 ms desktop**, **12.70 to 12.60 ms phone**; `e5-deepwater-claim/final-performance-summary.json` retains every value. Medians meet 15%, but host mode drift and the 42.6 ms candidate spike prevent a full performance acceptance. The first four final-candidate pairs span 11.8 to 134.7 ms desktop under host contention; no clean 15% performance acceptance is claimed from that run. All raw attempts remain under `_raw/`, including the earlier sequential and surface-only measurements. Earlier greens are not substituted for this final candidate.

## Verification and confirmed base failures

| Check | Result |
| --- | --- |
| Preflight install/default build/cleanliness | PASS |
| Final candidate `npx tsc --noEmit` | PASS, 474.6 s under contention |
| Final candidate `npm run build` | PASS, 64.6 s |
| Final candidate `GR_RELEASE=full npm run build` | PASS, 68.3 s |
| Final plain Deepwater and Regatta, 1280/390 | PASS, zero console/page errors |
| New E5 contact/apron spec, both projects | **8/8 PASS** |
| Existing ordinary river-water regression, both projects | **4/4 PASS** |
| Combined E5 + ordinary-water run | **25 PASS / 15 FAIL** in 11.0 min |
| Focused Deepwater retry, both projects | **5 PASS / 1 FAIL**; same mobile navigation texture error |
| Exact-base simulation attribution, desktop Node fixtures | **7 FAIL**; five reproduce the same candidate assertion, two stop earlier in a child process |
| Exact-base Deepwater mobile probe, two repeats | **2 FAIL** on existing 30 s timeouts (evaluate/navigation), before reaching the texture-error assertion |
| Four paired p95 runs per arm | Repeat medians within 15%; host mode drift/spikes remain **HELD** |
| Changed-since guards, including full node guards | **3/5 PASS**: task/citation/gate-caller guards pass. Node battery hits the unchanged 900 s outer timeout; power p95 54.082 ms exceeds 0.500 ms. |
| Additional landmark/fort collision rigs | Not run after the mandatory E5 gate blocked; no mount/collision edits |

Build commands and exit codes are in `final-e5-build-gates.json`; final retries/guards are in `final-validation.json`. Original logs remain local in `_raw/`.

The exact-base attribution temporarily removed only the two render edits, verified the **original engine hash**, ran the seven failing simulation cases, then restored the candidate byte-for-byte. `baseline-e5-fixtures.json` records the hashes and command. Existing assertions were not patched or weakened.

| Case | Candidate and exact-base result |
| --- | --- |
| Flotilla secure fixture | Both return hash `c01dd739`; expectation is `a9f33e48` (same secured/waves/kills). |
| Flotilla idle fixture | Both return hash `815739a6`; expectation is `68d87963` (same loss/waves/time/kills). |
| Regatta authored course | Both fail `expect(turn.terminal).toBe(true)` at line 114; actual is false. |
| Stillwater plain-door secure | Both return 391 kills / hash `e5c6d612`; expectations are 103 / `7661ca43`. |
| Stillwater in-process secure | Both return hash `e5c6d612` and 64 strikes; expectations are `4e99e655` and 77 strikes. |
| Regatta idle | Candidate hash mismatch (`d461683d` versus `80b36bec`); base child exits 1 before reaching that assertion. Same-cause attribution is **inconclusive**. |
| Stillwater idle | Candidate hash mismatch (`c212c318` versus `ba80f970`); base child returns null status before the outcome assertion. Same-cause attribution is **inconclusive**. |

Hashes in this table have the `fnv1a32:` prefix. Extracted diagnostics: `candidate-e5-failures.json` and `baseline-e5-failures.json`.

The additional Deepwater mobile failure is `THREE.GLTFLoader: Couldn't load texture blob:...` at `e2e/e5-deepwater-claim.spec.ts:132`, after navigating to The Claim in the wave-counter test. It occurs in both candidate runs. The exact-base mobile probe failed twice on existing 30 s timeouts, once at `page.evaluate` line 101 and once at `page.goto` line 20. Neither reached the final error assertion. Attribution remains **inconclusive**; it is not labelled pre-existing or suppressed. See `baseline-mobile-probe.json`.

The full guard battery declared **4 concurrent batteries** and reached 126 top-level test records before the existing outer 900 s limit stopped npm. Three recorded failures were the expected candidate-versus-pin hash mismatch and missing tracked `assets/raw/claim-boat-material-atlas.png` / `assets/raw/flotilla-material-atlas.png` inputs in this sparse checkout. `git ls-files` confirms both missing inputs are tracked; they need canonical sparse-checkout hydration before their guards can pass. They were not authored or hydrated outside the task firewall. The saved partial TAP is `_raw/final-node-guards-partial.tap`. The outer SIGTERM is a timeout, not a native rc >=128 crash; no native-crash retry was warranted. The orphaned, owned node descendants were explicitly stopped after verifying their cwd. `guard-summary.json` records the results.

Host evidence: load reached 156, and a system sample reported 100% CPU, 127 GB physical memory used and 169 MB unused. An overlapping owned guard run was stopped (root cwd verified as lane-c; 33 descendants); the other lane's matching process was left alone. The final guard run uses the existing `CLAUDE_CONFIG_DIR` concurrency mechanism to serialize node guard files. No assertions or timeouts were changed. This controlled scheduling choice is recorded rather than presented as an ordinary unconstrained host run.

## Engine identity and preserved work

Computed with `computeEngineHash` from `scripts/assay-replay-agent.mjs`, as the era guard does:

- Base: `cc3fd5d45add762fc0878a42618af1eaec836edeee83b03954c5e75a569b71f5`.
- Candidate: `90545c412b35bd683729e22b1ebfe7ffb531822496a71b6a9a59821e2a313ad5`.
- Final restored source: `cc3fd5d45add762fc0878a42618af1eaec836edeee83b03954c5e75a569b71f5` (exact match to base; `final-state.json`).

The base is pinned in era 6; the candidate is not. `assets/engine-era.json` is untouched and remains the drain's responsibility. `e5-source-identity.json` records individual candidate file hashes.

Preserved all three candidate source/test files byte-for-byte at `_raw/final-candidate-20260919/`; `candidate-preservation.json` records their hashes. Restored both render files and removed the backed-up new test from the active tree. Restored 12 generated evidence files by individual path (copies retained in raw); moved 77 unselected experimental files into raw; preserved the five generated guard-stat rows there; stopped the owned Vite server. `cleanup.json` records every path. No raw file was deleted. `_raw/` is ignored by this artifact directory's `.gitignore` and an exact local `info/exclude` entry that survives branch switches; it is never staged or deleted. The candidate patch is `_raw/e5-candidate.patch`. The source copies and new e2e spec are retained in the final-candidate directory. A subsequent run should inspect the patch against its current base, not blindly apply it after main moves.

## Resume order and unfinished work

1. Resolve or explicitly re-scope the required E5 baseline gate failures outside this art-only task; hydrate the two committed raw atlas inputs; attribute the mobile navigation texture error. Use a quieter host window for the full node/power guards and stable timing modes. Then reapply/review the saved shared candidate and finish Deepwater before any next-map commit.
2. Regatta, Stillwater, Flotilla: final map-specific contact/depth/framing verdicts and gates remain unfinished. Regatta's shared seam review is evidence, not completion.
3. E7 Relay Valley and Echo Canyon: not started.
4. E8 Mare Claim and Eclipse: not started.
5. E10 Archive World, Ember Shore, The River: not started.
6. E3 tracked recipe restoration and reproduction proof (F-OMB-5): **not performed**; no recipe success claimed.
7. The 23 pending verdict rows remain untouched: E1 Night Shift/Twin Banks/Baron; E2 Trestle/Pressure Garden/Incline; E3 Canyon Works; E4 Dust Flats/Long Road/Gusher County/Boneyard; E6 Glow Mesa/Half-Life Hollow/Picnic; E7 Dead Band/Relay Rush; E8 Far Side/Low Orbit; E9 Dome Basin/Seed Run/Devil's Alley/Old Canal; E10 Last Claim.

`reviews/sol-map-art-current-status-20260909.md` is unchanged because no map moved to a completed campaign verdict. No `STATUS.md`, tasks, specs, protected assertions, simulation code, or history on another branch was changed.


## Second run — 2026-09-19 (task sol-map-art-campaign-2b)

In progress. Exact base `401fb03da25e42c3f037b9b866579d7de77fb708`. Preflight: clean `sol/map-art-campaign-2` at `7bd4b250b (archive: pruned by the A3 rewrite)`, no ahead commits; advanced to main. `git clean -fd` removed only the empty `e5-flotilla/` and `e5-stillwater/` evidence directories. Raw evidence retained. Install and pre-edit build PASS; post-build `git status --short` empty. Hydrated `assets/raw` through sparse-checkout and confirmed both raw boat atlases exist. Node 26, port 5303 only.

The first report above remains unchanged. This run follows the amended known-red gate and keeps the full node battery with the drain. Runtime source and existing tests remain subject to the original firewall.

Completed landings, in order: `b2c196e73` shared E5 / Deepwater source; `f2daae7f4` Regatta verdict; `6d431fe38` Stillwater verdict; `11d6b5639` Flotilla verdict. All are bounded improvements with full concept acceptance withheld. Relay Valley subsequently passed its bounded lighting gate (details below).

### Shared E5 verification checkpoint (second run)

The preserved candidate was restored byte-for-byte (`run-2/candidate-restoration.json`), then independently reviewed. One concrete apron/mast draw-order regression was corrected and pixel-tested: the negative control reads red=0 where a foreground mast should be visible; corrected desktop/mobile read `[255,0,0,255]`, with the adjacent apron `[0,0,255,255]`. The factory's original 16 mast triangles now draw after the apron; no triangle, position, UV, mount or gameplay datum moves. See `run-2/water-code-review.md`.

Final tsc, default build and full build PASS. Final renderer gate **20/20 PASS** (new contact/order spec 10, ordinary water 4, existing Deepwater 6), plus the other three E5 plain-boot tests **6/6 PASS**. Narrow water/boat node guards and named task/citation/gate-caller guards PASS. These are actual results, not inherited first-run greens.

The full original E5 suite on the restored candidate returned 11 pass / 17 fail: fourteen known fixture failures (the seven cases already attributed above on both projects), two navigation texture errors, and one browser-profile `ENOSPC` launch failure. The navigation texture error now **reproduces on the exact base in BOTH projects**, at the original error assertion, not an earlier timeout. `run-2/baseline-navigation.json` records the base engine hash and byte-exact restoration; `run-2/e5-red-attribution.json` records the failure text. The final 20/20 retry passes that flaky navigation test and the browser-launch case. The two prior inconclusive idle fixtures are attributed under the task's amended rule. No assertion was changed.

Guard-invocation mismatch: `scripts/run-guards.mjs` still hardcodes `test:node-guards` and `test:power-budget` in `GATE_GUARDS`, including `--changed-since`; its only path rule is `functions/**`, untouched here. To honor the task's explicit prohibition on a full battery, ran its `--only test:task-guards,test:citations,test:gate-callers` form and the named rendering guards. The full battery and power timing remain the drain's; no second full battery was started.

Engine: `cc3fd5d45add762fc0878a42618af1eaec836edeee83b03954c5e75a569b71f5` → preserved candidate `90545c412b35bd683729e22b1ebfe7ffb531822496a71b6a9a59821e2a313ad5` → corrected candidate `35db6dcf14954aa36cb232cde030c766e8a9cf21ef77c6e48375666a1a73f809`. Engine pin untouched. Paired performance and final plain boards subsequently completed; the results follow.

### First landing — shared E5 water / Deepwater Claim

**IMPROVED, not full concept acceptance.** Final plain before/after beside the existing plate: [desktop](run-2/e5-deepwater-claim/board-1280.png), [phone](run-2/e5-deepwater-claim/board-390.png). Fresh final captures of all four E5 maps at 1280/390 report zero console/page errors and no test hook. Plain scenes run naturally and have different elapsed weather/tutorial states; the controlled diagnostics isolate the visual change.

| Deepwater defect | Verdict |
| --- | --- |
| Bright repeated sea | IMPROVED: 20 m sample cross-fades with a rotated 31.7 m sample; texture contribution 0.35→0.10, opacity 0.72→0.56. New fixed-region texture RMS 1.8603→0.7055 (−62.1%). Fine seabed stippling still exists. |
| Submerged reef / settlement | IMPROVED: drowned-office roof detail RMS 2.8436→3.4665 (+21.9%). These are spatial crop measurements, not proof of animation quality or complete settlement correspondence. Full depth/concept remains HELD. |
| Texture-density seam | IMPROVED: 768 existing apron triangles use the seabed's world-scale atlas. Faint tonal joins remain HELD. All positions and all 2,704 panorama triangles are preserved. |
| Hull contact | IMPROVED: one soft, discontinuous waterline at the actual hull intersection, 1,804 triangles / one draw. Broad displaced-water wakes remain HELD. |
| Panorama foreground | FIXED: material sorting no longer paints the apron over the 16 distant mast triangles; hostile-overlap GPU negative/positive control verifies this. |
| Actor contact / player silhouette | HELD: no character or actor-depth/fade owner was changed. |
| Boat material / crane identity | HELD: their owners are `assets/pilots/claim-boat-3d/**` and `src/world/ClaimBoatView.ts`, outside the unchanged firewall. |
| Portrait framing / wreck notices | HELD: the large boat and HUD occlusion remain; HUD/camera owners are outside this pass. |

[Performance table](run-2/performance.md), [all runs and mode comparisons](run-2/performance-summary.json), [fresh visual measurements](run-2/e5-deepwater-claim/station-metrics.json). Shared water draw calls: Deepwater 75→78 / 57→60; Regatta 70→73 / 57→60; Stillwater 75→78 / 57→60; Flotilla 84→87 / 57→60. All comparable p95 modes meet the 15% bar; one unpaired Flotilla-phone 16 ms plateau is explicitly retained, with the pooled median still +4.17%. No full isolated-GPU benchmark is claimed. Terrain 32,768/60,000 triangles; panorama 2,704/4,000. No pack was rebaked.

Final landmark and fort collision rigs: **12/12 PASS**, desktop and mobile. Generated evidence churn was preserved in `_raw/run-2/generated-churn/` and restored by exact filenames; receipt: `run-2/churn-restoration.json`.

### Regatta — second-run map verdict, 2026-09-19

**IMPROVED / full concept HELD.** [Desktop board](run-2/e5-regatta/board-1280.png), [phone board](run-2/e5-regatta/board-390.png); these use the unchanged existing plate and unretouched plain boots. IMPROVED: surface texture contribution 0.35→0.10 and opacity 0.72→0.56; 768 apron faces use seabed scale; 1,804 contact triangles follow the existing hull. HELD: broad wakes/currents; full submerged-course depth; crane/material identity; player contrast and boat-dominated portrait framing. Plain boot still does not show the concept’s fleet-and-buoy vista.

No further source change after shared water commit `b2c196e73`. Boat sculpture/material owners (`assets/pilots/claim-boat-3d/**`, `src/world/ClaimBoatView.ts`, and Flotilla's separate pack) are outside the task firewall; HUD/camera/actor owners are also excluded. The surface pass is complete at its bounded bar; the listed HELD defects are the next campaign's work, not accepted art.

Numbers: draws 70→73 / 57→60 desktop / phone; maximum comparable p95 mode increase 4.76%, four runs per arm ([mode evidence](run-2/performance-summary.json)). Terrain 32,768/60,000 triangles; panorama 2,704/4,000; zero console/page errors in both final plain boots. Existing own plain-boot tests pass both projects; existing simulation reds are attributed in the shared table above. Same validated source boundary: tsc/default/full builds PASS, new sea/order and ordinary-water checks PASS, collision 12/12 PASS. This verdict-only commit changes no runtime or asset bytes; those checks remain applicable.

Engine before = after `35db6dcf14954aa36cb232cde030c766e8a9cf21ef77c6e48375666a1a73f809`.

### Stillwater — second-run map verdict, 2026-09-19

**IMPROVED / full concept HELD.** [Desktop board](run-2/e5-stillwater/board-1280.png), [phone board](run-2/e5-stillwater/board-390.png); these use the unchanged existing plate and unretouched plain boots. IMPROVED: Stillwater texture contribution 0.25→0.06 and opacity 0.78→0.62; hull contact adds 1,804 triangles; 768 apron faces share seabed scale. HELD: full submerged wreck depth/reflection, crane/material identity, player silhouette and portrait framing. The tranquil mist survives, but the long empty deck does not match the compact inhabited vessel in the plate.

No further source change after shared water commit `b2c196e73`. Boat sculpture/material owners (`assets/pilots/claim-boat-3d/**`, `src/world/ClaimBoatView.ts`, and Flotilla's separate pack) are outside the task firewall; HUD/camera/actor owners are also excluded. The surface pass is complete at its bounded bar; the listed HELD defects are the next campaign's work, not accepted art.

Numbers: draws 75→78 / 57→60 desktop / phone; maximum comparable p95 mode increase 6.59%, four runs per arm ([mode evidence](run-2/performance-summary.json)). Terrain 32,768/60,000 triangles; panorama 2,704/4,000; zero console/page errors in both final plain boots. Existing own plain-boot tests pass both projects; existing simulation reds are attributed in the shared table above. Same validated source boundary: tsc/default/full builds PASS, new sea/order and ordinary-water checks PASS, collision 12/12 PASS. This verdict-only commit changes no runtime or asset bytes; those checks remain applicable.

Engine before = after `35db6dcf14954aa36cb232cde030c766e8a9cf21ef77c6e48375666a1a73f809`.

### Flotilla — second-run map verdict, 2026-09-19

**IMPROVED / full concept HELD.** [Desktop board](run-2/e5-flotilla/board-1280.png), [phone board](run-2/e5-flotilla/board-390.png); these use the unchanged existing plate and unretouched plain boots. IMPROVED: surface texture contribution 0.35→0.10, opacity 0.72→0.56, 768 apron faces share seabed scale; three mounted hulls gain 516 contact triangles each. HELD: broad wake motion, actor water contact, submerged settlement depth, fleet composition and mobile HUD. Plain boot still frames the hero in open water with the fleet offscreen, so full concept correspondence is rejected.

No further source change after shared water commit `b2c196e73`. Boat sculpture/material owners (`assets/pilots/claim-boat-3d/**`, `src/world/ClaimBoatView.ts`, and Flotilla's separate pack) are outside the task firewall; HUD/camera/actor owners are also excluded. The surface pass is complete at its bounded bar; the listed HELD defects are the next campaign's work, not accepted art.

Numbers: draws 84→87 / 57→60 desktop / phone; maximum comparable p95 mode increase 3.57%, four runs per arm ([mode evidence](run-2/performance-summary.json)). Terrain 32,768/60,000 triangles; panorama 2,704/4,000; zero console/page errors in both final plain boots. Existing own plain-boot tests pass both projects; existing simulation reds are attributed in the shared table above. Same validated source boundary: tsc/default/full builds PASS, new sea/order and ordinary-water checks PASS, collision 12/12 PASS. This verdict-only commit changes no runtime or asset bytes; those checks remain applicable.

Engine before = after `35db6dcf14954aa36cb232cde030c766e8a9cf21ef77c6e48375666a1a73f809`.

### Relay Valley — 2026-09-19

**IMPROVED / full concept HELD.** [Desktop board](run-2/e7-relay-valley/board-1280.png), [phone board](run-2/e7-relay-valley/board-390.png), [per-defect review and all numbers](run-2/e7-relay-valley/review.md). Existing calibrated material grade 0.45→0.6; siblings retain 0.45. Body-pixel luminance +12.29%/+10.78%; draws unchanged 61/47; four-run normal-HUD p95 medians 10.1→10.1 ms /10.15→10.2 ms. Terrain, contact shading, tower architecture/scale, portrait HUD and full-map composition remain HELD. Full bounds fit a 9 m south diagnostic station; 9 m east clips and is rejected.

Builds PASS, final plain boots 0 errors, production reference rig 2/2 PASS. E7 front tests 8/8 PASS; final mirror/control plus brightness retry 8/8 PASS. Original combined run:11 PASS/5 FAIL/4 opt-in SKIP. Exact-base narrow run:6 PASS/2 desktop entry-timeout FAIL; candidate mobile entry timeouts and unrelated Claim/Night Shift failures did not reproduce with identical profiles/stages, so those are recorded as transient failures, not falsely assigned to one exact assertion. The final retry passes all of them. No assertion or timeout was changed. Narrow guards PASS; no full node battery. `baseline-identity.json` proves byte-exact source restoration.

Engine `35db6dcf14954aa36cb232cde030c766e8a9cf21ef77c6e48375666a1a73f809` → `14d0ca36b8474f5284c71733530de331e7bac33e87569539f07f4175743ab476`; pin untouched. Raw rejected/contaminated diagnostics and driver failures remain preserved.

### Echo Canyon — 2026-09-19

**IMPROVED / full concept HELD.** [Desktop](run-2/e7-echo-canyon/board-1280.png), [phone](run-2/e7-echo-canyon/board-390.png), [per-defect review](run-2/e7-echo-canyon/review.md). Calibrated grade0.45→0.6 improves masked visible-body luminance9.12%/8.35%; near-black pixel share falls41.02→37.48% /40.34→36.78%. Draws remain64/48; four-run p95 medians10.0→9.7 /10.0→9.55ms. Ground noise, black pedestal, base contact, architecture and full concept remain HELD. Both arrays fit full geometric bounds at a9m south diagnostic stand-off; real HUD coverage remains HELD.

Builds PASS; plain captures0 errors; own mirror/control plus standard lighting8/8 PASS; production reference rig2/2 PASS; four optional census/calibration cases skipped in the standard run. Named guards PASS; no full battery. No pack rebake. Engine `14d0ca36b8474f5284c71733530de331e7bac33e87569539f07f4175743ab476` → `65225d736a53b97ca7b9793c810f3afee0c0da677aecba18944dfba28fefb484`; pin untouched. Relay Valley's preceding landing is `a8267bbaf`.

### Mare Claim — 2026-09-19

**IMPROVED / full concept HELD.** [Per-defect review and boards](run-2/e8-mare-claim/review.md). The shared dome adds five framed ports and six service panels, 32 triangles, reaching exactly 3,000/3,000 with unchanged atlas, materials, bounds and mounts. Old geometry stays within recorded export tolerances; UVs exact. Inhabited-drum detail improves modestly; glass richness, player contrast, full interior and map dressing remain HELD.

Four paired runs: p95 medians 9.40→9.35 ms /9.85→9.75 ms, calls unchanged 85/60. Both shared maps meet the 15% bar. Builds PASS; four final plain captures 0 errors; repeated-mount and loading probes PASS; own physics + collision 14/14 PASS; global GLB audit zero live violations (six grandfathered); named guards PASS. No full node battery. Engine `65225d736a53b97ca7b9793c810f3afee0c0da677aecba18944dfba28fefb484` → `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. Echo's preceding landing: `dff54bd1c`.

### Eclipse — 2026-09-19

**IMPROVED / full concept HELD.** [Defect list, boards and numbers](run-2/e8-eclipse/review.md). Shared drum detail from Mare commit `e28fa3c4e`; no further asset/source change. Five ports and six service panels improve the blank wall; glass richness, player contrast, terrace/settlement dressing, eclipse vista and portrait HUD remain HELD. Four paired-run medians 9.20→9.60 ms /9.45→9.10 ms; draws unchanged 85/60. Final plain 1280/390 captures 0 errors; exact old-GLB routed baselines exclude the preserved invalid capture attempts. Shared builds, loading, repeated-mount, global GLB, 14 physics/collision and named gates pass. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### Archive World — 2026-09-19

UNACCEPTED / HELD: entry gate fills the foreground; terraces and stack depth disappear behind repetitive paving and a dark distant band; local light pools are weak; phone HUD obscures the gate. Existing objects/floor retained; no new source change or full concept acceptance. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e10-archive-world/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### Ember Shore — 2026-09-19

UNACCEPTED / HELD: the earlier 160 m ground continuation is retained, but thin material joins/rectangular patches, dark soft shelves, weak fissure read and missing titan composition remain. No rejected 153/157 candidate promoted; no new source change. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e10-ember-shore/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The River — 2026-09-19

UNACCEPTED / HELD: raw 128×128 River remains painted; finale uses the 64×64 Claim charter/GLB. Same tileId hides different dimensions and landmark/collision sets, so a render alias would violate the firewall. Contract/finale owners must reconcile the route; ordinary combat/build HUD remains excluded. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e10-river/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### E3 recipes — 2026-09-19

**F-OMB-5 atlas reproduction FIXED:** the tracked builder now has current per-pack E3 palettes/plate inputs and a safe `--atlas-only <pack> --out <destination>` path. All four packs reproduce byte-for-byte, maximum pixel delta 0. [Commands, proof and provenance](run-2/e3-recipes/review.md). Historical geometry recipes are deliberately not reintroduced over reviewed blend repairs; no production GLB/atlas/blend/mount changes. Builds and three named guards PASS.

New measured follow-up: Moth's contract names native material art, but its shipped atlas and embedded GLB texture both match the old procedural atlas. The native resize differs by up to 172 channel levels. Current shipped pixels are reproduced exactly; native-art promotion versus metadata correction remains open. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`. Ember verdict `4d284d8df`; River route verdict `2d1a8ff54`.

### Night Shift — 2026-09-20

UNACCEPTED: lantern sequence and warm light pools are not communicated in the plain entry view; the river and foreground rig lose dark detail, the rig is cropped, and phone story/HUD cards cover the player-facing space. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e1-night-shift/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### Twin Banks — 2026-09-20

UNACCEPTED: the braided rivers and paired bank clearings are not readable from the plain entry; noisy dirt dominates, the house/rig are peripheral or cropped, sparse prop cards lack the plate’s riparian density, and portrait hides most of the water. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e1-twin-banks/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Claim-Jumper Baron — 2026-09-20

UNACCEPTED: the banner-led encampment vista is not communicated; a flat dark water band and large dark ground patches dominate, the distant fort is cropped, and portrait loses the flanking rigs and settlement identity. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e1-baron/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Trestle — 2026-09-20

UNACCEPTED: the trestle span and canyon depth are not readable at entry; intersecting/abruptly ending rails, muddy ground detail and cropped near machinery dominate, with weak landmark contrast and restricted portrait framing. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e2-trestle/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Pressure Garden — 2026-09-20

UNACCEPTED: boiler-house and terrace hierarchy is not communicated at plain entry; broad soft river band, dark repetitive ground and peripheral machinery dominate; portrait loses the machinery behind framing and HUD. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e2-pressure-garden/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Incline — 2026-09-20

UNACCEPTED: stepped cliff, cable lift and carts are not communicated at plain entry; dark mottled field and a peripheral rail dominate; portrait excludes the rail and principal machinery. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e2-incline/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Canyon Works — 2026-09-20

UNACCEPTED: canyon depth and connected pylon hierarchy are not communicated at plain entry; dark upper band meets a hard ground edge; diagonal ground repetition and low-contrast machinery persist, with stronger portrait HUD occlusion. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e3-canyon-works/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Dust Flats — 2026-09-20

UNACCEPTED: coarse high-contrast painted ground and oversized dark forms overwhelm the plain entry; the road loop, derrick group and open desert spacing are not communicated, especially in portrait. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e4-dust-flats/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Long Road — 2026-09-20

UNACCEPTED: road-to-horizon and roadside-stop hierarchy are not communicated at plain entry; smeared dark ground, a large left-edge surface and close wagon dominate; portrait and story overlays further restrict context. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e4-long-road/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### Gusher County — 2026-09-20

UNACCEPTED: foreground roof partly hides the player at entry; saturated red block forms and coarse dark ground dominate; the plate's derrick, pipe and oil-channel network is not communicated, with severe portrait crowding. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e4-gusher-county/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Boneyard — 2026-09-20

UNACCEPTED: enlarged painted machinery flattens into the ground at plain entry; distinct wreck silhouettes, buried-engine scale and layered yard depth are not communicated; a small blocky vehicle and portrait overlays provide little context. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e4-boneyard/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Glow Mesa — 2026-09-20

UNACCEPTED: raised mesa, teal node ring and facility grouping are not communicated at plain entry; dense mottled ground fills both views, with a clipped desktop structure and almost no portrait landmark context. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e6-glow-mesa/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### Half-Life Hollow — 2026-09-20

UNACCEPTED: flat ochre causeway and pale teal slabs dominate the entry; ravine depth, countdown-gate architecture and suspended crossings are not communicated; dark ground and portrait overlays compound the gap. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e6-half-life-hollow/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Picnic — 2026-09-20

UNACCEPTED: picnic canopies, blankets, props and gathering are not communicated at plain entry; reused mesa ground and a pylon dominate, with heavy dark forms and portrait HUD occlusion. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e6-picnic/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Dead Band — 2026-09-20

UNACCEPTED: empty relay frames, paired terraces and silent-field identity are not communicated at plain entry; dense dark ground and a close radio body dominate; portrait story and HUD layers obscure the body. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e7-dead-band/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### Relay Rush — 2026-09-20

UNACCEPTED: ascending beacon terraces and route progression are not communicated at plain entry; dense dark ground markings dominate, peripheral relay geometry is clipped, and portrait lacks useful landmark context. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e7-relay-rush/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Far Side — 2026-09-20

UNACCEPTED: crater basin, pressure equipment, suit rack and isolated dish are not communicated at plain entry; broad blurred ground bands and a long dark stripe dominate an otherwise sparse scene. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e8-far-side/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### Low Orbit — 2026-09-20

UNACCEPTED: suspended salvage-station architecture and debris depth are not communicated; a sparse claw rig sits on a conspicuous dark rectangular base amid dim ground, and portrait HUD hides much of the rig. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e8-low-orbit/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Dome Basin — 2026-09-20

UNACCEPTED: plain entry does not communicate the canal, lock wheel or terraced settlement; very dark red ground and a peripheral rail dominate, while portrait loses excavation context and shows weak landmark separation. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e9-dome-basin/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Seed Run — 2026-09-20

UNACCEPTED: convoy, irrigated route and distant basin settlement are not communicated at entry; dark red terrain, fragmented route marks and a blocky red-roof gate replace the plate's continuous landscape hierarchy; portrait obscures the gate. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e9-seed-run/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### Devil's Alley — 2026-09-20

UNACCEPTED: wind-anchor architecture and storm corridor are not communicated at entry; a simple rig on a dark square base sits inside a dominant ring, surrounded by dense red ground and abrupt tonal boundaries; portrait obscures its upper form. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e9-devils-alley/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Old Canal — 2026-09-20

UNACCEPTED: the undecided canal reads as a large translucent rectangular slab rather than a ruined waterway; channel walls, survey/lock architecture and landscape continuity are weak, with dark red ground and portrait occlusion. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e9-old-canal/review.md). Verdict-only; no source or asset change. Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`.

### The Last Claim — 2026-09-20

UNACCEPTED: the circular orbital deck, central orrery, ornate rim and three preserve stations are absent from the plain entry; grey fallback ground and a large vent glow dominate desktop, while portrait offers no architectural landmark and communicates the preserves only through HUD text. [Inspected boards, defect rationale, four-run numbers and validation](run-2/e10-last-claim/review.md). Verdict-only; no source or asset change. Engine before = after `2ad0aa1e14a1b7f639bc9c797ae5e14839d11c7b34b70f3f7ac7ca9479fbf6f4`.

## Third run — 2026-09-20 (task sol-map-art-corrections-1)

Base `39a540827847eabed0824998b028e6163b202e09`, engine `2ad0aa1e14a1b7f639bc9c797ae5e14839d11c7b34b70f3f7ac7ca9479fbf6f4`. Lane had no ahead work and was advanced 124 commits to main; no evidence discarded. Install and default build passed. Cleanliness: only expected untracked `logs/guard-stats.jsonl`. Raw assets hydrated. The task's literal `plate-contract-e1-night-shift.png` does not exist in git; its canonical tracked plate is `assets/raw/plate-contract-night-shift.png`, the same prefix resolution used by the run-2 board helper. No substitute art is generated.

Item 0: Astra inspected both retained Last Claim boards and replaced the drain-authored assessment above. UNACCEPTED: missing circular platform, orrery, rim and preserve-station architecture; fallback confirmed by diagnostics. No source/asset changes. Engine before = after `2ad0aa1e14a1b7f639bc9c797ae5e14839d11c7b34b70f3f7ac7ca9479fbf6f4`.

Corrections continue in the specified E1-first order; each correction has its own receipt below.

### Night Shift correction — 2026-09-20 run 3

**IMPROVED / HELD.** The existing real night pools now illuminate the opaque lampworks yard; a non-emissive living-water surface follows the original channel and ford. River fixed-region median +38.6%; relit roof +80.8%; masked yard median +20.3% desktop / +16.0% phone. Full yard bounds fit at the declared 5 m station, with HUD coverage 0% / 0%. Plain-entry coverage remains 20.58% / 89.46%; camera/UI owns that hold. The seven broken lantern fixtures and wide river geometry remain contract-owned. [Unretouched boards, every original clause, metrics and validation](run-3/e1-night-shift/review.md).

Four actual-source timing runs per arm: desktop median 8.70 → 8.65 ms; phone 9.60 → 9.50 ms. Comparable fast modes stay inside +15%; the slower before-only samples remain disclosed. Water costs one draw and two triangles. tsc/default/full/E1 builds pass; first-town payload 34,234,627 B (<52,000,000). Existing broad browser suite: 51 pass, 4 skip, 7 fail; all seven failures reproduce on exact base with the same failing assertions. New art checks and beauty boards: 4/4 pass. Full node battery and engine pin remain the drain's. Loading/repeat probes are recorded in the map receipt.

Engine `2ad0aa1e14a1b7f639bc9c797ae5e14839d11c7b34b70f3f7ac7ca9479fbf6f4` → `3a437c987c30b1738307197d4e0ebbe64520e8ddbfbbff947378930f8590a041`. No gameplay/camera/HUD bytes or protected assertions changed.

### Twin Banks correction — 2026-09-20 run 3

**IMPROVED / HELD.** Two worked bank clearings receive local pigment compression; 48 grounded closed-mesh reed clumps reuse the existing atlas and dressing body. Ground-region RMS falls 20.1% desktop / 30.0% phone. House and winch fit the two declared 5 m stations with 0% HUD coverage at both widths; at 9 m phone coverage was 4.27% / 57.22%. Plain entry still loses both bodies entirely on phone. Water occupies only 2.13% desktop / 1.02% phone before HUD; desktop water HUD coverage is 92.07%, while phone coverage varies 3.04–19.04% with story timing. Those entry/framing issues are held for camera/UI, and remaining generic cards for the scatter owner. The approved two fords and dry central strip are unchanged. [Boards, metrics, every clause and exact-base failures](run-3/e1-twin-banks/review.md).

Four actual-source/GLB runs per arm: desktop p95 median 9.65 → 9.65 ms; phone 9.90 → 9.85 ms. Same fast mode, within +15%; zero additional draws and +1,440 triangles. All five body sources re-export identically. Terrain, panorama, old dressing geometry/UVs and collision bytes remain unchanged. tsc/default/full/E1 builds pass; first-town payload 34,236,794 B. Eight map-specific assertion failures reproduce exactly on base; two Town navigation timeouts pass on candidate retry (one also reproduces on base). Full node battery and pin remain drain-owned. Per-map gate receipts carry the detailed result.

Engine `3a437c987c30b1738307197d4e0ebbe64520e8ddbfbbff947378930f8590a041` → `011419f4873aebb9a8d9d6580844dbf02d116813898fdcc98579cfbf39a88ebe`. Gameplay, camera, HUD and protected assertions unchanged.

### The Claim-Jumper Baron correction — 2026-09-20 run 3

**IMPROVED / HELD.** Three grounded approach standards reuse the existing embroidered cloth and wind shader; the primary phone standard fits x54–133/y367–474 with 0% persistent HUD coverage. One non-emissive river surface separates water from scorched banks (fixed-region median +54.45% desktop / +44.23% phone); selective dry-pigment lift reduces scorch RMS 42.84% / 18.19% while lit-ground control medians stay unchanged. Headframe 3 m and rocket-cart 5 m stations fit both views with 0% persistent HUD coverage. Fort 5 m restores vertical extent and phone coverage improves 100% → 3.25%; its 55.21 m width still exceeds both frames. Both rigs remain fully offscreen at phone entry. Camera/UI and contract-layout owners hold those limits and the occupied-valley vista. [Boards, every clause, metrics and validation](run-3/e1-baron/review.md).

Four actual-source/GLB runs per arm at each width, frozen and live-volley: comparable desktop fast p95 10.20 → 10.00 ms frozen / 9.70 → 9.90 ms volley; phone 9.55 → 9.55 / 9.55 → 9.50 ms. Slow-mode samples and pooled medians remain disclosed; comparable modes stay within +15%. Cost: +1 draw and +902 triangles. All five saved body sources re-export identically; original geometry/UVs, terrain, panorama, atlas and collision bytes are preserved. Final tsc/default/full/E1 builds pass; first-town payload 34,239,505 B. Existing 96-test browser run: 83 pass, 5 skip, 8 fail. Five failures reproduce on exact base; three intermittent failures and retries are detailed in the review. Final kiting/capture isolation passes 8/8; required shared loading/repeat probes pass 8/8 and 2/2. Full node battery and engine pin remain drain-owned.

Engine `011419f4873aebb9a8d9d6580844dbf02d116813898fdcc98579cfbf39a88ebe` → `e993b9ec062d5d02e2b503c2edf42ab8bf600c9074381e01d8634a4758b03d7b`. No gameplay/camera/HUD or protected-assertion changes.

### The Trestle correction — 2026-09-20 run 3

**IMPROVED / HELD; full entry fidelity remains unaccepted.** The pack's duplicate active-looking rails now form stored stock, 2.161 m from the unchanged live route (104 moved vertices, 660 triangles before/after). Approach-ground fixed-region RMS falls 25.43% desktop / 23.64% phone. Body medians rise bridge 16.77% / 17.23%, boiler 22.01% / 21.57%, stock 26.63% / 27.51%, approach yard 13.59% / 12.53%; whole-body emission stays 0.33–0.39. The stock comparison includes its changed silhouette. All six source re-exports are byte-identical; terrain, panorama, atlas, topology, UVs, route and collision bytes remain unchanged.

Declared bridge 7 m, boiler 3 m and stock 8 m stations fit both views. Persistent phone HUD: bridge **11.55%**, boiler **<0.03%**, stock **23.01%**. The wide approach at 9 m remains side-cropped with **12.98%** phone coverage; farther views worsen it. The phone entry bridge and stock are wholly offscreen. Those holds belong to the camera/UI owner via Claude; visible shared-rail joins and bare ends belong to the rail-presentation owner. [Every clause, inspected boards, metrics and evidence](run-3/e2-trestle/review.md).

Four runs per actual source/GLB arm and width: frozen p95 8.60→9.00 ms desktop / 9.00→9.05 phone; live crossing pooled 8.80→9.10 / 9.40→9.10, comparable fast 8.80→9.00 / 8.90→9.10. Unmatched slow samples are retained, not compared as a shared mode. Draw and triangle ranges are unchanged. TypeScript/default/full builds and 34 render guards pass. Browser closeout is recorded in the linked review. Engine `e993b9ec062d5d02e2b503c2edf42ab8bf600c9074381e01d8634a4758b03d7b` → `9582fb444b805f2a16b85b3720834fd7d12091e8cf48a96a6862c45b1afcad80`; pin untouched.

## Fourth run — 2026-09-21 (task sol-map-art-corrections-2)

Execution began 2026-09-20 local; the run-4 date label follows the dispatch. Capped at three maps: Pressure Garden, Incline, Canyon Works. Code base `45607635ac06140e69b4388d7b7f83d5f4e3197d`, store base `3673f34`; both clean after install/default build. The setup node_modules symlink was replaced by npm install. Store symlinks resolve. No ahead work or initial evidence was discarded. The saved patch required adapting its final hunk to the drained single-line E2 table; both store hunks passed with strip level 2. The cited history-local Pressure Garden capture folder was absent, so every board was recaptured. Full node battery and engine pin remain drain-owned.

### Pressure Garden correction — 2026-09-21 run 4

2026-09-21 run 4: IMPROVED / HELD: worked-ground RMS -46.73% desktop / -43.72% phone; manifold body median +21.64% / +21.36%, emission capped at 0.45; short river flow lines improve surface direction. The declared 5 m manifold station fits phone with 0.008% persistent HUD coverage versus 44.90% at 14 m. HELD: plain-entry manifold offscreen on phone, pump 44.78% / east header 31.97% phone HUD; boiler/terrace vista remains contract/layout/camera/UI-owned. [Every clause, boards, independent review and checks](run-4/e2-pressure-garden/review.md).

Four actual-source timing runs per arm: p95 9.20→9.25 ms desktop / 9.05→9.05 phone; draws unchanged 90/58. TypeScript/default/full builds, own spec, focused census and shared render checks pass. Shoreline and atlas-census failures reproduce on exact base. The named changed-since command expands to the forbidden full battery; its scope conflict is recorded for the drain, with 34 render and three named guards green.

Engine `c8229bd4e2e1bd7d351255ba1460f640c8a67bc9f01c4c335ca17c27517d50a3` → `6df23d2f3b41389eb2fa89d042c96a4f593a21c7482f8c0343026f2c82137d9b`. Store `9fa06cc8e2e0f38ea8502b594f0c5aa6e1679157` pushed. Gameplay, camera, HUD, footprints and all geometry/atlas bytes are unchanged.

### Incline correction — 2026-09-21 run 4

**IMPROVED / HELD.** Rail-bed and yard RMS falls 37.86% desktop / 33.85% phone. Two return cables and eight wheels complete existing service-bin details within original bounds (+392 triangles); primary body median +56.2% / +50.4%, emission 0.375. The 5 m station fits the phone with 0.27% persistent HUD versus 38.70% at 14 m. All five individual stations are below 0.34%; the full composition can still overlap adjacent bodies. Cliff/lift/cart entry vista and absent phone rail remain contract/layout/camera holds. [Every clause, boards, independent review and proof](run-4/e2-incline/review.md).

Four runs per arm: p95 9.00→8.85 ms desktop / 9.15→9.15 phone, draws unchanged 76/58. Builds, 10 own/census checks, shared brightness/collision (16 pass, four skips), loading/repeat, 34 render guards and three named guards pass. Atlas, terrain, panorama, mounts/collision and original body geometry/UVs stay unchanged; all five saved bodies re-export exactly. Changed-since/full-battery conflict remains drain-owned.

Engine `6df23d2f3b41389eb2fa89d042c96a4f593a21c7482f8c0343026f2c82137d9b` → `adead14c0ca88daba465162c0156d527159596f6b9b4ccb85e1732ba14c182bf`. Store `213e6776f85bc729d39fc09e120b12a781b1d697` pushed.

### Canyon Works correction — 2026-09-21 run 4

**IMPROVED / HELD.** FIXED the exposed-background seam: a 1 m panorama gap closes through 97 render-only inner-ring vertices, no extra triangles; seam bright pixels 734/110 → 0/0. Ground RMS falls 41.42% desktop / 32.83% phone; dynamo body median rises 35.28% / 33.51% at unchanged emission 0.45. Tracked atlas recipe reproduces both base and candidate exactly. All landmark geometry, UVs, mounts/collision and terrain geometry remain unchanged. Saved landmark and panorama sources re-export exactly.

FIXED primary-body inspection framing at 3 m: phone HUD 57.27% → 0.002%. Other declared stations stay below 0.26%. HELD phone entry 27.305% and canyon vista (UI/camera/layout); a connected live pylon chain requires built beacons. Straight apron composition and machine construction remain campaign art gaps. [Every clause, boards, independent review and proof](run-4/e3-canyon-works/review.md).

Four runs per arm/viewport: p95 9.75→9.80 ms desktop / 9.85→9.75 phone, draws unchanged 72/54. Builds, 12 core Canyon/crawler checks, two visual-census checks, shared brightness/collision (16 pass, four skips), loading/repeat, 34 render guards and three named guards pass. Escort expected HP39/actual40 and headless census deadline6/actual8 each fail on both projects and reproduce on exact base code+store; no assertions changed. Changed-since/full-battery conflict stays drain-owned. Engine `adead14c0ca88daba465162c0156d527159596f6b9b4ccb85e1732ba14c182bf` → `8544c803bfa47d4fd29da04b33ac01ed7f37d2fd6af2ba70c5738abc8d32ab35`. Store `068c0dbdbe99f474e099b5eff69da13b0f55851f` pushed.

### Capped stop — 2026-09-21 run 4

Three maps completed in order; no fourth map started. All remain improved/held for full concept fidelity. The Last Claim remains unaccepted in my judgment: the fallback does not communicate the plate's circular deck, central orrery, ornate rim or three preserve stations; portrait has no architectural context. Its sculpt-pack correction is still on the remaining list. [Ordered continuation, HUD handoff, engine pairs and gate exceptions](run-4/handoff.md).


## Fifth run — 2026-09-20 (task sol-map-art-corrections-3)

Capped at three maps, in order: Dust Flats, Long Road, Gusher County. Code base `19421c655efc2cf830f92d76bb7c3637e3a6861b`; store base `068c0dbdbe99f474e099b5eff69da13b0f55851f`. No ahead commits or unowned work; only permitted `logs/guard-stats.jsonl`. No evidence discarded. Install and initial build passed; both required store symlink probes resolve. Store work is isolated on `astra/corrections-3`; engine pins and full node battery remain drain-owned. [Preflight](run-5/preflight.json).

The Last Claim verdict remains mine and remains UNACCEPTED: the plain fallback lacks the circular deck, orrery, ornate rim and preserve-station architecture; the phone has no architectural context. This run does not revisit its art.

Three bounded correction passes completed in order; full concept acceptance remains held where each receipt says so. No fourth map started.

### Dust Flats correction — 2026-09-20 run 5

**IMPROVED / HELD.** Ground RMS -79.89% desktop / -73.89% phone, no new geometry/draws; road paint follows the existing 24 m ring and four corridors. The declared 5 m charting-post station reduces phone persistent HUD 31.57% → 0.006% (desktop 0%). Entry landmark context and central-derrick concept remain held for camera/layout and art owners; no full concept acceptance. [Every clause, final boards and gate attribution](run-5/e4-dust-flats/review.md).

Builds, final plain captures, shared lighting/collision, loading/repeat and scoped guards pass. Six own failures reproduce on exact base; the initial story flake passes its final 2/2 retry. Atlas-census base failure and changed-since/full-battery scope conflict remain attributed. Four-run p95 9.30→9.25 / 9.50→9.20 ms; draws 77/52 unchanged. Engine `fd5fb81fed8b9a783e33d43b7fce6068b74179c9c7c815bb774d830a0f01d2c9` → `f314eba93a1f7304139063ecef8cad5ab46806bce335058cefa4abcfb1ef00f3`. Store `d316da20c98b0f8bce1022bfdf9b3a25e212933a`.

### Long Road correction — 2026-09-20 run 5

**IMPROVED / HELD.** Ground RMS -85.41% desktop / -54.02% phone; apron RMS -61.72%. Same road truth, quieter ground, 97-vertex panorama join underlap with no extra triangles. Wagon 5 m inspection station reduces phone HUD 27.35% → 0.011%; west stop 0.016%. Entry wagon still 12.369%, with horizon/stop vista and remaining body art held. [Every clause, boards and evidence](run-5/e4-long-road/review.md).

Builds, four Long Road checks, shared lighting/collision, loading/repeat and scoped guards pass. Four-run p95 8.80→8.85 / 9.00→8.90 ms; draws 59/49 unchanged. Changed-since/full-battery remains drain-owned. Engine `f314eba93a1f7304139063ecef8cad5ab46806bce335058cefa4abcfb1ef00f3` → `d9771424552e194e198257098a5c4e235d0101c5c9f063adf030d42fcd2ef0eb`. Store `0f6ef32c9ebb7652c6796b8ccda622a282e8ffca` pushed.

### Gusher County correction — 2026-09-20 run 5

**IMPROVED / HELD.** Actor occlusion falls 100% → 2.00% desktop / 2.27% phone. The tall cabin narrows within unchanged overall bounds, heights and footprint (126 vertices); rust-sheet UVs reuse existing iron paint, reducing camp red-body share 57.6% → 0%. Ground RMS -44.27% / -38.98%. Camp 5 m station reduces phone HUD 60.135% → 0.010%; phone entry still crops and has 19.097% persistent coverage. Oil-channel/lease vista and connected pipe art remain held. [Every clause and final boards](run-5/e4-gusher-county/review.md).

Builds, final scoped checks, shared lighting/collision, loading/repeat and guards pass across the final receipts. Our initial ground-detail regression passed on exact base and was corrected to satisfy the unchanged panorama matrix. Final own batch 9 pass / one navigation failure; isolated errand retry 2/2. Four-run p95 9.35→9.25 / 8.80→8.75 ms; draws 73/54 unchanged. Engine `d9771424552e194e198257098a5c4e235d0101c5c9f063adf030d42fcd2ef0eb` → `491f2a917b0e360fcaa1e0eda3ee5eb7ba840cc1cd9bf852e3d574d34350725d`. Store `b9597680a8c6eff78526b0c2af2cdc3f05b86f85` pushed.

### Capped stop — 2026-09-20 run 5

Three maps completed and committed in order: Dust Flats, Long Road, Gusher County. Boneyard was not started. The Last Claim remains UNACCEPTED in my judgment: its retained plain-entry evidence lacks the circular deck, orrery, ornate rim and preserve-station architecture, and portrait supplies no architectural context. Its sculpt-pack correction remains on the continuation list. [Ordered remaining work, HUD handoff, engine pairs and gate exceptions](run-5/handoff.md).


## Sixth run — 2026-09-21 (task sol-map-art-corrections-4)

The full remaining list is authorized in order, beginning with the Boneyard. Preflight passed: code d00459be2c130d6dbd029339640dbc44baa2a5f2, store b9597680a8c6eff78526b0c2af2cdc3f05b86f85, no ahead commits or unowned edits; permitted guard log only, no evidence discarded. Required art symlinks resolve, npm install and default build pass. Store branch `astra/corrections-4` starts at main. [Preflight](run-6/preflight.json).

### The Boneyard correction — 2026-09-21 run 6

**IMPROVED / HELD.** Ground RMS -53.93% desktop / -48.91% phone; pressure-engine sleeper replaces the cabin, 1,842/3,000 triangles within unchanged bounds and footprint. Declared boiler 5 m station reduces phone HUD 45.00%→0%; sleeper 8 m reduces original 14 m coverage 39.76%→0.80%. Entry yard context, richer burial/metal and shared vehicle art remain held. [Every clause, final boards, critique and gates](run-6/e4-boneyard/review.md).

Builds, scoped guards, map census, shared brightness/collision and loading/repeat pass. Motor batch 24 pass / two malformed-tape failures reproduced on exact base; no assertion changed. Four-run p95 9.80→9.90 / 9.95→9.80 ms, draws 62/49 unchanged. Engine `491f2a917b0e360fcaa1e0eda3ee5eb7ba840cc1cd9bf852e3d574d34350725d` → `c8da6e7c043bb2f42b5fd2f94d17d83387d7a29abca9adffab1d15994ce5681e`.

Boneyard store commit `dfac96930cee55742fde0f99c19ba4b70c9ddc05` pushed on `astra/corrections-4`.

### The Glow Mesa correction — 2026-09-21 run 6

**IMPROVED / HELD.** Ground RMS −41.49% desktop / −39.21% phone; whole-body emission 3.0→0.45 with lit diffuse paint. Pylon 5 m station phone HUD 8.90%→0%; derrick 3 m 0.090%. Entry rack remains cropped and 95.31% HUD-covered on desktop, entirely offscreen on phone. Mesa composition, facility grouping and daytime node-ring visibility remain held for their named owners. [Every clause and evidence](run-6/e6-glow-mesa/review.md).

Builds, scoped guards, selected Glow Mesa/Pressure Garden census, shared brightness/collision and loading/repeat pass. Own batch 39 pass / one story-arrival timeout; unchanged retry 2/2. Four-run p95 9.75→8.90 / 9.70→9.60 ms, draws 68/48 unchanged. Engine `c8da6e7c043bb2f42b5fd2f94d17d83387d7a29abca9adffab1d15994ce5681e` → `68d976b06be1045f935047e482b765d91d61b045b45c87d77d677715b4e528e4`. Store `a368aba78a3f65bb93e46a9a624c617fb2d90b18` pushed.

### Half-Life Hollow correction — 2026-09-21 run 6

**IMPROVED / HELD.** Ground RMS −40.00% desktop / −40.30% phone; median +48.17% / +73.04%. Gate 5 m station phone HUD 66.27%→0.17%. Ordinary entry still shows the unchanged ochre slab and no gate; crossing presentation is held for the Game owner, full ravine composition for layout/camera. [Every clause and evidence](run-6/e6-half-life-hollow/review.md).

Builds, scoped guards, own 20 checks, selected Hollow/Glow Mesa census, shared brightness/collision and loading/repeat pass. Four-run p95 9.55→9.50 / 9.60→9.60 ms, draws 73/52 unchanged. Engine `68d976b06be1045f935047e482b765d91d61b045b45c87d77d677715b4e528e4` → `d2f15b7a6ec3c5e04fa54c71dfcc16dda4288e20d6890f0eedca77b9035b878f`. Store `850ae868ef5688c79f20f98f1bbda515065efa4b` pushed.

### The Picnic correction — 2026-09-21 run 6

**IMPROVED / HELD.** Four previously unselected nonblocking bodies mount (three blankets and staging gate), 5→9 bodies, +1,452 authored triangles. Original Glow Mesa collision-backed bodies remain; shade is held for the active collision alias. Ground RMS −45.92% desktop / −43.46% phone; emission 3.0→0.45. Pylon 5 m phone HUD 0%, entry 21.42%; blankets still outside phone entry, west desktop blanket 34.71% HUD-covered and cropped. Gathering and entry grouping remain held. [Every clause and evidence](run-6/e6-picnic/review.md).

Builds, scoped guards, own 20 checks, selected Picnic/Glow Mesa census, shared checks, loading/repeat and dedicated six mount/dispose cycles pass. Four-run p95 9.70→10.00 / 10.00→9.75 ms, draws 87→90 / 53→54, within 15%. Engine `d2f15b7a6ec3c5e04fa54c71dfcc16dda4288e20d6890f0eedca77b9035b878f` → `338b9a112823ee64444dc9d7cc4525dea0e2bc84474174c6af583ea8ce9545ad`. Store `13038c4f2324f0fec063663db72ccde43238301a` pushed.

### The Dead Band correction — 2026-09-21 run 6

**IMPROVED / HELD.** Two authored nonblocking frames mount, 5→7 bodies, +336 triangles; warning frame appears at entry. Ground RMS −45.64% desktop / −40.92% phone; radio entry median 0.115→0.210 at emission 0.45. Radio 2 m phone HUD 51.46%→0.52%; warning 3 m 0.026%, north gate 3 m 3.51% with side crop. Paired-terrace vista, held solid mounts and entry HUD remain with named owners. [Every clause and evidence](run-6/e7-dead-band/review.md).

Builds, scoped guards, visual census, shared checks, loading/repeat and six mount/dispose cycles pass. Own batch 39 pass / five failures, all reproduced on exact base: era enable/activation on both projects and mobile Save Tape visibility. Four-run p95 9.55→9.65 / 9.65→9.60 ms, draws 77→78 / 55→56, within 15%. Engine `338b9a112823ee64444dc9d7cc4525dea0e2bc84474174c6af583ea8ce9545ad` → `c4de03c756e538abb6c3787d9a1e4b80cc03b62cc3de095eaa2fedb8df814ab4`. Store `d852b15ac75bb588ab3c45912f0d704abe90261a` pushed.

### Relay Rush correction — 2026-09-21 run 6

**IMPROVED / HELD.** Four relay frames mount, 5→9 bodies, +1,264 authored triangles. Ground RMS −51.24% desktop / −49.40% phone. R2 entry phone HUD 2.91%; west dish 3 m 76.11%→6.60%; charting station 2 m 0.60%. Equal-height route, peripheral entry crop/HUD and full vista remain held. Low frame platform covers 6.5% of the player sprite at the feet. [Every clause and evidence](run-6/e7-relay-rush/review.md).

Builds, scoped guards, own 16 checks, six Signal row checks, visual census, shared checks, loading/repeat and six mount/dispose cycles pass. Four-run p95 10.10→10.05 / 10.00→9.95 ms, draws 68→70 / 51→52, within 15%. Engine `c4de03c756e538abb6c3787d9a1e4b80cc03b62cc3de095eaa2fedb8df814ab4` → `36abad02458965365c31dfe66a98155d66182324ab136feb6709bfa791ff0abc`. Store `0535aa5ffca2f422b0d15b378044d00b9e47771a` pushed.

### The Far Side correction — 2026-09-21 run 6

**IMPROVED / HELD.** Landing frame mounts, 5→6 bodies, +600 triangles. Inherited rail stripe contrast 36.09%→1.56%; fine-ground high-pass RMS 0.00159→0.00661 / 0.00128→0.00647. Frame entry phone HUD 10.385%, 3 m 5.768%; array 3 m 37.22%→10.75%. Circular vista, equipment compound and solid variant mounts remain held for named owners. [Every clause and evidence](run-6/e8-far-side/review.md).

Builds, scoped guards, Far Side parity/census, shared checks and loading/repeat pass. Own batch 22 pass / two ordinary Mare Claim arsenal failures reproduced on exact base. Four-run p95 9.70→9.75 / 9.60→9.70 ms, draws 62→63 / 49→50, within 15%. Engine `36abad02458965365c31dfe66a98155d66182324ab136feb6709bfa791ff0abc` → `37a425e8df7634b36005ac5712ccee589eba59ab7aac41f7033a2949d203c146`. Store `d134d7607cda6b995a9421c5727fbd11f9a69230` pushed.

### Low Orbit correction — 2026-09-21 run 6

**IMPROVED / HELD.** Recovery housing and braced ring, 2,360→2,972/3,000 triangles; chamfered base area −29.29%. Body dark share 81.17→7.74% / 80.85→7.83%. Ground median 0.076→0.255 / 0.085→0.256; RMS −59.55% / +66.79%. Declared 3 m phone HUD 54.376→0.998%, entry remains 47.291%. Suspended composition, debris depth, material fidelity and entry UI remain held. [Every clause and evidence](run-6/e8-low-orbit/review.md).

Builds, scoped guards, own momentum/physics, movement, parity/census, shared checks and loading/repeat pass. Two ordinary Mare Claim arsenal failures reproduce on exact base. Four-run p95 9.80→9.50 / 9.90→10.10 ms, draws 77/55 unchanged. Engine `37a425e8df7634b36005ac5712ccee589eba59ab7aac41f7033a2949d203c146` → `d7cad8f8bd1ebb800b36fff3531b8726760b5430fcb516cd39d32a71bb420bcf`. Store `2a1c3e11ec470fb3761cb9e462d39b025b61f24f` pushed.

### The Dome Basin correction — 2026-09-21 run 6

**IMPROVED / HELD.** Dry mineral route and geared lock wheel, 452→1,580/3,000 triangles. Ground RMS −49.33% / −39.41%; 5 m body median 0.054→0.327 / 0.067→0.325. Low-surface material mismatch fixed. Declared 5 m phone HUD 48.008→0%, silhouette fits; ordinary phone lock remains offscreen. Wet state, monumental chamber, terraced settlement, rail joins and entry composition remain held. [Every clause and evidence](run-6/e9-dome-basin/review.md).

Builds, scoped guards, final canal stages, census, shared checks and loading/repeat pass. Six arsenal/profile failures reproduce on exact base. Four-run p95 8.90→8.90 / 9.85→9.45 ms; draws 88/53 unchanged. Engine `d7cad8f8bd1ebb800b36fff3531b8726760b5430fcb516cd39d32a71bb420bcf` → `8e71546045562c64ef70c60d2616e0a2cc1cee965709dc89d691ca13d57164dc`. Store `4613a6ff288eb6e984dbdd44e7e861ee1627da73` pushed.

### The Seed Run correction — 2026-09-21 run 6

**IMPROVED / HELD.** Enclosed curved seed vault, 800→2,148/3,000 triangles; base area −29.29%. Four dry route segments and three green zones gain continuous pigment. Ground RMS −59.39% / −62.50%; entry body median 0.094→0.254 / 0.097→0.254. Declared 3 m phone HUD 53.759→0%, full bbox fits; ordinary phone entry coverage increases 16.057→23.326%. Convoy, irrigation, distant settlement, materials and ordinary entry remain held. [Every clause and evidence](run-6/e9-seed-run/review.md).

Builds, scoped guards, final own caravan/seam 15 pass / one intentional skip, census, shared checks and loading/repeat pass. Two ordinary-roster failures reproduce on exact base; an earlier seam failure also reproduces on base, while final candidate passes. Four-run p95 10.20→10.05 / 9.95→10.00 ms, draws 126/72 unchanged. Engine `8e71546045562c64ef70c60d2616e0a2cc1cee965709dc89d691ca13d57164dc` → `ba67e6db9a2d8b34e23fcb1bacdc4e00a8ce72e84c347d9d6bbf3f9975a5a66f`. Store `3c023c883f3d30179fbaef26a22629e31efe7df5` pushed.
