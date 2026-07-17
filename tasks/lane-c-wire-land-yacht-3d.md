# Task lane-c-wire-land-yacht-3d: wire the Land-Yacht model onto her boss system (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; src/systems/LandYachtBossSystem.ts (the placeholder presentation you are replacing — find where the primitive barge/claw/paddle/hold shapes mount); assets/pilots/land-yacht-3d/ (the model + its asset contract — the four named component sub-meshes wheels_port/wheels_starboard/crane/wheelhouse and damage morphs; read the contract JSON for exact node names); the crawler-model wiring precedent (git log --oneline --all --grep=wire-crawler; read that commit's diff — yours follows its shape).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: grep `land-yacht-3d` in src/ — absent = wire in full. Present = STOP, report SHIPPED.

## Why (drain follow-up 2026-07-17)
The Land-Yacht boss system shipped with placeholder primitives (existing E4 system); 3D-C's model merged (sol/land-yacht-3d-v2: 11,832 tris, one material, four independent damage components). The railcar/crawler law: the model wires in; the sim never notices.

## Scope
1. Load the GLB in LandYachtBossSystem's presentation layer (the crawler pattern: async load, primitive fallback if load fails); bind the four component sub-meshes to the four damage zones by node name from the asset contract.
2. Damage states: drive the model's damage morphs/variants from the existing component-HP events (wheels broken → dropped-rim states; crane+wheelhouse damage states) — render-only; zero sim change.
3. Defeat state: the hulk-as-salvage read uses the damaged model.
4. Extend e2e/e5-boss-land-yacht.spec.ts additively: a probe asserting the model loaded (diagnostics or scene query) while ALL existing assertions stay untouched.

## Firewall
Touch ONLY: LandYachtBossSystem presentation code, the asset import, the additive spec probe. NO sim/balance/act-logic changes, NO other boss systems, NO asset edits.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. e5-boss-land-yacht.spec.ts fully green desktop+mobile (old assertions + new probe). Zero console/page errors. Screenshots: reviews/shots-wire-dq-3d/{act1-model.png, act3-hulk.png}. Perf: boss-run p95 within 15% of the placeholder run — report both numbers.
No-op guard: if you exit without changes, WRITE WHY into your report first.
End: READY-FOR-GATES + node-name bindings as landed + p95 before/after.
