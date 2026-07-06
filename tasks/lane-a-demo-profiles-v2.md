# Task demo-profiles-v2: re-land Demo Day on fresh main (LANE-A, branch lane/m3, commit prefix "m3:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; branch `save/demo-profiles-v1` (your predecessor's FINISHED, in-lane-green output — stranded on a 20h-stale base, 4 conflicts vs today's main, owner ruled RE-RUN over hand-merge). This is a RE-LAND: the design is done, the reference is real code — your job is adapting it to today's main, not reinventing it.

## Pre-flight
`git checkout -B lane/m3 main && git clean -fd && npm install --no-audit --no-fund` (fresh branch off current main — the old work is safe on save/demo-profiles-v1). `npm run build` green before touching anything.

## Goal (owner-priority: Robin asked for Demo Day by name)
Per-kid player profiles: create/select profile, per-profile Best Claims scoreboard (sibling rivalry), difficulty preset bound per profile (bind gr.difficultyPreset.v1 against the 024 presets — watch the divergent-key intel from s51: verify the storage key matches what 024 shipped, don't assume).

## Method
1. Study the reference: `git show save/demo-profiles-v1 --stat` then read its versions of ProfileManager.ts, ProfileStorage.ts, DeathOverlay.ts, Scoreboard.ts, main.ts, theme.css, e2e/m3-06-demo-profiles.spec.ts (`git show save/demo-profiles-v1:src/game/ProfileManager.ts` etc.).
2. Re-land each piece ADAPTED to current main — which has moved: 027 victory meta-payout touched overlays/ledger, 030 wade-sampler, 031b MetaProgress storage guard (RESPECT it: all storage access goes through the guarded path), 026 agent XP. Where the reference and today's main conflict, today's main wins on infrastructure, the reference wins on feature intent.
3. NEVER blind-copy a file (s9aq law) — read, adapt, integrate.

## Firewall
Touch ONLY: profile/scoreboard/overlay UI + storage modules + theme.css + the m3-06 spec + Balance ADDITIVE. NO changes to: sim systems, Economy, MetaProgress track semantics (profiles wrap AROUND meta storage per-profile — keyed storage, migration-safe), agent/crafting code.

## Self-check
tsc/build; e2e/m3-06-demo-profiles.spec.ts green desktop+mobile (adapt the reference spec); task-025 + m1-01 + m2-01 unmodified green; storage-blocked boot still guarded (031b's test stays green); zero console/page errors. Commit on lane/m3 (runner auto-commits too). End: READY-FOR-GATES + what you adapted vs the reference + results.
