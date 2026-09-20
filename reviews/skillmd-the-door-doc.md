# skillmd-the-door-doc — drain review (s1492)

**Slice:** `lane-skillmd-the-door-doc` (THE SUFFICIENCY GATE — make the public agents' door an actual door)
**Branch:** `lane/b` · **Tip:** `e69998f13` "door: publish source-locked agent door"
**Base:** `595dd1db9` · **Merged to main as:** `addba4a1d`
**Gate tree:** detached worktree `gate-s1492b` (§3.0b — an attended session was committing to main throughout)
**Date:** 2026-08-06T18:05Z

## VERDICT: MERGE

## What it does

`public/skill.md` was 435 bytes of metadata — the Harness Bench's SUFFICIENCY GATE measured it FAILED the same day: it named the game but did not tell an arriving agent how to play it. This slice turns it into the door (+223 lines): transport, loop, view, the order grammar, the bench seeds and the submission path.

The load-bearing part is not the prose, it's that **the doc cannot silently rot**. `scripts/skillmd-guard.test.mjs` derives the truth from source rather than restating it:

- the order grammar is expanded from the **TypeScript AST** of `src/agent/StandingOrders.ts` (`ts.createSourceFile`, walking unions/type-literals/aliases) and `deepEqual`'d against the doc's fenced `grammar` block
- the buildables list is expanded from the `BuildableId` union in `src/game/buildables.ts`
- the seeds block is `deepEqual`'d against `assets/contracts/bench-seeds.json`

So the day someone adds a verb to `StandingOrder` and forgets the door, the battery reds. That is the correct shape: the doc is *locked to* the source, not *checked against* a copy of it.

`e2e/skillmd-door.spec.ts` adds the served-file canary — it asserts the grammar and the replace-warning are present in the **served** `/skill.md`, not merely in the repo file.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **green** |
| `npm run build` | **green** (1.03s; asset-diet ceilings respected) |
| `e2e/skillmd-door.spec.ts` (own spec, `--workers=1`) | **2/2** desktop + mobile |
| `npm run test:node-guards` (FULL battery, 51 files) | **RC=0 green** — includes the new guard and `gr-sim.test.mjs` |
| new guard proven by **manufactured defect** | **RC=1**, precisely |

All playwright `--workers=1` per §3.1.

### The manufactured defect, because a green never executes the violation path

The master demanded the rot guard be "proven by manufactured defect", and the guard as shipped carries **no positive-control test of its own** — every one of its three tests passes on a correct tree, which is exactly the condition under which a guard that fails open is indistinguishable from one that works. So I proved it rather than trusting it.

Using the guard's own `SKILLMD_PATH` redirect (so no known-broken file ever entered a working tree — §3.0b), I removed **one** of the 8 grammar lines from the doc's guarded block, simulating source drift the doc missed:

```
MANUFACTURED-DEFECT RC=1
✖ skill.md grammar matches every StandingOrder source form
✔ skill.md buildables match BuildableId
✔ skill.md bench seeds match the source registry
```

It reds on exactly the drifted block and leaves the other two green — precise, not a blunt tripwire. The guard works.

### Gate topology

`package.json`'s `test:node-guards` gains `scripts/skillmd-guard.test.mjs`, correctly **rooted** (not orphaned), and `gate-caller-audit` passes within the same battery. A new gate that nothing calls is the standing hazard here; this one is wired.

## Findings

- **F-1492-4 (non-blocking) — the rot guard ships without its own positive control.** Its three tests only ever execute the passing path in-suite, so a future refactor could make it fail open and the battery would stay green. The `SKILLMD_PATH` redirect already exists and makes the fix ~10 lines: a test that points the guard at a manufactured-broken copy and asserts it throws. Merged without it because I executed that proof by hand this drain (above) and the guard demonstrably reds — but the proof lives in this review, not in the suite, and reviews are not run nightly.
- **F-1492-3 (repeat) — no goal leaf.** `drain-block-check` returns UNKNOWN for this master too. Both of today's attended-dispatched masters lack leaves (Goal Registration Law). Recorded, not treated as a clearance.

## Merge classification

Measured `595dd1db9..main` across the five touched paths:

- `public/skill.md`, `e2e/skillmd-door.spec.ts`, `scripts/skillmd-guard.test.mjs`, `package.json` — **LANE-TOUCHED only** (main never moved them)
- `tasks/BACKLOG.md` — **BOTH-MOVED**. The lane rewrote only its own Harness Bench status span; main had added two newer rows (QM tiered, gauntlet roster) plus my own s1492 HOLD edit. Grafted: lane's rewritten row + main's newer rows verbatim.

Landed as a fast-forward of the exact commit that was gated (`addba4a1d`) — main had not moved off the gate's base, so what was tested is byte-for-byte what shipped.

## Not a gazette item

Per the GZ-01 filter law, news items need a **player-visible** change. This is the agents' door — visible to arriving harnesses, not to anyone playing the game. Deliberately not queued to `marketing/outbox/gazette-queue.md`.
