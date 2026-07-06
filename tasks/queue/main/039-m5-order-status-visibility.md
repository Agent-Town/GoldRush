# Task 039: crafting orders must stay visible — pending status across boots (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; docs/playtests/2026-07-06-robin-playtest-01.md F1; src/crafting/CraftingQueue.ts + AssayBench.ts; vite.config.ts crafting middleware. SEQUENCING LAW: task 037 (assay-bench un-gate) is ALREADY MERGED (commit `2c1beb5` `feat(m5): 037 assay-bench-ungate`) — its precondition is SATISFIED, PROCEED. Confirm once with `git log --oneline | grep -q 2c1beb5` (037 is now ~20 commits back, so do NOT gate on `git log -12` — that stale window is exactly why the prior run of this task no-op'd). Only STOP if that grep genuinely finds nothing. Pre-flight: zero staged/modified TRACKED files (`??` untracked host debris expected — list briefly, proceed).

## Why (owner-hit, live play 2026-07-06)
Robin posted an order ("…spark rig to shoot at more than one enemy at once", still in pending/), reloaded twice, and could not find it again. Root cause: the bench builds its lists from `import.meta.glob` of `approved/` + `rejected/` ONLY (CraftingQueue.ts:31,35) — `pending/` is written via the middleware but NEVER read back. Posted orders vanish from the player's view until some future verdict. The player must always be able to see what they ordered and where it stands.

## Scope
1. **Read path for live queue state**: add a GET endpoint to the existing dev middleware (e.g. `/__goldrush/crafting-queue/state`) that lists pending/approved/rejected for the active profile from disk at request time. Bench fetches it on open (and on post), falling back to the build-time globs when the endpoint is unavailable (prod build). Keep the existing contract.v1 shape validation on everything read.
2. **Pending section in the bench UI**: orders awaiting verdict render as their own rows — order text, timestamp, status copy in ledger voice (e.g. "at the assay works — check back next run"). NOT selectable for collection (nothing to collect yet); visibly distinct from approved/rejected. Robin's real pending order is the canonical manual test case — do not delete or move it.
3. **Verdict freshness**: after a verdict file appears (approved/rejected), a bench re-open shows it without a dev-server restart (the GET path gives this for free; confirm).
4. **Copy honesty**: approved items still say collection/application opens later (033 scope boundary stands — do NOT wire item effects in this task).

## Firewall
Touch ONLY: vite.config.ts middleware (additive GET), src/crafting/ (CraftingQueue read path + AssayBench pending rendering + styles), e2e. NO changes to: order posting format, contract validation rules, sim systems, 036/037's fixes.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. e2e (extend m5-04 or new spec): post order → reload page → bench shows it under pending; fixture approved/rejected still render; after dropping a synthetic approved JSON for that order id, re-open shows the verdict; pending-clean harness law (036) still holds — the test's own posts are cleaned, Robin's real order untouched. m2-01 12/12, m5-04 green, lane-c-activations 6/6, task-025 + m1-01 unmodified green, both projects, zero console/page errors. End: READY-FOR-GATES + files + results.
