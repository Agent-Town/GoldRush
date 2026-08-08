# Review — mp-07b: headless night parity

**Slice/branch/tip:** mp-07b (`tasks/lane-mp07b-night-parity.md`) · `lane/d` · tip `c24ae2200` · merged `3dec093294b95051b37a54ca94a60c8a4808f58b` · drained attended 2026-08-08.

**Verdict: MERGED — gate green (one known instrument class).**

**What it does:** Night contracts now build a `LightField` headless (hero + live powered lanterns + live decoys + enemy lantern carriers — the browser-equivalent source set), and wreckers move 1.18× outside light coverage, 1× inside; non-wreckers and moth swarms exempt. Cures F-AH-2 — agents and humans now play the same Night Shift. The run's own review caught moth-season omitting hero light and fixed it with selective dimming.

**The honest pin story:** the night-shift IDLE bench pin did NOT move (`fnv1a32:7a7c1e7b` both before and after, both engines) because the idle hero dies as wave 5 begins — before darkness ramps. Re-pinning would have fabricated evidence; instead the new targeted test proves the mechanic directly: disabling the multiplier yields `1 !== 1.18`, restoring passes. the-claim (`fa8a49e7`) and dry-gulch (`f63d981b`) byte-stable.

**Evidence:** tsc rc=0 · build rc=0 · own+adjacent 42/42 both projects rc=0 · guards: node-26 re-run 382 tests / 379 pass / 3 fail = the documented collection-class tripping on the LIVE lane-b worktree (mp-07a building), same fingerprint as the two prior drains today; non-blocking · runner-side: gr-sim 14/14 on BOTH node majors, 381/381 guards, only the two permitted files. Transcript `artifacts/mp-07b-gate.txt`.

**Merge classification:** base = post-f-e2s-1 main (runner pre-flight safe-dupe reset worked); both files LANE-TOUCHED, auto-merge clean.

**Findings:** none blocking.
