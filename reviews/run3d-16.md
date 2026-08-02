# run3d-16 — RUN-3D rider 16: rail elements in 3D

- **Slice:** `run3d-16-rail-elements` (FIRE-AUTHORED s1389)
- **Branch / tip:** `lane/e2-arsenal` @ `47f71fdc9b0bfb338d21cddd2b47612f5c9e798e`
- **Merged to main:** `32cfc878d9945ca1a0c60d35b2a8e0500e1c8530` (s1391, path-scoped graft, 16 files / 415 insertions)
- **Gated in:** detached worktree `worktrees/gate-s1391` (§3.0b — main's working tree never held undecided content)

## VERDICT: MERGED

Every gate green except one pre-existing red that I **control-proved is not this slice's** (see Evidence).

## What it does

Bakes one straight rail element (`assets/pilots/run3d/rail-element.glb`, from `assets/processed/ter-rail-elements-r0c0.png`) and instances it **once per tie** over the existing procedural rail layer, oriented by each tie's own `yaw`. `RailPathDiagnostics` gains a purely additive `ties: Array<{x,y,z,yaw}>` field; `Run3dPilot` gains a `rail_element` registry entry plus a mount loop that builds a single `THREE.InstancedMesh` at `RenderLayers.groundDecals`, rebuilding the instance buffer only when the tie count changes and disposing it on `dispose()`.

**Where does the PLAYER see this in a plain boot?** *Deliberately nowhere yet.* `rail_element` is excluded from the `run3dPilot=all` selection alongside `gold_seam`, so a plain boot renders the unchanged procedural rails. This is scope item 3, and it is the direct lesson of F-1387-3, where rider 15 shipped a regression that turned 3D buildings off in every plain boot. The slice's own spec asserts the plain-boot path explicitly (`run3dPilotState === 'ready'`, procedural rails `active`, **zero** GLB requests).

## Evidence (all measured by me, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0 |
| `e2e/run3d-rail-elements.spec.ts` | **10/10** both projects, run **twice** (27.6 s / 28.1 s) |
| Registry-union control + six siblings | **64/64** (`gold-seam`+`sluice` 16, siblings 48) |
| Plain-boot oracle | `m2-05` **14/14** · `night3d-perf:98` green both projects |
| `test:node-guards` | rc 0 |
| Ties vs instances | **221 = 221**, desktop *and* mobile; exactly **1** GLB fetch |
| Own p95 ratio | **0.894** desktop / **0.698** mobile (bar 1.15) |
| Model | **132** tris (cap 800) · one **256×256** material · re-export byte-identical |
| Console/page errors | zero, desktop + 390 px (asserted in every test in the spec) |

Screenshots: `artifacts/run3d-rail-elements/desktop-chrome-rail-elements.png`, `mobile-chrome-rail-elements.png`.

### The one red — `night3d-perf:67` — is NOT this slice, and I did not inherit that claim

s1390 closed F-1389-1 by bisect, but the standing memory law is that *"pre-existing" needs a control run*, so I ran one rather than quoting one:

| Arm | ratio (desktop) | verdict |
|---|---|---|
| **Clean main** `5d6ef91b`, no slice | **1.6491** | FAIL |
| Main + this slice | **1.4701** | FAIL |

Same shell, same hour, same worker count. The slice's arm is **lower**, not higher. The red is F-1390-1, whose bar is crossed by the *denominator* improving.

## Merge classification

Base: `lane/e2-arsenal` forked before s1389's merges, so the raw two-dot diff shows six **MAIN-MOVED-ONLY** paths (`STATUS.md`, `tasks/BACKLOG.md`, `logs/*`, and a phantom deletion of `reviews/run3d-15b.md`). None were taken. I grafted only the **16 LANE-TOUCHED** paths, which are exactly the commit's own `--stat` and exactly the master's TOUCH-ONLY list. No conflicts; main had not moved any of the 16.

## Findings

- **F-1391-1 (🟡 non-blocking, filed):** `artifacts/run3d-rail-elements/instances-*.json` records `"layerDrawCalls": 1`, but that value is a **hardcoded literal** in `e2e/run3d-rail-elements.spec.ts` — it is never read from the renderer. Design point 3 ("one draw call for the rail-element layer") is therefore **true by construction but not gate-enforced**: I verified it by reading the code (a single `InstancedMesh` built from one geometry + one material, added once to the group), not from the artifact that appears to evidence it. *An artifact whose label asserts a measurement it never took will keep reading as proof.* Cheap cure: assert against `renderer.calls` deltas, or drop the field. Not blocking — the substance is correct.
- **F-1391-2 (🟡 non-blocking, filed):** the claim that the 3D renderer "is inside its own frame budget" rests on `night3d-perf.spec.ts:89` (absolute budget, 16.7 × 2 = **33.4 ms**) — but `:88` (the ratio) throws first, so **`:89` never executes for any contract whose ratio fails.** Its never having failed is not evidence that it passed; it is evidence it was never reached. The substance still holds (s1390 instrumented terrain3d p95 at ~15–23 ms directly), but this strengthens the case for F-1390-1 **rec (a)/(c)**: as written, the gate's *informative* assertion is unreachable behind its *broken* one.
- **Observation (not a finding):** the master's scope item 4 told the runner to read `window.__THREE_GAME_DIAGNOSTICS__?.rails.ties`. That coordinate is wrong — `rails` is nested under `terrain` (`src/game/Game.ts:4500`). The runner read the code and wrote `?.terrain.rails`. Correct call; noted so the next authored master cites the verified path.

## Firewall compliance

TOUCH-ONLY honoured exactly: 16 files, all listed. No existing `RailPathDiagnostics` field changed, re-ordered or removed; none of the ten footprint constants touched; `src/game/Game.ts`, `ContractFamilies.ts`, sibling `run3d-*` specs, `suite-red-inventory.md`, `STATUS.md`, `BACKLOG.md`, `goals.json` and `reviews/` all untouched by the runner. The other six rail sheet cells were not added.
