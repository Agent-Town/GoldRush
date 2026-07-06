## ⚠️ CORRECTIVE (s87 gate FAIL — RE-RUN, read this FIRST)
Your previous w1-03 attempt (lane/polish) FAILED the drain gate and was NOT merged — re-run from clean main. The atmosphere/light/shadow/water work was mostly sound (its own spec + w1-01/w1-02/w1-06/m1-01 all passed), but it **broke `e2e/vp-03-terrain-variety.spec.ts` on desktop-chrome** (2 tests, mobile passed):
- `:56 distant bank ground varies without adding draw calls` — west-vs-east mean pixel-delta dropped below the >1.25 variety threshold.
- `:68 same seed renders deterministic bank ground` — same-seed mean-delta exceeded <0.01 (non-determinism).
Desktop-only ⇒ the fault is on the desktop path (`shadowsQuality:'soft'` + full fog/post), not the mobile `'blob'` path. Likely: fog (near 32 / far 72) washes out distant-bank contrast so terrain variety no longer reads, and/or a time/random element in the soft-shadow or post pass breaks same-seed reproduction.
**REQUIRED THIS RUN:** `vp-03-terrain-variety` must be GREEN on BOTH projects — add it to your self-check gate. Preserve distant-bank variety (mean-delta > 1.25 west vs east) and same-seed determinism (< 0.01) under the new atmosphere: tune fog so distant terrain contrast survives, ensure the desktop shadow/post is fully seed-deterministic (no `Math.random`/wall-clock in the render path). See reviews/w1-03-light.md (F-W1-03-1) for the full evidence.

---

# Task W1-03: light + atmosphere (+ F-w1-02-1 water de-regularization) (LANE-C, branch lane/polish, commit prefix "w1:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; specs/w1-river-valley/README.md (laws binding — this is the W1-03 slice); docs/GOLD_RUSH_BRIEF.md §4; docs/playtests/2026-07-06-robin-playtest-01.md.

## Pre-flight
`git checkout lane/polish && git reset --hard main && git clean -fd && npm install --no-audit --no-fund` (sanctioned once at start). `npm run build` green before touching anything.

## Why
Owner verdict on W1-01+02 (2026-07-06): direction approved — "ok, but not a WOW moment." This slice is the wow-maker: light, shadow, and air. It also carries the one review finding from his playtest.

## Scope
1. **F-w1-02-1 (owner finding, fix FIRST)**: "the waves of the water are too regular to be real." Break the periodicity: noise-warp the flow phase, vary ripple frequency/amplitude/direction across the river length (world-space noise, not uniform time scroll); keep the ford stones + foam legible. Before/after close-up shots of the same river stretch.
2. **Golden-hour light**: warm directional sun (low angle, ledger-warm tone), warm ambient fill; tuned so ground relief reads (the W1-01 slopes should finally cast/catch light) and enemy/hero silhouettes POP (legibility law).
3. **Shadows**: soft shadow map for buildings + characters with a `Balance.world` quality knob; blob-shadow fallback for mobile/low tier (spec names this) — the billboards must feel PLANTED (this is the integration cue for the illustrated-characters-in-3D-world hybrid; owner is judging exactly this).
4. **Atmosphere**: retune the existing fog (34–70) toward parchment ledger grade; subtle post pass — gentle vignette + warm color grade + OPTIONAL paper-grain overlay at very low opacity (the ledger signature; keep a kill-knob). No generic bloom soup (brief §4).
5. **Perf**: shadow map size/cascade budgeted; perf snapshot before/after at wave-15 load (draw calls, frame time p95) — frame time regression >15% = fail loudly; mobile knobs degrade shadows first. m2-01 stress ≤200 draw calls must hold.
6. **e2e `e2e/w1-03-light.spec.ts`**: diagnostics expose {sunPresent, shadowsQuality, fogNear/Far, postEnabled, waterPhaseVariance>0}; boot probe zero console/page errors desktop + 390; task-025 + m1-01 + m2-01 unmodified green (sim-drift proof).

## Firewall
Touch ONLY: src/world/ (light rig new file, water shader for item 1, terrain material response), renderer/post setup, Balance ADDITIVE knobs, diagnostics + vite-env.d.ts additive, new spec. NO changes to: sim logic, routing, spawning, camera behavior, existing e2e. Commit on lane/polish, prefix "w1:", small commits.

Self-check: tsc/build; new spec green desktop+mobile; task-025 + m1-01 + m2-01 unmodified green; perf table recorded; before/after screenshots SAME camera pose (wide + river close-up + a shadowed-building close-up) into artifacts/w1-03/. End: READY-FOR-GATES + files + results + perf table.
