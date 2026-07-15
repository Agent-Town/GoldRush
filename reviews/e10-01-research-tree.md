# Review — e10-01-research-tree

**Slice/branch/tip:** e10-01-research-tree · lane/m4 (lane-b) · runner commit `c8db5f3a` · base `78693ea9` (e9-01, ancestor of main)
**Drain:** s598 fire · merged to main via checkout-graft (no 3-way)
**Verdict:** ✅ PASS — clean additive board-gated graft, canon-clean, NO GZ (future era, not player-visible). FINAL research-tree rung → ladder exhausted after this.

## What it does
Adds the epoch-10 **"Deep Sky / Generation Ark"** research chart — 15 nodes across three families (Starlight-current Survey/Cartography, Static Arsenal/Ward, Long-Table Fabrication) culminating in **The Charter Press** megaproject (`charter-press`) — the child-height lever that opens the world-builder (per CLAUDE.md §9 "Charter Press at E4+" and the saga's boarding transition). Registers `epoch-10-deepsky` in the encyclopedia registry (`era_deepsky`) and the ContractFamilies fallback manifest/contract bundles. Adds 15 `RESEARCH_UNLOCK_REVEALS` reveal lines (Starlight Soundings → World-Family Atlas → Seed Charters → Ember Shore Atlas → Starlight Pan Science → Static Soundings → Static Ward → Era-Memory Gates → Re-Ink Relays → Quiet-Core Science → Long Table Archive → Portrait Wall → Preserve Seals → World Charters → The Charter Press). Contracts are EMPTY-banked (display-safe, application unwired until its slice), matching the e6/e7/e8/e9 board-gated pattern.

## Merge classification
Base `78693ea9` (e9-01 feat) is an ancestor of main; main only added two STATUS-only commits on top (`ac3655f7`, `f1179711` — both `git diff --name-only` = STATUS.md alone). Therefore the three modified src files (`src/encyclopedia/registry.ts`, `src/meta/ContractFamilies.ts`, `src/ui/ResearchChart.ts`) and `assets/LEDGER.md` on main are byte-identical to base → **checkout-graft, NO 3-way needed**. `git grep epoch-10` on main = empty (no collision; main had e1–e9). New files (epoch-10-deepsky contracts/manifest, e10 spec, artifacts) land untouched. All src hunks are strictly additive (registry +1, ContractFamilies +6 import/fallback lines, ResearchChart +15 reveal strings; 329 insertions, 0 deletions).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ 806ms |
| e10-research-tree spec | **2/2** (desktop + mobile) |
| research-chart + research-inheritance + e9-research-tree | **14/14** |
| _s106-prospector-boot-probe + profile-first-boot | **12/12** (plain boot, zero console/page errors, desktop + 390px) |
| Total adjacent | **26/26** + e10 2/2 |

## Canon (brief §9 / ADR-001)
Clean. **Starlight Pan Science** = "the first Pan's old sweep is marked to gather nebula-light into counted charges" — a mining-pan-derived energy gatherer, NOT a firearm (consistent with the beam/earth-mover arsenals of e8/e9 and the no-firearms law). **Static Ward / Era-Memory Gates / Quiet-Core** = defensive boundary + radius-bound gating against "the Quiet" (a forgetting/desaturation hazard), not projectile weapons. The "weapon tables" reference in the Quiet-Core reveal points at existing frontier-tech era-weapons, not a new firearm. No firearms, no peoples-as-enemies (enemies are the Static/Quiet, outlaws, and worlds), illustrated-not-gory voice held. **The Charter Press** = the saga's warm terminal: portraits, seed tins, Long Table places, preserve seals — a keeping/authoring instrument.

## Findings
- **F-1 (owner ratification, non-blocking):** the e10 15-node table awaits owner ratification (same standing as e6/e7/e8/e9). Table in `assets/contracts/epoch-10-deepsky/manifest.json`; megaproject `charter-press`. Display-safe now (contracts EMPTY-banked, application unwired). Parked on OWNER'S DESK.
- **F-2 (pipeline, non-blocking):** e10-01 is the FINAL research-tree rung. With it merged the research ladder is EXHAUSTED — lane-b (and a/c/d) have no fire-authorable spec slice left. Next fire flags PIPELINE-DRY: all lanes until an owner ruling / new spec slice opens content.

## GZ
**NONE** — board-gated future era, not visible in a plain boot (matches e6/e7/e8/e9). No gazette item.
