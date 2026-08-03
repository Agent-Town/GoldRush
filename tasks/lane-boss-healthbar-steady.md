CODEX: model=gpt-5.6-sol effort=medium
# lane-boss-healthbar-steady — F-BW-17: the bar stops dancing
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner, gate walk 2026-08-03, verbatim: "the healthbar is now 3D, so it swings with its moves in 3D. I would prefer if it would be not swinging, but be always on top of this head so that the amount of health can be easily determined."): the boss bar inherits body animation sway — readability lost.
RULING LINEAGE: the old billboard ruling (Mistake #6: world things anchor in their object's frame) was for BUILDING damage bars; the owner NOW rules boss bars for READABILITY: anchored to the head POSITION, upright and steady, never inheriting rotation/sway. Record both rulings side by side in the code comment so the next session doesn't "fix" it backwards.
READ-FIRST: the boss healthbar implementation (Baron + the shared boss bar if one exists — Dredge Queen/Claw likely share; fix the CLASS) · the green-bar/red-damage design (owner ruling 2026-07, keep) · head anchor points per boss model.
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: 1. Boss bars attach to a head-top anchor (position follows, orientation LOCKED upright/screen-stable — no sway, no roll). 2. Applies to every boss using the shared bar (census which; table in report). 3. Green/red fill design unchanged. 4. e2e: bar upright during scripted boss movement (sample orientation across frames), desktop+mobile screenshots mid-fight.
TOUCH-ONLY: the boss bar component + per-boss anchor offsets + spec. NO: bar design/colors, building damage bars (their ruling stands), boss models.
SELF-CHECK: boss suites green both projects · zero console · screenshots.
READY-FOR-GATES + report: the anchor table + a mid-swing screenshot proving steadiness.
