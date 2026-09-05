# Task prefetch-bounded-warming: the advance stream warms the destination and one successor, then stops (LANE-B, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/b`).
READ FIRST: AGENTS.md; `docs/reviews/2026-09-05-astra-3d-review.md` §2 (F-ASTRA-5); `src/assets/AdvanceStream.ts` (`advanceStreamPriority` `:35-:76`: priorities 1–2 are the likely destination and its successor; `:73` enqueues EVERY E1 contract at priority 3 and `:74` EVERY board contract at priority 4; `FETCH_BATCH = 2` at `:29`; saveData restricts to priority 1; lite disables); `e2e/advance-stream.spec.ts` ("menu idle warms town first and publishes progress", "saveData keeps tier one and skips bulk contract maps", "lite rendering skips unused 3D prefetch", "closing profiles resumes the menu stream", "launch aborts pending prefetch before the run requests its own map"), `e2e/advance-stream-cache-reuse.spec.ts`, `e2e/advance-stream-walkthrough.spec.ts`.
CODEX: model=gpt-6-astra effort=xhigh
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (Owner, 2026-09-05, verbatim: "Ok, then lets have it fix these findings. This is important stuff."; Astra F-ASTRA-5, verified attended 2026-09-05 at `AdvanceStream.ts:73-74`)
"Bounded concurrency is not bounded downloading." Two files at a time, forever, still fetches every board contract on a phone that came to play one. Astra: "preload the likely destination and, optionally, one successor. Stop after that or after a measured byte allowance. Resume further warming during deliberate idle time or a relevant navigation."

## Scope
1. **Normal mode warms priorities 1–2 only** (town + likely destination, or destination + successor per scene); delete the `:73-:74` sweeps from the default plan.
2. **A byte allowance:** sum the `content-length` (or measured body size) of completed prefetches per session; once `ADVANCE_STREAM_BYTE_ALLOWANCE` is reached (propose 24 MB on desktop tiers, 12 MB on mobile-class/lite-adjacent tiers — justify from the measured per-contract sizes you print), schedule nothing further, even at priority 2. Publish `assetPrefetchAllowance` and `assetPrefetchBytes` in the canvas dataset next to the existing fields.
3. **Deep warming is explicit:** the old sweep runs only (a) when a persisted opt-in "Warm every map" setting is on (🔓 FIREWALL LIFT: the one settings/profile UI file that hosts the saveData-class toggles — name it in your report), or (b) one successor per idle window after a secured run's score screen.
4. **Tests:** update the advance-stream specs whose titles you change (list them); add "normal mode stops after the successor and honours the byte allowance" and "the warm-every-map opt-in restores the sweep"; `advance-stream-cache-reuse`, `advance-stream-walkthrough`, `asset-diet` unmodified-green both projects.

## Firewall
Touch ONLY: `src/assets/AdvanceStream.ts`, the ONE settings file named under scope 3, `e2e/advance-stream*.spec.ts`, `artifacts/prefetch-bounded-warming/**`, `tasks/BACKLOG.md` (your row). NO changes to: `Terrain3dClaimPilot.ts`, `TownTavernPilot.ts`, contract data, the sim, other tasks' fresh work.

## No-op / honesty guard
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. If a scope item is impossible inside the firewall, STOP with the coupling points as file:line and the measured evidence; do not widen the firewall yourself.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; the named specs green desktop + 390px, zero console/page errors; a table of per-contract prefetch bytes (measured) and the allowance decision in `artifacts/prefetch-bounded-warming/report.md`.
End: READY-FOR-GATES + the byte table, the allowance chosen and why, the opt-in's location.
