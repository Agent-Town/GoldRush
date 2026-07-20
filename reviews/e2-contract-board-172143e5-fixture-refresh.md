# Review — contract-board fixture refresh (e2-contract-board-172143e5-fixture-refresh)

**Slice/branch/tip:** `lane/m3` `ce5f0906` ("test: refresh contract board registry fixtures")
**Merge:** `2a44fda25f7112e5f48d54368518f9928d8844af` — `git merge --no-ff lane/m3` onto clean main, merge-base `574458e3` (disjoint 3-way, main touched neither tip file).
**Verdict:** MERGED — legitimate re-baseline to the live 10-epoch registry + current debug-URL grammar; **NOT** a blind-bump (Mistake #13 checked).

## What it does
Aligns two epoch-2 contract-board test fixtures to the registry as it actually is on main (the s586 master was written against a 5-epoch registry; e6–e10 research charts have since landed → `listEpochs()` returns 10). Test-only; firewall honoured (no src, no contracts.json).

## The three changes, each verified against intended behaviour (not papered)
1. `sci-04:59` — `listEpochs()` expectation `epoch-1/2/3` → the real **10** (`epoch-1-frontier … epoch-10-deepsky`, displayNames `Frontier … Deep Sky`). The true registry value (master verified `ContractFamilies.ts` maps all 10 manifests). Stale fixture, now correct.
2. `sci-04:123` / `:144` — the LOCKED Steamworks stub now returns full contract data; relaxed `toMatchObject` from `{locked:true, families:[], gates:[], contracts:[{id:'e2-hill-mine'}]}` to `{locked:true}` — **the real guards are preserved**: `after === before` eligibility invariant and the `not.toContain('beacon_handoff' / 'spark_pressure_ring')` no-leak assertions are untouched. This is scope item #2's intended decision (full-data-when-locked is intended; assert the invariant that matters). No leak papered.
3. `e2-pressure-economy:94` — debug URL grammar `?debug&epoch=epoch-2-steamworks` → `?debug&era=2&contract=e2-hill-mine`; the pressure-chip/exchange-row assertions are unchanged — the same Steamworks state reached via the current URL grammar.

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✓ clean |
| `npm run build` | ✓ 946ms |
| `sci-04-contract-registry` + `e2-pressure-economy`, desktop + mobile, workers=1 | ✓ **12/12** (25.5s) |

## Merge classification
Both files LANE-TOUCHED, main-untouched since base → clean additive 3-way; main's newer FULL-BOOK/goals changes preserved (the two-dot phantom deletions are main's, lane never touched them).

## Findings
None blocking. Note: the s586 master's broader 8-spec scope was NOT all needed — the runner (correctly) touched only the 2 files whose fixtures had actually drifted. The other named board specs were unmodified by this drain and are out of its firewall. No goal-tree leaf (a `test:` corrective).
