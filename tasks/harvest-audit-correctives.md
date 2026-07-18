# Task harvest-audit-correctives: re-land the audit-correctives-2 salvage on fresh main (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; the SALVAGE REF's full diff (`git log origin/main..origin/sol/audit-correctives-2 --oneline` + `git diff origin/main...origin/sol/audit-correctives-2`) — the ref is READ-ONLY source material; you re-land on fresh main, never merge or checkout the old branch.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green before starting.

## Why (owner 2026-07-18 branch-triage commission; verdict HARVEST in reviews/branch-triage-2026-07.md)
878 insertions of parked product fixes from the 07-11 audit wave (F-SOL-PRODUCT-006 difficulty selector, F-SOL-TRUST-005 family cloud profile enumeration, F-SOL-PERSIST-009 cloud transfer budget, F-SOL-VERIFY-007 truthful deploy result contract, F-SOL-PRODUCT-009 story once-beats display). Parked on 'missing ledger and stale assignments'; the fixes themselves were never re-landed.

## Scope — THE RE-LAND LAW (Mistake #15): read the old diff, re-apply each still-valuable idea as a fresh implementation against current main; SKIP anything main already does (verify per item, file-level); cite the salvage ref in your commit body.
1. For EACH F-SOL finding in the salvage diff: verify whether current main already covers it (file-level probe, name the file:line in your table); re-land the ones that still gap, adapted to current module shapes (profiles v2, current deploy scripts, current story/once-beat surfaces).
2. Suites: the profile/menu suites the diff's areas own + a plain-boot zero-console probe; extend a spec only where a re-landed fix is user-facing.
## Firewall: TOUCH-ONLY the areas the salvage diff touches (mapped to their current locations). NO merging/checking-out the old branch, NO new features beyond the salvage's intent, NO Balance changes unless the salvage made them.
## Self-check: tsc+build green · the named suites green both projects · zero console in a plain boot · per-item table in the report: LANDED / ALREADY-ON-MAIN / DROPPED-STALE (with reason).
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the per-item table.
