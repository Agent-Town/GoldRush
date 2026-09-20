# Task renderer-count-artifacts-under-shared-atlas: re-record the exact renderer-count pins the atlas dedupe moved (LANE-D, commit prefix "test:")

You are the implementer for Gold Rush (Claude Opus 5 in wave 2; Codex is out of quota), running natively on Robin's Mac in `worktrees/lane-d` (branch `lane/d`).
READ FIRST: AGENTS.md; `reviews/shared-atlas-texture-dedupe.md` and `reviews/asset-diet-explicit-manifest.md` (the control run that attributed these reds: F-SAD-3); `e2e/renderer-count-artifact.ts` (`verifyAndWriteRendererCounts` at `:20`: "the artifact is a REQUIRED INPUT, not an output" — a new expectation is added by MEASURING it, see `artifacts/f1476-1/measure.mjs`); `e2e/wire-crawler-3d.spec.ts:115` ("mounts the Crawler GLB, flips all three damage morphs, and disposes on kill") and `e2e/wire-railcar-3d.spec.ts:63` ("GLB rides the rail, exposes all three damage morphs, preserves wreckage, and disposes"); the recorded artifacts under `artifacts/wire-crawler-3d/` and `artifacts/wire-railcar-3d/`; `src/assets/SharedAtlasPlugin.ts` (why five decoded images became one).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (Owner, 2026-09-05: "Ok, lets switch implementation to Opus 5 I guess?" after "lets have it fix these findings. This is important stuff."; F-SAD-3, attended control run 2026-09-05)
Both specs pin EXACT `renderer.info.memory.textures` counts recorded before the shared-atlas dedupe (`b7fdb9796` → now `bbf1c3832` after the trace rewrite): crawler `loadedBeforeKill.textures` 40 → 39, railcar `baseline.textures` 39 → 37 and 37 → 35. The dedupe lowered them BY DESIGN (one texture per atlas-content hash). The morph and dispose assertions are untouched and still true; only the recorded counts are stale.

## Scope
1. Re-measure the renderer-count artifacts for both specs with the measuring path the helper prescribes (`artifacts/f1476-1/measure.mjs` pattern), on current main, desktop AND 390px, and commit the re-recorded artifacts with a note naming the atlas dedupe as the cause and the old → new numbers.
2. Keep every non-count assertion exactly as it is (morphs, wreckage, dispose-on-kill, geometry deltas).
3. Prove: both specs green both projects; the delta assertions (`textures - 1` on kill, etc.) still hold under sharing — if a delta no longer holds because two meshes now share an image, say which and re-record it with the reason, never loosen to a range.

## Firewall
Touch ONLY: `artifacts/wire-crawler-3d/**`, `artifacts/wire-railcar-3d/**` (the recorded counts), the two specs ONLY if a delta expectation must change (name it), `tasks/BACKLOG.md` (your row). NO changes to: `src/**`, `e2e/renderer-count-artifact.ts`, other specs.

## No-op / honesty guard
If you find yourself about to exit without changes, WRITE WHY into your report first. If a scope item is impossible inside the firewall, do the others, COMMIT them, and report the coupling as file:line — do not widen the firewall yourself.

## Self-check (evidence, not vibes)
Both specs green desktop + 390px on your own dev-server port; the old → new count table in `artifacts/wire-crawler-3d/report.md`; zero console/page errors.
End: READY-FOR-GATES + the count table.
