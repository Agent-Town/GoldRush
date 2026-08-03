CODEX: model=gpt-5.6-sol effort=xhigh
# lane-baron-siege — F-BW-16: the Baron breaks walls or the walls break him
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner, gate walk 2026-08-03, verbatim: "I barricaded the north and it got stuck there. It used its rocket twice - once from afar, and I think once more from this position. I would have expected a lot more destruction and difficulty."): the Baron STALLS at player fortifications instead of sieging. Canon (lore/characters.md): "×4 scale, STRUCTURE-RAMPAGE, sky-rocket volleys" — the rampage is his identity and it did not show.
READ-FIRST: the Baron fight systems (WaveSystem baron spawn/pursuit + the boss fight/volley logic + rocketVolley in the contract data) · how enemies target structures (the wall-assault pressure law from night maps — the mechanism exists) · the owner's screenshots (Baron pressed against a north palisade line, escorts queuing behind) · Balance baron tunables · determinism laws (terrainSlideSide etc.).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE:
1. BLOCKED = SIEGE MODE: when the Baron's path to the claim is blocked by player structures, he attacks them — melee rampage on the blocking palisade (canon ×4 menace; structures take real damage on a readable cadence) AND/OR steps back to volley the fortification line (data-driven cadence rises while blocked). He NEVER stands idle at a wall.
2. The volley budget while blocked: the current fight fired ~2 rockets total — while blocked, volleys target the fortification cluster on the existing rocketVolley machinery at a cadence that makes barricading a COST (repair pressure), not a stall exploit. Values from Balance, tuned to "died once, won twice" difficulty — the owner blessed that curve; blocked-stalling must not be the easy path around it.
3. Evidence: browser-scripted fight probes (barricade-north scenario reproduced; before = stall, after = siege), determinism baseline for an unblocked fight unchanged.
4. The 22/22 Baron battery green UNTOUCHED (behavior added only in the blocked state; the launch-gate suite must not weaken).
TOUCH-ONLY: Baron fight/pursuit logic + Balance baron blocked-state tunables + probes/specs. NO: rocket damage values vs hero, escort roster, spawn side (north stays — owner ruling), palisade HP.
SELF-CHECK: baron suites 22/22 both projects · determinism proof · the before/after siege probe boards.
READY-FOR-GATES + report: the blocked-state rules as shipped + probe evidence.
