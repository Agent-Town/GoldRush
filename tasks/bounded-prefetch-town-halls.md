# Task bounded-prefetch-town-halls: the town's bulk halls belong to the town, and the stream names its terminal state (LANE-B, commit prefix "fix:")

You are the implementer for Gold Rush (Claude Opus 5 in wave 2; Codex is out of quota), running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/b`).
READ FIRST: AGENTS.md; `reviews/prefetch-bounded-warming.md` and `reviews/asset-diet-explicit-manifest.md` (F-PBW-2, attended control run 2026-09-05); `src/assets/AdvanceStream.ts` (states published: `fetching`, `paused`, `resolving`, `settling`, and `ready`/`partial`/`pending` for the town at `:137` and `:183`; the byte allowance at `:112`, `:175`, `:251`; priorities 1–2 only in normal mode); `src/town/TownTavernPilot.ts:43` (`townPrefetchUrls`, stamp-mill and dynamo-hall at `:18-:29`); `e2e/town-stamp-mill-blender.spec.ts:148` ("normal connections prefetch both bulk town halls": waits for `assetPrefetchState === 'ready'` and expects the two halls in the plan); `e2e/advance-stream*.spec.ts`.
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (Owner, 2026-09-05: "Ok, lets switch implementation to Opus 5 I guess?" after "lets have it fix these findings. This is important stuff."; F-PBW-2)
The bounded stream (`dfbed9491` → `065252649`) warms priorities 1–2 under a byte allowance; the town-halls spec, unchanged, times out waiting for `ready` and expects the stamp mill and dynamo hall in the normal-mode plan. Two questions the slice left open: are the bulk halls part of the TOWN's priority-1 set (they are the town), and what terminal state does the stream publish when the allowance stops it (a spec cannot wait for a state that never comes).

## Scope
1. Decide and implement: the town's priority-1 set includes its bulk halls under normal connections (saveData keeps excluding them, as today); measure the town's priority-1 bytes with the halls and show it fits the 12 MB mobile allowance with the destination — if it does not, say so and propose the allowance number instead of silently raising it.
2. Terminal states: when the allowance stops the stream, publish an explicit `assetPrefetchState` value (name it, e.g. `allowance`) distinct from `ready`/`partial`/`paused`, and document the state machine in a comment at the top of `AdvanceStream.ts`.
3. Update `e2e/town-stamp-mill-blender.spec.ts:148` to the new law (name the changed assertions); `advance-stream`, `advance-stream-bounded`, `advance-stream-cache-reuse`, `advance-stream-walkthrough` unmodified-green both projects.

## Firewall
Touch ONLY: `src/assets/AdvanceStream.ts`, `src/town/TownTavernPilot.ts` (only if the URL grouping must move), `e2e/town-stamp-mill-blender.spec.ts`, `e2e/advance-stream-bounded.spec.ts` (only to assert the new terminal state), `artifacts/bounded-prefetch-town-halls/**`, `tasks/BACKLOG.md` (your row). NO changes to: the sim, contract data, `Terrain3dClaimPilot.ts`, the settings UI.

## No-op / honesty guard
If you find yourself about to exit without changes, WRITE WHY into your report first. If a scope item is impossible inside the firewall, do the others, COMMIT them, and report the coupling as file:line — do not widen the firewall yourself.

## Self-check (evidence, not vibes)
tsc + build green; the five named specs green desktop + 390px on your own port, zero console/page errors; the byte table for the town set in `artifacts/bounded-prefetch-town-halls/report.md`.
End: READY-FOR-GATES + the byte table, the state machine, the changed assertions.
