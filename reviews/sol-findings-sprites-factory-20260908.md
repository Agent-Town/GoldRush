# Gold Rush — sprite, animation and factory review

Reviewed September 8, 2026 in `sol/code-review-20260908`, base `d41ab98ce0d7fbc48bb01e8e87c92c61f148de2d (archive: pruned by the A3 rewrite)`, preserving the earlier six code repairs. The reviewed SpriteAnimator, orientation resolver, Hero, generated-asset loader and character contract are byte-identical to the live factory main checkout at inspection time. Factory main was `e6c065618 (archive: pruned by the A3 rewrite)` at `/Users/robin/Claude/Projects/Gold Rush`. Review evidence: `artifacts/sol/sprite-factory-review-20260908/`.

## Confirmed sprite findings

### F-AN0908-1 — P2 — North idle turns the Hero toward the camera

At `assets/layer-contracts/characters.v2.json:40`, the north rotation's idle cell is `char-hero-sheet-rotation-f-r2c3.png`, which depicts a front-facing Hero. `SpriteAnimator.pickClip()` resolves north, northeast and northwest idle through north. `mergeWalkSheetWithRotationIdle()` appends this old rotation idle to the newer walk sheet, so a correct north walk switches to the wrong-facing idle when movement stops. The live clip matrix shows the error for all three northward orientations. South idle also changes body proportions relative to the active walk set.

Correction: select idle cells from a coherent, verified directional identity set, and verify walk-to-idle transitions using rendered source cells. The current direction-file guards prove existence and alias ownership, not the direction painted in the image. Do not regenerate every locomotion sheet to fix one wrong binding.

### F-AN0908-2 — P2 — Most attacks and diagonal panning silently play walk cycles

`src/assets/character-runtime-frames.json` defines Hero pan clips for four cardinal directions and an attack clip only for east. At `src/assets/SpriteAnimator.ts:577`, a missing requested clip immediately falls back to that direction's walk before a compatible work/attack pose is considered. The actual runtime matrix demonstrates pan→walk for all four diagonals and attack→walk in seven of eight directions. `Hero.playAttackPose()` accepts all eight directions, so this is reachable through ordinary targeting. This does not prevent simulation damage or harvesting; it makes the visible action misleading.

Correction: define the intended action-facing fallback explicitly, then supply the missing poses where facing matters. Reusing an appropriate existing cardinal work pose may cover diagonal panning; an attack fallback needs to remain honest about aim and the pan/tool hand. Do not mark a direction complete merely because diagnostics say `clip: attack`: that field records the requested semantic clip even when the rendered source is a walk cell. The evidence explicitly serializes the non-enumerable `sourceFrameKey` to avoid this trap.

### F-AN0908-3 — P2 — South panning still carries a rectangular ground patch

The original work plate contains parchment rectangles and water/ground under each character. The processed south-facing work cells retain a visible rectangular strip beneath the Hero. It is visible in the live renderer, not just the raw art: compare the south pan in `hero-live-clip-matrix.png` with `hero-source-contact.png`.

Two native image-generation candidates were retained. Version 1 was rejected because it rendered a checkerboard into an RGB image instead of producing alpha. Version 2 removes the ground and uses magenta for the existing keying pipeline. It was extracted with the existing `scripts/extract-alpha.mjs`, into the evidence directory only. It is **not a drop-in replacement**: generation changed the canvas from 2240×1360 to 1586×992, default extraction produces a substantially smaller figure (first south frame alpha height 316→221 in a 512px cell), and 28 raw cell bounds touch a grid cut at the extractor's threshold. The keyed candidate looks cleaner, but needs scale/pivot and gutter correction before activation. No third speculative generation was spent.

See `panning-candidate-comparison.png`, its animated GIF, and `candidate-comparison.json`. Keep the original approved motion and source provenance; prepare a corrected candidate with consistent figure scale, baseline, cell gutters and loop timing before replacing the registered cells.

### F-AN0908-4 — P2 — Hero age continuity applies to walking only

