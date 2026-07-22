# reviews/bug-office-api.md — RF-03a THE BUG OFFICE (api half)

**Slice:** RF-03a (lane-b / lane/m4, tip `d02a7dc031d09133207dbe08f6cc1ef782f9d668` `runner(lane-b): lane-bug-office-api.md`)
**Drained:** s901 fire, 2026-07-22
**Verdict:** PASS — merged to main (3-way `--no-ff`, base `6d6fc7f4`).

## What it does
The server half of THE BUG OFFICE (owner pivot: the unused Assay Office becomes an in-game bug-report desk for
the testing era). A new Cloudflare Pages Function stack:
- `functions/api/bug-report.ts` (POST) → `postBug`: validates + stores a report to the `TELEMETRY` KV
  (`bug:<id>`), returns the ticket id. CORS allow-list (`gold-rush-3in.pages.dev`, `agenttown.app`,
  `www.agenttown.app`); IP-hash rate limit **5 reports/hour** (429 after); caps — screenshot **180 KiB decoded**,
  JSON **260 KiB**, description 2000, name 24; only the chosen prospector-name stored (no PII beyond it);
  in-world error copy on every failure (no sensitive leak).
- `functions/api/bugs.ts` (GET) + `functions/api/bugs/[id].ts` → `listBugs`/`getBug`: **token-gated**
  (`BUG_OFFICE_TOKEN` env); unauthorized reads **look absent** (decline, not a 401 that confirms the endpoint);
  the paged list **strips screenshots** (summaries only); id-fetch returns the full report incl. screenshot.
- `scripts/fetch-bugs.mjs`: the attended-session pull tool (token-gated) — reports land with Robin + attended.

No client/game code changed — this is purely the POST/read backend. The player-facing COMPLAINTS DESK that calls
it is **RF-03b (still sequenced, re-queued this fire — see below)**.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.26s |
| `e2e/bug-office-api.spec.ts` (own spec, spawns real `wrangler pages dev` + KV binding) | **8 passed** (4 tests × desktop+mobile, 1.5s) |
| — round-trips a report, screenshots kept out of the paged list | PASS |
| — rejects a JPEG over the decoded 180 KiB cap | PASS |
| — rate-limits the sixth report from one IP | PASS |
| — tokenless reads look absent | PASS |

The spec exercises the function through a live wrangler worker with a KV binding — the size-cap, rate-limit and
token-gate assertions cannot pass without the real code path running, so this is genuine round-trip proof.

## Merge classification
Base `6d6fc7f4`; main at `bbcba57d` (s901's RF-01 drain + lock). Clean 3-way, **zero conflicts** — all 6 files
NEW/additive, disjoint from RF-01's touch-set. LANE-TOUCHED: `functions/api/_bugs.ts`,
`functions/api/bug-report.ts`, `functions/api/bugs.ts`, `functions/api/bugs/[id].ts`, `scripts/fetch-bugs.mjs`,
`e2e/bug-office-api.spec.ts`. tasks/ churn in the two-dot diff = MAIN-MOVED (lane never touched it).

## Findings
- **F-rf03a-1 (non-blocking, minor):** `listBugs` lists KV `prefix: 'bug:'`, which also matches the
  rate-limit counter keys `bug:ratelimit:<hash>`; those parse to `null` and are filtered out, so no leak — but
  they consume slots against `limit`, so a page can return fewer reports than exist (still all reachable via
  cursor). Cosmetic for an attended triage tool; a future tidy could namespace counters under a non-`bug:`
  prefix. No corrective spawned.
- **No player-visible surface** → per the GZ filter law, **no gazette item** for this slice (the desk RF-03b is
  the player-facing half and will carry the news).
