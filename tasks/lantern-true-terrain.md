# Task lantern-true-terrain: the Lantern Show draws the contract's real ground, not a grey schematic (lane-c, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; `src/ui/TrueReelRenderer.ts` (`TRUE_REEL_PLACEHOLDERS = ['terrain layout', 'decorative props']` at :28 — the reel draws real sprites over a flat ground); `src/replay/AgentTapeReplay.ts` (the one replay implementation both node and browser run; its snapshot does NOT carry terrain); `src/sim/HeadlessContractSim.ts` ~:700-710 (how the sim builds its `Terrain`/harvest anchors from the contract manifest's `tileParams` + seed — deterministic, so the browser can rebuild the same ground without the snapshot); `reviews/true-reel-sprites.md` (the sprite pass and its perf table; the bar this task inherits); the era-5 reel deep link `/goldrush/?watch=<reelId>&contract=<id>&epoch=<id>` (`src/main.ts:390`).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner playtest 2026-09-02, `docs/playtests/2026-09-02-robin-playtest-16.md`, F-PT16-2)
Owner, verbatim: "in the lantern run for the winning agent entry - the map is not displayed but only a schematic view of a grey area is shown. That is a bit disappointing." Verified: the true reel names 'terrain layout' as a placeholder (TrueReelRenderer.ts:28) because the replay snapshot carries no ground; but the ground is a pure function of the contract manifest and seed, which the show already has (the deep link carries contract + epoch, and the replay runs the sim's own world).

## Scope
1. **Draw the real ground under the reel from the manifest + seed, never from the snapshot:** the tile's terrain (heights as the game's ground atlas or a faithful shaded projection with contours), water, cliffs/impassable bands, seam anchors, build pads, spawn edges — the same `tileParams` the sim consumed. Reuse the game's terrain builder if it can run inside the show at budget; otherwise a 2D projection derived from the same data, with the derivation named in the report.
2. **Props:** if the tile's decorative scatter is deterministic from the seed, draw it; if it is not, KEEP 'decorative props' in `TRUE_REEL_PLACEHOLDERS` (the legend must stay honest). Remove 'terrain layout' from the placeholders ONLY when the ground is truly drawn.
3. **Every board's ground:** the six landing boards (the-claim, dry-gulch, twin-banks, night-shift, e2-hill-mine, e1-baron) render their own recognisable ground; the Hill Mine's terraces and the Night Shift's darkness read as such.
4. **Perf + mobile:** frame p95 within 15% of `reviews/true-reel-sprites.md`'s table on desktop and 390px; the show still starts in under 2 s on the crown reel.
5. **e2e:** the era-5 crown reel deep link renders ground (sample canvas pixels off the flat schematic grey, assert the legend no longer lists 'terrain layout'), desktop + 390px, zero console/page errors; screenshots to `reviews/shots-lantern-true-terrain/` for all six boards.

## Firewall
Touch ONLY: `src/ui/TrueReelRenderer.ts`, the Lantern Show UI files it composes with, any terrain-projection helper you add under `src/ui/` or `src/replay/` (read-only use of the terrain data), the e2e spec, BACKLOG row. NO changes to: the replay format or `AgentTapeReplay.ts` semantics, the sim, standings/ranking, the snapshot schema, sprites already shipped, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; the new spec green desktop + 390px; `e2e/*reel*.spec.ts` and `e2e/*lantern*.spec.ts` (list them) unmodified-green both projects; zero console/page errors; the perf line of scope 4 with real numbers; six screenshots at the paths above.
End: READY-FOR-GATES + the ground derivation used, the placeholder list after, the perf table.

## No-op / honesty guard
If the ground cannot be rebuilt from manifest + seed in the browser (name the missing input with file:line), STOP and report rather than drawing a decorative approximation; a fake map is worse than an honest grey one.
