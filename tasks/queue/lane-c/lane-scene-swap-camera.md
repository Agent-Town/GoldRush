# Task lane-scene-swap-camera: MQ-9 — scene swaps keep camera truth + URL hygiene (LANE-C, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · src/main.ts (the scene-swap seams: launchContract, returnToTownBoard, returnToStartMenu — dispose/construct chains) · the camera+resize plumbing in src/game/Game.ts (resizeRenderer, applyCameraTuning, the resize listener lifecycle) and TownScene's equivalent · docs/MAP-QUALITY-REGISTER.md MQ-9.

Pre-flight (LANE-SAFETY): standard safe-dupe; npm install; tsc+build green.

## Why (OWNER, 2026-07-19, shots 216/217/218 — verbatim: "the graphics is stretched? the camera is closer? I then usually refresh the browser and its gone, but if I do this after coming back from a contract, then it puts me back in that contract as the parameter in the URL sends me there.")
Two defects, one seam:
A. On town→run and run→town swaps, the incoming scene sometimes constructs its camera/renderer from STALE viewport metrics (zoomed/stretched view; a browser refresh — which rebuilds from true metrics — cures it). Likely: resize listener disposed with the old scene and the new scene reads cached dims, or DPR/size read before layout settles.
B. Returning to town leaves `?contract=<id>` in the URL, so the cure (refresh) re-launches the run.

## Scope
1. THE CAMERA TRUTH LAW: every scene swap ends with an explicit re-sync — read LIVE canvas clientWidth/Height + DPR AFTER the new scene mounts (post-layout, e.g. rAF-deferred), set camera aspect/projection + renderer size from those, and re-arm the resize listener; assert no path constructs a camera from another scene's cached metrics.
2. DIAGNOSTICS SEAM: expose the active camera's aspect + the canvas CSS aspect on the canvas dataset (cameraAspect, cssAspect) so specs and future probes can assert equality.
3. URL HYGIENE: when the run returns to town (and to the start menu), history.replaceState strips run params (contract, seed, press-return leftovers) while preserving debug/tour params — refresh after return stays in town. The Press ?editor flow keeps its own params (law 6 unaffected).
4. Spec e2e/scene-swap-camera.spec.ts (both projects): town→run→town ladder at TWO viewports (1440x900, 2000x1000): after every swap, dataset cameraAspect == cssAspect (±0.01) · after return-to-town, location.search contains no contract param · reload after return lands in TOWN · zero console.
## Firewall: TOUCH-ONLY the swap seams, resize plumbing, the dataset seam, your spec. NO camera tuning/FOV changes, NO scene content changes.
## Self-check: tsc+build · your spec + cp04 seeded boots + a town boot green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + which of A's suspects was real (with the line).
