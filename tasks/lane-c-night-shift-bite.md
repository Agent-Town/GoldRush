# Task night-shift-bite: the dark must BITE — and the night gets its own geography (LANE-C, branch lane/polish, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; the Night Shift implementation (light ramp, fog-of-dark dimming, lantern-post buildable); specs/e1-contracts §C5; the tile-identity descriptors. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green.

## Owner playtest (2026-07-08 ~21:00, COMPLETED the contract): "interesting concept! But… same geography/map setup. And it is not so dark that I really can't see anymore. I don't really need lanterns. Maybe its my gamma settings, but its not really dark."
Two verdicts: (1) the darkness doesn't bite → lanterns optional → the mechanic is decorative; (2) the deliberate keep-the-claim geography exemption FAILS the owner's variety law.

## Scope
1. **TRUE DARK (gamma-robust by design)**: from wave 10, ambient crushes hard (near-black floor) and the out-of-radius dimming becomes a steep cutoff, not a gentle fade — enemies outside light are functionally INVISIBLE (e2e: out-of-radius enemy sprite luminance ≤ 0.06 sampled; in-radius ≥ 0.35 — margins that survive any monitor gamma). The player's threat awareness = light coverage, period. Turret acquisition unchanged (the sim/render split law stands).
2. **Lanterns become NECESSARY**: scripted e2e proof — identical seeded assault with vs without lantern coverage: visible-threat count differs decisively; the briefing rules line sharpened ("Beyond your light, the night owns the claim").
3. **The night's geography (variety law overrides the old exemption)**: COLD CAMP dressing — 6–8 extinguished lantern posts pre-placed along the lanes (relight for cheap: half build cost — the geography IS the mechanic), a duskier ground palette from wave 1, thicker fog band at the map edges. Same bones, unmistakably its own place: "the claim, gone dark, dotted with cold lanterns."
4. Dawn victory unchanged; perf in envelopes (darkness is cheap; verify the fog).

## Firewall
Touch ONLY: night-shift contract data (ramp values, dressing, relight entries), the dimming curve (contract-scoped), briefing copy, e2e, artifacts. NO other contracts' light, NO sim/targeting changes, NO global fog/ambient.

## Self-check
tsc/build; extended e1-night-shift spec per scope (luminance margins, lantern-necessity comparison, relight flow, cold-camp dressing asserted); default-claim + dry-gulch byte-identity; m1-01 + m2-01 green both projects; zero console errors; screenshots (true dark with one lantern ring, the cold camp at dusk) into artifacts/night-bite/. Commit on lane/polish. End: READY-FOR-GATES + the luminance values chosen + results.
