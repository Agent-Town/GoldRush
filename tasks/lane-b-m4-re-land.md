# Task m4-re-land: re-land the Prospector's body + voice on fresh main (LANE-B, branch lane/m4, commit prefix "m4:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; branch `save/m4-embodiment-voice-v1` (predecessor's FINISHED combined output of tasks m4-06 embodiment + m4-04 voice — stranded on a stale base; owner ruled RE-RUN over hand-merge); tasks/lane-b-m4-06-embody-the-prospector.md (the original design constraints — its FIREWALL and canon rules still bind).

## Pre-flight
`git checkout -B lane/m4 main && git clean -fd && npm install --no-audit --no-fund` (old work is safe on the save branch). `npm run build` green first.

## Goal
Re-land BOTH features adapted to current main: (1) m4-06 — the visible companion body (billboard placeholder, normal-play presence, walks to receipt actions, permission-level chip, NO new autonomy, no sim effects, no collider); (2) m4-04 — agent voice (src/agent/Voice.ts in the reference: ledger-tone lines driven by existing receipts/events).

## Method
Study `git show save/m4-embodiment-voice-v1 --stat` + read its AgentStub.ts, ToolSurface.ts, Voice.ts, slots.ts, characters.v2.json, BuildSystem.ts, Game.ts, styles.css versions. Adapt to current main — CRITICAL: main's ToolSurface/AgentStub moved (026 added collect-xp action + agent priorities in Balance.agent) — integrate around it, do not regress 026 (its spec must stay green). Reference wins on feature intent; today's main wins on infrastructure. Never blind-copy (s9aq law).

## Firewall (inherited from m4-06 master)
Touch ONLY: src/agent/ (Embodiment/Voice + minimal stub hooks), placeholder factory + characters.v2.json DORMANT slot row, HUD chip, Balance ADDITIVE, diagnostics additive, e2e. NO changes to: tool surface semantics beyond additive hooks, permission ladder logic, Economy/Combat/Wave/BuildSystem behavior (visual placement calls only), existing e2e.

## Self-check
tsc/build; e2e/m4-06-embodiment.spec.ts (adapt from reference) green desktop+mobile; task-026-prospector-collects-xp green (regression fence); task-025 + m1-01 + m2-01 unmodified green; zero console/page errors; companion visible in a plain no-?debug boot; screenshots (idle + mid-action + chip) into artifacts/m4-re-land/. Commit on lane/m4. End: READY-FOR-GATES + adaptations vs reference + results.
