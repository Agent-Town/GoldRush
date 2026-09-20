# F-BW-18 — Baron props detail report

## Outcome

The Baron's carried prop set now uses a deterministic three-mesh GLB: a banded timber-and-brass shoulder launcher with three exposed powder rockets, a separate iron-banded powder keg, and the matching detailed rocket used by the pooled in-flight presentation. The rocket's short ash/ember trail replaces the generic full-path wire presentation for Baron rockets only. Volley cadence, targeting, damage, impact timing, and the Baron sprite are unchanged.

Fresh unprimed visual acceptance: **PASS** on desktop and 390 px mobile. The reviewer found the three warm rockets legible in an intentional shoulder rack, the hip keg distinct from a stray stone, and the in-flight object readable as a banded orange-brown rocket with a short pale smoke/ember exhaust rather than a debug wire or teal rock.

## What “the stone” was

It was not a thrown boulder. The Baron inherits the generic wrecker carry marker because he is authored as a wrecker. `createClaimJumperAssets()` creates that marker as `new THREE.DodecahedronGeometry(0.23, 0)` under `sackGeometry`, and `carryMarkerVisible` rendered it for every active wrecker. At the run camera, that shared brown low-poly sack marker read as a stone.

The Baron now opts out of that generic marker and carries a dedicated **iron-banded timber powder keg** with visible staves, seams, brass seal, and a short teal fuse. Other wreckers retain the existing sack marker.

## Asset contract

| Prop | Triangles | Ceiling | Result |
|---|---:|---:|---|
| Launcher | 2,020 | 3,000 | PASS |
| Rocket | 876 | 3,000 | PASS |
| Powder keg | 704 | 3,000 | PASS |

- One 512×512 atlas, one material, one image, exactly three named meshes.
- GLB SHA-256: `88ae8e3e1c014337e4eca5ac19d331428c894b2a706c1a7df092afcf7b8843a7`.
- Atlas SHA-256: `fac23e02e7ae674c5e81e6a1660450e226a04f292332d6da8a1fac7ee13b9e84`.
- Saved `.blend` reopen and re-export is byte-identical.
- Builder: `assets/pilots/baron-props-3d/build_baron_props.py`.
- Machine-readable proof: `assets/pilots/baron-props-3d/baron-props-asset-contract.json`.

The GLB loader validates the named meshes, shared material, and exact triangle counts before replacing the existing placeholder group. On load failure, the old placeholder launcher and the pooled fallback rocket remain available.

## Performance

Measured with the existing Baron beauty harness during live mid-volley play. The acceptance ceiling is no more than +15% p95.

| Viewport | Before p95 | After p95 | Delta | Result |
|---|---:|---:|---:|---|
| Desktop 1280×800 | 10.3 ms | 10.3 ms | 0.00% | PASS |
| Mobile 390×844 | 9.8 ms | 9.9 ms | +1.02% | PASS |

The new presentation remains pooled: 16 rocket instances and two short trail puffs per active rocket. It adds no dynamic lights and reuses the existing Baron impact/muzzle-flash light budget.

## Verification

- `npm run build`: PASS.
- `git diff --check`: PASS.
- `e2e/lane-baron-props-detail.spec.ts`, desktop + mobile: 2/2 PASS.
- New prop spec plus existing `e2e/057-baron-rocket-cart.spec.ts`, desktop + mobile: 14/14 PASS.
- `e2e/beauty-baron.spec.ts -g 'shot 3'`, desktop + mobile: 2/2 PASS.
- `e2e/release-frontier.spec.ts`: 6/6 PASS.
- `playwright.release.config.ts`: 28/28 PASS.
- `playwright.release-base.config.ts`: 4/4 PASS.
- `e2e/e1-baron.spec.ts`: 20/22 PASS; both projects stop at the same pre-existing contract-board census assertion on line 350. The test expects five E1 cards, while the current roster renders six after Drill Yard joined the chapter. All other 20 Baron cases pass. Existing e2e files are outside this task's touch-only boundary and were not edited.

The independent `codex review --uncommitted` run completed the build and 14 targeted checks above without surfacing a code finding, but did not return a final verdict because it recursively launched another review; that recursive process was stopped. This report does not treat it as a clean review verdict.

## Evidence

- Before: `artifacts/baron-props/before/`
- After: `artifacts/baron-props/after/`
- Compact carried-prop and in-flight boards: `artifacts/baron-props/comparison/desktop-props-and-flight.png` and `mobile-props-and-flight.png`
- Exact mid-volley side-by-sides: `artifacts/baron-props/comparison/*-mid-volley-*-side-by-side.png`
- Perf JSON: `artifacts/baron-props/{before,after}/*-mid-volley-perf.json`

The repository comparison helper could not start because its existing `pixelmatch` dependency is absent. The comparison boards and numeric pixel telemetry were therefore produced with the installed ImageMagick tools; no dependency was added for this task.
