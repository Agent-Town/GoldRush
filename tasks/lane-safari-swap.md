# Task lane-safari-swap: MQ-11 — Safari plays the same game (LANE-B, P1, commit prefix "fix:")

You are Codex, implementer for Gold Rush (worktrees/lane-b).
CODEX: model=gpt-5.6-sol effort=xhigh
READ FIRST: the run→town return path (src/main.ts returnToTownBoard → TownScene mount → the collision/HUD teardown order) · the MQ-9 camera-truth swap work · src/world/LandmarkCollision.ts install path · owner evidence 2026-07-21 (FIRST EXTERNAL TESTER, Safari): "After returning to town some game elements were still present and also he was able to walk through the tavern and the chapel in Safari. I am not able to do that in Google Chrome." + screenshot: the RUN HUD (time/wave/weapon/Build/XP) rendered over the town square.

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green; `npx playwright install webkit` (the 058 precedent — REAL webkit runs, no silent skips: Mistake-#10 class).

## Why (ONE-ERROR-TWO-SYMPTOMS hypothesis: a Safari-only exception early in the swap aborts teardown (stale HUD) AND prevents downstream collision install (walk-through tavern/chapel). Chrome never throws, so the owner cannot see it.)
## Scope
1. REPRODUCE UNDER WEBKIT FIRST: a webkit-project spec driving seed→run→return-to-town; capture pageerrors/console — find the actual thrown error (suspects: unguarded newer APIs — requestIdleCallback, OffscreenCanvas, clipboard, backdrop-filter side effects; or a stricter WebGL context loss on dispose). NAME IT with the stack in your report before fixing.
2. FIX at the mechanism (guard/polyfill/reorder — teardown must be exception-safe regardless: wrap the swap chain so one failing step never strands the HUD or skips collision install; report-then-continue).
3. THE WEBKIT GATE (permanent): add a `webkit` project to the scratch config for a SPOT-SET (this swap spec + never-trap's town case + a plain boot) — Safari parity joins the laws; the census gains a webkit spot column note in docs/MAP-QUALITY-REGISTER.md.
4. Spec e2e/safari-swap.spec.ts: under webkit — after return-to-town the run HUD testids are ABSENT · tavern/chapel blockers stop the hero (reuse never-trap probes) · zero pageerrors through the whole ladder · same spec green under chromium (the fix must not trade browsers).
## Firewall: the swap/teardown chain + guards + configs/specs. NO feature changes, NO Chrome-visible behavior changes.
END: READY-FOR-GATES + the named Safari error with stack + webkit+chromium green tables.
