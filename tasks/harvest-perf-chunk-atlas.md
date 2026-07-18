# Task harvest-perf-chunk-atlas: re-land the perf-chunk-atlas salvage on fresh main (LANE-D, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; the SALVAGE REF's full diff (`git log origin/main..origin/sol/perf-chunk-atlas --oneline` + `git diff origin/main...origin/sol/perf-chunk-atlas`) — the ref is READ-ONLY source material; you re-land on fresh main, never merge or checkout the old branch.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green before starting.

## Why (owner 2026-07-18 branch-triage commission; verdict HARVEST in reviews/branch-triage-2026-07.md)
1,113 insertions 'split startup graph and atlas character frames' (READY-FOR-GATES, never gated) — startup-chunk splitting + character-frame atlasing. Perf budget is law; the bundle has changed shape since.

## Scope — THE RE-LAND LAW (Mistake #15): read the old diff, re-apply each still-valuable idea as a fresh implementation against current main; SKIP anything main already does (verify per item, file-level); cite the salvage ref in your commit body.
1. MEASURE FIRST on current main: build + report chunk sizes and startup profile (the vite build output + a boot trace); only re-land the salvage's techniques where the measurement shows the win still exists (chunk split config, atlas frames). If the bundle already got these wins another way, DROP with numbers.
2. Evidence: before/after chunk-size table + frame p95 (>15% regression fails, per law); perf/baseline suites green.
## Firewall: TOUCH-ONLY the areas the salvage diff touches (mapped to their current locations). NO merging/checking-out the old branch, NO new features beyond the salvage's intent, NO Balance changes unless the salvage made them.
## Self-check: tsc+build green · the named suites green both projects · zero console in a plain boot · per-item table in the report: LANDED / ALREADY-ON-MAIN / DROPPED-STALE (with reason).
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the per-item table.
