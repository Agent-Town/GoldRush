# Sol findings — repository audit intake

- **Branch:** `sol/repository-audit-findings`
- **Base:** `7802ed6`
- **Audit runtime baseline:** `ff46a53` (the source tree is unchanged between the runtime baseline and this branch base; intervening commits add co-agent/runbook/task documentation)
- **Date:** 2026-07-10
- **Verdict:** UNTRIAGED — evidence intake only. Fable owns accept/park/reject/deduplicate decisions.
- **Merge classification:** review artifacts only; no source, test, spec, lore, STATUS, BACKLOG, queue, or asset edits.

## Protocol

This branch converts the interactive audit into the durable file surface required by `AGENTS.md` §Interactive co-agent sessions. It does not authorize implementation. If Fable accepts a finding, that concern receives its own later `sol/<finding-slug>` branch from a Fable-specified base, with its own firewall, tests, and `READY-FOR-GATES` tail commit.

Known overlap is retained and labelled rather than silently removed. Fable's stopped-swarm cache and live backlog remain the deduplication authorities.

## Topic files

| Topic | File | Findings | Headline |
|---|---|---:|---|
| Simulation and lifecycle | `reviews/sol-findings-simulation-lifecycle.md` | 5 | Fixed-step law is false; modal and death boundaries leak simulation. |
| Persistence and multiplayer | `reviews/sol-findings-persistence-multiplayer.md` | 9 | Restore validation/state completeness and actor-scoped lockstep are not production-safe. |
| AI, accounts, and trust boundaries | `reviews/sol-findings-ai-accounts-trust.md` | 11 | The two AI promises are not production-real; recovery and authority boundaries are incomplete. |
| Performance, assets, and architecture | `reviews/sol-findings-performance-architecture.md` | 6 | Runtime request weight, repository mass, hot diagnostics, and central classes need measured correction. |
| Product, content, and accessibility | `reviews/sol-findings-product-content-accessibility.md` | 12 | Research/canon bugs, first-run teaching, control ergonomics, and saga rules need product decisions. |
| Verification, deployment, and operations | `reviews/sol-findings-verification-operations.md` | 9 | Build is green, but the production gate, Worker harnesses, CI, browser coverage, and deploy truth are not. |
| Governance, scope, and truth | `reviews/sol-findings-governance-scope.md` | 6 | Executable scope outruns product validation; specs, lore hierarchy, and ledgers have drifted. |

Total: 58 untriaged findings across seven topics.

## Highest-priority triage set

1. `F-SOL-SIM-001` — solo simulation violates the fixed-step law and differs from multiplayer cadence.
2. `F-SOL-TRUST-002` — the Assay UI promises posting, but production has no queue endpoint and returns 404.
3. `F-SOL-PERSIST-001` — shallow suspend validation can admit malformed state that restore dereferences unsafely.
4. `F-SOL-PERSIST-002` — multiplayer resync snapshots are not state-complete or identity-preserving.
5. `F-SOL-SIM-003` — contract briefing/build UI leaves combat running; reproduced mobile death behind the menu.
6. `F-SOL-PERF-001` — an active run reached 250 requests and 11.93 MB transfer after ten seconds.
7. `F-SOL-VERIFY-001` — there is no single green, production-representative release gate.
8. `F-SOL-PRODUCT-001` — Sky-Rocket progression and its story signal contradict the Baron capture story.

## Audit evidence ledger

| Check | Result |
|---|---|
| `npm ci` | PASS |
| `npm run build` | PASS; Vite large-chunk warning |
| Production startup sample | 2/2 PASS |
| Core/start/stress Playwright sample | 20 PASS, 2 stale-test failures |
| Production Assay post | FAIL — expected `Posted`, observed `JSON ready (HTTP 404)` |
| Accounts Worker harness | FAIL before assertions — compatibility-date/runtime mismatch |
| Multiplayer Worker harness | FAIL before assertions — compatibility-date/runtime mismatch |
| Stats Worker harness | PASS — 44 checks |
| Desktop/mobile canvas | Nonblank and varied; zero observed console/page errors |
| Stress renderer sample | PASS; draw calls remained under 200 |
| Full regression | Not run after deterministic blockers established a red release state |

## Measured runtime/repository facts

- Production `dist/`: 29 MB, 827 files — 411 JavaScript, 365 asset PNGs (368 PNGs total), 42 MP3.
- Main JavaScript chunk: 1,350.85 kB minified / 350.69 kB gzip.
- Active-game sample after ten seconds: 250 requests, 11.93 MB transferred, including 127 JavaScript and 120 PNG requests.
- Tracked checkout: 3.209 GiB — assets 2.197 GiB, artifacts 0.746 GiB.
- Shared Git object database: 3.29 GiB packed plus 1.35 GiB loose objects; 152 garbage entries observed.
- No `.gitattributes` and no Git LFS objects.

## Fable triage field

Fable may append a compact table here or annotate each topic file:

| Finding | Decision | Reason / duplicate | Corrective owner |
|---|---|---|---|
| _untriaged_ | ACCEPT / PARK / REJECT / DUPLICATE |  |  |

## READY-FOR-GATES

Review-only intake is ready for Fable's same-day triage. No implementation is present or implied.
