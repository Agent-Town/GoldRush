# night-shift-dusk-ramp — dusk arrives like dusk, and it touches EVERYONE
ROLE: light-rig design + render fix. WORKDIR: lane-d (worktrees/lane-d), after fix-fresh-scene-render-state (same file family — stack, do not conflict).
CODEX: model=gpt-5.6-sol effort=high

## WHY (owner, Night Shift run 2026-07-12, verbatim): "this is the first darkness, this is like dusk? It does not feel so dusky but jumps a bit ahead? Maybe at first the shadows become longer and the ambience gets more orange/redish, then the dusk sets in. The seams are not affected as well as some other sprites as you can see in the screenshot."
Two items:
A (DESIGN): the day→dark transition skips the golden hour. Owner-specified ramp: (1) shadows lengthen + ambience warms orange/red (golden hour), (2) THEN dusk blue-brown sets in, (3) then the dark that owns the claim. Stage the existing transition over these keyframes (timing proportional to the current total transition — no gameplay window changes).
B (BUG, screenshot-proven): hero + Prospector + gold seams (+ audit ALL billboard/sprite materials: pickups, motes, build ghosts) render at full daylight brightness through the darkness — sprite materials bypass the night tint the world receives. Fix: the LightRig tint applies to every in-world sprite material (single shared uniform/color path — SpriteAnimator materials included); UI stays untinted.
## READ-FIRST: src/world/LightRig.ts (current night ramp + what it tints) · src/assets/SpriteAnimator.ts materials · Night Shift contract lightRamp params (contracts.json twist.lightRamp) · e2e night-shift suites + the owner's screenshot angle (hero at a seam ~04:20).
## SCOPE: the 3-stage ramp (data-driven keyframes) + universal sprite tinting + an e2e that samples hero-sprite rendered brightness at dark-phase and asserts it tracks the world tint (±band), plus golden-hour keyframe presence. Determinism: ramp keyed to the wave clock (already sim-driven), no wall time.
## TOUCH-ONLY: LightRig, sprite material tint path, night-shift lightRamp data keyframes, one e2e, artifacts/night-dusk/.
## NO: wave timings/gameplay windows, lantern mechanics, other contracts' palettes.
## SELF-CHECK: tsc; build; night-shift + w1 + cast/town suites green BOTH projects (sprites tint in RUN, town unaffected unless townNight); zero console; a 4-frame strip: day → golden → dusk → dark with the hero in frame each stage.
END: READY-FOR-GATES + the strip.
