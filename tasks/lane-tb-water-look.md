CODEX: model=gpt-5.6-sol effort=xhigh
# lane-tb-water-look — F-BW-13: the braid learns to look like a river
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner, gate walk 2026-08-03, screenshots: "the ends of the river don't continue as expected... the river does not look like a river"): the ribbons render as hard-edged straight bands — visible mitre wedges at the crossing, abrupt dead-stop ends at tile boundaries, banding/dither patterning on the surface, and dark bed voids beside/under them.
READ-FIRST (mandatory, the shift pre-diagnosed you): /reviews/beauty-twin-banks.md ON MAIN — its ribbon section (mask-polyline mitre joins; the zero-width side-factor lesson; the six-point pixel probes) and its named PIPELINE DEFECT paragraphs · src/world/Water.ts createWaterRibbon/ribbonGeometry · the mask polylines (twin-banks maskTruth.waterMask) · F-BW-7 shore-truth master (coordinate: shore truth caps WIDTH; you own SHAPE).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE:
1. CURVE FIDELITY: resample the mask polylines into smoothed centrelines (Catmull-Rom or arc-filleted corners) with enough segments that no straight-band read survives at gameplay zoom; the crossing junction becomes a proper confluence (shared surface or blended overlap), never a mitre wedge.
2. ENDS CONTINUE: at tile edges the ribbons fade into the haze/panorama story (alpha feather along the last metres + a hint of continuation in the edge treatment) — a river leaves the frame, it does not stop.
3. SURFACE QUALITY: kill the visible banding/dither patterning (shader precision/dither or UV scale — diagnose, don't guess); bed voids beside ribbons get the darkened-bed treatment (the claim's bed approach) so no black holes flank the water.
4. Pixel probes extended: the review's six-point battery grows to cover junction, ends, and former void points.
TOUCH-ONLY: Water.ts ribbon geometry/shader · the pilot's ribbon config · the probe spec. NO: mask data, sim water/crossings, shore width beyond F-BW-7's law, other maps' water.
SELF-CHECK: e1-twin-banks + release suites green both projects · p95 within +15% · zero console · before/after boards (boot, crossing, both ends, 390px) into artifacts/tb-water-look/.
READY-FOR-GATES + report: boards + the junction treatment chosen.
