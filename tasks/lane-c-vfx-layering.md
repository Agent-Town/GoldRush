# Task vfx-layering: explosions must never hide under ground decals (LANE-C, branch lane/polish, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; the vfx system (blast/explosion rendering), BuildSystem ground visuals (rubble, wear strips, repair ring), docs/playtests/2026-07-07-robin-playtest-02.md. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green.

## Owner finding (2026-07-07 ~08:15, live play)
"The grenades explosions are visualised under the new 'rubble' layer, so not fully visible anymore." Blast Charge detonation vfx render BENEATH ground-layer decals (rubble quads and/or wear/ring visuals added by BT-00/combat-readability era) — the most satisfying moment in combat is being partially covered by debris art.

## Scope
1. **Define the render-layer ladder once, as named constants** (e.g. `RenderLayers`: terrain 0 < ground-decals (rubble/wear/ruts/repair-ring) 1 < gameplay entities/billboards 2 < impact vfx (explosions, muzzle pulses, float-text) 3 < UI-in-world (prompts/bars) 4). Apply via `renderOrder` + appropriate `depthTest`/`depthWrite`/`polygonOffset` on the ground-decal materials so ordering is STRUCTURAL, not incidental.
2. **Audit every ground-hugging quad** (rubble, wear strips, tar/rings, shadow blobs) and every vfx emitter against the ladder — one sweep, one table in your report (object → layer → change made).
3. **The blast specifically**: detonation flash + shockwave ring + debris motes render fully above rubble at all camera angles; verify ON TOP of an existing rubble pile (the owner's exact scenario: demolished/destroyed building site + blast on it).
4. Diagnostics: expose `renderLayerOf(name)` or equivalent probe so the e2e can assert the ladder.
5. Regression fence: damage-orientation (wall-frame strips), building bars, and terrain shading unchanged in screenshots.

## Firewall
Touch ONLY: renderOrder/material depth settings on vfx + ground-decal objects, the RenderLayers constants module, diagnostics additive, e2e. NO gameplay/damage changes, NO new vfx content, NO shader rewrites beyond depth/order flags.

## Self-check
tsc/build; new `e2e/vfx-layering.spec.ts` (blast over rubble → vfx layer > decal layer asserted via diagnostics; screenshot of a blast on a rubble pile desktop+390 into artifacts/vfx-layering/); combat-readability + damage-orientation + m2-01 + task-025 + m1-01 green both projects; zero console errors. Commit on lane/polish. End: READY-FOR-GATES + the audit table + results.
