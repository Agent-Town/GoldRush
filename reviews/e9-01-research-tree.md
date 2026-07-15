# Review — e9-01-research-tree

**Slice/branch/tip:** e9-01-research-tree · lane/m4 (lane-b) · runner commit `2102c893` · base `4fa13e3c` (e8-01, ancestor of main)
**Drain:** s595 fire · merged to main via checkout-graft (no 3-way)
**Verdict:** ✅ PASS — clean additive board-gated graft, canon-clean, NO GZ (future era, not player-visible).

## What it does
Adds the epoch-9 **"The Red Fields"** research chart — 15 nodes across three families (Survey/Cartography, Storm-Arsenal, Fabrication) culminating in the **Generation Ark manifest** → the e10 boarding transition. Registers `epoch-9-redfields` in the encyclopedia registry (`era_redfields`) and the ContractFamilies fallback manifest/contract bundles. Adds 15 `RESEARCH_UNLOCK_REVEALS` reveal lines. Contracts are EMPTY-banked (display-safe, application unwired until its slice), matching the e6/e7/e8 board-gated pattern. Icons reuse existing processed sprites until `icons-e9.png` is processed (LEDGER note added).

## Merge classification
Base `4fa13e3c` is an ancestor of main (`git merge-base --is-ancestor` = true; main only added the s594 handoff `4021287a` on top, a STATUS/tasks docs commit). `git diff 4fa13e3c main` on all four modified src/asset files (`assets/LEDGER.md`, `src/encyclopedia/registry.ts`, `src/meta/ContractFamilies.ts`, `src/ui/ResearchChart.ts`) = EMPTY → main untouched them → **checkout-graft, NO 3-way needed**. `git grep epoch-9` on main = empty (no collision; main had e1–e8). New files (epoch-9-redfields contracts/manifest, e9 spec, artifacts) land untouched.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ 630ms |
| e9-research-tree spec | **2/2** (desktop + mobile) |
| e8 + e7 + research-inheritance + research-chart | **16/16** |
| schoolhouse-era-truth + _s106-prospector-boot-probe | **6/6** (plain boot, zero console/page errors) |
| Total adjacent | **22/22** + e9 2/2 |

## Canon (brief §9 / ADR-001)
Clean. **Storm-Lance** = "set a charged lens on the familiar watch footing" — a beam-light sentry, NOT a firearm (consistent with e8 Vacuum Lenses and the no-firearms law). **Terraform Cannon** = "throw one measured hillock where the survey calls for earth" — a bounded earth-mover, not a projectile weapon. No firearms, no peoples-as-enemies, frontier-orbital→terraform voice held. Enemies/hazards are storms and outlaws.

## Findings
- **F-1 (owner ratification, non-blocking):** the e9 15-node table awaits owner ratification (same standing as e6/e7/e8). Table in `assets/contracts/epoch-9-redfields/manifest.json`. Display-safe now (contracts EMPTY-banked, application unwired). Parked on OWNER'S DESK.

## GZ
**NONE** — board-gated future era, not visible in a plain boot (matches e6/e7/e8). No gazette item.
