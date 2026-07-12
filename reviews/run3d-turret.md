# Review — run3d-09-turret (RUN-3D buildables ladder, slice 09)

**Slice/branch/tip:** run3d-09-turret · `lane/m4` `044749e3` (`runner(lane-b): run3d-09-turret.md`) → drained to main by s448.
**Verdict:** MERGE — clean sibling-union graft, gates green, canon-safe.

## What it does
Adds a 3D Turret model to the RUN-3D proving-ground (`?run3dPilot=`-gated infrastructure, invisible in a plain boot). One registry entry (`turret`) in `src/game/Run3dPilot.ts` points at a new `assets/pilots/run3d/turret.glb` (1,152 tris, one 512² material, base-center origin, footprint inside the turret's 1.2 overlap radius). When the flag is on, live turret instances mirror the sprite placements sharing one GLB fetch; demolition unmounts. Sprites remain the flag-off / lite / load-failure default. Frontier-tech silhouette per ADR-001: timber tripod + concentric induction coils + signal lens + crossed steam arcs — **no barrel, no firearm silhouette**.

## Evidence (native, merged tree)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 590ms |
| `e2e/run3d-turret.spec.ts` | green desktop+mobile (in the 25-pass battery) |
| `e2e/run3d-sluice.spec.ts` (adjacent run suite) | **8/8 isolated single-worker** (mobile p95 red under multi-worker load was a gate-battery CONTENTION false-red — fingerprint-matched to the documented pattern, cleared on isolated re-run) |
| `e2e/m1-01-claim-jumpers-death.spec.ts` (adjacent) | green |
| `_s106-prospector-boot-probe` | green, zero console/page errors, plain boot |
| Renderer p95 (gate re-render) | desktop ratio 0.863 · mobile ratio 1.144 — both under the 1.15 budget (4 instances = `Balance.turret.maxCount`, the legal capacity; the 12-instance ask is out of scope while maxCount=4) |

## Merge classification
Base `044749e3^` = `fea8d0d5` (an ancestor of main; main advanced only via STATUS-only commits since). `git merge --no-ff lane/m4` auto-merged clean:
- **All-new (auto-merge):** `assets/pilots/run3d/turret.{blend,glb}`, `e2e/run3d-turret.spec.ts`, `artifacts/run3d-turret/*`.
- **Sibling-union (1 line, no conflict):** `src/game/Run3dPilot.ts` registry gained the `turret` entry after `sluice` (base==ours was sluice-only, theirs added turret). Registry now `{ sluice, turret }`.

## Findings
- **F-1 (non-blocking, documented):** `run3d-sluice` mobile p95 fails under concurrent multi-worker load, passes isolated. This is the standing gate-battery contention false-red, not a regression from this slice (turret touches no sluice code). No corrective owed.
- No blocking findings. Infra slice, `?run3dPilot=`-gated → INVISIBLE in plain boot → **no gazette item** (correct per the GZ-01 filter law).
