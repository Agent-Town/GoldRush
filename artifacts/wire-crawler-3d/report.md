---
source: claude-code
project: Gold Rush
date: 2026-09-05
type: reference
---

# Renderer-count re-record under the shared atlas (both 3D boss specs)

Task `tasks/renderer-count-artifacts-under-shared-atlas.md` (F-SAD-3). `src/assets/SharedAtlasPlugin.ts`, merged as `3a47f1800`, registers a GLTFLoader plugin on the shared loader that returns ONE texture per image content hash across every GLB loaded through the same tracker. Four artifacts pin exact `renderer.info.memory.textures` values recorded before it; three of them read high afterwards and are re-measured here. Nothing else moved: no `calls`, `triangles` or `geometries` value, no measured tolerance band, and no assertion in either spec (morphs, wreckage, rail ride, dispose-on-kill, geometry deltas) was touched.

Measured on `cf91fe5e9` (lane/d), whose `src/` and `e2e/` trees are identical to main `bf934d54f` (main's only extra commit touches `STATUS.md`, `artifacts/s2520-fire/**` and `marketing/`). Dev server `npx vite --host 127.0.0.1 --port 5304`, specs run with `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5304 ... --workers=1`.

## Phase counts, old to new (`textures` only)

| Spec | Project | Phase | Old | New |
| --- | --- | --- | ---: | ---: |
| wire-crawler-3d | desktop-chrome | coldBaseline | 32 | 32 |
| wire-crawler-3d | desktop-chrome | mounted | 37 | 37 |
| wire-crawler-3d | desktop-chrome | **loadedBeforeKill** | **40** | **39** |
| wire-crawler-3d | desktop-chrome | **presentationBaseline** | **39** | **38** |
| wire-crawler-3d | desktop-chrome | **disposed** | **36** | **35** |
| wire-crawler-3d | mobile-chrome | all five phases | 30 / 37 / 39 / 38 / 35 | unchanged |
| wire-railcar-3d | desktop-chrome | **baseline** | **39** | **37** |
| wire-railcar-3d | desktop-chrome | **mounted** | **42** | **39** |
| wire-railcar-3d | desktop-chrome | **despawned** | **38** | **35** |
| wire-railcar-3d | desktop-chrome | **combatDeath** | **38** | **35** |
| wire-railcar-3d | mobile-chrome | **baseline** | **37** | **35** |
| wire-railcar-3d | mobile-chrome | **mounted** | **41** | **39** |
| wire-railcar-3d | mobile-chrome | **despawned** | **37** | **35** |
| wire-railcar-3d | mobile-chrome | **combatDeath** | **37** | **35** |

`presentationBaseline` is not sampled from the renderer: `e2e/wire-crawler-3d.spec.ts:139-142` computes it as `loadedBeforeKill.textures - 1` (and `geometries + WRECK_GEOMETRIES - 3`), so it follows `loadedBeforeKill` by construction. `artifacts/wire-crawler-3d/renderer-counts-mobile-chrome.json` is byte-identical to `HEAD`: the 390px crawler scene held no duplicate images, so the dedupe moved none of its counts.

## Delta expectations that moved, and why

A texture delta only moves when the shared image is resident at ONE end of the pair. Every delta below is arithmetic over the measured phase counts above, and all of them are enforced exactly by the confirming runs - none was widened to a range.

| Artifact | Delta | Old | New | Reason |
| --- | --- | ---: | ---: | --- |
| crawler desktop | coldBaseline->loadedBeforeKill | 8 | 7 | the crawler now allocates one fewer texture on load |
| crawler desktop | coldBaseline->presentationBaseline | 7 | 6 | follows `loadedBeforeKill` |
| crawler desktop | coldBaseline->disposed | 4 | 3 | one fewer texture survives the kill |
| crawler desktop | mounted->loadedBeforeKill | 3 | 2 | the shared image is already resident at `mounted` |
| crawler desktop | mounted->presentationBaseline | 2 | 1 | follows `loadedBeforeKill` |
| crawler desktop | mounted->disposed | -1 | -2 | `disposed` fell while `mounted` did not |
| crawler desktop | loadedBeforeKill->presentationBaseline | -1 | -1 | both ends moved together |
| crawler desktop | loadedBeforeKill->disposed | -4 | -4 | both ends moved together |
| crawler desktop | presentationBaseline->disposed | -3 | -3 | both ends moved together |
| railcar desktop | baseline->mounted | 3 | 2 | one railcar GLB texture now shares an image already resident at baseline, so mounting allocates two instead of three |
| railcar desktop | baseline->despawned | -1 | -2 | `despawned` fell by 3 while `baseline` fell by 2 |
| railcar desktop | baseline->combatDeath | -1 | -2 | same |
| railcar desktop | mounted->despawned | -4 | -4 | the dispose contract is intact: mounting still releases four on despawn |
| railcar desktop | mounted->combatDeath | -4 | -4 | same |
| railcar mobile | all six | unchanged | unchanged | the whole 390px scene shifted down by exactly 2 |
| crawler mobile | all ten | unchanged | unchanged | nothing deduped in that scene |

Every `geometries` delta in all four artifacts is untouched.

## Method

`e2e/renderer-count-artifact.ts:20-29` (F-1478-1) makes the artifact a REQUIRED INPUT, so a value is added by MEASURING it: the spec was run against the live dev server and each disagreement reported the number the engine actually produced (`renderer count <phase>.textures expected exact <old>, got <new>` at `renderer-count-artifact.ts:37`). Those reported values, and only those, were written back; the derived `presentationBaseline` and every texture delta follow arithmetically and are then enforced exactly by the confirming runs, so a wrong derivation would have reddened the gate.

## Verification

| Run | Scope | Result |
| --- | --- | --- |
| `npx tsc --noEmit` | whole project | rc 0 |
| `npm run build` | tsc + vite build + asset-diet | rc 0 |
| convergence passes 1-4 | both count tests, both projects | each disagreement reported one measured value; pass 4 4/4 green |
| full battery run 3 | both specs, all 7 tests, both projects | **14/14 passed** (1.1 min, host load 11.8) |
| full battery run 4 (after the provenance note) | both specs, both projects | **14/14 passed** (1.2 min, host load 6.0) |
| crawler spec alone, mobile | 3/3 | passed (14.7 s) |
| final battery on the committed tree | both specs, both projects, host load **43.4** | 12/14 - the two crawler count tests hit F-RCA-1 (`mounted` 37 -> 38, a pin this task never changed); all 8 railcar tests and both crawler non-count tests green |

Zero console and page errors: both count tests end on `expect(errors).toEqual([])` (`wire-crawler-3d.spec.ts:155`, `wire-railcar-3d.spec.ts:160`) over listeners attached before `page.goto`, and both passed. Screenshots for both projects (intact, each broken component, post-kill baseline) were re-rendered by the passing runs into `artifacts/wire-crawler-3d/` and `artifacts/wire-railcar-3d/`.

## Findings

**F-RCA-1 (non-blocking, pre-existing, NOT re-recorded).** `wire-crawler-3d`'s early-phase texture counts drift UPWARD under host load, on BOTH projects, at values this task did not touch. Observation ledger for the count test, counting only runs made after its artifact was correct:

| Spec / project | Clean | Excursions | What was seen |
| --- | ---: | ---: | --- |
| crawler desktop | 6 | 1 | `mounted` 37 -> 38 at host load 43.4 |
| crawler mobile | 11 | 4 | `coldBaseline` 30 -> 32 once (load 25.2); `mounted` 37 -> 38 three times (loads 25.2, 14.3, 43.4) |
| railcar desktop | 6 | 0 | stable from load 5.9 to 43.4 |
| railcar mobile | 8 | 0 | stable from load 5.9 to 43.4 |

Every excursion is UPWARD, and every excursion is on a pin the shared atlas never moved: crawler `coldBaseline` (32 desktop / 30 mobile) and `mounted` (37 both) are byte-unchanged from their pre-dedupe recording, and a content-hash dedupe can only REMOVE textures. The mechanism is the fixed sample point at `wire-crawler-3d.spec.ts:117-119` (`warmVfx()` then `waitForTimeout(800)` after a `frame > 12` gate): under load that window spans more wall-clock time, so more lazily streamed textures have finished by the sample. The railcar spec, which samples its baseline the same way but after a `frame > 16` gate, stayed exact across 14 observations spanning the same load range - that is the control.

This is already an inventoried known red. `logs/suite-red-inventory-compact.json` (snapshot 2026-08-11, three weeks BEFORE the atlas merge, 3 workers) records exactly this fingerprint at `e2e/renderer-count-artifact.ts:37`: crawler desktop `coldBaseline` 32 -> got 33, crawler mobile `coldBaseline` 30 -> got 31, railcar desktop `mounted` 42 -> got 45, railcar mobile `baseline` 37 -> got 36. `node scripts/red-inventory-lookup.mjs wire-crawler-3d.spec.ts` returns KNOWN-RED on BOTH projects. Membership is never exoneration (F-1444-2), so the control here is the run record above, on this tree: 31 clean observations against 5 excursions, all 5 above load 14, none below.

Not widened to a band, deliberately: widening counts the atlas never moved would spend the exact-pin guard F-1476-1 and F-1478-1 built, and the honest fix is spec-side - sample on a settled condition (a texture count stable across two frames, or an explicit asset-stream-idle signal) instead of a fixed 800 ms - which is outside this task's firewall. A drain gating this slice on a loaded host should expect the crawler count test to be the one that reddens, and should re-run it quiet before attributing anything to the atlas.

**F-RCA-2 (non-blocking, tooling).** `artifacts/f1476-1/measure.mjs`, which the task master names as the measuring path, can no longer run. Line 21 does `fs.rmSync(countsPath, { force: true })` before each run, but since F-1478-1 the artifact is a required INPUT (`e2e/renderer-count-artifact.ts:29`), so the spec throws ENOENT, never writes the file back, and the script dies at `:33` with `run 1: rc=1, renderer-count artifact missing`. Verified by running it (`node artifacts/f1476-1/measure.mjs wire-crawler-3d 1 mobile-chrome`, rc 1); the artifact it deleted was restored from a pre-run copy and is byte-identical to `HEAD`. Its generalised sibling `artifacts/s1477-noise/measure2.mjs:18` has the same `rmSync` and the same fate, and additionally hardcodes a `gate-s1477` worktree that no longer exists. A spread harness for this artifact family now has to keep a copy of the artifact and restore it between runs, or read the measured value out of the thrown message as this task did.
