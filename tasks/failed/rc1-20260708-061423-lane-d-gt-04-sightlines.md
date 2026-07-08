# Task gt-04: sightlines on the heights — LOS + projectiles respect elevation (LANE-D, branch lane/perf, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; specs/gameplay-terrain/README.md (GT-04 = this rung); the GT-01..03 stack (TileHeight, the movement resolver, enemy elevation — the height data everything samples); BuildSystem `hasLineOfSight` (the palisade-blocker LOS from 041 — this task EXTENDS it with terrain, same seam); CombatSystem 'lob'/'bolt' kinds. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (the GT ladder's combat rung — the Hill Mine and the Re-survey need it)
On GT tiles, high ground must MEAN something: ridges block bolt sightlines, lobs arc over, turrets on heights see farther. This is the rung that turns elevation from geography into tactics.

## Scope (GT tiles only — flat tiles keep the planar fast-path, hash-asserted)
1. **Terrain LOS**: `hasLineOfSight` gains a heightfield term — a bolt's line samples terrain height between shooter and target (coarse steps, cached per the GT sampling budget); a ridge between them blocks acquisition exactly like a palisade does (same refusal semantics, 041's law).
2. **Lob clearance**: 'lob' projectiles ignore ridge LOS (they arc) BUT impact resolves at the target's terrain height (sim-consistent with the render fix from blast-relief).
3. **High-ground range**: shooter elevation adds range per the spec's modifier vocabulary (`Balance.gt.highGroundRangeBonus` additive knob, default per spec) — symmetric for turrets and hero.
4. **Determinism + perf**: LOS sampling deterministic (fixed step count); 200-enemy stress on the basin within envelopes; flat-tile zero-cost proven (<2% bench delta).
5. Diagnostics: last-LOS-check exposure for e2e.

## Firewall
Touch ONLY: the LOS seam (terrain term), lob impact height, the range knob, gt e2e + determinism probe, artifacts. NO flat-tile behavior changes (byte-identity asserted), NO routing changes (GT-03 owns), NO CombatSystem damage semantics, NO camera.

## Self-check
tsc/build; new `e2e/gt-04-sightlines.spec.ts`: ridge blocks bolt acquisition both directions · lob arcs over + lands at correct height · high-ground range bonus measured · flat-claim byte-identity (seeded hash) · determinism two-run identical · stress perf in envelope; 041-overwatch + task-025 + m1-01 + m2-01 + gt suites unmodified green both projects; zero console errors; screenshots (turret denied through the ridge, lob clearing it) into artifacts/gt-04/. Commit on lane/perf. End: READY-FOR-GATES + results.
