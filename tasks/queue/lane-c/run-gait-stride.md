# run-gait-stride — steps that match the stride (lane-c #2, lands ON TOP of run-cast-scale-up; commit prefix "fix:")
ROLE: gameplay presentation. WORKDIR: lane-c (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner, verbatim: "The problem with the small characters is also that their feet move so fast, it looks weird - they have to take many steps to get somewhere as they are so small."

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules. THIS TASK DEPENDS ON run-cast-scale-up (same lane, immediately prior): if it is done but undrained, report "LADDER-STALL: waiting on drain of run-cast-scale-up" (fires re-queue, pre-authorized) — do NOT build against the pre-scale base. Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: walk-cycle playback is `animationSpeed(enemy) = hypot(velocity)` (src/entities/pools.ts:104) — pure ground speed, no stride length. A sprite's step rate must depend on how much ground ONE STEP covers, and stride scales with the character's visual size. Result today: small characters churn their feet comically fast; after the ×1.5 scale-up the constant is wrong by a further 1.5×.

## READ-FIRST: src/entities/pools.ts animationSpeed + every call-site (walk/grab/flee clips + baron path) · how SpriteAnimator consumes `speed` (fps multiplier semantics — src/assets/SpriteAnimator.ts) · the hero's walk playback path (same law applies) · the prospector hover (NO legs — its bob rate is aesthetic, exclude or tune separately) · the landed run-cast-scale-up diff (the new visualScale values — your denominators).

## SCOPE (the GAIT LAW):
1. Frame advance becomes distance-over-stride: `cycleSpeed = groundSpeed / (STRIDE_UNITS × visualScale)` — one full walk cycle ≈ the distance a character of that size would plausibly cover in one gait cycle. Tune STRIDE_UNITS so the HERO at 1.5× scale reads as natural steps at normal move speed (start near: cycle covers ~1.1× body height per full 8-frame loop; iterate by eye against the artifacts screenshots).
2. Apply to hero + all regular enemies (walk/grab/flee clips) + E2 trio walk4. The BARON keeps his current tuned read unless his rate visibly breaks post-check (owner likes him — report, don't change silently). Prospector hover EXCLUDED (no gait). Town plaza cast EXCLUDED (owner praised the plaza; townsfolk fullBody fps lives in townsfolk.ts and is untouched).
3. Clamp: never below 0.4× base fps (a near-idle drift shouldn't freeze mid-stride) and pause cleanly at stop (the standing-frame snap law from the town runtime is the model).
4. e2e `e2e/run-gait-stride.spec.ts`: probe frames-advanced-per-world-unit for the hero at two different move speeds — must be equal within 10% (distance-driven proof); an enemy at 1.5× scale advances ~1/1.5 the frames-per-unit of a hypothetical 1.0 scale (assert via the formula's exposed diagnostics); baron rate unchanged vs recorded constant; zero console/page errors, both projects. run-scene-animation-refresh + cast-motion-wiring UNMODIFIED-green.

## Firewall
Touch ONLY: the animation-speed derivation (pools.ts + the hero walk playback call-site), a STRIDE_UNITS constant (Balance.anim or local const — match house style), the new spec, artifacts/run-gait-stride/. NO movement/velocity/sim values, NO town scene, NO SpriteAnimator internals beyond consuming the speed, NO clip data.

## Self-check
tsc + build green · new spec + the two named suites green both projects · zero console/page errors · a 3-second capture or frame-series of the hero walking at the new gait for the owner verdict.
If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the STRIDE_UNITS chosen + frames-per-unit table (hero/enemy/E2 trio, before vs after).
