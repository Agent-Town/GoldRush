# Task combat-readability: damage must be VISIBLE (LANE-C, branch lane/polish, commit prefix "feel:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; docs/GOLD_RUSH_BRIEF.md §4 + §9.2 (illustrated, warm, NEVER gory — damage reads as impact and wear, not blood); docs/playtests/2026-07-06-robin-playtest-01.md + owner finding 2026-07-06 evening: "Right now there are no lifebars. But things have hit points and there is damage — that should be visualized."

## Pre-flight (drain-gated per LANE-SAFETY)
lane/polish currently sits at `ed564f1` (polish-02 rivalry-stats), which was DRAINED to main at s98 `105d125` — its content is fully merged, so this 1-ahead commit is a SAFE content-dupe, not undrained work. Force-reset the lane onto clean main: `git checkout -B lane/polish main && git clean -fd && npm install --no-audit --no-fund`; `npm run build` green first. STOP-and-report ONLY if you find a dirty worktree with UNCOMMITTED edits you did not make, or a lane commit whose content is NOT already on main — neither is the case as of s98.

## Facts (verified in code 2026-07-06)
- Building HP bars EXIST (`BuildSystem.syncHpBar`, damaged-only, ~0.92×0.08 unit bar at y≈1.46) — owner played 35 waves of base damage and NEVER SAW ONE. Find why (scale at gameplay zoom? camera-facing? occlusion? color vs terrain?) and make them readable.
- Enemies have NO hit feedback at all: `Enemy.takeDamage` changes numbers, nothing visual until death.
- Hero already has HUD vitals + damage vignette — leave as is.

## Scope
1. **Enemy hit-flash** (the big one): a brief warm-white tint pulse on the sprite when damaged (material/instance tint, POOLED — must be alloc-free per hit and cheap at 120-enemy stress). Optional tiny impact fleck at the hit point (reuse vfx pooling). NO per-enemy health bars — at swarm scale they're noise (genre standard: flash + death). Design bar: readable at gameplay zoom, never gory (no blood — sparks/dust/ink-nick).
2. **Building bars, made real**: damaged-only stays the law, but visible — ledger-styled (parchment backing, ink fill, amber under 66%, red under 33%), camera-facing, sized to read at gameplay zoom on desktop AND 390px, terrain-Y-safe (w1-01 visualY). Fade in on first damage, persist while < full HP, fade out on full repair. Screenshot evidence at both viewports.
3. **Palisade wear state**: below 50% HP, tint/darken the wall segment via the existing instanceColor path (cracked/worn read, no geometry change). Rubble-on-death already exists — this bridges the gap between pristine and rubble.
4. **Turret acknowledgment**: when a turret's bolt kills, its existing kill counter already tracks it — add a subtle muzzle pulse on fire (glow tick, no new draw calls) so the tower visibly WORKS (owner playtest: silent turrets read as broken).

## Firewall
Touch ONLY: entity/visual layers (Enemy sprite tint hook, BuildSystem visual sync, TurretPool visuals), vfx pooling, styles, Balance ADDITIVE (flash duration/intensity knobs), diagnostics additive, new e2e. NO changes to: damage MATH, CombatSystem resolution order, Economy, wave logic, sim timing. Zero per-frame allocations in the hit path.

## Self-check
tsc/build; new `e2e/combat-readability.spec.ts`: damage a building → hpBar diagnostic visible=true + screenshot; enemy hit → flash counter increments; stress 120 enemies + flashes → m2-01 draw-call budget (≤200) HOLDS + frame p95 recorded vs baseline (>15% regression = fail loudly); task-025 + m1-01 + m2-01 unmodified green both projects; zero console/page errors. Before/after screenshots (building bar at both viewports, enemy flash mid-swarm, worn palisade) into artifacts/combat-readability/. Commit on lane/polish. End: READY-FOR-GATES + root cause of the invisible bars + results.
