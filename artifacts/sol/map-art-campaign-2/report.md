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

### Devil's Alley correction — 2026-09-21 run 6

**IMPROVED / HELD.** Three braced coil anchors, west/center/east 1,848/2,192/2,536 triangles under 3,000 each; base area −29.29%. Entry body median 0.084→0.254; ground RMS −40.50% / −20.91%. Declared 3 m phone HUD 7.071→0.004%, full bbox fits; ordinary phone 5.175→5.880% remains held. Functional 8 m rings retained; storm layout, fine materials and entry UI remain held. Later-state sweep is shown separately. [Every clause and evidence](run-6/e9-devils-alley/review.md).

Builds, scoped guards, own relocation/story 16/16, census, shared checks and loading/repeat pass. Two roster failures reproduce on exact base. Four-run p95 9.70→9.75 / 9.60→9.85 ms; draws 88/58 unchanged. Engine `ba67e6db9a2d8b34e23fcb1bacdc4e00a8ce72e84c347d9d6bbf3f9975a5a66f` → `6b6c1185f0c23a0a2235502e69238db177900147ab630e66db1120c9cb30ada2`. Store `57a399b81a9d2911364c0770e10a6a5c6eb414c6` pushed.

### The Old Canal correction — 2026-09-22 run 6

**IMPROVED / HELD.** Undecided translucent slabs replaced by broken low masonry, 552 triangles per band, 0.015–0.395 m above sampled ground. Three supported hand-winches, 1,444/1,456/1,468 triangles within 3,000 each. Dry pigment exposes six inherited route segments. Ground RMS −69.99% / −25.61%; entry body median 0.095→0.186 / 0.102→0.190. Declared 5 m phone HUD 24.030→0.111%; 3 m rejected for decision-panel overlap (6.316%). Ordinary phone coverage 15.861% remains held. Depth, contact shadows, continuous wet vista and full architecture remain held. [Every clause and evidence](run-6/e9-old-canal/review.md).

Builds, scoped guards, own choices/persistence 8/8, relevant story 6/6, census, shared checks and loading/repeat pass. Presentation proof covers three-state visibility, idempotent substrate resampling and 18 resource disposals. Two roster failures reproduce on exact base. Four-run p95 9.85→9.30 / 9.60→9.35 ms; draws 91→90 / 59→59. Engine `6b6c1185f0c23a0a2235502e69238db177900147ab630e66db1120c9cb30ada2` → `c2018fcb58b57688525b2afe23a8fd99dd20e3ce481894e58f9017db628333c7`. Store `ce3a6a5ad3b8d9f44c4adece0d6c8b424735b5e4` pushed.

### The Last Claim correction — 2026-09-22 run 6

**IMPROVED / HELD, Astra's own verdict.** Missing sculpt mount fixed with a dedicated terrain (32,768/60,000), panorama (1,024/4,000) and five monuments (528–1,328/3,000 each). Lantern visible at phone entry: body median 0.460, emission 0.45, HUD 0.134%; declared 5 m 0.058%. Ground RMS +133.58%/+109.50%, an explicit increase from replacing dust with paving. Existing square gameplay floor and three sites retained; circular boundary, ornate rim, heart/grayscale, legacy Ark deck and full entry composition remain held. [Every clause and evidence](run-6/e10-last-claim/review.md).

Builds/scoped guards, shared checks, loading/repeat, six pack cycles and exact Blender reexports pass. Own batch 30 pass/four exact-base failures. Census still expects painted; its recorded failure is handed to the drain. Height grid matches at vertices; off-grid mean 0.00488 m, p95 0.02661 m, max 0.21973 m. Final four-run p95 17.25→9.90 / 17.45→9.90 ms, draws 81→84 / 55→56; different timing modes are retained and no causal speedup claimed. Conservative eight-run envelope stays within 15%. Engine `c2018fcb58b57688525b2afe23a8fd99dd20e3ce481894e58f9017db628333c7` → `2a898e9e9e87ddd72c9dea598df97363c9e179592ef33e69a54871da21c1efd3`. Store `97d29c730796c9b5ddfae1f44073c44e1eced3e0` pushed.

### 2026-09-22 — Ember Shore (fourteenth map in run 6)

IMPROVED / HELD. Rebuilt the cooled recovery machine at 2,356/3,000 triangles, same envelope and collider, and added one basalt pigment/grain treatment to the existing sculpt/continuation. Ground median 0.053→0.337 / 0.061→0.321; RMS +480.73%/+115.90% reflects visible detail replacing near-black pixels. Body median 0.123→0.231 both, emission 0.45. Five declared 5 m stations fit with HUD ≤0.199%; actual entry altar 0.069% desktop / 0.791% phone. Giant buried titan, fractured shelves/branching channels, southeast rectangular tone join, contact/light pools and normal story/UI overlap remain held by the named owners.

