# lane-b — F-1288-3: carry `place_building` across the save round-trip (and the multiplayer wire)

**FIRE-AUTHORED (attended review welcome)** — s1288, 2026-07-31.
**Role:** you are the lane-b runner. **Workdir:** `worktrees/lane-b` (branch `lane/m4`).

## READ FIRST (paths, in this order)

1. `src/agent/AgentConsent.ts` — `:3` the ability union · `:16` `place_building` is level 3 · `:32-33` the suspend type marks `light_duty` **and** `place_building` optional · `:47-60` `restoreFutureState` · `:90` capture emits `place_building` · `:113` the fresh default is `true`.
2. `src/game/RunSuspend.ts` — `:2570-2661` `decodeAgent`, especially `:2578` (three values validated) and `:2656-2661` (**four** keys returned) · `:944` where the decoded object reaches `restoreFutureState`.
3. `src/mp/LockstepClient.ts:1051-1055` — `normalizeLockstepAction`'s `set_agent_ability` arm.
4. `src/agent/StandingOrders.ts:416-421` — `requiredAbility`, as merged by `65d15a91`.
5. `e2e/ap-standing-orders.spec.ts:270-296` — `consent restores a save from before place-building existed`. **This test is CORRECT and must stay green.**
6. `tasks/BACKLOG.md` — the **F-1288-3** row (the full evidence chain) and the s1288 DRAINED row above it.

## WHY (evidence, dated)

F-1285-3 ⑶/⑷, raised by the ap-06b second-opinion review and re-verified at source by the s1288 fire on 2026-07-31.

`AgentConsent` registers **five** abilities. Two serialization boundaries still enumerate the pre-existing four:

- **Save round-trip** — capture emits `place_building` (`AgentConsent.ts:90`); `decodeAgent` returns an object without it (`RunSuspend.ts:2656-2661`); `RunSuspend.ts:944` hands that to `restoreFutureState`; `AgentConsent.ts:56` therefore stores **`false`**.
- **Multiplayer** — `normalizeLockstepAction` allow-lists `auto_collect | auto_repair | auto_pan | light_duty` and returns `null` for `place_building` (`LockstepClient.ts:1052-1053`), so toggling that checkbox is dropped on the wire.

⚠️ **Urgency, and it is new:** before `65d15a91` (merged s1288) this was cosmetic — nothing read the ability for BUILD. That merge made `requiredAbility(BUILD)` return `'place_building'`, so **today, resuming a saved run silently revokes building consent and the Prospector stops placing buildings**, for a player who never touched the checkbox (fresh default is `true`).

🔑 **The fix shape is already in the file.** `light_duty` is optional in exactly the same way and is carried anyway at `:2660` via `light_duty: abilities.light_duty === true`. `place_building` needs the identical idiom. **This is an omission, not a design decision** — do not "preserve" it.

## SCOPE

**0. Re-derive the defect before curing it (ABORT gate).**
Print, from the real code, the four cells: for a state with `place_building: true`, the value after `captureFutureState()` → `decodeAgent()` → `restoreFutureState()`, and the same for `light_duty` as the **control**. Expect `place_building: false` (defect) and `light_duty: true` (control passes).
⛔ **If `place_building` already round-trips as `true`, STOP and report** — the defect is already gone and this master is stale. Do not invent work.

**1. Carry `place_building` through `decodeAgent`.**
Add it to the returned `abilities` object using the same optional-safe idiom as its sibling (`=== true`). Old saves lack the key and must keep restoring as `false` with `ok: true` — that migration is ratified and its test is listed above.
⚠️ **Do NOT add `place_building` to the `abilityValues` strictness check at `:2578` or to the `'agent.consent.abilities must contain three booleans'` reason at `:2583`** — that would make **every pre-existing save fail validation**, which is a far worse bug than the one you are fixing. The key is optional on the wire *by design*; only the carrying is missing.

**2. Accept `place_building` in `normalizeLockstepAction`.**
Add it to the allow-list at `LockstepClient.ts:1052-1053`. It is a member of the same registry as the four already there; no new action type, no schema change.

**3. Assertions — one per boundary, in the existing specs.**
- Round-trip: a **new** save with `place_building: true` restores as `true`; and the legacy-save test still yields `{ok: true, placeBuilding: false}`. Put the new assertion where the existing consent-restore test lives (`e2e/ap-standing-orders.spec.ts`).
- Multiplayer: `normalizeLockstepAction` returns a non-`null` action for `set_agent_ability` with `ability: 'place_building'`. Use whichever existing spec/guard already covers that normalizer; if none does, state that in your report and put it beside the closest lockstep coverage.

**NO WEAKENING:** no deleted assertion, no loosened matcher, no `skip`, no touched timeout.

## FIREWALL

**TOUCH-ONLY:** `src/game/RunSuspend.ts` (`decodeAgent`'s returned `abilities` object only) · `src/mp/LockstepClient.ts` (the `set_agent_ability` allow-list only) · `e2e/ap-standing-orders.spec.ts` · the one lockstep spec you identify in scope 3 · `logs/session-scratch/s1288-lane-b/**` · `reviews/f1288-3-place-building-roundtrip.md`.

**NO:** `src/agent/AgentConsent.ts` — any line (read it, never edit it) · `src/agent/StandingOrders.ts` — `65d15a91` is correct and settled · `requiredLevel()` and the rung ladder — **owner-ruled**, and F-1279-2 is an open owner question · the `abilityValues` validation at `RunSuspend.ts:2578` and the reason string at `:2583` (see scope 1's warning) · `tasks/goals.json` · `tasks/BACKLOG.md` · `STATUS.md` · any other `src/` file.

## SELF-CHECK BEFORE YOU REPORT

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:node-guards` — **expect rc=0.** ⓘ If it reds on `tasks/goals.json`, that is **F-1288-1**, cured on main by `6b85a306`; report it and do not touch the file — but a red there means your base is stale, so say so.
- `npx playwright test e2e/ap-standing-orders.spec.ts --workers=1` — **both projects**, name the pass count. ⚠️ **`--workers=1` is mandatory (§3.1)**: at default workers the fire shell manufactures drift reds, so a red measured any other way is not evidence.
- Adjacent, derived by grep rather than assumed: `grep -rln "place_building\|restoreFutureState\|decodeAgent\|set_agent_ability\|lockstep" e2e/` — run what it names at `--workers=1` and report each result.
- `git diff main -- src/` must show **exactly `src/game/RunSuspend.ts` and `src/mp/LockstepClient.ts`** — nothing else.

READY-FOR-GATES + report: the four scope-0 cells before and after · the exact lines added · which specs carry the two new assertions · confirmation the legacy-save test still returns `{ok: true, placeBuilding: false}` · both-project `--workers=1` output · the `git diff main -- src/` file list · **or an explicit STOP** if scope 0 came back already-correct.
