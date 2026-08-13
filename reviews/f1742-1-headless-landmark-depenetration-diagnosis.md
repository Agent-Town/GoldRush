# F-1742-1 — headless landmark depenetration diagnosis

**VERDICT: ROOT CAUSE PROVEN; ONE-SEAM CORRECTIVE READY.** The E4 idle-secure anomaly is not an enemy-targeting defect. The headless hero starts inside a mounted landmark blocker and never receives the browser's existing depenetration callback, so enemies correctly stop at the solid's perimeter and never reach the hero.

F-1742-1 root cause: HeadlessContractSim omits the browser landmark depenetration callback.

## Evidence

- `e4-long-road` declares its hero start at `(-180, 0)` in `assets/contracts/epoch-4-motor/contracts.json`; `assets/pilots/map-rebuild-spike/landmark-collision-contract.json` mounts `convoy-lead-hauler-start` at the same coordinate with a solid rectangular footprint.
- `e4-gusher-county` declares its hero start at `(0, -4)`; the mounted `county-camp-rig` blocker is centered at the same coordinate.
- `src/sim/HeadlessContractSim.ts:761` passes only `bounds` and `sample` to `Hero.update`.
- The browser's authoritative actor path in `src/game/Game.ts:2729` (`updateActors`) also passes `depenetrate`, calling `depenetrateFromBlockers` over `heroBlockers()` with `Balance.hero.radius + 0.08`; `heroBlockers()` includes `Terrain.landmarkBlockers()`.
- `Terrain.sample` marks mounted landmark footprints unwalkable. The stopped E4 enemies were measured at the blocker perimeter with zero velocity, while the hero remained at the blocker center.

## Reproduction

Current main, `--policy=idle`:

| Contract / seed | Terminal | Hero HP | Kills | Event hash |
|---|---:|---:|---:|---|
| `e4-dust-flats` / `e4-dust-flats-01` | died wave 2 | 0 | — | `fnv1a32:5d4aeff2` |
| `e4-long-road` / `e4-long-road-01` | secured wave 12 | 100 | 190 | `fnv1a32:3b1d3697` |
| `e4-gusher-county` / `e4-gusher-county-01` | secured wave 12 | 125 | 390 | `fnv1a32:43a1318e` |

## Lever proof

An in-memory probe changed no repository file. It supplied the headless `Hero.update` call with the browser-equivalent `depenetrateFromBlockers(point, Terrain.landmarkBlockers(), Balance.hero.radius + 0.08, maxDistance)` callback.

| Contract / seed | Hero start → released position | Terminal | Kills | Event hash |
|---|---|---:|---:|---|
| `e4-long-road` / `e4-long-road-01` | `(-180, 0)` → `(-182, 0)` | died wave 4 | 41 | `fnv1a32:2b27b21d` |
| `e4-long-road` / `e4-long-road-02` | `(-180, 0)` → `(-182, 0)` | died wave 4 | 48 | `fnv1a32:37ab9177` |
| `e4-gusher-county` / `e4-gusher-county-01` | `(0, -4)` → `(0, -6.6)` | died wave 5 | 93 | `fnv1a32:95f5777c` |
| `e4-gusher-county` / `e4-gusher-county-02` | `(0, -4)` → `(0, -6.6)` | died wave 2 | 29 | `fnv1a32:a9b7d153` |

Controls were byte-identical before and after the probe:

- `e4-dust-flats-01`: died wave 2, `fnv1a32:5d4aeff2`.
- `e4-boneyard-01`: died wave 4, `fnv1a32:717f1001`.

## Minimal corrective

Reuse the browser's existing `depenetrateFromBlockers` seam in `HeadlessContractSim.step`; add pinned Long Road/Gusher outcomes plus unchanged Dust Flats/Boneyard controls to the existing `scripts/gr-sim.test.mjs`. Do not change contract data, collision footprints, enemy routing, balance, browser behavior, or AP-15 seed/floor artifacts in this slice.
