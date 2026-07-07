# Task e1c-twin-banks: TWIN BANKS — E1 contract C4 (LANE-D, branch lane/perf, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; **specs/e1-contracts/README.md §C4 (BINDING)**; the `?contract=` loader (dry-gulch shipped it — reuse); build-zone/claim-stake logic (RunManager loss condition); task-025 ford routing; 046 lane constants (per-contract already, from dry gulch). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after gt-02 (this lane's queue order).

## Scope (per spec §C4 — a split homestead)
1. Contract manifest: today's river layout, build zones BOTH banks (zone manifest per side; claim stake south = THE loss condition; a north stake-marker prop = expansion flag, its loss ≠ run loss).
2. TWO fords (west + east thirds) — both route enemies (025's ford logic instanced per ford).
3. Spawns all four edges; north spawns pressure the north plot (046's per-contract lane constants).
4. Economy identical both banks (sluices/stockpiles work north; one gold pool).
5. Board-row metadata (tag vein-hunter, unlock: first SECURED claim).

## Firewall
Touch ONLY: contract manifest data, build-zone manifest support (additive — the zone system may need a per-contract zones read; keep the default claim's single-zone path byte-identical), second-ford instancing (data-driven), north stake prop, e2e, artifacts. NO changes to: loss-condition logic beyond reading which stake is THE stake, default claim behavior (regression-asserted), CombatSystem.

## Self-check
tsc/build; new `e2e/e1-twin-banks.spec.ts` per the spec's gates (build accepted both banks · BOTH fords route (025 ×2) · north-plot loss ≠ run loss, south stake loss = overrun · 4-edge spawns · seeded determinism) both projects; default-boot regression task-025 + m1-01 + m2-01 + e1-dry-gulch green both projects; zero console errors; screenshots (both-bank base, a north-plot skirmish) into artifacts/e1-twin-banks/. Commit on lane/perf. End: READY-FOR-GATES + results.
