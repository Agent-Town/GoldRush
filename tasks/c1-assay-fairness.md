# Task c1-assay-fairness: instrument failures stop counting as rider lies + tape ids stop colliding (lane-d, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; reviews/assay-door-cure.md (the cured pipeline you extend); artifacts/assay-e2e-20260822/round2/ (the live evidence for both defects); docs/ops/agenttown-server.md (the worker's ops + the THREE recorded instances of the class); scripts/assay-worker.mjs + scripts/assay-replay.mjs + scripts/assay-replay-agent.mjs; functions/api/standings.ts (assayRequest / assay-verdict / the queue filter + validators).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): ahead content already on main = SAFE DUPE → `git checkout -B lane/d main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign edits. FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. `npm install --no-audit --no-fund`; build green.

## Why (three live incidents, all recorded)
**F-ASSAY-E2E-9**: an instrument crash (SIGTERM mid-replay; a timeout; an ENOSPC) is posted as `rejected` — the rider is charged with a false claim for the county's own infrastructure failure. Three real instances in docs/ops + the reviews. **F-ASSAY-E2E-10**: gr-sim derives the tape id from (contract, seed, difficulty, eventLogHash), so identical deterministic runs collide — both probe rows carry `agent-a7999390` and `?verdict=` resolves first-match, making the older slip unreachable.

## Scope
1. **The unassayable state**: the worker distinguishes INSTRUMENT failure (nonzero exit, spawn error, timeout, any exception before a hash was produced) from an honest MISMATCH (a replay that completed with a different hash). Instrument failure → do NOT post a verdict; retry with the existing backoff; after N attempts (default 3, env-tunable) POST verdict `unassayable` with the reason. Functions side: accept `unassayable` as a verdict value; the row keeps its tape, leaves the pending queue, is NOT ranked, and its slip serves the state honestly; a later re-queue (flip to pending) re-enters it cleanly. Mismatches stay `rejected` exactly as today.
2. **The id collision**: gr-sim's tape id gains a uniqueness component (the submission timestamp or a random suffix minted AT RECORDING, stored in the tape so determinism of the CONTENT is untouched — two identical runs are still byte-identical except the id field; document why that's the right trade in a comment). `?verdict=` resolves exact-match on the full id; the collision exhibit in artifacts round2 becomes the regression test's fixture.
3. Tests: worker-level (instrument-fail → retry → unassayable; mismatch → rejected; the flipped-back re-queue path) + the id-uniqueness property + the verdict-slip exact-match. Extend scripts/assay-worker.test.mjs / test-standings.
4. NO behavioral change to verified/rejected happy paths (prove: the round-2 tape still replays verified through the local flow).

## Firewall
Touch ONLY: scripts/assay-worker.mjs, scripts/assay-replay*.mjs (error classification only), scripts/gr-sim.mjs (id minting), functions/api/standings.ts (verdict vocabulary + slip resolution), their tests, BACKLOG row. NO sim semantics, no tape CONTENT changes beyond the id field, no ranked-board behavior for verified rows.

## Self-check
tsc + build green; test:stats + test:accounts + the assay/worker/standings test files green; node-guards (contention → solo, say so); gr-sim determinism pins unmoved. End: READY-FOR-GATES + report: the classification rules as built, retry/backoff numbers, the id scheme, test counts.

## No-op / honesty guard
If the verdict vocabulary change breaks a consumer you can't see, STOP and name it. Never loosen a validator.
