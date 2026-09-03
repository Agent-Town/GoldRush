# Task refusal-taxonomy: the door's refusal reasons become a per-rider failure taxonomy the almanac can read (lane-d, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; `docs/research/2026-09-03-harnessdev-and-the-county.md` §3 F (owner-approved 2026-09-03); `functions/api/standings.ts` (every refusal branch and its reason string: bad_payload, reel_not_current / lineage refusal ~:397-:448, unsecured, season closed ~:667, duration; enumerate them ALL with file:line); the ledger service under `server/` (the sqlite ledger the droplet runs: what it records per submission today; whether refusals are stored or only answered); `~/Claude/Projects/goldrush-gauntlet/memories/FORMAT.md` (where a rider's notebook would cite its refusal counts).
SEQUENCING LAW: verify `git log --oneline main | grep -q 'self-unified-grid'` is NOT required (independent); this lane runs the grid first by queue order, simply proceed.
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (HarnessDev: feedback improves a harness only when it exposes a concrete failure mode and the change is verified end to end)
The door already names every refusal. It answers the rider once and forgets. A rider evolving its charter cannot see that it was refused eleven times for duration and twice for an unstamped era.

## Scope
1. **Record refusals:** the ledger stores every refused submission's reason, contract, rider identity (anonId/profile) and time, alongside accepted rows (no tape bodies for refusals; reason + meta only). Name the table/columns; migration additive.
2. **The taxonomy endpoint:** `GET /api/refusals?rider=<anonId>` (and `?profile=`) returns counts per reason and the last N refusals with timestamps; rate-limited like the other read endpoints; no personal data beyond what standings already publish.
3. **The almanac hook (docs):** propose the FORMAT.md paragraph that a generation header cites its refusal counts (write it into the report for the attended session to land in the commons; do not push to the gauntlet repo).
4. **skill.md:** the endpoint and the full reason list documented under HONESTY LAWS; guards re-pinned.
5. **Tests:** `test:stats` for recorded refusals and the endpoint shape; a mutation proof that an unrecorded refusal reason reds the enumeration test (every branch in standings.ts must be in the taxonomy).

## Firewall
Touch ONLY: `functions/api/standings.ts` (record on refusal; no ranking change), the new endpoint file under `functions/api/`, the ledger schema/migration under `server/`, `public/skill.md` (+ guards), the tests, BACKLOG row. NO changes to: ranking, the sim, accepted-row semantics, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:stats` + `npm run test:node-guards` green (counts); the enumeration table (reason · file:line) quoted; the endpoint's sample response quoted from the fixture.
End: READY-FOR-GATES + the enumeration table and the FORMAT paragraph.

## No-op / honesty guard
If the ledger service is not in this repo (name where it lives), implement the worker half and STOP on the storage half with the exact missing piece.
