# Sol findings — ED-04 gizmos

Branch: `sol/ed-04-gizmos`

Base: deployed `origin/main@8deaaba8`

Verdict: **BLOCKED — the Hand brief names gestures that the current descriptor/runtime contract cannot truthfully perform. No product code written.**

## F-ED04-01 — “spawn markers” has two incompatible owners

Root wave approaches are only the ordered enum list `tileParams.lanes.spawnEdges` (`src/meta/ContractFamilies.ts:403-407`). They have no position to drag; `Terrain.spawnEdges()` returns four hardcoded center points regardless of that list (`src/world/Terrain.ts:196-203`).

The only placed spawn markers are variant-local `twist.enemyRoster[].spawnGates` with `{edge,x,z}` (`src/meta/ContractFamilies.ts:241-248`), consumed as exact spawn centers plus tangent jitter (`src/systems/WaveSystem.ts:405-421, 551, 762-769`). Hill Mine ships four of them (`assets/contracts/epoch-2-steamworks/contracts.json:134-175`).

**Recommended ruling:** ED-04 “spawn markers” means the positional variant `spawnGates`; ED-03 remains the owner-facing editor for categorical root edges. A gate moves tangentially along its declared edge. It has no honest resize or rotation.

## F-ED04-02 — fixture rotation is descriptor-dead

Night Shift carries seven `prePlacedBuildables` with `rotationSteps` (`assets/contracts/epoch-1-frontier/contracts.json:124-131`). Game forwards those steps into `BuildSystem.placeFree()` (`src/game/Game.ts:2505-2512`), but the lantern dispatch drops them (`src/systems/BuildSystem.ts:1260-1267`). `LanternPostPool` stores positions only and renders every asymmetric arm/lantern on the positive-X side (`src/systems/BuildSystem.ts:2125-2202, 2249-2269`).

The same value is not suspend-safe: building capture records non-palisade rotation as zero (`src/game/RunSuspend.ts:978-1000`). An editor rotate handle would therefore rotate only its survey icon; the rebuilt live scene and a restored run would erase the edit.

**Minimal unblock:** either assign the lantern rotation + suspend seam to its runtime owner before ED-04, or explicitly rule fixture rotation out of ED-04 v1. Session B does not claim `BuildSystem` or `RunSuspend`.

## F-ED04-03 — “props” and universal handles need a capability ruling

The only per-instance descriptor props are `prePlacedBuildables` fixtures (`src/meta/ContractFamilies.ts:367-374`). Rocks/stumps are hardcoded placements, while scatter descriptors carry aggregate density/counts and produce seeded instances; neither exposes a per-prop record to select (`src/world/props.ts:85-113`; `src/world/Scatter.ts:76-93, 273-300`).

The four named families do not share transform fields:

| Family | Honest descriptor operations |
| --- | --- |
| Build-zone rectangle | move; four-corner resize |
| Spring-pond circle | move; radius resize |
| Variant spawn gate | tangent move only |
| Pre-placed fixture | move; quarter-turn rotate once F-ED04-02 lands |

Zones are axis-aligned, ponds are circles, gates are points, and fixtures have no scale. Adding editor-only angles or sizes would create bytes the 069 boundary rejects.

**Recommended ruling:** “props v1” means `prePlacedBuildables`, not procedural scenery, and handles are capability-specific rather than fake controls on every family.

## F-ED04-04 — movable families do not yet share ED-03’s semantic placement gate

The 069 boundary gives build zones claim/dry-bank semantics, but water sources receive only broad shape/radius checks; spawn gates and fixtures receive only template-shaped generic number checks (`src/meta/ContractFamilies.ts:1015-1085, 1166-1285`). `spawnGates[].edge` is not in the descriptor enum table. A fixture gesture can therefore pass 069 and then silently fail `placeFree()` on bank/overlap rules (`src/systems/BuildSystem.ts:680-700`); a gate can be accepted off its declared edge; a pond can extend beyond the claim.

Duplicating `BuildSystem`/Terrain placement logic inside the editor would violate the same one-owner law that blocked ED-03.

**Minimal unblock:** grant the existing document boundary narrowly for additive placement reasons and rule the v1 authored checks: pond containment, known/tangent spawn-gate edge, in-claim fixture position, and the canonical fixture bank/overlap predicate’s owner. If exact fixture validity needs a new shared pure seam, assign that seam before the gizmo writes fixture coordinates.

## Ready architecture after ruling

ED-04 needs no second canvas, history, document, or validator. Add Select mode to the existing Terrain Brush survey canvas; pointer-down selects one typed descriptor reference, pointer-move previews one cloned descriptor, and pointer-up calls the existing `onCommit` exactly once. Pointer-cancel drops the draft. The B5/B6 transaction then creates one snapshot and crosses ED-03’s 069 boundary before reload (`src/editor/TerrainBrush.ts:59-204`; `src/editor/DescriptorInspector.ts:84-135, 398-429`).

Touch targets should be semantic overlay controls or use a minimum 22-CSS-pixel hit radius, producing a 44-pixel diameter independent of the 360-pixel backing store. The existing `touch-action:none`, Pointer Events, capture, and mobile 44-pixel control law remain the owner (`src/editor/descriptor-inspector.css:104-150, 233-245`).
