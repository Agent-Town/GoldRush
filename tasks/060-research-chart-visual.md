# Task 060-research-chart-visual: the Elder's Survey Chart LOOKS like a surveyor's chart — icons, air, ink (lane-a; commit prefix "feat:")
**OWNER ORDER 2026-07-09 (verbatim, with screenshot of the Research Ledger): "here images and a more visual approach would go a long way. It does not have to be so crammed - give the things some space."**
You are Codex in worktrees/lane-a. Pre-flight per LANE-SAFETY (safe-dupe wording). READ FIRST: the ResearchChart component + RESEARCH_NODES (SCI-04 lineage — grep "Survey Chart"/"ResearchChart"/"RESEARCH_NODES"), `tasks/059-contract-catalog.md` (the SIBLING order — shared visual language: parchment, art-keys, space), the Claim Ledger reader page pattern (EN-01).

## Scope (RENDER-ONLY — zero research data/logic/cost changes)
1. **ICONS on every node — THE SAME ICONS THE GAME USES (owner order 2026-07-09 verbatim: "The icons in the Survey Chart and the icons in the game should be connected - if research yields a new skill/upgrade in the game, show it and explain it."):** ONE shared icon registry keyed by the UNLOCKED THING (a node's icon = the icon of the skill/upgrade/card it yields in-run — Chain Spark Primer shows the Chain Spark Arc's own icon, etc.), falling back to its BRANCH emblem where the unlock has no in-game icon yet (mining economy = pan/sluice, arsenal = rocket/turret, crafting & agent = the Prospector/bench — reuse existing processed sprites/icons; NO new art generation in this task). Branch headers get the emblem small. Real per-node art swaps in later by key, zero code change.
   1b. **THE UNLOCK REVEAL:** when a research completes, SHOW the player what they got — a reveal card (reuse the Claim Ledger new-page notification pattern, EN-01): the unlock's icon + name + one plain-words line of what it does in the game ("Chain Spark Arc — your rigs and beacons fire 12% faster"), and the same icon then appears wherever the upgrade surfaces in-run — the chart, the reveal, and the run UI all speak one iconography.
2. **AIR:** bigger name type, effect text given room (it already reads well — let it breathe), generous padding, fewer nodes per viewport with clean scrolling per branch; kill the wall-of-text feel. Once-only text (no repeated lines — the 059 dup bug pattern; assert it).
3. **THE CHART READS AS A CHART:** prerequisite links drawn as visible dotted survey lines between node cards (the surveyor's grammar); AVAILABLE nodes warm-inked and bordered like fresh entries, LOCKED nodes sketch-faded parchment; researched/banked nodes stamped ("SURVEYED"). The "Steamworks awaits the town" column stays — style it as the chart's unsurveyed edge (hatched, beyond the drawn line).
4. **Survey Route panel** restyled as a pinned route card (same data, same behavior).
5. Desktop AND 390px both get the treatment (chart scrolls well under thumb).

## Firewall
Touch ONLY: the chart UI component(s) + styles, the icon key map, its e2e, artifacts. **NO research data/costs/effects, NO sim, NO science logic, NO new art generation.**

## Self-check
tsc/build · chart e2e updated (icon slot per node, once-only text, available-vs-locked visual states, route pin still works) · SCI adjacents + m1-01/m2-01 green · zero console errors · desktop + 390px screenshots → `artifacts/060/`.
End: **READY-FOR-GATES** + screenshots + the node→icon key table.
