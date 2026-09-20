# Shared atlas texture dedupe

**Acceptance BLOCKED; not READY-FOR-GATES.** The implementation, build, TypeScript,
five node tests and eight new browser tests pass. The required unchanged legacy
suite is not green, and the native-loader control reproduces its failure classes.
The task's firewall forbids changing those tests, height consumers or render-budget
controls, so implementation stopped at that boundary. No commits were made.

Task: `lane-d--20260905-103054-shared-atlas-texture-dedupe.md`.
Baseline: `a16b19354e1a6a1ec431bce22801e39c8d91257d`, branch `lane/d`.

## Measured residency

Each pair uses the same contract, seed, camera, full tier and viewport. The new
`?debug` tests freeze simulation, warm the existing VFX pools, then initialize
scene material textures before sampling **actual `renderer.info.memory.textures`**.
This avoids comparing unrelated cold-start allocation stages. The native control
omits only the new loader plugin in the served module; no production bypass flag
was added. The temporary runtime read is injected inside Game's existing debug guard.

JS estimates sum `width * height * 4 * 4/3` once per distinct image object in scene
material slots. They include warmed/off-screen images and assume RGBA plus mipmaps;
they are not driver VRAM measurements and exclude uniforms, render targets and other
resources outside those slots. Atlas estimates cover all five mounted landmarks.

| Scene | Viewport | Renderer textures before | After | Scene image estimate before, MiB | After, MiB | Landmark atlas estimate, MiB |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| The Claim | 1280 x 800 | 58 | 54 | 160.64 | 139.30 | 26.67 -> 5.33 |
| The Claim | 390 x 844 | 56 | 52 | 160.64 | 139.30 | 26.67 -> 5.33 |
| Hill Mine | 1280 x 800 | 58 | 54 | 160.64 | 139.30 | 26.67 -> 5.33 |
| Hill Mine | 390 x 844 | 56 | 53 | 160.64 | 139.30 | 26.67 -> 5.33 |
| Mare Claim | 1280 x 800 | 54 | 50 | 160.39 | 139.05 | 26.67 -> 5.33 |
| Mare Claim | 390 x 844 | 52 | 48 | 160.39 | 139.05 | 26.67 -> 5.33 |

Every pack changes from **five decoded images to one**, saving **21.33 MiB** by the
requested estimate. The Claim's total renderer count drops by four in both projects.
Hill Mine mobile's total drops by three; the image census still proves four fewer
atlas images. Whole-renderer totals also count resources outside that census.

Per-pair JSON and native/shared PNGs are beside this report. The original, unwarmed
pre-edit measurements remain in `before.json`: desktop totals 28/26/19 and mobile
27/24/17 for Claim/Hill/Mare. Those first captures allowed automatic tier shedding
under heavy host load; they are preserved as observations, not used as the controlled
comparison. The final matrix is `e2e-final.log` (**8 passed, 2.1 minutes**).

## Teardown proof

The lifecycle fixture loads the five **fresh production WebP + Meshopt Claim GLBs**
through `trackedGltfLoader`, uploads their actual textures into the game's renderer,
disposes them with the unchanged `disposeObject3D`, and loads them again using a new
tracker on the same fixture canvas. Cache size is checked **before** the next reset.

| Project | Baseline | First load | Dispose | Second load | Dispose | Cache after each disposal |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Desktop | 36 | 37 | 36 | 37 | 36 | 0 |
| 390px | 34 | 35 | 34 | 35 | 34 | 0 |

The real `Game.dispose()` also takes its atlas cache **11 -> 0** in both projects.
The renderer's remaining counter is 16 for other resources; this is not a claim
that the entire pre-existing Game lifecycle has zero retained resources. See
`lifecycle-desktop-chrome.json` and `lifecycle-mobile-chrome.json`.

## Ownership and implementation

- `SharedAtlasPlugin.ts:5`: full-byte FNV-1a 64 with exact 32-bit limbs, checked
  against known vectors and an independent BigInt implementation.
- `SharedAtlasPlugin.ts:26`: one cached decode promise and Three `Source` per
  hash, per canvas tracker. Material texture views retain independent sampler,
  wrapping, UV transform/channel, color space, metadata and disposal state.
  Colors, emission strengths and material instances remain per material.
- Equal Source plus compatible texture state lets Three reuse the GPU allocation.
  Different sampling/color-space states can still need separate GPU allocations
  while sharing the bitmap. External images and GPU-compressed formats retain
  their native loading path.
- `SharedAtlasPlugin.ts:106`: ordinary embedded images and built-in WebP/AVIF
  extension calls converge through `loadTextureImage`; a custom `loadTexture`
  hook alone would miss production WebP in the installed Three version.
