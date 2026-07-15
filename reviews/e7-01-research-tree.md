# Review — e7-01-research-tree (Signal Era chart)

- **Slice:** e7-01-research-tree (lane-b, research-tree ladder — successor to e6-01 SHIPPED)
- **Branch/tip:** `lane/m4` @ `15a82ec4`
- **Base:** `f066289b` (main advanced only through PNG-refresh `ac959272` + task-refill `d5f164e8` since — no src overlap)
- **Drained by:** s591 fire — pure additive graft onto main `d5f164e8`
- **Verdict:** ✅ MERGE — additive epoch-7 registration; all gates green; epoch stays board-gated (no player leak → no GZ item).

## What it does (player-visible)
Registers the **epoch-7 "Signal Era"** research chart + contract stub (branches: Signal Theory, Arsenal, Fabrication). Once epoch-7 is activated, the research chart renders its frontier and keeps picks pinnable (same grammar as e3–e6 charts). Until activation the era stays absent from the board (verified by `en-03-epoch-pages` "keeps future eras absent"), so nothing leaks into current play — the next rung of the banked research ladder, display-ready ahead of the epoch's gameplay slices. Signal mechanics, delegation authority, Echo runtime, and Starship systems remain deliberately unimplemented until their engine slices.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 760ms |
| `e2e/e7-research-tree.spec.ts` (own spec) | **2/2** desktop + mobile (3.9s) |
| `e2e/{e4,e5,e6}-research-tree` (sibling charts) | pass |
| `e2e/en-03-epoch-pages.spec.ts` (**"keeps future eras absent"**) | pass — epoch-7 stays gated |
| adjacent battery total | **8/8** (7.9s) |
| boot probe `_s106-prospector-boot-probe` (plain boot, zero console) | **2/2** (4.0s) |
| Screenshots | `artifacts/e7-research-tree/{desktop,mobile}-chrome-chart.png` |

## Merge classification
Lane base `f066289b` == e7-01 base; main's two intervening commits (`ac959272` = screenshot/dashboard refresh, `d5f164e8` = BACKLOG + queue-file refill) touch **none** of e7-01's files. Verified `git diff f066289b main -- <all e7-01 paths>` = empty → main==base on every touched file. Purely additive (+320 / −0). Cleaner than e6-01 (no concurrent ContractFamilies mover this time).

| File | Class | Resolution |
|------|-------|-----------|
| `assets/contracts/epoch-7-signal/{contracts,manifest}.json` | LANE-only (new epoch dir) | `git checkout lane` |
| `e2e/e7-research-tree.spec.ts` | LANE-only (new) | `git checkout lane` |
| `artifacts/e7-research-tree/{desktop,mobile}-chrome-chart.png` | LANE-only (new) | `git checkout lane` |
| `src/encyclopedia/registry.ts` | LANE-TOUCHED, main==base | `git checkout lane` |
| `src/ui/ResearchChart.ts` | LANE-TOUCHED, main==base | `git checkout lane` |
| `src/meta/ContractFamilies.ts` | LANE-TOUCHED (+4 epoch-7 imports/fallbacks), main==base | `git checkout lane` |
| `assets/LEDGER.md` | LANE-TOUCHED (append), main==base | `git checkout lane` |

## Findings
- No blocking findings. Firewall (epoch-7 contract dir + spec + registry/chart plumbing + LEDGER) respected. Additive-only; the era remains gated until its activation slice. No GZ item (not player-visible in a plain boot — en-03 proves it stays absent).
