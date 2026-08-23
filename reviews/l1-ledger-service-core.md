# l1-ledger-service-core — the county ledger runs as a node service on sqlite

**Slice:** `l1-ledger-service-core` (L1 of the ratified `specs/ops/ledger-on-droplet.md` program)
**Branch:** `lane/d` · **lane tip:** `6b94416e8` · **gated commit:** `7b7f616df` · **merge to main:** `7b7f616df` (fast-forward; main was `833330ce5`, the gate's own first parent, so the tree that landed is byte-identical to the tree that was gated — verified `main^{tree} == 7b7f616df^{tree}`)
**Drained:** s2233, 2026-08-23 · **gate:** detached worktree `gate-s2233/` (§3.0b — the attended session was live in main's tree this hour)

**VERDICT: PASS — MERGED.** Two non-blocking findings, one of which is owed to L3 and is recorded below.

## What it does

Puts a storage seam under the two Pages Functions that own the county ledger (`functions/api/standings.ts`, `functions/api/_accounts.ts`), then implements that seam twice: the existing Cloudflare KV binding on the edge path, and a new `node:sqlite` adapter behind a plain `node:http` service in `server/ledger/`. The service re-serves the same eleven endpoints (standings, assay queue/verdict, request-code/verify/session, the four save routes, delete-account) through a Request/Response shim onto the *same handler functions* — not a reimplementation. The acceptance suites were extended rather than rewritten, so every existing assertion now runs twice, once per backend.

Per the master's firewall this touches no `src/**`, no droplet, no deploy, no client. It is the service, proven; L2 and L3 carry it onto the box.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 2.97 s (asset-diet ceilings respected: herald 1,158,214 B of 1,500,000 B) |
| `functions/**/*.ts` type-checked | **10/10** (`function-cors-allowlist` + `site-contract` + `worker-type-coverage`, 11.4 s) — this is the real tsc for `functions/`, which sits outside the root tsconfig |
| `scripts/test-standings.mjs` | **111 KV + 111 SQLite** |
| `scripts/test-accounts.mjs` | **43 KV + 43 SQLite** |
| `scripts/test-ledger-worker.mjs` (new) | **15** — worker HTTP contract over a real socket |
| `scripts/test-stats.mjs` (adjacent, unmodified) | **87** |
| `scripts/test-multiplayer.mjs` (adjacent, unmodified) | **466** |
| Boot probe `_s2080-f1742-1`, `--workers=1` (§3.1) | **6/6**, desktop-chrome + mobile-chrome (390px), zero console/page errors, 50.1 s |

**CONTROL — the "zero behavior change on the edge path" claim, tested rather than accepted.** The master asserts the seam does not move the edge path. Re-running the *pre-merge* suites on main gave `standings 111` and `accounts 43`; the merged tree's KV arms give **exactly 111 and 43**, with the SQLite arms added alongside rather than replacing them. The claim holds empirically, and it also holds by reading: the only non-type change on the edge path is `extraOrigins?.has(origin)` in each `corsHeaders`, fed from `context.env.ALLOWED_CORS_ORIGINS`, which no Pages binding sets — so on the edge it is `undefined` and short-circuits.

**Boot-probe scratch port.** `:5188` was occupied by concurrent work, so the probe ran against a scratch vite on `:5234` via `GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL` (the Mistake #12 pattern, using the config's own designed external-server path).

**Not run, named rather than silently dropped:** `e2e/accounts-sync.spec.ts` is claimed exclusively by `playwright.accounts.config.ts` (wrangler worker + KV on `:8788`) and is excluded from the default harness by `claimedByAnotherConfig`. Its coverage of `_accounts.ts` is stood in for here by the 43-assertion KV control arm plus the whole-`functions/` type-check; a wrangler-harness run is owed at L3, when the deploy path is the subject.

## Merge classification

Base: `833330ce5` (main at gate time, and still main at merge time — verified, not assumed).

| File | Class | Note |
|---|---|---|
| `functions/api/_accounts.ts` | LANE-TOUCHED | type seam (`KVNamespaceLike` → exported `LedgerStorage`) + env-gated CORS hook |
| `functions/api/standings.ts` | LANE-TOUCHED | same, plus `StandingsStorage = Pick<LedgerStorage,'get'\|'put'>` — correct narrowing; standings genuinely never lists or deletes |
| `server/ledger/serve.mjs`, `server/ledger/storage.mjs` | LANE-ONLY (new) | — |
| `scripts/test-ledger-worker.mjs` | LANE-ONLY (new) | wired into `test:stats`, so it is a rooted gate and not an orphan script |
| `scripts/test-standings.mjs`, `scripts/test-accounts.mjs`, `package.json` | LANE-TOUCHED | auto-merged clean |
| `tasks/BACKLOG.md` | **BOTH-MOVED — one conflict, resolved** | see below |

**The one conflict.** `tasks/BACKLOG.md` head. Main carried the ledger-program row *plus* the `F-2232-1` row that lane/d never saw; lane/d carried the same program row with a fresher L1 status. Word-diff measured the divergence between the two copies of that row as **exactly one phrase** — `DISPATCHED)` vs `READY-FOR-GATES: KV + SQLite HTTP parity green locally)`. Resolved by keeping main's row (which alone carries the attended session's 12:32 owner amendment context and every row lane/d predates) and adopting the lane's fresher status phrase. Nothing from either side was dropped; the resolution script refused unless both expected phrases were present.

## Findings

**F-2233-1 (non-blocking, OWED TO L3 — the production service imports a devDependency).** `server/ledger/serve.mjs:6` imports `vite`, and `loadLedgerHandlers()` spins a vite dev server in middleware mode to `ssrLoadModule('/functions/api/standings.ts')` at runtime. `vite` is in **devDependencies** (`^8.0.13`); the package's only runtime `dependencies` are `lil-gui` and `three`. A droplet install of the shape `npm ci --omit=dev` therefore **cannot boot this service**, and the failure is at import time.

This is not a defect in L1 and is not being treated as one: it buys something real — one source of truth for the handler logic, with no build step that can drift from what the edge serves — and the master explicitly firewalled droplet and deploy work out of this slice. But it is a decision L3 inherits and must resolve deliberately, three ways available: promote `vite` to a runtime dependency, add a build step that emits the handlers to JS, or ship a small runtime transpile that is not a dev server. **L3's master must name this and pick one.**

**F-2233-2 (non-blocking, informational — one sqlite store backs two KV namespaces).** `serve.mjs:41` sets `{ ACCOUNTS: storage, TELEMETRY: storage }` — on Cloudflare these are two separate KV namespaces, and the port collapses them into one table. **Checked, not assumed: the key spaces are disjoint** — standings writes `standings:*` and the single `assay-queue-index`, accounts writes `save:*` and `attempts:*`. No collision is reachable today. Recorded because the safety is a property of current key prefixes, not of the design: anything that later introduces an unprefixed key on either side would silently cross namespaces. A one-line prefix per namespace would make it structural, and that is a fair L2 refinement.

**Checked and clear (recorded so a later reader does not re-take these):** the service binds `127.0.0.1` only, never `0.0.0.0`; request bodies are capped at 256 KiB with the oversize case signalled rather than silently truncated; `ASSAY_WORKER_SECRET`, `AUTH_CODE_PEPPER` and `RESEND_API_KEY` are read from env and never logged; the 500 path returns a fixed message and leaks no error detail; `PORT` is validated as a safe integer in 1–65535 rather than coerced.

## GZ-01

**No gazette item.** The filter is "the review names a player-visible change", and this one deliberately names none: zero `src/**`, no client, no deploy, no endpoint behavior change on the path players actually reach today. The news, when it comes, belongs to L3 — the day the county book actually moves onto the box.