- `SharedAtlasPlugin.ts:149`: disposal releases original material views even if
  consumers replaced their map slots. This matters because the unchanged
  `Terrain3dClaimPilot.ts:656` replaces `emissiveMap`. Final owners release the
  bitmap; pending decodes cannot resurrect a reset cache. Three documents the
  need for explicit bitmap disposal in its [GLTFLoader docs](https://threejs.org/docs/pages/GLTFLoader.html).
- `AssetLoading.ts:9,35`: scene resets reserve the active tracker immediately.
  Late requests from a different scene label cannot replace it or close its images.

No changes to GLBs, `Terrain3dClaimPilot.ts`, the sim, build pipeline, existing e2e
specs, `STATUS.md`, `specs/`, `reviews/` or git history. `package.json` appends the
new node test once to the existing `test:node-guards` invocation. BACKLOG gets only
this task's implementation/blocked-acceptance row.

## Duplicate census

`node artifacts/shared-atlas-dedupe/census.mjs` hashes every embedded bufferView
image with SHA-256. `census.json` lists every duplicate group and its occurrences.
The final build reproduces the pre-edit census, as no assets were changed.

| Corpus | GLBs | Embedded images | Unique image hashes | Duplicate groups | Redundant encoded image bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| Source `assets/pilots` | 444 | 443 | 185 | 57 | 353,742,105 |
| Fresh production `dist/assets` | 413 | 413 | 172 | 57 | 131,005,965 |

The source figures reproduce Astra's audit exactly. The Claim's source atlas is
1,929,054 bytes per GLB; its production WebP is 271,074 bytes per GLB. Encoded corpus
redundancy is distinct from simultaneous decoded/GPU residency.

## Validation and the firewall blocker

| Check | Result |
| --- | --- |
| `npm install --no-audit --no-fund` | Passed; no lockfile diff |
| Unchanged preflight `npm run build` | Passed; then clean `git status --short` |
| Final `npx tsc --noEmit` | Passed |
| Post-change `npm run build` | Passed (`build.log`) |
| `node --test scripts/shared-atlas-plugin.test.mjs` | 5 passed (`node-tests.log`) |
| New spec, desktop + 390px | 8 passed; zero console/page errors (`e2e-final.log`) |
| Preview harness boundary | 8 explicitly skipped, successful command (`preview-boundary.log`) |
| Unchanged named specs, both projects | 11 passed / 5 failed (`named-specs.log`) |
| Native-loader controls for failing legacy cases | 2 passed / 4 failed (`native-baseline-specs.log`) |
| `git diff --check` | Passed |

The unchanged `perf-01-stress-budget` passed both projects. Night Shift and the
planar simulation fingerprints also passed. Daylight opacity/luminance checks ran
successfully before their frame-budget assertions failed.

The scope-blocking coupling points and measured controls are:

1. **Hero height:** `e2e/terrain3d-claim-pilot.spec.ts:101` expects
   `terrainVisualY(x,z) + 0.06 = 0.7964298105239869`, but receives
   **0.8177936887741089**, a 0.02136387825012198 difference. Both shared-loader
   projects failed; the native desktop control reproduces the identical values.
   The native mobile control passed, so timing sensitivity remains unresolved.
   The debug height seam is `Game.ts:2300`; actor height/interpolation consumers
   are `Game.ts:905,9034` and `Hero.ts:215`; the shared height function is
   `Terrain.ts:460`. These are outside the firewall. This task does not assert
   a root cause or silently change that contract/test.
2. **Daylight performance:** `e2e/landmark-brightness.spec.ts:91` requires p95
   <= 33.4 ms. Shared runs measured **58.6 ms desktop / 85.6 ms mobile**.
   Native desktop also failed at **34.5 ms**; native mobile passed that timing
   check but failed `:92` with runtime verdict **1 instead of 0**. Host load
   was very high during this session (observed peaks above 280); these runs
   establish a non-green native gate, not a performance-regression verdict.
3. **Delayed terrain readiness:** the mobile relative-budget case timed out at
   `e2e/terrain3d-claim-pilot.spec.ts:174` after releasing its held request, on
   **both** the shared and native loaders. Its request control is at `:169`;
   the unchanged consumer starts terrain loading at `Terrain3dClaimPilot.ts:2096`.
   No timeout, assertion or consumer was changed to hide it.

The native control server serves the exact baseline `AssetLoading.ts` from git,
with all other runtime source and existing specs unchanged. Its source response
was verified to contain the original `new GLTFLoader` return and no SharedAtlas
reference. Reproduce with `node artifacts/shared-atlas-dedupe/native-loader-server.mjs`
(port 5198); its baseline commit is pinned, so a future runner commit cannot change
what "native" means. The normal dev server used port 5197. No gate/rig ports were used.

**Next action:** resolve the existing height/test and cold-start/readiness gates
in an appropriately scoped task, then rerun the required unchanged suites before
accepting this slice. This handoff does not claim READY-FOR-GATES.

## Review and measurement corrections

`codex review --uncommitted` found two issues; both were fixed and verified:

- A late town retry could clear the new run's atlas cache. The fifth node test
  reproduces that race, verifies the live bitmap stays open and verifies the
  current loading manager/label do not change.
- Source-injected tests were collected by the static preview harness. They now
  require Vite's JavaScript `/@vite/client` endpoint and explicitly skip otherwise.
  Production GLB decoding is still exercised by the passing WebP lifecycle fixture.

The first browser matrix had two instrumentation failures: a bare dynamic import
read a second Vite module instance with an empty tracker, and an unwarmed mobile
whole-renderer comparison differed by one unrelated allocation. Importing through
the statically linked helper and warming the existing pools/material textures fixed
the measurement. No four-texture requirement was lowered. Initial failing and final
passing logs are both retained (`e2e.log`, `e2e-final.log`).

## Preflight and evidence cleanup

No ahead commits or source edits existed at preflight. Seven regenerated PNGs were
restored under `artifacts/e8-research-tree/`, `artifacts/lane-roster-wiring-e8-01/`
and `reviews/shots-claw/`, under the task's explicit exception. The requested review
was absent from this older lane checkout, so its exact section was read from main's
`docs/reviews/2026-09-05-astra-3d-review.md`. Regenerated legacy-suite outputs outside
this task's artifact directory were restored after verification; logs and failure
screenshots for this run remain inside this directory.
