# Task research-chart: the Elder's Survey Chart — full skill-tree overview + build planning (LANE-A, branch lane/m3, commit prefix "sci:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; specs/science-dimension/README.md; src/meta/ResearchTree.ts (nodes, branches, gates, frontier logic — the chart RENDERS this data, it never redefines it); the 044 menu's Research entry (this task upgrades it); lane-a-meta-presence output if merged (reuse its provenance lines). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m3 main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green. SEQUENCING: run after meta-presence merges (same surfaces; its provenance data feeds this chart).

## Owner ask (2026-07-07 ~12:15)
"Could there be a screen with a skill tree overview? To see what is connected to what and what is a requirement for what and plan builds? We could even allow redistribution later." — Redistribution/respec = EXPLICITLY LATER (out of scope here, laddered separately). This task = the chart + the planner.

## Scope
1. **The chart screen**: opened from the menu's Research entry (between runs) — a Frontier-Ledger surveyor's diagram: three branch columns (plain-words labels: mining economy / arsenal / crafting & agent), nodes as parchment cards with name + effect line (numbers per the legibility guard), hand-drawn connection lines showing requirement edges FROM THE DATA (render generically — if the tree data gains edges later, the chart just draws them).
2. **Node states, visually distinct**: TAKEN (inked, Elder's mark) · AVAILABLE (bright, on the frontier) · LOCKED (greyed, requirement path shown on hover/tap) · NEXT-EPOCH silhouette (the locked Steamworks branch stubs, faint, labeled "awaits the town" — consistent with the ceiling copy).
3. **Requirement tracing**: selecting any locked node highlights its full requirement path and states the distance ("2 picks away").
4. **Pin a target (the planner)**: the player pins ONE node; the pin persists per profile; the post-run Elder proposal shows a small pin hint when a proposed node is ON the pinned path ("on your surveyed route"). NO auto-pick, NO reroll — guidance, not automation.
5. **Read surfaces**: science meter + banked overflow shown on the chart header; Continued Study rendered as its own repeatable stack once the frontier is exhausted.
6. Keyboard + touch (44px, scrollable columns on 390px); Esc/close returns to menu.

## Firewall
Touch ONLY: the chart screen UI (new module under src/ui/), menu Research entry wiring, pin persistence (per-profile meta storage, additive + migration-safe), the proposal's pin-hint line, e2e. NO changes to: tree data/effects/gates/weights, pick mechanics, thresholds, respec (LATER by owner's word), sim.

## Self-check
tsc/build; e2e: seeded meta (taken/available/locked mix) → chart states render correctly; locked-node selection shows path + distance; pin persists across reload + proposal shows the hint on-path; fresh profile → clean chart, no false marks; zero-meta and full-frontier edge cases; sci suites + 044 menu spec unmodified green both projects; zero console errors; screenshots (full chart desktop, 390px scroll, pinned path highlight) into artifacts/research-chart/. Commit on lane/m3. End: READY-FOR-GATES + results.
