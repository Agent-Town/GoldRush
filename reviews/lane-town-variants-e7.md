# E7 Signal town wardrobe — lane B handoff

Status: READY-FOR-GATES

## Enumeration

The zero-code filename seam in `TownTavernPilot.ts` exposes eight missing E7 siblings: six building pilots plus the two plaza-prop families that participate in the same era fallback ladder.

| Building / prop | Derived from | E7 transform | Triangles | Atlas |
| --- | --- | --- | ---: | --- |
| General Store | `general-store.e5.glb` | walnut signal console, honey vacuum tubes, teal punch-tape readout | 5,436 | 1024×1024 embedded |
| Claim Office | `claim-office.e5.glb` | signal arcs, tube bank, blank punch-tape ribbon | 4,772 | 1024×1024 embedded |
| Assay Office | `assay-office.e5.glb` | signal arcs, tube bank, blank punch-tape ribbon | 6,328 | 1024×1024 embedded |
| Chapel | `chapel.e5.glb` | signal arcs, tube bank, blank punch-tape ribbon | 5,940 | 1024×1024 embedded |
| Stamp Mill | `stamp-mill.e5.glb` | signal arcs, tube bank, blank punch-tape ribbon | 3,988 | 1024×1024 embedded |
| Dynamo Hall | `dynamo-hall.e5.glb` | signal arcs, tube bank, blank punch-tape ribbon | 5,328 | 1024×1024 embedded |
| Covered wagon | `covered_wagon.e5.glb` | low-poly signal bar, tube pair, blank tape | 960 | 1024×1024 embedded |
| Water trough | `water_trough.e5.glb` | low-poly signal bar, tube pair, blank tape | 736 | 1024×1024 embedded |

The remaining `.e5.glb`-suffixed plaza files (`harbor-lantern`, `net-frame`, `rope-buoy-rack`, and `tide-board`) are exact paths owned by the E5 era-prop manifest, not filename-fallback families. Unwired `.e7.glb` siblings would be dead assets under the task's no-source-change firewall, so they are intentionally excluded.

## Asset contract

All eight files:

- preserve the exact E5 source envelope and grounding;
- contain one mesh, one primitive, one material, and one embedded 1024×1024 atlas;
- contain no cameras, lights, or animations;
- use metallic factor 0 and roughness at least 0.9;
- remain below the measured E5 family budgets (15,000 building tris, 1,800 wagon tris, 1,200 trough tris);
- produced byte-identical bytes after reopening the saved authoring scene and exporting again.

## Browser evidence

The E7/debug probe passed on `desktop-chrome` and `mobile-chrome` with zero console or page errors. It verified:

- the square's E7 era accent and all eight building orientations;
- each of the six new building pilots independently reports era `7` and its exact `.e7.glb` URL;
- both new prop families request their `.e7.glb` URL and reach the loaded state;
- every loaded building remains upright.

Screenshots:

- [desktop full square](shots-town-e7/desktop-chrome-e7-square.png)
- [mobile square](shots-town-e7/mobile-chrome-e7-square.png)

## Gates

- `npx tsc --noEmit` — pass
- `npm run build` — pass (existing chunk-size advisory only)
- focused E7/debug probe, both projects — 2/2 pass
- existing town Blender + era regression suite, both projects — 96/96 pass

## Adjacent finding

The pre-existing `tavern.e7.glb` has an X center of `-0.450`, outside the runtime's `0.06` centering tolerance, so the existing Tavern pilot falls back to E5 and can leave the shared last-loader dataset at era 5. The per-building probes above avoid that shared-dataset ambiguity and prove the eight new files active. The existing Tavern asset was not edited because the firewall permits only new GLBs.

## Independent review

`codex review --uncommitted` confirmed the structural and build checks, then raised one P2 integration concern: a concurrent lane is authoring E6 siblings, and the ratified mesa arc ultimately calls for E6→E7 visual accretion. No change was made here because this task explicitly orders derivation from E5, current main has no full-cast E6 siblings, and consuming another lane's uncommitted files would violate lane authority. The drain should decide whether the E7 task master is superseded after E6 lands; the delivered assets remain the exact E5-derived slice requested here.
