# Review — tl-03a: The Assay Office, Window 1 (live website section)

- **Slice/branch/tip:** tl-03a-site-assay-office · lane/m3 · runner commit `32229b3` (grafted onto main as `<this drain>`)
- **Drained by:** s261 fire, 2026-07-09
- **Verdict:** ✅ SHIP — clean single-base additive graft, full gate battery green desktop+mobile, content canon+honesty verified.

## What it does
Adds the first of the Assay Office's three windows: a live "The Assay Office is open." section on the marketing site (`site/index.html`) that renders the anonymous run aggregates from `GET /api/stats` (shipped TL-02, `functions/api/stats.ts`), auto-refreshing every 60s. Fills runs today/7d/all-time, deepest wave, a *typical-run range*, and the busiest contract; falls back gracefully to the in-universe empty message ("the office opens with the first assay") and a quiet "the wire is quiet…" state on network failure — never throws, never parades zeros. Also corrects the now-false footer promise and adds an "Assay Office" nav anchor. Pure `site/` static (no build step, no framework, one same-origin fetch, no analytics/cookies/3rd-party).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` (client + functions) | clean |
| `npm run build` | green, 486ms (only the pre-existing 1.3MB monolithic-chunk warning) |
| `e2e/tl-03-assay-office-site.spec.ts` desktop-chrome + mobile-chrome(390px) | **10/10** (populated / empty / network-fail / auto-refresh / honesty+no-identifier) |
| `e2e/tl-02-public-stats.spec.ts` desktop + mobile | **8/8** — proves `functions/api/stats.ts` untouched |
| `e2e/m1-01-claim-jumpers-death.spec.ts` desktop (scratch preview :5231) | **4/4** — proves the game client is untouched by the `site/` edits |

Combined tl-03+tl-02 run: 18 passed (4.6s). m1-01: 4 passed (29.9s). Gate ran against a standalone fire config (`artifacts/tl-03/pw.config.mjs`) with no auto-webServer, to avoid colliding with the live 059/060 dev servers holding :5188 — the shared `playwright.config.ts` was NOT edited (firewall-clean). The tl-03 spec self-serves `site/` on an ephemeral `node:http` port; no `playwright.config.ts` change was needed or made.

## Merge classification
Single base `9e01cf9`; main was UNTOUCHED on `site/` + `e2e/tl-03-*` since base (verified `git diff --stat 9e01cf9 main -- site e2e/tl-03-…` == EMPTY) → clean additive graft, no 3-way needed. Grafted `git checkout lane/m3 --` exactly 7 paths, all NEW or `site/`-only, NONE on the sim/src path:
- NEW: `site/assay-office.js`, `e2e/tl-03-assay-office-site.spec.ts`, `artifacts/tl-03/{desktop-chrome-empty,desktop-chrome-populated,mobile-chrome-populated}.png`
- MODIFIED (additive): `site/index.html` (+45/-1: new section + nav anchor + footer honesty line), `site/styles.css` (+83: `.assay-office-section` rules reusing existing brass/teal custom props)

Byte-verified identical to the branch (`git diff lane/m3 -- <4 code paths>` == EMPTY). Committed path-scoped. The art working-tree dirt (kit-era-* from the live retake + attended cascade) and `logs/dashboard.html` churn were left UNTOUCHED (disjoint, attended-owned).

## Findings
- **F-tl03a-1 (non-blocking, single review point):** `STATS_ENDPOINT = 'https://gold-rush-3in.pages.dev/api/stats'` (`site/assay-office.js:1`) hard-pins the current Cloudflare Pages origin — CORS-allowlisted for the site in `stats.ts` (verified s259 review). This is a deliberate one-line change if the game moves to a custom domain. No action needed now; flagged as the sole owner review point per the master.
- **F-tl03a-2 (resolved, was mandated):** the footer's false `"No tracking, no analytics, no third-party beacons."` is replaced (`site/index.html:187`) with `"Anonymous gameplay statistics only — no personal data, no third-party trackers, opt-out in Settings."` — the site's promise now matches the game's real TL-01 telemetry behavior. e2e case (e) asserts the unqualified claim is gone.
- **Honesty on numbers (verified):** `medianDurationBucket` is rendered as a RANGE via `DURATION_LABELS` ("3–5 min"), never a precise "median = 4m" (§5 #14, reject-don't-stretch). `deepestWave` is the exact `waves:max`. No identifier-shaped field is ever read or shown (endpoint carries none; e2e case (f) asserts absence of nonce/email/profile/wallet/userId in page text).
- **"Alive immediately" holds pre-binding-fix:** with F-tl01-1 unresolved (KV bound as `ACCOUNTS`, route reads `env.TELEMETRY`), the deployed endpoint serves the graceful empty state today — the section renders that honestly and lights up with real tallies the moment the owner binds the KV. No F-tl01-1 dependency introduced.

## Pending (later slices, named — NOT this task)
- **Window 2:** in-game Claim Ledger "Assay Office — Records" entry (EN live-read pattern) — touches the client, design surface.
- **Window 3:** Ticker / Gazette marketing presentation.
