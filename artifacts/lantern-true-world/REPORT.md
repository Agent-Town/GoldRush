# Lantern world reel requires an independent replay boot

Task: `tasks/running/lane-c--20260905-104752-lantern-true-world-reel.md`.
Inspected lane head: `427c627e72a0e0e94814a4adf36ca26150356fdc` (`lane/c`), 2026-09-05.

**STOP — not READY-FOR-GATES.** Scope 3's no-WebGL fallback cannot be reached through the current boot path. Fixing that path requires changes outside this task's firewall. No runtime implementation was made. This is the task's explicit stop-and-report outcome, not a claim that the world reel shipped.

## Measured blocker: the viewer requires Game before it can fall back

The plain watch URL goes through `watchRunTape` (`src/main.ts:372`) → `startGame` (`src/main.ts:125`) → `new Game` (`src/main.ts:135`). Game creates its WebGL renderer at `src/game/Game.ts:1534`, using `src/core/Renderer.ts:34`. Only much later does it start replay (`src/game/Game.ts:2506`) and construct LanternShow (`src/game/Game.ts:7229`).

With WebGL context creation returning null, that constructor throws **“Error creating WebGL context.”** The catch in `src/main.ts:383` closes the replay and returns to the menu. LanternShow is never constructed, so a fallback in LanternShow, TrueReelRenderer, or WorldStage cannot execute. Replacing Game's static-stage installation does not change this ordering.

The replay also uses Game's input, loop, pause/speed controls and worker orchestration (`src/game/Game.ts:1751`, `:7184`, `:7228`, `:7243`, `:7251`). This is existing behavior; a new stage must not add another Game. Repairing the no-WebGL door requires routing agent tapes to a renderer-independent controller before Game construction. `src/main.ts` is excluded, and Game edits are limited to the optional world-stage call.

The runnable characterization is [probe-boot-coupling.mjs](probe-boot-coupling.mjs); results are [boot-coupling.json](boot-coupling.json). It uses the same current-era fixture stamping as the existing deep-link test, without changing recorded actions or hashes. Both arms request the same plain watch URL, without debug. Only the failure arm intercepts WebGL context creation; 2D contexts remain available. Assertions describe the blocker, **not** the desired acceptance behavior.

| Viewport | WebGL | Lantern instances | World | Page / console errors |
| --- | --- | ---: | --- | --- |
| 1280 × 800 | Available | 1 | SVG | 0 / 0 |
| 1280 × 800 | Unavailable | 0 | Absent; returned to menu | 1 / 1 |
| 390 × 844 | Available | 1 | SVG | 0 / 0 |
| 390 × 844 | Unavailable | 0 | Absent; returned to menu | 1 / 1 |

The characterization exited 0 with all four assertions satisfied. Screenshot pairs: [desktop control](desktop-control.png), [desktop without WebGL](desktop-no-webgl.png), [mobile control](mobile-control.png), [mobile without WebGL](mobile-no-webgl.png).

## Other coupling points the revised task should account for

- **A minimal Host is not a contract-local world.** `src/world/Terrain.ts:77` captures the active contract at module evaluation; `:79` captures the tile, and `:124` defines its bounds. `src/sim/TileHeight.ts:4` similarly captures its tile. `stageReplayContract` (`src/meta/ContractFamilies.ts:1260`) invalidates contract selection, not those captured values. A static stage import through LanternShow would additionally run before `watchRunTape` stages the replay contract (`src/main.ts:406`, then `:375`). An installer accepting any `{contractId, tileId}` cannot promise the correct painted terrain solely by calling those existing globals. Lazy loading can avoid first-boot ordering, but does not isolate subsequent contracts.
- **The height source belongs to the whole module, not the stage.** The pilot installs its GLB sampler globally at `src/world/Terrain3dClaimPilot.ts:1842`; `src/world/Terrain.ts:378` replaces the single source, and disposal clears it rather than restoring a previous owner's source. `sampleHeight` also clamps against captured bounds (`src/world/Terrain.ts:353`). Adding another stage beside the existing Game would compete for that source.
- **Water still reads that global terrain.** `mountSculptWater` selects dressing by Host contract but reads the river, fords and water width from Terrain (`src/world/Terrain3dClaimPilot.ts:867`). Passing a different Host ID does not inject that geography.
- **Painted ground has no standalone exported factory.** `createGroundMesh` is private (`src/world/Terrain.ts:749`); the exported `createTerrainView` (`:689`) also constructs decorative props and registers the global editor refresh callback. Removing the returned prop group after construction avoids displaying it, but still performs the extra construction and does not resolve contract/height ownership. The task permits one additional export in Terrain3dClaimPilot, not modifications in Terrain.
- **An unmodified adjacent test encodes the presentation being replaced.** `e2e/reel-deep-links.spec.ts:27` requires a visible SVG terrain descendant and `:28` requires its water descendant in the default plain watch presentation. The new default should be a rendered canvas. The revised task should permit moving those assertions to the explicit tactical case and adding canvas/asset assertions to the default case; invisible duplicate SVG fixtures would not be honest proof.
- **Camera path is stale, but is not itself a blocker.** The actual module is `src/systems/CameraRig.ts`, with existing `setDistanceScale` and `snapTo` methods. There is no `src/core/CameraRig.ts`. The current rig can be consumed without changing it.
- **The tactical query needs a routing decision.** `src/main.ts:376` reconstructs the replay query from a fixed key set; `reelUrl` at `:415` reconstructs it again. Both drop `reel=tactical`. A new controller should receive the initial option explicitly rather than depend on import-time query capture.

These points were traced in source; only the boot failure has a browser reproduction in this report. No asset-load, world-render, hash-completion or performance acceptance is inferred from the characterization.

## Handoff and validation

The smallest next task needs authorization to route agent replay independently in `src/main.ts` and extract its controller from Game, while retaining BrowserAgentTapeReplay/BrowserAgentTapeWorker and their hashes unchanged. For the promised contract-local world factory, permit a render-context seam in Terrain and the pilot, or explicitly constrain the world to one selected contract per page. Permit the presentation-dependent deep-link assertions to change. Do not hide these requirements inside a module-import side effect or a second copy of the controller.

Preflight: the lane was clean, had no commits ahead of main (10 behind at the initial check), and required no reset or evidence discard. `npm install --no-audit --no-fund` completed. `npm run build` passed, including tsc, Vite and asset-diet. A separate `npx tsc --noEmit` also passed. The post-build `git status --short` was empty before creating this artifact directory; no factory churn was present.

Only `artifacts/lantern-true-world/**` was added. Game, replay, simulation, specs, existing tests, STATUS, BACKLOG and git history are unchanged. There was no matching task row in this lane's BACKLOG, so none was invented or marked shipped.

Requested end-state disclosure: no stage installed; Game calls unchanged; performance p95 not measured because there is no new stage; fallback label unchanged. The six implementation suites, Signal-era screenshots and hash-completion checks were not run because the task's stop condition was met before implementation. The saved Claim screenshots document the existing SVG and failed boot only.
