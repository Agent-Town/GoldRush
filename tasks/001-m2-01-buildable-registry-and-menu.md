> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, content-probed s1132 2026-07-27).** No done-move exists (this block predates the convention); proven at the datum instead: `src/game/buildables.ts:37` `export const buildableDefs` with `id: 'sentry_beacon'`, `src/entities/Palisade.ts:32` `export class PalisadePool`, spec `e2e/m2-01-build-menu.spec.ts:131` `sink: 'build_palisade'`, review `reviews/m2-01-buildable-registry-and-menu.md`. See F-1132-1.

# Task 001: implement M2-01 buildable-registry-and-menu

You are Codex, implementer for Gold Rush (three.js/TS/Vite), running on Robin's Mac in the project folder. Claude (Cowork) orchestrates and runs the final gates.

READ FIRST, in order:
1. `specs/m2-base-waves/slices/01-buildable-registry-and-menu.md` — the full contract + acceptance criteria. BINDING.
2. `AGENTS.md` — your operating rules.
3. `docs/GOLD_RUSH_BRIEF.md` §4 + §9 if you touch visuals/naming.

## Scope summary (the slice spec is authoritative)

1. `src/game/buildables.ts` (NEW) — `BuildableDef` registry; `sentry_beacon` def #1 (behavior/stats UNCHANGED, cost curve 25/35/45/55/75/95); `palisade` def #2 (flat cost 10 via `Balance.palisade.cost`, bank-only placement, static blocker, light-timber placeholder per the m1-07 tonal palette — NOT dark `palette.wood`).
2. `src/systems/BuildSystem.ts` — def-driven; `SentryBeaconPool` stays behind def #1; new `PalisadePool` in `src/entities/` (InstancedMesh, mirror `SentryBeacon.ts` structure).
3. Enemy avoidance vs palisades: local AABB repulsion/slide in the enemy movement update, radius-culled, no navmesh. Never pass through; never stall (enemies still reach the hero around a finite wall line).
4. `src/ui/BuildButton.ts` → 2-item build menu: B/build-button opens, 1/2 select, Esc/B closes, tap-select on touch, tiles ≥44px at 390×844, parchment style per `theme.css`. Selecting arms the EXISTING ghost→confirm path (do not fork it).
5. Economy: keep sink literal `build_sentry_beacon` for def #1 (old logs must replay identically); palisade emits `build_palisade`; type via template-literal widening. Economy stays the only gold writer.
6. Harness: `__GR_TEST__.selectBuildable(id)`; `state` exposes `buildables: [{id, count}]`; `placeBeacon` keeps working (alias through the def path).
7. NEW `e2e/m2-01-build-menu.spec.ts` per acceptance §3 of the slice spec: (a) menu place palisade + gold −10 with sink `build_palisade`; (b) beacon cost curve intact via menu ×2; (c) `?nowaves` + single-enemy `spawnPack` across a wall line → in-page rAF tracker asserts no pass-through AND hero reached <20s sim; (d) 390px menu visible/tappable, no HUD overlap. Use in-page rAF trackers for ALL movement asserts — protocol polling lies at low fps.

## Rules

- You MAY run `npx tsc`, `npm run build`, and `npx playwright test` locally to self-check (your machine has the full env). Get at least: tsc clean, build green, m1-05 suite green unmodified, your new spec green.
- Do NOT commit or touch git. Do NOT modify `STATUS.md`, `specs/`, `reviews/`, or any EXISTING e2e file.
- Firewall: no building HP, no theft, no new weapons, no CombatSystem/TargetingSystem semantics changes, no wave changes, no Economy event renames; don't "fix" `?stress` alive-cap or beacon pool prealloc (by design).
- When done, end your final message with exactly `READY-FOR-GATES` plus the list of files you changed and your local test results.
