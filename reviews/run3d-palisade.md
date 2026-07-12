# Review — run3d-08-palisade (RUN-3D buildables ladder, slice 08)

**Slice/branch/tip:** run3d-08-palisade · `lane/m3` `6cda5711` (`runner(lane-a): run3d-08-palisade.md`) → drained to main by s448.
**Verdict:** MERGE — sibling-union + a general refactor of the run3d module body, gates green (siblings unmodified-green).

## What it does
Adds a 3D Palisade model to the RUN-3D proving-ground (`?run3dPilot=`-gated infra, invisible in a plain boot). `palisade.glb` (396 tris, one 512² material, base-center origin, 0.46×3.00×1.04 bounds). Beyond adding the `palisade` registry entry, this slice **refactors the shared `installRun3dPilot` body**: the single scalar `trianglesPerInstance` becomes a per-id `triangleCounts` Map so the `ready` payload sums real per-building triangles (a general improvement — all buildings benefit). It also adds palisade-specific per-instance handling: material cloning, rotation + per-post color copied from the existing `PalisadePosts` InstancedMesh, and material disposal on unmount/dispose. Flag-off / lite / load-failure keep the sprite pool default.

## Evidence (native, merged tree)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 505ms |
| Battery **single-worker 42/42** | `run3d-palisade` 8/8 · `run3d-sluice` 8/8 · `run3d-stockpile` 8/8 · `run3d-turret` 8/8 · `m1-01-claim-jumpers-death` 8/8 · `_s106-prospector-boot-probe` 2/2 — zero console/page errors, plain boot |
| Renderer p95 (12 instances) | desktop ratio 1.089 · mobile ratio 1.106 — both under the 1.15 budget (palisade cap allows the full 12-instance sample) |
| Sibling non-regression | turret + stockpile + sluice specs **unmodified-green** under the refactored body — the Map-based tri count uses `triangleCounts.get(id)`, populated for every loaded template, so no sibling depends on the removed scalar |

## Merge classification
Base `6cda5711^` = `4e396d08` (sluice-only registry, old scalar tri logic — an ancestor of main). `git merge --no-ff 6cda5711` auto-merged **with no conflicts**:
- **All-new (auto-merge):** `assets/pilots/run3d/palisade.{blend,glb}`, `e2e/run3d-palisade.spec.ts`, `artifacts/run3d-palisade/*`.
- **`src/game/Run3dPilot.ts` (clean 3-way):** the registry block auto-unioned because 08 inserts `palisade` *before* `sluice` while turret/stockpile were appended *after* → no textual overlap; result `{ palisade, sluice, turret, stockpile }`. The body refactor applied cleanly because main's body was unchanged since base (turret/stockpile were registry-only additions), so ours==base for the body and git took theirs.

## Findings
- No blocking findings. This is a shared-module refactor (broader than the "adjacent additive line" sibling-union), so it was gated with the FULL sibling battery single-worker to prove turret/stockpile/sluice stay green under the new body — they do (42/42).
- 14-lantern-post is currently running on lane/m3 on top of `6cda5711`, so it inherits this refactored body and will drain as a clean sibling-union next.
- Infra slice, `?run3dPilot=`-gated → INVISIBLE in plain boot → **no gazette item** (correct per the GZ-01 filter law).