Own 12, story 14, census 2, registry simulation parity 2 pass; registry mount assertion has two exact-base failures (The Claim 51,200 vs stale 32,768). Shared 16 pass/4 skips, builds/scoped guards, loading/repeat, six cycles and all-five-source proof pass. Quiet four-per-arm p95 10.10→10.00 / 10.00→10.10 ms; draws 72/54 unchanged. Engine `2a898e9e9e87ddd72c9dea598df97363c9e179592ef33e69a54871da21c1efd3` → `0df7afdfb61520a896c158f0208e401731a733f465ab77a8fc4232bc495c65ba`; pin untouched. Store `caf34490756564bd8dfb1693070e479147590c58` pushed. [Complete clause record](run-6/e10-ember-shore/review.md). Next: Archive World, then River render half.

### 2026-09-22 — Archive World (fifteenth map in run 6)

IMPROVED / HELD. Open library gate 1,128→888/3,000 triangles, exact envelope/mount, desktop entry body pixels −31.83%. Ground RMS −55.44%/−50.11%; upper-edge median 0.071→0.226 / 0.074→0.225, decorative continuation 5,120 triangles and zero boundary-height gap. Earned-only pool control 0.247→0.395 median. Entry HUD 22.764%/15.794%; declared 10 m gate bbox fits but phone HUD 68.719% remains explicitly unaccepted. Stack inspections at 3 m reduce phone coverage to 8.122/7.349/13.604%, marker 0.007%. Full layered vista, restoration-state edges, structural contact, book detail and camera/UI composition remain held.

Own board/profile 2, story 14, registry simulation parity 2, Archive state/contract node 4 pass; four census/registry mount failures reproduce at exact base. Shared16/4 skips, builds/scoped, loading/repeat, six cycles and all-five-source proof pass. Four-per-arm p95 9.35→9.50 / 9.50→9.80 ms; draws72→73/51→52. Engine `0df7afdfb61520a896c158f0208e401731a733f465ab77a8fc4232bc495c65ba` → `9ab63072bf545c545e192f2a6d4623ccceb60235662638adb6f3c27736648cf5`; pin untouched. Store `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7` pushed. [Complete clause record](run-6/e10-archive-world/review.md). Remaining: River render half.

### 2026-09-22 — River (sixteenth and final map in run 6)

IMPROVED / HELD. Material-only treatment of the raw painted route: bank RMS −21.09%/−9.12%; short broken water highlights avoid the ford. Three materials/six cleanup cycles preserve geometry, properties, uniforms and callbacks; zero new triangles. Raw 128 m fallback and actual finale’s 64 m Claim charter remain distinct, real lever verified on both viewports. Canonical route, rocky shoreline/ford, one-pan composition and ordinary HUD remain held by contract/finale/art/UI owners. Zero raw landmarks makes landmark-specific HUD coverage not applicable. The first ruled ripple candidate was rejected; final independent review confirms that narrow defect resolved. [Complete clause record](run-6/e10-river/review.md).

Builds/scoped guards and 18 own/story checks pass; final boot/finale four pass, charter/board/debt census six pass. Two secured-claim failures reproduce at exact base. Broad map census is an unavailable-contract exemption, not behavioral proof. Four-run performance shows desktop fast 10.10→9.90 ms / slow16.65→16.30 ms; phone fast9.90→9.95 ms. Pooled desktop +17.91% reflects different mode populations, with every candidate mode within15% of its corresponding baseline. Draws79/58 and triangles81,448/69,440 unchanged. Engine `9ab63072bf545c545e192f2a6d4623ccceb60235662638adb6f3c27736648cf5` → `4374cdbfcb7631c86982f9439fb30583eb3eba1acbf70e1bcccaf8fb6e210b21`; pin untouched. Store unchanged at pushed `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7`.

All 16 requested maps now have per-map corrections and explicit holds. Remaining list: **none**. [Ordered completion, HUD handoff and all hash pairs](run-6/handoff.md). Full concept acceptance is still withheld; full node gates and engine pin remain drain-owned. Ember/Archive objective text is restored to its prior column, with these art verdicts in the visual column.


## Run 7 — 2026-09-22: variant solids and parent-plus-variant collision

IMPLEMENTATION COMPLETE; READY-FOR-GATES WITH HOLDS. Owner-authorized F-CORR4-2 follow-on. Baseline code `823b06b1dce4b861be2fccf646245fc4cc864588`, store `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7`; install and default build pass. Cleanliness: only `?? logs/guard-stats.jsonl` (permitted factory churn), no evidence discarded. Store clean before branching to `astra/f-corr4-2`; required raw plate and terrain resolve. Parent transforms, registry numbers, gameplay contracts, heights and masks remain frozen. The existing renderer already composes variant mounts from the mirrored terrain contract.

Remaining in order: none.

Run-7 preflight correction: the task says Eclipse has no own registry entry, but this base contains four Eclipse records. The resolver therefore names only the four authorized unions; the alias-only control tests and full unaffected-map snapshot pass.

Run-7 floor verdict: 81/83 unchanged; only Picnic moved. Seed 01: timeMs 97967→97367, kills 35→24, eventLogHash fnv1a32:6dc50c46→fnv1a32:a887b86b. Seed 02: 98533→100200, kills 32→25, hash fnv1a32:774ca441→fnv1a32:547712da. The shade at (0,40) is the only new Picnic blocker. Pins left untouched for the drain.

