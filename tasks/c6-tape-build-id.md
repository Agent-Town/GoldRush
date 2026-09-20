# Task c6-tape-build-id: tapes carry their build, the assayer names skew honestly (lane-d, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; the F-ASSAY-SKEW row in tasks/BACKLOG.md + docs/ops/agenttown-server.md §Incidents (incident 2 — the owner's own tape replayed to a full-budget timeout after a same-day engine change; the successor slice is named there verbatim: "tapes record their build-id; the worker replays against the matching build or declares skew explicitly"); scripts/gr-sim.mjs (the headless recorder — c1 already made ids collision-free there); src/game/Game.ts tape-recording seam (the browser recorder; find where the v2 tape envelope + runStart are written); functions/api/standings.ts (tape validation — c1's `unassayable` verdict vocabulary is MERGED and is the verdict this slice reuses); scripts/assay-worker.mjs + scripts/assay-replay*.mjs (where the replayer knows its own checkout).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff — l1-ledger-service-core's runner commit IS merged at `ca09d084e5`), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): changes confined to `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` are NEVER a STOP — list and proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (F-ASSAY-SKEW, recorded from the first live verification 2026-08-22)
A tape recorded before an engine change replays to a different event stream after it; today the worker's only vocabulary for that is a hash-mismatch `rejected` (or a timeout), which charges the rider for the county's own patch. Players WILL submit across patch windows at launch. The cure was already named in the incident record; this slice builds it.

## Scope
1. **Record the build**: both recorders stamp `meta.buildId` into the v2 tape envelope at RECORD time — the browser recorder from the deployed build id (`version.json` / the baked `CF_PAGES_COMMIT_SHA` — find how the client can read its own build; if it cannot, the submission endpoint may stamp it server-side from its own deployment id, but prefer record-time truth and SAY which you shipped), gr-sim from `git rev-parse --short HEAD` of its checkout (recorded-never-re-derived, same law as runStart).
2. **Validate additively**: functions accept (and preserve) `meta.buildId`; tapes WITHOUT it stay valid (every existing tape lacks it — no retroactive invalidation).
3. **The skew verdict**: the worker compares the tape's buildId against its own checkout's id BEFORE replaying. Mismatch → verdict `unassayable`, reason `build-skew (tape <id>, assayer <id>)` — reusing c1's retry-free unassayable path (no retries for skew; it is deterministic). Missing buildId → replay as today (legacy tapes keep their current behavior).
4. **Tests**: gr-sim stamps it (pin the field's presence, not its value); validator accepts with/without; worker skew path posts unassayable with the reason; a matching-id tape still replays to `verified` (the round-2 fixture under artifacts/assay-e2e-20260822/ is the corpus — do not regenerate it, synthesize the matching case).
5. NO changes to hash semantics, ranking, or the replay engines themselves.

## Firewall
Touch ONLY: scripts/gr-sim.mjs (envelope stamp), the browser tape-recording seam in src/game/Game.ts (stamp only), functions/api/standings.ts (validation, additive), scripts/assay-worker.mjs (the pre-replay comparison), their tests, BACKLOG row. NO changes to: sim semantics, event-log hashing, verdict flow for verified/rejected, tape id minting (c1's), server/ledger/** (L1 ports this later — note the follow-up in your report instead of editing it).

## Self-check (evidence, not vibes)
tsc + `npm run build` green; test:stats + test:accounts + test:mp + the assay/worker test files green; gr-sim determinism pins unmoved (the stamp lives in meta, OUTSIDE the hashed event log — prove by pinning an existing fixture's hash before/after); floors `--check` clean. End: READY-FOR-GATES + report: which build-id source shipped per recorder, the skew-verdict wording, the L1-port follow-up note, test counts.

## No-op / honesty guard
If `meta` cannot carry the field without moving any recorded hash, STOP and report the coupling — never move a shipped tape's hash. If the browser genuinely cannot know its build id at record time, say so and ship the server-side stamp with the trade named.
