# Lane D — Night mode truth

Verdict: **READY-FOR-GATES**, with three inherited night-test failures fingerprint-matched against clean `origin/main` (`22814074`). The new feature gate, production build, 3D performance gate, dusk/day-night coverage, and lantern-post coverage are green on desktop and mobile.

## Assault-gating root cause

The wall-assault machinery and natural wrecker schedule were alive. The Night Shift-specific pressure law was not.

- Pre-fix `src/game/Game.ts:4847` updated `LightField` only when `dayNightCycle` existed. E1 Night Shift is driven by its authored wave light ramp, so it always supplied darkness `0` and no sources to the field.
- Pre-fix `src/game/Game.ts:4512-4515` applied the outside-light speed multiplier only to Moth Season. Night Shift wreckers therefore received no dark-corridor pressure and arrived on the ordinary timetable, matching the owner report that walls could be defended trivially at range.
- The fix makes the authored Night Shift sources the physical `LightField` truth and applies the Balance-tunable `1.18x` outside-light multiplier to Night Shift wreckers only. Watch-paint remains an enemy-read overlay and is explicitly excluded from physical coverage.
- `e2e/night-mode-truth.spec.ts:104` now drives the default wrecker table and pulse structure (only wall-clock cadence is compressed), observes a natural wrecker with the `1.18x` pressure value, and proves `CombatSystem`-resolved wall damage by wave 11. The earlier permissive version passed on baseline; this hardened form does not.

## Mesh light truth

`src/game/Game.ts:4856-4912` now builds one typed source list for hero, Prospector, powered lanterns, carried lanterns, and watch-paint, then sends physical sources to `LightField`, `LightRig`, `BuildSystem`, and the 3D terrain shader. The shader at `src/world/Terrain3dClaimPilot.ts:300-338` uses the same full-radius boundary and cubic `lightFalloff` band as simulation coverage. The e2e samples pixels inside the radius and inside the falloff band, checks simulation coverage outside it, and proves a sentry beacon does not become physical light.

## Enemy read

Full-dark enemies keep their illustrated sprites instead of switching to the old head-and-cone procedural body. A small warm, Balance-tunable lantern bulb and cone sits perpendicular to the carrier's facing; sprite tint, scale, and brightness are also tunable. At gameplay zoom the result reads as hats, coats, arms, legs, and a carried side light.

- Before: `reviews/shots-night/desktop-chrome-before.png`
- After: `reviews/shots-night/desktop-chrome-after.png`
- Mobile after: `reviews/shots-night/mobile-chrome-after.png`

The first unprimed visual critique rejected the oversized detached light discs and underlit figures. After warm per-instance sprite tinting, smaller side lights, fade-overlay removal at full dark, and the corrected perpendicular hand vector, the final comparison is materially less wrong: the figures are the primary read and the carried lights are secondary.

A fresh unprimed review of the exact final pair called the after image “decisively less wrong,” found no blocker for the figure-carrying-light criterion, and left brighter amber lantern glow as minor future polish.

## Evidence

| Gate | Result |
|---|---|
| `tsc --noEmit` | Green |
| `npm run build` | Green; existing Vite chunk-size warning only |
| `night-mode-truth.spec.ts`, desktop + mobile | **4/4 green**, zero console/page errors |
| `night3d-perf.spec.ts`, desktop + mobile | **4/4 green** |
| Night Shift 3D p95 | Desktop **9.8 ms** vs painted 41.2 ms (0.238x); mobile **10.3 ms** vs painted 41.7 ms (0.247x), both below the 1.15x gate |
| `e3-day-night.spec.ts`, desktop + mobile | **2/2 green** |
| `run3d-lantern-post.spec.ts`, desktop + mobile | **8/8 green** |
| Wider night matrix | **24/30 green**; the six project failures are the same three inherited failures in both projects |

### Baseline-proven known reds

The following three desktop failures were rerun in an isolated clean `origin/main` worktree and reproduced before this lane's changes; the lane run has the same failure sites and fingerprints in both projects.

1. `e1-night-shift.spec.ts:372`: nearest-enemy probe expects distance squared `< 1`; baseline and lane both return `1.5758571239885517`.
2. `e1-night-shift.spec.ts:435`: old painted-luminance test expects inside/outside `>= 3`; baseline is about `2.105`, lane about `2.117` desktop / `2.081` mobile. The new mesh-radius test is green and owns the 3D truth.
3. `night-light-doctrine.spec.ts:15`: building context prompt remains hidden at line 79 on baseline and lane.

No existing e2e spec was edited to hide those failures, and their unrelated pathing/UI/test-harness owners were left outside this task's firewall.

## Independent review

`codex review --uncommitted` raised four findings, all fixed:

1. watch-paint leaked into physical light consumers;
2. the terrain pool faded inside the simulation radius;
3. the assault test passed on baseline due to wrecker-table overrides;
4. the carried-lantern diagonal side vector was incorrect.

The final implementation splits watch vs physical consumers, shares the simulation falloff, uses the default wrecker schedule with a production pressure assertion, and offsets lanterns perpendicular to facing.