Run-7 parity qualification: all four maps retain exactly their base rows (32 equal, 10 agent-lacks), independently reproduced from base code 823b06b1d in an isolated scratch extraction. The requested all-EQUAL result cannot be claimed; the missing tape/control verbs belong to the parity owner and are outside this firewall. See run-7/same-game-comparison.json.

Run-7 verification qualification: an initial browser batch was interrupted after an in-root scratch extraction triggered a Vite full reload (06:27:51). Its Picnic palisade and E6 boot failures are not accepted results. The scratch tree moved outside the watched root; the complete stable rerun finished at 45 passed / 6 exact-base terrain-registry failures / 1 skipped. The Picnic palisade and E6 boot failures vanished. Initial paired frames also exposed stale-module baseline capture: the frozen renderer referred to a different Terrain module instance and the variant raw matcher missed `?import&raw`. Final captures use unchanged live renderer bytes plus the frozen collision/variant data, assert before/after body counts, and confirm identical hero ground height; all invalid attempts remain in local raw evidence.

### Run 7 — The Picnic

**FIXED variant solidity / HELD prior composition and baseline parity debt.** All 1 registered variant solids mount beside the five unchanged parent bodies and the already selected nonblocking dressing: **9→10 bodies**, **+216 authored triangles**. No geometry, atlas, source transform, height, mask, gameplay contract or registry number changed. The renderer already composes these mirrored mount tables, so no renderer code change was necessary.

1280px p95 10.20→10.25 ms (+0.49%), draws [90]→[90]; 390px p95 9.90→10.10 ms (+2.02%), draws [54]→[54]. Engine `4374cdbfcb7631c86982f9439fb30583eb3eba1acbf70e1bcccaf8fb6e210b21` → `da49237c406cfbb90e634443440aaaddeb0d4185afa98e99e9e5f6cf0848d232`; store `187e555ea982f12fe7f988184c6574a6298dcaa9`. [Boards, probes, bounds and gates](run-7/e6-picnic/review.md).

### Run 7 — post-commit test caller check

The newly tracked collision union test passes all six assertions but is not yet listed in the permanent node battery. The required named-guard batch is therefore 2/3 after the first commit; its earlier pre-commit pass omitted the untracked file. A one-line package.json roster addition requires a task-firewall exception, requested from the owner. [Attribution and exact proposed fix](run-7/gate-caller-attribution.md).

### Run 7 — The Dead Band

**FIXED variant solidity / HELD prior composition and baseline parity debt.** All 3 registered variant solids mount beside the five unchanged parent bodies and the already selected nonblocking dressing: **7→10 bodies**, **+3792 authored triangles**. No geometry, atlas, source transform, height, mask, gameplay contract or registry number changed. The renderer already composes these mirrored mount tables, so no renderer code change was necessary.

1280px p95 10.00→10.00 ms (+0.00%), draws [78]→[78]; 390px p95 10.00→10.05 ms (+0.50%), draws [56, 57]→[56]. Engine `da49237c406cfbb90e634443440aaaddeb0d4185afa98e99e9e5f6cf0848d232` → `f00319a05cf5f5d6bea92a824e5377188e98c44da7238d8db2d659e32e4f9f13`; store `3c25d72a9de66c5fbaa633be41df390a8d79d245`. [Boards, probes, bounds and gates](run-7/e7-dead-band/review.md).

### Run 7 — integration boundary

Land the completed `sol/map-art-campaign-2` code branch together with all four map selections from store branch `astra/f-corr4-2`. The shared resolver in the first code commit enables the four unions at once; integrating that commit without the corresponding store selections would temporarily leave the later maps’ new blockers invisible. Per-map commits preserve review and evidence boundaries; the final code/store heads are the integration unit. Engine-era and null-floor pin updates remain drain-owned.

### Run 7 — Relay Rush

**FIXED variant solidity / HELD prior composition and baseline parity debt.** All 1 registered variant solids mount beside the five unchanged parent bodies and the already selected nonblocking dressing: **9→10 bodies**, **+552 authored triangles**. No geometry, atlas, source transform, height, mask, gameplay contract or registry number changed. The renderer already composes these mirrored mount tables, so no renderer code change was necessary.

1280px p95 9.75→9.20 ms (-5.64%), draws [70]→[70]; 390px p95 9.80→9.60 ms (-2.04%), draws [52]→[52]. Engine `f00319a05cf5f5d6bea92a824e5377188e98c44da7238d8db2d659e32e4f9f13` → `39f21aea8a827ba58c52363c354420aa5cc19ea55ba1b2751ea264e04b6f6d2b`; store `0787a539f6ee70886bc4867909fd70c0de4a3ba7`. [Boards, probes, bounds and gates](run-7/e7-relay-rush/review.md).

### Run 7 — resolver compatibility check

Final review caught an inherited-property regression in the array-valued alias table: `constructor`, `__proto__`, and `toString` threw instead of returning the original empty list. A one-line array check restores the baseline behavior. The extended unit test was red before and green after the fix; all 43 registered-map/alias results are byte-identical across it. [Reproduction](run-7/prototype-compatibility-before-fix.json) · [Corrected result](run-7/prototype-compatibility-after-fix.json) · [Red test](run-7/prototype-test-red.log) · [Green test](run-7/prototype-test-green.log). The final Far Side gates include fresh builds, movement proofs, captures, timing and focused collision/recovery/parity regressions on this corrected source.

