CODEX: model=gpt-5.6-sol effort=xhigh
# lane-gt-03b-goal-side-steer — finish GT-03 scope 2: enemies steer toward the GOAL side of a cliff
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner "go", 2026-07-28, on F-1131-5): GT-03 shipped its spec file but NOT its scope 2 — the resolver picks a cliff side by POSITION SIGN (goal nowhere in the expression), so 8 of 29 Hill Mine Rail Toughs latch when the goal sits opposite (F-1130-5). The cure is already written in the original master's scope; this task executes it verbatim.
READ-FIRST (in order): tasks/BACKLOG.md §F-1131-5 (the full diagnosis + prescription) · tasks/lane-d-gt-03-enemy-elevation.md scope 2 (the law: "tangent + goal bias") · src/entities/Enemy.ts:1253 AND :1264 (the two byte-identical sites — fix BOTH) · tasks/lane-d-gt-02b-unstuck.md + e2e/gt-02-slope.spec.ts:207 (the hero's resolver + never-wedged invariant to REUSE: one movement law, two consumers) · e2e/gt-03-enemy-elevation.spec.ts:205 (the too-narrow gate you will widen).
PRE-FLIGHT (LANE-SAFETY, invariant not manifest): for every dirty tracked file in this worktree, its blob must be reachable somewhere in git (`git cat-file -e <blob>` via any ref) — a blob UNIQUE to this disk = unmerged work = STOP and report. `.wrangler/tmp/**` exempt.
SCOPE:
1. Replace the position-sign side pick at BOTH resolver sites with goal-side steer per gt-03 scope 2: the resolver's tangent + goal bias. Reuse/extend the hero's gt-02b resolver functions — do not fork a second movement law.
2. BEFORE any edit: capture a determinism baseline (seeded replay of the gt-03 scripted route; terrainSlideSide serializes — Enemy.ts:504/:569) and prove the same seed replays identically AFTER for a route the change should NOT affect.
3. Widen e2e/gt-03-enemy-elevation.spec.ts: from `passSide !== 'cliff'` to `passSide === <goal side>` across SEVERAL spawns covering BOTH polarity cases (goal same side as position sign, and opposite — the case that latched). Keep the existing four assertions.
TOUCH-ONLY: src/entities/Enemy.ts · e2e/gt-03-enemy-elevation.spec.ts. NO: Hero movement files, other specs, Balance, terrain.
SELF-CHECK: new + existing gt-03 green desktop AND mobile · e2e/gt-02-slope.spec.ts unmodified-green · determinism baseline matches · tsc + build clean · zero console/page errors in the spec runs.
READY-FOR-GATES + report: per-spawn passSide table (before impossible / after correct), both resolver sites' final expression, baseline replay proof.
