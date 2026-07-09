# Sol findings — performance, assets, and architecture

- **Branch:** `sol/repository-audit-findings`
- **Base:** `7802ed6`
- **State:** UNTRIAGED — no implementation authorized.
- **Scope:** runtime transfer/request shape, startup prefetch, sprite packaging, repository storage, structural ownership, and diagnostics hot path.

## Summary

| Finding | Severity | Backlog overlap | Suggested future branch if accepted |
|---|---|---|---|
| `F-SOL-PERF-001` Active play loads 250 requests / 11.93 MB | P1 | PERF-ARCHITECTURE audit already banked | `sol/runtime-asset-budget` |
| `F-SOL-PERF-002` First-frame gate prefetches unrelated scenes | P1 | Startup work exists; no scene-scoped manifest task found | `sol/scene-scoped-prefetch` |
| `F-SOL-PERF-003` Per-frame image glob explodes chunk/request count | P1 | Sprite-production work exists; packaging not covered | `sol/sprite-atlas-packaging` |
| `F-SOL-PERF-004` Tracked repository is 3.209 GiB without LFS | P1 operations | Asset diet exists; Git/history policy not found | `sol/repository-storage-policy` |
| `F-SOL-PERF-005` Game and BuildSystem are architectural choke points | P1 | PERF-ARCHITECTURE overlap; no extraction plan found | `sol/game-boundary-proposal` |
| `F-SOL-PERF-006` Full diagnostics rebuild every production frame | P1 | PERF-ARCHITECTURE overlap | `sol/sampled-diagnostics` |

## F-SOL-PERF-001 — [P1] Active play has no defensible request/byte budget

**Evidence**

- `npm run build` produced a 29 MB `dist/` with 827 files: 411 JavaScript, 365 asset PNGs (368 PNGs total), and 42 MP3.
- The main JavaScript chunk was 1,350.85 kB minified / 350.69 kB gzip and triggered Vite's large-chunk warning (`vite.config.ts:34-37` merely raises the warning threshold to 900 kB).
- A production-preview active run measured 250 requests and 11.93 MB transferred after ten seconds, including 127 JavaScript and 120 PNG requests.
- `e2e/perf-05-startup.spec.ts:8-13` models "4G" as 20 MB/s download, 1 ms latency, and 1.25× CPU slowdown, and it has no hard byte/request budget.
- The same startup audit recorded 3.06 MB before playability and a 2.26 s desktop first frame under that generous throttle.

**Impact**

Cold start, mobile data, HTTP scheduling, parse/compile overhead, and cache churn are materially under-gated even when frame-time stress tests pass.

**Recommendation for triage**

Accept first as a measurement/budget concern: define route-specific byte/request/TTI budgets on realistic Fast 4G and low-end CPU profiles before choosing optimizations. Deduplicate with the existing PERF-ARCHITECTURE audit ladder.

## F-SOL-PERF-002 — [P1] Startup prefetch loads Town and Baron assets during unrelated contracts

**Evidence**

- `src/main.ts:232-251` calls both noncritical generated-texture and sprite-runtime prefetch two requestAnimationFrames after the first game frame.
- `src/assets/generated.ts:29-45` defines one global noncritical list containing every building portrait, Baron/banner, and all Town characters.
- `src/assets/SpriteAnimator.ts:176` adds Prospector and Baron runtime slots to global noncritical prefetch.
- Active Dry Gulch measurement still requested Baron and Town-related assets that the scene did not need.

**Impact**

The first playable frame is followed immediately by a cross-scene download storm, reducing the practical value of the startup gate.

**Recommendation for triage**

Create scene/contract manifests and prefetch only the next probable interaction: current contract enemies/buildables, then Town only on return, Baron only for Baron content.

## F-SOL-PERF-003 — [P1] Sprite frame discovery creates hundreds of proxy chunks and texture swaps

**Evidence**