### Run 7 — The Far Side

**FIXED variant solidity / HELD prior composition and baseline parity debt.** All 4 registered variant solids mount beside the five unchanged parent bodies and the already selected nonblocking dressing: **6→10 bodies**, **+1396 authored triangles**. No geometry, atlas, source transform, height, mask, gameplay contract or registry number changed. The renderer already composes these mirrored mount tables, so no renderer code change was necessary.

1280px p95 9.40→9.70 ms (+3.19%), draws [63]→[63]; 390px p95 9.45→9.75 ms (+3.17%), draws [50]→[50]. Engine `39f21aea8a827ba58c52363c354420aa5cc19ea55ba1b2751ea264e04b6f6d2b` → `3ece8e8fac9f610d43579194a9d83b81f36f81a7ffdd5105fcf6c4ec191112a9`; store `300caacfa15ad6be5e6bf41be80b0c5a331c443c`. [Boards, probes, bounds and gates](run-7/e8-far-side/review.md).

### Run 7 — completed handoff

All four maps are implemented: **nine existing solids selected, 5,956 additional mounted triangles, ten total bodies per map**. Parent blockers and models remain. Across both viewports: **54 published destinations per viewport reachable**, **72 face probes**, **18 embedded-hero escapes**, **24 mount/dispose cycles** with zero retained scene children. Ordinary before/after boots have zero errors. Final-source focused browser checks **26/26** and scoped node guards **40/40** pass. All four maps pass the four-run, 15% timing budget. Final E1 payload is **34,271,491 B**, **+96 B** of compiled resolver code, no E1 pack additions.

This is not an all-green handoff. The new union test still needs its permanent package roster entry; the task firewall excludes package.json, permission was requested, and the prepared patch passes `git apply --check`. Named guards remain **2/3**. Full browser batches are Picnic **45/6/1**, Dead Band **97/14/1**, Relay Rush **97/34/1**, Far Side **61/10/1** (pass/fail/skip); base reproductions and their exact scope are in each map’s attribution. Static same-game rows remain **32 equal / 10 agent-lacks** on the exact base and candidate. Only Picnic’s two null floors move, as detailed above; the drain owns pins. Far Side’s remote northern-rim hero occlusion is visible in both arms and remains outside this footprint task.

[Machine-readable handoff, all solids/positions, full engine hash pairs and samples](run-7/handoff.json). Store branch `astra/f-corr4-2` is pushed through `300caacfa15ad6be5e6bf41be80b0c5a331c443c`. Land the complete code and store heads together. **Remaining maps in order: none.**

## Eighth campaign section — 2026-09-22: the raw River pack (run 7)

**FIXED missing pack / IMPROVED shoreline and wet stones / HELD full concept.** The raw `e10-river` now owns a 128 m grid preserving the captured visual heights, a separate dawn panorama and five nonblocking bodies. Terrain **32,768/60,000**, panorama **1,024/4,000**, four shore groups **2,240/3,000 each**, ford stones **1,600/2,000**: **44,352 authored triangles, 132 stones, zero collision mounts**. Raster bytes are reused; executable recipe, saved sources, exact reexports and provenance are supplied in the art store.

Maximum vertex error **5.9125e-8 m**; off-grid mean/p95/max **0.004881/0.026606/0.219734 m**. All stones intersect the sampled surface and keep a **2.2 m** clear center strip. Both banks and the ford pass actual movement at 1280/390; six total mount/dispose cycles preserve original water and restore callbacks. The actual finale lever still opens the separate **64 m `the-claim`** route at both widths. Gameplay bytes differ only by the owner-authorized description; no render flag was required.

Four fresh browsers per arm give matching fast-mode p95 medians **10.10→9.35 ms desktop / 10.10→9.90 ms phone**, draws **79→83 (+5.06%) / 58→62 (+6.90%)**. Every candidate sample is within 15% even against the fastest baseline; bimodal baseline samples remain in the raw data and no causal speedup is claimed. TypeScript/default/full/E1 builds, 34 scoped guards and 3 named guards pass; requested E2E batch **24 pass / 6 intentional skips / 0 failures**, final River boot **2/2**, shared loading **8/8** and repeat **2/2**. E1 payload **34,272,559 B**.

The dark straight water, rectangular ford, weak wet contact, distant dawn framing, outer continuation joins, one-pan composition and ordinary HUD remain held by the named water/art/camera/contract/finale/UI owners. Phone shore groups extend outside the viewport; tiny surviving ford mask fragments do not establish full-body HUD clearance. Prior campaign and gameplay parity debt is unchanged.

Store **`d5e25522490ae7342e497ce58f51239040a41eb3`** is pushed on **`astra/f-corr4-18`**; land with this code branch. Engine **`52a84bc29febd924518528080bee8d0843e4e6d5c89165c1f8cb6f43dd61bcd5` → `6abbafbebf86f1af6cd5496a7d6eb530337e3ff66b16d18aaef691fd9d22d3f5`**, pin left for the drain. **READY-FOR-GATES**, no remaining implementation in F-CORR4-18. [Every original clause, boards, heights, timing modes, source proofs and checks](run-7/e10-river/review.md).

