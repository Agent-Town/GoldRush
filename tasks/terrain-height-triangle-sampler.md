# Task terrain-height-triangle-sampler: `visualY` samples the triangles the player sees (LANE-D, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d` (branch `lane/d`).
READ FIRST: AGENTS.md; `docs/reviews/2026-09-05-astra-3d-review.md` §4 (F-ASTRA-10: bilinear `visualY` vs rendered triangles — centroid discrepancy max 0.0253 The Claim / 0.0230 Twin Banks / 0.1033 Hill Mine / 0.6667 Mare Claim); `src/world/Terrain3dClaimPilot.ts:527-:559` (`bakeHeightGrid`: a square grid inferred from `sqrt(position.count)`, then a bilinear lerp over the four cell corners — while the mesh draws two triangles per cell along ONE diagonal); CLAUDE.md §4.6 (rendering-only: `visualY` is render-side, the sim is planar and untouched); `e2e/terrain3d-claim-pilot.spec.ts` ("contract-valid GLB feeds every visualY consumer and keeps the water agreement", "the terrain pilot leaves the planar simulation fingerprint unchanged", "the mounted terrain stays inside the 115% p95 budget").
CODEX: model=gpt-6-astra effort=xhigh
SEQUENCING LAW: run after `shared-atlas-texture-dedupe` has MERGED to main (verify `git log --oneline main | grep -q 'shared-atlas-texture-dedupe'`) — else STOP and report "atlas dedupe not landed".
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (Owner, 2026-09-05, verbatim: "Ok, then lets have it fix these findings. This is important stuff."; Astra F-ASTRA-10, its own centroid measurement — reproduce it in scope 2)
Feet float or sink wherever the bilinear surface and the drawn triangle disagree, worst on abrupt relief (the Mare). Astra: "interpolate on the grid's actual triangle diagonal … publish the visual height data independently of render topology."

## Scope
1. **Bake the diagonal from the index buffer:** per cell, read which two triangles the mesh actually draws (never assume a diagonal direction), and sample `visualY` barycentrically on the triangle the point falls in, so the sampled height equals the rendered surface everywhere. O(1) per sample as today.
2. **Prove it:** `scripts/terrain-height-sampler.test.mjs` parses the four terrain GLBs, evaluates every triangle centroid with the OLD (bilinear) and NEW samplers, prints the max/p95 table, and asserts the new discrepancy is 0 (±1e-6); added to `package.json`'s `test:node-guards` list (ONE invocation — append).
3. **Nothing else moves:** the planar-sim fingerprint spec stays green untouched; the water-agreement spec stays green; screenshots on the Mare at the worst centroid (coordinates from your table), desktop + 390px, show the hero standing on the surface.

## Firewall
Touch ONLY: `src/world/Terrain3dClaimPilot.ts` (`bakeHeightGrid` and its direct callers only), the new node test, `package.json` (list append), `artifacts/terrain-height-triangle-sampler/**`, `tasks/BACKLOG.md` (your row). NO changes to: the sim, `src/world/Terrain.ts`'s height-source API, GLB files, `e2e/terrain3d-claim-pilot.spec.ts` assertions.

## No-op / honesty guard
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. If a scope item is impossible inside the firewall, STOP with the coupling points as file:line and the measured evidence; do not widen the firewall yourself.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; the node test green with its table; `terrain3d-claim-pilot.spec.ts` unmodified-green desktop + 390px, zero console/page errors; the Mare screenshots.
End: READY-FOR-GATES + the old-vs-new discrepancy table.
