# Review: M4-01 agent tool-surface scaffold (lane/m4 a79c87c → main, s32 gate)

Verdict: **MERGED** (two-parent, plumbing path). Task: `tasks/lane-b-m4-01-agent-scaffold.md`. Protocol: s9v v2 evidence-first lane drain, second of its kind (m3-01 precedent).

## Scope
Exactly 4 new files, zero in-lane edits to existing code — diffstat matches the task's NEW-files-only scope:
- `src/agent/ToolSurface.ts` (301) — `et.goldrush.{get_state, pan_at, repair, chase_mark, place_building}`, typed receipts `{tool, args, outcome, cost?}`, cost derived read-only from the Economy log delta.
- `src/agent/PermissionLadder.ts` (31) — levels 0–3, duck-typed `MetaProgressAgentGate` (no hard lane-a import), side-effect tools refuse at level 0 with `PERMISSION_DENIED + requiredLevel: 1`.
- `src/agent/AgentStub.ts` (60) — debug-gated receipt log + hidden `agent-stub-marker` DOM node; heartbeat = `get_state`; `dispose()` removes marker, clears receipts.
- `e2e/m4-01-tool-surface.spec.ts` (193) — dynamic-imports the module through vite dev with a `__GR_TEST__` adapter; self-skips on built previews.

ADR-002 compliance: M4 never writes MetaProgress ✓ (reads `agentAutonomyLevel` only); namespace/snake_case per §3 + brief §9.4 ✓; no Game.ts edit in-lane ✓ (§4). Economy stays sole gold writer ✓ (log reads + `gold_spent` parsing only); CombatSystem untouched ✓.

## Merge-session work (ADR-002 §4, orchestrator, folded into the merge commit)
`Game.ts`: `installAgentStub({ economyLog: () => this.economy.log })` at constructor end (after `installRunManager`) + one boot `heartbeat()` + `agentStub?.dispose()` in dispose. State reads fall back to `window.__THREE_GAME_DIAGNOSTICS__` (published one line earlier). MetaProgress deliberately NOT bound — see finding 2.

## Gates (sandbox /tmp/gr-s32, /tmp survivals intact, all green)
- tsc 0; vite build clean (451ms).
- m4-01 e2e **8/8 both projects** (no skips — dev-mode import exercised): get_state parity vs direct harness; place_building Economy-log byte-equality incl. exact `gold_spent sink build_sentry_beacon amount 25` + `cost: 25` receipt; level-0 typed refusals with zero log delta; unbacked tools refuse via `NO_SYSTEM_API` without mutating the log.
- Canaries: m3-01 **8/8** (exercises the constructor region the wiring touched); m1-05 **6/6**; vp-02 **11/11** (5 split groups + the rotation trio 424/483/512 — first groups missed them, caught via `--list` tiling check per the s27 shrunk-set lesson).
- Boot probe (fresh vite :5199 + chromium-1228 by executablePath): `?debug` → marker present, 1 `[goldrush-agent]` heartbeat receipt on console.debug, zero console/page errors, desktop + 390 shots; no `?debug` → no marker, zero errors. Shots: `reviews/shots-m4-01/`.

## Findings (non-blocking, batched for M4-02)
1. **`placeBuildingThroughGame` fallback pokes BuildSystem PRIVATE fields** (`pointerReady/pointerClientX/pointerClientY`) — works at runtime, fragile coupling, and NOT covered by the e2e (its adapter routes via `__GR_TEST__` instead). Corrective when M4-02 makes the agent act: public `BuildSystem.placeAt(def,pos,rot)` or bind real APIs in the Game-side adapter; until then the fallback is dead code (nothing calls `place_building` at runtime).
2. **Runtime permission level is pinned 0** — the merge wiring binds `economyLog` only; `MetaProgress.agentAutonomyLevel` exists (m3-01 suite proves it) but is not fed to the adapter. Safe-by-default for a scaffold (suggest-only). M4-02 must bind meta → ladder and add an e2e asserting level escalation.
3. **`costFromDelta` reads log-length delta** — Economy's log is capacity-capped (`Balance.economy.logCapacity`); rotation mid-call would misattribute cost. Moot while the stub only heartbeats; when tools go live, switch to a monotonic event counter or `gold_spent` subscription.
4. e2e's built-preview self-skip is silent by design; the m4-01 suite is therefore dev-server-only coverage. Acceptable (config's webServer is `npm run dev`), but a future full-preview sweep should not count m4-01 among its verdicts.

## Watch
- `install()` hangs `agentTools`/`agentStub` on the ADAPTER object, not on a global — no leak into window; e2e constructs its own surface. Fine, but M4-02's receipts feed will need a real handle (likely via DebugTools).
