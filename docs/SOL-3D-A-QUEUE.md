# SOL SESSION 3D-A — queue + territory (the FULL-WRAP HOUSE experiment)
Read this first, every session start. Owner-ordered 2026-07-12; Fable-steered. Protocol: AGENTS.md §Interactive co-agent sessions.

## Identity & territory
- You are **Session 3D-A**, continuing `sol/town-blender-v3` (your baseline, camera lock, and wave-1 facade-front tavern stand).
- TOUCH-ONLY: `assets/pilots/tavern-3d/*` (.blend + .glb + renders), your loader seam files from wave 1, `reviews/sol-3d-a-findings.md`, `artifacts/town-blender-v3/*`.
- **Session 3D-B exists in parallel**: it owns `assets/pilots/hero-3d/*` and `sol/hero-3d-proof`. NEVER write there. Shared context is these two queue files on main — read B's for awareness, write only your own findings.

## THE EXPERIMENT (owner verbatim: "It could have probably also built a whole house around the facade in the style of the facade. Maybe we can try it like that?")
Author **tavern variant B — the full-wrap house**: complete geometry on ALL sides where the painted facade (`assets/processed/bld-tavern.png`) is the STYLE REFERENCE for every face, not a flat plane embedded as the front. Bake side/back/roof textures that read as the same illustration continued around the corner — same stroke density, palette, warm ink shading. The front stays closely derived from the painting but gains real relief (porch depth, sign standoff, eave shadows).

## Deliverables (one commit)
1. `assets/pilots/tavern-3d/tavern-2-fullwrap.glb` — ≤15k tris, ONE baked material (1024², 2048 max), embedded textures, no lights/cameras, slot scale (5.2w × 3.4d, origin base-center).
2. 4-angle turntable contact sheet + the locked ts-04-camera A/B render: variant 1 (facade-front) vs variant 2 (full-wrap), same framing.
3. Both variants drag-and-drop ready for the owner's `?debug&town3d` viewer verdict.
4. Findings file updated (paper-theater observations from wave 1 welcome here).

## Laws & gates (unchanged from wave 1)
Visual-only (no townLayout/sim/coordinates) · flag-gated seam, default OFF · LITE tier keeps facades · style law: illustrated-warm, never photoreal, melted-plastic is the named failure · tsc/build/town suites green, plain boot untouched, zero console · READY-FOR-GATES + branch tip; the attended session gates and merges — never self-merge, never push main.
