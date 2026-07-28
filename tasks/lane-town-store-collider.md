CODEX: model=gpt-5.6-sol effort=high
# lane-town-store-collider — the store at the town's top is walk-through (F-E1W-3)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner E1-walk 2026-07-28, screenshot: hero standing INSIDE the store near the tailor's wagon): at least one town building lacks a solidity collider. MQ-3 class (solidity + never-trap) — the town collision pass covered the plaza core; buildings added later missed their blockers.
READ-FIRST: src/town/townLayout.ts (building placements + any collider registry) · src/town/TownScene.ts movement/collision resolution · docs/MAP-QUALITY-REGISTER.md §MQ-3 (the class law: solid AND never-trap — the hero inside at fix time must be pushed OUT, not imprisoned).
PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.
SCOPE: 1. CENSUS every town building/prop with a walkable footprint vs its collider (table in the report) — fix ALL missing, not just the store (full-fix law). 2. Never-trap: spawning/standing inside a new collider resolves outward. 3. e2e: extend the town collision spec (or add one) walking INTO each building face and asserting non-penetration + a never-trap probe.
TOUCH-ONLY: src/town/townLayout.ts (+ collider data) · the town collision code path if a hook is genuinely missing · one e2e spec. NO: building art, run-scene collision, Terrain.
SELF-CHECK: new/updated spec green desktop+mobile · town boot zero console · walk-probe screenshots into artifacts/town-colliders/.
READY-FOR-GATES + report: the census table (building → had collider? → fixed how).
