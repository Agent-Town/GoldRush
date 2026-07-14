# Review — e3-blackout-ridge ("stored breath") — drained by s564

**Slice/branch/tip:** e3-blackout-ridge · lane/e2-arsenal (lane-c) tip `7495278a` · base `1fa33b67` · landed by s564 fire onto main `c96a7a42`.
**Verdict:** PASS.

## What it does
E3 (Voltage era) contract #2, from the STORYBOOK spec verbatim: *"no generator on this map — current arrives from OFF-MAP down one trunk line… You build capacitor banks to buffer the cuts: the map is played in STORED BREATH."* Adds ONE power-graph system extension — a **STORAGE node** (capacitor bank) that charges from surplus flow and discharges to its component when generation drops — plus the `capacitor_bank` buildable, the `e3-blackout-ridge` contract (off-map trunk chain to the map edge, saboteur waves target the trunk, ridge-glow render-only backdrop, unlock after canyon-works win), and its e2e.

## Storage numbers (Balance.e3Power.storage)
`capacityWh: 0.05 · chargeWatts: 18 · dischargeWatts: 12 · cost: 75 · maxCount: 4 · hp: 70 · overlapRadius: 0.9 · placeRadius: 3` · buildable HP `capacitor_bank: 70`. Mask table: `assets/contracts/epoch-3-voltage/mask-tables/` (published + validated separately by publish-e3-mask-tables → `c96a7a42`).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✓ clean |
| `npm run build` | ✓ built in 670ms |
| e2e `e3-blackout-ridge.spec.ts` (new) | ✓ 4/4 both projects — "banks stored breath through a trunk cut, then recharges on repair" (desktop 48.8s / mobile 45.8s) + "publishes masks first and keeps the trunk target explicit" |
| e2e `e3-canyon-works.spec.ts` (adjacent) | ✓ both projects — gorge/night-hold/cut-span restore + Voltage-era gate & saboteur ledger |
| e2e `e3-power-graph.spec.ts` (adjacent) | ✓ both projects incl. "flag-off boot has zero power graph work" |
| e2e `e3-power-prototype.spec.ts` (adjacent) | ✓ both projects — normalizer/priority/loop-cut/repair determinism, no-debug dormancy |
| **Full battery** | **28 passed (56.2s)**, zero console/page errors |
| Stored-breath capture | `artifacts/blackout-ridge/{desktop,mobile}-chrome-stored-breath-cut-10s.png` |

## Player-visibility (Mistake #10)
The blackout-ridge contract is a normal player contract (unlocks after the canyon-works win, no `?debug`); the storage engine is flag-gated — `e3-power-graph` asserts a flag-off boot does zero graph work and `e3-power-prototype` asserts no-debug dormancy, so the extension adds no cost to a plain boot. The stored-breath countdown is the player-visible payoff (lights survive a trunk cut proportional to stored charge, recharge on repair) — exercised end-to-end by the new spec.

## Merge classification
Base `1fa33b67`, ~6 commits behind current main. `git diff base..main --name-only` ∩ slice-touched src = **∅** — main only advanced `src/world/Terrain3dClaimPilot.ts` (wire-landmark-mounts) + `assets/contracts/epoch-3-voltage/mask-tables/*` (a sibling dir, not `contracts.json`); none of the slice's 8 src files, `contracts.json`, or the new spec were touched on main since the base. Therefore a path-restricted checkout of `7495278a`'s versions == a conflict-free 3-way graft (MAIN-version == BASE-version for every LANE-TOUCHED file). No both-moved files. Path-scoped `git add`, `feat:` prefix per task. lane/e2-arsenal remains ahead by `7495278a`; its content is now on main → falsely-ahead=merged (do not re-drain).

## Findings
None blocking. Firewall respected (storage extension + buildable + contract data/tile + spec + artifacts only; no other systems, no E1/E2, no boss).
