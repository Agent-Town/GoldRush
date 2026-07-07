# Task e1c-night-shift: THE NIGHT SHIFT — E1 contract C5 (LANE-C, branch lane/polish, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; **specs/e1-contracts/README.md §C5 (BINDING: the twist, knobs, gate list)**; the `?contract=` loader shipped by e1-dry-gulch (REUSE it — register `e1-night-shift` in the same manifest path); the light rig (m2-02 darker-map + torch glow machinery); prop-lantern-post art (batch-011, use if processed else placeholder post). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after w1-05 (this lane's queue order).

## Scope (per spec §C5 — sight is the resource)
1. Contract manifest entry: standard claim tile + light-ramp schedule (full → dusk wave 5 → dark wave 10+ → DAWN at wave 25 = victory bell).
2. **Render-only fog-of-dark**: enemies outside any light radius dim toward black (sprite dimming by distance-to-nearest-light; smooth falloff). SIM UNTOUCHED — turret acquisition, routing, damage all unchanged (the e2e must PROVE the split: dimmed enemy still acquired/shot).
3. Light sources: beacons ×1.5 radius here (`Balance.contracts.nightShift.beaconLightMult`), turret muzzle glow, hero lantern (small personal radius), **lantern-post buildable this contract only** (cheap, light-only, uses the build-menu machinery with a contract-gated entry).
4. Dawn victory at wave 25 (shorter run; ceremony reuses the victory path with a dawn-tint beat).
5. Board-row metadata (name/blurb/tag vein-hunter/unlock science≥3) — data for Town T3.

## Firewall
Touch ONLY: contract manifest data, the dimming pass (render), light-source radii additive knobs, lantern-post build entry (contract-gated), e2e, artifacts. NO changes to: default claim, sim/CombatSystem/WaveSystem logic, existing contracts, the loader's shape (extend data, not code — flag if impossible).

## Self-check
tsc/build; new `e2e/e1-night-shift.spec.ts` per the spec's gate list (ramp at specced waves · dimmed-but-still-targeted proof · lantern-post only here · dawn victory at 25 · perf p95 in envelope — dimming must be cheap · seeded determinism) both projects; default-boot regression task-025 + m1-01 + m2-01 + e1-dry-gulch green both projects; zero console errors; screenshots (dusk, true dark with lantern ring, dawn) into artifacts/e1-night-shift/. Commit on lane/polish. End: READY-FOR-GATES + results.
