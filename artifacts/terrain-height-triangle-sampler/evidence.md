# terrain-height-triangle-sampler — evidence (lane/d, 2026-09-05)

Cures **F-ASTRA-10** (`docs/reviews/2026-09-05-astra-3d-review.md` §4). `bakeHeightGrid` used to lerp
bilinearly over a cell's four corners while the mesh draws two triangles across ONE diagonal. Those
are different surfaces. The sampler now bakes the diagonal **out of the index buffer, per cell** and
interpolates on the triangle the point actually falls in, so `visualY` IS the drawn height.

Implemented by Claude Opus 5 in place of the Codex runner (Codex account out of quota).

## 1. Centroid discrepancy, every triangle of every terrain

`scripts/terrain-height-sampler.test.mjs` parses each GLB, evaluates every triangle centroid with the
old bilinear formula and with the shipped sampler (SSR-loaded from `src/`, not a copy), and compares
against the drawn height (a triangle is planar, so the drawn height at its centroid is exactly the
mean of its three corner heights).

| Terrain | Triangles | OLD max | OLD p95 | NEW max | NEW p95 | Astra's published max | Worst point (x, z) |
|---|---:|---:|---:|---:|---:|---:|---|
| The Claim | 32,768 | 0.025272 | 0.000719 | 2.78e-15 | 8.88e-16 | 0.0253 | (29.667, 29.833) |
| Twin Banks | 51,200 | 0.022965 | 0.001956 | 5.53e-07 | 6.64e-08 | 0.0230 | (-19.467, 0.667) |
| Hill Mine | 32,768 | 0.103274 | 0.000250 | 1.42e-14 | 8.88e-16 | 0.1033 | (-16.000, 17.500) |
| Mare Claim | 32,768 | 0.666667 | 0.003457 | 7.11e-14 | 1.07e-14 | 0.6667 | (41.667, -26.667) |

The OLD column reproduces Astra's table to within 0.15%, which is what makes the NEW column
believable; the test asserts that reproduction as well as `NEW max <= 1e-6`.

**Twin Banks is 5.53e-07 rather than ~1e-14, and that is float32 grid quantisation, not the
algorithm.** Its grid step is 0.4, which is not exactly representable in float32, so the exported
vertices sit a few 1e-6 off the ideal uniform grid the sampler indexes by. The other three steps
(0.5 / 0.75 / 1.0) are exact binary fractions and land at machine epsilon.

Topology measured, not assumed: all four GLBs currently split every cell along the
(low,low)-(high,high) diagonal, identity node transform, exactly 2 triangles per cell. The code
still reads the diagonal per cell, and two unit tests prove it follows the index buffer and rejects
a cell that is unsplit, double-split, or degenerate.

## 2. The Mare at its worst centroid (41.667, -26.667) — before and after

Booted `?debug&epoch=epoch-8-orbital&contract=e8-mare-claim`, hero teleported to the worst point.

| Sampler | `terrainVisualY` | hero Y | hero - visualY | Screenshots |
|---|---:|---:|---:|---|
| OLD (bilinear) | 1.333333 | 1.393333 | 0.06 | `mare-worst-centroid-old-desktop.png`, `mare-worst-centroid-old-mobile-390.png` |
| NEW (triangle) | 2.000000 | 2.060000 | 0.06 | `mare-worst-centroid-new-desktop.png`, `mare-worst-centroid-new-mobile-390.png` |

The 0.666667 gap between the two rows is exactly the row 4 max above. In the OLD pair the Prospector
is sunk into the ledge; in the NEW pair it stands on it. Zero console and zero page errors in all
four captures, desktop 1280x720 and mobile 390x844 (DPR 3).

## 3. Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (`build.txt`) |
| `scripts/terrain-height-sampler.test.mjs` | 3/3 (`node-test.txt`) |
| `npm run test:node-guards` | 680 tests, 673 pass, 5 fail, 2 skipped — every failure attributed below |
| `e2e/terrain3d-claim-pilot.spec.ts` desktop-chrome | 4 pass, 1 fail (F-T3D-1, pre-existing) |
| `e2e/terrain3d-claim-pilot.spec.ts` mobile-chrome | 4 pass, 1 fail (F-T3D-1, pre-existing) |

`the mounted terrain stays inside the 115% p95 budget` PASSED on both projects; the F-LTW2-1
terrain-budget timeouts did not reproduce here.

### node-guards failures, attributed