## Fidelity run 8 — 2026-09-22: The Last Claim

**IMPROVED / HELD; full concept unaccepted.** Native engraved bronze with radial material coordinates replaces cobbles; three local pools/contact collars, a native star vista and a 32-bay perimeter with 2.5 m side fascia improve the memorial setting. Panorama **1,024→3,584/4,000 triangles**, one extra draw. The square floor, every terrain triangle, heights/masks, monument bounds/mounts and collision/gameplay authorities are unchanged. Recognizable repeated motifs, finer rim ornament and full lighting hierarchy remain art-owned; the square/circular conflict, Ark integration, grayscale/heart, orrery platform and normal HUD remain with their named owners.

Against this map's own run-6 after numbers, ground RMS **0.055721→0.048920 desktop (−12.21%) / 0.052200→0.048123 phone (−7.81%)**; median **0.292783→0.299691 / 0.310607→0.420976**. The independent review confirms improved rim depth and lantern contact, while warning that lower RMS does not hide recognizable repeated motifs. Lantern median remains about **0.460**, whole-body emission **0.45**; phone entry HUD **0.135%** versus run-6 **0.134%**, 5 m **0.012%** versus **0.058%**.

Four runs per arm/viewport: p95 median **9.10→9.05 ms / 9.15→9.00 ms**, draws **84→85 / 56→57**; one timing mode, both within 15%. Normal before/after boots share seed, HUD and 10.033 s entry state, zero errors. TypeScript/default/full/E1 builds, **34+3** scoped guards, final story **14/14**, census **2/2**, shared **16 pass/4 opt-in skips**, loading **8/8**, repeat **2/2**, six map mount/dispose cycles, seven saved-source reexports and production E1 exclusion **2/2** pass. E1 payload **34,274,360 B**. Four own failures reproduce on exact base (finale banking handoff and stale Archive seed expectation, each both projects); the extra release asset-name guard also reproduces four E4 jumper sprite filenames on exact base. Two initial unmatched story failures disappear on the final isolated 14-case run; their failed attempts are retained. No assertions changed.

Engine **88c4256efeb97d64c205919e785173b9c7375fd4553c92bbe26de6a37d197ea4 → c72f302925f627b0a783f8d44bd132ed1fa61ae737379454a746e1033e1adfeb**; pin untouched. Store **f3078c4001d86b8f177a1f1727464c32bdc166bb**, branch **astra/fidelity-1**. [Every held clause, boards, metrics, source proofs and attribution](run-8/e10-last-claim/review.md). **READY-FOR-GATES** for this map.

## Fidelity run 8 — 2026-09-22: The Ember Shore

**IMPROVED / HELD; full concept unaccepted.** Native mineral detail, shared terrain/continuation/panorama-ground pigment and exact edge-normal continuity reduce the broad southeast tone step. Vertical signed difference **−0.008616→−0.000967 (88.78% smaller magnitude)**; texture-inclusive absolute contrast increases. Against run-6 after values, ground median **0.336815→0.369592 / 0.321129→0.349130**, RMS **+21.40%/+19.95%**, no sampled near-black pixels. Fractured shelves, rectangular fissure termini, painted branches, warm contact and full vista remain art-owned. New rock candidates were rejected and removed. Terrain, mask, bodies, collision and gameplay bytes are unchanged; panorama retains **3,072/4,000 triangles** and every original position.

Four runs per arm/width: p95 **9.10→9.10 ms / 9.05→8.90 ms**, draws **72→73 / 54→55**, within 15%. Altar median **0.342/0.342**, emission **0.45**, phone entry/5 m HUD **0.768%/0.191%** versus run-6 **0.791%/0.199%**. Builds, **34+3** scoped guards, own preserve/squall **12**, story **14**, final census **2**, shared **16 pass/4 skips**, loading **8**, repeat **2**, six disposal cycles and exact source reexport pass. E1 payload **34,274,870 B**; native texture excluded. The full registry has **six exact-base failures**, all reproduced by fingerprint; no assertion changed.

Engine **c72f302925f627b0a783f8d44bd132ed1fa61ae737379454a746e1033e1adfeb → ac5caf75c8186240ed5c5e56ec5ea55c8b8769fa9db2324fb21726efdb34c200**. Store **75bdd35936c531da53094eaee94503b71ea1ea7f**, branch **astra/fidelity-1**. [Every clause, boards, invariants and attribution](run-8/e10-ember-shore/review.md). **READY-FOR-GATES** for this map.

## Fidelity run 8 — 2026-09-22: The Archive World

**IMPROVED / HELD; full concept unaccepted.** Native large masonry preserves run-6 quieting: ground median **0.241220→0.301716 / 0.229188→0.285762**, RMS **−0.30%/−2.65%**, no near-black sampled pixels. Four colonnaded perimeter ruins add eight arched openings/24 piers and **864 triangles**, panorama **3,936/4,000**, wholly outside the unchanged playable square. Original terrain and five body assets, mounts, masks, collision and simulation bytes remain exact. Independent review holds library-specific identity, distant layered skyline, finer contact/ornament and ordinary entry/portrait framing.

