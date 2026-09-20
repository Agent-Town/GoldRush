# E2 building art processing report

- `bld-boiler-house.png`: 1254×1254 RGB raw → existing 384×384 RGB processed asset; replaces the missing Boiler House build-menu portrait. The world pool still names/renderers `BoilerHousePlaceholder`, so world-placeholder retirement is not claimed.
- `bld-rail-depot.png`: 1254×1254 RGB raw → existing 384×384 RGB processed asset; registered as `bld.rail_depot`. No live Depot consumer exists, so no gameplay was invented.
- `bld-machine-shop.png`: 1254×1254 RGB raw → existing 384×384 RGB processed asset; registered as `bld.machine_shop`. No live Machine Shop consumer exists, so no gameplay was invented.
- `ter-rail-elements.png`: 2172×724 RGB, inspected as 7×1 (straight, curve, buffer stop, empty cart, full cart, trestle, semaphore); existing extraction has 7 RGBA cells and a 7-frame manifest. Slots registered, but `RailPath` remains explicitly `procedural-placeholder`; texture retirement needs a permitted renderer wiring slice.
- `icons-e2.png`: 2172×724 RGB, inspected as 8×1; existing extraction has 8 RGBA cells and an 8-frame manifest. Boiler Lance, Pressure Mortar, Iron Wall, Boiler Battery, pressure gauge/card, and rail card now render in the E2 research UI.

QA: buildings are readable at 384px; no visible letters, firearms, or gore; magenta keys are clean in the extracted icon/rail cells. Evidence: desktop/mobile `*-buildings.png` and `*-icon-row.png`.

Gates: `npx tsc --noEmit` green; `npm run build` green; focused spec 2/2 desktop/mobile with zero console/page errors. Adjacent battery hit an existing `e2-hill-mine.spec.ts:311` water-route failure (`ratio = Infinity`), then the dev server exited and caused cascading connection refusals; no adjacent source was modified.
