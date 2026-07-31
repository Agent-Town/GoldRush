---
source: codex
project: Gold Rush
date: 2026-07-31
type: digest
status: ready-for-gates
---

# AP-06b adapter re-land — READY-FOR-GATES

## Verdict

The reviewed adapter payload from `save/ap-06b-adapter-wiring` at `2f216af0` is re-landed without reverting newer `Game.ts` work. Production standing orders now reach the legal build and harvest systems, and the owner-ratified capability rows are represented at their ruled tiers.

Owner ruling: `tasks/BACKLOG.md`, anchor `OWNER RULINGS 2026-07-30 (blocker sweep, both via decision panel)`.

## Lane safety and scope

- `node scripts/lane-freeze-classify.mjs lane/e2-arsenal` classified all three ahead paths as `DUPLICATE`; their content was already on `main`.
- Reset to current `main` was therefore loss-free. The starting worktree was clean, with no evidence debris.
- Abort check before editing: `grep -c panAt src/game/Game.ts` returned `0`.
- Pre-change `npm run build` passed.
- No merge, file checkout, or copy from the salvage branch was used.
- No `ProspectorPanel` change was needed: its existing derived-capability renderer handles both rows.
- No dependencies were added.

## Implementation

`src/game/Game.ts` diff against `main`:

```text
46  0  src/game/Game.ts
```

The hunk is purely additive. It adds only these adapter members between `economyLog` and `repair`:

- `placeBuilding`: rejects invalid run states, delegates to `BuildSystem.confirmPlacement`, records ledger discovery and the county action only after placement succeeds.
- `panAt`: validates the live seam, captures the harvest future state, performs one synthetic Prospector tick, merges only the target seam result, restores the prior player channels, and refreshes diagnostics.

The newer bench-seed/submission-policy telemetry and Trail Guide priority system remain untouched.

`place_building` is now an `AgentAbility`, defaults enabled for fresh runs, is advertised at level 3 with `et.goldrush.place_building`, and appears in the consent snapshot. Legacy future-state objects may omit it; `restoreFutureState` accepts them and defaults the ability to `false`.

## Production world proof

`e2e/ap-standing-orders.spec.ts` reaches the production ToolSurface without `?debug` and asserts `window.__GR_TEST__ === undefined`.

In that plain boot:

- Two HARVEST orders reduce the real target seam by 10 gold total, emit two `gold_panned` events, and leave the player's active seam and channel progress isolated.
- A BUILD order increases the real palisade count by one, spends 10 gold through the economy, and records `gold_spent` with sink `build_palisade`.
- An unaffordable BUILD order ends `failed` with a reason and does not change building count.
- A separate isolation proof advances the player's channel only by the expected next player tick while the Prospector pans another seam.

The legacy-consent test removes `place_building`, restores successfully, and observes `placeBuilding: false`.

## Adjacent assertion updates

- At rung 0, `auto_pan` is visible and locked with `needs trusted-routine (rung 2)`; `place_building` is visible and locked with `needs autonomous-within-budget (rung 3)`.
- At rung 3, both controls are earned, grantable, and included in the exact derived capability/tool list.
- The first successful pan now says `shine`. Boot heartbeat consumes receipt ordinal 1 without a bark; the pan is ordinal 2, and `AGENT_BARKS.pan[2]` is `shine`. Before the adapter existed, `NO_SYSTEM_API` took the hard-coded `pan...` fallback instead.

## Conformance mutation

With both `place_building` declarations temporarily changed from level 3 to 2, the focused guard exited non-zero: one test passed and both consent/ToolSurface level pins failed. After restoration, all 3 focused tests passed.

## Gate evidence

- `npm run test:node-guards`: 190/190 node tests passed; ticker, findings-state, and ruling-propagation checks passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed.
- Own spec, both projects, serial: 10/10 passed.
- Adjacent battery (`m4-01/05/06/07/08/09/10`, `task-026`, `ap-standing-orders`), serial: 73 passed, 1 expected desktop skip, 0 failed.
- Drain minimum (`task-025`, `m1-01`, `m2-01`, `_s106-prospector-boot-probe`), serial: 34/34 passed.
- Relevant browser gates assert zero console and page errors.
- Independent `codex review --uncommitted` reran diff-check, TypeScript, build, and the focused conformance guard successfully.

Browser gates regenerated 30 unrelated evidence files under existing artifact/review directories; all were discarded under the task's evidence-artifact exception.

## Visual evidence

- `reviews/shots-ap-06b-adapter-reland/plain-boot-desktop-chrome.png`
- `reviews/shots-ap-06b-adapter-reland/plain-boot-mobile-chrome.png` (390 CSS px viewport)

Both were inspected directly and together in Preview. They show the real palisade, zero remaining gold, the successful `shine` bark, and no debug-only surface.

## Independent review follow-ups

The second-opinion review found four genuine integration gaps outside this task's explicit touch-only firewall. They were not folded into this one-slice patch:

1. Direct `ToolSurface.place_building` still inherits the generic side-effect gate at rung 1 even though the capability advertises rung 3.
2. `StandingOrders.requiredAbility()` does not map BUILD to `place_building`, so revoking the new checkbox does not block a BUILD order.
3. `RunSuspend.decodeAgent()` strips `place_building`; a new save can therefore restore it as `false`.
4. `LockstepClient.normalizeLockstepAction()` drops multiplayer `set_agent_ability` actions for `place_building`.

These need a permission/persistence follow-up touching `StandingOrders.ts`, `RunSuspend.ts`, `LockstepClient.ts`, and their existing contract tests. They do not invalidate the task's requested production BUILD/HARVEST world-state proof, legacy absent-key restore default, or additive adapter re-land, but the orchestrator should carry them before calling the broader place-building consent lifecycle complete.
