# CP-00 editor spike harvest

Audited against `main@e1717949ee50119b81ad7c9e52b7cf59afd793a7` on 2026-07-17. The audit compared each branch's own commits and stable patches, not the broad tree of its stale base.

## Branch verdicts

| Branch | What it added over its base | Current compatibility | Verdict |
| --- | --- | --- | --- |
| `origin/sol/ed-02-terrain-brush@1c3a806d` | Review-only finding that a real spatial brush needed an authored descriptor grid, terrain consumer, variable paint shapes, and reload-safe history. | The finding is already merged byte-identically. Its missing seams were subsequently installed by the authored-grid substrate and ED-02 v2. | **RETIRE** — historical blocker evidence, no product patch. |
| `origin/sol/ed-02-brush-v2@ac14e160` | Raise/lower/smooth strokes, build-zone/pond/spawn-edge painting, bounded history, import/export integration, and editor-only UI state. | The tip is an ancestor of main. Main retains the feature and has since layered validator, gizmo, and palette work onto the same owners. Reapplying it would regress those additions. | **RETIRE** — already absorbed. |
| `origin/sol/ed-03-placement-validator@b82cd3d0` | Canonical descriptor reasons, `PlacementEditor`, and validated zone/spawn/briefing transactions. | The tip is an ancestor of main; `PlacementEditor.ts` is still blob-identical and the inspector/decoder retain its wiring and reasons. | **RETIRE** — already absorbed. |
| `origin/sol/ed-04-gizmos@35019d3b` | V1 zone/pond/spawn/fixture move handles, plus a later fixture quarter-turn and shared-placement validation follow-up. | V1 `720b14f9` is already on main. The later commit is stale: its full patch no longer applies, and it assumes every fixture has lantern rotation/overlap semantics. | **RE-LAND** — `f38cfb9d` ports the editor-owned quarter-turn only for lanterns whose template already carries `rotationSteps`; gameplay/meta validation remains a reported gap. |
| `origin/sol/ed-05-palette@9a6f0b83` | Native 44px color inputs for canonical terrain `tint` and `dampTint`, using the existing validated history transaction. | Both branch commits have patch-equivalent main commits; implementation, CSS, test, and finding blobs match exactly. | **RETIRE** — already absorbed. |

No branch qualified for a blind **HARVEST**. Four are already represented on main; ED-04 required a current-code re-land.

## Capability matrix

| Capability | State | Current truth |
| --- | --- | --- |
| Brush | **ON MAIN** | Bounded authored visual-delta raise/lower/smooth plus build-zone, spring-pond, and spawn-edge paint; one validated descriptor transaction per gesture with reload-safe undo/redo. |
| Palette | **ON MAIN** | Canonical terrain `tileParams.palette.tint` and `dampTint` have native color inputs. Independent water/scatter color sockets are **MISSING** from the canonical descriptor/runtime. |
| Gizmos | **RE-LANDED** | Zone move/corner resize, pond move/radius resize, tangent-only spawn-gate move, fixture move, and quarter-turn for lantern templates that already carry `rotationSteps`. Other fixtures remain move-only because the template-shaped descriptor gate cannot add durable rotation. |
| Validator | **ON MAIN** | ED-03 structural/placement reasons and editor panels use the canonical descriptor gate. Fixture dry-surface/overlap checks and the later full charter stamp/playability preflight are **MISSING**. |
| Inspector | **ON MAIN** | Recursive scalar editing, validated import/export, rejection display, history, placement panel, terrain brush, and palette controls all share the existing `?editor` inspector owner. |

## L2 gap map

1. **Fixture legality:** `ContractFamilies` currently validates fixture centers against claim bounds only. ED-04's follow-up tried to reuse `matchesPlacement()` and `overlapsExisting()`, but hard-coded beacon snap and lantern radius for every fixture. A separate gameplay/meta slice must build per-ID placement descriptors for lanterns, turrets, and sentry beacons, then prove shipped-contract acceptance. CP-00 does not touch that owner.
2. **Water/scatter palette:** no canonical descriptor fields or render consumers exist. Do not add editor-only controls; add them only with an approved schema/default/materialization law and runtime consumers.
3. **Terrain beyond render-side authoring:** the original ED-02 blocker is resolved for the ratified render-side, sim-untouched editor scope. Authored deltas still do not change `TileHeight.simHeight()`, by design. Gameplay/persistent terrain remains future architecture.
4. **Optional 3D terrain composition:** `terrain3dPilot` installs a runtime height source before authored visual deltas are sampled, so ED-02 marks and the optional GLB pilot do not yet compose. Default `?editor` is unaffected.
5. **Stamp readiness:** ED-03 explains structural placement failures, but CP-02 still owns the property-tested `stampCharter()` preflight for reachability, objectives, and budgets. CP-00 does not invent it early.
6. **Fixture descriptor coherence:** `ContractBuildableFixture` and the canonical descriptor enum know lantern, turret, and sentry IDs, while `DescriptorInspector` still offers only `lantern_post`. The template-shaped gate also rejects adding `rotationSteps` when a shipped fixture omitted it. CP-00 therefore exposes rotation only for already-rotated lantern templates and leaves schema/inspector normalization to a separate editor/meta slice.

## ED-02 blocker: current truth

The 2026-07-11 blocker **does not still hold for ED-02's render-side scope**:

- `ContractFamilies` owns a bounded/versioned `visual-delta` layer and one parse/normalize/reject boundary.
- variable build-zone, water-source, and spawn-edge shapes pass through that boundary;
- `Terrain` bilinearly samples the authored visual grid;
- `DescriptorInspector` stages the validated document before reconstruction and persists bounded history;
- `TerrainBrush` writes the grid and existing descriptor shapes;
- `main.ts` imports the editor only inside the existing `?editor` branch.

The blocker remains useful as an architecture boundary: it was resolved without making render-side authoring silently mutate gameplay terrain.

## Archive list

Attended archive lifecycle may retire these remote branches after integration review; CP-00 does not delete them:

- `origin/sol/ed-02-terrain-brush`
- `origin/sol/ed-02-brush-v2`
- `origin/sol/ed-03-placement-validator`
- `origin/sol/ed-04-gizmos`
- `origin/sol/ed-05-palette`

## Verification

| Gate | Result |
| --- | --- |
| Clean baseline `npm install --no-audit --no-fund` | PASS |
| Clean baseline `npm run build` | PASS |
| Post-change `npx tsc --noEmit` | PASS |
| Node 22 direct self-check: lantern rotate/apply/hit succeeds; turret rotate/apply/hit stays absent | PASS |
| Post-change `npm run build` | PASS (`tsc` + Vite, 1,284 modules, 725ms) |
| Independent code review | PASS after fix — restricted rotation to fields the current template-shaped descriptor gate can round-trip; reported the stale inspector fixture enum instead of crossing the firewall |
| Existing ED-04 pure model test | CURRENT-MAIN RED before new rotation assertions — one shipped E3 template already fails the unchanged descriptor round-trip loop; no existing e2e file was modified |
| Plain-boot probe, zero errors and no editor execution | SUPERVISOR GATE — no browser backend attached to this session |
| `?editor` capability screenshots in `reviews/shots-cp00/` | SUPERVISOR GATE — no browser backend attached to this session |
| Adjacent `task-025` in both projects | SUPERVISOR GATE — no browser backend attached to this session |

Static gating remains unchanged: `src/main.ts` uses a dynamic import only when `URLSearchParams.has('editor')`; this slice changes only `src/editor/TerrainBrush.ts` and this report. Runtime/browser evidence is not claimed without execution.
