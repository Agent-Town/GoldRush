# Task l1-ledger-service-core: the county ledger runs as a node service on sqlite — same contract, our box (lane-d, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; **specs/ops/ledger-on-droplet.md (RATIFIED 2026-08-23 — the laws bind this slice)**; functions/api/standings.ts + functions/api/_accounts.ts (the logic you port — including c1's unassayable vocabulary and c4's assay-queue-index, both merged); scripts/test-standings.mjs + scripts/test-accounts.mjs (the acceptance tests — they are the contract); scripts/assay-worker.mjs (a consumer whose HTTP contract must keep working).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): changes confined to `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` are NEVER a STOP — list and proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (owner ruling 2026-08-23, verbatim: "Lets move this to the server now.")
The county ledger (standings/accounts/assay state) moves off Cloudflare KV onto the droplet per the ratified spec. This slice builds the SERVICE and proves it against the existing suites; it does NOT touch the droplet, the client origin, or live traffic (those are L2/L3).

## Scope
1. **The storage seam**: extract the KV access in `functions/api/standings.ts` + `_accounts.ts` behind a minimal async storage interface (get/put/delete/list — mirror the KV surface the code actually uses, nothing speculative). The Pages Functions keep working on KV through it — ZERO behavior change on the edge path (prove: existing suites green unchanged).
2. **The sqlite adapter**: `server/ledger/` — a `node:sqlite` (node ≥26, the repo's own pin; NO native deps) implementation of that interface. WAL mode, `busy_timeout`, one `kv(key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER)` table is ACCEPTABLE for this slice (a key-value port is the low-risk first cut; relational refinement is a later owner-approvable slice — do NOT redesign the data model here).
3. **The service**: `server/ledger/serve.mjs` — a plain `node:http` server that routes the same paths the Pages Functions serve (`/api/standings*`, `/api/accounts*` — enumerate them from `functions/` routing, including the CORS preflights, the assay queue/verdict/slip endpoints, the worker-secret auth) onto the SAME handler logic via a Request/Response shim (node 26 has fetch-standard Request/Response built in). Config via env: `LEDGER_DB_PATH`, `PORT`, `ASSAY_WORKER_SECRET` (never logged), allowed CORS origins.
4. **Tests are ports, not rewrites**: extend `scripts/test-standings.mjs` + `scripts/test-accounts.mjs` (or add thin `*-sqlite` variants) so the SAME assertions run against (a) the KV-stubbed functions as today and (b) the sqlite-backed service over real HTTP on a scratch port. Both must be green in one `npm run` target each. Add: a worker-contract probe — `scripts/assay-worker.mjs`'s queue/verdict calls succeed against the service (spawn it, poll once, post a verdict, assert the row flips).
5. **No droplet, no client, no deploy changes**: `src/app/GameApi.ts`, `ops/droplet/**`, live KV, and the worker's shipped config are all OUT of scope.

## Firewall
Touch ONLY: `functions/api/standings.ts` + `functions/api/_accounts.ts` (seam extraction ONLY — no logic change), new files under `server/ledger/**`, `scripts/test-standings.mjs` / `scripts/test-accounts.mjs` (+ new test files), `package.json` (the two npm script targets), BACKLOG row. NO changes to: `src/**`, `scripts/assay-worker.mjs`, `scripts/gr-sim.mjs`, any verdict/ranking semantics, `ops/**`, deploy scripts.

## Self-check (evidence, not vibes)
tsc + `npm run build` green (functions/ is outside tsc — the suites are the gate). Existing `test:stats` + `test:accounts` + `test:mp` unmodified-green (the seam must not move the edge path). The new sqlite-backed runs green. The worker-contract probe green. Report the endpoint inventory you ported (path list) and any path you found that CANNOT be served off-edge (name it, do not silently drop it).
End: READY-FOR-GATES + report: endpoint inventory, both-backend suite counts, the storage interface surface, anything unportable.

## No-op / honesty guard
If the functions' logic turns out to depend on an edge-only facility (Durable Objects, cache API, cron triggers), STOP on that endpoint and name it in the report rather than approximating it. Never weaken a validator to make the port pass.
