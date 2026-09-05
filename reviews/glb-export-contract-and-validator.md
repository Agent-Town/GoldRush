# Review: glb-export-contract-and-validator — every GLB keeps its contract, and a guard proves it (lane-a, Claude Opus 5 implementer, attended drain 2026-09-05)

**Slice/branch/tip:** `glb-export-contract-and-validator` · `lane/a` · commit `b3972ad3d` (one path-scoped commit, 44 files) over base `25a3b25a7` · merge `3e32f3e09` (no-ff; BACKLOG union).
**Verdict:** MERGED. F-ASTRA-7 and F-ASTRA-8 cured: the export helper preserves each asset's contract through per-asset profiles, and a node guard validates all 412 production GLBs on every battery.

## What it does
- `scripts/reexport-pilot.sh` reads a `<asset>.export.json` sidecar (`profile: static | rigged | terrain`, extras, animations, apply-transforms, selection) and passes matching glTF export options; no sidecar = the previous behaviour byte for byte. 32 terrain sidecars and the hero's written. Headless Blender 5.1.2 proof into a scratch dir: the terrain profile reproduces the shipped Claim terrain **sha256-identical** (`e240e7eb…`) where the legacy recipe dropped all ten extras; the rigged profile keeps the hero's skin and walk cycle where legacy dropped both. Production GLBs untouched (identical hashes before/after).
- `scripts/glb-contract-guard.mjs` (+ 20-test spec) parses every manifest GLB's JSON chunk: finite bounds, primitive/triangle counts against the pilot contracts (all 64 contracted assets agree with `Terrain3dClaimPilot.ts` exactly; all 32 terrains satisfy `bakeHeightGrid`'s lattice invariant), per-family texture caps (props 512², buildings 1024², terrain 2048²), material modes, required extras/anchors, external-resource policy. 69 violations grandfathered in `scripts/glb-contract-guard.baseline.json` (43 texture-over-cap, 26 missing-extra), 0 live; a stale baseline entry FAILS, so debt is paid by deleting lines. Added to the single `run-node-guards` list.
- `docs/3d/PIPELINE.md`: the three reproducibility checks, the pinned Blender version, the profile fields, where each family's builder lives.

## Evidence (merged tree `3e32f3e09` + era pin `3c38c993`)
| Gate | Result |
|---|---|
| `scripts/glb-contract-guard.test.mjs` | 20/20 (3.7 s) |
| `scripts/engine-era-guard.test.mjs` after the pin | 5/5 (the corpus hash rotated WITHOUT a sim change: the 32 terrain sidecars sit under `assets/pilots/map-rebuild-spike`, which `assay-replay-agent.mjs:42/:76` collects wholesale — F-GLB-1) |
| `npx tsc --noEmit` | rc 0 (no `src/` change; no build owed) |
| Runner's `test:node-guards` (node 26) | 690/697: 3 reds cured by the pin above, `desk-declaration-guard` refuses from a linked worktree by design, `node-guards-contention` `spawnSync ps ENOBUFS` at 1,624 host processes (F-GLB-3) |
| Attended `test:node-guards` on the merged tree | see the drain commit message |
| Blob check before merge | largest new blob 7.5 MB (BACKLOG itself); artifacts 20 KB |

## Findings
- **F-GLB-1 (fire-authorable, corpus hygiene):** Blender sidecars (`*.export.json`) are not engine inputs; exclude them from `ENGINE_SOURCE_INPUTS`' directory rule so a future re-export note never rotates the replay identity. Pinned same-era today per F-1441-3.
- **F-GLB-3 (fire-authorable):** `scripts/node-guards-contention.test.mjs:50` calls `spawnSync('ps')` without `maxBuffer` and reds on a busy host instead of measuring contention.
- **F-GLB-4 (recorded):** `hero-3d.blend` does not reproduce `hero-3d.glb` (the saved file holds reference planes and a ground; the shipped GLB one mesh) — the profile now names the explicit selection, so a re-export is a deliberate act with a visible diff.
- **F-GLB-5 (non-blocking):** required-extras lists are measurement-derived per family; panoramas have no sidecars yet (scoped out by the master).
