CODEX: model=gpt-5.6-sol effort=xhigh
# agent-rung-honest-gate-v2 — enforce the two RULED rungs; leave the two UNRULED ones exactly where they are (F-1218-1)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
**FIRE-AUTHORED s1292 (attended review welcome)** — re-author of `tasks/lane-c-agent-rung-honest-gate.md` against a CHANGED PREMISE, explicitly authorized by the owner (see WHY). The v1 master STOPPED lawfully **twice** (s1219, s1291). Do not read v1 as your instruction set; read this file.

## WHY — the premise changed, by an owner ruling, and v1 was never re-authored to match

`tasks/BACKLOG.md`, the `OWNER RULINGS 2026-07-30 (blocker sweep, both via decision panel)` row (**cite it by that anchor text — rows land above it and the line number drifts**), owner verbatim:

> AGENT VERB RUNGS — auto_pan/HARVEST = **LEVEL 2** (*"harvesting is the hero's basic verb"*), place_building/BUILD = **LEVEL 3** (*"building spends gold"*); panel rows BLESSED at their tiers. F-1219-1 RULED.
> RE-QUEUE AUTHORIZATION: … `ap-06b-panel-ladder-and-voice` + `agent-rung-honest-gate` **re-author against the ruling (changed premise per §5)**.

That authorization is why this file exists. **v1 was re-queued unchanged instead (s1291) and reproduced the identical STOP for 160,694 tokens — F-1292-2, `reviews/agent-rung-honest-gate-s1292.md`.**

**The defect is unchanged and re-verified at source s1292:**
```ts
// src/agent/PermissionLadder.ts:24-31 — the tool is never an argument
export function decideToolPermission(meta, sideEffect: boolean): PermissionDecision {
  const level = …;
  if (!sideEffect || level > 0) return { ok: true, level };
  return { ok: false, level, reason: 'PERMISSION_DENIED', requiredLevel: 1 };  // hardcoded 1
}
// src/agent/ToolSurface.ts:226 — the sole call site HAS `tool` in scope at :222 and drops it
const permission = decideToolPermission(level, true);
```

**What HAS moved since v1 was written — v1's own NO list and MEASURED PREMISE are now stale, which is exactly what stopped the last run. Re-derive all of it, but know what you are looking for:**
- `auto_pan` is declared **2**, not 3 (`src/agent/ToolSurface.ts:380`, landed `85bb1938`). v1's NO list still said *"auto_pan stays 3"*.
- `place_building` **now has a declared capability, at level 3** (`src/agent/ToolSurface.ts:386`, landed `12b0011e`). v1's MEASURED PREMISE still said it had none.

## THE RUNG TABLE — RULED vs UNRULED. This distinction governs the whole task.

| Capability | Declared | Status | Your instruction |
|---|---:|---|---|
| `auto_pan` (`pan_at`) | **2** | ✅ **RULED L2** by the owner 2026-07-30 | **ENFORCE IT** |
| `place_building` | **3** | ✅ **RULED L3** by the owner 2026-07-30 | **ENFORCE IT** |
| `auto_collect` (`collect_xp`/`collect_gold`) | 1 | ✅ unchallenged | enforce (no-op: already effectively 1) |
| `auto_repair` (`repair`) | 1 | ❌ **UNRULED — F-1279-2 is live on the owner's desk** | **DO NOT MOVE THE VALUE.** It stays 1. The ratified ladder line says 2; the owner has not answered. Not yours. |
| `chase_mark` | **none** | ❌ **UNRULED — F-1219-2's open half** | **DO NOT INVENT A RUNG.** No declared capability ⇒ the gate's default of **1**. Do not add it to `implementedCapabilities`. |

⚠️ `scripts/agent-rung-conformance.test.mjs:9-14` asserts `auto_repair: 1` and **will red if you move it** (F-1281-3, by design — it is a tripwire for the owner's answer, not a defect). Leave it green.

## SCOPE

1. **RE-DERIVE THE TABLE FIRST** from `src/agent/ToolSurface.ts` (`implementedCapabilities`, ~`:351-390`) and confirm the five rows above at source. **If any declared value differs from this table, STOP and report** — you are then on a third changed premise and this master is stale too.

2. **THREAD THE TOOL'S REQUIRED RUNG INTO THE DECISION.** `decideToolPermission` takes the required rung (**default `1`**, preserving today's behaviour for every undeclared tool) instead of assuming it; `runSideEffect` passes the rung for the `tool` it already has in scope at `ToolSurface.ts:222`; the returned `PermissionDecision.requiredLevel` reports the **real** required rung. A tool with no declared capability keeps **1** — that is how `chase_mark` stays where canon left it without you inventing anything.

