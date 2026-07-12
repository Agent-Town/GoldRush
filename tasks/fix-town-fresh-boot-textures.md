# fix-town-fresh-boot-textures — the town never boots naked (lane-d; commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-13, from owner evidence.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **RESET AUTHORIZATION (attended, 2026-07-13):** lane-d (`lane/perf`) tip `40099d6e` (wire-townsfolk-walk8-trio) is CONTENT-ON-MAIN via attended drain `7222e119`. Reset per the safe-dupe rule and PROCEED — do NOT re-STOP on aheadness.

## WHY: owner screenshot 2026-07-13 00:37 — a fresh TOWN boot rendered fully untextured: flat-color building shells (no facades), flat ground (no tile art), and the youngster bark card's portrait <img> empty, while sprites walked with unclipped fringes. The fix-fresh-scene-render-state slice (d830d326, on main) covered the RUN scene ("Night Shift daylight repro"); the owner's evidence shows the TOWN boot path is still exposed. Owner's standing workaround is a hard reload — that must stop being necessary.

## READ-FIRST: tasks/done/20260712-141030-fix-fresh-scene-render-state.md + its landed diff (`git show d830d326`) — the run-scene mechanism to mirror · src/town/TownScene.ts createScene/dressScene + facade/tile texture loading paths (how town textures mark ready) · src/assets/generated.ts (markStartupFrameReady/prefetch gating) · the bark card render (TownScene.ts ~1117, `town-ui__bark-portrait`).

## SCOPE (each independently checkable):
1. Reproduce: throttle/defer texture resolution on a town boot (devtools-style network throttle or a test seam delaying the texture promises) and capture the naked-town state the owner saw.
2. Fix the town boot path with the same discipline the run scene got: textures that resolve AFTER first render must apply on resolve (material update + needsUpdate), never silently stay flat; a not-yet-ready facade/tile renders its placeholder art, never a flat color block, and re-dresses when ready.
3. The bark card portrait <img> gets a load-failure/late-load path: retry-once or placeholder frame with the actor's initial, never a permanently empty box within a session.
4. e2e `e2e/town-fresh-boot-textures.spec.ts`: a town boot with delayed texture resolution converges to textured facades/ground within N seconds WITHOUT reload (probe material/texture state via diagnostics), bark portrait renders or falls back, zero console/page errors, desktop + mobile-390.

## Firewall
Touch ONLY: src/town/TownScene.ts texture-application paths (no layout/sim/coordinate changes), the minimal shared texture-ready helper if the run-scene fix exposes one, e2e/town-fresh-boot-textures.spec.ts, artifacts/town-fresh-boot/. NO townsfolk.ts actor data, NO layer contracts, NO run-scene regressions (its spec stays unmodified-green), NO asset regeneration.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green · new spec green desktop+mobile-390 · the fresh-scene run spec + town-t1/t5 + cast-motion-wiring UNMODIFIED-green · zero console/page errors · before/after screenshots of the delayed-texture boot.
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.
END: READY-FOR-GATES + report the reproduced failure mode and which textures were applied late vs placeholdered.
