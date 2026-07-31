CODEX: model=gpt-5.6-sol effort=xhigh
⛔ **SUPERSEDED s1283 — DO NOT QUEUE THIS FILE. Use `tasks/lane-c-ap-06b-adapter-reland.md`.**
This master tells the runner to BUILD the wiring from scratch. A runner already did that work; it was reviewed (`reviews/ap-06b-adapter-wiring.md`) and preserved on `save/ap-06b-adapter-wiring` (`2f216af0`), blocked only by F-1217-1 — which the owner discharged on 2026-07-30 (*"panel rows BLESSED at their tiers"*). Re-deriving it would be Mistake #8 (the 824k Flail). The successor is a **hunk re-land** and carries the protected-work list this file lacks. Kept on disk per the RETENTION LAW; its measured premise (§9-13) is still accurate apart from the install-site coordinate, which has drifted `:2040` → `:2058`.
# ap-orders-adapter-wiring — AP-06b: BUILD and HARVEST reach the world (F-1212-3)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
**FIRE-AUTHORED (attended review welcome)** — corrective spawned by the s1212 drain of AP-06.

WHY: `reviews/ap-orders-standing-orders.md` F-1212-3, quoting the AP-06 runner's own stop verbatim: "NOT READY-FOR-GATES — standing orders are implemented and tested, but production `Game.ts` does not expose `placeBuilding` or `panAt`; the touch-only firewall prevented wiring BUILD/HARVEST into the real game adapter." **That stop was CORRECT behaviour — the runner refused to breach its firewall. This task lifts the firewall so the wiring can be done lawfully.**

MEASURED PREMISE (re-derive it before you build — do not inherit it):
`src/game/Game.ts:2040` installs the agent stub with an **adapter object literal**, not `this`. It provides exactly five members: `diagnostics`, `economyLog`, `repair`, `collectXp`, `collectGold`. Therefore:
  - `ToolSurface.pan_at` → `game.panAt?.(node)` → **undefined** → `NO_SYSTEM_API`. HARVEST is inert.
  - `ToolSurface.place_building` → `game.placeBuilding?.(...) ?? placeBuildingThroughGame(game, ...)`. The fallback reads `internal.buildSystem` **off that same adapter literal**, which has no such property, so it returns `undefined` too. BUILD is inert.
  - `repair` IS wired (`repairProspectorBuilding`), so REPAIR_UNDER already works — as do MOVE_TO / HOLD / FALLBACK_IF, which act through the embodiment.
VERIFY THIS YOURSELF FIRST (one grep + one read of the install site). If the adapter has changed since 2026-07-29, STOP and report rather than building on a stale premise.

READ-FIRST: `reviews/ap-orders-standing-orders.md` (the finding + evidence) · `src/agent/StandingOrders.ts` (the executor; it calls only `surface.tools.place_building` / `.repair` / `.pan_at`) · `src/agent/ToolSurface.ts:150-200` (the tools block) and `:263-289` (`placeBuildingThroughGame` + `pointBuildGhostAt`) · `src/game/Game.ts:2040` (the install site — THE SUBJECT OF THIS TASK) · the BuildSystem placement/confirm path · `specs/agent-play/README.md` §THE STANDING ORDERS.

PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.

SCOPE:
1. Extend the adapter literal at `Game.ts:2040` so the agent surface can reach the world: supply `panAt` (the same path the player's pan action uses) and either a real `placeBuilding` or the `buildSystem`/`canvas`/`camera` members `placeBuildingThroughGame` needs. **Prefer an explicit `placeBuilding` method over exposing internals** — a named method is a contract; a leaked `buildSystem` is a coupling.
2. Every order still executes AT THE GRANTED RUNG and through legal placement — the ladder and BuildSystem validity remain the law. An illegal or unaffordable BUILD must still fail with its reason, not throw.
3. Preserve the honest-failure property: anything still unreachable fails `NO_SYSTEM_API` and marks the order `failed(reason)`. **Never let an unwired verb silently no-op.**
4. e2e: extend `e2e/ap-standing-orders.spec.ts` (or add one spec) proving, in a plain boot with NO `?debug`, that a submitted BUILD order actually places a building in the world and a HARVEST order actually pans a seam — asserted on world/economy state, not on a receipt shape. **A receipt that says ok is not a building that exists** (Mistake #10: answer "where does the PLAYER see this in a plain boot?").
5. Re-check the module-level singleton in `StandingOrders.ts` (`bindStandingOrders` / `resetStandingOrders`) now that orders can mutate the world: prove a second run/profile does not inherit the first run's orders.

TOUCH-ONLY: `src/game/Game.ts` (the agent-stub install site ONLY) · `src/agent/ToolSurface.ts` (adapter type + wiring only) · `src/agent/StandingOrders.ts` (only if the singleton fix in item 5 requires it) · `e2e/ap-standing-orders.spec.ts` (+ at most one new spec).
NO: the permission-ladder semantics · Economy (sole gold writer) · CombatSystem · the sim/Balance · BuildSystem's own placement rules · View.ts · any other Game.ts concern — this is a wiring task, not a gameplay change.

SELF-CHECK: `npm run test:node-guards` **FIRST** (74/74 — this is the only instrument that sees a suite-uncollectable regression; F-1213-1 shipped past every per-spec gate) · `npx tsc --noEmit` clean · `npm run build` green · own spec both projects · **the adjacent agent battery at `--workers=1`** (m4-01/05/06/07/08/09/10 + task-026) — note `m4-06:395` is a KNOWN ~45% flake per F-1212-2, so re-measure it as a rate before blaming yourself · drain minimum at `--workers=1` · zero console/page errors · plain boot desktop + 390px.
⚠️ **Run every battery at `--workers=1`.** At default workers this repo's drain minimum returns false reds (F-1212-2b, measured 5-failed vs 34/34 on an identical tree).
✅ **UPDATED s1223 — THE RED THIS BLOCK WARNED ABOUT IS CURED; READ THIS INSTEAD OF THE OLD F-1215-1 TEXT.** `ap-standing-orders.spec.ts:80` was cured s1222 (`a0aae876`, **test-only** — no `src/` byte moved) and is now **green in both projects at every load measured**: 64/64 across two fires, at loadavg up to 29 (s1222 + s1223's interleaved T–C–T control). F-1215-1 was right that the red was pre-existing and **wrong that it was a concurrency victim**: the spec let the wave countdown EXPIRE before forcing wave 1, so the `:121` assertion was correctly rejecting the transition; load only set how often the sequencing lost the race. ➡️ **THEREFORE: (a)** a failure in this spec is now a **real regression** — report it, do not write it off as a known red; **(b)** still do **NOT** widen its poll, add retries, or delete assertions — weakening it remains an automatic reject; **(c)** run it at `--workers=4` as well as `--workers=1` and report both counts; **(d)** if any test you ADD is red at `--workers=4` but green at `--workers=1`, say so plainly rather than reporting the serial green.

READY-FOR-GATES + report: which adapter members you added and why you chose method-vs-internals; the world-state assertion proving a BUILD order placed a real building in a plain boot; and the singleton/second-run result from item 5.
