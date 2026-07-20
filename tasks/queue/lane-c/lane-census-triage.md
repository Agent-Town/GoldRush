# Task lane-census-triage: the census's 27 FAILs get verdicts (LANE-C, commit prefix "fix:")
You are Codex (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
READ FIRST: artifacts/map-census/table.md (the referee's first full run: 41 maps, 27 rows with a FAIL) · e2e/map-census.spec.ts (the probes — some FAILs may be PROBE BUGS, not game bugs) · docs/MAP-QUALITY-REGISTER.md (each class's fix + what it promised).
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Why (the register's law: FIXED classes close only census-green; the first run says 27 maps still fail SOMETHING — each needs a verdict, not a shrug)
## Scope
1. TRIAGE TABLE (committed reviews/census-triage-2026-07-21.md): every FAIL cell → verdict: **PROBE-BUG** (the check is wrong for this map class — e.g. "no planar probe point in camera" on e4-long-road = the probe couldn't find a point, not a game defect; "no mounted landmark" on water maps that legitimately mount none) / **REAL** (game defect — name the owning MQ class) / **N/A-BY-DESIGN** (the map class exempts it — encode the exemption in the spec so it shows PASS-exempt, never FAIL).
2. FIX THE PROBE BUGS in map-census.spec.ts same commit (probe robustness: pick probe points from mask truth, exempt classes by contract data).
3. REAL defects: fix inline ONLY if ≤10 lines and mechanism-obvious (e.g. a map's brightness floor barely missing); else author a one-paragraph corrective task file per defect cluster (tasks/, unqueued) and list them.
4. Re-run the census; commit the second table. GOAL: zero raw FAILs — every cell PASS, PASS-exempt, or a named corrective.
## Firewall: census spec + triage review + corrective task files + ≤10-line obvious fixes. NO big src changes inline.
END: READY-FOR-GATES + both tables' FAIL counts + the corrective list.
