# AP-06b corrective — panel ladder and voice

**Slice:** `ap-06b-panel-ladder-and-voice` (lane-c)
**Branch/tip:** `lane/e2-arsenal` @ `6c44c6f3` (base `bd3804f4`, delta = 2 files / +192, byte-identical to the salvage `save/ap-06b-adapter-wiring` @ `2f216af0`)
**Run:** `tasks/runs/20260729-181305-lane-c-lane-c-ap-06b-panel-ladder-and-voice.md.log`
**Gated by:** s1218 fire, 2026-07-29
**Verdict:** ⛔ **NOT MERGED — LAWFUL STOP ACCEPTED.** The runner declared case (b), a permission-ladder breach, and stopped exactly where its master told it to. **I verified its mechanism at source, end-to-end, and it is correct.** I also established a scope limit the runner did not claim, which changes what the cure must be.

## What the runner did

It re-landed AP-06b's exact 2-file delta onto fresh main, ran `npm run test:node-guards` (74/74), then drove a single-browser probe at autonomy rung 2. It observed `auto_pan` reporting `earned:false, allowed:false` while `window.__GR_AGENT__.panAt("gold-seam-1")` returned `{ok:true, result:true}`, reduced seam gold 30→25, and emitted a `gold_panned` event for 5. It then **stopped without touching a single assertion or any gating code**, which is precisely the behaviour its master declared a success. It changed no panel spec, widened nothing, deleted nothing.

## F-1218-1 — THE TOOL-SURFACE PERMISSION GATE IS RUNG-BLIND, AND `auto_pan` IS THE FIRST CAPABILITY THAT CAN EXPOSE IT

Verified by reading, not inferred. The chain:

| Step | File:line | Fact |
|---|---|---|
| Declared rung | `src/agent/ToolSurface.ts:378` | `auto_pan` is `level: 3`, derived from `typeof game.panAt === 'function'` (`:375`) |
| The gate | `src/agent/PermissionLadder.ts:24-31` | `decideToolPermission(meta, sideEffect: boolean)` — **the tool is never an argument.** Rule is `if (!sideEffect \|\| level > 0) return {ok:true}`; `requiredLevel` is hardcoded `1` |
| Sole call site | `src/agent/ToolSurface.ts:226` | `runSideEffect` has `tool` in scope and **drops it**: `decideToolPermission(level, true)` |
| Probe path | `AgentStub.ts:86` → `ToolSurface.ts:161` → `:226` | `panAt()` **does** route through the gate — the runner's probe is sound, not a bypass |
| Consent layer | `ToolSurface.ts:10` | `AgentConsent` is imported **as a type only**. The layer that knows rungs is never consulted on this path |

➡️ **The gate cannot express a rung above 1 at all.** `auto_collect` and `auto_repair` are both declared `level: 1`, so for every tool shipped to date a blind gate and a correct gate return the same answer. **The defect is not new — it has been un-exposable.** `auto_pan` at level 3 is the first capability that can tell the difference, which is why wiring `panAt` turns a latent fault into a live one.

**The ratified law it violates**, `specs/m4-agent-ux/README.md:14`: *"L3 work the claim (pan, haul to stockpile)"*, and `:8`: *"Autonomy is always chosen, never imposed — and revocation is instant."*

### The scope limit the runner did not claim — and it matters

**The breach is proven on the direct tool path only. Player-reachability in a plain boot is NOT established.**

- **The StandingOrders path is correctly gated.** `permissionDenial` (`StandingOrders.ts:393-409`) checks `requiredLevel(order)` (`:342` — `HARVEST` → **3**, agreeing with the capability declaration), then rung `earned && granted` (`:402`), then `abilities.auto_pan.allowed` (`:405`, via `requiredAbility` `:413`). Three checks, all present.
- **`window.__GR_AGENT__` is debug-only** — `AgentStub.ts:54` sets it `if (this.debug && …)`.
- **`game.agentTools`** is assigned at `ToolSurface.ts:203` and **read nowhere in `src/`** (grepped; single hit is the assignment itself).

So the runner proved a real breach of a declared rung on a path whose only production driver enforces correctly. That is still a defect worth curing — a gate that cannot express its own vocabulary is a latent hazard on every future rung-2/3 ability — but it is **not** today a player-facing exploit, and the cure should not be authored or triaged as if it were. This distinction is the difference between a P0 and a correctness debt.

## F-1218-2 — SPEC/CODE RUNG DIVERGENCE ON `auto_repair` (owner ruling, informational, nothing to fix today)

`specs/m4-agent-ux/README.md:14` places repair at **L2** ("L2 tend & repair (walls, buildings)"). The code declares `auto_repair` at **`level: 1`** (`ToolSurface.ts:370`), and `e2e/m4-09-agent-rung-clarity.spec.ts:106` **asserts** `'needs approval-required (rung 1)'`. Shipped `6dae6d95`, 2026-07-07 — three weeks green.

Either the spec's ladder line was superseded in practice or a rung slipped and its test encoded the slip. **I am not ruling on it and I did not touch either side.** It is recorded here because any cure for F-1218-1 will build a tool→rung table, and a table "derived from the capability declarations" would silently ratify rung 1 for repair against a spec that says 2. **Measure before you table.**

## Voice line — mechanism supplied and read-confirmed

s1217 named `m4-06:384` (`'pan...'` → `'shine'`) as the failure whose mechanism was unverified and which "must not be waved through". The runner supplied it: before the adapter existed `pan_at` returned `NO_SYSTEM_API`, which `barkForReceipt` special-cases to `pan...`; once the adapter succeeds, the second receipt (after the install heartbeat) selects pan bark index 2, `shine` (`src/agent/Voice.ts:42`). That is a genuine mechanism, not "stale expectation" — the answer s1217 demanded.

## Evidence

| Gate | Result |
|---|---|
| `npm run test:node-guards` | **74/74** (runner) |
| Playwright battery | **not run** — intentionally skipped after the mandated stop |
| Worker-allocation line | **none** — the proof used one browser (so F-1217-2 does not apply here) |
| `src/` gating code touched | **none** — verified: delta is byte-identical to `2f216af0` |
| Assertions changed | **none** |

No merge, so no boot probe, no screenshots, no adjacent battery. **This review gates a STOP, not a merge** — the full drain battery is owed by whatever lands the cure.

## Disposition

- Done-move re-prefixed `stopped-case-b-ladder-breach-F1218-1-…`; leaf `ap-06b-panel-ladder-and-voice` → **`stopped`** with the reason.
- Leaf `ap-06b-adapter-wiring` **stays `blocked`** — its discharge condition named the corrective merging, and the corrective lawfully did not merge. Its `blockedReason` is updated to point at this review rather than a task that has now stopped.
- The work remains pinned at `save/ap-06b-adapter-wiring` (`2f216af0`) **and** on `lane/e2-arsenal` (`6c44c6f3`). Both verified present at the time of writing. Nothing was destroyed.
- Cure authored: `tasks/lane-c-agent-rung-honest-gate.md` (F-1218-1), leaf registered in the same commit.
