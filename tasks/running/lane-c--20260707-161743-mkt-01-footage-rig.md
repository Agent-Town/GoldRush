# Task mkt-01: the footage rig — the game films its own trailer material (LANE-C, branch lane/polish, commit prefix "mkt:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; specs/marketing/README.md (Stage 0 + laws — owner-approval and kids-privacy laws BINDING); the seeded-run/debug machinery (__GR_TEST__, ?debug params, timescale) and playwright video capture options. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (owner order 2026-07-07: launch + maintain a campaign; Stage 0 is free and starts now)
Real gameplay is the teaser's backbone and the weekly content loop's raw material. Build the rig once; every future `mkt-` capture task reuses it.

## Scope
1. **`scripts/capture-footage.mjs` + `e2e/mkt-capture.rig.ts`** (rig, NOT a test — excluded from normal runs via config): boots the game on a scratch port with a capture profile (fresh demo profile named "Prospector" — never family profiles), seeded runs, playwright `recordVideo` at 1920×1080 and 1080×1920 (both aspects), per-shot scripted scenarios driven by a SHOT LIST data file.
2. **`marketing/shots.json` shot list v1** (each: id, seed, setup via debug params/__GR_TEST__, camera focus, duration, description): dawn-valley-pan (the carved claim, slow drift) · wave-break-at-the-gaps (046 funnel kill-zone under fire) · prospector-at-work (agent collecting, panel open beat) · blast-over-rubble (vfx layering showcase) · demolish-sad-plank (the context bar + refund beat) · science-chart-open (the Elder's chart) · sluice-line-economy (tiered sluices working the river).
3. **Output**: `marketing/raw/<shot-id>-<aspect>-<date>.webm` + a contact-sheet md (`marketing/raw/INDEX.md`: shot, duration, file, first-frame png). NO trimming/grading (post is Stage-1, human/Higgsfield side).
4. **Privacy law enforced in-rig**: capture profile only; assert no profile-selector or family names ever visible in frame (boot straight into the capture profile).
5. Run the v1 shot list once; note per-shot quality issues honestly (these inform re-shoots after the visual pass settles).

## Firewall
Touch ONLY: the rig script + rig spec + shots.json + marketing/raw outputs + playwright config addition (rig excluded from standard projects). NO src/ changes, NO game code, NO existing e2e/config behavior changes (standard suites must run exactly as before — prove with m1-01 + m2-01 green).

## Self-check
tsc/build; standard suites unaffected (m1-01 + m2-01 + task-025 green both projects, normal config); rig runs the 7-shot list producing files ≥the specced durations, INDEX.md complete; zero console errors during captures. Commit on lane/polish (webm files: keep ≤25MB total — lower res/duration if needed; note it). End: READY-FOR-GATES + per-shot quality notes + total footage seconds.