- `src/assets/SpriteAnimator.ts:157-165` globs every `assets/processed/char-*.png` frame as an individually lazy URL module.
- The production output contained 411 JavaScript files, far beyond the number of authored source entrypoints.
- Active-play resource telemetry observed more than 100 character-frame JavaScript/image requests across hero, jumper, Prospector, and Baron families.
- The runtime tracks `textureSwapsPerFrame` (`src/assets/SpriteAnimator.ts:173-176`), reflecting a per-frame texture replacement model rather than atlas UV animation.

**Impact**

High request/chunk overhead, texture binding churn, and poor compression locality; complexity grows with every new character and epoch.

**Recommendation for triage**

Pack each character/clip family into a small atlas or texture array and animate UV/frame index. Preserve the current layer-contract manifest as the source of clip metadata.

## F-SOL-PERF-004 — [P1 operations] Source control stores production raws and evidence at game-asset scale

**Evidence**

- Tracked checkout measurement: 3.209 GiB.
- Tracked assets: 2.197 GiB; tracked artifacts: 0.746 GiB; reviews add further image evidence.
- `assets/motion-pilot` contained roughly 1.5 GiB and 1,836 files; `assets/raw` roughly 612 MB / 207 files during the audit.
- Git object measurement: 3.29 GiB packed plus 1.35 GiB loose; 152 garbage entries.
- No `.gitattributes`; `git lfs ls-files` returned no objects.

**Impact**

Clean clone, CI checkout, worktree creation, backup, and contributor onboarding costs scale with generated intermediates rather than runtime source.

**Recommendation for triage**

Write a storage-retention policy before rewriting history: keep contracts/manifests and processed runtime assets in Git; move raw video, superseded generations, and bulky run evidence to versioned object storage or LFS; plan any history migration as an owner-approved maintenance event.

## F-SOL-PERF-005 — [P1] `Game.ts` and `BuildSystem.ts` concentrate unrelated ownership

**Evidence**

- `src/game/Game.ts` is 4,906 lines; `src/systems/BuildSystem.ts` is 2,277 lines.
- `Game` owns simulation order, rendering/scene creation, multiplayer, persistence seams, story, UI, audio, Baron ceremony, megaprojects, agent orchestration, and diagnostics.
- `BuildSystem` owns placement, tiers, repair, shooters, routing blockers, production, visuals, and diagnostics.
- Run restore casts the game to `Record<string, any>` and mutates private internals (`src/game/RunSuspend.ts:162-163`, `401-449`), showing that persistence cannot rely on stable typed boundaries.

**Impact**

High regression and merge-conflict risk; refactors can compile while breaking persistence/diagnostics; parallel lanes repeatedly collide in the same files.

**Recommendation for triage**

Do not perform an ECS rewrite. Freeze net growth and extract only proven seams: fixed simulation, per-system capture/restore, encounter orchestration, multiplayer session/actors, and diagnostics observer. Each extraction should be a separate behavior-preserving branch.

## F-SOL-PERF-006 — [P1] Production diagnostics allocate, parse, and scan on every frame

**Evidence**

- `src/game/Game.ts:1461-1485` calls `publishDiagnostics` from every presentation update.
- `src/game/Game.ts:2468-2687` builds a large nested object; copies/reduces/summarizes the economy log; scans actors, buildings, assets, sprites, terrain, medals, and multiple system diagnostics.
- `src/game/RunManager.ts:103-125` asks for suspend diagnostics, and `src/game/RunSuspend.ts:209-218` rereads/parses stored suspend state for that snapshot.
- `src/game/Game.ts:2690-2705` walks all frame samples and allocates/sorts a copied sample array every frame.
- `specs/m1-core-loop/README.md:39` states that the hot path should avoid per-frame allocations.

**Impact**

Avoidable garbage collection and storage/JSON overhead on mobile and long runs; instrumentation itself can distort the performance it measures.

**Recommendation for triage**

Keep a tiny production telemetry snapshot updated incrementally. Gate full diagnostics behind debug/test or sample them at a low frequency with cached persistence summaries.
