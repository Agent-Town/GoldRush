# SOL SESSION 3D-B — queue + territory (the HERO-IN-3D proof)
Read this first, every session start. Owner-ordered 2026-07-12; Fable-steered. Protocol: AGENTS.md §Interactive co-agent sessions.

## Identity & territory
- You are **Session 3D-B**. Branch: `sol/hero-3d-proof`, cut fresh from `origin/main`.
- TOUCH-ONLY: `assets/pilots/hero-3d/*` (.blend + .glb + renders), `reviews/sol-3d-b-findings.md`. **ZERO src/ changes** — this proof is judged from renders, not in-game wiring (wiring is a later, separate decision).
- **Session 3D-A exists in parallel**: it owns `assets/pilots/tavern-3d/*` and `sol/town-blender-v3`. NEVER write there. Read its queue file for awareness only.

## THE EXPERIMENT (owner verbatim: "Maybe we could build characters in 3D from the 2D animations as well?")
Scope = **THE HERO ONLY**, as a decision-proof. Use the existing turnaround + walk sheets (`assets/processed/char-hero-*`) as orthographic reference planes in Blender — front/side/back locked to sprite proportions. Low-poly stylized (**≤8k tris**), ONE baked painterly material sampled from the sprite palette. The silhouette IS the character: brimmed hat, tan coat, satchel left shoulder, teal charm, **pan at her RIGHT hip** — exact.
Rig minimal: ONE 8-frame walk cycle mirroring the sprite's gait timing. No face bones, no cloth sim, no IK showcase — a game proof, not a showreel.

## Deliverables (one commit)
1. `assets/pilots/hero-3d/hero-3d.glb` + source .blend.
2. THE JUDGMENT RENDER: side-by-side at the GAME CAMERA angle — 3D hero next to the 2D sprite at identical on-screen size, idle + mid-stride frames.
3. A 2-second walk-cycle turntable clip (or frame strip).
4. Findings file — including the honest option: **"the 2D cast should stay 2D over 3D buildings (HD-2D direction)" is a fully successful outcome** if the model fights the style. Melted-plastic surfaces or uncanny gait = say so with a screenshot. The goal is a DECISION, not a deliverable at any cost.

## Success bar (owner-eye)
A player who knows her recognizes her instantly. Nothing reads as vinyl. The gait feels like HER walk. DO NOT batch more characters — one proof, then verdict.

## Laws & gates
Style law: illustrated-warm, never photoreal · no text in textures · clothed, warm, canon-exact · tsc/build untouched (you change no code) · READY-FOR-GATES + branch tip + findings; the attended session gates and merges — never self-merge, never push main.