3. **UPDATE EXACTLY THE ASSERTIONS THE RULING CONTRADICTS — AND NOTHING ELSE.** These are **pre-authorized to move**, because each encodes pre-ruling behaviour that the owner has since overruled. Measured at source s1292; **re-verify each coordinate before editing, they drift:**

   | Site | What it asserts today | Why it must move |
   |---|---|---|
   | `e2e/m4-01-tool-surface.spec.ts:127` ("place_building delegates to the direct build path and receipts the exact economy log") | `place_building` **succeeds at level 1** | build is **L3** ⇒ must be denied |
   | `e2e/m4-01-tool-surface.spec.ts:146` ("level 0 blocks every side-effect tool with a typed refusal and no log delta") | `requiredLevel === 1` for **all four** tools at level 0 | pan→**2**, build→**3**; repair/`chase_mark` **stay 1** ⇒ becomes per-tool, not blanket |
   | `e2e/m4-01-tool-surface.spec.ts:172` ("unbacked action tools refuse without mutating the direct economy log") | rung-1 `pan_at` reaches `NO_SYSTEM_API` | pan is **L2** ⇒ `PERMISSION_DENIED` before the API is reached |
   | `e2e/m4-05-agent-closeout.spec.ts:243` ("side-effect permission checks read live meta on each call") | `requiredLevel: 1` for `place_building` at level 0 | build is **L3** |
   | `e2e/m4-05-agent-closeout.spec.ts:243` ("side-effect permission checks read live meta on each call") | `place_building` **succeeds at level 1** | build is **L3** ⇒ must be denied |

   **Preserve each test's INTENT.** `:179`'s test is titled *"unbacked action tools refuse without mutating the direct economy log"* — the refusal and the no-log-delta are the contract; only the `reason` moves. `:267`'s test proves the build path works end-to-end when permitted — **raise its driven level to 3 rather than deleting the success case.** Do not delete a test to get green; that is an automatic reject.

4. ⛔ **THE HARD STOP, NARROWED — this is the one change that makes the task completable.** v1 said *"if enforcing declared rungs would change ANY currently-green assertion, STOP"*. That rule can never be satisfied: `m4-01:164` is both a blocking assertion **and** was on the leaf's must-not-touch list (**F-1292-1**). The new rule:
   **If enforcing the two RULED rungs would change any green assertion NOT in item 3's table, STOP and report that assertion with its file, line, driven level and what it asserts.** Do not extend item 3's list yourself. Do not lower a declared rung to fit a test. Do not touch an unruled row's value.

5. **THESE THREE PAN-AT-L2 FAMILIES MUST STAY GREEN — they are the owner's ruling working, and they are your regression signal.** They drive `pan_at` at **level 2 and require success**, which is exactly what L2 means: `e2e/066-walk8-engine.spec.ts:161` ("Prospector hover8 plays eight distinct frames while panning") · `e2e/m4-05-agent-closeout.spec.ts:212` ("hero death creates no orphan agent receipts and reset returns the Prospector home") and `e2e/m4-05-agent-closeout.spec.ts:280` ("victory pause agent calls do not bank gold into the stale or next run") · `e2e/m4-06-embodiment.spec.ts:248` ("Prospector defers XP gathering while a higher-priority receipt is active"), `e2e/m4-06-embodiment.spec.ts:289` ("real Prospector sprite loads and faces pan movement"), and `e2e/m4-06-embodiment.spec.ts:364` ("debug receipt moves the Prospector toward a panning target and floats ledger voice"). **If any of these reds, your cure is wrong — do not "fix" them.**

6. ⚠️ **THE DEBUG STUB IS GATED BY THE SAME CALL, AND ITS SPECS ARE IN YOUR BLAST RADIUS — MEASURE THEM, DO NOT ASSUME.** `src/agent/AgentStub.ts:86` `panAt()` delegates to `this.surface.tools.pan_at(node)` (verified at source s1292), so `window.__GR_AGENT__.panAt()` runs through `decideToolPermission` too. `e2e/polish-03-mobile-hud.spec.ts:197` ("mobile HUD controls fit, tap, and avoid overlap at 390px and 430px") drives it at **L1** and `e2e/trail-guide-beat-priority.spec.ts:59` ("first-run Guide holds through a bark storm, then the newest bark surfaces") at **L0**. Their assertions are about **receipt-feed growth and bark text**, and `AgentStub.record()` records denial receipts as well as successes — so they *probably* stay green, **but "probably" is not evidence: run both specs and report the literal result.** If either reds, it is an item-4 STOP, not something you fix.

