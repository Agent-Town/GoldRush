# town-zoom — see the inhabitants close up

- **Slice:** `lane-town-zoom` (owner morning triple, 2026-07-29, item 1)
- **Branch / tip:** `lane/m3` @ `e834860a` ("runner(lane-a): lane-town-zoom.md")
- **Merge base:** `0bd46e55` (2026-07-29T04:01+07, ~4 h stale)
- **Merged to main as:** see the drain commit that carries this file
- **Drained by:** s1203 fire
- **Verdict:** ✅ **ACCEPT** — merged.

## What it does

The town camera gains a real zoom range. A wheel notch (desktop) or a two-finger pinch
(mobile) now changes how close the town reads, the default framing starts one notch
closer than before, and townsfolk sprites stay crisp when magnified (nearest filtering +
anisotropy ≥ 4, applied once per texture in `TownActorRuntime.update`). Zoom is exposed to
tests through `__GR_TOWN_DIAGNOSTICS__.camera` (`currentDistance`, `framingDistanceScale`,
min/max, and a `setZoom`), and `heroRenderedHeight()` now accounts for `camera.zoom` so the
diagnostic keeps meaning what its name says.

Mechanically the slice does **not** add input handling. It adds a town-specific mapping
from the shared controller's `distanceScale` to a framing scale in `[0.36 … 1.1]` (default
`0.85`), applied as a perspective `camera.zoom` in `syncTownZoomProjection()`. That is the
right shape: the rig keeps owning distance, the town keeps owning its own framing range.

## 🚨 F-1203-1 — THE MASTER'S STATED PREMISE IS FALSE AT SOURCE (non-blocking; the work is still right)

`tasks/lane-town-zoom.md:4` justifies the task with: *"the town camera has NO zoom input at
all (verified: no wheel/pinch/distance handling in TownScene.ts)."*

✓ **Refuted by reading main before merging.** `main:src/town/TownScene.ts` already imported,
constructed, updated and disposed a `CameraZoomController` (lines 10, 283, 405, 433, 488,
2148), and `main:src/systems/CameraZoomController.ts` already bound **wheel** (`:38`, `:78-86`)
**and** two-finger **pinch** (`:39-40`, `:89-106`), clamped to `Balance.camera.zoom.min/maxDistanceScale`
and **persisted per scene** via `saveCameraDistanceScale('town', …)` (`:157`). Wheel and pinch
zoom in town were not missing.

**Why this is a finding and not a rejection:** the owner's words were *"The zooming **and size**
of the characters in town… Things still feel small in Town."* That is a complaint about
**range and default framing**, not about absent input — and range/default framing is exactly
what this slice changes. The remedy fits the symptom even though the diagnosis was wrong.
➡️ *Refuting a report's mechanism does not refute its symptom.* The hazard worth recording is
that a future task written from this master's WHY would go looking for input plumbing that
has existed all along.

## 🔻 F-1203-2 — the acceptance ratio is measured against a reconstructed baseline (non-blocking)

`e2e/town-inhabitant-zoom.spec.ts:33-34` asserts the owner's "2.5–3× today's size" as
`closeHeight / (defaultZoom.heroRenderedHeight * 0.85) ∈ [2.5, 3]`. The `0.85` reconstructs
the pre-slice framing from the new default, which is correct **today** — but it is the same
constant the implementation uses (`TOWN_ZOOM_DEFAULT`). If the default framing is ever
re-tuned (and the owner may well ask for that — see below), the test's notion of "today's
size" silently moves with it and the assertion cannot fail for a default change. A literal
pre-slice constant, or a value read once from a fixture, would separate the two. Cheap; belongs
with whoever next re-tunes the default.

## ⚠️ The acceptance test here is the OWNER'S EYE, not the clamp numbers

Scope 1 states its bounds as judgements — *"reads ~2.5-3x today's size"*, *"one notch
CLOSER"*. The spec encodes them, but whether `TOWN_ZOOM_MIN = 0.36 / DEFAULT = 0.85 / MAX = 1.1`
actually answers *"I would like to see the inhabitants close up"* is Robin's call. Screenshots
at min/default/max, both projects, are in `artifacts/town-zoom/` for exactly that read.
A green spec is not the verdict on this one.

