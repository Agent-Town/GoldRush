# Task blast-relief-height: grenades respect the visual terrain (LANE-C, branch lane/polish, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; the visualY/render-height system (w1 relief — entities sample visual terrain height; find where) ; projectile rendering (CombatSystem 'lob' kind — blast charge arc) + impact vfx placement (RenderLayers from vfx-layering); e2e/w1-01-terrain-relief.spec.ts (the visual-height sampling patterns). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after this lane's current queue (w1-05, heritage-mine).

## Owner finding (2026-07-07 ~23:15, third sighting family: "The grenades still have issues with the terrain btw")
Hypothesis to VERIFY FIRST (state findings in the report): lob arcs and blast explosions are placed at flat-sim height (y≈0 + arc) while the dramatic relief renders ground RAISED/carved — so grenades visually pass through banks and explosions detonate half-buried inside slopes. The sim is planar BY LAW (damage/radius unchanged — this is 100% render-side).

## Scope
1. **Verify + document the mechanism** (screenshots of the failure on the current claim: throw a blast onto a raised bank / into the river cut).
2. **Arc render-height**: the lob projectile's rendered arc adds the visual terrain height sampled along its path (launch point, apex, impact point — lerp between samples; the SIM arc/timing untouched).
3. **Impact placement**: explosion/scorch vfx sample visual height at the impact position (the same sampler entities use); scorch decals lie on the visual surface (respecting the RenderLayers ladder).
4. **Muzzle/launch origin**: the throw originates from the hero's rendered position (already visualY-correct — verify).
5. Regression: on a FLAT tile everything is byte-identical (sampler returns 0 — assert in e2e).

## Firewall
Touch ONLY: projectile/vfx render placement (visual sampling), e2e, artifacts. NO sim changes (arc timing, damage position, radius — the planar sim is LAW), NO terrain changes, NO RenderLayers reordering.

## Self-check
tsc/build; new/extended e2e: blast onto a raised bank → explosion vfx y matches sampled visual height (diagnostics assert) · flat-tile byte-identity · determinism unaffected (sim probe hash unchanged); vfx-layering + w1-01 + m1-01 + m2-01 unmodified green both projects; zero console errors; before/after screenshots (blast on the bank) into artifacts/blast-relief/. Commit on lane/polish. End: READY-FOR-GATES + the verified mechanism + results.
