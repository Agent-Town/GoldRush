# Task playtest-correctives-0707: black buildings + decal rotation + cut the flashes (LANE-C, branch lane/polish, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; docs/playtests/2026-07-07-robin-playtest-02.md (owner findings, screenshot-verified). Pre-flight (LANE-SAFETY, runner-auto-commit aware — replaces the stricter rule that no-op'd the 05:44 run): ahead lane commits whose content is already merged to main are SAFE DUPES → `git checkout -B lane/polish main && git clean -fd` and PROCEED. STOP only on an ahead commit NOT represented on main, or uncommitted foreign edits. Then `npm install`; build green first.

## Owner findings (2026-07-07 ~05:40, mid-playtest, screenshot evidence)
1. **P1 — "all the buildings are completely black."** Post-light-pass regression: palisades, stockpiles, turret bases render as pure black silhouettes (screenshot: unlit geometry vs the newly darker/warmer ground). Diagnose: material light-response (MeshBasic vs Standard?), ambient too low for those materials, shadow crush, or vertex/instance colors multiplying to black. Buildings must read in the golden-hour light — ledger-warm, engraved, NOT silhouettes. Fix the light/material interaction, not by reverting the atmosphere (owner: "the darker map is ok").
2. **P2 — palisade damage decals rotated 90°**: "the damages are rotated for the normal palisades but correct for the rotated ones" — the wear overlay's orientation ignores (or double-applies) the palisade's rotationSteps. Systematic 90° offset on default-rotation walls; verify against both orientations in e2e.
3. **Owner verdict — CUT the hit-flashes**: "The flashes when hitting an opponent are looking not good. I think we can cut that." Remove the enemy hit-flash visual (keep the pooled plumbing behind a Balance knob set to 0/off if cheap to keep, else strip it cleanly). Do NOT remove the building HP bars or palisade wear states — those were separate scope and not indicted.

## Firewall
Touch ONLY: light rig/material response for buildings, palisade wear-decal orientation, hit-flash removal/knob, e2e updates for the changed assertions. NO sim changes; NO reverting w1 atmosphere; combat-readability's OTHER features stay.

## Self-check
tsc/build; screenshots BOTH orientations of damaged palisades + lit buildings at gameplay zoom desktop+390 into artifacts/correctives-0707/; combat-readability spec updated for flash removal + green; m2-01 + task-025 + m1-01 unmodified green both projects; zero console/page errors. Commit on lane/polish. End: READY-FOR-GATES + root cause of the black buildings + results.
