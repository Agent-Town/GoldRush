# Task e1c-dry-gulch: THE DRY GULCH — E1 contract C3 (LANE-D, branch lane/perf, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; **specs/e1-contracts/README.md §C3 (the spec this implements — its laws + gate list are BINDING)**; the contract/manifest loading path (SCI-04 registry + gt-02's `?tile=` param pattern — this task generalizes to `?contract=<id>`); Terrain river/water generation; BuildSystem sluice river-adjacency check; 046's lane constants. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (owner ratification 2026-07-07 ~15:25: "spec them out fully… and add them to the queue")
The first non-default E1 contract: water scarcity as the twist. Also builds the `?contract=` loader every subsequent contract (C4/C5/C6) reuses — get the socket right.

## Scope
1. **Contract loader**: `?contract=e1-dry-gulch` (debug-gated param, gt-02 pattern) loads a contract manifest (id, tileParams, twist knobs, board row metadata) from the epoch-1 bundle registry. Default boot unchanged; unknown id → clean fallback to default + console-free warning suppressed to diagnostics.
2. **The tile**: river band removed via tileParams (no river mesh/collision/ford); spring pond zone SW quadrant (~6-tile water area; use `prop-spring-pond` art if processed, else a placeholder teal decal — placeholder-first law); scatter/vista unchanged.
3. **The twist**: sluice placement requires adjacency to a `waterSource` (generalize the river-adjacency predicate; the pond qualifies; rejection uses the existing invalid-placement feedback). `Balance.contracts.dryGulch = { seamYieldMult: 1.4 }` additive.
4. **Lanes**: four open spawn lanes (no ford funneling); 046's ring/gap logic reads per-contract lane constants (adapt additively — do NOT modify the default claim's constants).
5. **Board row metadata** in the manifest (name "The Dry Gulch", ledger blurb, tag trail, unlock `wave10OnClaim`) — data only; Town T3 renders it later.
6. Diagnostics: active contract id exposed.

## Firewall
Touch ONLY: contract loader + manifest data, tileParams-driven terrain/water assembly (additive branches), the waterSource predicate generalization, Balance additive block, new e2e, artifacts. NO changes to: default-claim boot path (byte-identical behavior — assert it), ford/river code used by the default, CombatSystem/WaveSystem structure, existing e2e.

## Self-check
tsc/build; new `e2e/e1-dry-gulch.spec.ts` per the spec's gate list (param load · no river collision · sluice pond-adjacency accept/reject · yield mult measured · 4-lane spawns · seeded determinism) both projects; **default-boot regression: task-025 + m1-01 + m2-01 + w1-01 unmodified green both projects** (proves the default claim untouched); zero console errors; screenshots (gulch overview, pond sluice, rejection feedback) into artifacts/e1-dry-gulch/. Commit on lane/perf. End: READY-FOR-GATES + the contract-loader shape shipped (C4/C5/C6 reuse it) + results.
