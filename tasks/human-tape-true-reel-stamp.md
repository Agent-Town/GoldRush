# Task human-tape-true-reel-stamp: human tapes that carry standing orders can be watched — stamp them with the engine era at record time (lane-d, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; `reviews/same-laws-harvest-parity.md` F-SLHP-2 (the finding); `src/game/Game.ts` ~:6984 (a recorded tape whose entries contain an agent-orders action is routed to `startTrueRunTapeReplay`) and ~:7044–:7049 (`startTrueRunTapeReplay` refuses when `tape.meta` lacks `engineHash`/`era` or the era registry does not include the hash); `src/game/RunTape.ts` (the human tape recorder and its `meta`: today it stamps `buildId` but not `engineHash`/`era` for human runs; verify and cite); `scripts/assay-replay-agent.mjs` (`computeEngineHash`; the browser cannot compute it, so the build must EMBED the current era registry's head pin, the way the era refusal already reads `engineEra` at ~:7046); `assets/engine-era.json`.
SEQUENCING LAW: verify `git log --oneline main | grep -q 'era-mechanic-audit'` is NOT required (independent); but this lane runs the audit first by queue order, so simply proceed.
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-SLHP-2, drain review 2026-09-02; pre-existing since `795c5c4a3`, 2026-08-30)
A human who rides with the Second Rider (agent standing orders in a human run) records a tape the county cannot watch: the watch path sends it to the true reel because it contains agent orders, and the true reel refuses it as "unstamped build". Human reference tapes are canon (CAPABILITY-LADDER L4); an unwatchable human tape is a hole in the human path.

## Scope
1. **Stamp human tapes:** `RunTape` meta gains `engineHash` (the embedded registry head pin) and `era` at record time for every human run, exactly the fields the true reel checks; tapes recorded before the stamp stay valid on the tape show (no retroactive refusal).
2. **Route correctly:** a stamped human tape with agent orders replays in the true reel; a human tape WITHOUT agent orders keeps its current path (the tape show). Cite both branches.
3. **Suspend/resume:** a suspended run resumed in a later build keeps the stamp it was recorded under (the tape says what it was ridden on; the reel's refusal logic decides).
4. **Tests:** (a) `e2e/c7-standing-order-replay.spec.ts` (the pre-existing red the finding names) turns green both projects WITHOUT weakening its assertion, or the assertion is corrected with the reason quoted; (b) a new case: a freshly recorded human tape with one standing order watches to its own hash; (c) an old unstamped tape still opens on the tape show.

## Firewall
Touch ONLY: `src/game/RunTape.ts`, `src/game/Game.ts` (the routing branch and the meta read only), the registry embed site if one is needed, the two specs, BACKLOG row. NO changes to: `assets/engine-era.json`, the sim, standings/ranking, the worker's validation, `src/ui/TrueReelRenderer.ts`, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `e2e/c7-standing-order-replay.spec.ts` + the new cases green desktop + 390px; `e2e/tape-01-run-tape.spec.ts`, `e2e/tape-02-lantern-show.spec.ts`, `e2e/same-laws-harvest-parity.spec.ts` unmodified-green both projects; `npm run test:node-guards` green; zero console/page errors; the engine hash of the merged tree reported (src moves; the drain pins).
End: READY-FOR-GATES + the meta diff, the routing evidence, the c7 result.

## No-op / honesty guard
If human tapes are already stamped on current main (premise wrong), STOP and name the true refusal cause with file:line.
