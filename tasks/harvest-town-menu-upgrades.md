# Task harvest-town-menu-upgrades: re-land the town-menu-audit-upgrades salvage on fresh main (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; the SALVAGE REF's full diff (`git log origin/main..origin/sol/town-menu-audit-upgrades --oneline` + `git diff origin/main...origin/sol/town-menu-audit-upgrades`) — the ref is READ-ONLY source material; you re-land on fresh main, never merge or checkout the old branch.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green before starting.

## Why (owner 2026-07-18 branch-triage commission; verdict HARVEST in reviews/branch-triage-2026-07.md)
604 insertions 'sharpen town and menu flows' (07-12) — real UX fixes stranded when town v3 rebuilt the scene. The IDEAS survive; the diffs won't apply.

## Scope — THE RE-LAND LAW (Mistake #15): read the old diff, re-apply each still-valuable idea as a fresh implementation against current main; SKIP anything main already does (verify per item, file-level); cite the salvage ref in your commit body.
1. Read the salvage diff; extract each discrete UX fix (flow, copy, focus, layout, dead-end) as an intent; check it against the CURRENT town/menu (v3) — many may be fixed or obsolete; re-land only live gaps.
2. Suites: town boot + menu suites green both projects; mobile 390px included (menu work is where mobile breaks).
## Firewall: TOUCH-ONLY the areas the salvage diff touches (mapped to their current locations). NO merging/checking-out the old branch, NO new features beyond the salvage's intent, NO Balance changes unless the salvage made them.
## Self-check: tsc+build green · the named suites green both projects · zero console in a plain boot · per-item table in the report: LANDED / ALREADY-ON-MAIN / DROPPED-STALE (with reason).
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the per-item table.
