# B5 findings — render height is still coupled to gameplay state

**Branch:** `sol/terrain-authored-grid`
**Verdict:** Open, out of B5 territory. The authored grid has no simulation sampler or writer; no `Game`, entity, multiplayer, or `src/sim` code was changed. Existing consumers nevertheless reuse rendered `y` in two gameplay-owned paths.

## B5-MP-01 — Render-only `y` is part of the canonical multiplayer hash

**Evidence**

- `src/game/Game.ts:4133-4136` positions actors with `terrainVisualY(...)`, and `src/entities/Enemy.ts:1010-1012` likewise derives the enemy group's rendered `y` from the visual terrain.
- `src/game/Game.ts:1632-1670` serializes hero, actor, and enemy `y` coordinates in `multiplayerStateHash()`. Therefore enabling an authored visual layer can change the canonical hash even while every `terrainSim(...)` sample and authoritative planar coordinate stays byte-identical.
- B5's granted territory is `ContractFamilies.ts`, `Terrain.ts`, and `src/editor`; the correct hash owner is outside that grant.

**Impact**

Peers using the same valid document remain deterministic, but B5 cannot honestly assert that the current canonical multiplayer hash is identical with and without a render-only authored layer. Its slice gate asserts the narrower invariant it owns: the simulation-height fingerprint is unchanged.

**Minimal resolution**

The lockstep owner should remove render-derived `y` values from the canonical simulation hash (or replace them with authoritative simulation height/planar state), then add an A/B hash assertion for a valid authored layer. Resolve this before treating the authored visual document as compatible with the final lockstep contract.

## B5-MP-02 — Scripted rail arrival uses rendered `y`

**Evidence**

- `src/entities/Enemy.ts:425-480` moves scripted rail enemies toward planar headings, then reapplies `Terrain.visualY(...)` after movement.
- `src/entities/Enemy.ts:851-860` decides whether a scripted waypoint was reached with three-dimensional `distanceToSquared()`, while scripted targets retain `Balance.enemy.groundY`.
- `src/entities/Enemy.ts:1010-1012` puts the authored visual delta into the enemy group's `y`. A nonzero delta can therefore keep the 3D arrival distance above a planar step forever, causing overshoot or oscillation around a waypoint.

**Impact**

The B5 layer itself does not enter `TileHeight.simHeight()`, but the existing rail movement path makes the rendered coordinate behaviorally significant. The slice's no-spawn substrate test cannot prove authored terrain is behavior-neutral for scripted enemies.

**Minimal resolution**

The entity owner should make scripted arrival planar (`x`/`z`) or compare against a target with the same render height, then add an authored-layer rail-route regression. This belongs with the lockstep/entity seam, not in B5's terrain decoder.
