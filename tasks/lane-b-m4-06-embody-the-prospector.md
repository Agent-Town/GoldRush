# Task M4-06: embody the Prospector — the robot buddy you can SEE (LANE-B, branch lane/m4, commit prefix "m4:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; docs/GOLD_RUSH_BRIEF.md §6–7 (agent patterns) + §9.4 (naming: the agent is "the Prospector"); src/agent/AgentStub.ts; docs/playtests/2026-07-06-robin-playtest-01.md F3.

## Pre-flight
`git checkout lane/m4 && git reset --hard main && git clean -fd && npm install --no-audit --no-fund` (reset sanctioned HERE, once, at task start; the old m5-04 residue in this worktree is superseded — main has it all). `npm run build` green before touching anything.

## Why (owner-hit, live play 2026-07-06)
"I am missing my Robot buddy." M4 merged tools, receipts, and a permission ladder — but the Prospector has NO body. Nothing visible in normal play OR debug beyond a marker. The agent must be a creature in the world, not a console log.

## Scope
1. **Companion entity, placeholder-first (LAW)**: a billboard sprite companion — procedural placeholder NOW (small engraved-silhouette automaton built from simple shapes/canvas texture in Frontier Ledger tones; NO gore, NO firearm shapes, brief §9.2). Add a layer-contract slot (e.g. `char-prospector-agent` in assets/layer-contracts/characters.v2.json, DORMANT row) so a real illustrated sprite can replace it in a future batch — do NOT generate art.
2. **Presence in NORMAL play**: installs in every boot (visibility is the point — do not gate the body behind ?debug; keep console receipt spam debug-only). Idles near the claim with a subtle bob + occasional "surveying" flavor float-text (reuse vfx.floatText, sparse).
3. **Embody EXISTING behavior only**: subscribe to the receipts the stub already emits (pan_at, repair, chase_mark, place_building, get_state). On an acted receipt: companion walks (render-side lerp, terrain visualY like other entities) to the action point, plays a small work-bob, floats a short ledger-voice line ("panning…", "shoring the wall…"). DO NOT add new autonomy, new tool calls, or any sim effect — the companion is a VIEW of the agent. Economy stays sole gold writer; CombatSystem sole damage resolver; the companion never blocks movement, pathing, or targeting (no collider, excluded from routing/build lanes).
4. **Permission-ladder legibility**: a small chip near the companion or HUD corner showing the current ladder level (reuse existing HUD chip styling); updates from the stub's state.
5. **Perf**: one billboard + reused text vfx; zero new draw-call classes at scale; m2-01 stress budget (≤200) must hold.

## Firewall
Touch ONLY: src/agent/ (new Embodiment module + minimal stub hook for receipt subscription), placeholder factory + contract row, HUD chip, Balance ADDITIVE knobs, diagnostics (additive) + vite-env.d.ts, new e2e. NO changes to: tool surface semantics, permission ladder logic, Economy/Combat/Wave/BuildSystem, existing e2e.

## Self-check (evidence, not vibes)
tsc/build green. New `e2e/m4-06-embodiment.spec.ts`: plain boot (NO ?debug) → companion present + idle near claim; debug boot → trigger a pan_at via __GR_AGENT__/stub hook → companion moves toward the target (poll position) + float-text fired; no collider (enemy path through its tile unchanged — reuse a task-025-style probe); ladder chip renders current level; zero console/page errors desktop + 390. task-025 + m1-01 + m2-01 unmodified green both projects. Before/after screenshots (companion idle + mid-action) into artifacts/m4-06/. End: READY-FOR-GATES + files + results.