`src/assets/SpriteAnimator.ts:1094` (`resolveWalkSheet()`) selects the midlife/silver/elder walk variants, but `mergeWalkSheetWithRotationIdle()` still adds the young rotation idles, and `src/assets/SpriteAnimator.ts:1198` (`addHeroPoseClips()`) always reads the same young work/attack library. The E6 runtime proof selects `char-hero-midlife-sheet-walk4-a-r0c1.png` for walking, then switches to `char-hero-sheet-rotation-f-r2c2.png` for south idle and `char-hero-sheet-work8-r0c1.png` for panning. The screenshot shows both costume/silhouette changes. This is not a missing-file fallback: the aged walking assets load successfully, with zero runtime/network errors.

Correction: treat age/outfit as an identity bundle spanning idle, movement and actions. Verify the existing age/skin sources before commissioning new plates; do not silently reuse the young action set as if age continuity were complete. E6 was visually verified; E8/E10 use the same mechanism but were not separately playtested here.

## What is working, and coverage limits

- 745 referenced processed cells across 20 character contract slots, including registered dormant sources: zero missing files, zero empty images, zero fully opaque cells, zero output-cell edge contacts, and zero byte-identical decoded-image groups. These are integrity checks, not a claim that every pose looks correct.
- Existing `character-direction-assets` and `hero-clip-groups` guards: 9 tests passed.
- Real game input at 1280×800 and 390×844: all eight Hero directions advance through 6–8 distinct source frames during each bounded observation. Both contexts report zero console, page or failed-request errors. Normal run canvas and rendering verified; no FPS benchmark claimed from a development server.
- Production SpriteAnimator was exercised directly in a separate diagnostic canvas for the 8-direction × 4-clip matrix, then repeated with E6 age selection. The game was paused during this diagnostic canvas capture. These are real clip resolutions and renders, not images substituted into game code.
- Raw/processed source inspection spans the contract inventory. Detailed visual review concentrates on the Hero and visible E1 companion; it does not certify every later-era enemy, town actor, boss or animation under stress. No existing e2e spec was changed.

## Factory findings

### F-FAC0908-1 — P2 — Dispatch remains parked under the earlier Opus-only handoff

The scheduler and implementer are alive, but there is no queued work. Launchd runs `com.goldrush.fire` every 300 seconds; the lane runner PID 58283 was alive. The latest observed fire used **Codex**, ended at 10:34:04 with `rc=0`, and the subsequent empty-board ticks are intentional skips. There is no current Anthropic quota failure in this execution path. The user's reported Anthropic exhaustion was not independently queried.

Two authored repairs remain banked under the September 5 attended Opus dispatch arrangement:

- `tasks/e10-bank-secured-claim-regression.md`: investigate the missing Last Claim bank/finale beat.
- `tasks/homemaker-readiness-error-diagnostic.md`: surface captured exceptions when the Homemaker readiness gate fails; the task explicitly says no new design decision is needed but Codex queues are parked.

The ten planned leaves also contain owner decisions, missing specs and deliberate deferrals; they are not ten tasks ready to dispatch. AP-04 has no complete distillation spec, AP-05 has publication/design dependencies, and several leaves require the owner's copy, creative seed or service activation.

The read-only dry-board probe exits 0: **0 real drains, 0 unknown, 12 closed, 48 merged** among its subjects. All four main lane branches report ahead=0; lane-a/b/c/d are behind main by 37/313/163/283 commits. Lane-b has 119 untracked files; lane-d has 26 tracked evidence changes. A resumed dispatcher must reconcile ownership and refresh to a verified prerequisite; an empty queue does not make every old checkout safe to reset.

Recommended next operational change: explicitly return dispatch of the two banked repairs to Codex, retain the existing owner gates on unrelated leaves, and prepare clean current lane inputs. This review did not queue work or change dispatch/model/subscription settings.

### F-FAC0908-2 — P2 — Quiet-board fires still incur a large model workload