Earned floor/facade flags cycle exactly none→west→all→none without changing source state. Same-region warm-light control **0.313748→0.507973**, versus run-6 **0.246562→0.394525**. Whole-body emission **0.45**, scenery ambient **0.18**; 24 native samplers disposed across six cycles. Phone gate entry/10 m HUD remains **15.837%/68.733%**, versus **15.794%/68.719%**. This is retained camera/UI debt, not a framing success.

Four-run p95 **9.90→9.95 ms / 9.95→9.80 ms**, draws **73→75 / 52→54**, within 15%. Builds, **34+3** scoped guards, four Archive state/contract checks, shared **16 pass/4 skips**, loading **8**, repeat **2**, source replay and lifecycle checks pass. Full own batch **35 pass/8 exact-base fail/1 skip**, all failures reproduced by fingerprint. E1 payload **34,278,241 B**, new image excluded. No assertions or pin changes.

Engine **ac5caf75c8186240ed5c5e56ec5ea55c8b8769fa9db2324fb21726efdb34c200 → 872cfc6474c7bdcba83290f87685a14c6882749c12b5564bbe1a355a0d45a6ff**. Store **f5f617c48f33ee6f4577c4a60fade8faf7b08e8d**, branch **astra/fidelity-1**. [Every clause, boards, state proof and attribution](run-8/e10-archive-world/review.md). **READY-FOR-GATES** for this map.


## 2026-09-22 — run 8 fidelity: River

IMPROVED / HELD: 132→304 grounded stones, every original body triangle preserved, banks 3,000/3,000 and ford 2,000/2,000. Water RMS versus run 6 −30.59% desktop / −31.40% phone. Ground-only control remains pixel-identical; fixed phone region includes new rock edges and RMS worsens to 0.069623, disclosed. Draws 83/62 unchanged; p95 9.05→9.05 / 9.00→9.10 ms. Full bank relief, continuous gravel, local water contact, natural ford appearance and quiet-return framing remain held. Source/height/water-table/collision invariants and actual traversal/finale-route proofs pass. Four E10 failures match the exact base; all remaining scoped checks pass with recorded skips. [Every clause and evidence](run-8/e10-river/review.md). Store `a54dcc4ab31cb59e673f831b0b99161b38b62799`; engine `872cfc6474c7bdcba83290f87685a14c6882749c12b5564bbe1a355a0d45a6ff` → `db5803bef10a13daa735eab2d860a2d8608dba2104d0a00571d85fb98570aad7`. READY-FOR-GATES.


## Fidelity run 8 — 2026-09-22: Shared Motor hauler

**FIXED 2D/LITE request compatibility / IMPROVED shared body / HELD full art and entries.** The original 216-triangle box body becomes an authored cab, brass grille/lamps, steps and empty plank bed, **1,520/2,400 triangles**, five materials, no raster textures. Original occupied bounds and every movement/fuel/path/reset/arrival method remain exact. Emission **0.18**, production Meshopt body **40,608 B**. The original body remains for 2D/LITE and on load failure; late completions and all resources dispose safely.

All four Motor ground crops are pixel-identical to before; Boneyard RMS **0.032785/0.032934** retains its run-6 correction, the other three retain run 5. Body 5 m medians **0.201–0.203 desktop / 0.251–0.254 phone**, versus old **0.240835**: material proportions change, not a universal brightness increase. Boneyard desktop entry HUD **16.913→16.414%**, Dust **14.655→13.507%**, Gusher **0%**. Ordinary phone entries remain offscreen or covered by dialogue; Long Road's existing spawn landmark hides the body completely at entry and 5 m. Only an explicitly isolated view hides that occluder. Fine roof/tire detail stays vehicle-art-owned; entry framing/overlap stays camera/UI/map/contract-owned.

Final four-run pairs per arm/width: Boneyard p95 **8.85→9.05 / 8.90→8.95 ms**, draws **62→69 / 49→51**; Dust **8.95→9.10 / 9.05→9.00**, **77→84 / 52→52**; Long Road **9.80→9.90 / 9.60→9.55**, **59→61 / 49→51**; Gusher **9.70→9.75 / 9.55→9.65**, **73→80 / 54→54**. One mode in each comparison; largest p95 increase **2.26%**, draw increase **11.29%**, all within 15%.

Requested builds and **34+3** scoped guards pass; E1 first-town payload **34,279,452 B** unchanged. The shared body is emitted in E1 but not requested by ordinary Claim boots. All normal map captures have zero console/page errors; the supplementary pre-deploy E1-dist probe separately records its expected missing version metadata 404. Shared checks **16 pass/4 opt-in skips**, census **8**, loading **8**, repeat **2**, source reexport, six actual disposal cycles and compressed-body/2D/LITE probes pass. The final selected replay has **4 pass/22 exact-base failures**, every remaining fingerprint matched by project and assertion; the new 2D request regression was fixed, and the initial story failure cleared. No test assertions or pin changed.

