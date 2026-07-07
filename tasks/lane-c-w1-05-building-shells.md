# Task W1-05: building shells — placeholder boxes become timber-frame structures (LANE-C, branch lane/polish, commit prefix "w1:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; specs/w1-river-valley/README.md W1-05 slice (laws binding); assets/processed/bld-*.png (the town-building art IS processed: chapel, claim-office, general-store, palisade, schoolhouse + more — check the full set + assets/layer-contracts for their slots); docs/GOLD_RUSH_BRIEF.md §4 + ADR-001 (brass/steam → teal accents). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green. SEQUENCING: run AFTER the w1-07 re-queue + damage-orientation land in this lane (fires order the queue; if you find them unmerged-ahead, STOP per the rule).

## Goal (spec W1-05, VISION-HOOKS "no gen-3D dependency" law)
The gameplay buildables stop being flat boxes: simple PROCEDURAL timber-frame 3D shells (BufferGeometry in-repo — no external 3D generation, per the standing ruling) with the processed portrait art as SIGNAGE/facade panels where slots exist. The sluice gets its turning wheel.

## Scope
1. **Shells for the buildable trio + economy buildings**: palisade (keep silhouette readable — it's a wall, not a house), sluice (timber frame + water channel + TURNING WHEEL, animated cheap), stockpile (strongbox/crib), turret (the tripod grows a timber base), assay office (small timber structure using its existing portrait as the sign). Low-poly, engraved-feel materials (flat-shaded + the terrain material's tone family), tier visuals compose on top (BT-01's tier trim must still read — verify with a tier-2 sluice screenshot).
2. **Portrait signage**: where a processed bld-*.png exists for a buildable, mount it as a framed sign/facade panel (billboard quad in the building's local frame — NOT camera-facing, the F-0707-8 law).
3. **Light response**: materials must sit correctly in the golden-hour rig (the black-buildings class is fixed — do not regress it; verify lit screenshots).
4. **Perf**: shared geometries + instancing where pools exist; draw-call budget ≤200 at m2-01 stress HOLDS (record the number); mobile unchanged budgets.
5. e2e: buildings render with shells (diagnostics mesh-name probes), palisade wear + damage indicators still anchor correctly (F-0707-8 e2e stays green), m2-01 stress budget, boot probes zero errors.

## Firewall
Touch ONLY: building placeholder factories/pools (visual geometry+materials), signage quads, the sluice wheel animation (presentation tick), asset slot wiring, e2e. NO footprint/sim changes (footprint invariance law), NO Balance changes, NO contract edits beyond activating existing DORMANT bld rows.

## Self-check
tsc/build; battery green both projects (m2-01 12/12 incl. stress + task-025 + m1-01 + combat-readability + damage-orientation suites); before/after screenshots per building at gameplay zoom desktop+390 + one wide base shot into artifacts/w1-05/; perf table. Commit on lane/polish. End: READY-FOR-GATES + per-building notes + results.
