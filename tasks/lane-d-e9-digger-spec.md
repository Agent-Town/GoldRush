# Task lane-d-e9-digger-spec: the Old Digger's authored gates (LANE-D, commit prefix "test:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; src/systems/OldDiggerBossSystem.ts (the SHIPPED system, acts 0-3 — you write gates for it, you do not change it); lore/STORYBOOK.md E9 §BOSS (the ratified choreography the assertions encode); e2e/e5-boss-dredge-queen.spec.ts (the boss-spec house pattern).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/perf main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: e2e/e9-boss-old-digger.spec.ts absent = BUILD. Present = STOP SHIPPED.

## Why: the Digger system merged from the alt window's final shift, complete but spec-less (the wall took the last milestone). A boss without authored gates is a claim, not a fact.
## Scope — e2e/e9-boss-old-digger.spec.ts (GATE-AUTHORSHIP; the charter's original assertions; both projects):
1. Boss-flagged e9-dome-basin run: the Digger spawns, executes its survey, UNMAKES structures on its path via legal build-system channels, never damages the player.
2. **THE NO-KILL ASSERTION:** sustained maximum damage never destroys it (HP floor holds) — the fight cannot be won wrong.
3. Boarding: mount reachable, drones spawn aboard, hazard ticks apply, dismount safe.
4. THE SWAP: completes WITH a prior playbook recording AND with the no-recording fallback; post-swap the Digger is non-hostile, gentle-state, and PERSISTS across a same-profile re-run (TileStateStore); the old-tape archive event fires.
5. Zero console errors; DQ boss spec + task-025 unmodified-green both projects. If ANY assertion finds the shipped system wrong, that is a FINDING with file:line — report, fix only if ≤20 mechanical lines.
## Firewall: the new spec ONLY (+ ≤20-line mechanical fixes with findings). NO system redesign, NO Balance retunes.
## Self-check: tsc+build green · new spec green both projects · adjacents green · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + assertion results + any findings.
