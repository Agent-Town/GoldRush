# Review — assay-ledger-page (lane/e2-arsenal `d70453f1`) — s753 DRAIN

**Slice:** TL-03 WINDOW 2 — the in-game Claim Ledger page "Assay Office — Records" (the anonymous-user statistics the owner asked to surface in the ledger: "we have statistics but there is no way to see the results", 2026-07-20).
**Branch/tip:** lane/e2-arsenal `d70453f1` (`runner(lane-c): lane-assay-ledger-page.md`, 2026-07-20 06:39; stacked above the fix-town-spec-flow drain).
**Base:** merge-base `b1f283da`; `git diff b1f283da main -- <the 5 files>` = EMPTY → main untouched all 5 since fork = **clean additive checkout-graft, no 3-way**.
**Verdict:** ✅ **MERGED — the Claim Ledger gains "Assay Office — Records"; own spec + all required adjacent suites green both projects (44/44). One pre-existing main-side red (tl-03 SITE spec) is graft-independent and outside this drain's firewall.**

## What it does
Adds a new first-run-unlocked Claim Ledger page rendering two honest halves: THE COUNTY (the anonymous world aggregates from `GET /api/stats`, pinned production origin, ~60s refresh, offline/empty states in Window-1's exact voice — "the wire is quiet" / "the office opens with the first assay") and THE CLAIM (this profile's own local numbers from the meta/stat stores). Registry entry `assay_office_records` is un-hidden and renamed "Assay Office — Records", unlocking on `run:completed:first`; `liveStats.ts` gains the county/claim read + refresh; `reader.css` styles the records card. Read-only over the shipped beacon + local stores — no new collection, no identifiers, opt-out copy stays true (firewall: ledger page + registration + spec only; NO telemetry/api/Settings changes).

## Evidence (the gate, scratch port 5253, single-worker, both projects)
- `npx tsc --noEmit` clean · `npm run build` ✓891ms.
- **Required battery: `44 passed (1.2m)`** both desktop-chrome + mobile-chrome:
  - `assay-ledger-page.spec.ts` (own, new) — unlocked-after-first-run, mocked `/api/stats` aggregates + local stats, offline fallback, locked-before-first-run, zero console.
  - `tl-03b-ledger-stats-window.spec.ts` (modified) — records locked→mocked-tallies, quiet wire fallback.
  - `tl-01-run-telemetry` · `tl-02-public-stats` · `en-01-claim-ledger` · `en-03-epoch-pages` · `ledger-era-chapters` — all green (shared telemetry/ledger contracts unregressed).
- Player-visible without `?debug` (Mistake #10): the page is a real Claim Ledger entry unlocking on first completed run — the spec drives exactly that path.
- Screenshots: `artifacts/assay-ledger-page/{desktop,mobile}-chrome-records.png` (page with live-shaped data).

## Merge classification (base `b1f283da`)
| File | Class | Resolution |
|---|---|---|
| src/encyclopedia/liveStats.ts · reader.css · registry.ts | LANE-TOUCHED only | main byte-identical to base → `git checkout d70453f1 -- <files>`, no 3-way |
| e2e/tl-03b-ledger-stats-window.spec.ts | LANE-TOUCHED only | same |
| e2e/assay-ledger-page.spec.ts | NEW file | free |
| artifacts/assay-ledger-page/{desktop,mobile}-chrome-records.png | NEW (evidence) | grafted from the commit |

## Findings
- **F-1 (NON-BLOCKING, PROVEN pre-existing, graft-independent → attended/owner corrective):** `e2e/tl-03-assay-office-site.spec.ts:32 "renders populated Assay Office aggregates"` is RED both projects — `[data-assay="busiest-contract"]` expects "Steady Hands", renders "E1 Dry Gulch" (a contract-label vs region/id mapping mismatch). **Fails IDENTICALLY on clean main** (baselined: revert the graft → 2 failed both projects, same "8 did not run" — that spec is serial-mode so :32's failure aborts its remaining 8). This is the standalone SITE page (`site/assay-office.js`), which this drain never touches; the regression stems from the recent F-tl01-1 / Assay go-live stats-read rework on main (`41d8e1ae`/`47c5fb20`/`90a3c5f3`). Outside this drain's firewall (master forbids api/telemetry changes) → NOT fixed here; a corrective belongs to a permitted/attended session that can touch the stats/site path.
- Window 3 (Ticker/Gazette quotes the same endpoint) remains PENDING later slices.
