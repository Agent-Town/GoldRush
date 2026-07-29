CODEX: model=gpt-5.6-sol effort=high
# lane-town-zoom — see the inhabitants close up
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner 2026-07-29, verbatim: "The zooming and size of the characters in town... Things still feel small in Town. I would like to see the inhabitants close up." — and a friend asked for zoom on 2026-07-24): the town camera has NO zoom input at all (verified: no wheel/pinch/distance handling in TownScene.ts).
READ-FIRST: src/town/TownScene.ts camera setup + frame/update loop · the RUN scene's camera distance handling (src/game — distanceScale pattern) for the house convention · e2e/town-*.spec.ts for the diagnostics seam (__GR_TOWN_DIAGNOSTICS__).
PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.
SCOPE:
1. Scroll-wheel (desktop) + two-finger pinch (mobile) zoom for the town camera: smooth-damped, clamped [close enough that a townsfolk sprite reads ~2.5-3x today's size … slightly wider than today's frame]. Default spawn framing: one notch CLOSER than current (the owner finds today's too small).
2. Zoom pivots toward the hero; UI prompts/barks stay screen-anchored and legible at all zoom levels; sprite crispness held (no blurry magnification — nearest/anisotropy as the house does elsewhere).
3. Expose zoom in __GR_TOWN_DIAGNOSTICS__ (current distance + setZoom for tests).
4. e2e: wheel zooms in/out within clamps · pinch path on mobile project · prompt legibility screenshot at closest zoom, desktop + 390px.
TOUCH-ONLY: src/town/TownScene.ts (+ its css if prompt scaling needs it) · one new e2e spec. NO: run-scene camera, Balance, layout data.
SELF-CHECK: new spec green both projects · town suites unmodified-green · zero console · screenshots at min/default/max zoom into artifacts/town-zoom/.
READY-FOR-GATES + report: the clamp numbers chosen + screenshots.
