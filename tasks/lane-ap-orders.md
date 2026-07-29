CODEX: model=gpt-5.6-sol effort=xhigh
# lane-ap-orders — STANDING ORDERS: the plan the reflexes obey
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/agent-play/README.md §THE STANDING ORDERS (owner greenlight 2026-07-29). The rider plans; the game executes at tick rate; the rider is re-invoked only at wave boundaries + surprises.
READ-FIRST: the spec section · src/agent/ToolSurface.ts + Embodiment.ts + PermissionLadder.ts (orders execute AT THE GRANTED RUNG — never above; the ladder is the law) · BuildSystem placement rules (orders must go through legal placement/validity) · Enemy/threat query points for trigger predicates.
PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.
SCOPE:
1. src/agent/StandingOrders.ts — a small validated vocabulary (schema-checked, reject-don't-stretch): BUILD {what, where, when: gold>=N|wave>=N} · REPAIR_UNDER {pct} · MOVE_TO/HOLD {pos} · HARVEST {seam|sluice} · FALLBACK_IF {threat predicate → pos} · ORDER PRIORITY = list order. Unknown verbs = rejected with reason (vocabulary law, Mistake #14).
2. Executor on the reflex clock inside Embodiment: evaluates predicates per tick-batch, acts through the EXISTING tool surface actions (legal placement, ladder-gated), marks each order pending/active/done/failed(reason).
3. SURPRISES — a trigger the plan never named (claim damage, order failure, hero down, wave early): append a surprise event to THE VIEW log + set needsRider flag readable via et.goldrush.view.
4. submit_orders tool (et.goldrush.orders): replaces the standing set atomically; keeps history in the view log.
5. e2e: seeded run — orders execute in priority order · gold-gated build fires exactly when affordable · illegal placement fails with reason, run continues · surprise flag raises on scripted breach · ladder rung respected (an order above rung = rejected).
TOUCH-ONLY: src/agent/StandingOrders.ts (new) · Embodiment.ts (executor hook) · ToolSurface.ts (orders tool) · one e2e spec. NO: View.ts (sibling), sim/Balance, permission ladder semantics.
SELF-CHECK: both projects green · tsc + build + release strip intact · zero console.
READY-FOR-GATES + report: the vocabulary as shipped + a transcript of one seeded run's order lifecycle.
