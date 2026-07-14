# Review: e5-01-research-tree (lane/m4)

**Slice:** e5-01-research-tree  
**Branch:** lane/m4  
**Tip:** def6e877 feat: bank E5 Deepwater research tree  
**Merge commit:** a3f682cd  
**Drained by:** s562 fire, 2026-07-15  

## Verdict: PASS

## What it does
Banks the E5 Deepwater epoch to the research tree system. Adds:
- `assets/contracts/epoch-5-deepwater/manifest.json` — epoch-5 manifest (locked, order 5, empty contracts placeholder)
- `assets/contracts/epoch-5-deepwater/contracts.json` — empty contracts array (rounds added per future drip slices)
- `src/encyclopedia/registry.ts` — epoch-5-deepwater row added to registry
- `src/meta/ContractFamilies.ts` — Deepwater family wired
- `src/ui/ResearchChart.ts` — renders the Deepwater chart (3 branches: diving/salvage/harbor families, boss-science via reserved medal flag)
- `e2e/e5-research-tree.spec.ts` — new spec: active Deepwater chart renders its frontier and keeps picks pinnable
- `assets/LEDGER.md` — LEDGER entry added
- `artifacts/e5-research-tree/` — desktop + mobile gate screenshots

Owner still ratifies the final node table per the slice scope.

## Evidence

| Check | Result |
|-------|--------|
| tsc --noEmit | ✓ clean |
| npm run build | ✓ 682ms, no errors |
| e5-research-tree.spec.ts desktop-chrome | ✓ pass |
| e5-research-tree.spec.ts mobile-chrome | ✓ pass |
| research-inheritance.spec.ts desktop-chrome | ✓ pass |
| research-inheritance.spec.ts mobile-chrome | ✓ pass |
| schoolhouse-era-truth.spec.ts desktop-chrome | ✓ pass |
| schoolhouse-era-truth.spec.ts mobile-chrome | ✓ pass |
| research-chart.spec.ts desktop-chrome (5 tests) | ✓ pass |
| research-chart.spec.ts mobile-chrome (5 tests) | ✓ pass |
| **Total** | **18/18 passed (46.9s)** |

Zero console errors in any test run.

## Merge classification
- `assets/contracts/epoch-5-deepwater/` — LANE-TOUCHED (new dir, no conflict)
- `artifacts/e5-research-tree/` — LANE-TOUCHED (new dir, no conflict)
- `e2e/e5-research-tree.spec.ts` — LANE-TOUCHED (new file, no conflict)
- `assets/LEDGER.md` — MAIN-MOVED + LANE-TOUCHED: auto-merged cleanly by git
- `src/encyclopedia/registry.ts` — 3-way graft (both main and lane modified; git auto-merged cleanly)
- `src/meta/ContractFamilies.ts` — 3-way graft (auto-merged cleanly)
- `src/ui/ResearchChart.ts` — 3-way graft (auto-merged cleanly)

## Findings
None. No regressions detected.
