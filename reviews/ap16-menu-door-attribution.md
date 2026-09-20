# AP-16 — menu gaps are downstream of admission refusals

**Slice:** `ap16-menu-door-attribution` · **branch:** `lane/d` · **tip:** `a4d9243ba04d942c447b41136a1d40d7d1423d95` · **base:** `2e5fa91a8bf32fd94775f71e1d1f02897d70d223`  
**Verdict:** **MERGED** at `d1b93f146e405d8c6fc3448b74292d07040b27cc` (s1700)

## What changed

The report now attributes browser-menu divergence through the contract reachability row that already owns the admission decision. Five browser-offered contracts are refused by the headless door; a separate fifteen are unavailable to both species. The 29 current buildable rows are downstream evidence from those five refusals, not a second independent debt.

The row table remains the source of truth. The report derives its two populations and counts from that table, and the focused test guards the attribution without pinning today's downstream total.

## Evidence

The candidate was gated in detached worktree `/tmp/s1700-gate-4fCLDC`; main received the already-decided branch merge in one `--no-ff` act.

| gate | result |
|---|---|
| `node scripts/drain-block-check.mjs ...` | **CLEAR**, leaf `ap16-menu-door-attribution` |
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, Vite built in 1.29 s; asset diet green |
| `node scripts/same-game-audit.test.mjs` | **3/3 pass** |
| report generation twice | identical SHA-256 `b6da2314f6e955a6ceabd46b7b161c9cd8674bbde3b8aba93432ed2668fb4dae` |
| complete pre/post `--json` | identical SHA-256 `903293c18d390f19d8dfd4e7f483936fcc9e2fdd6b3c0ddb43a13a1033a1b458` |
| `npm run test:node-guards` alone | **458 tests · 453 pass · 0 fail · 5 intentional fire-shell skips**, 399.1 s |
| Playwright / boot / screenshots | not applicable: generated audit attribution only; no runtime or rendered surface changed |

The complete JSON identity is the preservation proof: all 1,095 row records, schema keys, direction totals (`0 / 373 / 707 / 15`), admission exemptions, and runtime-derived sources are unchanged.

## Merge classification

Main had no movement on the three task paths after base. All are LANE-TOUCHED-only:

- `scripts/same-game-audit.mjs` derives the reachability and menu partitions once.
- `scripts/same-game-audit.test.mjs` guards complete attribution and zero independent gaps.
- `docs/bench/same-game-audit.md` is the byte-reproducible generated report.

The merge used `ort`, with zero conflicts and no swept artifacts.

## Findings

None. The task's preservation conditions all held.

## Player surface

Nowhere by construction. No game behavior or visible content changed, so GZ-01 and deploy do not apply.
