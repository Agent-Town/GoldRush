# Task lane-assay-ledger-page: TL-03 WINDOW 2 — the Assay Office page in the Claim Ledger (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
READ FIRST: specs/accounts/README.md §TELEMETRY (the three-windows spine; window 2 = this) · site/assay-office.js (WINDOW 1 SHIPPED — the fetch/render/empty-state/refresh pattern to mirror in-game) · docs/api-stats.md (the GET /api/stats contract: runs today/7d/all-time, deepest wave, median-duration BUCKET (a range, never faked precision), busiest contract, tier split, histograms) · the encyclopedia/Claim Ledger page pattern (EN live-read; how ledger pages register + unlock) · the owner's original order (2026-07-09, verbatim in BACKLOG §THE ASSAY OFFICE: "connect it somewhere in the ledger… a statistics page… see it being alive immediately").

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green.

## Why (owner 2026-07-20: "we wanted to include the anonymous user statistics in the claim ledger as an extra page… I think that fell under the bus. Right now we have statistics but there is no way to see the results." — Window 2 was parked "PENDING later slices" on 07-09 and never resurfaced; the go-live binding fix just landed attended, so the endpoint serves real aggregates)
## Scope
1. A new Claim Ledger page: **"Assay Office — Records"** — in-world voice, two halves: THE COUNTY (the anonymous world aggregates from GET /api/stats — pinned production origin, ~60s refresh, offline/empty states per Window 1's exact lines: "the wire is quiet" / "the office opens with the first assay") and THE CLAIM (this profile's own local numbers from MetaProgress/StatSheet: runs, deepest wave, gold panned, freed count, playtime — label the split honestly: "the county's book" vs "your page in it").
2. Unlocks on first run completed (the EN unlock pattern); before that, the ledger shows the entry as any locked page does.
3. NO new collection, NO identifiers — read-only over the shipped beacon + local stat stores; the Settings opt-out copy stays true.
4. Spec e2e/assay-ledger-page.spec.ts (both projects): unlocked after a seeded first run · renders mocked /api/stats aggregates + local stats · offline fallback line · locked before first run · zero console.
## Firewall: the ledger page + its registration + your spec. NO telemetry write-path changes, NO api changes, NO Settings changes.
## Self-check: tsc+build · your spec + en/ledger suites + tl-01/tl-02 specs green both projects · zero console.
END: READY-FOR-GATES + a screenshot of the page with live-shaped data.
