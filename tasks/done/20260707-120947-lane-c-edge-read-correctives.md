# Task edge-read-correctives: the map edge must read as DISTANCE, scatter must read as LIT (LANE-C, branch lane/polish, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; docs/playtests/2026-07-07-robin-playtest-02.md (owner screenshot ~12:07, live pages.dev build); src/world/ (vista ring from w1-06, scatter from w1-04, the terrain light rig). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green. NOTE: w1-07 may merge to main before you run — reset onto whatever main is; your fixes must compose with it (same files, additive tuning).

## Owner finding (2026-07-07 ~12:07, screenshot, live deploy — "now this is very weird")
At the claim's SOUTHERN edge from the standard gameplay camera: (1) the river/vista boundary reads as a soft green-brown WALL — the w1-06 vista ring's river continuation + bank carving, seen edge-on, looks like a cliff of water rather than distance; (2) scatter pieces (w1-04 rocks/bushes) render as flat DARK silhouettes — unlit angular shapes (the F-0707-1 black-buildings class, scatter edition). CONFIRMED NOT camera-related: git shows zero camera changes; the camera's feel is LAW (owner: "I meant the terrain 3D, not the cam").

## Scope
1. **Southern edge read**: from the DEFAULT gameplay camera at the river, the beyond-the-claim continuation must read as receding distance — soften/lower the vista ring's near-south profile, blend the river continuation's tone toward fog earlier, and check the fog near/far interplay at that sightline. The ford + river inside the claim keep their exact current read (legibility law: river = water = barrier, ford = crossing).
2. **Scatter lighting**: instanced scatter materials must respond to the light rig like the terrain does — no black silhouettes at any time of day; verify against the same slope-aware shading family. Check instance color/material flags (the buildings fix in correctives-0707 is the reference pattern).
3. **Same-pose evidence**: reproduce the owner's screenshot pose (south bank, facing south at the river edge, ~his zoom) — before/after shots are THE acceptance artifact; also one shot north-facing mid-claim to prove no regression to the approved look.

## Firewall
Touch ONLY: vista ring profile/material near the south boundary, scatter material light response, fog constants if needed (Balance ADDITIVE), e2e. NO camera changes (LAW), NO sim changes, NO w1-07 feature work (it lands separately), NO changes to the in-claim river/ford read.

## Self-check
tsc/build; task-025 + m1-01 + m2-01 + w1 suites unmodified green both projects; zero console errors; the same-pose before/after into artifacts/edge-read/ (this is what the owner judges); perf unchanged (scatter material tweak must not add draw calls). Commit on lane/polish. End: READY-FOR-GATES + root cause of the dark scatter + results.