7. **PROVE IT WITH A TEST THAT FAILS WITHOUT THE FIX.** Add to `e2e/m4-01-tool-surface.spec.ts` (which already drives an explicit `permissionLevel` at `:35-62` — use that harness, do not write a third): a tool whose required rung is above the driven level is denied with `reason:'PERMISSION_DENIED'` **and the correct `requiredLevel`**; the same tool at or above its rung succeeds. **Mutate the cure to confirm the test actually reds without it, and report the mutation and its output.**

8. **Leave the AP-06b wiring and the panel alone.** This slice changes what the gate can *express* and corrects five assertions the owner overruled. It does not wire `panAt`, does not touch the panel, does not touch `Game.ts`.

TOUCH-ONLY: `src/agent/PermissionLadder.ts` · `src/agent/ToolSurface.ts` (the `runSideEffect` gate call + the rung source ONLY — **not the declared level values**) · `e2e/m4-01-tool-surface.spec.ts` · `e2e/m4-05-agent-closeout.spec.ts` (**only the two sites named in item 3**).
NO: **the declared rung VALUES** (`auto_pan` 2, `place_building` 3, `auto_collect` 1, `auto_repair` **1**) · adding a capability for `chase_mark` · `scripts/agent-rung-conformance.test.mjs` · `src/game/Game.ts` · the AP-06b wiring · `StandingOrders.ts` (already correct — it is your reference, not your subject: `:342` BUILD→3, `:402` rung earned+granted, `:405` ability allowed) · `AgentConsent.ts` · the panel/HUD · Economy · CombatSystem · the sim/Balance · **deleting or widening any assertion to get green**.

PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.

READ-FIRST: `reviews/agent-rung-honest-gate-s1292.md` (**the re-derivation this master is built on — the ruled/unruled split and the five-site blast radius**) · `src/agent/PermissionLadder.ts` (whole, 32 lines — THE SUBJECT) · `src/agent/ToolSurface.ts:140-270` (the tool table + `runSideEffect`) · `src/agent/ToolSurface.ts:351-390` (the capability declarations) · `src/agent/StandingOrders.ts:341-414` (**your reference implementation**) · `specs/m4-agent-ux/README.md:6-15` (the ratified ladder, amended by the ruling in `85bb1938`).

SELF-CHECK: `npm run test:node-guards` **FIRST** (**196/196, rc=0** on current main, measured s1291 — v1's run reported 190/190 only because its lane sat 17 commits behind; if you see 190 you did not refresh, stop and refresh) · `npx tsc --noEmit` clean · `npm run build` green · **every playwright run at `--workers=1`** (fire.md §3.1 — a correctness requirement of the instrument in this shell, not an optimisation; report the literal `Running X tests using M worker(s)` line every time) · `npx playwright test --list` reports **2484 tests in 347 files** as its baseline (measured s1291): the FILE count must not move (you add no spec file) and the TEST count must move by exactly (tests you added × 2 projects) — **state both numbers** · battery: `e2e/m4-01 m4-05 m4-06 m4-09 m4-10 ap-standing-orders 066-walk8 polish-03 trail-guide-beat-priority` · zero console/page errors · plain boot desktop + 390px.

🔴 KNOWN REDS — NOT yours, do not "fix" (automatic reject):
  - `m4-06-embodiment.spec.ts:395` — known **~45% flake** (F-1212-2). Re-measure as a rate before blaming yourself.
  - `m4-06:196`, `m4-07:113`, `locked-win:65` — load/concurrency-class reds (F-1216-1, F-1214-1). Report counts, do not chase.
  - `ap-standing-orders.spec.ts` is **NOT** a known red any more (cured s1222, `a0aae876`) — a failure there is a real regression, report it.

READY-FOR-GATES + report: the re-derived item-1 table; **which of item 3's five sites you actually changed and how each preserved its test's intent**; the item-7 mutation proof with its output; the literal worker counts and `Running X tests` lines of every battery; item 6's measured result for `polish-03` and `trail-guide`; and any item-4 STOP with full coordinates.