Re-run on a clean main tree (this change's three files removed) with the same Node 26.4.0:

| Failing guard | On main | Verdict |
|---|---|---|
| `the live board is green under this guard (baseline is honest)` (`desk-declaration-guard`) | also fails | pre-existing |
| `all 122 scripts/*.test.mjs fixture owners remove their temp directories` (`fixture-teardown`) | also fails | pre-existing (600 s file budget; overran beside a concurrent battery) |
| `contention is advisory, correctly counted, and absent when alone` (`node-guards-contention`) | n/a | advisory — the battery itself printed `CONTENDED — 2 concurrent batteries` (another implementer was live) |
| `rotation registry stays outside the engine identity corpus` (`bench-seeds`) | passes | **caused by this change — needs the drain's era pin** |
| `the landed registry names the live engine and stays outside its hash corpus` (`engine-era-guard`) | passes | **caused by this change — needs the drain's era pin** |

### OWED TO THE DRAIN: the era-5 pin

`src/world/Terrain3dClaimPilot.ts` is inside `ENGINE_SOURCE_INPUTS`
(`scripts/assay-replay-agent.mjs:36-44`), so this change moves the engine identity hash. The guard
says so itself: *"append a same-era pin with its cause, or bump the era with a fresh pins array"*.

- banked (era 5, 35 pins): `c552efe029369e05180c3df68e3c91003be7430164519d298e9898d9d07bdb28`
- this tree: `4198ee616344ef551e6240a9695a3af818f4430ec660313eb9e1aba15937334c`

`assets/engine-era.json` is OUTSIDE this task's firewall, and the pin is the drain's act by
precedent, not the implementer's: every recent pin landed in a `drain bookkeeping:` commit
(`acef98717` era-5 pin 9254f19e, `6a797845d` b395ee1f, `ee95cc88a` c552efe0, `9ada470ae` 8afae55f),
while the matching runner commits never touch the registry. Recomputed on the final committed tree,
so it is stable.

## 4. F-T3D-1: the 0.0214 hero figure did NOT move

The pre-existing red on `contract-valid GLB feeds every visualY consumer and keeps the water
agreement` is **not** a sampler-accuracy failure, and this change cannot move it.

Measured with the new sampler, mobile-chrome: `Received difference: 0.02136387825012198`
(expected `0.7964298105239869`, received `0.8177936887741089`) — the same 0.0214 as before.

Root cause, from a direct probe of all five sample points:

- Every one of the spec's five sample points lands on an **exact grid vertex** of the Claim's
  0.5-unit grid: (-15,14)→grid(34,92), (24,25)→(112,114), (-13,-10)→(38,44), (18,11)→(100,86),
  (0,12)→(64,88). At a grid vertex, bilinear and barycentric interpolation are identical by
  construction, and the two samplers were measured **bit-identical** at all five (delta exactly 0).
- The real cause is at `(-13, -10)`: the hero is **displaced** there. Desktop probe: teleport
  target z = -10, hero settles at z = **-10.40**. The harness then compares the hero's Y at its
  ACTUAL position against `terrainVisualY` at the REQUESTED one, so the mismatch is positional.
- The symptom alternates run to run with frame timing: when the displacement exceeds the 0.01
  tolerance the test hangs at `waitForFunction` (`:92`) for the full 60 s; when it settles inside it,
  the test reaches `:100` and fails the `toBeCloseTo` with ~0.0214.

Attribution by revert-run-reapply on the same dev server: main's sampler produced the **identical**
timeout on desktop-chrome and on mobile-chrome. Not caused by this change; the assertions were left
exactly as they are.

## 5. Separate finding — F-THTS-1: two guards are silently not running

`package.json`'s `test:node-guards` ends:

```
... && node scripts/nul-audit.mjs scripts/shared-atlas-plugin.test.mjs scripts/gltf-loader-usage-guard.test.mjs
```

`scripts/nul-audit.mjs` reads only `--quiet` from argv (`:28`) and otherwise walks `git ls-files`
(`:99`), so those two filenames are **inert arguments**, not tests. `shared-atlas-plugin.test.mjs`
and `gltf-loader-usage-guard.test.mjs` have never executed in this battery — including the
shared-atlas slice's own guard. They belong on the `run-node-guards.mjs` list where this task's test
was appended. Not fixed here: relocating another slice's two entries is outside this task's
`package.json (list append)` firewall.

## 6. Files

| File | Change |
|---|---|
| `src/world/Terrain3dClaimPilot.ts` | `bakeHeightGrid` bakes the per-cell diagonal from the index buffer and interpolates barycentrically; exported so a node guard can hold the real thing. +63 / -6, one function. |
| `scripts/terrain-height-sampler.test.mjs` | new — the centroid sweep, the diagonal-is-read proof, the malformed-topology rejections. |
| `package.json` | one filename appended to the single `run-node-guards.mjs` invocation. |
| `artifacts/terrain-height-triangle-sampler/**` | this file, the four screenshots, node-test and build logs. |
| `tasks/BACKLOG.md` | one row. |

Untouched, as the firewall requires: the sim, `src/world/Terrain.ts`'s height-source API, the GLB
files, and every assertion in `e2e/terrain3d-claim-pilot.spec.ts`.
