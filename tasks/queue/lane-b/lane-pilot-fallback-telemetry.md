CODEX: model=gpt-5.6-sol effort=high
# lane-pilot-fallback-telemetry — F-BW-4: silent demotions learn to speak
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner, live on the public URL 2026-08-03: "the graphics has reset to the old style from the new map... What happened?" — and nobody could answer from the server side): the 3D pilot's fail-soft demotions (failed→painted, water-guard failures, tier shedding) publish only to canvas dataset — invisible unless the player opens devtools mid-run. The game must self-report.
READ-FIRST: src/world/Terrain3dClaimPilot.ts publish()/failLoad()/the water guard (dataset writers) · the telemetry client (how the game already beacons; keepalive fire-and-forget pattern) · functions/api/telemetry.ts (accepts event shapes; extend minimally if needed) · the auto-tier/perf shed mechanism wherever it lives (find it; document its trigger in the report).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: 1. Every demotion event (pilot failed→painted, sculpt-water failure with its message, tier shed mid-run, context-loss if detectable) fires ONE telemetry beacon: {event:'render_demotion', reason, contractId, buildId, tier, dataset snapshot} — fire-and-forget, offline-silent. 2. A console.warn with the same payload (devtools-visible for owner sessions). 3. NO behavior changes to the demotions themselves. 4. e2e: scripted failure path emits the beacon (route-intercept) + the warn.
TOUCH-ONLY: the pilot's publish/fail paths (beacon hook only) · telemetry client/endpoint minimal extension · one spec. NO: demotion logic, tier thresholds, water code.
SELF-CHECK: both projects green · release suite green · zero console errors (the warn is a warn).
READY-FOR-GATES + report: the beacon shape + a captured sample.
