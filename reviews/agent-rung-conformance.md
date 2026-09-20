# agent-rung-conformance — drain review (s1281)

**Slice:** `lane-c-agent-rung-conformance` · **branch:** `lane/e2-arsenal` · **tip:** `658dc86a`
**Base:** `adfa280a` · **Merged onto:** `45b2ed1a` (clean main)
**Drained:** 2026-07-31, s1281 fire

## Verdict

**ACCEPT.** The owner's 2026-07-30 verb-rung ruling is now in code, in **both** rung tables and in
the ratified ladder line. The runner honoured every firewall: no `e2e/**` assertion edited, no
`auto_repair` touched, no `place_building` invented.

## What it does

The owner ruled on 2026-07-30 that `auto_pan`/HARVEST is **L2** (*"harvesting is the hero's basic
verb"*) and `place_building`/BUILD is **L3** (*"building spends gold"*). Prior to this slice that
ruling lived only in prose. The slice moves `auto_pan` from `level: 3` to `level: 2` in the two
places it is declared — `src/agent/AgentConsent.ts:15` (the table the gate reads) and
`src/agent/ToolSurface.ts:378` (the table the panel advertises) — rewrites the ladder line in
`specs/m4-agent-ux/README.md` to `L2 tend, repair & work the claim` / `L3 build`, cites the ruling
by date, and adds `scripts/agent-rung-conformance.test.mjs` so the rung cannot silently drift back.

`place_building` is deliberately **not** declared: it has no member in the `AgentAbility` union and
no adapter method on main. That is the `save/ap-06b-adapter-wiring` task's scope, and the master
recorded it as a non-goal with its reason so the next author does not re-litigate it.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | rc=0 |
| `npm run test:node-guards` | rc=0 — **189 pass / 0 fail** (187 → 189: exactly the two new tests) |
| `npm run test:guards` | rc=0 |
| `npm run test:task-guards` | rc=0 |
| `npm run test:citations` | rc=0 |
| `npm run test:findings-state` | rc=0 |
| `npm run test:ruling-propagation` | rc=0 |
| `npm run test:gate-callers` | rc=0 — 31 subjects, 5 grandfathered, all reached |
| playwright desktop-chrome, 7 adjacent specs | 21 pass / **1 red** (fingerprinted below) |
| playwright mobile-chrome, 7 adjacent specs | 21 pass / **1 red** (fingerprinted below) |

Transcript: `logs/session-scratch/s1281/gates-transcript.txt` (append-only, 2 batteries).
All playwright arms ran at `--workers=1` (§3.1), injected by `scripts/gate-battery.mjs`.

**Adjacent suites derived by grep, not inherited** — `grep -rn "auto_pan" e2e/ src/` plus the
importer set of the two changed modules: `m4-01-tool-surface`, `m4-07-prospector-panel`,
`m4-09-agent-rung-clarity`, `m4-10-agent-actions-integrity`, `agent-view`, `ap-standing-orders`,
`e2-arsenal`.

### The new guard was mutation-tested before it was believed

`logs/session-scratch/s1281/mutation.mjs`, 5 arms in a detached temp tree:

| Arm | rc | Expected |
|---|---|---|
| CONTROL — unmutated | 0 | 0 ✓ |
| `AgentConsent` `auto_pan` → 3 | 1 | 1 ✓ |
| `ToolSurface` `auto_pan` → 3 | 1 | 1 ✓ |
| `auto_repair` → 2 | 1 | 1 ✓ |
| `auto_pan` entry deleted (regex-miss → NaN) | 1 | 1 ✓ |

The guard reds on **each table independently**, so it would have caught the exact half-edit that
F-1280-1 warned about. The deletion arm matters too: a regex miss yields `NaN`, which fails the
assertion rather than passing vacuously.

## Merge classification

Lane base `adfa280a`; lane 35 behind main at drain time, so the two-dot `main..lane` diff shows
~50 phantom deletions (main's later additions). Those are **not** lane content. The lane's real
content is its single ahead-commit `658dc86a`, 5 files.

| File | Class | Handling |
|---|---|---|
| `src/agent/AgentConsent.ts` | LANE-ONLY | clean copy (main untouched since base) |
| `src/agent/ToolSurface.ts` | LANE-ONLY | clean copy |
| `specs/m4-agent-ux/README.md` | LANE-ONLY | clean copy |
| `scripts/agent-rung-conformance.test.mjs` | LANE-ONLY (add) | clean copy |
| `package.json` | **BOTH-MOVED** | **3-way graft** |

`package.json` was the real merge work. Both sides edited the *same* `test:node-guards` line: the
lane prepended `agent-rung-conformance.test.mjs`, while main had since added five guards
(`fire-shell-serialisation`, `gate-battery`, `goal-closure-reason`, `law-pointer-guard`,
`ruling-propagation-guard`) plus a trailing `&& npm run test:ruling-propagation` and a new
`test:ruling-propagation` script. **A blind copy of the lane's file would have silently deleted all
six of main's additions** — five guards would have stopped running with every battery still green,
which is the worst possible failure shape for a gate. Grafted by inserting the lane's one new entry
into main's line in alphabetical position; JSON re-parsed and all six of main's additions asserted
present by name (35 guard files, was 34).

## Findings

### F-1281-1 — the inherited "wholly inert on main" claim is **half wrong**, and it is the half that changes behaviour (NON-BLOCKING, corrects s1280 §B⑶)

s1280 measured that `ToolSurface.implementedCapabilities` emits `auto_pan` only under
`if (typeof game.panAt === 'function')`, that `grep -c panAt src/game/Game.ts` = 0, and concluded
**the whole change is inert**. The first two facts are true and re-verified this fire. The
conclusion is not: it was drawn from one of *two* consumers.

`AgentConsent` is the other, and it is not adapter-gated. `StandingOrders.ts:415-418` maps the
`HARVEST` verb to the `auto_pan` ability, and `:408-413` refuses an order whose ability is not
`allowed`. `allowed = earned && rungs[def.level] && granted`, with `earned = def.level <= ceiling`
(`AgentConsent.ts:88-97`). Moving the declared level from 3 to 2 therefore flips `earned` at
ceiling 2.

Measured directly — `logs/session-scratch/s1281/inertness-probe.mjs`, everything else held granted,
the declared rung the only variable:

| agent permission level | before (L3) | after (L2) |
|---|---|---|
| 1 | `allowed=false` | `allowed=false` |
| **2** | **`allowed=false`** | **`allowed=true`** ← behaviour changes |
| 3 | `allowed=true` | `allowed=true` |

So a **level-2 Prospector can now be given a HARVEST standing order and previously could not** —
which is precisely what the owner ordered, landing on the path nobody had traced. `StandingOrders`
is consumed live by `src/agent/Embodiment.ts:11,127` (the embodied agent ticks orders) and by
`ToolSurface.ts:195` (submission). The panel *row* remains inert exactly as s1280 said.

Consequences, all applied this fire: the merge **is** gameplay-affecting, so DEPLOY LAW applies
(s1280's §F would have skipped it); and unchanged panel screenshots are still the correct result,
but "unchanged screenshots" no longer means "nothing happened".

**Why this keeps happening:** the same shape as F-1280-1 one fire earlier. That finding said *ask
who READS the constant, not just where it is written* — and then read only the reader it had
already found. Two readers, one traced.

### F-1281-2 — pre-existing undeclared red: `e2-arsenal` "Auto-Pan upkeep…" fails at `placeFree('turret')` (NOT this slice; REPORT-ONLY per master scope 6)

`e2e/e2-arsenal.spec.ts:87` fails on both projects at **line 100**,
`placeFree('turret', 0, 10)` resolving `false`. Note the failure is at :100 — the `auto_pan`
pressure-sink assertion at :98 **passes**; the `auto_pan` in this spec is the *upgrade* id
(`src/game/Upgrades.ts:100`), an unrelated namespace from the consent ability, so the collision is
cosmetic.

**Fingerprinted, not assumed.** Control arm on clean main (`45b2ed1a`) in a detached worktree,
same shell, same hour, `--workers=1`: **identical failure, identical line, both projects**
(`logs/session-scratch/s1281/control-arm-clean-main.txt`, rc=1, 2 failed / 4 passed). The red is
pre-existing.

It is also **not new**: `logs/suite-red-inventory-compact.json` already carries it as `unexpected`
on both projects from a 2026-07-28 capture. But that capture came from a lane worktree at default
workers, which §3.1 says is not evidence — this fire's control arm is the first `--workers=1`
proof of it.

The spec is unchanged since it landed (`562edc36`, 2026-07-12), so something *else* regressed it.
The test teleports the player to a harvest seam and then places at fixed world coords `(0, 10)`;
plausible causes are a build-range check against the moved player or a map/terrain change making
that tile unplaceable — both speculative, and diagnosing it is outside this slice's firewall.
**Not fixed here by design**: the master forbids editing `e2e/**` assertions, and a red there is a
finding to report. It is now declared, with a `--workers=1` reproduction, instead of sitting
undeclared in a generated artifact.

### F-1281-3 — the new guard pins `auto_repair` at L1, which is the **open** question on the owner's desk (NON-BLOCKING, and arguably the point)

`scripts/agent-rung-conformance.test.mjs:9-14` asserts `auto_repair: 1`. That value is *shipped*
but **not ruled** — F-1279-2 is live on the owner's desk asking exactly this, and the ratified
ladder reads *"L2 tend & repair"*. Mutation arm MUT-C confirms the guard reds if the source moves
to 2.

This is recorded rather than changed. The test title says *"shipped repair rung"*, not *"ruled"*,
which is honest naming, and the red-on-change behaviour is the propagation tripwire working: when
the owner answers, this guard is what forces the ladder and the table to move together. The next
fire must update **the guard and the source in one commit** — and must not "fix the failing test".

## Ledger / bookkeeping

- Goal leaf `agent-rung-conformance` → `status: "shipped"`, `mergeHash` recorded (Goal Registration Law).
- `drain-block-check` run **first**, before classification: **CLEAR**, and it *matched a leaf*
  (not `UNKNOWN` — which would have meant the bookkeeping was incomplete).
- Lane safety asked with the instrument, not eyeballed.
- GZ-01: **no gazette item.** The behaviour change is real (F-1281-1) but reaches the agent tool
  surface, not a player UI — there is no standing-orders screen. Recorded here rather than silently
  skipped, because the *reason* differs from s1280's ("inert, full stop", which is not true).
