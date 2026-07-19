# Task lane-boss-healthbar: boss bars — green life, red loss (LADDER, next free lane, commit prefix "fix:")
You are Codex (worktree per queue lane). CODEX: model=gpt-5.6-sol effort=low
READ FIRST: the shared boss health-bar render (find it: the component the boss systems all use — DQ/Railcar/Homemaker/Claw/Echo/Digger-resistance/Static pressure bars) · the billboard law (bars anchor in their OBJECT's frame, never camera-billboard — owner ruling, standing).
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Why (OWNER 2026-07-19, verbatim: "for the healthbar of the boss - can we make it green and when he takes damage that part of the bar gets red? that is really easy to understand.")
## Scope
1. The shared boss bar renders REMAINING = green, DEPLETED = red (the lost portion fills red as damage lands, no fade-to-empty) — one component change inheriting to every boss; colors/edge as style tokens (house palette greens/reds, warm not neon).
2. Where a boss uses resistance/pressure bars with special semantics (the Digger's no-kill resistance, the Static's recession), keep their DISTINCT read (do not repaint semantics that aren't health) — list which bars you touched vs left, with reason.
3. Spec: damage a boss in the seeded harness → bar exposes remaining/depleted state (dataset seam) with green/red styles applied; screenshots of one boss bar mid-fight into reviews/shots-bossbar/; both projects, zero console.
## Firewall: the bar component + style tokens + your spec. NO boss logic, NO HP values, NO billboard/orientation changes.
END: READY-FOR-GATES + the touched/left table + screenshot.
