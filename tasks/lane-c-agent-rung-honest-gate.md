CODEX: model=gpt-5.6-sol effort=xhigh
# agent-rung-honest-gate — make the tool-surface gate able to say the rung it already declares (F-1218-1)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
**FIRE-AUTHORED (attended review welcome)** — cure spawned by the s1218 triage of the AP-06b case-(b) STOP.

WHY: `reviews/ap-06b-panel-ladder-and-voice.md` **F-1218-1**, verified at source by the s1218 fire and independently proved by the lane-c runner's rung-2 probe (`auto_pan` reported `earned:false, allowed:false`; `panAt()` still returned `{ok:true}`, moved seam gold 30→25, emitted `gold_panned`).

**The defect, in one line: the gate is not given the tool, so it cannot express any rung above 1.**
```ts
// src/agent/PermissionLadder.ts:24-31 — the tool is never an argument
export function decideToolPermission(meta, sideEffect: boolean): PermissionDecision {
  const level = …;
  if (!sideEffect || level > 0) return { ok: true, level };
  return { ok: false, level, reason: 'PERMISSION_DENIED', requiredLevel: 1 };  // hardcoded 1
}
// src/agent/ToolSurface.ts:226 — the sole call site HAS `tool` in scope and drops it
const permission = decideToolPermission(level, true);
```
`auto_collect` and `auto_repair` are both declared `level: 1`, so a blind gate and a correct gate have returned identical answers for every tool shipped to date. **This is not a new fault — it is an un-exposable one.** `auto_pan` (`ToolSurface.ts:378`, `level: 3`) is the first capability that can tell them apart, which is why AP-06b's wiring is blocked behind this.

The ratified law: `specs/m4-agent-ux/README.md:14` — *"L3 work the claim (pan, haul to stockpile)"*; `:8` — *"Autonomy is always chosen, never imposed — and revocation is instant."*

⚠️ **SCOPE LIMIT, MEASURED — DO NOT TRIAGE THIS AS AN EXPLOIT.** The breach is proven on the **direct tool path only**. The StandingOrders path is already correctly gated (`StandingOrders.ts:342` `HARVEST`→3, `:402` rung earned+granted, `:405` ability `allowed`). `window.__GR_AGENT__` is **debug-only** (`AgentStub.ts:54`, `if (this.debug …)`), and `game.agentTools` (`ToolSurface.ts:203`) is **read nowhere in `src/`**. So no plain-boot player path is known to reach it. You are curing a latent hazard, not a live exploit — **which means a cure that breaks shipped behaviour is worse than the defect.**

MEASURED PREMISE (re-derive it before you build — do not inherit it):
`decideToolPermission` has exactly **one** call site (`ToolSurface.ts:226`); grep confirms (`PermissionLadder.ts:24` def, `ToolSurface.ts:5` import, `:226` call). `implementedCapabilities` (`ToolSurface.ts:351-384`) declares exactly three capabilities: `auto_collect`(1), `auto_repair`(1), `auto_pan`(3). **`place_building` and `chase_mark` have NO declared capability at all** — they are side-effecting tools with no rung in that table, while `StandingOrders.ts:342` puts `BUILD` at **3**. That gap is real and it is the reason item 1 exists. If any of this has changed, STOP and report rather than building on a stale premise.

READ-FIRST: `reviews/ap-06b-panel-ladder-and-voice.md` (the finding + the scope limit) · `src/agent/PermissionLadder.ts` (whole file, 32 lines — THE SUBJECT) · `src/agent/ToolSurface.ts:140-270` (the tool table + `runSideEffect`) · `src/agent/ToolSurface.ts:351-384` (the capability declarations) · `src/agent/StandingOrders.ts:341-414` (`requiredLevel`/`permissionDenial`/`requiredAbility` — the path that already gets this right; **it is your reference implementation**) · `specs/m4-agent-ux/README.md:6-15` (the ratified ladder).

PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.