The dry-board guard skips eleven ticks, then runs a maintenance fire even with no implementation tasks. The command at `scripts/fire-runner.sh:117` passes the entire **529,193-byte `scripts/fire.md`** as the prompt and inherits model/effort from the global Codex configuration, currently `gpt-6-astra` / `ultra`. The local instruction/history surfaces are large: CLAUDE.md 22,998 bytes; STATUS.md 19,045,572 bytes; BACKLOG.md 8,355,605 bytes in this review checkout. The latter two are not necessarily read in full by a fire, so these file sizes are not a token-cost estimate.

The latest actual fire footer reports **608,936 tokens used**, seven lines before its successful end marker. This is the CLI's recorded run usage, not a verified billing charge or the current account's remaining allowance. Older fire logs are quoted inside newer logs; naïvely summing every `tokens used` or `FIRE START` line double-counts history. `factory-run-census.json` is diagnostic only; use the latest outer footer for the stated observation.

Recommended change: keep durable history, move repeated historical explanations out of the executable prompt, and give each factory role an explicit model/effort configuration so an interactive settings change cannot silently reroute every fire. Preserve the existing bounded heartbeat duties; evaluate a shorter deterministic preflight before authoring another large audit. No model call, token reset, alternate subscription or paid API was invoked to test the factory.

### Factory compatibility note

The Codex path still resolves a Claude binary before checking FIRE_ENGINE, and can fall through to Claude if no qualifying Codex CLI is found (`fire-runner.sh`). Both CLIs exist today, so this is a latent coupling rather than the current stall. An explicitly Codex-only mode should fail with a clear Codex setup error rather than unexpectedly selecting an exhausted provider.

## Artifacts and next slices

1. Correct the Hero idle binding and verify stop/turn transitions at game scale.
2. Define directional action fallback and fill only genuinely missing work/attack poses.
3. Prepare the clean panning candidate to the existing scale/pivot/loop contract, then adopt through the ledger and layer contract after visual checks.
4. Reconcile age/skin across the complete visible state set.
5. Reopen the two existing factory repair tasks on explicit Codex dispatch; treat prompt/model overhead as a separate small operations change.

The existing six-finding code repair remains untouched. No commits, merges, pushes, deployment, scheduler changes or live account access occurred. Newly generated images are review candidates, not activated game assets.

Reference ledger: `threejs-debug-profiler/references/debug-profile-checklists.md` and `references/checklists/scene-debugging.md` read and used for asset URLs, runtime errors, canvas, animation update ownership and clip transitions. `compare-screenshots` used for an equal-cell-scale comparison against the explicit target (clean background while preserving scale, baseline and motion). Native `imagegen` used for the two plate edits. Audio, physics changes and production performance profiling were outside this review.

## Follow-up state — September 8

The owner subsequently requested that fires stop; `com.goldrush.fire` is disabled and unloaded. Do not act on the earlier dispatch recommendations without new authorization. The active all-roster goal and current repairs are tracked in `reviews/sol-findings-sprite-roster-fixes-20260908.md`. North/diagonal idle is now repaired locally, while directional actions, pan ground and aged action identity remain open. The shared factory extraction tools were reused for the fringe cure; new teacher plates remain rejected candidates until they show an actual alternating gait.


### Tavernkeeper resting pose — 2026-09-10

