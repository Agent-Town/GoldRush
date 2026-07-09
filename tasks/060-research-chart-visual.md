# Task 060-research-chart-visual: the Elder's Survey Chart LOOKS like a surveyor's chart — icons, air, ink (lane-a; commit prefix "feat:")
**OWNER ORDER 2026-07-09 (verbatim, with screenshot of the Research Ledger): "here images and a more visual approach would go a long way. It does not have to be so crammed - give the things some space."**
You are Codex in worktrees/lane-a. Pre-flight per LANE-SAFETY (safe-dupe wording). READ FIRST: the ResearchChart component + RESEARCH_NODES (SCI-04 lineage — grep "Survey Chart"/"ResearchChart"/"RESEARCH_NODES"), `tasks/059-contract-catalog.md` (the SIBLING order — shared visual language: parchment, art-keys, space), the Claim Ledger reader page pattern (EN-01).

## Scope (RENDER-ONLY — zero research data/logic/cost changes)
1. **ICONS on every node, registry-keyed + placeholder-first:** each research node card gets an icon slot keyed by node id, falling back to its BRANCH emblem (mining economy = pan/sluice, arsenal = rocket/turret, crafting & agent = the Prospector/bench — reuse existing processed sprites/icons; NO new art generation in this task). Branch column headers get the same emblem, small. Real per-node art swaps in later by key, zero code change.
2. **AIR:** bigger name type, effect text given room (it already reads well — let it breathe), generous padding, fewer nodes per viewport with clean scrolling per branch; kill the wall-of-text feel. Once-only text (no repeated lines — the 059 dup bug pattern; assert it).
3. **THE CHART READS AS A CHART:** prerequisite links drawn as visible dotted survey lines between node cards (the surveyor's grammar); AVAILABLE nodes warm-inked and bordered like fresh entries, LOCKED nodes sketch-faded parchment; researched/banked nodes stamped ("SURVEYED"). The "Steamworks awaits the town" column stays — style it as the chart's unsurveyed edge (hatched, beyond the drawn line).
4. **Survey Route panel** restyled as a pinned route card (same data, same behavior).
5. Desktop AND 390px both get the treatment (chart scrolls well under thumb).

## Firewall
Touch ONLY: the chart UI component(s) + styles, the icon key map, its e2e, artifacts. **NO research data/costs/effects, NO sim, NO science logic, NO new art generation.**

## Self-check
tsc/build · chart e2e updated (icon slot per node, once-only text, available-vs-locked visual states, route pin still works) · SCI adjacents + m1-01/m2-01 green · zero console errors · desktop + 390px screenshots → `artifacts/060/`.
End: **READY-FOR-GATES** + screenshots + the node→icon key table.
