# Task tl-03b-ledger-stats-window: the Assay Office Records page in the Claim Ledger (lane-a; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=medium
FROM `specs/accounts/README.md` §TELEMETRY TL-03 window 2 (window 1 = the site section SHIPPED s261; the spine endpoint `GET /api/stats` SHIPPED s278 with contract `docs/api-stats.md`).
You are Codex in worktrees/lane-a. Pre-flight per LANE-SAFETY. READ FIRST: the Claim Ledger reader + registry + live-read pattern (EN-01/02, `src/encyclopedia/`), `docs/api-stats.md` (the aggregate shapes), the 063 in-world voice law (a fact renders only if a kid could overhear it in the tavern — frame stats as the Assay Office's tallies, no tech words).

## Scope
1. **A new ledger entry "The Assay Office — Records"**: unlocks on FIRST RUN COMPLETED (discovered-only law; the run that unlocks it IS the first assay). Renders the `GET /api/stats` aggregates via the EN live-read pattern, in-world phrasing ("Claims assayed this week: …", "Deepest holdout: wave …").
2. **Offline/unreachable/empty**: "the wire is quiet." / "the office opens with the first assay." — play NEVER depends on the endpoint; no spinner, no error text.
3. **Zero polling in-run**: fetch on page OPEN only, ≤1/min re-fetch while the page stays open.
4. **e2e**: entry hidden pre-first-run; appears after; renders mocked aggregates (playwright route-intercept — headless-safe, no live endpoint dependency); offline shows the quiet-wire line; no internal strings (the 063 assertion pattern).

## Firewall
Touch ONLY: encyclopedia registry/reader additions for this entry + its e2e + artifacts. **NO other entries, NO reader engine changes beyond an additive live-read source, NO telemetry/ingest changes, NO site changes.**
End: **READY-FOR-GATES** + screenshots (populated + quiet-wire states) desktop + 390px.
