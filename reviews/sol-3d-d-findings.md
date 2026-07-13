---
source: codex
project: Gold Rush
date: 2026-07-13
type: digest
branch: sol/map-rebuild-spike
---

# Session 3D-D — render-only Claim terrain spike

## Result

This spike proves that a Blender-authored, single-mesh terrain tile can replace the shipped flat visual without touching simulation. The deliverable is deliberately not wired into `src/`: the owner renders are the gate.

The strongest result is surface and bank legibility at the real run camera. The important limitation is equally clear: The Claim's fixed, straight water mask forces the outer banks to remain straight. A convincing S-curve can exist only as the deeper painted channel inside that band unless a future contract authors a different water mask first.

Owner verdict set:

- `artifacts/map-rebuild-spike/owner-run-camera-sculpted.png`
- `artifacts/map-rebuild-spike/owner-low-sunset.png`
- `artifacts/map-rebuild-spike/owner-ab-shipped-flat-vs-sculpted.png`

## Hard-law evidence

- `src/` is byte-untouched. The final GLB node extras declare `render_only=true`, `sim_surface=planar`, and `height_socket=Terrain.visualY`.
- The exported mesh authors game X/Z as Blender X/-Y and visual height as Blender Z. Blender's glTF conversion therefore lands at game `(X, visualY, Z)` without mirroring north/south. It does not add collision, traversal, line-of-sight, spawn, or placement data.
- The simulation river remains `z=-5..5`; visible shallows remain `±6.25`; the sole ford remains `x=-3..3`.
- The S-curve is only the deeper visual channel, ranging `z=-1.443..1.091`, wholly inside the fixed water band. The owner renders use the shipped straight `±6.25` visual-water surface and the seven shipped ford-stone positions.
- The central sluice aprons at `z=±6.5`, sampled every `0.5 m` over `x=-24..24`, stay gentle: maximum along-bank grade `0.0700`; maximum one-metre central difference across-bank `0.0819` north / `0.0875` south.
- The outer 512 mesh vertices are capped at `1.10 m`, under the current vista inner-edge ceiling of `1.18 m`; no high corner remains to create the earlier rectangular cliff.

## Export contract and cost

`scripts/reexport-pilot.sh` reports one mesh, one material, 32,768 triangles, zero cameras, and zero lights. The authoritative build-script export is deterministic and includes the safety extras:

- GLB: `8,114,684` bytes
- SHA-256: `4f65d76ec2b9f03d0af6fa0c76b53e1af3959b667fc093cb99c8b22facbfe6a4`
- vertices: `16,641`
- triangles: `32,768 / 60,000` budget
- material: one, metallic `0`, roughness `0.9`, no emission
- image: one embedded `2048×2048` PNG
- primitives/draw calls attributable to the asset: one
- animations/cameras/lights: zero

A fresh isolated build reproduced the GLB bytes, atlas bytes, and both owner-render pixel buffers exactly. The `.blend` file itself is path-metadata-sensitive, so its byte hash changes across directories; the parsed mesh/material/image contract does not. The generic recipe re-export verifies geometry and budget but omits custom extras because it does not pass `export_extras`; use this spike's build script as the authoritative export until a promotion deliberately preserves that metadata.

The parsed contract and seam probes are in `artifacts/map-rebuild-spike/verification.json`; source hashes are in `assets/pilots/map-rebuild-spike/the-claim-terrain-contract.json`.

## Same-camera evidence

The A/B uses the game's 42° vertical FOV, hero start `(0, 0.06, 12)`, camera offset `(0, 26.2, 18.3)`, and look target shifted `3.35 m` down-screen. A fixed `814×560` center crop removes HUD differences.

- shipped average luminance: `119.67525`
- sculpted average luminance: `122.73450` (`+2.56%`)
- shipped edge energy: `0.05760`
- sculpted edge energy: `0.10302` (`1.79×`)

