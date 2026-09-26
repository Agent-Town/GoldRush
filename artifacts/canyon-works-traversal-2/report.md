# canyon-works-traversal-2: implementer report

**READY-FOR-GATES**, with three reds attributed below. Opus 5.5 implementer at max effort, 2026-09-26, worktree `/Users/robin/Claude/Projects/wt-cw2`, branch `fix/canyon-works-traversal-2` cut at `dc3d6e6d3`. Pre-flight: `canyon-works-traversal-1` is on main (`752d624e8`), the contract read `"creekBlendStart": -14`, `git log main..HEAD` was empty, the only untracked entry was the `node_modules` symlink, and `npm run build` passed (rc 0) before anything changed.

## Verdict
The t2 ramp is slope-legal: `t2RampStart`/`t2RampEnd` go from 18..28 to 14..32, the same 4 m over 18 m, with a peak |simSlope| of 0.333 (a 0.017 margin under slopeMax 0.35). No point outside the cliff footprint is refused anywhere on the tile, and on foot from the bridge you can reach all four seams, both galleries, both lamps and both turrets without entering that footprint. The scripted cliff is untouched and still refuses 833 of 833 points. Astra's acceptance crossed in 4 of 4 runs, and in 4 of 4 it reached a gallery seam and banked gold (first gold 20 or 25 at 40.7 to 43.2 s of sim). Its `secures` cell failed in 0 of 4 runs for a third obstacle that is not the terrain (F-CW2-3). Two things fall outside this firewall and are reported, not fixed. The contract's two pre-placed arc turrets had never stood on the map; now they do, and one of them kills the moth in `e2e/e3-canyon-works.spec.ts:81` (F-CW2-1, since re-baselined under the coordinator's named firewall lift; see the addendum). gt-03's Canyon Works goal-side rows lost the wall they slid on (F-CW2-2).

## 1. The slope table and the chosen window
Measured with the sim's own `simSlope`, `isTraversable` and `Terrain.sample`, loaded through vite SSR the way gr-sim loads them (the canyon-works-traversal-1 method). Each window is served in memory to its own module graph. Tables: `slope-t2.txt` (+ `.json`, tool `slope-t2.mjs`), and the committed block re-read as served in `slope-t2-as-served.txt`. slopeMax 0.35, central-difference step 0.5 m, rise 4 m. The cliff footprint is the cliff term plus its feather plus the difference step: x -13.5..13.5, z 16.5..27.5.

| window | run | 1.5 h / r | measured peak outside the footprint | margin | refused points outside the footprint (0.25 m tile / 0.05 m band) | reached from the bridge: seams, galleries, lamps, turrets |
|---|---|---|---|---|---|---|
| 18..28 (before) | 10 m | 0.6000 | 0.598 at z 23 | -0.248 | 6900 / 178020 (z 19.8..26.2 at every x) | 0/4, 0/2, 0/2, 0/2 |
| **14..32 (chosen)** | 18 m | 0.3333 | **0.333 at z 23** | **0.017** | 0 / 0 | 4/4, 2/2, 2/2, 2/2 |
| 13..33 | 20 m | 0.3000 | 0.2998 at z 23 | 0.0502 | 0 / 0 | 4/4, 2/2, 2/2, 2/2 |
| 15..31 (probe) | 16 m | 0.3750 | 0.3745 | -0.0245 | 4692 / 111780 | 0/4, 0/2, 0/2, 2/2 |
| 14..31, 15..32 (probes) | 17 m | 0.3529 | 0.3525 | -0.0025 | 1380 / 40020 | 0/4, 0/2, 0/2, 2/2 |

Columns, t2 band z 8..38, step 0.01. At x -14, 14, -20, 20, -30 and 30: before, z 19.79..26.21 was refused (6.42 m, peak 0.598 at z 23); after, nothing is refused, peak 0.333 at z 23. At x 0, -8 and 8 the column crosses the cliff. The cliff band is refused either way: z 16.76..27.18 before, z 16.68..27.15 after (peak 2.2 before, 2.4085 after, at z 17.5). Outside the footprint the peak there is the t1 ramp's 0.2798 at z 10. The cliff still stands 2.2 m above the ramp beside it: 4.108 over 1.908 m at z 22 before, 4.368 over 2.168 m after. Foot routes use an 8-connected flood from (0, -5) with the footprint excluded. Path lengths on 14..32: seams 52.3/48.1/48.1/52.3 m, galleries 45.5 m, lamps 51.1 m, turrets 34.5 m.

**Why 14..32.** The master's rule asks for the narrowest window whose peak stays under 0.35 by at least 0.015 everywhere outside the cliff footprint. A 4 m smoothstep rise needs a run of at least 17.9 m to reach 0.335. 18 m is the narrowest whole-metre run: 17 m reads 0.3525 and is refused. 14..32 also keeps the old centre at z 23, abuts the t1 ramp's end at z 14 (both derivatives are 0 there) and ends 8 m before the t3 ramp at 40.

## 2. The contract (commit `10a039c40`)
Two numbers change in `e3-canyon-works` `tileParams.elevation.analytic`: `t2RampStart` 18 to 14 and `t2RampEnd` 28 to 32. The mirror `mask-tables/e3-canyon-works.json` got the same two numbers in the same commit. `node --test scripts/e3-mask-tables.test.mjs` passes 30 of 30. No other number moved: the cliff, `creekBlend*`, the heights and Balance are all untouched.

## 3. Engine hash
Before: `9a995b76569235178101263919756b45713eb3f9e0dc71643ed8cf1d2cd74be6` (pin #63). After: `172b827944b415c4c85316edbd18b8fd38a155a9e85b7d7417d10928a46254ee` (`computeEngineHash` on the worktree). The drain pins it. The e2e and artifacts commits sit outside `ENGINE_SOURCE_INPUTS`.

## 4. Floors: 2 of 83 moved (listed for the drain, not re-pinned)
| floor | pinned (control) | after | reason |
|---|---|---|---|
| e3-canyon-works/e3-canyon-works-01 | eventLogHash `fnv1a32:86bf5d8b` | `fnv1a32:e36cf893` | the two authored arc turrets now stand |
| e3-canyon-works/e3-canyon-works-02 | eventLogHash `fnv1a32:249819fd` | `fnv1a32:bc39b64f` | the same |

The outcome fields are identical in both seeds: secured false, waves 3, timeMs 98267 / 97933, gold 0, kills 35 / 27. A structural diff of the two gr-sim view streams (`floors/grsim-{before,after}-*.out`) shows only `now.works`, `worksHp` and `currentWorks` differing, plus the hash (136 and 117 leaves): works standing goes from 2 to 4 and works hp from 70 to 170. So the terrain changed under the pre-placed turrets at (-18, 22) and (18, 22), not under idle enemies, and the idle hero's run does not change. The control on the clean tree was 83 of 83 (309.8 s, load 44). After the change it was 81 of 83 (930.9 s, load 186 to 201). Logs are in `floors/`.

## 5. gt-03 verdict: re-baselined (commit `2f2247cd0`), no enemy crosses the cliff footprint
- Control, clean tree: `gt-03:155` is green on both projects. The four Canyon Works goal-side rows slide after 12/13/12/13 samples, west/east/east/west.
- Treatment: the four rows read `passSide null` after all 80 samples on both projects. The enemies walk from z 32 to their targets at z 8, ending at about (-46, 7.9), (-28, 8.1), (46, 7.8) and (28, 8.1). **They never met the cliff.** At x -38 and 38 they had been sliding on the t2 ramp's wall, which the master took for the cliff. The basin rows of the same test stay green (`cliffSamples 0`, `crossedThroughCliff false`, pass side west). No enemy entered the cliff footprint, so this is a baseline move, not a regression.
- Re-baseline (baseline numbers only): `expectedPassSide` becomes null for the four rows. The measured reason is in the assertion message and in a comment. With it, `gt-03:155` is green on both projects.
- `gt-03:125` (the gt-test-basin slope row, a different tile) is red on the clean tree too. The measured value varies from run to run: 1.331 and 1.366 in the control, then 1.037, 2.23, 0.138 and 2.443 later, under load 50 to 230. It is not caused by this change.
- Goal-side reports for control, treatment and re-baseline are in `gt-03/`. The re-aim probes are in `gt-03/goal-side-probe*.json` (see F-CW2-2).

## 6. Astra's acceptance (`GR_NATIVE_PROOF=1`, `e2e/native-proofs/e3-canyon-works.spec.ts` unedited, own vite on 5325, one worker, two honest attempts per project)
| attempt | project | crossed | first on the gallery shelf | first gold | beacons built (wave) | end |
|---|---|---|---|---|---|---|
| 1 | desktop | yes, (0, -5.59) | 32.8 s at (-30.3, 31.7) | 20 at 43.2 s | 4 (2, 4, 6, 8) | CONNECT missed, 0 of 2 at wave 8; alive at wave 12, sim 361.6 s, at **(24.66, -17.05)**, 55 HP, 48 gold (the 5th beacon costs 50) |
| 1 | phone | yes, (0, -5.71) | 31.3 s at (-30.8, 32.5) | 25 at 41.7 s | 1 (2) | died at wave 3, sim 115.2 s, at **(0.29, -5.06)**, on the ford |
| 2 | desktop | yes, (0, -5.80) | 30.5 s at (-24.1, 34.2) | 25 at 40.7 s | 2 (2, 4) | died at wave 6, sim 191.7 s, at **(-19.91, 9.78)**, below the west rim pylon |
| 2 | phone | yes, (0, -5.64) | 30.9 s at (-27.7, 35.6) | 25 at 40.9 s | 2 (2, 4) | died at wave 4, sim 134.1 s, at **(-5.25, -5.89)**, the ford's south-west corner |

- `crossed`: 4 of 4. A seam reached with gold above 0: 4 of 4.
- The driver's `secures` cell (Claim Secured plus CONNECT by wave 8): 0 of 4.
- Zero console or page errors in all four rows.
- For comparison, canyon-works-traversal-1 stopped at z 19.8 with gold 0 and no builds.
- Host load was 165 to 230 through all four runs. The owner's baseline is 25 to 45, and the driver steers in real time at timescale 4.
- Boards: the driver writes `board-*.png` only after banking, so no run produced one. The end states are `native-a1/e3-canyon-works/terminal-desktop-chrome.png` (wave 12, GRID 26/28 W, CONNECT 0/2 W8, gold 48) and the matching `terminal-*` and `last-*` files for every run under `native-a1/` and `native-a2/`.

## 7. The traversal spec's t2 row (commit `8346ff6f2`)
`e2e/e3-canyon-works-traversal.spec.ts` gains one test. The hero walks from the works bridge (0, -5) to seam anchor-0 (-34, 30), the acceptance run's first gallery target, with the real movement code under the manual sim and one held key per leg:
1. Over the bridge and up the t1 ramp to z 12.
2. West along the bench to x -28.
3. Straight up the t2 ramp to z 30.
4. West along the shelf to x -34.

The sim is checked first. The ramp at x -28 has no refused point. Its peak is at most slopeMax minus 0.015, and it measures 0.333. The rise is still 4 m. The cliff at x 0 is still refused over z 18..26. Results are identical on both projects:

| leg | sim seconds |
|---|---|
| 1, bridge to bench | 3.5 |
| 2, bench west | 4.5 |
| 3, t2 ramp (12.54 to 30.42) | 3.875 |
| 4, gallery shelf | 0.875 |

No leg stalls, drift is at most 0.18 m, the closest approach to the seam is 0.616 m, the hero stands on the shelf at 4.431 m, and there are no console or page errors. The existing bank row is unchanged and green.

## 8. Adjacent suites: control against treatment (both projects, `--workers=1`, under the drain lock)
| suite | control (`dc3d6e6d3`, load 69 to 49) | treatment (`10a039c40` plus the t2 row, load 46 to 129) |
|---|---|---|
| e3-canyon-works-traversal | 2 of 2 | 4 of 4 (with the t2 row) |
| e3-canyon-works | 4 of 4 | `:116` 2 of 2; **`:34` red on both at `:81` (F-CW2-1)**; after the addendum's re-baseline 4 of 4 |
| gt-03-enemy-elevation | `:155` 2 of 2, `:240`/`:254` desktop 2 of 2, `:125` red on both | `:155` red (the goal-side rows, re-baselined, then green on both); `:240`/`:254` 2 of 2; `:125` red on both (already red in the control) |
| task-025 | 10 of 10 | 10 of 10 |
| m2-01 | 14 of 14 | 14 of 14 |

Totals: control 34 passed, 2 failed, 2 skipped. Treatment 32 passed, 6 failed, 2 skipped. After the re-baseline, gt-03 is 4 passed, with 2 failed (`:125`) and 2 skipped. Logs, the head, the load and the vite PID for every batch are in `e2e/<batch>/`.

## 9. Self-check
- tsc rc 0; `npm run build` rc 0; `GR_RELEASE=e1 npm run build` rc 0 (`builds/`).
- `e3-mask-tables` 30 of 30.
- `null-floor-anchors --check`: 83 of 83 before and 81 of 83 after (section 4).
- Node guards:
  - Ten guards that read the contract (`e3-mask-tables`, `engine-era-guard`, `bench-seeds`, `canyon-connect-view`, `canyon-terminal-probe-binding`, `f2135-canyon-census-player`, `terrain-contract-scope`, `campaign-harness-terrain`, `null-floor-anchors.test`, `no-emdash-guard`): 52 of 52 before. After, 50 of 52; the two reds are the engine-era registry rows, "rotation registry stays outside the engine identity corpus" and "the landed registry names the live engine", which stay red until the drain pins the new hash.
  - Seven more guards that name the canyon: 35 of 35 after.
- I did not run the full `npm run test:node-guards` battery; the master does not list it, and the drain runs it.
- I wrote no em or en dashes. The instrument logs quote their own titles.

## Findings
- **F-CW2-1 (blocks `e3-canyon-works:34`; outside this firewall; a decision for the drain or the owner).** The Canyon Works' two authored arc turrets, `prePlacedBuildables` at (-18, 22) and (18, 22), have been in the contract since the map was born (`dcaad5a9b`, 2026-07-15), but they never stood on the map.
  - Why they were missing: `placeContractFixtures` (`src/game/Game.ts:5534`) and the headless sim (`src/sim/HeadlessContractSim.ts:1221`) place fixtures through `BuildSystem.placeFree` (`src/systems/BuildSystem.ts:1120`). That call refuses ground that `matchesPlacement` (`:1699`) finds unwalkable, and the old ramp refused both sites (slope 0.574, walkable false).
  - Browser control, both projects (`fixtures/`): only the two lantern posts stand on 18..28; on 14..32 (slope 0.329) all four fixtures stand.
  - Why the moth step reds: the east turret now kills the moth that `:81` expects attached to `lantern:1`. It stands at 2.168 m with a range of 19.25 m, the lamp is 17.2 m away, and the line of sight that the old ramp's shoulder blocked at (21.5, 24.5) is now clear (the sim's own `terrainLineOfSight`, `moth-lamp/los.txt`).
  - Single-variable probe (`moth-lamp/`, both projects):

    | arm | moth alive / attached | killsByOwner | light coverage |
    |---|---|---|---|
    | as the spec | 0 / 0 | `{turrets: 1}` | 1 |
    | east turret wrecked | 1 / 1 on `lantern:1` | none | 1 to 0.179 (exactly what `:81`..`:83` expect) |
    | west turret wrecked | 0 / 0 | `{turrets: 1}` | 1 |

  - Recommended cure: wreck turret index 1 before `spawnMoths(1, 30, 32)` so the step still proves a moth dims an unguarded lamp, or assert that the turret now guards it.
  - The map also gains two free turrets it was authored with, which is a balance change the owner should know about.
- **F-CW2-2 (coverage; a corrective outside this firewall).** The gt-03b goal-side steer rows (the owner's 2026-07-28 "go" on F-1131-5: the pass side must be the goal's side across several spawns) now have no wall on this map. Re-aims measured on both projects:
  - At the cliff, starting at x -6 and 6 with the same deltas, 3 of 4 rows slide. The same-polarity west row does not, because `terrainDetourWaypoint` steers it around the cliff.
  - Against the river (target z -20), 0 of 4 slide, because the enemies are routed to the ford.

  Recommendation: give the goal-side rows a fixture with a wall that no router steers around.
- **F-CW2-3 (the win; owner or driver, not terrain).** With every target reachable, Astra's gather-and-extend driver still does not secure the map:
  - Desktop attempt 1 built 4 of 6 beacons by wave 8 and CONNECT missed. The enemies wrecked all four beacons and both turrets by wave 12.
  - The other three runs ended in death: two on the single ford (the phone attempts), which the driver crosses 4 to 8 times per run, and one below the west rim pylon (desktop attempt 2). The positions are in section 6.
  - The run was at 4 to 9 times the owner's baseline host load, so the cheapest next check is a re-run at baseline load. After that it is a balance or driver question: the CONNECT economy needs 240 gold for six beacons (25 to 55 each), the four seams sit only on the gallery shelf, and four of the six pylon sites sit on the south bank beyond the ford.
- **F-CW2-4 (the art owner's; the t2 analogue of F-CW1-2).** `canyon-works-terrain.glb` keeps the old steep t2 face.
  - Within z 14..32 the gap between the sim ground and the visible face grows: from 0.57 to 0.91 m at x 28 (z 20: visible 0.63, sim 1.54), and from 0.12 to 0.66 m at x -20 (`glb-vs-sim-t2.txt`).
  - The render stands the hero on the GLB grid, so nothing floats or sinks. But line of sight and high-ground range now read a gentler ramp than the one on screen.
  - Recommendation: regrade the GLB's t2 face to 14..32. No GLB or `src/` edit was made in this slice.

## Commits
- `10a039c40` the contract window and the mirror
- `8346ff6f2` the traversal t2 row
- `2f2247cd0` the gt-03 re-baseline
- `60e3524d5`, `e4568f1ae`, `a6deb3ad0` the instruments and their logs
- plus this report's commit

## Remaining list, in order
1. Drain: pin engine hash `172b8279...` and the two moved canyon floors (eventLogHash only, reason in section 4).
2. ~~F-CW2-1: `e2e/e3-canyon-works.spec.ts:81` needs a re-baseline.~~ DONE under the named lift (addendum).
3. F-CW2-3: re-run Astra's acceptance at baseline load. If it still stops, route to the owner as a balance or driver question for the Canyon Works CONNECT.
4. F-CW2-2: a wall-backed goal-side steer fixture.
5. F-CW2-4: regrade the GLB t2 face.

## Addendum: F-CW2-1 re-baselined under the named firewall lift (2026-09-26)
The coordinator lifted the firewall for this one purpose (F-1082-1 form): "you may edit `e2e/e3-canyon-works.spec.ts` for F-CW2-1 only". The edit is 17 inserted lines in the test at `:34`, placed just before the moth spawn. Every original line is byte-identical, including the `:81` expectation `{ alive: 1, attached: 1, sourceId: 'lantern:1' }` and the `toBeLessThan(full * 0.6)` line after it. Nothing else in `e2e/` moved, and `src/**` is byte-identical to the branch base. The reason sits above the new lines, naming F-CW2-1 and this task. The step now:
1. Reads the map as it is: `build.hp` turrets `toEqual([{ index: 0, x: -18, z: 22, wrecked: false }, { index: 1, x: 18, z: 22, wrecked: false }])`.
2. Wrecks the east arc turret, which guards the lamp: `wreck('turret', 1)` must return true, then `advanceSim(0.2)`, the spec's own wreck idiom.
3. Keeps the original expectations: the moth attaches to `lantern:1`, and coverage falls below 60% of full.
4. Pins the measured value: `lightCoverage(37.5, 32)` `toBeCloseTo(0.179, 3)`, measured 0.17928 on both projects in the probe.

The rest of the test is unchanged and green: the kill with the boosted Spark Rig, the cut span (`cutWireCount` 1), the repair and the secure step. That matches the code, since only sentry beacons on pylon sites and capacitor banks drive power nodes and wires (`src/game/Game.ts:7602-7627`), so a wrecked turret cannot cut a span.

Run: the whole spec on both projects, `--workers=1`, under the drain lock, own vite on 5325, spec blob `41f38770`, 2026-09-26 01:47Z, load 99.45 at start and 76.87 at end. Result: **4 of 4 passed in 23.1 s**. `:34` took 6.3 s on desktop and 6.4 s on the phone; `:133` (the old `:116`, moved by the 17 inserted lines) took 4.1 s and 3.8 s. There were zero console or page errors (the watch suppressed 0 known errors in all 4 tests) and no timing red, so no re-run. Evidence is in `e2e/f-cw2-1-e3-canyon-works/`: run.txt with head, blobs, load and the vite PID; playwright.log; and the spec's own `moth-cloud-lamp` boards at 1280 and 390. The camera follows the hero at the Sub-Hall, so the moth itself is off frame and the sim numbers are the proof. The batch runner now also skips this spec in its churn restore and records the blob of every dirty file it tested.
