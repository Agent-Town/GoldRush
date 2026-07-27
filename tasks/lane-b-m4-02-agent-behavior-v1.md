> ⛔ **SUPERSEDED — DO NOT QUEUE UNCHANGED (Mistake #8 guard, verified s1131 2026-07-27).** Two of this master's load-bearing premises are false on main today: **(a)** corrective 1 orders a new public `BuildSystem.placeAt(def, pos, rot)` — **no `placeAt` exists in `src/systems/BuildSystem.ts`**; **(b)** it binds the agent mark to **KeyG**, but `src/core/InputController.ts:18` now assigns `debugPlant: ['KeyG']` and **G opens the Prospector panel** (`tasks/lane-b-m4-07-prospector-panel.md` scope 1) — so the key this master claims is taken twice over. The agent's behavior shipped by a different route: `src/agent/Embodiment.ts` (319 lines) + consent gating via `src/agent/AgentConsent.ts` + the m4-08 attribution split. **If any item of its behavior list is still wanted, re-author against today's input map — do not queue this.** See F-1131-4.

# Lane B / M4-02: agent behavior v1 — the Prospector acts (worktree lane-b, branch lane/m4, prefix "m4:")

PRE-FLIGHT (binding): verify worktree lane-b is REGISTERED (`git worktree list` shows it) and fresh against main (m4-01 merged as `b7a4e9c`). If unregistered or stale → STOP, report, change nothing (s36/s41 rule).

READ: AGENTS.md, docs/decisions/ADR-002, brief §6–7 (Foreman pattern: approvals/receipts), your landed m4-01 (`src/agent/ToolSurface.ts`, `PermissionLadder.ts`, `AgentStub.ts`), `reviews/m4-01-tool-surface.md` findings 1–3 (all three are MANDATORY correctives in this slice), north star: teen-grade clarity.

## Correctives first (from m4-01 review, batched here)
1. **Kill the private-field poke.** `ToolSurface.ts:213` sets `build.pointerReady` (private, fragile, untested). Add a minimal PUBLIC `BuildSystem.placeAt(def, pos, rot)` that routes through the exact same validation/spend path as pointer placement, switch `place_building` to it, DELETE the fallback. No other BuildSystem changes.
2. **Bind meta → ladder.** Runtime level is pinned 0 because Game's adapter binds `economyLog` only (Game.ts:422). Extend the `install()` adapter signature to accept a meta reader (`MetaProgress.agentAutonomyLevel` — m3-01 proves it exists); ladder reads live level. Per ADR-002 §4 you do NOT edit Game.ts in-lane: ship the signature + a one-line "MERGE-SESSION WIRING" note in your summary; orchestrator lands the Game.ts line at merge. e2e must assert level escalation changes tool outcomes (0 refuses → 1 executes).
3. **Fix `costFromDelta`.** It diffs log LENGTH (`ToolSurface.ts:255`); Economy's log is capacity-capped → rotation misattributes cost. Replace with a monotonic event counter or a read-only `gold_spent` subscription on the adapter. Economy stays SOLE gold writer — read/subscribe only, zero writes outside it.

## Behavior spec (all action via ToolSurface ONLY — zero direct system calls)
- Agent body: billboard placeholder — batch-001 hero sprite tinted teal-lantern, distinct hat band. Canon-safe, no new art. (Jumper-free hero sheets land with batch-007/task 023 — do NOT wait on them; slot by filename so the swap is free.)
- Default: idle-follow hero at fixed offset.
- Priorities (simple ordered list, no planner): (a) `pan_at` nearest uncontested gold node while hero is fighting — "fighting" is DERIVED from `get_state` reads (enemy within radius of hero); there is NO combat event in EventBus and M3-02's `wave_started` is UNMERGED — do not depend on it. (b) `repair(building)` on damaged/ruined building only when no enemies in radius (BuildSystem repair state exists: `repairProgress`/`repairs`/`repairGold`). (c) `chase_mark(thief)` ONLY when the player marks.
- **Mark input is KeyG, not T** — stub said T but `KeyT` is TAKEN by `debugSpawn` (InputController.ts:195). Add `KeyG` → mark nearest fleeing thief (thieves are real: `enemy.isThief`, `Balance.steal`, WaveSystem thief spawns). Agent pursues; takedown resolves through CombatSystem (SOLE damage resolver — no HP math in agent code); recovered gold banks through Economy and FLOATS its amount like every pickup; receipt `gold_reclaimed`.

## Receipt feed (the ladder is REAL from day one)
- Handle decision (m4-01 Watch): `install()` RETURNS the stub whose receipts array is the single source; Game already holds `this.agentStub` — HUD binds through UiBridge to that handle. NO window global in prod; under `?debug` only, expose `window.__GR_AGENT__` (read-only) for e2e, matching the `__GR_GUI__` pattern (DebugTools.ts:51).
- HUD: compact ledger strip, last 3 receipts, ledger voice ("Pan +6g · Repaired Sluice −4g · Reclaimed 12g"); full log on the pause screen (pause exists: KeyP/Escape). Every action = exactly one receipt, human sentence + cost/gain.
- L0 = suggest-only: side-effect receipts become PROPOSALS requiring Enter-approve before execution (typed refusal path from m4-01 stays intact).

## e2e (new spec + keep old suites green)
1. Agent pans only while hero-in-combat condition holds (drive via spawned enemies, not events).
2. Repair receipt matches Economy log entry EXACTLY — same single writer, byte-equal amounts.
3. KeyG mark → pursuit → thief down via CombatSystem → `gold_reclaimed` receipt + floated amount.
4. L0 blocks side-effects until approved; approval executes exactly once.
5. Level escalation: meta autonomy 0→1 flips refusal→execution (corrective 2 proof).
6. Zero-bypass assert: receipts count === tool calls count; no agent code path touches Economy/CombatSystem/BuildSystem except through ToolSurface.
Note: m4-01 suite is dev-server-only (self-skips on preview) — yours may follow the same pattern; say so in the summary.

## Fences
- Files in scope: `src/agent/*`, ONE additive public method in `src/systems/BuildSystem.ts`, HUD strip via `src/ui/Hud.ts` + UiBridge, `src/core/InputController.ts` KeyG intent, new e2e. Do NOT touch: Game.ts (merge-session), Economy internals (subscribe hook additive-only if none exists), CombatSystem internals (register damage source through its existing API), WaveSystem, RunManager/MetaProgress (READ only — M4 never writes meta, ADR-002), Balance values outside a new `agent` section, OrientationResolver/SpriteAnimator (task 024's scope).
- Canon §9: frontier-tech only, illustrated never gory (thief takedown = bloodless poof reuse), naming snake_case per §9.4 + brief; teal-lantern is the agent's signature tint.

This is the wow-card slice — feel matters: receipts are charming ledger voice, the agent should read as a helpful partner, not a turret. READY-FOR-GATES + files changed + gate results + merge-session wiring note.
