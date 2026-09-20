# E8 independent visual review

Fresh reviewer `claw_visual_review` inspected V4 intact/landed renders, 3x crops and the primary concept, without implementation history.

High-confidence full-image findings: compact walking castle rather than suspended industrial citadel; claws too short/tucked under hull; compressed dark machinery band; undersized underside gondola; plain repetitive conical crown; dark matte brown material with weak teal; weak civic-state distinction. Medium-high confidence: unclear claw hinges/suspension connections. Crop-confirmed: angular rings, plain empty roof panels, blunt collars and abrupt segmented finger-to-tip transitions.

V5 response: preserve crown size while widening claw hubs beyond the promenade; raise lower machinery tier; enlarge rounded central gondola; native 3x3 material atlas with steel, brass, glass and cable swatches. Visual envelope intentionally grows to about 14.49 x 14.49 x 12.04 before landing rather than shrinking the crown to retain the old total width. Simulation anchors unchanged; acceptance still requires footprint/grounding and target-readability checks.

V6 response: lower and enlarge winch drums and stage them farther forward below the plaques. These candidates have not been re-reviewed or adopted. The civic transformation and crown architecture remain review targets. Do not treat structure checks as visual acceptance.


## V8 follow-up and V10 triage

The reviewer reports substantially improved reference recognition: wider suspended claws, visible suspension lines, exposed machinery, stronger brass/teal and unmistakable landed ladders. Remaining style limitations: thick bent arms still read partly as legs; machinery resembles a ribbed compartment rather than fully distinct galleries; crown remains simplified; material engravings are larger than the concept. These are retained as fidelity limits, not denied.

Actionable new defects: no clear ladder exit through rails; a floating broken part under the winch. V9 opens the corresponding rail/post bays and places broken winch shards on the ground. Winch elevation and lower plaques separate its silhouette from the gondola. V9's access check caught 92 ladder/winch triangle intersections. V10 increases the outward lean, and both ladders now have zero intersections against the landed winch; lower rail bounds are 0.12 and upper bounds 6.50575. Settled feet remain at ground zero. The 1024 atlas and all three component/morph bindings pass export checks.

V8 mobile/full runtime completed six states with two exact asset hashes and actual maximum camera scale 1.6 on both devices. Earlier mobile captures were not zoomed as intended because mouse x=500 lay outside the 390px viewport; those old images are preserved. Capture now dispatches the existing canvas wheel handler and records camera diagnostics. No production camera changes were made.
