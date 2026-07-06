# Task M6-attempt4: integrate the audited actors-foundation onto current main (LANE-D, branch lane/perf, commit prefix "m6:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; **`git show lane/m6-r3a-apply:reviews/m6-r3a-audit.md`** (the verdict that authorizes this task — read it FULLY, its "Mechanical Rebase Fixes" section is your playbook); docs/decisions/ADR-002.

## Authorization chain (why this is no longer owner-gated)
Attempt-2 was rejected on a tripwire later proven to be main's own bug (F-028-1, fixed). Owner chose 3a (audit-only re-run). The audit's verdict: **NO UNSOUND HUNK** — `actors[]`/`primaryActor` refactor SOUND, CombatSystem-as-sole-damage-resolver preserved, `Balance.actors.enabled=false` guard knob SOUND, full battery green on scratch, determinism hash IDENTICAL to baseline (`91d12069…`). The only STALE verdict was against blind-merging the OLD branch — which this task does NOT do. s61 attended ruling 2026-07-07: integrate.

## Pre-flight
`git checkout -B lane/perf main && git clean -fd && npm install --no-audit --no-fund`; `npm run build` green first. Reference material: `git diff main...lane/m6-r3a-apply` (the audited scratch, base now ~12h stale — main has moved: SCI-01/02/04 research + epoch registry, 041 turret canTarget, m4-05 close-out, w1-04 scatter, possibly BT-00/BT-01 — verify with `git log --oneline -25`).

## Goal
Land the M6 actors FOUNDATION on current main, behavior-frozen: `actors = [hero]` + `primaryActor` plumbing through Game/CombatSystem, `Balance.actors.enabled = false` (the knob STAYS false — zero gameplay change; recruited actors come later), plus the ride-along artifacts from the branch: `reviews/m6-r3a-audit.md`, `e2e/perf-02-fullbase-bench.spec.ts`, `src/diagnostics/fullBaseBenchmark.ts`, DebugParams/vite-env additions.

## Method (the audit's own discipline, extended to today's main)
Re-apply the scratch diff file-by-file — NEVER blind-copy. For every hunk, TODAY'S MAIN WINS on infrastructure and the refactor routes through it. The audit's preserve list, extended: `openAssayBench` + Assay Office confirmAction, `syncHeroVisualHeight` + W1 terrain/water diagnostics, `scriptEnemyAt`, task-028 bolt-leading, 041 `canTarget` turret LOS handle, SCI research overlay hooks in the Run Ledger flow, agent stub/embodiment wiring (m4-05/m4-07), and ANY hook newer than this task file. Where the scratch and a new hook collide, keep the hook and route it through `primaryActor`.

## Firewall
Touch ONLY what the scratch diff touches (Game.ts, CombatSystem.ts, Balance.ts additive `actors`, main.ts, DebugParams.ts, vite-env.d.ts, the three new files). NO behavior change while `actors.enabled=false` — this is the invariant the gate proves. No edits to sim semantics, Economy, crafting, science, or existing e2e.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. Serial battery (`--workers=1`): task-025 + m1-01 + m2-01 (30/30 expected) + m4-05 + m4-06 + sci-01 specs green both projects. **Determinism probe**: seeded `m6-r3a-determinism`, two runs, hashes IDENTICAL to each other (record the hash; if it differs from the audit's `91d12069…` explain why — main moved — but the two-run self-consistency is the hard gate). Zero console/page errors desktop + 390. Commit on lane/perf. End: READY-FOR-GATES + per-hook preservation notes + results. (Post-merge, a fire archives `lane/m6-r3a-apply` + `lane/m6-partial-salvage` per the salvage lifecycle.)
