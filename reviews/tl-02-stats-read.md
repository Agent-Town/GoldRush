# Review — tl-02-stats-read (TL-02 completion drain)

- **Slice/branch/tip:** `tl-02-stats-read` · lane-a worktree on `lane/m3` · commit `9d0e8dd` ("runner(lane-a): tl-02-stats-read.md")
- **Drained by:** s278 fire → main
- **Verdict:** ✅ MERGE (server-only additive completion of TL-02, which shipped its endpoint at s259)

## What it does
The `GET /api/stats` endpoint itself was already SHIPPED at s259 (`functions/api/stats.ts` → main `47f13ae`). This task — queued deliberately by the attended s-night session (`898d083`) — completes the two things the s259 ship lacked, plus one small consistency fix:

1. **`docs/api-stats.md` (new, +85):** the public contract doc — response shapes (populated + empty), cache/CORS rules, the exact TL-01 aggregate keys consumed, and how to run the harness. Additive.
2. **`scripts/test-stats.mjs` (new, +337):** a wrangler-pages-dev + local-KV harness (MP-01 pattern) that seeds fake tallies, GETs `/api/stats`, and asserts empty state, aggregation math (runs today/7d/all-time, median bucket, busiest-contract argmax, tier/device split, frame-p95 buckets, waves histogram, updatedAt passthrough), cache headers, CORS/method guards (403 bad-origin, 405 non-GET, 204 preflight), and that **no identifier-shaped keys** (email/profile/wallet/ip/nonce) and **no `telemetry:dedup:*` keys** ever escape. Additive dev tool (not wired into CI `npm test`).
3. **`functions/api/stats.ts` (+9/-5):** hoists `publicCors = { ...cors, 'Cache-Control': PUBLIC_CACHE }` and returns it from the empty-state, populated, and catch paths. Before, only the populated path carried `Cache-Control: public, max-age=60, s-maxage=60`; the empty/error paths returned `no-store`. Now **all successful GET responses** carry the ~60s public cache (scope #2; the site polls ~60s regardless of populated/empty). The 403 cors-forbidden, 405 method, and 204 OPTIONS paths are UNCHANGED (still base `cors`/no-store). **Aggregation logic and the response payload shape are byte-unchanged from s259** — safe-by-construction (aggregates only, never single-run rows) holds.

## Evidence
| Gate | Result |
|------|--------|
| Graft integrity | `git diff --cached 9d0e8dd -- <3 files>` = EMPTY → working tree byte-identical to the runner commit |
| `npx tsc --noEmit` | ✅ clean (root tsconfig covers `functions/`; no separate functions tsconfig) |
| `npm run build` (`tsc && vite build`) | ✅ green — built in ~970ms, no errors (pre-existing >900kB chunk-size warning only) |
| `scripts/test-stats.mjs` harness | ⚠ ENV-GATED — `wrangler` is approval-gated in this headless fire; the harness spawns `wrangler pages dev` + `wrangler kv bulk put` which cannot boot without approval. Manually verified instead (below). |
| Game client (`src/`) | UNTOUCHED — game boot/e2e gates N/A this drain (nothing in the game changed; running them would be theater) |

### Manual verification (in lieu of the env-gated harness)
Read `functions/api/stats.ts` post-graft and traced every return path:
- Empty (no TELEMETRY binding, `allTime<=0`, or catch) → `json(publicCors, emptyPayload(), 200)` → `{ ok:true, empty:true, message:"the office opens with the first assay", stats:<zero-filled> }` + `Cache-Control: public, max-age=60, s-maxage=60`. ✓ matches doc + scope #2 + #3.
- Populated → `json(publicCors, { ok:true, empty:false, stats }, 200)` — payload identical to s259. ✓
- 403 cors-forbidden / 405 non-GET / 204 OPTIONS → base `cors` (no-store), unchanged. ✓
- No new fields; `emptyPayload()`/`loadStats()` untouched → no identifier can escape (aggregate-only, as s259). ✓

## Merge classification
- Base: `lane/m3` predates the s-night merges, so `git diff main..lane/m3` is noisy (main's later work appears in reverse). Isolated **only commit `9d0e8dd`'s own 3-file diff** rather than merging the branch (avoids reverting main).
- `functions/api/stats.ts`: MAIN + LANE both descend from blob `b0fd44e` (main's `stats.ts` still matched the patch pre-image exactly) → clean forward apply, no 3-way needed.
- `docs/api-stats.md`, `scripts/test-stats.mjs`: absent in main → clean adds.
- `tasks/BACKLOG.md`: the runner's hunk targeted a stale base; hand-applied the semantic equivalent to main's current TL-02 line (main also carries TL-03a s261 info the runner's base lacked) — noted the completion drain there.
- Grafted via Edit/Write (fires are denied cherry-pick/checkout per the fire-git-permission map), then `git diff --cached 9d0e8dd` confirmed byte-identity.

## Findings
- **F-tl02sr-1 (non-blocking, informational):** the harness (`scripts/test-stats.mjs`) was not executed this drain (wrangler approval-gated headless). It is a dev tool, not part of `npm test`, so it gates nothing in CI; the behavior it asserts was verified by reading. An attended session with a wrangler login can run it once to confirm green end-to-end.
- No blocking findings. Firewall held exactly (the 4 declared files; zero src/sim/client/site/ingest).
