# Review — run3d-10-stockpile (RUN-3D buildables ladder, slice 10)

**Slice/branch/tip:** run3d-10-stockpile · `lane/e2-arsenal` `15d662de` (`runner(lane-c): run3d-10-stockpile.md`) → drained to main by s448.
**Verdict:** MERGE — sibling-union graft (one registry-line conflict, union-resolved), gates green.

## What it does
Adds a 3D Stockpile model to the RUN-3D proving-ground (`?run3dPilot=`-gated infra, invisible in a plain boot). One registry entry (`stockpile`) in `src/game/Run3dPilot.ts` points at a new `assets/pilots/run3d/stockpile.glb` (780 tris, 432 verts, one 512² material, base-center origin, grounded inside the authored 1.5×1.5 footprint). Flag-on: live stockpiles mirror the sprite placements sharing one GLB fetch; demolition unmounts. Sprites stay the flag-off / lite / load-failure default.

## Evidence (native, merged tree)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 511ms |
| Battery **single-worker 34/34** | `run3d-stockpile` 8/8 · `run3d-sluice` 8/8 · `run3d-turret` 8/8 · `m1-01-claim-jumpers-death` 8/8 · `_s106-prospector-boot-probe` 2/2 — zero console/page errors, plain boot |
| Renderer p95 | desktop ratio 1.006 · mobile ratio 1.034 — both under the 1.15 budget (2 instances = `Balance.stockpile.maxCount`, the legal capacity; the 12-instance ask is out of scope while maxCount=2) |

## Merge classification
Base `15d662de^` = `d160adaf` (on main). `git merge --no-ff lane/e2-arsenal`:
- **All-new (auto-merge):** `assets/pilots/run3d/stockpile.{blend,glb}`, `e2e/run3d-stockpile.spec.ts`, `artifacts/run3d-stockpile/*`.
- **Sibling-union CONFLICT, resolved:** `src/game/Run3dPilot.ts` — base was sluice-only, ours (post drain #1) had sluice+turret, theirs added stockpile after sluice. Both added a line at the same spot → content conflict. **Resolved by union:** registry now `{ sluice, turret, stockpile }`, no markers left, tsc clean confirms it.

## Findings
- No blocking findings. Ran the whole battery single-worker specifically to avoid the standing gate-battery contention false-red (which reddened sluice's mobile p95 during drain #1's multi-worker run); single-worker confirms all four run3d specs + m1-01 green.
- Infra slice, `?run3dPilot=`-gated → INVISIBLE in plain boot → **no gazette item** (correct per the GZ-01 filter law).
