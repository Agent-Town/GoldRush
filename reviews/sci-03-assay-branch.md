# Review — sci-03 assay contract tiers + schooling offers

**Drain:** s106 fire, drain 3 of PILE MODE. Source `lane/m3` (lane-a, content `f96397f`).
**Verdict:** PASS — 3-way merged to main (merge commit).

## What it does (SCI-03 slice)
Adds the Assay Works contract-tier branch: Refined Assay (tier 2, +20% stat budgets 3.6/6/9.6),
Pattern Library (tier 3, up to 2 approved crafted cards into the run offer pool), Agent Schooling
(post-wave-15 +1 run-only policy slot), + contract vocabulary/caps/families JSON for epoch-1-frontier
and three approved sci03 crafting fixtures. Touches Progression/StatSheet/Upgrades/AssayBench/
CraftingQueue(+Contract)/ContractFamilies/ResearchTree/Game + sci-03 & sci-04 specs.

## 3-way graft (base 15f8116; main had advanced with sci-copy + prospector)
Real `git merge --no-ff` (both sides moved 3 files). Conflicts resolved:
- **Game.ts** — both-add of private fields at L309: kept BOTH prospector's
  (`nextProspectorXpSweepAt`, `prospectorIntroShown`) and sci-03's (`agentPolicySlotBonus`).
  All other Game.ts hunks auto-merged.
- **ResearchTree.ts** — 4 Assay-Works nodes (refined_assay, pattern_library, agent_schooling,
  prospector_lessons) diverged: sci-copy kept the base names (Receipt Shelves/Contract Tier One/…)
  with legibility copy; sci-03 REDESIGNED them with concrete tier mechanics + a self-consistent
  `requires` chain (second_order_slot→refined_assay→pattern_library→agent_schooling) + `live:true`.
  Took **sci-03's version** (the coherent, wired, later feature design). Verified sci-01 spec does
  NOT reference any of these node names, and sci-copy's `requires:['receipt_shelves'…]` were dangling
  ids anyway — sci-03's requires reference real ids. sci-copy's legibility on all OTHER nodes preserved.
- **vite-env.d.ts** — auto-merged (prospector embodiment fields + sci-03 contractTier/agentPolicySlots disjoint).

## Review-fix F-S106-2 (≤20 lines, applied)
sci-03's `prospector_lessons` node (a not-yet-live design-hook capstone) carried placeholder copy
("carries approved lessons into the claim") with no digit/named-family → failed sci-copy's new
"descriptions stay concrete" guard (sci-01:95). Rewrote its description/effect to be concrete and
HONEST (flags "not yet live", anchors to the real Agent Schooling +1 policy slot). No mechanic change.

## Gate (native, port 5188, serial)
- `npx tsc --noEmit` clean; `npm run build` green
- **Science 44/44 both projects**: sci-03-assay-branch + sci-04-contract-registry + sci-01 12/12
  (incl. the legibility guard, green after F-S106-2) + sci-02 12/12
- **Regression 40/40 both projects**: boot probe (plain boot, zero console errors) + m1-01 + m2-01
  + m4-06 embodiment 9/9 — confirms the merged Game.ts keeps BOTH prospector AND core-loop behavior

## Findings
None blocking. F-S106-2 fixed inline. prospector_lessons remains a not-yet-live design hook (by design).
