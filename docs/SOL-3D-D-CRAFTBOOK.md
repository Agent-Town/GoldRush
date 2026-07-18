# SOL 3D-D Craftbook

Durable notes for the next terrain sculptor. This is not a full asset ledger; the contracts and verdict boards remain the source of exact file truth. This records the craft rules that kept the work useful.

## 1. THE NUMBERS

Owner-verified program state at dormancy: 27 campaign maps / 145 landmark mount records verified.

Current `origin/main` asset-tree snapshot at this commission: 37 terrain contracts / 32 panorama contracts / 36 landmark pack contracts / 200 raw mount records. That larger number includes the original saga maps, variants, and later placeholder or expanded contracts; do not use it as the owner program count.

What 3D-D actually established:

- every run tile in the ten-era saga received render-only terrain treatment;
- panoramas became separate mounted GLBs rather than terrain extensions;
- mounted landmarks became data records in terrain contracts, with body ownership separated from sculpt ownership;
- mask-agreement became a gate, not an art preference;
- every serious visual claim needed a board at the real run camera, not just a pretty low-angle render.

## 2. THE CRAFT

Start from the painted tile, not from imagination. The best maps kept the shipped tile's route, banks, hard shadows, and value language, then lifted it into relief. When the sculpt ignored the paint, it looked like another game.

Composition rules that held:

- One dominant landform per map. A river bend, rail cut, crater rim, mesa, basin, ring road, or gorge should explain the contract before landmarks do.
- Regional cohesion comes from palette and mark-making, not cloned terrain. Reusing colors is good. Reusing silhouette is failure unless the gameplay contract explicitly says tile reuse.
- The run camera is the judge. A map that only reads from a low beauty angle is not done.
- Empty space is not automatically bad. Empty space is bad when it has no travel pressure, scar pattern, bank edge, rut, rubble, or sight rhythm.
- Landmarks should sit on prepared ground: pads, scars, approach roads, silt bites, anchor berms, or service clearings. Floating props are worse than no props.
- Desert means cacti and dry brush, not trees.

The Grit Law in practice:

- "Grit" is composition under pressure, not a dirt overlay.
- Roughness must follow use: cart ruts where traffic runs, tar stains where machinery leaks, scorch near fought-over sites, salt crust near failed water, patched care where people are still trying to live.
- Warm does not mean pleasant. Keep parchment warmth, but add deep shadow pockets, stained ground, scratched hatching, murky working water, and hard silhouettes.
- Avoid gore. The world is desperate, not horror.

Panorama lessons:

- The Painted Wall failure: a straight hard join between terrain and panorama reads as a stage backdrop. Fix it by sinking the ring behind an irregular distant ridge and adding a dusty haze transition band.
- The Ceiling failure: dense engraving stretched high on a cylinder reads like a lid. Fix it with vertical density falloff: busy near the horizon, nearly quiet parchment at the zenith.
- The Echo failure: mirrored cloud or ridge shapes repeat around the ring. Fix it with asymmetric quadrant edits. It does not need full unique 360-degree painting; it needs no obvious repeated landmark.

Mask-agreement discipline:

- The sim is planar. Collision, movement, spawns, build placement, sluice placement, fog, water classification, and pylon-site truth stay code-owned.
- Sculpted rivers must visually agree with the water mask. A beautiful river that covers buildable bank is wrong.
- Load-bearing zones must stay visually flat enough to explain placement. Canyon Works pylon-site sampling became the standard because it proved the art did not secretly fight gameplay.
- Water stays code-owned. The mesh can cut banks, beds, bars, shelf reefs, and channels; it must not become a second runtime water surface.

Budget reality:

- The stated budgets were generous. Whole tiles did not need 60k triangles when the camera rewarded silhouette, banks, ridges, and contact shadows more than dense tessellation.
- One atlas per terrain and one per panorama was enough when the atlas carried paint-derived hatching and value structure.
- Spend triangles on edges the player reads: bank lips, ridgelines, pads, road cuts, cliff shelves, crater rims, ring roads. Do not spend them on hidden flat interiors.
- Byte-identical re-export matters. If a helper script strips glTF extras, the asset is unsafe even if the render looks identical.

## 3. THE INTERLOCK

The clean split was:

- 3D-D owns terrain composition and mount transforms.
- 3D-C owns landmark body quality.
- The terrain contract is the handshake: `id`, `position`, `rotation`, `scale`, and eventually `asset`.

What worked:

- Empty `asset` fields were useful. They let 3D-D reserve composition without fabricating body paths before the pack existed.
- `mountInterlock: pending-3d-d` / `resolved-3d-d` made debt visible and sweepable.
- Per-map verdict boards kept mount placement honest at the camera angle the player actually uses.
- File replacement with stable mount ids let landmark quality improve without terrain churn.

Where it chafed:

- Pack merges and terrain sweeps often landed out of phase. That created repeat boundary work.
- Some maps had terrain contracts with placeholder mounts before body packs existed; others had body packs before terrain had canonical mounts. The process worked, but only because the sweeps were strict about not inventing missing assets.
- Raw counts can mislead. Verifier scope, campaign scope, terrain-contract count, and owner program count are not the same thing.

Rule for the next sculptor: if the body pack is absent, leave `asset` empty and say so. If the pack exists, mount it in the terrain contract and mirror the resolved state back to the pack contract. Never bake the landmark into terrain.

## 4. WHAT I'D CHANGE

Be blunter earlier about gates. If a mask file is absent, do not "interpret" prose into terrain. Stop that map and take the next unblocked one.

Keep the current simple file contract. Do not replace it with a database, registry service, or procedural mount DSL until the JSON files actually fail. They have not failed.

Make the board generator the product, not the afterthought. Every wave should create the same minimum comparison set: shipped/current A/B, run-camera verdict, mask-agreement overlay, panorama distance view, and mount board when landmarks are involved.

Track counts in one small generated report at each boundary. The hand-counting debt wasted attention.

Keep source ladders boring:

1. reuse an existing body;
2. derive from shipped paint;
3. build new only when the first two fail.

Do not chase photoreal terrain. The game wants engraved storybook relief: hard, readable, warm, scratched, and planar-safe.

## 5. RECALL TRIGGERS

Wake a 3D-D terrain session again when any of these happens:

- Twin Banks true-braid work unblocks through the water-mask engine capability.
- Owner playthrough polish returns on any sculpted map.
- A new run map lands with an authored mask table.
- A mounted landmark pack lands for a map whose terrain contract still has empty `asset` fields.
- Promotion wiring exposes a real `Terrain.visualY` mismatch at runtime.
- Any new era/style asks for terrain vocabulary not covered by the existing paint-derived atlases.

Dormant rule: absent one of those triggers, do not keep polishing terrain. The useful work is complete.
