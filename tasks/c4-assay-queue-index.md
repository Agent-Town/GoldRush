# Task c4-assay-queue-index: the assay queue poll costs ONE read, not the whole county (lane-d, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; functions/api/standings.ts (onRequestAssayQueue at ~:188-218 reads EVERY board every poll — `CONTRACT_BUNDLES.flatMap(... readBoard)`; the three assay write sites: submission-with-tape, onRequestAssayVerdict, the requeue/pending flip); scripts/test-standings.mjs (the harness you extend); docs/ops/agenttown-server.md §"KV budget" (the incident this cures). Your predecessor c1-assay-fairness is MERGED (`2f4a0fe7ba24`) — build on current main; the unassayable vocabulary and exact-match slips are already in.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff — c1's `runner(lane-d)` commit IS merged), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): changes confined to `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` are NEVER a STOP — list and proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (Cloudflare cap notification, owner 2026-08-22: "KV operations are nearing the daily cap … used 50% of the daily Workers KV free tier limit")
Measured, not guessed: `onRequestAssayQueue` performs one KV `get` PER CONTRACT per poll — 41 boards (42 contracts minus the drill yard) × 5,760 polls/day at the worker's 15s default = **~236,000 reads/day against a 100,000/day free cap**, from an IDLE worker. Interim ops fix already live (droplet `ASSAY_POLL_MS=180000` → ~20k/day) at the cost of ≤3-minute verification latency. This slice makes the poll cost O(pending), so the cadence can return to seconds and stay free-tier at launch scale.

## Scope
1. **The index key**: a single KV key (e.g. `assay-queue-index`) holding a compact JSON array of pending locators `{epochId, contractId, tapeId, rowId, submittedAt}`. Maintained at the THREE write sites: submission-with-tape appends; a verdict (any of verified/rejected/unassayable) removes; a requeue/pending flip appends. Writes to the index ride the same request that already writes the board (one extra KV write per state change — the write budget is 1k/day free; state changes are rare, this fits).
2. **The cheap poll**: `onRequestAssayQueue` reads the index (1 get). Empty index → `{ok:true, queue:[]}` with ZERO board reads (the idle common case). Non-empty → fetch ONLY the boards the locators name, re-verify each row is still pending (the board stays the source of truth; the index is a hint, never trusted for row contents), and prune stale locators from the index when found. Response shape byte-compatible with today's.
3. **Self-heal**: index missing or unparseable → rebuild by the current full sweep, write it, serve from it. This also absorbs any pending rows that predate the index. Never 500 on a corrupt index.
4. **Tests** (extend scripts/test-standings.mjs with its existing KV stub, adding op-counting): (a) index maintained across submit → queue → verdict → requeue; (b) idle poll = exactly 1 KV read; (c) corrupt/missing index rebuilds and serves; (d) queue response equals the full-scan result on a seeded multi-board set; (e) a locator whose row was verified out from under the index is pruned, not served.
5. NO worker changes — the endpoint contract is unchanged and `scripts/assay-worker.mjs` must not be touched.

## Firewall
Touch ONLY: functions/api/standings.ts, scripts/test-standings.mjs, BACKLOG row. NO changes to: scripts/assay-worker.mjs, board row shapes, verdict semantics, ranked-board behavior, any src/**.

## Self-check (evidence, not vibes)
tsc + `npm run build` green (note: functions/ is outside tsc's include — the TESTS are the gate, run them). `npm run test:stats` + `node scripts/test-standings.mjs` (or its npm alias) green, including the new op-count assertions. `npm run test:accounts` + `npm run test:mp` unmodified-green (the F-1229-1 functions/ battery). Report the measured op counts per poll (idle and 1-pending) in the run report.
End: READY-FOR-GATES + report: ops-per-poll before/after, index write sites as built, the self-heal behavior, test counts.

## No-op / honesty guard
If you find the poll already reads O(pending) (someone landed this first), STOP and report where — do not layer a second index. Never serve the queue from the index without re-verifying against the board.
