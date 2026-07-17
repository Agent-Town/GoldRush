# Review — wire-dredge-queen-3d (lane-c)

**Slice:** lane-c-wire-dredge-queen-3d — wire the 3D-C Dredge-Queen GLB onto her boss presentation (render-only).
**Branch/tip:** `lane/e2-arsenal @ 68236fb85de27a709097990a0f7d2b248976ef7f`
**Base:** `1a1c2b15` (recent main — SAFE-DUPE self-healed the prior false-ahead; runner reset to fresh main before running).
**Verdict:** PASS — merged to main (s689 drain).

## What it does
Replaces the placeholder primitive barge/claw/paddle/hold shapes with the real 11,832-tri Dredge-Queen model (`assets/pilots/dredge-queen-3d/dredge-queen.glb`, already on main since `1a1c2b15`), following the crawler-model wiring law: **the model wires into the presentation layer; the sim never notices.**
- Primitives moved into a new `bargePrimitive` group; the GLB async-loads on first fight/hulk frame (`ensureDredgeQueen3d`), with the primitive as a live fallback whenever the model isn't mounted (`bargePrimitive.visible = !modelMounted`).
- `inspectDredgeQueen3d` validates the asset contract by node name (claw / paddle_port / paddle_starboard / hold) + morph (Damage_SlackClaw / Damage_BrokenPortPaddle / Damage_BrokenStarboardPaddle / Damage_CrackedLootHold), 4 meshes, 1 material, exactly 11,832 tris — mismatch → `failed` → primitive stays. Contract JSON node names confirmed matching the code.
- Damage morphs + emissive drive off the EXISTING component-HP state (`destroyed` set, `hulkPresent`, per-component HP ≤ 0.5) — **read-only, zero sim/act mutation.**
- Act-3 hulk + the W6 persistent wreck use the damaged model.
- Lite performance tier never loads the GLB (`state = 'lite'`, `ensureDredgeQueen3d` only fires from `off`/`disposed`) — a perf guard, keeps the primitive on low-end.
- Publishes `canvas.dataset.dredgeQueen3d{State,Source,Mounted,Presentation,DamageStates}` for the additive spec probes.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | GREEN |
| `npm run build` | GREEN (`✓ built in 922ms`) |
| `e2e/e5-boss-dredge-queen.spec.ts` | **8/8** desktop+mobile (3.7m) — incl. new `state=ready`/`mounted=true`/damage-state/`presentation=hulk` probes + W6 persistence |
| boss-run p95 (perf test) | desktop ratio **0.7212** (boss 125.7ms vs non-boss 174.3ms), mobile **0.7547** — WITHIN 15% (frame time *lower* with the boss present) |
| boot probe (`_s106-prospector-boot-probe`) | 2/2 desktop+mobile — zero console/page errors, prospector visible (plain boot) |
| adjacent suites | no other e2e spec imports DredgeQueen/the boss — minimal adjacency |
| screenshots | `reviews/shots-wire-dq-3d/act1-model.png`, `.../act3-hulk.png` |

## Merge classification
Base `1a1c2b15` → tip `68236fb8`. Main moved ONLY STATUS/docs (c272d3a8, 96d4c55a, s688/s689 lock+handoff) since base — **disjoint** from the lane's `src/systems/DredgeQueenBossSystem.ts` + `e2e/e5-boss-dredge-queen.spec.ts` (verified `git diff 1a1c2b15 main -- <those files>` empty). Clean `git merge --no-ff`, no conflicts. Files landed: DredgeQueenBossSystem.ts (presentation), the additive spec probe, 2 review shots.

## Firewall
Clean. Touched only DredgeQueenBossSystem presentation code + the asset URL import + `performanceTierDiagnostics` read + the additive spec probe. No sim/balance/act-logic change, no other boss systems, no asset edits.

## Findings
None blocking. Render-only, sim untouched; the W6 persistent-wreck mount now uses the damaged model (feeds TP-01 when the tile-persistence rung authors).
