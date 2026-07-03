# Spec: M0 Skeleton

Goal: a walkable river gold claim with the canonical camera, a themed HUD shell, and a verified production build. No combat, no economy — the stage, not the play.

Synthesized 2026-07-03 from three independent slice drafts (strong convergence on scaffold-spike-first, data-owned terrain, DOM-snapshot HUD, preview-verified deploy).

## Next Agent Prompt

_Last updated: 2026-07-03. Update this section before ending your pass._

Status: **all five slices open.** Pickup point: `slices/01-scaffold-boot.md`. Slice 01 must land alone (it is the sandbox spike — npm install in the mounted repo is unproven; fallback documented in STATUS.md). After 01, slices 02/03/04 may run in parallel (03 codes against the `TerrainSample` type from 02's seam using a flat stub until merge; each slice's spec names its exact `Game.ts` registration lines to avoid collisions). 05 joins them. Verify per GATE-STD below; write findings to `reviews/<slice>.md`; keep this prompt current.

TODO:
- [ ] 01-scaffold-boot (owner: Codex)
- [ ] 02-claim-terrain
- [ ] 03-hero-camera
- [ ] 04-hud-shell-state
- [ ] 05-deploy-preview → M0 exit: Robin plays it

## Decisions (do not reopen)

Vite+TS+three.js via the packaged scaffold (`vendor/skills/threejs-game-skills/skills/threejs-gameplay-systems/scripts/create_threejs_game.py`). WASD + auto-fire (M1), top-down slight-oblique camera, desktop-first (scaffold touch stick kept, hidden on desktop). Frontier-tech visual language per `docs/decisions/ADR-001`. Placeholder-first art with named layer-contract slots. Custom XZ circle collision — no physics engine (record ADR if M2 changes this).

## Design pillars

1. **Frontier Ledger, not SaaS** — palette/type/composition per brief §4; parchment, brass, teal-for-intelligence, rust-for-danger.
2. **Fun is a gate, not a garnish** (Robin, 2026-07-03) — warm, quirky, a little nerdy. Copy stays in the brief §5 voice (plainspoken, lightly mythic) but is allowed to wink. Placeholder shapes should already have charm (hat cones, glowing trims).
3. **Evidence, not vibes** — every slice ends playable and screenshotted.

## Slice graph

```
01-scaffold-boot ──┬── 02-claim-terrain ──┬── 05-deploy-preview
                   ├── 03-hero-camera ────┤   (M0 exit)
                   └── 04-hud-shell-state ┘
        (02 ∥ 03 ∥ 04 after 01; 03 stubs TerrainSample until 02 merges)
```

## GATE-STD (inherited by every slice)

`npm run build` green · zero console/page errors · Playwright green (`e2e/`) · canvas non-blank pixel check · desktop 1280×800 + mobile 390×844 screenshots attached to `reviews/<slice>.md` · screenshot-critique as last check on any new visual shot · compare-screenshots vs prior baseline when a look changes · diagnostics assertions via `window.__THREE_GAME_DIAGNOSTICS__` · 60 fps target noted when rendering changed · spec + STATUS.md updated.

## Ownership invariants (single owners — review rejects violations)

- `world/Terrain.ts` `sample(x,z)` is the only walkability/speed truth.
- `game/Balance.ts` owns every tunable number (M0 already: hero speed, camera rig).
- `ui/` reads a per-frame `UiSnapshot` and emits `UiIntent`s; never imports three.js or game objects.
- `core/Diagnostics.ts` is the only writer of `window.__THREE_GAME_DIAGNOSTICS__` (extend, never rename fields).
- `game/Game.ts` owns THE update order (documented at top of file) and the only `GameState` transitions.
- Placeholder mesh factories carry a layer-contract slot name (`src/assets/slots.ts` mirrors `assets/layer-contracts/*.json`) or they don't merge.

## Update order (fixed; grows in M1)

input snapshot → GameState gate → Hero.update (Terrain-clamped) → CameraRig → UiSnapshot sync → Diagnostics.publish → render. Fixed-step 60 Hz sim accumulator with delta clamp 0.1 s; render on rAF. Sim time accrues only in `playing` — all future cooldowns/wave clocks use sim time.

## Firewalls (global for M0)

No combat, economy, XP, building, networking, persistence, agent code. No edits under `vendor/`. No new npm deps without ADR. Single page forever (no `location.href`). No pixel fonts; no firearm shapes/names; no real art files (slots + placeholders only).

## Known unknowns

Owned by slice 01: sandbox `npm install` behavior on the mounted repo (STATUS.md documents create-OK/delete-blocked and the `~/work` + rsync fallback). Everything else in M0 is known tech.
