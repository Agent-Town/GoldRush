# Task lane-3d-default: THE 3D PROMOTION — sculpted world becomes the default render (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · src/game/Game.ts:1452 (terrain3dPilot flag gate) · src/game/Run3dPilot.ts (run3dPilot selection + the `tier=lite` early-out) · src/world/Terrain3dClaimPilot.ts (the REGISTRY of sculpted maps + landmark mounting + panorama; note which contract ids are covered) · src/game/PerformanceTier.ts (tier detection) · e2e/w1-01-terrain-relief + any terrain3d specs (gate grammar + perf table precedent).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (OWNER RULING 2026-07-18, verbatim: "I verdict the 3D already from just the images I saw. We can skip that. I want that. I will play from the start again after the 3D adaption. Can you make that happen?")
The default-off pilot law served until the owner's verdict. The verdict is in: 3D is THE game. Painted tiles remain the LITE fallback forever (the standing law), not the default.

## Scope
1. DEFAULT ON: for contracts present in the terrain3d REGISTRY, the sculpted terrain (+ panorama + landmark mounts) renders by DEFAULT; `run3dPilot` building models default to `all`. No param needed.
2. FALLBACKS, all preserved and honest: `tier=lite` (or detected low tier) → painted, exactly as today · a REGISTRY-absent contract → painted · any GLB load failure → painted (never a black map); the canvas dataset keeps reporting renderSource truthfully.
3. OPT-OUT param for debugging: `&terrain2d` forces painted (debug-gated not required — it's harmless).
4. PERF EVIDENCE (the promotion's gate): frame p95 table on at least the-claim, e5-deepwater-claim, e9-dome-basin, desktop AND mobile project; >15% regression vs painted on any = STOP and report (do not ship a slow default).
5. Spec e2e/terrain3d-default.spec.ts (both projects): plain boot (NO params) of a registry map reports renderSource=3d + landmarks group present · tier=lite boots painted · unknown-contract boots painted · zero console. Update any spec that asserted the old default-off behavior (list them in the report).
## Firewall: TOUCH-ONLY the two flag gates, PerformanceTier consultation, your spec + stale-default spec updates. NO sim changes, NO registry content changes, NO mask/gameplay coupling (render-only law holds).
## Self-check: tsc+build · your spec + w1-01 + 072-era + cp04 seeded boots green both projects · the p95 table in the report · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the p95 table + which specs changed.
