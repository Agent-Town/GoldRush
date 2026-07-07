# Task e2-rail-entity: rails on the claim — the path entity (LANE-D, branch lane/perf, commit prefix "e2:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; **specs/epoch-saga/e2-steamworks-bundle.md (rails: visual spine of the era; carts ride LATER slices)**; the terrain/tile descriptor socket (GT-01 TileHeight + the contract tileParams pattern — rails are TILE DATA, not hardcoded); ter-rail-elements art (batch-010, processed state per LEDGER — placeholder-first if pending); the routing system (rails must NOT affect enemy routing in this slice — render+data only). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (WP-E2 slice ①)
Rails are E2's visual signature and the megaproject's delivery metaphor (the Stamp Mill's Rail Spur). The ENTITY lands now: declarative rail paths a tile can carry, rendered on the terrain — so the Hill Mine tile, the Stamp Mill site, and future cart systems all consume one socket.

## Scope
1. **Rail path data**: tile descriptors gain an optional `rails: [{points: [...], style}]` array (polyline in tile space); epoch-1 tiles carry NONE (untouched).
2. **Rendering**: rail segments as terrain-conforming geometry (sleepers + rails from ter-rail-elements when processed; procedural ties+lines placeholder otherwise), sitting per the RenderLayers ladder (above terrain, below decals-or-per-spec — check the ladder, state the slot), visualY-aware on relief (the blast-relief sampler pattern).
3. **The dev proof**: a debug rail path on the gt-test-basin dev tile (`?tile=gt-test-basin&rails=dev` or equivalent — document) crossing flat + slope + alongside the cliff, proving terrain conformance.
4. **Zero sim impact**: rails are render/data ONLY this slice — routing, collision, determinism untouched (hash-asserted).
5. Perf: instanced/merged geometry; the dev path's draw-call cost measured and stated (<+10 calls).

## Firewall
Touch ONLY: tile-descriptor rail data (additive), the rail renderer module (new src/world/RailPath.ts), the dev-tile debug data, e2e, artifacts. NO routing/collision/sim changes, NO epoch-1 tile changes, NO cart logic (later slice), NO Balance.

## Self-check
tsc/build; new `e2e/e2-rail-entity.spec.ts`: epoch-1 boot = zero rails rendered (asserted) · dev tile + param = rails render conforming to slope (visual sample heights asserted vs TileHeight) · determinism hash unchanged with rails on · draw-call delta stated; gt-01/gt-02/gt-03 + task-025 + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (rails over the basin ridge, the cliff-side run) into artifacts/e2-rail/. Commit on lane/perf. End: READY-FOR-GATES + the descriptor shape + results.
