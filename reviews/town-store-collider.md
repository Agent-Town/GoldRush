# town-store-collider — the store at the town's top is solid now (F-E1W-3)

**Slice:** `lane-town-store-collider` · **branch:** `lane/m4` · **commit:** `907d5310` · **base:** `839a0d7a`
**Drained:** s1181 fire, 2026-07-28 · **Verdict: MERGE**

## What it does

Owner's E1 public walk, 2026-07-28: the hero standing **inside** the General Store near the
tailor's wagon. Root cause, verified at source rather than taken from the report:

`TownScene.ts:551` asked `shellAt(this.visibleBuildings, …)`, and `visibleBuildings` is
`earnedTownBuildings(territory)` (`:298`) — buildings unlocked by **progression**. But the town 3D
pilot promotes certain buildings' GLBs regardless of progression: on load it does
`scene.add(model)`, hides the shell, and records the id in `canvas.dataset.town3dPilotLoadedIds`
(`TownTavernPilot.ts:377`). So a **real, visible building stood where the collision test still saw
an unearned lot** — General Store below territory 2, Chapel below territory 3.

`shellAt` now scans all `townBuildings` and admits a building if it is either earned **or** its id
is in the loaded-model list. Solidity is bound to *"the model is actually in the scene"*, which is
the correct invariant: solid iff visible.

✓ **The low-tier path is correct by construction, not by luck.** When no GLB loads, an unearned
building is drawn as a **survey plot** (`TownScene.ts:584`) — an empty lot, intentionally walkable,
per the census. There is no configuration in which a visible building is walk-through.
✓ **It is the normal-play path, not a debug hook** (Mistake #10): the dataset is written inside the
GLB `onLoad` callback, synchronously with `scene.add(model)` and `shell.visible = false`.

### Census (full-fix law — the master required every building, not just the store)

| Town object | Collider before | Result |
|---|---|---|
| Tavern · Claim Office · Schoolhouse · Assay Office | Yes | Unchanged |
| **General Store** | **Missing below territory 2** | **Fixed on GLB load** |
| **Chapel** | **Missing below territory 3** | **Fixed on GLB load** |
| Stamp Mill / Dynamo Hall | Yes, while present | Unchanged |
| Pan Monument | Yes | Reverified |
| Wagons ×3, fences ×4, cacti ×3, trough, lanterns ×5, Pony Express plot | Yes | Unchanged |
| Era props | 24 solid types / 34 placements | Unchanged |
| Motor roadway / empty survey plots | Intentionally walkable | Preserved |

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.32 s** |
| `e2e/never-trap.spec.ts` | **6/6 passed**, desktop + 390px mobile, 38.5 s |
| Zero console/page errors | asserted by the spec's own `expect(errors).toEqual([])` |
| Screenshots | `artifacts/town-colliders/{desktop,mobile}-chrome-walk-probe.png` |

Gated on **scratch port 5234, external server** (Mistake #12).

### Merge classification — this one needed a real 3-way graft

`e2e/never-trap.spec.ts` + `artifacts/` were **LANE-TOUCHED only**. `src/town/TownScene.ts` was
**MAIN-MOVED**: `1f36b174` (the intake commit that queued this very task) rewrote two prompt labels
at `:1273` — *"opens soon"* → *"the registrar is in"* / *"the board is warm"*. Both sides started
from the same blob `ba6b16f3`, and the hunks are disjoint (`:551`/`:2716` vs `:1273`), so the lane
diff was applied with `git apply -3` and **verified by probe afterwards**: the collider fix is at
`:554` and both of main's labels survive at `:1276`/`:1281`. Not a blind copy.

⚠️ Only `907d5310` was taken. `lane/m4` also carries `c97062be` (the cp04 charter-name STOP, whose
report already merged as `c2d1b690` in s1180).

## The test is the strongest part of this slice

The spec did not merely keep passing — it was rewritten to fail on the reported bug:

- the fixture now boots at **`territory: 0`** (was `3`) — *the exact locked state where the store
  and chapel were walk-through*;
- it polls `data-town3d-pilot-loaded-ids` until it contains **`general_store` and `chapel`**,
  proving the models load while the buildings are unearned;
- it loops over **every** town building asserting north-face solidity **and** never-trap
  depenetration, instead of the single hard-coded chapel case it replaced.

That is the full-fix law enforced by the gate rather than promised in a report, and it would have
caught the owner's screenshot.

## Findings

- **F-1181-9 (bookkeeping).** No goal leaf existed for this master (§3.0 returned `? UNKNOWN`);
  registered in this drain commit. Fourth instance this fire — the three attended-authored masters
  queued at 19:19–20:21 all skipped the Goal Registration Law. See the s1181 handoff.
- **F-1181-10 (non-blocking, noted for the next reader).** The runner reported that **independent
  review was unavailable — the installed Codex CLI is too old for the required `gpt-5.6-sol`.**
  That is a factory-tooling gap, not a defect in this slice, and it means the runner's self-review
  step silently did not happen here. Worth one look at the CLI version before it quietly degrades
  other lanes' self-checks.
