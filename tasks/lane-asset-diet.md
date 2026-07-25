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

## THE ADVANCE STREAM (owner 2026-07-25, verbatim: "Could we start downloading all the assets as soon as the player visits the start page? Basically streaming in advance?")
5. PREFETCH FROM THE MENU: the start page begins warming the cache the moment it settles — priority-ordered, low-priority fetches (never competing with the interactive path): ① the town's GLBs+atlases (the guaranteed next scene) ② the profile's last-played/first contract (the-claim for fresh) ③ the remaining E1 maps ④ everything else, idle-paced (requestIdleCallback batches; pause instantly on any scene transition, resume in the next scene's idle). Assets are hash-named immutable — warming is pure win; re-visits cost nothing.
6. THE PREFETCH IS POLITE: respect navigator.connection saveData (skip bulk prefetch when set, keep tier ①) · a dataset seam exposes progress (prefetched/total) · the town's raise-cue (scope 2) consumes it — on a warm cache the town raises instantly and the cue never shows.
7. Spec additions: menu idle → tier-① requests observed (playwright network capture) · a scene launch mid-prefetch cancels pending fetches (no bandwidth contention: assert the run's own asset requests are not queued behind prefetch) · saveData=true skips bulk · zero console.

8. THE CASCADE NEVER STOPS (owner sharpening, verbatim: "when in town is downloaded, the first contract is the next thing the player will need... Then loading the contract feels seamless and fast. But we can already prepare the next one and so on."): every scene idle continues the stream ONE STEP AHEAD of the player — in town: the LIKELY next contract first (the board frontier: next unbeaten in chapter order, or last-suspended), then its successor; in a run: the town (the guaranteed return) then the next contract onward. One priority function, consulted everywhere.

## Firewall: build pipeline + the cue + THE PREFETCHER (one module, menu-mounted) + specs. NO source-art changes, NO gameplay, NO asset removals.
END: READY-FOR-GATES + the before/after size table + throttled-boot screenshots.
