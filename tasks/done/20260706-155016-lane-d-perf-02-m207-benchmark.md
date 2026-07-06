# Lane D / PERF-02: m2-07 perf-gate benchmark harness (worktree lane-d, branch lane/perf, prefix "perf:")
READ: AGENTS.md, your perf-01 diagnostics, specs/m2-base-waves README §07 (draw calls ≤200 @ ~20 buildables, wave-15 stress; fps floor per STATUS lessons).
1. Scripted benchmark: `?bench=fullbase` harness param — deterministic seed, auto-builds a 20-buildable base layout, runs waves 12-15 at timescale with agent+sprites active, samples frameMs p50/p95 + draw calls + spriteStats per wave, dumps one JSON report to console + window.__BENCH_REPORT__.
2. NEW e2e/perf-02-fullbase-bench.spec.ts: runs the bench, asserts draw calls ≤200 throughout, p95 within 2x of empty-map baseline (record both in report), zero GL errors; attaches the JSON to test output.
3. If the bench FAILS budgets: report which subsystem (instancing fallback? sprite swaps? vfx pools?) — findings only, no fixes out of scope.
e2e/scripts/diagnostics only; no gameplay/Balance changes; install()/no Game.ts. READY-FOR-GATES + files + report JSON.