These numbers locate the intended richer bank/surface read; they are not a pixel-parity gate. Full telemetry lives under `artifacts/map-rebuild-spike/telemetry/`.

## Findings for a wiring follow-up

### F-3D-D-01 — The planar law forbids gameplay perches

The tile rises to `2.238 m` internally, but Claim `simHeight` remains flat. Hero, opponents, buildings, pickups, and effects must all receive the same render-side `Terrain.visualY` placement. Nothing in this GLB may become collision, cover, line-of-sight, range, or pathing data. That prevents the long-range heroine from acquiring a visual perch that enemies cannot actually contest.

### F-3D-D-02 — Dynamic buildings need padded visual grounding

The Claim has no authored build-zone subset; every bank remains potentially buildable. A promotion must place each dynamic building at the existing padded `Terrain.visualY(x,z,base,padRadius)` result (or the equivalent established render owner), then verify all footprints at runtime. Do not flatten the sim, move pads, or make Blender geometry the placement validator.

### F-3D-D-03 — Keep shipped water as the runtime owner

The GLB is the land/river-bed visual. Water and ford stones in the verdict renders are temporary copies of the shipped runtime geometry and are removed before save/export. Promotion should keep `src/world/Water.ts` as the water/ford owner and overlay it at the established water level; it must not export or load a second gameplay-water mask.

### F-3D-D-04 — Perimeter cap is necessary but not sufficient

The 1.10 m boundary now fits under the current 1.18 m vista ceiling, but an attended runtime viewer still needs exact seam probes around all four edges and the four spawn approaches. If the existing vista and this grid differ locally, adapt the render seam or add overlap; do not change spawn coordinates or sim height.

### F-3D-D-05 — Gameplay-camera 3D remains deliberately subtle

Two fresh unprimed visual critiques both returned **REVISE**. Their common finding is that the low sunset view proves real displacement, while the run camera communicates most of the improvement through texture, bank shadow, and the ford stones. They also read the straight water band as engineered. The repeated contour texture and fake wavy water edge identified in the first pass were removed, but the straight outer bank is a simulation-truth constraint, not an art choice that this spike may evade.

### F-3D-D-06 — The final A/B is not an in-engine integration proof

The shipped side contains live props and actors; the Blender side is terrain plus exact ford stones. It proves camera/framing and land treatment, not final actor grounding, building contact, water animation, shadows, draw-call integration, or zero-console behavior. Those remain attended promotion gates after an owner verdict.

### F-3D-D-07 — The generic recipe does not preserve node extras

The final build-script GLB contains the render-only/planar/`Terrain.visualY` safety metadata. `scripts/reexport-pilot.sh` still passes the mandated mesh/material/triangle/camera/light check, but its generic operator call omits `export_extras`, producing a geometry-equivalent GLB without those node extras. Do not use that generic re-export as the final binary for this spike; either use the deterministic build script or deliberately extend the promotion export path in an attended follow-up.

## Recommendation

Use this as the technical proof for a terrain ladder, but do not promote this binary merely because it passes the export budget. The owner should judge whether the real-camera improvement is large enough.

If the goal is a genuinely new map rather than a richer Claim, the better next step is to author the new contract's water/build/spawn masks in the map editor first, then sculpt Blender terrain to those masks. That would permit a true S-curve, irregular banks, and stronger place identity without lying about sluice placement or enemy access. Rope/climb mechanics should stay out of this ladder; they reopen combat reachability and farming risks that this render-only approach deliberately avoids.

## Gate state

- deterministic Blender build: PASS for GLB, atlas, and render pixels; `.blend` bytes are path-sensitive
- recipe mesh/material/budget verification: PASS; generic recipe metadata preservation: documented limitation
- independent GLB parse: PASS
- triangle/material/texture budget: PASS
- planar/water/ford/apron/perimeter probes: PASS for the spike
- unprimed visual critique: REVISE, owner verdict required
- `src/` edits: none
- runtime/build/e2e gates: intentionally deferred to the attended promotion session

READY-FOR-GATES
