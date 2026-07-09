# Task tl-02: THE ASSAY OFFICE — public aggregate READ `GET /api/stats` (LANE-A, branch lane/m3, commit prefix "feat:") — FIRE-AUTHORED (s258, attended review welcome)

You are Codex, implementer for Gold Rush, native on Robin's Mac in worktrees/lane-a. READ FIRST (paths verified to exist s258):
- `AGENTS.md` (your law file).
- `specs/accounts/README.md` — THE SPEC. `## TELEMETRY` section, slice **TL-02 (fire-authorable, after TL-01)** is BINDING. Quote (line 27): "**TL-02 (fire-authorable, after TL-01): the public read.** `GET /api/stats` on the same functions/ worker — AGGREGATES ONLY, computed from the KV tallies: runs assayed (today / 7 days / all-time), deepest wave reached, median run duration, busiest contract, tier split, frame-p95 by device class. Edge-cached ~60s. Safe to publish BY CONSTRUCTION (the ingest payload carries no identifiers; the read serves only aggregates + coarse buckets, never single-run rows). Graceful empty state ('the office opens with the first assay'). Dev-gate vs wrangler dev before the production KV binding lands."
- **`functions/api/telemetry.ts` — THE INGEST ROUTE YOU ARE READING FROM (READ IT FIRST, it is the contract).** It is on main (`a47af3c`, shipped s257). The EXACT KV keys it writes (verified s258 by reading `storeAggregate` at lines 62-83) — your read MUST match these byte-for-byte:
  - `telemetry:runs:total` — integer string, all-time runs.
  - `telemetry:runs:day:${YYYY-MM-DD}` — integer string, runs that UTC day (`new Date().toISOString().slice(0,10)`).
  - `telemetry:contract:${contract}` — integer string per contract id (contract matches `/^[a-z0-9][a-z0-9-]{0,80}$/`).
  - `telemetry:tier:${FULL|BALANCED|LITE}` — integer string per tier.
  - `telemetry:device:${desktop|mobile|tablet}` — integer string per device class.
  - `telemetry:frameP95:${lt16|16-25|25-33|33-50|50plus}` — integer string, global frame-p95 histogram (buckets = `frameBucket()` at telemetry.ts:120-126).
  - `telemetry:device:${dc}:frameP95:${bucket}` — integer string, frame-p95 histogram PER device class (same buckets).
  - `telemetry:duration:${lt1m|1-3m|3-5m|5-10m|10-20m|20mplus}` — integer string, duration histogram (buckets = `durationBucket()` at telemetry.ts:128-136).
  - `telemetry:waves:${0-4|5-9|10-19|20-29|30-39|40plus}` — integer string, waves histogram (buckets = `waveBucket()` at telemetry.ts:138-145).
  - `telemetry:waves:max` — integer string, deepest wave ever (via `maxValue`).
  - `telemetry:updatedAt` — ISO timestamp string of the last stored run.
  - (Ignore `telemetry:dedup:${month}:${hash}` — dedup markers, NOT aggregates, NEVER read/serve them.)
  - **THE BINDING:** telemetry.ts reads `env.TELEMETRY` (type `KVNamespaceLike` = `{ get, put, list }`, telemetry.ts:7-15). YOUR route reads the SAME `env.TELEMETRY`. **Do NOT invent a different binding name, do NOT add `?? env.ACCOUNTS`** — the KV-binding-name mismatch (owner bound it `ACCOUNTS`) is **F-tl01-1, an OWNER/attended go-live call that fixes BOTH routes at once** (STATUS Robin-owes #1); your route must stay symmetric with telemetry.ts so the single owner fix covers it. When `env.TELEMETRY` is undefined (dev / pre-owner-binding), your route returns the graceful EMPTY state, never throws.
- `CLAUDE.md` §4 (evidence-first; ONE reader per surface — this is READ-ONLY, it writes NOTHING to KV), §9 (canon; frontier-tech; the agent is "the Prospector"), §9b (lore is content truth).

## Pre-flight (LANE-A, branch lane/m3 — SAFE-DUPE, judge by CONTENT not ahead-count)
1. lane/m3 will read as AHEAD of main by ~2 commits — those carry ONLY tl-01's already-merged content + the runner's `-A` screenshot churn (F-en02-1); tl-01's code is byte-present on main since `a47af3c` (verified s258: `git diff --stat main lane/m3 -- src e2e functions` == EMPTY). VERIFY it yourself: `git diff --stat main lane/m3 -- src e2e functions` — if EMPTY (or only main-AHEAD deletions, NO lane-unique src/e2e/functions additions) the branch is fully content-merged and reset-to-main is SAFE. If that diff shows ANY real lane-unique src/e2e/functions content NOT on main, STOP and report "lane/m3 has unmerged code: <files>" — do NOT reset over it (LANE-SAFETY LAW; the Reset Massacre).
2. When safe: `git checkout -B lane/m3 main && git clean -fd && npm install --no-audit --no-fund && npm run build` green before touching anything. (main carries TL-01 telemetry ingest + EN ledger + town chain + story:THE LOOP + save-slots + e2-enemies + 058 device-tiers — build on CURRENT main.)

## WHY (s258 fire, spec `specs/accounts/README.md` §TELEMETRY line 27, owner order 2026-07-09)
TL-01 (the INGEST half) SHIPPED s257 (main `a47af3c`, review `reviews/tl-01.md`): the beacon posts anonymous per-run stats and `functions/api/telemetry.ts` aggregates them into the KV tallies listed above. TL-02 is the READ half: a public `GET /api/stats` on the SAME worker that serves ONLY those aggregates — the numbers the eventual "Assay Office" website section (TL-03, a LATER slice) will display. It is READ-ONLY (writes nothing), touches NO client/sim code, and is safe to publish BY CONSTRUCTION (the ingest stores only counters + coarse buckets — never a per-run row, never an identifier). Fire-authorable per the spec; the evidence chain is the spec slice + the shipped telemetry.ts contract (read above) + `reviews/tl-01.md`.

**HONESTY on "median run duration" (design decision — quote this in your report):** the ingest stores durations ONLY as coarse buckets (`telemetry:duration:*`), never raw ms, so an exact median CANNOT be computed and MUST NOT be faked (reject-don't-stretch, CLAUDE.md §5 #14). Serve the **median duration BUCKET** instead — the bucket at which the cumulative run count crosses 50% of the total — and name the field honestly (`medianDurationBucket`, value e.g. `'3-5m'`, plus the bucket label set). Same honesty for waves: the histogram is bucketed; `deepestWave` comes from the exact `telemetry:waves:max`, and you MAY also serve the `wavesHistogram` buckets. Never present a bucket as a precise figure.

## Scope (each item independently testable; READ-ONLY, ADDITIVE — one new route + one new e2e ONLY)
1. **New route `functions/api/stats.ts`** (`onRequest`, GET only): mirror telemetry.ts's structure (same `KVNamespaceLike`/`TelemetryEnv` shapes — you MAY re-declare them locally or a tiny shared type; keep it self-contained, do NOT edit telemetry.ts). Method handling: `OPTIONS` → 204 with CORS; any method other than GET → 405; GET → the aggregate JSON. CORS: mirror telemetry.ts's `corsHeaders`/`ALLOWED_ORIGINS` origin handling EXACTLY (agenttown.app + www + gold-rush-3in.pages.dev + localhost/127.0.0.1) so the site can read it; a forbidden cross-origin → 403 like telemetry.ts.
2. **The aggregate computation** (read `env.TELEMETRY`, compute, return). Fields (ALL from the KV keys above — never fabricate):
   - `runs`: `{ today: <telemetry:runs:day:${todayUTC}>, sevenDays: <sum of telemetry:runs:day for the last 7 UTC dates incl. today>, allTime: <telemetry:runs:total> }` (each a number; missing key = 0).
   - `deepestWave`: `<telemetry:waves:max>` (number; missing = 0).
   - `medianDurationBucket`: the duration bucket crossing the 50th percentile of the `telemetry:duration:*` histogram (or `null` when total = 0); also return `durationHistogram`: `{ <bucket>: count }` for all six buckets.
   - `busiestContract`: `{ id: <argmax contract>, runs: <count> }` computed by `env.TELEMETRY.list({ prefix: 'telemetry:contract:' })` then reading each key (or `null` when none). On ties, pick the lexicographically-first id (deterministic).
   - `tierSplit`: `{ FULL, BALANCED, LITE }` (each a number; missing = 0).
   - `deviceSplit`: `{ desktop, mobile, tablet }` (each a number; missing = 0).
   - `frameP95ByDevice`: `{ desktop: {<bucket>:count,…}, mobile: {…}, tablet: {…} }` from `telemetry:device:${dc}:frameP95:*` (all five buckets present, missing = 0); also `frameP95Global`: the `telemetry:frameP95:*` histogram.
   - `wavesHistogram`: `{ <bucket>: count }` for all six wave buckets.
   - `updatedAt`: `<telemetry:updatedAt>` (string or `null`).
   Read keys concurrently (`Promise.all`) where possible; treat any non-finite/absent value as 0. NEVER read or serve a `telemetry:dedup:*` key.
3. **Graceful empty state (spec LAW).** When `env.TELEMETRY` is undefined (dev / pre-binding) OR when `telemetry:runs:total` resolves to 0/absent: return `200 { ok: true, empty: true, message: 'the office opens with the first assay', stats: <the zeroed shape above> }`. When populated: `200 { ok: true, empty: false, stats: {…} }`. The route NEVER throws into the response — wrap the KV reads in try/catch and fall back to the empty state on any KV error (a public read must never 500 the site).
4. **Edge cache ~60s (spec LAW).** On the successful GET response set `Cache-Control: public, max-age=60, s-maxage=60` (Cloudflare Pages edge honors `s-maxage`) + `Vary: Origin`. The empty/dev state may use a shorter cache or `no-store` — your call, but document it. (OPTIONS/405/403 stay `no-store`.)

## Firewall
Touch ONLY: new `functions/api/stats.ts`; new `e2e/tl-02-public-stats.spec.ts`; small shared type file under `functions/api/` ONLY if you genuinely need it (prefer self-contained). NO changes to: `functions/api/telemetry.ts` (READ its key contract, do NOT edit it — it is the ONE writer), any other `functions/api/*` route, the sim / any `src/**` (this slice has NO client surface — the website consumption is TL-03, a later slice; do NOT touch `site/`, StartMenu, the encyclopedia, or any client code), `wrangler.toml` (create nothing — the binding is owner's F-tl01-1 call), the profile schema, secrets/env files, any existing e2e assertion. Do NOT add the `?? env.ACCOUNTS` fallback (owner call; keep symmetric with telemetry.ts).

## Self-check (the gate you must pass)
- `npx tsc --noEmit` clean (client AND `functions/`); `npm run build` green (build unaffected — no src change, but prove it).
- New `e2e/tl-02-public-stats.spec.ts` GREEN — a **headless-safe functions unit test** (mirror tl-01's `import { onRequest as telemetryRoute } from '../functions/api/telemetry'` pattern): `import { onRequest as statsRoute } from '../functions/api/stats'`, build a **mock KV** implementing `get(key)`, `put(key,value)`, and `list({prefix})` over an in-memory `Map`, seed it with known tallies, and assert:
  - (a) **populated read**: seed `telemetry:runs:total=42`, some `telemetry:runs:day:*`, two `telemetry:contract:*` (e.g. `steady-hands=30`, `deep-vein=12`), tier/device/frameP95/duration/waves buckets, `telemetry:waves:max=37` → GET returns `empty:false` with `runs.allTime=42`, correct `sevenDays` sum, `deepestWave=37`, `busiestContract={id:'steady-hands',runs:30}`, tierSplit/deviceSplit/frameP95ByDevice/wavesHistogram matching the seed, and `medianDurationBucket` = the correct 50th-percentile bucket for the seeded duration histogram (assert the math on a hand-computed example).
  - (b) **empty state (bound but no runs)**: an EMPTY mock KV → `200 { ok:true, empty:true, message:'the office opens with the first assay' }` with a zeroed `stats` shape, no throw.
  - (c) **dev state (unbound)**: `env` with NO `TELEMETRY` → same graceful empty state, no throw.
  - (d) **method guard**: a POST (or PUT) → 405; an OPTIONS → 204 with CORS headers.
  - (e) **anonymity/read-safety proof**: the response body contains NO `telemetry:dedup:*` data and NO identifier-shaped field (assert the JSON has no `nonce/email/profile/wallet/ip/name/userId` keys anywhere) — aggregates + buckets only.
  - (f) **cache header**: the populated GET response carries `Cache-Control` with `s-maxage=60` (or `max-age=60`).
  - (g) **KV error resilience**: a mock KV whose `get` throws → the route still returns the graceful empty state (200), never 500.
- The **tl-01 spec still passes** (`e2e/tl-01-run-telemetry.spec.ts`, desktop) — proves the shared `functions/` dir + telemetry.ts are untouched and the ingest↔read contract holds.
- A plain boot probe (m1-01 desktop, or a `?debug`-free boot) with ZERO console/page errors — proves no client regression (there should be none: no src change).
- Screenshots/JSON into `artifacts/tl-02/`: dump the populated GET response JSON and the empty-state JSON from the e2e (so a human can eyeball the shape).
- Commit on lane/m3, prefix `feat:`, path-scoped adds ONLY (never `-A` — the runner's broad `-A` is the standing F-en02-1; add ONLY `functions/api/stats.ts` + `e2e/tl-02-public-stats.spec.ts` + `artifacts/tl-02/*` + any tiny shared type file).
- CANON/PRIVACY: the read serves only aggregates + coarse buckets, never a per-run row or identifier; any in-universe copy (the empty-state message) is honest and frontier-framed; the agent is "the Prospector".

## No-op guard
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate (Mistake #1).

End your report: **READY-FOR-GATES** + the exact `GET /api/stats` response JSON shape you built (both populated and empty) + the KV keys you read (confirm they match telemetry.ts's writers) + how `medianDurationBucket` is computed + the dev-vs-bound + KV-error behavior + the cache header you set + the full self-check results (tsc both projects, build, tl-02 spec a–g, tl-01 spec still green, boot probe). If any KV key or the `env.TELEMETRY` binding is WRONG vs telemetry.ts on current main (a key renamed, the binding changed), REPORT it as a finding — do NOT guess a key or fork the contract (generator proposes / contract disposes).
