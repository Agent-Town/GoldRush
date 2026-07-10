# Task 079-render-micro-perf: the swarm's accepted render smalls, one pass (lane-c; commit prefix "perf:")
CODEX: model=gpt-5.6-sol effort=medium
FROM `reviews/swarm-triage-2026-07-10.md` + `reviews/swarm-48h-confirmed.json` (READ each evidence entry FIRST).
You are Codex in worktrees/lane-c. Pre-flight per LANE-SAFETY.
## Scope (five findings, each its own commit)
1. **pools.ts:602** — bossBarState() allocates every frame + syncBossHpBar runs twice per EnemyPool.update: hoist/reuse, call once.
2. **pools.ts:987** — the full-dark enemy render regime (fog-off/basic materials) never engages mid-run: wire the regime switch to the actual night-state transitions (render-only; night-shift spec stays green).
3. **Projectile.ts:148** — terrain-height lookups per shot/per tick with no caching for STATIC emitters: cache per-emitter height (invalidate on move; flat tiles skip entirely).
4. **LightRig.ts:167** — night palette allocates 3 THREE.Color + parses 4 color strings every frame: hoist to module/instance constants.
5. **SpriteAnimator.ts:815** — walk8 alias directions built as duplicate atlases (~1.8x GPU memory): share the base atlas across aliases (registry-level dedupe).
## Gates
tsc/build · e1-night-shift + combat-readability + perf-02-bench + m1-01/m2-01 green · frame p95 at wave-20 stress ≤ baseline (report before/after numbers) · determinism hash unchanged (render-only proof) · byte-similar screenshots on The Claim (no visual drift).
Firewall: exactly the five files + specs. NO sim, NO Balance, NO visual design changes.
End: READY-FOR-GATES + the p95 table + per-finding commits.
