CODEX: model=gpt-5.6-sol effort=xhigh
# lane-ap-view — THE VIEW + THE ALMANAC: what the rider reads
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/agent-play/README.md §THE STANDING ORDERS + THE ALMANAC (owner greenlight 2026-07-29: "Ok, then lets implement and then test it."). The rider needs a compact, cache-shaped view of the run with deterministic projections — consequences, not pixels.
READ-FIRST: the spec sections (the law) · src/agent/ToolSurface.ts + Embodiment.ts (the agent surface this extends; permission ladder read-only here) · src/game/StatSimHarness.ts (the projection engine to REUSE — do not build a second simulator) · the wave/spawn schedule source (where next-wave composition/timing lives) · RunManager summarizeRun (score fields).
PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.
SCOPE:
1. src/agent/View.ts — buildView(): STABLE PREFIX (contract briefing digest, map digest: seams/water/spawn gates/claim pos, the rider's current orders) + APPEND LOG (per-wave entries: outcome, gold delta, works hp, kills, surprises) + NOW block (wave, timers, gold, hero/works state, active threats compact).
2. THE ALMANAC block — next wave's composition + arrival timing from the schedule, plus a StatSimHarness-based projection: with current works, expected leaks/damage/gold. Deterministic, cheap, honest about being an estimate (label it "the Almanac reckons").
3. Expose as a read tool on the agent surface (et.goldrush.view) + a __GR_AGENT__ getter; full build only (release compiles the agent surface out already — verify, do not change that).
4. e2e: view shape stable (snapshot test on seeded run) · almanac projection present + plausibly bounded · append log grows per wave · zero console.
TOUCH-ONLY: src/agent/View.ts (new) · ToolSurface.ts (register the read tool) · one e2e spec. NO: game sim, Balance, orders execution (sibling task), release gating.
SELF-CHECK: both projects green · tsc + build + release build still strips the surface · zero console.
READY-FOR-GATES + report: a sample VIEW dump (verbatim) from a seeded the-claim run at wave 3.
