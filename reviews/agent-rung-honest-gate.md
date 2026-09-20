# agent-rung-honest-gate — drain review (s1219)

**Slice:** `agent-rung-honest-gate` (cure for F-1218-1)
**Branch / tip:** lane-c worktree, `lane/e2-arsenal` @ `6c44c6f3` — **no commit produced by this run**
**Master:** `tasks/lane-c-agent-rung-honest-gate.md` (FIRE-AUTHORED s1218)
**Run log:** `tasks/runs/20260729-184515-lane-c-lane-c-agent-rung-honest-gate.md.log`
**Drained by:** s1219, 2026-07-29

## Verdict

**STOPPED — LAWFULLY, AT ITEM 2. THIS IS THE MASTER'S DECLARED SUCCESS CONDITION, NOT A FAILURE.**

Zero repository bytes changed: no `src/`, no `e2e/`, no spec, no review, no git history. Working tree
tracked-clean. There is nothing to merge and nothing was merged. The deliverable is item 1's table,
which the master declared "the deliverable even if you stop at item 2" (`:33`).

**Item 2 fired correctly**: enforcing the declared rungs *would* change the outcome of currently-green
assertions, so the runner reported and halted rather than editing either the gate or the tests.

## What it does

It answers the question s1218 could not answer without measuring: *is making the permission gate
rung-honest a behaviour-neutral change?* The answer is **no** — and the shape of the "no" is more
interesting than the question.

## Evidence — re-derived by the drain, not inherited

Every claim below was verified at source by s1219 against **main**, not accepted from the run report.

| Check | Result | How verified |
|---|---|---|
| `decideToolPermission` never receives the tool | ✓ CONFIRMED | `src/agent/PermissionLadder.ts:24-31` read whole (32 lines). Signature is `(meta, sideEffect)`. |
| `requiredLevel` hardcoded `1` | ✓ CONFIRMED | `PermissionLadder.ts:30` — literal `requiredLevel: 1`. |
| Any level > 0 permits **any** side-effecting tool | ✓ CONFIRMED | `PermissionLadder.ts:29` — `if (!sideEffect \|\| level > 0) return { ok: true, level }`. No per-tool branch exists. |
| Sole call site has `tool` in scope and drops it | ✓ CONFIRMED | `ToolSurface.ts:222` declares `tool: TName`; `:226` calls `decideToolPermission(level, true)`. `grep` finds exactly one call site. |
| Declared capabilities = `auto_collect` 1, `auto_repair` 1, `auto_pan` 3 | ✓ CONFIRMED | `ToolSurface.ts:358/359`, `369/370`, `377/378`. |
| `place_building` + `chase_mark` have **no** declared capability | ✓ CONFIRMED | Absent from `implementedCapabilities` (`ToolSurface.ts:351-384`). |
| `npm run test:node-guards` | **74/74 pass, 0 fail** (18.3 s) | Re-run by s1219 on main. |
| `e2e/m4-01-tool-surface.spec.ts` | **8/8 passed (21.0 s)**, literal `Running 8 tests using 2 workers` | Re-run by s1219. Matches the run report exactly. |

### The four assertion families that block the cure — each read at source

| Spec | Line | What it asserts today | Under enforced rungs |
|---|---|---|---|
| `m4-01-tool-surface` | `:164` | `expect(receipt.outcome.requiredLevel).toBe(1)` for `pan_at` at L0 | becomes `3` → **RED** |
| `m4-01-tool-surface` | `:146-165` | L0 denial reason/log-delta for all four side-effect tools | reason shifts → **RED** |
| `066-walk8-engine` | `:162` + `:105` | `setAgentLevel(page, 2)`, then `panAt()` must move the Prospector (`embodiment.moving === true`) | pan denied at L2 → never moves → **RED** |
| `m4-05` `:218` / `m4-06` `:248` | | pan driven at L2 and required to succeed | pan denied at L2 → **RED** |

## Merge classification

**N/A — zero bytes.** No LANE-TOUCHED / MAIN-MOVED classification applies; no graft; no conflict.
`lane/e2-arsenal` remains 1 commit ahead of main, and that commit is **not** this run's output — it is
the *blocked* ap-06b adapter-wiring content (F-1217-1, pinned `save/ap-06b-reland-s1218`). Two-dot
`main..lane/e2-arsenal` = 192 insertions across `e2e/ap-standing-orders.spec.ts` + `src/game/Game.ts`;
three-dot confirms the same two files. **Left untouched, correctly.**

## Findings

