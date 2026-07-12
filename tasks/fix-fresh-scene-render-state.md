# fix-fresh-scene-render-state — every scene arrives fully dressed, every time
ROLE: render-state surgeon. WORKDIR: lane-d (worktrees/lane-d).
CODEX: model=gpt-5.6-sol effort=high

## WHY (owner 2026-07-12, verbatim): "sometimes the graphics are off on a fresh level or the town, a hard reload fixes that" — his screenshot: NIGHT SHIFT rendering in full daylight at wave 0 (night rig absent); hard reload always correct.
Diagnosis hypothesis: soft navigation (town→run, run→run via board) races scene setup — LightRig/night palette/fog/tier knobs read state before the scene finishes building, or renderer state leaks from the previous scene. Hard boot serializes correctly → order dependency, not asset failure.
## READ-FIRST: src/world/LightRig.ts (night application path) · src/game/Game.ts scene init + the run-launch flow from town (main.ts launchContract) · src/town/TownScene.ts dispose→game boot seam · 058 tier apply timing (applyStoredPerformanceTier) · e2e night-shift suites.
## SCOPE
1. Reproduce via soft-nav loop: boot town → launch e1-night-shift → assert night-rig diagnostics (light levels/palette) — repeat N times or force the race with throttled loads; instrument which flag/order breaks.
2. Fix: make render-dress application a deterministic POST-SCENE-READY step (single ordered hook: terrain ready → rig applied → first frame), no reliance on load timing; cover town-entry the same way.
3. e2e: soft-navigate into Night Shift 3x and into town 3x — assert rig/palette diagnostics EQUAL the hard-boot values each time (the "fully dressed" contract); both projects.
## TOUCH-ONLY: scene init ordering (Game/TownScene/main seams), LightRig application hook, one e2e, artifacts/.
## NO: visual VALUES (palettes/tiers unchanged), sim, contracts data.
## SELF-CHECK: tsc; build; new spec + night-shift + w1 + town suites green BOTH projects; zero console; the daylight-night repro shown fixed (before/after).
END: READY-FOR-GATES + the root-cause order diagram (3 lines).
