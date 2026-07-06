# Review — w1-03 light + atmosphere (lane-c drain attempt, s87 fire)

**Verdict: FAIL — NOT merged. Corrective re-queued to `tasks/queue/lane-c/`.**

## What w1-03 did (lane/polish, footprint `dd536b9..lane/polish`)
Replaced the inline `createScene` lights with a `src/world/LightRig.ts` module (sun + hemisphere + soft/blob shadow ladder), added fog (near 32 / far 72), a paper-grain post overlay, hero/prospector blob shadows, water phase-variance, and `Balance.world` atmosphere knobs + `light` diagnostics. The graft itself was clean: only Balance.ts / Game.ts / vite-env.d.ts collided with this fire's 041 + SCI-02 landings — all three merged cleanly via `git merge-file` (disjoint additive regions; no conflict markers; tsc + build green).

## Blocking finding
- **F-W1-03-1 (BLOCKS):** `e2e/vp-03-terrain-variety.spec.ts` — 2 **desktop-chrome** tests fail with w1-03 applied:
  - `:56 distant bank ground varies without adding draw calls`
  - `:68 same seed renders deterministic bank ground`
  **Mobile passes both.** Since the failures are desktop-only, the cause is on the desktop atmosphere path (`shadowsQuality: 'soft'` + full post/fog) — NOT the mobile `'blob'` path. Most likely the fog (near 32 / far 72) washes out the distant-bank pixel variety below the `>1.25` mean-delta threshold, and/or a soft-shadow / post element breaks the frame-to-frame determinism (`<0.01`).
  **Proven w1-03-introduced, not pre-existing:** reverted the 6 w1-03 src files to main HEAD (via `git show HEAD:`), moved LightRig aside → **vp-03 passes 4/4 on clean HEAD** (13.3s). Re-applying w1-03 reproduces the 2 desktop failures.

## What DID pass (so the atmosphere work is mostly sound)
- `npx tsc --noEmit` clean; `npm run build` green.
- `e2e/w1-03-light.spec.ts` — pass (the slice's own spec).
- `w1-01-terrain-relief`, `w1-02-living-water`, `w1-06-vista`, `m1-01-claim-jumpers-death` — pass. 22 passed / 2 failed overall.

## Disposition
Gate protocol: a blocking finding → corrective task, not a merge. lane/polish's w1-03 commit is **not merged** (content was never on main), so re-running the master from clean main destroys nothing merge-worthy. Corrective appended to the master and re-queued to `tasks/queue/lane-c/`: re-implement w1-03 preserving distant-bank **variety** (mean-delta > 1.25 west vs east at desktop range) and **determinism** (< 0.01 same-seed) under the new fog/soft-shadow/post path — e.g. fog tuned so distant terrain contrast survives, and no time/random element in the desktop shadow/post that breaks same-seed reproduction. Keep `vp-03` green on BOTH projects.
