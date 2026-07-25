# Task lane-asset-diet: THE ASSET DIET + the honest loading cue (LANE-A, pre-launch, commit prefix "perf:")

You are Codex, implementer for Gold Rush (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=xhigh
READ FIRST: the dist reality (attended measurements 2026-07-25: **dist/assets = 1.0GB full / ~188MB release**; contract plates ship as 3.8MB PNGs ×41; terrain GLBs 9-11MB each ×20+) · the owner's evidence (<10Mbit connection: the town rendered as facade shells + white sheets for MINUTES — "this looks completely off" → "ah it is loading!") · vite asset pipeline · the town facade-fallback path (it already exists — it just looks broken instead of loading).

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green + release build green.

## Scope
1. THE DIET — biggest wins, mechanical: ① plates/stages/cards (the 1672×941 PNG classes) → WebP q80 at build time (expect ~75-85% cut; a vite plugin or prebuild script; PNG originals stay in git — the diet is build-output only). ② terrain/landmark GLBs → meshopt/draco compression via gltf-transform in the same prebuild (expect 60-80% cut; byte-identical geometry law does NOT apply to dist — verify visual parity via one census boot). ③ Audit-report the next tier (audio, sheets) with numbers; act only on the two classes above this pass.
2. THE HONEST CUE: while town/run GLBs stream, the scene shows an in-world loading read (the survey-plot shells stay BUT gain a subtle raise-progress: canvas dataset + a small corner line "the town is raising… N/M" in house voice; no spinner overlays). Kills the "completely off" first impression on slow lines.
3. MEASURE: before/after table — total dist, release dist, first-town-visit transfer, first-claim-visit transfer (playwright network capture); target: first town visit under ~25MB.
4. Specs: visual-parity boot (census-style screenshot compare within tolerance on 2 maps + town) · the loading cue appears under throttled network (playwright route delay) and disappears at ready · zero console; both projects + release build boots.
## Firewall: build pipeline + the cue + specs. NO source-art changes, NO gameplay, NO asset removals.
END: READY-FOR-GATES + the before/after size table + throttled-boot screenshots.