Store **adf6bd1a22582459e64c2ddc1a37b1bd707ffa14**, pushed on **astra/fidelity-1**. Engine **db5803bef10a13daa735eab2d860a2d8608dba2104d0a00571d85fb98570aad7 → b7113b37c1a7e10b10f504947a660147c581c22b667aa1df2feb695bbb96100c**. [Every clause, four-map boards, final metrics and exact failure attribution](run-8/motor-hauler/review.md). **READY-FOR-GATES**. Remaining ordered task list: **none**; full concept and gameplay/entry holds remain explicit.


## 2026-09-22 — run 8: entry, Dead Band

**Already framed:** `iron-shadow-warning-frame` has **6,714 desktop / 7,570 phone** body pixels at rest and remains visible throughout the separate ~4 s sample. Applying the task's already-framed exception, it declares nothing and adds no manifest sentence. No camera glance runs. The ridge vista and HUD/art limitations stay HELD. Own suppression/census **12/12**, final builds and **61+3** guards pass; E1 payload **34,309,364 B**. All five broader Signal failures reproduce on the exact preceding map base. The shared lookup is corrected to bind runtime map IDs rather than variant authoring IDs; all 42 manifests preserve every other field. [Evidence and attribution](run-8/entry-framing/e7-dead-band/review.md).

Engine `b13e44ed083d03e30fee4cf9d6e3702ff8b6e167ddb88f20a7d24eae36cd7427` → `084df9fa71eef1eb63753addda63d7ee7b34a049e8394acfea11db36d284ae37`. Store unchanged at `4e9720b`; no empty store commit. READY-FOR-GATES with the five explicitly attributed baseline failures.


## 2026-09-22 — run 8: entry, Glow Mesa

**Fixed offscreen entry:** `mesa-starstone-derrick` names the raised cap's identifying derrick/working compound. Final corrected ease measures **0→37,168→0 desktop / 0→41,400→0 phone** body pixels; in-frame duration **1.416–1.525 / 1.359–1.468 s** inside a 2.5 s authored window. The rig visits the actual mount at the unchanged offset, then returns to the live hero. All normal tracking and replay poses retain their original path; final long-pan correction removes duplicate lag during the authored ease. The earlier captures are preserved. Full mesa/grouping/node-ring/model/HUD composition remains HELD. [Boards, measurements and checks](run-8/entry-framing/e6-glow-mesa/review.md).

Own checks pass after correcting the manifest sentence to extend an existing rule, shared/replay/view **28 pass / four opt-in skips**, loading **8/8**, repeat **2/2**, builds and **61+3** guards pass. Headless `now` snapshots match byte-for-byte; audit semantics match. Initial engine `b7113b37c1a7e10b10f504947a660147c581c22b667aa1df2feb695bbb96100c` → `b13e44ed083d03e30fee4cf9d6e3702ff8b6e167ddb88f20a7d24eae36cd7427`; final shared ease refinement is in the Far Side commit below. Store `4e9720b0788ebd6bccb6f2bd1f3945dbd855a50c`. Pin drain-owned.


## 2026-09-22 — run 8: entry, Far Side

**Fixed offscreen entry:** `earthrise-listening-array` represents the plate's isolated horizon dish opposite the landing compound. **0→26,144→0 desktop / 0→28,996→0 phone** body pixels; visible **1.377–1.490 / 1.375–1.491 s**. The existing camera reaches the z 56 mount from the z −36 entry without changing FOV, offset, zoom or hero start. During the authored ease, removing duplicate tracking lag prevents a mid-pan flip; all normal/replay poses remain exact, 600 long-pan proof frames retain the fixed orientation. Glow Mesa's final captures were refreshed. Full plate/model/vista and phone HUD composition remain HELD.

Builds, **61+3** guards, focused parity/census **6/6**, loading **8/8**, repeat **2/2** pass. Own **22 pass / two failures**; both arsenal availability mismatches reproduce on the exact preceding engine, candidate restored exactly. E1 payload **34,309,624 B**. [Boards, proofs and attribution](run-8/entry-framing/e8-far-side/review.md).

Engine `084df9fa71eef1eb63753addda63d7ee7b34a049e8394acfea11db36d284ae37` → `b3a86513d6b6511e4fa3049104211051d4cddac7fdda6c314a52144cdb98a288`. Store `2d1000357f06e44b42b7288ef8682b1919a66e05`. Pin drain-owned. READY-FOR-GATES with two attributed baseline failures.


## 2026-09-22 — run 8: entry, Half-Life Hollow

**Fixed offscreen entry:** `south-countdown-gate` names the plate's foreground clock gate at the timed crossing. **0→26,671→0 desktop / 0→29,787→0 phone** body pixels; visible **1.700–1.816 / 1.684–1.791 s** inside the 2.5 s authored window. Reachable with the original offset/FOV/zoom and hero start. The simple frame, terrain/continuation seam, ochre/teal crossing slabs, ravine and HUD composition remain HELD. Only the two mirrored metadata declarations change.