## Evidence (measured by me on the merged tree, not inherited from the run)

| Gate | Result |
|---|---|
| `tsc --noEmit` | **exit 0**, 3.97 s |
| `vite build` | **exit 0**, 1.92 s — `index-…-diet-fd5a3653.js` 1,310.72 kB / gzip 311.12 kB |
| Own spec `town-inhabitant-zoom` | **exit 0 — 2/2 passed** (desktop-chrome + mobile-chrome), 7.4 s |
| Zero console / page errors | asserted **inside** the spec at `:59` (`expect(errors).toEqual({consoleErrors:[],pageErrors:[]})`), both projects |
| Plain boot (Mistake #10) | spec boots `/?tier=lite` — **no `?debug`**, so the feature is proven on a door a player can reach |
| Adjacent: full `e2e/town-*` family | 158 tests, **117 passed / 41 failed**, 14.8 m |
| Adjacent: `town-scale-zoom` | **PASSED** both projects — the suite most exposed to the `heroRenderedHeight` change |

### The 41 reds are PRE-EXISTING — proved by a both-arms control, not by assertion

12 of the 13 failing spec files are already in `logs/suite-red-inventory.md`
(`town-{assay-office,chapel,claim-office,general-store,plate,plaza-props,schoolhouse,tavern}-blender`,
`town-t{1,2,4,5}`). The 13th, `town-ts-02b-facades`, is **not** listed and failed at
`walkToBuilding` → `activePrompt` poll (`:70`) — a plausible victim of a camera change, so I
did not wave it through: re-run alone it passed **4/4**, i.e. a load flake under the 158-test
serial run, not a deterministic red.

To settle the rest by measurement rather than by inventory lookup, I ran a fixed subset
(`town-plate-blender` + `town-t1-square` + `town-scale-zoom`) on **both arms**, same box, same
scratch server, same command:

| Arm | Result |
|---|---|
| **Merged** (`TownScene.ts` @ `82ebd440`) | **6 failed / 6 passed**, 103.9 s |
| **Clean main** (`TownScene.ts` restored to `2aa8bd73`) | **6 failed / 6 passed**, 103.2 s |

Identical — same six test ids, same assertion shapes (`toContainText` on t1-square, the two
plate-blender GLB/LITE tests), same runtime. **The merge changes the red set by zero.**
(Method note per s1202's lesson: I measured the rate on both sides instead of blaming the
merge, and the control reverted the **subject** — `TownScene.ts` — not the tests.)

## Merge classification

Base `0bd46e55`; main tip at merge `4408aaae`. The tip commit's own diff is 10 paths:

| File | Class | Resolution |
|---|---|---|
| `src/town/TownScene.ts` | **LANE-TOUCHED only** | Clean apply — proved by blob hash, not by log: base = `2aa8bd73`, **main = `2aa8bd73`** (main never moved it since base), lane parent = `2aa8bd73`, lane = `82ebd440`. No graft. |
| `e2e/town-inhabitant-zoom.spec.ts` | **NEW** | free |
| `artifacts/town-zoom/*.png` (8) | **NEW** | free — the run's own screenshots, committed from the index as the runner produced them |

⚠️ **Merged path-scoped, deliberately NOT `git merge --no-ff`.** `lane/m3` was **3 ahead**: the
tip plus `fce4e7d4` (m3-05f, already shipped as `9bde2802`) and `b39edde1`. A branch merge would
have re-landed shipped work and dragged the 4 deliberately-unmerged PNGs the lane is known to
hold. Only the tip's 10 paths were taken. `lane/m3` therefore stays **falsely ahead** — a
tip-graft safe-dupe, loss-free to reset.

## Findings

- **F-1203-1** — master's "no zoom input at all" premise refuted at source. Non-blocking (symptom real, remedy fits). Recorded above; no corrective task — the slice supersedes it.
- **F-1203-2** — acceptance ratio reconstructed from the implementation's own constant. Non-blocking rider for the next re-tune.
- **F-1203-3 (ⓘ, not this slice's fault)** — running the town family regenerates ~110 tracked artifact PNGs under `artifacts/town-*`/`town3d-*`. They are gate side effects, not slice content; I reverted them rather than committing them. Anyone gating this family should expect the same churn and path-scope their add.
