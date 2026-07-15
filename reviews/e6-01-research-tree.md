# Review — e6-01-research-tree (Atomic Homestead chart)

- **Slice:** e6-01-research-tree (lane-b, research-tree ladder — successor to e5-01 SHIPPED)
- **Branch/tip:** `lane/m4` @ `c038a065`
- **Base:** `731373d4` (stale — main advanced through the full E4/E5/drip/cw-02 wave since)
- **Drained by:** s589 fire — clean 3-way graft onto main `a12f7a95`
- **Verdict:** ✅ MERGE — additive epoch-6 registration; all gates green; epoch stays board-gated.

## What it does (player-visible)
Registers the **epoch-6 "Atomic Homestead"** research chart + contract stub. Once epoch-6 is activated, the research chart renders its frontier and keeps picks pinnable (same grammar as e3/e4/e5 charts). Until activation the era stays absent from the board (verified by `en-03-epoch-pages`), so nothing leaks into current play — this is the next rung of the banked research ladder, display-ready ahead of the epoch's gameplay slices.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 584ms |
| `e2e/e6-research-tree.spec.ts` (own spec) | **2/2** desktop + mobile |
| `e2e/e5-research-tree` + `e4-research-tree` (sibling charts) | pass |
| `e2e/en-03-epoch-pages.spec.ts` (**"keeps future eras absent"**) | pass — epoch-6 stays gated |
| adjacent battery total | **8/8** (8.2s) |
| boot probe `_s106-prospector-boot-probe` (plain boot, zero console) | **2/2** |
| Screenshots | `artifacts/e6-research-tree/{desktop,mobile}-chrome-chart.png` |

## Merge classification
Lane base `731373d4` is far behind main, but e6-01's own diff is purely additive (+322 / −0). Per-file vs current main:

| File | Class | Resolution |
|------|-------|-----------|
| `assets/contracts/epoch-6-atomic/{contracts,manifest}.json` | LANE-only (new epoch dir) | `git checkout lane` |
| `e2e/e6-research-tree.spec.ts` | LANE-only (new) | `git checkout lane` |
| `src/encyclopedia/registry.ts` | LANE-TOUCHED, main==base | `git checkout lane` |
| `src/ui/ResearchChart.ts` | LANE-TOUCHED, main==base | `git checkout lane` |
| `assets/LEDGER.md` | LANE-TOUCHED (append), main==base | `git checkout lane` |
| `src/meta/ContractFamilies.ts` | **BOTH moved** (main +3 = cw-02 escort fields ~486; lane +4 = epoch-6 imports ~13 + fallback registrations ~656/669) | disjoint regions → surgical Edit: 3 epoch-6-atomic insertions following the epoch-5-deepwater pattern |

## Findings
- No blocking findings. Firewall (epoch-6 contract dir + spec + registry/chart plumbing + LEDGER) respected. Additive-only; the era remains gated until its activation slice.