Builds, **61+3** guards and own crossing/roster/census **20/20** pass; E1 payload **34,309,830 B**. [Boards, counts and invariants](run-8/entry-framing/e6-half-life-hollow/review.md). Engine `b3a86513d6b6511e4fa3049104211051d4cddac7fdda6c314a52144cdb98a288` → `a8afc11f313a5bc6567deac76bb40da24aab1ff19d7f935146229510289ad7c1`. Store `d8938178a7464c637a79bca81d5f788bc8ad954d`. Pin drain-owned. READY-FOR-GATES.


## 2026-09-22 — run 8: entry, Relay Rush

**Already framed:** the plate's nearest relay shelf is represented by `rush-relay-r2-frame` at the actual start. Rest/mid/return body pixels **21,662→21,676→21,675 desktop / 24,145→24,126→24,124 phone**; visible throughout **≥3.965 / ≥3.957 s**. No declaration, manifest sentence or camera glance, following the explicit already-framed exception. The minor pixel changes are ordinary settling, not improvement. The wider terraces, charting station, west dish, active relay art and HUD remain HELD. Prior solidity and art are unchanged.

Own front/census **16/16** and visual census **2/2** pass. Builds and **61+3** guards from the identical final Hollow engine apply unchanged; E1 payload **34,309,830 B**. [Boards, counts and invariants](run-8/entry-framing/e7-relay-rush/review.md). Engine `a8afc11f313a5bc6567deac76bb40da24aab1ff19d7f935146229510289ad7c1` → same hash; store unchanged `d8938178a7464c637a79bca81d5f788bc8ad954d`. No empty art commit. READY-FOR-GATES, with final shared closeout to follow.


## 2026-09-22 — run 8: entry framing closeout

**READY-FOR-GATES:** all five maps completed, three declared camera glances and two already-framed exceptions. **No unreachable or remaining maps.** Final shared **28 pass / four opt-in skips**, exact Regatta replay **2/2**, agent-view **10/10**, ten uninstrumented boots **zero errors**. Thirty final `now` snapshots, **109,496 bytes**, are byte-identical; the audit is unchanged except source-line citations. Builds and **61+3** guards pass, E1 payload **34,309,830 B**. Seven broader Signal/Orbital failures reproduce on exact preceding map bases and remain held. Full art/vista/crossing/relay/HUD acceptance remains separate.

Store `d8938178a7464c637a79bca81d5f788bc8ad954d` is pushed and read back on `astra/entry-framing`; land it with `sol/map-art-campaign-2`. Final engine `a8afc11f313a5bc6567deac76bb40da24aab1ff19d7f935146229510289ad7c1`; pins untouched. [All measurements, boards, per-map commits, full hash pairs and failure attribution](run-8/entry-framing/handoff.md). Remaining list: **none**.


## 2026-09-23 — run 9 E1/E2 fidelity: Pressure Garden

**IMPROVED / HELD:** engraved gravel and shorter irregular current marks suppress the river's dark rectangular blocks: centre/margin contrast **0.11866→0.02009 desktop / 0.11949→0.01506 phone**, −83.1% / −87.4%. Seventy-eight grounded stones add 1,560 scenery triangles, panorama **2,112→3,672/4,000**; the ±6 m ford stays clear (closest vertex |x|=8.329 m). Run-4 desktop ground RMS remains **0.02328385**; phone **0.03124792→0.03321705**, +6.30% from the added silhouette, explicitly not a reduced-noise claim. Terrain/landmarks/atlas, collision, height, masks, mounts and stations stay unchanged. Whole-body emission remains 0.45.

HELD art: straight/slab-like shoreline reading, weak wet contact and greener/darker water with limited reflection. Parallel geography and prior boiler/terrace/HUD composition remain with their existing owners. Fresh independent review confirms the bounded improvement without new readability regression. [Verbatim clauses, full numbers and boards](run-9/e2-pressure-garden/review.md).

Final builds pass, **26 browser passes / four skips**, loading **8/8**, repeat **2/2**, six disposal cycles, **34+3** guards. The broad batch is **162 pass / six skips / six failures**; all six registry failures reproduce on exact base. The lane also predates mirror fixes already on main (`214a54568`, `82c226185`): its original gate stays red, while the exact canonical main script passes the unchanged assertion in an isolated tree. [Main prerequisite proof](run-9/mirror-prerequisite-proof.json). p95 **9.50→9.30 / 8.85→9.20 ms**, draws **90/58** unchanged. E1 payload **34,311,865 B**, +2,035 B versus the preceding engine; no E1 art assets change.

Engine `a8afc11f313a5bc6567deac76bb40da24aab1ff19d7f935146229510289ad7c1` → `e300ac0f43d653be8b76c3f65610264ad5c2db023a9dd15a115a275cad6ea6f7`. Store `25fed85ea017ff54abd78d5e4186dddf1dea6efc` pushed/read back on `astra/fidelity-2`; pin drain-owned. **READY-FOR-GATES** with attributed baseline failures and main prerequisite.

Scope audit: Night Shift, Twin Banks, Baron and Trestle are skipped because their latest reviews hold no clauses for this permitted art owner. [Exact owner audit](run-9/run-note.md). Remaining list in this leg: **e2-incline**.
