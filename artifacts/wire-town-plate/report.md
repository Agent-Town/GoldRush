# Wire Town Plate — gate report

- Plate contract: 1 mesh, 8,192 triangles, 1 material, 44 × 2.958 × 44 bounds, zero embedded lights/cameras.
- Runtime: mounts at plaza origin with a -0.002 Y nudge; painted ground hides only after a valid load.
- Planar law: no actor, hero, layout, or simulation code changed; three moving-newsie loop samples captured per project.
- Performance: desktop p95 ratio 1.0000; mobile p95 ratio 1.0000 (limit 1.1500).
- Visual review: desktop/mobile owner `all` views show buildings, props, hero, and cast above the plate without visible pad z-fighting.

| Mode | Plate state | Visible ground |
| --- | --- | --- |
| Flag off | `off` | painted |
| FULL `plate` / `all`, loading | `loading` | painted |
| FULL, valid GLB | `loaded` | plate GLB |
| FULL, invalid/load failure | `failed` | painted |
| LITE | `lite` | painted |
| Disposed | `disposed` | painted restored |

## Gates

- `npx tsc --noEmit` — green
- `npm run build` — green
- `npx playwright test e2e/town-plate-blender.spec.ts` — 6/6 green, desktop + mobile
- `npx playwright test e2e/town-tavern-blender.spec.ts e2e/town-general-store-blender.spec.ts` — 14/14 green, desktop + mobile
- Zero console/page errors asserted by the plate suite.