SCOPE:
1. **MEASURE FIRST, AND REPORT THE TABLE BEFORE YOU CHANGE THE GATE.** Produce, from the code, a table of every side-effecting tool × (its declared capability rung, if any) × (the rung it is *effectively* gated at today = 1 for all) × (every e2e call site and the rung that call site drives it at). `pan_at` alone is exercised by at least `m4-01`, `m4-05`, `m4-06`, `066-walk8`, `polish-03` — **that is the blast radius and you must measure it, not estimate it.** Put this table in your report even if you stop at item 2.
2. ⛔ **THE HARD STOP.** If the table shows that enforcing declared rungs would change the outcome of **any** currently-green assertion, **STOP and report the table**. Do **not** proceed to item 3, do **not** lower a declared rung to fit a test, do **not** raise a test's rung to fit the gate. **Reporting this is a SUCCESS, not a failure** — the whole point of item 1 is that this cure is only safe if it is behaviour-neutral, and nobody yet knows if it is.
3. **If and only if item 2 is clean:** thread the tool's required rung into the decision. `decideToolPermission` takes the required rung (default `1`, preserving today's behaviour exactly) instead of assuming it; `runSideEffect` passes the rung for the `tool` it already has in scope; `requiredLevel` in the returned `PermissionDecision` reports the **real** required rung instead of the hardcoded `1`. **Every tool keeps its currently-effective rung** — this slice changes what the gate *can express*, not what it *does*.
4. **Prove it with a test that fails without the fix.** Add to `e2e/m4-01-tool-surface.spec.ts` (which already drives an explicit `permissionLevel`, `:35-62` — use it, do not write a third harness): a tool whose required rung is above the driven level is denied with `reason:'PERMISSION_DENIED'` **and the correct `requiredLevel`**, and the same tool at or above its rung succeeds. **Mutate the cure to confirm the test actually fails without it** and report that you did.
5. Leave `auto_pan`/AP-06b alone. This slice does **not** wire `panAt` and does **not** touch the panel — it makes AP-06b's re-land safe, it does not perform it.

TOUCH-ONLY: `src/agent/PermissionLadder.ts` · `src/agent/ToolSurface.ts` (the `runSideEffect` gate call + the rung source ONLY) · `e2e/m4-01-tool-surface.spec.ts` (add, never widen).
NO: the declared rung VALUES themselves — `auto_pan` stays 3, `auto_repair` stays 1 (**see F-1218-2 below: the repair rung is under an owner ruling and is not yours to move**) · `src/game/Game.ts` · the AP-06b wiring · `StandingOrders.ts` (it is already correct; it is your reference, not your subject) · `AgentConsent.ts` · the panel/HUD · Economy · CombatSystem · the sim/Balance · **widening or deleting any assertion to get green**.

⚠️ **F-1218-2 — A KNOWN SPEC/CODE DIVERGENCE YOU WILL TRIP OVER, AND MUST NOT "FIX".** `specs/m4-agent-ux/README.md:14` places repair at **L2**; the code declares `auto_repair` `level: 1` (`ToolSurface.ts:370`) and `e2e/m4-09:106` **asserts** rung 1. Shipped `3c851cd3`, green for three weeks. **It is an open owner ruling.** Do not "correct" either side — a table "derived from the capability declarations" would silently ratify rung 1, so when you build item 1's table, mark this row **DISPUTED** and carry it forward unchanged.

SELF-CHECK: `npm run test:node-guards` **FIRST** (74/74 — the only instrument that sees a suite-uncollectable regression) · `npx tsc --noEmit` clean · `npm run build` green · `npx playwright test --list` reports **344 files** and the test count moved by exactly the number of tests you added × 2 projects (state both numbers) · the full adjacent battery `e2e/m4-01 m4-05 m4-06 m4-09 m4-10 ap-standing-orders 066-walk8 polish-03` · zero console/page errors · plain boot desktop + 390px.

🔴 KNOWN REDS — NOT yours, do not "fix" them (automatic reject):
  - ✅ `ap-standing-orders.spec.ts` (the `wave_early` poll, listed here as `:115`→`:156`) — **CURED s1222 (`a0aae876`, test-only). NO LONGER A KNOWN RED: a failure here is a real regression, report it.** F-1215-1 was right it was pre-existing, wrong that it was a concurrency victim — it was spec sequencing (F-1222-3 / F-1223-1).
  - `m4-06-embodiment.spec.ts:395` — known **~45% flake** (F-1212-2). Re-measure as a rate before blaming yourself.
  - `m4-06:196`, `m4-07:113`, `locked-win:65` — load/concurrency-class reds (F-1216-1, F-1214-1). Report counts, do not chase.

⚠️ **`--workers=N` DOES NOT DO WHAT YOU THINK ON A SINGLE FILE (F-1217-2, measured s1217).** `playwright.config.ts` sets no `fullyParallel` and no `workers`; the default parallelises across **files**, serially within one. One spec × two projects tops out at **2 workers** whatever you pass. **Always report the literal `Running X tests using M workers` line**, never the flag.

READY-FOR-GATES + report: item 1's full table (**this is the deliverable even if you stop**); whether item 2 stopped you and on which assertion; if you proceeded, the mutation-proof that item 4's test fails without the cure; and the literal worker counts of every battery you ran.