### F-1219-1 — THE TESTS, NOT THE CODE, ARE WHAT DIVERGES FROM THE RATIFIED SPEC. THIS IS AN OWNER RULING, NOT A TECHNICAL GATE.

The master framed the hard stop as *"a cure that breaks shipped behaviour is worse than the defect"* —
which assumes the green assertions encode **ratified** behaviour. **They do not.** Read at source:

`specs/m4-agent-ux/README.md:14` (RATIFIED, the four-rung ladder):
> L0 suggest-only · L1 collect & carry (XP motes, dropped gold) · **L2 tend & repair (walls, buildings)** · **L3 work the claim (pan, haul to stockpile)**

Cross-referencing that against code and tests:

| Ability | Spec rung | Code declares | Tests drive it at | Verdict |
|---|---:|---:|---:|---|
| `auto_collect` | L1 | 1 | L1 | ✅ all three agree |
| `auto_pan` | **L3** | **3** | **L2 (success required)** | ⚠️ **code matches spec; the TESTS diverge** |
| `auto_repair` | **L2** | **1** | L1 (`m4-09:106` asserts 1) | ⚠️ F-1218-2, code+tests diverge from spec |
| `place_building` | *unspecified in the ladder* | **none** | L1 success / L0 denial | ⚠️ no rung anywhere; `StandingOrders.ts:342` puts BUILD at 3 |
| `chase_mark` | *unspecified* | **none** | L0/L1 | ⚠️ no rung anywhere |

**So `auto_pan: 3` is the one thing in this picture that is demonstrably correct** — it is exactly what
the ratified spec says. The four blocking assertions encode pan-at-L2, which the spec never ratified.
They have been green for months **only because the gate was rung-blind**: with `level > 0` permitting
everything, no test could ever have detected the divergence. The suite did not validate this behaviour;
it was merely unable to see it.

➡️ **Consequence: the cure is not a bug fix, it is a spec-conformance change**, and the choice between
"the spec is canon, fix the tests" and "the shipped behaviour is canon, amend the spec" is a design
fork. Per CLAUDE.md §7.3 that is an **owner decision**. A fire must not pick a side, and this leaf must
stop being classified as a technical gate that a lane can discharge.

**Recommendation (owner's to accept or reject):** treat the ladder spec as canon and correct the tests —
`auto_pan` at L3 is the more defensible reading (panning *is* "work the claim"), and it is the one
already written into both the spec and the code. That makes this a three-assertion test correction plus
a rung for `place_building`/`chase_mark`, not a behaviour rollback.

### F-1219-2 — `place_building` and `chase_mark` are side-effecting tools with no declared rung on any surface.

Neither appears in `implementedCapabilities`, and the ratified ladder's four rungs do not name building
at all. Meanwhile `StandingOrders.ts:342` gates `BUILD` at **3**. So the same action is rung-3 through
the orders path and rung-1 through the direct tool path. Not fixable without the F-1219-1 ruling; recorded
so the eventual cure does not silently invent a rung.

### F-1218-2 (carried, unchanged) — the repair rung.

`specs/m4-agent-ux/README.md:14` places repair at **L2**; code declares `auto_repair` level **1**
(`ToolSurface.ts:370`) and `m4-09:106` asserts 1. Shipped `6dae6d95`. Still an open owner ruling; the
runner correctly carried it as **DISPUTED** and moved nothing. **Note it is the same class as F-1219-1** —
one ruling on "is the ladder spec canon?" resolves both rows at once.

## Gate exceptions, declared

The full battery in the master's SELF-CHECK (`tsc`, `build`, `--list`, the eight-spec adjacent run, boot
probes) was **correctly skipped by the runner** and **not re-run by the drain**: item 2 forbids proceeding,
the slice changes zero bytes, and main's tree is byte-identical to its pre-run state. There is no runtime
surface to regress. The two instruments that *can* say something about a report-only slice — the node-guard
reducer suite and the subject spec itself — were both re-run by the drain and both reproduced the report.

## Outcome

- Leaf `agent-rung-honest-gate` → **stopped** (lawful, item 2).
- Leaf `ap-06b-adapter-wiring` → **stays blocked**, and its `blockedReason` is **re-pointed from a technical
  gate to an owner design fork** (F-1219-1). s1218's standing note said to lift it "if it merges" — it did
  not merge, and it is now known that no lane task can lift it without a ruling.
- F-1219-1 + F-1219-2 to the OWNER'S DESK, bundled with F-1218-2 as one question.