Activated native v2 separate idle after the real patrol pause exposed a raised-boot walk0 hold. Reused factory extraction and installed Sharp Lanczos3 minification; all32 walking PNGs and metadata preserved. Explicit eight-frame walk clips retain eight files per direction. Mobile/desktop stop-resume, four existing town tests, build, five engine guards and independent code review pass. Close-up cloth redraw and broader patrol continuity remain open. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/town-activation/idle-native-v2/review.md`; exact reproduction: `check-idle-reproduction.mjs` in that folder. Native source/provenance and hashes: `generation.json` and `activation.json`.

### F-FAC0910-1 — P2 — Fixed video sampling skips the actual stride cycle

`assets/motion-pilot/production-town-cast/produce-town-cast.mjs:647–662` extracts eight frames at2fps from each four-second retained video. Generated footage may contain several strides, so this aliases repeated poses and does not establish anatomical alternation. The Storekeeper's selected take2 also resets leg identity near native34→35; unique PNGs and alpha/scale gates cannot catch that source defect.

The local Storekeeper west repair reuses take1 native33/37/41/46/50/54/59/63, reviewed as one full alternating cycle, then the existing U2Net/graft/extractor path. No new generation or factory job was started. Other24 cells and the earlier south0 override are preserved; measured centres persist in metadata. Build,5engine guards,4town tests,240runtime ticks and80town captures pass. Evidence and remaining cadence/foot-lock limits: `artifacts/sol/sprite-roster-fixes-20260908/town-gait-followup/storekeeper-west-recovery/review.md`. Continue reviewing native frame selection per clip before invoking dormant production scripts; fires remain disabled.

### Factory sampling follow-up — Storekeeper S/E/N and idle, 2026-09-10
The retained-video workaround now covers all four Storekeeper cardinal cycles. Added S take3 native21/24/27/30/33/36/39/42, E take1 native30/34/39/43/46/51/56/60, N take1 native10/14/19/24/28/32/37/42, using the existing matte/graft/extractor. Separate native planted idle avoids holding a moving pose after a pause; existing generic runtime support reused. Explicit8-frame clips preserve registered cardinal/diagonal aliases. Source/activation/verification and outstanding cadence/shadow/turn limits: `artifacts/sol/sprite-roster-fixes-20260908/town-gait-followup/storekeeper-cardinal-current/review.md`. The dormant global producer remains unchanged and must not be restarted on the assumption its automatic frame sampling is approved. Fires disabled.

### F-FAC0910-2 — P2 — Stored processed cells can be damaged while raw art is intact
All eight old Storekeeper east processed frames had rectangular upper-sleeve holes. HEAD processed c0 already contains the hole; HEAD/current raw east art is intact and byte-identical. The current fringe cleanup added zero newly transparent pixels to that c0 comparison. The retained cycle repair replaces the damaged assets, but the historical damaging extraction step is not yet identified. Inspect processed silhouettes as well as raw plates and alpha-color statistics when reusing factory output. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/town-gait-followup/storekeeper-cardinal-current/east/hole-lineage.json` and paired raw/processed lineage boards.

### Native source review remains necessary after factory extraction — 2026-09-11 ICT
Elder SW reused the existing graft/extractor and saved centres/support values. An otherwise clean native camera correction copied the reference leading leg, despite a request to preserve the opposite contact. The source was rejected before activation; a constrained upper-body edit retained the original hip-to-boot topology. Also compare neighboring headings: the first gait/prop repair still looked frontal when seen between S and W. Existing alpha/frame-count/size gates do not establish anatomical alternation or a correct viewing angle. No additional generator, paid call or factory dispatch was introduced. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-southwest-current/angle-correction/review.md`.

### Source selection follows the active record — 2026-09-11 ICT
Elder north palette repair verified production PNG hashes against its pin175 activation and used recorded candidate2. Older loose phase crops in that folder were from rejected candidate1. A filename that looks relevant is not enough to select a factory input. Use the activation source/hash and preserve rejected alternatives separately; the correction reused the existing2x2graft/extractor and left allruntimecontacts unchanged. Evidence: `artifacts/sol/sprite-roster-fixes-20260908/hero-variant-audit/elder-north-palette/review.md`.

### Retained Elder footage supports repair without new generation — 2026-09-11 ICT
The factory's original approved female down/up take3 and left/right take1 frames remain available.32 cells were recovered using cached U2Net plus existing row graft/extraction, then south1 reused for a planted idle.97 mask/provenance outputs,35 processed assets and two assembled raws reproduce byte-exact. Do not intersect brown-parchment key masks indiscriminately: the first candidate erased hair/body colors. North toes need the recorded low threshold plus small erosion; south6 needs its inspected shadow cutoff. The standard graft is bilinear while original assembly was nearest, so apparent per-column softness changes need visual review even when sources/order are unchanged. Exact provenance, rejected candidates and the protected-canary integration blocker: `artifacts/sol/sprite-roster-fixes-20260908/town-elder-recovery/review.md`. Fires stay disabled; no generation, model download or paid call.
